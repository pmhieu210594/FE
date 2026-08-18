# Codex Independent Review

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-26
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26

## Review Input

| artifact/source | status |
|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/PmDashboardController.java` | reviewed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | reviewed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardModels.java` | reviewed |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/PmDashboardDtos.java` | reviewed |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/PmDashboardRepositoryPort.java` | reviewed |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | reviewed |
| `EDCAP_BE/src/main/resources/db/migration/V330__pm_dashboard_snapshot.sql` | not read |
| `EDCAP_FE/src/pages/pm-dashboard/PMDashboardPage.tsx` | skimmed via agent summary |
| `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/spec-pack.md` | reviewed (sections 1-6) |
| `EDCAP_BE/documents/docs/changes/PM-DASHBOARD/context.md` | reviewed |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|

*(none)*

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| M-1 | `infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java:46-54` | `rebuildSnapshot()` is a no-op — does not refresh snapshot data | Method body is `SELECT COUNT(*) FROM tbl_fact_ticket_dashboard_snapshot` only; no DML, DDL, or REFRESH statement is executed | Determine whether the snapshot is a materialized view (`REFRESH MATERIALIZED VIEW CONCURRENTLY`) or a physical table (TRUNCATE + INSERT from source tables); implement the appropriate refresh logic | Insert a new row into a source table (e.g., `tbl_fact_ticket_phase_status`), call POST /refresh, then call GET /summary and verify the new row is reflected |
| M-2 | `application/usecase/pmdashboard/PmDashboardService.java:113-114` | CSV export silently truncates at 100 rows with no indication to the caller | `repository.findAllTickets(normalize(..., 1, 100))` hardcodes `size=100`; tickets 101+ are dropped without a `truncated` flag or count in the response | Either (a) query without a page cap for the all-tickets export path, or (b) include `truncated=true` and `totalCount` in the CSV response headers | Create 101 matching tickets, export, verify all 101 rows are present or that the response clearly signals truncation |
| M-3 | `infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java:322-333` | `countMissingTraceabilitySections` reuses `filterParams()` in a JOIN context; unqualified column names (`project_id`, `search_text`, etc.) are fragile | `filterParams` appends `AND project_id = :projectId` with no table prefix; the query JOINs `tbl_fact_ticket_dashboard_snapshot s` and `tbl_fact_artifact_parsed_section p`; if `p` gains a `project_id` column in a future migration, the filter silently uses the wrong table | Add a table-alias parameter to `filterParams()` (e.g., `String tableAlias`) and prefix every appended column with that alias, or inline the filter conditions for the JOIN query | Run the count endpoint with `projectId` and `search` filters active and verify the SQL in logs resolves columns unambiguously |
| M-4 | `application/usecase/pmdashboard/PmDashboardService.java:159-170` | `normalize()` throws `IllegalArgumentException` for invalid `scoreBand`, `riskLevel`, and `search` length; if `GlobalExceptionHandler` does not map this to HTTP 400 the caller receives HTTP 500 | Lines 159-170 throw `new IllegalArgumentException("Pages.PmDashboard.ScoreBand.Invalid")` etc.; no `@ExceptionHandler(IllegalArgumentException.class)` was confirmed in `GlobalExceptionHandler` | Add an `@ExceptionHandler(IllegalArgumentException.class)` → HTTP 400 mapping in `GlobalExceptionHandler`, or introduce a dedicated `ValidationException` that is already handled | Send `GET /api/v1/pm/dashboard/summary?scoreBand=INVALID` with a PM-role user and assert HTTP 400 is returned |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| m-1 | `web/rest/PmDashboardController.java:100-115` | POST `/export` receives all filter criteria via `@RequestParam` (query string); POST body is empty | All filter params are annotated `@RequestParam(required = false)` on a `@PostMapping` method | Change to `@GetMapping` (export is a side-effect-free read) or move filter params to a `@RequestBody` DTO to follow REST conventions |
| m-2 | `application/usecase/pmdashboard/PmDashboardService.java:47,62` | `summary()` and `insights()` call `normalize()` with dummy `page=1, size=20`; these calls never use paging | Lines 47 and 62 pass hardcoded `1, 20` for page/size to `normalize()` | Introduce a `normalizeFilter(...)` overload without page/size parameters to remove the misleading arguments |
| m-3 | `infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java:541-550` | `averageBand()` hardcodes score band thresholds (≥90, ≥75, ≥60, ≥40); spec lists EQS thresholds as an unresolved human decision | Lines 541-550 use literal numeric constants; spec OI items mark thresholds as pending approval | Document approved threshold values in a named constant block with a reference to the approved decision record, or derive band from the most-common `score_band` in the filtered result set |
| m-4 | `application/usecase/pmdashboard/PmDashboardService.java:183` | `normalize()` enforces `Math.max(size, 1)` but not the upper cap of 100; cap is only enforced inside the adapter | Line 183: `Math.max(size, 1)`; adapter `normalizePageSize` enforces the 100 cap separately | Add `Math.min(Math.max(size, 1), 100)` in `normalize()` to match the stated contract at the service boundary |
| m-5 | `infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java:391-394` | Search uses `ILIKE '%...%'` with a leading wildcard; this cannot use a standard B-tree index and will cause full-table scans at scale | Line 393: `params.addValue("searchPattern", "%" + filter.search().trim().toLowerCase() + "%")` | Confirm a `pg_trgm` GIN index exists on `tbl_fact_ticket_dashboard_snapshot.search_text`; if not, add one in the migration |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| Q-1 | Is `tbl_fact_ticket_dashboard_snapshot` a PostgreSQL materialized view, a regular view, or a physical table? | spec-pack Section 12; context.md DTO/Table mapping | Determines the correct implementation for `rebuildSnapshot()` (REFRESH MATERIALIZED VIEW vs. TRUNCATE+INSERT ETL vs. no-op if the view is live) |
| Q-2 | Is there a separate export permission gate beyond PM/ADMIN role? | spec-pack Section 2.1 "Export of visible dashboard data (permission-gated)" | Current code only calls `requirePm()`; spec implies an additional export permission flag may be required |
| Q-3 | Are the score band thresholds (≥90 EXCELLENT, ≥75 GOOD, ≥60 WARNING, ≥40 RISKY) the officially approved values? | spec-pack open issue list (EQS formula and threshold human decision) | If approved thresholds differ, `averageBand()` produces incorrect bands for the summary card |
| Q-4 | Is a trigram (`pg_trgm`) GIN index on `search_text` present in V330 migration? | spec-pack Section 6.5 (< 2s response time NFR) | Without a trigram index, `ILIKE '%...%'` scans the full snapshot table and will breach the 2-second SLA at moderate data volumes |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-1 | M-3 ambiguous column resolution in `countMissingTraceabilitySections` | In practice, `tbl_fact_artifact_parsed_section` likely does not have columns named `project_id`, `period_key`, `repository_id`, `score_band`, or `search_text`; PostgreSQL resolves them unambiguously to the snapshot alias `s`. The risk is schema-drift only. Still raised as Major because the consequence of drift is silent wrong data, not an error. |

