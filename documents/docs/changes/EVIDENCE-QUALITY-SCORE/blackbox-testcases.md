# Black-box Test Cases

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung  
**Update date**: 2026-06-25  


## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-EQS-001 | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-2 | P0 | Normal | Valid ticket returns score range and explainable breakdown |
| BB-EQS-002 | AC-EVIDENCE-QUALITY-SCORE-3 | P0 | Boundary | Boundary scores map to the correct band |
| BB-EQS-003 | AC-EVIDENCE-QUALITY-SCORE-4 | P0 | Error | Missing artifact or broken traceability lowers score safely |
| BB-EQS-004 | AC-EVIDENCE-QUALITY-SCORE-5 | P0 | Error | Parse error returns partial result with parseErrors |
| BB-EQS-005 | AC-EVIDENCE-QUALITY-SCORE-6 | P0 | State | PR review metadata/comments remain the canonical review source |
| BB-EQS-006 | AC-EVIDENCE-QUALITY-SCORE-7 | P0 | State | Persisted score can be read back later without recalculation |
| BB-EQS-007 | AC-EVIDENCE-QUALITY-SCORE-8 | P0 | Security | Response and logs do not leak raw prompt/chat/source/raw CI logs |
| BB-EQS-008 | AC-EVIDENCE-QUALITY-SCORE-9 | P1 | State | Same source state and rule version produce an idempotent result |
| BB-EQS-009 | AC-EVIDENCE-QUALITY-SCORE-10 | P0 | Operation | Read path returns downstream-ready fields and stays read-only |
| BB-EQS-010 | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-7 | P1 | Error | Non-existing ticketId fails safely |

## Test Cases

### BB-EQS-001: Valid ticket returns score range and explainable breakdown

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A dummy ticket exists with complete evidence: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `blackbox-testcases.md`, `report.md`, PR metadata/comments, CI metadata, and traceability links. |
| Input | `ticketId` of the dummy ticket; default `scoreRuleVersion` (v0) if required by the API. |
| Steps | Call the score endpoint or read-back endpoint for the ticket. Inspect the returned score and breakdown items. |
| Expected Result | The response returns a score between 0 and 100. The breakdown contains at least the configured scoring criteria, each item is explainable, and the score can be understood from the returned result alone. |
| Note | Baseline happy-path case. |

### BB-EQS-002: Boundary scores map to the correct band

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-3 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Synthetic tickets or fixture states are prepared so that the final score lands exactly on the boundary values. |
| Input | Tickets that evaluate to `39`, `40`, `59`, `60`, `74`, `75`, `89`, `90`, and `100`. |
| Steps | Score each ticket and compare the returned `band`. |
| Expected Result | `0-39 -> Critical`, `40-59 -> Risky`, `60-74 -> Warning`, `75-89 -> Good`, `90-100 -> Excellent`. Boundary values must fall into the correct band without off-by-one errors. |
| Note | Boundary-value coverage for the score-band contract. |

### BB-EQS-003: Missing artifact or broken traceability lowers score safely

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-4 |
| Priority | P0 |
| Category | Error |
| Preconditions | The dummy ticket is prepared with one required artifact missing or one traceability link broken. |
| Input | `ticketId` of the affected ticket. |
| Steps | Call the score endpoint. Inspect `missing[]`, the score delta, and the returned breakdown. |
| Expected Result | The result still returns. The missing artifact or broken link is listed in `missing[]` or equivalent explainable output, and the score is reduced appropriately. The pipeline does not crash. |
| Note | Use both a missing artifact variant and a broken-link variant. |

### BB-EQS-004: Parse error returns partial result with parseErrors

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-5 |
| Priority | P0 |
| Category | Error |
| Preconditions | One source artifact is malformed or cannot be normalized, while the rest of the evidence remains valid. |
| Input | `ticketId` of the affected ticket. |
| Steps | Call the score endpoint. Inspect the `parseErrors[]` section and the rest of the response. |
| Expected Result | The response includes parse error information, and a partial score is returned when possible. The request does not fail with an unhandled crash. |
| Note | Parse failure must stay isolated from the rest of the score calculation. |

### BB-EQS-005: PR review metadata/comments remain the canonical review source

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-6 |
| Priority | P0 |
| Category | State |
| Preconditions | The ticket has both PR review metadata/comments and internal review files, and they intentionally conflict in a controlled fixture. |
| Input | `ticketId` of the conflicting fixture. |
| Steps | Call the score endpoint and inspect the review-related score items or trace references. |
| Expected Result | The score calculation follows PR review metadata/comments as the source of truth. Internal review files are treated as supporting evidence only. |
| Note | Conflicting fixture proves source precedence at black-box level. |

