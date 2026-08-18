# Spec Pack

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26

---

## 1. Context / Purpose

The EDCAP platform collects engineering evidence from Git, CI, and ticket artifacts. Currently, QA engineers must manually open individual markdown files (`spec-pack.md`, `test-plan.md`, `test-results.md`, `blackbox-testcases.md`, `report.md`) per ticket to assess testing readiness. There is no unified view of AC coverage, black-box coverage, test results, defect leakage, or release readiness across tickets.

This ticket adds a **QA Dashboard** as a new tab within the existing EDCAP dashboard. The dashboard aggregates data from existing V4 database tables (parsed artifact sections, traceability links, test runs, CI runs, findings) and surfaces them as read-only KPI cards and a ticket list for QA operational monitoring.

The dashboard **does not become a system of record**. It is a visualization layer over evidence that already exists in the platform.

**User-confirmed scope (2026-06-26):** The dashboard is added to the existing dashboard area. Admin users see a tab container with a QA tab and a PM tab. Non-Admin users with the QA role see only the QA tab. PM Dashboard is out of scope for this ticket.

---

## 2. Scope

### 2.1. Within scope

- QA Dashboard page/tab accessible by QA role and Admin role.
- KPI cards: AC-Test Coverage, AC Not Tested count, Black-box Coverage, Test Results (PASS/FAIL/NOT_RUN), Defect Leakage, Release Readiness.
- Ticket list table: per-ticket QA metrics with sort and pagination.
- Ticket Detail drawer: read-only view of AC coverage, blackbox coverage, test results, CI run, release readiness reasons, and links to artifacts.
- Filter panel: Project, Repository, Sprint/Period, Ticket, Test Status, Release Status, Coverage Status.
- Free-text search: Ticket ID, Ticket Title, Repository.
- Dashboard refresh timestamp display.
- Admin tab container with QA tab (PM tab placeholder or deferred — see Open Issues OI-QA-DASHBOARD-2).
- Role-based visibility: only QA role and Admin role can access.
- All data read from existing V4 tables — no write operations.

### 2.2. Out of scope

- PM Dashboard implementation (separate ticket).
- Security Dashboard, Executive Dashboard, Dev Dashboard.
- Editing test cases, test results, AC, or reports.
- Managing CI configuration or PR.
- Personal performance ranking.
- AI analytics.
- Export functionality (open point — not confirmed; see OI-QA-DASHBOARD-7).
- Coverage Trend chart (visible in wireframe but not in functional requirements — not confirmed; see OI-QA-DASHBOARD-6).
- Creating new database tables or Flyway migrations.
- Any write operation to source-of-truth data.

---

## 3. Terminology

| term | meaning | notes |
|---|---|---|
| AC | Acceptance Criteria | Individual testable conditions defined in spec-pack.md |
| AC-Test Coverage | Percentage of AC items that have at least one linked test | Derived from tbl_fact_traceability_link |
| Blackbox Coverage | Percentage of defined test viewpoints that have at least one test case | Derived from tbl_fact_artifact_parsed_section (blackbox-testcases.md) |
| Release Readiness | Derived status indicating whether a ticket meets all evidence requirements for acceptance | READY / PARTIAL / NOT_READY |
| Defect Leakage | Defects found post-QA phase (production leakage) vs. defects found during QA | From tbl_fact_finding; split by root phase |
| Test Viewpoint | A testing perspective/angle (Normal, Error, Boundary, Permission, State, Audit, Operation, Compatibility) | See OI-QA-DASHBOARD-8 for count discrepancy |
| Ticket Detail Drawer | A read-only slide-in panel showing full QA evidence for a single ticket | No edit capability |
| KPI Card | A summary widget on the dashboard showing a single aggregated metric | Six cards total |
| QA role | The role authorized to access the QA Dashboard | Exact role value is an open issue — see OI-QA-DASHBOARD-1 |
| tbl_dim_* | Dimension tables in V4 schema (project, ticket, repository, etc.) | Most adapters implemented |
| tbl_fact_* | Fact tables in V4 schema (test_run, finding, ci_run, etc.) | Most adapters NOT yet implemented — prerequisite blocker |

---

## 4. As-Is

| area | current state |
|---|---|
| QA monitoring | Manual review of per-ticket markdown files (`spec-pack.md`, `test-plan.md`, `test-results.md`, `blackbox-testcases.md`, `report.md`) |
| AC coverage | No automatic calculation; QA manually compares spec-pack AC list against test-plan |
| Blackbox coverage | No automatic coverage summary; QA manually reads blackbox-testcases.md |
| Test results visibility | Distributed across per-ticket test-results.md; no aggregation |
| Defect leakage | No tracking; QA manually identifies production bugs from incident records |
| Release readiness | Manual judgement per ticket; no unified status |
| Dashboard | No QA dashboard exists; existing dashboard has no QA tab |
| Role-based tabs | No tab system in existing dashboard; single view |

---

## 5. To-Be

| area | target state |
|---|---|
| QA monitoring | QA Dashboard shows all tickets with AC coverage, blackbox coverage, test results, defect leakage, and release readiness at a glance |
| AC coverage | Automatically calculated: Covered AC / Total AC × 100%, derived from parsed artifacts and traceability links |
| Blackbox coverage | Automatically calculated: Covered viewpoints / Total defined viewpoints × 100% |
| Test results visibility | Aggregated PASS / FAIL / NOT_RUN per ticket from tbl_fact_test_run |
| Defect leakage | Summarized from tbl_fact_finding, split by root phase (QA vs. production) |
| Release readiness | Derived status (READY / PARTIAL / NOT_READY) from evidence checklist per ticket |
| Dashboard | QA tab added to existing dashboard; Admin sees QA + PM tabs |
| Role-based tabs | Tab container with role-based visibility; QA role sees QA tab; Admin sees both tabs |

---

