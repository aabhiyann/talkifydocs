import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),

  // Pinecone
  PINECONE_API_KEY: z.string().min(1, "Pinecone API key is required"),
  PINECONE_ENVIRONMENT: z.string().min(1, "Pinecone environment is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),

  // UploadThing
  UPLOADTHING_SECRET: z.string().min(1, "UploadThing secret is required"),
  UPLOADTHING_APP_ID: z.string().min(1, "UploadThing app ID is required"),

  // Kinde Auth
  KINDE_CLIENT_ID: z.string().min(1, "Kinde client ID is required"),
  KINDE_CLIENT_SECRET: z.string().min(1, "Kinde client secret is required"),
  KINDE_ISSUER_URL: z.string().url("Invalid Kinde issuer URL"),
  KINDE_SITE_URL: z.string().url("Invalid Kinde site URL"),
  KINDE_POST_LOGOUT_REDIRECT_URL: z
    .string()
    .url("Invalid post logout redirect URL"),
  KINDE_POST_LOGIN_REDIRECT_URL: z
    .string()
    .url("Invalid post login redirect URL"),

  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  VERCEL_URL: z.string().optional(),
});

// Only validate environment variables at runtime, not during build
let env: any;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  // During build time or when env vars are missing, use defaults
  env = {
    DATABASE_URL:
      process.env.DATABASE_URL || "postgresql://localhost:5432/talkifydocs",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    PINECONE_API_KEY: process.env.PINECONE_API_KEY || "",
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || "gcp-starter",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET || "",
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID || "",
    KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID || "",
    KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET || "",
    KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL || "https://localhost:3000",
    KINDE_SITE_URL: process.env.KINDE_SITE_URL || "https://localhost:3000",
    KINDE_POST_LOGOUT_REDIRECT_URL:
      process.env.KINDE_POST_LOGOUT_REDIRECT_URL || "https://localhost:3000",
    KINDE_POST_LOGIN_REDIRECT_URL:
      process.env.KINDE_POST_LOGIN_REDIRECT_URL || "https://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
    VERCEL_URL: process.env.VERCEL_URL,
  };
}

export { env };
export type Env = z.infer<typeof envSchema>;
