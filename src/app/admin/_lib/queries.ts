import "server-only";

import { db } from "@/lib/db";
import {
  quizCategories,
  quizQuestions,
  quizAnswers,
  users,
  userQuizSessions,
  quizQuestionAssignments,
} from "@/lib/db/schema/bp25";
import { eq, and, isNull, isNotNull, desc, sql } from "drizzle-orm";

export type AdminAnswer = {
  id: string;
  answerText: string;
  isCorrect: boolean;
  updatedAt: Date;
};

export type AdminQuestion = {
  id: string;
  questionText: string;
  createdAt: Date;
  updatedAt: Date;
  answers: AdminAnswer[];
};

export type AdminCategory = {
  id: string;
  name: string;
  questions: AdminQuestion[];
};

export async function getQuestionsGroupedByCategory(): Promise<
  AdminCategory[]
> {
  // Fetch all categories
  const categories = await db
    .select({
      id: quizCategories.id,
      name: quizCategories.name,
    })
    .from(quizCategories)
    .orderBy(quizCategories.name);

  // Fetch all questions
  const questions = await db
    .select({
      id: quizQuestions.id,
      categoryId: quizQuestions.categoryId,
      questionText: quizQuestions.questionText,
      createdAt: quizQuestions.createdAt,
      updatedAt: quizQuestions.updatedAt,
    })
    .from(quizQuestions)
    .orderBy(quizQuestions.createdAt);

  // Fetch all answers
  const answers = await db
    .select({
      id: quizAnswers.id,
      questionId: quizAnswers.questionId,
      answerText: quizAnswers.answerText,
      isCorrect: quizAnswers.isCorrect,
      updatedAt: quizAnswers.updatedAt,
    })
    .from(quizAnswers);

  // Group answers by question
  const answersByQuestion = new Map<string, AdminAnswer[]>();
  for (const answer of answers) {
    if (!answersByQuestion.has(answer.questionId)) {
      answersByQuestion.set(answer.questionId, []);
    }
    answersByQuestion.get(answer.questionId)!.push({
      id: answer.id,
      answerText: answer.answerText,
      isCorrect: answer.isCorrect,
      updatedAt: answer.updatedAt,
    });
  }

  // Group questions by category
  const questionsByCategory = new Map<string, AdminQuestion[]>();
  for (const question of questions) {
    if (!questionsByCategory.has(question.categoryId)) {
      questionsByCategory.set(question.categoryId, []);
    }
    questionsByCategory.get(question.categoryId)!.push({
      id: question.id,
      questionText: question.questionText,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      answers: answersByQuestion.get(question.id) || [],
    });
  }

  // Build final result
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    questions: questionsByCategory.get(category.id) || [],
  }));
}

// User list types
export type AssignedQuestion = {
  id: string;
  questionText: string;
  categoryName: string;
  displayOrder: number;
};

export type UserAnswer = {
  id: string;
  answerText: string;
  isCorrect: boolean;
};

export type AssignedQuestionWithAnswer = AssignedQuestion & {
  userAnswer: UserAnswer | null;
  allAnswers: UserAnswer[];
};

export type AdminUserListItem = {
  userId: string;
  sessionId: string;
  walletAddress: string;
  stakeAmountLamports: number;
  stakeDurationSeconds: number;
  createdAt: Date;
  questionCount: number;
  score?: number | null;
  completedAt?: Date | null;
  shadowBan?: boolean;
};

export type AdminUserWithQuestions = AdminUserListItem & {
  questions: AssignedQuestionWithAnswer[];
  stakeVerification: "processing" | "success" | "failed";
  stakeSignature: string;
};

type GetUsersOptions = {
  limit?: number;
};

/**
 * Get verified users who have questions assigned but haven't completed the quiz
 */
