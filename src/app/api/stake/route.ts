import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { base58ZodValidator } from "@/lib/solana";
import { StakeService } from "@/lib/stake/stake.service";
import { publishStakeVerificationJob } from "@/lib/qstash/client";
import { logError } from "@/lib/logger";

const stakeSchema = z.object({
  amount: z.number().min(0.01, "Minimum stake amount is 0.01 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
  signature: base58ZodValidator,
});

async function handler(request: NextRequest, context: AuthContext) {
  // This handler does basic checking
  //   - verify that the schema for stake params is valid
  //   - verify that the signature is valid 64 bytes
  //   - verify that the user is not already processing or confirmed
  //   - verify that the signature is not already in use
  try {
    const body = await request.json();
    const data = stakeSchema.parse(body);

    const isSessionAlreadyCreated =
      await StakeService.isQuizSessionForUserAlreadyCreated(
        context.user.walletAddress,
      );

    if (isSessionAlreadyCreated) {
      return NextResponse.json(
        {
          success: false,
          message: "User already has an active quiz session",
        },
        { status: 400 },
      );
    }

    const isSignatureAlreadyInUse = await StakeService.isSignatureAlreadyInUse(
      data.signature,
    );
    if (isSignatureAlreadyInUse) {
      return NextResponse.json(
        {
          success: false,
          message: "Signature already in use",
        },
        { status: 400 },
      );
    }

    const session = await StakeService.createQuizSession({
      walletAddress: context.user.walletAddress,
      userId: context.user.userId,
      authSessionId: context.authSessionId,
      signature: data.signature,
      amount: data.amount,
      duration: data.duration,
    });

    // Publish verification job to QStash
    await publishStakeVerificationJob({
      walletAddress: context.user.walletAddress,
      sessionId: session.id,
      signature: data.signature,
      amount: data.amount,
      duration: data.duration,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error" },
        { status: 400 },
      );
    }
    logError(error, "stake-create");

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create stake session",
      },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handler);
