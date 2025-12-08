import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { walletAddressValidator } from "@/lib/solana";
import * as z from "zod";

const messageSchema = z.object({
  walletAddress: walletAddressValidator,
});

const handler = async (request: NextRequest) => {
  const body = await request.json();

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 },
    );
  }

  const { walletAddress } = parsed.data;
  const timestamp = Date.now();
  const message = authService.generateAuthMessage(walletAddress, timestamp);

  return NextResponse.json({ message, timestamp });
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.api,
  logRequest: true,
});
