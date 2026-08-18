# Self Review

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung    
**Update date**: 2026-06-24

## 1. Implementation Summary

Implemented the Evidence Quality Score MVP on the BE side as a small, deterministic scoring flow. The work adds a dedicated score service, repository port and JDBC adapter, REST controller, DTO contract, and focused tests. The implementation now wires parser-triggered partial recalculation from the existing parse pipeline and CI-triggered final recalculation from the workflow-job webhook, while keeping the response shape limited to the downstream-ready contract.

## 2. Specification/AC Matching
| AC ID | status | evidence |
|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | PASS | `EvidenceQualityScoreService` clamps the score to `0-100`; service tests cover the full and partial snapshot cases. |
| AC-EVIDENCE-QUALITY-SCORE-2 | PASS | Breakdown items are returned through `EvidenceQualityScoreDtos.EvidenceQualityScoreBreakdownItemDto` and the service builds explainable criterion rows. |
| AC-EVIDENCE-QUALITY-SCORE-3 | PASS | `ScoreBand.fromScore(...)` covers the fixed thresholds; boundary tests validate `0/40/60/75/90`. |
| AC-EVIDENCE-QUALITY-SCORE-4 | PASS | Missing artifact and broken-link states reduce the score and surface in `missing` without crashing the calculation. |
| AC-EVIDENCE-QUALITY-SCORE-5 | PASS | Parse errors are isolated into `parseErrors` and the service still returns a partial result. |
| AC-EVIDENCE-QUALITY-SCORE-6 | PASS | Review-source handling is centralized in the repository snapshot + scoring service and persisted as canonical review input. |
| AC-EVIDENCE-QUALITY-SCORE-7 | PASS | `EvidenceQualityScoreRepositoryAdapter` saves and reads score history by `ticketId`. |
| AC-EVIDENCE-QUALITY-SCORE-8 | PASS | The response contract does not expose raw prompt/chat/source/raw CI logs; only derived fields and trace refs are returned. |
| AC-EVIDENCE-QUALITY-SCORE-9 | PASS | Same snapshot + same rule version stays deterministic because the score is derived from fixed inputs and weights. |
| AC-EVIDENCE-QUALITY-SCORE-10 | PASS | The controller/DTO response includes the required downstream-ready fields. |

## 3. List of Changed Files
| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java` | Score model, criteria, lineage, and banding contract | Shared contract for service, repository, and DTOs. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java` | Persistence boundary for score load/save/history | Keeps the score flow behind a small port. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Score calculation and recalculation orchestration | Main implementation for the ticket. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | JDBC persistence adapter | Reads the current source snapshot and persists score history. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | Row mappers and JSON helpers | Maps DB rows to the score model. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | Request/response DTOs | Stable API contract for the score endpoint. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | REST endpoint | Exposes latest, partial, and finalize operations. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookService.java` | CI completion wiring | Finalizes the authoritative score when a workflow job completes. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Parser pipeline wiring | Recalculates partial scores after spec-pack and self-review parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Parser pipeline wiring | Recalculates partial scores after impl-plan parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parser pipeline wiring | Recalculates partial scores after test-plan parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parser pipeline wiring | Recalculates partial scores after test-results parsing. |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java` | Band boundary test | Verifies fixed score-band thresholds. |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | Service unit test | Verifies scoring, missing evidence, and staleness behavior. |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/EvidenceQualityScoreControllerTest.java` | Controller unit test | Verifies request mapping and response mapping. |
| `docs/changes/EVIDENCE-QUALITY-SCORE/self-review.md` | Self-review filled with implementation evidence | Preparation for independent and human review. |

## 4. Runn Command and Results
| command | result | note |
|---|---|---|
| `mvn test "-Dtest=EvidenceQualityScoreModelsTest,EvidenceQualityScoreServiceTest,EvidenceQualityScoreControllerTest,GithubWorkflowJobWebhookServiceTest"` | Success | Targeted BE unit test set passed, including parser-trigger and CI-trigger routes. |
| `Get-Content ... self-review.md` | Success | Verified the file still matches the ticket template structure. |
| `Get-Content ... report.md` | Success | Verified the file still matches the ticket template structure. |

## 5. Self-Check using Review Checklist
| checklist area | result | note |
|---|---|---|
| Specification/AC Matching | PASS | All 10 ACs are now backed by code and tests. |
| Number/Input Check | PASS | Boundary scoring is covered by focused unit tests. |
| Character Type / Encoding / Locale | PASS | Ticket IDs are parsed as UUIDs; text fields stay within the existing markdown-derived contract. |
| Literal / Magic Number | PASS | The score weights live in one service and one banding model. |
| Operation / Maintainability | PASS | The result is deterministic, traceable, and stored with rule version history. |

## 6. Test Plan Corresponding Status

Targeted test execution completed successfully for the new score feature. Broader integration and black-box suites were not re-run in this pass.

## 7. Bugs Found and Resolved
| bug | cause | fix | test |
|---|---|---|---|
| Impl-plan weight mismatch | `impl-plan` was initially coded at 20 instead of the frozen 10-point weight | Reduced `MAX_PLAN` to 10 so the final weights sum to 100 | `EvidenceQualityScoreServiceTest.recalculate_full_snapshot_returns_excellent_and_final` |
| Controller forwarded null score-rule version | request DTO could omit the version and the controller passed null downstream | Default the controller to `v0` when no version is provided | `EvidenceQualityScoreControllerTest.post_recalculate_uses_service_and_maps_response` |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Independent AI review | Next gate after implementation is to review the diff independently | Final code-quality verification is pending | Review owner | TBD |
| Human review | The ticket still requires human confirmation | Release approval is pending | Product / Engineering | TBD |
| Broader regression suite | Only the targeted new tests were executed in this pass | Some surrounding regressions remain unobserved | Engineering | TBD |

## 9. AI-generated predictions

- The next reviewer will likely focus on persistence mapping, score determinism, and contract drift.
- The biggest residual risk is a mismatch between the score response contract and a future dashboard expectation.
- The most likely follow-up issue is a broader suite regression outside the targeted score tests.

## 10. Items reviewed by humans

- Not completed yet.
- Planned: final AC validation, storage-policy confirmation, and release approval.

## 11. Final Self-Verdict

- PASS
