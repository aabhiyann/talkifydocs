## TalkifyDocs – Project Overview (1‑Pager)

### Docs Index – TalkifyDocs v2.0

- **Context & Vision**
  - `CONTEXT.md` – High-level project context, tech stack, and principles
  - `PROJECT_OVERVIEW.md` – Product overview and high-level architecture
- **Specs**
  - `SOFTWARE_REQUIREMENTS.md` – Functional & non-functional requirements (SRD)
  - `TECHNICAL_DESIGN.md` – System architecture, schema, and component design
- **Execution**
  - `IMPLEMENTATION_PHASES.md` – Phase-by-phase implementation roadmap

### Project Overview – TalkifyDocs v2.0

- **Project Name**: TalkifyDocs v2.0
- **Objective**: Modernize existing PDF chat application with 2025 best practices, enhanced UX, and advanced AI capabilities
- **Timeline**: 4–6 weeks (part-time)
- **Target Outcome**: Portfolio-ready SaaS application demonstrating full-stack + AI engineering skills

- **Success Metrics**
  - Page load time \< 2s
  - Chat response time \< 3s (streaming starts \< 1s)
  - 95%+ Lighthouse score
  - Zero-config demo mode for recruiters
  - Mobile-responsive (works on all devices)
  - Deployed with custom domain + SSL

### 1. What the project is

**TalkifyDocs** is an AI‑powered PDF assistant:

- **Goal**: Let users upload PDFs and then **chat with their documents**.
- **Core features**:
  - Authenticated users upload PDFs.
  - PDFs are parsed, embedded, and indexed into a vector database.
  - Users ask questions in natural language and get answers grounded in their documents.
  - **Multi-document conversations** - chat with up to 5 documents simultaneously.
  - **Highlights & Bookmarks** - save important Q&A pairs for later reference.
  - **Chat Export & Sharing** - export conversations as Markdown or share via public links.
  - **Demo Mode** - public demo with example documents (no sign-up required).
  - **Admin Dashboard** - user management, metrics, and system monitoring.
  - Subscription billing with **Free**, **Pro**, and **Admin** tiers.

### 2. High‑level architecture

- **Frontend**
  - **Next.js 16 App Router** (`src/app`), **React 19**, **TypeScript**.
  - **Tailwind CSS** + custom design system (`tailwind.config.ts`, `src/styles/design-system.css`, `src/app/globals.css`).
  - Component library based on **shadcn/Radix‑style** primitives in `src/components/ui`.
  - tRPC client in `src/app/_trpc/client.ts` for type‑safe API calls.
  - **Google Analytics** for user behavior tracking.
  - **Sentry** for error tracking and monitoring.

- **Backend**
  - Next.js **route handlers** in `src/app/api/**`:
    - `api/message`: chat/Q&A endpoint.
    - `api/uploadthing`: file upload and processing pipeline.
    - `api/webhooks/stripe`: Stripe webhooks.
    - `api/health`: health check.
  - **tRPC** in `src/trpc`:
    - `trpc.ts`: router + `publicProcedure` / `privateProcedure` with auth middleware.
    - `index.ts`: app router with operations for files, billing, and auth callback.
  - **Prisma + Postgres**:
    - Schema in `prisma/schema.prisma` (`User`, `File`, `Message`).
    - `src/db/index.ts` exports a singleton `db` client.
  - External services:
    - **OpenAI** (`src/lib/openai.ts`) for chat completions and embeddings.
    - **Pinecone** (`src/lib/pinecone.ts`) + **LangChain** for vector search.
    - **Stripe** (`src/lib/stripe.ts`, `src/config/stripe.ts`) for subscriptions.
    - **Vercel Blob** (`@vercel/blob`) for file storage and thumbnails.
    - **Clerk** (`@clerk/nextjs`) for authentication and user management.
    - **Upstash Redis** (optional) for caching and rate limiting.
    - **Sentry** (optional) for error tracking and performance monitoring.

### 3. Data model (Prisma)

- **User**
  - `id` (internal ID), `clerkId`, `email`.
  - Relations: `File[]`, `Message[]`.
  - Stripe metadata: `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`.

- **File**
  - `id`, `name`, `url`, `key`.
  - `uploadStatus`: `PENDING | PROCESSING | FAILED | SUCCESS`.
  - Optional `userId` reference to `User`.
  - Relation: `messages: Message[]`.

- **Message**
  - `id`, `text`, `isUserMessage`.
  - Relations to `User` and `File` (`userId`, `fileId`).

### 4. Key flows

#### Authentication (Clerk)

- Server code uses Clerk’s `auth()` / `currentUser()` helpers (wrapped in `lib/auth.ts`) to fetch the current user.
- tRPC’s `privateProcedure` (in `src/trpc/trpc.ts`) wraps resolvers with auth middleware.
- Protected pages like `dashboard/page.tsx` rely on `requireUser()` and are enforced by Clerk middleware.

#### Uploading & processing PDFs

- Upload handled by Vercel Blob client-side upload in `src/components/UploadButton.tsx`:
  - Validates file type (PDF only) and size (tier-based limits).
  - Uploads directly to Vercel Blob storage.
  - Background webhook (via `api/upload/blob`) creates a `File` row with `uploadStatus = "PROCESSING"`.
  - Triggers `processPDF` function asynchronously.
