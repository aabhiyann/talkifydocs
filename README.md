# TalkifyDocs

### AI-Powered PDF Chat Platform

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://talkifydocs.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-00C896?logoColor=white)](https://www.pinecone.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com)

Upload any PDF and chat with it using advanced AI. Ask questions, get summaries, and extract insights—all powered by Google Gemini on the free tier.

![Dashboard Preview](screenshots/dashboard.png)

---

## 🚀 Live Application

**Experience TalkifyDocs in action:**

- **Frontend:** [https://talkifydocs.vercel.app](https://talkifydocs.vercel.app)
- **Tech Stack:** 100% Free Tier (Vercel + Neon + Clerk + Gemini)

> **Note:** The app uses development Clerk authentication (supports up to 100 users). Switch to production keys for full launch.

---

## 📖 Overview

TalkifyDocs is a full-stack web application that transforms how you interact with PDF documents. Upload any document, and our AI instantly processes it, creates embeddings, and stores them in a vector database. Then chat naturally with your document—ask questions, request summaries, or extract specific information.

---

## 💼 Business Value

### Knowledge Extraction

- **Instant insights** from lengthy documents without reading everything
- **Natural language queries** instead of manual searching
- **Context-aware responses** that understand document relationships
- **Multi-document conversations** to synthesize information from multiple sources

### Time Savings

- **Automated document analysis** reduces manual review time
- **Quick answers** to specific questions
- **Smart summaries** provide overviews in seconds
- **Export conversations** for sharing insights with teams

### Accessibility

- **Free AI tier** makes advanced features accessible
- **Cloud-based** works from anywhere
- **No installation** required—just upload and chat
- **Mobile-friendly** interface for on-the-go access

---

## ✨ Features

| Feature                      | Description |
|------------------------------|-------------|
| 📄 **PDF Upload & Processing** | Upload PDFs up to 4MB, automatically extract text, and create embeddings |
| 💬 **AI-Powered Chat** | Chat with your documents using Google Gemini Pro |
| 🔍 **Semantic Search** | Vector similarity search finds relevant content across your documents |
| 📊 **Document Dashboard** | Manage all your uploaded PDFs in one place |
| ⭐ **Highlights & Bookmarks** | Save important sections for quick reference |
| 🌙 **Dark Mode** | Full dark/light theme support with accessible design |
| 🔐 **Authentication** | Secure login with Clerk (email, Google, GitHub) |
| 📤 **Export Conversations** | Download chat histories as text files |
| 🎯 **Free Tier** | Runs entirely on free services (Gemini, Vercel, Neon, Pinecone) |

---

## 🏗️ System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │  tRPC   │                 │   SQL   │                 │
│  Next.js 16     │◄───────►│    API Routes   │◄───────►│   PostgreSQL    │
│  React 19 + TS  │   API   │  (Vercel Edge)  │         │   (Neon.tech)   │
│                 │         │                 │         │                 │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                            ┌────────┴────────┐         ┌──────────────────┐
                            │   Gemini API    │         │   Pinecone DB    │
                            │  ─────────────  │         │  ─────────────── │
                            │ • Embeddings    │◄────────►│ • Vector Search  │
                            │ • Chat API      │         │ • 768 dimensions │
                            └─────────────────┘         └──────────────────┘
```

**Architecture Overview:**

- **Frontend:** React 19/TypeScript served by Vercel Edge Network
- **Backend:** Next.js API routes with tRPC for type-safe APIs
- **Database:** Managed PostgreSQL on Neon.tech with Prisma ORM
-**AI Engine:** Google Gemini for embeddings + chat
- **Vector DB:** Pinecone for semantic search over document embeddings

---

## 📸 Screenshots

### Landing Pages

| Light Mode | Dark Mode |
|------------|-----------|
| ![Light](screenshots/landing-light-mode.png) | ![Dark](screenshots/landing-dark-mode.png) |

_Beautiful, responsive design with full dark mode support_

### Dashboard & Document Management

![Dashboard](screenshots/dashboard.png)
_Clean interface for managing all your uploaded documents with status tracking_

### AI Chat Interface

| Light Mode Chat | Dark Mode Chat |
|-----------------|----------------|
| ![Chat Light](screenshots/chat-light-mode.png) | ![Chat Dark](screenshots/chat-dark-mode.png) |

_Natural conversation interface with your documents, supporting both themes_

### User Account Management

![Account Management](screenshots/account-management.png)
_Powered by Clerk for secure, flexible authentication_

### Additional Features

![How It Works](screenshots/how-it-works.png)
_Simple 3-step process: Upload → Process → Chat_

![404 Page](screenshots/404-error-page.png)
_Even our error pages are delightful (featuring our turtle mascot! 🐢)_

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** with App Router for optimal performance
- **React 19** with TypeScript for type-safe development
- **Tailwind CSS** for rapid, responsive UI design
- **tRPC** for end-to-end type safety
- **React Query** for data fetching and caching
- **Clerk** for authentication and user management

### Backend

- **Next.js API Routes** for serverless functions
- **tRPC** for type-safe API endpoints
- **Prisma** for type-safe database access
- **Google Gemini API** for AI embeddings and chat
- **Vercel Blob** for file storage

### Database & Search

- **PostgreSQL** (Neon.tech) for structured data
- **Prisma ORM** for database abstraction
- **Pinecone** for vector similarity search (768-dimension embeddings)
- **Hybrid search** combining semantic and keyword matching

### Deployment & Infrastructure

- **Vercel** for hosting and edge functions
- **GitHub Actions** for CI/CD pipeline
- **Docker** ready for containerized deployment
- **100% Free Tier** deployment (Gemini, Vercel, Neon, Pinecone, Clerk)

---

## 🎯 Key Achievements

- **Free-Tier AI Integration:** Migrated from OpenAI to Google Gemini, enabling completely free AI features
- **Modern Tech Stack:** Built with latest Next.js 16, React 19, and TypeScript 5.9
- **Production-Ready:** Deployed on Vercel with monitoring, error tracking (Sentry), and health checks
- **Accessible Design:** Full dark/light theme support with WCAG-compliant colors
- **Type-Safe:** End-to-end TypeScript with tRPC for compile-time API safety
- **Scalable Architecture:** Vector database for efficient semantic search at scale
- **Responsive Design:** Mobile-first UI that works on all devices

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trpc/uploadFile` | Upload and process PDF |
| POST | `/api/trpc/sendMessage` | Send chat message to AI |
| GET | `/api/trpc/getUserFiles` | List user's documents |
| DELETE | `/api/trpc/deleteFile` | Remove a document |
| GET | `/api/trpc/getFileMessages` | Retrieve chat history |
| POST | `/api/chat` | Stream AI responses (Gemini) |

Full type definitions available via tRPC schema introspection.

---

## 📁 Project Structure

```
talkifydocs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── (auth)/             # Authentication pages
│   │   ├── api/                # API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── chat/               # Chat interface
│   │   └── pdf/                # PDF viewer
│   ├── trpc/                   # tRPC router definitions
│   ├── lib/                    # Utilities and helpers
│   │   ├── ai/                 # AI/ML utilities
│   │   ├── upload/             # PDF processing
│   │   └── gemini.ts           # Gemini API client
│   └── config/                 # Configuration files
├── prisma/                     # Database schema
├── public/                     # Static assets
├── screenshots/                # Project screenshots
├── docs/                       # Comprehensive documentation
└── scripts/                    # Utility scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (for local development)
- PostgreSQL database (local or Neon.tech)
- API keys for:
  - Clerk (authentication)
  - Google Gemini (AI)
  - Pinecone (vector database)
  - Vercel Blob (file storage)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/aabhiyann/talkifydocs.git
cd talkifydocs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize database
npm run db:generate
npm run db:push

# Initialize Pinecone index (768 dimensions for Gemini)
npm run db:pinecone-init

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

### Environment Configuration

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/talkifydocs"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"

# AI (Google Gemini)
GOOGLE_API_KEY="your-gemini-api-key"

# Vector Database (Pinecone)
PINECONE_API_KEY="your-pinecone-api-key"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

For detailed setup instructions, see [LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)

---

## 🔒 Security Implementation

- **Authentication:** Clerk middleware protects all routes except public pages
- **Input validation:** Zod schemas validate all inputs
- **SQL injection prevention:** Prisma parameterized queries
- **XSS protection:** React automatic escaping + Content Security Policy
- **Environment variables:** Secrets never committed to repository
- **CORS:** Configured for secure cross-origin requests
- **Rate limiting:** Prevents abuse of AI endpoints

---

## 🗺️ Documentation

This project has comprehensive documentation:

- **[README.md](README.md)** - Project overview (you are here)
- **[LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)** - Development setup guide
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[FREE_SETUP_GUIDE.md](docs/FREE_SETUP_GUIDE.md)** - Free-tier deployment walkthrough
- **[TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md)** - Architecture deep dive
- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - Product vision and roadmap
- **[GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)** - Contribution guidelines

---

## 🎓 Future Enhancements

- [ ] Multi-file conversations (query across multiple PDFs)
- [ ] Audio file support (transcription + chat)
- [ ] Citation tracking (references to page numbers)
- [ ] Team collaboration features
- [ ] Custom AI training on document collections
- [ ] Mobile apps (React Native)
- [ ] Browser extension for instant PDF analysis

---

## 📬 Contact

**Abhiyan Sainju**

[![Email](https://img.shields.io/badge/Email-sainjuabhiyan321%40gmail.com-EA4335?logo=gmail&logoColor=white)](mailto:sainjuabhiyan321@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abhiyansainju-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abhiyansainju)
[![GitHub](https://img.shields.io/badge/GitHub-aabhiyann-181717?logo=github&logoColor=white)](https://github.com/aabhiyann)
[![Portfolio](https://img.shields.io/badge/Portfolio-abhiyansainju.com-FF6B6B?logo=safari&logoColor=white)](https://abhiyansainju.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for free AI API access
- **Vercel** for excellent hosting and deployment platform
- **Clerk** for authentication infrastructure
- **Pinecone** for vector database technology
- **shadcn/ui** for beautiful, accessible components

---

<p align="center">
  <strong>⭐ Star this repo if you found it useful!</strong>
</p>

<p align="center">
  <em>Built with Next.js, React, TypeScript, and Google Gemini 🚀</em>
</p>
