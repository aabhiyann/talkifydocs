# Git Branching Strategy for TalkifyDocs

## Branch Structure

### Main Branches

- **`main`**: Production-ready code, always stable
- **`develop`**: Integration branch for ongoing development

### Feature Branches

- **`feature/feature-name`**: New features and enhancements
- **`bugfix/bug-description`**: Bug fixes
- **`hotfix/critical-fix`**: Critical production fixes

## Workflow

### 1. Starting New Work

```bash
# Always start from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Development Process

```bash
# Make your changes
git add .
git commit -m "feat: add new feature description"

# Push feature branch
git push -u origin feature/your-feature-name
```

### 3. Merging to Develop

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Merge feature branch
git merge feature/your-feature-name

# Push to develop
git push origin develop

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 4. Releasing to Production

```bash
# Merge develop to main
git checkout main
git pull origin main
git merge develop
git push origin main

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Branch Naming Conventions

- **Features**: `feature/add-user-authentication`
- **Bugfixes**: `bugfix/fix-pdf-upload-error`
- **Hotfixes**: `hotfix/security-patch`
- **Chores**: `chore/update-dependencies`

## Commit Message Format

```
type(scope): description

feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## Current Status

✅ **Git Repository**: Connected to `https://github.com/aabhiyann/talkifydocs.git`
✅ **Main Branch**: `main` (production-ready)
✅ **Development Branch**: `develop` (active development)
✅ **TypeScript Errors**: All fixed
✅ **Database Schema**: Optimized with proper indexes

## Next Steps

1. Create feature branches for new development
2. Use pull requests for code review
3. Merge to develop after review
4. Deploy to production from main branch
