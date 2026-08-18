# Review Checklist

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-TEST-COVERAGE-1 | AC must be extracted from `spec-pack.md` into a stable AC key without inventing a new key format. | Blocker | TODO |
| AC-TEST-COVERAGE-2 | `test-plan.md` must be the only planned coverage source; manual mapping/pinning must not be introduced. | Blocker | TODO |
| AC-TEST-COVERAGE-3 | An AC without any mapped test case must be shown as `MISSING`. | Major | TODO |
| AC-TEST-COVERAGE-4 | An AC with planned coverage but no executed evidence must be shown as `UNTESTED`. | Major | TODO |
| AC-TEST-COVERAGE-5 | Partial coverage must be represented as `PARTIAL` when the AC is not fully covered. | Major | TODO |
| AC-TEST-COVERAGE-6 | `test-results.md` and `CI summary` must only act as supporting evidence for pass/fail confirmation. | Major | TODO |
| AC-TEST-COVERAGE-7 | The dashboard/read model must show coverage in the `AC -> test cases` direction at ticket scope. | Major | TODO |
| AC-TEST-COVERAGE-8 | `First CI Pass` and `Exception` must be computed as supporting KPI fields in the MVP. | Minor | TODO |
| TEST-COVERAGE-9 | Manual mapping/pinning must remain unsupported in the MVP and must not appear as a fallback path. | Blocker | TODO |
| AC-TEST-COVERAGE-10 | Warning/data-quality issues must be persisted when parsing or linkage confidence is insufficient. | Major | TODO |

## 2. General System Review

### 2.1. Number/Input Check
- [X] Clear numeric validation is defined for coverage counters and KPI values.
- [X] Empty string / null handling is explicit for missing AC/test/evidence fields.
- [X] Percent / ratio scale is defined clearly for coverage and confidence values.
- [X] No overflow / underflow risk exists in aggregation or score calculation.

### 2.2. Character Type / Encoding / Locale

- [X] Full-width / half-width / emoji / surrogate pair handling is considered for markdown text.
- [X] Trim rule is explicit for AC text, test title, and evidence text.
- [X] Unicode normalization is handled if the parser depends on text matching.
- [X] No mojibake risk exists when reading UTF-8 markdown files.
- [X] Vietnamese / Japanese / English content is preserved correctly in output and logs.

### 2.3. Literal / Magic Number

- [X] No hard-coded business code value is introduced for statuses or KPI states.
- [X] Enums / constants / master data are used consistently.
- [X] Display value and internal value mapping are explicit.
- [X] Confidence thresholds, if any, are centralized and documented.

### 2.4. Operation / Maintainability

- [X] Sufficient logs exist for coverage parsing, linkage, and warning investigation.
- [X] Correlation / trace ID is available where the flow needs it.
- [X] Re-run / idempotency behavior is defined for repeated parsing.
- [X] Clear rollback / recovery behavior exists when evidence is incomplete.
- [X] Configuration values are not hard-coded in parser or read-model logic.

## 3. FE Review

- [X] The Dashboard surface is read-only and does not expose manual mapping/pinning.
- [X] The ticket-level coverage view groups rows by AC first, then nests linked test cases.
- [X] Status labels (`MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN`) are rendered consistently.
- [X] Empty / loading / error states are handled in the read surface.
- [X] i18n keys are used if the FE surface renders labels or messages.

## 4. BE/API Review

- [X] AC extraction is sourced from `spec-pack.md` and not inferred from unrelated files.
- [X] The planned coverage parser reads `test-plan.md` as the only source of planned mappings.
- [X] Executed evidence comes from `test-results.md` and supporting CI metadata only.
- [X] `FAILED` overrides `PASSED` when conflicting evidence exists in the same evaluation window.
- [X] The API/read model response contains sufficient fields for AC-first rendering.
- [X] No unsupported manual override endpoint or ad-hoc mapping API is introduced.

## 5. DB/Migration Review

- [X] Existing schema is reused first; no unnecessary new table is introduced.
- [X] Coverage / warning / evidence fields are mapped to actual persisted columns or views.
- [X] Migration impact is explicit if a field cannot be represented by the current schema.
- [X] Read-model persistence stays consistent with repository / view conventions.

## 6. Security/Privacy Review

- [X] Raw prompt/chat content is not stored in analytics or coverage persistence.
- [X] Full markdown source text is not unnecessarily duplicated in DB.
- [X] Logs do not expose secrets, tokens, or sensitive internal content.
- [X] Access control for the Dashboard/read surface is appropriate for internal use.

## 7. Operation/Maintenance Review

- [X] Warning and data-quality messages are understandable for Data Ops / dev investigation.
- [X] Re-processing the same input does not create duplicate or contradictory state.
- [X] The flow remains debuggable when `CI summary` is absent or weakly linked.
- [X] Rollback / manual recovery behavior is defined for incomplete coverage data.

## 8. Test Review

- [X] There is a test for AC extraction from `spec-pack.md`.
- [X] There is a test for planned coverage sourced only from `test-plan.md`.
- [X] There is a test for `MISSING` when no mapped test case exists.
- [X] There is a test for `UNTESTED` when planned coverage exists but evidence does not.
- [X] There is a test for `PARTIAL` coverage.
- [X] There is a test for supporting evidence precedence and `FAILED` override.
- [X] There is a test for `First CI Pass` / `Exception` KPI fields if they are emitted.
- [X] There is a test for warning persistence when linkage confidence is weak.

## 9. Documentation/Traceability Review

- [X] `spec-pack.md`, `context.md`, `impact-analysis.md`, and `impl-plan.md` are consistent.
- [X] `review-checklist.md` and `self-review.md` match the implementation scope.
- [X] Traceability from AC to tests / evidence is explicit.
- [X] Any assumption or AI inference is documented somewhere in the ticket artifacts.

## 10. Release/Rollback Review

- [X] Release does not depend on manual mapping or hidden operator intervention.
- [X] Rollback can return the read model to the previous state without data corruption.
- [X] If evidence is incomplete, the system degrades to `MISSING` / `UNTESTED` / `UNKNOWN` instead of failing silently.
- [X] No unrelated dashboard component is impacted by this ticket.

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |
