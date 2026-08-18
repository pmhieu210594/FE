# Impact Analysis

**Ticket ID**: AC-TEST-COVERAGE   
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## 1. Change Content

Phase 3 does not change runtime code yet. It freezes the implementation boundary for AC-Test Coverage and documents the impact of the current source-based plan. The runtime path already exists in the repository: AC lookup, planned coverage persistence, executed test-run persistence, AC mismatch validation, and score/read-model aggregation. The implementation intent for the next phase is to reuse those paths rather than create a new manual-mapping or FE-side recomputation flow.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `docs/changes/AC-TEST-COVERAGE/source-availability.md` | Records source readiness and missing inputs for this phase | create |
| `docs/changes/AC-TEST-COVERAGE/source-inventory.md` | Inventory of runtime and documentation sources | create |
| `docs/changes/AC-TEST-COVERAGE/impact-analysis.md` | Impact boundary and non-impact boundary | create |
| `docs/changes/AC-TEST-COVERAGE/impl-plan.md` | Finalized implementation plan for the next phase | update |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Current planned-coverage entrypoint | risk of duplicated logic if a second coverage calculator is added |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Current executed-evidence entrypoint | risk of mixing planned and executed semantics |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Canonical AC mismatch rule | risk of inconsistent warnings if logic is copied elsewhere |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | AC coverage and test-run persistence | risk of bypassing audit and idempotency if not reused |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Downstream read-model aggregation | risk of diverging dashboard metrics |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Metric consumer and recompute orchestration | risk of score changes that no longer match coverage state |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Batch orchestration path | risk only if future phase tries to relabel parser work as scanner work |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Canonical schema | risk only if later changes are made without rechecking the migration history |
| `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` | Baseline regression for persistence | risk of stale assumptions if schema behavior changes |
| `EDCAP_FE/src/App.tsx` and `EDCAP_FE/src/components/Layout.tsx` | Possible future entrypoint if a new read-only surface is introduced | no current runtime impact |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| `ArtifactScannerService` | `TestPlanParseService`, `TestResultsParseService`, `EvidenceQualityScoreService` | Orchestrates parser and score recalculation flows; current plan keeps this as a backend-only batch path |
| `TestPlanParseService` | `AcCoveragePort.findActiveAcKeys(...)`, `TestCoverageValidationService`, `TestEvidencePersistencePort.replacePlannedCoverage(...)`, `DocParsePersistencePort`, `CiRunRepositoryPort` | Reads AC master data, validates planned coverage, and persists planned coverage rows |
| `TestResultsParseService` | `AcCoveragePort.findActiveAcKeys(...)`, `TestCoverageValidationService`, `TestEvidencePersistencePort.upsertTestRun(...)`, `DocParsePersistencePort`, `CiRunRepositoryPort` | Reads AC master data, validates executed evidence, and persists test-run rows |
| `EvidenceQualityScoreRepositoryAdapter` | `tbl_fact_ac_test_coverage`, `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_acceptance_criteria` | Builds read-model signals for dashboard and score calculations |
| `EvidenceQualityScoreService` | `EvidenceQualityScoreRepositoryPort` | Consumes the read-model signals and computes the final score |
| FE pages / layout | BE controllers | No dedicated AC-Test Coverage FE caller exists yet; any future page should read, not recompute |

## 5. FE Impact

No FE runtime change is required in Phase 3. The current FE route tree has protected admin/project/repository/team/role/traceability pages but no dedicated AC-Test Coverage page. If a future read-only dashboard surface is added, it should reuse the existing auth/router/layout patterns and consume backend read data only; it should not recompute coverage in the client.

## 6. BE Impact

No BE runtime code is being changed in Phase 3. The plan for the next phase is to reuse existing services and adapters rather than add a parallel AC coverage implementation. The BE impact boundary is therefore mostly a verification boundary: confirm that the current parser services, persistence adapter, and read-model adapter already satisfy the spec-pack behavior before any new code is written.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `POST /api/v1/demo/test-plan-parses` | None in Phase 3 | None in Phase 3 | Yes |
| `POST /api/v1/demo/test-results-parses` | None in Phase 3 | None in Phase 3 | Yes |
| `GET /api/v1/evidence-quality-scores/tickets/{ticketId}` | None in Phase 3 | None in Phase 3 | Yes |
| `POST /api/v1/evidence-quality-scores` and finalize/partial variants | None in Phase 3 | None in Phase 3 | Yes |
| `POST /api/v1/data-ops/artifact-scans` | None in Phase 3 | None in Phase 3 | Yes |

