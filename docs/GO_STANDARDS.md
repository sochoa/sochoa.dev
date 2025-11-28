# Go Code Standards for sochoa.dev API

This document outlines coding conventions, architectural patterns, and best practices for the Go API service in the sochoa.dev project.

## Project Structure

```
/api
├── cmd/
│   └── api/
│       └── main.go              # Entry point; initialize deps, server startup
├── db/
│   └── migrations/              # Database migration SQL files (golang-migrate)
│       ├── 001_init.up.sql
│       ├── 001_init.down.sql
│       └── ...
├── internal/
│   ├── model/                   # Domain/entity models; request/response types
│   │   ├── post.go
│   │   ├── guestbook.go
│   │   ├── contact.go
│   │   └── visitor_stats.go
│   ├── view/                    # Response formatters; HTTP serialization
│   │   ├── post.go
│   │   ├── guestbook.go
│   │   ├── contact.go
│   │   └── error.go
│   ├── controller/              # HTTP request handlers; routing; input parsing
│   │   ├── post.go
│   │   ├── guestbook.go
│   │   ├── contact.go
│   │   ├── metrics.go
│   │   └── admin.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── logging.go
│   │   ├── recovery.go
│   │   └── rate_limit.go
│   ├── auth/
│   │   └── cognito.go           # Cognito token verification
│   ├── db/
│   │   └── postgres.go          # DB connection, pool setup
│   ├── config/
│   │   └── config.go            # Environment config loading
│   ├── errors/
│   │   └── errors.go            # Custom error types
│   └── logger/
│       └── logger.go            # Structured logging (e.g., slog)
├── go.mod
├── go.sum
└── Makefile                     # Build, test, lint commands
```

## Architectural Pattern: Model-View-Controller (MVC)

The API follows a clean MVC architecture to separate concerns:

### 1. Model
**File**: `internal/model/*.go`

Responsibilities:
- Define domain entities and business logic
- Parse and validate input
- Query and manipulate data (database access)
- Contains all business rules and constraints

Models are the core of the application; controllers and views are thin wrappers around them.

