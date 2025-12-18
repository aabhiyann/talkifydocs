import { NextRequest } from "next/server";
import { loggers } from "./logger";
import { db } from "@/lib/db";

// Rate limiting configuration
const RATE_LIMITS = {
  API: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  UPLOAD: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  MESSAGE: { requests: 50, windowMs: 60 * 1000 }, // 50 messages per minute
};

// File validation
export function validateFileType(file: File): boolean {
  const allowedTypes = ["application/pdf"];
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 4): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export function validateFileName(fileName: string): boolean {
  // Check for malicious file names
  const dangerousPatterns = [
    /\.\./, // Path traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(fileName));
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace invalid characters
    .substring(0, 255); // Limit length
}

// Rate limiting using Prisma-backed RateLimit model
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const limit = RATE_LIMITS[limitType];
  const now = new Date();
  const windowStart = new Date(now.getTime() - limit.windowMs);

  const existing = await db.rateLimit.findFirst({
    where: {
      identifier,
      operation: limitType,
      windowStart: {
        gte: windowStart,
      },
    },
    orderBy: {
      windowStart: "desc",
    },
  });

  // No record in current window → create one
  if (!existing) {
    await db.rateLimit.create({
      data: {
        identifier,
        operation: limitType,
        count: 1,
        windowStart: now,
      },
    });

    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetTime: now.getTime() + limit.windowMs,
    };
  }

  if (existing.count >= limit.requests) {
    loggers.api.warn({
      operation: "rate_limit_exceeded",
      identifier,
      limitType,
      count: existing.count,
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.windowStart.getTime() + limit.windowMs,
    };
  }

  const updated = await db.rateLimit.update({
    where: { id: existing.id },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: limit.requests - updated.count,
    resetTime: updated.windowStart.getTime() + limit.windowMs,
  };
}

// Request validation
export function validateRequest(req: NextRequest): {
  valid: boolean;
  error?: string;
} {
  // Check for required headers
  const userAgent = req.headers.get("user-agent");
  if (!userAgent || userAgent.length < 10) {
    return {
      valid: false,
      error: "Invalid user agent",
    };
  }

  // Check content type for POST requests
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        valid: false,
        error: "Invalid content type",
      };
    }
  }

  // Check request size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return {
      valid: false,
      error: "Request too large",
    };
  }

  return { valid: true };
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  };
}

// IP validation
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// Note: Cleanup of old RateLimit rows can be handled via a scheduled job/cron.