There is no dedicated AC-Test Coverage API contract in the repository today, so no contract change is planned for this phase.

## 8. DTO / Schema / Validation Impact

- Current DTOs already exist for parse requests and parse snapshots: `TestDocParseDtos.TestPlanParseRequestDto`, `TestResultsParseRequestDto`, `TestArtifactParseResultDto`, and `TestArtifactParseSnapshotDto`.
- Validation rules already exist at the service boundary through `TestCoverageValidationService` and the parse services.
- No new DTO shape is required in Phase 3.
- No new validation vocabulary should be introduced; the current status and warning semantics must remain stable.

## 9. DB / Migration Impact

No DB migration is required in Phase 3. `V4__init_shema_v2.sql` already contains the needed canonical tables: `tbl_fact_acceptance_criteria`, `tbl_fact_test_run`, `tbl_fact_test_case`, `tbl_fact_ac_test_coverage`, `tbl_fact_evidence_event`, and `tbl_fact_data_quality`. If a later runtime gap appears, it should be addressed with a new additive Flyway migration instead of editing V4 in place.

## 10. Batch / Job / Event Impact

- No new batch job is introduced in Phase 3.
- `ArtifactScannerService` remains the existing batch/orchestration pattern.
- Parse evidence and data-quality records continue to use the existing event/audit tables.
- No new event type is required for the plan phase.

## 11. Test Impact

- Existing tests that already anchor this area remain relevant: `TestEvidenceJdbcAdapterTest`, `EvidenceQualityScoreRepositoryAdapterTest`, `EvidenceQualityScoreServiceTest`, and `EvidenceQualityScoreControllerTest`.
- The biggest future gap is likely in parser-service-specific coverage for `TestPlanParseService` and `TestResultsParseService`.
- If runtime implementation starts, tests should focus on idempotency, AC validation warnings, planned vs executed separation, and read-model stability.

## 12. Operation / Monitoring Impact

- The current runtime already records traceable signals such as `traceId`, `ticketId`, snapshot IDs, run IDs, evidence events, and data-quality issues.
- No new monitoring surface is required for Phase 3.
- Any future runtime change should keep warnings visible instead of suppressing them and should continue to avoid raw prompt/chat persistence.

## 13. Rollout / Rollback Impact

- Phase 3 itself is documentation-only, so rollback is file revert only.
- If the next phase introduces runtime changes, a safe rollout should be additive and reuse-first.
- Rollback should prefer reverting the new runtime change or disabling the new read surface rather than altering historical V4 schema behavior.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Auth / login / session handling | Unaffected | No AC-Test Coverage endpoint touches `AuthController`, `MeController`, or security config in the current plan |
| Organization / Project / Repository / Customer / Team / Role CRUD | Unaffected | These modules are orthogonal to AC/test coverage and are not referenced by the spec or source inventory |
| GitHub webhook ingestion | Unaffected | Existing webhook and collector paths are not in the AC-Test Coverage scope |
| Traceability module | Unaffected for this phase | Current plan does not change `TraceabilityController` or its persistence path |
| DB schema outside the AC/test/evidence cluster | Unaffected | The canonical tables already exist in V4 and no other tables are targeted |
| FE locale / i18n plumbing | Unaffected | No new FE surface is being added in this phase |
| Raw prompt / raw source persistence | Unaffected by design | Ticket rules explicitly forbid it |

## 15. Required Options

- Reuse existing AC, test-run, and evidence tables first.
- Keep parser-only semantics; do not add manual mapping or pinning.
- Keep FE as a consumer only; do not recompute coverage in the client.
- Keep warnings and data-quality issues visible and auditable.
- Keep any later schema change additive via new migration.

## 16. Human Decision Required

- No open human decision is required to complete this phase.
- If a later phase needs a dedicated AC-Test Coverage dashboard route or a dedicated read endpoint, confirm the preferred placement and contract shape before coding.

## 17. Risk Summary

The main risk is not missing schema support; the current repository already has the schema and most of the runtime logic. The main risk is scope drift: adding a second coverage calculator, adding manual mapping, or pushing coverage recomputation into the FE. The chosen plan avoids those risks by treating the current parser/persistence/read-model path as the single implementation line.
