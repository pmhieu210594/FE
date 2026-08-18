# Black-box Review Checklist

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

---

## How to use

- Each reviewer marks OK / FAIL / SKIP with justification.
- Any FAIL P0 item blocks the release of the test-design artifact.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Default list excludes soft-deleted Customers and Customers under inactive/deleted Organizations. | AC-CUSTOMER-2, AC-CUSTOMER-3, AC-CUSTOMER-4 | P0 | OK | Covered by BB-003. |
| 1.2 | Required field, minimum, maximum, and over-maximum boundaries are covered for code and alias. | AC-CUSTOMER-8, AC-CUSTOMER-15, AC-CUSTOMER-18 | P0 | OK | Covered by BB-007 and test data. |
| 1.3 | Character-type and numeric boundary inputs are included where they can affect validation. | AC-CUSTOMER-8, AC-CUSTOMER-18 | P1 | OK | Covered by BB-007 and `test-data.md`. |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | ADMIN can access Customer screen and perform permitted operations. | AC-CUSTOMER-1 | P0 | OK | Covered by BB-001. |
| 2.2 | Non-ADMIN screen access logs out or redirects to login. | AC-CUSTOMER-14 | P0 | OK | Covered by BB-002. |
| 2.3 | Direct BE access by non-ADMIN returns 403 and does not expose data/write. | AC-CUSTOMER-14 | P0 | OK | Covered by BB-002. |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | List/detail/create/update/delete are covered at the black-box level. | AC-CUSTOMER-2, AC-CUSTOMER-8, AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-13 | P0 | OK | Covered by BB-003, BB-005, BB-009, BB-010, BB-011. |
| 3.2 | Success responses and localized messages are visible to the user. | AC-CUSTOMER-18 | P0 | OK | Covered by BB-005 and BB-012. |
| 3.3 | Validation/business error responses remain readable and consistent. | AC-CUSTOMER-9, AC-CUSTOMER-15, AC-CUSTOMER-16, AC-CUSTOMER-18 | P0 | OK | Covered by BB-006, BB-007, BB-008, BB-010. |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Duplicate active code/alias is rejected without creating or updating data. | AC-CUSTOMER-15 | P0 | OK | Covered by BB-008. |
| 4.2 | Reuse from soft-deleted records is allowed when active duplicates do not exist. | AC-CUSTOMER-15 | P0 | OK | Covered by BB-008. |
| 4.3 | Deleted Customer edit and stale version conflict are rejected. | AC-CUSTOMER-11, AC-CUSTOMER-16 | P0 | OK | Covered by BB-010. |
| 4.4 | Empty-state or no-match search is handled clearly. | AC-CUSTOMER-2, AC-CUSTOMER-5 | P1 | OK | Covered by BB-004. |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Search/filter remains usable with multiple Organizations and Customers. | AC-CUSTOMER-2, AC-CUSTOMER-5 | P1 | OK | Covered by BB-004. |
| 5.2 | Soft delete and detail/edit flows remain usable with a child tree present. | AC-CUSTOMER-13, AC-CUSTOMER-17 | P1 | OK | Covered by BB-011. |
| 5.3 | No visible reload loop or blocking freeze is introduced by the Customer page. | AC-CUSTOMER-1, AC-CUSTOMER-2 | P2 | OK | Observed during E2E journey. |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Default list excludes deleted Customers. | AC-CUSTOMER-3, AC-CUSTOMER-4 | P0 | OK | Covered by BB-003. |
| 6.2 | Customer must belong to an active Organization at create/edit time. | AC-CUSTOMER-7, AC-CUSTOMER-9, AC-CUSTOMER-12 | P0 | OK | Covered by BB-005 and BB-006. |
| 6.3 | Soft delete cascades to the full child tree and preserves version behavior. | AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-17 | P0 | OK | Covered by BB-011. |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Success and error messages are localized in the current UI locale. | AC-CUSTOMER-18 | P1 | OK | Covered by BB-005, BB-007, BB-012. |
| 7.2 | Error message contract stays machine-readable for FE handling. | AC-CUSTOMER-18 | P0 | OK | Covered by BB-012. |
| 7.3 | TraceId or error context is available for operational troubleshooting. | AC-CUSTOMER-18 | P1 | OK | Covered by BB-012. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-12 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
