# Test Results

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung
**Update date**: 2026-06-25

## 1. Execution Environment

| item | value |
|---|---|
| JVM | Java 21.0.5 LTS |
| Backend branch | TBD |
| Database | Not connected during targeted unit test run |
| OS | Windows |
| Test date | 2026-06-25 |

## 2. Executed Command / Existing Evidence

| command / evidence | result | log/evidence | note |
|---|---|---|---|
| `mvn test "-Dtest=EvidenceQualityScoreServiceTest"` | PASS | Maven Surefire output in terminal | Targeted regression for score recalculation, including `spec-pack.md` scope handling and `Open Issues` row status handling. |
| `blackbox-testcases.md` / `test-data.md` coverage matrix | PASS | `docs/changes/EVIDENCE-QUALITY-SCORE/blackbox-testcases.md` and `docs/changes/EVIDENCE-QUALITY-SCORE/test-data.md` | Black-box coverage was prepared for normal, error, boundary, security, state, and operation viewpoints. |
| Black-box execution evidence | PASS | `blackbox-testcases.md` summary | 10/10 black-box cases were recorded as passed in the current ticket evidence. |

## 3. Summary of Results

The current evidence set shows the targeted score recalculation regression passed, and the black-box matrix is complete for the ticket scope. At the same time, the review pass still reports unresolved contract and scoring mismatches, so the ticket cannot be treated as fully released yet.

## 4. List of Passes

| test | result | note |
|---|---|---|
| `EvidenceQualityScoreServiceTest.recalculate_full_snapshot_returns_excellent_and_final` | PASS | Verified the baseline full snapshot still scores `100.00` and remains `final`. |
| `EvidenceQualityScoreServiceTest.recalculate_spec_pack_open_issue_row_removes_scope_score` | PASS | Verified `Open Issues` with an `Open` row reduces only the `spec_pack_scope` subscore to `8.00`. |
| `EvidenceQualityScoreServiceTest.recalculate_partial_test_coverage_scores_plan_and_results_but_not_full_linkage` | PASS | Verified unrelated test-linkage scoring still behaves as expected. |
| `EvidenceQualityScoreServiceTest.recalculate_ci_external_run_id_only_scores_full_ci_link` | PASS | Verified CI link scoring still accepts external run ID plus URL. |
| `EvidenceQualityScoreServiceTest.recalculate_ci_failed_job_counts_as_zero_point` | PASS | Verified partial CI linkage still scores partially. |
| `EvidenceQualityScoreServiceTest.recalculate_missing_evidence_reports_missing_and_partial` | PASS | Verified missing evidence still returns partial state and missing markers. |
| `EvidenceQualityScoreServiceTest.latest_becomes_stale_when_source_changes_after_persistence` | PASS | Verified stale snapshot detection still works. |
| `EvidenceQualityScoreServiceTest.recalculate_rejects_invalid_ticket_id` | PASS | Verified invalid ticket ID rejection still works. |
| Black-box cases `BB-EQS-001` to `BB-EQS-010` | PASS | 10/10 cases are covered by the prepared black-box matrix and test data. |

## 5. List of Fails

| test | cause | action | status |
|---|---|---|---|
| None | N/A | N/A | N/A |

## 6. Bugs Fixed

| bug | fix | evidence |
|---|---|---|
| `spec-pack.md` scope block was being treated as a hard zero when `Open Issues` contained an open row | Split the score so only the `Open Issues` portion is zeroed when an open row exists; the scope child sections and other risk-control sections still contribute points. | `EvidenceQualityScoreServiceTest.recalculate_spec_pack_open_issue_row_removes_scope_score` |
| `## 2. Scope` could influence score gating even when the header existed | Changed the score rule so `SCOPE` is treated as a grouping header and score is driven by `SCOPE_WITHIN_RANGE` and `SCOPE_OUT_OF_RANGE`. | `EvidenceQualityScoreServiceTest.recalculate_spec_pack_open_issue_row_removes_scope_score` |

## 7. Not yet fixed / Pending

- Broader regression suites were not rerun in this pass.
- Independent AI review is still pending in the released evidence set.
- Human review remains in NEEDS_UPDATE state.
- Persisted read-back still needs confirmation for the mandatory `parseErrors` and `traceIds` fields.
- Report scoring, review-checklist coverage, and test-linkage gating still need alignment with the frozen spec.

## 8. Test cannot be executed and reason

| test/command | reason | risk | alternative evidence |
|---|---|---|---|
| Full BE unit/contract suite | Not part of this targeted pass | Unrelated regressions outside this feature may still exist | Targeted score regression above |
| External black-box runtime harness | No separate runtime harness was invoked in this pass | Behavior outside the unit-test boundary is not independently proven | Black-box testcase matrix and test-data evidence |
| Full persistence round-trip verification for `parseErrors` / `traceIds` | Current review evidence flags a storage-contract gap | Downstream read-back may lose contract fields | `human-review.md` and `codex-review.md` findings |

## 9. Remaining risk

- Only the targeted score regression was executed in this pass.
- The review findings still show contract drift against the spec.
- Broader system-level coverage still needs a separate run if release gating is required.

## 10. Final Test Verdict

- PASS