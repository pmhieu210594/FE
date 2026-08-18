# Source Inventory

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung     
**Update date**: 2026-06-24  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Finalized spec bundle | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/requirement.md` | doc | Product / BE | read | Primary requirement contract for the MVP. |
| Finalized DB design bundle | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/database-design.md` | doc | BE / DBA | read | Confirms reuse of `tbl_fact_evidence_quality_score` and supporting metric tables. |
| Source map bundle | `docs/changes/EVIDENCE-QUALITY-SCORE/sources.md` | doc | BE / QA | read | Source-of-truth list for the ticket. |
| Spec pack | `docs/changes/EVIDENCE-QUALITY-SCORE/spec-pack.md` | doc | BE / QA | read | Locked contract, ACs, and assumptions. |
| Context doc | `docs/changes/EVIDENCE-QUALITY-SCORE/context.md` | doc | BE | read | Implementation boundary and existing code map. |
| Ticket rules | `docs/changes/EVIDENCE-QUALITY-SCORE/ticket-rules.md` | doc | BE / QA | read | Guardrails for implementation and review. |
| Implementation plan | `docs/changes/EVIDENCE-QUALITY-SCORE/impl-plan.md` | doc | BE | read | Step plan and AC mapping. |
| Review checklist | `docs/changes/EVIDENCE-QUALITY-SCORE/review-checklist.md` | doc | BE / QA | read | Review prompts for self, AI, and human review. |
| Self review | `docs/changes/EVIDENCE-QUALITY-SCORE/self-review.md` | doc | BE / QA | read | Filled implementation self-review. |
| Report | `docs/changes/EVIDENCE-QUALITY-SCORE/report.md` | doc | BE / QA | read | Final implementation summary and review status. |
| Test results | `docs/changes/EVIDENCE-QUALITY-SCORE/test-results.md` | doc | BE / QA | read | Executed command and targeted test evidence. |
| Repository DB map | `docs/architecture/repository-db-map.md` | doc | BE / DBA | read | Table and migration references. |
| Service layer map | `docs/architecture/service-layer-map.md` | doc | BE | read | Existing use-case and controller patterns. |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | doc | FE / BE | read | Downstream consumer and contract style reference. |
| Route/API map | `docs/architecture/route-api-map.md` | doc | BE / FE | read | Existing API naming and path style reference. |
| Test map | `docs/architecture/test-map.md` | doc | QA | read | Existing test organization and conventions. |
| DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | BE / DBA | read | Score table, score band enum, metric lineage, and reusable evidence tables. |
| Spec pack parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | java | BE | read | Parses `spec-pack.md` and extracts AC sections for downstream evidence. |
| Self-review parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | java | BE | read | Parses self-review evidence and command history. |
| Artifact scanner | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Inventory / hash / source path reuse for evidence completeness. |
| Impl plan parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | java | BE | read | Implementation-plan evidence source and snapshot pattern. |
| Test plan parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | java | BE | read | AC-to-test coverage source. |
| Test results parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | java | BE | read | Test result persistence and parse-error handling source. |
| Test coverage validator | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | java | BE | read | AC coverage gap detection source. |
| PR metadata collector | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | java | BE | read | Canonical PR review metadata/comments source and traceability input. |
| CI metadata service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | java | BE | read | CI run lookup source for evidence scoring. |
| Safety pack service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | java | BE | read | Safety evidence source. |
| Evidence score models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModels.java` | java | BE | read | Shared score/band/lineage model for the MVP. |
| Evidence score service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | java | BE | read | Main score engine and recalculation flow. |
| Evidence score repository port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java` | java | BE | read | Persistence boundary for score state. |
| Evidence score repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | java | BE | read | JDBC adapter for snapshot/load/save operations. |
| Evidence score mapper | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | java | BE | read | Row mapper and JSON helper for score persistence. |
| Evidence score DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | java | BE | read | Request/response contract. |
| Evidence score controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | java | BE | read | REST endpoint for latest and recalculation operations. |
| Evidence score tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java`, `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java`, `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/EvidenceQualityScoreControllerTest.java` | java test | QA / BE | read | Targeted test coverage for the new feature. |
| Existing controllers | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/*.java` | java | BE | read | REST style and error handling patterns for the new score endpoint. |
| Downstream pages | `EDCAP_FE/src/pages/HomePage.tsx`, `EDCAP_FE/src/pages/ProjectPage.tsx`, `EDCAP_FE/src/pages/OrganizationPage.tsx` | tsx | FE | read | Future display consumers only; no FE recomputation. |
| Existing parser tests | `EDCAP_BE/src/test/resources/test-fixtures/PARSER-SPEC-PACK/spec-pack.md` | test fixture | QA / BE | read | Reference fixture for evidence parsing. |

## Important Files

- `docs/changes/EVIDENCE-QUALITY-SCORE/raw/requirement.md` and `docs/changes/EVIDENCE-QUALITY-SCORE/raw/database-design.md` define the MVP contract and reuse rules.
- `docs/changes/EVIDENCE-QUALITY-SCORE/spec-pack.md` is the single source of truth for AC and response shape.
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` already defines `tbl_fact_evidence_quality_score`, `score_band`, `tbl_fact_metric_value`, `tbl_fact_metric_input_lineage`, and the reusable evidence tables.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/*` and `.../scanner/ArtifactScannerService.java` provide the existing evidence-reading patterns to reuse.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` is the canonical source for PR review metadata/comments and traceability input.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` is the AC coverage helper to reuse for test linkage.
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` shows the current REST contract style that the new score endpoint should follow.

## Generated / Excluded Files

| path | reason |
|---|---|
| `EDCAP_BE/target/` | Maven build output; do not use as source. |
| `EDCAP_FE/dist/` | Vite build output; generated artifact only. |
| `EDCAP_FE/node_modules/` | Vendor dependencies; not source. |
| `EDCAP_FE/coverage/` | Generated coverage reports; not source. |
| `**/.git/` | Git metadata; not source. |
| `**/*.class` | Compiled bytecode; generated. |

## Missing Files

| missing file | expected purpose | note |
|---|---|---|
| None | N/A | All ticket-specific runtime files are now present in the tree. |
