import { z } from "zod";
import { ValidationError } from "./errors";

// Common validation schemas
export const fileIdSchema = z.string().cuid("Invalid file ID format");
export const userIdSchema = z.string().cuid("Invalid user ID format");
export const messageSchema = z.string().min(1, "Message cannot be empty").max(1000, "Message too long");
export const emailSchema = z.string().email("Invalid email format");

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required").max(255, "File name too long"),
  size: z.number().min(1, "File size must be greater than 0").max(16 * 1024 * 1024, "File too large (max 16MB)"),
  type: z.string().regex(/^application\/pdf$/, "Only PDF files are allowed"),
});

// Message validation
export const sendMessageSchema = z.object({
  fileId: fileIdSchema,
  message: messageSchema,
});

// User validation
export const userSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
});

// Stripe webhook validation
export const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string(),
  limit: z.number().min(1),
  windowMs: z.number().min(1000),
});

// Validation middleware factory
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError?.message || "Validation failed",
          firstError?.path?.[0]?.toString()
        );
      }
      throw error;
    }
  };
}

// Common validators
export const validateFileId = createValidationMiddleware(fileIdSchema);
export const validateUserId = createValidationMiddleware(userIdSchema);
export const validateMessage = createValidationMiddleware(messageSchema);
export const validateEmail = createValidationMiddleware(emailSchema);
export const validateSendMessage = createValidationMiddleware(sendMessageSchema);
export const validateUser = createValidationMiddleware(userSchema);
export const validateFileUpload = createValidationMiddleware(fileUploadSchema);
export const validateStripeWebhook = createValidationMiddleware(stripeWebhookSchema);
