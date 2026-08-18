# Self Review

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## 1. Implementation Summary

Implemented the smallest backend-only delta needed to connect executed test evidence back to AC coverage without introducing a new workflow or table.

The final scope is:
- persist executed coverage rows from `test-results.md` parsing into the existing evidence tables,
- keep planned coverage and executed coverage separate,
- make the executed-coverage write path idempotent,
- keep planned coverage from inflating executed coverage counts in the read model,
- extend unit tests around adapter, parser, and read-model behavior,
- leave FE and manual mapping out of scope.

## 2. Specification/AC Matching

| AC ID | status | evidence |
|---|---|---|
| AC-TEST-COVERAGE-1 | PASS | AC extraction and downstream AC key usage stay anchored to `spec-pack.md` via the existing parser flow and test fixtures. |
| AC-TEST-COVERAGE-2 | PASS | Planned coverage still comes from `test-plan.md` through `replacePlannedCoverage(...)`; no manual mapping path was added. |
| AC-TEST-COVERAGE-3 | PASS | ACs with no planned test case remain `MISSING` in the coverage model; no fallback mapping was introduced. |
| AC-TEST-COVERAGE-4 | PASS | Executed coverage rows now come from `TestResultsParseService`, and planned rows are excluded from executed counts in `EvidenceQualityScoreRepositoryAdapter`. |
| AC-TEST-COVERAGE-5 | PASS | Partial coverage semantics remain intact in the existing coverage model; no rule change was introduced. |
| AC-TEST-COVERAGE-6 | PASS | `test-results.md` is used as executed evidence input, while CI/supporting metadata remains supporting-only in the current flow. |
| AC-TEST-COVERAGE-7 | PASS | The read-model path remains AC-first at ticket scope because the coverage adapter now persists AC-linked executed rows for downstream aggregation. |
| AC-TEST-COVERAGE-8 | PASS | Existing KPI/read-model aggregation remains available, and the executed coverage write path does not fork the score logic. |
| AC-TEST-COVERAGE-9 | PASS | No manual mapping/pinning path was added. |
| AC-TEST-COVERAGE-10 | PASS | Warning/data-quality handling was preserved; the implementation does not swallow parse issues or replace them with silent fallback. |

## 3. List of Changed Files

| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java` | Added executed coverage persistence contract and record model. | Needed a port-level API for executed AC coverage rows. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Built executed coverage records from result tables and forwarded them to persistence. | Connect parsed test results to AC-linked evidence. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | Upserted executed coverage rows into existing fact tables with idempotent test-case identity. | Persist executed evidence without introducing new schema. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Excluded planned coverage rows from executed-coverage counting. | Prevent planned rows from being misread as executed evidence. |
| `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` | Added persistence verification for executed coverage rows. | Protect adapter behavior with unit coverage. |
| `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java` | Added coverage-counting regression test for planned rows. | Protect read-model semantics. |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java` | Added coverage extraction test for AC refs in result tables. | Protect parser-to-evidence wiring. |
| `docs/changes/AC-TEST-COVERAGE/self-review.md` | Filled final self-review evidence. | Required phase-5 documentation. |
| `docs/changes/AC-TEST-COVERAGE/handoff.md` | Added transfer note for independent review and human review. | Required phase-5 handoff. |

## 4. Run Command and Results

