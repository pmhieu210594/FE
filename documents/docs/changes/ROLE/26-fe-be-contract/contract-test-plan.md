# Contract Test Plan

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft / Tests Not Implemented

## Test Objective

Prevent FE/BE contract drift for ROLE API, DTO, validation, error, role authorization, FE-side pagination, timestamp, and logical delete behavior.

## Contract Test Scope

| area | test cases | priority |
|---|---|---|
| DTO shape | `RoleDto` has `roleId`, `roleName`, `description`, `createdAt`, `updatedAt` | High |
| List endpoint | Raw list response, no pagination wrapper/total fields | High |
| Create/update request | Request fields and validation responses | High |
| Error shape | `ErrorResponse` fields and status codes | High |
| Authorization | Allowed/denied roles per action | High |
| Duplicate behavior | Case-insensitive duplicate response | High |
| Delete behavior | `PUT /api/v1/roles/{role_id}/delete`, HTTP 200 logical delete, `delete_flag = 1`, `updated_at`/`updated_by` update, no physical removal | High |
| Timestamp | BE serialization parseable by FE; FE displays `DD/MM/YYYY HH:mm:ss` local timezone | Medium |
| i18n | ROLE keys exist in en/vi/ja | Medium |
| Cache/state | FE invalidates list/detail after mutations | Medium |

## FE Test Candidates

| test | target | note |
|---|---|---|
| API helper parses `RoleDto` | `src/lib/api.ts` role endpoints | After helpers exist |
| ApiError from ErrorResponse | `src/lib/api.ts` | Existing wrapper can be tested |
| Role list page states | ROLE page | loading/error/empty/success |
| Create/update validation | ROLE form/dialog | trim/blank/max |
| Delete confirmation | ROLE page/dialog | API not called before confirm |
| Role-gated visibility | Layout/page/buttons | requires final role matrix |
| Timestamp display | utility/component | local timezone and `DD/MM/YYYY HH:mm:ss` |
| i18n keys | locale JSON/component | `Pages.RoleManagement.*` |

## BE Test Candidates

| test | target | note |
|---|---|---|
| RoleController web tests | `@WebMvcTest` | status + DTO + errors |
| RoleService unit tests | service with mocked port | validation/duplicate HTTP 400/logical delete |
| Role authorization tests | web/security | allowed/denied matrix |
| RoleMapper/adapter tests | DB/integration or mapper slice | logical delete SQL, list/search exclusion, FK preservation |
| ErrorResponse tests | controller/global handler | no Map error for ROLE |

## Contract/Integration Test Candidates

| test | approach | status |
|---|---|---|
| OpenAPI schema check | Generate runtime OpenAPI and compare expected ROLE paths | Deferred |
| FE DTO type snapshot | Static/interface snapshot | Deferred |
| API contract smoke | Backend test or E2E against test server | Deferred |

## Test Data

Use synthetic data only:

- `PM`, `QA`, `ADMIN`.
- duplicate variant: `pm`.
- trim variant: `" QA "`.
- invalid UUID.
- logically deleted role setup.
- referenced role setup to verify FK preservation without physical delete.

## Stop Conditions

- Do not write executable tests until final contract decisions are made.
- Do not write tests that expect physical hard delete, cascade delete, or restore behavior.
- Do not use production DB or production data.
- Do not read `.env*` or secrets for tests.
