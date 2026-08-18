# API Compatibility Matrix

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft

## Compatibility Summary

ROLE introduces a new API surface. Backward compatibility risk is mostly additive, but implementation can still break FE if DTO/error/pagination contracts drift.

## Matrix

| area | current state | ROLE candidate | compatibility risk | required action |
|---|---|---|---|---|
| API prefix | `/api/v1` | `/api/v1/roles` | Low | Follow API standard |
| Success response | Raw DTO/List | Raw `RoleDto[]` for list | Low | Test raw list and FE pagination |
| Error response | `ErrorResponse`, with admin Map inconsistency | ROLE APIs use `ErrorResponse` | Low | Test and do not copy Map pattern |
| Auth | Session cookie | Same | Low | Use `credentials: "include"` |
| Authorization | `AppUser.Role` enum | Role matrix | Major | Human decision |
| ID type | mixed Long existing, UUID V4 role | `roleId` string UUID | Medium | Contract tests |
| Timestamp | BE `OffsetDateTime` existing DTOs | `createdAt`, `updatedAt` | Medium | Serialization/display tests |
| Pagination | `limit`/`offset` standard | BE raw list; FE client-side pagination | Low | No `totalCount` fields |
| FE router | `main.tsx` mounts `HashRouter`; `App.tsx` defines active routes; `router.tsx` is not observed as mounted | Use `App.tsx` for `/roles` unless routing is migrated | Low | Route smoke/component test |
| i18n | `Pages.*` keys | `Pages.RoleManagement.*` | Low | Add keys in all locales |
| Existing role type | FE `Role = VIEWER|EDITOR|ADMIN` | Use `RoleDto` for role master data typing | Low | Avoid naming collision |
| Delete endpoint method | Previous candidate used HTTP DELETE | `PUT /api/v1/roles/{role_id}/delete` | Low | Contract tests |
| Delete success | TBD before decision | HTTP 200 logical delete | Low | Contract tests |
| Restore API | Not existing | Out of scope | None | Do not implement |

## No Backward-Compatible Breaking Changes Expected

- No existing endpoint needs to be changed for ROLE.
- No existing DTO needs to be removed.
- No seed role data is added in scope.
- No permission-name fields are added.

## Open Questions

- Should role response use `roleId` camelCase while path parameter remains `role_id` or `{roleId}`?
- Exact search/sort query parameter names.

## Human Decisions Required

- None for Phase 3 entry.
