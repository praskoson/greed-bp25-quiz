import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { VerifyStakeJobPayload } from "@/lib/qstash/types";
import { db, dbServerless } from "@/lib/db";
import { userQuizSessions } from "@/lib/db/schema/bp25";
import { eq, and } from "drizzle-orm";
import { logError } from "@/lib/logger";
import { validateStakeTransaction } from "./verifer";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { QuizService } from "@/lib/stake/quiz.service";

async function handler(request: NextRequest) {
  try {
    const payload: VerifyStakeJobPayload = await request.json();
    const { signature, walletAddress, amount, duration, sessionId } = payload;

    console.log("[Verify Stake Job] Started:", {
      sessionId,
      signature,
      walletAddress,
      amount,
      duration,
    });

    // Initial check for session existence and early returns
    const [initialSession] = await db
      .select({
        stakeVerification: userQuizSessions.stakeVerification,
        stakeSignature: userQuizSessions.stakeSignature,
      })
      .from(userQuizSessions)
      .where(eq(userQuizSessions.id, sessionId))
      .limit(1);

    if (!initialSession) {
      console.error("[Verify Stake Job] Session not found:", sessionId);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Early return for already processed sessions
    if (initialSession.stakeVerification === "success") {
      console.log("[Verify Stake Job] Already confirmed:", sessionId);
      return NextResponse.json({
        success: true,
        message: "Already confirmed",
      });
    }

    if (initialSession.stakeVerification === "failed") {
      console.log("[Verify Stake Job] failed:", sessionId);
      return NextResponse.json({
        success: false,
        message: "Job failed",
      });
    }

    // Validate stake transaction (external RPC call, kept outside transaction)
    const expectedLamportsAmount = BigInt(amount * LAMPORTS_PER_SOL);
    const expectedDurationSeconds = Number(duration) * 24 * 60 * 60;
    const result = await validateStakeTransaction(
      initialSession.stakeSignature,
      {
        expectedLamportsAmount,
        expectedOwner: walletAddress,
        expectedDurationSeconds,
      },
    );

    if (!result.success) {
      console.error("[Verify Stake Job] Verification failed:", sessionId);
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 },
      );
    }

    // Atomically confirm stake and assign questions
    // Re-check status inside transaction to prevent race conditions
    const updated = await dbServerless.transaction(async (tx) => {
      const [session] = await tx
        .select({ stakeAmountLamports: userQuizSessions.stakeAmountLamports })
        .from(userQuizSessions)
        .where(
          and(
            eq(userQuizSessions.id, sessionId),
            eq(userQuizSessions.stakeVerification, "processing"),
          ),
        )
        .limit(1);

      // Session was already processed by another job
      if (!session) {
        return false;
      }

      await tx
        .update(userQuizSessions)
        .set({
          stakeVerification: "success",
          stakeConfirmedAt: new Date(),
          totalStakeLamports: session.stakeAmountLamports,
        })
        .where(eq(userQuizSessions.id, sessionId));

      console.log("[Verify Stake Job] Stake confirmed:", sessionId);

      console.log("[Verify Stake Job] Assigning questions to:", sessionId);
      await QuizService.assignQuestionsToUser({ quizSessionId: sessionId, tx });

      return true;
    });

    if (!updated) {
      console.log("[Verify Stake Job] Already processed:", sessionId);
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error: any) {
    // Handle duplicate transaction signature
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json(
        {
          success: "false",
          error: "This transaction signature has already been used",
        },
        { status: 400 },
      );
    }
    logError(error, "verify-stake-job");
    console.error("[Verify Stake Job] Error:", error);

    // Return 500 to trigger QStash retry
    return NextResponse.json(
      { error: error.message || "Verification job failed" },
      { status: 500 },
    );
  }
}

// Wrap handler with QStash signature verification
export const POST = verifySignatureAppRouter(handler);
