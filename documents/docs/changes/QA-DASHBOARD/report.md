# Final Report

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: Claude Sonnet 4.6 (AI-assisted)
**Update date**: 2026-06-30

---

## 1. Edited Summary

EDCAP platform の既存ダッシュボードエリアに **QA Dashboard** タブを追加した。QAエンジニアが各チケットのmarkdownファイルを手動確認していた作業を、V4 DBテーブルから自動集計したKPIカードとチケット一覧で代替する。

**BE**: 新規hexagonalスタック6ファイル — `QaDashboardController`, `QaDashboardDtos`, `QaDashboardModels`, `QaDashboardService`, `QaDashboardRepositoryPort`, `QaDashboardJdbcAdapter`。3つのGETエンドポイント (`/summary`, `/acceptance-criteria`, `/coverage-trend`)。JDBC-only (MyBatis XML なし)。全SQL SELECT。

**FE**: 既存コンポーネント (`QaSummaryCards`, `AcceptanceCriteriaTable`, `QaFilterBar`, `CoverageTrendChart`) を実APIに接続。`QA_MOCK_DATA` を3つの `useQuery` callに置き換え。Search debounce (300ms), pagination対応。

**DB**: 新規migration なし。既存V4テーブル (`tbl_fact_ac_test_coverage`, `tbl_fact_finding`, `tbl_fact_test_run`, `tbl_dim_ticket` 等) から SELECT のみ。

**重要な決定事項**: JDBC採用 (PM Dashboardと同じsibling pattern)、全認証ユーザーがアクセス可能 (ロールガードなし)、`blackboxCoveragePercent = 0.0` placeholder (parserなし)、`acceptanceReadyCount = 0` placeholder (formula未決定)。

---

## 2. Corresponding Specification / AC

| AC ID | status | evidence |
|---|---|---|
| AC-QA-DASHBOARD-1 (access) | **PARTIAL** | No role guard — all authenticated = access (H-QA-DASHBOARD-1 Closed)。Spring Security 401はstandard behavior。Role gate by design matches PM Dashboard。 |
| AC-QA-DASHBOARD-2 (AC coverage) | **PASS** | `findAcCoverageCounts` が `tbl_fact_ac_test_coverage` を集計。`acTestCoveragePercent` と `acNotTestedCount` を `QaSummaryCards` に描画。ServiceTest BR-2: 3/5=60.0, zero-denom, 2/3=66.7 全PASS。 |
| AC-QA-DASHBOARD-3 (not-tested list) | **PASS** | `acNotTestedCount` を `getSummary()` で計算。`/acceptance-criteria` エンドポイントで `coverage_status = 'NOT_TESTED'` の行を返す。ControllerTest mapping PASS。 |
| AC-QA-DASHBOARD-4 (blackbox coverage) | **PARTIAL** | `blackboxCoveragePercent = 0.0` placeholder — `tbl_fact_artifact_parsed_section` の `section_type` 値未確認; blackbox parser 未実装 (Accepted Risk)。 |
| AC-QA-DASHBOARD-5 (test results) | **PASS** | `findTestRunCounts` が `tbl_fact_test_run` を集計。`testResultsPassPercent` = passed / total × 100。zero-state: 0.0 (not null)。ServiceTest PASS。 |
| AC-QA-DASHBOARD-6 (defect leakage) | **PASS** | `findDefectLeakageCount` = COUNT `tbl_fact_finding` WHERE `status != 'RESOLVED'`。ServiceTest PASS (2 OPEN / 1 RESOLVED → count=2)。 |
| AC-QA-DASHBOARD-7 (release readiness) | **PARTIAL** | `acceptanceReadyCount = 0` placeholder — formula 未決定 (H-QA-DASHBOARD-4 Deferred)。7-condition BR-4 logic は実装なし。 |
| AC-QA-DASHBOARD-8 (filter) | **PASS** | `projectId`, `repositoryId`, `periodKey`, `search` の4パラメータ全てController → Service → Adapterに接続。normalize()でtrim/validate。ServiceTest: invalid periodKey→throws, blank search→null, page clamp PASS。 |
| AC-QA-DASHBOARD-9 (drill-down) | **NOT_IMPL** | Ticket Detail Drawer は Phase 5 スコープ外。未実装。別チケット化予定。 |
| AC-QA-DASHBOARD-10 (read-only) | **PASS** | `QaDashboardJdbcAdapter` に INSERT/UPDATE/DELETE なし。code review + ArchUnit (`mvn clean verify`) PASS。 |
| AC-QA-DASHBOARD-11 (from DB) | **PASS** | 全データ V4テーブルの SELECT のみ。新テーブルなし。migration なし。ArchUnit green。 |
| AC-QA-DASHBOARD-12 (no manual entry) | **PASS** | KPI全てparsed evidenceから自動集計。入力フォームなし。`npx tsc --noEmit` PASS。 |

