# Test Plan

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29
**Author**: nk_trung
**Update date**: 2026-06-30

## 1. Purpose

Define the unit, integration, black-box, and data-shape tests that will verify the First CI Pass / Exception KPI feature once the implementation phase lands.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-FCI-1 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-2 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-3 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-4 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-5 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-FCI-6 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-FCI-7 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-8 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-FCI-9 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-FCI-10 | N/A | Added | Added | N/A | Added | N/A | Added |
| AC-FCI-11 | N/A | N/A | N/A | N/A | N/A | Added | Added |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Earliest CI run selection | P0 | Core KPI logic |
| Explicit exception extraction | P0 | Core KPI logic |
| Idempotent rerun behavior | P0 | Safety and data correctness |
| Missing-section warning handling | P0 | Trust boundary |
| Approval-role resolution | P1 | Governance correctness |
| No-raw-content persistence | P0 | Security / privacy |
| Read-only scope confirmation | P1 | Ticket boundary |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `ArtifactScannerServiceTest` | `src/test/UnitTest/.../governance/` | General artifact scan flow, in-memory fakes | Does not cover EXCEPTION_RECORD parsing or KPI computation |
| `CiRunMetadataServiceTest` | `src/test/java/.../governance/` | CI metadata fetch, permission checks, limit normalization | Does not cover first-run selection (findFirstCiRunByTicketId) |
| `SelfReviewMarkdownParserTest` | `src/test/java/.../domain/service/` | Full-document parse shape, fixture file | Does not cover EXCEPTION_RECORD-specific extraction |
| `GlobalExceptionHandlerTest` | `src/test/java/.../web/exception/` | HTTP error mapping | Not KPI-specific |

## 5. Additional Test This Time
| TC ID | test | type | target class | related AC |
|---|---|---|---|---|
| TC-FCI-1a | `computeForTicket_delegatesToRepositoryAndReturnsRun` | BE UT | `FirstCiPassKpiServiceTest` | AC-FCI-1 |
| TC-FCI-1b | `computeForTicket_noRunsFound_returnsEmpty` | BE UT | `FirstCiPassKpiServiceTest` | AC-FCI-1 |
| TC-FCI-2 | `computeForTicket_successStatus_firstPassSuccessTrue` | BE UT | `FirstCiPassKpiServiceTest` | AC-FCI-2 |
| TC-FCI-3 | `computeForTicket_failedStatus_firstPassSuccessFalse` | BE UT | `FirstCiPassKpiServiceTest` | AC-FCI-3 |
| TC-FCI-4a | `parse_withExceptionRecordSection_extractsRows` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-4 |
| TC-FCI-4b | `parse_withMultipleExceptionRows_extractsAllRows` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-4 |
| TC-FCI-5a | `exceptionKpiJdbcAdapter_queriesFactExceptionWithGovernanceFields` | DB IT | `ExceptionKpiJdbcAdapterIntegrationTest` | AC-FCI-5 |
| TC-FCI-6a | `parse_missingExceptionSection_returnsEmptyExceptionRecords` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-6 |
| TC-FCI-6b | `parse_missingExceptionSection_doesNotEmitExceptionTableWarning` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-6 |
| TC-FCI-7a | `computeForTicket_delegatesToRepositoryAndReturnsResult` | BE UT | `ExceptionKpiServiceTest` | AC-FCI-7 |
| TC-FCI-7b | `forTicket_withExceptions_returnsCorrectCounts` | BE UT | `ExceptionKpiControllerTest` | AC-FCI-7 |
| TC-FCI-7c | `forTicket_noExceptions_returnsZeroCountsDto` | BE UT | `ExceptionKpiControllerTest` | AC-FCI-7 |
| TC-FCI-8a | `computeForTicket_nonAdminCaller_throwsForbidden` | BE UT | `FirstCiPassKpiServiceTest` | AC-FCI-8 |
| TC-FCI-8b | `computeForTicket_nonAdminCaller_throwsForbidden` | BE UT | `ExceptionKpiServiceTest` | AC-FCI-8 |
| TC-FCI-9a | `v234Migration_containsUniqueIndexForIdempotentUpsert` | DB IT | `ExceptionKpiJdbcAdapterIntegrationTest` | AC-FCI-9 |
| TC-FCI-9b | `v234Migration_uniqueIndexIsPartialOnNonNullTicketId` | DB IT | `ExceptionKpiJdbcAdapterIntegrationTest` | AC-FCI-9 |
| TC-FCI-10a | `parse_emptyExceptionTable_emitsWarning` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-10 |
| TC-FCI-10b | `parse_exceptionTableWithPlaceholderRows_emitsWarning` | BE UT | `SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-10 |
| TC-FCI-11 | No FE files added (verified in self-review) | Black-box | file structure | AC-FCI-11 |

### E2E Step-by-step Scenarios

-None

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| `CiRunJdbcAdapter` first-run query (DB IT) | Logic is ORDER BY / LIMIT 1; covered by service UT via mock; DB-backed IT deferred | Low — SQL is trivial |
| `ArtifactScannerService` exception wiring | General scan flow covered by existing 1139-line test; exception-specific path covered by parser UT | Low — covered by parser UT |
| AC-FCI-11 runtime assertion | No FE files added, confirmed by file structure in self-review; JUnit test adds no value | None |
| Human review workflow | Phase 2 scope only | No runtime verification yet |

## 7. Data testing principles

- Use synthetic CI run and exception data only.
- Never use production logs or production markdown.
- Keep test fixtures small and explicit.
- Encode all text fixtures in UTF-8.
- Include both matched and unmatched approval-role text.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn test -Dtest=FirstCiPassKpiServiceTest` | AC-FCI-1, 2, 3, 8 |
| `mvn test -Dtest=ExceptionKpiServiceTest` | AC-FCI-7, 8 |
| `mvn test -Dtest=SelfReviewMarkdownParserExceptionRecordTest` | AC-FCI-4, 6, 10 |
| `mvn test -Dtest=FirstCiPassKpiControllerTest,ExceptionKpiControllerTest` | HTTP layer (AC-FCI-2, 3, 7) |
| `mvn verify -Dit.test=ExceptionKpiJdbcAdapterIntegrationTest` | AC-FCI-5, 9 |
| `mvn test` | All unit tests |
| `mvn verify` | Unit + integration (requires no Docker for IT since file-based) |

## 9. Stop Condition

- Stop if the implementation introduces a guessed route, guessed parser API, guessed column, or free-text exception inference that is not backed by the source files and spec-pack.

## 10. Required Human Decision

- Confirm whether the KPI read side will be exposed through a dedicated controller or through an existing read-model path before writing runtime code.
