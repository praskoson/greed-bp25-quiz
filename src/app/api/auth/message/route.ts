import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";

const handler = async (request: NextRequest) => {
  const body = await request.json();
  const { walletAddress } = body;

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 },
    );
  }

  const timestamp = Date.now();
  const message = authService.generateAuthMessage(walletAddress, timestamp);

  return NextResponse.json({ message, timestamp });
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.api,
  logRequest: true,
});
