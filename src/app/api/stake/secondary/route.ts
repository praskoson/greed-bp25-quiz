import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { base58ZodValidator } from "@/lib/solana";
import { StakeService } from "@/lib/stake/stake.service";
import { publishSecondaryStakeVerificationJob } from "@/lib/qstash/client";
import { logError } from "@/lib/logger";

const secondaryStakeSchema = z.object({
  amount: z.number().min(0.1, "Minimum stake amount is 0.1 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
  signature: base58ZodValidator,
});

async function handler(request: NextRequest, context: AuthContext) {
  try {
    const body = await request.json();
    const data = secondaryStakeSchema.parse(body);

    // Check if user has a verified session
    const session = await StakeService.getVerifiedSessionForUser(
      context.user.userId,
    );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must have a verified primary stake before adding secondary stakes",
        },
        { status: 400 },
      );
    }

    // Check if signature is already in use
    const isSignatureAlreadyInUse =
      await StakeService.isSecondarySignatureAlreadyInUse(data.signature);

    if (isSignatureAlreadyInUse) {
      return NextResponse.json(
        {
          success: false,
          message: "Signature already in use",
        },
        { status: 400 },
      );
    }

    // Create secondary stake
    const stake = await StakeService.createSecondaryStake({
      sessionId: session.id,
      signature: data.signature,
      amount: data.amount,
      duration: data.duration,
    });

    // Publish verification job
    await publishSecondaryStakeVerificationJob({
      walletAddress: context.user.walletAddress,
      stakeId: stake.id,
      signature: data.signature,
      amount: data.amount,
      duration: data.duration,
    });

    return NextResponse.json({
      success: true,
      stakeId: stake.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error" },
        { status: 400 },
      );
    }
    logError(error, "secondary-stake-create");

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create secondary stake",
      },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handler);
