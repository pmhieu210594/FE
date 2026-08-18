# Review Checklist

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung     
**Update date**: 2026-06-22

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-PARSER-SELF-REVIEW-1 | Canonical header/metadata parsing is stable and deterministic | Blocker |  |
| AC-PARSER-SELF-REVIEW-2 | Ticket identity and source path inference are correct | Major |  |
| AC-PARSER-SELF-REVIEW-3 | Canonical 11-section detection/order is respected | Blocker |  |
| AC-PARSER-SELF-REVIEW-4 | Required/recommended/optional handling matches spec-pack | Blocker |  |
| AC-PARSER-SELF-REVIEW-5 | Table parsing and AC extraction are correct | Major |  |
| AC-PARSER-SELF-REVIEW-6 | Free-text / evidence blocks are preserved as required | Major |  |
| AC-PARSER-SELF-REVIEW-7 | Verdict normalization is limited to approved values | Blocker |  |
| AC-PARSER-SELF-REVIEW-8 | Placeholder / incomplete markers are flagged correctly | Major |  |
| AC-PARSER-SELF-REVIEW-9 | Missing section / malformed table behavior matches spec | Blocker |  |
| AC-PARSER-SELF-REVIEW-10 | Idempotency via content hash is preserved | Major |  |

## 2. General System Review

### 2.1. Number/Input Check
- [X]  Clear Numeric Validation
- [X]  Full-width Numbers are Processed or Clearly Not Supported
- [X]  Half-width/Full-width Mixed Numbers are Considered
- [X]  Empty String/Null are Processed
- [X]  Clear Digit/Precision/Scale/Rounding
- [X]  No Overflow/Underflow

### 2.2. Character Type / Encoding / Locale

- [X]  Full-width/half-width/emoji/surrogate pair considered
- [X]  Clear trim rule
- [X]  Unicode normalization if needed
- [X]  No mojibake Shift-JIS/UTF-8
- [X]  Japanese/Vietnamese/English messages are not misspelled
- [X]  UTF-8 Vietnamese spec text is preserved in outputs and examples

### 2.3. Literal / Magic Number

- [X]  No hard-coded business code value
- [X]  Enum/constant/master used correctly
- [X]  Clear mapping display/internal value
- [X]  Canonical section map and alias map are fixed and reviewable

### 2.4. Operation / Maintainability

- [X]  Sufficient logs for incident investigation
- [X]  Correlation ID/request ID if needed
- [X]  Retry/double execution considered
- [X]  Clear rollback/manual recovery
- [X]  Configuration not hard-coded
- [X]  Warning/error summary is understandable without reading raw source

## 3. FE Review
- [X]  No FE change is required for this backend parser phase.
- [X]  No hidden UI dependency is introduced.
- [X]  No new client-side contract is created without explicit need.

## 4. BE/API Review
- [X]  API path is guarded and internal by default.
- [X]  Endpoint is not a generic Markdown/file reader.
- [X]  Alias heading mapping is fixed and canonical.
- [X]  Nested subsections are limited to one level under heading.
- [X]  Missing required sections result in partial parse + warning/incomplete.
- [X]  Section 9 remains optional in the current phase.

## 5. DB/Migration Review
- [X]  No schema migration is introduced in Phase 4 by accident.
- [X]  Existing snapshot/reuse-first pattern is respected.
- [X]  No extra audit table is introduced unless a later phase explicitly requires it.
- [X]  Any persistence impact is traceable to the approved design.
- [X]  Raw text is not duplicated into a new storage shape without approval.

## 6. Security/Privacy Review
- [X]  Raw content is not logged.
- [X]  No sensitive data is copied into debug output.
- [X]  Internal-only exposure remains internal by default.
- [X]  Path/input validation prevents file scope escape.
- [X]  Alias matching does not broaden the accepted attack surface.

## 7. Operation/Maintenance Review
- [X]  Parse status, warning count, and error count are observable.
- [X]  Failure paths are actionable for support or QA.
- [X]  Rollback can be done without breaking other parser flows.
- [X]  No uncontrolled proliferation of records or side effects.
- [X]  The implementation can be maintained without widening the canonical contract.

## 8. Test Review
- [X]  Canonical happy-path fixture is covered.
- [X]  Missing-section fixture is covered.
- [X]  Malformed-table fixture is covered.
- [X]  Nested-subsection boundary fixture is covered.
- [X]  Unicode / CRLF / placeholder boundary cases are covered.
- [X]  Alias-heading fixture is covered.

## 9. Documentation/Traceability Review
- [X]  Spec-pack, context, and impl-plan are aligned.
- [X]  Review checklist matches the implemented AC mapping.
- [X]  Self-review skeleton can be completed without changing the review logic.
- [X]  Human decision items are clearly separated from implementation facts.
- [X]  Source, rules, and template references are traceable.

## 10. Release/Rollback Review
- [X]  Parser can be disabled or bypassed without affecting unrelated flows.
- [X]  No rollback-blocking migration is introduced.
- [X]  Internal-default exposure is preserved.
- [X]  Release notes can describe the scope without ambiguity.
- [X]  A rollback plan exists if alias/nesting handling causes unexpected parse behavior.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |
