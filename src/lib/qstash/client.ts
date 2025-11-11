import "server-only";
import { Client } from "@upstash/qstash";
import { env } from "@/env";

const qstashClient = new Client({
  // Add your token to a .env file
  token: env.QSTASH_TOKEN,
});
