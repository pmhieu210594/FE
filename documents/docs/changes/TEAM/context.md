# Context

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Screen / API / Batch / Related Job

| type | item | status | note |
|---|---|---|---|
| FE screen | Team Management list | planned / not implemented | New ADMIN-only screen for list/search/create/open detail. Candidate route: `/:lang/teams`. |
| FE screen | Team create/edit | planned / not implemented | Form fields: Team Code, Team Name, Description, Status/Version as applicable. Team Code is editable after creation. |
| FE screen | Team detail | planned / not implemented | Shows Team basic information and active Team members. |
| FE screen area | Add/update/remove Team member | planned / not implemented | Add existing member with role, update member role, remove by inactive membership. No new member master creation. |
| FE route | `/:lang/login` | existing | Login route exists in `EDCAP_FE/src/App.tsx`. |
| FE route | `/:lang/admin` | existing | Existing connector admin page, not Team Management. |
| FE route | `/:lang/organizations` | existing | ADMIN-only route, good route/page/navigation reference. |
| FE route | `/:lang/customers` | existing | ADMIN-only route, good CRUD page reference with Organization dropdown. |
| BE API | `GET /api/v1/teams` | to be created | List/search Teams by Team Code/Team Name/status/page/size. ADMIN-only. |
| BE API | `GET /api/v1/teams/{teamId}` | to be created | Team detail with basic info and/or member list depending final DTO split. ADMIN-only. |
| BE API | `POST /api/v1/teams` | to be created | Create Team with unique Team Code. ADMIN-only. |
| BE API | `PUT /api/v1/teams/{teamId}` | to be created | Update Team Code/Name/Description/Status with version if optimistic locking follows current CRUD pattern. ADMIN-only. |
| BE API | `PATCH /api/v1/teams/{teamId}/delete` | to be created | Soft delete/inactive Team and inactive all active memberships in one transaction. ADMIN-only. |
| BE API | `GET /api/v1/teams/{teamId}/members` | to be created | List active members in Team detail. ADMIN-only. |
| BE API | `POST /api/v1/teams/{teamId}/members` | to be created | Add existing member with role. ADMIN-only. |
| BE API | `PUT /api/v1/teams/{teamId}/members/{teamMemberId}` | to be created | Update role of active membership; do not create a new membership. ADMIN-only. |
| BE API | `PATCH /api/v1/teams/{teamId}/members/{teamMemberId}/delete` | to be created | Remove member from Team by setting membership inactive. ADMIN-only. |
| BE lookup/API dependency | Member lookup | to be created or reused if discovered later | Team detail needs selectable existing members from `tbl_dim_member_pseudonym`. No current typed FE endpoint exists. |
| BE lookup/API dependency | Role lookup | to be created or reused if discovered later | Role selector uses `tbl_dim_role`. No current typed FE endpoint exists. |
| Batch / Job | Team-specific batch/job | not applicable | No TEAM batch/job requirement in `spec-pack.md`. |
| Event / Webhook | GitHub/Jira/CircleCI webhooks | not impacted | Connector/webhook flows are out of scope for TEAM. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| BE controller CRUD pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Thin REST controller; delegates to service; route prefix `/api/v1/organizations`; uses `@CurrentUser AppUser caller`; `POST` returns `201 Created`. |
| BE service CRUD/business rule pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | ADMIN guard in service, transaction boundary on service methods, trim/length validation, uniqueness check, soft delete, optimistic lock handling. |
| BE service with parent lookup dependency | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | Good reference for validating related master records before create/update. For TEAM, similar validation is needed for member/role existence. |
| BE domain model style | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Organization.java` and `Customer.java` | Lombok `@Builder`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`; enum status; helper like `isDeleted()`. |
| BE DTO style | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/OrganizationDtos.java` and `CustomerDtos.java` | Nested Java records, `from(domain)` converter, page DTO with `items/page/size/totalElements/totalPages`. |
| BE port/adapter/mapper split | `OrganizationRepositoryPort`, `OrganizationRepositoryAdapter`, `OrganizationMapper` | Application depends on port; infrastructure adapter implements port; MyBatis mapper remains infrastructure. |
| FE route guard | `EDCAP_FE/src/App.tsx` | `RequireAdmin` protects ADMIN-only routes. Add Team route here; do not rely on menu hiding only. |
| FE navigation | `EDCAP_FE/src/components/Layout.tsx` | Add Teams under system/admin menu using `adminOnly: true` and i18n label key. |
| FE CRUD page | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Good reference for table/search/drawer/status badge/delete confirmation and query invalidation. |
| FE CRUD page with lookup dropdown | `EDCAP_FE/src/pages/CustomerPage.tsx` | Good reference for dependent dropdown data loaded via endpoint helper. TEAM member add form can follow this pattern for member/role options. |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | Add typed `Team`, `TeamMember`, request/response interfaces and `endpoints.teams.*`; all API calls must go through this file. |
| FE i18n resources | `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | Add `Layout.teams` and `Pages.Team.*` keys in all supported locales. |
| DB migration style | `EDCAP_BE/src/main/resources/db/migration/V5__alter_tbl_dim_organization_for_management.sql` | Use new migration, `ADD COLUMN IF NOT EXISTS`, pre-check before unique index, indexes with explicit names. |
| Existing base schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Confirms existing `tbl_dim_team`, `tbl_dim_role`, `tbl_dim_member_pseudonym`, and current legacy `project_id/team_id/role_id` columns. Do not edit old migration in implementation phase unless project explicitly requires baseline rewrite. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | App shell/navigation; add Teams menu item here. |
| `RequireAdmin` | `EDCAP_FE/src/App.tsx` | Protect Team route in FE. |
| `useAuth` / `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Use existing auth state; do not create parallel auth state. |
| `useLanguage` | `EDCAP_FE/src/hooks/useLanguage.ts` | Keep language-first route behavior. |
| `api` / `endpoints` | `EDCAP_FE/src/lib/api.ts` | Required API access path. |
| TanStack Query | Existing usage in `OrganizationPage.tsx` / `CustomerPage.tsx` | Use `useQuery`, `useMutation`, `useQueryClient` for Team list/detail/mutations. |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table` | Candidate for Team list and Team member list if props fit. |
| `CSearch` | `EDCAP_FE/src/components/ui/search` | Candidate for Team search/filter form. |
| `CDrawerForm` | `EDCAP_FE/src/components/ui/drawer` | Candidate for create/edit/detail drawer if Team UI follows current CRUD pages. |
| `CButton` | `EDCAP_FE/src/components/ui/button` | Use existing button component instead of raw HTML button where current CRUD pattern uses it. |
| `Badge` | `EDCAP_FE/src/components/ui/badge.tsx` | Display Team status/member status/role. |
| `CTooltip`, `CSvgIcon` | `EDCAP_FE/src/components/ui/tooltip`, `svg-icon` | Use consistently for table action buttons if following Organization/Customer pages. |
| `message`, `Popconfirm` | `antd` | Existing CRUD pages use these for feedback/delete confirmation; allowed for consistency. |
| `formatDateTime`, `cn` | `EDCAP_FE/src/lib/utils.ts` | Date formatting and class merge utilities. |

