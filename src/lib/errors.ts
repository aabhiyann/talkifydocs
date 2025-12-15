export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(
      field ? `${field}: ${message}` : message,
      "VALIDATION_ERROR",
      400
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 429);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service}: ${message}`, "EXTERNAL_SERVICE_ERROR", 502);
  }
}

// Error response interface
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// Create standardized error response
export function createErrorResponse(
  error: Error | AppError,
  path?: string
): ErrorResponse {
  const isAppError = error instanceof AppError;
  
  return {
    error: isAppError ? error.code : "INTERNAL_ERROR",
    code: isAppError ? error.code : "INTERNAL_ERROR",
    message: error.message,
    details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    path,
  };
}

// Handle different error types
export function handleError(error: unknown): ErrorResponse {
  // Capture error in Sentry for production
  if (process.env.NODE_ENV === "production") {
    try {
      const { captureException } = require("./sentry");
      if (error instanceof Error) {
        captureException(error);
      } else {
        captureException(new Error(String(error)));
      }
    } catch (sentryError) {
      // Sentry not available, continue without it
      console.error("Failed to capture error in Sentry:", sentryError);
    }
  }

  if (error instanceof AppError) {
    return createErrorResponse(error);
  }
  
  if (error instanceof Error) {
    return createErrorResponse(error);
  }
  
  return createErrorResponse(
    new AppError("An unknown error occurred", "UNKNOWN_ERROR")
  );
}
