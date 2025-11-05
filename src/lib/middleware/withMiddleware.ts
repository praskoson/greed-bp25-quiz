import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { logRequest, logResponse, logError } from "@/lib/logger";
// import * as Sentry from "@sentry/nextjs";

export interface RequestContext {
  requestId: string;
  startTime: number;
  ip: string;
  userAgent: string;
  walletAddress?: string;
}

type Handler = (
  request: NextRequest,
  context: RequestContext,
) => Promise<NextResponse>;

interface MiddlewareOptions {
  rateLimit?: Ratelimit;
  requireAuth?: boolean;
  logRequest?: boolean;
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return real || "unknown";
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Rate limiting middleware
 */
async function applyRateLimit(
  request: NextRequest,
  rateLimit: Ratelimit,
  identifier: string,
): Promise<NextResponse | null> {
  try {
    const { success, limit, reset } = await rateLimit.limit(identifier);

    if (!success) {
      logRequest("POST", request.nextUrl.pathname, {
        rateLimited: true,
        identifier,
        limit,
        reset,
      });

      return NextResponse.json(
        {
          error: "Too many requests",
          limit,
          reset,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    return null; // No rate limit hit
  } catch (error) {
    // Rate limit check failed - allow request but log error
    logError(error as Error, "rate-limit", { identifier });
    return null;
  }
}

/**
 * Main middleware wrapper
 */
export function withMiddleware(
  handler: Handler,
  options: MiddlewareOptions = {},
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Create request context
    const context: RequestContext = {
      requestId,
      startTime,
      ip,
      userAgent,
    };

    // Set Sentry context
    // Sentry.setContext("request", {
    //   id: requestId,
    //   ip,
    //   path,
    //   method,
    //   userAgent,
    // });

    try {
      // Log incoming request
      if (options.logRequest !== false) {
        logRequest(method, path, {
          requestId,
          ip,
          userAgent,
        });
      }

      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitIdentifier = ip; // Can be changed to use wallet address
        const rateLimitResponse = await applyRateLimit(
          request,
          options.rateLimit,
          rateLimitIdentifier,
        );

        if (rateLimitResponse) {
          const duration = Date.now() - startTime;
          logResponse(method, path, 429, duration, {
            requestId,
            rateLimited: true,
          });
          return rateLimitResponse;
        }
      }

      // Execute handler
      const response = await handler(request, context);

      // Log response
      const duration = Date.now() - startTime;
      logResponse(method, path, response.status, duration, {
        requestId,
      });

      // Add custom headers
      response.headers.set("X-Request-Id", requestId);
      response.headers.set("X-Response-Time", `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logError(error as Error, "api-handler", {
        requestId,
        path,
        method,
        duration,
      });

      // Send to Sentry
      // Sentry.captureException(error, {
      //   tags: {
      //     path,
      //     method,
      //     requestId,
      //   },
      // });

      // Return error response
      logResponse(method, path, 500, duration, {
        requestId,
        error: true,
      });

      return NextResponse.json(
        {
          error: "Internal server error",
          requestId, // Include for debugging
        },
        {
          status: 500,
          headers: {
            "X-Request-Id": requestId,
          },
        },
      );
    }
  };
}
