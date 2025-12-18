## TalkifyDocs v2.0 – Technical Design Document

### 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                       │
│  Next.js 16 App Router (React 19, TypeScript, Tailwind)    │
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
  size              BigInt      @db.BigInt
  pageCount         Int?
  uploadStatus      UploadStatus @default(PENDING)

  // AI-extracted data
  thumbnailUrl      String?
  summary           String?     @db.Text
  entities          Json?       // {people: [], dates: [], organizations: [], key_terms: []}
  metadata          Json?       // {author, title, createdAt, modifiedAt, wordCount, etc}

  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  messages          Message[]
  highlights        Highlight[]
  conversationFiles ConversationFile[]

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId])
  @@index([uploadStatus])
  @@index([createdAt])
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
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  fileId          String
  file            File          @relation(fields: [fileId], references: [id], onDelete: Cascade)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@id([conversationId, fileId])
  @@index([fileId])
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
│   │   │   └── page.tsx                    # Document grid with search
│   │   ├── chat/
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx                # Multi-doc split-screen chat
│   │   └── highlights/
│   │       └── page.tsx                    # Saved Q&As with search
│   ├── (marketing)/
│   │   ├── page.tsx                        # Landing page with demo CTA
│   │   ├── demo/
│   │   │   ├── page.tsx                    # Public demo page
│   │   │   └── chat/[fileId]/page.tsx     # Demo chat interface
│   │   ├── pricing/page.tsx
│   │   └── share/[token]/page.tsx         # Public shared conversations
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx                    # Admin dashboard with metrics
│   │       └── users/page.tsx             # User management
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
│   │   ├── ConversationChatShell.tsx      # Main chat container
│   │   ├── ChatWrapper.tsx                # Chat context provider
│   │   ├── Messages.tsx                    # Message list
│   │   ├── Message.tsx                     # Individual message with citations
│   │   ├── ChatInput.tsx                  # Input with voice support
│   │   ├── ChatExportMenu.tsx             # Export/share menu
│   │   ├── FileManagementDropdown.tsx     # Add/remove files
│   │   ├── MultiDocSelector.tsx            # Start multi-doc conversation
│   │   └── CitationHighlight.tsx          # PDF citation highlighting
│   ├── highlights/
│   │   ├── HighlightCard.tsx              # Individual highlight card
│   │   └── HighlightsSearch.tsx           # Search/filter component
│   ├── admin/
│   │   ├── StatsCard.tsx                   # Metric cards
│   │   ├── RecentUsersTable.tsx           # Recent users table
│   │   ├── SystemMetrics.tsx              # System health metrics
│   │   ├── ErrorLogViewer.tsx             # Error log viewer
│   │   └── UserManagementTable.tsx        # Full user management
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
│   ├── db.ts                               # Prisma client singleton
│   ├── auth.ts                             # Clerk helpers (getCurrentUser, requireUser, requireAdmin)
│   ├── stripe.ts                           # Stripe client and helpers
│   ├── cache.ts                            # Redis caching (Upstash + ioredis fallback)
│   ├── sentry.ts                           # Sentry error tracking
│   ├── analytics.ts                        # Google Analytics helpers
│   ├── ai/
│   │   ├── pinecone.ts                     # Pinecone client
│   │   └── hybrid-search.ts                # Hybrid search (semantic + BM25)
│   ├── upload/
│   │   ├── process-pdf.ts                  # Main PDF processing pipeline
│   │   ├── generate-thumbnail.ts            # PDF thumbnail generation
│   │   ├── extract-metadata.ts             # PDF metadata extraction
│   │   ├── extract-entities.ts             # Entity extraction (LLM-based)
│   │   └── summarize-document.ts           # Document summarization (LLM-based)
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
│   ├── upload.ts                           # uploadPDF server action
│   ├── conversations.ts                   # createConversation, addFileToConversation, removeFileFromConversation
│   ├── highlights.ts                      # saveAsHighlight, getHighlights, deleteHighlight
│   ├── export.ts                           # exportChatAsMarkdown, createShareableLink, revokeShareableLink
│   └── admin.ts                            # updateUserTier, deleteUser, getSystemMetrics
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
