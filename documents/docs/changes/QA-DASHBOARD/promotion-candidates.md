# Promotion Candidates

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-30

---

## Candidates for Architecture Docs

| ID | update candidate | target | reason | approval required |
|---|---|---|---|---|
| A-QA-DASH-01 | Add QA Dashboard bounded context to hexagonal layer diagram: `web/rest/QaDashboardController → application/usecase/qadashboard/QaDashboardService → application/port/out/persistence/QaDashboardRepositoryPort → infrastructure/persistence/adapter/QaDashboardJdbcAdapter → PostgreSQL V4 tbl_fact_*` | `docs/architecture/overview.md §bounded-contexts` | Second concrete example of hexagonal bounded context after PM Dashboard; documents the layer boundary that ArchUnit enforces | Tech Lead |
| A-QA-DASH-02 | Add JDBC adapter as the recommended pattern for dashboard aggregation (complex multi-table JOIN, inline SQL, `NamedParameterJdbcTemplate` + `MapSqlParameterSource`). `QaDashboardJdbcAdapter` and `PmDashboardJdbcAdapter` are two confirmed examples. Document the contrast with MyBatis (used for CRUD, not dashboards). | `docs/architecture/overview.md §adapter-pattern` or `fe-be-contract-map.md §adapter-pattern` | Without this, the next dashboard-type ticket will re-debate JDBC vs MyBatis; this decision is now confirmed by two real implementations | Tech Lead |

---

## Candidates for Living Docs (Contract Map)

| ID | candidate | target | reason | priority | approval required |
|---|---|---|---|---|---|
| LD-QA-DASH-01 | Add QA Dashboard endpoints to the existing endpoint list: `GET /api/v1/qa/dashboard/summary`, `.../acceptance-criteria`, `.../coverage-trend`; auth: all authenticated; DTO shapes: `QaDashboardSummaryDto`, `AcceptanceCriteriaRowDto`, `AcCoverageTrendPointDto` | `docs/architecture/fe-be-contract-map.md` | New endpoints not reflected in contract map; the next ticket that needs FE/BE contract confirmation cannot find them | P1 | Tech Lead |
| LD-QA-DASH-02 | Add "FE-first implementation check" to the Phase 1 source confirmation list: check whether `src/pages/<feature>/` already has a mock data file. If yes, FE scope = wire-up only; do not estimate a fresh FE build. | `docs/architecture/fe-be-contract-map.md §2` or Phase 1 template | In this ticket, the pre-built FE was only discovered in Phase 3; an early check in Phase 1 would have corrected the effort estimate | P1 | Tech Lead |

---

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-QA-DASH-01 | **section_type pre-confirmation rule**: Before writing SQL that queries `tbl_fact_artifact_parsed_section` or any parser-dependent table for a new artifact type, read the parser source code to confirm the exact `section_type` value. Do not write the SQL before this is confirmed. Record the confirmed value as a named constant in the adapter. | `ticket-rules.md §impl-rules` or impl-plan template | In this ticket, `section_type` was never confirmed; `blackboxCoveragePercent` is permanently 0.0 as a result. The same failure is likely to recur for other parsed artifact KPIs. | Low — the rule is scoped precisely to parser-dependent table queries, not general SQL |
| R-QA-DASH-02 | **Deferred formula deadline rule**: When a formula is marked Deferred in spec-pack, a deadline must be set at the same time. A Deferred item with no deadline is not allowed to progress past Phase 3. If the deadline cannot be met, escalate to Product before Phase 3 entry. | `ticket-rules.md §open-issues` | H-QA-DASHBOARD-4 (`acceptanceReadyCount`) was Deferred with no deadline from Phase 1 through Phase 5; the KPI card ships permanently non-functional. | Low — applies to all Deferred formulas; the rule is general enough to be useful beyond this ticket |

---

## Candidates for Standards

