# Codex Independent Review

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-30
**Author**: Claude Sonnet 4.6 (AI-assisted — independent pass)
**Update date**: 2026-06-30

## Review Input

| artifact/source | status |
|---|---|
| `impact-analysis.md` | ✅ Read |
| `impl-plan.md` | ✅ Read |
| `report.md` | ✅ Read |
| `self-review.md` | ✅ Read |
| `test-results.md` | ✅ Read |
| `review-checklist.md` | ✅ Read |
| `promotion-candidates.md` | ✅ Read |
| `spec-pack.md` | Not read (referenced indirectly via report.md) |
| `QaDashboardJdbcAdapter.java` (actual source) | Not read — not available in doc context |
| `QaDashboardService.java` (actual source) | Not read — not available in doc context |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| — | — | No merge-blocking findings beyond the accepted risks already documented | — | — | — |

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| M-01 | `QaDashboardService.java` | `acceptanceReadyCount = 0` hardcoded placeholder — Release Readiness KPI card non-functional for all tickets; spec-pack designated H-QA-DASHBOARD-4 as P0 before Phase 3 but it was never resolved, shipped as permanent placeholder | report.md §2 AC-7 PARTIAL; report.md §9 H-QA-DASHBOARD-4 Deferred | Set deadline for formula decision with Product; do not accept indefinite Deferred | `QaDashboardServiceTest`: once formula is defined, add 7-condition BR-4 test per each READY / PARTIAL / NOT_READY transition |
| M-02 | `QaDashboardJdbcAdapter.java` | `blackboxCoveragePercent` always 0.0 — `section_type` value for blackbox viewpoints in `tbl_fact_artifact_parsed_section` was never confirmed from parser source; impl-plan §12 declared this a P0 Stop Condition but was not enforced | report.md §13 What Failed; self-review §8; test-results §7 | Before next blackbox-related feature: read parser source or query DB sample; record confirmed `section_type` value in adapter constant | Integration DB test: `SELECT COUNT(*) FROM tbl_fact_artifact_parsed_section WHERE section_type = '<confirmed_value>'` must return > 0 rows when parser has run |
| M-03 | `QaDashboardJdbcAdapter.java` | JDBC SQL not integration-tested against real PostgreSQL — column name mismatches, JOIN errors, or filter logic failures will only surface in production | test-results §8; report.md §8 Accepted Risk | Run `QaDashboardJdbcAdapterIntegrationTest` with TestContainers before promoting to production | `QaDashboardJdbcAdapterIntegrationTest` (TestContainers): verify each query method returns expected row counts against seeded test data |
| M-04 | `QADashboardPage.tsx` | E2E / manual browser smoke test NOT_RUN — FE loading states, filter behavior, empty state, 0-state ticket all unvalidated in actual browser; report.md §16 lists manual smoke test as a merge-block condition | report.md §16 Final Verdict; test-results §8 | Human reviewer must run smoke test before merge approval | Manual: load QA tab → KPI cards appear; apply projectId filter → cards update; ticket with no parsed data → all 0, no error; unauthenticated → 401 |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| m-01 | `QaDashboardService.java` (normalize) | `periodKey` regex `^\d{4}-W\d{1,2}$` accepts invalid week numbers (W0, W99, W53 in non-long years) — only format is validated, not the numeric range | self-review §9 AI Prediction #4 | Add week-range validation (1–53); or document that out-of-range values will simply return empty results (acceptable for PoC) |
| m-02 | `QaDashboardJdbcAdapter.java` | `applySearchFilter` uses `ILIKE '%:search%'` with no supporting DB index — full-table scan on ticket title/key for every request | self-review §9 AI Prediction #3 | Acceptable for PoC; add pg_trgm index or full-text search if table grows beyond 10k rows |
| m-03 | `review-checklist.md §4` | Checklist references MyBatis `#{param}` and `<if test="...">` syntax in the BE/API review section, but the implementation uses JDBC `NamedParameterJdbcTemplate` — checklist is misaligned with the actual technology choice | review-checklist.md lines 107–113 | Update checklist to reflect JDBC named params (`:paramName`, `MapSqlParameterSource`) instead of MyBatis XML syntax |
| m-04 | `QaDashboardJdbcAdapter.java` | `parsePeriodKey` ISO week boundary at year-end (e.g. 2026-W53, 2025-W01 week spanning two calendar years) is computed via `WeekFields.ISO` — correctness at year boundaries has not been formally verified | self-review §9 AI Prediction #1 | Hand-verify with known dates: 2026-12-28 (last ISO week of 2026) and 2026-01-01 (first ISO week of 2026); add edge-case unit tests |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| Q-01 | H-QA-DASHBOARD-4: When will `acceptanceReadyCount` formula be defined? The spec called this P0 before Phase 3 but it was deferred through Phase 5. What is the deadline before the next sprint? | spec-pack §16; report.md §9 | Product / QA Lead to define formula + deadline |
| Q-02 | H-QA-DASHBOARD-SECTION-TYPE: What is the actual `section_type` value used by the blackbox parser when writing rows to `tbl_fact_artifact_parsed_section`? Does a deployed blackbox parser even exist? | impact-analysis.md §17 R-1; report.md §11 | Dev / Parser owner — must be confirmed before any blackbox-coverage SQL is written |
| Q-03 | `tbl_fact_test_run.test_count` column: impl-plan §6 SQL shows `SUM(test_count)` as the denominator for `testResultsPassPercent`, but the column list in impact-analysis §9 lists `passed_count`, `failed_count`, `skipped_count`, `test_count`. Was `test_count` confirmed to exist as a separate column in V4 SQL, or is the denominator actually `passed_count + failed_count + skipped_count`? | impact-analysis §9; impl-plan §6 | Dev — verify against `V4__init_shema_v2.sql` before integration test |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-01 | R-3 risk (accidental `requirePm()` copy) raised in impact-analysis §17 | Not applicable — `QaDashboardService` is a new class; no copy risk. `QaDashboardControllerTest` confirms VIEWER → 200 (no 403). Risk was preventive; actual implementation is clean. |
| FP-02 | Concern about `@Autowired` field injection being used | self-review §5 confirms constructor injection throughout; review-checklist §4 check is satisfied |

