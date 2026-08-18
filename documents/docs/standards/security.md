# Security Standards

## Secrets Management

| Rule | Detail |
|------|--------|
| Never commit secrets | `.env`, `*.key`, `*.pem`, `*.p12` are in `.gitignore` — verify before every commit |
| Template only | `.env.example` documents key names and descriptions, never real values |
| Runtime injection | All secrets injected via environment variables at runtime |
| No hardcoded values | Tokens, passwords, and API keys must never appear in source code |

---

## Authentication — OAuth2 (Google)

EDCAP_BE uses Spring Security OAuth2 with session cookies (no JWT).

**Flow:**
1. Browser hits `/oauth2/authorization/google`
2. Spring Security redirects to Google consent screen
3. Google posts auth code to `/login/oauth2/code/google`
4. Spring Security exchanges code for token → calls `AppUserService.upsertFromOAuth()`
5. Session cookie (`JSESSIONID`) set on success

**Key config points (`SecurityConfig.java`):**
- CSRF disabled (REST API + SPA)
- Sessions: `IF_REQUIRED` (session created on first auth)
- CORS: `localhost:5173` and `localhost:4173` in dev — restrict in production
- `/api/v1/health` and `/api/v1/webhooks/**` are `permitAll`; all other `/api/**` require auth

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/health").permitAll()
    .requestMatchers(POST, "/api/v1/webhooks/**").permitAll()  // HMAC is the gate
    .anyRequest().authenticated()
);
```

---

## Webhook Security — HMAC-SHA256

Webhook endpoints are `permitAll` in Spring Security. The only auth gate is the HMAC signature.

**Validation must happen before any business logic:**

```java
private void verifyHmacSha256(String payload, String signatureHeader) {
    // signatureHeader format: "sha256=<hex>"
    String expected = "sha256=" + computeHmac(payload, webhookSecret);
    if (!MessageDigest.isEqual(
            expected.getBytes(StandardCharsets.UTF_8),
            signatureHeader.getBytes(StandardCharsets.UTF_8))) {
        throw new SecurityException("Invalid webhook signature");
    }
}
```

- Use `MessageDigest.isEqual` (constant-time comparison) — never `String.equals`
- Reject and log (WARN) on invalid signature; do not process the payload
- `SecurityException` maps to HTTP 401 via `GlobalExceptionHandler`

---

## Error Responses — No Information Leakage

All error responses use `ErrorResponse`. Stack traces are never sent to the client.

```java
record ErrorResponse(
    OffsetDateTime timestamp,   // OffsetDateTime — NOT Instant (corrected 2026-06-08)
    int status,
    String error,               // HTTP status name, e.g. "Not Found"
    String errorCode,           // internal code, e.g. "NOT_FOUND", "VALIDATION_ERROR"
    String message,             // human-readable, safe to display
    String traceId              // from MDC — use this to find the server log
) {}
```

> **Known inconsistency:** `AdminController` returns `Map.of("error", "ADMIN role required")`
> for 403 responses — this does NOT match `ErrorResponse` shape. Pending HD2.

**HTTP status mapping:**

| Exception | HTTP Status | Error Code |
|-----------|------------|------------|
| `NotFoundException` | 404 | `NOT_FOUND` |
| `DomainException` | 400 | `DOMAIN_RULE_VIOLATION` |
| `ApplicationException` | 409 | `APPLICATION_ERROR` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` |
| `IllegalArgumentException` | 400 | `BAD_REQUEST` |
| `SecurityException` | 401 | `UNAUTHORIZED` |
| `Exception` (catch-all) | 500 | `INTERNAL_ERROR` (logged with stack trace server-side) |

`traceId` is set via MDC at request entry by `TraceIdFilter`. Use it to correlate
client-reported errors with server logs.

---

## Owner / Author Display — Pseudonym Only (Confirmed — PM-DASHBOARD 2026-06-26)

Any API response that exposes a ticket owner, author, or assignee field **must** read from `tbl_dim_member_pseudonym.pseudonym`. Using `updated_by`, `created_by`, or any other raw user-identifier column as a display value is forbidden.

- Correct: `JOIN tbl_dim_member_pseudonym p ON p.member_key = s.owner_member_key` → `p.pseudonym AS owner_display`
- Wrong: `s.updated_by AS owner_display` (raw user identifier — may be an email or username)

Add a unit test asserting that `ownerDisplay` in the response does not match an email pattern (`*@*.*`). This applies to all snapshot queries, report views, and any read-model that surfaces a person reference.

---

## Audit / Log Payload Masking (Confirmed — ADMIN-AUDIT-LOG 2026-07-10)

When persisting a before/after diff or request payload into an audit or log table, mask sensitive fields with a **whitelist-drop** approach rather than a value-level regex redact: enumerate the field-name patterns to drop entirely (`password`, `token`, `secret`, `apiKey`, `credential`, `*hash`) and omit them from the stored JSON rather than replacing the value with a placeholder. This keeps the audited object's other fields verifiable while guaranteeing the sensitive field never reaches storage. Add a unit test asserting the masked field is absent from the persisted JSON (not just replaced).

**Exception message sanitization** is a related but distinct concern: truncating an exception message by length does **not** prevent a secret-bearing substring from leaking into a log/audit field. Redact known secret-pattern substrings (`password`, `token`, `secret`, `apiKey`, `credential`) before applying a length cap. See `.claude/rules/30-security.md`.

---

## Frontend Security

- `credentials: "include"` on every fetch — required for session cookie
- Never store tokens in `localStorage` or `sessionStorage`
- `ApiError(401)` → redirect to login or return null user; do not retry
- Content-Security-Policy header: to be configured at reverse proxy level (Phase 1+)
- XSS: React escapes JSX by default; avoid `dangerouslySetInnerHTML` without sanitization

---

## Dependency Security (Planned)

> These are planned for Phase 1 — not yet active.

- BE: `mvn dependency:check` (OWASP dependency checker) in CI
- FE: `npm audit` in CI pre-merge gate
- Secret scanning: `detect-secrets` via Husky pre-commit (Phase 0-B adds hook file)
