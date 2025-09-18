import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid database URL"),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  
  // Pinecone
  PINECONE_API_KEY: z.string().min(1, "Pinecone API key is required"),
  
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
  KINDE_POST_LOGOUT_REDIRECT_URL: z.string().url("Invalid post logout redirect URL"),
  KINDE_POST_LOGIN_REDIRECT_URL: z.string().url("Invalid post login redirect URL"),
  
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  VERCEL_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
