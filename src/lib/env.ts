import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),

  // Groq
  GROQ_API_KEY: z.string().optional(),

  // Pinecone
  PINECONE_API_KEY: z.string().min(1, "Pinecone API key is required"),
  PINECONE_ENVIRONMENT: z.string().min(1, "Pinecone environment is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),

  // UploadThing
  UPLOADTHING_SECRET: z.string().min(1, "UploadThing secret is required"),
  UPLOADTHING_APP_ID: z.string().min(1, "UploadThing app ID is required"),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z
    .string()
    .min(1, "BLOB_READ_WRITE_TOKEN is required for Vercel Blob uploads"),

  // Clerk Auth
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "Clerk webhook secret is required for user sync"),

  // Clerk public configuration
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),

  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),

  // Google Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Pinecone Index Name
  PINECONE_INDEX: z.string().optional(),
});

// Only validate environment variables at runtime, not during build
let env: any;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  // During build time or when env vars are missing, use defaults
  env = {
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/talkifydocs",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    PINECONE_API_KEY: process.env.PINECONE_API_KEY || "",
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || "gcp-starter",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET || "",
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID || "",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
    VERCEL_URL: process.env.VERCEL_URL,
  };
}

export { env };
export type Env = z.infer<typeof envSchema>;