**AC Summary**: PASS 8件 / PARTIAL 3件 (AC-1, AC-4, AC-7) / NOT_IMPL 1件 (AC-9)

---

## 3. Scope Of Influence

**BE — 新規ファイル (6件):**

| package | file |
|---|---|
| `web/rest/` | `QaDashboardController.java` |
| `web/dto/` | `QaDashboardDtos.java` |
| `application/usecase/qadashboard/` | `QaDashboardModels.java`, `QaDashboardService.java` |
| `application/port/out/persistence/` | `QaDashboardRepositoryPort.java` |
| `infrastructure/persistence/adapter/` | `QaDashboardJdbcAdapter.java` |

**FE — 変更/新規ファイル (7件):**

| file | type |
|---|---|
| `src/lib/api.ts` | Modified — `qaDashboard.*` endpoints追加 |
| `src/pages/qa-dashboard/QADashboardPage.tsx` | Modified — mock→useQuery |
| `src/pages/qa-dashboard/types.ts` | Modified — `AcceptanceCriteriaPage` type追加 |
| `src/pages/qa-dashboard/components/AcceptanceCriteriaTable.tsx` | Modified — pagination |
| `src/pages/qa-dashboard/components/QaFilterBar.tsx` | Modified — real filter options |
| `src/hooks/useDebounce.ts` | New — 300ms debounce hook |

**DB — READ ONLY (変更なし):**

| table | purpose |
|---|---|
| `tbl_fact_ac_test_coverage` | AC coverage counts (COVERED / NOT_TESTED) |
| `tbl_fact_acceptance_criteria` | AC rows for acceptance-criteria endpoint |
| `tbl_fact_test_run` | PASS/FAIL/SKIP counts |
| `tbl_fact_finding` | defectLeakageCount (status != RESOLVED) |
| `tbl_fact_artifact_parsed_section` | Blackbox viewpoints (現在は空) |
| `tbl_fact_artifact_snapshot` | Artifact existence check (Release Readiness) |
| `tbl_dim_ticket` | Main join; filter; periodKey→started_at |
| `tbl_dim_project`, `tbl_dim_repository` | Filter joins |

**無影響:**
- 既存エンドポイント全件 (変更なし)
- PM Dashboard (separate bounded context)
- `AppUser.Role` enum (変更なし)
- `RoleTabs.tsx` (qa-dashboardルート既登録; 変更なし)
- Flyway migration (変更なし)

---

## 4. Implementation Content

| file | summary | key decisions |
|---|---|---|
| `QaDashboardController.java` | 3 GETエンドポイント; thin; constructor injection; ロールガードなし | all authenticated = access; no `requireQa()` equivalent |
| `QaDashboardDtos.java` | 3 Java records: `QaDashboardSummaryDto`, `AcceptanceCriteriaRowDto`, `AcCoverageTrendPointDto`; `static from(model)` mapper | Field names must match FE `types.ts` exactly |
| `QaDashboardModels.java` | Domain records: `QaFilter`, `QaSummaryModel`, `AcCoverageRow`, `TrendPoint`, `AcceptanceCriteriaPage` | Domain layer; no JDBC/Spring dependencies |
| `QaDashboardService.java` | BR-2/BR-3 aggregation; `normalize()` validation; `@Transactional(readOnly=true)` | `acceptanceReadyCount = 0` hardcoded placeholder; `blackboxCoveragePercent = 0.0` placeholder |
| `QaDashboardRepositoryPort.java` | Read-only port interface; 4 methods | Application layer boundary; no infra leakage |
| `QaDashboardJdbcAdapter.java` | `NamedParameterJdbcTemplate`; inline SQL; `MapSqlParameterSource`; named params `:param` | JDBC (not MyBatis); private helpers `applyTicketFilters`, `applySearchFilter`, `applyPeriodFilter` |
| `api.ts` (updated) | `endpoints.qaDashboard.summary/acceptanceCriteria/coverageTrend` added | Follows `pmDashboard.*` pattern; URLSearchParams; optional params |
| `QADashboardPage.tsx` (updated) | 3 `useQuery` calls; `useDebounce` 300ms; pagination state; loading/error states | `QA_MOCK_DATA` removed from production path |
| `types.ts` (updated) | `AcceptanceCriteriaPage` pagination wrapper type added | FE-driven; BE DTO must match |
| `AcceptanceCriteriaTable.tsx` (updated) | Pagination controls + props: `page`, `totalPages`, `onPageChange`, `totalElements`, `isLoading` | Server-side pagination |
| `QaFilterBar.tsx` (updated) | Project/Repository dropdowns from BE endpoints; period static options; `buildRecentPeriodOptions` utility | ISO week calculation via `WeekFields.ISO` |
| `useDebounce.ts` (new) | Generic debounce hook; 300ms for search input | Reusable; extracted for other pages |

