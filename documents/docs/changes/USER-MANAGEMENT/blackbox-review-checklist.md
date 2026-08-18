# Black-box Review Checklist

**Ticket ID**: USER-MANAGEMENT
**Create date**: 2026-06-12
**Author**: ChatGPT
**Update date**: 2026-06-15

---

## How to use

- Each reviewer marks pass / fail / skip with justification.
- Any fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.

---

## Category 1 - Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Default User Management list shows active accounts only and excludes inactive/deactivated accounts. | AC-USER-MANAGEMENT-1, AC-USER-MANAGEMENT-19 | P0 | Pass | Covered by BB-UM-001 and BB-UM-021. |
| 1.2 | Empty/default list state is handled without error or unauthorized sensitive-data exposure. | AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-12 | P1 | Pass | Covered by BB-UM-001 and BB-UM-022. |
| 1.3 | Username trim and length boundary behavior are covered for create and update. | AC-USER-MANAGEMENT-9, AC-USER-MANAGEMENT-14 | P1 | Pass | Covered by BB-UM-009, BB-UM-010, BB-UM-015, BB-UM-016. |
| 1.4 | Password and confirmPassword mismatch, weak password, and reset-password boundary behavior are covered. | AC-USER-MANAGEMENT-10, AC-USER-MANAGEMENT-18 | P0 | Pass | Covered by BB-UM-011, BB-UM-020. |
| 1.5 | Pagination default, max, and invalid page/size behavior are covered. | AC-USER-MANAGEMENT-20 | P1 | Pass | Covered by BB-UM-022. |
| 1.6 | Search keyword, case-variant, and no-match inputs are covered. | AC-USER-MANAGEMENT-4 | P1 | Pass | Covered by BB-UM-004 and BB-UM-005. |
| 1.7 | Double-submit behavior is covered so duplicate active account writes do not occur. | AC-USER-MANAGEMENT-5, AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-18 | P1 | Pass | Covered by BB-UM-023. |

---

## Category 2 - Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | ADMIN can access User Management screen and perform permitted operations. | AC-USER-MANAGEMENT-1, AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-5, AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-16, AC-USER-MANAGEMENT-18 | P0 | Pass | Covered by core ADMIN cases. |
| 2.2 | Authenticated non-ADMIN screen access logs out and redirects to `/:lang/login`. | AC-USER-MANAGEMENT-2 | P0 | Pass | Covered by BB-UM-002. |
| 2.3 | Authenticated non-ADMIN direct API calls return 403 and do not expose data or write. | AC-USER-MANAGEMENT-2 | P0 | Pass | Covered by BB-UM-003. |
| 2.4 | Unauthenticated User Management API calls are rejected by existing authentication behavior. | AC-USER-MANAGEMENT-2 | P0 | Pass | Covered by BB-UM-003. |
| 2.5 | Detail view does not expose sensitive fields to ADMIN. | AC-USER-MANAGEMENT-12, AC-USER-MANAGEMENT-13 | P0 | Pass | Covered by BB-UM-019 and BB-UM-020. |

---

## Category 3 - Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | User Management API success behavior supports list/detail/create/update/activate/deactivate/reset-password scenarios required by spec. | AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-5, AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-16, AC-USER-MANAGEMENT-18 | P0 | Pass | Covered by BB-UM-001, BB-UM-008, BB-UM-015, BB-UM-018, BB-UM-020. |
| 3.2 | Validation error contract remains stable enough for FE to show localized messages. | AC-USER-MANAGEMENT-9, AC-USER-MANAGEMENT-10, AC-USER-MANAGEMENT-21 | P0 | Pass | Covered by required/duplicate/boundary/error cases. |
| 3.3 | Update and deactivate behavior remain compatible with the LOGIN flow. | AC-USER-MANAGEMENT-16, AC-USER-MANAGEMENT-19 | P0 | Pass | Covered by BB-UM-018 and BB-UM-021. |
| 3.4 | Existing account data remains compatible after migration/backfill in test environment. | AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-7, AC-USER-MANAGEMENT-20 | P0 | Pass | Covered by test-data compatibility section and migration smoke expectation. |
| 3.5 | Existing role-based access behavior is not broken by list/search/create/update flows. | AC-USER-MANAGEMENT-2, AC-USER-MANAGEMENT-4, AC-USER-MANAGEMENT-8, AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-15, AC-USER-MANAGEMENT-17 | P1 | Pass | Role resolution and last-Admin guard should remain observable. |

---

