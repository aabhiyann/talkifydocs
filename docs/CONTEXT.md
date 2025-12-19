## TalkifyDocs v2.0 – Project Context

## Project Overview

TalkifyDocs is an AI-powered PDF assistant built with Next.js 15, allowing users to upload PDFs and chat with them using natural language. This is a modernization of an existing project with focus on 2025 best practices.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers, tRPC, Prisma ORM
- **Database:** PostgreSQL (hosted on Neon or Supabase)
- **Auth:** Clerk
- **AI:** OpenAI GPT-4o or Claude 3.5 Sonnet, Pinecone vector DB, LangChain
- **Storage:** Vercel Blob
- **Payments:** Stripe
- **Hosting:** Vercel

## Architecture Principles

1. Server Components by default, Client Components only when needed
2. tRPC for mutations and queries, Route Handlers for streaming/webhooks
3. Optimistic UI updates where possible
4. Streaming responses for AI chat
5. Type-safe APIs with Zod validation
6. Error boundaries at feature boundaries
7. Structured logging with correlation IDs

## Code Style

- Use functional components with hooks
- Prefer composition over inheritance
- Co-locate related code
- Use TypeScript strict mode
- Follow Airbnb naming conventions
- Maximum function complexity: 15
- Prefer named exports over default exports

## File Structure Conventions

- Group by feature, not by type
- Components in `/components/[feature]/ComponentName.tsx`
- Server logic in `/lib/[domain]/` or `/actions/`
- Types in `/types/` with clear naming
- Utilities in `/lib/utils/`

## Key Dependencies

```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "typescript": "^5.9.0",
  "@clerk/nextjs": "^6.36.0",
  "@prisma/client": "^5.7.0",
  "@vercel/blob": "^0.27.0",
  "@upstash/redis": "^1.0.0",
  "@sentry/nextjs": "^8.0.0",
  "ai": "^2.2.0",
  "@langchain/openai": "^0.3.0",
  "@langchain/pinecone": "^0.1.0",
  "@pinecone-database/pinecone": "^1.0.0",
  "zod": "^3.22.0",
  "zustand": "^5.0.0"
}
```

## Environment Variables

**Database**

- `DATABASE_URL=`

**Clerk**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`
- `CLERK_SECRET_KEY=`

**OpenAI**

- `OPENAI_API_KEY=`

**Pinecone**

- `PINECONE_API_KEY=`
- `PINECONE_ENVIRONMENT=`
- `PINECONE_INDEX=`

**Stripe**

- `STRIPE_SECRET_KEY=`
- `STRIPE_WEBHOOK_SECRET=`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`

**Vercel Blob**

- `BLOB_READ_WRITE_TOKEN=`

**Sentry (optional)**

- `SENTRY_DSN=`

## Current Implementation Status

- ✅ Basic PDF upload with Vercel Blob storage
- ✅ OpenAI embeddings + Pinecone storage
- ✅ Single-document chat with streaming responses
- ✅ Multi-document conversations (up to 5 files)
- ✅ Citation highlighting and clickable citations
- ✅ Highlights & bookmarks system
- ✅ Chat export (Markdown) and sharing (public links)
- ✅ Admin dashboard with user management
- ✅ Demo mode with example documents
- ✅ Stripe subscriptions (Free, Pro, Admin tiers)
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring (Google Analytics)
- ✅ Redis caching layer (Upstash)
- ✅ Health check endpoint
- ✅ Production optimizations (bundle size, image optimization)
- ✅ CI/CD workflows (Lighthouse CI)

## Design System

- Use shadcn/ui components as base
- Color scheme: Slate for neutral, Blue for primary
- Font: Geist (Vercel's font)
- Spacing: 4px base unit
- Border radius: `rounded-lg` (0.5rem) for cards, `rounded-md` for buttons
- Animations: Framer Motion for complex, Tailwind for simple

## Testing Strategy

- **Unit tests**: Vitest for utilities and helpers
- **Integration tests**: Vitest for API routes
- **E2E tests**: Playwright for critical user flows
- **Target**: 80% coverage on critical paths
