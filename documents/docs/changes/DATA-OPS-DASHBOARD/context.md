# Context

**Ticket ID**: DATA-OPS-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## Screen / API / Batch / Related Job

| category | item | current state | note |
|---|---|---|---|
| FE Page | Data Ops Dashboard | To be implemented | New operational dashboard |
| FE Component | Dashboard Cards | Reuse existing dashboard card pattern | KPI summary |
| FE Component | Filter Bar | Reuse existing dashboard filter | Search & filtering |
| FE Component | Dashboard Table | Reuse existing table component | Operational list |
| FE Component | Detail Drawer | Reuse existing drawer | Read-only detail |
| FE API | Data Ops Dashboard API | Not existing | Create in implementation phase |
| BE API | Dashboard Summary | Not existing | Aggregated metadata |
| BE API | Connector Detail | Not existing | Read-only |
| BE API | Parser Detail | Not existing | Read-only |
| Batch | Existing Connector Jobs | Existing | Dashboard consumes results only |
| Batch | Existing Parser Jobs | Existing | No modification |
| Related Job | Connector Scheduler | Existing | Read-only consumer |
| Related Job | Parser Scheduler | Existing | Read-only consumer |

---

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Dashboard implementation | PM Dashboard | Dashboard architecture |
| Dashboard implementation | QA Dashboard | Summary cards + filter |
| Dashboard implementation | Developer Dashboard | Existing aggregation pattern |
| REST API | Existing Dashboard Controller | Thin Controller |
| Service | Existing Dashboard Service | Aggregation only |
| Repository | Existing Repository | Read-only SQL |
| DTO | Existing DTO pattern | Response mapping |

---

## Allowed common components

| component | path | usage note |
|---|---|---|
| Dashboard Layout | Existing FE | Reuse |
| Summary Card | Existing FE | KPI cards |
| Dashboard Filter | Existing FE | Existing filter |
| Search Component | Existing FE | Existing search |
| Table Component | Existing FE | Existing table |
| Drawer Component | Existing FE | Read-only detail |
| Existing REST Pattern | Existing BE | Reuse |
| Existing Repository Pattern | Existing BE | Reuse |
| Existing Logging | Existing BE | Reuse TraceId |

---

## Forbidden common components

| component | reason |
|---|---|
| Dashboard-specific persistence | Existing metadata already exists |
| CRUD Controller | Dashboard is read-only |
| Direct SQL in Controller | Repository layer only |
| Connector execution | Out of scope |
| Parser execution | Out of scope |
| Manual retry | Out of scope |
| Mock production data | Existing metadata only |

---

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| Existing Dashboard Controller | Existing project | Reference |
| Existing Dashboard Service | Existing project | Reference |
| Existing Repository | Existing project | Reference |
| Existing Connector Module | Existing project | Metadata source |
| Existing Parser Module | Existing project | Metadata source |
| Existing Traceability Module | Existing project | Broken link source |

> Additional methods shall only be added after confirming their existence during implementation.

---

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| DataOpsDashboardController | Not implemented | Create during implementation |
| DataOpsDashboardService | Not implemented | Create during implementation |
| DataOpsDashboardRepository | Not implemented | Create during implementation |
| ConnectorRetryService | Out of scope | Existing scheduler |
| ParserRetryService | Out of scope | Existing scheduler |

---

## DTO / Entity / Table / Migration mapping

| layer | name | path | note |
|---|---|---|---|
| FE DTO | Dashboard Summary | To be created | KPI response |
| FE DTO | Connector Detail | To be created | Drawer |
| FE DTO | Parser Detail | To be created | Drawer |
| BE DTO | Dashboard DTO | To be created | REST |
| BE Service | DataOpsDashboardService | To be created | Aggregation |
| Repository | DataOpsDashboardRepository | To be created | Read-only |
| Table | tbl_connector_run | Existing | Connector execution |
| Table | tbl_fact_data_quality | Existing | Parser quality |
| Table | tbl_fact_artifact_snapshot | Existing | Missing evidence |
| Table | tbl_fact_traceability_link | Existing | Broken links |
| Table | tbl_dim_repository | Existing | Repository |
| Table | tbl_dim_project | Existing | Project |
| Migration | None | N/A | No migration required |

---

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Connector Success | SUCCESS | Connector | Existing |
| Connector Failure | FAILURE | Connector | Existing |
| Parser Success | SUCCESS | Parser | Existing |
| Parser Warning | WARNING | Parser | Existing |
| Parser Error | ERROR | Parser | Existing |
| Broken Link | BROKEN | Traceability | Existing |
| Missing Evidence | MISSING | Artifact | Existing |

---

## Multilingual Note

- UTF-8 only.
- Existing localization strategy must be reused.
- Do not hardcode display language.

---

## Encoding / Mojibake Note

- UTF-8 encoding.
- Preserve Unicode.
- No Shift-JIS.
- No mojibake.

---

## Log / Audit / Operation Note

- Existing TraceId mechanism shall be reused.
- Existing logging framework shall be reused.
- Dashboard performs read-only aggregation only.
- Existing monitoring must remain unchanged.
- No additional audit records are generated.

---

## Ticket-Specific Constraints

- Dashboard is read-only.
- Existing V4 tables only.
- No database migration.
- No duplicated persistence.
- No Connector execution.
- No Parser execution.
- No manual retry.
- Existing Dashboard architecture must be reused.
- Dashboard aggregates metadata only.
```