# Impact Analysis

**Ticket ID**: EVIDENCE-QUALITY-SCORE    
**Create date**: 2026-06-23   
**Author**: nk_trung   
**Update date**: 2026-06-23

## 1. Change Content

This ticket introduces the Evidence Quality Score MVP backend contract and its supporting persistence / read-back path. The change does not add FE recomputation and does not require a new schema object for the MVP. Parser completion may produce a temporary snapshot, but the authoritative score is finalized after CI completion. The engine reads existing evidence metadata, artifact snapshots, PR review metadata/comments, CI / test / traceability data, and writes the computed result to the existing V4 score table.

The planned implementation adds a dedicated score service, a repository port/adapter/mapper, a REST controller, DTOs, and tests. The existing reader services and parser services remain the upstream sources, and the dashboard must read the persisted snapshot instead of triggering calculation on open.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | New use-case service for score calculation, persistence, and read-back | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java` | Outbound persistence boundary for score storage and query | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | MyBatis/JDBC adapter for the score table | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | SQL mapper for insert/read history/latest | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | REST contract for read-back and CI/backfill recalculation | add |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | Request/response payload contract | add |
| `EDCAP_BE/src/test/java/.../EvidenceQualityScore*Test.java` | Contract, unit, integration, and boundary tests | add |
| `docs/changes/EVIDENCE-QUALITY-SCORE/source-availability.md` | Phase 3 source boundary artifact | add |
| `docs/changes/EVIDENCE-QUALITY-SCORE/source-inventory.md` | Phase 3 inventory artifact | add |
| `docs/changes/EVIDENCE-QUALITY-SCORE/impact-analysis.md` | Phase 3 impact artifact | add |
| `docs/changes/EVIDENCE-QUALITY-SCORE/impl-plan.md` | Implementation plan refinement | update |
| `docs/changes/EVIDENCE-QUALITY-SCORE/report.md` | Final report skeleton / later completion | update |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Evidence source for plan completeness | Do not alter parse semantics. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | AC-to-test coverage source | Do not change test linkage rules. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Test-results source and parse-error source | Keep partial-result behavior stable. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | AC coverage gap helper | Keep coverage detection deterministic. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Artifact inventory / hash / existence source | Preserve inventory contracts. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | Canonical review source and traceability input | Do not switch to internal review files as canonical. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | CI source for score inputs | Keep read-only access pattern. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Safety evidence source | Do not expose raw sensitive data. |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing score table and reuseable evidence tables | No MVP migration expected. |
| `docs/architecture/repository-db-map.md` | Score-table and migration reference | Keep aligned with V4 schema. |
| `docs/architecture/service-layer-map.md` | Service-layer placement reference | Keep hexagonal boundaries consistent. |
| `EDCAP_FE/src/pages/HomePage.tsx` | Future downstream display area | No local recomputation. |
| `EDCAP_FE/src/pages/ProjectPage.tsx` | Future downstream summary area | No local recomputation. |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Dashboard/API consumer | `EvidenceQualityScoreController` | Reads the BE result only; no FE-side calculation and no dashboard-open recomputation. |
| CI completion / backfill trigger | `EvidenceQualityScoreController` / internal caller | Starts authoritative calculation or read-back. |
| `EvidenceQualityScoreService` | `EvidenceQualityScoreRepositoryPort` | Persists and reads score rows. |
| `EvidenceQualityScoreService` | `SpecPackMarkdownParser`, `SelfReviewMarkdownParser`, `ArtifactScannerService`, `TestPlanParseService`, `TestResultsParseService`, `TestCoverageValidationService`, `GitPrMetadataCollectorService`, `CiRunMetadataService`, `SafetyPackService` | Reads evidence sources and validation signals. |
| `EvidenceQualityScoreService` | `tbl_fact_evidence_quality_score`, `tbl_fact_metric_value`, `tbl_fact_metric_input_lineage` | Stores result and lineage. |

## 5. FE Impact

No direct FE code change is required for this ticket.

- The FE must not recompute the score locally.
- The FE may later consume the response shape to display score, band, breakdown, missing items, and traceIds.
- Future pages such as HomePage / ProjectPage may render the data, but they are downstream only.

## 6. BE Impact

- Add a new score use case service with deterministic scoring logic.
- Add a read/write repository boundary and persistence adapter.
- Add a REST endpoint for read-back plus CI/backfill recalculation flows.
- Keep the engine BE-only and metadata-first.
- Keep parser-produced provisional snapshots separate from the CI-authoritative final snapshot in the persistence contract.
- Keep score history and current/latest snapshot behavior in the persistence contract.
- Keep logs redacted and audit-friendly.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/evidence-quality-scores` | Accepts `ticketId` or `ticketIds`, optional `scoreRuleVersion`, optional recalculation flag if supported by the controller; intended for CI/backfill or operator-triggered recalculation, not dashboard reads | Returns `ticketId`, `score`, `band`, `breakdown`, `missing`, `parseErrors`, `traceIds`, `scoreRuleVersion`, `calculatedAt` | Yes, because this is a new endpoint |
| `GET /api/v1/evidence-quality-scores/tickets/{ticketId}` | Read-only lookup by ticket | Returns the latest persisted snapshot and the downstream-ready score contract without recalculation | Yes, because this is a new endpoint |

