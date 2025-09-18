import { NextRequest } from "next/server";
import { RateLimitError } from "./errors";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis)
const store: RateLimitStore = {};

// Clean up expired entries
const cleanup = () => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
};

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => {
      // Default: use IP address
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown";
      return ip;
    }
  } = config;

  return (req: NextRequest): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    // Get or create entry
    if (!store[key]) {
      store[key] = { count: 0, resetTime };
    }

    const entry = store[key];

    // Reset if window has expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = resetTime;
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`
      );
    }

    // Increment counter
    entry.count++;
  };
}

// Predefined rate limiters
export const messageRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 messages per minute
  keyGenerator: (req) => {
    // Use user ID if available, otherwise IP
    const userId = req.headers.get("x-user-id");
    return userId || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  }
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 uploads per minute
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 API calls per minute
});
