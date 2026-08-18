# Role Authorization Map

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Accepted / Role-Based Authorization Matrix

## Scope

This project no longer uses separate action authorization labels for ROLE. This artifact keeps the pack's optional `permission-map.md` filename, but the content is a role-based authorization map.

## Source Facts

| fact | evidence |
|---|---|
| Auth role enum exists | `AppUser.Role { VIEWER, EDITOR, ADMIN }` |
| FE layout has admin-only nav pattern | `Layout.tsx` filters nav items by `user.role === "ADMIN"` |
| BE existing admin mutation has inline ADMIN check | `AdminController.runConnector()` |
| ROLE-specific authorization code does not exist | No `RoleController`/`RoleService` found |
| V4 auth tables exist | `tbl_auth_permission`, `tbl_auth_role_permission`, etc. in V4 migration |
| Spec says no separate action authorization labels | `spec-pack.md` / ticket-rules |

## Required Role Matrix

| action | VIEWER | EDITOR | ADMIN | status |
|---|---|---|---|---|
| View role list/detail | yes | yes | yes | Accepted |
| Create role | no | yes | yes | Accepted |
| Update role | no | yes | yes | Accepted |
| Delete role | no | no | yes | Accepted |

## Superseded Candidate Based on Existing Admin Pattern

| action | candidate allowed role | evidence | confidence |
|---|---|---|---|
| View role list/detail | ADMIN only | Existing admin nav hidden for non-ADMIN | Medium |
| Create role | ADMIN only | Existing admin mutation requires ADMIN | Medium |
| Update role | ADMIN only | Admin-management feature category | Low/Medium |
| Delete role | ADMIN only | Destructive admin-management feature | Medium |

This candidate is superseded by the accepted matrix above.

## FE/BE Enforcement Requirements

- FE may hide route/nav/buttons based on role, but this is not security.
- BE must enforce the role matrix for every ROLE API/action.
- Direct API calls by disallowed roles must be rejected.

## Open Questions

- None for Phase 3 entry.

## Human Decisions Required

- None. Matrix is accepted for view/create/update/delete.
