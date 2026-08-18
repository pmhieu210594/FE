# Implementation Plan

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung   
**Update date**: 2026-06-23

## 1. Implementation Principle

- Reuse-first, metadata-first, and fail-safe.
- Keep the MVP BE-only and do not add FE recomputation.
- Reuse the current V4 score table and lineage/data-quality tables.
- Treat `source-availability.md`, `source-inventory.md`, and `impact-analysis.md` as the hard implementation boundary for this ticket.
- Treat PR review metadata/comments as canonical review input.
- Parser completion may produce a partial snapshot, but CI completion is the authoritative finalization trigger for the persisted score.
- Keep full history plus current/latest snapshot for score results.
- Keep v0 weights fixed and phase-agnostic.
- Avoid raw prompt/chat/full source/raw CI log storage anywhere in this ticket.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Add a dedicated score use case + repository adapter on top of the existing V4 tables | Fits the current architecture, keeps the MVP small, and preserves auditability | Requires creating a new service layer and DTO contract | **Chosen** |
| B | Put scoring logic inside existing parser or scanner services | Less new code at first | Mixes responsibilities and makes the contract hard to test/reuse | Rejected |
| C | Add new schema objects or a JSONB-first detail store before the MVP ships | Makes future audits richer | Slower, riskier, and not needed because the current schema is already sufficient | Rejected for MVP |

## 3. Reason for Choosing the Alternative Plan

