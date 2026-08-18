# Black-box Review Checklist

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

---

## How to use

- Review only observable behavior: UI state, redirects, HTTP status, response payload shape, visible errors, and approved redacted logs.
- Mark pass only when evidence exists from FE unit, BE unit/integration, E2E, API/manual black-box execution, or approved human review.
- Any failed P0 security, access-control, or contract item blocks release.
- P1/P2 gaps require a follow-up ticket or explicit risk acceptance.
- Do not attach production data, raw passwords, raw tokens, hashes, or secrets to evidence.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Empty username and empty password are blocked or rejected safely. | AC-2, AC-3 | P0 | OK | BB-LOGIN-002, BB-LOGIN-003 |
| 1.2 | Username trim works for leading/trailing spaces. | AC-7 | P1 | OK | BB-LOGIN-008 |
| 1.3 | Username 100/101 and password over max follow safe validation behavior. | AC-6, AC-7 | P1 | OK | BB-LOGIN-027, BB-LOGIN-028, BB-LOGIN-029 |
| 1.4 | Inactive account remains safely unavailable. | AC-9 | P0 | OK | BB-LOGIN-013, BB-LOGIN-014 |
| 1.5 | Rapid click/Enter does not create duplicate login requests. | AC-5 | P0 | OK | BB-LOGIN-005 |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Anonymous users can open login page without auth loop. | AC-1 | P0 | OK | BB-LOGIN-001 |
| 2.2 | Admin login lands on `/:lang/admin`. | AC-6, AC-12 | P0 | OK | BB-LOGIN-006 |
| 2.3 | Non-admin login lands on `/:lang/`. | AC-6, AC-13 | P0 | OK | BB-LOGIN-007; route remains human-decision sensitive |
| 2.4 | Authenticated user opening login is redirected by role. | AC-14 | P1 | OK | BB-LOGIN-017 |
| 2.5 | Missing, invalid, expired, or revoked tokens cannot access current-user/protected APIs. | AC-15, AC-17 | P0 | OK | BB-LOGIN-018 to BB-LOGIN-021 |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Login success response contains only approved token fields, expiry, user summary, and redirect. | AC-6, AC-19 | P0 | OK | BB-LOGIN-006, BB-LOGIN-007, BB-LOGIN-025 |
| 3.2 | `/api/v1/auth/me` and `/api/v1/me` return compatible current-user payloads. | AC-16 | P0 | OK | BB-LOGIN-022 |
| 3.3 | Auth error responses provide stable machine-readable codes for FE localization. | AC-8, AC-19 | P0 | OK | BB-LOGIN-009 to BB-LOGIN-012 |
| 3.4 | Out-of-scope auth features do not appear as active contract paths. | AC-20 | P0 | OK | BB-LOGIN-026 |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Wrong password, unknown username, and inactive account all fail safely with no token. | AC-8, AC-9, AC-19 | P0 | OK | BB-LOGIN-009 to BB-LOGIN-015 |
| 4.2 | Backend/network failure during login shows a generic safe error and leaves no stale auth. | AC-19 | P1 | OK | BB-LOGIN-030 |
| 4.3 | Logout backend failure still clears FE local state. | AC-18 | P1 | OK | BB-LOGIN-024 |
| 4.4 | Successful login after previous failures revokes prior active token session. | AC-11 | P0 | OK | BB-LOGIN-016 |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Login pending state is visible and does not freeze the page. | AC-5 | P1 | OK | BB-LOGIN-005 |
| 5.2 | Missing/expired token handling does not create a reload or redirect loop. | AC-15 | P1 | OK | BB-LOGIN-018, BB-LOGIN-020 |
| 5.3 | Current-user response with role/scopes is handled without visible UI degradation. | AC-16 | P2 | OK | BB-LOGIN-022 |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Active admin and non-admin users can authenticate with expected landing behavior. | AC-6, AC-12, AC-13 | P0 | OK | BB-LOGIN-006, BB-LOGIN-007 |
| 6.2 | Failed attempts fail safely without exposing account state. | AC-8, AC-9 | P0 | OK | BB-LOGIN-013 to BB-LOGIN-015 |
| 6.3 | Logout revokes server-side session when principal exists and FE clears state. | AC-17, AC-18 | P0 | OK | BB-LOGIN-023 |
| 6.4 | Refresh-token flow, Remember Me, OAuth/SSO, MFA, registration, and password reset stay inactive. | AC-20 | P0 | OK | BB-LOGIN-026 |
| 6.5 | Open operation/security policies are explicitly reviewed before release. | AC-20 | P1 | OK | BB-LOGIN-032 |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Passwords, hashes, raw tokens, stack traces, SQL details, and secrets are not exposed in UI/API/log evidence. | AC-19 | P0 | OK | BB-LOGIN-025, BB-LOGIN-031 |
| 7.2 | Existing and unknown username failures are not distinguishable to users. | AC-8, AC-19 | P0 | OK | BB-LOGIN-011 |
| 7.3 | Error messages are localized or have safe fallback in supported locales. | AC-8, AC-19 | P1 | OK | BB-LOGIN-009 to BB-LOGIN-012 |
| 7.4 | Trace IDs or observable operation signals are available without leaking secrets. | AC-19 | P1 | OK | BB-LOGIN-031 |
| 7.5 | Audit, unlock, token cleanup, email exposure, and localStorage token posture have human/security verdicts. | AC-19, AC-20 | P1 | OK | BB-LOGIN-032 |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | Codex | 2026-06-11 | Prepared |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
