## TalkifyDocs v2.0 – Technical Design Document

### 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                       │
│  Next.js 15 App Router (React 19, TypeScript, Tailwind)    │
│  - Server Components for static content                    │
│  - Client Components for interactive UI                    │
│  - Streaming SSR for optimal performance                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API/SERVER LAYER                      │
│  Next.js Route Handlers + Server Actions                   │
│  - Authentication middleware (Clerk)                       │
│  - Rate limiting (Upstash Redis)                           │
│  - Input validation (Zod)                                  │
│  - Error handling + logging (Sentry)                       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │   AI Stack   │  │   Storage    │
│   (Prisma)   │  │              │  │              │
│              │  │ - OpenAI API │  │ - Vercel     │
│ - Users      │  │ - Pinecone   │  │   Blob       │
│ - Files      │  │ - LangChain  │  │ - Cloudflare │
│ - Messages   │  │ - Hybrid     │  │   R2 (alt)   │
│ - Highlights │  │   Search     │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

### 2. Database Schema Updates (`prisma/schema.prisma`)

```text
model User {
  id                  String              @id @default(cuid())
  clerkId             String              @unique
  email               String              @unique
  name                String?
  imageUrl            String?
  tier                UserTier            @default(FREE)
  stripeCustomerId    String?             @unique
  stripeSubscriptionId String?            @unique
  subscriptionStatus  SubscriptionStatus?

  files               File[]
  messages            Message[]
  highlights          Highlight[]
  conversations       Conversation[]

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([clerkId])
  @@index([email])
}

enum UserTier {
  FREE
  PRO
  ADMIN
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}

model File {
  id                String      @id @default(cuid())
  name              String
  key               String      @unique
  url               String
  size              Int
  pageCount         Int?
  uploadStatus      UploadStatus @default(PENDING)
  processingError   String?

  // New fields
  thumbnailUrl      String?
  summary           String?     @db.Text
  entities          Json?       // {people: [], dates: [], organizations: []}
  metadata          Json?       // {author, createdDate, modifiedDate, etc}

  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  messages          Message[]
  highlights        Highlight[]
  conversationFiles ConversationFile[]

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId])
  @@index([uploadStatus])
}

model Conversation {
  id                String      @id @default(cuid())
  title             String?

  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  files             ConversationFile[]
  messages          Message[]

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId])
}

model ConversationFile {
  id              String        @id @default(cuid())

  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  fileId          String
  file            File          @relation(fields: [fileId], references: [id], onDelete: Cascade)

  addedAt         DateTime      @default(now())

  @@unique([conversationId, fileId])
}

model Message {
  id              String        @id @default(cuid())
  text            String        @db.Text
  isUserMessage   Boolean
  citations       Json?         // [{fileId, pageNumber, snippet}]

  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  fileId          String?
  file            File?         @relation(fields: [fileId], references: [id], onDelete: SetNull)

  conversationId  String?
  conversation    Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  createdAt       DateTime      @default(now())

  @@index([userId])
  @@index([fileId])
  @@index([conversationId])
}

model Highlight {
  id              String        @id @default(cuid())
  question        String        @db.Text
  answer          String        @db.Text
  citations       Json?

  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  fileId          String
  file            File          @relation(fields: [fileId], references: [id], onDelete: Cascade)

  createdAt       DateTime      @default(now())

  @@index([userId])
  @@index([fileId])
}

model RateLimit {
  id              String        @id @default(cuid())
  identifier      String        // userId or IP
  operation       String        // 'upload', 'chat', 'api'
  count           Int
  windowStart     DateTime

  @@unique([identifier, operation])
  @@index([windowStart])
}
```

---

### 3. Component Architecture

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Document grid
│   │   │   └── loading.tsx
│   │   ├── chat/
│   │   │   └── [conversationId]/
│   │   │       ├── page.tsx                # Split-screen chat
│   │   │       └── loading.tsx
│   │   └── highlights/
│   │       └── page.tsx                    # Saved Q&As
│   ├── (marketing)/
│   │   ├── page.tsx                        # Landing page
│   │   ├── demo/page.tsx                   # Public demo
│   │   ├── pricing/page.tsx
│   │   └── docs/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx                    # Admin dashboard
│   │       └── users/page.tsx
│   ├── api/
│   │   ├── uploadthing/route.ts
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts
│   │   ├── chat/route.ts                   # Streaming endpoint
│   │   ├── process-upload/route.ts         # SSE status
│   │   └── embeddings/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                                 # shadcn components
│   ├── dashboard/
│   │   ├── DocumentGrid.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── UploadZone.tsx
│   │   └── ProcessingStatus.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── CitationHighlight.tsx
│   │   └── MultiDocSelector.tsx
│   ├── highlights/
│   │   └── HighlightCard.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Demo.tsx
│   │   └── Pricing.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ThemeToggle.tsx
├── lib/
│   ├── db.ts                               # Prisma client
│   ├── auth.ts                             # Clerk helpers
│   ├── stripe.ts                           # Stripe client
│   ├── redis.ts                            # Upstash Redis
│   ├── ai/
│   │   ├── embeddings.ts                   # OpenAI embeddings
│   │   ├── chat.ts                         # Chat completions
│   │   ├── pinecone.ts                     # Vector store
│   │   ├── hybrid-search.ts                # Semantic + keyword
│   │   └── entity-extraction.ts            # NER
│   ├── upload/
│   │   ├── process-pdf.ts                  # PDF parsing
│   │   ├── generate-thumbnail.ts
│   │   └── extract-metadata.ts
│   ├── utils/
│   │   ├── validation.ts                   # Zod schemas
│   │   ├── rate-limit.ts
│   │   ├── errors.ts                       # Custom error classes
│   │   └── logger.ts                       # Structured logging
│   └── constants.ts
├── hooks/
│   ├── useChat.ts
│   ├── useUploadStatus.ts
│   ├── useHighlights.ts
│   └── useSubscription.ts
├── actions/
│   ├── upload.ts                           # Server Actions
│   ├── chat.ts
│   ├── highlights.ts
│   └── admin.ts
└── types/
    ├── index.ts
    ├── api.ts
    └── database.ts
```

---

### 4. Key Technical Decisions

#### 4.1 Authentication: Clerk (replacing Kinde)

- **Rationale**:
  - Better DX with prebuilt components
  - More social providers
  - Built-in middleware for Next.js
  - Better webhook handling
  - Org/team support for future expansion

#### 4.2 Streaming: Server-Sent Events

- **Rationale**:
  - Replace polling with real-time updates
  - Lower latency for processing status
  - Better UX during long-running operations
  - Native browser support

#### 4.3 AI Stack Upgrades

- **Current → New**:
  - OpenAI GPT-3.5 → **GPT-4o** or **Claude 3.5 Sonnet**
  - Basic RAG → **Hybrid Search** (semantic + BM25)
  - Single document → **Multi-document conversations**
  - No re-ranking → **Cohere re-rank** for better precision

#### 4.4 State Management: Zustand

- **Rationale**:
  - Lighter than Redux
  - Better than Context for complex state
  - Easy to persist to `localStorage`
  - Minimal boilerplate

#### 4.5 File Storage: Vercel Blob

- **Rationale**:
  - Integrated with Next.js
  - Global CDN
  - Simple API
  - Pay-per-use pricing