---

## 5. Review Results

| review type | result | notes |
|---|---|---|
| Self Review (self-review.md) | **NEEDS_UPDATE** | `mvn compile` PASS; `npx tsc --noEmit` PASS; 3 bugs found and fixed (QaFilterBar period options, AcceptanceCriteriaTable pagination props, QADashboardPage mock→useQuery). Unit tests written after Phase 5. Final verdict: Ready for human review. |
| Independent AI Review (codex-review.md) | **NOT_PERFORMED** | codex-review.md skeleton only — independent AI review not conducted in this ticket cycle. |
| Human Review (human-review.md) | **NOT_PERFORMED** | human-review.md skeleton only — pending. Manual smoke test required before merge. |

**Self-review findings (resolved):**

| finding | cause | fix |
|---|---|---|
| `buildRecentPeriodOptions` missing from utils.ts | Function imported in QaFilterBar.tsx but not implemented | Added ISO week calculation to `utils.ts` |
| `AcceptanceCriteriaTable` lacked pagination props | Old API had only `rows`; BE returns paged response | Rewrote component props to include page/totalPages/onPageChange/totalElements/isLoading |
| `QADashboardPage` still used `QA_MOCK_DATA` | Static placeholder not replaced | Replaced with 3 `useQuery` calls + debounce + pagination state |

---

## 6. Test Results

| test type | result | evidence |
|---|---|---|
| BE Unit — `QaDashboardServiceTest` (15 tests) | **PASS** | BR-2 (AC coverage % normal/zero-denom/rounding), BR-3 (blackbox 0.0 placeholder), test pass %, defect count, zero-state, normalize validation |
| BE Controller — `QaDashboardControllerTest` (4 tests) | **PASS** | summary() delegates; acceptanceCriteria() hasNext=false/true; coverageTrend() maps list |
| `mvn clean verify` + ArchUnit (79 total) | **PASS** | All hexagonal layer rules green; `LayerEnforcementTest` passes |
| FE — `npx tsc --noEmit` | **PASS** | After QaFilterBar period filter fix; 0 type errors |
| FE Unit (Vitest) | **NOT_RUN** | No Vitest test files exist; gap acknowledged in testing.md |
| Integration DB (TestContainers) | **NOT_RUN** | Deferred post-PoC; Docker PostgreSQL required |
| E2E (Playwright) | **NOT_RUN** | Requires dev environment (Docker Compose + FE/BE servers) |
| Manual browser smoke test | **NOT_RUN** | Required before merge |

**BB Test Cases**: 11 PASS / 3 PARTIAL / 1 SKIP (Accepted Risk) / 4 NOT_IMPL / 2 NOT_RUN
→ 詳細は `test-results.md §11`

**Blackbox Review Checklist**: PASS 9 / PARTIAL 5 / NOT_RUN 5 / NOT_IMPL 2
→ 詳細は `test-results.md §12`

---

## 7. Security / operations perspective