**Example**:
```go
package model

import (
    "context"
    "database/sql"
    "fmt"
    "time"
)

// Post represents a blog post
type Post struct {
    ID          string
    Slug        string
    Title       string
    Summary     string
    Body        string    // GFM markdown
    Tags        []string
    Status      string    // "draft" or "published"
    PublishedAt *time.Time
    UpdatedAt   time.Time
    CreatedAt   time.Time
    db          *sql.DB
}

// NewPost creates a new post model with business logic validation
func NewPost(db *sql.DB, slug, title, summary, body string, tags []string, status string) (*Post, error) {
    // Business logic: validate constraints
    if len(slug) == 0 {
        return nil, fmt.Errorf("slug required")
    }
    if len(title) > 140 {
        return nil, fmt.Errorf("title must be <= 140 chars")
    }
    if len(summary) > 300 {
        return nil, fmt.Errorf("summary must be <= 300 chars")
    }
    if len(tags) > 10 {
        return nil, fmt.Errorf("tags must be <= 10 items")
    }

    return &Post{
        ID:        generateID(),
        Slug:      slug,
        Title:     title,
        Summary:   summary,
        Body:      body,
        Tags:      tags,
        Status:    status,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
        db:        db,
    }, nil
}

// Save persists the post to the database
func (p *Post) Save(ctx context.Context) error {
    query := `
        INSERT INTO posts (id, slug, title, summary, body, tags, status, published_at, updated_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO UPDATE SET
            title = $3, summary = $4, body = $5, tags = $6, status = $7, updated_at = $9
        RETURNING id, published_at, updated_at, created_at
    `

    err := p.db.QueryRowContext(ctx, query,
        p.ID, p.Slug, p.Title, p.Summary, p.Body, p.Tags, p.Status, p.PublishedAt, p.UpdatedAt, p.CreatedAt,
    ).Scan(&p.ID, &p.PublishedAt, &p.UpdatedAt, &p.CreatedAt)

    if err != nil {
        return fmt.Errorf("failed to save post: %w", err)
    }
    return nil
}

// GetBySlug fetches a post from the database by slug
func GetPostBySlug(ctx context.Context, db *sql.DB, slug string) (*Post, error) {
    query := `
        SELECT id, slug, title, summary, body, tags, status, published_at, updated_at, created_at
        FROM posts
        WHERE slug = $1
    `

    post := &Post{db: db}
    err := db.QueryRowContext(ctx, query, slug).Scan(
        &post.ID, &post.Slug, &post.Title, &post.Summary, &post.Body,
        &post.Tags, &post.Status, &post.PublishedAt, &post.UpdatedAt, &post.CreatedAt,
    )

    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("post not found")
    }
    if err != nil {
        return nil, fmt.Errorf("query failed: %w", err)
    }

    return post, nil
}

// ListPublished returns all published posts with pagination
func ListPublishedPosts(ctx context.Context, db *sql.DB, page, limit int) ([]*Post, error) {
    if limit > 50 {
        limit = 50 // Cap result set
    }

    offset := (page - 1) * limit
    query := `
        SELECT id, slug, title, summary, body, tags, status, published_at, updated_at, created_at
        FROM posts
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT $1 OFFSET $2
    `

    rows, err := db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, fmt.Errorf("query failed: %w", err)
    }
    defer rows.Close()

    var posts []*Post
    for rows.Next() {
        post := &Post{db: db}
        if err := rows.Scan(&post.ID, &post.Slug, &post.Title, &post.Summary, &post.Body,
            &post.Tags, &post.Status, &post.PublishedAt, &post.UpdatedAt, &post.CreatedAt); err != nil {
            return nil, fmt.Errorf("scan failed: %w", err)
        }
        posts = append(posts, post)
    }

    return posts, rows.Err()
}
```

### 2. View
**File**: `internal/view/*.go`

Responsibilities:
- Format models as HTTP responses (JSON, HTML, etc.)
- Convert internal types to JSON-serializable types
- Handle response wrapping (status, metadata, pagination)
- NO business logic; purely serialization

**Example**:
```go
package view

import (
    "github.com/sochoa/api/internal/model"
)

// PostResponse is the JSON response representation of a Post
type PostResponse struct {
    ID          string   `json:"id"`
    Slug        string   `json:"slug"`
    Title       string   `json:"title"`
    Summary     string   `json:"summary"`
    Body        string   `json:"body"`
    Tags        []string `json:"tags"`
    Status      string   `json:"status"`
    PublishedAt *string  `json:"published_at,omitempty"`
    UpdatedAt   string   `json:"updated_at"`
    CreatedAt   string   `json:"created_at"`
}

// FromPost converts a Post model to a PostResponse
func FromPost(p *model.Post) *PostResponse {
    var pubAt *string
    if p.PublishedAt != nil {
        s := p.PublishedAt.Format(time.RFC3339)
        pubAt = &s
    }

    return &PostResponse{
        ID:          p.ID,
        Slug:        p.Slug,
        Title:       p.Title,
        Summary:     p.Summary,
        Body:        p.Body,
        Tags:        p.Tags,
        Status:      p.Status,
        PublishedAt: pubAt,
        UpdatedAt:   p.UpdatedAt.Format(time.RFC3339),
        CreatedAt:   p.CreatedAt.Format(time.RFC3339),
    }
}

// FromPostSlice converts a slice of Post models to PostResponses
func FromPostSlice(posts []*model.Post) []*PostResponse {
    responses := make([]*PostResponse, len(posts))
    for i, p := range posts {
        responses[i] = FromPost(p)
    }
    return responses
}

// ErrorResponse is a standard error response format
type ErrorResponse struct {
    Error  string `json:"error"`
    Status int    `json:"status"`
}
```

### 3. Controller
**File**: `internal/controller/*.go`

Responsibilities:
- Parse HTTP request (path params, query params, body)
- Deserialize request body to models
- Call model methods or functions
- Use view to format response
- Handle HTTP-specific concerns (status codes, headers)
- NO business logic; thin routing/request handling layer

**Example**:
```go
package controller

import (
    "encoding/json"
    "net/http"
    "strconv"
    "database/sql"
    "github.com/sochoa/api/internal/model"
    "github.com/sochoa/api/internal/view"
)

type PostController struct {
    db *sql.DB
}

func NewPostController(db *sql.DB) *PostController {
    return &PostController{db: db}
}

// CreatePost handles POST /api/posts
func (c *PostController) CreatePost(w http.ResponseWriter, r *http.Request) {
    // Parse request body
    var req struct {
        Slug    string   `json:"slug"`
        Title   string   `json:"title"`
        Summary string   `json:"summary"`
        Body    string   `json:"body"`
        Tags    []string `json:"tags"`
        Status  string   `json:"status"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
        return
    }

    // Create model (performs validation)
    post, err := model.NewPost(c.db, req.Slug, req.Title, req.Summary, req.Body, req.Tags, req.Status)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Save to database
    if err := post.Save(r.Context()); err != nil {
        http.Error(w, "failed to save post", http.StatusInternalServerError)
        return
    }

    // Respond with formatted view
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(view.FromPost(post))
}

