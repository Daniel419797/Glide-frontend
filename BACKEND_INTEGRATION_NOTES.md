# Backend Integration Contract

The frontend targets the current `/api/v1` contract through its same-origin BFF.

## Session Boundary

| Frontend route              | Backend route        | Behavior                                              |
| --------------------------- | -------------------- | ----------------------------------------------------- |
| `POST /api/session/login`   | `POST /auth/login`   | Stores refresh token in an HttpOnly cookie            |
| `POST /api/session/refresh` | `POST /auth/refresh` | Rotates the refresh token and returns an access token |
| `POST /api/session/logout`  | `POST /auth/logout`  | Revokes the refresh token and clears the cookie       |
| `/api/backend/*`            | `/api/v1/*`          | Proxies allowlisted request and response data         |

The BFF does not forward browser cookies to the backend. Client requests authenticate
with the in-memory bearer token. A single synchronized refresh is attempted after a
401, then the original request is retried once.

## Tenant Boundary

Authentication profile data comes from `/auth/profile`. Company memberships come from
`/companies`. Tenant resources are always addressed under
`/companies/:companyId/...`; the selected company ID is never treated as authorization.
The backend remains responsible for membership, role, and permission enforcement.

Current frontend integrations cover requests, request tasks/actions, forms and versions,
members, roles, departments, positions, teams, reports, audit logs, billing, usage, and
platform operations. Mutation call sites invalidate their owned query keys explicitly.

## Error Contract

The client consumes the backend envelope:

```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Readable message" },
  "meta": { "requestId": "trace-id" }
}
```

Request IDs are preserved in `ApiError` for operational troubleshooting. Network,
timeout, authorization, empty, and validation failures surface explicit UI states.

## Change Checklist

When the backend contract changes:

1. Update types under `src/types` and the narrow feature call site.
2. Keep URLs tenant scoped and use idempotency keys for retry-sensitive writes.
3. Add or update a browser contract test in `tests`.
4. Run `npm run check`, `npm run test:ui`, and the backend test suite.
