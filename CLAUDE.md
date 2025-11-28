# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal site for sochoa.dev, a React + Go full-stack web application with AWS CDK infrastructure. The site showcases work, writing, contact paths, and visitor stats with a focus on performance, accessibility, and privacy.

Key technology stack:
- **UI**: React + TypeScript + TailwindCSS (built to S3, served via CloudFront)
- **API**: Go-based Lambda functions with API Gateway (MVC: Model-View-Controller architecture)
- **Database**: PostgreSQL on RDS with golang-migrate
- **Infrastructure**: AWS CDK (IaC)
- **Auth**: Cognito with Google/LinkedIn federation
- **CI/CD**: GitHub Actions with OIDC to AWS

See `docs/REQUIREMENTS_V1.md` for the complete specification, including design decisions, API surface, database schema, security model, and cost estimates.

## Project Structure

```
/ui          - React + TypeScript + TailwindCSS UI application
/api         - Go API service (handlers, services, repositories)
/infra       - AWS CDK infrastructure code (Python or TypeScript)
/docs        - Project documentation (REQUIREMENTS_V1.md)
```

## Common Development Commands

### UI Development
```bash
# Install dependencies (from /ui)
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format

# Type checking
npm run type-check
```

### API Development
```bash
# Install dependencies (from /api)
go mod download

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Build binary
go build -o dist/api ./cmd/api

# Lint (requires golangci-lint)
golangci-lint run ./...

# Format code
go fmt ./...
```

### Infrastructure
```bash
# From /infra directory
# Install CDK and dependencies
npm install

# Synthesize CDK template
cdk synth

# Show differences (before deploying)
cdk diff [stack-name]

# Deploy stacks
cdk deploy [stack-name]

# List stacks
cdk list
```

### Database Migrations
```bash
# Using golang-migrate (from /api directory)
migrate -path db/migrations -database "postgres://..." up
migrate -path db/migrations -database "postgres://..." down
```

## Key Architectural Patterns

### Layer-to-Layer Communication & Security

1. **Edge → API**: CloudFront uses Origin Access Control (OAC) to API Gateway. API validates expected host headers to prevent direct bypass.

2. **UI → API**: Bearer tokens (JWTs from Cognito) on state-changing requests. Public GETs require no auth. CORS restricted to site domains.

3. **API → Database**: App user credentials stored in AWS Secrets Manager with least-privilege role separation (no shared superuser).

4. **CI/CD → AWS**: GitHub Actions assumes scoped IAM roles via OIDC per environment.

5. **Metrics Intake**: Signed key header required; stored in Secrets Manager; reject unsigned requests.

6. **Admin Actions**: Require `admin` claim/group in Cognito, enforced in controller logic (defense-in-depth, not edge-only).

### Database Design

Posts, guestbook entries, contact submissions, and visitor stats aggregates live in Postgres. Key points:
- Posts: sole source of truth; authored/managed via admin UI, stored as GFM markdown.
- Guestbook & Contact: idempotency keys enforce safe retries; rate limits per user/token.
- Visitor Stats: pre-aggregated to avoid per-event storage; CloudWatch custom metrics for real-time.
- Migrations: `golang-migrate` with SQL files tracked in repo; run before API deploy.
- Connection pooling: Lambda reuses in-process connections; cap concurrency to avoid pool exhaustion.

### Authentication & Authorization Model

- **Cognito User Pool** with Google + LinkedIn IdPs; tokens verified by API.
- **Token structure**: Verify `aud/iss/exp/email_verified`; access tokens ~1h; refresh via Cognito.
- **Role-based access**: `public` (read-only), `user` (guestbook/contact writes + anti-spam), `admin` (moderation).
- **Admin bootstrap**: Users sign in once, then operator adds to Cognito `admin` group.

### Caching & CDN Strategy

