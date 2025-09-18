# 🚀 TalkifyDocs Local Setup Guide

This guide will help you set up and run TalkifyDocs locally for development and testing.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd talkifydocs

# Install dependencies
npm install
```

## Step 2: Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/talkifydocs"

# Authentication (Kinde)
KINDE_CLIENT_ID="your_kinde_client_id"
KINDE_CLIENT_SECRET="your_kinde_client_secret"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard"

# OpenAI
OPENAI_API_KEY="sk-your_openai_api_key"

# Pinecone
PINECONE_API_KEY="your_pinecone_api_key"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# UploadThing (for file uploads)
UPLOADTHING_SECRET="sk_live_your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# Redis (Optional - will fallback to memory cache if not available)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Logging
LOG_LEVEL="debug"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
```

## Step 3: Database Setup

### Option A: Using PostgreSQL locally

1. **Install PostgreSQL** on your machine
2. **Create a database**:
   ```sql
   CREATE DATABASE talkifydocs;
   ```
3. **Update your `.env.local`** with your PostgreSQL credentials

### Option B: Using a cloud database (Recommended)

1. **Neon** (Free tier available): [neon.tech](https://neon.tech)
2. **Supabase** (Free tier available): [supabase.com](https://supabase.com)
3. **Railway** (Free tier available): [railway.app](https://railway.app)

## Step 4: Set up External Services

### 1. Kinde Authentication
1. Go to [kinde.com](https://kinde.com) and create an account
2. Create a new application
3. Get your Client ID, Client Secret, and Issuer URL
4. Add `http://localhost:3000` to allowed redirect URLs

### 2. OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add it to your `.env.local`

### 3. Pinecone Vector Database
1. Go to [pinecone.io](https://pinecone.io)
2. Create a free account
3. Create a new index
4. Get your API key

### 4. UploadThing (File Storage)
1. Go to [uploadthing.com](https://uploadthing.com)
2. Create an account
3. Create a new app
4. Get your secret and app ID

### 5. Stripe (Payments) - Optional for testing
1. Go to [stripe.com](https://stripe.com)
2. Create a test account
3. Get your test secret key

## Step 5: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

## Step 6: Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: Run Tests (Optional)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Step 8: Health Check

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to check if all services are properly configured.

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env.local`
   - Ensure PostgreSQL is running
   - Run `npx prisma db push` to create tables

2. **Authentication Issues**
   - Verify Kinde configuration
   - Check redirect URLs match exactly

3. **File Upload Issues**
   - Verify UploadThing configuration
   - Check file size limits (4MB max)

4. **OpenAI API Errors**
   - Verify API key is correct
   - Check if you have sufficient credits

5. **Pinecone Connection Issues**
   - Verify API key and environment
   - Check if index exists

### Redis Issues (Optional)
If you don't have Redis installed, the app will automatically fallback to in-memory caching. This is fine for development.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   └── auth-callback/  # Auth callback
├── components/         # React components
├── lib/               # Utility functions
├── trpc/              # tRPC configuration
└── types/             # TypeScript types
```

## Next Steps

1. **Upload a PDF** to test the file processing
2. **Chat with the PDF** to test the AI functionality
3. **Check the logs** in the terminal for any issues
4. **Visit the health endpoint** to verify all services

## Support

If you encounter any issues:
1. Check the terminal logs
2. Visit `/api/health` for service status
3. Check the browser console for client-side errors
4. Review the environment variables

Happy coding! 🎉
