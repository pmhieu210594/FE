# Open Issues

**Ticket ID**: ROLE  
**Phase**: Phase 1 - Human Decisions Applied  
**Create date**: 2026-06-10  
**Author**: Codex  
**Update date**: 2026-06-12  
**Status**: Phase 3 Decision Sync / Phase 3 Planning Allowed

## Summary

Human Decisions dated 2026-06-11 resolved the Phase 1 product/spec blockers.
The remaining issues are Phase 3 implementation details, source verification items, or review/test items.

Implementation must still follow `impl-plan.md`, source verification, and tests.
Pack 26 blocker-level Human Decisions for ROLE have been accepted or moved to Phase 3 implementation details.

## Resolved Issues

| ID | resolved issue | decision | status |
|---|---|---|---|
| RI-ROLE-001 | Table naming conflict: `dim_role` vs `tbl_dim_role` | Use `tbl_dim_role`; `dim_role` is superseded draft wording | Resolved |
| RI-ROLE-002 | RBAC model undecided | Use role-based RBAC | Resolved |
| RI-ROLE-003 | Action authorization label names undecided | Do not define separate action authorization labels in the ROLE specification | Resolved |
| RI-ROLE-004 | Hard delete vs soft/logical delete undecided | Use logical delete per `HD-ROLE-DELETE-001`; restore is out of scope per `HD-ROLE-P26-002`; previous hard-delete decision is superseded | Resolved |
| RI-ROLE-005 | Seed role policy undecided | No new seed in ROLE scope; display existing DB data only | Resolved |
| RI-ROLE-006 | `description` scope undecided | Include `description` in ROLE specification | Resolved |
| RI-ROLE-007 | Case sensitivity undecided | Duplicate check is trim + case-insensitive among active rows only; `PM` and `pm` are duplicates when the compared existing row is active | Resolved |
| RI-ROLE-008 | Pagination/search/sort undecided | Role list requires pagination, search, and sort | Resolved |
| RI-ROLE-009 | Create dialog missing/incomplete in wireframe | Wireframe now includes create dialog with `role_name` and description fields | Resolved |
| RI-ROLE-010 | Role Management route/menu placement | FE route is `/roles` | Resolved |
| RI-ROLE-011 | Timestamp display fields/date format | API fields are `createdAt`, `updatedAt`; FE displays `DD/MM/YYYY HH:mm:ss` in user local timezone; `updatedAt` always exists | Resolved |
| RI-ROLE-013 | Wireframe label/copy handling | Wireframe label/copy inventory is mapped to proposed `Pages.RoleManagement.*` i18n keys | Resolved |
| RI-ROLE-014 | Hard delete FK behavior blocker | Logical delete preserves FK references; physical hard delete and cascade delete are out of scope | Resolved |
| RI-ROLE-015 | Delete success response shape | Delete success returns HTTP 200 | Resolved |
| RI-ROLE-016 | Restore scope | Restore deleted Role is removed from this ticket scope | Resolved / supersedes prior restore-in-scope wording |
| RI-ROLE-017 | Role authorization matrix | `ADMIN`: view/create/update/delete; `EDITOR`: view/create/update; `VIEWER`: view only | Resolved |
| RI-ROLE-018 | Logical delete column names | Use `delete_flag`, `updated_at`, `updated_by` | Resolved |
| RI-ROLE-019 | Pagination/list response | BE raw list; FE pagination; no `totalCount` | Resolved |
| RI-ROLE-020 | ROLE error policy | Standard `ErrorResponse`; duplicate role name is HTTP 400 | Resolved |
| RI-ROLE-021 | Timestamp behavior | BE returns `createdAt`/`updatedAt` from DB `TIMESTAMPTZ`; FE displays `DD/MM/YYYY HH:mm:ss`; values always exist | Resolved |
| RI-ROLE-022 | Description behavior | Trim `description`; empty string after trim is stored as empty string | Resolved |
| RI-ROLE-023 | FE route source | Use current runtime routing: `main.tsx` mounts `HashRouter`; `App.tsx` defines `<Routes>`; earlier `router.tsx` decision is superseded | Resolved |
| RI-ROLE-024 | FE DTO naming | Use `RoleDto` | Resolved |
| RI-ROLE-025 | Delete endpoint method | Logical delete uses `PUT /api/v1/roles/{role_id}/delete`, not HTTP `DELETE` | Resolved |

## Remaining Open Issues For Pack 26 A-6

| ID | issue | category | severity | owner | required analysis |
|---|---|---|---|---|---|
| OI-ROLE-P26-006 | Search/sort fields beyond minimum | Contract Analysis | Medium | PO / PM / Tech Lead | Minimum is `role_name`; confirm `description`, `role_id`, `createdAt`, `updatedAt` if needed |
| OI-ROLE-P3-010 | FE client-side pagination details | Implementation Detail | Medium | FE owner | Confirm default page size and page origin in Phase 3 implementation |
| OI-ROLE-P3-011 | DB default behavior for omitted `description` | Implementation Detail | Low | BE owner / DB owner | Empty string behavior is accepted; implementation still needs insert/update handling when field is omitted |

## Remaining Open Issues For Phase 3

