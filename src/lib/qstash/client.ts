import "server-only";
import { Client } from "@upstash/qstash";
import { env } from "@/env";
import { VerifyStakeJobPayload } from "./types";

const qstashClient = new Client({
  token: env.QSTASH_TOKEN,
});

/**
 * Publish a stake verification job to QStash
 * The job will verify the transaction on-chain and update the database
 */
export async function publishStakeVerificationJob(
  payload: VerifyStakeJobPayload,
) {
  const verifyUrl = `${env.QSTASH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/stake/verify-job`;

  await qstashClient.publishJSON({
    url: verifyUrl,
    body: payload,
    retries: 3,
    delay: 1000,
    retryDelay: "pow(2, retried) * 1000",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
}

export { qstashClient };
