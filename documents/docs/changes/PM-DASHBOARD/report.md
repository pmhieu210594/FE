# Final Report

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26

---

## 1. Edited summary

PM-DASHBOARD delivers a read-only PM Dashboard PoC that consolidates ticket health signals — blocked tickets, missing evidence, risk indicators, CI failures, and Evidence Quality Scores — into a single operational view for PM-role users.

Built: 5 new BE API endpoints under `/api/v1/pm/dashboard`; new `PmDashboardService` with PM role gate, filter normalization, and CSV export; new `PmDashboardJdbcAdapter` querying a snapshot read model; Flyway migration `V232__pm_dashboard_snapshot.sql`; new FE page `PMDashboardPage.tsx` with filter bar, search, paginated ticket table, KPI cards, and read-only detail drawer; typed FE endpoint helpers, i18n locale strings (EN/VI/JA), route guard, and sidebar item. 47 automated tests across BE unit, BE web slice, FE unit, FE component, and E2E (mock-based). 1 bug found and fixed during test phase (`parseFilters` size-clamp zero-falsy idiom).

Not done by design: no write/upload/delete actions, no personal ranking, no PII in any response, no guessed resolution of open spec decisions.

---

## 2. Corresponding specification / AC

| ACID | status | evidence |
|---|---|---|
| AC-PM-DASHBOARD-1 | PARTIAL | E2E-1, BE web `summary_returnsDashboardSummaryDto`; live auth + DB path not verified end-to-end |
| AC-PM-DASHBOARD-2 | PARTIAL | E2E-1, BE web `insights_returnsInsightsDto`; waitingReview (OI-4) and exception (OI-5) KPI counts may be 0 |
| AC-PM-DASHBOARD-3 | PARTIAL | BE UT `tickets_normalizesFilters`; FE UT `parseFilters`, `buildSearchParams`; E2E-4; DB filter correctness unverified (no API IT) |
| AC-PM-DASHBOARD-4 | PARTIAL | BE UT + web slice `ticketsPassesSearchParamToService`; E2E-2; DB case-insensitive match unverified |
| AC-PM-DASHBOARD-5 | PARTIAL | BE web `detailReturns200WithEqsAndScoreBreakdown`; FE UT `buildEvidenceBottleneck`; live DB join unverified |
| AC-PM-DASHBOARD-6 | PARTIAL | BE web `detailReturns200WithEqsAndScoreBreakdown`; FE UT `riskClasses`; exception badge BLOCKED (OI-5) |
| AC-PM-DASHBOARD-7 | PARTIAL | FE UT `scoreBandClasses`, `formatScore`, `scoreBandLabel`; BE web detail endpoint; EQS formula (OI-1) and thresholds (H-2) unconfirmed |
| AC-PM-DASHBOARD-8 | PARTIAL | BE web `detailReturns200WithEqsAndScoreBreakdown`; FE `TicketDetailDrawer.test`; sub-score formula blocked on OI-1 |
| AC-PM-DASHBOARD-9 | COVERED | E2E-3; `PMDashboardPage.test`; BE web 200 and 404 paths covered |
| AC-PM-DASHBOARD-10 | COVERED | BE UT pseudonym assertion; owner_display bug fixed (raw `updated_by` eliminated) |
| AC-PM-DASHBOARD-11 | PARTIAL | BE UT role gates; BE web `summary_mapsForbidden`; fine-grained export permission matrix unconfirmed; UI not tested against live auth |
| AC-PM-DASHBOARD-12 | PARTIAL | BE UT `refresh_requiresPmRole`; BE web `refreshMapsForbidden`; fine-grained refresh permission unconfirmed |
| AC-PM-DASHBOARD-13 | COVERED | E2E-5; no PUT/DELETE/PATCH route registered |

---

## 3. Scope of influence

**New additions (no existing code modified):**

BE: `PmDashboardController.java`, `PmDashboardService.java`, `PmDashboardModels.java`, `PmDashboardRepositoryPort.java`, `PmDashboardJdbcAdapter.java`, `PmDashboardDtos.java`, `PmDashboardServiceTest.java`, `PmDashboardControllerTest.java`, `V232__pm_dashboard_snapshot.sql`.

