# 00_brainstorm

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## Purpose

Capture Phase 1 investigation notes before freezing `spec-pack.md` as the single source of truth. This file is not the implementation contract; facts and decisions must be promoted into `spec-pack.md`, while unclear items must stay in Open Issues.

## Known Information

- LOGIN is an internal username/password authentication flow for EDCAP.
- The login screen must contain username, password, password masking, and a primary login action.
- Current FE source has `LoginPage.tsx`, `useAuth.ts`, and `lib/api.ts` for username/password bearer-token auth.
- Current BE source has `AuthController`, `MeController`, `AuthService`, `AuthTokenService`, `BearerTokenAuthenticationFilter`, and stateless bearer security.
- Current DB migrations include `tbl_auth_user_account` and `tbl_auth_token_session`.
- Canonical current-user endpoint is `/api/v1/auth/me`; `/api/v1/me` remains compatibility.
- OAuth/SSO/MFA/register/password-reset/social login are out of scope.

## Undetermined Points

- Whether refresh token should remain in the login response while refresh flow is disabled.
- Whether non-admin users should land on `/:lang/` or a real `/home` route.
- Whether `email` is allowed in all auth responses and JWT payloads.
- Whether `returnUrl` is required in MVP and what allowlist applies.
- Whether username lookup is case-sensitive.
- Whether formal audit logging is required beyond attempt/session records.
- Whether localStorage token persistence is acceptable for production.

## Expected Risks

- Architecture and standards docs still contain older OAuth/session-cookie guidance.
- FE token persistence currently uses localStorage, which needs security review.
- Error handling must avoid account enumeration and secret leakage.
- Refresh-token fields exist in current implementation although refresh flow is not active.
- Root and FE LOGIN documentation trees can drift.

## What AI Needs to Investigate

- FE auth routes, login UI, auth hook, API helper, layout logout, and locale keys.
- BE auth endpoints, service rules, token service, security filter, error mapping, and config.
- DB migration mapping for account and token session state.
- Existing FE, BE, and E2E tests related to LOGIN.

## What Humans Need to Ask

- Should refresh-token issuance remain part of MVP contract?
- Should non-admin landing stay `/:lang/` or become `/:lang/home`?
- Can auth payloads include `email` for every authenticated user?
- Should `returnUrl`, username case normalization, audit logging, or token-storage changes be included now?

## Conditions Under Which Implementation Is Not Permitted

- Do not implement open issues without human decision.
- Do not add OAuth/SSO/MFA/register/password-reset/refresh-flow behavior.
- Do not expose password, hash, token, JWT secret, SQL detail, stack trace, or account-existence hints.
- Do not edit existing Flyway migrations in place.
