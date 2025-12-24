# TalkifyDocs: AI-Powered PDF Chat Platform

## At a Glance

|                |                                                                                 |
|----------------|---------------------------------------------------------------------------------|
| **What**       | Full-stack PDF chat application with AI-powered document analysis               |
| **Status**     | 🟢 LIVE at [talkifydocs.vercel.app](https://talkifydocs.vercel.app/)           |
| **Role**       | Solo Full-Stack Developer                                                       |
| **Tech Stack** | Next.js · React 19 · TypeScript · Gemini AI · PostgreSQL · Pinecone · tRPC · Prisma |

[🌐 Live Demo](https://talkifydocs.vercel.app/) · [💻 GitHub](https://github.com/aabhiyann/talkifydocs) · [📖 Docs](docs/)

---

## The Problem

**Who needs this:**
- Students analyzing research papers and textbooks
- Professionals reviewing contracts, reports, and documentation
- Researchers synthesizing information from multiple sources
- Anyone who wants to extract insights from PDFs without reading everything

**The pain points:**
- Reading entire PDFs is time-consuming
- Finding specific information requires manual searching
- No easy way to ask questions about document content
- Existing tools either expensive or require technical expertise

**Why I built this:**
I wanted to make document analysis accessible to everyone using free AI services and modern web technologies.

---

## The Solution

TalkifyDocs provides a natural, conversational interface to interact with PDF documents:

1. **Upload PDFs** - Drag and drop any PDF up to 4MB
2. **Automatic Processing** - AI extracts and indexes content
3. **Chat Naturally** - Ask questions in plain English
4. **Get Instant Answers** - AI finds and explains relevant sections

---

## Key Features

### 1. Intelligent Document Processing

- PDF text extraction using `pdf-parse` and `pdfjs`
- Text chunking with overlap for context preservation
- Vector embeddings using Google Gemini (768-dimensional)
- Storage in Pinecone vector database for fast semantic search

### 2. AI-Powered Chat

- Natural language queries powered by Google Gemini Pro
- Context-aware responses using retrieved document chunks
- Streaming responses for better UX
- Conversation history persistence

### 3. Modern User Experience

- Drag-and-drop file upload
- Real-time processing status updates
- Clean, responsive dashboard
- Full dark mode support
- Mobile-friendly interface

### 4. Enterprise-Grade Authentication

- Secure login via Clerk (email, Google, GitHub)
- User isolation (documents private by default)
- Session management
- Role-based access control ready

---

## Technical Architecture

```
┌──────────────────┐     tRPC API     ┌──────────────────┐     SQL      ┌──────────────────┐
│   Next.js 16     │◄────────────────►│   API Routes     │◄────────────►│   PostgreSQL     │
│   React 19 + TS  │                  │   + tRPC Server  │              │   (Neon.tech)    │
│   (Vercel CDN)   │                  │   (Vercel Edge)  │              │                  │
└──────────────────┘                  └────────┬─────────┘              └──────────────────┘
                                               │
                                      ┌────────┴────────┐         ┌──────────────────┐
                                      │   Gemini API    │◄────────►│   Pinecone DB    │
                                      │  ─────────────  │         │  ───────────────  │
                                      │ • Embeddings    │         │ • Vector Search  │
                                      │ • Chat (Pro)    │         │ • Hybrid Search  │
                                      └─────────────────┘         └──────────────────┘
```

### Backend Architecture

**API Layer (tRPC + Next.js)**
- Type-safe API with full TypeScript inference
- Serverless functions on Vercel Edge Network
- Input validation using Zod schemas
- React Query integration for caching
- Optimistic updates for better UX

**Database (PostgreSQL + Prisma)**
- Serverless PostgreSQL on Neon.tech
- Prisma ORM for type-safe queries
- Automatic connection pooling
- Migration management with Prisma Migrate

**AI Pipeline**
- **Embeddings:** Google Gemini `embedding-001` (768 dimensions)
- **Chat:** Google Gemini `gemini-pro` model
- **Vector Search:** Pinecone with hybrid search (semantic + keyword)
- **Text Processing:** LangChain for chunking and document loading

### Frontend Architecture

**React 19 + Next.js 16**
- App Router for optimal performance
- Server Components for reduced bundle size
- Streaming UI with Suspense
- tRPC hooks for type-safe data fetching
- Tailwind CSS for styling
- shadcn/ui components for consistency

### Deployment Infrastructure

| Component | Platform | Features |
|-----------|----------|----------|
| Frontend/Backend | Vercel | Edge Network, auto-scaling, zero config |
| Database | Neon.tech | Serverless PostgreSQL, branching |
| Vector DB | Pinecone | Managed vector search, free tier |
| AI | Google Gemini | Free embeddings + chat API |
| Auth | Clerk | Social login, user management |
| Storage | Vercel Blob | File uploads, CDN delivery |

---

## Engineering Highlights

### Challenge 1: Switching from OpenAI to Gemini

**Problem:** OpenAI's free tier is limited; needed a cost-effective alternative for embeddings and chat.

**Solution:**
- Migrated to Google Gemini API (completely free)
- Created abstraction layer for easy provider switching
- Updated vector DB dimensions from 1536 to 768
- Rebuilt Pinecone index to match new embedding dimensions

**Impact:** 100% free AI features with no quality degradation.

### Challenge 2: Type-Safe Full-Stack Development

**Problem:** Traditional REST APIs prone to runtime errors from type mismatches.

**Solution:**
- Implemented tRPC for end-to-end type safety
- Single source of truth for API contracts
- Automatic TypeScript inference in frontend
- Compile-time error detection

**Impact:** Eliminated entire class of runtime errors, faster development.

### Challenge 3: Efficient Vector Search

**Problem:** Simple similarity search returns irrelevant results for short queries.

**Solution:**
- Implemented hybrid search (semantic + keyword matching)
- Tuned chunk size (1000 chars) and overlap (200 chars)
- Added metadata filtering by document ID
- Optimized retrieval to top-4 most relevant chunks

**Impact:** Significantly improved answer relevance and accuracy.

### Challenge 4: Middleware Breaking Static Assets

**Problem:** Clerk middleware was blocking image/favicon requests, causing 404 errors.

**Solution:**
- Updated middleware matcher to exclude static file extensions:
```typescript
matcher: [
  '/((?!_next|[^?]*\\.(?:png|jpg|ico|css|js)).*)',
  '/(api|trpc)(.*)',
]
```

**Impact:** Fixed all image loading issues in production.

---

## What I Built (Technical Ownership)

✅ **Complete Full-Stack Application** - Frontend, backend, database, AI integration

✅ **PDF Processing Pipeline** - Upload, parsing, chunking, embedding generation

✅ **AI Chat System** - Semantic search + Gemini chat with streaming responses

✅ **Authentication System** - Clerk integration with protected routes

✅ **Database Design** - Prisma schema with relations, indexes, cascade deletes

✅ **Production Deployment** - Vercel CI/CD, environment configuration, monitoring

✅ **Free-Tier Optimization** - Migrated to 100% free services (Gemini, Neon, Pinecone, Clerk dev tier)

---

## What I Learned

### 1. Vector Databases in Production

Implementing semantic search taught me:
- How embedding dimensions affect vector DB configuration
- Tradeoffs between chunk size and context preservation
- Hybrid search improves results over pure vector similarity
- Namespace isolation for multi-tenant applications

### 2. Modern React Patterns

Working with React 19 and Next.js 16 taught me:
- Server Components reduce client-side JavaScript
- Streaming UI improves perceived performance
- tRPC provides amazing DX for full-stack TypeScript
- Optimistic updates make apps feel instant

### 3. Serverless Best Practices

Deploying on Vercel taught me:
- Environment variable management across environments
- Middleware configuration for authentication
- Static asset optimization
- Cold start mitigation strategies

### 4. AI API Integration

Integrating Gemini taught me:
- Embeddings enable semantic search
- Context window limitations require careful chunking
- Streaming responses improve UX
- Free tiers are generous if you optimize usage

---

## Tech Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, tRPC, Zod validation |
| **Database** | PostgreSQL (Neon.tech), Prisma ORM |
| **AI/ML** | Google Gemini (embeddings + chat), LangChain |
| **Vector DB** | Pinecone (768-d vectors) |
| **Auth** | Clerk (social login, user management) |
| **Storage** | Vercel Blob |
| **Deployment** | Vercel (Edge Network) |

---

## Key Metrics

- **Response Time:** < 2s for chat responses (streaming)
- **PDF Processing:** ~10s for typical documents
- **Uptime:** 99.9% (Vercel SLA)
- **Cost:** $0/month (100% free tier)
- **Bundle Size:** 180KB gzipped (Next.js optimizations)
- **Lighthouse Score:** 95+ (performance)

---

## Future Enhancements

- [ ] Multi-file conversations (query across multiple PDFs)
- [ ] Citation tracking with page number references
- [ ] Audio file transcription and chat
- [ ] Custom knowledge bases (upload unlimited docs)
- [ ] Team collaboration features
- [ ] Browser extension for instant PDF analysis
- [ ] Mobile apps (React Native)

---

## Try It Live

🌐 **Demo:** [talkifydocs.vercel.app](https://talkifydocs.vercel.app/)

💻 **Source Code:** [github.com/aabhiyann/talkifydocs](https://github.com/aabhiyann/talkifydocs)

📖 **Documentation:** [Full docs available](docs/)

---

## Impact

This project demonstrates:
- ✅ Modern full-stack development with latest technologies
- ✅ AI integration using vector databases and LLMs
- ✅ Production deployment on serverless infrastructure
- ✅ Cost optimization (100% free tier operation)
- ✅ Type-safe development practices
- ✅ Accessible, responsive UI/UX

---

_Built with Next.js, React, TypeScript, and Google Gemini_ 🚀
