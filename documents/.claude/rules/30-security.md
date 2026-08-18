# 30 — Security Rules

## Secrets

- Never commit `.env`, `*.key`, `*.pem`, `*.p12`, or any token/password to git
- Configuration values must come from environment variables, not hardcoded strings
- If `.env.example` is needed as a template, only document key names — never actual values

## Webhooks

- Validate **HMAC-SHA256 signature** before executing any business logic in webhook handlers
- Reject and log (at WARN level) any request with an invalid or missing signature
- Webhook endpoints are `permitAll` in Spring Security — signature is the only auth gate

## Error Responses

- `GlobalExceptionHandler` is the single exception → HTTP status mapping point
- Never add ad-hoc `ResponseEntity` status codes in controllers
- Error responses use `ErrorResponse(timestamp, status, errorCode, message, traceId)` only
- Stack traces must never reach the client; log them server-side with `traceId` for correlation

## Transport & Session

- CORS allow-list: `localhost:5173` and `localhost:4173` only in dev; restrict in production
- Authentication is session-based (Spring Security cookie); no JWT tokens in localStorage
- Frontend sends `credentials: "include"` on every request

→ See [docs/standards/security.md](../docs/standards/security.md) for full HTTP status mapping
and HMAC verification code pattern.
