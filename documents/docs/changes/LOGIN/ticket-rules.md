# Ticket Rules:

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## Must Follow

- Do not add specifications not included in the spec-pack.
- Ambiguous points must be returned as Open Issues.
- Before implementation, read the target source and existing tests.
- Follow existing patterns.
- Do not reuse obvious errors, vulnerabilities, or existing SonarLint violations.
- Check for full-width numbers, half-width numbers, empty strings, nulls, digits, and precision.
- Business code values should be in enum/constant/master format instead of magic numbers.
- Do not export secrets/PII to logs.
- Use username/password as the primary LOGIN MVP flow.
- Use `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, and compatibility `GET /api/v1/me`.
- Keep `src/lib/api.ts` as FE auth HTTP boundary and `useAuth()` as FE auth-state boundary.
- Keep BE controllers thin and auth business logic in application services.
- Keep safe generic auth errors and localized FE messages.

## Must Not Do

- Do not add OAuth, SSO, social login, MFA, registration, invitation, profile management, forgot password, password reset, Remember Device, or active Remember Me behavior.
- Do not implement refresh-token rotation/API while policy is open.
- Do not add `/home` while non-admin landing is open.
- Do not implement `returnUrl` without allowlist decision.
- Do not change username case normalization or email exposure without decision.
- Do not use `C_API.Login = "/api/v1/login"` or `EDCAP_FE/src/utils/api.ts` for LOGIN.
- Do not edit old Flyway migrations in place.
- Do not log/return passwords, hashes, token values, JWT secrets, SQL internals, stack traces, or account-existence hints.

## Stop / Ask Conditions

- Login response shape changes beyond `spec-pack.md`.
- Refresh-token behavior becomes active.
- Non-admin route must become `/home`.
- `returnUrl` is requested.
- Email exposure, username case, audit logging, or token storage posture must change.
- Tests require real credentials or production secrets.

## Review Focus

- AC traceability to `spec-pack.md`.
- No out-of-scope auth features.
- FE/BE DTO field compatibility.
- Safe error and no account enumeration.
- Secret leakage prevention.
- Repeated-failure safety and session revoke behavior.
- Logout server revocation plus FE local clear.
- i18n coverage and UTF-8 preservation.
- Open issues remain visible.

## Test Focus

- Login render and required controls.
- Empty username/password behavior.
- Password masking and duplicate-submit prevention.
- Active admin and active non-admin success.
- Invalid username and wrong password indistinguishability.
- Inactive account safety.
- Repeated-failure safety.
- Current-user canonical and compatibility endpoints.
- Missing/expired/revoked token behavior.
- Logout local clear and server revocation.
- Omitted OAuth/SSO/MFA/password-reset/Remember Me behavior.
