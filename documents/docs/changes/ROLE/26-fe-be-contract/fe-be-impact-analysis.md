# FE/BE Impact Analysis

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft

## FE Impact

| area | impact | evidence | risk |
|---|---|---|---|
| Routing | Add `/roles` using `App.tsx` under `main.tsx` `HashRouter` | Source review supersedes earlier `router.tsx` decision | Low: verify route with smoke/component test |
| Navigation | Add Role Management nav item gated by role | Existing `Layout.tsx` adminOnly pattern | Medium |
| API client | Add role endpoint helpers in `src/lib/api.ts` | Current endpoint helper pattern | Medium |
| Types | Add `RoleDto` typing for role master data | Human Decision; existing auth `Role` enum | Low if naming is followed |
| Page state | Loading/error/empty/list/dialog states | Frontend standards/AdminPage pattern | Medium |
| Cache | TanStack Query list/detail/mutations | Existing AdminPage pattern | Medium |
| Validation | FE trim/nonblank/max/duplicate message support | Spec requires parity | Major |
| Timestamp | Display `createdAt`/`updatedAt` as `DD/MM/YYYY HH:mm:ss` | Spec decision; DB `TIMESTAMPTZ` | Medium |
| i18n | Add `Pages.RoleManagement.*` keys in en/vi/ja | i18n source pattern | Medium |
| UI components | Table/search/pagination/form/dialog | Component candidates found; dialog wrapper not found | Medium |
| Tests | Add FE component/API/i18n/timestamp tests | No FE unit tests currently | Major |

## BE Impact

| area | impact | evidence | risk |
|---|---|---|---|
| Controller | New `RoleController` candidate | No current ROLE controller | Major |
| DTO | New Role DTO/request records | Existing `Dtos.java` pattern | Medium |
| Service | New role use case | No current ROLE service | Major |
| Persistence | New mapper/adapter/port for V4 `tbl_dim_role` | Repository DB map says no V4 mappers/adapters | Major |
| DB/FK | Delete is logical delete and must preserve many FK references | V4 migration references `tbl_dim_role`; columns decided as `delete_flag`, `updated_at`, `updated_by` | Medium |
| Validation | Trim/nonblank/max/case-insensitive duplicate | Spec | Major |
| Authorization | Role-based enforcement per accepted matrix | Spec; current source has `AppUser.Role` | Medium |
| Error handling | Use `ErrorResponse`; duplicate HTTP 400 | `GlobalExceptionHandler` source, Human Decision | Medium; existing admin guard inconsistent but not followed |
| Timestamp | Return `createdAt`, `updatedAt` from DB `TIMESTAMPTZ` | Spec | Medium |
| Tests | Add service/web/security/mapper tests | Existing test gaps | Major |

## DB Impact

| item | impact | evidence |
|---|---|---|
| Existing table | `tbl_dim_role` exists | V4 migration |
| Existing columns | `role_id`, `role_name`, `description`, audit columns | V4 migration |
| Existing seed | `PM`, `DEV`, `QA`, `ADMIN` | V4 migration |
| FK references | Multiple references to `tbl_dim_role.role_id` | V4 migration search |
| Logical delete columns | `delete_flag`, `updated_at`, `updated_by` | Human Decision |
| Case-insensitive uniqueness | Needs strategy | Existing `UNIQUE(role_name)` is case-sensitive in many DB collations unless indexed/normalized |

## State / Cache Impact

| event | FE cache behavior candidate | status |
|---|---|---|
| Create role | invalidate role list | Candidate |
| Update role | invalidate role list and role detail | Candidate |
| Delete role | call `PUT /api/v1/roles/{role_id}/delete`, then invalidate role list and remove/refresh detail after HTTP 200 logical delete | Accepted behavior; endpoint candidate |
| Search/sort/pagination change | FE applies client-side pagination over raw list | Accepted |

## Compatibility Impact

| compatibility point | risk | required action |
|---|---|---|
| Raw list response vs UI total count | FE computes total from `rawList.length` | Accepted |
| Auth `Role` type vs Role master DTO | Naming collision avoided | Use `RoleDto` |
| ErrorResponse standard vs AdminController Map error | Existing inconsistency | ROLE uses `ErrorResponse` only |
| `role_id` snake path vs `roleId` camel API field | Mapping needed | Contract docs/tests |
| Timestamp OffsetDateTime vs FE local display | Serialization/parse needed | Contract tests |
| Delete success | HTTP 200 logical delete | Contract tests |
| Restore endpoint | No impact | Out of scope |

## No-Impact With Evidence

| area | judgment | evidence |
|---|---|---|
| New permission-name fields | No impact | Spec excludes separate action authorization labels |
| New seed roles | No impact | Spec excludes new seed |
| GraphQL/gRPC | No impact | No source/schema found |
| Production logs/secrets | No impact | Not read, not needed |

## Core Artifact Update Candidates

| core artifact | section | update candidate |
|---|---|---|
| `impact-analysis.md` | FE/BE/API/DB/RBAC/Test | Add Pack 26 finalized impacts and risks |
| `impl-plan.md` | Step Implementation / Stop Conditions | Add contract decisions after human approval |
| `review-checklist.md` | FE/BE/API/DB/Security/Test | Add contract review checklist items |
| `test-plan.md` | Contract tests | Add concrete contract test cases after decisions |
| `open-issues.md` | Pack 26 issues | Update decisions/open items from this pack |