// GetPost handles GET /api/posts/{slug}
func (c *PostController) GetPost(w http.ResponseWriter, r *http.Request) {
    slug := r.PathValue("slug")  // Go 1.22+

    post, err := model.GetPostBySlug(r.Context(), c.db, slug)
    if err != nil {
        http.Error(w, "post not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(view.FromPost(post))
}

// ListPosts handles GET /api/posts
func (c *PostController) ListPosts(w http.ResponseWriter, r *http.Request) {
    page := 1
    limit := 20

    if p := r.URL.Query().Get("page"); p != "" {
        if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
            page = parsed
        }
    }

    if l := r.URL.Query().Get("limit"); l != "" {
        if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
            limit = parsed
        }
    }

    posts, err := model.ListPublishedPosts(r.Context(), c.db, page, limit)
    if err != nil {
        http.Error(w, "failed to fetch posts", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(view.FromPostSlice(posts))
}
```

## Error Handling

Errors bubble up naturally from models to controllers. Controllers handle HTTP-specific error translation:

**In Models**: Return standard Go `error` with descriptive messages
```go
func NewPost(db *sql.DB, slug, title string, ...) (*Post, error) {
    if len(slug) == 0 {
        return nil, fmt.Errorf("slug required")  // Validation error
    }
    // ...
}

func (p *Post) Save(ctx context.Context) error {
    err := p.db.QueryRowContext(ctx, query, ...).Scan(...)
    if err == sql.ErrNoRows {
        return fmt.Errorf("post not found")  // Not found error
    }
    return fmt.Errorf("failed to save post: %w", err)  // DB error, wrapped with context
}
```

**In Controllers**: Convert errors to appropriate HTTP status codes
```go
func (c *PostController) CreatePost(w http.ResponseWriter, r *http.Request) {
    post, err := model.NewPost(c.db, req.Slug, req.Title, ...)
    if err != nil {
        // Check error message to determine HTTP status
        // In practice, use strings.Contains or custom error types for precise matching
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    if err := post.Save(r.Context()); err != nil {
        if strings.Contains(err.Error(), "not found") {
            http.Error(w, err.Error(), http.StatusNotFound)
            return
        }
        http.Error(w, "internal server error", http.StatusInternalServerError)
        return
    }
}
```

Optionally define custom error types for stricter error handling:
```go
package model

type ValidationError struct {
    Message string
}

func (e *ValidationError) Error() string {
    return e.Message
}

// In NewPost
if len(slug) == 0 {
    return nil, &ValidationError{Message: "slug required"}
}

// In controller
if err != nil {
    var valErr *model.ValidationError
    if errors.As(err, &valErr) {
        http.Error(w, valErr.Error(), http.StatusBadRequest)
        return
    }
    http.Error(w, "internal server error", http.StatusInternalServerError)
    return
}
```

## Code Style & Conventions

### File Organization (Minimal Per File)

**Strict One Type Per File**
- **Exactly one exported type per file** (rarely exceptions)
- File name matches type name: `type Post struct` → `post.go`
- Constructor + all methods on that type in the same file
- Keep each file focused and minimal

```go
// post.go
package model

type Post struct {
    ID        string
    Slug      string
    Title     string
    Body      string
    Tags      []string
    Status    string
    PublishedAt *time.Time
    UpdatedAt time.Time
    CreatedAt time.Time
    db        *sql.DB
}

// Constructor
func NewPost(db *sql.DB, slug, title, summary, body string, tags []string, status string) (*Post, error) {
    // Validation logic only
    return &Post{...}, nil
}

// Methods: one method per goal, keep methods short
func (p *Post) Save(ctx context.Context) error { ... }
func (p *Post) Delete(ctx context.Context) error { ... }
func (p *Post) Publish(ctx context.Context) error { ... }
func (p *Post) Unpublish(ctx context.Context) error { ... }

// Package-level query functions (belong in this file with Post type)
func GetPostBySlug(ctx context.Context, db *sql.DB, slug string) (*Post, error) { ... }
func ListPublishedPosts(ctx context.Context, db *sql.DB, page, limit int, tag string) ([]*Post, error) { ... }
```

**Why Minimal Per File?**
- **Easier to understand**: Open a file, know exactly what's there
- **Easier to test**: One focus area per file
- **Easier to maintain**: Changes localized to one responsibility
- **Better for large teams**: Less merge conflicts, clearer ownership

**Separate Files for Separate Concerns:**
- `post.go` - Post type + NewPost() + Post methods + Post queries
- `guestbook.go` - GuestbookEntry type + NewGuestbookEntry() + methods + queries
- `contact.go` - ContactSubmission type + methods
- Each model in its own file (no exceptions)

**View/Response Types**
- One response type per file: `post.go`, `guestbook.go`, etc.
- Converters (`FromPost()`, `FromPostSlice()`) go in same file
- Example: `internal/view/post.go` contains only `PostResponse` struct + converters

**Controllers**
- One controller type per file
- All handler methods for that controller in same file
- Example: `internal/controller/post.go` contains `PostController` + all 7 post handlers

**Test Files**
- Always separate: `post.go` → `post_test.go`
- One test file per source file
- Never mix test and production code
- Shared test helpers: `internal/testutil/` (utilities for all tests)

**Constants**
- Keep with their type if closely related: `post.go` has `StatusDraft`, `StatusPublished`
- Alternatively: separate `const.go` for package-wide constants
- One small constants file per package is OK

**Across MVC Layers (Example - Posts):**
```
internal/model/
  post.go              # type Post, NewPost(), Save(), Delete(), Publish(), etc.
  post_test.go         # Tests for Post

internal/view/
  post.go              # type PostResponse, FromPost(), FromPostSlice()

internal/controller/
  post.go              # type PostController, ListPosts(), GetPost(), CreatePost(), etc.
  post_test.go         # Integration tests for PostController
```

**Breaking Up Large Methods**
- If a receiver method exceeds **50 lines**, move it to its own file
- Naming: `post_save.go`, `post_delete.go`, etc. (prefix with type name + method concept)
- Keeps each file focused and readable

**Example - Post with large Save method:**
```
Before (too long):
  post.go             # type Post, NewPost(), Save() [75 lines], Delete(), Publish()

After (refactored):
  post.go             # type Post, NewPost(), Delete(), Publish()
  post_save.go        # (p *Post) Save(ctx) error [75 lines] - complex DB logic
  post_test.go        # Tests for Post
  post_save_test.go   # Tests for Save method specifically
```

**Rule of Thumb:**
- One primary type per file
- Constructor + methods for that type = same file (when methods are short)
- **Large methods (>50 lines)** get their own file: `{typename}_{methodname}.go`
- One test file per source file (`post_test.go`, `post_save_test.go`)
- Helpers/utilities that don't belong to a type go in `internal/testutil/` or similar
- Maximum 150-200 lines per file (guideline, not hard rule)
- Maximum 50 lines per method (if longer, move to separate file)

### Naming
- **Packages**: lowercase, short, one word if possible (`model`, `view`, `controller`, `middleware`)
- **Types**: PascalCase (`Post`, `GuestbookEntry`, `PostResponse`)
- **Functions/Methods**: PascalCase for exported, camelCase for unexported (`NewPost`, `Save`, `listPublished`)
- **Constants**: UPPER_SNAKE_CASE for module-level (`StatusDraft = "draft"`, `MaxTitleLength = 140`)
- **Interfaces**: end with `-er` suffix (`Reader`, `Writer`, `Validator`)

### Formatting
- Use `gofmt` (enforced by linter); run `go fmt ./...`
- Use `golangci-lint` for linting; see project config
- Line length: no hard limit, but keep under 120 chars where practical
- Use meaningful variable names; avoid single-letter vars except in loops/defers

### Comments
- Comment exported types and functions
- Use `// Comment` style (not `/* */`)
- Start comment with the name being documented: `// PostService handles post operations`
- Comments should explain WHY, not WHAT (code shows what)

**Example**:
```go
// PostService handles post creation, retrieval, and publishing operations.
// It enforces business rules and delegates persistence to PostRepository.
type PostService struct {
    postRepo *repositories.PostRepository
}

// CreatePost creates a new post and validates constraints (slug uniqueness, field lengths).
func (s *PostService) CreatePost(ctx context.Context, post *models.Post) (*models.Post, error) {
    // ...
}
```

### Error Wrapping
- Use `fmt.Errorf("context: %w", err)` to wrap errors with context
- DO NOT use `%v` or `%s` for errors; use `%w` to preserve stack traces
- Check errors with `errors.Is()` and `errors.As()` for type assertions

```go
// Good
if err := r.db.QueryRowContext(ctx, query, args...).Scan(&result); err != nil {
    return nil, fmt.Errorf("failed to fetch post: %w", err)
}

// Bad
if err := r.db.QueryRowContext(ctx, query, args...).Scan(&result); err != nil {
    return nil, err  // Lost context
}
```

## Context Usage

Always pass `context.Context` as the first parameter:
- Enables cancellation and timeouts
- Carries request-scoped values (user ID, request ID, tracing info)
- Required for database queries, HTTP calls

```go
// Handler receives context from HTTP request
func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
    // r.Context() contains request context (auth info, timeouts)
    post, err := h.postService.CreatePost(r.Context(), req.ToModel())
}

// Service passes context to repository
func (s *PostService) CreatePost(ctx context.Context, post *models.Post) (*models.Post, error) {
    return s.postRepo.Create(ctx, post)  // Propagates context and timeouts
}

// Repository uses context for DB queries
func (r *PostRepository) Create(ctx context.Context, post *models.Post) (*models.Post, error) {
    err := r.db.QueryRowContext(ctx, query, ...).Scan(...)  // Respects context deadline
}
```

## Testing

### Mocking Strategy

**Prefer Manual Mocks Over Frameworks** (Idiomatic Go)
- Write simple test doubles by hand
- Go's interface-based design makes this easy
- No heavy dependencies, no code generation
- Example: Create a `mockDB` type that implements the DB interface

```go
// post_test.go
type mockDB struct {
    queryRowFn func(ctx context.Context, query string, args ...interface{}) sql.Row
}

func (m *mockDB) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
    return m.queryRowFn(ctx, query, args...)
}

func TestPostSave_InvalidSlug(t *testing.T) {
    mockDB := &mockDB{
        queryRowFn: func(ctx context.Context, query string, args ...interface{}) sql.Row {
            // Return mock Row that scans into fields
            return mockRow{err: sql.ErrNoRows}
        },
    }

    post, err := NewPost(mockDB, "", "Title", "Summary", "Body", []string{}, "draft")
    if err == nil {
        t.Fatal("expected error for empty slug")
    }
}
```

**Use testify/assert for Cleaner Assertions**
```go
import "github.com/stretchr/testify/assert"

func TestPostSave_Success(t *testing.T) {
    // ...
    assert.NoError(t, err)
    assert.Equal(t, "test-slug", post.Slug)
    assert.NotNil(t, post.CreatedAt)
}
```

**Test Database for Integration Tests** (Recommended)
- Real database is better than mocking for complex queries
- Create test DB, run migrations, seed data, tear down
- No need to mock DB interactions when you have a real (test) database

```go
// post_test.go - Integration test
func TestPostSave_Integration(t *testing.T) {
    // Setup test DB
    db := setupTestDB(t)
    defer db.Close()

    // Real post save and query
    post, err := NewPost(db, "test-slug", "Title", "Summary", "Body", []string{}, "draft")
    assert.NoError(t, err)

    err = post.Save(context.Background())
    assert.NoError(t, err)

    // Verify in DB
    retrieved, err := GetPostBySlug(context.Background(), db, "test-slug")
    assert.NoError(t, err)
    assert.Equal(t, post.Slug, retrieved.Slug)
}
```

**When to Mock vs. When to Use Test Database**
| Scenario | Approach | Reason |
|----------|----------|--------|
| Unit testing validation logic | Manual mock or no DB | Tests business rules, not DB |
| Testing DB queries | Real test database | Complex queries need real DB to verify |
| Testing external APIs (Cognito) | Manual mock interface | Don't hit external services in tests |
| Testing middleware | Mock http.ResponseWriter | Simple to mock, no DB needed |
| Testing error handling | Manual mock returning errors | Easy to simulate edge cases |

**Mockery: Auto-Generated Mocks** (Preferred)
- Code generation based on interfaces (best of both worlds)
- Lightweight, well-maintained
- Simple to use: `mockery --all` or `mockery --name=InterfaceName`
- Generates clean, testable mocks
- Integrates with Makefile for easy regeneration

**How to Use Mockery:**

1. Define interfaces for your dependencies:
```go
// internal/auth/cognito.go
package auth

type TokenVerifier interface {
    VerifyToken(ctx context.Context, token string) (*User, error)
}

type CognitoVerifier struct {
    // ...
}

func (c *CognitoVerifier) VerifyToken(ctx context.Context, token string) (*User, error) {
    // Real implementation
}
```

2. Generate mocks:
```bash
mockery --name=TokenVerifier  # Generates mocks/MockTokenVerifier.go
mockery --all                  # Generates mocks for all interfaces in package
```

3. Use in tests:
```go
import "your-module/mocks"

func TestControllerVerifiesToken(t *testing.T) {
    // Create mock
    mockVerifier := mocks.NewMockTokenVerifier(t)

    // Set expectations
    mockVerifier.EXPECT().
        VerifyToken(mock.Anything, "valid-token").
        Return(&User{ID: "123"}, nil).
        Once()

    mockVerifier.EXPECT().
        VerifyToken(mock.Anything, "invalid-token").
        Return(nil, errors.New("invalid")).
        Once()

    // Pass mock to controller
    controller := NewPostController(db, mockVerifier)

    // Test...
    assert.NoError(t, mockVerifier.AssertExpectations(t))
}
```

**Mockery Configuration** (.mockery.yaml):
```yaml
# .mockery.yaml
packages:
  github.com/sochoa/api/internal/auth:
    interfaces:
      TokenVerifier:
      ConfigLoader:
  github.com/sochoa/api/internal/db:
    interfaces:
      QueryExecutor:

output-dir: mocks/
mockname-formatter: "Mock{InterfaceName}"
```

**Makefile Integration:**
```makefile
.PHONY: mocks
mocks:
	mockery --all --output=mocks

.PHONY: test
test: mocks
	go test ./...
```

**Why Mockery?**
- ✅ Auto-generated: Don't write boilerplate
- ✅ Type-safe: Full type checking by compiler
- ✅ Readable: Clean `.EXPECT()` syntax
- ✅ Lightweight: Not as heavy as golang/mock
- ✅ Git-friendly: Committed generated files, easy to review changes

**Testing Dependencies** (add to go.mod):
```
github.com/stretchr/testify v1.8.x        # For assert, require
github.com/vektra/mockery/v2 v2.x (tool)  # For mock generation (go install or Makefile)
```

**Test Helpers** (internal/testutil/):
```go
// testutil/db.go
func SetupTestDB(t *testing.T) *sql.DB {
    // Create test database
    // Run migrations
    // Return DB connection
}

func TeardownTestDB(t *testing.T, db *sql.DB) {
    // Drop test database
}

func CreateTestUser() string {
    // Return mock user ID for testing
}
```

### Unit Tests (Models)
Test model creation, validation, and transformations in `internal/model/*_test.go`:

```go
// internal/model/post_test.go
package model

import (
    "context"
    "database/sql"
    "testing"
)

func TestNewPost_ValidatesSlug(t *testing.T) {
    post, err := NewPost(nil, "", "Title", "Summary", "Body", []string{}, "draft")
    if err == nil {
        t.Fatal("expected error for empty slug")
    }
    if post != nil {
        t.Fatal("expected nil post on error")
    }
}

func TestNewPost_EnforcesMaxTitleLength(t *testing.T) {
    longTitle := "This is a very long title that exceeds the 140 character limit that we have set for blog post titles"
    post, err := NewPost(nil, "test-slug", longTitle, "Summary", "Body", []string{}, "draft")
    if err == nil {
        t.Fatal("expected error for title too long")
    }
}

func TestNewPost_Success(t *testing.T) {
    post, err := NewPost(nil, "test-slug", "Test Title", "Summary", "Body", []string{"tag1"}, "draft")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if post == nil {
        t.Fatal("expected post, got nil")
    }
    if post.Slug != "test-slug" {
        t.Errorf("wrong slug: %s", post.Slug)
    }
}
```

### Integration Tests (Controllers)
Test controllers with real (test) database in `internal/controller/*_test.go`:

```go
// internal/controller/post_test.go
package controller

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

func setupTestDB(t *testing.T) *sql.DB {
    // Create test database, run migrations
    db, err := sql.Open("postgres", testDSN)
    if err != nil {
        t.Fatalf("failed to open test db: %v", err)
    }
    // Run migrations, clean tables, etc.
    return db
}

func TestPostController_CreatePost_Success(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()

    controller := NewPostController(db)

    body := `{
        "slug": "test-post",
        "title": "Test Title",
        "summary": "Test summary",
        "body": "Test body",
        "tags": ["test"],
        "status": "draft"
    }`

    req := httptest.NewRequest("POST", "/api/posts", strings.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    controller.CreatePost(w, req)

    if w.Code != http.StatusCreated {
        t.Errorf("got status %d, want %d", w.Code, http.StatusCreated)
    }

    // Verify response body
    var response map[string]interface{}
    if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
        t.Fatalf("failed to decode response: %v", err)
    }
    if response["slug"] != "test-post" {
        t.Errorf("wrong slug in response: %v", response["slug"])
    }
}

func TestPostController_ListPosts_Success(t *testing.T) {
    db := setupTestDB(t)
    defer db.Close()

    // Insert test data
    // ...

    controller := NewPostController(db)

    req := httptest.NewRequest("GET", "/api/posts?page=1&limit=10", nil)
    w := httptest.NewRecorder()

    controller.ListPosts(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("got status %d, want %d", w.Code, http.StatusOK)
    }

    var responses []*view.PostResponse
    if err := json.NewDecoder(w.Body).Decode(&responses); err != nil {
        t.Fatalf("failed to decode response: %v", err)
    }
    if len(responses) != 1 {
        t.Errorf("got %d posts, want 1", len(responses))
    }
}
```

### Test Coverage
- Aim for 70%+ coverage overall
- Focus on models (business logic)
- Integration tests for critical controller paths
- Test error cases, validation, edge cases

Run:
```bash
go test -cover ./...      # Show coverage summary
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out  # View coverage in browser
```

## Dependency Injection

In the MVC pattern, controllers and models receive the database connection via constructors. Keep it simple:

```go
// Controller constructor
func NewPostController(db *sql.DB) *PostController {
    return &PostController{db: db}
}

// Model functions accept db as parameter
func NewPost(db *sql.DB, slug, title string, ...) (*Post, error) {
    // Validate and initialize
    return &Post{db: db, ...}, nil
}
```

In `cmd/api/main.go`, wire up controllers and database:

```go
package main

import (
    "database/sql"
    "net/http"
    "github.com/sochoa/api/internal/controller"
    "github.com/sochoa/api/internal/db"
)

func main() {
    // Setup database
    database := db.Setup()
    defer database.Close()

    // Create controllers
    postCtrl := controller.NewPostController(database)
    guestbookCtrl := controller.NewGuestbookController(database)

    // Register routes
    http.HandleFunc("POST /api/posts", postCtrl.CreatePost)
    http.HandleFunc("GET /api/posts", postCtrl.ListPosts)
    http.HandleFunc("GET /api/posts/{slug}", postCtrl.GetPost)
    http.HandleFunc("POST /api/guestbook", guestbookCtrl.Submit)

    // Start server
    http.ListenAndServe(":8080", nil)
}
```

**Avoid global state**:
- No package-level `var db *sql.DB`
- No singletons unless absolutely necessary
- Pass dependencies through function arguments

## Database Practices

### Queries
- Always use parameterized queries (`$1`, `$2`, ...) to prevent SQL injection
- Use `QueryRowContext` for single rows; `QueryContext` for multiple rows
- Handle `sql.ErrNoRows` explicitly (not found vs error)

```go
// Good
err := r.db.QueryRowContext(ctx, "SELECT * FROM posts WHERE slug = $1", slug).Scan(&post)
if err == sql.ErrNoRows {
    return nil, errors.NewNotFoundError("post not found")
}

// Bad
err := r.db.QueryRowContext(ctx, "SELECT * FROM posts WHERE slug = '"+slug+"'").Scan(&post)
```

### Connection Pool
Configured in `db.Open()`:

```go
db, err := sql.Open("postgres", dsn)
db.SetMaxOpenConns(25)      // Lambda concurrency * 2–3
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

### Transactions
Use for multi-step operations; ensure rollback on error:

```go
tx, err := r.db.BeginTx(ctx, nil)
if err != nil {
    return fmt.Errorf("begin transaction: %w", err)
}
defer tx.Rollback()

// Do work...

if err := tx.Commit(); err != nil {
    return fmt.Errorf("commit: %w", err)
}
```

## Structured Logging (Stdlib log/slog)

**Requirements:**
- Use `log/slog` (Go 1.21+, stdlib)
- ISO8601 timestamps with timezone
- Include package, filename, and line number
- Log level (Debug, Info, Warn, Error)
- Structured key/value pairs for contextual data
- Request ID propagation via context

**Setup** (internal/logger/logger.go):
```go
package logger

import (
    "log/slog"
    "os"
)

func Setup(level string) *slog.Logger {
    var logLevel slog.Level
    switch level {
    case "debug":
        logLevel = slog.LevelDebug
    case "warn":
        logLevel = slog.LevelWarn
    case "error":
        logLevel = slog.LevelError
    default:
        logLevel = slog.LevelInfo
    }

    opts := &slog.HandlerOptions{
        Level:     logLevel,
        AddSource: true,  // Include file+line
    }

    // Use JSON handler for structured logs with ISO8601+TZ timestamps
    handler := slog.NewJSONHandler(os.Stdout, opts)
    return slog.New(handler)
}

// Context helpers
func WithRequestID(ctx context.Context, requestID string) context.Context {
    return context.WithValue(ctx, "request_id", requestID)
}

func WithUser(ctx context.Context, userID string) context.Context {
    return context.WithValue(ctx, "user_id", userID)
}
```

**Log Message Conventions:**
- **Lowercase** for all log messages (no capital letters)
- **Exception**: Acronyms remain uppercase (JWT, HTTP, OAuth, SQL, UUID, etc.)
- Messages are not sentences, no periods needed
- Use present tense or past tense consistently

**Examples:**
```go
// ✅ Good - lowercase with acronym
slog.InfoCtx(ctx, "JWT verified", "user_id", userID)
slog.ErrorCtx(ctx, "HTTP request failed", "status", 500)
slog.WarnCtx(ctx, "OAuth token expired", "provider", "google")

// ✅ Good - lowercase, no acronyms
slog.InfoCtx(ctx, "post created", "post_id", post.ID)
slog.ErrorCtx(ctx, "database connection failed", "error", err)

// ❌ Bad - capital letters
slog.InfoCtx(ctx, "Post Created")
slog.ErrorCtx(ctx, "Database Connection Failed")
```

**Usage Examples:**

```go
import "log/slog"

// Simple info log (lowercase)
slog.Info("post created", "post_id", post.ID, "slug", post.Slug)

// With context (includes request_id automatically)
slog.InfoCtx(ctx, "guestbook entry submitted", "entry_id", entry.ID, "user_id", user.ID)

// Error with wrapped error (lowercase, acronyms uppercase)
slog.ErrorCtx(ctx, "failed to save post", "error", err, "slug", slug)

// Warning with multiple details
slog.WarnCtx(ctx, "rate limit approaching", "user_id", userID, "remaining", remaining, "window_sec", 60)

// Debug for development
slog.DebugCtx(ctx, "validating post", "slug", slug, "title_length", len(title))

// With acronyms
slog.InfoCtx(ctx, "JWT verified successfully", "subject", user.ID)
slog.ErrorCtx(ctx, "HTTP request to OAuth provider failed", "error", err)
slog.WarnCtx(ctx, "SQL query timeout", "query_ms", 5000)
```

**Log Output Format** (JSON with all required fields):
```json
{
  "time": "2025-11-28T14:30:45.123Z",
  "level": "INFO",
  "source": {
    "function": "github.com/sochoa/api/internal/controller.(*PostController).CreatePost",
    "file": "internal/controller/post.go",
    "line": 42
  },
  "msg": "post created",
  "post_id": "uuid-123",
  "slug": "my-post",
  "request_id": "req-456"
}
```

**Log Levels & Usage:**
- **Debug**: Development tracing (parameter values, loop iterations, conditional branches)
  ```go
  slog.DebugCtx(ctx, "checking post validation", "slug_len", len(slug), "title_len", len(title))
  ```

- **Info**: Significant business events (resource created, user action completed)
  ```go
  slog.InfoCtx(ctx, "post published", "post_id", post.ID, "published_at", time.Now())
  ```

- **Warn**: Recoverable issues (rate limit hit, retry attempted, deprecated usage)
  ```go
  slog.WarnCtx(ctx, "rate limit hit", "user_id", userID, "limit", limit, "window", window)
  ```

- **Error**: Errors that need attention (DB failure, validation error, unexpected state)
  ```go
  slog.ErrorCtx(ctx, "failed to save contact submission", "error", err, "email", email)
  ```

**Context Propagation** (Middleware):
```go
// In auth middleware
user, err := verifyToken(token)
ctx := logger.WithUser(r.Context(), user.ID)

// In logging middleware
requestID := uuid.New().String()
ctx := logger.WithRequestID(r.Context(), requestID)
r = r.WithContext(ctx)

// Now all downstream logs include request_id and user_id automatically
```

**Key/Value Pair Naming Conventions:**
- Use snake_case for keys: `post_id`, `user_id`, `entry_id`, `request_id`
- Avoid generic names like `value`, `data`, `result`
- Include units in keys if relevant: `latency_ms`, `timeout_sec`, `size_bytes`
- For errors, always use `"error"` key: `"error", err`

**In Application Code** (all messages lowercase):
```go
// Model/Service layer
func (p *Post) Save(ctx context.Context) error {
    slog.DebugCtx(ctx, "saving post to database", "slug", p.Slug, "status", p.Status)
    // ... DB operation
    if err != nil {
        slog.ErrorCtx(ctx, "failed to save post", "error", err, "slug", p.Slug)
        return err
    }
    slog.InfoCtx(ctx, "post saved to database", "post_id", p.ID, "slug", p.Slug)
    return nil
}

// Controller layer
func (c *PostController) CreatePost(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    slog.DebugCtx(ctx, "received POST /api/posts request")

    post, err := model.NewPost(c.db, slug, title, summary, body, tags, status)
    if err != nil {
        slog.WarnCtx(ctx, "post validation failed", "error", err, "slug", slug)
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    if err := post.Save(ctx); err != nil {
        slog.ErrorCtx(ctx, "failed to create post", "error", err, "slug", slug)
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    slog.InfoCtx(ctx, "post created successfully", "post_id", post.ID, "slug", slug)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(view.FromPost(post))
}

// Auth middleware with acronyms
func (m *AuthMiddleware) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := extractToken(r)
        if token == "" {
            slog.DebugCtx(r.Context(), "no JWT token provided")
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }

        user, err := m.verifier.VerifyToken(r.Context(), token)
        if err != nil {
            slog.WarnCtx(r.Context(), "JWT verification failed", "error", err)
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }

        slog.DebugCtx(r.Context(), "JWT verified", "user_id", user.ID, "email", user.Email)
        ctx := logger.WithUser(r.Context(), user.ID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

**No Logging of Sensitive Data:**
- ❌ Never log passwords, tokens, API keys
- ❌ Never log full email addresses in high-volume logs (OK for errors)
- ❌ Never log full request bodies
- ✅ OK to log user IDs, post slugs, non-sensitive identifiers
- ✅ OK to log error messages (user-facing)
- ✅ OK to log request metadata (method, path, latency)

## Lambda-Specific Considerations

Since API runs as Lambda functions:

1. **Connection Reuse**: Initialize DB connection once in `main()`, reuse in handlers (cold start optimization)
2. **Timeouts**: Set strict timeouts for DB queries (~2–5s) and HTTP calls (~3–5s)
3. **Memory**: Monitor memory footprint; avoid large goroutine pools
4. **Concurrent Requests**: Lambda invokes handler per request; goroutines are safe but pool size should match concurrency

```go
// In handler
ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
defer cancel()

post, err := h.postService.CreatePost(ctx, req.ToModel())
```

## Build & Deployment

### Local Build
```bash
go build -o dist/api ./cmd/api
```

### Cross-Platform Build (for Lambda)
```bash
GOOS=linux GOARCH=arm64 go build -o dist/api ./cmd/api
```

### Dependencies
- Pin versions in `go.mod` (no `latest`)
- Run `go mod tidy` before commit
- Use semantic versioning for imports

### Build Flags (if needed)
```bash
go build -ldflags="-X main.Version=1.0.0" -o dist/api ./cmd/api
```

## Performance Guidelines

1. **Avoid Allocations in Loops**: Pre-allocate slices with capacity
   ```go
   posts := make([]*models.Post, 0, limit)  // Good: pre-allocate
   var posts []*models.Post                 // Bad: grows with each append
   ```

2. **Reuse Buffers**: Use `sync.Pool` for temporary objects if creating many
3. **Query Optimization**: Index frequently-filtered columns; avoid SELECT *
4. **Connection Pooling**: Reuse DB connections; don't open/close per query
5. **Timeouts**: Always set timeouts on I/O operations (DB, HTTP, context)

## Security Guidelines

1. **Input Validation**: Validate all user input in request DTOs and services
2. **SQL Injection**: Always use parameterized queries
3. **Secrets**: Read from AWS Secrets Manager, not environment variables
4. **Rate Limiting**: Enforce rate limits in middleware or service layer
5. **Logging**: Never log PII (emails, IPs) or secrets (keys, tokens)
6. **Error Messages**: Don't expose internal details in HTTP errors; log full errors

## Dependencies

Preferred libraries (keep minimal):
- `database/sql` + PostgreSQL driver (`github.com/lib/pq` or `github.com/jackc/pgx`)
- `encoding/json` for JSON marshaling (standard library)
- `log/slog` for structured logging (Go 1.21+)
- `github.com/golang-jwt/jwt` for JWT validation (if not using Cognito SDK)
- `github.com/google/uuid` for UUID generation

Avoid heavy frameworks; prefer standard library + minimal dependencies.
