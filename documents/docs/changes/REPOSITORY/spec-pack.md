# Spec Pack

**Ticket ID**: REPOSITORY-CRUD  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19

## 1. Context / Purpose

Repository management is required for the EDCAP platform so admins can create, inspect, update, and soft-delete repositories that belong to a project. This spec is the single source of truth for Phase 3 implementation and testing.

The ticket input contained mixed Repository/Project terminology and references both legacy and V5+ schema conventions. This spec normalizes those statements into testable requirements and isolates any remaining unresolved items in Open Issues.

## 2. Scope

### 2.1. Within range

- List repositories.
- Create repository.
- View repository detail.
- Update repository.
- Soft delete repository.
- FE and BE validation.
- Backend permission checks.
- Default exclusion of soft-deleted repositories from list responses.
- Detail view remains available for soft-deleted repositories.
- Repository names are unique per project among active rows.

### 2.2. Out of range

- Restore soft-deleted repository.
- Bulk delete or bulk update.
- Import/export.
- Audit history UI.
- Schema redesign beyond the minimum required columns and indexes for this feature.
- Any unrelated Project, Organization, Customer, Team, or Auth feature work.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Repository | A repository record owned by exactly one project | CRUD subject of this ticket |
| Project | Parent business entity that groups repositories | Existing system entity |
| Soft delete | Logical delete that marks a record deleted without physical removal | Must not hard-delete repository rows |
| Active row | A row that is not soft-deleted | Default list/detail/edit target |
| `repo_name_masked` | Display/business name of the repository | Displayed raw on screen; stored as canonical business name |
| `repo_url_hash` | Repository URL field | UI displays raw input; persistence stores AES-256-GCM encoded value |
| `host_type` | Repository hosting provider type | Example values in input: github, gitlab, local |

## 4. As-Is

- Current source code has a legacy `repository` domain model, but no live Repository CRUD controller/service/mapper for the ticketed feature.
- Existing implemented CRUD screens in FE already follow list/detail/drawer patterns for other managed entities.
- Current standards require raw DTO success responses and `ErrorResponse` failure responses.
- Current database conventions in the repo are split between legacy V1-V4 tables and V5+ `tbl_` tables.

## 5. To-Be

- Repository CRUD is available through a versioned API under `/api/v1/...`.
- FE supports list, create, detail, edit, and soft delete with consistent validation and message handling.
- BE enforces validation, uniqueness, and authorization.
- Deleted repositories are hidden from default list results.
- Detail display behavior for deleted repositories is controlled by the confirmed business rule in Open Issues.

## 6. Detailed specification

### 6.1. Business Rules

- A repository belongs to exactly one project.
- Repository create and update require a valid project reference.
- Repository name must be trimmed before validation and persistence.
- Repository name must not be empty or whitespace only.
 - Repository name must be unique within the same project for active rows.
