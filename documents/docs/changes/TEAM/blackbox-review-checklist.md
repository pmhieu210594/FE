# Black-box Review Checklist

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

---

## How to use

- Each reviewer marks pass / fail / skip with justification.
- Any fail P0 item blocks release.
- P1/P2 gaps must have a documented follow-up ticket or risk acceptance note.
- This checklist reviews the black-box test design and test data, not implementation internals.
- AC-TEAM-19 is a scope confirmation that dedicated Team audit-log storage is not required in this phase.

---

## Category 1 — Boundary & Edge Combinations

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 1.1 | Empty/default Team list and empty member list are handled without error. | AC-TEAM-1, AC-TEAM-6 | P1 | OK | Covered by BB-TEAM-001, BB-TEAM-017. |
| 1.2 | Search exact, partial, empty and no-match keywords are covered. | AC-TEAM-2 | P1 | OK | Covered by BB-TEAM-004, BB-TEAM-005, BB-TEAM-006. |
| 1.3 | Team Code empty/whitespace, max and over-max boundaries are covered. | AC-TEAM-3, AC-TEAM-4 | P1 | OK | Covered by BB-TEAM-009, BB-TEAM-011, BB-TEAM-012, BB-TEAM-013. |
| 1.4 | Team Name empty/whitespace, max and over-max boundaries are covered. | AC-TEAM-3, AC-TEAM-7 | P1 | OK | Covered by BB-TEAM-010, BB-TEAM-011, BB-TEAM-012, BB-TEAM-018. |
| 1.5 | Optional description empty/max/over-max behavior is considered. | AC-TEAM-3, AC-TEAM-7 | P2 | OK | Covered by BB-TEAM-008, BB-TEAM-011, BB-TEAM-012. |
| 1.6 | Multiple members and removed/deleted data states are covered. | AC-TEAM-6, AC-TEAM-9, AC-TEAM-16 | P1 | OK | Covered by BB-TEAM-022, BB-TEAM-031, BB-TEAM-032. |
| 1.7 | Double-submit/double-delete user operation is covered. | AC-TEAM-3, AC-TEAM-7, AC-TEAM-8, AC-TEAM-16 | P1 | OK | Covered by BB-TEAM-041, BB-TEAM-042. |

---

## Category 2 — Permission & Access Control

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | ADMIN can access Team list and perform Team Management operations. | AC-TEAM-1, AC-TEAM-3, AC-TEAM-7, AC-TEAM-8, AC-TEAM-10, AC-TEAM-15, AC-TEAM-16 | P0 | OK | Covered by core ADMIN cases BB-TEAM-001, BB-TEAM-007, BB-TEAM-018, BB-TEAM-020, BB-TEAM-023, BB-TEAM-029, BB-TEAM-031. |
| 2.2 | Authenticated non-ADMIN Team screen access is blocked without data exposure. | AC-TEAM-1 | P0 | OK | Covered by BB-TEAM-002. |
| 2.3 | Authenticated non-ADMIN direct Team API calls are rejected. | AC-TEAM-1 | P0 | OK | Covered by BB-TEAM-002 and test-data TD-TEAM-E-012. |
| 2.4 | Unauthenticated Team access is rejected by existing authentication behavior. | AC-TEAM-1 | P0 | OK | Covered by BB-TEAM-003. |
| 2.5 | Reload/back/session-expired behavior does not expose unauthorized Team data. | AC-TEAM-1, AC-TEAM-2 | P2 | OK | Covered by BB-TEAM-040. |

---

## Category 3 — Compatibility & Contract Stability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Team API/UI contract supports list/search/detail/create/update/delete core scenarios. | AC-TEAM-1, AC-TEAM-2, AC-TEAM-3, AC-TEAM-4, AC-TEAM-7, AC-TEAM-8 | P0 | OK | Covered by BB-TEAM-001, BB-TEAM-004, BB-TEAM-005, BB-TEAM-007, BB-TEAM-013, BB-TEAM-016, BB-TEAM-018, BB-TEAM-020. |
| 3.2 | Team member operation contract supports list/add/update-role/remove scenarios. | AC-TEAM-6, AC-TEAM-10, AC-TEAM-11, AC-TEAM-15, AC-TEAM-16 | P0 | OK | Covered by BB-TEAM-017, BB-TEAM-023, BB-TEAM-029, BB-TEAM-031. |
| 3.3 | Duplicate Team Code contract is stable for create and update. | AC-TEAM-5 | P0 | OK | Covered by BB-TEAM-014, BB-TEAM-015. |
| 3.4 | Duplicate active member contract is stable and scoped to same Team only. | AC-TEAM-12, AC-TEAM-13, AC-TEAM-14 | P0 | OK | Covered by BB-TEAM-027, BB-TEAM-028. |
| 3.5 | Existing member master data remains compatible and is not implicitly converted into Team membership. | AC-TEAM-10, AC-TEAM-20 | P0 | OK | Covered by BB-TEAM-038, BB-TEAM-039. |
| 3.6 | Team-to-Project assignment is not introduced in this phase. | AC-TEAM-17 | P1 | OK | Covered by BB-TEAM-033. |

---