## Forbidden common components

| component / pattern | reason |
|---|---|
| Direct `fetch`/axios outside `EDCAP_FE/src/lib/api.ts` | Bypasses shared bearer token, credentials, trace/error handling and i18n message-key handling. |
| Menu-only authorization | Hiding nav is not security. FE route guard and BE service guard are both required. |
| `AdminController` inline `Map.of("error", ...)` error response pattern | Known inconsistent pattern; Team must use standard exception handling/error response. |
| Connector `AdminPage` as UI/business model | It is connector admin, not master CRUD/member management; use query style only if helpful. |
| Physical DB delete for Team or membership | Spec requires soft delete/inactive. |
| `tbl_dim_member_pseudonym.team_id/role_id` as Team membership source | Spec requires new `tbl_team_member` as source of Team-Member-Role relation. |
| Project selector / Team-Project assignment UI in Teams | Explicitly out of scope; Team-Project belongs to another function. |
| Member master create/edit inside Team detail | Explicitly out of scope; Team detail only adds existing members. |
| Audit log module/table for Team-specific actions | Explicitly out of scope for this phase. |
| New global state store for Team server data | Architecture rule requires async server data through TanStack Query, not new Redux/Zustand server-state slices. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `RequireAdmin` | `EDCAP_FE/src/App.tsx` | Existing FE ADMIN guard; used for admin/organizations/customers routes. |
| `ForceLogoutAndRedirect` | `EDCAP_FE/src/App.tsx` | Existing behavior when authenticated user lacks ADMIN role. |
| `HomeGate` | `EDCAP_FE/src/App.tsx` | Authenticated home routing. |
| `DefaultLanguageRedirect` | `EDCAP_FE/src/App.tsx` | Default language routing. |
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | App shell with `navItems`. |
| `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Existing logout helper. |
| `api.get/post/put/patch/del` | `EDCAP_FE/src/lib/api.ts` | Shared HTTP wrapper; `api.patch` exists and is used for soft delete. |
| `endpoints.organizations.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Existing typed CRUD endpoint helper pattern. |
| `endpoints.customers.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Existing typed CRUD endpoint helper pattern with `pageSize` parameter. |
| `OrganizationController#list/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Existing CRUD controller method set. |
| `CustomerController#list/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Existing CRUD controller method set. |
| `OrganizationService#search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Existing CRUD service method set with ADMIN guard. |
| `CustomerService#search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/CustomerService.java` | Existing CRUD service method set with ADMIN guard and parent master validation. |
| `OrganizationRepositoryPort#findById/findPage/count/existsActiveCode/existsActiveName/insert/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/OrganizationRepositoryPort.java` | Existing repository port pattern. |
| `OrganizationMapper#findById/findPage/count/existsActiveCode/existsActiveName/insert/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` | Existing MyBatis mapper method pattern. |
| `GlobalExceptionHandler` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Existing centralized exception-to-response mapping. |
| `BusinessRuleException`, `NotFoundException`, `ForbiddenException`, `OptimisticLockingException` | `EDCAP_BE/src/main/java/com/sdd/platform/**/exception` | Existing exception types used by Organization/Customer services. |
| `record_status` enum | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing DB status enum used by `tbl_dim_team`. |
| `tbl_dim_team`, `tbl_dim_role`, `tbl_dim_member_pseudonym` | `V4__init_shema_v2.sql` | Existing tables related to TEAM. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `TeamController` | Does not exist in current source. | Create under `com.sdd.platform.web.rest` following Organization/Customer pattern. |
| `TeamService` | Does not exist in current source. | Create under `application/usecase/governance` with transactional methods. |
| `TeamRepositoryPort` / `TeamRepositoryAdapter` / `TeamMapper` | Do not exist in current source. | Create port/adapter/mapper split if implementing persistence. |
| `TeamDtos` | Does not exist in current source. | Create `web/dto/TeamDtos.java` with records and `from(...)` methods. |
| `TeamPage.tsx` | Does not exist in current source. | Create page under `EDCAP_FE/src/pages/TeamPage.tsx`. |
| `endpoints.teams.*` | Does not exist in current source. | Add typed endpoint helper in `EDCAP_FE/src/lib/api.ts`. |
| `endpoints.members.*` / `endpoints.roles.*` | Does not exist in current source. | Add only if TEAM implementation needs lookup endpoints and BE supports them. |
| `GET /api/v1/teams*` | Does not exist in current source. | Implement API candidate from spec-pack. |
| `tbl_team_member` | Does not exist in current migrations. | Add new migration to create it. |
| `tbl_dim_team.team_code`, `description`, `deleted_at`, `deleted_by`, `version` | Not present in V4 base Team table. | Add through new migration if Team CRUD requires them. |
| `tbl_dim_team.project_id` as required Team CRUD field | Spec explicitly says remove from Team master for this scope. | Drop/remove dependency in new migration/model or baseline according to agreed migration strategy. |
| `tbl_dim_member_pseudonym.team_id/role_id` as active Team membership | Legacy columns exist but are not the source of truth for TEAM. | Use `tbl_team_member`. |
| `DELETE /api/v1/teams/{teamId}` | Spec candidate uses PATCH `/delete` and soft delete. | Use `PATCH /api/v1/teams/{teamId}/delete`. |
| Team-Project assignment API in TEAM | Out of scope. | Defer to separate Project/Team assignment function. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | note |
|---|---|---|---|
| FE Page | `TeamPage` | `EDCAP_FE/src/pages/TeamPage.tsx` | To be created; list/search/create/edit/detail/member management. |
| FE API types | `Team`, `TeamPage`, `TeamMember`, request types | `EDCAP_FE/src/lib/api.ts` | To be added; follow Organization/Customer typed endpoint style. |
| FE i18n | `Layout.teams`, `Pages.Team.*` | `EDCAP_FE/public/locales/{en,vi,ja}/locale.json` | To be added in all three locales. |
| BE Controller | `TeamController` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | To be created; ADMIN caller via `@CurrentUser`. |
| BE DTO | `TeamDtos` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | To be created; include Team and TeamMember DTOs/page DTOs/request records. |
| BE Service | `TeamService` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | To be created; transaction, ADMIN guard, uniqueness, soft delete cascade. |
| BE Port | `TeamRepositoryPort` | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | To be created. |
| BE Adapter | `TeamRepositoryAdapter` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | To be created. |
| BE Mapper | `TeamMapper` | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | To be created with explicit SQL/provider/XML if current project pattern requires. |
| BE Domain | `Team` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | To be created; map `tbl_dim_team`. |
| BE Domain | `TeamMember` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | To be created; map `tbl_team_member`. |
| DB existing | `tbl_dim_team` | `V4__init_shema_v2.sql` | Existing table has `team_id`, `project_id`, `team_name`, `status`, metadata, unique `(project_id, team_name)`. Needs alignment. |
| DB existing | `tbl_dim_role` | `V4__init_shema_v2.sql` | Existing role master: `role_id`, `role_name`, `description`, metadata. |
| DB existing | `tbl_dim_member_pseudonym` | `V4__init_shema_v2.sql` | Existing member source; legacy `team_id`/`role_id` not used as TEAM membership source. |
| DB new | `tbl_team_member` | new migration, next available version after `V112` | To be created for Team-Member-Role relation. |
| DB migration | Team management migration | new `V113__...sql` candidate | Add Team Code/description/delete/version; drop or deprecate Team `project_id`; create `tbl_team_member`; add indexes/constraints. Exact version must be checked before implementation. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Team Code | `teamCode` / candidate DB `team_code` | TEAM spec | Required, trim, max length candidate 50, unique among active Teams according to final DB scope. |
| Team Name | `teamName` / DB `team_name` | `tbl_dim_team` and TEAM spec | Required, trim, max length candidate 255. |
| Description | `description` | TEAM spec / Organization pattern | Optional, max length candidate 500 if following Organization. |
| Team Status | `ACTIVE`, `DELETED` or `ACTIVE`, `INACTIVE` | DB `record_status` and current Organization/Customer pattern | Spec uses soft delete/inactive wording. Final code must map consistently; avoid magic strings outside enum/constant. |
| Member | `memberKey` | `tbl_dim_member_pseudonym.member_key` | Existing member master. Display should prefer `pseudonym`; avoid exposing external hashes. |
| Role | `roleId` | `tbl_dim_role.role_id` | Required on add/update member. Display uses `role_name`. |
| Team Member status | `ACTIVE` / `INACTIVE` candidate | `tbl_team_member.status` | Remove member changes active membership to inactive. |
| `formItemNm` | no existing TEAM-specific value found | source inspection | Current FE forms use field `name` in `IForm`, not `formItemNm`. If required by future template, map to `teamCode`, `teamName`, `description`, `memberKey`, `roleId`. |
| `SEQNO` | no existing TEAM-specific value found | source inspection | No sequence-number business item found for TEAM. Use DB UUID primary keys, not manual SEQNO, unless later spec changes. |
| Master Data | Role master | `tbl_dim_role` | Must be lookup/read-only in Team member forms. |
| Code Value | `record_status` | V4 migration | Use enum/constant mapping; do not hard-code display text. |

