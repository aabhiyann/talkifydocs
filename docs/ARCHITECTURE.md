# TalkifyDocs Architecture & Deployment Explanation

## 🏗️ Overview: How Everything is Hosted

TalkifyDocs uses a **modern serverless architecture** where different components are hosted on **different service providers**:

```
┌─────────────────┐    HTTP/HTTPS Requests    ┌──────────────────┐    Database Connection    ┌─────────────────┐
│    Vercel       │◄───────────────────────────►│   Vercel Edge    │◄─────────────────────────►│   Neon.tech     │
│   (Frontend)    │                             │   (API Routes)   │                            │  (Database)     │
│   Next.js App   │                             │   tRPC Server    │                            │  PostgreSQL     │
│   Static +SSR   │                             │   Serverless     │                            │   Managed DB    │
└─────────────────┘                             └──────┬───────────┘                            └─────────────────┘
  Same Infrastructure                                   │
  (Vercel Deployment)                          ┌────────┴────────┐         ┌──────────────────┐
                                               │   Gemini API    │         │   Pinecone DB    │
                                               │  ─────────────  │         │  ─────────────── │
                                               │ • Embeddings    │◄────────►│ • Vector Search  │
                                               │ • Chat API      │         │ • 768 dimensions │
                                               └─────────────────┘         └──────────────────┘
```

### Key Points:
- **Frontend + Backend (Next.js)**: Hosted on **Vercel** (single deployment, edge network)
- **Database (PostgreSQL)**: Hosted on **Neon.tech** (serverless PostgreSQL)
- **AI (Gemini)**: Google's cloud-based API
- **Vector DB (Pinecone)**: Managed vector database service
- **File Storage**: Vercel Blob (integrated with Vercel platform)

**Advantage over traditional architecture:** Everything runs serverless with zero-downtime scaling.

---

## 🔌 How They Connect: Communication Flow

### 1. User → Frontend (Next.js/React)

The user accesses the application through their browser. Vercel serves:
- **Static files** (HTML, CSS, JS) from the global CDN
- **Server-rendered pages** for SEO and performance
- **API routes** for backend logic

#### How Routing Works:

```typescript
// src/app/layout.tsx - Root layout
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- **App Router:** Next.js 16 App Router provides file-based routing
- **Layouts:** Shared layouts with authentication state
- **Streaming:** React 19 Server Components stream UI to the client

---

### 2. Frontend → Backend (tRPC API)

The frontend communicates with the backend using **tRPC** for type-safe API calls.

#### Configuration Location:
```typescript
// src/trpc/client.ts
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});
```

#### How It Works:
1. **Type-Safe Calls:** Frontend calls backend procedures with full TypeScript autocomplete
2. **Automatic Serialization:** tRPC handles JSON serialization automatically
3. **Batching:** Multiple requests can be batched into a single HTTP call
4. **Streaming:** Supports streaming responses for real-time updates

#### Example API Call:
```typescript
// src/components/UploadButton.tsx
const { mutate: uploadFile } = trpc.uploadFile.useMutation({
  onSuccess: () => {
    refresh.files();
  },
});
```

**Flow:**
- User clicks upload button
- React component calls `uploadFile.mutate()`
- tRPC sends request to `/api/trpc/uploadFile`
- Backend processes, returns typed response
- React Query caches result and updates UI

---

### 3. Backend → Database (Prisma + PostgreSQL)

The backend connects to the database using **Prisma ORM** with connection pooling.

#### Configuration Location:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### How It Works:
1. **Connection String:** Backend reads `DATABASE_URL` from environment variables
2. **Vercel Configuration:** Set in Vercel dashboard:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/talkifydocs"
   ```
3. **Connection Pooling:** Prisma creates a connection pool for efficiency

#### Database Connection Code:
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

**Flow:**
- API route receives request
- tRPC procedure queries database using Prisma
- Prisma generates SQL and executes against Neon.tech
- Data returned, formatted, sent to frontend

---

### 4. Backend → Gemini AI

The backend communicates with Google's Gemini API for AI features.

#### Configuration:
```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const model = genAI.getGenerativeModel({
  model: AI.GEMINI_MODEL, // "gemini-pro"
});
```

#### Embeddings Generation:
```typescript
// src/lib/gemini.ts
export const getGeminiEmbeddings = async () => {
  const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
  return new GoogleGenerativeAIEmbeddings({
    modelName: AI.GEMINI_EMBEDDING_MODEL, // "embedding-001"
    apiKey: env.GOOGLE_API_KEY,
  });
};
```