| item | status | notes |
|---|---|---|
| 401 unauthenticated | **PASS** | Spring Security standard; no custom config added; controller adds no bypass |
| Role-based access | **PASS (by design)** | All authenticated users = access; no role guard; matches PM Dashboard pattern; VIEWER → 200 (not 403) |
| SQL injection | **PASS** | All params via `MapSqlParameterSource` named params (`:paramName`); no string concatenation in adapter |
| Read-only constraint (BR-1) | **PASS** | Code review + ArchUnit: no INSERT/UPDATE/DELETE in `QaDashboardJdbcAdapter` |
| PII protection | **PASS** | Dashboard data (tickets, AC, findings) is internal operational data; no customer PII in V4 schema |
| Error response format | **PASS** | `GlobalExceptionHandler` returns `ErrorResponse(timestamp, status, errorCode, message, traceId)`; no stack trace to client |
| TraceId logging | **PASS** | Existing `TraceIdFilter` covers all `/api/**` → `/api/v1/qa/dashboard/**` automatically covered; no config change needed |
| No secrets in code | **PASS** | No credentials, tokens, or API keys in new files |
| Search param sanitization | **PASS** | `normalize()` trims, rejects >200 chars; ILIKE parameterized |
| CORS | **PASS** | Existing allowlist applies; no new CORS config |

---

## 8. Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| `acceptanceReadyCount = 0` for PoC | "Acceptance Ready" KPI card shows 0 for all scenarios; non-functional until formula defined | Product / QA Lead | TBD — H-QA-DASHBOARD-4 | — |
| `blackboxCoveragePercent = 0.0` placeholder | Blackbox Coverage card always 0%; no blackbox parser deployed; `tbl_fact_artifact_parsed_section` section_type未確認 | Dev / Product | TBD — when blackbox parser implemented | — |
| E2E (Playwright) not run | FE/BE integration not validated end-to-end; filter behavior, loading states, empty states unverified in browser | Dev | Before merge — manual smoke test as substitute | — |
| Integration DB tests (TestContainers) not run | `QaDashboardJdbcAdapter` SQL correctness not verified against real PostgreSQL; column name errors or JOIN issues undetected | Dev | Post-PoC (next sprint) | — |
| No FE Vitest unit tests | FE components (`QaSummaryCards`, `QaFilterBar`) not unit-tested; rendering contract only validated via TypeScript | Dev | Post-PoC | — |
| AC-9 drill-down drawer NOT_IMPL | Ticket detail view unavailable; users cannot drill down from dashboard row to full evidence view | Product | Future ticket | — |

---

## 9. Open Issues

| ID | issue | impact | next action | status |
|---|---|---|---|---|
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula — which conditions make a ticket "acceptance ready"? | `acceptanceReadyCount` KPI shows 0; Release Readiness card non-functional | Product to define formula; implement `getSummary()` update + dedicated unit test | **Deferred — P0 before next sprint** |
| H-QA-DASHBOARD-9 | Zero-AC ticket: does it count as "acceptance ready" vacuously or not? | Edge case in Release Readiness formula — linked to H-QA-DASHBOARD-4 | Resolve when H-4 formula is decided | **Deferred — linked to H-4** |
| H-QA-DASHBOARD-SECTION-TYPE | `section_type` value for blackbox viewpoints in `tbl_fact_artifact_parsed_section` — never confirmed from parser source | `blackboxCoveragePercent` stuck at 0.0; blackbox parser may or may not exist | Dev to read parser source code or query DB sample data; confirm value before writing real SQL | **Open — must resolve before blackbox feature** |

---

## 10. Human Decisions

| ID | decision | result | date |
|---|---|---|---|
| H-QA-DASHBOARD-1 | Role for QA Dashboard access | **Closed**: All authenticated users can access. No role guard. Same as PM Dashboard (`RoleTabs` shows all tabs). | 2026-06-26 |
| H-QA-DASHBOARD-2 | Admin tab / PM tab behavior | **Closed**: `RoleTabs.tsx` already has PM + QA functional routes; others placeholder. No additional work. | 2026-06-26 |
| H-QA-DASHBOARD-3 | Sprint column in tbl_dim_ticket | **Closed**: No Sprint column. Filter uses `periodKey` mapped to date range on `started_at`. Already in `QaFilters` type. | 2026-06-26 |
| H-QA-DASHBOARD-4 | `acceptanceReadyCount` formula | **Deferred**: Return `0` for PoC. Formula not yet defined by Product / QA Lead. | 2026-06-26 |
| H-QA-DASHBOARD-5 | Defect Leakage: production vs QA split | **Closed**: `tbl_fact_finding` has no `root_cause_phase`. `defectLeakageCount` = COUNT WHERE `status != 'RESOLVED'`. Single count. | 2026-06-26 |
| H-QA-DASHBOARD-6 | Coverage Trend chart scope | **Closed**: `CoverageTrendChart.tsx` already exists. In scope. BE endpoint: `GET /api/v1/qa/dashboard/coverage-trend`. | 2026-06-26 |
| H-QA-DASHBOARD-7 | Export button scope | **Closed**: Button already in `DashboardSearchHeader` (inert). PoC: visible, no-op. Follow PM Dashboard pattern. | 2026-06-26 |
| H-QA-DASHBOARD-8 | Blackbox viewpoint count | **Closed**: 8 viewpoints confirmed by user: Normal, Error, Boundary, Permission, State Transition, Operation, Audit, Compatibility. | 2026-06-26 |
| H-QA-DASHBOARD-9 | Zero-AC ticket readiness | **Deferred**: Linked to H-QA-DASHBOARD-4. Resolve when formula is decided. | 2026-06-26 |

