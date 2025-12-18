# Setup Guide for Production Services

This guide walks you through setting up the optional production services: Sentry, Upstash Redis, and Google Analytics.

## 1. Sentry Setup (Error Tracking)

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up for a free account
2. Create a new project
3. Select **Next.js** as your platform

### Step 2: Get Your DSN

1. In your Sentry project, go to **Settings** → **Projects** → **Your Project** → **Client Keys (DSN)**
2. Copy the DSN (it looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### Step 3: Configure Environment Variables

Add to your `.env.local` (for local) and Vercel environment variables:

```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions (optional, defaults to 0.1)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx  # Same as SENTRY_DSN
```

### Step 4: Verify Setup

1. Deploy your application
2. Trigger an error (e.g., visit a non-existent page)
3. Check your Sentry dashboard - you should see the error appear

### Step 5: Set Up Alerts (Optional)

1. In Sentry, go to **Alerts** → **Create Alert Rule**
2. Set up alerts for:
   - New issues
   - High error rates
   - Performance degradation

## 2. Upstash Redis Setup (Caching)

### Step 1: Create Upstash Account

1. Go to [upstash.com](https://upstash.com) and sign up
2. Navigate to **Redis** in the dashboard

### Step 2: Create Redis Database

1. Click **Create Database**
2. Choose a name (e.g., `talkifydocs-cache`)
3. Select a region closest to your Vercel deployment
4. Choose **Regional** for better performance (or **Global** for multi-region)
5. Click **Create**

### Step 3: Get Credentials

1. After creation, click on your database
2. Copy the **UPSTASH_REDIS_REST_URL** (looks like: `https://xxxxx.upstash.io`)
3. Copy the **UPSTASH_REDIS_REST_TOKEN** (a long string)

### Step 4: Configure Environment Variables

Add to your `.env.local` and Vercel:

```bash
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Step 5: Verify Setup

1. Deploy your application
2. Check the health endpoint: `curl https://your-domain.com/api/health`
3. The `cache` service should show as "up"

### Step 6: Monitor Usage

- Upstash free tier includes:
  - 10,000 commands/day
  - 256 MB storage
  - Regional databases
- Monitor usage in the Upstash dashboard

## 3. Google Analytics Setup

### Step 1: Create Google Analytics Account

1. Go to [analytics.google.com](https://analytics.google.com)
2. Sign in with your Google account
3. Click **Start measuring**

### Step 2: Create Property

1. Enter a property name (e.g., "TalkifyDocs")
2. Select your timezone and currency
3. Click **Next**

### Step 3: Configure Data Stream

1. Select **Web** as your platform
2. Enter your website URL (e.g., `https://talkifydocs.com`)
3. Enter a stream name
4. Click **Create stream**

### Step 4: Get Measurement ID

1. After creating the stream, you'll see a **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID

### Step 5: Configure Environment Variable

Add to your `.env.local` and Vercel:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 6: Verify Setup

1. Deploy your application
2. Visit your website
3. In Google Analytics, go to **Reports** → **Realtime**
4. You should see your visit appear within a few seconds

### Step 7: Set Up Goals (Optional)

1. In Google Analytics, go to **Admin** → **Goals**
2. Create goals for:
   - User sign-ups
   - PDF uploads
   - Pro plan subscriptions

## 4. Testing All Services

### Health Check Endpoint

Test all services at once:

```bash
curl https://your-domain.com/api/health
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
  },
  "latency": 150
}
```

### Manual Testing

**Sentry:**

1. Visit a non-existent page: `https://your-domain.com/test-error`
2. Check Sentry dashboard for the error

**Redis:**

1. Upload a PDF (should cache file metadata)
2. Check Upstash dashboard for command usage

**Google Analytics:**

1. Visit your website
2. Check GA Realtime reports

## 5. Production Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Sentry DSN configured and tested
- [ ] Redis credentials configured and tested
- [ ] Google Analytics ID configured and tested
- [ ] Health check endpoint returns healthy status
- [ ] Error tracking working (test with a 404)
- [ ] Analytics tracking working (check GA Realtime)
- [ ] Cache working (check Redis dashboard)

## 6. Troubleshooting

### Sentry Not Working

- Verify `SENTRY_DSN` is set correctly
- Check that `NODE_ENV=production` in production
- Check Sentry dashboard for any configuration errors
- Review browser console for Sentry initialization errors

### Redis Not Working

- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check Upstash dashboard for rate limits
- Verify network connectivity (check firewall rules)
- Check application logs for Redis connection errors

### Google Analytics Not Working

- Verify `NEXT_PUBLIC_GA_ID` starts with `G-`
- Check browser console for GA script errors
- Use GA Debugger Chrome extension
- Verify ad blockers aren't blocking GA
- Check GA Realtime reports (may take a few minutes)

## 7. Cost Estimates

### Sentry

- **Free tier**: 5,000 events/month
- **Team tier**: $26/month for 50,000 events/month
- **Business tier**: $80/month for 200,000 events/month

### Upstash Redis

- **Free tier**: 10,000 commands/day, 256 MB storage
- **Pay-as-you-go**: $0.20 per 100K commands, $0.10 per GB storage
- Estimated cost for moderate usage: $5-10/month

### Google Analytics

- **Free**: Unlimited events and users
- No cost for standard GA4

## 8. Security Best Practices

1. **Never commit secrets**: All credentials should be in environment variables only
2. **Rotate keys regularly**: Update API keys every 90 days
3. **Use different keys for dev/staging/prod**: Separate environments prevent cross-contamination
4. **Monitor usage**: Set up alerts for unusual activity
5. **Review access logs**: Regularly check who has access to your services

## Support

If you encounter issues:

1. Check the service-specific documentation
2. Review application logs: `vercel logs`
3. Check health endpoint for service status
4. Contact support for the respective service
