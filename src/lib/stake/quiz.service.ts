import { db } from "@/lib/db";
import {
  quizCategories,
  quizQuestions,
  quizQuestionAssignments,
  userQuizSessions,
} from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

interface StartQuizParams {
  quizSessionId: string;
}

interface StartQuizResult {
  sessionId: string;
  questionCount: number;
}

export class QuizService {
  static async assignQuestionsToUser(
    params: StartQuizParams,
  ): Promise<StartQuizResult> {
    const { quizSessionId } = params;

    const randomCategories = await db
      .select({ id: quizCategories.id })
      .from(quizCategories)
      .orderBy(sql`RANDOM()`)
      .limit(5);

    if (randomCategories.length < 5) {
      throw new Error(
        `Not enough categories available. Found ${randomCategories.length}, need 5`,
      );
    }

    const selectedQuestions: string[] = [];

    for (const category of randomCategories) {
      const [randomQuestion] = await db
        .select({ id: quizQuestions.id })
        .from(quizQuestions)
        .where(eq(quizQuestions.categoryId, category.id))
        .orderBy(sql`RANDOM()`)
        .limit(1);

      if (!randomQuestion) {
        throw new Error(`No questions found for category ${category.id}`);
      }

      selectedQuestions.push(randomQuestion.id);
    }

    const shuffledQuestions = [...selectedQuestions].sort(
      () => Math.random() - 0.5,
    );

    const assignments = shuffledQuestions.map((questionId, index) => ({
      sessionId: quizSessionId,
      questionId,
      displayOrder: index + 1,
    }));

    await db.insert(quizQuestionAssignments).values(assignments);

    return {
      sessionId: quizSessionId,
      questionCount: selectedQuestions.length,
    };
  }
}
