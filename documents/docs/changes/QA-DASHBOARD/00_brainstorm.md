# 00_brainstorm

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-26 (round 2 — post source reading)

---

## Purpose

Capture initial understanding, risks, and open unknowns for the QA Dashboard feature before formalizing the spec. This document is the raw thinking layer — not a decision record.

---

## Known Information

### What the dashboard does (confirmed from requirement + wireframe + VI_02)

- Read-only operational dashboard for QA engineers to monitor testing readiness.
- Six KPI card sections: AC-Test Coverage, AC Not Tested, Black-box Coverage, Test Results, Defect Leakage, Release Readiness (acceptanceReadyCount).
- Acceptance Criteria table showing per-ticket QA metrics with drill-down to detail drawer.
- Coverage Trend chart — `CoverageTrendChart.tsx` already built in FE.
- Filter panel (matches `QaFilters` type in `types.ts`): Project (`projectId`), Period (`periodKey`), Repository (`repositoryId`), Search text.
- All data derived from existing V4 database tables — no new tables, no new migrations.
- Dashboard does not write to any source-of-truth table.

### Role-based tab behavior (confirmed by user 2026-06-26 + RoleTabs.tsx read 2026-06-26)

- Dashboard is added to the **existing dashboard** (not a standalone new page).
- `RoleTabs.tsx` shows all 6 tabs (PM, QA, Development, Security, Executive, Data Ops) to **ALL authenticated users**.
- Only PM and QA routes are functional (`ROLE_TAB_ROUTES = { pm: "pm-dashboard", qa: "qa-dashboard" }`).
- Other 4 tabs are disabled placeholders — no change needed this ticket.
- **No role-based filtering** on tab visibility or BE endpoint access.
- PM Dashboard tab is **out of scope** for this ticket.

### FE implementation status (confirmed from source reading 2026-06-26)

- `QADashboardPage.tsx` is **already fully built** with all sub-components.
- Components present: `DashboardSearchHeader`, `RoleTabs`, `QaFilterBar`, `QaSummaryCards`, `AcceptanceCriteriaTable`, `CoverageTrendChart`.
- Page uses `QA_MOCK_DATA` — no real API calls yet.
- `types.ts` defines the authoritative API response shape: `QaSummary`, `AcceptanceCriteriaRow`, `AcCoverageTrendPoint`, `QaDashboardData`.
- Main remaining FE work: replace `QA_MOCK_DATA` with `useQuery` calls to 3 BE endpoints.

### API design (confirmed 2026-06-26)

- 3 endpoints at `/api/v1/qa/dashboard/`:
  - `GET /api/v1/qa/dashboard/summary` → `QaSummary`
  - `GET /api/v1/qa/dashboard/acceptance-criteria` → `AcceptanceCriteriaRow[]`
  - `GET /api/v1/qa/dashboard/coverage-trend` → `AcCoverageTrendPoint[]`
- Query params for all 3: `projectId`, `periodKey`, `repositoryId`, `search`
- Follows same pattern as PM Dashboard (`GET /api/v1/pm/dashboard/{summary|insights|options|tickets}`)

### Data source mapping (confirmed from database_design.md + V4 SQL read)

| Dashboard section | Source tables | Key columns confirmed |
|---|---|---|
| Ticket metadata | `tbl_dim_ticket`, `tbl_dim_project`, `tbl_dim_repository` | ticket_id, external_ticket_key, ticket_type, status, title, started_at, closed_at |
| AC-Test linkage | `tbl_fact_ac_test_coverage` | ac_test_coverage_id, ticket_id, ac_id, ac_key, coverage_status (NOT NULL) |
| Blackbox viewpoints | `tbl_fact_artifact_parsed_section` | columns TBD from V4 SQL |
| Test results | `tbl_fact_test_run` | columns TBD from V4 SQL |
| CI status | `tbl_fact_ci_run` | columns TBD from V4 SQL |
| Defect / finding data | `tbl_fact_finding` | finding_id, ticket_id, status (finding_status), severity (severity_level) — NO root_cause_phase |
| Artifact existence | `tbl_fact_artifact_snapshot` | columns TBD from V4 SQL |

### Key formulas (resolved 2026-06-26)

