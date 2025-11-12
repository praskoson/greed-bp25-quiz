import { db } from "@/lib/db";
import { userQuizSessions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type CreateQuizSessionPayload = {
  walletAddress: string;
  userId: string;
  authSessionId: string;
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
}
