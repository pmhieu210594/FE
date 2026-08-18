# Review Checklist

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | Score output must always be within 0 to 100. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-2 | Breakdown must be returned and each item must be explainable. | Major | TBD |
| AC-EVIDENCE-QUALITY-SCORE-3 | Score banding must follow the fixed thresholds. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-4 | Missing artifacts or broken links must reduce the score and must not crash the pipeline. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-5 | Parse errors must be isolated and partial results must still be returned when possible. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-6 | PR review metadata/comments must be treated as the canonical review source. | Major | TBD |
| AC-EVIDENCE-QUALITY-SCORE-7 | Persisted results must be retrievable later by ticketId. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-8 | Response must not contain raw prompt, raw chat, full source code, or raw CI logs. | Blocker | TBD |
| AC-EVIDENCE-QUALITY-SCORE-9 | Same source state + same rule version must produce the same result. | Major | TBD |
| AC-EVIDENCE-QUALITY-SCORE-10 | Response must contain the downstream-ready fields defined in the spec. | Blocker | TBD |

## 2. General System Review

### 2.1. Number/Input Check
- [X] Numeric score is validated as an integer/decimal in the expected range.
- [X] Full-width numbers are either normalized or explicitly rejected.
- [X] Mixed half-width/full-width inputs are handled consistently.
- [X] Empty string / null ticketId are rejected with a clear validation error.
- [X] Precision/scale/rounding rules are explicitly defined for score and sub-scores.
- [X] No overflow/underflow can occur in score aggregation.

### 2.2. Character Type / Encoding / Locale

- [X] Full-width / half-width / emoji / surrogate pairs are considered in parser input.
- [X] Trim and normalization behavior is defined for ticketId and text fields.
- [X] Unicode normalization is applied if needed for file/path/text comparison.
- [X] No mojibake between Shift-JIS and UTF-8 can appear in the response.
- [X] Vietnamese / Japanese / English labels are not misspelled or truncated.

### 2.3. Literal / Magic Number

- [X] No hard-coded business value is duplicated across layers.
- [X] Score bands are mapped through a single canonical rule definition.
- [X] The v0 score weights are not scattered as hidden constants in multiple files.
- [X] Display values and internal values are mapped explicitly.

### 2.4. Operation / Maintainability

- [X] Sufficient logs exist for incident investigation.
- [X] Correlation ID / traceId is propagated end-to-end.
- [X] Re-run / double execution behavior is deterministic.
- [X] Clear rollback / manual recovery path exists.
- [X] Configuration is not hard-coded and can be reviewed as policy.

## 3. FE Review

- FE must not recompute the score locally.
- FE must only render the BE response and breakdown.
- FE work is out of scope for the MVP implementation ticket.
- Future dashboard binding must be able to consume `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, and `calculatedAt` without reshaping the contract.

## 4. BE/API Review

- Contract fields must match the spec-pack exactly.
- The response must include `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, and `calculatedAt`.
- PR review metadata/comments must remain the canonical review source.
- Missing artifacts and parse errors must be represented in the payload, not only in logs.
- The API should remain stable enough for direct API-tool testing.
- Same source state and same rule version must be idempotent.

## 5. DB/Migration Review

- Use the existing V4 score table and lineage/data-quality tables.
- Do not introduce a new required schema object in the MVP.
- Preserve full history plus current/latest snapshot semantics.
- Persist the score rule version with each result row.
- Ensure query patterns can read back by ticketId without losing auditability.
- Any schema change must be justified by an actual mismatch, not by convenience.

## 6. Security/Privacy Review

- Do not log or persist raw prompt, raw chat, full source code, or raw CI logs.
- Do not expose secrets or PII in the response payload.
- Do not expose review comments beyond the minimum necessary fields for the contract.
- Review-source canonicalization must not bypass permission checks.
- Actor identity should be pseudonymized where possible.
- The score must not be used for personal ranking or individual performance evaluation.

## 7. Operation/Maintenance Review

- The engine must be idempotent for the same source state and rule version.
- Partial failure must be observable and recoverable.
- Recalculation and backfill behavior must be explicit.
- Storage and query behavior must match the finalized history/latest policy.
- Rollback should be application-level first and not depend on destructive migration rollback.
- Logging must be sufficient for audit, replay, and incident triage.

## 8. Test Review

- Boundary values are verified.
- Missing artifact and broken-link behavior are verified.
- Parse-error isolation is verified.
- Persistence and read-back are verified.
- Idempotency is verified.
- Security leakage is verified.
- Negative-path cases for invalid ticketId and downstream unavailability are verified.

## 9. Documentation/Traceability Review

- spec-pack is the SSOT.
- context.md maps enough AC coverage to implementation surfaces.
- ticket-rules.md matches the finalized rules.
- impact-analysis.md and impl-plan.md are aligned with the AC table.
- test plan and black-box cases reference every AC.
- report.md can later capture release evidence without changing the contract.

## 10. Release/Rollback Review

- No destructive migration is expected in the MVP.
- Feature flag / endpoint gating should be available for rollback.
- Release is blocked if the storage contract changes unexpectedly.
- Release is blocked if the canonical review source changes without a spec update.
- Release is blocked if any raw sensitive content is introduced into logs or responses.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |