import "server-only";
import { Client } from "@upstash/qstash";
import { env } from "@/env";
import {
  DlqMessageBodySchema,
  VerifyStakeJobPayload,
  VerifySecondaryStakeJobPayload,
} from "./types";

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
  console.log("publishStakeVerificationJob", payload);
  const verifyUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/api/stake/verify-job`;

  await qstashClient.publishJSON({
    url: verifyUrl,
    body: payload,
    retries: 3,
    delay: 1,
    retryDelay: "pow(2, retried) * 1000",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
}

export async function publishSecondaryStakeVerificationJob(
  payload: VerifySecondaryStakeJobPayload,
) {
  console.log("publishSecondaryStakeVerificationJob", payload);
  const verifyUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/api/stake/secondary/verify-job`;

  await qstashClient.publishJSON({
    url: verifyUrl,
    body: payload,
    retries: 5,
    delay: 1,
    retryDelay: "pow(2, retried) * 1000",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
}

export async function getDlqMessages() {
  const result = await qstashClient.dlq.listMessages({ count: 50 });

  // Filter and transform messages with valid body schema
  const validMessages = result.messages
    .map((message) => {
      if (!message.body) return null;

      try {
        const parsedBody = JSON.parse(message.body);
        const validatedBody = DlqMessageBodySchema.parse(parsedBody);

        return {
          ...message,
          body: validatedBody,
        };
      } catch {
        // Skip messages that don't match the schema or can't be parsed
        return null;
      }
    })
    .filter(
      (message): message is NonNullable<typeof message> => message !== null,
    );

  return validMessages;
}

export { qstashClient };
