# Black-box Review Checklist

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Missing `impl-plan.md` is reported as `NOT_FOUND` without crashing | AC-PARSE-IMPL-PLAN-1 | P0 | ✅ | |
| 1.2 | Missing required section is reported explicitly as `PARTIAL` or `PARSE_ERROR` | AC-PARSE-IMPL-PLAN-5 | P0 | ✅ | |
| 1.3 | Empty sections / near-empty template content are not fabricated as valid data | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-5 | P1 | ✅ | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | No unauthorized read path is exposed for parse result unless an API/UI is explicitly enabled | AC-PARSE-IMPL-PLAN-7 | P2 | ✅ | Skip if parser remains backend-only in PoC |
| 2.2 | Unauthenticated access is blocked on any read surface if it exists | AC-PARSE-IMPL-PLAN-7 | P2 | ✅ | Apply only if read API/UI is added |
| 2.3 | Role-based guard follows the ticket decision for any exposed read surface | AC-PARSE-IMPL-PLAN-7 | P2 | ✅ | Not required for parser core |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Read-result payload shape stays stable for later display/query | AC-PARSE-IMPL-PLAN-7 | P1 | ✅ | Only if read model is exposed |
| 3.2 | Success result envelope remains backward-compatible for same ticket/source hash | AC-PARSE-IMPL-PLAN-6 | P1 | ✅ | |
| 3.3 | Validation / error contract is explicit and machine-readable | AC-PARSE-IMPL-PLAN-5, AC-PARSE-IMPL-PLAN-7 | P0 | ✅ | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing-section parse isolates the missing part and still preserves other extracted fields | AC-PARSE-IMPL-PLAN-5 | P0 | ✅ | |
| 4.2 | Re-parse after fixing the source updates the existing result instead of duplicating it | AC-PARSE-IMPL-PLAN-6 | P0 | ✅ | |
| 4.3 | Empty-state / no-data case is shown clearly for missing file or missing parse result | AC-PARSE-IMPL-PLAN-1, AC-PARSE-IMPL-PLAN-7 | P1 | ✅ | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Large markdown remains usable and parse output is still produced | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-5 | P1 | ✅ | |
| 5.2 | Mixed Vietnamese / English / code blocks do not corrupt encoding | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-5 | P1 | ✅ | |
| 5.3 | No visible freeze / retry loop is observed on normal or large files | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-6 | P2 | ✅ | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | All required `impl-plan.md` sections are extracted into the correct structured fields | AC-PARSE-IMPL-PLAN-2, AC-PARSE-IMPL-PLAN-3, AC-PARSE-IMPL-PLAN-4 | P0 | ✅ | |
| 6.2 | Out-of-scope artifacts are not parsed as part of this ticket | AC-PARSE-IMPL-PLAN-1, AC-PARSE-IMPL-PLAN-4 | P0 | ✅ | |
| 6.3 | Derived parse status (`SUCCESS` / `PARTIAL` / `NOT_FOUND` / `PARSE_ERROR`) is consistent with observed file state | AC-PARSE-IMPL-PLAN-5, AC-PARSE-IMPL-PLAN-6 | P0 | ✅ | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Error messages shown to users do not leak raw file contents | AC-PARSE-IMPL-PLAN-5, AC-PARSE-IMPL-PLAN-7 | P1 | ✅ | |
| 7.2 | Error message fallback / localization behavior is defined if a UI is added | AC-PARSE-IMPL-PLAN-7 | P2 | ✅ | Skip if no UI in PoC |
| 7.3 | Machine-readable parse error summary is available for later FE / API use | AC-PARSE-IMPL-PLAN-5, AC-PARSE-IMPL-PLAN-7 | P0 | ✅ | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
