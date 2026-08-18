# Impact Analysis

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung      
**Update date**: 2026-06-29  

## 1. Change Content

- Compute **First CI Pass** from the earliest CI run associated with a PR at PR grain.
- Compute **Exception KPI** from explicit exception records only, not from generic risk text.
- Parse exception records from the dedicated `Exception Record` sections in `report.md` and `self-review.md`.
- Persist explicit exception rows into `tbl_fact_exception` and record warnings / data-quality issues when required sections are missing or malformed.
- Keep the phase BE-only; do not add FE screens.
- Reuse existing V4 tables first; only add a minimal nullable migration if provenance cannot be represented otherwise.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Current scanner flow already parses/persists `report.md` and `self-review.md`; likely call site for KPI extraction / warning persistence | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Existing dedicated parser for `self-review.md`; exception section extraction must be extended there or in a sibling parser | modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | Existing CI metadata read-service pattern for first-run lookup and admin gating | verify / possibly extend |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | Existing repository adapter already reads CI runs / PR relationships and can support deterministic first-run selection | verify / possibly extend |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | Current dashboard query already reads `tbl_fact_exception`; a KPI read model may reuse or extend this path | verify / possibly extend |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Existing warning / recalc orchestration pattern for parsed evidence may be reused for operability | verify |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Canonical schema for `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, `tbl_dim_role`, `tbl_dim_ticket`, and `tbl_fact_data_quality` | verify |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md` | Implementation plan must mirror the impact analysis and AC map | modify |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/review-checklist.md` | Review checklist should cover explicit-only exception parsing and first-run selection | create / update later |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-plan.md` | Test plan must cover first-run ordering, warnings, idempotency, and no FE scope | create / update later |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | If KPI derivation reuses evidence warning patterns, score recalculation hooks may need alignment | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` parse helpers | Report/self-review parsing may need new helper methods or warning hooks | medium |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TraceabilityController.java` | Existing read-only controller shows the current style for BE read models; may influence new KPI endpoint shape if one is added | low |
| `docs/architecture/route-api-map.md` | Must stay aligned if a new KPI endpoint becomes real | low |
| `docs/architecture/service-layer-map.md` | Must stay aligned if a new KPI service is introduced | low |
| `docs/architecture/repository-db-map.md` | Must stay aligned if a new KPI read model or migration is introduced | low |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md` | Context may need a small follow-up if a field / method is confirmed later | low |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/ticket-rules.md` | Rules may need refinement if the endpoint contract or provenance shape is locked later | low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Artifact scanner job | `ArtifactScannerService` | orchestration entry point for parsing report/self-review artifacts |
| `ArtifactScannerService` | `SelfReviewMarkdownParser` | parses self-review exception section and warning state |
| `ArtifactScannerService` | report parser / shared markdown parser path | parses report exception section if the existing flow is extended for it |
| KPI read service | `CiRunJdbcAdapter` | fetches deterministic earliest CI run / PR scope |
| KPI read service | `PmDashboardJdbcAdapter` or dedicated KPI adapter | reads explicit exception rows and computes KPI output |
| KPI read service | `tbl_fact_exception` | source of truth for explicit exception rows |
| KPI read service | `tbl_fact_ci_run` | source of truth for First CI Pass |
| KPI read service | `tbl_fact_data_quality` | stores warnings / malformed-section issues if reused |

## 5. FE Impact

- None in this phase.
- No FE route, page, component, or API client change is required for the BE-only MVP.
- Any future FE exposure must remain additive and read-only.

## 6. BE Impact

- Add deterministic first-run selection at PR grain.
- Add explicit-only exception parsing from the dedicated report/self-review exception sections.
- Add warning / data-quality recording when exception sections are missing, malformed, or unresolved.
- Keep CI job rows diagnostic only; do not let job status override run-level KPI truth.
- Keep all persisted data metadata-only; do not store raw CI logs, raw chat, raw prompt, or secrets.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `TBD read-only KPI endpoint` | If introduced, likely accepts `ticketId`, `repositoryId`, and/or `prId` filters | Would return `first_ci_pass_flag`, `first_ci_run_status`, `exception_record_count`, `exception_present_flag`, and warnings | yes, additive |
| Existing CI metadata / PM dashboard endpoints | No contract change required for this phase unless a shared read model is reused directly | Existing responses remain unchanged unless explicitly extended | yes |

