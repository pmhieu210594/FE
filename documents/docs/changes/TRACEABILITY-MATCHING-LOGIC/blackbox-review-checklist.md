# Black-box Review Checklist

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

---

## How to use

- Each reviewer marks `[]` pass / fail / skip with a short note.
- Any failed P0 item blocks release for this ticket slice.
- P1/P2 gaps must be justified by follow-up work or accepted risk.
- This checklist is prefilled as a review suggestion based on the current black-box coverage set. Re-check the boxes during manual QA if the execution result differs.

---

## Category 1 - Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Completeness reaches 100 percent only when the full required evidence set is present | AC-TRACEABILITY-MATCHING-LOGIC-5 | P0 | [x] | Covered by BB-005. |
| 1.2 | Completeness drops when one required link is removed | AC-TRACEABILITY-MATCHING-LOGIC-5 | P0 | [x] | Covered by BB-006. |
| 1.3 | Two events with the same timestamp still render in a stable order | AC-TRACEABILITY-MATCHING-LOGIC-7 | P1 | [x] | Covered by BB-009. |

---

## Category 2 - Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Viewer role sees a read-only screen with no edit, delete, or repair actions | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | [x] | Covered by BB-012. |
| 2.2 | Anonymous or expired-session access is rejected or redirected cleanly | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | [x] | Covered by BB-015. |
| 2.3 | Higher-privilege users still do not receive write actions in this feature | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | [x] | Covered by BB-012 with `admin-reader`. |

---

## Category 3 - Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Response shape stays stable for the traceability summary and timeline | AC-TRACEABILITY-MATCHING-LOGIC-1, AC-TRACEABILITY-MATCHING-LOGIC-7 | P0 | [x] | Covered by BB-001 and BB-009. |
| 3.2 | Approved confidence values only are shown in the UI | AC-TRACEABILITY-MATCHING-LOGIC-9 | P1 | [x] | Covered by BB-011. |
| 3.3 | Approved existing `tbl_` fixtures are sufficient to render the screen | AC-TRACEABILITY-MATCHING-LOGIC-8 | P1 | [x] | Covered by BB-010. |

---

## Category 4 - Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Missing PR remains visible as a broken link or warning | AC-TRACEABILITY-MATCHING-LOGIC-6 | P0 | [x] | Covered by BB-007. |
| 4.2 | Missing CI or report remains visible and does not crash the view | AC-TRACEABILITY-MATCHING-LOGIC-6 | P0 | [x] | Covered by BB-008. |
| 4.3 | Empty or malformed ticket input produces a clean validation or not-found result | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | [x] | Covered by BB-013. |

---

## Category 5 - Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | Traceability screen loads within the expected practical threshold on the seeded dataset | AC-TRACEABILITY-MATCHING-LOGIC-1, AC-TRACEABILITY-MATCHING-LOGIC-7 | P1 | [x] | Seeded black-box flow is covered; verify execution timing during QA. |
| 5.2 | Partial data still renders without visible freeze or reload loop | AC-TRACEABILITY-MATCHING-LOGIC-6 | P1 | [x] | Covered by BB-006 and BB-008. |
| 5.3 | Timeline and summary remain usable on reload | AC-TRACEABILITY-MATCHING-LOGIC-7 | P2 | [x] | Covered by BB-009 as state visibility remains stable. |

---

## Category 6 - Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Commit evidence is displayed but excluded from completeness counting | AC-TRACEABILITY-MATCHING-LOGIC-3 | P0 | [x] | Covered by BB-003. |
| 6.2 | Ticket-to-artifact and ticket-to-PR links are both present in the normal fixture | AC-TRACEABILITY-MATCHING-LOGIC-1, AC-TRACEABILITY-MATCHING-LOGIC-2 | P0 | [x] | Covered by BB-001 and BB-002. |
| 6.3 | One ticket maps to one PR in the normal path | AC-TRACEABILITY-MATCHING-LOGIC-2 | P0 | [x] | Covered by BB-002. |

---

## Category 7 - i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Error and warning states use clear, stable messaging without exposing stack traces | AC-TRACEABILITY-MATCHING-LOGIC-6, AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | [x] | Covered by BB-007, BB-008, and BB-013. |
| 7.2 | Trace request logs include traceId and ticketId only | AC-TRACEABILITY-MATCHING-LOGIC-10 | P1 | [x] | Covered by BB-014. |
| 7.3 | Logs do not leak raw payloads, secrets, source code, or PII | AC-TRACEABILITY-MATCHING-LOGIC-10 | P1 | [x] | Covered by BB-014. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer |  |  |  |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
