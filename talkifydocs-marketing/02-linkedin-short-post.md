# LinkedIn Short Post (300–500 words)

---

I just finished building **TalkifyDocs** – an AI-powered PDF assistant where you can upload documents and then _chat with them_ in natural language.

Instead of scrolling and Ctrl+F-ing through 80-page PDFs, you:

- Upload a PDF
- Wait a few seconds while it’s processed
- Ask questions like “Summarize section 3” or “What are the key risks in this contract?”

Under the hood, it uses:

- **Next.js 16 + React 19 + TypeScript** for the app and dashboard
- **Prisma + PostgreSQL** for users, files, conversations, and highlights
- **Clerk** for authentication (hosted auth with prebuilt UI + social login)
- **Vercel Blob** for PDF storage and thumbnails
- **OpenAI GPT-4o + Pinecone + LangChain** for retrieval-augmented generation (RAG)
- **Hybrid Search** (semantic + keyword) for better retrieval
- **Stripe** for subscription billing (Free, Pro, Admin tiers)
- **Redis caching** (Upstash) and **Sentry** monitoring

What I focused on:

**1. Trustworthy "Chat with PDF"**  
Naively calling the OpenAI API isn't enough. I implemented a RAG pipeline with hybrid search:

- Embed each PDF into vectors once (using OpenAI text-embedding-3-small)
- On each question, use hybrid search (semantic + BM25 keyword) across selected documents
- Retrieve only the most relevant chunks from Pinecone
- Feed those + recent conversation into OpenAI GPT-4o with a strict system prompt  
  The model is instructed to answer _only_ from the retrieved context or say "I don't know."
- Multi-document conversations let users compare up to 5 PDFs simultaneously

**2. Production-Ready UX**  
Long-running work (parsing, embedding, indexing) runs server-side with:

- A `PENDING → PROCESSING → SUCCESS / FAILED` status on each file
- Real-time status updates via Server-Sent Events (SSE) instead of polling
- A dashboard that shows clean states: loading, processing, failed, ready
- Streaming responses in the chat UI so answers appear in real time
- Clickable citations that jump to specific pages in the PDF viewer
- Highlights system to save important Q&A pairs

**3. Safety & Reliability**  
I added:

- Zod-based validation for env vars and request bodies
- Rate limiting for uploads and chat messages (Redis-backed)
- Security headers (CSP, frame/XSS protection)
- Centralized logging and error handling
- Sentry integration for error tracking
- Google Analytics for user behavior
- Health check endpoint for monitoring
- Admin dashboard for user management and system metrics

It ended up feeling less like a "toy GPT wrapper" and more like a production SaaS product.

If you’re interested in AI + Next.js + RAG architecture, I’m happy to share more details or walk through the code.

> Replace before posting:
>
> - Live demo: YOUR TALKIFYDOCS URL
> - Repo: YOUR GITHUB URL

🔗 Live demo: YOUR TALKIFYDOCS URL  
💻 Code: YOUR GITHUB URL

---

**Hashtags:**  
#AI #NextJS #React #FullStack #MachineLearning #SoftwareEngineering
