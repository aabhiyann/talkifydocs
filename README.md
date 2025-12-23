## TalkifyDocs v2.0

AI-powered PDF assistant that lets you upload documents and chat with them using natural language. Built with Next.js 16, React 19, Clerk authentication, and advanced AI capabilities including multi-document conversations, highlights, and admin dashboard.

**Key Features:**

- 📄 Upload and chat with PDFs using AI
- 🔀 Multi-document conversations (up to 5 files)
- ⭐ Save highlights and bookmarks
- 📤 Export and share conversations
- 🎯 Public demo mode (no sign-up required)
- 👨‍💼 Admin dashboard with user management
- 🚀 Production-ready with monitoring and caching

### Docs Index

- **Context & Overview**
  - `PROJECT_OVERVIEW.md` – High-level product overview, architecture, and v2.0 goals
  - `CONTEXT.md` – Project context, tech stack, architecture principles, code style

- **Specifications**
  - `SOFTWARE_REQUIREMENTS.md` – Functional & non-functional requirements (SRD)
  - `TECHNICAL_DESIGN.md` – System architecture, Prisma schema, component architecture

- **Execution Plan**
  - `IMPLEMENTATION_PHASES.md` – Phase-by-phase implementation plan for v2.0

### Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the example or create .env.local manually
   # See LOCAL_DEVELOPMENT.md for all required variables
   ```

3. **Set up database:**

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

**📖 For detailed setup instructions, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)**

### Required Services

- **PostgreSQL** database (local or cloud like Neon/Supabase)
- **Clerk** account for authentication
- **Google Gemini** API key for primary AI features
- **Groq** API key for high-speed fallback
- **Pinecone** account for vector storage
- **Vercel Blob** for file storage
- **Stripe** account (for billing features)

All setup instructions are in [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