- Soft delete must not physically remove the row.
- Backend must be the final authority for validation and authorization.
- FE validation is only an early UX guard.
- Repository URL is displayed in raw form on the screen, while the persisted value is AES-256-GCM encoded.

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| projectId | UUID | Yes | Must reference an existing project | Parent project selector |
| repo_name_masked | string | Yes | Trim, non-empty, not whitespace-only, length limit applies | Display/business repository name |
| host_type | string / enum | Yes | Must be one of the allowed host values | Exact enum values require confirmation if not inherited from source |
| default_branch | string | No | If present, trim; length limit applies | Optional default branch |
| repo_url_hash | string | No | FE accepts raw URL; BE stores AES-256-GCM encoded value | Raw value is displayed in UI, encoded value persisted |
| repository_id | UUID | Yes on update/detail/delete | Must exist and not be invalidated by deletion rule | API path identifier |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| repository_id | UUID | JSON string UUID | Primary identifier |
| project_id | UUID | JSON string UUID | Parent project reference |
| project_alias | string | JSON string | Human-readable project alias in list/detail, joined from `tbl_dim_project` |
| repo_name_masked | string | JSON string | Display name |
| host_type | string | JSON string | Host provider type |
| default_branch | string \| null | JSON string or null | Optional field |
| repo_url_hash | string \| null | JSON string or null | Raw URL shown to users; persisted DB value remains AES-256-GCM encoded |
| status | string | ACTIVE or DELETED | Soft delete state |
| created_at / updated_at / deleted_at | datetime | ISO-8601 string | Timezone aware |
| created_by / updated_by / deleted_by | string \| null | JSON string or null | Audit fields |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Missing projectId | Reject request | 400 / validation error | FE should block early, BE must enforce |
| Empty or whitespace-only repository name | Reject request | 400 / validation error | Trim before checking |
| Unknown repository_id | Return not found | 404 | Applies to detail, update, delete |
| Repository already soft-deleted | Allow detail display, reject edit/update/delete | 404 for edit/update/delete | Detail remains accessible for audit/view only |
| Duplicate repository name in the same project | Reject request | 409 | Active rows only |
| Unauthorized caller | Reject request | 403 | Must be backend enforced |
| Invalid host_type | Reject request | 400 or 422 | Use current project convention |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| repo_name_masked length | 1 after trim | Follow DB / DTO limit | Leading/trailing whitespace trimmed | Valid if within limit |
| default_branch length | empty | Follow DB / DTO limit | Null and empty string allowed if optional | Stored as null when empty |
| repo_url_hash length | empty | Follow DB / DTO limit | Raw value is accepted at UI; persisted form is AES-256-GCM encoded | UI and storage representations differ by design |
| number of repositories per project | 0 | Unbounded by spec | List must remain paginated if large | System handles list query within standard paging contract |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | List and detail should be responsive for normal admin usage | Use standard paging; no unbounded client render | API and E2E tests | No hard SLO was provided |
| Security | Only authorized callers may mutate repositories | Backend permission gate on every action | BE web tests | FE button hiding is not sufficient |
| Availability / Reliability | Soft delete must preserve history without hard deletion | No hard delete in normal flow | Unit/integration tests | |
| Maintainability | Follow current FE/BE conventions | Use existing patterns and naming | Code review + tests | |
| Observability / Logging | Failures must be traceable | Preserve `traceId` in error flow | API / FE error tests | |
| Compatibility | Success responses stay as raw DTO/list | No envelope unless architecture changes | Contract tests | |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-REPOSITORY-1 | Given an authorized caller, `GET /api/v1/repositories` returns only active repository rows in the configured pagination shape. | Yes | Deleted rows are excluded by default |
| AC-REPOSITORY-2 | Given an authorized caller and an existing repository ID, `GET /api/v1/repositories/{repository_id}` returns the repository detail payload including parent project alias. | Yes | Deleted rows remain detail-viewable |
| AC-REPOSITORY-3 | Given valid create input, `POST /api/v1/repositories` persists a new repository and returns the created payload with created status. | Yes | Input is trimmed before validation |
| AC-REPOSITORY-4 | Given valid update input, `PUT /api/v1/repositories/{repository_id}` persists the changes and returns the updated payload. | Yes | Duplicate active names in the same project are rejected |
| AC-REPOSITORY-5 | Given an authorized caller, `PUT /api/v1/repositories/{repository_id}/delete` performs soft delete only and the repository disappears from default list results. | Yes | Physical delete must not occur |
| AC-REPOSITORY-6 | Given invalid input, a missing repository ID, or missing permission, the API returns the platform-standard error shape and status code. | Yes | Status must follow current standards |
| AC-REPOSITORY-7 | Given repository data has been mutated successfully, the FE refreshes list/detail state and shows the expected success/error message. | Yes | Must be covered by FE unit and E2E tests |
| AC-REPOSITORY-8 | Given repository name input with leading or trailing whitespace, FE and BE both normalize it before validation and persistence. | Yes | Prevents whitespace-only duplicates |

## 8. Examples

### 8.1. Normal Case

- Create repository with `projectId`, `repo_name_masked`, `host_type`, and optional `default_branch`.
- List repositories for a project and display project alias alongside repository name.
- Update repository name and branch, then verify the list and detail screens show the updated values.
- Soft delete a repository and verify it disappears from the default list.

### 8.2. Error Case

- Submit repository name as empty string.
- Submit repository name as spaces only.
- Submit repository with duplicate active name in the same scope.
- Request detail for a non-existent repository ID.
- Attempt delete without required permission.

### 8.3. Boundary Case