| ID | issue | category | severity | owner | required action |
|---|---|---|---|---|---|
| OI-ROLE-P3-001 | Implement logical delete safely | Implementation prerequisite | Major | BE owner / DB owner | Use `delete_flag`, `updated_at`, `updated_by`; restore is out of scope |
| OI-ROLE-P3-002 | Implement case-insensitive uniqueness | Implementation prerequisite | Major | BE owner / DB owner | Choose validation/index/query strategy without breaking existing `role_name` UNIQUE constraint |
| OI-ROLE-P3-003 | Implement role-based enforcement | Implementation prerequisite | Major | BE owner / Security Reviewer | BE must enforce role-based authorization per action |
| OI-ROLE-P3-004 | Implement FE role-based display control | Implementation prerequisite | Medium | FE owner | FE must use role-based authorization for screen/button visibility |
| OI-ROLE-P3-007 | Final localized wording review | UI/i18n implementation review | Low | PO / PM / FE owner | Wireframe labels are source input and i18n keys are proposed; final wording may need FE/PO review during implementation |
| OI-ROLE-P3-008 | Wireframe field names differ from canonical names | UI/spec mapping | Low | FE owner / Tech Lead | Map `descript`, `create_day`, `update_day` to canonical `description`, `createdAt`, `updatedAt` or keep draft labels display-only |
| OI-ROLE-P3-009 | Implement proposed ROLE i18n keys | UI/i18n implementation | Low | FE owner | Add ROLE keys following existing locale namespace convention during implementation |

## Human Decisions Recorded

| ID | decision | status |
|---|---|---|
| HD-ROLE-001 | Use `tbl_dim_role` as official table name | Closed |
| HD-ROLE-002 | Use role-based RBAC | Closed |
| HD-ROLE-003 | Do not define separate action authorization labels in the ROLE specification | Closed |
| HD-ROLE-004 | Previous hard-delete decision is superseded by `HD-ROLE-DELETE-001` | Superseded |
| HD-ROLE-005 | Do not seed new roles in this ticket | Closed |
| HD-ROLE-006 | Follow existing project error convention | Closed |
| HD-ROLE-007 | Include `description` in role specification | Closed |
| HD-ROLE-008 | Treat trimmed case variants as duplicates among active rows only | Closed |
| HD-ROLE-009 | Require pagination, search, and sort on role list | Closed |
| HD-ROLE-010 | Role Management route/menu placement: `/roles` | Closed |
| HD-ROLE-011 | Timestamp display: `createdAt`, `updatedAt`, `DD/MM/YYYY HH:mm:ss`, user local timezone, `updatedAt` always exists | Closed |
| HD-ROLE-012 | Create dialog fields from wireframe (`role_name`, description) | Closed |
| HD-ROLE-013 | Wireframe labels/copy and proposed i18n mapping | Closed for Phase 1 |
| HD-ROLE-DELETE-001 | Delete uses logical delete; list/search/query and duplicate-check candidate sets exclude `delete_flag = 1`; physical hard delete and cascade delete are out of scope; restore portion superseded by later decision | Accepted / partially superseded |
| HD-ROLE-P26-001 | Role matrix: `ADMIN` view/create/update/delete; `EDITOR` view/create/update; `VIEWER` view only | Accepted |
| HD-ROLE-P26-002 | Restore is removed from this ticket scope | Accepted |
| HD-ROLE-P26-003 | Logical delete columns are `delete_flag`, `updated_at`, `updated_by` | Accepted |
| HD-ROLE-P26-004 | BE returns raw list; FE handles pagination; no `totalCount` | Accepted |
| HD-ROLE-P26-005 | ROLE APIs use standard `ErrorResponse`; duplicate is HTTP 400 | Accepted |
| HD-ROLE-P26-006 | BE returns `createdAt`/`updatedAt` from DB `TIMESTAMPTZ`; FE displays `DD/MM/YYYY HH:mm:ss`; values always exist | Accepted |
| HD-ROLE-P26-007 | `description` is trimmed; empty string after trim is stored as empty string | Accepted |
| HD-ROLE-P26-008 | FE route source is `router.tsx` | Superseded by `HD-ROLE-P3-002` |
| HD-ROLE-P26-009 | FE DTO/list/detail name is `RoleDto` | Accepted |
| HD-ROLE-P26-010 | Missing V4 mapper/adapter/entity is Phase 3 implementation planning, not business decision | Accepted |
| HD-ROLE-P3-001 | Logical delete endpoint method is `PUT /api/v1/roles/{role_id}/delete` | Accepted |
| HD-ROLE-P3-002 | FE route implementation source is `App.tsx` under `main.tsx` `HashRouter`; route placement remains `/roles` | Accepted |

## Phase Movement Judgment

| gate | status | reason |
|---|---|---|
| Phase 1 Gate | PASS | Human Decisions closed Phase 1 spec blockers |
| Proceed to Pack 26 A-6 | No | Pack 26 blockers listed for this decision sync are resolved or moved to Phase 3 implementation details |
| Proceed directly to Phase 3 | Yes | No remaining Blocker-level Human Decision is recorded after accepted decisions; Phase 3 must still handle implementation details and tests |
