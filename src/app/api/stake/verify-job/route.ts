import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { VerifyStakeJobPayload } from "@/lib/qstash/types";
import { db } from "@/lib/db";
import { userQuizSessions } from "@/lib/db/schema/bp25";
import { eq } from "drizzle-orm";
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

    // Check if session exists and not already confirmed
    const [session] = await db
      .select()
      .from(userQuizSessions)
      .where(eq(userQuizSessions.id, sessionId))
      .limit(1);

    if (!session) {
      console.error("[Verify Stake Job] Session not found:", sessionId);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Idempotency check - already confirmed
    if (session.stakeVerification === "success") {
      console.log("[Verify Stake Job] Already confirmed:", sessionId);
      return NextResponse.json({
        success: true,
        message: "Already confirmed",
      });
    }

    if (session.stakeVerification === "failed") {
      console.log("[Verify Stake Job] failed:", sessionId);
      return NextResponse.json({
        success: false,
        message: "Job failed",
      });
    }

    const expectedLamportsAmount = BigInt(amount * LAMPORTS_PER_SOL);
    const result = await validateStakeTransaction(session.stakeSignature, {
      expectedLamportsAmount,
      expectedOwner: walletAddress,
    });

    if (!result.success) {
      console.error("[Verify Stake Job] Verification failed:", sessionId);
      // Could mark session as failed here if needed
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 },
      );
    }

    // Mark stake as confirmed
    await db
      .update(userQuizSessions)
      .set({
        stakeVerification: "success",
        stakeConfirmedAt: new Date(),
      })
      .where(eq(userQuizSessions.id, sessionId));

    console.log("[Verify Stake Job] Stake confirmed:", sessionId);

    console.log("[Verify Stake Job] Assigning questions to:", sessionId);
    await QuizService.assignQuestionsToUser({ quizSessionId: sessionId });

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
