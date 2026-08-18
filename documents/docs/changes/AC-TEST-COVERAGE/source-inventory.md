# Source Inventory

**Ticket ID**: AC-TEST-COVERAGE   
**Create date**: 2026-06-26    
**Author**: OpenAI   
**Update date**: 2026-06-26  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket spec | `docs/changes/AC-TEST-COVERAGE/spec-pack.md` | document | Ticket owner | read | Single source of truth for scope and AC |
| Ticket context | `docs/changes/AC-TEST-COVERAGE/context.md` | document | Ticket owner | read | Runtime boundary, methods, mappings, and exclusions |
| Ticket rules | `docs/changes/AC-TEST-COVERAGE/ticket-rules.md` | document | Ticket owner | read | Local guardrails for parser-only / reuse-first behavior |
| Phase 3 analysis | `docs/changes/AC-TEST-COVERAGE/source-availability.md` | document | Ticket owner | to-create | Source readiness and risk gate |
| Phase 3 analysis | `docs/changes/AC-TEST-COVERAGE/source-inventory.md` | document | Ticket owner | to-create | Inventory for implementation planning |
| Phase 3 analysis | `docs/changes/AC-TEST-COVERAGE/impact-analysis.md` | document | Ticket owner | to-create | Impact boundary and non-impact boundary |
| Phase 3 analysis | `docs/changes/AC-TEST-COVERAGE/impl-plan.md` | document | Ticket owner | to-update | Finalized implementation steps and rollback policy |
| Architecture overview | `docs/architecture/overview.md` | document | Architecture | read | High-level system boundary and collector/read-model context |
| Service-layer map | `docs/architecture/service-layer-map.md` | document | Architecture | read | Shows where parser, scanner, and score services sit |
| Route/API map | `docs/architecture/route-api-map.md` | document | Architecture | read | Existing controller patterns and route placement |
| Repository/DB map | `docs/architecture/repository-db-map.md` | document | Architecture | read | Table-to-repository mapping and schema expectations |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | document | Architecture | read | Helps verify whether a new FE contract is actually needed |
| Test map | `docs/architecture/test-map.md` | document | Architecture | read | Current test baseline and gaps |
| Backend standard | `docs/standards/backend.md` | document | Standards owner | read | Layering, service, adapter, and package conventions |
| Database standard | `docs/standards/database.md` | document | Standards owner | read | Flyway, schema, and repository conventions |
| Security standard | `docs/standards/security.md` | document | Standards owner | read | Metadata-only, secret hygiene, auditability |
| Maintenance standard | `docs/standards/maintenance.md` | document | Standards owner | read | Logging, operations, and troubleshooting expectations |
| Testing standard | `docs/standards/testing.md` | document | Standards owner | read | Test design and evidence expectations |
| Architecture rule | `.claude/rules/20-architecture.md` | rule | Rule owner | read | Local architecture constraints |
| Security rule | `.claude/rules/30-security.md` | rule | Rule owner | read | Local security constraints |
| Testing rule | `.claude/rules/40-testing.md` | rule | Rule owner | read | Local testing constraints |
| AC lookup port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AcCoveragePort.java` | java | BE | read | Returns active AC keys for a ticket |
| AC lookup adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/AcCoverageJdbcAdapter.java` | java | BE | read | Reads `tbl_fact_acceptance_criteria` |
| AC coverage validation | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | java | BE | read | Canonical AC mismatch warning logic |
| Test-plan parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | java | BE | read | Planned coverage ingestion and warning creation |
| Test-results parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | java | BE | read | Executed evidence ingestion and coverage validation |
| Test evidence port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java` | java | BE | read | Planned coverage and test-run persistence boundary |
| Test evidence adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | java | BE | read | Writes into `tbl_fact_ac_test_coverage` and `tbl_fact_test_run` |
| Score service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | java | BE | read | Downstream metric and coverage signal consumer |
| Score repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | java | BE | read | Reads AC/test coverage counts and latest test signals |
| Artifact scanner | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Batch orchestration and parser triggering |
| Parse controllers | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TestPlanParseController.java`, `TestResultsParseController.java` | java | BE API | read | Current parse API entrypoints |
| Score controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/EvidenceQualityScoreController.java` | java | BE API | read | Current score read/recalc API |
| Admin batch controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | java | BE API | read | Admin-only batch trigger pattern |
| Parse DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TestDocParseDtos.java` | java | BE API | read | Parse request/result DTOs and snapshot DTOs |
| Schema migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | BE / DB | read | Canonical AC, test run, coverage, evidence, and data-quality tables |
| Parser tests | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` | test | BE | read | Persistence regression coverage for AC/test evidence writes |
| Score tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | test | BE | read | Read-model and score behavior baseline |
| Score adapter tests | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java` | test | BE | read | SQL/read-model baseline |
| FE router | `EDCAP_FE/src/App.tsx` | tsx | FE | read | Current protected route layout and page placement |
| FE layout | `EDCAP_FE/src/components/Layout.tsx` | tsx | FE | read | Navigation / shell pattern |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | ts | FE | read | Request/response pattern if later read surface is exposed |
| FE traceability page | `EDCAP_FE/src/pages/traceability/TraceabilityPage.tsx` | tsx | FE | read | Closest existing dashboard-like surface |
| FE home page | `EDCAP_FE/src/pages/HomePage.tsx` | tsx | FE | read | Protected landing pattern |

## Important Files

- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` is the schema anchor for AC coverage, test run, evidence event, and data-quality tables.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` and `TestResultsParseService.java` are the current AC/test linkage entrypoints.
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TestEvidenceJdbcAdapter.java` is the write-path anchor for planned coverage and test-run facts.
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` is the read-path anchor for dashboard signals.
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` is the current score consumer that will be sensitive to coverage signal changes.
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java` is the best existing regression reference for the write path.

## Generated / Excluded Files

- Exclude `EDCAP_FE/coverage/`, `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `**/*.class`, and any build outputs.
- Exclude `**/.env*`, production YAML secrets, and raw logs.
- Exclude binary exports and stale generated reports unless they are explicitly created for test evidence.
- Do not use production PII or raw prompt/chat content as source material.

## Missing Files

- No dedicated AC-Test Coverage dashboard page exists in FE today.
- No dedicated AC-Test Coverage API contract file exists in the repository today.
- No dedicated AC-Test Coverage service boundary exists outside the current parser/read-model services.
- No parser-service unit tests were found specifically for `TestPlanParseService` and `TestResultsParseService`; current coverage is concentrated in persistence, score, and controller tests.
