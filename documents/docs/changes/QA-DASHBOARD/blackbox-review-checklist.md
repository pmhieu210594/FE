# Black-box Review Checklist

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-29

---

## How to use

* Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
* Any ❌ fail P0 item blocks release.
* P1/P2 gaps must have a documented follow-up ticket or accepted risk.

---

## Category 1 — Boundary & Edge Combinations

| #   | Check item                                            | AC references         | Priority | Status | Notes            |
| --- | ----------------------------------------------------- | --------------------- | -------- | ------ | ---------------- |
| 1.1 | KPI cards correctly display 0 when no evidence exists | AC-QA-DASHBOARD-2,5,6 | P0       | ✅     | Code-reviewed; service returns 0 for each metric when source table is empty; `acceptanceReadyCount` and `blackboxCoveragePercent` permanently 0 (Accepted Risk) |
| 1.2 | Empty filters display all tickets                     | AC-QA-DASHBOARD-8     | P0       | ✅     | Code-reviewed; filter guards in Java code — absent param = no WHERE clause; AC-8 PASS in self-review |
| 1.3 | AC Coverage = 0% and 100% calculated correctly        | AC-QA-DASHBOARD-2     | P1       | ⏭     | NOT_RUN — formula code-reviewed (BR-2); boundary values require runtime test with controlled dataset |

---

## Category 2 — Permission & Access Control

| #   | Check item                                          | AC references        | Priority | Status | Notes           |
| --- | --------------------------------------------------- | -------------------- | -------- | ------ | --------------- |
| 2.1 | Dashboard cannot be accessed without authentication | AC-QA-DASHBOARD-1    | P0       | ⏭     | NOT_RUN — Spring Security standard; must verify with curl/Postman (no auth cookie → expect 401) |
| 2.2 | Read-only dashboard has no edit capability          | AC-QA-DASHBOARD-10   | P0       | ✅     | Code-reviewed; no edit UI elements; BE is SELECT-only throughout; AC-10 PASS |
| 2.3 | Ticket Detail drawer remains read-only              | AC-QA-DASHBOARD-9,10 | P0       | ⏭     | AC-9 NOT_IMPL — drill-down drawer deferred to a future ticket |

---

## Category 3 — Compatibility & Contract Stability

| #   | Check item                                    | AC references       | Priority | Status | Notes            |
| --- | --------------------------------------------- | ------------------- | -------- | ------ | ---------------- |
| 3.1 | Existing dashboard behavior remains unchanged | AC-QA-DASHBOARD-11  | P0       | ✅     | Code-reviewed; no existing dashboard files modified; AC-11 PASS |
| 3.2 | Dashboard response matches FE contract        | AC-QA-DASHBOARD-2~9 | P0       | ✅     | Code-reviewed; all 7 DTO fields verified against FE `types.ts` |
| 3.3 | Validation errors follow ErrorResponse format | AC-QA-DASHBOARD-8   | P0       | ✅     | Code-reviewed; `GlobalExceptionHandler` enforces `ErrorResponse` format |

---

## Category 4 — Exception Handling & Resilience

| #   | Check item                                                                | AC references       | Priority | Status | Notes             |
| --- | ------------------------------------------------------------------------- | ------------------- | -------- | ------ | ----------------- |
| 4.1 | Dashboard continues displaying remaining KPIs when one metric has no data | AC-QA-DASHBOARD-2~7 | P0       | ✅     | Code-reviewed; each metric computed independently in service; empty table → 0/0.0, no NPE |
| 4.2 | Refresh reloads dashboard successfully                                    | AC-QA-DASHBOARD-8   | P0       | ⏭     | NOT_RUN — requires browser dev environment |
| 4.3 | Empty state is displayed clearly                                          | AC-QA-DASHBOARD-8   | P1       | ⏭     | NOT_RUN — requires browser dev environment |
## Category 5 — Performance / Degradation Signals (Black-box observable)

