import "server-only";

import { db } from "@/lib/db";
import {
  quizCategories,
  quizQuestions,
  quizQuestionAssignments,
  userQuizSessions,
  quizAnswers,
  users,
} from "@/lib/db/schema/bp25";
import { sql, eq, inArray, and, isNull, isNotNull } from "drizzle-orm";
import {
  LeaderboardEntry,
  QuizAnswer,
  QuizAnswerWithResult,
  QuizQuestion,
  QuizQuestionResult,
  QuizStateWithQuestions,
  SubmitQuizAnswersParams,
  SubmitQuizAnswersResult,
} from "./quiz.schemas";

interface StartQuizParams {
  quizSessionId: string;
  assignedBy?: "job" | "admin";
}

interface StartQuizResult {
  sessionId: string;
  questionCount: number;
}

interface GetQuestionsParams {
  userId: string;
}

export class QuizService {
  static async assignQuestionsToUser(
    params: StartQuizParams,
  ): Promise<StartQuizResult> {
    const { quizSessionId, assignedBy = "job" } = params;

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

    await db
      .update(userQuizSessions)
      .set({ questionsAssignedBy: assignedBy })
      .where(eq(userQuizSessions.id, quizSessionId));

    return {
      sessionId: quizSessionId,
      questionCount: selectedQuestions.length,
    };
  }

  static async getQuestionsForUser(
    params: GetQuestionsParams,
  ): Promise<QuizStateWithQuestions> {
    const { userId } = params;

    const [session] = await db
      .select({
        id: userQuizSessions.id,
        score: userQuizSessions.score,
        completedAt: userQuizSessions.completedAt,
      })
      .from(userQuizSessions)
      .where(eq(userQuizSessions.userId, userId));

    if (!session) throw Error(`No session found for user ${userId}`);

    if (session.completedAt !== null && session.score !== null) {
      // This quiz was already completed! Get the assignments with user answers
      const assignments = await db
        .select({
          displayOrder: quizQuestionAssignments.displayOrder,
          userAnswerId: quizQuestionAssignments.userAnswerId,
          questionId: quizQuestions.id,
          questionText: quizQuestions.questionText,
          categoryName: quizCategories.name,
        })
        .from(quizQuestionAssignments)
        .innerJoin(
          quizQuestions,
          eq(quizQuestionAssignments.questionId, quizQuestions.id),
        )
        .innerJoin(
          quizCategories,
          eq(quizQuestions.categoryId, quizCategories.id),
        )
        .where(eq(quizQuestionAssignments.sessionId, session.id))
        .orderBy(quizQuestionAssignments.displayOrder);

      if (assignments.length === 0) {
        throw Error(`No questions found for session ${session.id}`);
      }

      // Get all answers for these questions (including isCorrect)
      const questionIds = assignments.map((a) => a.questionId);
      const answers = await db
        .select({
          questionId: quizAnswers.questionId,
          id: quizAnswers.id,
          answerText: quizAnswers.answerText,
          isCorrect: quizAnswers.isCorrect,
        })
        .from(quizAnswers)
        .where(inArray(quizAnswers.questionId, questionIds));

      const answersByQuestion = new Map<string, QuizAnswerWithResult[]>();
      for (const answer of answers) {
        if (!answersByQuestion.has(answer.questionId)) {
          answersByQuestion.set(answer.questionId, []);
        }
        answersByQuestion.get(answer.questionId)!.push({
          id: answer.id,
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
        });
      }

      const questions: QuizQuestionResult[] = assignments.map((assignment) => ({
        questionId: assignment.questionId,
        questionText: assignment.questionText,
        categoryName: assignment.categoryName,
        displayOrder: assignment.displayOrder,
        userAnswerId: assignment.userAnswerId,
        answers: answersByQuestion.get(assignment.questionId) || [],
      }));

      return {
        state: "finished",
        score: session.score,
        completedAt: session.completedAt,
        totalQuestions: assignments.length,
        questions,
      };
    }

    const assignments = await db
      .select({
        assignmentId: quizQuestionAssignments.id,
        displayOrder: quizQuestionAssignments.displayOrder,
        questionId: quizQuestions.id,
        questionText: quizQuestions.questionText,
        categoryName: quizCategories.name,
      })
      .from(quizQuestionAssignments)
      .innerJoin(
        quizQuestions,
        eq(quizQuestionAssignments.questionId, quizQuestions.id),
      )
      .innerJoin(
        quizCategories,
        eq(quizQuestions.categoryId, quizCategories.id),
      )
      .where(eq(quizQuestionAssignments.sessionId, session.id))
      .orderBy(quizQuestionAssignments.displayOrder);

    if (assignments.length === 0) {
      throw Error(`No questions found for session ${session.id}`);
    }

    const questionIds = assignments.map((a) => a.questionId);

    const answers = await db
      .select({
        questionId: quizAnswers.questionId,
        id: quizAnswers.id,
        answerText: quizAnswers.answerText,
      })
      .from(quizAnswers)
      .where(inArray(quizAnswers.questionId, questionIds));

    const answersByQuestion = new Map<string, QuizAnswer[]>();

    for (const answer of answers) {
      if (!answersByQuestion.has(answer.questionId)) {
        answersByQuestion.set(answer.questionId, []);
      }
      answersByQuestion.get(answer.questionId)!.push({
        id: answer.id,
        answerText: answer.answerText,
      });
    }

    const result: QuizQuestion[] = assignments.map((assignment) => ({
      questionId: assignment.questionId,
      questionText: assignment.questionText,
      categoryName: assignment.categoryName,
      assignmentId: assignment.assignmentId,
      displayOrder: assignment.displayOrder,
      answers: answersByQuestion.get(assignment.questionId) || [],
    }));

    return {
      state: "ready",
      questions: result,
    };
  }

