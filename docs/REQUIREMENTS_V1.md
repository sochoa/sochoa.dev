# Personal Site Requirements

## Goals
- Present a clear personal brand with concise bio, skills, and current focus.
- Showcase selected work (projects, writing, talks) with enough detail for credibility.
- Provide easy contact paths for collaboration, hiring, and speaking.
- Keep site fast, accessible, and low-maintenance with minimal vendor lock-in.

## Target Audience
- Prospective clients/companies, collaborators, and event organizers.
- Returning readers interested in writing or updates.

## Content & Structure
- Home: short intro, current role/focus, featured items (1–3 projects, latest post).
- About: longer bio, values, expertise, timeline highlights, headshot.
- Work/Projects: case studies with problem, role, stack, outcomes, links (live/demo/code).
- Writing/Blog: chronological posts with tags/topics; RSS/Atom feed; page to browse all posts.
- Speaking/Media (optional): list of talks, podcasts, or features with links/slides.
- Contact: clear call-to-action, email, and linked profiles (GitHub, LinkedIn, Mastodon, etc.).
- Resume/CV (optional): downloadable PDF and web version.
- Resume hosted flavors: support multiple versions on request (e.g., general, consulting, engineering leadership) with distinct URLs and PDFs.
- Footer: copyright, license for content, social links, and analytics/legal notes.
- Visitor stats: summary of traffic (pageviews, referrers) surfaced on the site in a privacy-friendly way.

## Content Management
- Markdown-first authoring (posts and pages). Generated RSS feed.
- Minimal manual steps to publish (ideally `git push`/CI-triggered).
- Support for code snippets, syntax highlighting, images, and basic embeds.

## Design & UX
- Responsive layout for mobile-first; graceful scaling to desktop.
- Clear visual hierarchy, generous whitespace, and legible typography.
- Theming: support light/dark toggle; avoid heavy dependencies.
- Accessible navigation (skip links, focus states, semantic landmarks).
- Open Graph/Twitter card defaults with per-page overrides.

## Performance & Quality
- Fast first paint (<1s on broadband); Core Web Vitals budget-friendly.
- Optimized assets (lazy-loaded images, modern formats, minimal JS).
- No blocking third-party scripts except analytics (if enabled).
- Lighthouse/AXE checks in CI for performance and accessibility.

## Accessibility
- WCAG 2.1 AA-aligned: color contrast, focus indicators, keyboard operable.
- ARIA only when needed; semantic HTML preferred.
- Alt text for images; captions for media; readable link text.

## SEO & Discovery
- Clean URL structure, sitemap.xml, robots.txt, canonical tags.
- Meta descriptions per page; structured data for articles/projects if applicable.
- RSS/Atom feed for posts; optional newsletter signup.

## Analytics & Privacy
- Optional privacy-friendly analytics (e.g., self-hosted or cookieless).
- Respect Do Not Track; no invasive trackers or ad pixels.
- Clear privacy note if analytics/cookies are present.

## Integrations
- Social linkouts only; avoid heavy embeds unless needed per post.
- Optional contact form with spam protection (honeypot/reCAPTCHA alt) or direct mailto.

## Tech & Delivery
- Infrastructure, API, and UI deployed via CDK.
- Domain: `sochoa.dev` registered on Porkbun; route traffic through desired CDN/edge with DNS managed accordingly.
- UI: React + TailwindCSS; static-first where possible, with dynamic data for visitor stats and blog posts.
- UI: emits visitor events and client HTTP timing metrics to backend for CloudWatch reporting; instrumented fetch layer to capture request outcomes/latency.
- UI: supports Google and LinkedIn sign-in where needed for guestbook/contact gating or admin views.
- UI admin: authenticated admin UI for posts CRUD and moderation (guestbook); restricted to admin role/claim.
- API: Go-based service exposing visitor stats, blog content, guestbook entries, and contact submissions; MVC-style layout with handlers/controllers, services/use-cases, and repositories/models; clear request/response models for each endpoint and separate internal models to keep transport concerns decoupled from domain logic; forwards visitor/HTTP metrics to CloudWatch; supports Google/LinkedIn OAuth flows and token verification.
- Static site preferred (SSG) deployable via CDN; integrate API where needed.
- CI/CD: lint, test/build, accessibility/performance checks before deploy; CDK deploy stages.
- Environment variables only for analytics/forms; secrets not committed.
- Draft/preview capability before publishing posts.
- Environments: single prod environment.