| #   | Check item                                                                           | AC references       | Priority | Status | Notes           |
| --- | ------------------------------------------------------------------------------------ | ------------------- | -------- | ------ | --------------- |
| 5.1 | Dashboard loads KPI cards and ticket list without visible delay under normal dataset | AC-QA-DASHBOARD-2~9 | P1       | ⏭     | NOT_RUN — requires dev environment with data |
| 5.2 | Dashboard remains usable with large ticket volume                                    | AC-QA-DASHBOARD-2~9 | P1       | ⏭     | NOT_RUN — requires large dataset |
| 5.3 | Applying filters repeatedly does not cause refresh loop or UI freeze                 | AC-QA-DASHBOARD-8   | P1       | ⏭     | NOT_RUN — requires browser dev environment; `useDebounce` 300ms mitigates rapid refetch |

---

## Category 6 — Business Rule Integrity

| #   | Check item                                                                    | AC references     | Priority | Status | Notes          |
| --- | ----------------------------------------------------------------------------- | ----------------- | -------- | ------ | -------------- |
| 6.1 | AC Coverage percentage follows BR-2 calculation                               | AC-QA-DASHBOARD-2 | P0       | ✅     | Code-reviewed; BR-2 formula implemented in `QaDashboardService`; zero-denominator → 0.0 |
| 6.2 | Project / Repository / Period filters correctly restrict displayed tickets    | AC-QA-DASHBOARD-8 | P0       | ✅     | Code-reviewed; all 4 filter params wired Controller→Service→Adapter; AC-8 PASS |
| 6.3 | Release Readiness status (READY / PARTIAL / NOT_READY) matches business rules | AC-QA-DASHBOARD-7 | P0       | ⏭     | `acceptanceReadyCount = 0` placeholder (H-QA-DASHBOARD-4 Deferred); formula not yet implemented |

---

## Category 7 — i18n / Messaging / Operational Observability

| #   | Check item                                                          | AC references        | Priority | Status | Notes    |
| --- | ------------------------------------------------------------------- | -------------------- | -------- | ------ | -------- |
| 7.1 | Dashboard does not expose internal error details or SQL information | AC-QA-DASHBOARD-1,11 | P1       | ✅     | Code-reviewed; `GlobalExceptionHandler` returns `ErrorResponse` only; no stack trace or SQL in response |
| 7.2 | Error messages are displayed consistently and understandable        | AC-QA-DASHBOARD-8    | P1       | ✅     | Code-reviewed; all errors routed through `GlobalExceptionHandler` |
| 7.3 | API returns machine-readable ErrorResponse for FE handling          | AC-QA-DASHBOARD-8    | P0       | ✅     | Code-reviewed; `ErrorResponse` format enforced consistently |

---

## Operational Viewpoints

| Item                      | Required | Notes                                                         |
| ------------------------- | -------- | ------------------------------------------------------------- |
| Permission viewpoint      | ✔        | Authentication and read-only verification                     |
| Audit / Logging viewpoint | ✔        | Verify dashboard performs SELECT only and no write operations |
| Operation viewpoint       | ✔        | Refresh, retry, empty state                                   |
| Compatibility viewpoint   | ✔        | Existing dashboard and parser data remain compatible          |
| Performance viewpoint     | ✔        | Large dataset and repeated filtering                          |
| Security viewpoint        | ✔        | Error handling and information disclosure                     |

---

## AC ↔ Black-box Mapping

| AC                 | Black-box Cases                        |
| ------------------ | -------------------------------------- |
| AC-QA-DASHBOARD-1  | BB-001, BB-002                         |
| AC-QA-DASHBOARD-2  | BB-003, BB-004                         |
| AC-QA-DASHBOARD-3  | BB-005                                 |
| AC-QA-DASHBOARD-4  | BB-006, BB-007                         |
| AC-QA-DASHBOARD-5  | BB-008, BB-009                         |
| AC-QA-DASHBOARD-6  | BB-010                                 |
| AC-QA-DASHBOARD-7  | BB-011, BB-012, BB-013                 |
| AC-QA-DASHBOARD-8  | BB-014, BB-015, BB-016, BB-017, BB-018 |
| AC-QA-DASHBOARD-9  | BB-019                                 |
| AC-QA-DASHBOARD-10 | BB-020                                 |
| AC-QA-DASHBOARD-11 | BB-021                                 |
| AC-QA-DASHBOARD-12 | BB-022                                 |

---

## Sign-off

| Role      | Name     | Date       | Result        |
| --------- | -------- | ---------- | ------------- |
| QA Lead   |          |            |               |
| Developer | pd_khoa  | 2026-06-30 | Code-reviewed |
| PM / BA   |          |            |               |
    