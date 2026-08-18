# Context

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## Screen / API / Batch / Related Job

| category | item | current state | note |
|---|---|---|---|
| FE page | `QADashboardPage.tsx` | **Already built — uses `QA_MOCK_DATA`** | Main page; wire-up to real API is the FE work |
| FE component | `QaSummaryCards` | Already built | 6 KPI cards; receives `QaSummary` typed prop |
| FE component | `QaFilterBar` | Already built | Emits `QaFilters` (projectId, repositoryId, periodKey, search) |
| FE component | `AcceptanceCriteriaTable` | Already built | Receives `AcceptanceCriteriaRow[]` |
| FE component | `CoverageTrendChart` | Already built | Receives `AcCoverageTrendPoint[]` |
| FE component | `RoleTabs` | Already built | All 6 tabs shown to all authenticated users; QA + PM are functional routes |
| FE route | `/qa-dashboard` | Already registered in `RoleTabs.tsx` | No new route registration needed |
| FE API | `endpoints.qaDashboard.*` | **Does not exist yet** | Must add to `EDCAP_FE/src/lib/api.ts` following `pmDashboard` pattern |
| BE endpoint | `GET /api/v1/qa/dashboard/summary` | **Does not exist yet** | Returns `QaDashboardSummaryDto` (portfolio KPI cards) |
| BE endpoint | `GET /api/v1/qa/dashboard/acceptance-criteria` | **Does not exist yet** | Returns `List<AcceptanceCriteriaRowDto>` (AC table) |
| BE endpoint | `GET /api/v1/qa/dashboard/coverage-trend` | **Does not exist yet** | Returns `List<AcCoverageTrendPointDto>` (chart data) |
| Sibling pattern | `PMDashboardPage.tsx` | Existing | Closest FE dashboard pattern; no role check in page |
| Sibling pattern | `pmDashboard` section in `api.ts` | Existing | Pattern: `GET /api/v1/pm/dashboard/{summary|insights|options|tickets}` |
| Sibling pattern | `PMDashboardController.java` / `PMDashboardService.java` | Existing — must read before Phase 3 | Authoritative BE pattern for dashboard endpoints |
| Batch / Job | None | N/A | No batch/job in scope; dashboard reads live on each request |
| External IF | GitHub / Jira / CircleCI connectors | Existing, unrelated | Do not touch; dashboard reads from already-parsed V4 tables only |

---

## Example of correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE dashboard page (closest sibling) | `EDCAP_FE/src/pages/pm-dashboard/PMDashboardPage.tsx` | No role check; uses `useQuery`; passes typed data to sub-components |
| FE API endpoints definition | `EDCAP_FE/src/lib/api.ts` — `pmDashboard` section | Add `qaDashboard.summary/acceptanceCriteria/coverageTrend` following same function shape |
| FE page to wire up | `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Replace `QA_MOCK_DATA` with three `useQuery` calls; add loading/error states |
| FE types (authoritative API shape) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | `QaSummary`, `AcceptanceCriteriaRow`, `AcCoverageTrendPoint`, `QaDashboardData` — BE DTO field names must match exactly |
| BE REST controller | `EDCAP_BE/.../web/rest/OrganizationController.java` | Thin controller; `@CurrentUser AppUser caller`; delegate to service; no business logic |
| BE DTO records | `EDCAP_BE/.../web/dto/OrganizationDtos.java` | Java records with static `from(...)` mapper; use dedicated `QaDashboardDtos.java` |
| BE use case / service | `EDCAP_BE/.../application/usecase/governance/OrganizationService.java` | Centralize aggregation logic; `@Transactional(readOnly = true)` for read-only service methods |
| BE persistence port | `EDCAP_BE/.../application/port/out/persistence/OrganizationRepositoryPort.java` | Application depends on port; adapter implements port; mapper is internal to adapter |
| BE adapter | `EDCAP_BE/.../infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java` | Implements port; delegates to mapper; translates domain exceptions |
| BE mapper | `OrganizationMapper.java` + `OrganizationMapper.xml` | MyBatis `@Mapper` interface + XML with named params (`#{param}`) |
| BE exception handling | `GlobalExceptionHandler.java` + `ErrorResponse.java` | Single mapping point; never ad-hoc `ResponseEntity` status codes in controllers |

---

## Allowed common components

