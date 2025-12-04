import { drizzle } from "drizzle-orm/neon-http";
import { neon, Pool } from "@neondatabase/serverless";
import {
  drizzle as drizzleServerless,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
import * as schema_bp25 from "./schema/bp25";
import * as schema_admin from "./schema/auth-schema";
import { env } from "@/env";

const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});

const schema = { ...schema_bp25, ...schema_admin };

/**
 * This uses the neon DB over http/fetch, should be used for one-shot queries or non-interactive transactions.
 */
export const db = drizzle(sql, {
  schema,
  casing: "snake_case",
});

/**
 * This export uses the neon DB over websockets. Should be used if PG transactions are required
 */
export const dbServerless = drizzleServerless({
  client: new Pool({ connectionString: process.env.DATABASE_URL }),
  schema: schema,
  casing: "snake_case",
});

export type DbTransaction = Parameters<
  Parameters<NeonDatabase<typeof schema>["transaction"]>[0]
>[0];
