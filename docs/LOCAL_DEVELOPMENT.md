# Local Development Guide

This guide will help you set up and run TalkifyDocs on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** 14+ or a cloud database (Neon, Supabase, etc.)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd talkifydocs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If you have an example file
# Or create it manually
```

### 4. Configure Environment Variables

Add the following to your `.env.local`:

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/talkifydocs"

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# OpenAI (Required)
OPENAI_API_KEY="sk-..."

# Pinecone (Required)
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="gcp-starter"
PINECONE_INDEX="your-index-name"

# Stripe (Required for billing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Vercel Blob Storage (Required for file uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# App URL (Required)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Redis (for caching)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Optional: Sentry (for error tracking)
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID="G-..."

# Node Environment
NODE_ENV="development"
```

### 5. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb talkifydocs

# Or using psql
psql -U postgres
CREATE DATABASE talkifydocs;
\q
```

#### Option B: Cloud Database (Recommended for beginners)

1. Sign up for [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### 6. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 7. Set Up Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Copy your API keys to `.env.local`
4. Configure webhook (for production):
   - URL: `http://localhost:3000/api/webhooks/clerk` (use ngrok for local testing)
   - Events: `user.created`, `user.updated`, `user.deleted`

### 8. Set Up OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `OPENAI_API_KEY` in `.env.local`

### 9. Set Up Pinecone

1. Go to [pinecone.io](https://pinecone.io) and sign up
2. Create an index:
   - Name: `talkifydocs` (or your preferred name)
   - Dimensions: `1536` (for OpenAI text-embedding-3-small)
   - Metric: `cosine`
3. Copy API key and environment to `.env.local`

### 10. Set Up Vercel Blob Storage

1. Go to [vercel.com](https://vercel.com) and sign up
2. Create a new project or use existing
3. Go to Storage → Blob → Create
4. Copy the read/write token to `BLOB_READ_WRITE_TOKEN`

### 11. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Verifying the Setup

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": { "status": "up", "latency": 15 },
    "pinecone": { "status": "up", "latency": 120 },
    "cache": { "status": "up" }
  }
}
```

### 2. Run Smoke Tests

```bash
npm run test:smoke
# Or
./scripts/smoke-tests.sh http://localhost:3000
```

### 3. Test the Application

1. **Homepage**: Visit `http://localhost:3000`
2. **Sign Up**: Click "Get Started" and create an account
3. **Dashboard**: After signing in, you should see the dashboard
4. **Upload PDF**: Try uploading a PDF file
5. **Chat**: Once uploaded, try chatting with the document

## Common Issues and Solutions

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:

- Verify PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- For cloud databases, check firewall rules

### Clerk Authentication Not Working

**Error**: `Clerk: Missing publishable key`

**Solution**:

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Restart the dev server after adding env vars
- Check Clerk dashboard for correct keys

### Pinecone Connection Error

**Error**: `Pinecone API error`

**Solution**:

- Verify `PINECONE_API_KEY` and `PINECONE_INDEX` are correct
- Check Pinecone dashboard to ensure index exists
- Verify index dimensions match (1536 for OpenAI embeddings)

### File Upload Fails

**Error**: `Blob storage error`

**Solution**:

- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob storage is active
- Verify token has read/write permissions

### Build Errors

**Error**: TypeScript or build errors

**Solution**:

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm format
```

### Checking Environment Variables

```bash
npm run check:env
```

## Optional: Setting Up Webhooks Locally

For testing webhooks locally, use [ngrok](https://ngrok.com):

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Start your dev server
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Use the ngrok URL for webhook endpoints:
# https://xxxxx.ngrok.io/api/webhooks/clerk
# https://xxxxx.ngrok.io/api/webhooks/stripe
```

## Project Structure

```
talkifydocs/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # Utility scripts
├── public/               # Static assets
└── .env.local           # Environment variables (not in git)
```

## Next Steps

1. ✅ Set up all required services
2. ✅ Run the development server
3. ✅ Test basic functionality
4. ✅ Read the [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) for architecture details
5. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Getting Help

- Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for service-specific setup
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production considerations
- Check application logs in the terminal
- Use `npm run check:env` to verify environment variables

## Tips for Local Development

1. **Use a cloud database**: Easier than setting up PostgreSQL locally
2. **Skip optional services**: Redis, Sentry, and GA are optional for local dev
3. **Use Clerk test mode**: Free tier is sufficient for development
4. **Monitor console**: Check browser and terminal for errors
5. **Use Prisma Studio**: Great for viewing database data: `npm run db:studio`

Happy coding! 🚀
