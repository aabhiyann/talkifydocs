import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  createErrorResponse,
} from "../errors";

describe("Error Classes", () => {
  // Helper: assert that a value is a real ISO 8601 string. We use this in
  // both error response tests to replace the previous `.toBeDefined()`
  // check, which would have happily accepted `undefined` after a JSON
  // round-trip or any nonsense string.
  const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

  describe("AppError", () => {
    it("should create error with correct properties and inherit from Error", () => {
      const error = new AppError("Test error", "TEST_ERROR", 400);

      // instanceof checks lock in the inheritance graph — if anyone changes
      // AppError to not extend Error, every consumer's `catch (e: unknown)`
      // narrowing breaks silently. Catch it here.
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("ValidationError", () => {
    it("should create validation error with field and inherit from AppError", () => {
      const error = new ValidationError("Invalid input", "email");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);

      expect(error.message).toBe("email: Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
    });

    it("should create validation error without field", () => {
      const error = new ValidationError("Invalid input");

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("AuthenticationError", () => {
    it("should create authentication error with default message and inherit from AppError", () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(AuthenticationError);

      expect(error.message).toBe("Authentication required");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
    });

    it("should create authentication error with custom message", () => {
      const error = new AuthenticationError("Custom auth error");

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe("Custom auth error");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error with default resource and inherit from AppError", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);

      expect(error.message).toBe("Resource not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("should create not found error with custom resource", () => {
      const error = new NotFoundError("User");

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("User not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("createErrorResponse", () => {
    it("should create error response from AppError with a real ISO timestamp", () => {
      const before = Date.now();
      const error = new AppError("Test error", "TEST_ERROR", 400);
      const response = createErrorResponse(error, "/test");
      const after = Date.now();

      expect(response.error).toBe("TEST_ERROR");
      expect(response.code).toBe("TEST_ERROR");
      expect(response.message).toBe("Test error");
      expect(response.path).toBe("/test");

      // Timestamp must be a real ISO 8601 string AND it must reflect "now".
      expect(typeof response.timestamp).toBe("string");
      expect(response.timestamp).toMatch(ISO_8601);
      const ts = new Date(response.timestamp).getTime();
      expect(Number.isNaN(ts)).toBe(false);
      expect(ts).toBeGreaterThanOrEqual(before - 1000);
      expect(ts).toBeLessThanOrEqual(after + 1000);
    });

    it("should create error response from regular Error and treat it as INTERNAL", () => {
      const error = new Error("Regular error");

      // The factory branches on `instanceof AppError`, so a plain Error must
      // be classified as INTERNAL. Sanity-check the precondition explicitly
      // so a future regression that makes Error inherit from AppError fails
      // this test loudly.
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(AppError);

      const response = createErrorResponse(error);

      expect(response.error).toBe("INTERNAL_ERROR");
      expect(response.code).toBe("INTERNAL_ERROR");
      expect(response.message).toBe("Regular error");
      expect(response.timestamp).toMatch(ISO_8601);
    });
  });
});
