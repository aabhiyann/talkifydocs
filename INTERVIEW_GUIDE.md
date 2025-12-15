## TalkifyDocs – Interview & Whiteboard Guide

This guide is for **explaining TalkifyDocs in interviews**. Use it as a script + outline.

---

## 1. 30–60 second high‑level pitch

You can memorize a version of this:

> “TalkifyDocs is an AI‑powered PDF assistant I built. Authenticated users can upload PDFs and then ask natural‑language questions and get answers grounded in those documents. The stack is Next.js 14 with the App Router, TypeScript, Tailwind, Prisma + Postgres, Clerk for authentication, Stripe for subscriptions, UploadThing for file uploads, and an OpenAI + Pinecone pipeline under the hood. I focused on both UX (dashboard, chat UI, PDF viewer) and robustness (validation, rate limiting, and security headers).”

If you have more time (45–60s), add:

> “When you upload a PDF, we parse it with LangChain, embed it with OpenAI, index vectors into a Pinecone namespace per file, and then at query time we retrieve the most relevant chunks and feed them to OpenAI Chat Completions with the chat history, streaming the answer back to the UI.”

---

## 2. 5–10 minute whiteboard explanation outline

You can walk through the system in this order:

### 2.1 Start with the user journey (top‑down)

1. **User signs in** (Clerk).
2. Lands on **dashboard**:
   - Sees list of PDFs (from `File` table).
   - Can upload a new PDF (UploadThing).
3. After upload:
   - Document goes through a **processing pipeline** (LangChain + OpenAI + Pinecone).
4. User clicks a file:
   - Opens **chat + PDF viewer**.
   - Asks questions → gets streamed answers from OpenAI grounded in the PDF.
5. Optionally upgrades to **Pro**:
   - Stripe checkout → webhook → `User` row updated with subscription info.

### 2.2 Draw the core architecture boxes

On a whiteboard, draw:

- **Frontend (Next.js App Router)**:
  - Marketing pages, Dashboard, Chat view, PDF viewer.
  - tRPC client for internal APIs.

- **Backend (Next.js route handlers + tRPC)**:
  - tRPC router for auth, file listing, file CRUD, Stripe session creation.
  - Route handlers for:
    - `/api/message` (chat/Q&A).
    - `/api/uploadthing/*` (uploads).
    - `/api/webhooks/stripe` (billing events).
    - `/api/health` (health check).

- **Services**:
  - Postgres (via Prisma).
  - OpenAI.
  - Pinecone.
  - Stripe.
  - UploadThing.
  - Clerk (auth provider).

Then connect them:

- Browser ↔ Next.js frontend ↔ tRPC / API routes → DB / external services.

### 2.3 Explain the data model

On the whiteboard, draw:

