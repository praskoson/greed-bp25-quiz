import { loadEnvConfig } from "@next/env";
import { users, userQuizSessions } from "@/lib/db/schema";
import bs58 from "bs58";
import { randomBytes } from "crypto";
loadEnvConfig(process.cwd());

interface FakeUser {
  id: string;
  walletAddress: string;
}

function generateSolanaAddress(): string {
  // Generate a random 32-byte array (typical Solana public key)
  const bytes = randomBytes(32);
  // Encode to base58
  return bs58.encode(bytes);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStakeAmount(): number {
  // Random integer between 1 and 12, multiplied by 1e9 (lamports)
  return randomInt(1, 12) * 1e9;
}

function randomStakeDuration(): number {
  // Random days between 60 and 180, converted to seconds
  const days = randomInt(60, 180);
  return days * 24 * 60 * 60;
}

function randomScore(): number {
  return randomInt(0, 5);
}

function generateStakeSignature(): string {
  // Generate a random signature-like string (88 chars is typical for Solana signatures)
  return bs58.encode(randomBytes(64));
}

function randomCompletedAt(): Date {
  // Random date within the last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
  return new Date(randomTime);
}

async function populateFakeLeaderboard(count: number = 50) {
  try {
    const { db } = await import("../lib/db/index.js");
    console.log(`Creating ${count} fake users and quiz sessions...`);

    const fakeUsers: FakeUser[] = [];

    // 1. Create fake users
    for (let i = 0; i < count; i++) {
      const walletAddress = generateSolanaAddress();

      const [user] = await db
        .insert(users)
        .values({
          walletAddress,
          // Add any other required user fields here
        })
        .returning({ id: users.id, walletAddress: users.walletAddress });

      fakeUsers.push(user);

      console.log(`Created user ${i + 1}/${count}: ${walletAddress}`);
    }

    console.log(`\nCreating quiz sessions for ${count} users...`);

    // 2. Create completed quiz sessions for each user
    for (let i = 0; i < fakeUsers.length; i++) {
      const user = fakeUsers[i];
      const completedAt = randomCompletedAt();
      const createdAt = new Date(
        completedAt.getTime() - randomInt(5, 30) * 60 * 1000,
      ); // 5-30 minutes before completion

      await db.insert(userQuizSessions).values({
        userId: user.id,
        stakeAmountLamports: randomStakeAmount(),
        stakeDurationSeconds: randomStakeDuration(),
        stakeSignature: generateStakeSignature(),
        stakeVerification: "success",
        score: randomScore(),
        completedAt,
        createdAt,
      });

      console.log(
        `Created session ${i + 1}/${count} for user ${user.walletAddress.slice(0, 8)}...`,
      );
    }

    console.log("\n✅ Successfully populated fake leaderboard data!");
    console.log(`Total users created: ${fakeUsers.length}`);
    console.log(`Total completed quiz sessions: ${fakeUsers.length}`);

    // Show some sample data
    console.log("\nSample entries:");
    fakeUsers.slice(0, 5).forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.walletAddress}`);
    });
  } catch (error) {
    console.error("Error populating fake leaderboard:", error);
    throw error;
  }
}

// Run the script
const userCount = parseInt(process.argv[2] || "50", 10);

populateFakeLeaderboard(userCount)
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
