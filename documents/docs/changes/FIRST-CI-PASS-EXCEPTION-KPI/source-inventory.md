# Source Inventory

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung      
**Update date**: 2026-06-29  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Spec / AC | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md` | markdown | BE / Product | read | Primary AC source for First CI Pass and Exception KPI. |
| Context | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md` | markdown | BE | read | Captures source mapping, method availability, and multilingual/logging rules. |
| Rules | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/ticket-rules.md` | markdown | BE | read | Contains stop / ask conditions and non-goals. |
| Source declaration | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/sources.md` | markdown | BE / Product | read | Declares the evidence set used for this phase. |
| Shared template | `docs/standards/templates/_ticket-template/report.md` | markdown | Standards | read | Canonical final exception-record section. |
| Shared template | `docs/standards/templates/_ticket-template/self-review.md` | markdown | Standards | read | Canonical self-review exception-record section. |
| Architecture | `docs/architecture/overview.md` | markdown | Architecture | read | Confirms backend-first, metadata-first organization. |
| Architecture | `docs/architecture/service-layer-map.md` | markdown | Architecture | read | Places parser / KPI logic in the backend service layer. |
| Architecture | `docs/architecture/route-api-map.md` | markdown | Architecture | read | Confirms current API surface and that the new KPI route is not present yet. |
| Architecture | `docs/architecture/repository-db-map.md` | markdown | Architecture / DB | read | Confirms table reuse and current read-model conventions. |
| Current parser baseline | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | java | BE | read | Known helper methods: `parse(String)` and `hasSection(...)`. |
| Current dedicated parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | java | BE | read | Existing parser envelope for `self-review.md`; likely extension point. |
| Current scanner pipeline | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | java | BE | read | Handles report/self-review parse and persistence flow. |
| Current CI metadata read service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | java | BE | read | Existing admin read-service pattern for CI metadata. |
| Current CI metadata repository | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | java | BE | read | Repository methods for PR/ticket/CI lookups and recent-run queries. |
| Current dashboard repository | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | java | BE | read | Reads `tbl_fact_exception` for PM dashboard summary/open items. |
| Current quality service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | java | BE | read selectively | Existing warning / evidence aggregation pattern. |
| DB schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | sql | DB | read | Canonical schema for `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, `tbl_dim_role`, `tbl_dim_ticket`, `tbl_fact_pull_request`, and `tbl_fact_data_quality`. |
| Parser tests | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | java | QA / BE | read | Existing parser test style for markdown section extraction and warnings. |
| Quality tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | java | QA / BE | read selectively | Existing test style for evidence / warning / recalculation behavior. |
| CI tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/governance/CiRunMetadataServiceTest.java` | java | QA / BE | read | Existing service test style for admin gating and repository interaction. |

## Important Files

- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java`
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`
- `docs/standards/templates/_ticket-template/report.md`
- `docs/standards/templates/_ticket-template/self-review.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/ticket-rules.md`

## Generated / Excluded Files

- Generated in this phase: `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/source-availability.md`
- Generated in this phase: `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/source-inventory.md`
- Generated in this phase: `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impact-analysis.md`
- Generated in this phase: updated `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md`
- Excluded from this phase: FE routes, FE components, raw CI logs, raw chat/prompt, secrets, and binary build outputs.

## Missing Files

- No dedicated First CI Pass / Exception KPI service exists yet.
- No dedicated KPI controller / DTO set exists yet.
- No standalone `ReportMarkdownParser` exists yet; `report.md` is currently handled through the scanner pipeline.
- No confirmed nullable provenance migration for exception source section exists yet.
- No FE route or screen is required for this BE-only phase.