## 8. DTO / Schema / Validation Impact

- Request DTO must validate `ticketId` / `ticketIds` presence and basic shape.
- Response DTO must include the finalized contract fields from the spec-pack.
- Breakdown items must stay machine-readable and stable.
- Band values must map to the V4 enum values.
- Validation errors should remain response-level errors, not runtime crashes.

## 9. DB / Migration Impact

No new required table or required column is expected in the MVP.

Reused objects:

- `tbl_fact_evidence_quality_score` for the persisted score row.
- `tbl_fact_metric_value` for metric/score representation and reporting reuse.
- `tbl_fact_metric_input_lineage` for provenance.
- `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_traceability_link`, `tbl_fact_review`, `tbl_fact_review_comment`, `tbl_fact_finding`, `tbl_fact_ci_run`, `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage`, `tbl_fact_evidence_report`, and `tbl_fact_data_quality` as input sources.

Do not add a new migration unless a real schema mismatch is proven during implementation.

## 10. Batch / Job / Event Impact

- No new scheduled batch job is required for the MVP.
- The engine can be called directly by API, and recalculation is an application-level operation.
- Upstream ingestion jobs remain the source of evidence data; this ticket only consumes their results.
- No new event bus contract is required.

## 11. Test Impact

- Add unit tests for score calculation, score band mapping, and boundary values.
- Add unit tests for missing-item reduction and parse-error isolation.
- Add integration tests for persistence read-back against `tbl_fact_evidence_quality_score`.
- Add API contract tests for the response shape and validation.
- Add negative tests for missing artifacts, broken links, and unavailable review source.
- Add security tests to ensure no raw prompt/chat/source/raw CI logs are leaked.

## 12. Operation / Monitoring Impact

- Log `traceId`, `ticketId`, `scoreRuleVersion`, and `calculatedAt`.
- Avoid logging raw evidence payloads or sensitive content.
- Track partial-result scenarios, parse error counts, and missing-item counts as operational signals.
- Ensure replayability for the same source state and rule version.

## 13. Rollout / Rollback Impact

- Rollout can be application-only because the MVP reuses existing V4 tables.
- If the endpoint or calculation logic is unstable, disable the recalculation entrypoint or feature flag first.
- Dashboard read paths can continue serving the latest persisted snapshot while recalculation is paused.
- Revert the service and mapper changes if necessary.
- Do not rely on destructive DB rollback.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| FE local score recomputation | unaffected | Spec-pack and ticket rules explicitly forbid it. |
| Dashboard-open recalculation | unaffected | Dashboard must read the latest persisted snapshot only. |
| Manual score override in v0 | unaffected | Finalized Phase 1 decision says it is not allowed. |
| New required database object | unaffected | Requirement and database design say MVP reuses the current schema. |
| Raw prompt/chat/full source/raw CI log storage | unaffected | Explicitly out of scope and disallowed. |
| Existing parser semantics | unaffected | The score engine consumes parser outputs; it should not change parser behavior. |

## 15. Required Options

- Use the existing V4 score table and lineage tables.
- Keep the score engine BE-only.
- Keep PR review metadata/comments as the canonical review source.
- Keep full history plus current/latest snapshot behavior for score results.
- Keep v0 weights fixed and phase-agnostic.

## 16. Human Decision Required

None at this stage, provided the finalized Phase 1 decisions remain unchanged.

## 17. Risk Summary

- Source coverage risk: the score engine must combine evidence from several existing readers without breaking current behavior.
- Contract drift risk: the response must stay aligned with the finalized spec-pack fields.
- Operational risk: partial results and parse errors must be isolated cleanly.
- Scope creep risk: do not let FE recomputation, manual override, or new schema objects enter the MVP path.