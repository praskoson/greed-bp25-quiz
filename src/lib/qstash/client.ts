import "server-only";
import { Client } from "@upstash/qstash";
import { env } from "@/env";

const qstashClient = new Client({
  // Add your token to a .env file
  token: env.QSTASH_TOKEN,
});

export async function startStakeVerificationJob({
  signature,
  wallet,
  amountSol,
  durationDays,
}: {
  signature: string;
  wallet: string;
  amountSol: number;
  durationDays: number;
}) {
  await qstashClient.publishJSON({
    url: "https://firstqstashmessage.requestcatcher.com/test",
    body: {
      signature,
      wallet,
      amountSol,
      durationDays,
    },
  });
}