## UI Implementation (React + TypeScript)
- Stack: React + TypeScript + TailwindCSS; component-driven with shared layout primitives and typography scales; prefer functional components/hooks.
- Routing: client-side router with routes for home, posts list/detail, guestbook, contact, resume variants, admin (auth-gated). Graceful 404.
- State/data: lightweight fetch wrapper with auth token handling, metrics instrumentation (latency/success), and consistent error handling; SWR/RTK Query acceptable for caching; avoid heavy global state.
- Auth: Cognito-hosted login (Google/LinkedIn) with redirect back; store tokens securely (no localStorage if using cookies); handle token refresh/expiry; gated admin/guestbook/contact views.
- Forms: client-side validation with constraints matching API (lengths, email format); show rate-limit and anti-spam challenges; optimistic/friendly success/error states.
- Accessibility: semantic HTML, focus management on route change and form submission results; keyboard-visible focus rings; aria labels where needed.
- Styling: Tailwind config for brand colors, spacing, typography; use hashed asset filenames for cache busting; light/dark toggle as specified.
- Admin UI: CRUD for posts (list/create/edit/delete/publish), guestbook moderation; show auth state; expose idempotency keys where needed for retried submissions.
- Error states: user-friendly fallbacks when API is unavailable; 429 handling with suggested retry; offline-ish states for fetch failures.

## Infrastructure Outline (AWS via CDK)
- DNS/Certs: Domain `sochoa.dev` on Porkbun; delegate NS to Route53 hosted zone; ACM cert in us-east-1 for CloudFront; primary region us-west-2 for API/RDS.
- Edge/CDN: CloudFront with OAC to S3 for static UI assets; `/api/*` behavior to API Gateway; security headers via CloudFront function or origin response.
- Static hosting: S3 bucket (private, OAC-only) for built React/Tailwind UI.
- API: API Gateway (HTTP API) + Go Lambda functions following MVC layout; Cognito or IAM authorizer; per-endpoint throttling; request/response validation; API Gateway custom domain with TLS.
- Auth: Cognito User Pool with Google + LinkedIn IdPs for sign-in; tokens verified by API; optional admin group/claims for gated actions.
- Data stores: Postgres (RDS) for posts/metadata, guestbook entries, contact submissions, and aggregated visitor stats; S3 only for static assets (images/fonts); minimal PII with retention rules.
- Metrics/Logs: CloudWatch Logs with 30–45 day retention; custom metrics for visitor/HTTP events with sampling; alarms on 4xx/5xx/latency.
- Secrets: AWS Secrets Manager for OAuth client secrets and API secrets; scoped IAM roles for Lambda and CI/CD.
- Email/Notifications: SES for contact form delivery (optional) or Slack/webhook via Lambda.
- CI/CD: GitHub Actions (or similar) running tests/lint/build, then CDK deploy to dev/prod stacks; parameters for domains, table names, and secrets.

## CI/CD (GitHub Actions + OIDC)
- Workflows: 
  - `.github/workflows/pr.yml` — on PR: lint/test/build (UI and API), no deploy.
  - `.github/workflows/deploy.yml` — on main: run tests, `golang-migrate` against prod DB, then `cdk deploy`; build UI, upload to S3, invalidate CloudFront HTML paths; run smoke tests (auth, guestbook/contact, health).
- Auth: GitHub OIDC to assume AWS roles (no long-lived keys); roles scoped per env (dev/stage/prod) with least privilege for CDK, migrations, and CloudFront invalidations.
- Deploy steps: build UI → upload to S3 and invalidate CloudFront (HTML paths); deploy API and infra via CDK; run DB migrations before API rollout.
- Protections: required checks on main; environment approvals if desired; parameterized stack names/regions/resources per env.
- Notifications: GitHub Actions job notifications to email/Slack/webhook on deploy success/failure; include environment, commit SHA, and links to run logs. Optional SNS SMS: subscribe your number to an SNS topic and allow the OIDC role to publish deploy summaries.

