# Error Message Map

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft

## Source Facts

- FE `ApiError` reads `body.message` for non-2xx responses and stores `status` plus `traceId` from `X-Trace-Id`.
- BE `ErrorResponse` actual fields are `timestamp`, `status`, `error`, `message`, `traceId`.
- BE `GlobalExceptionHandler` maps:
  - `NotFoundException` -> 404
  - `DomainException` -> 400
  - `ApplicationException` -> 409
  - validation -> 400
  - `IllegalArgumentException` -> 400
  - unknown -> 500
- Existing `AdminController` non-ADMIN failure returns `403` with `Map.of("error", "ADMIN role required")`, not `ErrorResponse`.

## ROLE Error Candidate

| scenario | status candidate | body candidate | FE handling | status |
|---|---|---|---|---|
| Unauthenticated | 401 | Spring/auth or ErrorResponse depending filter path | redirect/null auth or `ApiError` | Source pattern |
| Role not allowed | 403 | `ErrorResponse` | `ApiError.message` | Accepted |
| Blank role name | 400 | `ErrorResponse.message` | inline/form error | Candidate |
| Too long role name | 400 | `ErrorResponse.message` | inline/form error | Candidate |
| Duplicate role name | 400 | `ErrorResponse.message` | inline/form error | Accepted |
| Role not found | 404 | `ErrorResponse.message` | page/dialog error | Candidate |
| Delete target not found / unavailable | 404 or project convention | `ErrorResponse.message` | delete dialog/error | Candidate |
| Unexpected error | 500 | safe `ErrorResponse.message` + traceId | support/debug display | Source pattern |

## Message Rules

- Do not expose stack traces, SQL, table names, or internal class names to the client.
- FE should display safe `message` and may surface `traceId` for support.
- User-visible FE text should use i18n; raw backend message should not be the only localized UI copy if final UI requires localized text.

## Open Questions

- Should BE messages be stable enough for FE tests, or should tests assert code/status only?

## Human Decisions Required

- Whether tests should assert exact backend `message` text or only status/body shape.
