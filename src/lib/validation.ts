import { z } from "zod";
import { loggers } from "./logger";

// Common validation schemas
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z
    .number()
    .min(1)
    .max(4 * 1024 * 1024), // 4MB max
  type: z.string().refine((type) => type === "application/pdf", {
    message: "Only PDF files are allowed",
  }),
});

export const messageSchema = z.object({
  message: z
    .string()
    .min(1)
    .max(1000)
    .refine(
      (msg) => {
        // Check for potentially malicious content
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /expression\s*\(/i,
        ];

        return !dangerousPatterns.some((pattern) => pattern.test(msg));
      },
      {
        message: "Message contains potentially dangerous content",
      },
    ),
  fileId: z.string().uuid(),
});

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        loggers.api.warn({
          operation: "validation_failed",
          errors: error.errors,
          data: typeof data === "object" ? data : { value: data },
        });
        return { success: false, error: errorMessage };
      }

      loggers.api.error({
        operation: "validation_error",
        error: error instanceof Error ? error.message : "Unknown validation error",
      });
      return { success: false, error: "Validation failed" };
    }
  };
}

// File validation helpers
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const validation = validateRequest(fileUploadSchema)({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.success) {
    return { valid: false, error: validation.error };
  }

  // Additional file name validation
  if (file.name.length > 255) {
    return { valid: false, error: "File name too long" };
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"];
  const hasSuspiciousExtension = suspiciousExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  if (hasSuspiciousExtension) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
}

// Input sanitization
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, maxLength);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace invalid characters with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password strength validation (for future use)
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("Password should be at least 8 characters long");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Password should contain lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Password should contain uppercase letters");

  if (/\d/.test(password)) score++;
  else feedback.push("Password should contain numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Password should contain special characters");

  return {
    valid: score >= 4,
    score,
    feedback,
  };
}
