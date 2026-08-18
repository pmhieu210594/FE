# Black-box Review Checklist

**Ticket ID**: <TICKET>
**Create date**: <Create_date>  
**Author**:  <Author>
**Update date**: <Update_date>  

---

## How to use

- Each reviewer marks PASS / FAIL / SKIP (with justification).
- Any FAIL P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | {{default-state-or-threshold-boundary}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 1.2 | {{reset-behavior-or-state-combination}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 1.3 | {{exact-threshold-equality-boundary}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | {{forbidden-access-behavior}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 2.2 | {{unauthenticated-access-behavior}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 2.3 | {{role-based-ui-or-api-guard}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | {{legacy-contract-remains-compatible}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 3.2 | {{success-envelope-or-payload-shape-stable}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 3.3 | {{validation-error-contract-stable}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | {{partial-failure-isolated-correctly}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 4.2 | {{retry-or-recovery-path-works}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 4.3 | {{empty-state-or-no-data-handled-clearly}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | {{parallel-load-or-lazy-load-observable}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |
| 5.2 | {{large-data-remains-usable}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |
| 5.3 | {{no-visible-freeze-or-reload-loop}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | {{core-counting-or-calculation-rule}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 6.2 | {{filtering-or-exclusion-rule}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |
| 6.3 | {{derived-status-or-state-rule}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | {{success-message-not-leaked-to-user}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |
| 7.2 | {{error-message-localized-or-fallback-defined}} | AC-{{TICKET-ID}}-... | P1 | [ ] | |
| 7.3 | {{machine-readable-error-for-fe}} | AC-{{TICKET-ID}}-... | P0 | [ ] | |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