## Layer-to-Layer AuthN/Z
- Edge/CDN → API: CloudFront origin access control to API Gateway; API validates expected host/headers to prevent direct bypass. CORS restricted to site domains.
- UI → API: JWTs from Cognito (Google/LinkedIn federation) on state-changing calls; public GETs allowed without token. Add CSRF protection if using cookies; otherwise bearer tokens.
- API → Database (RDS): app user credentials in Secrets Manager; least-privilege role/user (separate schema owner vs app user); no shared superuser creds.
- CI/CD → AWS: GitHub Actions OIDC assumes scoped IAM roles per env for CDK, migrations, S3 uploads, CloudFront invalidations, SNS notifications.
- Metrics intake: signed key header required; key stored in Secrets Manager; rotate periodically; reject unsigned requests regardless of origin.
- Admin actions: require `admin` claim/group in Cognito; enforced in handlers/services (not just edge).
- Deny-by-default: all API routes start denied; validate `aud/iss/exp` on tokens; prefer short-lived creds.

## Caching/CDN
- CloudFront behaviors: long cache + content hashing for static assets (JS/CSS/fonts/images); short TTL for HTML/document routes (e.g., 0–60s default, 5–10m max-age with stale-while-revalidate).
- API caching: bypass/disabled for dynamic guestbook/contact/metrics; consider short cache for posts/stats summary if consistency requirements allow; respect auth headers to avoid cache poisoning.
- Invalidation: automatic invalidation on deploy for HTML/routes; assets rely on hash-based filenames to avoid explicit invalidations.
- Headers: security headers set at edge; CORS limited to site origins; gzip/brotli enabled.
- Cache keys/policies: for API behaviors include only necessary headers (auth, content-type) to keep cache keys small; for HTML include cookies only if needed; prefer origin cache-control for assets, explicit TTLs for HTML.

## Networking & VPC
- Lambdas in VPC private subnets for RDS access; use security groups to allow only app SG → RDS SG. API Gateway invokes Lambdas without needing VPC ingress.
- VPC endpoints for AWS services (e.g., Secrets Manager, CloudWatch Logs) to avoid NAT; no NAT gateway unless a new external dependency emerges; keep egress blocked by default.
- API Gateway custom domain with TLS; reject direct calls to Lambda URLs; validate expected host headers.

## Cost Estimates (approx, low-traffic personal site)
- RDS Postgres: `t4g.micro` Single-AZ + ~20GB gp3 storage: ~$15–17/mo (add ~$10–12 if upgraded to `t4g.small`).
- CloudFront: ~$0.085/GB egress; at ~10GB/mo ≈ $0.85; requests negligible.
- S3 static: storage/requests pennies (<$0.10).
- API Gateway + Lambda: at ~50k req/mo ≈ $1–3 total.
- CloudWatch: logs + a handful of custom metrics with 30–45 day retention: ~$2–6; Performance Insights (optional) adds ~ $11/mo.
- Secrets Manager: ~$0.40/secret/mo; with ~3 secrets ≈ $1.20.
- DNS: Route53 hosted zone ~$0.50/mo.
- Notifications: SNS SMS ~$0.0075/SMS (e.g., $0.30 for ~40 msgs).
- Estimated total: ~$20–25/mo lean; ~$30–40/mo with PI and more metrics; CloudFront egress scales with traffic.

## Metrics Schema (privacy-minimized)
- Retention: 30 days max for raw events; aggregate metrics in CloudWatch with dimensions and time-bucketed rollups.
- Event types: `page_view`, `navigation`, `fetch` (API calls), `guestbook_submit`, `contact_submit`.
- Common fields: timestamp (UTC), event type, path, referrer domain (stripped to domain only), user agent family/device (parsed, no full UA), client country/region from edge (no IP storage), anonymized session id (rotating, non-cookie if possible), is_authenticated=false flag (always false).
- Fetch-specific fields: route key/name, status code bucket (2xx/4xx/5xx), latency ms (client observed), success boolean, retry count.
- Counts-only where possible: avoid per-user tracing; no PII in metrics payloads; never store IPs, emails, names in metrics streams.

