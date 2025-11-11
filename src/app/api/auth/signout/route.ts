import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";
import { withMiddleware } from "@/lib/middleware/withMiddleware";
import { rateLimiters } from "@/lib/redis";

const handler = async (request: NextRequest) => {
  const token = request.cookies.get("auth_token")?.value;

  if (token) {
    const payload = await authService.validateToken(token);
    if (payload) {
      await authService.invalidateSession(payload.sessionId);
    }
  }

  const response = NextResponse.json({ success: true });

  // Clear both cookies
  response.cookies.delete("auth_token");
  response.cookies.delete("auth_wallet");

  return response;
};

export const POST = withMiddleware(handler, {
  rateLimit: rateLimiters.api,
  logRequest: true,
});
