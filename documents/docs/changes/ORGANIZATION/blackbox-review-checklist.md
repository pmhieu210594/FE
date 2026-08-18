# Black-box Review Checklist

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-11
**Author**:  nk_trung
**Update date**: 2026-06-11

---

## How to use

- Each reviewer marks pass / fail / skip with justification.
- Any fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Default Organization list shows active records only and excludes soft-deleted records. | AC-ORGANIZATION-1, AC-ORGANIZATION-10 | P0 | OK | Covered by BB-ORG-001, BB-ORG-025. |
| 1.2 | Empty/default list state is handled without error or unauthorized deleted-data exposure. | AC-ORGANIZATION-1, AC-ORGANIZATION-10 | P1 | OK | Covered by BB-ORG-002. |
| 1.3 | Code length boundaries 1, 50, and 51 are covered for create/update. | AC-ORGANIZATION-4, AC-ORGANIZATION-7 | P1 | OK | Covered by BB-ORG-011, BB-ORG-012, BB-ORG-020, BB-ORG-021. |
| 1.4 | Name length boundaries 1, 255, and 256 are covered for create/update. | AC-ORGANIZATION-4, AC-ORGANIZATION-8 | P1 | OK | Covered by BB-ORG-011, BB-ORG-012, BB-ORG-020, BB-ORG-021. |
| 1.5 | Description boundaries null/empty, 500, and 501 are covered. | AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P1 | OK | Covered by BB-ORG-008, BB-ORG-011, BB-ORG-012, BB-ORG-020, BB-ORG-021. |
| 1.6 | Search no-match and character-type inputs are covered. | AC-ORGANIZATION-2 | P2 | OK | Covered by BB-ORG-005. |
| 1.7 | Double-submit behavior is covered so duplicate active data is not created. | AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P1 | OK | Covered by BB-ORG-032. |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | ADMIN can access Organization screen and perform permitted operations. | AC-ORGANIZATION-1, AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9 | P0 | OK | Covered by core ADMIN cases. |
| 2.2 | Authenticated non-ADMIN screen access logs out and redirects to `/:lang/login`. | AC-ORGANIZATION-11 | P0 | OK | Covered by BB-ORG-027. |
| 2.3 | Authenticated non-ADMIN direct API calls return 403 and do not expose data/write. | AC-ORGANIZATION-11 | P0 | OK | Covered by BB-ORG-028. |
| 2.4 | Unauthenticated Organization API calls are rejected by existing authentication behavior. | AC-ORGANIZATION-11 | P0 | OK | Covered by BB-ORG-029. |
| 2.5 | Deleted Organization detail is read-only and cannot be edited through UI. | AC-ORGANIZATION-10 | P1 | OK | Covered by BB-ORG-026. |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Organization API success behavior supports list/detail/create/update/delete scenarios required by spec. | AC-ORGANIZATION-1, AC-ORGANIZATION-4, AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9 | P0 | OK | Covered by BB-ORG-001, BB-ORG-007, BB-ORG-016, BB-ORG-018, BB-ORG-023. |
| 3.2 | Validation error contract remains stable enough for FE to show localized messages. | AC-ORGANIZATION-4, AC-ORGANIZATION-5, AC-ORGANIZATION-6 | P0 | OK | Covered by required/duplicate/boundary error cases. |
| 3.3 | Conflict response uses stale-version behavior and does not overwrite/delete. | AC-ORGANIZATION-13 | P0 | OK | Covered by BB-ORG-022 and BB-ORG-024. |
| 3.4 | Existing Organization data remains compatible after migration/backfill in test environment. | AC-ORGANIZATION-1, AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-9 | P0 | OK | Covered by test-data compatibility section and migration smoke expectation. |
| 3.5 | Existing Customer/Project references are not broken by soft-delete or schema change. | AC-ORGANIZATION-9, AC-ORGANIZATION-10 | P1 | OK | Child-data rows are cascade-soft-deleted, so reference compatibility should not regress. |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Duplicate code create/update is rejected without creating/changing records. | AC-ORGANIZATION-5, AC-ORGANIZATION-7 | P0 | OK | Covered by BB-ORG-013 and BB-ORG-017. |
| 4.2 | Duplicate name create/update is rejected without creating/changing records. | AC-ORGANIZATION-6, AC-ORGANIZATION-8 | P0 | OK | Covered by BB-ORG-014 and BB-ORG-019. |
| 4.3 | Code/name reuse from soft-deleted records is allowed when no active duplicate exists. | AC-ORGANIZATION-5, AC-ORGANIZATION-6 | P1 | OK | Covered by BB-ORG-015. |
| 4.4 | Stale update and stale delete are rejected with conflict. | AC-ORGANIZATION-13 | P0 | OK | Covered by BB-ORG-022 and BB-ORG-024. |
| 4.5 | Non-existing ID behavior is covered or accepted as existing global error handling. | AC-ORGANIZATION-12 | P2 | OK | Test-data includes ERR-NOTFOUND-ID; add execution evidence if in scope. |
| 4.6 | Error responses do not expose secrets or stack traces. | AC-ORGANIZATION-12 | P1 | OK | Covered by BB-ORG-030. |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | List/search/filter remain usable with multiple Organization records. | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3 | P1 | OK | Covered by BB-ORG-003, BB-ORG-004, BB-ORG-006. |
| 5.2 | Reload/back navigation does not cause visible freeze, reload loop, or unauthorized data exposure. | AC-ORGANIZATION-1, AC-ORGANIZATION-2, AC-ORGANIZATION-3 | P2 | OK | Covered by BB-ORG-033. |
| 5.3 | Large-data/pagination behavior is considered if the target environment has enough records. | AC-ORGANIZATION-1, AC-ORGANIZATION-2 | P2 | OK | Add manual evidence if paging/size is exposed in UI/API. |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Newly created Organization becomes active and screen returns to Organization List. | AC-ORGANIZATION-4 | P0 | OK | Covered by BB-ORG-007, BB-ORG-008. |
| 6.2 | Organization code is editable after creation when unique and submitted with current version. | AC-ORGANIZATION-7 | P0 | OK | Covered by BB-ORG-016. |
| 6.3 | Organization name is editable after creation when unique and submitted with current version. | AC-ORGANIZATION-8 | P0 | OK | Covered by BB-ORG-018. |
| 6.4 | Soft delete changes Organization state logically and does not physically delete the record. | AC-ORGANIZATION-9 | P0 | OK | Covered by BB-ORG-023. |
| 6.5 | Deleted Organizations are visible only through Deleted/All filter and detail is read-only. | AC-ORGANIZATION-10 | P1 | OK | Covered by BB-ORG-025, BB-ORG-026. |
| 6.6 | Numeric version increments/changes only after successful update or soft delete. | AC-ORGANIZATION-7, AC-ORGANIZATION-8, AC-ORGANIZATION-9, AC-ORGANIZATION-13 | P0 | OK | Verify via public response/detail if version is observable. |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Required-field messages are visible and localized or mapped from expected message keys. | AC-ORGANIZATION-4 | P1 | OK | Covered by BB-ORG-009, BB-ORG-010. |
| 7.2 | Duplicate-code/name messages are visible and localized or mapped from expected message keys. | AC-ORGANIZATION-5, AC-ORGANIZATION-6, AC-ORGANIZATION-7, AC-ORGANIZATION-8 | P0 | OK | Covered by BB-ORG-013, BB-ORG-014, BB-ORG-017, BB-ORG-019. |
| 7.3 | Stale-version conflict message is visible and localized or mapped from expected message key. | AC-ORGANIZATION-13 | P0 | OK | Covered by BB-ORG-022, BB-ORG-024. |
| 7.4 | Permission-denied message/behavior is visible and does not leak Organization data. | AC-ORGANIZATION-11 | P0 | OK | Covered by BB-ORG-027, BB-ORG-028, BB-ORG-029. |
| 7.5 | Existing traceId/error logging behavior remains intact for Organization errors. | AC-ORGANIZATION-12 | P2 | OK | Covered by BB-ORG-030. |
| 7.6 | Dedicated audit-log storage is not required in this release and is not treated as a failed test. | AC-ORGANIZATION-12 | P2 | N/A | Covered by BB-ORG-031. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026/11/06 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
