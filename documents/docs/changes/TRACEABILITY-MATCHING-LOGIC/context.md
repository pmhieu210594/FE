# Context

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## Screen / API / Batch / Related Job

| type | name | path / endpoint | current state | note |
|---|---|---|---|---|
| Screen | Traceability Map | `/traceability` | Planned | Defined in `raw/wireframe.md`; read-only UI for traceability, timeline, and broken links. |
| API | Traceability query API | TBD under `/api/v1/**` | Not found in source tree | No dedicated read API exists yet; implementation must be confirmed before adding controller/service methods. |
| Job / Use case | Git PR Metadata Collector | `application/usecase/ingestion/GitPrMetadataCollectorService.java` | Existing | Current write-side flow already creates `tbl_fact_traceability_link` rows. |
| Job / Use case | Artifact Scanner | `application/usecase/scanner/ArtifactScannerService.java` | Existing | Existing artifact snapshot pipeline for `tbl_fact_artifact_snapshot` and ticket reuse patterns. |
| Batch / Job | Background batch | Not in scope for this phase | Not used | Read-only traceability view should not introduce queue/job processing in Phase 2. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Idempotent traceability link persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | `upsertTraceabilityLink(...)` uses `ON CONFLICT (source_type, source_id, target_type, target_id)` and updates evidence/rule data instead of inserting duplicates. |
| Existing traceability write flow | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GitPrMetadataCollectorService.java` | `persistPullRequest(...)` writes ticket -> PR, PR -> commit, and PR -> file links from confirmed graph data; do not infer links from unconfirmed UI state. |
| Safe ticket reuse | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | `upsertMinimalTicket(...)` reuses `tbl_dim_ticket` rows by natural key instead of creating duplicates. |
| Read-only retrieval pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | `getRunArtifacts(...)` and `getCurrentInventory(...)` expose data without mixing read logic into controllers. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `tbl_fact_traceability_link` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Current traceability link table; use this name only. |
| `tbl_fact_artifact_snapshot` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Artifact source for traceability completeness and evidence display. |
| `tbl_fact_pull_request` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | PR source for matching and read-model joins. |
| `tbl_fact_ci_run` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | CI source for traceability and timeline display. |
| `tbl_fact_evidence_event` | current DB schema / existing evidence timeline tables | Timeline source; reuse existing event model if present. |
| `tbl_dim_ticket` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Root entity for traceability. |
| `GitPrMetadataCollectorPersistencePort` | `application/port/out/persistence/GitPrMetadataCollectorPersistencePort.java` | Existing port for traceability write-side persistence. |
| `ArtifactScannerPersistencePort` | `application/port/out/persistence/ArtifactScannerPersistencePort.java` | Existing port for ticket and artifact lookup/reuse patterns. |
| `TraceIdFilter` | `config/TraceIdFilter.java` | Use trace IDs for read/write observability. |
| `ErrorResponse` | `web/exception/ErrorResponse.java` | Keep API error shape consistent with existing BE conventions. |

## Forbidden common components

| component | reason |
|---|---|
| Legacy `traceability_link` table name or any V3-era dropped schema | The current source uses `tbl_fact_traceability_link`; do not resurrect the legacy name. |
| Direct controller-level SQL or mapper calls | Violates layering and makes traceability logic hard to test. |
| Raw markdown / raw payload persistence as the primary source | The view must derive from structured tables and existing snapshots. |
| Manual graph editing UI or API | Out of scope; the traceability view is read-only. |
| Auto-repair / AI root-cause / cross-project dependency graph | Explicitly out of scope in `spec-pack.md`. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `GitPrMetadataCollectorService.collectPullRequest(UUID, int, String)` | `application/usecase/ingestion/GitPrMetadataCollectorService.java` | Existing pull-request collection entrypoint. |
| `GitPrMetadataCollectorService.collectRepository(UUID, LocalDate, LocalDate, boolean, String)` | same file | Existing repository-range collection entrypoint. |
| `GitPrMetadataCollectorService.collectFromWebhook(UUID, int, String)` | same file | Existing webhook-triggered collection entrypoint. |
| `GitPrMetadataCollectorService.collectManual(RepositoryScanRequest, AppUser)` | same file | Existing manual collection entrypoint with ADMIN guard. |
| `GitPrMetadataCollectorService.persistPullRequest(...)` | same file | Existing traceability write-side logic. |
| `GitPrMetadataCollectorPersistencePort.upsertTraceabilityLink(TraceabilityLinkUpsert)` | `application/port/out/persistence/GitPrMetadataCollectorPersistencePort.java` | Existing port method for traceability link persistence. |
| `GitPrMetadataCollectorJdbcAdapter.upsertTraceabilityLink(TraceabilityLinkUpsert)` | `infrastructure/persistence/adapter/GitPrMetadataCollectorJdbcAdapter.java` | Existing idempotent DB upsert. |
| `ArtifactScannerPersistencePort.findTicketByProjectIdAndExternalKey(UUID, String)` | `application/port/out/persistence/ArtifactScannerPersistencePort.java` | Existing ticket lookup method. |
| `ArtifactScannerPersistencePort.upsertMinimalTicket(UUID, String, String, String, OffsetDateTime)` | same file | Existing ticket reuse method. |
| `ArtifactScannerService.getRunArtifacts(UUID)` | `application/usecase/scanner/ArtifactScannerService.java` | Existing read method for artifact evidence retrieval. |
| `ArtifactScannerService.getCurrentInventory(UUID)` | same file | Existing read method for current inventory. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `getTraceabilityMapByTicketId(...)` | Not confirmed in source tree. | Add a dedicated read service method only after confirming the service and repository shape in Phase 3. |
| `findTraceabilityLinksByTicketId(...)` | Not confirmed in source tree. | Define the exact query in `impl-plan.md` before implementation. |
| `updateTraceabilityLinkManually(...)` | Manual editing is out of scope. | Keep the view read-only and use write-side collectors only. |
| `TraceabilityLinkEntity` | No Java entity is confirmed for this ticket. | Reuse existing `tbl_`-backed query/record patterns first. |
| Any endpoint under `/api/v1/traceability` without a confirmed controller contract | Would be invented API surface. | Confirm controller, DTO, and response shape before coding. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| DTO / command model | `TraceabilityLinkUpsert` | `application/usecase/ingestion/GitPrMetadataCollectorModels.java` | Existing write-side link command model. |
| DTO / command model | `CollectorRun` | same file | Connector run tracking model. |
| DTO / command model | `CollectorRunResult` | same file | Existing collector result model. |
| DTO / command model | `PullRequestUpsert` | same file | Existing PR persistence command model. |
| DTO / command model | `CommitUpsert` | same file | Existing commit persistence command model. |
| DTO / command model | `PullRequestChangedFileUpsert` | same file | Existing changed-file persistence command model. |
| Table | `tbl_fact_traceability_link` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Active traceability relationship table. |
| Table | `tbl_fact_artifact_snapshot` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Artifact snapshot fact table. |
| Table | `tbl_fact_pull_request` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | PR fact table. |
| Table | `tbl_fact_ci_run` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | CI run fact table. |
| Table | `tbl_fact_evidence_event` | existing schema / evidence model | Timeline source table or model. |
| Table | `tbl_dim_ticket` | `src/main/resources/db/migration/V4__init_shema_v2.sql` | Root ticket table. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Link source type | `TICKET`, `PULL_REQUEST`, `COMMIT`, `CHANGED_FILE` | `tbl_fact_traceability_link.source_type` | Keep the existing enum/string values used by the collector. |
| Link target type | `TICKET`, `PULL_REQUEST`, `COMMIT`, `CHANGED_FILE` | `tbl_fact_traceability_link.target_type` | Do not invent new target types without DB confirmation. |
| Confidence | `HIGH`, `MEDIUM`, `LOW` | `spec-pack.md` | Use only the approved confidence values. |
| Broken link severity | `ERROR`, `WARNING` | `sources.md` / approved decisions | Keep the decision consistent with the ticket assumptions. |
| Rule name | `ticket-inference`, `pr-commit`, `pr-file` | collector flow | Preserve rule names as stable master data. |
| SEQNO / ordering | timestamp order, then stable DB sort key | evidence timeline | Do not add manual sequence numbers unless the source model requires them. |

## Multilingual Note

- Ticket IDs, branch names, file paths, commit hashes, and status codes must remain exact technical identifiers.
- UI strings may follow the existing English/Vietnamese/Japanese conventions, but identifiers and rule names must not be translated.
- Do not normalize or translate path segments inside `docs/changes/<TICKET>/raw/`.

## Encoding / Mojibake Note

- Preserve UTF-8 input and output for all markdown and API payloads.
- Do not lower-case, trim, or re-encode GitHub paths in a way that would break matching.
- Avoid mojibake when rendering Vietnamese or Japanese text in labels, logs, or export files.

## Log / Audit / Operation Note

- Read-only traceability retrieval should log `traceId`, `ticketId`, and request scope only.
- Write-side collector logs should keep `deliveryId`, repository, PR number, and status, but never raw payloads or secrets.
- Every write-side run should continue to record connector-run metadata in `tbl_connector_run`.
- Broken links must stay visible in logs and response data, but not trigger raw data leakage.

## Ticket-Specific Constraints

- One Ticket = One PR for MVP.
- Commits are displayed but not counted in completeness.
- Traceability links are read-only in the UI and must not be user-editable.
- Use `tbl_fact_traceability_link` only; do not rely on the dropped legacy `traceability_link` name.
- Prefer existing persisted facts over re-derived heuristics whenever both are available.
- Do not invent API methods or repository methods that are not confirmed in source.

## Completion Gate

- [x] Co context.md
- [x] Co ticket-rules.md
- [x] Phan biet vi du implement dung hien co va vi du cam
- [x] Co bien phap ngan dung method/API suy doan khong ton tai
- [x] Skeleton Phase 3-8 da du
