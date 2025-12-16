import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  createErrorResponse,
} from "../errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create error with correct properties", () => {
      const error = new AppError("Test error", "TEST_ERROR", 400);

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("ValidationError", () => {
    it("should create validation error with field", () => {
      const error = new ValidationError("Invalid input", "email");

      expect(error.message).toBe("email: Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
    });

    it("should create validation error without field", () => {
      const error = new ValidationError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("AuthenticationError", () => {
    it("should create authentication error with default message", () => {
      const error = new AuthenticationError();

      expect(error.message).toBe("Authentication required");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
    });

    it("should create authentication error with custom message", () => {
      const error = new AuthenticationError("Custom auth error");

      expect(error.message).toBe("Custom auth error");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error with default resource", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Resource not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("should create not found error with custom resource", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("createErrorResponse", () => {
    it("should create error response from AppError", () => {
      const error = new AppError("Test error", "TEST_ERROR", 400);
      const response = createErrorResponse(error, "/test");

      expect(response.error).toBe("TEST_ERROR");
      expect(response.code).toBe("TEST_ERROR");
      expect(response.message).toBe("Test error");
      expect(response.path).toBe("/test");
      expect(response.timestamp).toBeDefined();
    });

    it("should create error response from regular Error", () => {
      const error = new Error("Regular error");
      const response = createErrorResponse(error);

      expect(response.error).toBe("INTERNAL_ERROR");
      expect(response.code).toBe("INTERNAL_ERROR");
      expect(response.message).toBe("Regular error");
      expect(response.timestamp).toBeDefined();
    });
  });
});
