import { db } from "@/lib/db";
import { gameSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sleep } from "@/lib/utils";

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

  /**
   * Create a new game session with stake information
   */
  static async createStakeSession(
    userId: string,
    amount: number,
    duration: number,
    txSignature: string,
  ) {
    // Validate params
    const validation = this.validateStakeParams(amount, duration);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create game session
    const [session] = await db
      .insert(gameSessions)
      .values({
        userId,
        stakeAmount: amount.toString(),
        stakeDuration: duration,
        stakeTxSignature: txSignature,
        stakeConfirmed: false,
      })
      .returning();

    // Start background verification (don't await)
    this.verifyStakeTransactionAsync(session.id, txSignature, amount);

    return session;
  }

  /**
   * Background verification of stake transaction
   * TODO: Replace with actual Solana transaction verification
   */
  static async verifyStakeTransactionAsync(
    sessionId: string,
    txSignature: string,
    expectedAmount: number,
  ) {
    // Run verification in background
    setTimeout(async () => {
      try {
        // PLACEHOLDER: Sleep for 1 second to simulate verification
        await sleep(1000);

        // TODO: Implement actual Solana transaction verification
        // - Verify transaction exists on-chain
        // - Verify sender matches user's wallet
        // - Verify amount matches expected stake amount
        // - Verify transaction succeeded

        // Mark as confirmed
        await db
          .update(gameSessions)
          .set({
            stakeConfirmed: true,
            stakeConfirmedAt: new Date(),
          })
          .where(eq(gameSessions.id, sessionId));

        console.log(`Stake verified for session ${sessionId}`);
      } catch (error) {
        console.error(
          `Failed to verify stake for session ${sessionId}:`,
          error,
        );
        // In production, you might want to mark the session as failed
        // or retry verification
      }
    }, 0);
  }

  /**
   * Get stake confirmation status for a session
   */
  static async getStakeStatus(sessionId: string) {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      stakeConfirmed: session.stakeConfirmed,
      stakeConfirmedAt: session.stakeConfirmedAt,
      stakeAmount: session.stakeAmount,
      stakeDuration: session.stakeDuration,
    };
  }

  /**
   * Check if stake is confirmed for a session
   */
  static async isStakeConfirmed(sessionId: string): Promise<boolean> {
    const status = await this.getStakeStatus(sessionId);
    return status?.stakeConfirmed ?? false;
  }
}
