# Black-box Review Checklist

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## How to use

- Each reviewer marks ✅ Pass / ❌ Fail / ⏭ Skip (with justification).
- Any ❌ Fail on a **P0** item blocks release.
- P1/P2 findings must have an Accepted Risk or follow-up ticket before release.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Dashboard displays correctly when no Security metadata exists | AC-SECURITY-DASHBOARD-1 | P0 | ✅ | Empty dashboard |
| 1.2 | All KPI cards display **0** when no Safety Pack / Security Scan / Exception exists | AC-SECURITY-DASHBOARD-2~6 | P0 | ✅ | Boundary verification |
| 1.3 | Dashboard correctly handles repository containing many tickets | AC-SECURITY-DASHBOARD-7 | P1 | ✅ | Ticket table |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Unauthorized users cannot access Security Dashboard | AC-SECURITY-DASHBOARD-10 | P0 | ✅ | HTTP 401 / 403 |
| 2.2 | Authorized Security users can access Dashboard | AC-SECURITY-DASHBOARD-1 | P0 | ✅ | SECURITY role |
| 2.3 | Dashboard contains no Create / Edit / Delete operations | AC-SECURITY-DASHBOARD-10 | P0 | ✅ | Read-only |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Existing Dashboard modules remain unaffected | AC-SECURITY-DASHBOARD-9 | P0 | ✅ | PM / QA / Dev / Data Ops |
| 3.2 | Dashboard API response matches FE contract | AC-SECURITY-DASHBOARD-1 | P0 | ✅ | DTO verification |
| 3.3 | Existing Security metadata reused without duplication | AC-SECURITY-DASHBOARD-9 | P0 | ✅ | Existing V4 tables |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing Safety Pack handled correctly | AC-SECURITY-DASHBOARD-2 | P0 | ✅ | KPI displays 0 |
| 4.2 | Missing Security Checklist handled correctly | AC-SECURITY-DASHBOARD-5 | P0 | ✅ | Default status |
| 4.3 | Empty dashboard displayed without exception | AC-SECURITY-DASHBOARD-1 | P1 | ✅ | Empty state |

---

## Category 5 — Performance / Degradation Signals

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Dashboard loads normally with expected metadata | AC-SECURITY-DASHBOARD-1 | P1 | ✅ | |
| 5.2 | Dashboard remains usable with many tickets | AC-SECURITY-DASHBOARD-7 | P1 | ✅ | |
| 5.3 | Filtering does not freeze UI | AC-SECURITY-DASHBOARD-7 | P1 | ✅ | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Safety Pack KPI matches existing metadata | AC-SECURITY-DASHBOARD-2 | P0 | ✅ | Aggregation |
| 6.2 | Secret Scan / SAST / SCA KPIs match Security Scan metadata | AC-SECURITY-DASHBOARD-3~4 | P0 | ✅ | Aggregation |
| 6.3 | Security Checklist / Exception / Final Verdict follow specification | AC-SECURITY-DASHBOARD-5~6 | P0 | ✅ | Business rules |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Existing localization works correctly | AC-SECURITY-DASHBOARD-1 | P1 | ✅ | Existing i18n |
| 7.2 | Existing error messages reused | AC-SECURITY-DASHBOARD-1 | P1 | ✅ | Existing handler |
| 7.3 | Existing TraceId and logging remain available | AC-SECURITY-DASHBOARD-9 | P0 | ✅ | Logging verification |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead | | | |
| Security Reviewer | | | |
| PM / BA | | | |

> **Release Gate:** Every **P0** checklist item must be marked **PASS** before release.