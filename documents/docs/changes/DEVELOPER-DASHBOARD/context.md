# Context

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

## Screen / API / Batch / Related Job

| category     | item                    | current state                         | note                   |
| ------------ | ----------------------- | ------------------------------------- | ---------------------- |
| FE Page      | Developer Dashboard     | To be implemented                     | New dashboard page     |
| FE Component | Dashboard Cards         | Reuse existing dashboard card pattern | Summary cards          |
| FE Component | Filter Bar              | Reuse existing dashboard filter       | Search & filter        |
| FE Component | Ticket Table            | Reuse existing table component        | Ticket list            |
| FE Component | Detail Drawer           | Reuse existing drawer pattern         | Read-only              |
| FE API       | Developer Dashboard API | Not existing                          | Create in Phase 3      |
| BE API       | Dashboard Summary       | Not existing                          | New REST endpoint      |
| BE API       | Ticket Detail           | Not existing                          | New REST endpoint      |
| Batch        | None                    | N/A                                   | Dashboard is real-time |
| Job          | None                    | N/A                                   | No scheduled job       |

---

## Example of a correctly implemented code

| purpose                  | file/path                   | pattern to follow            |
| ------------------------ | --------------------------- | ---------------------------- |
| Dashboard implementation | PM Dashboard                | Reuse dashboard architecture |
| Dashboard implementation | QA Dashboard                | Reuse dashboard structure    |
| REST Controller          | Existing Controller pattern | Thin Controller              |
| Service                  | Existing Service pattern    | Business logic only          |
| Repository               | Existing Repository pattern | Read-only queries            |
| DTO                      | Existing DTO pattern        | Response DTO                 |

---

## Allowed common components

| component             | path        | usage note |
| --------------------- | ----------- | ---------- |
| Dashboard Layout      | Existing FE | Reuse      |
| Summary Card          | Existing FE | Reuse      |
| Search Bar            | Existing FE | Reuse      |
| Filter Component      | Existing FE | Reuse      |
| Table Component       | Existing FE | Reuse      |
| Drawer Component      | Existing FE | Reuse      |
| Existing REST Pattern | Existing BE | Reuse      |
| Existing Logging      | Existing BE | Reuse      |

---

## Forbidden common components

| component                 | reason                                |
| ------------------------- | ------------------------------------- |
| Mock data in production   | Dashboard must consume real data      |
| Dashboard-specific tables | Existing V4 tables must be reused     |
| Write APIs                | Dashboard is read-only                |
| Direct SQL in Controller  | Repository layer only                 |
| Duplicate parser data     | Existing parser output must be reused |

---

## List of methods that actually exist

| method/class               | path             | usage          |
| -------------------------- | ---------------- | -------------- |
| Existing Dashboard Pattern | Existing project | Reference only |
| Existing REST Controller   | Existing project | Reference only |
| Existing Service           | Existing project | Reference only |
| Existing Repository        | Existing project | Reference only |

> Additional methods shall only be added after confirming they exist or are required during Phase 3.

---

## Forbidden methods / methods that do not exist

| method/API                   | reason              | alternative       |
| ---------------------------- | ------------------- | ----------------- |
| DeveloperDashboardController | Not implemented yet | Create in Phase 3 |
| DeveloperDashboardService    | Not implemented yet | Create in Phase 3 |
| DeveloperDashboardRepository | Not implemented yet | Create in Phase 3 |
| DashboardSummaryDto          | Not implemented yet | Create in Phase 3 |

---

## DTO / Entity / Table / Migration mapping

| layer      | name                         | path          | Note         |
| ---------- | ---------------------------- | ------------- | ------------ |
| FE DTO     | Dashboard Summary            | To be created | Response     |
| FE DTO     | Ticket Detail                | To be created | Response     |
| BE DTO     | Dashboard Summary DTO        | To be created | REST         |
| BE Service | DeveloperDashboardService    | To be created | Aggregation  |
| Repository | DeveloperDashboardRepository | To be created | Read-only    |
| Table      | tbl_dim_ticket               | Existing      | Ticket       |
| Table      | tbl_dim_project              | Existing      | Project      |
| Table      | tbl_dim_repository           | Existing      | Repository   |
| Table      | tbl_fact_ci_run              | Existing      | CI           |
| Table      | tbl_fact_review              | Existing      | Review       |
| Table      | tbl_fact_finding             | Existing      | Findings     |
| Table      | tbl_fact_data_quality        | Existing      | Parser       |
| Migration  | None                         | N/A           | No migration |

---

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item    | internal value | source | note     |
| --------------- | -------------- | ------ | -------- |
| CI PASS         | PASS           | CI     | Existing |
| CI FAIL         | FAIL           | CI     | Existing |
| Review OPEN     | OPEN           | Review | Existing |
| Review RESOLVED | RESOLVED       | Review | Existing |
| Parser SUCCESS  | SUCCESS        | Parser | Existing |
| Parser WARNING  | WARNING        | Parser | Existing |
| Parser ERROR    | ERROR          | Parser | Existing |

---

## Multilingual Note

* UTF-8 only.
* Dashboard labels follow existing localization strategy.
* Do not hardcode language-specific text.

---

## Encoding / Mojibake Note

* UTF-8 encoding.
* No Shift-JIS.
* No mojibake.
* Preserve Unicode.

---

## Log / Audit / Operation Note

* Existing TraceId mechanism shall be reused.
* Existing logging framework shall be reused.
* Dashboard performs read-only operations.
* No additional audit log required.

---

## Ticket-Specific Constraints

* Read-only dashboard.
* Existing V4 tables only.
* No migration.
* No duplicated persistence.
* No AI analytics.
* No Evidence Quality Score.
* No write operations.
* Dashboard aggregates existing evidence only.
