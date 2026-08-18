# Black-box Review Checklist

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung  
**Update date**: 2026-06-17  

---

## How to use

- Each reviewer marks OK / FAIL / SKIP with justification.
- Any FAIL P0 item blocks the release of the test-design artifact.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | A full scan with all 8 required artifacts is covered. | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-02, AC-ARTIFACT-SCANNER-03 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-01. |
| 1.2 | Missing required artifact is covered without assuming parser behavior. | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-04 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-02. |
| 1.3 | Both same-content rescan and changed-content rescan boundaries are covered. | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-06 and BB-ARTIFACT-SCANNER-07. |
| 1.4 | Empty/null `ticketIds` for `TICKET_SCOPED` is covered. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-09. |
| 1.5 | A repository with no valid target ticket or file boundary is represented in the test data. | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-09 | P1 | OK | Covered in `test-data.md` B-04. |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | The positive flow for an admin running the scanner is covered. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-05. |
| 2.2 | A non-admin cannot trigger a scan. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-11. |
| 2.3 | A non-admin cannot view the current inventory. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-11. |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | The run scan API/manual flow returns an observable run summary and artifact result. | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-05. |
| 3.2 | Current inventory returns the latest visible inventory for a valid repository. | AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-10. |
| 3.3 | The unknown ticket policy is covered as an externally observable outcome. | AC-ARTIFACT-SCANNER-04 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-03. |
| 3.4 | Files outside the scope do not break the inventory contract of the target artifact. | AC-ARTIFACT-SCANNER-03 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-04. |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Invalid repository or inaccessible source is represented in the error data. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered in `test-data.md` E-04 and E-08. |
| 4.2 | Blank ref / invalid request is represented in the black-box data and cases. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by `test-data.md` E-06 and BB-ARTIFACT-SCANNER-09. |
| 4.3 | Missing required artifact does not imply whole-run failure by default. | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-04 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-02. |
| 4.4 | Source read or connector failure is considered from the operational viewpoint. | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-11 | P1 | OK | Covered in `test-data.md` E-08 and BB-ARTIFACT-SCANNER-12. |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | A full scan with many tickets still has a run summary that is sufficient for operational review. | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-05 and test data N-03. |
| 5.2 | Repeated scan does not create misleading changed/new results when content is unchanged. | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-06. |
| 5.3 | Latest inventory remains readable after multiple runs. | AC-ARTIFACT-SCANNER-09 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-10 and test data B-05. |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Ticket ID is derived from the path `docs/changes/<TICKET>/` in black-box cases. | AC-ARTIFACT-SCANNER-02 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-01 and BB-ARTIFACT-SCANNER-03. |
| 6.2 | Artifact type recognition for target files is covered independently from implementation details. | AC-ARTIFACT-SCANNER-03 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-01 and BB-ARTIFACT-SCANNER-04. |
| 6.3 | Phase0 metadata-only behavior is covered separately from ticket change-scope artifacts. | AC-ARTIFACT-SCANNER-08 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-08. |
| 6.4 | Changed/new artifact handoff to the parser through `need_parse` is covered at the observable result level. | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-07. |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | The run summary exposes enough information for manual operational review. | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-11 | P1 | OK | Covered by BB-ARTIFACT-SCANNER-05 and BB-ARTIFACT-SCANNER-12. |
| 7.2 | Artifact-level status and message are observable for missing/error/skipped cases. | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09 | P0 | OK | Covered by BB-ARTIFACT-SCANNER-02, BB-ARTIFACT-SCANNER-08, BB-ARTIFACT-SCANNER-12. |
| 7.3 | Test data clearly separates admin, non-admin, normal, error, and boundary datasets. | AC-ARTIFACT-SCANNER-11 | P0 | OK | Covered by `test-data.md`. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-17 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.