| ID | standard candidate | target | reason | approval required |
|---|---|---|---|---|
| S-QA-DASH-01 | **Dashboard KPI numeric response standard**: All numeric fields in a dashboard KPI endpoint response must return `0` or `0.0` as the default — never `null`. When the divisor is zero, return `0.0`, not NaN or an exception. This applies to all `double` and `int` KPI fields. | `docs/standards/api-response-standards.md` (create if not exists) | This pattern was implemented consistently across all QA Dashboard KPIs and matches the PM Dashboard pattern; codifying it prevents `null`-returning implementations in future dashboards | Tech Lead |

---

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection | approval required |
|---|---|---|---|---|---|
| FMI-QA-DASH-01 | New KPI always returns 0% — parser-dependent table `section_type` value not confirmed from parser source before SQL was written | Writing adapter SQL for a new parsed artifact type without reading parser source; parser not deployed or `section_type` value is incorrect | impl-plan Step 1 Stop Condition: read parser source → record `section_type` value → write SQL. Rule candidate R-QA-DASH-01. | KPI card stuck at 0% regardless of test data; `SELECT COUNT(*) FROM tbl_fact_artifact_parsed_section WHERE section_type = 'xxx'` returns 0 rows | QA Lead |
| FMI-QA-DASH-02 | PoC placeholder `= 0` persists to production — formula Deferred with no deadline, no escalation path | Deferred item in spec-pack has no deadline; Product team not escalated; Phase 3 proceeds without formula decision | Set formula deadline at spec-pack stage. Rule candidate R-QA-DASH-02. | Field value `0` unchanged across all environments; user reports it as a bug | QA Lead |

---

## Not Promoted — Judgment Record

| item | decision | reason |
|---|---|---|
| `useDebounce.ts` 300ms implementation | **Do not promote** | Code already exists; implementation detail; not a reusable pattern that needs separate documentation |
| ISO week `parsePeriodKey` edge cases (week 53, year boundary) | **Do not promote** | One-time implementation; edge cases belong in unit test, not in a rule. AI Prediction §9 in self-review records this for the reviewer. |
| `AcceptanceCriteriaPage` pagination wrapper type | **Do not promote** | FE-BE contract detail; sufficiently covered by contract map update (LD-QA-DASH-01) |
| `BLACKBOX_VIEWPOINT_COUNT = 8` named constant | **Do not promote** | Already recorded in `context.md §Ticket-Specific Constraints`; promoting would create a duplicate |
| `RoleTabs.tsx` routing spec (A-QA-DASH-02 original scope) | **Do not promote** | Specific FE implementation detail; more appropriate as context for the next ticket, not a permanent arch doc; would become stale if routing changes |
| report.md §13 "What Failed" full section | **Do not promote as-is** | One-time incident log; the generalizable lessons are already extracted into FMI-QA-DASH-01 and FMI-QA-DASH-02; promoting the raw section would inflate rules with single-occurrence detail |
| `normalize()` UUID / periodKey / search validation implementation | **Do not promote** | Already implemented as code; no rule needed; the standard is already implicit in the review checklist |

---

## Human Approval Required

| item | required decision | owner |
|---|---|---|
| LD-QA-DASH-01 (fe-be-contract-map update) | Review updated endpoint entries; confirm pattern is suitable as reference for other teams | Tech Lead |
| LD-QA-DASH-02 (FE-first check in Phase 1) | Approve addition to Phase 1 template or ticket-rules.md | Tech Lead |
| A-QA-DASH-01, A-QA-DASH-02 (architecture doc updates) | Review and approve before writing to `overview.md` | Tech Lead |
| R-QA-DASH-01, R-QA-DASH-02 (ticket-rules.md additions) | Approve rule wording before adding to `ticket-rules.md` | Tech Lead / QA Lead |
| S-QA-DASH-01 (api-response-standards.md) | Approve standard; confirm it aligns with existing BE coding guidelines | Tech Lead |
| FMI-QA-DASH-01, FMI-QA-DASH-02 (Failure Mode Index) | Approve formal addition to `docs/maintenance/failure-mode-index.md` | QA Lead |