| component | path | usage note |
|---|---|---|
| `QaSummaryCards` | `EDCAP_FE/src/pages/qa-dashboard/components/QaSummaryCards.tsx` | Already built; pass real `QaSummary` data prop |
| `QaFilterBar` | `EDCAP_FE/src/pages/qa-dashboard/components/QaFilterBar.tsx` | Already built; emits `QaFilters`; wire to `useQuery` refetch |
| `AcceptanceCriteriaTable` | `EDCAP_FE/src/pages/qa-dashboard/components/AcceptanceCriteriaTable.tsx` | Already built; pass real `AcceptanceCriteriaRow[]` |
| `CoverageTrendChart` | `EDCAP_FE/src/pages/qa-dashboard/components/CoverageTrendChart.tsx` | Already built; pass real `AcCoverageTrendPoint[]` |
| `RoleTabs` | `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Already includes QA route; no changes needed |
| `api` / `endpoints` | `EDCAP_FE/src/lib/api.ts` | Add `qaDashboard.*` section here only; no direct `fetch` elsewhere |
| `useQuery` (TanStack Query) | via `@tanstack/react-query` | Required for all async server data; three separate `useQuery` calls in `QADashboardPage` |
| `@Transactional(readOnly = true)` | Spring | Use on service methods that only read from DB |
| `@CurrentUser AppUser` | `EDCAP_BE/.../web/security/` | Resolve authenticated user in controller if needed |
| MyBatis named params `#{param}` | MyBatis | All filter parameters must use named params — no string concatenation |
| `GlobalExceptionHandler` | `EDCAP_BE/.../web/exception/GlobalExceptionHandler.java` | Only place where exceptions map to HTTP status |
| `TraceIdFilter` | Existing | Covers all `/api/**` — no additional config needed for `/api/v1/qa/**` |

---

## Forbidden common components

| component | reason |
|---|---|
| Direct `fetch()` in FE components | Bypasses shared credentials, error handling, traceId, and type safety in `api.ts` |
| `axios` or `XMLHttpRequest` outside `api.ts` | Same as above |
| `QA_MOCK_DATA` after wire-up | Must be deleted or replaced; do not leave mock data in production code path |
| DB views / materialized views | `database_design.md §11` explicitly forbids; aggregation must be in service layer |
| Flyway migration (new V5+) | No new tables; no schema changes for QA Dashboard PoC |
| INSERT / UPDATE / DELETE in any mapper XML | BR-1: dashboard is entirely read-only |
| `tbl_fact_finding.root_cause_phase` column reference | Column does not exist in V4 SQL — see §12 of spec-pack |
| Sprint column in `tbl_dim_ticket` | Column does not exist — use `periodKey` mapped to `started_at` date range |
| Ad-hoc `ResponseEntity` status codes in controllers | Use `GlobalExceptionHandler`; controllers must not set HTTP status manually |
| `@Data` on domain models | Forbidden by `rules/10-style.md`; use `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor` |
| `@Autowired` field injection | Forbidden; constructor injection only |
| New `AppUser.Role` enum value (QA, PM, etc.) | No new role values — all authenticated users can access; current enum is `VIEWER / EDITOR / ADMIN` |

---

## List of methods that actually exist

