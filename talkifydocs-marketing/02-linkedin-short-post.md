# LinkedIn Short Post (300–500 words)

---

I just finished building **TalkifyDocs** – an AI-powered PDF assistant where you can upload documents and then _chat with them_ in natural language.

Instead of scrolling and Ctrl+F-ing through 80-page PDFs, you:

- Upload a PDF
- Wait a few seconds while it’s processed
- Ask questions like “Summarize section 3” or “What are the key risks in this contract?”

Under the hood, it uses:

- **Next.js 14 + React + TypeScript** for the app and dashboard
- **Prisma + PostgreSQL** for users, files, and message history
- **Clerk** for authentication (hosted auth with prebuilt UI + social login)
- **UploadThing** for PDF uploads
- **OpenAI + Pinecone + LangChain** for retrieval-augmented generation (RAG)
- **Stripe** for subscription billing (Free vs Pro plans)

What I focused on:

**1. Trustworthy “Chat with PDF”**  
Naively calling the OpenAI API isn’t enough. I implemented a RAG pipeline:

- Embed each PDF into vectors once
- On each question, retrieve only the most relevant chunks from Pinecone
- Feed those + recent conversation into OpenAI with a strict system prompt  
  The model is instructed to answer _only_ from the retrieved context or say “I don’t know.”

**2. Production-Ready UX**  
Long-running work (parsing, embedding, indexing) runs server-side with:

- A `PENDING → PROCESSING → SUCCESS / FAILED` status on each file
- A dashboard that shows clean states: loading, processing, failed, ready
- Streaming responses in the chat UI so answers appear in real time

**3. Safety & Reliability**  
I added:

- Zod-based validation for env vars and request bodies
- Rate limiting for uploads and chat messages
- Security headers (CSP, frame/XSS protection)
- Centralized logging and error handling

It ended up feeling less like a “toy GPT wrapper” and more like a small SaaS product.

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
