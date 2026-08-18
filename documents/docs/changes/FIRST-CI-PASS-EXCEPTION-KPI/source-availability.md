# Source Availability

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung   
**Update date**: 2026-06-29  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Ticket spec pack | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md` | read | high | Ticket author | AC / scope / non-goals | Spec drift if implementation diverges | always-read |
| Ticket context | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md` | read | high | Ticket author | Confirms BE-only scope, schema reuse, and data-quality rules | May still leave implementation seams open | always-read |
| Ticket rules | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/ticket-rules.md` | read | high | Ticket author | Guardrails for implementation and stop conditions | Rule drift if not synchronized with code | always-read |
| Ticket sources | `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/sources.md` | read | high | Ticket author | Declares the exact upstream sources used for this phase | If ignored, phase may drift from the user-provided evidence set | always-read |
| Shared template: report | `docs/standards/templates/_ticket-template/report.md` | read | high | Standards owner | Canonical exception-record section and final verdict shape | Wrong section mapping would break parser/contract alignment | always-read |
| Shared template: self-review | `docs/standards/templates/_ticket-template/self-review.md` | read | high | Standards owner | Canonical exception-record section for explicit warnings | Wrong section mapping would break parser/contract alignment | always-read |
| Architecture overview | `docs/architecture/overview.md` | read selectively | high | Architecture owner | Confirms hexagonal backend and metadata-first flow | Over-reading unrelated areas would add noise | verify-with-source |
| Route / API map | `docs/architecture/route-api-map.md` | read selectively | high | Architecture owner | Confirms current API surface and that no KPI endpoint exists yet | Route contract may be guessed if not checked | verify-with-source |
| Service-layer map | `docs/architecture/service-layer-map.md` | read selectively | high | Architecture owner | Confirms where parser / service logic belongs | Layer boundary may be crossed if reused blindly | verify-with-source |
| Repository-DB map | `docs/architecture/repository-db-map.md` | read selectively | high | Architecture / DB owner | Confirms reusable fact tables and current read-model patterns | Wrong grain or wrong table choice would break KPI logic | required-if-db |
| Backend standards | `docs/standards/backend.md` | read selectively | high | Standards owner | Layer, service, and controller rules | Would cause boundary violations if skipped | always-read |
| Database standards | `docs/standards/database.md` | read selectively | high | Standards owner | Flyway / `tbl_` / nullable-additive migration rules | Wrong migration style would create rollback risk | always-read |
| Logging standards | `docs/standards/logging.md` | read selectively | high | Standards owner | Metadata-only log shape and traceId expectations | Raw-content logging would violate policy | always-read |
| Error-handling standards | `docs/standards/error-handling.md` | read selectively | high | Standards owner | Exception envelope / warning handling conventions | Wrong error mapping would leak implementation details | always-read |
| Current Markdown core | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | read | high | BE | Known pure parser baseline and available helper methods | A two-parameter parse method would be guessed if not checked | always-read |
| Current self-review parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | read | high | BE | Existing dedicated parser boundary for `self-review.md` | Exception extraction may need extension rather than a new parser style | always-read |
| Current scanner pipeline | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | read | high | BE | Existing parse/persist pipeline for report/self-review artifacts | Easy to mix scanner and parser responsibilities | always-read |
| CI metadata service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | read | high | BE | Existing read service pattern for CI metadata | Useful for first-run selection and admin gating patterns | verify-with-source |
| CI metadata adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | read | high | BE | Existing query adapter over `tbl_fact_ci_run` / PR lookup | First-run ordering must match current DB semantics | always-read |
| PM dashboard adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | read | high | BE | Existing dashboard read-model pattern already touches `tbl_fact_exception` | Could expose the same facts in another KPI view | verify-with-source |
| Evidence quality score service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | read selectively | high | BE | Existing downstream recalculation hook using report/self-review evidence | Avoid coupling KPI derivation to score semantics | verify-with-source |
| Database schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | DB | Canonical source for `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, role/ticket/PR tables | Wrong column mapping would break persistence or first-run selection | required-if-db |
| Existing tests | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SelfReviewMarkdownParserTest.java` | read | high | QA / BE | Parser test style and existing assertions | Template drift or false positives can hide parse regressions | verify-with-source |
| Existing tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreServiceTest.java` | read selectively | high | QA / BE | Data-quality / evidence aggregation test style | Useful for warning and recalculation behavior | verify-with-source |

## Summary

- The spec, context, rules, and shared templates are available and stable enough to drive implementation planning.
- The backend already has the core data sources: `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, `tbl_dim_role`, `tbl_dim_ticket`, and `tbl_fact_pull_request`.
- The existing scanner/parser path already demonstrates how report/self-review artifacts are parsed, warned, and persisted.
- No FE source is required for this phase because the ticket is explicitly BE-only.

## Unavailable / Partial Sources

- No dedicated First CI Pass / Exception KPI service or read endpoint exists yet.
- No dedicated `ReportMarkdownParser` exists in the current source tree; `report.md` is currently handled via the scanner pipeline, not a standalone parser class.
- No confirmed migration exists for an extra provenance column such as `source_section` on `tbl_fact_exception`.
- No FE route, page, or component is in scope for this phase.

## Risk Before Implementation

- First-run ordering must be deterministic when `started_at`, `collected_at`, or identical source identity values are present.
- Exception records must remain explicit-only; any free-text inference would violate the spec boundary.
- If exception provenance must be queryable beyond `linked_report_path` / row order, a minimal nullable migration may be needed.
- Data-quality warnings must remain metadata-only and must not leak raw markdown or CI payloads.

## Required Human Decision

- Confirm whether explicit provenance requires a new nullable column or can remain encoded through existing fields and source order.
- Confirm whether the first readable KPI endpoint should be a new controller or a read model behind an existing dashboard surface.