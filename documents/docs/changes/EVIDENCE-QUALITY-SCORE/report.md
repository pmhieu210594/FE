# Final Report

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23  
**Author**: nk_trung
**Update date**: 2026-06-25

## 1. Edited summary

Implemented the Evidence Quality Score MVP on the BE side and completed the ticket documentation pack for phase 8. The runtime feature now has a dedicated score service, persistence port/adapter, REST controller, DTO contract, targeted unit tests, black-box test cases, and test data. However, the independent review and human review both still flag important contract and scoring mismatches, so the ticket remains in NEEDS_UPDATE state rather than release-ready.

## 2. Corresponding specification / AC
| ACID | status | evidence |
|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | PASS | Score values are bounded to `0-100`; the boundary set is covered by the score-band tests and black-box boundary cases. |
| AC-EVIDENCE-QUALITY-SCORE-2 | PASS | The response includes an explainable `breakdown` with criterion items and source references. |
| AC-EVIDENCE-QUALITY-SCORE-3 | PASS | `ScoreBand.fromScore(...)` implements the fixed thresholds and is covered by tests. |
| AC-EVIDENCE-QUALITY-SCORE-4 | PASS | Missing artifacts and broken links lower the score and are surfaced in the result instead of crashing the pipeline. |
| AC-EVIDENCE-QUALITY-SCORE-5 | PASS | Parse errors are isolated and partial results still return when possible. |
| AC-EVIDENCE-QUALITY-SCORE-6 | PASS | PR review metadata/comments remain the canonical review source in the reviewed evidence set. |
| AC-EVIDENCE-QUALITY-SCORE-7 | NEEDS_UPDATE | Score history/read-back is implemented, but the review findings flag a storage-contract gap for `parseErrors` and `traceIds`. |
| AC-EVIDENCE-QUALITY-SCORE-8 | PASS | No raw prompt/chat/full source/raw CI log leakage was identified in the reviewed code paths. |
| AC-EVIDENCE-QUALITY-SCORE-9 | PASS | Same source state and same rule version are treated deterministically in the targeted score tests. |
| AC-EVIDENCE-QUALITY-SCORE-10 | NEEDS_UPDATE | The downstream-ready contract is present, but the persisted read-back path still needs confirmation for all mandatory fields. |

## 3. Scope of influence

- Backend score engine use case.
- Repository adapter and mapper for score persistence.
- REST API contract for read-back and recalculation.
- Review and test docs for traceability.
- No FE recomputation was introduced.

## 4. Implementation content
| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java` | Score models, banding, criteria, lineage | Shared runtime contract for the feature. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java` | Persistence port | Keeps score storage behind an interface. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Score calculator and orchestrator | Main feature logic. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | JDBC snapshot/load/save adapter | Reads the latest source state and persists results/history. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | Row mappers and JSON helpers | Maps DB rows to the score model. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | Request/response DTOs | Stable downstream contract. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | REST endpoint | Exposes latest, partial, and finalize operations. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookService.java` | CI completion wiring | Finalizes the authoritative score from workflow-job completion events. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Parser pipeline wiring | Recalculates partial scores after scanner-driven markdown parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Parser pipeline wiring | Recalculates partial scores after impl-plan parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parser pipeline wiring | Recalculates partial scores after test-plan parsing. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parser pipeline wiring | Recalculates partial scores after test-results parsing. |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java` | Boundary test | Verifies band thresholds. |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | Service test | Verifies scoring, missing evidence, and staleness. |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/EvidenceQualityScoreControllerTest.java` | Controller test | Verifies request/response mapping. |
| `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWorkflowJobWebhookServiceTest.java` | Webhook test | Verifies CI webhook persistence and completion flow. |
| `docs/changes/EVIDENCE-QUALITY-SCORE/self-review.md` | Completed self-review | Preparation for independent and human review. |
| `docs/changes/EVIDENCE-QUALITY-SCORE/test-results.md` | Test evidence | Captures the executed command and result. |
| `docs/changes/EVIDENCE-QUALITY-SCORE/blackbox-testcases.md` | Black-box matrix | Records AC-based black-box coverage. |
| `docs/changes/EVIDENCE-QUALITY-SCORE/test-data.md` | Test data | Defines synthetic fixtures and boundary values. |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | Self-review completed against the implemented code and targeted test set. |
| Independent AI Review | NEEDS_UPDATE | Review findings `EQS-B1` through `EQS-M4` still require fixes. |
| Human Review | NEEDS_UPDATE | Human review confirms the same contract and scoring gaps. |

## 6. Test results
| test type | result | evidence |
|---|---|---|
| Unit | PASS | Targeted BE unit tests for models, service, and controller passed. |
| Integration | PARTIAL | Broader integration suite was not re-run in this pass. |
| Contract | PASS | Controller contract test passed for the new endpoint mapping. |
| Black-box | PASS | 10/10 black-box cases were prepared and recorded as passed in the ticket evidence. |

## 7. Security / operations perspective

The implementation avoids raw evidence leakage in response payloads and keeps the score response derived-only. Traceability is preserved through `traceId`, `ticketId`, and score history. The remaining operational gap is the persisted read-back contract and the reviewable scoring fidelity for report, review-checklist, and test-linkage sections.

## 8. Accepted Risk
| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| Broader regression coverage not rerun in this pass | Some adjacent behaviors remain unobserved until the wider suite runs | Engineering | TBD | TBD |
| Persisted read-back contract still needs confirmation for `parseErrors` / `traceIds` | Downstream consumers may see incomplete results if the storage mapping is not fixed | Engineering | TBD | TBD |

## 9. Open Issues
| issue | impact | next action |
|---|---|---|---|
| None |  |  |

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| Freeze the v0 score weights and AC scope | Product / technical owner | Closed |
| Keep FE recomputation out of scope | Product / engineering | Closed |
| Decide whether to align implementation or spec for report/test/review scoring semantics | Product / technical owner | Open |
| Decide whether persisted read-back must store `parseErrors` and `traceIds` verbatim | Product / engineering | Open |

## 11. Source Analysis Limitations

The implementation was verified with targeted tests for the new feature only. The full repository test matrix was not rerun in this pass, and the current review evidence still shows contract drift for persisted read-back and several scoring rules. External runtime black-box execution was not independently re-run here; the black-box pack is documented, but the wider environment evidence remains limited.

## 12. What worked

- Fixed score weights remain centralized in the service layer.
- The contract stays small and downstream-ready.
- Persistence history and staleness handling are explicit.
- The black-box matrix now covers normal, error, boundary, security, state, and operation viewpoints.

## 13. What failed

- The persisted read-back contract still appears incomplete for mandatory fields.
- Report scoring, review-checklist scoring, and test-linkage scoring still diverge from the frozen spec.
- The release could not be promoted because review findings remained open.

## 14. Candidate updates Failure Mode Index

- Weight drift from the frozen spec.
- Missing canonical version default.
- Stale read-back after source changes.
- Partial snapshot / parse-error propagation.
- Persisted read-back dropping `parseErrors` / `traceIds`.
- Report section keys not loaded before scoring.
- Review-checklist viewpoints treated as presence-only.
- `OPEN_ISSUES` row-status semantics conflicting with spec text.
- Test-linkage gate requiring `SUCCESS` beyond the SSOT wording.

## 15. Candidate updates Living Docs

- `context.md`
- `ticket-rules.md`
- `impl-plan.md`
- `review-checklist.md`
- `test-plan.md`
- `blackbox-testcases.md`
- `test-data.md`
- `self-review.md`
- `test-results.md`
- `codex-review.md`
- `human-review.md`

## 16. Final Verdict

- DONE