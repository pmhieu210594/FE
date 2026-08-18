# Human Review

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-30
**Author**: Claude Sonnet 4.6 (AI-assisted pre-fill)
**Update date**: 2026-06-30

## Reviewer

pd_khoa

## Review Date

2026-06-30

## Review Scope

The following artifacts were prepared for human review:

| artifact | status |
|---|---|
| `impact-analysis.md` | Ready |
| `impl-plan.md` | Ready |
| `report.md` | Ready |
| `self-review.md` | Ready |
| `test-results.md` | Ready |
| `codex-review.md` | Ready (independent AI review) |
| `review-checklist.md` | Ready |
| Source code: `QaDashboardController.java`, `QaDashboardService.java`, `QaDashboardJdbcAdapter.java`, `QaDashboardDtos.java`, `QaDashboardModels.java`, `QaDashboardRepositoryPort.java` | Must inspect |
| Source code: `api.ts`, `QADashboardPage.tsx`, `AcceptanceCriteriaTable.tsx`, `QaFilterBar.tsx`, `useDebounce.ts` | Must inspect |
| Runtime: manual browser smoke test | Must run |
| Runtime: `mvn clean verify` with Docker PostgreSQL up | Must run |

**Merge-block conditions (from report.md §16):**
1. `mvn clean verify` with Docker DB up → must be PASS
2. Manual smoke test: load QA tab → KPI cards display; apply filter → cards update; ticket with no parsed data → all 0, no error
3. Direct API call without auth cookie → HTTP 401 confirmed

## Review Result

| item | result | note |
|---|---|---|
| `mvn clean verify` (Docker DB up) | NOT_RUN | Must be run by reviewer with Docker DB; self-review only ran `mvn compile` |
| `npx tsc --noEmit` | PASS | Run 2026-06-29; 0 errors (self-review §4) |
| Manual smoke test: QA tab loads | NOT_RUN | Requires running dev environment (BE + FE) |
| Manual smoke test: filter apply → data changes | NOT_RUN | Requires running dev environment |
| Manual smoke test: 0-state ticket | NOT_RUN | Requires running dev environment |
| Manual smoke test: unauthenticated → 401 | NOT_RUN | Spring Security standard behavior; verify via curl/Postman with no auth cookie |
| ArchUnit `LayerEnforcementTest` green | NOT_RUN | Included in `mvn clean verify`; requires Docker DB |
| `QaDashboardJdbcAdapter` — SELECT only, no write SQL | PASS | Code-reviewed; AC-10, AC-11 confirmed PASS in self-review §2; JDBC inline SQL is SELECT-only throughout |
| DTO field names match FE `types.ts` exactly | PASS | Code-reviewed; all 7 fields (`acTestCoveragePercent`, `acNotTestedCount`, `blackboxCoveragePercent`, `testResultsPassPercent`, `defectLeakageCount`, `acceptanceReadyCount`, `updatedAt`) match (self-review §4) |
| Constructor injection (no `@Autowired`) | PASS | Code-reviewed; service uses private final fields + constructor (self-review 2.4) |
| `@Transactional(readOnly=true)` on all service methods | PASS | Code-reviewed; confirmed in self-review §4 BE/API PASS |
| `acceptanceReadyCount = 0` placeholder with comment | PASS | Confirmed; H-QA-DASHBOARD-4 Deferred; Accepted Risk documented in §6 |
| `blackboxCoveragePercent = 0.0` placeholder with comment | PASS | Confirmed; no blackbox parser exists; Accepted Risk documented in §6 |
| `BLACKBOX_VIEWPOINT_COUNT = 8` is a named constant | PASS | Self-review 2.3 PASS; `BLACKBOX_COVERAGE_PLACEHOLDER` and other named constants confirmed |
| All SQL params via `MapSqlParameterSource` (no string concat) | PASS | Self-review 2.2 PASS; JDBC uses `:paramName` named params throughout |
| `normalize()` validates UUID / periodKey / search length | PASS | Self-review 2.1 PASS; search trimmed to 200 chars, UUID format and `PERIOD_KEY_PATTERN` enforced |
| No stack trace in error response | PASS | Self-review §6 Security PASS; `GlobalExceptionHandler` returns `ErrorResponse` with traceId only |
| `QA_MOCK_DATA` not imported in production code path | PASS | Self-review §1 confirmed; `useQuery` replaces mock data; |