export async function getVerifiedUsersWithQuestions(
  options: GetUsersOptions = {},
): Promise<AdminUserListItem[]> {
  const { limit } = options;

  const baseQuery = db
    .select({
      userId: users.id,
      sessionId: userQuizSessions.id,
      walletAddress: users.walletAddress,
      stakeAmountLamports: sql<number>`COALESCE(${userQuizSessions.totalStakeLamports}, ${userQuizSessions.stakeAmountLamports})`,
      stakeDurationSeconds: userQuizSessions.stakeDurationSeconds,
      createdAt: userQuizSessions.createdAt,
      questionCount: sql<number>`count(${quizQuestionAssignments.id})::int`,
      shadowBan: userQuizSessions.shadowBan,
    })
    .from(userQuizSessions)
    .innerJoin(users, eq(userQuizSessions.userId, users.id))
    .innerJoin(
      quizQuestionAssignments,
      eq(quizQuestionAssignments.sessionId, userQuizSessions.id),
    )
    .where(
      and(
        eq(userQuizSessions.stakeVerification, "success"),
        isNull(userQuizSessions.completedAt),
      ),
    )
    .groupBy(
      users.id,
      userQuizSessions.id,
      users.walletAddress,
      userQuizSessions.totalStakeLamports,
      userQuizSessions.stakeAmountLamports,
      userQuizSessions.stakeDurationSeconds,
      userQuizSessions.createdAt,
      userQuizSessions.shadowBan,
    )
    .orderBy(desc(userQuizSessions.createdAt));

  if (limit) {
    return baseQuery.limit(limit);
  }

  return baseQuery;
}

/**
 * Get a single user with their assigned questions and answers
 */
export async function getUserWithQuestions(
  sessionId: string,
): Promise<AdminUserWithQuestions | null> {
  const [session] = await db
    .select({
      userId: users.id,
      sessionId: userQuizSessions.id,
      walletAddress: users.walletAddress,
      stakeAmountLamports: sql<number>`COALESCE(${userQuizSessions.totalStakeLamports}, ${userQuizSessions.stakeAmountLamports})`,
      stakeDurationSeconds: userQuizSessions.stakeDurationSeconds,
      createdAt: userQuizSessions.createdAt,
      score: userQuizSessions.score,
      completedAt: userQuizSessions.completedAt,
      shadowBan: userQuizSessions.shadowBan,
      stakeVerification: userQuizSessions.stakeVerification,
      stakeSignature: userQuizSessions.stakeSignature,
    })
    .from(userQuizSessions)
    .innerJoin(users, eq(userQuizSessions.userId, users.id))
    .where(eq(userQuizSessions.id, sessionId));

  if (!session) return null;

  // Get assignments with user's selected answer
  const assignments = await db
    .select({
      questionId: quizQuestions.id,
      questionText: quizQuestions.questionText,
      categoryName: quizCategories.name,
      displayOrder: quizQuestionAssignments.displayOrder,
      userAnswerId: quizQuestionAssignments.userAnswerId,
    })
    .from(quizQuestionAssignments)
    .innerJoin(
      quizQuestions,
      eq(quizQuestionAssignments.questionId, quizQuestions.id),
    )
    .innerJoin(quizCategories, eq(quizQuestions.categoryId, quizCategories.id))
    .where(eq(quizQuestionAssignments.sessionId, sessionId))
    .orderBy(quizQuestionAssignments.displayOrder);

  // Get all answers for these questions
  const questionIds = assignments.map((a) => a.questionId);
  const allAnswers =
    questionIds.length > 0
      ? await db
          .select({
            id: quizAnswers.id,
            questionId: quizAnswers.questionId,
            answerText: quizAnswers.answerText,
            isCorrect: quizAnswers.isCorrect,
          })
          .from(quizAnswers)
          .where(sql`${quizAnswers.questionId} IN ${questionIds}`)
      : [];

  // Group answers by question
  const answersByQuestion = new Map<string, UserAnswer[]>();
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

  // Build questions with user answers
  const questions: AssignedQuestionWithAnswer[] = assignments.map((a) => {
    const questionAnswers = answersByQuestion.get(a.questionId) || [];
    const userAnswer = a.userAnswerId
      ? questionAnswers.find((ans) => ans.id === a.userAnswerId) || null
      : null;

    return {
      id: a.questionId,
      questionText: a.questionText,
      categoryName: a.categoryName,
      displayOrder: a.displayOrder,
      userAnswer,
      allAnswers: questionAnswers,
    };
  });

  return {
    ...session,
    questionCount: questions.length,
    questions,
  };
}