| command | result | note |
|---|---|---|
| `mvn "test" "-Dtest=TestEvidenceJdbcAdapterTest,EvidenceQualityScoreRepositoryAdapterTest,TestResultsParseServiceTest"` | PASS | 16 tests run, 0 failures, 0 errors. |

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| Specification / AC matching | PASS | Changes stayed inside the spec-pack scope and did not add manual mapping, FE recompute, or a new table. |
| General system review | PASS | Numeric, text, and idempotency behavior stayed within existing model constraints; no overflow or locale-sensitive logic was added. |
| FE review | PASS | No FE changes were introduced; the ticket remains backend/read-model only. |
| BE / API review | PASS | Added only the smallest port/service/adapter glue needed for executed coverage persistence. |
| DB / migration review | PASS | Reused existing tables and queries; no migration was added. |
| Security / privacy review | PASS | No raw prompt/chat/source text was persisted; only metadata and coverage linkage were written. |
| Operation / maintenance review | PASS | Reparse behavior is idempotent at the coverage row level and remains debuggable through existing traceable fields. |
| Test review | PASS | Targeted BE tests cover adapter writes, parser wiring, and read-model counting. |
| Documentation / traceability review | PASS | Self-review now matches the implemented scope and the diff stays aligned with the impl-plan. |
| Release / rollback review | PASS | Rollback remains documentation-level for this phase; no schema migration or destructive change was introduced. |

## 6. Test Plan Corresponding Status

- PASS: AC extraction and planned coverage source are preserved through the existing parser flow.
- PASS: Executed evidence is now linked from `test-results.md` rows into persisted coverage records.
- PASS: Planned coverage no longer contributes to executed coverage counts.
- PASS: Manual mapping / FE recompute remains out of scope.
- NOT_RUN: Full FE rendering / dashboard visual verification, because this phase is backend-only.

## 7. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| Planned coverage was being counted as executed coverage in the read model. | The aggregation query did not exclude `PLANNED` rows. | Filtered coverage counts to exclude `PLANNED` statuses. | `EvidenceQualityScoreRepositoryAdapterTest.loadTestSignal_ignores_planned_coverage_rows_when_counting_executed_coverage` |
| Executed coverage had no persistence contract. | The port only supported planned coverage and test runs. | Added `upsertExecutedCoverageRows(...)` and the corresponding record type. | `TestEvidenceJdbcAdapterTest.upsertExecutedCoverageRows_writes_test_case_and_coverage_rows` |
| Parser tests failed because test-run persistence returned `null` in mocks. | New service logic now depends on the persisted test-run result. | Stubbed `upsertTestRun(...)` to return the provided record in unit tests. | `TestResultsParseServiceTest.parse_executes_coverage_rows_for_ac_references_in_result_tables` |
| Duplicate `TestResultsParseServiceTest` sources caused a collision during test compilation. | The class existed in both `src/test/java` and `src/test/UnitTest/java`. | Removed the duplicate test source and kept the canonical `UnitTest` version. | Maven test compile + targeted test run |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| FE dashboard rendering not verified in-browser | No FE changes were made in this phase. | Low for backend release, medium for UX verification. | FE reviewer | Before any UI-facing follow-up. |
| Full end-to-end CI evidence linkage not yet exercised | Current validation is unit-test level and targeted. | Medium for later integration hardening. | BE reviewer | Next test-hardening pass. |

## 9. Exception Record

No process exception (security scan disable, CI skip, review bypass, etc.) was used to close this ticket; the targeted BE regression slice and review chain in Sections 4–5 ran without a bypass.

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| N/A | N/A | No exception was needed for this ticket | N/A | N/A | N/A | N/A | RESOLVED |

## 10. AI-generated Predictions

- Inference: planned coverage rows should not be counted as executed coverage.
- Confirmed by source code and tests: `EvidenceQualityScoreRepositoryAdapter` excludes `PLANNED` rows from executed coverage counts.
- Inference: executed coverage rows need a stable test-case identity for reruns.
- Confirmed by source code and tests: `TestEvidenceJdbcAdapter` now derives a deterministic test-case id from ticket + test case key + AC reference.

## 11. Items reviewed by humans

- Verify the downstream Dashboard surface renders the AC-first grouping exactly as expected.
- Verify any future FE work does not reintroduce manual mapping or client-side recompute.
- Verify the read-model metrics in a staging-like dataset if the next phase expands beyond unit coverage.

## 12. Final Self-Verdict

- PASS
