import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { logError } from "@/lib/logger";
import { StakeService } from "@/lib/stake/stake.service";
import { walletAddressValidator, base58ZodValidator } from "@/lib/solana";
import * as z from "zod";

const signinSchema = z.object({
  walletAddress: walletAddressValidator,
  signature: base58ZodValidator,
  message: z.string().min(1),
  timestamp: z.number(),
});

const handler = async (request: NextRequest) => {
  const body = await request.json();

  const parsed = signinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  }

  const { walletAddress, signature, message, timestamp } = parsed.data;

  try {
    const result = await authService.authenticate(
      walletAddress,
      signature,
      message,
      timestamp,
    );
    const status = await StakeService.getQuizSessionStatus(result.userId);

    const response = NextResponse.json({
      success: true,
      walletAddress: result.walletAddress,
      expiresIn: result.expiresIn,
      status,
    });

    // Set HttpOnly cookie with JWT (secure, can't be accessed by JS)
    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: result.expiresIn,
      path: "/",
    });

    // Set regular cookie with wallet address (can be read by JS for validation)
    response.cookies.set("auth_wallet", result.walletAddress, {
      httpOnly: false, // Client can read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: result.expiresIn,
      path: "/",
    });

    return response;
  } catch (error: any) {
    logError(error, "auth-signin", {
      walletAddress,
      // requestId: context.requestId,
    });

    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 },
    );
  }
};

// Export with middleware
export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.auth, // Strict rate limit for auth
  logRequest: true,
});
