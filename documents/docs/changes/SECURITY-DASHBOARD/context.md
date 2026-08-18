# Context

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

## Screen / API / Batch / Related Job

| category | item | current state | note |
|---|---|---|---|
| FE Page | Security Dashboard | To be implemented | New Security dashboard |
| FE Component | Dashboard Summary Cards | Reuse existing Dashboard pattern | KPI cards |
| FE Component | Filter Bar | Reuse existing Dashboard Filter | Search & Filter |
| FE Component | Security Review Table | To be implemented | Ticket-based table |
| FE Component | Ticket Detail Drawer | Reuse existing Drawer pattern | Read-only |
| FE API | Security Dashboard API | Not existing | New REST API |
| BE API | Dashboard Summary | Not existing | Dashboard aggregation |
| BE API | Ticket Detail | Not existing | Read-only |
| Batch | Safety Pack Scan | Existing | Dashboard consumes result only |
| Batch | Security Scan (GitHub Actions) | Existing | Dashboard consumes result only |
| Batch | Security Checklist Parser | Existing | Dashboard consumes parser result |
| Batch | Security Exception Job | Existing | Existing lifecycle |

---

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| Dashboard implementation | PM Dashboard | Dashboard architecture |
| Dashboard implementation | QA Dashboard | Summary Cards + Table |
| Dashboard implementation | Developer Dashboard | Read-only aggregation |
| Dashboard implementation | Data Ops Dashboard | Ticket-based table |
| REST Controller | Existing Dashboard Controller | Thin Controller |
| Service | Existing Dashboard Service | Aggregation only |
| Repository | Existing Repository | Read-only SQL |
| DTO | Existing DTO pattern | Response mapping |

---

## Allowed common components

| component | path | usage note |
|---|---|---|
| Dashboard Layout | Existing FE | Reuse |
| Summary Card | Existing FE | KPI cards |
| Dashboard Search | Existing FE | Search |
| Dashboard Filter | Existing FE | Existing filter |
| Table Component | Existing FE | Ticket list |
| Drawer Component | Existing FE | Ticket detail |
| Existing REST Pattern | Existing BE | Reuse |
| Existing Repository Pattern | Existing BE | Read-only |
| Existing Logging | Existing BE | Reuse TraceId |

---

## Forbidden common components

| component | reason |
|---|---|
| Dashboard-specific persistence | Existing metadata already available |
| CRUD Controller | Dashboard is read-only |
| Direct SQL in Controller | Repository only |
| Secret Scan execution | Out of scope |
| SAST execution | Out of scope |
| SCA execution | Out of scope |
| Security Exception editing | Existing module owns lifecycle |
| Mock production data | Existing metadata only |

---

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| Existing Dashboard Controller | Existing project | Reference |
| Existing Dashboard Service | Existing project | Reference |
| Existing Dashboard Repository | Existing project | Reference |
| Safety Pack Module | Existing project | Metadata source |
| Security Scan Module | Existing project | Metadata source |
| Security Checklist Parser | Existing project | Metadata source |
| Security Exception Module | Existing project | Metadata source |

> Additional methods shall only be added after confirming their existence during implementation.

---

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| SecurityDashboardController | Not implemented | Create during implementation |
| SecurityDashboardService | Not implemented | Create during implementation |
| SecurityDashboardRepository | Not implemented | Create during implementation |
| SecretScanExecutionService | Out of scope | Existing GitHub Actions |
| SastExecutionService | Out of scope | Existing GitHub Actions |
| ScaExecutionService | Out of scope | Existing GitHub Actions |

---

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| FE DTO | Dashboard Summary | To be created | KPI response |
| FE DTO | Ticket Detail | To be created | Drawer |
| BE DTO | SecurityDashboardDto | To be created | REST |
| BE Service | SecurityDashboardService | To be created | Aggregation |
| Repository | SecurityDashboardRepository | To be created | Read-only |
| Table | tbl_dim_project | Existing | Project |
| Table | tbl_dim_repository | Existing | Repository |
| Table | tbl_dim_ticket | Existing | Ticket |
| Table | tbl_fact_safety_pack_status | Existing | Safety Pack |
| Table | tbl_fact_security_scan | Existing | Secret / SAST / SCA |
| Table | tbl_fact_exception | Existing | Security Exception |
| Table | tbl_fact_artifact_snapshot | Existing | Checklist Snapshot |
| Table | tbl_fact_artifact_parsed_section | Existing | Checklist Section |
| Migration | None | N/A | No migration |

---

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Safety READY | READY | Safety Pack | Existing |
| Safety WARNING | WARNING | Safety Pack | Existing |
| Safety MISSING | MISSING | Safety Pack | Existing |
| Secret PASS | PASS | Security Scan | Existing |
| Secret FAIL | FAIL | Security Scan | Existing |
| SAST PASS | PASS | Security Scan | Existing |
| SAST WARNING | WARNING | Security Scan | Existing |
| SAST FAIL | FAIL | Security Scan | Existing |
| Exception OPEN | OPEN | Exception | Existing |
| Exception APPROVED | APPROVED | Exception | Existing |
| Exception EXPIRED | EXPIRED | Exception | Existing |
| Verdict PASS | PASS | Dashboard | Calculated |
| Verdict WARNING | WARNING | Dashboard | Calculated |
| Verdict FAIL | FAIL | Dashboard | Calculated |

---

## Multilingual Note

- UTF-8 only.
- Existing localization strategy must be reused.
- No hard-coded language-specific labels.
- Existing i18n resources should be reused.

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
- Dashboard performs read-only aggregation.
- Existing monitoring remains unchanged.
- No additional audit record is generated.

---

## Ticket-Specific Constraints

- Dashboard is read-only.
- Existing V4 tables only.
- No database migration.
- No duplicated persistence.
- No Secret Scan execution.
- No SAST execution.
- No SCA execution.
- No Security Exception editing.
- Existing Dashboard architecture must be reused.
- Ticket-level table.
- Repository-level KPI.
- Dashboard aggregates metadata only.