# Source Availability - ROLE Phase 3

**Ticket ID**: ROLE  
**Phase**: Phase 3 - Impact Analysis / Impl Plan  
**Updated**: 2026-06-12  
**Status**: Available with implementation Stop/Ask items

## 1. Availability Summary

| source group | status | evidence / note |
|---|---|---|
| ROLE core artifacts | Available | `spec-pack.md`, `context.md`, `ticket-rules.md`, `open-issues.md`, Pack 26 artifacts were readable |
| FE repository | Available | `EDCAP_FE` source readable |
| BE repository | Available | `EDCAP_BE` source readable |
| Architecture docs | Available | `EDCAP_BE/documents/docs/architecture/` readable |
| Standards docs | Available | `EDCAP_BE/documents/docs/standards/` readable |
| `.claude/rules` | Available | `EDCAP_BE/documents/.claude/rules/` readable |
| DB schema/migration | Partially available | V4 has `tbl_dim_role`; V90 file exists but is empty |
| FE tests | Available | FE tests are under `EDCAP_FE/src/__ tests __`; no top-level `EDCAP_FE/tests` directory found |
| BE tests | Available | BE unit/integration tests readable |

## 2. Files Read

### Core / Pack Artifacts

- `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md`
- `EDCAP_BE/documents/docs/changes/ROLE/context.md`
- `EDCAP_BE/documents/docs/changes/ROLE/ticket-rules.md`
- `EDCAP_BE/documents/docs/changes/ROLE/open-issues.md`
- `EDCAP_BE/documents/docs/changes/ROLE/impact-analysis.md`
- `EDCAP_BE/documents/docs/changes/ROLE/impl-plan.md`
- `EDCAP_BE/documents/docs/changes/ROLE/26-fe-be-contract/*`

### Architecture / Standards / Rules

- `EDCAP_BE/documents/docs/architecture/*`
- `EDCAP_BE/documents/docs/standards/*`
- `EDCAP_BE/documents/.claude/rules/*`

### FE Source

- `EDCAP_FE/src/router.tsx`
- `EDCAP_FE/src/main.tsx`
- `EDCAP_FE/src/App.tsx`
- `EDCAP_FE/src/components/Layout.tsx`
- `EDCAP_FE/src/hooks/useAuth.ts`
- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/pages/OrganizationPage.tsx`
- `EDCAP_FE/src/components/ui/server-table/index.tsx`
- `EDCAP_FE/src/components/ui/search/index.tsx`
- `EDCAP_FE/src/components/ui/pagination/index.tsx`
- `EDCAP_FE/src/components/ui/form/index.tsx`
- `EDCAP_FE/src/components/ui/button.tsx`
- `EDCAP_FE/src/components/ui/card.tsx`
- `EDCAP_FE/src/i18n.ts`
- `EDCAP_FE/src/lib/utils.ts`
- `EDCAP_FE/src/__ tests __/*`

### BE Source

- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java`
- Organization model/port/adapter/mapper/DTO/test examples by targeted search
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`
- `EDCAP_BE/src/main/resources/db/migration/V90__alter_tbl_role_for_management.sql`

## 3. Files Not Yet Read / Read Later In Phase 3

- Full locale JSON files for all languages.
- Full `OrganizationPage.tsx` implementation details beyond role-relevant patterns.
- Full MyBatis XML mapper bodies for all repository examples.
- Full Gradle/Maven/Vite test commands and test profile configuration.
- Runtime application config, unless needed for a local test profile.

## 4. Excluded

- `.env*`, secrets, credentials, keys, raw production logs.
- `.git`, `node_modules`, build outputs, generated binaries.
- Production data or any raw PII.
- Living docs outside `docs/changes/ROLE/` unless a later promotion step is approved.

## 5. Source Facts

- FE `router.tsx` defines `createHashRouter` with empty `children`, but current runtime routing is `main.tsx` mounting `HashRouter` and rendering `App.tsx` routes.
- FE `src/lib/api.ts` exposes `api.get/post/put/patch/del`, `ApiError`, `endpoints`, auth `Role = "VIEWER" | "EDITOR" | "ADMIN"`, and Organization endpoint examples.
- BE `GlobalExceptionHandler` returns standard `ErrorResponse`; `DomainException` maps to HTTP 400, `ForbiddenException` to HTTP 403.
- BE `OrganizationController` and `OrganizationService` provide the closest CRUD/layering example.
- V4 creates `tbl_dim_role` with `role_id`, `role_name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`.
- V4 does not show `delete_flag` on `tbl_dim_role` in the read slice/search result.
- `V90__alter_tbl_role_for_management.sql` exists and is length 0 at this review point.
- No existing `RoleController`, `RoleService`, `RoleRepositoryPort`, `RoleRepositoryAdapter`, `RoleMapper`, or FE `RoleDto` type was found by targeted search.

## 6. Assumptions

- The latest prompt's `VIEW` role means existing `VIEWER`, because source and accepted spec use `VIEWER`.
- ROLE should follow the existing Spring REST + service + port + adapter + MyBatis pattern unless Phase 3 source review finds a better local pattern.

## 7. Stop / Ask Before Implementation

| ID | condition | required action |
|---|---|---|
| SA-ROLE-001 | `delete_flag` is required by accepted spec but not present in V4 `tbl_dim_role`; V90 is empty | Confirm/create Phase 3 migration plan before implementing delete/list filtering |
| SA-ROLE-002 | Earlier `router.tsx` route-source decision conflicts with current runtime source | Use `App.tsx` for route implementation unless a separate routing migration is approved |
| SA-ROLE-003 | Any source proves `VIEW` is a distinct role from `VIEWER` | Stop and ask Human Owner |
| SA-ROLE-004 | Implementation requires restore or permission-based RBAC | Stop; both are out of scope |
