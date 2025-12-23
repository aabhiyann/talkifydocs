const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

let hasToken = false;

if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    if (content.includes('BLOB_READ_WRITE_TOKEN=')) {
        hasToken = true;
        console.log('Found BLOB_READ_WRITE_TOKEN in .env.local');
    }
}

if (!hasToken && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    if (content.includes('BLOB_READ_WRITE_TOKEN=')) {
        hasToken = true;
        console.log('Found BLOB_READ_WRITE_TOKEN in .env');
    }
}

if (!hasToken) {
    console.log('MISSING: BLOB_READ_WRITE_TOKEN not found in .env or .env.local');
    process.exit(1);
} else {
    console.log('OK: BLOB_READ_WRITE_TOKEN is present');
}