## Multilingual Note

- Supported languages are `en`, `vi`, `ja` as confirmed by `EDCAP_FE/src/i18n.ts` and TEAM spec.
- Add all visible Team labels/buttons/placeholders/validation/business error messages to `EDCAP_FE/public/locales/en/locale.json`, `vi/locale.json`, and `ja/locale.json`.
- BE should return stable message keys/business error codes; FE translates through existing `translateApiMessage()` behavior in `EDCAP_FE/src/lib/api.ts`.
- Candidate namespace: `Pages.Team.*` plus `Layout.teams`.
- Do not hard-code Team UI labels or error text in React components.

## Encoding / Mojibake Note

- Keep Markdown and JSON files UTF-8.
- Locale files contain Vietnamese and Japanese text; verify no mojibake after editing.
- Avoid manual copy/paste that changes full-width/half-width characters unintentionally.
- Team Code should be treated as business code input; trim policy is required. Unicode normalization/case-insensitive uniqueness must be decided in implementation and migration if non-ASCII Team Code is allowed.

## Log / Audit / Operation Note

- TEAM spec says no separate Team audit log module/table in this phase.
- Still preserve standard metadata where table pattern has it: `created_at`, `created_by`, `updated_at`, `updated_by`, and soft-delete metadata such as `deleted_at`, `deleted_by` if added.
- Delete Team must inactive active memberships transactionally to avoid operational inconsistency.
- Logs must not include secrets, tokens, external hashes, or unnecessary member-identifying data.
- Rely on existing trace/error infrastructure for investigation. Do not expose stack traces to client.

## Ticket-Specific Constraints

| constraint | detail |
|---|---|
| ADMIN only | Both FE route and BE service/API must enforce ADMIN-only access. |
| No Team-Project assignment | Do not add Project selector or project assignment logic to Team screen/API. |
| New relation table | `tbl_team_member` is the source of Team-Member-Role relation. |
| One active role per Team | Enforce unique active `(team_id, member_key)`. |
| Member multi-team | Do not block the same member from joining different Teams. |
| Soft delete/inactive only | No physical delete for Team or Team membership in user-facing flow. |
| Delete Team cascade | Soft deleting Team must inactive all active Team memberships in same transaction. |
| No old data migration | Do not migrate from `tbl_dim_member_pseudonym.team_id/role_id`. |
| No audit log module | Do not add Team-specific audit log module/table this phase. |
| Source/doc drift to watch | Standards docs mention session cookie auth, but current source uses bearer token/localStorage. TEAM should follow current source unless security decision updates architecture docs first. |
