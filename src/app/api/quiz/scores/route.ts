import { logError } from "@/lib/logger";
import { QuizService } from "@/lib/stake/quiz.service";
import { NextResponse } from "next/server";

const getLeaderboardHandler = async () => {
  try {
    const data = await QuizService.getQuizLeaderboard();

    return NextResponse.json(data);
  } catch (error: any) {
    logError(error, "quiz-leaderboard-get");

    return NextResponse.json(
      { error: error.message || "Failed to get leaderboard data" },
      { status: 500 },
    );
  }
};

export const GET = getLeaderboardHandler;
