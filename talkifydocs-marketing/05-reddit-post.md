# Reddit Post (r/webdev, r/reactjs, r/MachineLearning)

---

**Title:** I built an AI-powered PDF assistant with Next.js + OpenAI + Pinecone. Here’s what I learned about “Chat with PDF” in production.

**Subreddits:** r/webdev, r/reactjs, r/MachineLearning, r/cscareerquestions

---

**Post Body:**

I just shipped a full-stack AI app where you can upload PDFs and then _chat with them_ in natural language. Thought I’d share what I learned building a “Chat with PDF” experience that feels like a real product, not just an OpenAI toy.

**Live demo:** https://YOUR-TALKIFYDOCS-URL  
**Source:** https://github.com/YOUR_USERNAME/talkifydocs

## The Project

**TalkifyDocs** is an AI-powered PDF assistant:

- Users upload PDFs through a dashboard
- The app parses and indexes them into a vector database
- You can ask questions like “Summarize section 3” or “What are the main risks in this contract?”
- Answers are grounded in the document, not just generic LLM responses

Tech stack:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind
- **Backend:** Next route handlers + Server Actions + Prisma
- **AI:** OpenAI GPT-4o + text-embedding-3-small, LangChain, Hybrid Search
- **Vector DB:** Pinecone
- **Auth:** Clerk (hosted auth + user management, magic links/social login)
- **Billing:** Stripe (Free, Pro, Admin tiers)
- **Storage:** Vercel Blob (files + thumbnails)
- **Caching:** Upstash Redis
- **Monitoring:** Sentry + Google Analytics

## 3 Things Building This Taught Me

### 1. RAG > Just Calling the OpenAI API

Naively sending an entire PDF (or giant chunks of it) to the model is:

- Expensive (lots of tokens)
- Slow
- Still prone to hallucinations

I implemented a **retrieval-augmented generation (RAG)** flow with hybrid search:

- Embed the PDF once → store vectors in Pinecone (namespaced by file)
- For each question, use hybrid search (semantic + BM25 keyword) across selected documents
- Retrieve the top-K relevant chunks
- Send only those + recent chat history to OpenAI GPT-4o with a strict system prompt
- Return answers with citations (fileId, page, snippet) for transparency

This kept costs manageable, answers grounded, and enables multi-document conversations.

### 2. UX for Long-Running Operations Matters

Parsing, embedding, and indexing PDFs isn't instant. Instead of blocking the user, I:

- Added an `uploadStatus` field (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`)
- Real-time status updates via Server-Sent Events (SSE) - no polling!
- Show clear states:
  - "Loading your document…"
  - "Processing your document…" (with progress)
  - "Processing failed, please re-upload"
  - "Ready to chat" (with thumbnail, summary, entities)
- Generate thumbnails and AI summaries during processing
- Extract key entities (people, orgs, dates) for quick reference

The app feels way less "mysterious" and more like a proper product.

### 3. Safety & Cost Controls Are Non-Negotiable

Since the app calls external APIs and accepts arbitrary input, I added:

- Zod validation for request bodies + env vars
- Rate limiting by IP for uploads and messages
- Input sanitization (strip obvious script/JS patterns)
- Security headers + CSP to reduce XSS / framing risk

This is the difference between “cool demo” and “I’d actually deploy this”.

## Tech Stack Summary

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind
- **Backend:** Server Actions, Prisma, Next route handlers
- **AI:** OpenAI GPT-4o + Pinecone + LangChain (RAG with Hybrid Search)
- **Auth/Billing:** Clerk + Stripe
- **Storage:** Vercel Blob
- **Caching:** Upstash Redis
- **Monitoring:** Sentry + Google Analytics

---

**Questions for you all:**

- If you’ve built something similar, how did you structure your RAG pipeline?
- Any horror stories with costs, abuse, or weird PDF edge cases?
- What would you improve / do differently in this kind of app?

Happy to share code details or diagrams if people are interested.

---

**Note for posting:**

- Best subreddits: r/webdev, r/reactjs, r/MachineLearning, r/cscareerquestions
- Read the rules first (some subreddits have strict self-promo policies)
- Be ready to answer technical questions and accept feedback
- Including a screenshot of the dashboard/chat view helps
