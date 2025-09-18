import { NextRequest, NextResponse } from "next/server";

// Security headers configuration
const securityHeaders = {
  // Prevent XSS attacks
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://api.stripe.com https://api.pinecone.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  
  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  
  // Permissions Policy
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),
  
  // HSTS (only in production)
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  }),
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// CORS configuration
export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" 
    ? "https://yourdomain.com" 
    : "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-ID",
  "Access-Control-Max-Age": "86400",
};

// Apply CORS headers
export function applyCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
}

// Validate file type
export function validateFileType(filename: string, allowedTypes: string[] = ["pdf"]): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Validate file size
export function validateFileSize(size: number, maxSize: number = 16 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if request is from allowed origin
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = process.env.NODE_ENV === "production"
    ? ["https://yourdomain.com"]
    : ["http://localhost:3000", "http://127.0.0.1:3000"];
    
  return allowedOrigins.includes(origin);
}
