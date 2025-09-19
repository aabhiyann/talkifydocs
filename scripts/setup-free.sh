#!/bin/bash

echo "🚀 Setting up TalkifyDocs for FREE!"
echo "=================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database (Replace with your Supabase/Railway URL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# OpenAI (Your API key from OpenAI Platform)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Pinecone (Your keys from Pinecone Console)
PINECONE_API_KEY="your-pinecone-api-key-here"
PINECONE_ENVIRONMENT="gcp-starter"

# UploadThing (Your keys from UploadThing)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret-here"
UPLOADTHING_APP_ID="your-uploadthing-app-id-here"

# Kinde Auth (Your keys from Kinde)
KINDE_CLIENT_ID="your-kinde-client-id-here"
KINDE_CLIENT_SECRET="your-kinde-client-secret-here"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000"

# Stripe (Your keys from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key-here"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret-here"

# App
NODE_ENV="development"
PORT="3000"
EOF
    echo "✅ Created .env.local file"
else
    echo "⚠️  .env.local already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Follow the FREE_SETUP_GUIDE.md to get your API keys"
echo "2. Update .env.local with your actual keys"
echo "3. Run: npm install"
echo "4. Run: npx prisma db push"
echo "5. Run: npm run dev"
echo ""
echo "🎉 You're all set! Total cost: $0"
