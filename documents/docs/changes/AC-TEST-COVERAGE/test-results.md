# Test Results

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-29  

## 1. Execution Environment

| item | value |
|---|---|
| Status | PASS |
| Environment | Maven-enabled BE regression slice completed successfully. |
| Data set | Synthetic only |
| Runtime backend | Executed successfully |
| Runtime frontend | Out of scope |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `mvn -q -Dtest=TestCoverageValidationServiceTest,TestPlanParseServiceTest,TestResultsParseServiceTest,TestEvidenceJdbcAdapterTest,EvidenceQualityScoreRepositoryAdapterTest,EvidenceQualityScoreServiceTest,ArtifactScannerServiceTest,SpecPackMarkdownParserTest test` | PASS | `Tests run: 298, Failures: 0, Errors: 0, Skipped: 0` | Targeted BE regression slice completed successfully. |

## 3. Summary of Results

The BE regression slice validated the AC coverage helper, planned/executed coverage parsing, the executed-coverage adapter path, CI metadata support in the test-results summary, and the score/read-model linkage that ignores `PLANNED` rows. All targeted tests passed with zero failures.

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| TC-AC-TEST-COVERAGE-1 | Validate coverage helper returns no warnings when all spec ACs are covered | PASS | |
| TC-AC-TEST-COVERAGE-2 | Validate missing and unknown references are emitted in stable order | PASS | |
| TC-AC-TEST-COVERAGE-3 | Validate all spec ACs are reported when matrix coverage is empty | PASS | |
| TC-AC-TEST-COVERAGE-4 | Delete-planned-row path with an empty AC list does not insert rows | PASS | |
| TC-AC-TEST-COVERAGE-5 | Executed coverage row mapping resolves PASSED / FAILED / UNKNOWN correctly | PASS | |
| TC-AC-TEST-COVERAGE-6 | CI metadata is embedded into test-result summary for supporting evidence | PASS | |

## 5. List of Fails

| TC ID | test | cause | action | status |
|---|---|---|---|---|
| N/A | N/A | N/A | N/A | N/A |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| Missing direct coverage-helper UT for `TestCoverageValidationService` | Added `TestCoverageValidationServiceTest` with missing / unknown / reference-order coverage cases | `src/test/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationServiceTest.java` |
| Test-results parser did not explicitly prove CI metadata support in the summary artifact | Added `parse_embeds_ci_run_metadata_when_available` | `src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java` |
| Planned/executed coverage adapter behavior did not explicitly cover delete-only and status-mapping paths | Added adapter regression tests for empty-plan deletion and status mapping | `src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` |
| KPI/read-model coverage assertions were not explicit enough | Strengthened `EvidenceQualityScoreServiceTest` with linkage assertions | `src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` |

## 7. Not yet fixed / Pending

- None for the targeted BE regression slice.

## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| N/A | N/A | N/A | N/A |

## 9. Remaining risk

- FE/runtime dashboard verification is still out of scope for this backend-only slice.
- The parser-to-executed-coverage invocation is verified at the adapter level, but not as a full end-to-end parse-to-read-model path in this slice.
- Coverage-warning semantics for fail-only AC references remain a documented limitation of the current validation rule.

## 10. Final Test Verdict

- PASS
