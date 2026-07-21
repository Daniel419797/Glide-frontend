# Glide Frontend

Production Next.js frontend for Glide's tenant-scoped workflow platform.

## Architecture

- Next.js App Router and React 19
- TypeScript with strict checking
- TanStack Query for server state
- Tailwind CSS and Base UI components
- Playwright browser tests with a contract-compatible mock backend
- A same-origin backend-for-frontend (BFF) for session and API traffic

The browser never stores the refresh token. Login and refresh routes keep it in an
`HttpOnly`, `SameSite=Lax`, production-secure cookie scoped to `/api/session`. Access
tokens live only in memory. Mutating BFF requests require an exact same-origin check,
and only allowlisted headers are forwarded to the backend.

## Environment

Copy `.env.example` to `.env.local` for local development. Never commit real secrets.

| Variable                        | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `GLIDE_API_URL`                 | Backend API root, including `/api/v1` |
| `GLIDE_APP_URL`                 | Canonical public frontend origin      |
| `GLIDE_REQUEST_TIMEOUT_MS`      | Backend request timeout               |
| `GLIDE_SESSION_COOKIE`          | Refresh-cookie name                   |
| `GLIDE_SESSION_MAX_AGE_SECONDS` | Refresh-cookie lifetime               |

`GLIDE_API_URL` and `GLIDE_APP_URL` are required in production. Server-side validation
fails startup when configuration is invalid.

## Local Development

Use Node.js 20, matching CI and the container image.

```powershell
npm.cmd ci
npm.cmd run dev
```

The app runs at `http://localhost:3000`. The backend must be available at the configured
`GLIDE_API_URL`.

## Verification

```powershell
npm.cmd run check
npm.cmd run test:ui
npm.cmd audit --omit=dev
```

`npm run check` formats the code, enforces the 350-line physical file limit for source
and test code, lints, type-checks, and creates a production build. Browser tests verify
secure session establishment, tenant dashboard loading, form submission, mutation
origin rejection, and the 390px mobile layout.

## Container Deployment

```powershell
docker build -t glide-frontend .
docker run --rm -p 3000:3000 `
  -e GLIDE_API_URL=https://api.example.com/api/v1 `
  -e GLIDE_APP_URL=https://app.example.com `
  glide-frontend
```

The multi-stage image runs the Next.js standalone server as a non-root user under
`tini`. Platforms should probe `GET /api/health`. Terminate TLS at the ingress and set
both public URLs to HTTPS in production.

## Supported Workflows

- Registration, login, logout, refresh rotation, email verification, and invitations
- Tenant selection and permission-driven navigation
- Dashboard, form catalog, schema-driven submissions, request history, and task actions
- Member, role, organization, form/workflow, audit, reporting, and billing administration
- Platform company operations for authorized platform roles

All business data comes from the backend. Loading, empty, error, and retry states are
explicit; no demo business data is embedded in production screens.
