import { logError } from "@/lib/logger";
import { AuthContext, withAuth } from "@/lib/middleware/with-auth";
import { quizAnswersSchema } from "@/lib/stake/quiz.schemas";
import { QuizService } from "@/lib/stake/quiz.service";
import { SettingsService } from "@/lib/settings/settings.service";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-error";
import * as z from "zod";

const getQuestionsHandler = async (
  _request: NextRequest,
  context: AuthContext,
) => {
  try {
    const data = await QuizService.getQuestionsForUser({
      userId: context.user.userId,
    });

    return NextResponse.json(data);
  } catch (error) {
    logError(error as Error, "quiz-get");
    return errorResponse("Failed to get quiz data", error);
  }
};

const submitAnswersHandler = async (
  request: NextRequest,
  context: AuthContext,
) => {
  try {
    const isPaused = await SettingsService.isQuizPaused();
    if (isPaused) {
      return NextResponse.json(
        { success: false, message: "Quiz submissions are paused." },
        { status: 503 },
      );
    }

    const { userId } = context.user;
    const body = await request.json();
    const answers = quizAnswersSchema.parse(body);

    const { score, totalQuestions, completedAt, questions } =
      await QuizService.submitQuizAnswers({
        userId,
        answers,
      });

    console.log(
      `Quiz completed for ${userId}: ${score}/${totalQuestions} correct answers`,
    );

    return NextResponse.json({
      success: true,
      data: {
        score,
        totalQuestions,
        completedAt,
        questions,
      },
    });
  } catch (error) {
    logError(error as Error, "quiz-submit");
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error" },
        { status: 400 },
      );
    }
    return errorResponse("Failed to submit answers", error);
  }
};

export const GET = withAuth(getQuestionsHandler);
export const POST = withAuth(submitAnswersHandler);
