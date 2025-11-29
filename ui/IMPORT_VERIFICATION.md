# Import Verification Strategy

This document explains how imports are verified during the build process to catch errors early.

## Verification Methods

### 1. TypeScript Type Checking
The primary verification happens through TypeScript's type checker which validates:
- All import paths exist
- Imported modules have the correct exports
- Type compatibility
- No circular dependencies

**Command**: `npm run type-check`

### 2. ESLint Import Validation
Secondary validation through ESLint rules:
- Unused imports detection
- Import order consistency
- Unused variables that prevent imports

**Command**: `npm run lint`

### 3. Full Verification Suite
Run all checks together:

**Command**: `npm run verify:all`

Includes:
- TypeScript type checking
- ESLint validation
- Both exit with error code if issues found

### 4. Import Verification Script
Helper script for CI/CD pipelines:

**Command**: `npm run verify:imports` or `bash scripts/verify-imports.sh`

## Docker Integration

### Development Container (`Dockerfile`)
Verification runs **after** code is copied but **before** dev server starts:

```dockerfile
RUN npm run type-check
```

This ensures the dev server won't start if there are import/type errors, catching issues immediately.

### Production Container (`Dockerfile.prod`)
Multi-stage build with verification **before** compilation:

```dockerfile
# Build stage
RUN npm run type-check  # Verify imports
RUN npm run lint        # Check code quality
RUN npm run build       # Compile

# Runtime stage (only includes production artifacts)
```

Production build fails fast if verification fails, preventing deployment of broken code.

## CI/CD Usage

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Verify imports and types
  run: npm run verify:all

- name: Build production bundle
  run: npm run build:prod
```

## What Gets Verified

### Import Paths
```typescript
// ✅ Valid
import { submitContact } from '@/api'

// ❌ Invalid - path doesn't exist
import { submitContact } from '@/apis'
```

### Named Exports
```typescript
// ✅ Valid
import { listPosts, createPost } from '@/api'

// ❌ Invalid - export doesn't exist
import { fetchPosts } from '@/api'
```

### Type Imports
```typescript
// ✅ Valid
import type { PostResponse } from '@/api'

// ❌ Invalid - type doesn't exist
import type { PostData } from '@/api'
```

## Exit Codes

- `0` - All verifications passed
- `1` - TypeScript compilation errors
- `2` - ESLint errors found

Failed builds will output:
- TypeScript errors (types, imports)
- ESLint warnings/errors (code quality)
- Specific line numbers and error descriptions

## Generated API Client

All API types and methods are verified on import:

**Models**: `src/api/models/index.ts`
- Request types (SubmitContactRequest, CreatePostRequest, etc.)
- Response types (PostResponse, GuestbookEntryResponse, etc.)

**Methods**: `src/api/generated/index.ts`
- Posts: listPosts, createPost, getPostBySlug, updatePost, deletePost
- Guestbook: listGuestbookEntries, submitGuestbookEntry, etc.
- Contact: submitContact, listContactSubmissions, updateContactSubmissionStatus
- Stats: recordStats, listStats, getStatById, listStatsByPage, updateStats

Any import of non-existent API methods will fail type-check and prevent build.

## Benefits

1. **Early Detection** - Errors caught at build time, not runtime
2. **Fast Feedback** - Import verification completes in ~1-3 seconds
3. **CI/CD Safety** - Prevents deploying code with broken imports
4. **Type Safety** - Full TypeScript type validation
5. **Developer Experience** - Consistent, predictable errors with line numbers

## Troubleshooting

### "Cannot find module" error
- Check import path spelling
- Verify export exists in target file
- Use `src/api` imports for API client

### "Type not found" error
- Verify type is exported from module
- Check for typos in type names
- Ensure correct file is being imported

### Build fails in Docker but works locally
- Ensure `npm install` succeeded
- Check for uncommitted files with imports
- Run `npm run verify:all` locally to reproduce