## Security (tailored to React UI, Go API, AWS/CDK)
- Transport: HTTPS everywhere with HSTS; redirect HTTP→HTTPS; TLS 1.2+; secure cookies (`HttpOnly`, `Secure`, `SameSite=Lax`).
- Auth & forms: CSRF tokens on state-changing endpoints; rate limit guestbook/contact submissions; spam protection (honeypot + basic challenge); input validation/size limits; anti-automation throttling on metrics intake.
- Auth model: public GETs for posts/stats; guestbook/contact writes require Google/LinkedIn login plus anti-spam; admin-only actions require authenticated role/claims; metrics intake uses a signed server key; do not rely solely on CORS/origin checks for authorization.
- API hardening: parameterized queries; deny-by-default routes; strict CORS (only site origins); content-type checks; request body size caps; per-endpoint rate limits.
- Output safety: HTML escaping/encoding for any rendered UGC (guestbook); sanitized markdown rendering for posts; block inline script injection via CSP.
- App security headers: CSP (script-src self + hashed inline if needed, object-src none), X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy minimal.
- Secrets/config: no secrets in client bundles; store runtime secrets in AWS Secrets Manager (preferred over SSM Param Store); least-privilege IAM for CI/CD and runtime; rotate keys; environment-based config.
- Data protection: minimal PII stored (contact form only); encrypt at rest; retention policy for contact submissions; logging excludes sensitive fields; redact emails/names from metrics/logs.
- Dependency hygiene: pin deps, automated vuln scanning (e.g., GitHub Dependabot), regular updates; integrity checks for any third-party assets if used.
- Observability & response: structured logs, alerts on 4xx/5xx spikes; deploy rollback path; incident/backup restore runbook; low-volume CloudWatch retention defaults (e.g., 30–45 days logs/metrics) with sampling on client metrics to control cost.
- Build/deploy: signed/artifacted builds; protected branches; CDK IaC with review; CI secrets isolated; CloudFront/S3 origin access locked; S3 buckets private with OAC/OAI as needed.

## OWASP Coverage Notes
- SSRF: no outbound calls unless required; if added, egress allowlist and block metadata/localhost; strip hop-by-hop headers; small body size limits already defined.
- XXE/deserialization: avoid XML; if ever used, disable external entities; no custom binary deserialization.
- Request smuggling: rely on API Gateway normalization; enforce content-length/content-type checks; limit headers/body size.
- Third-party scripts/embeds: keep minimal; use Subresource Integrity if loaded; avoid untrusted embeds.
- Access control: deny-by-default routes; enforce roles/claims in handlers (public/user/admin); no CORS-as-auth.
- Injection/XSS: parameterized queries; HTML stripped from guestbook/contact; output escaping; CSP.
- Auth/session: short-lived tokens, audience/issuer/exp checks, CSRF if cookies, bearer tokens otherwise.

## Account & IaC Hardening
- AWS account hygiene: MFA on root, root not used; no long-lived access keys on IAM users; prefer roles; least-privilege policies.
- KMS: enforce encryption for S3, RDS, CloudWatch Logs, and Secrets Manager; avoid unencrypted resources.
- CI/CD: require reviews on IaC/Secrets changes; GitHub secret scanning/push protection on; pin GitHub Actions to SHAs; OIDC roles scoped per env.
- Egress: no open internet egress from Lambda unless needed; prefer VPC endpoints for AWS services; if egress required, use allowlists.
- Backups: periodic restore drills from RDS snapshots to validate backups and retention; ensure PII retention rules still apply post-restore.
- Monitoring: consider GuardDuty/CloudTrail alerts for unusual IAM activity; alert on failed OIDC role assumptions.
## API Surface (endpoints, roles, validation)
- Public reads:
  - `GET /api/posts` — list published posts; query: `page`, `limit<=50`, `tag?`; validate numeric bounds.
  - `GET /api/posts/{slug}` — post detail; slug pattern `[a-z0-9-]+`.
  - `GET /api/stats/summary` — visitor stats aggregates (no PII).
  - `GET /api/guestbook` — list recent entries; query: `limit<=50`, `before?`; output escaped/sanitized content.
- Admin posts (requires admin):
  - `POST /api/posts` — create; body includes slug/title/summary/body/tags/status; validate as per models; 201 on success.
  - `PUT /api/posts/{slug}` — update; same validation; 200 on success.
  - `DELETE /api/posts/{slug}` — soft-delete; 204 on success.
  - `POST /api/posts/{slug}/publish|unpublish` — toggle status; 200 on success.
- Guestbook write:
  - `POST /api/guestbook` — requires Google/LinkedIn login plus anti-spam (honeypot/challenge); body `{message<=500, displayName<=50?}`; trim/UTF-8; reject HTML/links; rate limit per user (e.g., 3/day); status codes: 201 on success, 400/401/403/429 on errors.
- Contact:
  - `POST /api/contact` — requires Google/LinkedIn login plus anti-spam; body `{email (RFC check), name<=100?, message<=2000}`; rate limit per IP/user (e.g., 5/day); retain minimal PII with expiry (e.g., 90–180 days); status codes: 202 on accepted, 400/401/403/429 on errors.