### BB-EQS-006: Persisted score can be read back later without recalculation

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-7 |
| Priority | P0 |
| Category | State |
| Preconditions | A score result has already been persisted for the dummy ticket. Source data is unchanged between reads. |
| Input | `ticketId` of the persisted ticket. |
| Steps | Call the read-back endpoint more than once. Compare the returned payloads. |
| Expected Result | The same persisted result is returned later by `ticketId`. The read path does not force a fresh calculation, and the result remains stable across repeated reads while source data is unchanged. |
| Note | Verifies storage + read-back contract from the outside. |

### BB-EQS-007: Response and logs do not leak raw prompt/chat/source/raw CI logs

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-8 |
| Priority | P0 |
| Category | Security |
| Preconditions | Evidence exists that is sufficient to calculate a score, and the test harness can inspect the response and approved redacted logs. |
| Input | `ticketId` of the dummy ticket. |
| Steps | Call the score endpoint and inspect the returned payload plus any approved log evidence. |
| Expected Result | The response and observable logs do not contain raw prompt, raw chat, full source code, raw CI logs, secrets, or other sensitive content. Only approved metadata and redacted references appear. |
| Note | This is a black-box privacy gate, not an implementation-detail check. |

### BB-EQS-008: Same source state and rule version produce an idempotent result

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-9 |
| Priority | P1 |
| Category | State |
| Preconditions | The dummy ticket source state is unchanged and the same rule version is used for each run. |
| Input | `ticketId` plus the same `scoreRuleVersion` for each call. |
| Steps | Call the score endpoint twice without changing any source data. Compare the outputs. |
| Expected Result | The score, band, breakdown shape, missing items, and parse errors remain consistent for the same inputs. |
| Note | Idempotency check at the contract level. |

### BB-EQS-009: Read path returns downstream-ready fields and stays read-only

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-10 |
| Priority | P0 |
| Category | Operation |
| Preconditions | A persisted score snapshot exists for the dummy ticket. |
| Input | `ticketId` of the persisted ticket. |
| Steps | Call the read-back API that dashboard consumers will use. Inspect the response shape and observe whether the call triggers a recalculation. |
| Expected Result | The response includes the downstream-ready fields: `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, and `calculatedAt` or equivalent. The read path remains read-only and does not trigger a fresh calculation on open. |
| Note | Covers the dashboard consumption viewpoint. |

### BB-EQS-010: Non-existing ticketId fails safely

| item | content |
|---|---|
| Related AC | AC-EVIDENCE-QUALITY-SCORE-1, AC-EVIDENCE-QUALITY-SCORE-7 |
| Priority | P1 |
| Category | Error |
| Preconditions | The ticketId does not exist in the test dataset. |
| Input | A dummy non-existing `ticketId`. |
| Steps | Call the score endpoint or read-back endpoint with the non-existing ticketId. |
| Expected Result | The API returns a safe validation / not-found style response and does not crash. No persisted score is created for the missing ticket. |
| Note | Covers non-existing ID behavior at the black-box level. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [ ] Permission difference
- [x] State transition
- [x] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [ ] Empty/null
- [ ] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [x] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [x] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output

## AC to Black-box Mapping

| AC | Covered by black-box cases | Notes |
|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | BB-EQS-001, BB-EQS-010 | Happy-path and safe handling for missing ticketId. |
| AC-EVIDENCE-QUALITY-SCORE-2 | BB-EQS-001 | Breakdown explainability. |
| AC-EVIDENCE-QUALITY-SCORE-3 | BB-EQS-002 | Boundary thresholds and band mapping. |
| AC-EVIDENCE-QUALITY-SCORE-4 | BB-EQS-003 | Missing artifact / broken link reduction. |
| AC-EVIDENCE-QUALITY-SCORE-5 | BB-EQS-004 | Parse-error isolation and partial result. |
| AC-EVIDENCE-QUALITY-SCORE-6 | BB-EQS-005 | Canonical review source precedence. |
| AC-EVIDENCE-QUALITY-SCORE-7 | BB-EQS-006, BB-EQS-010 | Read-back and safe missing-ticket behavior. |
| AC-EVIDENCE-QUALITY-SCORE-8 | BB-EQS-007 | Raw-data leakage prevention. |
| AC-EVIDENCE-QUALITY-SCORE-9 | BB-EQS-008 | Idempotent same-input result. |
| AC-EVIDENCE-QUALITY-SCORE-10 | BB-EQS-009 | Downstream-ready fields and read-only operation. |