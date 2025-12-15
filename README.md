## TalkifyDocs v2.0

AI-powered PDF assistant that lets you upload documents and chat with them using natural language. This is the v2.0 modernization of the original TalkifyDocs app, focusing on 2025 best practices, performance, and UX.

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
- **OpenAI** API key for AI features
- **Pinecone** account for vector storage
- **Vercel Blob** for file storage
- **Stripe** account (for billing features)

All setup instructions are in [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