/**
 * Get count of verified users with questions
 */
export async function getVerifiedUsersWithQuestionsCount(): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(distinct ${userQuizSessions.id})::int`,
    })
    .from(userQuizSessions)
    .innerJoin(
      quizQuestionAssignments,
      eq(quizQuestionAssignments.sessionId, userQuizSessions.id),
    )
    .where(
      and(
        eq(userQuizSessions.stakeVerification, "success"),
        isNull(userQuizSessions.completedAt),
      ),
    );

  return result?.count ?? 0;
}

/**
 * Get users who have completed the quiz
 */
export async function getCompletedQuizUsers(
  options: GetUsersOptions = {},
): Promise<AdminUserListItem[]> {
  const { limit } = options;

  const baseQuery = db
    .select({
      userId: users.id,
      sessionId: userQuizSessions.id,
      walletAddress: users.walletAddress,
      stakeAmountLamports: sql<number>`COALESCE(${userQuizSessions.totalStakeLamports}, ${userQuizSessions.stakeAmountLamports})`,
      stakeDurationSeconds: userQuizSessions.stakeDurationSeconds,
      createdAt: userQuizSessions.createdAt,
      score: userQuizSessions.score,
      completedAt: userQuizSessions.completedAt,
      questionCount: sql<number>`(
        SELECT count(*)::int FROM ${quizQuestionAssignments}
        WHERE ${quizQuestionAssignments.sessionId} = ${userQuizSessions.id}
      )`,
      shadowBan: userQuizSessions.shadowBan,
    })
    .from(userQuizSessions)
    .innerJoin(users, eq(userQuizSessions.userId, users.id))
    .where(isNotNull(userQuizSessions.completedAt))
    .orderBy(desc(userQuizSessions.completedAt));

  if (limit) {
    return baseQuery.limit(limit);
  }

  return baseQuery;
}

/**
 * Get count of users who have completed the quiz
 */
export async function getCompletedQuizUsersCount(): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(userQuizSessions)
    .where(isNotNull(userQuizSessions.completedAt));

  return result?.count ?? 0;
}

/**
 * Get users with pending stake verification
 */
export async function getPendingVerificationUsers(
  options: GetUsersOptions = {},
): Promise<AdminUserListItem[]> {
  const { limit } = options;

  const baseQuery = db
    .select({
      userId: users.id,
      sessionId: userQuizSessions.id,
      walletAddress: users.walletAddress,
      stakeAmountLamports: userQuizSessions.stakeAmountLamports,
      stakeDurationSeconds: userQuizSessions.stakeDurationSeconds,
      createdAt: userQuizSessions.createdAt,
      questionCount: sql<number>`0::int`,
      shadowBan: userQuizSessions.shadowBan,
    })
    .from(userQuizSessions)
    .innerJoin(users, eq(userQuizSessions.userId, users.id))
    .where(eq(userQuizSessions.stakeVerification, "processing"))
    .orderBy(desc(userQuizSessions.createdAt));

  if (limit) {
    return baseQuery.limit(limit);
  }

  return baseQuery;
}

/**
 * Get count of users with pending stake verification
 */
export async function getPendingVerificationUsersCount(): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(userQuizSessions)
    .where(eq(userQuizSessions.stakeVerification, "processing"));

  return result?.count ?? 0;
}
