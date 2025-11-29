# Lambda Runtime Adapter: Tradeoffs Analysis

## Option A: Custom Runtime (Keep HTTP Server)

**Your code stays as-is. Lambda runs your Gin binary and proxies requests.**

### How It Works
```
Lambda Runtime Proxy (port 8000)
        ↓ HTTP request
    Your Gin App (port 8000)
        ↓
    Response back
```

Lambda's custom runtime wraps your Go binary and handles the Lambda event-to-HTTP translation.

### Pros ✅
| Benefit | Impact |
|---|---|
| **Minimal code changes** | Keep 99% of existing code. Just ensure app listens on `:8000` instead of `:8080` |
| **Local dev identical** | `make api` works exactly like Lambda. No special test mode needed |
| **Production-grade server** | Your Gin middleware, routing, error handling all proven |
| **Easy migrations** | Can run same binary on EC2, ECS, Kubernetes later |
| **No vendor lock-in** | Not tied to Lambda's event model |
| **Debugging simple** | Just regular HTTP debugging - set breakpoints, inspect requests |
| **Team familiarity** | HTTP is familiar. Everyone knows how to debug HTTP |

### Cons ❌
| Downside | Impact |
|---|---|
| **Cold start slower** | HTTP server startup + Gin bootstrap ~500ms-1s |
| **Memory overhead** | HTTP server running constantly = higher baseline memory |
| **Inefficient** | Extra proxy layer adds ~10-20ms per request |
| **Not idiomatic** | Lambda designed for stateless handler functions, not persistent servers |
| **Can't use async** | Lambda can't process multiple invocations concurrently on same instance |
| **Scaling limitations** | Can't easily implement Lambda-specific concurrency patterns |

### Example Implementation
```go
// main.go - minimal changes
package main

import (
    "fmt"
    "log"

    // Existing imports
    "github.com/gin-gonic/gin"
)

func main() {
    router := setupRouter() // Your existing code

    // Only change: listen on :8000 for Lambda
    if err := router.Run(":8000"); err != nil {
        log.Fatal(err)
    }
}

// All other code stays the same
func setupRouter() *gin.Engine { ... }
```

### Performance Profile
```
Invocation Timeline:
0ms     - Lambda receives event
50ms    - Your binary starts + HTTP server boots
100ms   - First request reaches your handler
105ms   - Handler processes (your code)
110ms   - Response sent back
150ms   - Total latency

Cold starts: 1-3 seconds (server initialization)
Warm starts: 50-100ms (overhead of HTTP proxy)
Memory: ~150-200MB baseline + heap
```

### Cost Impact
- Higher memory usage = higher Lambda cost
- Example: 512MB memory × higher CPU utilization = ~$0.50/month vs $0.30 with optimized handler
- Longer cold starts = potential user-facing latency

---

## Option B: Lambda-Native Handler

**Refactor to use `aws-lambda-go/lambda` handlers. Your code becomes a pure function.**

### How It Works
```
Lambda Event (HTTP request)
        ↓
    Your Handler Function
        ↓
    Response
        ↓
Lambda returns directly (no HTTP proxy)
```

### Pros ✅
| Benefit | Impact |
|---|---|
| **Fast cold starts** | No server boot, just function invocation. 100-300ms |
| **Low memory** | ~100MB baseline (no HTTP server) = lower cost |
| **Idiomatic** | Uses Lambda's event model as designed |
| **Efficient** | Direct event-to-response, no proxy overhead |
| **Better scaling** | Lambda can run multiple handlers concurrently |
| **Async-friendly** | Can leverage Lambda's concurrency model |
| **Smaller artifact** | ~45MB vs ~60MB |

