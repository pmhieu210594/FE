# Black-box Review Checklist

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung  
**Update date**: 2026-06-30  

---

## How to use

- Each reviewer marks ✅ pass / ❌ fail / ⏭ skip (with justification).
- Any ❌ fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Earliest CI run remains stable when there are multiple runs for the same PR | AC-FCI-1 | P0 | PASS | |
| 1.2 | Equal timestamps still produce a deterministic first-run result | AC-FCI-1 | P0 | PASS | |
| 1.3 | Zero CI runs return unavailable / warning instead of fabricated KPI | AC-FCI-1 | P0 | PASS | |
| 1.4 | Exception artifact with multiple rows preserves all explicit rows | AC-FCI-4, AC-FCI-5 | P0 | PASS | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Read-only KPI access does not require FE and does not expose write actions | AC-FCI-11 | P1 | PASS | |
| 2.2 | Unauthorized scope cannot see or mutate KPI write-side state | AC-FCI-11 | P1 | PASS | |
| 2.3 | Role resolution uses master data rather than free-text person identity | AC-FCI-8 | P1 | PASS | |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Existing CI fact tables remain the source of truth for first-run selection | AC-FCI-1, AC-FCI-2, AC-FCI-3 | P0 | PASS | |
| 3.2 | Explicit exception rows stay compatible with existing schema and provenance fields | AC-FCI-5 | P0 | PASS | |
| 3.3 | KPI read output remains stable for empty and non-empty scopes | AC-FCI-7 | P0 | PASS | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing exception section generates a warning and no synthetic row | AC-FCI-6 | P0 | PASS | |
| 4.2 | Malformed exception row is not silently converted into a valid exception | AC-FCI-4, AC-FCI-10 | P0 | PASS | |
| 4.3 | Unresolved approval role stores null reference plus warning | AC-FCI-8 | P1 | PASS | |
| 4.4 | Duplicate rerun keeps the same row count and no duplicate facts | AC-FCI-9 | P0 | PASS | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Multiple CI runs for one PR still return a readable KPI response | AC-FCI-1, AC-FCI-7 | P1 | PASS | |
| 5.2 | Multiple exception rows in one artifact remain readable and countable | AC-FCI-4, AC-FCI-5, AC-FCI-7 | P1 | PASS | |
| 5.3 | Re-run does not create visible duplicate output or state churn | AC-FCI-9 | P1 | PASS | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | First CI Pass is derived from the earliest CI run only | AC-FCI-1, AC-FCI-2, AC-FCI-3 | P0 | PASS | |
| 6.2 | Generic risk text does not count as an exception record | AC-FCI-4, AC-FCI-6, AC-FCI-7 | P0 | PASS | |
| 6.3 | Exception KPI counts explicit records only and respects zero state | AC-FCI-7 | P0 | PASS | |
| 6.4 | Approval role is linked when resolvable and does not block the row when unresolved | AC-FCI-8 | P1 | PASS | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Warning / data-quality output is visible to operators or read-model consumers | AC-FCI-10 | P0 | PASS | |
| 7.2 | Observability includes enough context to trace parse source and rerun behavior | AC-FCI-9, AC-FCI-10 | P1 | PASS | |
| 7.3 | Scope note clearly states BE-only and no FE screen in this phase | AC-FCI-11 | P1 | PASS | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-30 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.