#!/bin/bash

# TalkifyDocs Setup Script
echo "🚀 Setting up TalkifyDocs..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating template..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/talkifydocs"

# Authentication (Clerk)
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="whsec_your_clerk_webhook_secret"

# OpenAI
OPENAI_API_KEY="sk-your_openai_api_key"

# Pinecone
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_ENVIRONMENT="gcp-starter"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# UploadThing (for file uploads)
UPLOADTHING_SECRET="sk_live_your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Logging
LOG_LEVEL="debug"

# App
NODE_ENV="development"
PORT="3000"
EOF
    echo "📝 Created .env.local template. Please update it with your actual values."
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env.local"
fi

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo "4. Check http://localhost:3000/api/health for service status"
echo ""
echo "For detailed setup instructions, see SETUP.md"
