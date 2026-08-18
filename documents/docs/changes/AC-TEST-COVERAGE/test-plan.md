# Test Plan

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-29  

## 1. Purpose

Backend-only verification plan for AC-Test Coverage. This phase focuses on parser rules, planned/executed coverage linkage, warning persistence, and read-model-safe regressions. FE, black-box, and manual mapping are intentionally out of scope.

## 2. AC Matrix -> Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-TEST-COVERAGE-1 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-2 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-3 | N/A | Added | N/A | N/A | Added | N/A | N/A |
| AC-TEST-COVERAGE-4 | N/A | Added | N/A | N/A | Added | N/A | N/A |
| AC-TEST-COVERAGE-5 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-6 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-7 | N/A | Added | N/A | N/A | Added | N/A | N/A |
| AC-TEST-COVERAGE-8 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-9 | N/A | Added | N/A | N/A | N/A | N/A | N/A |
| AC-TEST-COVERAGE-10 | N/A | Added | N/A | N/A | N/A | N/A | N/A |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| AC extraction and key stability from `spec-pack.md` | P0 | Canonical AC source of truth. |
| Planned coverage extraction from `test-plan.md` | P0 | Canonical planned coverage source. |
| Executed evidence extraction from `test-results.md` | P0 | Canonical execution source. |
| Missing / untested / partial semantics | P0 | Core dashboard behavior. |
| Warning and data-quality persistence | P0 | Auditability requirement. |
| Idempotent reparse and no duplication | P0 | Regression safety. |
| `First CI Pass` / `Exception` KPI support | P1 | Supporting KPI concern. |
| AC-first grouping for ticket read model | P1 | Read-model presentation concern. |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `ArtifactScannerServiceTest.ticket_scoped_scan_parses_spec_pack_and_records_parse_results` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | AC extraction from `spec-pack.md` and persistence of parsed AC rows | Runtime verification still pending. |
| `SpecPackMarkdownParserTest.parse_actualRepositorySpecPack_coversCoreEnvelopeAndCounts` | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Numbered AC extraction, section counting, and parsed summary coverage | Runtime verification still pending. |
| `TestPlanParseServiceTest.coverage_partial_when_specpack_ac_not_in_matrix` / `coverage_success_when_all_specpack_acs_present_in_matrix` / `planned_test_cases_seeded_from_section5_with_tc_id` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestPlanParseServiceTest.java` | Planned coverage source, missing/partial semantics, and planned test case persistence | Runtime verification still pending. |
| `TestResultsParseServiceTest.parse_coverage_uses_pass_list_only_not_summary_or_fail_sections` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java` | Executed-evidence source, pass-list-only coverage rule | Runtime verification still pending. |
| `TestCoverageValidationServiceTest.validateCoverage_reportsAllMissing_whenMatrixIsEmpty` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationServiceTest.java` | Missing-reference validation for empty matrix | New helper coverage in this phase. |
| `TestEvidenceJdbcAdapterTest.upsertExecutedCoverageRows_writes_test_case_and_coverage_rows` | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` | AC->test case -> executed coverage persistence | Runtime verification still pending. |
| `EvidenceQualityScoreRepositoryAdapterTest.loadTestSignal_ignores_planned_coverage_rows_when_counting_executed_coverage` | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java` | Read-model exclusion of PLANNED rows | Runtime verification still pending. |
| `EvidenceQualityScoreServiceTest.recalculate_full_snapshot_returns_excellent_and_final` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | Coverage-related KPI/read-model breakdown, including test linkage and CI linkage | Strengthened with explicit linkage assertions in this phase. |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-AC-TEST-COVERAGE-1 | Validate coverage helper returns no warnings when all spec ACs are covered | BE UT | `TestCoverageValidationService.validateCoverage_returnsNoWarnings_whenAllSpecAcsAreCovered` | AC-TEST-COVERAGE-1, AC-TEST-COVERAGE-9 |
| TC-AC-TEST-COVERAGE-2 | Validate missing and unknown references are emitted in stable order | BE UT | `TestCoverageValidationService.validateCoverage_reportsMissingAndUnknownReferences_inStableOrder` | AC-TEST-COVERAGE-3, AC-TEST-COVERAGE-10 |
| TC-AC-TEST-COVERAGE-3 | Validate all spec ACs are reported when matrix coverage is empty | BE UT | `TestCoverageValidationService.validateCoverage_reportsAllMissing_whenMatrixIsEmpty` | AC-TEST-COVERAGE-3 |
| TC-AC-TEST-COVERAGE-4 | Delete-planned-row path with an empty AC list does not insert rows | DB/Migration regression | `TestEvidenceJdbcAdapterTest.replacePlannedCoverage_withEmptyAcList_deletes_planned_rows_without_inserts` | AC-TEST-COVERAGE-3, AC-TEST-COVERAGE-4 |
| TC-AC-TEST-COVERAGE-5 | Executed coverage row mapping resolves PASSED / FAILED / UNKNOWN correctly | DB/Migration regression | `TestEvidenceJdbcAdapterTest.updateExecutedCoverageFromJunction_maps_success_failed_and_unknown_statuses` | AC-TEST-COVERAGE-6, AC-TEST-COVERAGE-7 |
| TC-AC-TEST-COVERAGE-6 | CI metadata is embedded into test-result summary for supporting evidence | BE UT | `TestResultsParseServiceTest.parse_embeds_ci_run_metadata_when_available` | AC-TEST-COVERAGE-6, AC-TEST-COVERAGE-8 |

### E2E Step-by-step Scenarios

- This feature does not include E2E.

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| FE rendering | No FE changes in this phase | Medium |
| Final runtime dashboard response | No new dashboard API is being added in this phase | Medium |
| Production CI connectors | Requires later-phase environment wiring | Medium |
| Manual mapping / pinning | Explicitly out of scope | None (by decision) |
| Black-box parser verification | Not part of the backend-only phase | Low |

## 7. Data testing principles

Use only synthetic tickets, synthetic AC keys, synthetic test plans, and synthetic result rows. Do not use production tickets, production CI logs, production tokens, raw prompt/chat text, or any full source text outside the allowed parser metadata model.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn -q -Dtest=TestCoverageValidationServiceTest,TestPlanParseServiceTest,TestResultsParseServiceTest,TestEvidenceJdbcAdapterTest,EvidenceQualityScoreRepositoryAdapterTest,EvidenceQualityScoreServiceTest,ArtifactScannerServiceTest,SpecPackMarkdownParserTest test` | Run the targeted BE regression slice for AC-Test Coverage. |

## 9. Stop Condition

- A test requires production data, production secrets, or raw source text outside the allowed metadata scope.
- A test assumes a manual mapping feature that the ticket explicitly forbids.
- A test requires a new table or new runtime API before the phase definition changes.
- A test requires FE-side recomputation of business coverage.
- A test cannot be validated because Maven is unavailable in the execution environment.

## 10. Required Human Decision

- None in Phase 6. The main human decisions were already finalized in Phase 1 and reflected in the current test coverage.