- Metrics intake:
  - `POST /api/metrics` — auth via signed server key header (not user auth); body: batch array (<=50 events, <=64KB); drop PII; sample client-side; status codes: 202 on accepted, 400/401/429 on errors.
- Admin (optional):
  - `GET /api/admin/guestbook/pending`, `POST /api/admin/guestbook/{id}/approve|delete` — requires `admin` claim/group.
  - `GET /api/admin/stats/raw` — restricted; avoid if not needed.
- Roles/claims:
  - `public` for read-only endpoints; `user` for guestbook/contact writes; `admin` for moderation.
- Tokens: Google/LinkedIn via Cognito; verify `aud/iss/exp/email_verified`; access tokens ~1h; refresh via Cognito.
- General validation/limits:
  - Request body caps (e.g., 16KB for guestbook/contact); JSON content-type required.
  - Deny HTML in guestbook/contact; escape on render.
- Consistent errors: 400 validation, 401 unauth, 403 forbidden, 404 missing, 429 throttled, 500 server.
- CORS locked to site domains; not used for auth.
- Admin role assignment: admins added manually to Cognito admin group; only members receive `admin` claim used for admin UI/API routes.
- Admin bootstrap: sign in once via Google/LinkedIn to create the user, then operator adds that user to the Cognito `admin` group (CLI/console/CDK helper). Keep group small; consider alerting on membership changes.

## Content Source & Publishing
- Posts authored and stored in Postgres only; managed via admin UI CRUD; body authored in GitHub-flavored Markdown (GFM) and rendered safely on read; no S3/Markdown ingestion path.
- Admin UI supports post CRUD; DB is the sole source of truth for posts.

## Bots & Spam Controls
- Robots: `robots.txt` allows public pages/posts; disallow admin/preview; meta `noindex` on admin/preview/drafts.
- Guestbook/contact: honeypot field and lightweight challenge if abuse detected; strip/deny links and HTML; rate limit per user/token and transient IP hash (no raw IP storage); block repeated failures.
- Metrics intake: signed key required; rate limit per key; drop unsigned requests.
- Moderation: admin delete for guestbook; optional pre-approval path to auto-hide until approved.
- User agents: basic allow/block for obvious bots; do not rely on UA for auth.

## Database Models & Indexes (Postgres)
- Posts: `id (UUID PK)`, `slug (unique)`, `title`, `summary`, `body` (GFM), `tags[]`, `published_at`, `updated_at`, `status (draft/published)`. Indexes: unique on `slug`, btree on `published_at DESC`, GIN on `tags`. Validation: slug `[a-z0-9-]+`, title <= 140, summary <= 300, body size limit, tags <= 10 items.
- Guestbook entries: `id (UUID PK)`, `user_provider`, `user_id`, `display_name`, `message`, `created_at`, `is_approved` (optional), `deleted_at` (nullable). Indexes: btree on `created_at DESC`, partial index for `is_approved=true AND deleted_at IS NULL`. Validation: message <= 500, display_name <= 50, no HTML/links; enforce user rate limit in app.
- Contact submissions: `id (UUID PK)`, `email`, `name`, `message`, `created_at`, `status` (received/delivered/deleted), `expires_at` (TTL). Indexes: btree on `created_at`, partial on `expires_at` for TTL sweeps. Validation: email format, name <= 100, message <= 2000; purge by `expires_at`.
- Visitor stats (aggregated): `id (date bucket/day)`, `page_path`, `country`, `referrer_domain`, `pageviews`, `unique_visitors`, `latency_p50/p95/p99`, `errors_4xx`, `errors_5xx`. Indexes: composite on `(page_path, id)`, and optionally `(referrer_domain, id)`; keep buckets pre-aggregated to avoid per-event storage.
- Common: use `created_at/updated_at` with default `now()`, soft-delete where needed; migrations via tool (e.g., goose/migrate) tracked in repo; direct connections sized for Lambda without RDS Proxy.
- Metrics: CloudWatch custom metrics only; no Postgres rollups to avoid duplication.
- Idempotency: guestbook/contact writes include an idempotency key; enforce uniqueness on `(user_id, idempotency_key)` to safely retry.

