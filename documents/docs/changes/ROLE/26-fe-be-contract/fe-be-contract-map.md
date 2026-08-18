# FE/BE Contract Map

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft / Contract Candidate

## Contract Summary

No ROLE implementation exists yet on either FE or BE. This map records the contract candidate derived from `spec-pack.md`, existing standards, and source patterns. Phase 3 must not implement until the open decisions below are closed.

## Endpoint Map

| operation | method/path | FE caller | BE handler | request | response | status |
|---|---|---|---|---|---|---|
| List roles | `GET /api/v1/roles` | New helper in `EDCAP_FE/src/lib/api.ts` | New `RoleController` | Search/sort only; no pagination-only params | Raw `RoleDto[]` | Accepted |
| Get role | `GET /api/v1/roles/{role_id}` | New helper | New `RoleController` | Path UUID | Role detail | Candidate |
| Create role | `POST /api/v1/roles` | New helper | New `RoleController` | `roleName`, `description` | Created role | Candidate |
| Update role | `PUT /api/v1/roles/{role_id}` | New helper | New `RoleController` | `roleName`, `description` | Updated role | Candidate |
| Delete role | `PUT /api/v1/roles/{role_id}/delete` | New helper using `api.put` | New `RoleController` | Path UUID | Updated `RoleDto` for the logically deleted row | Accepted: logical delete |

## DTO Candidate

### Role Response

| API field | FE type candidate | BE type candidate | DB/source | status |
|---|---|---|---|---|
| `roleId` | `string` | `UUID` / string serialization | `tbl_dim_role.role_id UUID` | Candidate |
| `roleName` | `string` | `String` | `tbl_dim_role.role_name VARCHAR(100)` | Candidate |
| `description` | `string` | `String`; trim and preserve empty string | `tbl_dim_role.description TEXT` | Accepted |
| `createdAt` | `string` | TIMESTAMPTZ-derived serialized value | `created_at TIMESTAMPTZ` | Accepted |
| `updatedAt` | `string` | TIMESTAMPTZ-derived serialized value | `updated_at TIMESTAMPTZ` | Accepted |

### Create / Update Request

| field | FE input | BE validation | status |
|---|---|---|---|
| `roleName` | string | trim, required, max 100 if DB constraint remains, case-insensitive duplicate | Candidate |
| `description` | string | trim; empty string allowed and preserved | Accepted |

## Pagination / Search / Sort

| item | candidate | evidence | issue |
|---|---|---|---|
| Pagination params | none for BE pagination | Human Decision | FE paginates client-side |
| List response | Raw `RoleDto[]` | Human Decision | No `totalCount`, `totalPages`, `page`, or `size` |
| Search | minimum `role_name` | `spec-pack.md` | Query parameter name pending |
| Sort | minimum `role_name` | `spec-pack.md` | Sort parameter names and whitelist pending |

## Error Contract Candidate

| case | expected status | expected body | evidence/status |
|---|---|---|---|
| Unauthenticated | 401 | Existing auth behavior / `ApiError` | Source-confirmed pattern |
| Role not allowed | 403 | `ErrorResponse` | Accepted |
| Validation error | 400 | `ErrorResponse` | GlobalExceptionHandler pattern |
| Duplicate role name | 400 | `ErrorResponse` | Accepted |
| Not found | 404 | `ErrorResponse` | Source-confirmed pattern |
| Delete target not found / unavailable | 404 or project convention | `ErrorResponse` | Candidate |

Actual `ErrorResponse` source fields are:

```text
timestamp, status, error, message, traceId
```

## Authorization Contract Candidate

ROLE uses role-based RBAC. Separate action authorization labels are not used.

| action | candidate allowed role(s) | source evidence | status |
|---|---|---|---|
| View list/detail | `ADMIN`, `EDITOR`, `VIEWER` | Human Decision | Accepted |
| Create | `ADMIN`, `EDITOR` | Human Decision | Accepted |
| Update | `ADMIN`, `EDITOR` | Human Decision | Accepted |
| Delete | `ADMIN` | Human Decision | Accepted |

## FE State / Cache Contract

| item | candidate | evidence |
|---|---|---|
| Data fetching | TanStack Query | Existing AdminPage and frontend standards |
| Cache key | `["roles", params]` candidate | Assumption; no existing ROLE source |
| Mutation invalidation | Invalidate role list/detail after create/update/delete | Existing AdminPage mutation invalidation pattern |
| Error display | `ApiError.message` | `src/lib/api.ts` |
| Auth/session | session cookie, `credentials: "include"` | `src/lib/api.ts`, security source |

## No-Impact With Evidence

| area | no-impact judgment | evidence |
|---|---|---|
| GraphQL/gRPC | No impact | No schema/source found |
| Batch/job | No impact | No ROLE job or scheduler identified |
| New seed data | No impact | Spec says no new seed |
| Permission-name fields | No impact | Spec says no separate action authorization labels |

## Open Questions

- Exact query parameter names for search/sort, if BE supports them.
- FE default page size/page origin.

## Human Decisions Required

None for Phase 3 entry. Remaining items are implementation details recorded in Core artifacts.