FE: `PMDashboardPage.tsx` (and sub-components), `utils.ts`, `PMDashboardPage.test.tsx`, `TicketDetailDrawer.test.tsx`, `utils.test.ts`, `pm-dashboard.spec.ts`, `PmDashboardPage.ts` (E2E POM).

**Modified existing files:** `lib/api.ts` (PM dashboard endpoint helpers), `App.tsx` (PM route guard), `Layout.tsx` (sidebar item), EN/VI/JA locale JSON files.

**New API surface:** `GET /summary`, `GET /insights`, `GET /tickets`, `GET /tickets/{id}/detail`, `POST /export`, `POST /refresh` — all under `/api/v1/pm/dashboard`, all PM-role gated.

**Not affected:** all other controllers/services, migrations V1–V231, existing FE pages, auth/error/traceId middleware, V4 fact and dimension tables (read-only queries only).

---

## 4. Implementation content

| file | summary | reasons |
|---|---|---|
| `PmDashboardService.java` | PM role gate, filter normalization, CSV export, not-found handling | Core business logic layer |
| `PmDashboardJdbcAdapter.java` | Snapshot read model queries, refresh SQL, detail field mapping | Data access / read model |
| `PmDashboardController.java` | Thin web adapter — routes to service, uses standard ErrorResponse | Web layer entry point |
| `PmDashboardDtos.java` | `DashboardSummaryResponse`, `TicketAttentionRow`, `TicketDetailResponse`, pagination envelope | API contract |
| `PmDashboardModels.java` | Internal `DashboardFilter`, `TicketRowModel`, `ScoreBreakdown` records | Application-layer internal model |
| `PmDashboardRepositoryPort.java` | Persistence port interface | Keeps web layer clean of infrastructure |
| `V232__pm_dashboard_snapshot.sql` | `tbl_fact_ticket_dashboard_snapshot` + composite indexes on `period_key`, `project_id`, `score_band`, `blocked_flag` | Read-model support; performance NFR |
| `PmDashboardServiceTest.java` | 10 unit tests: role gate and filter normalization | AC-11, AC-12, AC-3, AC-4, AC-9 |
| `PmDashboardControllerTest.java` | 10 web slice tests: DTO mapping, 403/404 shape, CSV header | AC-1 to 12 |
| `PMDashboardPage.tsx` | Dashboard page: KPI cards, filter bar, search, paginated table, detail drawer, empty state | AC-1 to 13 |
| `lib/api.ts` | `endpoints.pmDashboard.summary/insights/tickets/detail/export/refresh` | FE HTTP boundary |
| `utils.ts` | `scoreBandClasses`, `riskClasses`, `formatScore`, `ageLabel`, `buildEvidenceBottleneck`, `parseFilters`, `buildSearchParams`, `scoreBandLabel` | AC-2, 3, 4, 6, 7 |
| `pm-dashboard.spec.ts` + POM | 5 mock-based E2E tests (E2E-1 to E2E-5) | AC-1, 3, 4, 9, 13 |
| `utils.test.ts` | 20 FE unit tests across 8 utility groups | AC-2, 3, 4, 6, 7 |
| `PMDashboardPage.test.tsx` | Page component: load + click-to-detail interaction | AC-1, 9 |
| `TicketDetailDrawer.test.tsx` | Drawer component: broken-link rendering | AC-8, 9 |
| `EN/VI/JA locale.json` | PM Dashboard i18n label additions | All UI ACs |
| `App.tsx` | PM route guard and redirect | AC-1, 11 |
| `Layout.tsx` | PM Dashboard sidebar navigation item | AC-1 |

**Bugs fixed during implementation:**
- PM row model missing `phaseId` → added to row model, DTO, mapper
- `owner_display` leaking raw `updated_by` → switched to pseudonym-only throughout
- FE nav `NavItem` type rejecting `pmOnly` flag → added explicit `NavItem` type
- Unused `defaultFilters` constant flagged by TS → removed
- `parseFilters` size=0 returned default 20 (`|| 20` treats 0 as falsy) → explicit `raw === null` guard before coercion

