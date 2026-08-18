# Context

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29
**Author**: nk_trung   
**Update date**: 2026-06-29

## Screen / API / Batch / Related Job

### Current related screens / read views
- PM Dashboard screen under `/:lang/admin` and the backend read model at `/api/v1/pm/dashboard/*`.
- Admin CI metadata screen / admin flow that reads `/api/v1/admin/ci-run-metadata` for recent CI runs.
- Existing document-parse demo screens and controllers used as parser wiring references, not as ticket scope.

### Current related APIs already in source
- `GET /api/v1/admin/ci-run-metadata`
- `GET /api/v1/pm/dashboard/summary`
- `GET /api/v1/pm/dashboard/insights`
- `GET /api/v1/pm/dashboard/tickets`
- `GET /api/v1/pm/dashboard/tickets/{ticketId}/detail`
- `GET /api/v1/pm/dashboard/options`
- `POST /api/v1/pm/dashboard/export`
- `POST /api/v1/pm/dashboard/refresh`
- `POST /api/v1/demo/impl-plan-parses`
- `POST /api/v1/demo/test-plan-parses`
- `POST /api/v1/demo/test-results-parses`

### Planned KPI / parse API surface from spec-pack, not yet implemented in current source
- A dedicated First CI Pass / Exception KPI read endpoint is resolved by spec-pack, but no controller is present in the current tree.
- A dedicated exception parser for `report.md` / `self-review.md` is required by spec-pack, but no current controller or service is confirmed in source.
- Do not guess the final controller path, DTO names, or parser class names before the implementation phase locks them down.

