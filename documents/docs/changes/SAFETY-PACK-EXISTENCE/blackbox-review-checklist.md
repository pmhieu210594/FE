# Black-box Review Checklist

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

---

## How to use

- Each reviewer marks `pass` / `fail` / `skip` with justification.
- Any `fail` P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 - Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | `rules/` exists but contains zero markdown files; result must not be READY | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 | P0 | Pass | Covers empty boundary for file coverage. |
| 1.2 | `settings.json` is syntactically invalid; scan returns PARSE_ERROR without crashing | AC-SAFETY-PACK-4 | P0 | Pass | Safe failure path for malformed input. |
| 1.3 | Permission arrays are missing or empty; counts resolve to zero | AC-SAFETY-PACK-3 | P1 | Pass | Exact threshold equality at zero. |

---

## Category 2 - Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Authenticated users of different roles can access the evidence APIs consistently | AC-SAFETY-PACK-11 | P0 | Pass | Covers role-agnostic access boundary. |
| 2.2 | Unauthenticated access is denied the same way for APIs | AC-SAFETY-PACK-11 | P1 | Pass | Use if the environment exposes anonymous access. |
| 2.3 | Access control does not reveal evidence data or internal implementation detail | AC-SAFETY-PACK-11 | P0 | Pass | Keep response contract safe. |

---

## Category 3 - Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Existing `.claude/`-only repositories still render correctly when `documents/.claude/` is absent | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 | P1 | Pass | Backward-compatible local source-dir fallback. |
| 3.2 | Successful ingest returns only normalized fields and metadata, not raw scan bodies | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 | P0 | Pass | Contract stability for response shape. |
| 3.3 | Validation errors are returned in a stable, machine-readable form | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10, AC-SAFETY-PACK-11 | P0 | Pass | Important for ops handling. |

---

## Category 4 - Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Malformed ingest payload is rejected and no partial evidence is exposed | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 | P0 | Pass | Partial failure isolation. |
| 4.2 | Repeated ingest of the same normalized summary is safe to retry | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 | P1 | Pass | Retry-safe / idempotent behavior. |
| 4.3 | Empty evidence state is shown clearly when no valid scan data exists | AC-SAFETY-PACK-1, AC-SAFETY-PACK-6 | P1 | Pass | No-data behavior must be understandable. |

---

## Category 5 - Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Evidence APIs respond without visible freeze under typical synthetic fixture size | AC-SAFETY-PACK-6, AC-SAFETY-PACK-11 | P1 | Pass | Observe response behavior only. |
| 5.2 | Large but synthetic rule/count datasets remain usable through the APIs | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2, AC-SAFETY-PACK-3 | P2 | Pass | Keep the scope bounded to black-box size checks. |
| 5.3 | No visible retry loop or repeated error pop-up occurs on failure | AC-SAFETY-PACK-4, AC-SAFETY-PACK-6 | P1 | Pass | Stability under error conditions. |

---

## Category 6 - Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Local source selection prefers `documents/.claude/` over `.claude/` when both exist | AC-SAFETY-PACK-1 | P0 | Pass | Core precedence rule. |
| 6.2 | File existence flags reflect `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md` separately | AC-SAFETY-PACK-2 | P0 | Pass | Core coverage rule. |
| 6.3 | Secret Scan, SAST, and SCA statuses map to FAIL or WARNING exactly as specified | AC-SAFETY-PACK-7, AC-SAFETY-PACK-8, AC-SAFETY-PACK-9 | P0 | Pass | Policy integrity for CI evidence. |

---

## Category 7 - i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Success responses do not leak raw secrets, tokens, private keys, or finding bodies | AC-SAFETY-PACK-5, AC-SAFETY-PACK-10 | P0 | Pass | Security/privacy observability check. |
| 7.2 | Error responses expose a safe machine-readable code or status that callers can handle | AC-SAFETY-PACK-4, AC-SAFETY-PACK-6, AC-SAFETY-PACK-11 | P0 | Pass | Supports consistent API handling. |
| 7.3 | Logs or trace output, when inspected in the test environment, contain only metadata such as repository, SHA, and run id | AC-SAFETY-PACK-5, AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 | P1 | Pass | Log/audit/report output viewpoint. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
