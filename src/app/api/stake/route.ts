import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { StakeService } from "@/lib/stake/stake.service";
import { logError } from "@/lib/logger";

const handler = async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const { amount, duration, txSignature } = body;

    // Validate required fields
    if (!amount || !duration || !txSignature) {
      return NextResponse.json(
        { error: "Missing required fields: amount, duration, txSignature" },
        { status: 400 },
      );
    }

    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 },
      );
    }

    // Validate token
    const authPayload = await authService.validateToken(token);
    if (!authPayload) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    // Create stake session
    const session = await StakeService.createStakeSession(
      authPayload.userId,
      parseFloat(amount),
      parseInt(duration),
      txSignature,
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      stakeConfirmed: session.stakeConfirmed,
    });
  } catch (error: any) {
    logError(error, "stake-create", {
      requestId: context.requestId,
    });

    // Handle duplicate transaction signature
    if (error.message?.includes("unique") || error.code === "23505") {
      return NextResponse.json(
        { error: "This transaction signature has already been used" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create stake session" },
      { status: 500 },
    );
  }
};

export const POST = handler;

// // Export with middleware
// export const POST = withMiddleware(handler, {
//   rateLimit: rateLimiters.general,
//   logRequest: true,
// });
