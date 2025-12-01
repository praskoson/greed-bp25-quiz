import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { StakeService } from "@/lib/stake/stake.service";

const handler = async (request: NextRequest) => {
  const token = request.cookies.get("auth_token")?.value;
  const storedWallet = request.cookies.get("auth_wallet")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  const payload = await authService.validateToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }

  // Check if wallet matches
  if (storedWallet && payload.walletAddress !== storedWallet) {
    // Wallet mismatch - invalidate session
    await authService.invalidateSession(payload.sessionId);

    const response = NextResponse.json(
      { error: "Wallet address mismatch" },
      { status: 401 },
    );

    // Clear cookies
    response.cookies.delete("auth_token");
    response.cookies.delete("auth_wallet");

    return response;
  }

  const status = await StakeService.getQuizSessionStatus(payload.userId);

  return NextResponse.json({
    valid: true,
    user: {
      userId: payload.userId,
      walletAddress: payload.walletAddress,
      status,
    },
  });
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.validate,
  logRequest: true,
});
