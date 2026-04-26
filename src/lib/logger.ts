// Simple logger implementation to avoid worker thread issues
const isDevelopment = process.env.NODE_ENV === "development";

type LogArg = unknown;

interface LogLevel {
  debug: (...args: LogArg[]) => void;
  info: (...args: LogArg[]) => void;
  warn: (...args: LogArg[]) => void;
  error: (...args: LogArg[]) => void;
}

const createLogger = (service: string = "app"): LogLevel => ({
  debug: (...args: LogArg[]) => {
    if (isDevelopment) {
      console.log(`[${service}]`, ...args);
    }
  },
  info: (...args: LogArg[]) => {
    console.log(`[${service}]`, ...args);
  },
  warn: (...args: LogArg[]) => {
    console.warn(`[${service}]`, ...args);
  },
  error: (...args: LogArg[]) => {
    console.error(`[${service}]`, ...args);
  },
});

export const logger = createLogger();

// Structured logging helpers
export const loggers = {
  api: createLogger("api"),
  auth: createLogger("auth"),
  db: createLogger("database"),
  upload: createLogger("upload"),
  chat: createLogger("chat"),
  stripe: createLogger("stripe"),
};

// Performance logging
export function logPerformance(
  operation: string,
  startTime: number,
  metadata?: Record<string, unknown>,
) {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    operation,
    duration,
    ...metadata,
  });
}

// Error logging with context
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error("Error occurred", {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
}

// Request logging middleware. Typed loosely as we accept Node http req/res
// or NextRequest/NextResponse without forcing a hard dependency here.
type LogRequestLike = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  connection?: { remoteAddress?: string };
};

type LogResponseLike = {
  statusCode: number;
  on: (event: "finish", cb: () => void) => void;
};

export function logRequest(
  req: LogRequestLike,
  res?: LogResponseLike,
  next?: () => void,
) {
  const startTime = Date.now();

  logger.info("Request started", {
    method: req.method,
    url: req.url,
    userAgent: req.headers["user-agent"],
    ip: req.ip || req.connection?.remoteAddress,
  });

  if (res && next) {
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info("Request completed", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
    });
  }

  if (next) next();
}
