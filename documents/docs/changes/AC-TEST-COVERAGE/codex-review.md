# Codex Independent Review

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-29  

## Review Input

| artifact/source | status |
|---|---|
| docs/changes/AC-TEST-COVERAGE/spec-pack.md | reviewed |
| docs/changes/AC-TEST-COVERAGE/impl-plan.md | reviewed |
| docs/changes/AC-TEST-COVERAGE/review-checklist.md | reviewed |
| docs/changes/AC-TEST-COVERAGE/self-review.md | reviewed |
| .claude/rules/ | reviewed |
| EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java | reviewed |
| EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java | reviewed |
| EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java | reviewed |
| EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java | reviewed |
| EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java | reviewed |
| EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java | reviewed |
| EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java | reviewed |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| B-1 | EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java; EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java | The test-results parse flow does not materialize executed AC coverage into `tbl_fact_ac_test_coverage`, so the Dashboard/read model still sees only planned coverage. This is a direct AC gap for the goal of connecting executed test evidence back to AC coverage. | `parseAndStore(...)` (lines 176-184) only calls `persistTestRun(...)`, `persistEvidenceEvent(...)`, `persistDataQuality(...)` and does not write executed coverage; `persistTestRun(...)` (lines 565-590) only upserts test run + updates test case results; `loadTestSignal(...)` (lines 572-609) reads coverage from `tbl_fact_ac_test_coverage` and excludes `PLANNED`. The spec requires test-results to be executed evidence and the dashboard to reflect AC -> test cases (`spec-pack.md` lines 62-66, 77-80, 106-115). | After parsing test-results, add a step to write executed coverage (for example, call `updateExecutedCoverageFromJunction(...)` or an equivalent mechanism) so coverage rows with `PASSED`/`FAILED`/`UNKNOWN` are materialized into `tbl_fact_ac_test_coverage`; add an integration test to verify the read model changes based on test-results. | BE IT: parse a `test-results.md` containing ACs in pass/fail rows, verify `tbl_fact_ac_test_coverage` has rows where `coverage_status != PLANNED`, and verify `EvidenceQualityScoreRepositoryAdapter.loadTestSignal()` increments the executed coverage count correctly. |

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| M-1 | EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java | Coverage validation currently derives AC IDs only from `list_of_passes`, so ACs that appear only in `list_of_fails` are marked `AC_NOT_COVERED` even though they are still executed evidence. This makes the `FAILED` vs `PASSED` semantics incorrect and produces misleading coverage warnings. | `parseAndStore(...)` (lines 162-175) calls `validateCoverage(specPackAcKeys, resultAcIds)` with `resultAcIds = extractAcIds(parsed.fieldValues().get("list_of_passes"))`; meanwhile `persistTestRun(...)` and `buildTestCaseResults(...)` (lines 593-643) already parse both pass and fail rows into executed test results. The spec states that `test-results.md` is the source of executed evidence and that fail overrides pass (`spec-pack.md` lines 77-80). | Feed AC IDs from both pass and fail rows (and skipped, if needed) into the linkage/validation step, while keeping rule precedence so `FAILED` still overrides `PASSED`. Add a unit test for the case where an AC appears only in fail rows and is not reported as `AC_NOT_COVERED`. | BE UT: use a source where an AC appears only in `list_of_fails`, verify there is no `AC_NOT_COVERED:<AC>` warning, and verify the final status is still `FAILED` when conflicting evidence exists. |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| MIN-1 | EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java | `upsertExecutedCoverageRows(...)` is a public port method, but the implementation only upserts `tbl_fact_test_case` and ignores the `coverageStatus`, `acReference`, and `artifactSnapshotId` fields of `ExecutedCoverageRecord`. The contract name and the actual behavior do not match, which can confuse future callers and lead to regressions. | `TestEvidencePersistencePort.java` lines 46-85 define `ExecutedCoverageRecord` with `coverageStatus` and `acReference`; `TestEvidenceJdbcAdapter.java` lines 301-392 only insert/update `tbl_fact_test_case` and return the record, without persisting the coverage table or AC linkage. | Either rename the contract to match its real purpose, or persist the executed coverage fields into the coverage table; add a unit test that locks down the contract so callers do not misunderstand it. |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| Q-1 | Should executed coverage rows for AC-Test Coverage be materialized immediately in the test-results parse flow, or in a separate downstream job/flow? | `spec-pack.md` sections 5, 6.1, 12 | The canonical flow must be decided to prevent the dashboard from showing only planned coverage. |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-1 | The `test-results.md` parser stores CI metadata as an ISO string instead of a `OffsetDateTime` object | This is not a real review bug; the code intentionally serializes metadata to a JSON string to avoid serialization issues and keep the artifact stable. |

## Missing Evidence

- No BE/IT test was found that proves parsing `test-results.md` changes `tbl_fact_ac_test_coverage` or the read model `ac_coverage_count` based on executed evidence.
- No test covers the case where an AC appears only in `list_of_fails` but is not treated as `AC_NOT_COVERED`.

## Suspicious Assumptions

- It is assumed that executed coverage will be updated in another flow, but in the current diff there is no caller for `updateExecutedCoverageFromJunction(...)`.
- It is assumed that persisting only `tbl_fact_test_case` is enough for the dashboard, while the current read model reads coverage from `tbl_fact_ac_test_coverage`.

## Required Human Decisions

- Confirm whether executed coverage must be materialized in this ticket or deferred to a later phase.
- Confirm whether coverage validation should treat fail rows as executed evidence or only pass rows.

## Final Verdict

- PASS