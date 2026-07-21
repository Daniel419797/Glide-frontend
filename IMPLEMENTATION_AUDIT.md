# Production Readiness Audit

This document records the implemented frontend controls. Command results must be
regenerated for each release; this file is not a substitute for CI evidence.

## Security

- Refresh tokens are restricted to an HttpOnly, SameSite cookie and never exposed to
  application JavaScript.
- Access tokens are memory-only and cleared after terminal authorization failures.
- Mutation proxy requests validate the exact configured origin.
- Proxy request and response headers are allowlisted; redirects are not followed.
- Production responses include CSP, HSTS, frame, MIME, referrer, and permissions policy
  headers.
- Permission-driven navigation is backed by server authorization on every tenant route.
- Billing redirect URLs are accepted only over HTTPS.
- Production dependency audit is part of CI.

## Reliability

- Environment configuration is schema validated at the server boundary.
- Backend calls have an environment-controlled timeout.
- Token refresh is single-flight and retries a failed request only once.
- Retry-sensitive mutations use idempotency keys.
- Every backend-driven workflow has loading, empty, error, and retry handling.
- The container has a health endpoint, init process, non-root runtime, and health check.

## Maintainability

- Strict TypeScript models the current API envelope and tenant resources.
- Query keys include company identity and mutations invalidate owned data explicitly.
- Obsolete endpoints and legacy UI implementations were removed or safely redirected.
- `scripts/check-lines.mjs` enforces the 350-line physical limit across source, tests,
  and scripts.
- Formatting, linting, type checking, production build, browser tests, dependency audit,
  and container build are represented in CI.

## Performance

- Next.js standalone output and compression are enabled.
- TanStack Query deduplicates server state and applies bounded retries.
- Route-level loading UI keeps navigation responsive.
- Platform search uses deferred input and list endpoints use bounded pagination.
- Responsive desktop tables become mobile record layouts for core request workflows.

## Verification Gates

A release is eligible only when all of these pass from a clean install:

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd run test:ui
npm.cmd audit --omit=dev
docker build -t glide-frontend .
```

The backend suite must also pass whenever its contract or permission selection changes.
Production smoke testing must cover login, company selection, request creation and task
action, an administrative mutation, logout, and `/api/health` behind the real ingress.
