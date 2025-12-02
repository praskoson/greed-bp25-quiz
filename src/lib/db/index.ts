import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema_bp25 from "./schema/bp25";
import * as schema_admin from "./schema/auth-schema";
import { env } from "@/env";

const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});
export const db = drizzle(sql, {
  schema: { ...schema_bp25, ...schema_admin },
  casing: "snake_case",
});