## 6. Detailed Specification

### 6.1. Business Rules

**BR-1: Read-only constraint**
The dashboard must not execute INSERT, UPDATE, or DELETE on any source table. All operations are SELECT only.

**BR-2: AC-Test Coverage calculation**
```
AC Coverage % = (Covered AC count / Total AC count) × 100
```
- Total AC: parsed from `tbl_fact_artifact_parsed_section` where artifact_type = spec-pack and section = acceptance_criteria.
- Covered AC: those with at least one entry in `tbl_fact_traceability_link` linking AC to a test case.
- AC with no linked test = Not Covered.
- If Total AC = 0, coverage = 0% (not null).

**BR-3: Black-box Coverage calculation**
```
Blackbox Coverage % = (Viewpoints with ≥1 test case / Total expected viewpoints) × 100
```
- Viewpoints parsed from `tbl_fact_artifact_parsed_section` where artifact_type = blackbox-testcases.
- Total expected viewpoints = defined viewpoint list (see OI-QA-DASHBOARD-8 for count to confirm).
- Missing viewpoints are highlighted.

**BR-4: Release Readiness determination**
A ticket's Release Readiness is calculated from the following checklist:
1. Required artifacts exist (spec-pack, test-plan, test-results, blackbox-testcases, report) — from tbl_fact_artifact_snapshot
2. AC coverage = 100%
3. Black-box coverage = 100%
4. Test Results exist and FAIL count = 0
5. No blocking Open Issues (from tbl_fact_exception with status ≠ RESOLVED)
6. No unresolved High Risk (from tbl_fact_finding where severity = HIGH/CRITICAL and status ≠ RESOLVED)
7. Report exists and is parsed

**Status mapping:**
- READY: all 7 conditions met.
- PARTIAL: ≥ 1 condition met but not all. [INFERRED — exact threshold TBD; see OI-QA-DASHBOARD-4]
- NOT_READY: 0 or critical conditions not met. [INFERRED — exact threshold TBD]

**BR-5: Defect Leakage classification**
- QA defect: finding in tbl_fact_finding where root_phase ≠ production (found before release).
- Production defect: finding where root_phase = production (found after release to production).
- [INFERRED — exact field name and value to confirm; see OI-QA-DASHBOARD-5]

**BR-6: Dashboard data freshness**
- Dashboard reads live data on each page load / filter change.
- No separate dashboard-specific cache table.
- [INFERRED — caching strategy TBD; see OI-QA-DASHBOARD-10]

**BR-7: Ticket list default sort**
- Default sort: Release Readiness ascending (NOT_READY first), then FAIL count descending.

**BR-8: Access control**
- All authenticated users can access the QA Dashboard tab. No role restriction.
- This matches PM Dashboard behavior — `RoleTabs` shows all tabs to all authenticated users; PM and QA tabs are functional, others are disabled placeholders.
- Unauthenticated requests → 401 (Spring Security standard behavior).

---

### 6.2. Input (Filters and Search)

Matches existing `QaFilters` type in FE (`types.ts`). No Sprint column in DB — uses `periodKey`.

| item | FE field | type | required | validation | notes |
|---|---|---|---|---|---|
| Project filter | `projectId` | UUID string | No | Valid UUID or empty | Default: empty (all projects) |
| Repository filter | `repositoryId` | UUID string | No | Valid UUID or empty | Default: empty (all repositories) |
| Period filter | `periodKey` | String | No | Period key e.g. "2026-W23"; maps to date range on tbl_dim_ticket.started_at | Default: empty (all periods) |
| Search text | `search` | String | No | Max 200 chars; trimmed | Searches external_ticket_key, title |

---

### 6.3. Output

**KPI Cards (must match `QaSummary` FE type — confirmed 2026-06-26):**

| FE field | type | format | source | notes |
|---|---|---|---|---|
| `acTestCoveragePercent` | Double | 0–100 (1 decimal) | tbl_fact_ac_test_coverage.coverage_status | % AC with coverage_status = 'COVERED' |
| `acNotTestedCount` | Integer | ≥ 0 | tbl_fact_ac_test_coverage | COUNT AC where coverage_status = 'NOT_TESTED' |
| `blackboxCoveragePercent` | Double | 0–100 (1 decimal) | tbl_fact_artifact_parsed_section | % viewpoints covered out of 8 |
| `testResultsPassPercent` | Double | 0–100 (1 decimal) | tbl_fact_test_run | PASS / total × 100 (NOT individual counts) |
| `defectLeakageCount` | Integer | ≥ 0 | tbl_fact_finding | COUNT findings WHERE status != 'RESOLVED' |
| `acceptanceReadyCount` | Integer | ≥ 0 | derived | COUNT tickets meeting acceptance readiness — formula TBD (see OI-4) |
| `updatedAt` | OffsetDateTime | ISO-8601 | system | Timestamp when aggregation was computed |

**Ticket List Row:**

| item | type | format | notes |
|---|---|---|---|
| Ticket ID / Code | String | e.g., ABC-123 | Link to detail drawer |
| Repository | String | Repository name | |
| AC total count | Integer | ≥ 0 | |
| AC covered count | Integer | ≥ 0 | |
| Blackbox coverage | Number | 0–100% | |
| PASS count | Integer | ≥ 0 | |
| FAIL count | Integer | ≥ 0 | |
| Release Readiness | Enum | READY / PARTIAL / NOT_READY | Color badge: green / amber / red |
| Last updated | Date | `YYYY-MM-DD` | |
| Detail link | Action | "View" button | Opens Ticket Detail drawer |

**Ticket Detail Drawer:**