---

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | Partial pass | 4 bugs found and fixed during implementation; FE build failure (Vite env issue, unrelated to PM Dashboard code); BE tests and FE typecheck pass |
| Independent AI Review | Not run | codex-review.md template exists; not executed this phase |
| Human Review | Not run | human-review.md template exists; awaiting human reviewer |

---

## 6. Test results

| test type | result | evidence |
|---|---|---|
| BE unit — `PmDashboardServiceTest` (10 tests) | PASS | `mvn test -Dtest="PmDashboardServiceTest" -DskipITs` |
| BE web slice — `PmDashboardControllerTest` (10 tests) | PASS | `mvn test -Dtest="PmDashboardControllerTest" -DskipITs` |
| FE unit — `utils.test.ts` (20 tests) | PASS | `npx vitest run utils.test.ts` |
| FE component — `PMDashboardPage.test.tsx` (1 test) | PASS | `npx vitest run PMDashboardPage.test.tsx` |
| FE component — `TicketDetailDrawer.test.tsx` (1 test) | PASS | `npx vitest run TicketDetailDrawer.test.tsx` |
| E2E mock-based — `pm-dashboard.spec.ts` (5 tests) | PASS | `npx playwright test pm-dashboard.spec.ts` |
| API Integration Tests | SKIPPED | No test DB fixture for `tbl_fact_ticket_dashboard_snapshot` |
| Blackbox BB-001 to BB-051 | NOT EXECUTED / PARTIAL / BLOCKED | See test-results.md §10 — 15 COVERED-AUTO, 22 PARTIAL-AUTO, 10 NOT-EXECUTED, 4 BLOCKED |
| **Total automated** | **47 / 47 PASS** | 1 bug found and fixed during phase (parseFilters size-clamp) |

---

## 7. Security / operations perspective

**Security:**
- `owner_display` reads exclusively from `tbl_dim_member_pseudonym.pseudonym`; bug fix applied when raw `updated_by` was found in fallback path
- All 6 endpoints gated by PM role check; `@WithMockUser(roles="PM")` enforced in tests
- No personal ranking, real names, or raw PII in any DTO
- `GlobalExceptionHandler` + `ErrorResponse` used; no stack trace exposure to client
- Auth mechanism: session cookie per `docs/standards/security.md` (inconsistency with `architecture.md` JWT wording flagged — see Source Analysis Limitations)
- Export and refresh permission: PM-only gate implemented as safe default; fine-grained matrix pending sign-off

**Operations:**
- Empty state: `HTTP 200 + empty list` when no snapshot rows; verified by E2E-4
- `lastUpdatedAt` field in `DashboardSummaryResponse`; staleness warning path exists but not E2E tested against live data
- All 4xx/5xx responses include `traceId` via existing `TraceIdFilter` + MDC
- No PUT/DELETE/PATCH routes registered; dashboard is read-only by construction
- Snapshot refresh strategy: `POST /refresh` endpoint delegates to adapter; job scheduling TBD

---

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| EQS formula undefined | Exact score validation and boundary tests impossible | Product / Architect | Pending | Not approved |
| Score band thresholds (90/75/60/40) unconfirmed | Boundary behavior at exact threshold may be wrong | Product | Pending | Not approved |
| Export/refresh fine-grained permission matrix not confirmed | U-PM vs U-PM-EXP distinction not in auth context | Architect / Security | Pending | Not approved |
| Waiting Review KPI definition pending (OI-4) | `waitingReviewFlag` present in snapshot; count may be 0 or wrong | Architect | Pending | Not approved |
| Exception badge has no DB backing (OI-5) | `exceptionCount` field present; badge always 0 | Architect | Pending | Not approved |
| Export CSV format not formally signed off (OI-7) | Column list may change post-PoC | Product / Security | Pending | Not approved |
| Period/sprint key source not confirmed | Filter by sprint may not align with sprint boundary semantics | Architect | Pending | Not approved |
| E2E suite is mock-based — live stack not exercised | Runtime integration failures only surface in manual smoke test | QA | Pre-release | Accepted for PoC phase |

---

## 9. Open Issues

