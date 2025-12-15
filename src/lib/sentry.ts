import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    enabled: true,
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }
      }
      return event;
    },
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: require("@prisma/client").PrismaClient }),
    ],
  });
}

export function captureException(error: Error, context?: Record<string, any>) {
  console.error(error);
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context?.component || "unknown",
      },
    });
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, any>) {
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

