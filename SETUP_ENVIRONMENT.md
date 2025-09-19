# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/talkifydocs"

# OpenAI (Required for PDF processing)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Pinecone (Required for vector storage)
PINECONE_API_KEY="your-pinecone-api-key-here"
PINECONE_ENVIRONMENT="gcp-starter"

# Stripe (Required for payments)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key-here"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret-here"

# UploadThing (Required for file uploads)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret-here"
UPLOADTHING_APP_ID="your-uploadthing-app-id-here"

# Kinde Auth (Required for authentication)
KINDE_CLIENT_ID="your-kinde-client-id-here"
KINDE_CLIENT_SECRET="your-kinde-client-secret-here"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000"

# App
NODE_ENV="development"
PORT="3000"
```

## How to Get These Keys

### 1. OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/)
- Create an account and get your API key
- Add it to `OPENAI_API_KEY`

### 2. Pinecone
- Go to [Pinecone Console](https://app.pinecone.io/)
- Create a new project
- Get your API key and environment
- Add them to `PINECONE_API_KEY` and `PINECONE_ENVIRONMENT`

### 3. UploadThing
- Go to [UploadThing](https://uploadthing.com/)
- Create a new app
- Get your secret and app ID
- Add them to `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

### 4. Kinde Auth
- Go to [Kinde](https://kinde.com/)
- Create a new application
- Get your client ID, secret, and issuer URL
- Add them to the Kinde variables

### 5. Stripe
- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Get your secret key and webhook secret
- Add them to the Stripe variables

### 6. Database
- Set up a PostgreSQL database
- Get the connection string
- Add it to `DATABASE_URL`

## Quick Start

1. Copy the environment variables above to `.env.local`
2. Fill in your actual API keys
3. Run `npm run dev`
4. The app should now work properly!

## Troubleshooting

If you're still getting "Processing failed" errors:

1. Check that all environment variables are set correctly
2. Verify your API keys are valid
3. Check the server logs for specific error messages
4. Ensure your database is running and accessible