## 8. DTO / Schema / Validation Impact

- Request validation must require the identifiers needed to resolve a PR or ticket scope.
- Response DTOs should keep first-run result, exception count, exception-present flag, warnings, and read-model provenance separate from raw source text.
- `tbl_fact_ci_run` remains the run-level source for First CI Pass.
- `tbl_fact_ci_job` remains diagnostic only.
- `tbl_fact_exception` remains the explicit exception fact table.
- `tbl_dim_role` is required for approval-role resolution when the source uses a mappable approval role.
- If provenance must be queryable beyond `linked_report_path`, a minimal nullable `source_section`-style column is the only acceptable schema extension.

## 9. DB / Migration Impact

- Current schema already contains the reusable core tables: `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, `tbl_dim_role`, `tbl_dim_ticket`, and `tbl_fact_pull_request`.
- No mandatory new table is expected.
- No in-place edit of `V4__init_shema_v2.sql` is allowed.
- If explicit source-section provenance cannot be represented through existing fields, add one small nullable additive migration only.
- Existing indexes on CI run time and exception ticket/expiry already support the expected access pattern.

## 10. Batch / Job / Event Impact

- Existing artifact scan / parse jobs are affected because they already process `report.md` and `self-review.md`.
- Existing evidence / data-quality events should be reused or extended so that missing exception sections are visible to Data Ops.
- No new cron schedule is required for this phase.
- Reruns must remain idempotent; repeated scans must not duplicate CI or exception rows.

## 11. Test Impact

- Parser tests must cover dedicated exception sections, missing sections, malformed rows, and role-resolution behavior.
- Integration tests must cover first-run ordering, CI pass/fail boundaries, and deduplication on rerun.
- Warning / data-quality tests must verify that missing sections are recorded instead of silently ignored.
- No FE test coverage is required for this phase.

## 12. Operation / Monitoring Impact

- Logs should contain only metadata such as `traceId`, `ticketId`, `repositoryId`, `prId`, `sourcePath`, `parserVersion`, `parseStatus`, and warning counts.
- Do not log raw markdown content, raw CI logs, raw chat, raw prompt text, secrets, or tokens.
- Parse / KPI warnings should be visible through structured data-quality records rather than raw log dumps.
- Existing observability patterns for evidence parsing should be reused when possible.

## 13. Rollout / Rollback Impact

- Rollout should be additive and read-only from the user perspective.
- If the parser or KPI path misbehaves, disable the new invocation path first rather than changing the V4 schema in place.
- If a nullable migration is added, it must remain backwards compatible and should be reversible by removing the consuming code path first.
- No destructive rollback is expected for this phase.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| FE pages / routes | Unaffected | Ticket spec explicitly says BE-only and no FE screen is in scope. |
| Raw CI logs / raw chat / raw prompt storage | Unaffected | Spec-pack and logging standards forbid raw-content persistence. |
| New table creation | Unaffected unless provenance proves otherwise | Spec-pack prefers reuse-first; V4 already contains the needed fact tables. |
| Cross-project benchmarking | Unaffected | Explicitly out of scope in the spec-pack. |
| New CI providers / collectors | Unaffected | Spec-pack says no new collector providers beyond the current metadata path. |
| Job-level KPI truth | Unaffected | Spec-pack says CI job rows are diagnostic only; run-level CI remains the KPI source. |

## 15. Required Options

- Decide whether exception provenance must be queryable via a dedicated nullable column or can remain encoded through existing fields and source order.
- Decide whether the KPI read side will be surfaced via a dedicated controller or an existing read-model path.
- Decide whether the first implementation step should extend the current self-review parser first or add a shared exception parsing helper before wiring persistence.

## 16. Human Decision Required

- Confirm the smallest acceptable provenance representation if source-section traceability is required.
- Confirm whether a dedicated KPI endpoint should be added now or deferred until a later phase.
- Confirm the expected approval-role mapping when the source uses `PM`, `Tech Lead`, `QA Lead`, `Security`, or `Other` text.

## 17. Risk Summary

- Main risk: the implementation guesses parser or endpoint shape before source confirmation.
- Main data risk: exception rows could be undercounted if report/self-review exception sections are not parsed consistently.
- Main schema risk: provenance may need one minimal nullable migration if existing fields cannot preserve source-section traceability.