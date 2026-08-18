# Error Handling Standards

## Single Handling Point (Confirmed)

`GlobalExceptionHandler` (`@RestControllerAdvice`) is the **only** place that maps exceptions
to HTTP status codes. Controllers must not contain `try/catch` for business exceptions and
must not return ad-hoc error `ResponseEntity` or `Map` with error status.

> **Known violation:** `AdminController` returns `Map.of("error", "ADMIN role required")`
> for role-guard failures. This deviates from `ErrorResponse` shape and must be fixed (HD2).

---

## Error Response Shape (Confirmed)

```java
record ErrorResponse(
    OffsetDateTime timestamp,  // NOTE: OffsetDateTime — not Instant
    int status,
    String error,              // HTTP status phrase, e.g. "Not Found"
    String errorCode,          // internal enum-like code (see mapping below)
    String message,            // safe, user-readable description
    String traceId             // from MDC — use to find the server log entry
) {}
```

All error responses use this shape. The frontend reads `traceId` from the response body
and from the `X-Trace-Id` response header (injected by `TraceIdFilter`).

---

## Exception → HTTP Status Mapping (Confirmed)

| Exception | HTTP | `errorCode` |
|-----------|------|-------------|
| `NotFoundException` | 404 | `NOT_FOUND` |
| Any other `DomainException` | 400 | `DOMAIN_RULE_VIOLATION` |
| `ApplicationException` | 409 | `APPLICATION_ERROR` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` |
| `IllegalArgumentException` | 400 | `BAD_REQUEST` |
| `SecurityException` | 401 | `UNAUTHORIZED` |
| `Exception` (catch-all) | 500 | `INTERNAL_ERROR` |

To add a new exception type: extend `DomainException` or `ApplicationException`, then add
a handler method in `GlobalExceptionHandler`. Do not add inline `ResponseEntity` logic
to controllers.

---

## Validation Errors (Confirmed)

`MethodArgumentNotValidException` returns the **first** failing field message:

```
message: "ticketKey: must not be blank"
```

If the full list of field errors is required in the future, add a `details` array to
`ErrorResponse` (requires HD2 approval before changing the wire format).

---

## Spring `server.error` Config (Confirmed)

```yaml
server:
  error:
    include-message: never
    include-stacktrace: never
    include-binding-errors: never
```

This prevents Spring's default `/error` endpoint from leaking internal details.
`GlobalExceptionHandler` has full control over every error response shape.

---

## 500 Error Policy (Confirmed)

- Stack trace is logged server-side at `ERROR` level with `traceId` in MDC
- Client receives `traceId` only — no stack frames, no SQL, no class names
- Use `traceId` in the log search to find the full trace

---

## Frontend Error Handling (Confirmed)

- `ApiError(status, message, traceId)` is thrown by `lib/api.ts` on any non-2xx response
- `401` in `useAuth`: catch `ApiError(401)` → return `null` (unauthenticated state); do not throw, do not retry
- Component-level: check `mutation.isError` / `query.isError`; display `error.message`
- The `traceId` on `ApiError` can be surfaced in dev tools or support flows

---

## Candidate Rules (pending HD2 and HD5)

> **HD2:** Should `AdminController` 403 be changed to use `ErrorResponse`?
> **HD5:** Should a global React `<ErrorBoundary>` wrap the app?

- **[Candidate]** All authorization failures return `ErrorResponse` with `errorCode: "FORBIDDEN"` (HTTP 403)
- **[Candidate]** `SecurityException` → 401; introduce `AuthorizationException` → 403
- **[Candidate]** Global React `<ErrorBoundary>` at app root catches unhandled component errors
- **[Candidate]** Validation errors return all failing fields as `details: [{field, message}]` array

→ See [logging.md](logging.md) for traceId generation.
→ See [security.md](security.md) for HMAC signature validation errors.
