import "server-only";

import { db } from "@/lib/db";
import {
  userQuizSessions,
  users,
  secondaryUserStakes,
} from "@/lib/db/schema/bp25";
import { eq, sql } from "drizzle-orm";

type CreateQuizSessionPayload = {
  walletAddress: string;
  userId: string;
  authSessionId: string;
  signature: string;
  amount: number;
  duration: number;
};

type CreateSecondaryStakePayload = {
  sessionId: string;
  signature: string;
  amount: number;
  duration: number;
};

export class StakeService {
  /**
   * Validate stake parameters
   */
  static validateStakeParams(
    amount: number,
    duration: number,
  ): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: "Stake amount must be greater than 0" };
    }

    if (amount > 1000000) {
      return { valid: false, error: "Stake amount is too large" };
    }

    if (duration < 60) {
      return {
        valid: false,
        error: "Stake duration must be at least 60 days",
      };
    }

    if (duration > 365) {
      return { valid: false, error: "Stake duration cannot exceed 365 days" };
    }

    return { valid: true };
  }

  static async isQuizSessionForUserAlreadyCreated(
    walletAddress: string,
  ): Promise<boolean> {
    const [quizSession] = await db
      .select()
      .from(userQuizSessions)
      .innerJoin(users, eq(userQuizSessions.userId, users.id))
      .where(eq(users.walletAddress, walletAddress));

    return !!quizSession;
  }

  static async isSignatureAlreadyInUse(
    stakeSignature: string,
  ): Promise<boolean> {
    const [quizSession] = await db
      .select()
      .from(userQuizSessions)
      .where(eq(userQuizSessions.stakeSignature, stakeSignature))
      .limit(1);

    return !!quizSession;
  }

  static async createQuizSession(payload: CreateQuizSessionPayload) {
    // Validate params
    const validation = this.validateStakeParams(
      payload.amount,
      payload.duration,
    );
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const stakeDurationSeconds = payload.duration * 24 * 60 * 60;
    const stakeAmountLamports = payload.amount * 1e9;

    // Create game session
    const [session] = await db
      .insert(userQuizSessions)
      .values({
        userId: payload.userId,
        stakeDurationSeconds,
        stakeAmountLamports,
        stakeSignature: payload.signature,
        stakeVerification: "processing",
      })
      .returning();

    return session;
  }

  static async getQuizSessionStatus(
    userId: string,
  ): Promise<"failed" | "processing" | "success" | null> {
    const [session] = await db
      .select({ stakeVerification: userQuizSessions.stakeVerification })
      .from(userQuizSessions)
      .where(eq(userQuizSessions.userId, userId))
      .limit(1);

    if (!session) return null;

    return session.stakeVerification;
  }

  /**
   * Get verified session for a user (stakeVerification = 'success')
   */
  static async getVerifiedSessionForUser(userId: string) {
    const [session] = await db
      .select()
      .from(userQuizSessions)
      .where(eq(userQuizSessions.userId, userId))
      .limit(1);

    if (!session || session.stakeVerification !== "success") {
      return null;
    }

    return session;
  }

  /**
   * Check if a signature is already used in either primary or secondary stakes
   */
  static async isSecondarySignatureAlreadyInUse(
    signature: string,
  ): Promise<boolean> {
    // Check primary stakes
    const [primaryStake] = await db
      .select()
      .from(userQuizSessions)
      .where(eq(userQuizSessions.stakeSignature, signature))
      .limit(1);

    if (primaryStake) return true;

    // Check secondary stakes
    const [secondaryStake] = await db
      .select()
      .from(secondaryUserStakes)
      .where(eq(secondaryUserStakes.signature, signature))
      .limit(1);

    return !!secondaryStake;
  }

  /**
   * Create a secondary stake for an existing verified session
   */
  static async createSecondaryStake(payload: CreateSecondaryStakePayload) {
    const validation = this.validateStakeParams(
      payload.amount,
      payload.duration,
    );
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const durationSeconds = payload.duration * 24 * 60 * 60;
    const amountLamports = payload.amount * 1e9;

    const [stake] = await db
      .insert(secondaryUserStakes)
      .values({
        sessionId: payload.sessionId,
        durationSeconds,
        amountLamports,
        signature: payload.signature,
        verification: "processing",
      })
      .returning();

    return stake;
  }

  /**
   * Confirm a secondary stake and update the session's totalStakeLamports
   */
  static async confirmSecondaryStake(stakeId: string) {
    // Get the stake to confirm
    const [stake] = await db
      .select()
      .from(secondaryUserStakes)
      .where(eq(secondaryUserStakes.id, stakeId))
      .limit(1);

    if (!stake) {
      throw new Error("Secondary stake not found");
    }

    if (stake.verification === "success") {
      return { alreadyConfirmed: true };
    }

    // Update the stake verification status
    await db
      .update(secondaryUserStakes)
      .set({
        verification: "success",
        confirmedAt: new Date(),
      })
      .where(eq(secondaryUserStakes.id, stakeId));

    // Update the session's totalStakeLamports
    await db
      .update(userQuizSessions)
      .set({
        totalStakeLamports: sql`${userQuizSessions.totalStakeLamports} + ${stake.amountLamports}`,
      })
      .where(eq(userQuizSessions.id, stake.sessionId));

    return { alreadyConfirmed: false };
  }

  /**
   * Get a secondary stake by ID
   */
  static async getSecondaryStake(stakeId: string) {
    const [stake] = await db
      .select()
      .from(secondaryUserStakes)
      .where(eq(secondaryUserStakes.id, stakeId))
      .limit(1);

    return stake || null;
  }
}
