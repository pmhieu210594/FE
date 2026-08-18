# Human Review

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-22

## Reviewer

Codex

## Review Date

2026-06-22

## Review Scope

Review of the diff for `PARSER-SPEC-PACK` based on `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, the rules, and the changed code/migration/test files.

## Review Result

| item | result | note |
|---|---|---|
| Diff summary | The Artifact Scanner has been fixed according to the review: the AC hash now uses a real SHA-256 hex, `getRunArtifacts()` reads the correct run snapshot from the historical snapshot table, and the GitHub source adapter obtains `committedAt` from the commit API instead of always returning null. | The previous Major items have been addressed, and tests have been added for hash generation, run-history query, and commit timestamp mapping. |
| Conclusion | Approve | No open Blocker or Major issues remain after the code update. |

## AI Review Finding Triage

| finding ID | decision | reason | action |
|---|---|---|---|
| M1 | Closed | `computeSha256(String)` has been changed to `HexFormat.of().formatHex(...)` with UTF-8, so `ac_text_hash` is a stable SHA-256 hex value. | No additional action needed. |
| M2 | Closed | `findRunArtifacts()` now queries `tbl_fact_artifact_snapshot` directly by `connector_run_id`, so run-specific artifacts no longer depend on the current-inventory view. | No additional action needed. |
| M3 | Closed | `GithubArtifactScannerSourceAdapter.resolveRevision()` now calls `/commits/{sha}` to get `committedAt` from the commit date instead of returning a fixed null value. | No additional action needed. |

## Blocker / Major Remaining

- None.

## Accepted Risk

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| None | No risk accepted at the time of review. | N/A | N/A | N/A |

## Human Decisions

- None.

## Final Human Verdict

- APPROVE