# Black-box Review Checklist

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung        
**Update date**: 2026-06-23  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Empty files, very short files, or files missing required sections are reported as partial/incomplete instead of failing silently | AC-PARSER-SELF-REVIEW-4, AC-PARSER-SELF-REVIEW-9 | P0 | pass | |
| 1.2 | Re-parsing the same content keeps the content hash stable and does not create a new semantic outcome | AC-PARSER-SELF-REVIEW-10 | P0 | pass | |
| 1.3 | Placeholder-only fields such as `---`, `TBD`, `TODO`, `N/A`, or `<...>` are not counted as completed evidence | AC-PARSER-SELF-REVIEW-8 | P1 | pass | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Only files under `docs/changes/PARSER-SELF-REVIEW/self-review.md` are accepted; out-of-scope paths are rejected | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-9 | P0 | pass | |
| 2.2 | Unauthorised or out-of-scope callers cannot pass through the guarded parse entrypoint | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-9 | P0 | pass | |
| 2.3 | Parse output does not leak raw secrets, raw prompts, chat logs, or source code outside the ticket scope | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-6 | P1 | pass | |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Stable output fields such as `ticket_id`, `header_metadata`, `sections`, `final_verdict`, `warnings`, and `errors` remain present across valid parses | AC-PARSER-SELF-REVIEW-2, AC-PARSER-SELF-REVIEW-3, AC-PARSER-SELF-REVIEW-5, AC-PARSER-SELF-REVIEW-7 | P0 | pass | |
| 3.2 | Verdict normalization only maps to the supported contract values `PASS`, `NEEDS_UPDATE`, and `BLOCKED` | AC-PARSER-SELF-REVIEW-7 | P0 | pass | |
| 3.3 | Line ending variants and Unicode content keep the same semantic result and do not break the parse contract | AC-PARSER-SELF-REVIEW-6, AC-PARSER-SELF-REVIEW-10 | P1 | pass | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing required sections produce warnings and partial results when the remaining content is still readable | AC-PARSER-SELF-REVIEW-4, AC-PARSER-SELF-REVIEW-9 | P0 | pass | |
| 4.2 | Malformed tables keep readable content available and emit a clear parse warning/error | AC-PARSER-SELF-REVIEW-5, AC-PARSER-SELF-REVIEW-9 | P0 | pass | |
| 4.3 | Missing artifacts are reported clearly and are not finalized as an official parse result | AC-PARSER-SELF-REVIEW-9, AC-PARSER-SELF-REVIEW-10 | P1 | pass | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Large command / risk / note text still parses in a normal single run | AC-PARSER-SELF-REVIEW-6, AC-PARSER-SELF-REVIEW-10 | P1 | pass | |
| 5.2 | Files with many tables / long sections remain usable without obvious freeze or parse failure | AC-PARSER-SELF-REVIEW-3, AC-PARSER-SELF-REVIEW-5 | P1 | pass | |
| 5.3 | No visible retry or reload loop occurs when given a valid but large input | AC-PARSER-SELF-REVIEW-9, AC-PARSER-SELF-REVIEW-10 | P2 | pass | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | All 11 canonical sections are extracted and ordered correctly | AC-PARSER-SELF-REVIEW-3 | P0 | pass | |
| 6.2 | Free-text sections preserve meaning and placeholder-only content is not counted as evidence | AC-PARSER-SELF-REVIEW-6, AC-PARSER-SELF-REVIEW-8 | P0 | pass | |
| 6.3 | Table sections are parsed into rows with correct counts and without silent row loss | AC-PARSER-SELF-REVIEW-5 | P0 | pass | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Success output does not expose sensitive information outside the ticket artifact scope | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-6 | P1 | pass | |
| 7.2 | Error and warning messages include codes or descriptions that are actionable for operations and QA | AC-PARSER-SELF-REVIEW-9, AC-PARSER-SELF-REVIEW-10 | P1 | pass | |
| 7.3 | Audit-like fields such as ticket, path, hash, mode, status, warning count, and error count are observable in the output or logs | AC-PARSER-SELF-REVIEW-2, AC-PARSER-SELF-REVIEW-10 | P0 | pass | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026/06/23| Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.