| item | type | notes |
|---|---|---|
| Ticket ID | String | |
| Repository | String | |
| Project | String | |
| Current Phase | String | From tbl_dim_ticket.phase |
| AC list | List: AC ID, status (Tested / Missing / Failed) | |
| Blackbox viewpoints | List: viewpoint name, covered (✓/✗) | |
| Test Results | PASS / FAIL / NOT_RUN counts | |
| Latest CI run status | String + DateTime | PASS / FAIL + timestamp |
| Release Readiness | Enum + reason list | Reasons explain what conditions are not met |
| Artifact links | List of clickable links | Test Plan / Test Results / Report |

---

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Unauthenticated access | Redirect to login | 401 → redirect | Standard Spring Security behavior |
| Unauthorized role (VIEWER/EDITOR) | Redirect to home or show access denied | 403 | Must not expose dashboard data |
| Ticket not found (detail drawer) | Show error state in drawer | "Ticket not found" | ticketId valid but no data in DB |
| No tickets match filter | Show empty state with filter reset option | UI: "No tickets match the current filter. Try changing: Project / Repository / Sprint" | Per wireframe §6 |
| Data aggregation error (DB query failure) | Show error banner; do not show partial data | "Failed to load dashboard data. Please try again." | 500 → FE error state |
| V4 table missing data (all-null aggregation) | Show 0 / 0% for that metric | Do not show null; default to 0 | Parser may not have run yet for new tickets |

---

### 6.5. Boundary Value

| item | min | max | special cases | expected behavior |
|---|---|---|---|---|
| AC Coverage % | 0% | 100% | Total AC = 0 | Display 0%; do not divide by zero |
| Blackbox Coverage % | 0% | 100% | No blackbox file parsed | Display 0% |
| PASS / FAIL / NOT_RUN | 0 | No upper limit defined | No test run data | Display 0 |
| Defect Leakage count | 0 | No upper limit defined | No findings | Display 0 |
| Search text | 0 chars (empty = no filter) | 200 chars | Special chars | Trim; no SQL injection (parameterized query) |
| Ticket list page size | 1 | 100 (suggested default: 20) | 0 items | Show empty state |
| Release Readiness conditions met | 0 of 7 | 7 of 7 | Exactly threshold | NOT_READY / PARTIAL / READY — threshold TBD |
| Filter combination | All filters empty (= show all) | All filters applied simultaneously | Contradictory filters (e.g., READY + high FAIL) | Return 0 results; show empty state |

---

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Dashboard load within platform target | P95 < 2s for filtered ticket list ≤ 100 tickets [INFERRED] | Load test after implementation | Multi-table JOIN aggregation; index verification required |
| Security | Role-based access enforced server-side | No QA data returned to VIEWER / EDITOR | BE endpoint auth test | Do not rely on FE tab hiding alone |
| Availability / Reliability | Read-only — no write risk | Inherit platform SLA | N/A for this ticket | No new write paths |
| Maintainability | Aggregation logic in service layer, not in DB views | Application-layer aggregation per db_design.md §11 | Code review | No DB views or materialized views |
| Observability / Logging | Dashboard API calls logged with traceId | Existing TraceIdFilter covers all `/api/**` | Verify via existing logging | No additional logging required |
| Compatibility | Works on existing browser targets | Chrome, Firefox, Edge latest | Manual testing | No new browser-specific features |

---

## 7. Acceptance Criteria

| AC ID | description | testable condition | notes |
|---|---|---|---|
| AC-QA-DASHBOARD-1 | QA users can access the QA Dashboard | Given a user with QA role is authenticated, when they navigate to the dashboard area, then the QA Dashboard tab is visible and the QA Dashboard content loads | Role value TBD — see OI-QA-DASHBOARD-1 |
| AC-QA-DASHBOARD-2 | The dashboard displays AC-Test Coverage by ticket | Given the QA Dashboard is loaded, when ticket data has parsed AC and traceability links, then each ticket row shows AC Coverage %, Covered count, and Total count derived from tbl_fact_artifact_parsed_section and tbl_fact_traceability_link | |
| AC-QA-DASHBOARD-3 | The dashboard displays Acceptance Criteria not yet covered by tests | Given the QA Dashboard is loaded, when a ticket has AC without traceability links to any test, then those AC appear in the AC Not Tested card/list with Ticket ID, AC ID, AC Description, Missing Test Type, Priority, and Status | |
| AC-QA-DASHBOARD-4 | The dashboard displays Black-box Coverage by ticket | Given the QA Dashboard is loaded, when a ticket has a parsed blackbox-testcases.md, then Black-box Coverage % and per-viewpoint status (covered / missing) are displayed | |
| AC-QA-DASHBOARD-5 | The dashboard displays Test Results summary | Given the QA Dashboard is loaded, when tbl_fact_test_run has data for a ticket, then PASS count, FAIL count, NOT_RUN count, and latest execution timestamp are displayed; if no data exists, display 0 for all counts | |
| AC-QA-DASHBOARD-6 | The dashboard displays Defect Leakage summary | Given the QA Dashboard is loaded, when tbl_fact_finding has data, then Defect Leakage summary shows QA defect count, production defect count, severity breakdown, and root cause phase; if no data, display 0 | |
| AC-QA-DASHBOARD-7 | The dashboard displays Release Readiness for every ticket | Given the QA Dashboard is loaded, then every ticket in the list shows Release Readiness as READY, PARTIAL, or NOT_READY derived from the 7-condition checklist in BR-4; tickets with all conditions met show READY (green badge); tickets with ≥1 unmet condition show PARTIAL (amber) or NOT_READY (red) per confirmed threshold | Threshold formula TBD — see OI-QA-DASHBOARD-4 |
| AC-QA-DASHBOARD-8 | Users can filter the dashboard | Given the QA Dashboard is displayed, when the user applies one or more filters (Project, Repository, Sprint, Ticket, Test Status, Release Status, Coverage Status), then the ticket list and KPI cards update to show only matching tickets; applying no filters shows all tickets | |
| AC-QA-DASHBOARD-9 | Users can drill down from dashboard to Ticket Detail | Given the QA Dashboard ticket list is displayed, when the user clicks "View" on a ticket row, then a read-only Ticket Detail drawer opens showing AC coverage list, blackbox viewpoints, test results, latest CI run, release readiness status with reasons, and links to Test Plan / Test Results / Report artifacts | |
| AC-QA-DASHBOARD-10 | The dashboard is read-only | Given the QA Dashboard is displayed in any state (including Ticket Detail drawer), then no UI element allows the user to create, modify, or delete ticket data, test data, AC, reports, or CI configuration; all interactive elements are read-only navigation (filters, search, drill-down) | |
| AC-QA-DASHBOARD-11 | Dashboard data is generated from existing evidence tables | Given the QA Dashboard loads, then all displayed data is derived exclusively from V4 tables (tbl_dim_*, tbl_fact_*) via SELECT queries; no new tables are created, no INSERT/UPDATE/DELETE is executed on any table | Verify via DB audit / query log |
| AC-QA-DASHBOARD-12 | Dashboard does not require manual data entry | Given the QA Dashboard is displayed, then all KPI values and ticket metrics are auto-populated from parsed evidence data; no input form is required from the user to populate dashboard data | |

