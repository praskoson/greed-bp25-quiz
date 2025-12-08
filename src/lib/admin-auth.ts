import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";
import { redis } from "@/lib/redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {},
  user: {
    modelName: "admin_user",
  },
  session: {
    modelName: "admin_session",
  },
  account: {
    modelName: "admin_account",
  },
  verification: {
    modelName: "admin_verification",
  },
  basePath: "/admin/api/auth",
  plugins: [nextCookies()],
  rateLimit: {
    window: 10,
    max: 100,
  },
});
