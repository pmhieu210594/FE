# Implementation Plan

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## 1. Implementation Principle

- Reuse the existing Dashboard implementation pattern.
- Dashboard is strictly read-only.
- Reuse existing V4 database tables only.
- Aggregate existing Safety Pack, Security Scan, Security Checklist and Security Exception metadata.
- No duplicated persistence.
- No database migration.
- No Secret Scan execution.
- No SAST execution.
- No SCA execution.
- Existing Dashboard components should be reused whenever possible.
- Existing Security modules remain unchanged.

---

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Aggregate metadata in Service layer using existing V4 tables | Reuses existing architecture, no duplicated persistence | Aggregation logic required | **Selected** |
| B | Create Security Dashboard snapshot tables | Faster dashboard queries | Requires migration and duplicated persistence | Rejected |
| C | Read Security modules directly from FE | Simple implementation | Tight coupling with backend | Rejected |

---

## 3. Reason for Choosing the Alternative Plan

The Security Dashboard is an operational monitoring screen.

Existing metadata already exists in:

- Safety Pack
- Security Scan
- Security Checklist Parser
- Security Exception

Aggregating existing metadata keeps the implementation aligned with the Metadata-first architecture and avoids duplicated persistence.

---

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| SecurityDashboardController | Dashboard REST API | Dashboard endpoints | AC-SECURITY-DASHBOARD-1 |
| SecurityDashboardService | Dashboard aggregation | Business logic | AC-SECURITY-DASHBOARD-2~10 |
| SecurityDashboardRepository | Read existing metadata | Read-only | AC-SECURITY-DASHBOARD-9 |
| SecurityDashboardDtos | Dashboard DTO | REST response | All |
| SecurityDashboardPage | Dashboard UI | FE implementation | All |
| SecuritySummaryCards | KPI Cards | Dashboard summary | AC-2~6 |
| SecurityFilterBar | Search / Filter | Dashboard filtering | AC-7 |
| SecurityTicketTable | Ticket list | Ticket review | AC-8 |
| SecurityTicketDetailDrawer | Drawer | Ticket detail | AC-8 |
| Dashboard API Helper | FE API | Existing API integration | All |

---

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| SecurityDashboardController | Add | Filter | Dashboard DTO | REST |
| SecurityDashboardService | Add | Filter | Dashboard Model | Aggregation |
| SecurityDashboardRepository | Add | Filter | Existing metadata | Read-only |
| DashboardMapper | Add | Entity | DTO | Mapping |
| SecurityDashboardPage | Add | API | UI | FE |
| SecuritySummaryCards | Add | Summary DTO | KPI | FE |
| SecurityTicketTable | Add | Ticket DTO | Table | FE |
| SecurityTicketDetailDrawer | Add | Detail DTO | Drawer | FE |

---

## 6. SQL / Query / Repository Policy

- Existing V4 tables only.
- Read-only SQL.
- Existing Repository pattern.
- Parameterized SQL.
- Existing indexes reused.
- No duplicated persistence.
- No dashboard snapshot tables.
- No UPDATE / INSERT / DELETE.

---

## 7. Validation / Error / Logging Policy

- Validate filter parameters.
- Existing GlobalExceptionHandler reused.
- Existing TraceId reused.
- Existing logging reused.
- Existing authentication reused.
- Existing authorization reused.
- Dashboard returns zero-value KPI when metadata does not exist.

---

## 8. Migration / Rollback Policy

- No Flyway migration.
- No schema modification.
- Rollback by removing Dashboard implementation only.
- Existing Security metadata remains unchanged.
- Existing Dashboard modules remain unaffected.

---

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Create Dashboard DTO | DTO | Compile | FE contract unavailable |
| 2 | Create Repository | Repository | Existing metadata returned | Schema unavailable |
| 3 | Create Dashboard Service | Service | Unit Test | Repository unavailable |
| 4 | Create REST Controller | Controller | API Test | Service unavailable |
| 5 | Implement Dashboard UI | FE | UI Test | API unavailable |
| 6 | Implement Ticket Detail Drawer | FE | UI Test | Detail API unavailable |
| 7 | Integration Testing | FE + BE | Dashboard complete | Blocking issue |

---

## 10. How to Verify Each Step

- Project compiles successfully.
- Repository returns expected metadata.
- Dashboard Service aggregates correctly.
- REST API returns expected DTO.
- Dashboard renders correctly.
- KPI cards display correct values.
- Search works.
- Filters work.
- Ticket Detail drawer opens correctly.
- Empty state behaves correctly.
- Existing Security modules remain unaffected.

---

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-SECURITY-DASHBOARD-1 | Dashboard page | UI Test |
| AC-SECURITY-DASHBOARD-2 | Safety Pack KPI | Unit Test |
| AC-SECURITY-DASHBOARD-3 | Secret Scan KPI | Unit Test |
| AC-SECURITY-DASHBOARD-4 | SAST / SCA KPI | Unit Test |
| AC-SECURITY-DASHBOARD-5 | Security Checklist | Unit Test |
| AC-SECURITY-DASHBOARD-6 | Security Exception | Unit Test |
| AC-SECURITY-DASHBOARD-7 | Dashboard Filter | Integration Test |
| AC-SECURITY-DASHBOARD-8 | Ticket Detail Drawer | UI Test |
| AC-SECURITY-DASHBOARD-9 | Existing V4 Tables | Code Review |
| AC-SECURITY-DASHBOARD-10 | Read-only verification | Code Review |

---

## 12. Stop / Ask Condition

- Stop if Safety Pack schema changes.
- Stop if Security Scan schema changes.
- Stop if Security Checklist schema changes.
- Stop if Security Exception schema changes.
- Stop if Final Security Verdict rule is undefined.
- Stop if Security Alert calculation is undefined.
- Stop if implementation requires additional persistence.
- Stop if migration becomes necessary.

---

## 13. Do Not Do This Ticket

- Do not create new database tables.
- Do not create Flyway migration.
- Do not duplicate Safety Pack metadata.
- Do not duplicate Security Scan metadata.
- Do not duplicate Security Checklist metadata.
- Do not duplicate Security Exception metadata.
- Do not execute Secret Scan.
- Do not execute SAST.
- Do not execute SCA.
- Do not modify Security Exception lifecycle.
- Do not implement CRUD.
- Do not implement AI Security Analytics.
- Do not implement Security Score.
- Do not introduce write operations.

---

## 14. Open Related Issues

| ID | issue | status |
|---|---|---|
| OI-SECURITY-1 | Final Security Verdict calculation | Open |
| OI-SECURITY-2 | Security Alert calculation | Open |
| OI-SECURITY-3 | Export capability | Open |
| OI-SECURITY-4 | Exception priority | Open |
| OI-SECURITY-5 | Security Checklist weighting | Open |