---

## 8. Examples

### 8.1. Normal Case

**Scenario: QA engineer loads dashboard for current sprint**

Pre-conditions:
- User is authenticated with QA role.
- Sprint "Sprint-12" has 15 tickets.
- All 15 tickets have spec-pack, test-plan, test-results, and blackbox-testcases.md parsed.
- 12 tickets: all AC covered, all viewpoints covered, FAIL count = 0, all artifacts present → READY.
- 3 tickets: some AC not covered or some FAIL count > 0 → PARTIAL.

Expected result:
- AC Coverage card: e.g., 84% (aggregated across 15 tickets).
- AC Not Tested card: e.g., 12 (total uncovered AC items across all 15 tickets).
- Blackbox Coverage card: e.g., 73%.
- Test Results card: PASS 128, FAIL 8.
- Defect Leakage card: 4.
- Release Readiness card: 12 Ready, 3 Partial, 0 Not Ready.
- Ticket list: 15 rows sorted by Readiness (PARTIAL first).

---

**Scenario: Admin user views both tabs**

Pre-conditions:
- User is authenticated with ADMIN role.

Expected result:
- Dashboard area shows tab container with "QA" tab and "PM" tab.
- QA tab is active by default.
- PM tab: either placeholder ("Coming soon") or deferred — per OI-QA-DASHBOARD-2.
- QA tab content is identical to what QA role sees.

---

### 8.2. Error Case

**Scenario: VIEWER role attempts to access QA Dashboard**

Pre-conditions:
- User is authenticated with VIEWER role.
- User navigates directly to `/dashboard/qa` URL.

Expected result:
- FE: QA tab is not visible in the dashboard tab list.
- BE: `GET /api/v1/dashboard/qa/**` returns 403 with ErrorResponse.
- User sees redirect to home page or access-denied message.
- No QA data is returned or rendered.

---

**Scenario: Ticket detail drawer opened for ticket with no parsed data**

Pre-conditions:
- Ticket ABC-130 exists in tbl_dim_ticket.
- No entries in tbl_fact_artifact_snapshot, tbl_fact_test_run, or tbl_fact_artifact_parsed_section for ABC-130.

Expected result:
- Drawer opens showing Ticket ID: ABC-130.
- All metrics display 0 or "No data" state.
- AC list: empty (no parsed AC).
- Blackbox viewpoints: all uncovered (0/N viewpoints).
- Test Results: PASS 0, FAIL 0, NOT_RUN 0.
- Release Readiness: NOT_READY (no artifacts).
- No error thrown; graceful zero-state display.

---

**Scenario: Filter returns no matching tickets**

Pre-conditions:
- User applies filter: Coverage Status = COVERED, Test Status = FAIL.
- No ticket has both full coverage AND failing tests simultaneously.

Expected result:
- Ticket list shows empty state per wireframe §6: "No tickets match the current filter."
- "Reset Filters" button visible.
- KPI cards show 0 for all metrics.
- No error; clean empty state.

---

### 8.3. Boundary Case

**Scenario: Ticket with 0 Acceptance Criteria**

Pre-conditions:
- Ticket ABC-131 has a spec-pack.md with no AC section (or empty AC section).

Expected result:
- AC Coverage for ABC-131: 0%.
- AC Not Tested for ABC-131: 0 (not null, not error).
- Release Readiness condition "AC coverage = 100%" is treated as: Total AC = 0 → condition passes (vacuously true) OR fails (depends on business rule — see OI-QA-DASHBOARD-9).

---

**Scenario: All 15 tickets are READY**

Pre-conditions:
- All 15 filtered tickets meet all 7 Release Readiness conditions.

Expected result:
- Release Readiness card: 15 Ready, 0 Partial, 0 Not Ready.
- FAIL count: 0 across all tickets.
- AC Coverage card: 100%.

---

**Scenario: Single ticket, single AC, one test — coverage boundary**

Pre-conditions:
- Ticket ABC-132 has exactly 1 AC (AC-1).
- Exactly 1 test linked to AC-1 in tbl_fact_traceability_link.
- That test result: PASS.

Expected result:
- AC Coverage: 100% (1/1).
- AC Not Tested: 0.
- Test Results: PASS 1, FAIL 0, NOT_RUN 0.

---

**Scenario: Maximum filter combination applied**

Pre-conditions:
- All 7 filters applied simultaneously with valid but narrow values.
- Only 1 ticket matches.

Expected result:
- Ticket list shows 1 row.
- KPI cards reflect data from that 1 ticket only.
- No performance degradation vs. unfiltered load.

---

## 9. Source Availability Summary

