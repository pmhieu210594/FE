# Test Plan

**Ticket ID**: EVIDENCE-QUALITY-SCORE       
**Create date**: 2026-06-23   
**Author**: nk_trung             
**Update date**: 2026-06-24

## 1. Purpose

Prepare the verification matrix for the Evidence Quality Score MVP. This ticket focuses on BE contract, persistence, boundary handling, and traceability; FE rendering is downstream and out of scope. The phase currently relies on BE unit and contract tests, with no live API/DB integration run in this pass.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-2 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-3 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-4 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-5 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-6 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-7 | N/A | Added | N/A | Added | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-8 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-9 | N/A | Added | N/A | N/A | N/A | N/A | Added |
| AC-EVIDENCE-QUALITY-SCORE-10 | N/A | Added | N/A | Added | N/A | N/A | Added |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Score range / band mapping | P0 | Core contract and boundary behavior. |
| Missing artifact / parse error handling | P0 | Must fail safe. |
| Canonical review source behavior | P0 | Review source of truth must remain stable. |
| Persistence / read-back | P0 | Result must be queryable later. |
| Response redaction | P0 | Security and privacy gate. |
| Recalculation idempotency | P1 | Prevent drift and duplicate score logic. |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `EvidenceQualityScoreModelsTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java` | Score band thresholds | No persistence or source coverage. |
| `EvidenceQualityScoreServiceTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | Score range, missing data, parse error isolation, staleness, invalid ticket | No adapter serialization yet. |
| `EvidenceQualityScoreControllerTest` | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/EvidenceQualityScoreControllerTest.java` | Request/response mapping and default rule version | No persistence read-back. |
| `GithubWorkflowJobWebhookServiceTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookServiceTest.java` | CI completion trigger into the score service | Does not prove score persistence itself. |
| `SpecPackMarkdownParserTest` | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | AC parsing and CRLF/LF behavior | Parser coverage only, not scoring. |
| `SelfReviewMarkdownParserTest` | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | Self-review parsing, warnings, errors | Parser coverage only, not scoring. |
| `TestResultsParseServiceTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java` | Test-results parsing and partial-result behavior | Parser coverage only, not scoring. |

## 5. Additional Test This Time
| test | type | target | related AC |
|---|---|---|---|
| EvidenceQualityScoreMapperContractTest | BE UT / Contract | read persisted row into `ScoreResult` and preserve breakdown / lineage / parse errors | AC-7, AC-10 |
| EvidenceQualityScoreRepositoryAdapterTest | BE UT / Persistence boundary | persist score rows, actor normalization, lineage inserts, and rule version | AC-7, AC-8, AC-9 |

### E2E Step-by-step Scenarios

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| E2E-001 | A ticket has full evidence and linked PR/CI/test/report data | Call score endpoint for the ticket | Score is returned with band and breakdown | AC-1,2,3,10 |
| E2E-002 | A ticket is missing `test-results.md` and has a broken CI link | Call score endpoint for the ticket | Score decreases, missing items are listed, pipeline does not crash | AC-4,5 |
| E2E-003 | A ticket has PR review metadata/comments plus internal review files | Call score endpoint for the ticket | PR review metadata/comments remain canonical | AC-6 |
| E2E-004 | A persisted score row already exists | Call latest endpoint for the ticket | Read-back returns the same downstream-ready contract | AC-7,10 |

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| FE dashboard rendering | FE implementation is out of scope for this ticket | Future UI binding risk only. |
| Black-box runtime execution | The pass focused on unit and contract evidence and did not invoke a separate black-box harness | Some end-to-end user-flow regression remains unobserved. |
| Live API integration against Postgres | No DB/container-backed pass was executed in this phase | Persistence SQL path is covered only by unit-level adapter/mapper assertions. |
| Customer-facing PDF/Excel report | Explicitly out of scope in the MVP | No risk for current BE-only ticket. |
| Formula-governance UI | Deferred by Phase 1 decisions | Governance UI/API will be a later ticket. |

## 7. Data testing principles

- Use dummy ticket IDs, dummy PR IDs, dummy CI IDs, and dummy report IDs only.
- Do not use raw production data.
- Do not use raw prompt/chat or secret-containing payloads.
- Keep fixtures deterministic and small.
- Prefer one source row per concern when asserting persistence or mapping behavior.
- Include boundary values 0, 39, 40, 59, 60, 74, 75, 89, 90, and 100.

## 8. Execution command
| command | purpose |
|---|---|
| `mvn test -Dtest=EvidenceQualityScoreModelsTest,EvidenceQualityScoreServiceTest,EvidenceQualityScoreControllerTest,GithubWorkflowJobWebhookServiceTest,EvidenceQualityScoreMapperContractTest,EvidenceQualityScoreRepositoryAdapterTest` | Run the focused score-engine unit and contract tests. |
| `mvn test -Dtest=SpecPackMarkdownParserTest,SelfReviewMarkdownParserTest,TestResultsParseServiceTest` | Reuse parser baseline checks that feed the score engine. |
| `mvn test` | Full regression after the ticket implementation is wired in. |

## 9. Stop Condition

- Stop if the score contract changes.
- Stop if a new schema object becomes necessary.
- Stop if the canonical review source changes.
- Stop if any test requires raw prompt/chat/source/raw CI logs.
- Stop if adapter/save assertions reveal a mismatch with the existing V4 score table contract.

## 10. Required Human Decision

- Confirm the BE endpoint path and auth scope before release.
- Confirm whether the score read endpoint should be admin-scoped or ticket-scoped for the first production cut.
