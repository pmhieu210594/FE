# Black-box Review Checklist

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-22
**Author**: OpenAI
**Update date**: 2026-06-22

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| #   | Check item                                      | AC references                  | Priority | Status | Notes |
| --- | ----------------------------------------------- | ------------------------------ | -------- | ------ | ----- |
| 1.1 | Missing `test-plan.md` returns `NOT_FOUND`      | AC-PARSE-TEST-PLAN-RESULTS-1,5 | P0       | ✅    |       |
| 1.2 | Missing `test-results.md` returns `NOT_FOUND`   | AC-PARSE-TEST-PLAN-RESULTS-2,5 | P0       | ✅    |       |
| 1.3 | Missing required section is reported explicitly | AC-PARSE-TEST-PLAN-RESULTS-5   | P0       | ✅    |       |
| 1.4 | Empty file produces parse failure               | AC-PARSE-TEST-PLAN-RESULTS-5   | P0       | ✅    |       |

---

## Category 2 — Permission & Access Control

| #   | Check item                               | AC references                | Priority | Status | Notes |
| --- | ---------------------------------------- | ---------------------------- | -------- | ------ | ----- |
| 2.1 | Parser API access follows project policy | AC-PARSE-TEST-PLAN-RESULTS-7 | P2       | ✅    |       |
| 2.2 | Pair View access follows project policy  | AC-PARSE-TEST-PLAN-RESULTS-7 | P2       | ✅    |       |

---

## Category 3 — Compatibility & Contract Stability

| #   | Check item                              | AC references                | Priority | Status | Notes |
| --- | --------------------------------------- | ---------------------------- | -------- | ------ | ----- |
| 3.1 | Snapshot schema remains stable          | AC-PARSE-TEST-PLAN-RESULTS-4 | P1       | ✅    |       |
| 3.2 | Pair View response remains stable       | AC-PARSE-TEST-PLAN-RESULTS-7 | P1       | ✅    |       |
| 3.3 | Validation contract is machine-readable | AC-PARSE-TEST-PLAN-RESULTS-5 | P0       | ✅    |       |

---

## Category 4 — Exception Handling & Resilience

| #   | Check item                                            | AC references                    | Priority | Status | Notes |
| --- | ----------------------------------------------------- | -------------------------------- | -------- | ------ | ----- |
| 4.1 | Missing section does not prevent remaining extraction | AC-PARSE-TEST-PLAN-RESULTS-5     | P0       | ✅    |       |
| 4.2 | Re-parse updates existing snapshot                    | AC-PARSE-TEST-PLAN-RESULTS-6     | P0       | ✅    |       |
| 4.3 | Empty-state handling is clear                         | AC-PARSE-TEST-PLAN-RESULTS-1,2,5 | P1       | ✅    |       |

---

## Category 5 — Performance / Degradation Signals

| #   | Check item                           | AC references                | Priority | Status | Notes |
| --- | ------------------------------------ | ---------------------------- | -------- | ------ | ----- |
| 5.1 | Large markdown parses successfully   | AC-PARSE-TEST-PLAN-RESULTS-3 | P1       | ✅    |       |
| 5.2 | Mixed language content remains valid | AC-PARSE-TEST-PLAN-RESULTS-3 | P1       | ✅    |       |
| 5.3 | No retry loop or freeze observed     | AC-PARSE-TEST-PLAN-RESULTS-6 | P2       | ✅    |       |

---

## Category 6 — Business Rule Integrity

| #   | Check item                             | AC references                  | Priority | Status | Notes |
| --- | -------------------------------------- | ------------------------------ | -------- | ------ | ----- |
| 6.1 | Canonical fields extracted correctly   | AC-PARSE-TEST-PLAN-RESULTS-3   | P0       | ✅    |       |
| 6.2 | Placeholder detection works correctly  | AC-PARSE-TEST-PLAN-RESULTS-5   | P0       | ✅    |       |
| 6.3 | Structure validation works correctly   | AC-PARSE-TEST-PLAN-RESULTS-5   | P0       | ✅    |       |
| 6.4 | AC coverage validation works correctly | AC-PARSE-TEST-PLAN-RESULTS-5   | P0       | ✅    |       |
| 6.5 | Parse status remains consistent        | AC-PARSE-TEST-PLAN-RESULTS-5,6 | P0       | ✅    |       |

---

## Category 7 — i18n / Messaging / Operational Observability

| #   | Check item                          | AC references                  | Priority | Status | Notes |
| --- | ----------------------------------- | ------------------------------ | -------- | ------ | ----- |
| 7.1 | Error messages do not leak content  | AC-PARSE-TEST-PLAN-RESULTS-5   | P1       | ✅    |       |
| 7.2 | Data Quality findings are available | AC-PARSE-TEST-PLAN-RESULTS-5   | P1       | ✅    |       |
| 7.3 | Evidence Events are available       | AC-PARSE-TEST-PLAN-RESULTS-4,5 | P1       | ✅    |       |

---

## Sign-off

| Role      | Name | Date | Result |
| --------- | ---- | ---- | ------ |
| QA Lead   |      |      |        |
| Developer |      |      |        |
| PM/BA     |      |      |        |

> Release gate rule: all P0 checklist items must be checked.