### Cons ❌
| Downside | Impact |
|---|---|
| **Significant refactoring** | Change from HTTP server to event handler pattern |
| **Middleware rewrite** | Auth, logging middleware need Lambda adapter |
| **Testing complexity** | Need to mock Lambda events, harder to debug |
| **Vendor lock-in** | Your code now tied to Lambda's event model |
| **Local dev different** | Can't just `make api`. Need Lambda emulator or special test mode |
| **Gin router gone** | Can't use Gin's elegant routing. Need alternative or custom router |
| **Team learning curve** | Team needs to understand Lambda event model |
| **Hard to migrate** | Moving to ECS/Kubernetes requires rewrite |

### Example Implementation
```go
package main

import (
    "context"
    "encoding/json"

    "github.com/aws/aws-lambda-go/events"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-lambda-go/middleware"
)

// Handler receives Lambda HTTP event, returns response
func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    // Parse path, method, body from request
    path := request.Path
    method := request.HTTPMethod
    body := request.Body

    // Your handler logic here
    // Example: route to different functions based on path + method
    switch method {
    case "GET":
        if path == "/api/posts" {
            return listPosts(ctx)
        }
    case "POST":
        if path == "/api/posts" {
            return createPost(ctx, body)
        }
    }

    // Return error response
    return events.APIGatewayProxyResponse{
        StatusCode: 404,
        Body:       `{"error": "not found"}`,
    }, nil
}

func listPosts(ctx context.Context) (events.APIGatewayProxyResponse, error) {
    // Your implementation
    return events.APIGatewayProxyResponse{
        StatusCode: 200,
        Body:       `[...]`,
    }, nil
}

func main() {
    lambda.Start(handler)
}
```

Notice: No Gin, no HTTP server, just event → response

### Performance Profile
```
Invocation Timeline:
0ms     - Lambda receives event
5ms     - Your code starts (no initialization)
10ms    - Handler processes (your code)
15ms    - Response sent back
20ms    - Total latency

Cold starts: 100-300ms (just process boot)
Warm starts: 5-20ms (pure function execution)
Memory: ~100-120MB baseline
```

### Cost Impact
- Lower memory usage = lower Lambda cost
- Example: 256MB memory × faster execution = ~$0.25/month vs $0.50 with HTTP server
- **Potential savings: $3-5/month** (small site), **$50-100/month** (high traffic)

---

## Option C: Hybrid Bridge Pattern (RECOMMENDED) 🎯

**Use `aws-lambda-go` for invocation but adapt requests to your existing HTTP handlers.**

### How It Works
```
Lambda Event
    ↓
Adapter Layer (converts event to HTTP)
    ↓
Your existing Gin handlers
    ↓
Convert response back to Lambda format
```

### Implementation Sketch
```go
package main

import (
    "context"
    "fmt"
    "github.com/aws/aws-lambda-go/events"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/gin-gonic/gin"
    "net/http"
    "net/http/httptest"
)

// Adapter converts Lambda event to HTTP and your handlers
func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    // Create your Gin router (same as before)
    router := setupRouter()

    // Create a fake HTTP request from Lambda event
    req := httptest.NewRequest(
        request.HTTPMethod,
        request.Path,
        strings.NewReader(request.Body),
    )

    // Add headers from Lambda event
    for key, value := range request.Headers {
        req.Header.Set(key, value)
    }

    // Create response recorder
    w := httptest.NewRecorder()

    // Call your existing handlers
    router.ServeHTTP(w, req)

    // Convert HTTP response back to Lambda format
    return events.APIGatewayProxyResponse{
        StatusCode:      w.Code,
        Body:            w.Body.String(),
        Headers:         w.Header(),
        IsBase64Encoded: false,
    }, nil
}

// Your existing code works unchanged
func setupRouter() *gin.Engine { ... }

func main() {
    lambda.Start(handler)
}
```

### Pros ✅
- ✅ Keep 90% of your Gin code
- ✅ Get 80% of Lambda performance benefits
- ✅ Moderate cold start improvement (400ms vs 100ms)
- ✅ Moderate memory reduction (150MB vs 100MB)
- ✅ Can test locally fairly easily
- ✅ Still runs as standard HTTP during local dev
- ✅ Good balance of tradeoffs

