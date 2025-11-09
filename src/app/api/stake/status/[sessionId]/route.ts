import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { StakeService } from "@/lib/stake/stake.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";
import { logError } from "@/lib/logger";

const handler = async (
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }>; requestId?: string },
) => {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
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

    // Get stake status
    const status = await StakeService.getStakeStatus(sessionId);

    if (!status) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(status);
  } catch (error: any) {
    logError(error, "stake-status", {
      requestId: context.requestId,
    });

    return NextResponse.json(
      { error: error.message || "Failed to get stake status" },
      { status: 500 },
    );
  }
};

// Export with middleware
export const GET = withMiddleware(handler, {
  rateLimit: rateLimiters.general,
  logRequest: true,
});