### Batch / Job
- No `@Scheduled`, `CommandLineRunner`, or `ApplicationRunner` job is confirmed for this KPI in current source.
- Existing ingestion happens through webhooks, connector runs, and request-driven parse services.
- Do not invent a separate cron name, worker name, or queue for this ticket unless a later phase explicitly approves it.

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| CI metadata read service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | Thin service, `@Transactional(readOnly = true)`, role gate, delegate to repository port only |
| CI metadata repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | Parameterized SQL, reuse of `tbl_fact_ci_run`, deterministic ordering, idempotent upsert pattern |
| PM dashboard read service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | Read-only orchestration, filter normalization, no raw SQL in controller |
| PM dashboard repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | Read model from `tbl_fact_ticket_dashboard_snapshot`, detail query for `exception_items` |
| Document parse service pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | `parseAndStore`, `latestSnapshot`, `snapshot`, `detail`, persist snapshot/sections/evidence/data-quality |
| Test result parse service pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Same parse/persist pattern with coverage validation and evidence-quality recalculation |
| Markdown parser core | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Normalize markdown, extract sections/tables, keep parser logic pure and deterministic |
| Artifact parser entrypoint | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Pure parsing helper used by parse services; no persistence or controller logic |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `@Transactional(readOnly = true)` | Spring | Use for KPI read-side queries and metadata lookups |
| `GlobalExceptionHandler` / `ErrorResponse` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception` | Standard HTTP error envelope and traceId handling |
| `TraceIdFilter` | `EDCAP_BE/src/main/java/com/sdd/platform/config/TraceIdFilter.java` | Correlation across parse / KPI / ingestion logs |
| `CiRunRepositoryPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/CiRunRepositoryPort.java` | Existing port for CI-run lookups, inserts, updates, and recent CI metadata |
| `DocParsePersistencePort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DocParsePersistencePort.java` | Existing parse persistence pattern for snapshots, sections, evidence, and data-quality |
| `PmDashboardRepositoryPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/PmDashboardRepositoryPort.java` | Existing read-model port for exception display and dashboard aggregation |
| `ArtifactNormalizer` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Reuse for structured markdown parsing logic |
| `MarkdownParserCore` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Reuse for normalized markdown section extraction |
| `AppUser` / `AuthUserContext` | domain model | Reuse for permission checks and caller context |
| `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception` | V4 schema | Reuse existing fact tables first |
| `tbl_fact_artifact_snapshot`, `tbl_fact_artifact_parsed_section`, `tbl_fact_evidence_event`, `tbl_fact_data_quality` | V4 schema | Reuse existing parse/audit tables if the parser is wired through the common doc-parse framework |
| `tbl_dim_role` | V4 schema | Reuse role master for approval-role resolution |

## Forbidden common components

| component | reason |
|---|---|
| Direct controller-level SQL | Breaks hexagonal layering and makes the KPI logic hard to test |
| Raw CI logs, raw chat, raw prompt, or source-full-text persistence | Explicitly forbidden by spec-pack and security policy |
| Generic free-text inference for exceptions | `Accepted Risk` / `Open Issues` text must not be treated as an exception unless the dedicated exception section says so |
| New KPI summary table / snapshot table by default | Spec-pack says reuse existing V4 schema first |
| Non-existent route helpers such as `endpoints.firstCiPassKpi.*` | No such FE helper exists in the current source tree |
| Invented parser methods, controller methods, or repository methods | If the method is not in source, do not treat it as available |
| Web layer importing infrastructure classes | Violates hexagonal layer boundaries |
| Storing personal names instead of role references for approval | Must remain role-based and minimal |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `CiRunMetadataService.recent(int, AppUser)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CiRunMetadataService.java` | Admin-only recent CI metadata read path |
| `CiRunJdbcAdapter.findLatestCiRunByRepositoryAndTicket(UUID, UUID)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CiRunJdbcAdapter.java` | Existing lookup for latest CI run by repository and ticket |
| `CiRunJdbcAdapter.findRecentCiRuns(int)` | same file | Existing recent-run query |
| `CiRunJdbcAdapter.findCiRunIdByIdentity(String, UUID, String, String)` | same file | Idempotency lookup by provider/repository/run/job identity |
| `CiRunJdbcAdapter.insertCiRun(CiRun)` | same file | Idempotent CI-run insert/upsert path |
| `CiRunJdbcAdapter.updateCiRun(CiRun)` | same file | CI-run update path |
| `PmDashboardService.summary(...)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardService.java` | PM dashboard summary read path |
| `PmDashboardService.insights(...)` | same file | PM dashboard insight read path |
| `PmDashboardService.tickets(...)` | same file | PM dashboard paged ticket read path |
| `PmDashboardService.detail(UUID, AuthUserContext)` | same file | PM dashboard detail read path |
| `PmDashboardService.refresh(AuthUserContext)` | same file | Refresh delegation path |
| `PmDashboardService.options(UUID, AuthUserContext)` | same file | Filter options path |
| `PmDashboardService.exportCsv(...)` | same file | CSV export path |
| `PmDashboardJdbcAdapter.findSummary(DashboardFilter)` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/PmDashboardJdbcAdapter.java` | Read-model summary query |
| `PmDashboardJdbcAdapter.findInsights(DashboardFilter)` | same file | Insight read-model query |
| `PmDashboardJdbcAdapter.findTickets(DashboardFilter)` | same file | Paged ticket read-model query |
| `PmDashboardJdbcAdapter.findAllTickets(DashboardFilter)` | same file | Export query source |
| `PmDashboardJdbcAdapter.findDetail(UUID)` | same file | Detail view query that joins exception items |
| `ImplPlanParseService.parseAndStore(ParseRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/ImplPlanParseService.java` | Parser + persist pattern for markdown artifacts |
| `ImplPlanParseService.latestSnapshot(UUID, ParseMode)` | same file | Snapshot lookup pattern |
| `ImplPlanParseService.snapshot(UUID)` | same file | Snapshot lookup by id |
| `ImplPlanParseService.detail(UUID)` | same file | Rehydrate parsed sections / warnings |
| `TestResultsParseService.parseAndStore(ParseRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Parser + persist pattern with validation |
| `TestResultsParseService.latestSnapshot(UUID, ParseMode)` | same file | Snapshot lookup pattern |
| `TestResultsParseService.snapshot(UUID)` | same file | Snapshot lookup by id |
| `TestResultsParseService.detail(UUID)` | same file | Rehydrate parsed sections / warnings |
| `TestPlanParseService.parseAndStore(ParseRequest)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Parser + persist pattern for test-plan markdown |
| `DocParsePersistencePort.upsertSnapshot(ParseSnapshot)` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/DocParsePersistencePort.java` | Persist parsed snapshot |
| `DocParsePersistencePort.replaceSections(UUID, UUID, List<ParseField>)` | same file | Persist parsed section rows |
| `DocParsePersistencePort.findLatestSnapshot(UUID, String, ParseMode)` | same file | Snapshot lookup by ticket/type/mode |
| `DocParsePersistencePort.findSnapshotById(UUID)` | same file | Snapshot detail lookup |
| `DocParsePersistencePort.findSections(UUID)` | same file | Section detail lookup |
| `DocParsePersistencePort.persistEvidenceEvent(ParseEvidenceEvent)` | same file | Persist parse/compute evidence event |
| `DocParsePersistencePort.persistDataQuality(ParseDataQuality)` | same file | Persist parse/data-quality issues |
| `ArtifactNormalizer.parse(String)` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Pure markdown parsing entrypoint |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `GET /api/v1/kpi/ci-first-pass` | Not present in the current source tree | Define the final KPI endpoint only after the implementation contract is locked |
| `GET /api/v1/kpi/exceptions` | Not present in the current source tree | Reuse existing read models until a dedicated route is approved |
| `GET /api/v1/tickets/{ticketId}/kpi` | Not present in the current source tree | Add only when the controller contract is confirmed |
| `GET /api/v1/projects/{projectId}/kpi` | Not present in the current source tree | Add only when the controller contract is confirmed |
| `FirstCiPassExceptionKpiService` | No such service exists in current source | Create only in the implementation phase after the package / contract is confirmed |
| `FirstCiPassExceptionKpiController` | No such controller exists in current source | Do not assume a final route path yet |
| `parseReportMd()` / `parseSelfReviewMd()` | No dedicated parser methods exist in current source | Use the common markdown parser pattern and define the final API in `impl-plan.md` first |
| `source_section` column on `tbl_fact_exception` | The current V4 DDL does not define this column | If provenance must be persisted, add the minimal nullable migration first |
| `approved_by_role` free-text display values as the authoritative DB source | The schema uses role references, not names as the source of truth | Resolve to `tbl_dim_role.role_id` when possible; otherwise store null plus warning |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| Application model | `CiRunModels.CiRunMetadataView` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/CiRunModels.java` | Existing CI metadata read model |
| Application model | `PmDashboardModels.DashboardTicketRow` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/pmdashboard/PmDashboardModels.java` | Existing read model exposes `exceptionCount` and `ciFailedCount` |
| Application model | `PmDashboardModels.ExceptionItem` | same file | Existing exception detail shape for dashboard read model |
| Application model | `DocParseModels.ParseRequest` / `ParseResult` / `ParseSnapshot` / `ParseField` / `ParseDataQuality` / `ParseEvidenceEvent` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/DocParseModels.java` | Existing parser data flow pattern |
| Domain model | `CiRun` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/CiRun.java` | Existing CI-run entity |
| Domain model | `ConnectorRun` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ConnectorRun.java` | Existing run-tracking entity |
| Table | `tbl_fact_ci_run` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Run-level source for First CI Pass |
| Table | `tbl_fact_ci_job` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Job-level diagnostics only |
| Table | `tbl_fact_exception` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Exception governance fact table |
| Table | `tbl_dim_role` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Role master for approval role resolution |
| Table | `tbl_dim_ticket` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Ticket scope and ticket/PR linkage |
| Table | `tbl_fact_pull_request` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | PR scope and PR-to-ticket linkage |
| Table | `tbl_fact_artifact_snapshot` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Parser snapshot anchor if report/self-review parsing is wired through common doc-parse flow |
| Table | `tbl_fact_artifact_parsed_section` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Parsed section detail table if parser flow is reused |
| Table | `tbl_fact_evidence_event` | V4 schema / existing evidence event table | Operational and parse event lineage if needed |
| Table | `tbl_fact_data_quality` | V4 schema / existing data-quality table | Warnings, malformed rows, and missing-section issues if reused |
| Migration | `V4__init_shema_v2.sql` | `EDCAP_BE/src/main/resources/db/migration/` | Canonical schema source for current tables |
| Migration | minimal nullable add-column migration for `tbl_fact_exception.source_section` | not yet present | Needed only if provenance must be persisted in the DB and cannot be encoded elsewhere |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| First CI Pass grain | `pr_id` / repository scope | `tbl_fact_pull_request` + `tbl_fact_ci_run` | KPI is at PR grain, not job grain |
| CI run status | `SUCCESS` / non-`SUCCESS` | `tbl_fact_ci_run.status` | Only normalized `SUCCESS` counts as first-pass success |
| Exception type | `NO_VERIFY` | exception section in `report.md` / `self-review.md` | Parsed from explicit exception record only |
| Exception type | `CI_SKIP` | same | Parsed from explicit exception record only |
| Exception type | `TEST_SKIP` | same | Parsed from explicit exception record only |
| Exception type | `SECURITY_SCAN_DISABLED` | same | Parsed from explicit exception record only |
| Exception type | `EMERGENCY_MERGE` | same | Parsed from explicit exception record only |
| Exception type | `OTHER` | same | Fallback only when the source explicitly uses an unclassified exception record |
| Follow-up status | `OPEN` | `tbl_fact_exception.follow_up_status` | Default unresolved state |
| Follow-up status | `RESOLVED` | `tbl_fact_exception.follow_up_status` | Resolved state |
| Follow-up status | `EXPIRED` | `tbl_fact_exception.follow_up_status` | Expired / stale state |
| Approval role | `PM`, `DEV`, `QA`, `ADMIN` | `tbl_dim_role.role_name` | Current V4 role master values |
| Approval role display text | `Tech Lead`, `QA Lead`, `Security`, `Other` | source markdown text | Resolve only when an explicit mapping to an existing role is defined; otherwise store null plus warning |
| Parse mode | `DRAFT` / `OFFICIAL` | `DocParseModels.ParseMode` | Existing parse mode enum |
| Source section | `report.md` / `self-review.md` + section identifier | source markdown / future provenance field | Keep the exact source section and preserve row order as `SEQNO` / source order if a later parser needs ordering |
| Warning code | `CI_RUN_NOT_FOUND`, `CI_STATUS_UNKNOWN`, `EXCEPTION_SECTION_MISSING`, `EXCEPTION_ROW_INCOMPLETE`, `APPROVED_ROLE_UNRESOLVED`, `EXCEPTION_DUPLICATE` | spec-pack / raw design | Use warnings for data-quality handling rather than silent fallback |

