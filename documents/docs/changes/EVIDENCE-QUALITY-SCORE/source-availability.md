# Source Availability

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung  
**Update date**: 2026-06-24  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Finalized requirement / spec bundle | `docs/changes/EVIDENCE-QUALITY-SCORE/raw/requirement.md`, `docs/changes/EVIDENCE-QUALITY-SCORE/raw/database-design.md`, `docs/changes/EVIDENCE-QUALITY-SCORE/sources.md`, `docs/changes/EVIDENCE-QUALITY-SCORE/spec-pack.md` | read | high | Product / BE | Final scoring contract and MVP boundaries | Low if kept unchanged | always-read |
| Architecture docs | `docs/architecture/repository-db-map.md`, `docs/architecture/service-layer-map.md`, `docs/architecture/fe-be-contract-map.md`, `docs/architecture/route-api-map.md`, `docs/architecture/source-inventory.md`, `docs/architecture/test-map.md` | read | high | BE / FE / QA | Existing contract and impact references | Low | required-if-design |
| V4 DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | BE / DBA | Table, enum, and lineage reuse plan | Low; no MVP migration expected | required-if-db |
| Existing evidence readers | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/*`, `.../scanner/ArtifactScannerService.java`, `.../ingestion/GitPrMetadataCollectorService.java`, `.../governance/CiRunMetadataService.java`, `.../governance/SafetyPackService.java` | partial | high | BE | Source data for score calculation and traceability | No dedicated score service exists yet | always-read |
| Existing parser controllers | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java`, `.../ImplPlanParseController.java`, `.../TestPlanParseController.java`, `.../TestResultsParseController.java`, `.../ArtifactScannerController.java`, `.../GitPrMetadataCollectorController.java`, `.../CiRunMetadataController.java`, `.../SecurityEvidenceController.java` | partial | high | BE | API patterns to follow for the score endpoint | Score endpoint is now separate and must stay contract-stable | verify-with-source |
| Score runtime service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | available | high | BE | Deterministic score calculation and recalculation | Contract drift if weights change without spec update | always-read |
| Score persistence port / adapter / mapper | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/EvidenceQualityScoreRepositoryPort.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | available | high | BE / DBA | Snapshot, latest, history, and lineage persistence | Mapping drift if schema contract changes | always-read |
| Score controller / DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java`, `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/EvidenceQualityScoreDtos.java` | available | high | BE / FE | REST contract for read-back and recalculation | API response drift if fields change | verify-with-source |
| Score tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreModelsTest.java`, `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java`, `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/EvidenceQualityScoreControllerTest.java` | available | high | QA / BE | Targeted evidence for feature correctness | Broader regression suite still pending | always-read |
| Frontend downstream pages | `EDCAP_FE/src/pages/HomePage.tsx`, `EDCAP_FE/src/pages/ProjectPage.tsx`, `EDCAP_FE/src/pages/OrganizationPage.tsx` | partial | medium | FE | Future consumer context only | No score page yet; no FE recomputation allowed | future-consumer |
| Existing test fixtures | `EDCAP_BE/src/test/resources/test-fixtures/PARSER-SPEC-PACK/spec-pack.md` and current parser/test trees | read | medium | QA / BE | Reference examples for parser-driven test data | Score-engine-specific tests are added separately | always-read |

## Summary

The source bundle remains sufficient for implementation and review. The required ticket-specific runtime files now exist, and the feature has targeted unit coverage. The remaining gap is review and broader-suite confirmation, not source availability.

## Unavailable / Partial Sources

- Dedicated FE score page: unavailable and out of current scope.
- Broader regression suite evidence: not rerun in this pass.

## Risk Before Implementation

- The biggest implementation risk was contract drift if the score response shape diverged from the finalized spec-pack fields. That risk is now reduced by the implemented controller and DTO contract.
- Another risk was accidental scope creep into FE recomputation, dashboard-open recomputation, or manual score override, all of which remain out of scope.
- A third risk was mixing provisional parser snapshots with authoritative CI-finalized score rows; the new source snapshot flow keeps that distinction explicit.

## Required Human Decision

- Final human review and release approval are still required before the ticket can be considered closed.
