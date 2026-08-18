# Black-box Review Checklist

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-22  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Empty files, very short files, or files missing core sections are reported clearly instead of failing silently | AC-SPEC-PARSER-8, AC-SPEC-PARSER-10 | P0 | Pass | |
| 1.2 | Re-parsing the same content / same `content_hash` does not create duplicate snapshots | AC-SPEC-PARSER-10 | P0 | Pass | |
| 1.3 | AC count boundaries: 0 / 1 / many ACs are all counted correctly | AC-SPEC-PARSER-5 | P1 | Pass | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Only paths under `docs/changes/<TICKET>/spec-pack.md` are accepted; out-of-scope paths are rejected | AC-SPEC-PARSER-1 | P0 | Pass | |
| 2.2 | Scan/admin-related operation handling does not allow invalid callers to pass through | AC-SPEC-PARSER-10 | P0 | Pass | |
| 2.3 | Parse results do not expose raw secrets / raw prompts / source code outside scope | AC-SPEC-PARSER-1, AC-SPEC-PARSER-4 | P1 | Pass | |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | The response/snapshot keeps stable fields such as `ticketId`, `parseStatus`, `sections`, `acceptanceCriteria` | AC-SPEC-PARSER-3, AC-SPEC-PARSER-4, AC-SPEC-PARSER-5 | P0 | Pass | |
| 3.2 | Error/warning states are machine-readable and include enough file/section context | AC-SPEC-PARSER-8, AC-SPEC-PARSER-10 | P0 | Pass | |
| 3.3 | ACs with invalid formats keep their original content for review and are not auto-fixed in a way that changes meaning | AC-SPEC-PARSER-6 | P1 | Pass | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing sub-sections only produce warnings/partial results when the core content is still sufficient to read | AC-SPEC-PARSER-3, AC-SPEC-PARSER-8 | P0 | Pass | |
| 4.2 | When a file is modified and parsed again, the state transitions correctly without creating duplicate records | AC-SPEC-PARSER-9, AC-SPEC-PARSER-10 | P0 | Pass | |
| 4.3 | Missing artifacts are reported clearly and do not result in an official snapshot being finalized | AC-SPEC-PARSER-10 | P1 | Pass | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Files with many sections/tables still parse and count correctly in a normal single run | AC-SPEC-PARSER-3, AC-SPEC-PARSER-4, AC-SPEC-PARSER-5 | P1 | Pass | |
| 5.2 | Long content / Unicode / many placeholders are still handled without encoding errors | AC-SPEC-PARSER-7, AC-SPEC-PARSER-8 | P1 | Pass | |
| 5.3 | No observable retry/reload loop occurs when given a valid but large input | AC-SPEC-PARSER-9, AC-SPEC-PARSER-10 | P2 | Pass | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Core template sections are extracted fully and in the correct logical order | AC-SPEC-PARSER-3 | P0 | Pass | |
| 6.2 | Placeholders are not counted as completed data | AC-SPEC-PARSER-7 | P0 | Pass | |
| 6.3 | AC count, warnings, partial, failed, and missing artifact states are reflected correctly | AC-SPEC-PARSER-5, AC-SPEC-PARSER-8, AC-SPEC-PARSER-9, AC-SPEC-PARSER-10 | P0 | Pass | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Success output does not expose sensitive information outside the artifact scope | AC-SPEC-PARSER-1, AC-SPEC-PARSER-4 | P1 | Pass | |
| 7.2 | Error/warning messages include codes or descriptions that are clear enough for operations to act on | AC-SPEC-PARSER-8, AC-SPEC-PARSER-10 | P1 | Pass | |
| 7.3 | Audit fields such as ticket/path/hash/mode/status/warning/error are observable in output or logs | AC-SPEC-PARSER-9, AC-SPEC-PARSER-10 | P0 | Pass | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026/06/22 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.