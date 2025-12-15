# Twitter/X Thread (10–15 tweets)

---

**Tweet 1 (Hook):**  
I just built an AI app where you can upload a PDF and then _chat with it_ in natural language.

Here’s how I used Next.js 14 + OpenAI + Pinecone to ship a production-ready “Chat with PDF” app 🧵

🔗 Live demo: YOUR TALKIFYDOCS URL  
💻 Code: YOUR GITHUB URL

---

**Tweet 2 (Problem):**  
PDFs are where a lot of real knowledge lives (research papers, contracts, docs)…

…but the UX is still: scroll, skim, Ctrl+F, repeat.

I wanted something better:

> Upload a PDF → ask questions → get grounded answers in seconds.

That became **TalkifyDocs**.

---

**Tweet 3 (Core Idea):**  
Core capabilities:

1️⃣ Upload PDFs and index them  
2️⃣ Ask natural-language questions  
3️⃣ Get answers grounded in your document  
4️⃣ Manage docs in a SaaS-style dashboard (with auth + billing)

All built on Next.js 14 with a full RAG pipeline underneath.

---

**Tweet 4 (Stack):**  
Tech stack:

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind
- Backend: Next route handlers + tRPC + Prisma
- AI: OpenAI Chat Completions + embeddings, LangChain
- Vector DB: Pinecone
- Auth: Clerk (prebuilt auth UI + session management)
- Billing: Stripe
- Uploads: UploadThing

---

**Tweet 5 (Upload Flow):**  
Upload flow:

1️⃣ User uploads a PDF via UploadThing  
2️⃣ Backend creates a `File` row with `uploadStatus = PROCESSING`  
3️⃣ Server downloads the file, validates it, and parses pages via LangChain’s `PDFLoader`  
4️⃣ OpenAI embeddings → Pinecone index (per file namespace)  
5️⃣ Status set to `SUCCESS` or `FAILED`

The UI polls status and shows clear states.

---

**Tweet 6 (Chat Flow):**  
Chat flow:

1️⃣ User asks a question about a specific file  
2️⃣ Backend validates + rate-limits the request and checks file ownership  
3️⃣ Query Pinecone for the top-K relevant chunks  
4️⃣ Combine chunks + recent chat history  
5️⃣ Send to OpenAI Chat Completions with a strict system prompt  
6️⃣ Stream answer back to the client and save it as a `Message` row

---

**Tweet 7 (RAG Focus):**  
Key pattern: **retrieval-augmented generation (RAG)**

Instead of sending the entire PDF to the model:

- Embed once → store vectors
- On each question, only send the relevant chunks

Benefits:

- Lower token usage
- Faster responses
- More grounded answers

---

**Tweet 8 (UX Details):**  
UX details that matter:

- File status: `PENDING → PROCESSING → SUCCESS/FAILED`
- Chat page shows:
  - “Loading your document…”
  - “Processing your document…”
  - “Processing failed, please re-upload”
  - “Ready to chat”
- Responses are streamed token-by-token so the UI feels alive.

---

**Tweet 9 (Safety & Validation):**  
Because this hits expensive APIs and untrusted inputs, I added:

- Zod validation for env + request bodies
- Rate limiting by IP for uploads/messages
- Input sanitization for messages
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)

Feels like a product, not a one-off demo.

---

**Tweet 10 (Auth & Billing):**  
Auth & billing:

- Clerk for authentication and session management
- Stripe for Free vs Pro plans
- Webhooks keep the `User` record in sync with Stripe subscription state
- tRPC procedure creates either a checkout session or billing portal session

Makes it easy to turn this into a SaaS.

---

**Tweet 11 (Lessons Learned):**  
Biggest lessons building an AI app like this:

1️⃣ RAG + streaming > just calling the OpenAI API  
2️⃣ UX for long-running operations (like PDF processing) is critical  
3️⃣ Rate limiting + validation save you from surprise bills and weird inputs  
4️⃣ Production AI = infra + UX + safety, not just prompts

---

**Tweet 12 (Call to Action):**  
If you’re experimenting with AI + Next.js + RAG, happy to share more details or walk through the architecture.

🔗 Live demo: YOUR TALKIFYDOCS URL  
💻 Code: YOUR GITHUB URL

RT the first tweet to help more builders ship _real_ AI products, not just toy demos.

---

**Hashtags for Tweet 1:**  
#AI #NextJS #React #RAG #MachineLearning #FullStack #SoftwareEngineering

---

**Pro Tips:**

1. Add dashboard / chat screenshots to Tweet 1 for better engagement.
2. Consider a short screen recording / GIF of “upload → ask → answer” in Tweet 3–4.
3. Engage with replies quickly (first hour is critical).
4. Pin the thread if it performs well.
