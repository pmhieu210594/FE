# Ticket Rules:

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Must Follow

- Do not add specifications not included in `docs/changes/TEAM/spec-pack.md`.
- Ambiguous points must be returned as Open Issues instead of silently deciding new scope.
- Before implementation, read target source and existing tests for Organization/Customer CRUD patterns.
- Follow current source patterns over stale architecture text when there is documented drift; record the drift.
- Backend must follow hexagonal layering: controller -> application service -> port -> adapter/mapper.
- Controllers stay thin and must not depend on infrastructure classes.
- Service methods own business rules and transaction boundaries.
- All TEAM APIs and screens are ADMIN-only in this phase.
- Team Code and Team Name must be trimmed and validated as required fields.
- Team Code can be updated after create but must remain unique in the final active unique scope.
- Team deletion and Team member removal must be soft delete/inactive only.
- Team deletion must inactive all active memberships in the same transaction.
- A member may belong to multiple Teams.
- In one Team, a member may have only one active membership/role.
- Role source is `tbl_dim_role`; do not create a separate role master for Teams.
- Team-Member-Role source is `tbl_team_member`; do not use legacy `tbl_dim_member_pseudonym.team_id/role_id` as the source of truth.
- FE API calls must go through `EDCAP_FE/src/lib/api.ts` and typed `endpoints` helpers.
- FE server data must use TanStack Query patterns used by Organization/Customer pages.
- UI text, validation messages and business errors must be translated for `en`, `vi`, and `ja`.
- Business code values should be enum/constant/master values rather than magic strings scattered across code.
- Do not export secrets, tokens, external hashes, or unnecessary member-identifying data to logs.

## Must Not Do

| rule | reason |
|---|---|
| Do not implement Team-Project assignment in TEAM | Explicitly out of scope; belongs to another screen/function. |
| Do not add Project selector to Team create/edit | Same reason; `tbl_dim_team.project_id` is to be removed/deprecated for this scope. |
| Do not create member master records from Team detail | Team detail only adds existing members. |
| Do not implement import/export, hierarchy, dashboard, KPI, or external sync | Not in spec-pack scope. |
| Do not hard delete `tbl_dim_team` or `tbl_team_member` from user flow | Spec requires soft delete/inactive. |
| Do not migrate old data from `tbl_dim_member_pseudonym.team_id/role_id` | User confirmed no old data migration. |
| Do not add Team-specific audit log module/table | Phase says audit log riêng is not needed. |
| Do not copy `AdminController` ad-hoc `Map.of("error", ...)` response pattern | It is a known inconsistent error pattern. |
| Do not bypass `GlobalExceptionHandler` with ad-hoc error bodies | Error contract should remain centralized. |
| Do not call non-existing `endpoints.teams.*` before adding typed helpers | Current FE API helper has no Teams endpoints. |
| Do not rely on FE guard only for security | BE must enforce ADMIN. |
| Do not read or include `.env` or secret files | Safety rule. |

## Stop / Ask Conditions

| condition | action |
|---|---|
| Final unique scope for Team Code cannot be implemented without deciding global vs scoped uniqueness | Stop and record Open Issue before coding DB constraint. Current spec leans active unique scope; no Project scope. |
| Removing `tbl_dim_team.project_id` would break existing metric/project dependencies beyond TEAM scope | Stop and escalate migration/compatibility decision. |
| Existing DB has active duplicates that violate planned unique indexes | Stop migration and report duplicate pre-check result. |
| Member/Role lookup API scope becomes larger than simple selector needs | Stop and split into separate ticket or explicit decision. |
| Architecture/security docs conflict with current bearer token source and security owner requires correction first | Stop and request decision. |
| A destructive DB operation or production migration command is needed | Stop and request explicit confirmation. |

## Review Focus

| area | focus |
|---|---|
| Scope | No Team-Project assignment, no member master management, no audit module. |
| Security | ADMIN-only enforced in FE and BE; no PII/secrets in logs/errors. |
| DB | `tbl_team_member` exists; active uniqueness; indexes; FK to team/member/role; soft delete metadata. |
| Transaction | Delete Team and inactive memberships are atomic. |
| API | Routes match spec candidate; status/error behavior follows existing standard; no ad-hoc bodies. |
| FE | Uses `lib/api.ts`, TanStack Query, i18n keys, existing components. |
| i18n | `en`, `vi`, `ja` complete and not mojibake. |
| Compatibility | Existing Organization/Customer/Auth/connector flows unaffected. |

## Test Focus

| type | focus |
|---|---|
| BE unit | Validation, uniqueness, ADMIN guard, duplicate member, update role, soft delete cascade. |
| BE API/integration | Status codes, error codes/message keys, route mapping, unauthorized/non-admin behavior. |
| DB migration | Migration applies cleanly; table/columns/indexes/FKs/unique active constraint exist; rollback limitation documented. |
| FE unit/component | List/search/form/detail/member flows, API helper, error translation, non-admin route guard. |
| E2E/blackbox | ADMIN CRUD Team, edit Team Code, duplicate code, add/update/remove member, delete Team cascade, i18n, session expired. |
