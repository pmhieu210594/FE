# Sources

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung  
**Update date**: 2026-06-29  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| User request / ticket body | conversation context | read | Phase 1: Investigation / Spec Pack for First CI Pass / Exception KPI; BE-only, no FE in this phase. |
| Requirement definition | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02(22).md` | read | Defines MVP scope, metadata-first rule, CI/Test/Safety/Exception KPI goals, and no raw prompt/chat/source-text policy. |
| Prior working requirement draft | `/mnt/data/first_ci_pass_exception_kpi_mvp_requirement.md` | read | User-guided requirement draft created during the conversation. |
| Report/self-review templates | `/mnt/data/report_template_v2.md`, `/mnt/data/self-review_template_v2.md` | read | Added dedicated exception-record section for parseable KPI input. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Architecture overview | `docs/architecture/overview.md` | read selectively | high | Confirms hexagonal backend, metadata-first flow, and BE/FE split. |
| Service layer map | `docs/architecture/service-layer-map.md` | read selectively | high | Helps place the new KPI logic in the backend service layer. |
| Route API map | `docs/architecture/route-api-map.md` | read selectively | high | Confirms existing admin CI metadata and PM dashboard routes. |
| Repository-DB map | `docs/architecture/repository-db-map.md` | read selectively | high | Confirms reuse-first schema and the existing fact tables. |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | read selectively | medium | Used only to confirm that this ticket does not require a FE change in Phase 1. |
| Test map | `docs/architecture/test-map.md` | read selectively | medium-high | Useful for BE unit/integration test planning. |
| Backend standard | `docs/standards/backend.md` | read selectively | high | Confirms layer boundaries and service placement. |
| Database standard | `docs/standards/database.md` | read selectively | high | Confirms Flyway and `tbl_` naming conventions. |
| Security standard | `docs/standards/security.md` | read selectively | high | Confirms metadata-only, no raw logs/prompt/chat. |
| Maintenance standard | `docs/standards/maintenance.md` | read selectively | medium | Useful for collector/job/run-log conventions. |
| Ticket template | `docs/standards/templates/_ticket-template/*` | read | high | Canonical spec-pack/source/brainstorm structure. |
| `.claude` rules | `.claude/CLAUDE.md`, `.claude/rules/*.md`, `.claude/settings.json` | read | high | Safety, style, and architecture constraints. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| CI metadata use case | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | read | Existing admin-only CI metadata read service. |
| CI metadata repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | read | Reads and resolves CI run/job metadata from DB. |
| CI metadata controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CiRunMetadataController.java` | read | Existing read endpoint for CI metadata. |
| PM dashboard models/service/adapter | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardModels.java`, `PmDashboardService.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | read | Existing dashboard read model already exposes `exception_count`, `exception_items`, and `ci_failed_count`. |
| Markdown parsers | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java`, `.../selfreview/SelfReviewMarkdownParser.java`, `.../reviewchecklist/ReviewChecklistMarkdownParser.java` | read | Existing parser pattern to extend for exception-record parsing. |
| Test result parser / coverage logic | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java`, `TestCoverageValidationService.java` | read selectively | Useful reference for parser-to-DB flow and warning/data-quality handling. |
| Evidence quality score | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | read selectively | Existing scoring logic already considers CI linkage and report/test evidence. |
| Core fact tables | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | Canonical schema: `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, and related fact tables already exist. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit tests | `EDCAP_BE/src/test/java/...` | partially read | Existing parser and adapter tests can be extended in Phase 3. |
| BE integration tests | `EDCAP_BE/src/test/java/...` | partially read | Can validate parse → persist → read-model flow later. |
| FE tests | `EDCAP_FE/src/...` | not required for Phase 1 | This ticket is BE-only in the current phase. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| None | N/A | Not used | Internal repository sources are sufficient for Phase 1. |

## Excluded Sources

| source/path | reason |
|---|---|
| Raw CI logs / raw workflow output | Forbidden by metadata-first policy and may contain secrets. |
| Raw chat / raw prompt logs | Forbidden by policy. |
| Full source code outside relevant backend files | Not needed for Phase 1. |
| FE screens and FE implementation | Out of scope for this BE-only phase. |

## Source Limitations

- The backend already has CI metadata and exception fact tables, but there is no canonical spec-pack for this KPI yet.
- Current `report.md` / `self-review.md` templates did not contain a dedicated exception-record section; the templates were updated to include one.
- There is no dedicated KPI summary endpoint for this feature yet.
- The exact denominator for the KPI must be stated explicitly in the spec so downstream implementation is not ambiguous.

## Assumptions from Sources

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-FCI-1 | The existing `tbl_fact_ci_run` / `tbl_fact_ci_job` / `tbl_fact_exception` schema is sufficient for MVP. | V4 schema already contains the needed tables and columns. | Low | No |
| A-FCI-2 | First CI Pass is computed from CI run metadata, not from report/self-review text. | KPI definition and existing CI metadata model. | Low | No |
| A-FCI-3 | Exception KPI is computed from explicit exception records parsed from `report.md` and `self-review.md`. | User clarification and template update. | Low | No |
| A-FCI-4 | The BE-only MVP can ship without FE changes. | User clarification. | Low | No |
| A-FCI-5 | A dedicated exception section in the templates is the canonical source for parser extraction. | User clarification and template update. | Medium | No |

## Human Confirmation Required

| ID | question | owner | blocking? |
|---|---|---|---|
| H-FCI-1 | Confirm whether the KPI denominator should be counted at PR grain only, or PR-or-ticket grain when PR is missing. | PM / Backend | Yes |
| H-FCI-2 | Confirm whether future persistence should store a source-section key in `tbl_fact_exception`, or whether path + content fields are enough. | Backend / DB owner | No |
| H-FCI-3 | Confirm whether a dedicated KPI summary endpoint should be added in Phase 1 or deferred until Phase 3. | PM / Backend | No |