## Category 4 — Exception Handling & Resilience

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Required Team Code and Team Name errors do not create invalid records. | AC-TEAM-3 | P1 | OK | Covered by BB-TEAM-009, BB-TEAM-010. |
| 4.2 | Duplicate Team Code create/update is rejected without changing unrelated records. | AC-TEAM-5 | P0 | OK | Covered by BB-TEAM-014, BB-TEAM-015. |
| 4.3 | Non-existing/inactive member add is rejected without creating membership. | AC-TEAM-10 | P1 | OK | Covered by BB-TEAM-024. |
| 4.4 | Missing/invalid role is rejected without creating or changing membership. | AC-TEAM-11, AC-TEAM-15 | P1 | OK | Covered by BB-TEAM-025, BB-TEAM-030. |
| 4.5 | Soft delete and remove-member operations leave consistent inactive state even after retry. | AC-TEAM-8, AC-TEAM-9, AC-TEAM-16 | P0 | OK | Covered by BB-TEAM-020, BB-TEAM-022, BB-TEAM-031, BB-TEAM-042. |
| 4.6 | Error responses do not expose secrets, stack traces or sensitive configuration. | AC-TEAM-19 | P1 | OK | Covered by BB-TEAM-037. |
| 4.7 | Stale/conflict behavior is considered if version is part of public contract. | AC-TEAM-7 | P1 | OK | Covered by BB-TEAM-019. |

---

## Category 5 — Performance / Degradation Signals (Black-box observable)

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 5.1 | List/search remain usable with multiple Team records. | AC-TEAM-1, AC-TEAM-2 | P1 | OK | Covered by BB-TEAM-004, BB-TEAM-005, BB-TEAM-006 and normal data multiple Teams. |
| 5.2 | Team detail remains usable with zero, one and multiple active members. | AC-TEAM-6 | P1 | OK | Covered by BB-TEAM-017, BB-TEAM-023, BB-TEAM-022. |
| 5.3 | Reload/back navigation does not cause visible freeze, reload loop, or unauthorized data exposure. | AC-TEAM-1, AC-TEAM-2 | P2 | OK | Covered by BB-TEAM-040. |
| 5.4 | Destructive operations provide safe user feedback and do not leave broken UI state. | AC-TEAM-8, AC-TEAM-16 | P1 | OK | Covered by BB-TEAM-020, BB-TEAM-031, BB-TEAM-042. |

---

## Category 6 — Business Rule Integrity

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 6.1 | Team creation requires valid Team Code and Team Name. | AC-TEAM-3 | P0 | OK | Covered by BB-TEAM-007, BB-TEAM-009, BB-TEAM-010. |
| 6.2 | Team Code is editable after creation. | AC-TEAM-4 | P0 | OK | Covered by BB-TEAM-013. |
| 6.3 | Active Team Code uniqueness is enforced for create and update. | AC-TEAM-5 | P0 | OK | Covered by BB-TEAM-014, BB-TEAM-015. |
| 6.4 | Team detail shows basic information and member list area. | AC-TEAM-6 | P0 | OK | Covered by BB-TEAM-016, BB-TEAM-017. |
| 6.5 | Team basic information can be updated by ADMIN. | AC-TEAM-7 | P0 | OK | Covered by BB-TEAM-018. |
| 6.6 | Soft delete changes Team state and excludes it from active/default view. | AC-TEAM-8 | P0 | OK | Covered by BB-TEAM-020, BB-TEAM-021. |
| 6.7 | Deleting Team inactivates all active memberships. | AC-TEAM-9 | P0 | OK | Covered by BB-TEAM-022. |
| 6.8 | Existing member can be added with required role. | AC-TEAM-10, AC-TEAM-11 | P0 | OK | Covered by BB-TEAM-023, BB-TEAM-025, BB-TEAM-026. |
| 6.9 | Same member can belong to multiple Teams but not duplicate active membership in same Team. | AC-TEAM-12, AC-TEAM-13, AC-TEAM-14 | P0 | OK | Covered by BB-TEAM-027, BB-TEAM-028. |
| 6.10 | Updating a member role does not create a new active membership. | AC-TEAM-15 | P0 | OK | Covered by BB-TEAM-029. |
| 6.11 | Removing a member inactivates membership and does not delete member master data. | AC-TEAM-16 | P0 | OK | Covered by BB-TEAM-031, BB-TEAM-032. |
| 6.12 | Legacy member team/role data is not migrated into Team memberships. | AC-TEAM-20 | P0 | OK | Covered by BB-TEAM-038, BB-TEAM-039. |

---

## Category 7 — i18n / Messaging / Operational Observability

| # | Check item | AC references | Priority | Status | Notes |
|---|---|---|---|---|---|
| 7.1 | Team screen labels, buttons, placeholders and table headers are localized in en/vi/ja. | AC-TEAM-18 | P1 | OK | Covered by BB-TEAM-034. |
| 7.2 | Team validation messages are localized or mapped in en/vi/ja. | AC-TEAM-18 | P1 | OK | Covered by BB-TEAM-035. |
| 7.3 | Team business errors such as duplicate Team Code and duplicate member are localized or mapped. | AC-TEAM-18 | P1 | OK | Covered by BB-TEAM-035. |
| 7.4 | Dedicated Team audit-log storage is not treated as a release blocker for this phase. | AC-TEAM-19 | P2 | N/A | Covered by BB-TEAM-036. |
| 7.5 | Existing error trace/log behavior remains usable and does not expose secrets. | AC-TEAM-19 | P2 | OK | Covered by BB-TEAM-037. |
| 7.6 | Migration/output-state evidence is captured for no legacy Team membership backfill. | AC-TEAM-20 | P0 | OK | Covered by BB-TEAM-038. |

---

## Sign-off

| Role | Name | Date | Result |
|---|---|---|---|
| QA Lead |  |  |  |
| Developer | nk_trung | 2026-06-15 | Approved |
| PM/BA |  |  |  |

> Release gate rule: all P0 checklist items must be checked.
