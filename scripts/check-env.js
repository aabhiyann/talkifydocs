#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking your environment setup...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('   Run: ./scripts/setup-free.sh');
    process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '');
    }
});

// Check required variables
const requiredVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID',
    'KINDE_CLIENT_ID',
    'KINDE_CLIENT_SECRET',
    'KINDE_ISSUER_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

let allGood = true;

console.log('📋 Environment Variables Status:');
console.log('================================');

requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your-') || value.includes('[YOUR-')) {
        console.log(`❌ ${varName}: Not set or using placeholder`);
        allGood = false;
    } else {
        console.log(`✅ ${varName}: Set`);
    }
});

console.log('\n' + '='.repeat(40));

if (allGood) {
    console.log('🎉 All environment variables are set!');
    console.log('   You can now run: npm run dev');
} else {
    console.log('⚠️  Some environment variables need to be set');
    console.log('   Follow the FREE_SETUP_GUIDE.md to get your API keys');
}

console.log('\n💡 Quick links:');
console.log('   OpenAI: https://platform.openai.com/api-keys');
console.log('   Pinecone: https://app.pinecone.io/');
console.log('   UploadThing: https://uploadthing.com/');
console.log('   Kinde: https://kinde.com/');
console.log('   Stripe: https://dashboard.stripe.com/');
console.log('   Supabase: https://supabase.com/');
