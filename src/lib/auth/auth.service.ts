import "server-only";
import { db } from "../db";
import { users, authSessions } from "../db/schema/bp25";
import { eq, and, gt, lte } from "drizzle-orm";
import { sign, verify } from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { env } from "@/env";
import { createHash } from "crypto";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRY_HOURS = 30 * 24;

/**
 * Hash a token using SHA-256 for secure storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface AuthPayload {
  sessionId: string;
  userId: string;
  walletAddress: string;
}

export class AuthService {
  /**
   * Verify Solana wallet signature
   */
  private verifySignature(
    message: string,
    signature: string,
    walletAddress: string,
  ): boolean {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(walletAddress);

      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes,
      );
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Generate authentication message for user to sign
   */
  generateAuthMessage(walletAddress: string, timestamp: number): string {
    return `Sign in to Greed Academy BP25\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`;
  }

  /**
   * Authenticate user with wallet signature
   */
  async authenticate(
    walletAddress: string,
    signature: string,
    message: string,
    timestamp: number,
  ): Promise<{
    token: string;
    walletAddress: string;
    userId: string;
    expiresIn: number;
  }> {
    // Verify timestamp is recent (5 minutes)
    const now = Date.now();
    const MESSAGE_VALIDITY_MS = 5 * 60 * 1000;

    if (Math.abs(now - timestamp) > MESSAGE_VALIDITY_MS) {
      throw new Error("Message timestamp expired");
    }

    // Verify message format
    const expectedMessage = this.generateAuthMessage(walletAddress, timestamp);
    if (message !== expectedMessage) {
      throw new Error("Invalid message format");
    }

    // Verify signature
    const isValid = this.verifySignature(message, signature, walletAddress);
    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Get or create user
    let user = await db.query.users.findFirst({
      where: eq(users.walletAddress, walletAddress),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({ walletAddress })
        .returning();
      user = newUser;
    } else {
      // Update last access time
      await db
        .update(users)
        .set({ updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    // Invalidate any existing sessions for this wallet
    await this.invalidateWalletSessions(walletAddress);

    // Create new session
    const expiresAt = new Date(Date.now() + JWT_EXPIRY_HOURS * 60 * 60 * 1000);

    const [session] = await db
      .insert(authSessions)
      .values({
        userId: user.id,
        walletAddress,
        token: "", // Will be updated after JWT generation
        expiresAt,
      })
      .returning();

    // Generate JWT with session ID
    const payload: AuthPayload = {
      sessionId: session.id,
      userId: user.id,
      walletAddress,
    };

    const token = sign(payload, JWT_SECRET, {
      expiresIn: `${JWT_EXPIRY_HOURS}h`,
    });

    // Update session with hashed token
    await db
      .update(authSessions)
      .set({ token: hashToken(token) })
      .where(eq(authSessions.id, session.id));

    return {
      token,
      walletAddress,
      userId: user.id,
      expiresIn: JWT_EXPIRY_HOURS * 60 * 60, // in seconds
    };
  }

  /**
   * Validate token and return user info
   */
  async validateToken(token: string): Promise<AuthPayload | null> {
    try {
      // Verify JWT
      const decoded = verify(token, JWT_SECRET) as AuthPayload;

      // Check session in database (compare hashed tokens)
      const session = await db.query.authSessions.findFirst({
        where: and(
          eq(authSessions.id, decoded.sessionId),
          eq(authSessions.token, hashToken(token)),
          gt(authSessions.expiresAt, new Date()),
        ),
      });

      if (!session) {
        return null;
      }

      // Verify wallet address matches
      if (session.walletAddress !== decoded.walletAddress) {
        await this.invalidateSession(session.id);
        return null;
      }

      // Update last accessed time
      await db
        .update(authSessions)
        .set({ lastAccessedAt: new Date() })
        .where(eq(authSessions.id, session.id));

      return decoded;
    } catch (error) {
      console.error("Token validation failed:", error);
      return null;
    }
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await db.delete(authSessions).where(eq(authSessions.id, sessionId));
  }

  /**
   * Invalidate all sessions for a wallet
   */
  async invalidateWalletSessions(walletAddress: string): Promise<void> {
    await db
      .delete(authSessions)
      .where(eq(authSessions.walletAddress, walletAddress));
  }

  /**
   * Get active session for wallet
   */
  async getActiveSession(walletAddress: string): Promise<AuthPayload | null> {
    const session = await db.query.authSessions.findFirst({
      where: and(
        eq(authSessions.walletAddress, walletAddress),
        gt(authSessions.expiresAt, new Date()),
      ),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      userId: session.userId,
      walletAddress: session.walletAddress,
    };
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    await db
      .delete(authSessions)
      .where(lte(authSessions.expiresAt, new Date()));
  }
}

export const authService = new AuthService();
