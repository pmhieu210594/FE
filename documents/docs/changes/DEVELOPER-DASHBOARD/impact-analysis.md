# Impact Analysis

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-06-30
**Author**: OpenAI
**Update date**: 2026-06-30

## 1. Change Content

Introduce a new **Developer Dashboard** that provides a consolidated operational view for developers.

The dashboard aggregates existing evidence from:

* CI Runs
* Review Findings
* Parser Errors

The feature is read-only and does not modify existing business flows.

---

## 2. Directly Affected Files

| file                   | reason                  | change type |
| ---------------------- | ----------------------- | ----------- |
| DeveloperDashboardPage | New dashboard UI        | Create      |
| Dashboard API          | Dashboard endpoints     | Create      |
| Dashboard Controller   | REST API                | Create      |
| Dashboard Service      | Aggregation             | Create      |
| Dashboard Repository   | Read existing V4 tables | Create      |
| Dashboard DTO          | Response model          | Create      |

---

## 3. Indirectly Affected Files

| file                      | reason                   | risk |
| ------------------------- | ------------------------ | ---- |
| Existing Dashboard Layout | Reuse layout             | Low  |
| Existing Authentication   | Existing security        | None |
| Existing Logging          | Existing TraceId         | None |
| Existing Repository Layer | Shared read-only pattern | Low  |

---

## 4. Caller / Callee

| caller        | callee             | impact    |
| ------------- | ------------------ | --------- |
| Browser       | Dashboard API      | New       |
| Dashboard API | Controller         | New       |
| Controller    | Service            | New       |
| Service       | Repository         | New       |
| Repository    | Existing V4 tables | Read-only |

---

## 5. FE Impact

* New Developer Dashboard page.
* Existing dashboard layout reused.
* Existing filter reused.
* Existing table reused.
* Existing drawer reused.
* Existing API helper extended.

---

## 6. BE Impact

* New REST controller.
* New aggregation service.
* New repository.
* New DTO.
* Existing architecture reused.

---

## 7. API Contract Impact

| endpoint          | request impact | response impact       | backward compatible? |
| ----------------- | -------------- | --------------------- | -------------------- |
| Dashboard Summary | New            | Dashboard Summary DTO | Yes                  |
| Ticket Detail     | New            | Ticket DTO            | Yes                  |

No existing endpoint is modified.

---

## 8. DTO / Schema / Validation Impact

* New Dashboard DTO.
* New Ticket DTO.
* Existing entities reused.
* Existing validation reused.
* Existing enums reused.

---

## 9. DB / Migration Impact

* Existing V4 tables reused.
* No migration.
* No schema change.
* No new persistence.
* Read-only queries only.

---

## 10. Batch / Job / Event Impact

No impact.

The dashboard reads existing operational data.

No new batch.

No new event.

---

## 11. Test Impact

Additional tests required:

* Dashboard Service
* Dashboard Repository
* Dashboard API
* Dashboard UI
* Dashboard Filter
* Dashboard Detail

Existing parser tests remain unchanged.

---

## 12. Operation / Monitoring Impact

* Existing logging reused.
* Existing TraceId reused.
* Existing monitoring reused.
* No operational workflow changes.

---

## 13. Rollout / Rollback Impact

Rollout:

* Application deployment only.

Rollback:

* Remove dashboard application code.

No database rollback required.

---

## 14. Areas Determined to be Unaffected and Based on

| area               | judgment     | evidence                |
| ------------------ | ------------ | ----------------------- |
| Parser             | Not affected | Existing parser reused  |
| CI execution       | Not affected | Read-only               |
| Review workflow    | Not affected | Read-only               |
| Authentication     | Not affected | Existing authentication |
| Existing V4 schema | Not affected | Existing tables reused  |

---

## 15. Required Options

* Read-only aggregation.
* Existing architecture reuse.
* Existing dashboard reuse.

---

## 16. Human Decision Required

| ID                | decision item             | owner | status |
| ----------------- | ------------------------- | ----- | ------ |
| H-DEV-DASHBOARD-1 | CI Failure categorization | PM    | Open   |
| H-DEV-DASHBOARD-2 | Parser Warning handling   | PM    | Open   |
| H-DEV-DASHBOARD-3 | Export scope              | PM    | Open   |

---

## 17. Risk Summary

| ID  | risk                               | severity | mitigation                   |
| --- | ---------------------------------- | -------- | ---------------------------- |
| R-1 | Existing dashboard pattern changes | Medium   | Verify before implementation |
| R-2 | CI schema changes                  | Medium   | Read existing schema         |
| R-3 | Review schema changes              | Medium   | Read existing schema         |
| R-4 | Parser schema changes              | Medium   | Read existing schema         |
| R-5 | Dashboard aggregation performance  | Low      | Existing query optimization  |
