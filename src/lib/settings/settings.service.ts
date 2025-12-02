import "server-only";

import { db } from "@/lib/db";
import { appSettings, AppSettingsData } from "@/lib/db/schema/bp25";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS: AppSettingsData = {
  quizPaused: false,
};

export class SettingsService {
  static async getSettings(): Promise<AppSettingsData> {
    const [settings] = await db.select().from(appSettings).limit(1);

    if (!settings) {
      // Create default settings if none exist
      const [created] = await db
        .insert(appSettings)
        .values({ data: DEFAULT_SETTINGS })
        .returning();
      return created.data;
    }

    return settings.data;
  }

  static async updateSettings(
    updates: Partial<AppSettingsData>,
  ): Promise<AppSettingsData> {
    const current = await this.getSettings();
    const newData = { ...current, ...updates };

    const [existing] = await db.select().from(appSettings).limit(1);

    if (!existing) {
      const [created] = await db
        .insert(appSettings)
        .values({ data: newData })
        .returning();
      return created.data;
    }

    const [updated] = await db
      .update(appSettings)
      .set({ data: newData, updatedAt: new Date() })
      .where(eq(appSettings.id, existing.id))
      .returning();

    return updated.data;
  }

  static async isQuizPaused(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.quizPaused;
  }

  static async setQuizPaused(paused: boolean): Promise<AppSettingsData> {
    return this.updateSettings({ quizPaused: paused });
  }
}
