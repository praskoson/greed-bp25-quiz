import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";

const handler = async (request: NextRequest) => {
  const body = await request.json();
  const { token, walletAddress } = body;

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const payload = await authService.validateToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }

  // Wallet address mismatch
  if (walletAddress && payload.walletAddress !== walletAddress) {
    await authService.invalidateSession(payload.sessionId);
    return NextResponse.json(
      { error: "Wallet address mismatch" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    valid: true,
    user: {
      userId: payload.userId,
      walletAddress: payload.walletAddress,
    },
  });
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.validate,
  logRequest: true,
});
