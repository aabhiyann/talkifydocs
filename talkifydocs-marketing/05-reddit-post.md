# Reddit Post (r/webdev, r/reactjs, r/MachineLearning)

---

**Title:** I built an AI-powered PDF assistant with Next.js + OpenAI + Pinecone. Here’s what I learned about “Chat with PDF” in production.

**Subreddits:** r/webdev, r/reactjs, r/MachineLearning, r/cscareerquestions

---

**Post Body:**

I just shipped a full-stack AI app where you can upload PDFs and then *chat with them* in natural language. Thought I’d share what I learned building a “Chat with PDF” experience that feels like a real product, not just an OpenAI toy.

**Live demo:** https://YOUR-TALKIFYDOCS-URL  
**Source:** https://github.com/YOUR_USERNAME/talkifydocs  

## The Project

**TalkifyDocs** is an AI-powered PDF assistant:

- Users upload PDFs through a dashboard  
- The app parses and indexes them into a vector database  
- You can ask questions like “Summarize section 3” or “What are the main risks in this contract?”  
- Answers are grounded in the document, not just generic LLM responses  

Tech stack:

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind  
- **Backend:** Next route handlers + tRPC + Prisma  
- **AI:** OpenAI Chat Completions + embeddings, LangChain  
- **Vector DB:** Pinecone  
- **Auth:** Kinde  
- **Billing:** Stripe  
- **Uploads:** UploadThing  

## 3 Things Building This Taught Me

### 1. RAG > Just Calling the OpenAI API

Naively sending an entire PDF (or giant chunks of it) to the model is:

- Expensive (lots of tokens)  
- Slow  
- Still prone to hallucinations  

I implemented a **retrieval-augmented generation (RAG)** flow instead:

- Embed the PDF once → store vectors in Pinecone  
- For each question, retrieve the top-K relevant chunks  
- Send only those + recent chat history to OpenAI with a strict system prompt  

This kept costs manageable and answers much more grounded.

### 2. UX for Long-Running Operations Matters

Parsing, embedding, and indexing PDFs isn’t instant. Instead of blocking the user on a blank screen, I:

- Added an `uploadStatus` field (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`)  
- Poll the status on the chat page and show clear states:
  - “Loading your document…”  
  - “Processing your document…”  
  - “Processing failed, please re-upload”  
  - “Ready to chat”  

The app feels way less “mysterious” and more like a proper product.

### 3. Safety & Cost Controls Are Non-Negotiable

Since the app calls external APIs and accepts arbitrary input, I added:

- Zod validation for request bodies + env vars  
- Rate limiting by IP for uploads and messages  
- Input sanitization (strip obvious script/JS patterns)  
- Security headers + CSP to reduce XSS / framing risk  

This is the difference between “cool demo” and “I’d actually deploy this”.

## Tech Stack Summary

- **Frontend:** Next.js 14, React, TypeScript, Tailwind  
- **Backend:** tRPC, Prisma, Next route handlers  
- **AI:** OpenAI + Pinecone + LangChain (RAG)  
- **Auth/Billing:** Kinde + Stripe  
- **Uploads:** UploadThing  

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