Option A is the only plan that keeps the MVP aligned with the existing architecture, the current schema, and the finalized Phase 1 decisions. It lets us implement the BE contract without inventing new storage rules or moving business logic into the FE. The score engine can be triggered by CI completion or backfill, while the dashboard stays read-only.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | New application use case for score calculation, persistence, and read-back | Primary score engine | AC-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java` | New outbound port for storing and reading score results | Keeps persistence behind an interface | AC-7, AC-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | JDBC/MyBatis adapter for score persistence | Reuse-first DB access | AC-7 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | SQL mapper for score rows | Query latest/history and insert results | AC-7, AC-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | REST entrypoint for read-back and internal recalculation contract | Dashboard/API consumer contract | AC-1..10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | Request/response DTOs | Stable downstream contract | AC-10 |
| `EDCAP_BE/src/test/java/.../EvidenceQualityScore*Test.java` | Unit and integration tests for score, banding, and persistence | Verifies contract and boundaries | AC-1..10 |
| `docs/changes/EVIDENCE-QUALITY-SCORE/report.md` | Final ticket report | Traceability and release evidence | All ACs |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `EvidenceQualityScoreController` | add | `ticketId`, optional batch IDs, optional `forceRecalculate` | score response DTO | Keep endpoint small and read-oriented; dashboard reads must not trigger recomputation. |
| `EvidenceQualityScoreService` | add | ticket id / batch ids / rule version / requester | score result model | Owns orchestration, calculation, and persistence. |
| `EvidenceQualityScoreRepositoryPort` | add | score result / query args | persisted row / latest row / history rows | Hides DB details. |
| `EvidenceQualityScoreMapper` | add | ticket id, rule version, calculatedAt | SQL row / rows | Query latest by `calculated_at DESC`. |
| `SpecPackMarkdownParser` and `SelfReviewMarkdownParser` | reuse | parsed Markdown evidence | structured sections / warnings / errors | Do not duplicate parsing rules. |
| `ArtifactScannerService` | reuse | repository / ticket scope | inventory / artifacts | Use as source for artifact existence and hashes. |
| `GitPrMetadataCollectorService` | reuse | repository / PR scope | PR metadata / traceability rows | Canonical review source is PR metadata/comments. |
| `TestPlanParseService` / `TestResultsParseService` | reuse | ticket / snapshot | parsed test evidence | Required for AC-test linkage. |

## 6. SQL / Query / Repository Policy

- Use the existing `tbl_fact_evidence_quality_score` as the main output table.
- Keep the score rule version on each row.
- Keep lineage to the input artifacts and traceability chain.
- Query the latest authoritative score by `ticket_id` ordered by `calculated_at DESC`.
- Parser-driven partial snapshots may be stored as provisional state, but CI completion must write the authoritative final row.
- Preserve full history by inserting a new row on recalculation; do not overwrite old rows.
- Do not add a new mandatory schema object for the MVP.

## 7. Validation / Error / Logging Policy

- The score must always be between 0 and 100.
- Missing artifacts, parse errors, and broken links must reduce the score and appear in the response.
- The engine must return partial results when possible instead of failing the whole request.
- Log `traceId`, `ticketId`, `scoreRuleVersion`, and `calculatedAt`.
- Do not log raw evidence contents or secrets.
- Treat review-source unavailability as a partial-score condition, not as a pipeline crash.

## 8. Migration / Rollback Policy

- No new required table or required column is expected in the MVP.
- If implementation finds a schema mismatch, stop and escalate before adding a migration.
- Rollback should be application-level first: disable the endpoint / feature flag, then revert the service.
- Do not depend on destructive rollback of existing migrations.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Add request/response DTOs and contract model | `web/dto/EvidenceQualityScoreDtos.java` | DTO fields match spec-pack | Stop if the response shape diverges from AC-10. |
| 2 | Add score service and calculator | `application/usecase/quality/EvidenceQualityScoreService.java` | Unit tests for range/banding/breakdown | Stop if scoring cannot remain deterministic. |
| 3 | Add repository port and mapper | `application/port/out/persistence/...`, `infrastructure/persistence/mapper/...` | Insert/read-back integration test | Stop if the history/latest policy changes. |
| 4 | Add controller endpoint | `web/rest/EvidenceQualityScoreController.java` | API contract test | Stop if the FE would need to recompute score locally. |
| 5 | Wire existing evidence readers into the score service | existing parser/collector services | AC-to-source linkage test | Stop if the canonical PR review source cannot be used. |
| 6 | Add unit / integration / black-box tests | `src/test/...` | Boundary and partial-failure tests pass | Stop if raw data leaks into logs or responses. |
| 7 | Update report / review docs | `docs/changes/...` | Traceability is complete | Stop if docs no longer match the code plan. |

## 10. How to Verify Each Step

- Verify the score range with both normal and boundary inputs.
- Verify missing artifact handling does not crash the run.
- Verify parse-error isolation returns partial results.
- Verify the canonical review source comes from PR review metadata/comments.
- Verify parser-completed provisional snapshots do not become the final dashboard value until CI completion.
- Verify persistence/read-back returns the same result for the same ticket and rule version.
- Verify response redaction removes raw prompt/chat/source/raw CI logs.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-EVIDENCE-QUALITY-SCORE-1 | calculator + controller + response DTO | score is in the 0-100 range |
| AC-EVIDENCE-QUALITY-SCORE-2 | breakdown builder | breakdown items are returned and explainable |
| AC-EVIDENCE-QUALITY-SCORE-3 | band mapper | boundary values map to the correct band |
| AC-EVIDENCE-QUALITY-SCORE-4 | inventory / traceability readers | missing artifacts or broken links reduce score without crashing |
| AC-EVIDENCE-QUALITY-SCORE-5 | parser error handling | parseErrors are returned and partial result is preserved |
| AC-EVIDENCE-QUALITY-SCORE-6 | PR review ingestion / reader | PR review metadata/comments are treated as canonical |
| AC-EVIDENCE-QUALITY-SCORE-7 | repository adapter / read-back path | persisted results can be queried later by ticketId without recalculating on read |
| AC-EVIDENCE-QUALITY-SCORE-8 | response serializer / sanitizer | no raw prompt/chat/source/raw CI logs in response |
| AC-EVIDENCE-QUALITY-SCORE-9 | deterministic calculator | same inputs + same rule version produce same result |
| AC-EVIDENCE-QUALITY-SCORE-10 | controller response contract | all required fields are present |

## 12. Stop / Ask Condition

- Ask before changing score weights, score bands, or rule-version behavior.
- Ask before introducing new schema objects.
- Ask before switching the canonical review source away from PR review metadata/comments.
- Ask before adding any FE-local scoring logic.
- Ask before making dashboard reads trigger recalculation instead of serving the latest persisted snapshot.

## 13. Do Not Do This Ticket

- Do not add manual score override in v0.
- Do not add a new migration unless a real schema mismatch is proven.
- Do not store raw prompt/chat/source/raw CI logs.
- Do not recompute the score in the FE.
- Do not silently drop any of the 10 ACs from the implementation scope.

## 14. Open Related Issues

- None at the moment, provided the current V4 score table remains available and the finalized Phase 1 decisions stay unchanged.