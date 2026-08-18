# Impact Analysis

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17
**Author**: ChatGPT
**Update date**: 2026-06-17

## 1. Change Content

- Add a GitHub Actions job-level metadata collector.
- Persist one row per GitHub Actions job.
- Store workflow run ID in `external_run_id` and job ID in `external_job_id`.
- Keep repository linkage mandatory and PR / ticket linkage best-effort.
- Record connector execution with safe counters and traceable errors.
- Avoid raw CI logs, raw API payloads, tokens, and secrets.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Current CI tables and connector-run columns do not match the ticket grain or counter requirements | migration / schema reconciliation |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | Existing model is run-level, but the ticket needs job-level metadata including job ID and CI URL | model refactor or replacement |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | Connector execution log needs the counter set required by the ticket | model extension |
| `documents/docs/changes/CI-RUN-METADATA/source-availability.md` | Captures current source trust and the schema mismatch | planning artifact |
| `documents/docs/changes/CI-RUN-METADATA/source-inventory.md` | Captures current source inventory and missing files | planning artifact |
| `documents/docs/changes/CI-RUN-METADATA/impact-analysis.md` | This artifact itself | planning artifact |
| `documents/docs/changes/CI-RUN-METADATA/impl-plan.md` | Implementation plan artifact | planning artifact |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | Reference pattern for safe ingestion, validation, and logging | low, pattern reuse only |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reference pattern for connector run persistence and transaction boundaries | low, pattern reuse only |
| `EDCAP_BE/src/main/resources/mapper/SecurityScanMapper.xml` | Reference MyBatis mapping and upsert style | low, pattern reuse only |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityScanRepositoryAdapter.java` | Reference repository adapter style | low |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/SecurityScanRepositoryPort.java` | Reference port design | low |
| `EDCAP_FE/src/lib/api.ts` | Central FE API layer if a CI query endpoint is added | medium, depends on API scope |
| `EDCAP_FE/src/pages/SafetyEvidencePage.tsx` | Closest current table UI pattern if CI evidence is exposed in FE | medium, depends on FE scope |
| `EDCAP_FE/src/__ tests __/pages/SafetyEvidencePage.test.tsx` | UI test pattern reference | low |
| `documents/docs/architecture/route-api-map.md` | Will need an update if a CI endpoint is introduced | low to medium |
| `documents/docs/architecture/repository-db-map.md` | Will need an update if the schema is reconciled | low to medium |
| `documents/docs/architecture/service-layer-map.md` | Will need an update if a new collector service is added | low to medium |
| `documents/docs/architecture/test-map.md` | Will need an update after CI tests are added | low to medium |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Trigger source not yet decided | New CI collector service | Collect workflow / job metadata and orchestrate persistence |
| New CI collector service | GitHub Actions API | Fetch workflow run / job metadata |
| New CI collector service | Repository resolver | Resolve mandatory repository linkage |
| New CI collector service | Pull request resolver | Resolve optional PR linkage when metadata allows it |
| New CI collector service | Ticket resolver | Resolve optional ticket linkage when metadata allows it |
| New CI collector service | CI repository adapter / mapper | Upsert one row per job into `tbl_fact_ci_run` |
| New CI collector service | Connector run adapter / mapper | Write run counters and error status into `tbl_connector_run` |
| Optional FE query screen | CI query API | Display latest job status, workflow, job name, URL, and timestamps |

## 5. FE Impact

- No CI-specific FE surface exists in the current repository.
- If AC-12 and AC-13 are in scope for this ticket, `EDCAP_FE/src/lib/api.ts` will need a CI endpoint helper and the UI will need a new page or section for CI evidence detail.
- `EDCAP_FE/src/pages/SafetyEvidencePage.tsx` is the nearest existing table pattern, but it is not a CI page and should not be modified unless product confirms FE scope reuse.
- If the ticket is backend-only, FE impact is deferred and the UI work becomes a follow-up ticket.

## 6. BE Impact

- Add a new collector use case or service for GitHub Actions metadata ingestion.
- Add or modify a repository port and adapter for CI run upsert and lookup.
- Add status normalization and URL fallback logic.
- Add validation for required job ID, repository resolution, URL presence, and timestamp order.
- Add safe logging and counter recording for connector runs.
- Keep the external HTTP fetch outside the DB transaction and persist per job inside a short transaction boundary.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| CI ingest trigger | Not decided yet | Not decided yet | Unknown until trigger mode is confirmed |
| CI query / detail endpoint | Not yet confirmed | Should return normalized job metadata, not raw API payloads | Unknown until API scope is confirmed |

- There is no confirmed CI endpoint in the current route map.
- If a public or internal query API is added, it must follow the existing raw DTO / list style and `ErrorResponse` conventions.
- If the ticket remains backend-only, API contract impact is limited to internal service-to-service contracts.

## 8. DTO / Schema / Validation Impact

