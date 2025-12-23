#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking your environment setup...\n");

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), ".env.local");
const envPath = path.join(process.cwd(), ".env");

let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/"/g, "");
    }
  });
}

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/"/g, ""); // Overwrite with local
    }
  });
} else {
  console.log("⚠️  .env.local file not found (using .env if available)");
}

// Check required variables
const requiredVars = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "PINECONE_API_KEY",
  "PINECONE_ENVIRONMENT",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

let allGood = true;

console.log("📋 Environment Variables Status:");
console.log("================================");

requiredVars.forEach((varName) => {
  const value = envVars[varName];
  if (!value || value.includes("your-") || value.includes("[YOUR-")) {
    console.log(`❌ ${varName}: Not set or using placeholder`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log("\n" + "=".repeat(40));

if (allGood) {
  console.log("🎉 All environment variables are set!");
  console.log("   You can now run: npm run dev");
} else {
  console.log("⚠️  Some environment variables need to be set");
  console.log("   Follow the FREE_SETUP_GUIDE.md to get your API keys");
}

console.log("\n💡 Quick links:");
console.log("   OpenAI: https://platform.openai.com/api-keys");
console.log("   Pinecone: https://app.pinecone.io/");
console.log("   UploadThing: https://uploadthing.com/");
console.log("   Clerk: https://clerk.com/");
console.log("   Stripe: https://dashboard.stripe.com/");
console.log("   Supabase: https://supabase.com/");