| KPI | Formula | Source |
|---|---|---|
| `acTestCoveragePercent` | COUNT(coverage_status = 'COVERED') / COUNT(*) × 100 | tbl_fact_ac_test_coverage |
| `acNotTestedCount` | COUNT(coverage_status = 'NOT_TESTED') | tbl_fact_ac_test_coverage |
| `blackboxCoveragePercent` | viewpoints covered / 8 × 100 | tbl_fact_artifact_parsed_section; 8 viewpoints from requirement |
| `testResultsPassPercent` | PASS count / total × 100 (NOT individual counts) | tbl_fact_test_run |
| `defectLeakageCount` | COUNT(*) WHERE status != 'RESOLVED' (no QA/production split for PoC) | tbl_fact_finding |
| `acceptanceReadyCount` | **UNDEFINED — P0 blocker** | TBD |

### Architecture constraints (confirmed from architecture docs)

- Backend: Spring Boot 3.4.1, Java 21, hexagonal arch (ArchUnit enforced).
- New use cases MUST follow: Controller → Service (UseCase) → Port (interface) → Adapter pattern.
- Frontend: React 18, TanStack Query for server state, Radix UI + Ant Design + Tailwind.
- Auth: Session cookie (JSESSIONID) via Spring Security OAuth2.
- No role check needed at BE endpoint — same as PM Dashboard.
- No existing `/api/v1/qa/dashboard/**` routes.

### What is explicitly out of scope (from requirement §2.2)

- Editing test cases, test results, or AC.
- Managing CI configuration or PR.
- Security Dashboard, PM Dashboard, Executive Dashboard.
- Personal performance ranking.
- AI analytics.

---

## Undetermined Points

| # | point | status | resolution |
|---|---|---|---|
| UD-1 | **Role mapping**: which role = "QA user"? | **CLOSED** | No role guard; all authenticated users can access (RoleTabs pattern confirmed) |
| UD-2 | **Admin tab PM placeholder**: visible-disabled or hidden? | **CLOSED** | All 6 tabs always visible; PM+QA functional, 4 others disabled — no change needed this ticket |
| UD-3 | **Sprint field**: stored column or date-range filter? | **CLOSED** | No Sprint column in tbl_dim_ticket; filter uses `periodKey` string (maps to date range on started_at) |
| UD-4 | **acceptanceReadyCount formula**: which conditions make a ticket "acceptance ready"? | **OPEN — P0** | FE type uses single integer count; formula not defined; blocks BE implementation |
| UD-5 | **Defect Leakage definition**: what distinguishes "production defect" from "QA defect"? | **CLOSED** | `defectLeakageCount` = COUNT findings WHERE status != 'RESOLVED'; no QA/production split for PoC; no root_cause_phase column in tbl_fact_finding |
| UD-6 | **Coverage Trend chart**: in scope? | **CLOSED** | `CoverageTrendChart.tsx` already built in FE; in scope |
| UD-7 | **Export button**: scope? | **CLOSED** | Export button already in `DashboardSearchHeader` (inert no-op); follows PM Dashboard pattern; in scope |
| UD-8 | **Blackbox viewpoint count**: 7 or 8? | **CLOSED** | 8 viewpoints from requirement; user confirmed "use requirement" (2026-06-26) |
| UD-9 | **API design**: single vs. split endpoints? | **CLOSED** | 3 split endpoints: /summary, /acceptance-criteria, /coverage-trend |
| UD-10 | **Caching strategy** | **CLOSED** | No caching for PoC |
| UD-11 | **Refresh trigger**: event-driven or manual? | **CLOSED** | Manual only for PoC; refresh button in `DashboardSearchHeader` re-triggers useQuery |
| UD-12 | **V4 adapter prerequisite**: tbl_fact_test_run, tbl_fact_artifact_parsed_section, tbl_fact_finding, etc. have NO Java adapters | **OPEN — Phase 3 work** | Must build adapters as prerequisite; column names partially confirmed from V4 SQL; full column list needed before writing mappers |

---

## Expected Risks

| risk | probability | impact | note |
|---|---|---|---|
| `acceptanceReadyCount` formula undefined — blocks KPI card | **Critical** | Critical | P0 blocker; must be resolved before Phase 3 implementation of summary endpoint |
| V4 fact table adapters missing — blocks all queries | High | Critical | Must build adapters as prerequisite; tbl_fact_ac_test_coverage confirmed, others need full column verification |
| `tbl_fact_test_run` / `tbl_fact_artifact_parsed_section` column names not yet verified | High | Medium | Read V4 SQL fully at Phase 3 before writing any mapper |
| Aggregation query performance | Medium | Medium | Multiple JOINs across fact tables — verify indexes before Phase 3; index on tbl_fact_ac_test_coverage(ticket_id, coverage_status) confirmed |
| periodKey → date range mapping undefined | Medium | Medium | No Sprint column; periodKey is a string; need mapping logic from periodKey to date range on tbl_dim_ticket.started_at |
| Zero-AC ticket edge case for acceptanceReadyCount | Low | Low | Deferred (OI-9); AC test coverage feature not complete yet |