- `User`:
  - `id`, `email`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`.
  - Relations: `File[]`, `Message[]`.

- `File`:
  - `id`, `name`, `url`, `key`, `uploadStatus`.
  - Relation: `messages: Message[]`, optional `userId`.

- `Message`:
  - `id`, `text`, `isUserMessage`, `userId`, `fileId`.

Explain:

> “Each user can have many files, and each file can have many messages. Messages store both user questions and model answers. Stripe metadata lives on the User, since subscription is per user, not per document.”

---

## 3. Deep‑dive on key flows

### 3.1 Auth & authorization

**What to say:**

- “We use Clerk for auth. On the server we use Clerk’s `auth()` / `currentUser()` helpers (wrapped in `lib/auth.ts`) to get the logged‑in user.”
- “In tRPC, there’s an `isAuth` middleware that wraps `privateProcedure`. It throws a `TRPCError('UNAUTHORIZED')` if the user is missing, and otherwise adds `userId` and `user` to the context.”
- “Protected pages like `/dashboard` use `requireUser()` and are enforced by Clerk middleware so unauthenticated users are redirected to sign in.”

**Key point:** you show that you understand server‑side auth with a third‑party provider and how you propagate identity into your API layer.

### 3.2 Uploading & processing PDFs

**Rough script:**

1. “Files are uploaded via UploadThing. In `ourFileRouter.pdfUploader` we:
   - Enforce a 4MB limit.
   - Rate‑limit uploads by IP.
   - Require a logged‑in user and pass their `userId` into the upload metadata.”
2. “When the upload completes, the `onUploadComplete` hook runs on the server:
   - Creates a `File` row in the DB with `uploadStatus = 'PROCESSING'`.
   - Downloads the PDF from the UploadThing URL with a timeout to guard against stuck downloads.
   - Validates that the file is a non‑empty PDF.”
3. “Then we process the PDF:
   - Use LangChain’s `PDFLoader` to load per‑page documents.
   - Ensure a Pinecone index exists (create it if needed).
   - Use `OpenAIEmbeddings` to embed each chunk.
   - Store the vectors in Pinecone (optionally namespaced by file ID).”
4. “Finally, we update `File.uploadStatus` to `SUCCESS` or `FAILED` depending on the outcome.”

**Emphasize:**
- Rate limiting to protect from abuse.
- Validation and error logging to handle bad PDFs.
- Separation between **upload** (fast) and **processing** (can be slower).

### 3.3 Asking questions & chat pipeline

**Rough script:**

1. “The front end hits `/api/message` with the question and `fileId`.”
2. “On the server we:
   - Validate the request headers and size.
   - Rate‑limit this endpoint by IP (message throttling).
   - Zod‑validate the payload (length limits, no obvious script injections).
   - Authenticate with Clerk (via `requireUser`) and verify that the user owns the file.”
3. “We then:
   - Save the user’s question into the `Message` table.
   - Load embeddings for that file from Pinecone and run a similarity search to get the top few chunks.
   - Fetch the last few messages for conversation context.”
4. “We call OpenAI’s chat completions API with:
   - A system prompt that forces answers to rely on context or say ‘I don’t know’.
   - A user message combining context and conversation.”
5. “We stream the response back to the client, and once it’s complete we save that answer as another `Message` row.”

**Highlight:**
- Retrieval‑augmented generation (RAG) pattern.
- Streaming responses for better UX.
- Storing both sides of the conversation.

### 3.4 Billing / Stripe integration

**How to cover it:**

1. Plans:
   - “Plans are defined in code (`PLANS`) with quotas, pages per PDF, and Stripe price IDs.”
2. Subscription state:
   - “The `User` model stores Stripe IDs and a `stripeCurrentPeriodEnd` timestamp.”
   - “`getUserSubscriptionPlan` checks if the current time is before `stripeCurrentPeriodEnd` and picks the right plan definition.”
3. Creating sessions:
   - “The `createStripeSession` tRPC procedure:
     - If the user is already subscribed, sends them to the Stripe billing portal.
     - If not, creates a checkout session with their `userId` in metadata.”
4. Webhooks:
   - “Stripe sends webhooks on `checkout.session.completed` and `invoice.payment_succeeded`. The webhook handler validates the signature and updates `User` with subscription details.”

**Emphasize:**
- Dynamic imports of Stripe modules to avoid bundling issues.
- Safe fallback when Stripe isn’t configured (e.g. local dev).

---

## 4. Security, validation, and reliability talking points

Mention these to stand out:

- **Env validation**:
  - Zod schema in `lib/env.ts` ensures all required env vars are present and correctly formatted.
- **Rate limiting**:
  - In‑memory map keyed by IP + operation type for uploads, messages, and general API calls.
- **Input validation**:
  - Zod schemas for messages, file metadata, and users.
  - Sanitization of strings (removing `<script>`, `javascript:`, etc.).
- **Security headers**:
  - CSP, X‑Frame‑Options, X‑Content‑Type‑Options, etc. from `next.config.js` and `getSecurityHeaders()`.
- **Error handling & logging**:
  - Centralized error classes and structured logger with categories for API, auth, DB, upload, chat, Stripe.

You can phrase it as:

> “Because we accept arbitrary user PDFs and hit expensive third‑party APIs, I added multiple layers of safeguards: Zod validation, input sanitization, rate limiting, strict security headers, and structured logging. That let us fail safely and debug issues without leaking details to users.”

---

## 5. Frontend & UX story

Focus on:

- **Dashboard UX**:
  - “Users get a modern dashboard to manage documents: search, sort, grid/list toggle, clear empty/loading/error states, and direct actions like ‘View & Chat’ and delete.”
- **Chat UX**:
  - “The chat page uses clear states for `PENDING`, `PROCESSING`, `FAILED`, and `SUCCESS`, so users always know what’s happening with their PDF.”
- **PDF viewer**:
  - “The viewer is a client‑side dynamic component that can zoom, rotate, paginate, and go fullscreen. It’s robust against loading errors and timeouts.”
- **Design system**:
  - “Tailwind + CSS variables form a mini design system with consistent color tokens and typography. Dark mode is supported via a theme provider and a toggle.”

Short script:

> “On the front end I focused on a SaaS‑grade experience: uploading feels fast and safe, document processing is visible via status cards, and chat responses stream in real‑time. The PDF viewer is resilient and lets you explore your document while you chat. I used Tailwind and a custom token‑based design system so styling is consistent and easy to extend.”

---

## 6. Common questions interviewers might ask (and how to answer)

### Q1: Why did you choose Pinecone + OpenAI instead of just calling the model with the raw PDF?

**Answer idea:**

> “For large documents, sending the whole PDF to the model is expensive and doesn’t scale with token limits. Using Pinecone and embeddings I can do retrieval‑augmented generation: embed the document once, then at query time only send a handful of the most relevant chunks to OpenAI. It’s significantly cheaper and more accurate for document‑Q&A.”

### Q2: How do you handle security for user‑provided PDFs and text?

**Answer idea:**

> “We validate and sanitize inputs via Zod and custom validators, limit file types to PDFs, enforce size limits, apply rate limiting by IP, and set strict security headers including CSP and clickjacking protections. Messages are sanitized for potentially dangerous patterns, and file names are cleaned to avoid path traversal or weird extensions.”

### Q3: How does your system handle failures in external services (OpenAI, Pinecone, Stripe, etc.)?

**Answer idea:**

> “Each integration is wrapped in try/catch with domain‑specific error messages, and we capture error details with a structured logger. For uploads, a failure sets `uploadStatus = 'FAILED'` so the UI can show a clear retry message. For Stripe, webhooks are idempotent on our side—re‑processing an event just overwrites the same fields. For OpenAI/Pinecone failures, we log context and return a safe error response to the client.”

### Q4: How would you scale this system?

**Answer idea:**

> “Horizontally scaling the Next.js app is straightforward as it’s essentially stateless. For rate limiting, I’d migrate from an in‑memory store to Redis so multiple instances share the same counters. Pinecone and OpenAI already scale as managed services. Prisma/DB would be backed by a managed Postgres instance with connection pooling. For uploads and processing, we could move heavy PDF processing into background jobs or serverless workers to decouple it from request/response latency.”

### Q5: How would you prevent prompt injection or data leakage between documents?

**Answer idea:**

> “We separate documents by namespace in Pinecone so vectors for one file aren’t mixed with others. We always verify the user owns the file before retrieving vectors. On the prompt side, we keep the system prompt strict and use only retrieved context + minimal metadata. We don’t let the model see arbitrary user instructions that would override our guardrails, and we store minimal metadata in vectors to avoid leaking sensitive info.”

---

## 7. How to prep using these docs

- **Night before interview**:
  - Read `PROJECT_OVERVIEW.md` once or twice.
  - Skim this guide and try explaining each major section (auth, upload, chat pipeline, billing) out loud without notes.
- **Day of interview**:
  - Use the 30–60s pitch as your go‑to intro.
  - For a system design / deep dive, follow the order in section 2:
    1. User journey.
    2. Architecture boxes.
    3. Data model.
    4. Key flows.
- **Afterwards**:
  - Adjust your wording based on which questions you actually get and what resonated with interviewers.


