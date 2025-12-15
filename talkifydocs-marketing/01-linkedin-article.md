---
title: "TalkifyDocs: Building an AI-Powered PDF Assistant with Next.js, OpenAI, and Pinecone"
published: false
description: "What I learned building a production-ready AI app where users can upload PDFs and chat with them, powered by Next.js 14, OpenAI, Pinecone, and a modern SaaS UX."
tags: ai, nextjs, react, fullstack, machinelearning
---

# TalkifyDocs: Building an AI-Powered PDF Assistant with Next.js, OpenAI, and Pinecone

**TL;DR:** I built **TalkifyDocs**, a full-stack AI app where users upload PDFs and then chat with their documents. Under the hood it uses Next.js 14, Prisma, Kinde, Stripe, UploadThing, OpenAI, and Pinecone. This is what I learned about building production-ready AI apps vs. just hacking with the OpenAI API.

> Replace these before posting:
> - Live demo: `https://YOUR-TALKIFYDOCS-URL`
> - Repo: `https://github.com/YOUR_USERNAME/talkifydocs`
> - Portfolio: `https://your-portfolio.com/projects/talkifydocs`

🔗 **Live Demo:** YOUR DEMO LINK HERE  
💻 **Source Code:** YOUR REPO LINK HERE  
🌐 **Case Study:** YOUR PORTFOLIO LINK HERE  

---

## The Problem

PDFs are where a lot of serious knowledge lives: research papers, contracts, technical docs, onboarding guides, you name it. But actually **using** that knowledge is painful:

- You’re constantly **Ctrl+F-ing** through 80-page PDFs.
- Answers depend on subtle context scattered across multiple sections.
- Sharing a document with a teammate doesn’t easily share your understanding of it.

I wanted to build a tool where:

- You upload a PDF.
- The system understands and indexes it.
- You ask questions in natural language.
- You get answers grounded in the document (not hallucinations).

That became **TalkifyDocs**.

---

## My Approach

I designed TalkifyDocs with three principles:

1. **Trustworthiness** – Answers must be grounded in the PDF, not “magic AI guesses”.
2. **Production Readiness** – The system should be deployable, debuggable, and safe to expose to real users.
3. **SaaS-Grade UX** – The experience should feel like a polished SaaS app, not a demo.

### Core Capabilities

**1. Upload & Index PDFs**

- Authenticated users upload PDFs through a polished dashboard UI.
- The backend downloads the file, validates it, extracts text per page, and embeds it using OpenAI.
- Embeddings are stored in a Pinecone index, namespaced by file.

**2. Chat with Your Document**

- The chat UI lets you ask natural-language questions.
- The backend:
  - Runs a vector similarity search in Pinecone to find the most relevant chunks.
  - Combines them with recent conversation history.
  - Calls OpenAI Chat Completions to generate a response.
  - Streams the answer back to the UI and stores both sides of the conversation.

**3. Billing & Plans**

- Free vs Pro plans with different quotas (number of documents/pages).
- Stripe subscriptions with a portal for managing billing.
- Plan enforcement on the backend, with plan metadata on the `User` record.

---

## Architecture Overview

TalkifyDocs is built as a modern full-stack app on top of Next.js 14’s App Router.

### Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/Radix-style UI components
- **Backend:** Next.js route handlers, tRPC, Prisma ORM
- **AI & Search:** OpenAI Chat Completions, LangChain, Pinecone vector DB
- **Auth & Billing:** Kinde (auth), Stripe (subscriptions)
- **Uploads & Storage:** UploadThing (file uploads), PostgreSQL (Neon/Railway/etc.)

### High-Level Flow

1. **User signs in** via Kinde and lands on the dashboard.
2. **User uploads a PDF** using UploadThing.
3. **Backend processes PDF**:
   - Downloads it from storage.
   - Extracts text per page via LangChain `PDFLoader`.
   - Embeds content using OpenAI embeddings.
   - Stores vectors in Pinecone.
4. **User opens a document** and starts chatting.
5. **For each question**:
   - Validate + rate-limit the request.
   - Ensure the user owns the file.
   - Query Pinecone for relevant chunks.
   - Call OpenAI with retrieved context + chat history.
   - Stream the answer back and persist it in the DB.

---

## Key Technical Challenges

### 1. Making “Chat with PDF” Actually Trustworthy

**The Problem:** Naively calling the OpenAI API with the entire document doesn’t scale (too many tokens) and doesn’t guarantee grounded answers.

**My Solution:**

- Implemented a **retrieval-augmented generation (RAG)** flow:
  - Embed the document once.
  - At query time, retrieve the top-N most relevant chunks from Pinecone.
  - Pass those plus recent messages into OpenAI as context.