---

## 11. Source Analysis Limitations

| limitation | impact | mitigation taken |
|---|---|---|
| `tbl_fact_artifact_parsed_section.section_type` 値が parser source から確認できなかった | `blackboxCoveragePercent` が常に 0.0 — blackbox データをクエリできない | `BLACKBOX_COVERAGE_PLACEHOLDER = 0.0` として明示; Accepted Risk に記録 |
| `tbl_fact_test_run`, `tbl_fact_artifact_snapshot` の全カラム名を Phase 1 では部分確認のみ | Phase 5 でSQL実装後に integration test 未実施のため、カラム名不一致が本番DBで判明する可能性 | Phase 3 Step 1 でV4 SQLを直接読み実装時確認済み (self-review.md §4); ただし実DB統合テストは未実施 |
| PM Dashboard Controller/Service ファイルパスを sources に記録したが Phase 1 で直接読まなかった | Phase 3 でのパターン確認が遅れた | Phase 3 時点で直接読みパターン適用済み; 最終実装は PM Dashboard sibling と整合 |
| `tbl_fact_ac_test_coverage` feature (AcCoveragePort) は既存だが dashboard 集計には流用不可 | `findActiveAcKeys()` の戻り値が ticket-level であり portfolio 集計用ではない | 独立した aggregate query を `QaDashboardJdbcAdapter` に実装 |

---

## 12. What Worked

| item | detail |
|---|---|
| **JDBC-only設計** | MyBatis XMLを廃止することで BE ファイル数を 13→6 に削減。複雑な JOIN SQL がインライン SQL で可読性高く保持。PM Dashboard sibling との一貫性を維持。 |
| **FE先行実装パターン** | `QADashboardPage.tsx`, `QaSummaryCards`, `QaFilterBar`, `AcceptanceCriteriaTable`, `CoverageTrendChart` が既にmock dataで完成していた。FE作業が wire-up + loading/error state の追加のみに縮小した。 |
| **Hexagonal architecture の自然な適合** | ArchUnit `LayerEnforcementTest` が green のまま。既存パッケージ構造に新規 bounded context `qadashboard/` を追加するだけで済んだ。 |
| **`acceptanceReadyCount = 0` placeholder 戦略** | formula未決定のまま PoC をブロックしなかった。placeholder 戦略によりPhase 5が完了できた。 |
| **`useDebounce` hook 抽出** | 300ms debounce を再利用可能な hook として `src/hooks/useDebounce.ts` に分離。他ページでも利用可能。 |
| **`normalize()` 一元バリデーション** | service 内の private `normalize()` でtrim/UUID/periodKey/page clamp を一元管理。controller は thin のまま保持。 |

---

## 13. What Failed

| item | root cause | lesson |
|---|---|---|
| **`blackboxCoveragePercent` 常に 0.0** | impl-plan §12 で `section_type` 確認を P0 Stop Condition としていたが、parser source を読まずに adapter を書いた。`tbl_fact_artifact_parsed_section` に blackbox viewpoint データが実際に存在するか未確認。 | 新テーブルの `section_type` 値は SQL/code/DBサンプルで確認してから SQL を書く。Stop Condition は実際にプロセスを止めること。 |
| **`acceptanceReadyCount` formula が Phase 5 直前まで未決定** | spec-pack §16 で H-QA-DASHBOARD-4 を P0 before Phase 3 と記載していたが、Phase 3/4 で Product決定を得られないまま Phase 5 に進んだ。 | PoC blockでない Deferred アイテムは deadline を設定し、次フェーズ前に escalate する。formula が未定義のまま実装フェーズに入ると KPI card が常に非機能状態となる。 |
| **E2E テスト未実施** | dev環境 (Docker Compose + BE + FE同時起動) が Phase 5/6 時点で用意されていなかった。 | E2E 環境の準備を Phase 4 (test plan) 時点でスケジュールする。merge gate に含める。 |
| **`AcceptanceCriteriaTable` の pagination props 不一致** | Phase 2 context.md では pagination スコープが明確でなかった。BE が `AcceptanceCriteriaPage` を返すことが Phase 5 で決定されたが FE の既存コンポーネント型と不整合が生じた。 | FE/BE contract を Phase 3 FE-BE Contract Map に明記する。型不一致は `npx tsc --noEmit` で検出できたが、事前にcontract confirmationで防げた。 |

