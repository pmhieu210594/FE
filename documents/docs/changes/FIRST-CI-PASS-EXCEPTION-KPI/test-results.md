# Test Results

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29  
**Author**: nk_trung
**Update date**: 2026-06-30  

## 1. Execution Environment

| item | value |
|---|---|
| OS | Windows 11 Pro |
| Java | 21 |
| Build tool | Maven (`mvn`) in the archived project environment |
| DB | Not required for UT; IT tests are file-based assertions |
| Execution status | Recorded test evidence is available; fresh compile recheck could not be reproduced in this container because Maven is not installed |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `mvn test` | PASS | Archived `test-results.md` evidence | All listed unit tests passed in the recorded run |
| `mvn verify` | PASS | Archived `test-results.md` evidence | Integration / DB evidence passed in the recorded run |
| `mvn compile` | NOT_RUN | None | Maven CLI unavailable in the current container, so compile could not be re-run here |

## 3. Summary of Results

Phase 6 test code is implemented and the recorded evidence shows the full test matrix passing for the delivered AC coverage. The only remaining verification gap in this environment is a fresh compile recheck.

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| TC-FCI-1a | `FirstCiPassKpiServiceTest#computeForTicket_delegatesToRepositoryAndReturnsRun` | PASS | — |
| TC-FCI-1b | `FirstCiPassKpiServiceTest#computeForTicket_noRunsFound_returnsEmpty` | PASS | — |
| TC-FCI-2 | `FirstCiPassKpiServiceTest#computeForTicket_successStatus_firstPassSuccessTrue` | PASS | — |
| TC-FCI-3 | `FirstCiPassKpiServiceTest#computeForTicket_failedStatus_firstPassSuccessFalse` | PASS | — |
| TC-FCI-4a | `SelfReviewMarkdownParserExceptionRecordTest#parse_withExceptionRecordSection_extractsRows` | PASS | — |
| TC-FCI-4b | `SelfReviewMarkdownParserExceptionRecordTest#parse_withMultipleExceptionRows_extractsAllRows` | PASS | — |
| TC-FCI-5a | `ExceptionKpiJdbcAdapterIntegrationTest#exceptionKpiJdbcAdapter_queriesFactExceptionWithGovernanceFields` | PASS | — |
| TC-FCI-6a | `SelfReviewMarkdownParserExceptionRecordTest#parse_missingExceptionSection_returnsEmptyExceptionRecords` | PASS | — |
| TC-FCI-6b | `SelfReviewMarkdownParserExceptionRecordTest#parse_missingExceptionSection_doesNotEmitExceptionTableWarning` | PASS | — |
| TC-FCI-7a | `ExceptionKpiServiceTest#computeForTicket_delegatesToRepositoryAndReturnsResult` | PASS | — |
| TC-FCI-7b | `ExceptionKpiControllerTest#forTicket_withExceptions_returnsCorrectCounts` | PASS | — |
| TC-FCI-7c | `ExceptionKpiControllerTest#forTicket_noExceptions_returnsZeroCountsDto` | PASS | — |
| TC-FCI-8a | `FirstCiPassKpiServiceTest#computeForTicket_nonAdminCaller_throwsForbidden` | PASS | — |
| TC-FCI-8b | `ExceptionKpiServiceTest#computeForTicket_nonAdminCaller_throwsForbidden` | PASS | — |
| TC-FCI-9a | `ExceptionKpiJdbcAdapterIntegrationTest#v234Migration_containsUniqueIndexForIdempotentUpsert` | PASS | — |
| TC-FCI-9b | `ExceptionKpiJdbcAdapterIntegrationTest#v234Migration_uniqueIndexIsPartialOnNonNullTicketId` | PASS | — |
| TC-FCI-9c | `ExceptionKpiJdbcAdapterIntegrationTest#v234Migration_addsIndexForFirstCiRunQuery` | PASS | — |
| TC-FCI-10a | `SelfReviewMarkdownParserExceptionRecordTest#parse_emptyExceptionTable_emitsWarning` | PASS | — |
| TC-FCI-10b | `SelfReviewMarkdownParserExceptionRecordTest#parse_exceptionTableWithPlaceholderRows_emitsWarning` | PASS | — |

## 5. List of Fails

| TC ID | test | cause | action | status |
|---|---|---|---|---|
| — | — | — | — | — |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| — | — | — |

## 7. Not yet fixed / Pending

- Fresh compile recheck was not reproducible in this container because Maven is not installed.
- Human review sign-off is still missing from the archive.

## 8. Test cannot be executed and reason

| TC ID | reason | risk | alternative evidence |
|---|---|---|---|
| `mvn compile` | Maven CLI is not installed in the current container | The current environment cannot independently re-verify compilation | Archived self-review and test evidence show the implementation and tests were already exercised |

## 9. Remaining risk

- The main remaining risk is build-verification reproducibility in the current container, not an identified feature failure.
- Any future source-path or import drift should be checked against the existing recorded test evidence.

## 10. Final Test Verdict

- PASS