---

## What AI Needs to Investigate (before Phase 3)

- [ ] Read `V4__init_shema_v2.sql` fully to verify exact column names for: `tbl_fact_test_run`, `tbl_fact_artifact_parsed_section`, `tbl_fact_ci_run`, `tbl_fact_artifact_snapshot`, `tbl_fact_traceability_link`
- [ ] Read `OrganizationController.java` and `OrganizationService.java` to confirm exact pattern for new read-only use case
- [x] Verify `tbl_dim_ticket` has no Sprint/Period column — **CONFIRMED** (only started_at / closed_at)
- [x] Verify `tbl_fact_finding` column names — **CONFIRMED** (no root_cause_phase)
- [x] Verify `tbl_fact_ac_test_coverage` exists with coverage_status — **CONFIRMED**
- [x] Read `RoleTabs.tsx` to confirm role-tab behavior — **DONE**
- [x] Read `QADashboardPage.tsx` and `types.ts` — **DONE** — FE already built

---

## What Humans Need to Ask

| priority | question | status | needed before |
|---|---|---|---|
| **P0** | `acceptanceReadyCount`: which conditions make a ticket "acceptance ready"? | **OPEN** | BE summary endpoint implementation |
| P0 | Release Readiness (ticket-level): exact rule for PARTIAL vs NOT_READY (e.g., "PARTIAL if ≥ 3 of 7 conditions met") | **OPEN** | AcceptanceCriteriaRow.status calculation |
| P1 | `periodKey` → date range mapping: how does a periodKey string map to a date range? Is it a foreign key or a naming convention? | **OPEN** | Filter implementation |
| ~~P0~~ | ~~Which role = "QA user"?~~ | **CLOSED** | No role guard needed |
| ~~P1~~ | ~~Is Sprint a stored column in tbl_dim_ticket, or a date-range filter?~~ | **CLOSED** | No Sprint column; periodKey used |
| ~~P1~~ | ~~Blackbox viewpoints: 8 (requirement) or 7 (wireframe)?~~ | **CLOSED** | 8 viewpoints from requirement |
| ~~P2~~ | ~~Defect Leakage QA vs production split?~~ | **CLOSED** | defectLeakageCount = COUNT WHERE status != 'RESOLVED' |
| ~~P2~~ | ~~Coverage Trend chart in scope?~~ | **CLOSED** | CoverageTrendChart.tsx already exists |
| ~~P2~~ | ~~Export button: show or hide?~~ | **CLOSED** | Export button already present; follows PM pattern |

---

## Conditions Under Which Implementation Is Not Permitted

1. **Do NOT implement PM Dashboard** — out of scope for this ticket. The PM tab in `RoleTabs` is already functional from an existing ticket; no changes to PM tab or PM Dashboard needed.
2. **Do NOT modify or write to any source-of-truth table** — the dashboard is read-only. Any query that performs INSERT / UPDATE / DELETE on ticket, artifact, test, or finding data is forbidden.
3. **Do NOT create dashboard-specific persistence tables** — all data is aggregated dynamically from V4 tables.
4. **Do NOT write V4 table queries until column names are verified from `V4__init_shema_v2.sql`** — `tbl_fact_ac_test_coverage`, `tbl_dim_ticket`, `tbl_fact_finding` are confirmed; remaining fact tables must be verified before writing mappers.
5. **Do NOT implement `acceptanceReadyCount` formula with assumed thresholds** — the formula must be confirmed before implementation; the KPI card can be stubbed as 0 until resolved, but the calculation logic must not ship as a guess.
6. **Do NOT implement ticket-level Release Readiness (READY/PARTIAL/NOT_READY) formula with assumed thresholds** — same as above; stub as NOT_READY until formula confirmed.
7. **Do NOT add a new role enum value** (`QA`, `PM`, etc.) — no role guard is needed; all authenticated users access the dashboard, consistent with RoleTabs pattern.
8. **Do NOT assume `periodKey` maps to Sprint** — there is no Sprint column; periodKey is a string whose date-range semantics must be defined before filter implementation.
