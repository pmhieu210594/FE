# Promotion Candidates

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-23

## 1. Failure Mode Index Candidates

| candidate | symptom | rationale | recommended entry |
|---|---|---|---|
| Placeholder warning on canonical fixture | Table separator / placeholder marker is seen as an incomplete signal | This is a valid quality signal but can easily be misunderstood as a bug | `FM-SELF-REVIEW-PLACEHOLDER-WARN` |
| Path guard scope too wide | Files outside `docs/changes/PARSER-SELF-REVIEW/self-review.md` may still slip through | Increases the risk of file reads outside scope | `FM-SELF-REVIEW-PATH-GUARD` |
| Verdict alias drift | Verdict text outside the fixed map is normalized incorrectly | Affects downstream contract and review sign-off | `FM-SELF-REVIEW-VERDICT-NORMALIZATION` |
| Section order drift | Correct content but headings in the wrong order still appear valid | Can reduce trust in the parse result | `FM-SELF-REVIEW-SECTION-ORDER` |

## 2. Living Docs Candidates

| candidate | why promote | evidence anchor | next use |
|---|---|---|---|
| `spec-pack.md` | SSOT for parser contract, AC, boundary, and acceptance | `spec-pack.md:8-18,24-33,79-89,258-264` | Use as reference for later phases and similar parser tickets |
| `self-review.md` canonical fixture | Golden fixture for regression, UT/IT/BB | `self-review.md:1-95` | Reuse for future parser regression |
| `test-data.md` | Catalog of normal/error/boundary/permission data | `test-data.md` | Reuse when creating test data for similar tickets |
| `blackbox-review-checklist.md` | Reusable sign-off checklist | `blackbox-review-checklist.md:18-84` | Copy as a template for the next parser ticket |
| `test-results.md` | Records run evidence and PASS status | `test-results.md:8-69` | Reuse as a pattern for reports/test summaries |

## 3. Lessons Learned

- Using a fixed alias map and canonical template makes review and testing much easier to trace than heuristic parsing.
- The black-box checklist mapped to AC helps close boundary, permission, and operational observability gaps quickly.
- When the canonical file produces quality warnings, it should be clear that these are accepted signals, not functional failures.
