# Git Workflow & Branching Strategy

## Branch Structure

### Main Branches

- **`main`** - Production-ready code, always deployable
- **`develop`** - Integration branch for features, staging environment

### Feature Branches

- **`feature/*`** - New features and enhancements
  - `feature/user-authentication`
  - `feature/pdf-processing`
  - `feature/chat-interface`

### Fix Branches

- **`fix/*`** - Bug fixes and hotfixes
  - `fix/pdf-loading-issues`
  - `fix/authentication-bug`
  - `fix/performance-optimization`

### Release Branches

- **`release/*`** - Release preparation
  - `release/v1.0.0`
  - `release/v1.1.0`

### Hotfix Branches

- **`hotfix/*`** - Critical production fixes
  - `hotfix/security-patch`
  - `hotfix/critical-bug`

## Commit Message Convention

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Scopes

- `pdf`: PDF-related functionality
- `auth`: Authentication
- `ui`: User interface
- `api`: API endpoints
- `db`: Database
- `config`: Configuration

### Examples

#### Feature Commit

```
feat(pdf): add PDF fullscreen viewer

- Implement fullscreen PDF viewing capability
- Add zoom and rotation controls
- Include keyboard shortcuts for navigation

Closes #123
```

#### Bug Fix Commit

```
fix(pdf): resolve infinite loading issue

- Remove conflicting pdf-parse library
- Fix LangChain PDFLoader implementation
- Add timeout protection for processing

Fixes #456
```

#### Performance Commit

```
perf(api): optimize PDF processing pipeline

- Reduce processing time by 60%
- Implement caching for embeddings
- Add background processing queue

Resolves #789
```

## Workflow Process

### 1. Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit
git add .
git commit -m "feat(scope): implement new feature"

# Push and create PR
git push origin feature/new-feature-name
```

### 2. Bug Fixes

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create fix branch
git checkout -b fix/bug-description

# Make changes and commit
git add .
git commit -m "fix(scope): resolve bug description"

# Push and create PR
git push origin fix/bug-description
```

### 3. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Make release-specific changes
git commit -m "chore(release): prepare v1.0.0"

# Merge to main and develop
git checkout main
git merge release/v1.0.0
git tag v1.0.0

git checkout develop
git merge release/v1.0.0

# Delete release branch
git branch -d release/v1.0.0
```

### 4. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Make hotfix changes
git commit -m "fix(scope): resolve critical issue"

# Merge to main and develop
git checkout main
git merge hotfix/critical-issue
git tag v1.0.1

git checkout develop
git merge hotfix/critical-issue

# Delete hotfix branch
git branch -d hotfix/critical-issue
```

## Pull Request Guidelines

### PR Title Format

```
<type>(<scope>): <description>
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated

## Related Issues

Closes #123
Fixes #456
```

## Branch Protection Rules

### Main Branch

- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main

### Develop Branch

- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes for maintainers

## Code Review Guidelines

### Reviewers Should Check

- [ ] Code quality and readability
- [ ] Security implications
- [ ] Performance impact
- [ ] Test coverage
- [ ] Documentation updates
- [ ] Breaking changes

### Review Comments

- Be constructive and specific
- Suggest improvements
- Ask questions for clarification
- Approve when satisfied

## Best Practices

### Commit Frequency

- Commit early and often
- One logical change per commit
- Keep commits atomic
- Write meaningful commit messages

### Branch Naming

- Use lowercase with hyphens
- Be descriptive but concise
- Include type prefix
- Avoid special characters

### Merge Strategy

- Use "Squash and merge" for feature branches
- Use "Merge commit" for release branches
- Use "Rebase and merge" for hotfixes

## Emergency Procedures

### Critical Production Issue

1. Create hotfix branch from main
2. Implement minimal fix
3. Test thoroughly
4. Merge to main and tag
5. Deploy immediately
6. Merge back to develop
7. Create follow-up PR for proper fix

### Rollback Procedure

1. Identify last stable commit
2. Create rollback branch
3. Revert problematic changes
4. Test rollback
5. Merge to main
6. Deploy rollback
7. Investigate root cause
