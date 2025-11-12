import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/lib/db/schema.ts",
  casing: "snake_case",
  out: "./migrations",
  schemaFilter: ["public", "bp25", "drizzle"],
});