- A normalized CI job DTO is needed if the collector or query layer exposes a service boundary.
- `external_run_id` must represent the GitHub Actions workflow run ID.
- `external_job_id` must be required.
- `ci_url` must prefer job URL and fall back to workflow run URL.
- Status must be normalized into the approved enum set from the requirement.
- Validation must reject missing repository linkage, missing job ID, invalid URL state, and invalid timestamp order.
- The existing `tbl_fact_ci_run` and `tbl_connector_run` column sets do not fully match the requirement and must be reconciled before coding.

## 9. DB / Migration Impact

- The current V4 schema contains `tbl_fact_ci_run` as a run-level table and `tbl_fact_ci_job` as a separate job-level table.
- The ticket requirement says the main persistence table is `tbl_fact_ci_run` and the grain is one row per GitHub Actions job.
- That means the schema needs a deliberate reconciliation decision, not a blind code change.
- `tbl_connector_run` currently has `records_read` and `records_written`; the ticket wants `received / inserted / updated / skipped / error` counters, so either the table must be extended or the counters must be mapped explicitly and documented.
- Any schema change should be additive where possible and use a new Flyway migration rather than editing an old one.
- Rollback is limited because Flyway Community has no down migration support.

## 10. Batch / Job / Event Impact

- No existing scheduler or queue framework is confirmed in the current source tree for this flow.
- The trigger mode is still an open issue: scheduled batch, manual admin trigger, or webhook-backed ingestion.
- If scheduled batch is chosen, a new Spring scheduling entrypoint or equivalent job runner is needed.
- If manual trigger is chosen, a new admin endpoint or command-style use case is needed.
- If webhook-backed ingestion is chosen, the GitHub Actions event contract must be confirmed first.

## 11. Test Impact

- Add unit tests for status normalization and URL fallback.
- Add unit tests for validation failures: missing job ID, missing repository, invalid timestamp order, and missing URL.
- Add repository or adapter tests for idempotent upsert and counter updates.
- Add integration tests for job-level fan-out: one workflow run with multiple jobs creates multiple rows.
- Add integration tests for dedupe: same job collected twice updates existing data, not duplicate rows.
- Add failure-path tests for connector run logging.
- Add FE tests only if FE scope is confirmed.

## 12. Operation / Monitoring Impact

- Connector execution must be visible through `tbl_connector_run`.
- Logs should include traceId correlation, connector name, repository scope, and safe error messages.
- Do not log tokens, raw payloads, raw CI logs, or command output.
- Operational support should be able to identify failures by connector run record plus traceId.
- No new observability stack is confirmed in the current repo, so alerting remains out of scope unless explicitly added later.

## 13. Rollout / Rollback Impact

- Roll out in small steps: schema reconciliation first, then collector logic, then query / display surface if confirmed.
- Keep the new collector disabled until the auth method and schema direction are confirmed.
- Rollback path for code is simple: disable the new trigger and revert the collector deployment.
- Rollback path for DB is limited to forward repairs or a DB restore because the migration tooling has no down migration support.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| OAuth2 login and session auth | unaffected | No CI work touches `AuthController`, `SecurityConfig`, or `app_user` flow |
| Organization / Team / Customer modules | unaffected | Architecture maps show separate routes, services, and tables |
| Existing GitHub PR webhook ingestion | unaffected | `GithubWebhookService` is a different ingestion path and the ticket out of scope says no raw log parsing |
| Safety pack / security scan collector | unaffected for now | Similar pattern exists, but the ticket is CI metadata only |
| Existing FE login flow | unaffected | No CI-specific FE route exists yet |
| TraceId generation and filter | unaffected | Reuse only; no change needed |
| Current admin connector dashboard | unaffected unless CI query API is added | Route map has only connector admin endpoints, not CI metadata endpoints |

## 15. Required Options

- Decide the CI trigger mode.
- Decide the GitHub Actions authentication method.
- Decide whether FE dashboard/detail work is in scope for this ticket.
- Decide whether the current V4 CI schema is to be altered or replaced via a new migration path.
- Decide how ambiguous GitHub conclusions map to normalized statuses.

## 16. Human Decision Required

- Authentication method for GitHub Actions access.
- Trigger mode for collection.
- Schema reconciliation for `tbl_fact_ci_run` and `tbl_connector_run`.
- FE scope for AC-12 and AC-13.
- Exact status mapping for ambiguous conclusions.
- Whether `tbl_fact_ci_job` remains unused, is deprecated, or is part of the reconciliation plan.

## 17. Risk Summary

- High risk: schema mismatch between existing V4 CI tables and the job-level requirement.
- High risk: trigger and auth decisions are still open.
- Medium risk: FE scope is not yet confirmed.
- Medium risk: test coverage does not exist yet for this flow.
- Low to medium risk: operational counters need a precise mapping to existing connector-run fields.
