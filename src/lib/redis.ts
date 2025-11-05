import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/env";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limiters for different endpoints
export const rateLimiters = {
  // Authentication - stricter limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "15 m"), // 100 requests per 15 minutes
    prefix: "ratelimit:auth",
    analytics: true,
  }),

  // Validation checks - more generous
  validate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
    prefix: "ratelimit:validate",
    analytics: true,
  }),

  // General API calls
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    prefix: "ratelimit:api",
    analytics: true,
  }),

  // Strict IP-based limiter for suspicious activity
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
    prefix: "ratelimit:strict",
    analytics: true,
  }),
};