| source | status | trust level | impact on spec |
|---|---|---|---|
| raw/requirement.md | Read – full | High | Primary source for all functional requirements and AC |
| raw/database_design.md | Read – full | High | Table mapping, aggregation formulas, no-new-tables constraint |
| raw/wireframe.md | Read – full | High | UI layout, card content, drawer content, filter list |
| VI_02_SDD Ch.9.3 | Read – partial | High | Confirms QA Dashboard card list; aligns with requirement |
| docs/architecture/overview.md | Read – full | High | Tech stack, arch layers, DB schema summary |
| docs/architecture/fe-be-contract-map.md | Read – full | High | Existing endpoints; confirms no dashboard endpoint exists |
| docs/architecture/route-api-map.md | Read – partial | High | Route map; confirms no `/api/v1/dashboard/**` route |
| docs/architecture/repository-db-map.md | Read – partial | High | V4 adapter gap confirmed — critical blocker |
| V4 migration SQL (full) | NOT read | — | Must read before Phase 3 to verify column names |
| Existing OrganizationController / Service | NOT read | — | Must read before Phase 3 as implementation pattern |
| EDCAP_FE/src/pages/*.tsx | NOT read | — | Must read before Phase 3 for FE pattern |

**Key gap:** V4 fact table adapters for `tbl_fact_test_run`, `tbl_fact_artifact_parsed_section`, `tbl_fact_traceability_link`, `tbl_fact_finding`, `tbl_fact_ci_run`, `tbl_fact_exception` do NOT exist. This is a prerequisite for all BE implementation.

---

## 10. Complexity Classification

```text
Complexity     : Standard
System shape   : FE (wire-up only) + BE (new endpoints + adapters) + DB (adapters only; no migration)
Primary risk   : V4 adapter prerequisite gap / Release Readiness formula definition
Review mode    : Standard
Required options: Source Analysis / FE-BE Contract
```

**Rationale (updated after source reading 2026-06-26):**
- FE: **Already built** — `QADashboardPage`, `QaSummaryCards`, `QaFilterBar`, `AcceptanceCriteriaTable`, `CoverageTrendChart` all exist and use mock data. Main FE work: replace `QA_MOCK_DATA` with `useQuery` calls + add `endpoints.qaDashboard.*` to `api.ts`. Estimated FE delta: small.
- BE: New endpoints needed (`/api/v1/qa/dashboard/summary|acceptance-criteria|coverage-trend`). Aggregation logic across V4 tables. Pattern: follow PM Dashboard controller/service structure.
- DB: No new migration. Adapters needed for `tbl_fact_ac_test_coverage`, `tbl_fact_finding`, `tbl_fact_test_run` (V4 versions). These are the key prerequisite tasks.
- Security: All authenticated users can access (same as PM Dashboard — no role filtering on tabs). No new role system needed.
- Remaining open issue: Release Readiness formula threshold (OI-QA-DASHBOARD-4).

---

## 11. FE/BE Contract Impact

> **Status update (2026-06-26):** FE is already built. `QADashboardPage.tsx`, `QaSummaryCards`, `QaFilterBar`, `AcceptanceCriteriaTable`, `CoverageTrendChart` all exist with mock data. The FE `types.ts` already defines the expected API shape. Main work: BE endpoints + FE wire-up.

**Existing FE components (already implemented, using mock data):**

| file | purpose |
|---|---|
| `EDCAP_FE/src/pages/qa-dashboard/QADashboardPage.tsx` | Main page; uses `QA_MOCK_DATA` |
| `EDCAP_FE/src/pages/qa-dashboard/components/QaSummaryCards.tsx` | 6 KPI cards |
| `EDCAP_FE/src/pages/qa-dashboard/components/QaFilterBar.tsx` | Filter bar (projectId, periodKey, repositoryId, search) |
| `EDCAP_FE/src/pages/qa-dashboard/components/AcceptanceCriteriaTable.tsx` | AC list table |
| `EDCAP_FE/src/pages/qa-dashboard/components/CoverageTrendChart.tsx` | Coverage trend chart |
| `EDCAP_FE/src/pages/qa-dashboard/types.ts` | `QaFilters`, `QaSummary`, `AcceptanceCriteriaRow`, `AcCoverageTrendPoint`, `QaDashboardData` |
| `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Tab switcher (PM + QA functional; others placeholder) |

**New BE endpoints required (following PM Dashboard pattern `/api/v1/pm/dashboard/*`):**

| method | endpoint | description | auth |
|---|---|---|---|
| GET | `/api/v1/qa/dashboard/summary` | Portfolio KPI aggregation | Authenticated (all roles) |
| GET | `/api/v1/qa/dashboard/acceptance-criteria` | AC list for table | Authenticated (all roles) |
| GET | `/api/v1/qa/dashboard/coverage-trend` | Weekly AC coverage data points | Authenticated (all roles) |

**Access control:** All authenticated users can access (same pattern as PM Dashboard — `RoleTabs` shows all tabs to all users; no role-based filtering on tab visibility).

**Filter query parameters (all optional):**
- `projectId` (UUID string)
- `repositoryId` (UUID string)
- `periodKey` (string — period identifier e.g. "2026-W23"; maps to date range on `tbl_dim_ticket.started_at`)
- `search` (free text, max 200 chars)

**Note:** No Sprint column in `tbl_dim_ticket`. `periodKey` filter maps to date-based period grouping.

**Response DTO shapes — must match existing FE types:**

`QaDashboardSummaryDto` (must match `QaSummary` in FE `types.ts`):
```
acTestCoveragePercent: Double   // 0-100
acNotTestedCount: Integer        // ≥ 0
blackboxCoveragePercent: Double  // 0-100
testResultsPassPercent: Double   // 0-100 (NOT individual counts — matches FE type)
defectLeakageCount: Integer      // COUNT from tbl_fact_finding WHERE status != 'RESOLVED'
acceptanceReadyCount: Integer    // COUNT tickets meeting acceptance readiness criteria
updatedAt: OffsetDateTime
```

`AcceptanceCriteriaRowDto` (must match `AcceptanceCriteriaRow` in FE `types.ts`):
```
acId: String            // ac_key from tbl_fact_acceptance_criteria
ticketKey: String       // external_ticket_key from tbl_dim_ticket
status: String          // "PASSED" | "PARTIAL" | "NOT_TESTED" (from tbl_fact_ac_test_coverage.coverage_status)
blackbox: String        // "Yes" | "No" | "Partial" (from blackbox viewpoint coverage)
gap: String             // description of what's missing
```

`AcCoverageTrendPointDto` (must match `AcCoverageTrendPoint` in FE `types.ts`):
```
label: String           // period label e.g. "W1", "W2", sprint name
coveragePercent: Double // AC coverage at that point in time
```

**FE wire-up work (replace mock data):**
1. Add `endpoints.qaDashboard.*` to `EDCAP_FE/src/lib/api.ts` following `pmDashboard` pattern.
2. In `QADashboardPage.tsx`: replace `QA_MOCK_DATA` with three `useQuery` calls.
3. Pass real data to `QaSummaryCards`, `AcceptanceCriteriaTable`, `CoverageTrendChart`.
4. Handle loading / error states (currently no loading states in mock).

**Backward compatibility:** All new endpoints; no existing endpoint modified. `RoleTabs.tsx` already includes QA route (`qa-dashboard`). No existing DTO changed.

---

## 12. DB/Migration Impact

**Migration: None required.**
The dashboard reads exclusively from existing V4 tables. No new tables, no ALTER TABLE, no new Flyway migration.

**V4 table schema (confirmed from V4__init_shema_v2.sql — 2026-06-26):**

`tbl_dim_ticket` columns: `ticket_id` (UUID PK), `project_id`, `external_ticket_key`, `ticket_type`, `priority`, `status` (ticket_status enum), `title`, `created_at`, `started_at`, `closed_at`, `merged_at`, `updated_at`. **NO Sprint/Period column.**

`tbl_fact_finding` columns: `finding_id`, `ticket_id`, `pr_id`, `review_id`, `review_comment_id`, `source_actor_type_id`, `category_id`, `severity` (severity_level enum, DEFAULT 'MEDIUM'), `status` (finding_status enum, DEFAULT 'OPEN'), `accepted_flag`, `false_positive_reason`, `finding_summary`, `source_location_hash`, `detected_at`, `resolved_at`. **NO root_cause_phase column.**

`tbl_fact_ac_test_coverage` columns: `ac_test_coverage_id`, `ticket_id`, `ac_id`, `artifact_snapshot_id`, `ac_key`, `ac_text_hash`, `test_case_id`, `test_run_id`, `coverage_status` (VARCHAR 50), `calculated_at`. Index: `(ticket_id, coverage_status)`.

**Adapter prerequisite (confirmed from repository-db-map + V4 SQL — 2026-06-26):**

| table | V4 columns confirmed | adapter exists? | action needed |
|---|---|---|---|
| `tbl_dim_ticket` | Yes — see above | Partial (V1 `ticket` table has adapter; V4 `tbl_dim_ticket` is separate) | Build V4 read-only adapter (select by project_id, filter by status/date) |
| `tbl_dim_project` | Not fully read | Partial (V1 `project` adapter exists) | Verify V4 `tbl_dim_project` column names; build adapter if needed |
| `tbl_dim_repository` | Not fully read | Partial (V1 `repository` adapter exists) | Verify; build adapter if needed |
| `tbl_fact_ac_test_coverage` | Yes — see above | No | Build: mapper + XML (count by ticket_id, coverage_status) |
| `tbl_fact_acceptance_criteria` | Partially confirmed | No V4 adapter | Build: mapper + XML (count AC per ticket) |
| `tbl_fact_test_run` | Partially confirmed | No V4 adapter | Build: mapper + XML (sum PASS/FAIL by ticket_id; derive pass%) |
| `tbl_fact_finding` | Yes — see above | No V4 adapter | Build: mapper + XML (count status != RESOLVED per ticket) |
| `tbl_fact_artifact_snapshot` | Partially confirmed | No V4 adapter | Build: mapper + XML (check artifact existence by type per ticket) |
| `tbl_fact_artifact_parsed_section` | Partially confirmed | No V4 adapter | Build: mapper + XML (select blackbox viewpoints by ticket_id) |

**Index recommendation (from database_design.md §12):**
No new indexes mandatory for PoC. Existing indexes on `ticket_id`, `repository_id`, `project_id`, `artifact_type_id`, `updated_at`, `status`, `severity` should be sufficient. Performance review after implementation.

---

## 13. Security/Privacy Impact

**Authentication:** Session cookie (JSESSIONID) via Spring Security — inherited from existing platform. No change.

**Authorization (new constraint):**
- Dashboard endpoints require authenticated user with role QA or ADMIN.
- BE must enforce role check in the use case / service layer — NOT only in the FE.
- VIEWER and EDITOR must receive 403 `ErrorResponse` (not 200 with error body — avoid the AdminController anti-pattern documented in fe-be-contract-map §7).

**Data sensitivity:**
- QA Dashboard data (test results, defect findings, AC coverage) is internal operational data.
- No PII exposed: tickets, artifacts, and findings do not contain customer PII per current schema.
- [INFERRED] Privacy classification: INTERNAL. Dashboard should not be publicly accessible.

**Security constraints:**
- All queries must use parameterized SQL (MyBatis named params) — no dynamic SQL injection risk.
- Filter inputs must be validated server-side (whitelist enum values; prevent injection via search text).
- No secrets, tokens, or credentials are exposed through dashboard endpoints.

---

## 14. Operation/Maintenance Impact

**Refresh behavior:**
- Dashboard reads live data on each request — no background job required.
- [INFERRED] If query performance degrades post-PoC, a caching layer (application-level cache or scheduled aggregation batch) may be needed. Not in scope now.

**Monitoring:**
- All `/api/v1/dashboard/qa/**` calls are covered by existing `TraceIdFilter` (traceId in response header and MDC log).
- No additional monitoring hooks required for PoC.

**Failure modes:**
- If a V4 fact table is empty (parser has not run): dashboard shows 0 values, not errors.
- If DB is unavailable: standard 500 `ErrorResponse` via `GlobalExceptionHandler`.

**Maintenance:**
- Release Readiness formula is implemented as a named constant set — changing the threshold requires only a constant change, not a schema change.
- Adding new test viewpoints requires updating the viewpoint list constant + rerunning the blackbox coverage calculation.

---

## 15. Test Strategy Summary

| test type | scope | approach |
|---|---|---|
| Unit: aggregation logic | `QaDashboardService` — AC coverage %, blackbox coverage %, Release Readiness evaluation | JUnit 5; mock repository ports; test BR-2, BR-3, BR-4 with boundary cases (0 AC, 0 viewpoints, partial conditions) |
| Unit: controller | `QaDashboardController` — auth, filter binding, DTO mapping | @WebMvcTest; mock service; verify 200 / 401 / 403 |
| Integration: DB queries | Mapper XML + adapter queries on test DB | Use TestContainers (or existing H2 if supported); verify AC count, PASS/FAIL sum, release readiness derivation |
| FE unit: KPI cards | `KpiCard`, `TicketList`, `FilterPanel` rendering | Vitest; snapshot test; test empty / non-empty / error states |
| FE integration: hooks | `useQaDashboardSummary`, `useQaTicketList` with MSW mocked API | TanStack Query + MSW; verify loading / success / error states |
| E2E: filter flow | Apply Project + Sprint filter → ticket list updates | Playwright; login as QA user → navigate to QA Dashboard → apply filters → assert ticket count |
| E2E: drill-down | Click "View" → drawer opens → data matches ticket | Playwright; verify drawer content |
| E2E: role gate | VIEWER cannot access QA tab / BE returns 403 | Playwright; login as VIEWER → assert tab not visible → direct API call returns 403 |
| Security: role enforcement | VIEWER/EDITOR → 403; QA → 200; ADMIN → 200 | BE @WebMvcTest with principal injection |

**AC coverage matrix:**

| AC | unit BE | unit FE | integration | E2E |
|---|---|---|---|---|
| AC-QA-DASHBOARD-1 (access) | role gate unit | tab visibility | — | E2E login |
| AC-QA-DASHBOARD-2 (AC coverage) | aggregation unit | card render | DB query | — |
| AC-QA-DASHBOARD-3 (not tested list) | aggregation unit | list render | DB query | — |
| AC-QA-DASHBOARD-4 (blackbox) | aggregation unit | card render | DB query | — |
| AC-QA-DASHBOARD-5 (test results) | aggregation unit | card render | DB query | — |
| AC-QA-DASHBOARD-6 (defect leakage) | aggregation unit | card render | DB query | — |
| AC-QA-DASHBOARD-7 (release readiness) | BR-4 unit | badge render | DB query | — |
| AC-QA-DASHBOARD-8 (filter) | filter binding | filter panel | — | E2E filter flow |
| AC-QA-DASHBOARD-9 (drill-down) | controller unit | drawer render | — | E2E drill-down |
| AC-QA-DASHBOARD-10 (read-only) | no-write assertion | no edit elements | DB audit | — |
| AC-QA-DASHBOARD-11 (from DB) | query-only check | — | DB audit | — |
| AC-QA-DASHBOARD-12 (no manual entry) | — | no input forms | — | E2E visual check |

---

## 16. Human Decision Required

| ID | decision item | reason | owner | status |
|---|---|---|---|---|
| H-QA-DASHBOARD-1 | Role for QA Dashboard access | **Closed (2026-06-26)**: RoleTabs shows all tabs to all authenticated users. No role guard needed. All authenticated = can access. Same pattern as PM Dashboard. | — | **Closed** |
| H-QA-DASHBOARD-2 | Admin tab / PM tab behavior | **Closed (2026-06-26)**: PM Dashboard already at `/pm-dashboard`. `RoleTabs.tsx` already has both PM and QA as functional routes. Other tabs auto-disabled. No additional scope. | — | **Closed** |
| H-QA-DASHBOARD-3 | Sprint column in tbl_dim_ticket | **Closed (2026-06-26)**: NO Sprint column. Filter uses `periodKey` (period key maps to date range on `started_at`). `QaFilters` type already uses `periodKey`. | — | **Closed** |
| H-QA-DASHBOARD-4 | Acceptance Readiness (`acceptanceReadyCount`) formula | FE type uses `acceptanceReadyCount: Integer` (not READY/PARTIAL/NOT_READY split). Need definition: which conditions make a ticket "acceptance ready". | Product / QA Lead | **Open — P0 before Phase 3** |
| H-QA-DASHBOARD-5 | Defect Leakage definition | **Closed (2026-06-26)**: tbl_fact_finding has NO root_cause_phase. `defectLeakageCount` = COUNT findings WHERE status != 'RESOLVED'. No production/QA split for PoC. | — | **Closed (decided)** |
| H-QA-DASHBOARD-6 | Coverage Trend chart scope | **Closed (2026-06-26)**: `CoverageTrendChart.tsx` already exists. In scope. New BE endpoint: `GET /api/v1/qa/dashboard/coverage-trend`. | — | **Closed** |
| H-QA-DASHBOARD-7 | Export button | **Closed (2026-06-26)**: Button already in `DashboardSearchHeader` (inert). Follow PM Dashboard export pattern. For PoC: visible, no-op or simple CSV endpoint. | — | **Closed** |
| H-QA-DASHBOARD-8 | Blackbox viewpoint count | **Closed (2026-06-26)**: Use requirement §6.4 — 8 viewpoints: Normal, Error, Boundary, Permission, State Transition, Operation, Audit, Compatibility. | — | **Closed** |
| H-QA-DASHBOARD-9 | Zero-AC ticket: acceptanceReady condition | Deferred: `tbl_fact_ac_test_coverage` feature still in progress. Resolve when AC coverage feature completes. | Product / QA Lead | **Deferred** |

---

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-QA-DASHBOARD-1 | V4 table column names verified from V4__init_shema_v2.sql on 2026-06-26 for tbl_dim_ticket, tbl_fact_finding, tbl_fact_ac_test_coverage | Direct read of V4__init_shema_v2.sql | Low for confirmed tables — see §12 for details | No — confirmed |
| A-QA-DASHBOARD-2 | New BE endpoints follow hexagonal pattern: Controller → UseCase (Service) → Port → Adapter, consistent with OrganizationController / PMDashboard pattern | Architecture overview + ArchUnit + existing PM Dashboard source | Low — pattern enforced | No |
| A-QA-DASHBOARD-3 | FE wire-up replaces `QA_MOCK_DATA` with `useQuery` calls; components already accept typed data props | Read `QADashboardPage.tsx`, `types.ts`| Low — already implemented pattern is clear | No |
| A-QA-DASHBOARD-4 | Aggregation done in BE service layer, not DB views or stored procedures | database_design.md §11 + PM Dashboard pattern | Low | No |
| A-QA-DASHBOARD-5 | Portfolio-level KPI cards aggregate across ALL filtered tickets (not just visible page) | Wireframe KPI card layout; PM Dashboard summary does same | Low | No |
| A-QA-DASHBOARD-6 | QA Dashboard uses 3 separate endpoints: `/summary`, `/acceptance-criteria`, `/coverage-trend` following PM Dashboard pattern (`/summary`, `/insights`, `/tickets`) | PM Dashboard in api.ts + comment in QA `types.ts` | Low | No |
| A-QA-DASHBOARD-7 | `defectLeakageCount` = COUNT from tbl_fact_finding WHERE status != 'RESOLVED' (no production/QA split — FE type has single count) | Confirmed from tbl_fact_finding schema (no root_cause_phase); user confirmed self-decision | Low | No |
| A-QA-DASHBOARD-8 | All authenticated users (any role) can access QA Dashboard; no role filtering on tab visibility | Confirmed from `RoleTabs.tsx` + `PMDashboardPage.tsx` (no role check) | Low | No |
| A-QA-DASHBOARD-9 | TraceIdFilter covers `/api/v1/qa/**` automatically via `/api/**` pattern | route-api-map §4 | Low | No |
| A-QA-DASHBOARD-10 | Blackbox coverage denominator = 8 viewpoints per requirement §6.4 | Confirmed by user (2026-06-26) | Low | No |
| A-QA-DASHBOARD-11 | `periodKey` filter maps to date-range grouping on `tbl_dim_ticket.started_at`; no Sprint column in DB | Confirmed from V4 SQL read | Low | No |

---

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-QA-DASHBOARD-1 | Role for QA Dashboard access | **Closed (2026-06-26)**: All authenticated users can access. No role guard. Same as PM Dashboard. | — | **Closed** |
| OI-QA-DASHBOARD-2 | Admin tab / PM tab behavior | **Closed (2026-06-26)**: `RoleTabs.tsx` already has PM + QA functional; others placeholder. No additional work. | — | **Closed** |
| OI-QA-DASHBOARD-3 | Sprint column in tbl_dim_ticket | **Closed (2026-06-26)**: No Sprint column. Use `periodKey` with date-range logic. Already in `QaFilters` type. | — | **Closed** |
| OI-QA-DASHBOARD-4 | `acceptanceReadyCount` formula: which conditions make a ticket "acceptance ready"? | Blocks `acceptanceReadyCount` BE calculation. FE type exists but formula not defined. | Product / QA Lead | **Open — P0 before Phase 3** |
| OI-QA-DASHBOARD-5 | Defect Leakage: production vs QA defect split | **Closed (2026-06-26)**: No root_cause_phase in tbl_fact_finding. `defectLeakageCount` = COUNT findings WHERE status != 'RESOLVED'. Single count, no split. | — | **Closed** |
| OI-QA-DASHBOARD-6 | Coverage Trend chart scope | **Closed (2026-06-26)**: `CoverageTrendChart.tsx` already exists. In scope. BE endpoint: `GET /api/v1/qa/dashboard/coverage-trend`. | — | **Closed** |
| OI-QA-DASHBOARD-7 | Export button scope | **Closed (2026-06-26)**: Button already in `DashboardSearchHeader` (inert). Follow PM Dashboard export pattern for PoC. | — | **Closed** |
| OI-QA-DASHBOARD-8 | Blackbox viewpoint count (7 vs 8) | **Closed (2026-06-26)**: Use requirement §6.4 — 8 viewpoints confirmed by user. | — | **Closed** |
| OI-QA-DASHBOARD-9 | Zero-AC ticket: how does `acceptanceReadyCount` count it? | Deferred until AC test coverage feature (`tbl_fact_ac_test_coverage`) is complete. | Product / QA Lead | **Deferred** |
| OI-QA-DASHBOARD-10 | Caching strategy | **Closed (2026-06-26)**: No cache for PoC. Implement direct DB reads. Revisit after load test. | — | **Closed (no cache for PoC)** |
| OI-QA-DASHBOARD-11 | API endpoint structure | **Closed (2026-06-26)**: 3 endpoints following PM Dashboard pattern: `/summary`, `/acceptance-criteria`, `/coverage-trend`. Endpoint path prefix: `/api/v1/qa/dashboard/`. | — | **Closed** |
