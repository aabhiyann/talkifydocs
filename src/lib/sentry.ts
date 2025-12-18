import * as Sentry from "@sentry/nextjs";

// Note: Sentry is initialized via sentry.client.config.ts and sentry.server.config.ts
// so we don't need manual initialization here.

export function captureException(error: Error, context?: Record<string, any>) {
  console.error(error);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context?.component || "unknown",
      },
    });
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>,
) {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
}

export function setUserContext(userId: string, email?: string, username?: string) {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
}

export function clearUserContext() {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
}