- Processing pipeline (`src/lib/upload/process-pdf.ts`):
  - Downloads PDF from Vercel Blob.
  - Validates and extracts text using LangChain `PDFLoader`.
  - Generates thumbnail using `pdf-lib` and `sharp`.
  - Extracts metadata (author, dates, page count) using `pdf-parse`.
  - Generates summary using OpenAI `gpt-4o`.
  - Extracts entities (people, orgs, dates) using OpenAI.
  - Creates embeddings using OpenAI `text-embedding-3-small`.
  - Stores vectors in Pinecone (namespaced by file ID).
  - Updates `File` with `uploadStatus = "SUCCESS"` and all extracted data.
- Real-time status updates via SSE (`/api/process-upload`).

#### Asking questions / chatting with PDFs

- Implemented in `src/app/api/chat/route.ts`:
  - Validates request headers & size via `lib/security.validateRequest`.
  - Rate limits per IP via `checkRateLimit(clientIP, "MESSAGE")`.
  - Authenticates user with Clerk (via `requireUser`).
  - Loads conversation and associated files (supports multi-document).
  - Stores the user's question as a `Message` row.
  - Uses `hybridSearch` to find relevant chunks across all conversation files:
    - Semantic search via Pinecone (multiple namespaces).
    - BM25-style keyword re-ranking for better precision.
  - Fetches recent conversation history for context.
  - Builds system prompt with context and conversation history.
  - Calls OpenAI `gpt-4o` with streaming enabled.
  - Streams the answer back (`OpenAIStream` + `StreamingTextResponse`).
  - Saves assistant reply with citations (fileId, page, snippet) to DB.
  - Citations are clickable and jump to the correct page in PDF viewer.

#### Billing & plans (Stripe)

- Plans in `src/config/stripe.ts`:
  - `Free` and `Pro` with quotas and Stripe price IDs.
- `getUserSubscriptionPlan` in `src/lib/stripe.ts`:
  - Uses the current authenticated user (via Clerk), loads `db.user`, determines if subscription is active based on `stripeCurrentPeriodEnd`.
  - Returns plan metadata + flags `isSubscribed`, `isCanceled`.
- tRPC router (`src/trpc/index.ts`) has `createStripeSession`:
  - For existing subscribers, opens a Stripe **billing portal**.
  - For new subscribers, creates a **checkout session** with plan price ID and `userId` in metadata.
- Webhooks in `src/app/api/webhooks/stripe/route.ts`:
  - On `checkout.session.completed` and `invoice.payment_succeeded`, update the `User` record with the latest Stripe subscription info.

### 5. Frontend UX & design choices

- **Marketing site**:
  - `src/app/page.tsx` + `HeroSection` + `marketing` content show what the product does and how it works.
  - Additional pages: About, Features, Pricing, Contact, Style Guide.

- **Dashboard** (`src/components/dashboard.tsx`, `src/app/dashboard/page.tsx`):
  - Shows all user PDFs with search, sorting, and grid/list toggle.
  - Uses tRPC `getUserFiles` and `deleteFile` for data and mutations.
  - Provides clear empty state, loading skeletons, and error states.

- **Chat view** (`src/components/chat/ChatWrapper.tsx`):
  - Polls `getFileUploadStatus` via tRPC.
  - Renders different UI for `PENDING`, `PROCESSING`, `FAILED`, and `SUCCESS` file states.
  - For `SUCCESS`, shows:
    - Message list (`Messages`) backed by tRPC `getFileMessages`.
    - `ChatInput` for sending new questions.

- **PDF viewer** (`src/components/PdfRenderer.tsx`):
  - Client‑side React component that dynamically loads `react-pdf` and `pdfjs-dist`.
  - Offers page navigation, zoom, rotate, fullscreen.
  - Uses `useToast` to surface loading errors, with timeouts and detailed error messages.

**Design priorities**:

- Polished SaaS‑style UX with responsive layouts and dark mode.
- Clear user feedback during long operations (uploading, processing, streaming responses).
- Consistent design tokens via Tailwind + CSS variables.

### 6. Security, validation, and reliability

- **Env validation** (`src/lib/env.ts`):
  - Zod schema for all env vars (DB, OpenAI, Pinecone, Stripe, UploadThing, Clerk).
  - Runtime validation with sensible fallbacks in non‑critical paths.

- **Request hardening** (`src/lib/security.ts`, `src/lib/validation.ts`, `src/lib/errors.ts`):
  - Rate limiting per IP and operation type (API, UPLOAD, MESSAGE).
  - Header and content‑type checks, request size limits.
  - Zod schemas for messages, users, and file metadata.
  - Input sanitization helpers (strip HTML/JS, length limits).
  - Centralized error classes and structured logging.

- **Security headers**:
  - Next.js config (`next.config.js`) and `getSecurityHeaders()` set CSP, X‑Frame‑Options, X‑Content‑Type‑Options, etc.

### 7. Tooling and setup

- **Testing**: Jest + React Testing Library (`jest.config.js`, `jest.setup.js`, tests in `src/lib/__tests__`).
- **Tailwind**: custom theme with design tokens in `tailwind.config.ts`.
- **Dev scripts**:
  - `scripts/setup-free.sh`: scaffolds `.env.local` with placeholders and next steps.
  - `scripts/check-env.js`: checks env variables and points to providers if anything is missing.

### 8. How to run locally (summary)

1. `cp FREE_SETUP_GUIDE.md` / `SETUP_ENVIRONMENT.md` instructions into `.env.local` (or run `npm run setup:free`).
2. Fill in keys: Postgres, OpenAI, Pinecone, UploadThing, Clerk, Stripe.
3. `npm install`
4. `npx prisma db push`
5. `npm run dev` and open `http://localhost:3000`.
