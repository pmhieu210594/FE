# Black-box Review Checklist

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung  
**Update date**: 2026-06-25  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip, and adds a short note when a check is skipped.
- All P0 items must pass before release.
- P1/P2 gaps must have a follow-up ticket or an explicit risk acceptance note.
- Review only observable behavior: API payload, persisted snapshot, returned fields, missing / parse error signaling, and approved redacted logs.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Score never goes below 0 or above 100 on normal, missing, or partial-parse cases. | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-4, AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-001, BB-EQS-003, BB-EQS-004 |
| 1.2 | Threshold boundaries map to the correct score band with no off-by-one error. | AC-EVIDENCE-QUALITY-SCORE-3 | P0 | pass | BB-EQS-002 |
| 1.3 | Missing artifact and broken traceability are surfaced rather than hidden. | AC-EVIDENCE-QUALITY-SCORE-4 | P0 | pass | BB-EQS-003 |
| 1.4 | Parse errors are isolated and the rest of the result can still be returned when possible. | AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-004 |
| 1.5 | Same source state with same rule version returns the same observable result. | AC-EVIDENCE-QUALITY-SCORE-9 | P1 | pass | BB-EQS-008 |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | The read endpoint scope is only as open as the controller policy allows. If a guard exists, unauthorized access is rejected safely. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P1 | pass | Verify against the implemented controller policy. |
| 2.2 | Recalculation or backfill entrypoints, if exposed, are restricted to the intended operator / CI caller. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P1 | pass | Applies only if the endpoint exists in the final contract. |
| 2.3 | The dashboard read path is treated as read-only and does not behave like a mutation endpoint. | AC-EVIDENCE-QUALITY-SCORE-10 | P0 | pass | BB-EQS-009 |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Response contains the required downstream-ready fields and field names stay stable. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P0 | pass | BB-EQS-001, BB-EQS-006, BB-EQS-009 |
| 3.2 | Read-back returns the latest persisted snapshot instead of recomputing on open. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P0 | pass | BB-EQS-006, BB-EQS-009 |
| 3.3 | Missing / parse-error fields remain machine-readable and do not collapse into opaque text only. | AC-EVIDENCE-QUALITY-SCORE-4, AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-003, BB-EQS-004 |
| 3.4 | The contract remains safe for downstream consumers that expect the latest snapshot only. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P1 | pass | BB-EQS-006, BB-EQS-009 |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing artifacts, broken links, and parse errors do not crash the whole score flow. | AC-EVIDENCE-QUALITY-SCORE-4, AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-003, BB-EQS-004 |
| 4.2 | Non-existing ticketId fails safely with a validation / not-found style response. | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-7 | P1 | pass | BB-EQS-010 |
| 4.3 | Repeated reads of the same persisted snapshot stay stable. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-9 | P1 | pass | BB-EQS-006, BB-EQS-008 |
| 4.4 | The score engine still returns a partial result when some source data cannot be normalized. | AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-004 |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | The read path remains read-only and does not visibly trigger a fresh calculation on open. | AC-EVIDENCE-QUALITY-SCORE-10 | P0 | pass | BB-EQS-009 |
| 5.2 | Large or detailed breakdown responses remain consumable without contract drift. | AC-EVIDENCE-QUALITY-SCORE-2, AC-EVIDENCE-QUALITY-SCORE-10 | P1 | pass | Use a verbose fixture if available. |
| 5.3 | Repeated calls with unchanged source data do not produce observable drift. | AC-EVIDENCE-QUALITY-SCORE-9 | P1 | pass | BB-EQS-008 |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | The breakdown is explainable and the score can be justified from the returned criteria. | AC-EVIDENCE-QUALITY-SCORE-2 | P0 | pass | BB-EQS-001 |
| 6.2 | Missing evidence or broken traceability reduces score appropriately. | AC-EVIDENCE-QUALITY-SCORE-4 | P0 | pass | BB-EQS-003 |
| 6.3 | PR review metadata/comments win over internal review files when they conflict. | AC-EVIDENCE-QUALITY-SCORE-6 | P0 | pass | BB-EQS-005 |
| 6.4 | Raw prompt, raw chat, full source code, and raw CI logs are not stored or exposed in the contract. | AC-EVIDENCE-QUALITY-SCORE-8 | P0 | pass | BB-EQS-007 |
| 6.5 | Score banding follows the published threshold table exactly. | AC-EVIDENCE-QUALITY-SCORE-3 | P0 | pass | BB-EQS-002 |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Observability fields such as `traceIds` and `calculatedAt` are present and useful for support / audit. | AC-EVIDENCE-QUALITY-SCORE-7, AC-EVIDENCE-QUALITY-SCORE-10 | P0 | pass | BB-EQS-001, BB-EQS-006, BB-EQS-009 |
| 7.2 | Error reporting for missing items and parse errors stays machine-readable and reviewable. | AC-EVIDENCE-QUALITY-SCORE-4, AC-EVIDENCE-QUALITY-SCORE-5 | P0 | pass | BB-EQS-003, BB-EQS-004 |
| 7.3 | Approved log evidence is redacted and does not reveal sensitive evidence content. | AC-EVIDENCE-QUALITY-SCORE-8 | P0 | pass | BB-EQS-007 |
| 7.4 | The test evidence can be reviewed without needing raw production data. | AC-EVIDENCE-QUALITY-SCORE-8 | P1 | pass | All cases |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-12 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.