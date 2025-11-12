import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { base58ZodValidator } from "@/lib/solana";
import { StakeService } from "@/lib/stake/stake.service";
import { authService } from "@/lib/auth/auth.service";

const stakeSchema = z.object({
  amount: z.number().min(0.1, "Minimum stake amount is 0.1 SOL"),
  duration: z
    .number()
    .min(60, "Minimum stake duration is 60 days")
    .max(365, "Duration cannot exceed 365 days"),
  signature: base58ZodValidator,
});

async function getAuthContext(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    throw Error("Unauthorized");
  }

  const payload = await authService.validateToken(token);

  if (!payload) {
    throw Error("Invalid or expired token");
  }

  // Add user info to request context
  const context: AuthContext = {
    authSessionId: payload.sessionId,
    user: {
      userId: payload.userId,
      walletAddress: payload.walletAddress,
    },
  };
  return context;
}

export async function POST(request: NextRequest) {
  // This handler does basic checking
  //   - verify that the schema for stake params is valid
  //   - verify that the signature is valid 64 bytes
  //   - verify that the user is not already processing or confirmed
  //   - verify that the signature is not already in use
  try {
    const context = await getAuthContext(request);
    const body = await request.json();
    const data = stakeSchema.parse(body);

    // const isSessionAlreadyCreated =
    //   await StakeService.isQuizSessionForUserAlreadyCreated(
    //     context.user.walletAddress,
    //   );

    // if (isSessionAlreadyCreated) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "User already has an active quiz session",
    //     },
    //     { status: 400 },
    //   );
    // }

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

    await StakeService.createQuizSession({
      walletAddress: context.user.walletAddress,
      userId: context.user.userId,
      authSessionId: context.authSessionId,
      signature: data.signature,
      amount: data.amount,
      duration: data.duration,
    });

    // Publish verification job to QStash
    // await publishStakeVerificationJob({
    //   walletAddress: context.user.walletAddress,
    //   authSessionId: context.authSessionId,

    //   signature: data.signature,
    //   amount: data.amount,
    //   duration: data.duration,
    // });

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
    // logError(error, "stake-create", {
    //   requestId: context.requestId,
    // });

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create stake session",
      },
      { status: 500 },
    );
  }
}

// export const POST = withAuth(handler);