## Missing Evidence

- Migration file `V330__pm_dashboard_snapshot.sql` was not read; the snapshot object type (view/materialized view/table) and the presence of a trigram index on `search_text` could not be confirmed.
- `GlobalExceptionHandler` was not read; the handling of `IllegalArgumentException` (M-4) was not confirmed.
- Frontend components were not read directly; only the agent summary was used.

## Suspicious Assumptions

- The implementation assumes `tbl_fact_ticket_dashboard_snapshot` is continuously up to date (e.g., a live view). If it is a stale physical table that requires an ETL job to refresh, M-1 becomes a Blocker.
- `findAllTickets` in `PmDashboardRepositoryPort` accepts a `DashboardFilter` with `size` but the adapter's `findAllTickets` does not apply `LIMIT`/`OFFSET`. The hardcoded `size=100` in `exportCsv` is the only cap. This design assumes export is always bounded at 100, which is not stated in the contract.
- The hardcoded score band thresholds in `averageBand()` (m-3) are assumed to match the approved thresholds. This assumption was not verified against the approved decision log.

## Required Human Decisions

- **Refresh strategy** (Q-1 / M-1): What is the snapshot object type and what SQL should `rebuildSnapshot()` execute?
- **Export permission gate** (Q-2): Does export require an additional permission flag beyond the PM/ADMIN role check?
- **Score band thresholds** (Q-3 / m-3): Are the hardcoded thresholds (≥90/75/60/40) the approved values?
- **Export row cap** (M-2): Is 100 the intended max for export, or should export be uncapped?

## Final Verdict

- NEEDS_UPDATE

Rationale: Two Major findings (M-1 no-op refresh, M-2 silent truncation) affect observable behavior in the production UI. M-3 and M-4 are correctness/robustness risks that should be resolved before promotion. Minor findings are low risk individually but m-3 (hardcoded thresholds) is tied to an unresolved human decision. No Blockers were found.