## Multilingual Note

- Preserve UTF-8 for all markdown, logs, and JSON payloads.
- Keep Vietnamese diacritics intact in artifact text and warning messages.
- Do not translate technical identifiers such as `tbl_fact_ci_run`, `NO_VERIFY`, `OPEN`, `SUCCESS`, `PM`, or path strings.
- If a source section title is in another language, keep the original title as provenance and store only normalized keys alongside it.

## Encoding / Mojibake Note

- Do not split strings by byte; use character-safe string handling only.
- Avoid mojibake when parsing report/self-review text that contains Vietnamese, English, or mixed-language content.
- Preserve the exact file path and source hash when computing parse idempotency.
- Do not trim or normalize Unicode in a way that changes the meaning of exception text or approval-role text.

## Log / Audit / Operation Note

- Log `traceId`, `ticketId`, `repositoryId`, `prId`, `sourcePath`, `parserVersion`, `parseStatus`, and warning counts for parse / KPI operations.
- Do not log raw markdown content, raw CI logs, prompt text, secrets, or tokens.
- Keep Data Ops / audit visibility through structured parse warnings and evidence events, not through raw payload dumps.
- Preserve idempotency signals such as source hash and parser version in logs or evidence rows.
- Existing connector-run logging should continue to use `tbl_connector_run` for collector operations; this ticket must not create a separate raw-log store.

## Ticket-Specific Constraints

- First CI Pass is PR-grain only.
- Exception KPI must be driven by explicit exception records, not generic risk text.
- Missing exception sections must create warnings / data-quality issues, not synthetic exceptions.
- Re-running the parser on the same source hash must not duplicate CI or exception rows.
- No FE implementation is part of this phase.
- Keep any new provenance storage minimal and nullable if the current schema needs a small additive migration.