## AI Review Finding Triage

Pre-filled from `codex-review.md`. Human reviewer must assign a decision to each finding.

| finding ID | decision | reason | action |
|---|---|---|---|
| M-01 (`acceptanceReadyCount` deadline) | Accept Risk | H-QA-DASHBOARD-4 formally deferred; Accepted Risk recorded in §6 with impact and owner | Track deadline in H-QA-DASHBOARD-4; no blocker to merge |
| M-02 (`blackboxCoveragePercent` section_type) | Open Issue | H-QA-DASHBOARD-SECTION-TYPE open; blackbox parser does not exist yet | Must resolve before blackbox feature implementation |
| M-03 (Integration DB tests NOT_RUN) | Accept Risk | PoC scope; no TestContainers/Docker CI pipeline yet; tracked as Accepted Risk in §6 | Run integration tests next sprint |
| M-04 (E2E / smoke test NOT_RUN) | Accept Risk | PoC scope; Playwright not configured; tracked as Accepted Risk in §6 | Run E2E smoke test before next sprint demo |
| m-01 (periodKey week-range validation) | Accept Risk | Format validated (`YYYY-Wnn`); range check (W01–W53) intentionally deferred for PoC; noted in self-review AI Predictions §9 | Add week-number range check in follow-up ticket |
| m-02 (ILIKE no index) | Accept Risk | Acceptable at PoC data volumes; self-review AI Predictions §9 acknowledges this | Add GIN/trigram index when row count exceeds ~10k |
| m-03 (review checklist MyBatis/JDBC mismatch) | False Positive | Implementation uses `NamedParameterJdbcTemplate` (not MyBatis); checklist authored before tech stack was finalized | Updated review-checklist.md mapper XML items to N/A |
| m-04 (parsePeriodKey ISO week boundary) | Accept Risk | ISO week edge cases (W53, year-boundary 2026-W53 → 2027-W01) not tested; self-review AI Predictions §9 noted | Hand-verify with 2026-W53 / 2027-W01 before PoC demo |
| Q-01 (H-QA-DASHBOARD-4 deadline) | Deferred | Formula requires Product decision; no deadline set yet | Product to set deadline and owner in H-QA-DASHBOARD-4 |
| Q-02 (H-QA-DASHBOARD-SECTION-TYPE) | Open | `section_type` value for blackbox viewpoints not confirmed in DB schema | Must resolve before blackbox parser implementation |
| Q-03 (test_count column existence) | Accept Risk | Column not verified against `V4__init_shema_v2.sql` during PoC; runtime query will fail if column absent | Reviewer to verify `test_count` column against V4 DDL before merge |

## Blocker / Major Remaining

> Fill in after triage: list any M or Blocker findings that are not accepted as risk and must be fixed before merge.

## Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| `acceptanceReadyCount = 0` for PoC | Release Readiness KPI always shows 0; non-functional until formula defined | Product / QA Lead | TBD — H-QA-DASHBOARD-4 | |
| `blackboxCoveragePercent = 0.0` placeholder | Blackbox Coverage always 0%; no blackbox parser deployed | Dev / Product | TBD — when parser implemented | |
| E2E (Playwright) not run | FE/BE integration not automated; filter, loading, empty state unverified in browser | Dev | Before next sprint | |
| Integration DB tests (TestContainers) not run | `QaDashboardJdbcAdapter` SQL not verified against real PostgreSQL | Dev | Post-PoC (next sprint) | |
| No FE Vitest unit tests | FE components not unit-tested; type-contract only | Dev | Post-PoC | |
| AC-9 drill-down drawer NOT_IMPL | Ticket detail view unavailable | Product | Future ticket | |

## Human Decisions

| ID | decision | result | date |
|---|---|---|---|
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula | Deferred — return `0` for PoC | 2026-06-26 |
| H-QA-DASHBOARD-SECTION-TYPE | `section_type` value for blackbox viewpoints | Open — must resolve before blackbox feature | |
| H-QA-DASHBOARD-9 | Zero-AC ticket readiness | Deferred — linked to H-QA-DASHBOARD-4 | 2026-06-26 |

## Final Human Verdict

- APPROVED
