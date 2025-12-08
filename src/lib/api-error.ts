import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Create a sanitized error response.
 * In production, returns a generic message. In development, includes the actual error.
 */
export function errorResponse(
  fallbackMessage: string,
  error: unknown,
  status: number = 500,
): NextResponse {
  const message = isProduction
    ? fallbackMessage
    : error instanceof Error
      ? error.message
      : fallbackMessage;

  return NextResponse.json({ error: message }, { status });
}
