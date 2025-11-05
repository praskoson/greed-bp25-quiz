import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isProduction
    ? {
        // Production: JSON logs
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      }
    : {
        // Development: Pretty logs
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss",
          },
        },
      }),
});

export function createLogger(context: string) {
  return logger.child({ context });
}

export function logRequest(
  method: string,
  path: string,
  metadata?: Record<string, any>,
) {
  logger.info({
    type: "request",
    method,
    path,
    ...metadata,
  });
}

export function logResponse(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  metadata?: Record<string, any>,
) {
  logger.info({
    type: "response",
    method,
    path,
    statusCode,
    duration,
    ...metadata,
  });
}

export function logError(
  error: Error,
  context: string,
  metadata?: Record<string, any>,
) {
  logger.error({
    type: "error",
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...metadata,
  });
}