- Added a strict system prompt:
  - “Only answer using the provided context; if you don’t know, say you don’t know.”

**Impact:** Responses stay grounded in the PDF, and token usage stays manageable.

---

### 2. Keeping the UX Smooth During Heavy Processing

**The Problem:** PDF parsing, embedding, and vector writes can be slow and brittle, especially for larger documents or flaky networks.

**My Solution:**

- Introduced an `uploadStatus` field on `File` (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).
- On upload:
  - Create a `File` row with `PROCESSING`.
  - Start processing in the backend handler with robust error handling and timeouts.
  - On success, update to `SUCCESS`; on failure, set to `FAILED`.
- On the frontend:
  - The chat page **polls** `getFileUploadStatus` via tRPC.
  - Shows distinct UIs for:
    - “Loading your document”
    - “Processing your document”
    - “Processing failed – please re-upload”
    - “Ready to chat”

**Impact:** Users always know what’s happening, rather than staring at a spinner and guessing.

---

### 3. Balancing Power with Safety (Validation, Rate Limiting, Security)

**The Problem:** Exposing powerful AI endpoints can be abused (spam, huge requests) and interacts with untrusted inputs (user text, uploaded PDFs).

**My Solution:**

- **Env validation:** Zod-based schema for all env vars (DB, OpenAI, Pinecone, Stripe, UploadThing, Kinde). Fails fast when misconfigured.
- **Rate limiting:** In-memory rate limiting keyed by IP + operation type:
  - Separate budgets for uploads, messages, and general API calls.
- **Input validation & sanitization:**
  - Zod schemas for messages and file metadata.
  - Sanitization of strings to strip obvious script/JS patterns.
- **Security headers & CSP:**
  - Strict headers for XSS, content type, and framing.

**Impact:** The app behaves like a real product, not just a playground: safer, more predictable, and debuggable.

---

## Why I Chose This Stack

- **Next.js 14 App Router:** Great DX for mixing server and client components, plus built-in route handlers for APIs and auth flows.
- **tRPC:** End-to-end type safety between client and server, with React Query integration for caching and invalidation.
- **Prisma:** Type-safe DB layer and clean modeling for `User`, `File`, and `Message`.
- **OpenAI + Pinecone + LangChain:** Standard, battle-tested building blocks for RAG.
- **Kinde + Stripe + UploadThing:** Let me focus on product logic rather than reinventing auth, billing, and file uploads.

Overall, this combination let me move fast while still keeping a clean architecture.

---

## What I Learned

### 1. Production AI ≠ Just Calling an API

It’s easy to build a one-off OpenAI demo. It’s much harder to:

- Make answers trustworthy.
- Handle failures gracefully.
- Keep costs under control.
- Make the UX feel “SaaS-grade” instead of “hacky demo”.

The core patterns that mattered:

- Retrieval-augmented generation instead of naive prompts.
- Streaming responses for UX.
- Separate “upload” from “processing” from “chat”.

### 2. UX and Infrastructure Choices Matter as Much as Models

TalkifyDocs forced me to think beyond the model:

- How do we **visualize progress** when a document is processing?
- How do we prevent a single user from hammering the message endpoint?
- How do we structure the DB so conversation history is easy to query and display?

### 3. End-to-End Ownership is a Superpower

Owning everything from schema design to API contracts, security, and UI made me more aware of trade-offs:

- Schema choices affect query performance and UX.
- API design affects how easy it is to build a responsive React UI.
- Error handling affects how confident users feel in the product.

---

## Tech Stack Summary

| Category     | Technologies                                                                 |
|-------------|------------------------------------------------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18, TypeScript, Tailwind, shadcn/Radix UI    |
| Backend     | Next.js route handlers, tRPC, Prisma                                        |
| AI & Search | OpenAI Chat Completions, OpenAI Embeddings, LangChain, Pinecone             |
| Auth        | Kinde Auth                                                                  |
| Billing     | Stripe subscriptions + webhooks                                            |
| Uploads     | UploadThing                                                                 |
| Database    | PostgreSQL (via Prisma)                                                     |

---

## Try It Yourself

> Replace with your actual links before posting.

**Live Demo:** YOUR DEMO LINK HERE  
**Login:** example credentials if you have a demo user  
**Source Code:** YOUR REPO LINK HERE  
**Case Study:** YOUR PORTFOLIO LINK HERE  

---

If you’ve built something similar—or you’re exploring AI + Next.js + RAG patterns—I’d love to connect and hear what you learned.

**Hashtags to consider:**  
`#AI` `#NextJS` `#React` `#MachineLearning` `#FullStack` `#SoftwareEngineering`