- Repository name contains leading/trailing spaces and is accepted after trim.
- Optional fields are omitted entirely.
- Deleted repository is requested again and returns the decided not-found or deleted behavior.
- Large repository list is paginated rather than rendered as an unbounded array.

## 9. Source Availability Summary

- Solid: route conventions, error handling conventions, FE data-fetching conventions, DB naming conventions, soft-delete patterns for related entities.
- Partial: repository-specific schema meaning and duplicate scope.
- Missing: live Repository CRUD controller/service/mapper implementation only. The repository-specific contract is now mostly confirmed by migration and human decisions.

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: FE+BE+DB
- Primary risk: Spec, Contract, DB, Security, Test
- Review mode: Standard
- Required options: FE-BE Contract, DB Migration, Full Security
```

## 11. FE/BE Contract Impact

- New Repository endpoints must follow the `/api/v1/<resource>` pattern used by the platform.
- Success responses should remain raw DTOs or raw DTO lists, not wrapped envelopes.
- Error responses must use `ErrorResponse` shape and existing FE `ApiError` handling.
- FE should use `endpoints.*` helpers in `src/lib/api.ts` and TanStack Query for data flow.
- The UI shows the raw repository URL, while the backend persists the AES-256-GCM encoded form.

## 12. DB/Migration Impact

- New repository storage uses `tbl_dim_repository`.
- The table follows the V5+ `tbl_` naming convention and UUID PKs.
- Soft delete is represented by `delete_flag`, `deleted_at`, and `deleted_by`.
- Uniqueness is enforced at the database level for active rows using a partial unique index on `(project_id, LOWER(BTRIM(repo_name_masked)))`.
- Migration must be additive and must not edit committed migrations.

## 13. Security/Privacy Impact

- All mutating actions require backend authorization.
- UI hiding of buttons is not a security control.
- No secrets or tokens are part of the repository feature spec.
- Repository URL is displayed raw in the UI, while the stored database value is AES-256-GCM encoded.

## 14. Operation/Maintenance Impact

- Soft delete preserves operational history and supports recovery by later admin processes if such a process is introduced.
- Any future backfill or cleanup must respect the active-row uniqueness rule.
- Traceability depends on consistent `traceId` propagation and standard error handling.
- The implementation should fit existing admin CRUD patterns to reduce maintenance cost.

## 15. Test Strategy Summary

- FE unit tests for API helper, validation, and repository screen interactions.
- BE unit tests for use-case rules and duplicate detection.
- BE web tests for permission, validation, not-found, create/update/delete status, and error shape.
- DB/migration tests for schema, uniqueness, soft-delete filtering, and AES-256-GCM storage behavior.
- E2E tests for end-to-end CRUD flow and deleted-row behavior.

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-REPOSITORY-1 | Confirm exact permission key / admin role gate naming | Needed to align FE and BE implementation with current conventions | Tech lead / Security | Open |
| H-REPOSITORY-2 | Confirm display label and wording for raw repository URL | UI must show raw value even though DB stores AES-256-GCM encoded form | Product / UX | Open |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-REPOSITORY-1 | API success responses remain raw DTO/list responses | Current API contract standards and live FE helpers | Low | No |
| A-REPOSITORY-2 | Error responses use standard `ErrorResponse` shape | Current error handling standards | Low | No |
| A-REPOSITORY-3 | Backend is the source of truth for authorization and validation | Architecture and security rules | Low | No |
| A-REPOSITORY-4 | The feature is new and there is no existing Repository CRUD controller to preserve | Source inspection | Medium | No |
| A-REPOSITORY-5 | Soft delete should behave like the other managed entities in the app | Related implemented feature patterns and V130 migration | Low | No |
| A-REPOSITORY-6 | UUID / `tbl_` conventions are the target and `tbl_dim_repository` is the authoritative table | Human confirmation and V130 migration | Low | No |
| A-REPOSITORY-7 | Repository URL is stored as AES-256-GCM encoded data while the UI displays the raw value | Human confirmation | Medium | No |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-REPOSITORY-1 | Requirement text mixes Project and Repository field names and behaviors | Blocks precise DTO and UI contract wording in some screens | Product / Analyst | Open |
| OI-REPOSITORY-2 | Permission key / role gate naming is unresolved | Blocks FE conditional rendering and BE auth tests | Tech lead | Open |