## Category 4 - Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Duplicate username create/update is rejected without creating/changing records. | AC-USER-MANAGEMENT-9 | P0 | Pass | Covered by BB-UM-010 and BB-UM-012. |
| 4.2 | Invalid role or missing role is rejected without creating/changing records. | AC-USER-MANAGEMENT-8 | P0 | Pass | Covered by BB-UM-013. |
| 4.3 | Password mismatch and weak password are rejected before DB write. | AC-USER-MANAGEMENT-10 | P0 | Pass | Covered by BB-UM-011. |
| 4.4 | Stale update is rejected with conflict if versioning is used by the implementation. | AC-USER-MANAGEMENT-14, AC-USER-MANAGEMENT-17 | P1 | Pass | Covered by BB-UM-017. |
| 4.5 | Last active ADMIN deactivation or role downgrade is rejected. | AC-USER-MANAGEMENT-17 | P0 | Pass | Covered by BB-UM-019. |
| 4.6 | Error responses do not expose secrets or stack traces. | AC-USER-MANAGEMENT-12, AC-USER-MANAGEMENT-21 | P1 | Pass | Covered by BB-UM-024. |

---

## Category 5 - Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | List/search/filter remain usable with multiple account records. | AC-USER-MANAGEMENT-3, AC-USER-MANAGEMENT-4, AC-USER-MANAGEMENT-20 | P1 | Pass | Covered by BB-UM-001, BB-UM-004, BB-UM-006, BB-UM-022. |
| 5.2 | Reload/back navigation does not cause visible freeze, reload loop, or unauthorized data exposure. | AC-USER-MANAGEMENT-1, AC-USER-MANAGEMENT-2, AC-USER-MANAGEMENT-3 | P2 | Pass | Covered by BB-UM-025. |
| 5.3 | Large-data/pagination behavior is considered if the target environment has enough records. | AC-USER-MANAGEMENT-20 | P2 | Pass | Add manual evidence if paging/size is exposed in UI/API. |

---

## Category 6 - Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Newly created account becomes active when requested and is returned to the list or target UI state. | AC-USER-MANAGEMENT-5 | P0 | Pass | Covered by BB-UM-008. |
| 6.2 | Create writes both `tbl_auth_user_account` and linked `tbl_dim_member_pseudonym`. | AC-USER-MANAGEMENT-7 | P0 | Pass | Covered by BB-UM-008 and BB-UM-012. |
| 6.3 | `role_id` is required and saved on member pseudonym; invalid role is rejected. | AC-USER-MANAGEMENT-8 | P0 | Pass | Covered by BB-UM-013 and BB-UM-016. |
| 6.4 | `tbl_dim_member_pseudonym.team_id` is always written/kept as `NULL` in this ticket. | AC-USER-MANAGEMENT-6, AC-USER-MANAGEMENT-15, AC-USER-MANAGEMENT-23 | P0 | Pass | Covered by BB-UM-012 and BB-UM-017. |
| 6.5 | Account deactivate/reactivate changes status logically and does not physically delete the record. | AC-USER-MANAGEMENT-16 | P0 | Pass | Covered by BB-UM-018. |
| 6.6 | Password reset replaces the hash and does not return/log raw password. | AC-USER-MANAGEMENT-18, AC-USER-MANAGEMENT-12 | P0 | Pass | Covered by BB-UM-020. |
| 6.7 | Active account created/updated by this screen can be used by LOGIN; inactive/deactivated account cannot login. | AC-USER-MANAGEMENT-19 | P0 | Pass | Covered by BB-UM-021. |

---

## Category 7 - i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Required-field messages are visible and localized or mapped from expected message keys. | AC-USER-MANAGEMENT-5, AC-USER-MANAGEMENT-9, AC-USER-MANAGEMENT-10 | P1 | Pass | Covered by BB-UM-009, BB-UM-011, BB-UM-012, BB-UM-013, BB-UM-014. |
| 7.2 | Duplicate-username and invalid-role messages are visible and localized or mapped from expected message keys. | AC-USER-MANAGEMENT-8, AC-USER-MANAGEMENT-9 | P0 | Pass | Covered by BB-UM-010 and BB-UM-013. |
| 7.3 | Permission-denied message/behavior is visible and does not leak account data. | AC-USER-MANAGEMENT-2 | P0 | Pass | Covered by BB-UM-002 and BB-UM-003. |
| 7.4 | Existing traceId/error logging behavior remains intact for User Management errors. | AC-USER-MANAGEMENT-21 | P2 | Pass | Covered by BB-UM-024. |
| 7.5 | Dedicated audit-log storage is not required in this release and is not treated as a failed test. | AC-USER-MANAGEMENT-22, AC-USER-MANAGEMENT-23 | P2 | Pass | Covered by BB-UM-026. |
| 7.6 | No batch/job/event is introduced by this ticket. | AC-USER-MANAGEMENT-22 | P2 | Pass | Covered by BB-UM-026. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | ChatGPT | 2026-06-15 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
