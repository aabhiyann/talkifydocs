# Deployment Checklist

## Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Pinecone index created and configured
- [ ] Stripe webhooks configured
- [ ] Clerk webhooks configured
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Sentry project created and DSN configured
- [ ] Google Analytics ID configured (optional)
- [ ] Upstash Redis instance created (optional, falls back to memory cache)

## Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk Public URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX=your-index-name

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional

```bash
# Redis Caching (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Or Traditional Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...

# Error Tracking (Sentry)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_TRACES_SAMPLE_RATE=0.1

# Analytics
NEXT_PUBLIC_GA_ID=G-...

# Node Environment
NODE_ENV=production
```

## Database Setup

1. **Create Database**
   ```bash
   # Using Neon, Supabase, or other PostgreSQL provider
   # Create a new database and copy the connection string
   ```

2. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Verify Schema**
   ```bash
   npm run db:studio
   # Check that all tables exist with correct indexes
   ```

## Pinecone Setup

1. **Create Index**
   ```bash
   # Use Pinecone console or API
   # Index name should match PINECONE_INDEX env var
   # Dimension: 1536 (for OpenAI text-embedding-3-small)
   # Metric: cosine
   ```

2. **Verify Connection**
   ```bash
   # Test via health check endpoint after deployment
   curl https://your-domain.com/api/health
   ```

## Stripe Webhook Setup

1. **Create Webhook Endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy Webhook Secret**
   - Add to `STRIPE_WEBHOOK_SECRET` env var

## Clerk Webhook Setup

1. **Create Webhook Endpoint**
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events to listen:
     - `user.created`
     - `user.updated`
     - `user.deleted`

2. **Copy Webhook Secret**
   - Add to `CLERK_WEBHOOK_SECRET` env var

## Vercel Deployment

1. **Connect Repository**
   ```bash
   # Via Vercel Dashboard or CLI
   vercel link
   ```

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all required env vars in Vercel dashboard
   - Use different values for Preview/Production environments

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

- [ ] Health check endpoint returns 200: `curl https://your-domain.com/api/health`
- [ ] Homepage loads correctly
- [ ] Sign up flow works
- [ ] PDF upload works
- [ ] Chat functionality works
- [ ] Stripe webhooks are receiving events
- [ ] Clerk webhooks are receiving events
- [ ] Admin dashboard accessible (for admin users)
- [ ] Error tracking in Sentry (if configured)
- [ ] Analytics tracking (if configured)

## Performance Optimization

### Database
- [ ] Connection pooling enabled (`?pgbouncer=true&connection_limit=1`)
- [ ] Indexes verified on frequently queried fields
- [ ] Query performance monitored

### Caching
- [ ] Redis/Upstash configured and working
- [ ] Cache hit rates monitored
- [ ] Cache invalidation working correctly

### CDN & Assets
- [ ] Static assets served via CDN
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts preloaded

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up

## Rollback Plan

If deployment fails:

1. **Revert to Previous Version**
   ```bash
   vercel rollback
   ```

2. **Check Logs**
   ```bash
   vercel logs
   ```

3. **Verify Environment Variables**
   - Check Vercel dashboard for missing/invalid vars

4. **Database Rollback** (if needed)
   ```bash
   # Revert last migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

## Maintenance

### Regular Tasks
- [ ] Monitor error rates in Sentry
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review and rotate API keys quarterly

### Scaling Considerations
- [ ] Database connection pool size
- [ ] Redis cache size
- [ ] Pinecone index capacity
- [ ] Vercel function timeout limits
- [ ] Rate limiting thresholds

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` format
   - Verify connection pooling settings
   - Check database firewall rules

2. **Pinecone Connection Errors**
   - Verify `PINECONE_API_KEY` and `PINECONE_INDEX`
   - Check Pinecone dashboard for index status

3. **Webhook Failures**
   - Verify webhook secrets match
   - Check webhook endpoint logs
   - Verify SSL certificate is valid

4. **Build Failures**
   - Check build logs in Vercel
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

5. **Performance Issues**
   - Check database query performance
   - Verify Redis cache is working
   - Review bundle size
   - Check API response times

## Security Checklist

- [ ] All secrets stored in environment variables (never in code)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Regular security audits

## Support

For issues or questions:
- Check application logs: `vercel logs`
- Check Sentry for errors
- Review health check endpoint
- Contact support team

