# Promotion Candidates

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-25  
**Author**: nk_trung  
**Update date**: 2026-06-25

## Purpose

Record the artifacts, patterns, and failure modes that are strong candidates for promotion into reusable standards or living docs after this ticket.

## Candidate Table

| candidate | why it is worth promoting | target / follow-up |
|---|---|---|
| `spec-pack.md` AC + frozen score-band rules | It already serves as the SSOT for scope, AC, and threshold logic. | Reuse as the template for future evidence-scoring tickets. |
| `blackbox-testcases.md` | It now covers normal, error, boundary, security, state, and operation viewpoints in one AC-linked matrix. | Promote as the default black-box template for BE contract tickets. |
| `test-data.md` | It isolates synthetic fixtures, boundary values, and negative data in a reusable format. | Promote as the default test-data companion for black-box packs. |
| `review-checklist.md` | It captures the exact AC, security, operations, and BE/API review points for this feature class. | Promote as the standard review checklist for scoring / evidence-consistency tickets. |
| `test-results.md` | It shows how to separate targeted unit evidence from broader release readiness. | Promote as the final-test evidence template. |
| `report.md` | It demonstrates how to summarize spec, impact, implementation, review, test, risk, and residual issues in one place. | Promote as the canonical final report format for future tickets. |
| Failure mode: persisted read-back drops `parseErrors` / `traceIds` | This is a high-value regression pattern for any persisted read-back API. | Add to Failure Mode Index and future persistence-contract reviews. |
| Failure mode: report section keys not loaded before scoring | Useful for any feature that scores markdown section presence. | Add to scoring-rule design guidance. |
| Failure mode: review-checklist treated as presence-only | Helps avoid false positives on review completeness. | Add to review-quality guidance. |
| Failure mode: `OPEN_ISSUES` row semantics diverge from spec wording | Prevents spec drift in section-based scoring rules. | Add to SSOT conflict-resolution guidance. |
| Failure mode: test-linkage gated by `SUCCESS` without explicit SSOT support | Prevents hidden business-rule tightening. | Add to acceptance-rule review checklist. |

## Notes

- Promote only after the implementation/spec decision is settled.
- Keep the SSOT aligned before turning any of these into organization-wide standards.
- Use the failure-mode items as candidates for the shared Failure Mode Index and Living Docs backlog.