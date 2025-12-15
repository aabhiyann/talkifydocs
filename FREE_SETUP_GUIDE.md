# 🆓 FREE Setup Guide for TalkifyDocs

This guide will help you set up all required services for **FREE** to get your PDF chat application running.

## 📋 Prerequisites
- GitHub account (free)
- Email address
- Credit card (for verification only, no charges)

---

## 🔑 Step 1: OpenAI API Key (FREE)

### Get $5 FREE credit (enough for testing)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up with your email
3. Add a credit card for verification (you get $5 free credit)
4. Go to [API Keys](https://platform.openai.com/api-keys)
5. Click "Create new secret key"
6. Copy the key (starts with `sk-`)

**Cost**: $5 free credit (lasts for weeks of testing)

---

## 🌲 Step 2: Pinecone (FREE)

### Get free vector database
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign up with your email
3. Create a new project
4. Choose "Starter" plan (FREE)
5. Create an index named `talkifydocs`
6. Go to "API Keys" section
7. Copy your API key and environment

**Cost**: FREE (100,000 vectors)

---

## 📁 Step 3: UploadThing (FREE)

### Get free file storage
1. Go to [UploadThing](https://uploadthing.com/)
2. Sign up with GitHub
3. Create a new app
4. Go to "API Keys" section
5. Copy your "Secret Key" and "App ID"

**Cost**: FREE (1GB storage, 1,000 uploads/month)

---

## 🔐 Step 4: Clerk Auth (FREE)

### Get free authentication
1. Go to [Clerk](https://clerk.com/)
2. Sign up with your email or GitHub
3. Create a new application
4. Go to your project's API keys/settings
5. Copy your:
   - Publishable key
   - Secret key
   - (Optional) Webhook secret for production

**Cost**: FREE (generous starter tier)

---

## 💳 Step 5: Stripe (FREE)

### Get free payment processing
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up with your email
3. Complete account verification
4. Go to "Developers" → "API Keys"
5. Copy your "Secret key" (starts with `sk_test_`)
6. Go to "Developers" → "Webhooks"
7. Create a webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
8. Copy the webhook secret (starts with `whsec_`)

**Cost**: FREE (test mode, no real charges)

---

## 🗄️ Step 6: Database (FREE)

### Option A: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com/)
2. Sign up with GitHub
3. Create a new project
4. Go to "Settings" → "Database"
5. Copy your "Connection string"
6. Replace `[YOUR-PASSWORD]` with your database password

### Option B: Railway (Alternative)
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Create a new PostgreSQL database
4. Copy the connection string

**Cost**: FREE (500MB storage)

---

## ⚙️ Step 7: Create Environment File

Create a file named `.env.local` in your project root:

```bash
# Database (Replace with your Supabase/Railway URL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# OpenAI (Your API key from Step 1)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Pinecone (Your keys from Step 2)
PINECONE_API_KEY="your-pinecone-api-key-here"
PINECONE_ENVIRONMENT="gcp-starter"

# UploadThing (Your keys from Step 3)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret-here"
UPLOADTHING_APP_ID="your-uploadthing-app-id-here"

# Clerk Auth (Your keys from Step 4)
CLERK_SECRET_KEY="sk_test_your-clerk-secret-key-here"
CLERK_WEBHOOK_SECRET="whsec_your-clerk-webhook-secret-here"

# Vercel Blob (for thumbnails)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-read-write-token"

# Stripe (Your keys from Step 5)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key-here"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret-here"

# App
NODE_ENV="development"
PORT="3000"
```

---

## 🚀 Step 7: Setup Database Schema

Run these commands to set up your database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed database
npx prisma db seed
```

---

## 🎯 Step 9: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try uploading a PDF file

4. Check the debug info in the bottom-right corner

---

## 💰 Total Cost: $0

- **OpenAI**: $5 free credit (no charges)
- **Pinecone**: FREE
- **UploadThing**: FREE
- **Clerk**: FREE (starter)
- **Stripe**: FREE (test mode)
- **Database**: FREE

**Total**: $0 for development and testing!

---

## 🔧 Troubleshooting

### If PDF processing still fails:
1. Check your server logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure your OpenAI API key has credits
4. Ensure your Pinecone index is created and accessible

### Common Issues:
- **"OpenAI API error"**: Check your API key and credits
- **"Pinecone error"**: Verify your API key and environment
- **"UploadThing error"**: Check your secret and app ID
- **"Database error"**: Verify your connection string

---

## 📞 Need Help?

If you get stuck on any step, just let me know and I'll help you troubleshoot!