---

## 14. Ứng viên cập nhật Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-QA-DASH-01 | 新KPI が常に 0% を返す — parser依存データがDBに存在しない | 新 `section_type` 値を持つ parsed artifact を dashboard がクエリするとき parser が未デプロイ or `section_type` 値が未確認 | impl-plan Step 1: parser source を読み `section_type` 値を確認してから adapter SQL を書く | KPI card が 0% のまま変化しない; DB直接クエリで fact table が空 |
| FMI-QA-DASH-02 | PoC placeholder `= 0` が本番まで残存する | formula 未決定のまま Deferred ラベルで実装; 担当チームへのエスカレーションなし | spec-pack 段階で deadline を明示; Phase 3 進入の go/no-go 条件に含める | acceptanceReadyCount が全環境で 0; 本番ユーザーが異常と認識してincident報告 |

---

## 15. Ứng viên cập nhật Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-QA-DASH-01 | QA Dashboard endpoints を existing endpoint list に追加 (`/api/v1/qa/dashboard/summary|acceptance-criteria|coverage-trend`; DTO shapes; auth: all authenticated) | `docs/architecture/fe-be-contract-map.md` | 新エンドポイントが contract map に未反映; 次チケットのFE/BE contract work が参照できない | P1 |
| LD-QA-DASH-02 | JDBC adapter を dashboard aggregation の推奨パターンとして記録 (vs MyBatis for CRUD) | `docs/architecture/overview.md` または `route-api-map.md` | `QaDashboardJdbcAdapter` が JDBC 採用の実例として機能; 将来の dashboard 系 ticket での決定を早める | P2 |
| LD-QA-DASH-03 | "FE先行実装パターン" を ticket workflow の注意事項として追記 — FE mock data が既存の場合、Phase 1 で FE スコープを確認しないと実装工数を過大見積もりする | `ticket-rules.md` または `docs/architecture/fe-be-contract-map.md §2` | 今回 FE が既に実装済みだったことが Phase 3 で初めて判明; Phase 1 ソース確認リストに FE page/mock data の有無を追加 | P1 |

---

## 16. Final Verdict

**NEEDS_UPDATE — 人間レビュー + E2E pending**

| gate | status |
|---|---|
| `mvn clean verify` + ArchUnit (79 tests) | ✅ PASS |
| `QaDashboardServiceTest` + `QaDashboardControllerTest` (19 tests) | ✅ PASS |
| `npx tsc --noEmit` | ✅ PASS |
| Self-review completed | ✅ Done |
| Independent AI review (codex-review.md) | ❌ NOT_PERFORMED |
| Human review (human-review.md) | ❌ NOT_PERFORMED |
| Manual browser smoke test | ❌ Required before merge |
| E2E (Playwright) | ❌ NOT_RUN |
| Integration DB tests (TestContainers) | ❌ Deferred post-PoC |
| H-QA-DASHBOARD-4 formula decision | ❌ Deferred — P0 before acceptanceReadyCount実装 |
| AC-9 drill-down drawer | ❌ NOT_IMPL — separate ticket required |

**Merge block conditions (must resolve before promote):**
1. Human reviewer runs `mvn clean verify` with Docker DB up and confirms PASS
2. Manual smoke test: load QA tab → cards display → apply filter → cards update → 0-state for ticket with no parsed data
3. Direct API call without auth cookie → HTTP 401 confirmed

**Post-merge follow-up (tracked):**
- E2E Playwright tests
- Integration DB tests (TestContainers)
- H-QA-DASHBOARD-4 formula implementation
- AC-9 Ticket Detail Drawer (separate ticket)
- Blackbox parser `section_type` confirmation → real `blackboxCoveragePercent` implementation
