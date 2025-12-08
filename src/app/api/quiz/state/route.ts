import { logError } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/with-auth";
import { SettingsService } from "@/lib/settings/settings.service";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-error";

const getStateHandler = async (_request: NextRequest) => {
  try {
    const isPaused = await SettingsService.isQuizPaused();
    return NextResponse.json({ status: isPaused ? "paused" : "active" });
  } catch (error) {
    logError(error as Error, "quiz-status");
    return errorResponse("Failed to get quiz state", error);
  }
};

export const GET = withAuth(getStateHandler);
