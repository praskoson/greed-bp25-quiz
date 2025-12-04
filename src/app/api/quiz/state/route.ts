import { logError } from "@/lib/logger";
import { withAuth } from "@/lib/middleware/with-auth";

import { SettingsService } from "@/lib/settings/settings.service";
import { NextRequest, NextResponse } from "next/server";

const getStateHandler = async (_request: NextRequest) => {
  try {
    const isPaused = await SettingsService.isQuizPaused();
    return NextResponse.json({ status: isPaused ? "paused" : "active" });
  } catch (error: any) {
    logError(error, "quiz-status");

    return NextResponse.json(
      { error: error.message || "Failed to get quiz data" },
      { status: 500 },
    );
  }
};

export const GET = withAuth(getStateHandler);
