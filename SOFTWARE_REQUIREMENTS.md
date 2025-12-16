## TalkifyDocs v2.0 – Software Requirements Document (SRD)

### 1. Functional Requirements

#### FR-1: Document Management

- **FR-1.1**: Users can upload PDF documents (max **50MB**, Pro: **200MB**)
- **FR-1.2**: Support batch upload (up to **10 files** simultaneously)
- **FR-1.3**: Display document grid/list with thumbnails, metadata, and status
- **FR-1.4**: Real-time processing status using **SSE** (no polling)
- **FR-1.5**: Generate automatic summaries on upload completion
- **FR-1.6**: Extract and display key entities (dates, people, organizations)
- **FR-1.7**: Allow document deletion with cascade to embeddings

#### FR-2: Chat Interface

- **FR-2.1**: Split-screen view: PDF preview (left) + Chat (right)
- **FR-2.2**: Stream AI responses with thinking indicators
- **FR-2.3**: Highlight cited sections in PDF when AI references them
- **FR-2.4**: Multi-document chat mode (select **2–5 PDFs** to compare)
- **FR-2.5**: Conversation history with infinite scroll
- **FR-2.6**: Export chat as **Markdown** or **PDF**
- **FR-2.7**: Save important Q&A pairs as **"highlights"**
- **FR-2.8**: Voice input support (optional, **Phase 3**)

#### FR-3: Authentication & Authorization

- **FR-3.1**: Sign up with **email/password**, **Google**, **GitHub**
- **FR-3.2**: Role-based access: **Free**, **Pro**, **Admin**
- **FR-3.3**: Free tier: **3 PDFs**, **50 messages/day**
- **FR-3.4**: Pro tier: **Unlimited PDFs**, **unlimited messages**
- **FR-3.5**: Session management with **refresh tokens**

#### FR-4: Billing

- **FR-4.1**: **Stripe** integration for subscription management
- **FR-4.2**: Self-service billing portal
- **FR-4.3**: Webhook handling for subscription events
- **FR-4.4**: Usage-based alerts (approaching limits)

#### FR-5: Demo Mode

- **FR-5.1**: Public demo with **3 pre-loaded example PDFs**
- **FR-5.2**: No authentication required for demo
- **FR-5.3**: Rate-limited to prevent abuse
- **FR-5.4**: Persistent **"Try with your own PDFs"** CTA

#### FR-6: Admin Dashboard

- **FR-6.1**: User management interface
- **FR-6.2**: System metrics (documents processed, queries, costs)
- **FR-6.3**: Error log viewer
- **FR-6.4**: Manual user tier override

---

### 2. Non-Functional Requirements

#### NFR-1: Performance

- Initial page load: \< **2s**
- Time to First Byte (TTFB): \< **600ms**
- Chat response streaming starts: \< **1s**
- PDF processing: \< **30s** for **100-page** document
- Database queries: \< **100ms** (p95)

#### NFR-2: Scalability

- Support **1,000** concurrent users
- Handle **10,000** documents per day
- Horizontal scaling for API routes
- Vector DB optimized for **1M+ embeddings**

#### NFR-3: Security

- **HTTPS only** (force redirect)
- **CSP** headers configured
- XSS protection on all user inputs
- Rate limiting per user/IP
- API key rotation support
- Regular dependency updates (**Dependabot**)

#### NFR-4: Reliability

- **99.5%** uptime SLA
- Automatic retries for external API failures
- Graceful degradation when AI services are down
- Database backups (daily, **30-day** retention)
- Error tracking with **Sentry**

#### NFR-5: Usability

- Mobile-first responsive design
- Keyboard shortcuts for power users
- Dark/light mode with system preference detection
- Accessible (**WCAG 2.1 AA** compliance)
- \< **3 clicks** to core functionality

#### NFR-6: Maintainability

- **TypeScript strict mode** enabled
- **80%+** test coverage on critical paths
- Comprehensive API documentation
- Structured logging with correlation IDs
- Feature flags for gradual rollouts
