import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { logError } from "@/lib/logger";
// import * as Sentry from '@sentry/nextjs';

const handler = async (request: NextRequest, context: any) => {
  const body = await request.json();
  const { walletAddress, signature, message, timestamp } = body;

  // Validate required fields
  if (!walletAddress || !signature || !message || !timestamp) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Add wallet address to Sentry context
  // Sentry.setUser({ id: walletAddress });

  try {
    const result = await authService.authenticate(
      walletAddress,
      signature,
      message,
      timestamp,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    logError(error, "auth-signin", {
      walletAddress,
      requestId: context.requestId,
    });

    // Capture in Sentry with additional context
    // Sentry.captureException(error, {
    //   tags: {
    //     operation: 'signin',
    //     walletAddress,
    //   },
    // });

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