- **CloudFront**: Long cache + content hashing for static assets (JS/CSS/fonts/images); short TTL for HTML (0–60s default, stale-while-revalidate).
- **Invalidation**: Auto-invalidate HTML paths on deploy; assets rely on hash-based filenames.
- **API caching**: Disabled for dynamic endpoints (guestbook/contact); short cache for read-heavy (posts/stats) if consistency allows.
- **Cache keys**: For API, include only necessary headers (auth, content-type); avoid cache poisoning from auth headers.

### Request Validation & Anti-Spam

- **Guestbook/Contact**: honeypot field + optional lightweight challenge; strip/deny HTML/links; rate limit per user/token (e.g., 3/day guestbook, 5/day contact).
- **Metrics intake**: signed key required; rate limit per key; drop unsigned.
- **Moderation**: admin delete for guestbook; optional pre-approval to auto-hide until approved.

### API Response Patterns

All endpoints return consistent error codes: `400` (validation), `401` (unauth), `403` (forbidden), `404` (missing), `429` (throttled), `500` (server error).

**Example admin post create**:
```
POST /api/posts
Headers: Authorization: Bearer <jwt>
Body: { slug, title, summary, body, tags[], status }
Response: 201 { id, slug, ... } or 400 { error }
```

**Example guestbook submission**:
```
POST /api/guestbook
Headers: Authorization: Bearer <jwt>
Body: { message (≤500), displayName? (≤50), honeypot? }
Response: 201 { id, ... } or 401/403/429
```

## Security Considerations

### Input & Output Safety
- **Parameterized queries** for all DB interactions.
- **HTML escaping/sanitizing** for rendered user-generated content (guestbook).
- **Markdown rendering**: safe parsing (no inline scripts) for posts.
- **CSP**: `script-src 'self' + hashes if needed`, `object-src 'none'`; X-Frame-Options DENY; X-Content-Type-Options nosniff.

### Secrets & Configuration
- **Never commit** `.env`, credentials, API keys.
- **AWS Secrets Manager** for OAuth secrets, API keys, DB passwords.
- **Environment variables** only for non-secret config (feature flags, domains, analytics provider).
- **Least privilege**: Lambda roles scoped; CI/CD roles per environment; app DB user separate from superuser.

### Data Protection
- **Minimal PII**: guestbook stores message + display name + provider user ID (no IP); contact form stores email/name/message with 90–180 day retention.
- **Metrics**: raw events max 30 days; only aggregated metrics kept; no emails/IPs/names.
- **Encryption at rest**: RDS, S3, CloudWatch Logs, Secrets Manager all KMS-encrypted.
- **Logging**: structured logs; redact emails/names from logs/metrics.

### Dependency & Build Security
- **Pin dependencies** in package.json, go.mod; no floating versions.
- **Automated vulnerability scanning**: GitHub Dependabot; regular updates.
- **Build artifacts**: signed/tagged; CDK IaC reviewed before deploy.
- **Integrity checks**: Subresource Integrity for external assets if used.

## Observable Metrics & Monitoring

- **CloudWatch Logs** (30–45 day retention) for API, Lambda, migration logs.
- **Custom metrics**: visitor events (page_view, navigation, fetch, guestbook/contact submit); dimensions: path, country, referrer domain, user agent family.
- **Alarms**: 4xx/5xx spikes, latency p99 > threshold, RDS connection saturation.
- **Error handling**: user-friendly fallbacks when API unavailable; 429 with suggested retry; offline-ish states for fetch failures.

## Deployment & Rollback

- **CI/CD stages**: PR checks (lint/test/build); main branch triggers migrations + CDK deploy + UI upload to S3 + CloudFront invalidation.
- **Rollback**: `cdk destroy` (with backups) or revert commit + re-deploy; migrations have down scripts where feasible.
- **Smoke tests**: post-deploy verify auth flow, guestbook/contact endpoints, health checks.
- **Notifications**: GitHub Actions job notifications to email/Slack on deploy success/failure; include commit SHA, environment, run logs.

## Performance & Web Vitals Targets

