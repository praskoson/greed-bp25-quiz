import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { env } from "@/env";

const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    cache: "no-store",
  },
});
export const db = drizzle(sql, { schema, casing: "snake_case" });