  static async submitQuizAnswers(
    params: SubmitQuizAnswersParams,
  ): Promise<SubmitQuizAnswersResult> {
    const { userId, answers } = params;

    const [activeSession] = await db
      .select()
      .from(userQuizSessions)
      .where(
        and(
          eq(userQuizSessions.userId, userId),
          isNull(userQuizSessions.completedAt),
        ),
      )
      .limit(1);

    if (!activeSession) {
      throw new Error("No active quiz session found for this user");
    }

    const assignments = await db
      .select()
      .from(quizQuestionAssignments)
      .where(eq(quizQuestionAssignments.sessionId, activeSession.id));

    if (answers.length !== assignments.length) {
      throw new Error(
        `Expected ${assignments.length} answers, but received ${answers.length}`,
      );
    }

    const assignmentQuestionIds = new Set(assignments.map((a) => a.questionId));
    for (const answer of answers) {
      if (!assignmentQuestionIds.has(answer.questionId)) {
        throw new Error(
          `Question ${answer.questionId} is not part of this quiz session`,
        );
      }
    }

    const answeredAt = new Date();
    for (const answer of answers) {
      const assignment = assignments.find(
        (a) => a.questionId === answer.questionId,
      );

      if (!assignment) {
        throw new Error(
          `Assignment not found for question ${answer.questionId}`,
        );
      }

      await db
        .update(quizQuestionAssignments)
        .set({
          userAnswerId: answer.answerId,
          answeredAt,
        })
        .where(eq(quizQuestionAssignments.id, assignment.id));
    }

    const answerIds = answers.map((a) => a.answerId);

    const submittedAnswers = await db
      .select({
        id: quizAnswers.id,
        isCorrect: quizAnswers.isCorrect,
      })
      .from(quizAnswers)
      .where(inArray(quizAnswers.id, answerIds));

    const score = submittedAnswers.filter((a) => a.isCorrect).length;

    await db
      .update(userQuizSessions)
      .set({
        score,
        completedAt: answeredAt,
      })
      .where(eq(userQuizSessions.id, activeSession.id));

    // Fetch full question details for the response
    const questionAssignments = await db
      .select({
        displayOrder: quizQuestionAssignments.displayOrder,
        userAnswerId: quizQuestionAssignments.userAnswerId,
        questionId: quizQuestions.id,
        questionText: quizQuestions.questionText,
        categoryName: quizCategories.name,
      })
      .from(quizQuestionAssignments)
      .innerJoin(
        quizQuestions,
        eq(quizQuestionAssignments.questionId, quizQuestions.id),
      )
      .innerJoin(
        quizCategories,
        eq(quizQuestions.categoryId, quizCategories.id),
      )
      .where(eq(quizQuestionAssignments.sessionId, activeSession.id))
      .orderBy(quizQuestionAssignments.displayOrder);

    // Get all answers for these questions (including isCorrect)
    const questionIds = questionAssignments.map((a) => a.questionId);
    const allAnswers = await db
      .select({
        questionId: quizAnswers.questionId,
        id: quizAnswers.id,
        answerText: quizAnswers.answerText,
        isCorrect: quizAnswers.isCorrect,
      })
      .from(quizAnswers)
      .where(inArray(quizAnswers.questionId, questionIds));

    const answersByQuestion = new Map<string, QuizAnswerWithResult[]>();
    for (const answer of allAnswers) {
      if (!answersByQuestion.has(answer.questionId)) {
        answersByQuestion.set(answer.questionId, []);
      }
      answersByQuestion.get(answer.questionId)!.push({
        id: answer.id,
        answerText: answer.answerText,
        isCorrect: answer.isCorrect,
      });
    }

    const questions: QuizQuestionResult[] = questionAssignments.map(
      (assignment) => ({
        questionId: assignment.questionId,
        questionText: assignment.questionText,
        categoryName: assignment.categoryName,
        displayOrder: assignment.displayOrder,
        userAnswerId: assignment.userAnswerId,
        answers: answersByQuestion.get(assignment.questionId) || [],
      }),
    );

    return {
      score,
      totalQuestions: assignments.length,
      completedAt: answeredAt,
      questions,
    };
  }

  static async getQuizLeaderboard(): Promise<LeaderboardEntry[]> {
    const leaderboard = await db
      .select({
        userId: users.id,
        walletAddress: users.walletAddress,
        score: userQuizSessions.score,
        completedAt: userQuizSessions.completedAt,
        // Use totalStakeLamports for ranking, fallback to stakeAmountLamports for older records
        stakeAmountLamports: sql<number>`COALESCE(${userQuizSessions.totalStakeLamports}, ${userQuizSessions.stakeAmountLamports})`,
        stakeDurationSeconds: userQuizSessions.stakeDurationSeconds,
      })
      .from(userQuizSessions)
      .innerJoin(users, eq(userQuizSessions.userId, users.id))
      .where(
        and(
          isNotNull(userQuizSessions.completedAt),
          eq(userQuizSessions.shadowBan, false),
        ),
      );

    return leaderboard.map((entry) => ({
      userId: entry.userId,
      walletAddress: entry.walletAddress,
      score: entry.score!,
      completedAt: entry.completedAt!,
      stakeAmountLamports: entry.stakeAmountLamports,
      stakeDurationSeconds: entry.stakeDurationSeconds,
    }));
  }
}