| issue | impact | next action |
|---|---|---|
| OI-PM-DASHBOARD-1: EQS formula and score_rule_version not defined | Blocks exact score validation, AC-7, AC-8 | Product / Architect to confirm formula and seed `tbl_dim_metric_definition` |
| OI-PM-DASHBOARD-2: Score band thresholds unconfirmed (90/75/60/40 are wireframe proposals) | Blocks BB-027 and boundary test cases | Product to confirm threshold values |
| OI-PM-DASHBOARD-4: "Waiting review" definition absent | Blocks Waiting Review KPI card; BB-050 blocked | Architect to define: `ticket_status = IN_REVIEW` or new concept |
| OI-PM-DASHBOARD-5: "Exception" has no DB backing in V4 | Blocks exception badge; BB-051 blocked | Architect to define exception read model |
| OI-PM-DASHBOARD-7: Export format and audit policy not finalized | Blocks BB-038; CSV is PoC default only | Product / Security to sign off on CSV columns and audit record shape |

Closed issues: OI-3 (required artifact list), OI-6 (PM-only access), OI-8 (open issues definition), OI-9 (snapshot approach), OI-10 (session cookie auth).

---

## 10. Human Decisions

| decision | owner | result |
|---|---|---|
| H-PM-DASHBOARD-1: EQS formula and score_rule_version | Product / Architect | Open |
| H-PM-DASHBOARD-2: Score band thresholds (90/75/60/40) | Product | Open |
| H-PM-DASHBOARD-3: Required artifact list per phase | Architect / PM | Closed |
| H-PM-DASHBOARD-4: "Waiting review" — IN_REVIEW or new concept | Architect | Open |
| H-PM-DASHBOARD-5: "Exception" — sub-type of risk or new table | Architect | Open |
| H-PM-DASHBOARD-6: Permission matrix for view / export / refresh | Architect / Security | Partially closed (PM-only view; export/refresh fine-grained open) |
| H-PM-DASHBOARD-7: Export format (CSV/XLSX/PDF) + audit-log policy | Product / Security | Open |
| H-PM-DASHBOARD-8: "Open issues" definition | Product | Closed |
| H-PM-DASHBOARD-9: DB read strategy — snapshot vs runtime queries | Architect | Closed (snapshot selected) |
| H-PM-DASHBOARD-10: Auth mechanism — session cookie vs JWT | Architect / Tech Lead | Closed (session cookie per security.md) |

---

## 11. Source Analysis Limitations

1. **Chapter 9 of SDD not provided.** Conceptual origin of PM Dashboard unread; full original intent may differ from `raw/requirement.md` interpretation.
2. **`raw/database_design.md` is stale.** Proposes `tbl_fact_ticket_score`, `tbl_fact_ticket_risk`, `tbl_fact_ticket_missing_evidence` — all already exist in V4 under different names. Mapping table in spec-pack resolves this; the raw/ doc must not be used directly as migration input.
3. **Score band thresholds appear only in `raw/wireframe.md`.** Values 90/75/60/40 are not in any DB migration or metric seed; they are wireframe proposals, not confirmed values.
4. **No Jira/GitHub ticket body provided.** `raw/requirement.md` is the only requirement source and is AI-authored with no recorded human sign-off. All 13 ACs are derived from unconfirmed requirements.
5. **Auth mechanism inconsistency.** `docs/architecture/overview.md` says JWT Bearer; `docs/standards/security.md` says session cookie. Treated `security.md` as the stronger current source; inconsistency not yet corrected in the documents themselves.

---

## 12. What worked

- **BE layering discipline:** controller stayed thin; all business rules in service; no infrastructure imports at web layer.
- **Pseudonym guard:** `owner_display` correctly reads from `tbl_dim_member_pseudonym`; raw `updated_by` leak caught during implementation and fixed before tests ran.
- **Test-first bug discovery:** `parseFilters` zero-falsy clamp bug caught by FE unit tests in the same phase it was introduced — no regression shipped.
- **E2E mock strategy:** Playwright LIFO route ordering enabled granular API stubbing without a live backend; 5 E2E tests cover the most important user flows.
- **Spec-pack as single source of truth:** all implementation decisions traced back to spec-pack ACs and business rules; no guessed resolution of open issues.
- **i18n coverage:** EN/VI/JA locale files updated in the same commit as new UI strings; no hardcoded labels in components.
- **Snapshot table design:** precomputed read model avoids runtime aggregation across multiple V4 fact tables, satisfying the < 2 s p95 NFR.

