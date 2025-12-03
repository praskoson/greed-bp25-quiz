import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    LOG_LEVEL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z
      .string()
      .optional()
      .default(
        "AaVTASQgZWMyYmU1ZjUtZGU3Ni00ZTM0LThmNjItYjFjN2EzNDcwZmIyMWU5NjE2MmE2ZGFiNDgxOGJhMjY2NzEyYmVhZTgwYTQ=",
      ),
    QSTASH_URL: z.url(),
    QSTASH_TOKEN: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),
    BETTER_AUTH_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_RPC_URL: z.url(),
    NEXT_PUBLIC_ENABLE_LOCKUP: z.stringbool(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.REDIS_REST_TOKEN,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_ENABLE_LOCKUP: process.env.NEXT_PUBLIC_ENABLE_LOCKUP,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  },
});
