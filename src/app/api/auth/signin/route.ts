import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { logError } from "@/lib/logger";

const handler = async (request: NextRequest) => {
  const body = await request.json();
  const { walletAddress, signature, message, timestamp } = body;

  // Validate required fields
  if (!walletAddress || !signature || !message || !timestamp) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const result = await authService.authenticate(
      walletAddress,
      signature,
      message,
      timestamp,
    );

    const response = NextResponse.json({
      success: true,
      walletAddress: result.walletAddress,
      expiresIn: result.expiresIn,
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