## Missing Evidence

- `QaDashboardJdbcAdapter.java` actual source not reviewed — SQL correctness (column names, JOIN logic, filter application) cannot be confirmed from docs alone. Integration DB test (TestContainers) is the required gate.
- `QaDashboardService.java` actual source not reviewed — BR-4 Release Readiness 7-condition logic cannot be confirmed (currently returns 0 placeholder).
- FE Vitest unit tests do not exist — rendering contract for `QaSummaryCards`, `QaFilterBar`, `CoverageTrendChart` validated by TypeScript only, not by runtime assertions.
- Security integration test not run — Spring Security 401 behavior confirmed by pattern/platform standard, not by direct test execution on this ticket's code.

## Suspicious Assumptions

| assumption | concern |
|---|---|
| `tbl_fact_test_run.test_count` is a direct column | impl-plan §6 shows `SUM(passed_count) / SUM(test_count)` but V4 column inventory lists individual count columns; if `test_count` does not exist as a separate column the SQL will fail at runtime |
| Blackbox parser will eventually be deployed and `section_type` will be known | Parser source was never found or read; the feature may not exist, making `blackboxCoveragePercent` permanently 0.0 regardless of data |
| `acceptanceReadyCount = 0` will be replaced in the near term | No deadline set; PoC placeholder has a history of becoming permanent when formula ownership is unclear |
| `mvn clean verify` PASS implies adapter SQL is correct | ArchUnit and unit tests do not execute JDBC SQL against a real DB; SQL correctness is only testable via integration tests which are deferred |

## Required Human Decisions

| ID | decision | impact if deferred | owner |
|---|---|---|---|
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula | Release Readiness KPI card non-functional indefinitely | Product / QA Lead |
| H-QA-DASHBOARD-SECTION-TYPE | `section_type` value for blackbox viewpoints | `blackboxCoveragePercent` permanently 0.0; blackbox feature blocked | Dev / Parser owner |
| Q-03 (from Questions above) | `test_count` column existence in `tbl_fact_test_run` | Potential runtime SQL failure in `testResultsPassPercent` calculation | Dev — verify against V4 SQL |

## Final Verdict

- **NEEDS_UPDATE**

Summary:
- No new blockers introduced by this review beyond what is already documented as Accepted Risk.
- Merge-block conditions from report.md §16 remain open: (1) human reviewer runs `mvn clean verify` with Docker DB and confirms PASS, (2) manual smoke test completed, (3) direct API call without auth cookie → HTTP 401 confirmed.
- M-01 (`acceptanceReadyCount` deadline) and M-02 (`section_type` confirmation) are the two most important post-merge follow-up items to prevent permanent non-functional KPIs.
- m-03 (review checklist MyBatis/JDBC mismatch) should be fixed before this checklist is reused for the next ticket.
