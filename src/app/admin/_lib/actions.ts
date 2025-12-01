"use server";

import { db } from "@/lib/db";
import { userQuizSessions, quizQuestionAssignments } from "@/lib/db/schema";
import { SettingsService } from "@/lib/settings/settings.service";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function toggleQuizPaused() {
  const currentSettings = await SettingsService.getSettings();
  const newSettings = await SettingsService.setQuizPaused(!currentSettings.quizPaused);
  revalidatePath("/admin/dashboard");
  return newSettings;
}

export async function setQuizPaused(paused: boolean) {
  const newSettings = await SettingsService.setQuizPaused(paused);
  revalidatePath("/admin/dashboard");
  return newSettings;
}

export async function refreshAdminData() {
  revalidatePath("/admin", "layout");
}

/**
 * Reset a user's quiz answers (set them back to unanswered state)
 */
export async function resetUserQuizAnswers(sessionId: string) {
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