### Cons ❌
- ❌ Still creates HTTP objects for each request (some overhead)
- ❌ Not as efficient as pure Lambda handler
- ❌ More complex than either pure option
- ❌ Adds adapter layer to maintain

---

## Decision Matrix

| Factor | Custom Runtime | Hybrid Bridge | Lambda-Native |
|---|---|---|---|
| **Code changes** | Minimal | Moderate | Major |
| **Cold start** | 1-3s ❌ | 400ms ⚠️ | 100-300ms ✅ |
| **Memory** | 150-200MB ❌ | 130-150MB ⚠️ | 100-120MB ✅ |
| **Monthly cost** | $25-30 | $22-25 | $20-22 |
| **Local dev** | Same ✅ | Similar ⚠️ | Different ❌ |
| **Testing** | Easy ✅ | Moderate ⚠️ | Complex ❌ |
| **Gin features** | All ✅ | All ✅ | None ❌ |
| **Vendor lock-in** | None ✅ | Minimal ⚠️ | High ❌ |
| **Migration later** | Easy ✅ | Moderate ⚠️ | Hard ❌ |

---

## Recommendation for sochoa.dev

### ✅ **Go with Option C: Hybrid Bridge**

**Why:**
1. **Personal site** - Traffic is low, so performance difference minimal
2. **Startup friction** - You already have working Gin code. Why rewrite?
3. **Development velocity** - Get to deployment faster
4. **Future flexibility** - If Lambda becomes a bottleneck, migrate to native handler
5. **Best balance** - 80/20 rule: get 80% of benefits with 20% effort

### Implementation Plan
1. Create adapter layer (50 lines of Go)
2. Change `main.go` to use Lambda handler instead of `http.ListenAndServe`
3. Set environment to listen on `:8000` for local HTTP fallback
4. Update Dockerfile.lambda to run with Lambda runtime

### Timeline
- 30 minutes: Write adapter
- 15 minutes: Update main.go
- 15 minutes: Test locally with `make api`
- 30 minutes: Test in Lambda simulator

**Total: ~1.5 hours**

---

## If You Have High Traffic Later

If sochoa.dev gets popular and Lambda costs become noticeable:

1. **Profile first** - Use X-Ray to find bottlenecks
2. **Optimize handler** - Move common operations outside handler
3. **Increase memory** - Often cheaper than optimization (more CPU allocated)
4. **Consider migration** - If still worth it, refactor to pure Lambda handler

---

## Code Structure Comparison

### Custom Runtime
```
main.go
├── func main()
│   └── router.Run(":8000")
├── setupRouter()
├── handler.CreatePost()
├── handler.ListPosts()
└── ...
```

### Hybrid Bridge
```
main.go
├── func handler(ctx, event)
│   ├── Create HTTP request
│   ├── Call router.ServeHTTP()
│   └── Convert response
├── setupRouter()
├── handler.CreatePost()  # UNCHANGED
├── handler.ListPosts()   # UNCHANGED
└── ...
```

### Lambda-Native
```
main.go
├── func handler(ctx, event)
│   ├── Parse event.Path, event.Method
│   ├── Route to function
│   └── Return response
├── func listPosts(ctx) events.APIGatewayProxyResponse
├── func createPost(ctx, body) events.APIGatewayProxyResponse
└── ... (all new functions)
```

---

## Final Recommendation

**Use Hybrid Bridge** because:
- ✅ Your code stays mostly intact
- ✅ You get real Lambda benefits (30-40% cost/performance improvement)
- ✅ Easy to migrate to pure Lambda later if needed
- ✅ Local development experience stays similar
- ✅ Team doesn't need to learn Lambda event model yet
- ✅ Can deploy in 2-3 hours

**Move to Lambda-native** only if:
- Traffic grows significantly
- Lambda bills become noticeable
- You want to optimize for serverless patterns
- Your team is comfortable with Lambda