**Flow:**
1. PDF uploaded → Text extracted
2. Text sent to Gemini Embeddings API
3. Returns 768-dimensional vectors
4. Vectors stored in Pinecone

---

### 5. Backend → Pinecone (Vector Database)

The backend stores and queries document embeddings in Pinecone.

#### Configuration:
```typescript
// src/lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });
  return client;
};
```

#### Vector Operations:
```typescript
// src/lib/upload/process-pdf.ts
const pinecone = await getPineconeClient();
const pineconeIndex = pinecone.index(PINECONE_INDEX_NAME);

// Store embeddings
await PineconeStore.fromDocuments(
  documents,
  embeddings,
  {
    pineconeIndex,
    namespace: file.id,
  }
);
```

**Flow:**
1. User asks question
2. Question embedded using Gemini
3. Vector search in Pinecone finds similar document chunks
4. Relevant chunks sent to Gemini for answer generation

---

## 📁 Code Breakdown by Component

### Frontend (React/TypeScript) - Vercel

#### 1. App Router Structure
```
src/app/
├── (dashboard)/           # Protected dashboard routes
│   ├── dashboard/         # Main dashboard
│   ├── highlights/        # Saved highlights
│   └── layout.tsx         # Dashboard layout with auth
├── (auth)/                # Authentication pages
│   ├── sign-in/
│   └── sign-up/
├── api/                   # API routes
│   ├── trpc/              # tRPC endpoint
│   └── chat/              # Streaming chat endpoint
├── layout.tsx             # Root layout
└── page.tsx               # Landing page
```

