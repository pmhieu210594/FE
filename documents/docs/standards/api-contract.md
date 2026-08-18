# API Contract Standards

---

## URL Structure (Confirmed)

All API endpoints use the `/api/v1/<resource>` prefix:

```
GET    /api/v1/<resource>          — list or filtered collection
GET    /api/v1/<resource>/{id}     — single resource by ID
POST   /api/v1/<resource>          — create
PUT    /api/v1/<resource>/{id}     — full update
DELETE /api/v1/<resource>/{id}     — delete
```

Examples from existing controllers:
```
GET  /api/v1/me          — current authenticated user
GET  /api/v1/admin/users — admin user list
GET  /health             — health check (not versioned — infrastructure endpoint)
```

---

## Pagination (Confirmed)

`limit` + `offset` query params. **Not** Spring `Pageable` or cursor-based.

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `limit` | int | 20 | 100 |
| `offset` | int | 0 | — |

```
GET /api/v1/tickets?projectId=42&limit=20&offset=40
```

Response is a raw `List<DTO>` — no wrapper object around it (see HD1).

---

## Response Shape (Confirmed)

**Success:** raw DTO or `List<DTO>` — no envelope.

```json
// Single resource
{ "id": 1, "ticketKey": "PROJ-001", "status": "OPEN" }

// List
[ { "id": 1, ... }, { "id": 2, ... } ]
```

**Error:** always `ErrorResponse` shape:

```json
{
  "timestamp": "2026-06-08T10:05:32.123+00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "NOT_FOUND",
  "message": "Project not found: 99",
  "traceId": "trc_a1b2c3d4e5f6"
}
```

> **Known inconsistency:** `GET /api/v1/admin/users` when the caller lacks ADMIN role returns
> `{ "error": "ADMIN role required" }` (HTTP 403) — this does **not** match `ErrorResponse` shape.
> This is HD2 (pending decision). Frontend must handle both shapes for the admin endpoint.

---

## Authentication (Confirmed)

All `/api/v1/**` endpoints require an active Spring Security session cookie.

```http
GET /api/v1/me HTTP/1.1
Cookie: JSESSIONID=<value>
```

OAuth2 Google flow issues the session cookie on callback. The frontend sends
`credentials: "include"` on all fetch calls (enforced by `lib/api.ts`).

Public endpoints (no auth required):
- `GET /health`
- `POST /login/oauth2/code/*` (handled by Spring Security internally)

---

## Error HTTP Status Codes (Confirmed)

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created (POST success) |
| 204 | No content (DELETE success) |
| 400 | Validation error or domain rule violation |
| 401 | Not authenticated |
| 403 | Not authorized (see HD2 inconsistency above) |
| 404 | Resource not found |
| 409 | Application-level conflict |
| 500 | Unexpected server error |

---

## Webhook Endpoints (Confirmed)

`POST /api/v1/github/webhook` — GitHub webhook receiver.

- HMAC-SHA256 signature validated **before** any business logic
- `X-Hub-Signature-256` header is the source of truth
- Returns `200 OK` with empty body on success; `401` with `ErrorResponse` on signature failure

---

## Candidate Rules (pending HD1 and HD7)

> **HD1:** Should success responses be wrapped in `{ data, meta, error }`?
> **HD7:** What is the API v2 strategy? Same path prefix? Header versioning? Deprecation window?

- **[Candidate]** Response envelope `{ data: T, meta: { total, limit, offset } }` for paginated lists
- **[Candidate]** `/api/v2/` path prefix for breaking changes; `/api/v1/` deprecated with sunset header
- **[Candidate]** `Link: </api/v1/resource?offset=X>; rel="next"` header for pagination navigation
- **[Candidate]** OpenAPI 3.x spec (`openapi.yaml`) maintained alongside controllers

→ See [error-handling.md](error-handling.md) for full `ErrorResponse` schema and exception mapping.
→ See [security.md](security.md) for HMAC webhook validation details.
