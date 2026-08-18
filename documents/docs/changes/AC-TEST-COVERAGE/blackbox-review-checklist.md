# Black-box Review Checklist

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

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
| 1.1 | Zero-AC ticket / empty AC section is covered without inventing coverage rows. | AC-AC-TEST-COVERAGE-1, AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-011 and `BD-001`. |
| 1.2 | Exactly one AC remains stable and still renders with the correct key. | AC-AC-TEST-COVERAGE-1 | P0 | OK | Covered by `BD-002` and BB-AC-TEST-COVERAGE-001. |
| 1.3 | One AC to many test cases and many-to-many coverage are both represented. | AC-AC-TEST-COVERAGE-5 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-005 and `BD-003` / `BD-004`. |
| 1.4 | Planned coverage without execution evidence is shown as `UNTESTED`. | AC-AC-TEST-COVERAGE-4 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-004 and `ED-002`. |
| 1.5 | Conflicting pass/fail evidence resolves to `FAILED`. | AC-AC-TEST-COVERAGE-6 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-006 and `ED-004`. |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Authenticated reader can access the coverage read surface, but no write path is exposed. | AC-AC-TEST-COVERAGE-7, AC-AC-TEST-COVERAGE-9 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-007 and BB-AC-TEST-COVERAGE-009. |
| 2.2 | Manual mapping or pinning is rejected for admin and viewer roles alike. | AC-AC-TEST-COVERAGE-9 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-009. |
| 2.3 | Anonymous access does not create a back door for manual override. | AC-AC-TEST-COVERAGE-9 | P0 | OK | Covered by `anonymous` in `test-data.md` and BB-AC-TEST-COVERAGE-009. |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Coverage statuses remain limited to the spec vocabulary and are not silently invented. | AC-AC-TEST-COVERAGE-3, AC-AC-TEST-COVERAGE-4, AC-AC-TEST-COVERAGE-5, AC-AC-TEST-COVERAGE-6 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-003 through BB-AC-TEST-COVERAGE-006. |
| 3.2 | AC-first grouping is preserved in the read surface. | AC-AC-TEST-COVERAGE-7 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-007. |
| 3.3 | `First CI Pass` and `Exception` are treated as supporting KPI signals, not as coverage overrides. | AC-AC-TEST-COVERAGE-8 | P1 | OK | Covered by BB-AC-TEST-COVERAGE-008. |
| 3.4 | Unknown AC references or malformed source blocks are reported rather than accepted as valid coverage. | AC-AC-TEST-COVERAGE-2, AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-012 and `ED-003` / `ED-005`. |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing planned coverage is surfaced as a warning or data-quality issue instead of failing silently. | AC-AC-TEST-COVERAGE-3, AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-003 and BB-AC-TEST-COVERAGE-010. |
| 4.2 | Missing execution evidence is still readable and does not collapse the entire ticket. | AC-AC-TEST-COVERAGE-4, AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-004. |
| 4.3 | Conflicting evidence produces a visible conflict signal. | AC-AC-TEST-COVERAGE-6, AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-006. |
| 4.4 | Parsing or linkage warnings are persisted for operator review. | AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-010. |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | The ticket coverage surface provides enough information for operator review without direct DB inspection. | AC-AC-TEST-COVERAGE-7, AC-AC-TEST-COVERAGE-8, AC-AC-TEST-COVERAGE-10 | P1 | OK | Covered by BB-AC-TEST-COVERAGE-007, BB-AC-TEST-COVERAGE-008, and BB-AC-TEST-COVERAGE-010. |
| 5.2 | Evidence chronology is sufficient to distinguish the first CI pass from later runs. | AC-AC-TEST-COVERAGE-8 | P1 | OK | Covered by `ND-004` and BB-AC-TEST-COVERAGE-008. |
| 5.3 | Test data keeps synthetic AC/test/result/CI fixtures clearly separated from production data. | AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by `test-data.md` data policy. |
| 5.4 | Reuse-first behavior is preserved; no new table is required for the black-box design. | AC-AC-TEST-COVERAGE-2, AC-AC-TEST-COVERAGE-10 | P1 | OK | Covered by `Existing Data Compatibility` and spec scope. |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Every AC in the spec has at least one mapped black-box case. | AC-AC-TEST-COVERAGE-1 .. 10 | P0 | OK | See AC ↔ Black-box Mapping section in `blackbox-testcases.md`. |
| 6.2 | Each black-box case records preconditions, input, steps, expected result, and note. | AC-AC-TEST-COVERAGE-1 .. 10 | P0 | OK | All case sections follow the same shape. |
| 6.3 | Test data IDs are referenced in the cases and can be reused by reviewers. | AC-AC-TEST-COVERAGE-1 .. 10 | P0 | OK | See `ND-*`, `ED-*`, and `BD-*` references in both documents. |
| 6.4 | The checklist itself points to the concrete BB cases and data IDs used for verification. | AC-AC-TEST-COVERAGE-10 | P0 | OK | Cross-linked throughout this file. |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | The artifact is documentation-only and can be rolled back by reverting the three files. | AC-AC-TEST-COVERAGE-1 .. 10 | P1 | OK | No runtime code change is introduced in this phase. |
| 7.2 | The design does not depend on a manual mapping feature that the ticket forbids. | AC-AC-TEST-COVERAGE-9 | P0 | OK | Covered by BB-AC-TEST-COVERAGE-009. |
| 7.3 | The design does not require raw prompt / raw source persistence. | AC-AC-TEST-COVERAGE-10 | P0 | OK | Covered by the spec scope and `test-data.md` policy. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-26 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.