| method / class | path | usage |
|---|---|---|
| `QADashboardPage` | `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Already built; currently uses `QA_MOCK_DATA`; wire-up target |
| `QaSummary` (type) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Authoritative FE type — BE DTO fields must match exactly |
| `AcceptanceCriteriaRow` (type) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Authoritative shape for AC table rows |
| `AcCoverageTrendPoint` (type) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Authoritative shape for trend chart data points |
| `QaDashboardData` (type) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Wrapper type containing all three data sections |
| `QaFilters` (type) | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | `{ projectId, repositoryId, periodKey, search }` — filter params sent to BE |
| `pmDashboard.*` endpoints | `EDCAP_FE/src/lib/api.ts` | Pattern to copy for `qaDashboard.summary`, `.acceptanceCriteria`, `.coverageTrend` |
| `endpoints.me()` | `EDCAP_FE/src/lib/api.ts` | Current user source if role check needed |
| `api.get` | `EDCAP_FE/src/lib/api.ts` | Shared GET helper; use for all three QA dashboard endpoints |
| `AppUser.Role` enum | `EDCAP_BE/.../domain/model/AppUser.java` | Values: `VIEWER`, `EDITOR`, `ADMIN` — no QA or PM value |
| `OrganizationController` methods | `EDCAP_BE/.../web/rest/OrganizationController.java` | Pattern for thin controller |
| `OrganizationService` methods | `EDCAP_BE/.../application/usecase/governance/OrganizationService.java` | Pattern for service aggregation logic |
| `OrganizationRepositoryPort` methods | `EDCAP_BE/.../application/port/out/persistence/OrganizationRepositoryPort.java` | Pattern for port interface |
| `LayerEnforcementTest` | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | ArchUnit test — must stay green; no new `allowedPackage` exceptions |
| `TraceIdFilter` (covers `/api/**`) | Existing Spring filter | Auto-covers `/api/v1/qa/dashboard/**` — no additional config |
| `tbl_dim_ticket` V4 columns (confirmed) | `V4__init_shema_v2.sql` | `ticket_id`, `project_id`, `external_ticket_key`, `ticket_type`, `priority`, `status`, `title`, `created_at`, `started_at`, `closed_at`, `merged_at`, `updated_at` |
| `tbl_fact_finding` V4 columns (confirmed) | `V4__init_shema_v2.sql` | `finding_id`, `ticket_id`, `pr_id`, `review_id`, `review_comment_id`, `source_actor_type_id`, `category_id`, `severity` (enum DEFAULT 'MEDIUM'), `status` (enum DEFAULT 'OPEN'), `accepted_flag`, `false_positive_reason`, `finding_summary`, `source_location_hash`, `detected_at`, `resolved_at` |
| `tbl_fact_ac_test_coverage` V4 columns (confirmed) | `V4__init_shema_v2.sql` | `ac_test_coverage_id`, `ticket_id`, `ac_id`, `artifact_snapshot_id`, `ac_key`, `ac_text_hash`, `test_case_id`, `test_run_id`, `coverage_status` (VARCHAR 50), `calculated_at`. Index on `(ticket_id, coverage_status)` |

---

## Forbidden methods / methods that do not exist

| method / API | reason | alternative |
|---|---|---|
| `AcCoveragePort.findActiveAcKeys(UUID ticketId)` | **Exists** — `application/port/out/persistence/AcCoveragePort.java` (feature/AC-TEST-COVERAGE) | Returns ac_key list from tbl_fact_acceptance_criteria; NOT reusable for dashboard aggregate counts |
| `AcCoverageJdbcAdapter` | **Exists** — `infrastructure/persistence/adapter/docparse/AcCoverageJdbcAdapter.java` | Implements AcCoveragePort; JDBC pattern confirmed for dashboard adapter |
| `QaDashboardController` | Created in Phase 5 | `web/rest/QaDashboardController.java` |
| `QaDashboardService` | Created in Phase 5 | `application/usecase/qadashboard/QaDashboardService.java` |
| `QaDashboardRepositoryPort` | Created in Phase 5 | `application/port/out/persistence/QaDashboardRepositoryPort.java` |
| `QaDashboardJdbcAdapter` | Created in Phase 5 | `infrastructure/persistence/adapter/QaDashboardJdbcAdapter.java` — JDBC, no mapper XML |
| `endpoints.qaDashboard.*` | Created in Phase 5 | Added to `EDCAP_FE/src/lib/api.ts` |
| `tbl_fact_finding.root_cause_phase` | Column does not exist in V4 SQL — do not reference | `defectLeakageCount` = COUNT WHERE `status != 'RESOLVED'` (no phase split) |
| `tbl_dim_ticket.sprint` | Column does not exist | Use `periodKey` → date range on `started_at` |
| `QaAcTestCoverageMapper` / `.xml` | **Not created — JDBC decision** | Dashboard uses `QaDashboardJdbcAdapter` with inline SQL; no mapper XML |
| `QaFindingMapper` / `.xml` | **Not created — JDBC decision** | Same as above |
| `QaTestRunMapper` / `.xml` | **Not created — JDBC decision** | Same as above |
| Blackbox viewpoint parser for `tbl_fact_artifact_parsed_section` | **Does not exist** — confirmed Phase 5 | No code writes viewpoint rows to this table; `blackboxCoveragePercent = 0` placeholder (Accepted Risk) |
| `AppUser.Role.QA` / `AppUser.Role.PM` | These enum values do not exist | All authenticated users can access; no role guard on dashboard |
| `acceptanceReadyCount` formula / implementation | **Deferred — H-QA-DASHBOARD-4** | Returns `0` for PoC until formula decided |
| `blackboxCoveragePercent` real implementation | **Deferred — blackbox parser not yet implemented** | Returns `0.0` for PoC; no data in tbl_fact_artifact_parsed_section for viewpoints |

---

## DTO / Entity / Table / Migration mapping

| layer | name | path | note |
|---|---|---|---|
| FE type (authoritative) | `QaSummary` | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | BE response DTO field names must match exactly |
| FE type (authoritative) | `AcceptanceCriteriaRow` | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | BE response DTO field names must match exactly |
| FE type (authoritative) | `AcCoverageTrendPoint` | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | BE response DTO field names must match exactly |
| FE type | `QaFilters` | `EDCAP_FE/src/pages/qa-dashboard/types.ts` | Query param shape: `projectId`, `repositoryId`, `periodKey`, `search` |
| FE API helpers | `endpoints.qaDashboard.*` | `EDCAP_FE/src/lib/api.ts` (to be added) | Follow `pmDashboard.*` pattern |
| BE controller | `QaDashboardController` | `EDCAP_BE/.../web/rest/` (to be created) | 3 GET endpoints; thin; no business logic |
| BE DTO | `QaDashboardSummaryDto` | `EDCAP_BE/.../web/dto/QaDashboardDtos.java` (to be created) | Fields must match `QaSummary` FE type |
| BE DTO | `AcceptanceCriteriaRowDto` | `EDCAP_BE/.../web/dto/QaDashboardDtos.java` (to be created) | Fields must match `AcceptanceCriteriaRow` FE type |
| BE DTO | `AcCoverageTrendPointDto` | `EDCAP_BE/.../web/dto/QaDashboardDtos.java` (to be created) | Fields must match `AcCoverageTrendPoint` FE type |
| BE service | `QaDashboardService` | `EDCAP_BE/.../application/usecase/` (to be created) | Aggregation logic: BR-2, BR-3, BR-4 |
| BE port | `QaDashboardQueryPort` | `EDCAP_BE/.../application/port/out/persistence/` (to be created) | Read-only port; all methods return Optional or List |
| BE adapter | `QaDashboardRepositoryAdapter` | `EDCAP_BE/.../infrastructure/persistence/adapter/` (to be created) | Implements `QaDashboardQueryPort`; delegates to mappers |
| BE mapper | `QaAcTestCoverageMapper.java` + `.xml` | `infrastructure/persistence/mapper/` (to be created) | Reads `tbl_fact_ac_test_coverage` |
| BE mapper | `QaFindingMapper.java` + `.xml` | (to be created) | Reads `tbl_fact_finding` WHERE `status != 'RESOLVED'` |
| BE mapper | `QaTestRunMapper.java` + `.xml` | (to be created) | Reads `tbl_fact_test_run` — verify columns from V4 SQL before creating |
| BE mapper | `QaArtifactSnapshotMapper.java` + `.xml` | (to be created) | Checks artifact existence by type per ticket |
| BE mapper | `QaArtifactParsedSectionMapper.java` + `.xml` | (to be created) | Reads blackbox viewpoints by ticket_id |
| DB table | `tbl_dim_ticket` | `V4__init_shema_v2.sql` | V4 columns confirmed — see methods table above |
| DB table | `tbl_dim_project` | `V4__init_shema_v2.sql` | Columns not fully verified — read SQL before writing mapper |
| DB table | `tbl_dim_repository` | `V4__init_shema_v2.sql` | Columns not fully verified — read SQL before writing mapper |
| DB table | `tbl_fact_ac_test_coverage` | `V4__init_shema_v2.sql` | Columns confirmed — see methods table above |
| DB table | `tbl_fact_finding` | `V4__init_shema_v2.sql` | Columns confirmed — see methods table above |
| DB table | `tbl_fact_test_run` | `V4__init_shema_v2.sql` | Columns partially confirmed — must verify full column list before writing mapper |
| DB table | `tbl_fact_artifact_snapshot` | `V4__init_shema_v2.sql` | Columns partially confirmed — must verify |
| DB table | `tbl_fact_artifact_parsed_section` | `V4__init_shema_v2.sql` | Columns partially confirmed — must verify |
| DB migration | None | N/A | No new migration; no schema changes for QA Dashboard PoC |

---

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display / item | internal value | source | note |
|---|---|---|---|
| AC Coverage status — Covered | `'COVERED'` | `tbl_fact_ac_test_coverage.coverage_status` | Count WHERE `coverage_status = 'COVERED'` for numerator |
| AC Coverage status — Not Tested | `'NOT_TESTED'` | `tbl_fact_ac_test_coverage.coverage_status` | Count WHERE `coverage_status = 'NOT_TESTED'` for `acNotTestedCount` |
| Release Readiness — Ready | `READY` | Derived in service (BR-4: all 7 conditions met) | Green badge in FE |
| Release Readiness — Partial | `PARTIAL` | Derived in service (BR-4: ≥1 but not all conditions met) | Amber badge |
| Release Readiness — Not Ready | `NOT_READY` | Derived in service (BR-4: 0 or critical conditions unmet) | Red badge |
| Finding status — Resolved | `'RESOLVED'` | `tbl_fact_finding.status` (finding_status enum) | Exclude from `defectLeakageCount` |
| Finding status — Open | `'OPEN'` | `tbl_fact_finding.status` (DEFAULT 'OPEN') | Include in `defectLeakageCount` |
| Finding severity | `'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'` | `tbl_fact_finding.severity` (severity_level enum, DEFAULT 'MEDIUM') | Used in BR-4 condition 6 |
| Blackbox viewpoint 1 | `Normal` | Requirement §6.4; confirmed by user | Denominator = 8 viewpoints |
| Blackbox viewpoint 2 | `Error` | Requirement §6.4 | |
| Blackbox viewpoint 3 | `Boundary` | Requirement §6.4 | |
| Blackbox viewpoint 4 | `Permission` | Requirement §6.4 | |
| Blackbox viewpoint 5 | `State Transition` | Requirement §6.4 | |
| Blackbox viewpoint 6 | `Operation` | Requirement §6.4 | |
| Blackbox viewpoint 7 | `Audit` | Requirement §6.4 | |
| Blackbox viewpoint 8 | `Compatibility` | Requirement §6.4 | |
| `periodKey` filter | e.g. `"2026-W23"` | `QaFilters.periodKey` (FE type) | Maps to date range on `tbl_dim_ticket.started_at`; no Sprint column |
| Default ticket list sort | Release Readiness ASC (NOT_READY first), then FAIL count DESC | BR-7 | Applied in service or DB ORDER BY |
| `acceptanceReadyCount` formula | **DEFERRED — H-QA-DASHBOARD-4** | Pending product decision | Return `0` for PoC until formula defined |
| `formItemNm` | N/A | Not applicable | No form submission in QA Dashboard; read-only only |
| `SEQNO` | N/A | Not applicable | No sequence-number ordering field in this feature |

---

## Multilingual Note

- QA Dashboard page labels (card titles, column headers, filter labels) use existing i18n pattern if present in FE locale files.
- BE error messages flow through `ErrorResponse.message`; treat as untranslated internal message for PoC.
- No new Vietnamese/Japanese-specific locale keys are required for PoC.
- If locale keys are added to FE, add to all three locale files (`en`, `ja`, `vi`) in the same commit.
- Do not hard-code user-facing labels in components if the surrounding components already use `useTranslation`.

---

## Encoding / Mojibake Note

- Preserve UTF-8 for all Java, TypeScript, XML, and JSON files.
- MyBatis XML must include `<?xml version="1.0" encoding="UTF-8"?>`.
- Do not copy mojibake strings from terminal output into locale files or comments.
- No Shift-JIS or Windows-1252 encoding in new files.

---

## Log / Audit / Operation Note

- `TraceIdFilter` covers all `/api/**` requests — `/api/v1/qa/dashboard/**` is automatically covered. No additional filter configuration needed.
- Dashboard is read-only: no audit log required for read operations.
- Do not log query result data, AC text, finding summaries, or ticket content to application logs (internal operational data).
- Log query errors at ERROR level with `traceId` correlation via `GlobalExceptionHandler` — no stack traces to client.
- If a V4 fact table is empty (parser has not run yet): service returns 0 values, not null, not exception.
- DB unavailability: `GlobalExceptionHandler` returns standard `ErrorResponse` with status 500 and `traceId`.

---

## Ticket-Specific Constraints

- Phase 2 creates context/rules/planning/skeleton artifacts only. No source code in Phase 2.
- All new BE endpoints follow hexagonal arch: `web/rest` → `application/usecase` → `application/port` → `infrastructure/persistence/adapter` → `infrastructure/persistence/mapper` → DB.
- Web layer must not import from `infrastructure` directly (ArchUnit enforced).
- `acceptanceReadyCount` field: return hardcoded `0` for PoC until H-QA-DASHBOARD-4 is decided. Do not invent a formula.
- Blackbox coverage denominator is fixed at 8 viewpoints (confirmed by user 2026-06-26).
- All numeric response fields default to `0` — never `null`. Divide-by-zero must be handled in service (BR-2: Total AC = 0 → return 0.0, not NaN or exception).
- V4 fact table column names for `tbl_fact_test_run`, `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section` are partially confirmed — must read full V4 SQL before writing any mapper for those tables.
- Do not modify existing endpoints, controllers, or services unrelated to QA Dashboard.
- Do not edit `V4__init_shema_v2.sql` — it is a committed migration.