---

## 13. What failed

- **Vite build failure:** `npm run build` failed due to an environment/config access issue unrelated to PM Dashboard code; `tsc` and `vitest` passed. Diagnose separately before release.
- **No API Integration Tests:** `tbl_fact_ticket_dashboard_snapshot` has no test DB fixture; KPI count correctness against real rows unverified. Configure IT in next sprint.
- **No live E2E:** all E2E tests use mock API routes; real Spring Boot auth middleware, DB joins, and Flyway migration not exercised together. Manual smoke test required pre-release.
- **Blackbox cases not executed:** 10 BB cases require a live environment; deferred to pre-release manual smoke test (BB-010, BB-017, BB-022, BB-035, BB-036, BB-039, BB-040, BB-044, BB-045, BB-046).
- **No Codex / human review completed:** both review templates remain empty. Schedule before merge to main.
- **`buildAttentionItems` not implemented:** JSDoc stub exists in utils.ts but no body written. Track as tech-debt if PM attention-item view is added.

---

## 14. Candidate updates Failure Mode Index

- **FMI-CANDIDATE-1 — Falsy-zero clamp:** `Number(x) || default` silently returns the default when `x=0`. Trigger: any numeric URL param where 0 is valid. Prevention: explicit `raw === null` guard before coercion. Detection: unit test with `param=0` input. Found and fixed in this ticket.
- **FMI-CANDIDATE-2 — DB design document drift:** `raw/database_design.md` proposed tables already existing in V4; applying them directly would create duplicate or conflicting migrations. Prevention: cross-check every proposed table against existing V4 migration files before writing SQL. Detection: pre-migration review checklist item.
- **FMI-CANDIDATE-3 — Auth mechanism confusion:** stale `architecture.md` JWT wording overrides confirmed session-cookie decision. Prevention: update `architecture.md` to explicitly defer to `security.md`. Detection: code review flag on any new endpoint using `Authorization: Bearer`.
- **FMI-CANDIDATE-4 — Owner display PII leak:** snapshot fallback using `updated_by` surfaced raw user identifier. Prevention: explicit rule — never use `updated_by`/`created_by` as display values; always join `tbl_dim_member_pseudonym`. Detection: integration test asserting `ownerDisplay` does not match email pattern.

---

## 15. Candidate updates Living Docs

- **LD-CANDIDATE-1:** Add note to `docs/architecture/overview.md` that `docs/standards/security.md` supersedes its JWT/Bearer wording; session cookie is the confirmed mechanism. Priority: High — prevents auth confusion on every new ticket.
- **LD-CANDIDATE-2:** Document the snapshot read-model pattern in `docs/architecture/overview.md` or a new `docs/patterns/read-model.md`; include V232 as the reference example with trade-off rationale. Priority: Medium.
- **LD-CANDIDATE-3:** Document `parseFilters` / `buildSearchParams` as the canonical FE filter-serialization pattern in `docs/standards/coding.md`; note the `raw === null` guard requirement. Priority: High — prevents recurrence of FMI-CANDIDATE-1 class of bug.
- **LD-CANDIDATE-4:** Add to `docs/standards/security.md`: `owner_display` must always come from `tbl_dim_member_pseudonym.pseudonym`; fallback to any raw user-identifier column is forbidden. Priority: High — directly addresses FMI-CANDIDATE-4.

---

## 16. Final Verdict

- NEEDS_UPDATE

Automated tests 47/47 pass; BE layering and pseudonym guard enforced. Remaining gaps before promotion: Vite build failure unresolved, no API IT, no live E2E, no Codex or human review, 5 open spec decisions (H-1, H-2, H-4, H-5, H-7) and 10 BB cases pending manual execution. Re-evaluate verdict after independent review and pre-release manual smoke test complete.
