import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema_bp25 from "./schema/bp25";
import { env } from "@/env";

const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});
export const db = drizzle(sql, { schema: schema_bp25, casing: "snake_case" });
