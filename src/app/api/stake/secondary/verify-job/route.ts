import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { VerifySecondaryStakeJobPayload } from "@/lib/qstash/types";
import { logError } from "@/lib/logger";
import { validateStakeTransaction } from "../../verify-job/verifer";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { StakeService } from "@/lib/stake/stake.service";

async function handler(request: NextRequest) {
  try {
    const payload: VerifySecondaryStakeJobPayload = await request.json();
    const { signature, walletAddress, amount, duration, stakeId } = payload;

    console.log("[Verify Secondary Stake Job] Started:", {
      stakeId,
      signature,
      walletAddress,
      amount,
      duration,
    });

    // Get the secondary stake
    const stake = await StakeService.getSecondaryStake(stakeId);

    if (!stake) {
      console.error("[Verify Secondary Stake Job] Stake not found:", stakeId);
      return NextResponse.json({ error: "Stake not found" }, { status: 404 });
    }

    // Idempotency check - already confirmed
    if (stake.verification === "success") {
      console.log("[Verify Secondary Stake Job] Already confirmed:", stakeId);
      return NextResponse.json({
        success: true,
        message: "Already confirmed",
      });
    }

    if (stake.verification === "failed") {
      console.log("[Verify Secondary Stake Job] Already failed:", stakeId);
      return NextResponse.json({
        success: false,
        message: "Job failed",
      });
    }

    const expectedLamportsAmount = BigInt(amount * LAMPORTS_PER_SOL);
    const expectedDurationSeconds = Number(duration) * 24 * 60 * 60;
    const result = await validateStakeTransaction(signature, {
      expectedLamportsAmount,
      expectedOwner: walletAddress,
      expectedDurationSeconds,
    });

    if (!result.success) {
      console.error(
        "[Verify Secondary Stake Job] Verification failed:",
        stakeId,
      );
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 },
      );
    }

    // Confirm the secondary stake and update session total
    await StakeService.confirmSecondaryStake(stakeId);

    console.log("[Verify Secondary Stake Job] Stake confirmed:", stakeId);

    return NextResponse.json({
      success: true,
      stakeId,
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
    logError(error, "verify-secondary-stake-job");
    console.error("[Verify Secondary Stake Job] Error:", error);

    // Return 500 to trigger QStash retry
    return NextResponse.json(
      { error: error.message || "Verification job failed" },
      { status: 500 },
    );
  }
}

// Wrap handler with QStash signature verification
export const POST = verifySignatureAppRouter(handler);