## Migrations
- Tooling: `golang-migrate` with SQL files tracked in repo (e.g., `infra/db/migrations`), versioned and reviewed.
- Execution: migrations run in CI/CD before API deploy; use transactions where supported; set a sane `statement_timeout`; serialize runs to avoid concurrent alters.
- Safety: prefer additive changes; avoid destructive alters without backfill/roll-forward plan; include down migrations when feasible or document irreversible steps.

## RDS Runtime Settings
- Connection limits: size pool for Lambda concurrency; cap max open connections to avoid exhaustion; short idle timeout (e.g., 60s) to prevent leaks.
- Timeouts: `statement_timeout` (e.g., 2–5s for API, higher for migrations), `idle_in_transaction_session_timeout` (e.g., 30s), and query-level context timeouts in Go.
- Health: periodic connection pings; surface errors/latency to logs/metrics; alert on connection saturation or timeout spikes.
- Lambda connection strategy: reuse pooled connections in-process; cap Lambda concurrency to avoid connection storms. If needed later, revisit RDS Proxy/pgBouncer, but default to lean/no-proxy with tight caps.

## Resilience & Fault Tolerance (cost-aware)
- RDS: Single-AZ to start (lower cost); automated backups; test restores occasionally. Consider Multi-AZ only if uptime needs rise.
- API/UI: health checks/alarms on 4xx/5xx/latency; tight timeouts (API Gateway/Lambda ~3-5s target); simple retry with backoff for transient errors.
- Idempotency: basic idempotency key for guestbook/contact writes to tolerate retries (enforced via DB uniqueness on idempotency key + user).
- Fallbacks: CloudFront custom error page; UI shows friendly error if API unavailable.
- Deploy safety: `cdk diff` + rollback capability; migrations run before API rollout with backups available.
- Throttling: API Gateway per-route throttles; UI handles 429 with retry/backoff.

## Data Retention & Privacy
- Guestbook entries: public content; store message + display name + user id/provider only; no IPs. Default retention: indefinite, with admin delete path and optional TTL if you prefer auto-expiry (configure if desired).
- Contact submissions: PII (email/name/message) stored minimally. Primary flow is delivery via SES/webhook; persist only metadata + delivery status. Full message retention capped at 90–180 days, then purge via TTL; no storage of IPs.
- Metrics: raw events retained max 30 days (TTL on table/log group); only aggregated metrics kept after that; no emails/IPs/names stored.
- Logs/metrics retention: CloudWatch logs/metrics 30–45 days to control cost and PII exposure.
- Cleanup jobs: scheduled tasks to purge expired contact entries and metrics; ensure retention rules run regularly and are monitored.
- Backups (RDS/Postgres): enable automated backups with retention aligned to PII limits (e.g., 7–30 days depending on contact retention); schedule snapshots/pruning; ensure purges/TTL propagate to snapshots where feasible; document restore/runbook.
- RDS observability: enable Enhanced Monitoring/Performance Insights; log slow queries (tight threshold) to CloudWatch; track connections, CPU, IOPS, storage/DB size growth, replication/backup health; alarms on slow query spikes and storage nearing capacity; periodic index/plan review using query stats.

## Maintenance & Ops
- Simple dependency set; routine updates documented.
- Automated backups of content (repo) and assets (remote storage optional).
- Error monitoring optional but lightweight (e.g., Sentry with sampling).

## Open Questions
- Choose SSG/framework (e.g., Astro, Next.js static, Eleventy?).
- Select typography and visual direction.
- Decide on analytics provider and contact form approach.
- Hosting target (e.g., Vercel, Netlify, Cloudflare Pages).

## Operational Playbook (implementation aides)
- Env/config per env: DB secret/URL, Cognito pool/client IDs, Google/LinkedIn OAuth secrets, metrics intake key, CloudFront/API domains, SNS topic ARN, SES sender, feature flags.
- CDK bootstrap: note target regions/stacks; VPC CIDR/subnets; VPC endpoints list; API custom domain and Route53 records; CloudFront distribution ID and S3 artifact bucket.
- CI steps: run `golang-migrate` before API deploy; build UI to S3 path; invalidate CloudFront HTML paths; run smoke tests (API health, auth flow, guestbook/contact).
- Schedules: cron/Scheduler for contact/metrics cleanup; (if used) metrics rollup to DB; periodic DB restore test (e.g., quarterly); token/secret rotation cadence.
- Secrets rotation: define rotation cadence for OAuth/metrics key/DB password; reload strategy without downtime.
- Runbooks: quick steps for deploy rollback, DB restore, admin group changes, and lost-secret rotation.
