import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";

const handler = async (request: NextRequest) => {
  const body = await request.json();
  const { token } = body;

  if (token) {
    const payload = await authService.validateToken(token);
    if (payload) {
      await authService.invalidateSession(payload.sessionId);
    }
  }

  return NextResponse.json({ success: true });
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.api,
  logRequest: true,
});