- **First paint**: <1s on broadband.
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1.
- **Lighthouse**: aim for ≥90 across performance, accessibility, best practices, SEO.
- **Asset optimization**: lazy-loaded images, modern formats (WebP), minimal JS; gzip/brotli at edge.
- **CI checks**: Lighthouse/AXE runs before deploy; fail if score drops significantly.

## Development Workflows

### Adding a New Endpoint

1. **Model** (`/api/internal/model`): define entity, validation, and database methods.
2. **View** (`/api/internal/view`): define response DTO and conversion functions.
3. **Controller** (`/api/internal/controller`): define HTTP handler that calls model methods and formats with view.
4. **Database**: add migrations in `api/db/migrations` if schema changes needed.
5. **Auth**: determine if public, user, or admin role; check in controller using token claims.
6. **Testing**: add unit tests for models, integration tests for controllers; run smoke tests post-deploy.

### Publishing a Blog Post

1. **Via admin UI**: create draft post (slug/title/summary/body/tags/status).
2. **Edit & preview**: admin UI shows draft; change to published when ready.
3. **Database**: post stored in Postgres; RSS feed auto-generated from published posts.
4. **Cache**: HTML invalidated on publish; posts indexed by path for SEO.

### Rotating Secrets

1. **Update** AWS Secrets Manager with new value.
2. **Lambda env**: no restart needed if using API call to Secrets Manager; if cached, restart Lambda.
3. **DB password**: update RDS password, rotate app user credentials in Secrets Manager, test connection.
4. **Cognito OAuth secrets**: update in Cognito console; test login flow.
5. **Document** rotation cadence and automate where feasible.

## Cost Optimization

Estimated ~$20–25/mo lean (RDS t4g.micro, CloudFront, minimal Lambda/API Gateway, CloudWatch logs):
- RDS: ~$15–17/mo (t4g.micro Single-AZ); add ~$10–12 if scaled to t4g.small.
- CloudFront: ~$0.85/mo at 10GB egress.
- S3, API Gateway, Lambda: <$5/mo at low traffic.
- CloudWatch: ~$2–6/mo (logs + custom metrics).
- Secrets Manager: ~$1.20 (3 secrets).
- Route53: ~$0.50/mo.

**Cost control strategies**:
- Keep CloudWatch retention 30–45 days.
- Sample client metrics (drop non-essential events).
- Single-AZ RDS to start; upgrade only if uptime needs rise.
- Monitor CloudFront egress; optimize image formats.

## Testing Strategy

### UI Tests
- Unit tests for components, hooks, utilities.
- Integration tests for forms, auth flows, API integration.
- E2E if needed (e.g., Cypress for critical paths: post creation, guestbook, contact).

### API Tests
- Unit tests for models (validation, business logic, constraints).
- Integration tests for controllers with test database.
- Test error cases, edge cases, validation rules.
- Test rate limiting, auth, anti-spam controls.

### Infrastructure Tests
- `cdk synth` to validate CDK code.
- Manual review of `cdk diff` before deploy.
- Smoke tests post-deploy (health check, auth flow, endpoint sampling).

## Debugging & Troubleshooting

- **UI**: check browser console, network tab in DevTools; inspect TailwindCSS class conflicts; verify API token flow.
- **API**: check CloudWatch Logs for Lambda; look for connection timeouts, validation errors, token verification failures.
- **Database**: enable slow query logging; check RDS connection pool saturation; verify migrations ran.
- **CloudFront**: inspect cache headers; verify S3 OAC policy; check origin error responses.
- **Auth**: test Cognito flow; verify token claims (aud, iss, exp); check CORS headers if cross-origin.

## References

- Full specification: `docs/REQUIREMENTS_V1.md`
- AWS CDK docs: https://docs.aws.amazon.com/cdk/
- Go best practices: https://golang.org/doc/
- React docs: https://react.dev
- TailwindCSS docs: https://tailwindcss.com
