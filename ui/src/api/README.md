# API Client

This directory contains the TypeScript API client for sochoa.dev, automatically generated from the Swagger/OpenAPI specification.

## Structure

- **`generated/`** - Auto-generated client code from the Swagger spec (not committed to git)
  - `models/` - TypeScript types for request/response models
  - `api/` - API client classes and functions
- **`client.ts`** - Custom authentication wrapper around the generated client
- **`index.ts`** - Initialization and re-exports

## Generating the Client

The client is automatically generated when you run `npm run dev` or `npm run build`.

To manually regenerate the client after API changes:

```bash
npm run api:generate
```

This reads the Swagger spec from `../api/docs/swagger.yaml` and generates a fully type-safe TypeScript client.

## Usage

### Importing from the API

All generated types and API functions are re-exported from `src/api/index.ts`:

```typescript
// Import types
import { Post, Contact, Guestbook } from '@/api'

// Import API classes (generated)
import { PostApi, ContactApi, GuestbookApi } from '@/api'

// Use the authenticated fetch
import { authenticatedFetch, getAuthHeaders } from '@/api'
```

### Example: Using the Generated Client

```typescript
import { useEffect, useState } from 'react'
import { PostApi } from '@/api'
import { getApiBaseUrl, authenticatedFetch } from '@/api'

export function BlogPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const api = new PostApi({
      basePath: getApiBaseUrl(),
      fetch: authenticatedFetch,
    })

    api.listPosts().then(setPosts).catch(console.error)
  }, [])

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

## Authentication

The generated client automatically includes Cognito authentication via the `authenticatedFetch` wrapper. No manual header handling is needed:

```typescript
// This automatically includes the Authorization: Bearer <token> header
const api = new PostApi({
  basePath: getApiBaseUrl(),
  fetch: authenticatedFetch,
})

// All requests are automatically authenticated
const posts = await api.listPosts()
```

## Type Safety

All endpoints, request/response models, and error types are fully typed:

```typescript
import { PostApi, CreatePostRequest } from '@/api'

const api = new PostApi({ /* ... */ })

// TypeScript validates request structure
const request: CreatePostRequest = {
  slug: 'my-post',
  title: 'My Post',
  status: 'published',
  body: '# Content',
  // summary is optional
}

// Response type is inferred
const response = await api.createPost(request)
// response is typed as Post
console.log(response.id) // ✅ Type-safe
```

## Regeneration Process

The client generation happens automatically:

1. **On `npm run dev`**: Client is generated before Vite starts
2. **On `npm run build`**: Client is generated before TypeScript compilation
3. **Manual**: Run `npm run api:generate` to regenerate

The generation:
- Reads the Swagger spec from `../api/docs/swagger.yaml`
- Generates TypeScript code with full type safety
- Places output in `src/api/generated/` (git-ignored)
- Takes ~2-3 seconds on first generation, <1s on subsequent runs

## API Documentation

For complete API documentation, start the API server and visit:

```
http://localhost:8080/
```

Or see the Swagger spec directly:

```
../api/docs/swagger.yaml
../api/docs/swagger.json
```

## Troubleshooting

### Client doesn't compile after API changes

Regenerate the client:

```bash
npm run api:generate
```

### "Generated client not found" errors

Ensure the client is generated:

```bash
npm run api:generate
```

Or simply run:

```bash
npm run dev
```

Which automatically generates the client.

### Wrong API URL

Check `VITE_API_URL` environment variable:

- **Local dev**: `http://localhost:8080`
- **Docker**: `http://api:8080` (service name in docker-compose)
- **Production**: Your deployed API URL

Set in `.env.local` or `docker-compose.yml`.
