# Changelog

All notable changes to TalkifyDocs will be documented in this file.

## [2.0.0] - 2024-12-15

### Major Changes

#### Authentication

- **BREAKING**: Migrated from Kinde to Clerk authentication
  - More robust authentication with better developer experience
  - Improved user management and webhook support
  - Better integration with Next.js App Router

#### New Features

**Admin Dashboard**

- Complete admin dashboard with user management
- System metrics and monitoring
- Error log viewer
- User tier management (FREE/PRO/ADMIN)
- CSV export functionality
- Role-based access control

**Demo Mode**

- Public demo page with example documents
- No authentication required for demo
- Rate-limited demo chat API
- Pre-loaded example conversations
- "Try Demo" CTA on landing page

**Multi-Document Conversations**

- Support for up to 5 documents per conversation
- File comparison features
- File management UI (add/remove files)
- Enhanced hybrid search across multiple documents

**Highlights & Bookmarks**

- Save important Q&A pairs as highlights
- Highlights page with search and filtering
- Export highlights functionality
- Quick access to saved insights

**Chat Export & Sharing**

- Export conversations as Markdown
- Generate shareable public links
- Revoke share links
- Public conversation viewer

**Performance & Monitoring**

- Sentry integration for error tracking
- Google Analytics integration
- Redis caching layer (Upstash support)
- Enhanced health check endpoint
- Performance optimizations (bundle size, image optimization)
- Lighthouse CI for automated performance testing

**Developer Experience**

- Comprehensive local development guide
- Smoke test scripts
- Performance check scripts
- Deployment checklist
- Setup guides for all services

### Improvements

- **Database**: Added indexes for better query performance
- **Caching**: Redis caching layer with Upstash support
- **Error Handling**: Improved error tracking and logging
- **Security**: Enhanced security headers and CSRF protection
- **UI/UX**: Improved chat interface with citation highlighting
- **Documentation**: Complete rewrite of setup and deployment docs

### Technical Updates

- Updated to Next.js 16
- React 19 support
- Prisma schema updates (Conversation, Highlight, RateLimit models)
- Enhanced type safety throughout
- Better error boundaries
- Improved streaming chat responses

### Removed

- Kinde authentication (replaced with Clerk)
- UploadThing (replaced with Vercel Blob for primary storage)

### Migration Notes

If upgrading from v1.0:

1. **Authentication**: Users need to sign up again with Clerk
2. **Database**: Run migrations: `npm run db:migrate`
3. **Environment Variables**: Update to use Clerk instead of Kinde
4. **Storage**: Files will need to be re-uploaded (if migrating from UploadThing)

### Documentation

- Added `LOCAL_DEVELOPMENT.md` - Comprehensive local setup guide
- Added `DEPLOYMENT.md` - Production deployment checklist
- Added `SETUP_GUIDE.md` - Service-specific setup instructions
- Updated `README.md` - Quick start guide
- Updated `TECHNICAL_DESIGN.md` - Architecture documentation

## [1.0.0] - Initial Release

### Features

- PDF upload and processing
- Single-document chat
- User authentication (Kinde)
- Stripe subscriptions
- Basic dashboard
