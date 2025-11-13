import { logError } from "@/lib/logger";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { StakeService } from "@/lib/stake/stake.service";
import { NextRequest, NextResponse } from "next/server";

const handler = async (_request: NextRequest, context: AuthContext) => {
  try {
    // Get stake status
    const status = await StakeService.getQuizSessionStatus(context.user.userId);

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    logError(error, "stake-status");

    return NextResponse.json(
      { error: error.message || "Failed to get stake status" },
      { status: 500 },
    );
  }
};

export const GET = withAuth(handler);