#### 2. Component Architecture
```typescript
// src/components/chat/ChatInput.tsx
export const ChatInput = ({ fileId }: { fileId: string }) => {
  const { mutate: sendMessage } = trpc.sendMessage.useMutation();

  const handleSubmit = (message: string) => {
    sendMessage({ fileId, message });
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

**Explanation:**
- Components use React 19 features (hooks, Suspense)
- tRPC hooks provide type-safe API access
- React Query handles caching and optimistic updates

---

### Backend (Next.js API Routes) - Vercel

#### 1. tRPC Router Definition
```typescript
// src/trpc/index.ts
export const appRouter = router({
  uploadFile: privateProcedure
    .input(z.object({ /* ... */ }))
    .mutation(async ({ ctx, input }) => {
      // Upload to Vercel Blob
      // Extract text from PDF
      // Generate embeddings
      // Store in Pinecone
      // Save metadata to PostgreSQL
    }),

  sendMessage: privateProcedure
    .input(z.object({ fileId: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Query Pinecone for relevant chunks
      // Send to Gemini for response
      // Save conversation to database
    }),
});
```

#### 2. PDF Processing Pipeline
```typescript
// src/lib/upload/process-pdf.ts
export async function processPdf(file: File) {
  // 1. Extract text
  const loader = new PDFLoader(file);
  const docs = await loader.load();

  // 2. Split into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await textSplitter.splitDocuments(docs);

  // 3. Generate embeddings
  const embeddings = await getGeminiEmbeddings();

  // 4. Store in Pinecone
  await PineconeStore.fromDocuments(chunks, embeddings, {
    pineconeIndex,
    namespace: fileId,
  });
}
```

---

### Database (PostgreSQL) - Neon.tech

#### Schema Design
```prisma
// prisma/schema.prisma
model File {
  id            String   @id @default(cuid())
  name          String
  url           String
  key           String
  size          BigInt
  uploadStatus  UploadStatus
  userId        String
  createdAt     DateTime @default(now())

  messages      Message[]
  conversations ConversationFile[]

  @@index([userId])
}

model Message {
  id            String   @id @default(cuid())
  text          String
  isUserMessage Boolean
  fileId        String
  userId        String

  file          File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@index([fileId])
}
```

---

## 🔄 Complete Request Flow Example

### Example: User uploads a PDF

1. **Frontend (Vercel)**:
   ```typescript
   // User selects file
   const uploadFile = trpc.uploadFile.useMutation();
   uploadFile.mutate({ file });
   ```

2. **API Route (Vercel Edge)**:
   ```typescript
   // tRPC route handler
   uploadFile: async ({ input }) => {
     // 1. Upload to Vercel Blob
     const blob = await put(file.name, file, { access: 'public' });

     // 2. Create database record
     const dbFile = await db.file.create({
       data: { name, url: blob.url, userId }
     });

     // 3. Process PDF in background
     await processPdf(file, dbFile.id);
   }
   ```

3. **PDF Processing**:
   ```typescript
   // Extract text, chunk, embed
   const chunks = await extractAndChunk(pdf);
   const embeddings = await getGeminiEmbeddings();
   const vectors = await embeddings.embedDocuments(chunks);
   ```

4. **Pinecone Storage**:
   ```typescript
   // Store vectors
   await pineconeIndex.upsert({
     vectors: vectors.map((v, i) => ({
       id: `${fileId}-chunk-${i}`,
       values: v,
       metadata: { text: chunks[i], fileId },
     })),
   });
   ```

5. **Response Chain**:
   - Pinecone confirms storage → Backend updates DB status → Frontend refreshes file list

---

## 🌐 Environment Variables: The Glue That Connects Everything

### Vercel Environment Variables:
```bash
# Database
DATABASE_URL="postgresql://user:pass@neon.tech/db"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"

# AI
GOOGLE_API_KEY="your-gemini-key"

# Vector DB
PINECONE_API_KEY="your-pinecone-key"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

**Purpose:**
- Keeps secrets out of code
- Different values for dev/staging/production
- Easy to rotate credentials

---

## 🐳 Deployment Architecture

### Vercel Deployment:
```yaml
# vercel.json (auto-detected)
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"] // US East
}
```

### Build Process:
1. **Install Dependencies:** `npm install`
2. **Generate Prisma Client:** `prisma generate` (postinstall)
3. **Build Next.js:** `next build`
4. **Deploy to Edge:** Vercel's global CDN

### Serverless Functions:
- **API Routes:** Auto-deployed as serverless functions
- **ISR Pages:** Static with revalidation
- **SSR Pages:** Server-rendered on-demand

---

## 🔐 Security Architecture

### 1. Authentication (Clerk)
```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

### 2. Authorization
```typescript
// tRPC context
export const createContext = async () => {
  const { userId } = await auth();
  return { userId, db };
};

// Procedures check userId
privateProcedure.query(async ({ ctx }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  // ...
});
```

### 3. Input Validation
```typescript
// Zod schemas
const uploadSchema = z.object({
  file: z.instanceof(File).refine(f => f.size <= 4 * 1024 * 1024),
});
```

---

## 📊 Summary: The Big Picture

| Component | Technology | Hosting | Communication | Purpose |
|-----------|-----------|---------|---------------|---------|
| **Frontend** | Next.js/React | Vercel Edge | Browser requests | UI + routing |
| **Backend** | Next.js API | Vercel Serverless | HTTP/tRPC | Business logic |
| **Database** | PostgreSQL | Neon.tech | SQL over HTTPS | Persistent data |
| **AI** | Gemini API | Google Cloud | REST API | Embeddings + chat |
| **Vector DB** | Pinecone | Pinecone Cloud | gRPC | Semantic search |
| **Storage** | Vercel Blob | Vercel | HTTPS | File storage |

### Communication Path:
```
User Browser → Vercel Edge (Frontend) → Vercel Functions (API) → Neon (DB) / Gemini (AI) / Pinecone (Vectors)
```

### Key Technologies:
- **tRPC**: Type-safe API communication
- **Prisma**: Type-safe database access
- **Next.js**: Full-stack React framework
- **Clerk**: Authentication as a service
- **LangChain**: AI framework for embeddings/search

---

## 🎓 Learning Points

1. **Serverless Architecture**: No servers to manage, auto-scaling
2. **Type Safety**: End-to-end TypeScript prevents runtime errors
3. **Edge Computing**: Global CDN reduces latency
4. **Vector Databases**: Enable semantic search over document content
5. **AI Integration**: Modern apps increasingly use AI APIs
6. **Separation of Concerns**: Data layer (DB) separate from compute (API) separate from presentation (UI)

---

This architecture is called a **"Jamstack + AI"** architecture, where:
- **J**avaScript frontend (React)
- **A**PIs for backend (tRPC/Next.js)
- **M**arkup prerendered (Next.js SSG/ISR)
- **+ AI** for intelligent features (Gemini)

Each component scales independently and runs on specialized infrastructure optimized for its specific needs.
