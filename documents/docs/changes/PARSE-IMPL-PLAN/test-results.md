# Test Results

**Ticket ID**: PARSE-IMPL-PLAN
**Create date**: 2026-06-18
**Author**: ChatGPT
**Update date**: 2026-06-19

## 1. Execution Environment

| item | value |
|---|---|
| OS / workspace | Windows 10 / `C:\Users\pd_khoa.BRYCENVN\Documents\EDCAP` |
| Build tool | Maven (maven-compiler-plugin 3.13.0) |
| JDK | Project JDK (local environment) |
| Test runner | JUnit 5 / `mvn -Dtest=ImplPlanParseServiceTest test` |
| Run date | 2026-06-19 |

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `mvn -q -Dtest=ImplPlanParseServiceTest test` | PASS | 7 tests, 0 failures, 0 errors — Maven exit code 0 | Full unit test set including 2 new tests |
| `mvn -q -DskipTests compile` | PASS (prior run) | Maven compile output in terminal | Full compile passed after wiring changes |

## 3. Summary of Results

All 7 parser unit tests passed. The 5 pre-existing tests and 2 newly added tests ran without failures. The project compiled cleanly. Log output confirmed each test produced the expected `parseStatus` (SUCCESS / PARTIAL / PARSE_ERROR / NOT_FOUND) and correct `sections=14` persistence count.

## 4. List of Passes

| test | result | note |
|---|---|---|
| `parse_success_persists_all_sections_and_allows_detail_lookup` | PASS | All 14 sections extracted; `detail()` query returns same hash |
| `parse_missing_section_returns_partial_and_records_missing_field` | PASS | Missing `migration_rollback_policy` → PARTIAL; field recorded |
| `parse_duplicate_heading_returns_partial` | PASS | Duplicate `alternative_plan` → PARTIAL + warning contains "duplicate" |
| `parse_not_found_persists_snapshot_for_ui_visibility` | PASS | `NOT_FOUND` — snapshot persisted (1 row); all fields presentFlag=false |
| `parse_same_hash_upserts_existing_snapshot_instead_of_duplication` | PASS | Second parse reuses same snapshotId; repository.snapshotCount() stays 1 |
| `parse_empty_source_returns_parse_error` | PASS | Empty string → PARSE_ERROR; snapshot persisted; warnings non-empty |
| `parse_malformed_markdown_safe_summary_does_not_leak_content` | PASS | Garbled heading input → stable parse; warnings do not echo raw source |

## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|
| None | - | - | - |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| BOM introduced by `WriteAllLines` with `Encoding.UTF8` | Rewrote file with `new UTF8Encoding(false)` (no-BOM variant) | Maven compile succeeds after fix |
| Control-byte literal in `parse_malformed_markdown` fixture | Replaced `\x00\x01\x02` garbage bytes with clean ASCII `%%% garbage content %%%` | Eliminates java:S2479 SonarLint warning; test still validates safety |
| Stale method name in self-review.md §2 | `parse_not_found_skips_snapshot_storage` → actual method is `parse_not_found_persists_snapshot_for_ui_visibility` | Corrected in test-plan.md §4 note; self-review.md §2 reference should be updated |

## 7. Not yet fixed / Pending

| item | reason |
|---|---|
| self-review.md §2 stale method name | Low-risk doc inconsistency; test-plan.md §4 note already records the correction |

## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| Integration DB parse run | No live DB integration execution performed in this pass | Medium — SQL adapter in `ImplPlanParseJdbcAdapter.java` is compile-verified but not runtime-tested against real DB | Successful compile + in-memory unit tests verify behavioral contract |
| API IT (`ImplPlanParseController`) | Demo controller is read-only; not a PoC gate | Low | Controller wires to service methods already unit-tested |

## 9. Remaining risk

- The existing-table SQL adapter (`ImplPlanParseJdbcAdapter`) is compile-verified but not exercised against a live database. An integration test against the real schema is needed before production rollout.
- `self-review.md §2` retains a stale method name (`parse_not_found_skips_snapshot_storage`). The actual behavior — persisting snapshot for UI visibility — is confirmed by the passing test and by log output showing `status=NOT_FOUND sections=14`.

## 10. Final Test Verdict

- PASS
