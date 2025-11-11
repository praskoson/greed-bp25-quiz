import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth/auth.service";

export async function withAuth(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await authService.validateToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Add user info to request context
    const context = {
      user: {
        userId: payload.userId,
        walletAddress: payload.walletAddress,
      },
    };

    return handler(request, context);
  };
}
