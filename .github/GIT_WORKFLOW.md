# Git Workflow Strategy

## Branch Structure

### Main Branches

- `main` - Production-ready code (protected)
- `develop` - Integration branch for features

### Feature Branches

- `feature/epic-name` - Large features/epics
- `feature/epic-name/feature-name` - Specific features within epics
- `feature/standalone-feature` - Independent features

### Fix Branches

- `fix/category/issue-description` - Bug fixes
- `hotfix/critical-issue` - Critical production fixes (from main)

### Release Branches

- `release/version-number` - Release preparation (from develop)

## Commit Convention

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Scopes

- `auth`: Authentication related
- `ui`: User interface
- `api`: API changes
- `db`: Database changes
- `theme`: Theme/styling
- `config`: Configuration
- `deps`: Dependencies

### Examples

```
feat(auth): add OAuth2 integration
fix(theme): resolve hydration mismatch
refactor(ui): improve component structure
docs(api): update authentication endpoints
chore(deps): update React to v19
```

## Workflow Process

### 1. Feature Development

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/epic-name/feature-name

# Work on feature with atomic commits
git add .
git commit -m "feat(scope): implement feature X"

# Push and create PR to develop
git push origin feature/epic-name/feature-name
```

### 2. Bug Fixes

```bash
# Create fix branch from develop
git checkout develop
git pull origin develop
git checkout -b fix/category/issue-description

# Fix with atomic commits
git add .
git commit -m "fix(scope): resolve issue Y"

# Push and create PR to develop
git push origin fix/category/issue-description
```

### 3. Hotfixes

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Fix with atomic commits
git add .
git commit -m "hotfix(scope): fix critical production issue"

# Push and create PR to main
git push origin hotfix/critical-issue
```

### 4. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Final testing and version bumping
git add .
git commit -m "chore(release): bump version to 1.2.0"

# Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git checkout develop
git merge release/v1.2.0
```

## Branch Protection Rules

### Main Branch

- Require PR reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main

### Develop Branch

- Require PR reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes (for cleanup)

## Best Practices

1. **Atomic Commits**: Each commit should represent one logical change
2. **Descriptive Messages**: Clear, concise commit messages
3. **Branch Naming**: Use kebab-case with descriptive names
4. **Regular Syncing**: Keep branches up to date with base branch
5. **Clean History**: Use rebase to maintain clean commit history
6. **PR Templates**: Use consistent PR templates
7. **Code Reviews**: All changes must be reviewed
8. **Testing**: All features must be tested before merge

## Current Project Structure

```
main (production)
├── develop (integration)
├── feature/ui-modernization (completed)
├── feature/theme-system (completed)
├── fix/theme/hydration-mismatch (completed)
└── fix/pdf-worker-and-theme-issues (completed)
```
