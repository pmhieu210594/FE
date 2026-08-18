# Implementation Plan

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

## 1. Implementation Principle

* Follow the existing Dashboard implementation pattern.
* Keep the dashboard completely read-only.
* Reuse existing V4 database tables.
* Aggregate CI, Review and Parser information in the Service layer.
* Reuse existing FE dashboard components where possible.
* No duplicated persistence.
* No migration.
* No modification of existing parser, CI or review features.

---

## 2. Alternative Plan

| option | summary                                               | pros                                             | cons                                       | decision     |
| ------ | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------------ | ------------ |
| A      | Aggregate data in Service layer using existing tables | Reuses existing architecture, no duplicated data | Additional aggregation logic               | **Selected** |
| B      | Create dashboard snapshot tables                      | Faster queries                                   | Duplicated persistence, migration required | Rejected     |
| C      | Query parser output directly from FE                  | Simple FE                                        | Tight coupling with backend                | Rejected     |

---

## 3. Reason for Choosing the Alternative Plan

The dashboard is an operational view only.

Existing parser, review and CI information already exists.

Adding dashboard persistence would increase maintenance cost and violate the metadata-first design principle.

---

## 4. Expected Change File

| file                         | change summary        | reason             | related AC           |
| ---------------------------- | --------------------- | ------------------ | -------------------- |
| DeveloperDashboardController | New REST API          | Dashboard endpoint | AC-DEV-DASHBOARD-1   |
| DeveloperDashboardService    | Dashboard aggregation | Business logic     | AC-DEV-DASHBOARD-2~8 |
| DeveloperDashboardRepository | Existing V4 queries   | Read-only          | AC-DEV-DASHBOARD-8   |
| DeveloperDashboardDtos       | Dashboard DTO         | REST response      | All                  |
| DeveloperDashboardPage       | Dashboard UI          | FE implementation  | All                  |
| Dashboard API helper         | FE API                | API integration    | All                  |

---

## 5. Class / Function / Method to Add or Modify

| target                       | action | input  | output            | note        |
| ---------------------------- | ------ | ------ | ----------------- | ----------- |
| DeveloperDashboardController | Add    | Filter | Dashboard DTO     | REST        |
| DeveloperDashboardService    | Add    | Filter | Dashboard Model   | Aggregation |
| DeveloperDashboardRepository | Add    | Filter | Existing entities | Read-only   |
| DashboardMapper              | Add    | Entity | DTO               | Mapping     |
| DashboardPage                | Add    | API    | UI                | FE          |

---

## 6. SQL / Query / Repository Policy

* Existing V4 tables only.
* Read-only SQL.
* Existing Repository pattern.
* Parameterized SQL.
* No duplicated query.
* No temporary dashboard table.

---

## 7. Validation / Error / Logging Policy

* Validate filter parameters.
* Existing GlobalExceptionHandler.
* Existing TraceId.
* Existing logging strategy.
* Return empty dashboard instead of exception when no data exists.
* Existing authentication reused.

---

## 8. Migration / Rollback Policy

* No Flyway migration.
* No schema modification.
* Rollback by removing application code only.
* Existing data remains unchanged.

---

## 9. Step Implementation

| step | action                 | target file | verification         | stop condition         |
| ---- | ---------------------- | ----------- | -------------------- | ---------------------- |
| 1    | Create Dashboard DTO   | DTO         | Compile              | Missing contract       |
| 2    | Create Repository      | Repository  | Existing query works | Missing schema         |
| 3    | Create Service         | Service     | Unit Test            | Repository unavailable |
| 4    | Create REST Controller | Controller  | API Test             | Service unavailable    |
| 5    | Implement FE Dashboard | FE          | UI Test              | API unavailable        |
| 6    | Integration Testing    | All         | Dashboard complete   | Blocking issue         |

---

## 10. How to Verify Each Step

* Project compiles successfully.
* Repository returns existing data.
* Service aggregates correctly.
* REST endpoint returns expected response.
* Dashboard renders correctly.
* Search works.
* Filters work.
* Ticket detail opens.
* Empty state renders correctly.

---

## 11. Corresponding AC Table

| AC ID              | implementation point | verification     |
| ------------------ | -------------------- | ---------------- |
| AC-DEV-DASHBOARD-1 | Dashboard page       | UI Test          |
| AC-DEV-DASHBOARD-2 | CI aggregation       | Unit Test        |
| AC-DEV-DASHBOARD-3 | Review aggregation   | Unit Test        |
| AC-DEV-DASHBOARD-4 | Parser aggregation   | Unit Test        |
| AC-DEV-DASHBOARD-5 | Filter               | Integration Test |
| AC-DEV-DASHBOARD-6 | Ticket Detail        | UI Test          |
| AC-DEV-DASHBOARD-7 | Read-only            | Code Review      |
| AC-DEV-DASHBOARD-8 | Existing V4 tables   | Code Review      |

---

## 12. Stop / Ask Condition

* Stop if existing V4 schema cannot be confirmed.
* Stop if Dashboard architecture changes significantly.
* Stop if CI schema differs from current implementation.
* Stop if Review schema differs from current implementation.
* Stop if Parser schema differs from current implementation.
* Stop if implementation requires new persistence.
* Stop if migration becomes necessary.

---

## 13. Do Not Do This Ticket

* Do not create new database tables.
* Do not create Flyway migration.
* Do not duplicate parser data.
* Do not duplicate review data.
* Do not duplicate CI data.
* Do not implement CRUD.
* Do not implement write operations.
* Do not modify parser implementation.
* Do not modify CI workflow.
* Do not implement AI analytics.
* Do not implement Evidence Quality Score.

---

## 14. Open Related Issues

| ID                 | issue                        | status |
| ------------------ | ---------------------------- | ------ |
| OI-DEV-DASHBOARD-1 | Export function              | Open   |
| OI-DEV-DASHBOARD-2 | Refresh interval             | Open   |
| OI-DEV-DASHBOARD-3 | CI Failure categorization    | Open   |
| OI-DEV-DASHBOARD-4 | Parser Warning visualization | Open   |
| OI-DEV-DASHBOARD-5 | Ticket Detail navigation     | Open   |
