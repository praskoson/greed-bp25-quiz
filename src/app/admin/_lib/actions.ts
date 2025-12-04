"use server";

import { db } from "@/lib/db";
import {
  users,
  userQuizSessions,
  quizQuestionAssignments,
} from "@/lib/db/schema/bp25";
import { SettingsService } from "@/lib/settings/settings.service";
import { QuizService } from "@/lib/stake/quiz.service";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/admin-auth";
import { headers } from "next/headers";

async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function toggleQuizPaused() {
  await requireAuth();
  const currentSettings = await SettingsService.getSettings();
  const newSettings = await SettingsService.setQuizPaused(
    !currentSettings.quizPaused,
  );
  revalidatePath("/admin/dashboard");
  return newSettings;
}

export async function setQuizPaused(paused: boolean) {
  await requireAuth();
  const newSettings = await SettingsService.setQuizPaused(paused);
  revalidatePath("/admin/dashboard");
  return newSettings;
}

export async function refreshAdminData() {
  await requireAuth();
  revalidatePath("/admin", "layout");
}

/**
 * Reset a user's quiz answers (set them back to unanswered state)
 */
export async function resetUserQuizAnswers(sessionId: string) {
  await requireAuth();
  // Clear user answers from assignments
  await db
    .update(quizQuestionAssignments)
    .set({
      userAnswerId: null,
      answeredAt: null,
    })
    .where(eq(quizQuestionAssignments.sessionId, sessionId));

  // Reset the session score and completedAt
  await db
    .update(userQuizSessions)
    .set({
      score: null,
      completedAt: null,
    })
    .where(eq(userQuizSessions.id, sessionId));

  revalidatePath("/admin", "layout");
}

/**
 * Toggle shadow ban status for a user session
 */
export async function toggleShadowBan(sessionId: string) {
  await requireAuth();

  const [session] = await db
    .select({ shadowBan: userQuizSessions.shadowBan })
    .from(userQuizSessions)
    .where(eq(userQuizSessions.id, sessionId));

  if (!session) {
    throw new Error("Session not found");
  }

  await db
    .update(userQuizSessions)
    .set({ shadowBan: !session.shadowBan })
    .where(eq(userQuizSessions.id, sessionId));

  revalidatePath("/admin", "layout");
}

/**
 * Delete a user and all related data (cascades to sessions, assignments, etc.)
 */
export async function deleteUser(sessionId: string) {
  await requireAuth();

  const [session] = await db
    .select({ userId: userQuizSessions.userId })
    .from(userQuizSessions)
    .where(eq(userQuizSessions.id, sessionId));

  if (!session) {
    throw new Error("Session not found");
  }

  await db.delete(users).where(eq(users.id, session.userId));

  revalidatePath("/admin", "layout");
}

/**
 * Manually assign questions to a user's quiz session
 */
export async function assignQuestionsToSession(sessionId: string) {
  await requireAuth();

  await db
    .update(userQuizSessions)
    .set({
      stakeVerification: "success",
      stakeConfirmedAt: new Date(),
    })
    .where(eq(userQuizSessions.id, sessionId));

  await QuizService.assignQuestionsToUser({
    quizSessionId: sessionId,
    assignedBy: "admin",
  });

  revalidatePath("/admin", "layout");
}
