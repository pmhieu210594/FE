# Source Availability

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung / ChatGPT  
**Update date**: 2026-06-15  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Ticket spec | `docs/changes/TEAM/spec-pack.md` | read | high | Product / PM | Source of truth for TEAM AC, scope, business rules, API candidates, DB impact | If changed later, all Phase 3 impact/plan must be rechecked | always-read |
| Ticket context | `docs/changes/TEAM/context.md` | read | high | Ticket author / AI | Phase 2 source/context/rules summary for TEAM | May become stale after implementation begins | always-read |
| Ticket rules | `docs/changes/TEAM/ticket-rules.md` | read | high | Ticket author / AI | Ticket-specific constraints and prohibited actions | Rule drift if global standards change | always-read |
| Ticket template | `docs/standards/templates/_ticket-template/` | read | high | Standards owner | Required artifact structure | None if template remains stable | always-read |
| Architecture docs | `docs/architecture/` | read / partial | medium | Architecture team | FE/BE layering, DB/repository maps, entrypoint references | Some docs are known to drift from current source, especially auth/session details | verify-with-source |
| Standards docs | `docs/standards/` | read / partial | medium | Standards owner | Template/style/testing/security/i18n guidance | Some standards mention session cookie while current source uses bearer token | verify-with-source |
| Claude rules | `.claude/rules/` | read / partial | medium | Project maintainers | Local workflow and implementation rules | Rule files may be broad and need ticket-specific narrowing | always-read |
| Backend source | `EDCAP_BE/src/main/java/com/sdd/platform/` | read / partial | high | BE team | Actual controller/service/domain/port/adapter/mapper/security patterns | Large codebase; only representative files fully inspected in this phase | verify-with-source |
| Backend Organization pattern | `OrganizationController.java`, `OrganizationService.java`, `OrganizationDtos.java`, `Organization*Repository*`, `OrganizationMapper.java` | read | high | BE team | Best available CRUD/admin/soft-delete/validation pattern | Organization uses some organization-specific names/messages | use-as-reference |
| Backend Customer pattern | `CustomerController.java`, `CustomerService.java`, `CustomerDtos.java`, `Customer*Repository*`, `CustomerMapper.java` | read | high | BE team | Best available parent-linked CRUD and page/search pattern | `CustomerController#create` returns 200, while Organization create returns 201; choose consistent contract intentionally | use-as-reference |
| Security source | `SecurityConfig.java`, `BearerTokenAuthenticationFilter.java`, `CurrentUser`, `AppUser` | read | high | BE team | Current auth/authz behavior and caller injection | Global security allows authenticated access for most endpoints; TEAM must enforce ADMIN in service/controller | required |
| Frontend source | `EDCAP_FE/src/` | read / partial | high | FE team | Actual routes, layout, API helper, pages, tests, i18n | Some legacy router/redux files exist and should not be used unless proven active | verify-with-source |
| Frontend Organization/Customer pattern | `OrganizationPage.tsx`, `CustomerPage.tsx`, `src/lib/api.ts`, route/layout/test files | read | high | FE team | Best available admin CRUD page/API/i18n pattern | TEAM has member-detail functions beyond these examples | use-as-reference |
| DB definition / migration | `EDCAP_BE/src/main/resources/db/migration/` | read | high | Data/BE team | Current schema source for `tbl_dim_team`, `tbl_dim_member_pseudonym`, `tbl_dim_role` and latest Flyway version | Historical migration `V4__init_shema_v2.sql` contains legacy `team_id/role_id/project_id` references; care required | required-if-db |
| Existing tests | `EDCAP_BE/src/test/`, `EDCAP_FE/src/__ tests __/`, `EDCAP_FE/src/__tests__/` | read / partial | high | QA/Dev | Reference for service/controller/migration/page/API tests | Folder name contains both `__ tests __` and `__tests__`; follow existing conventions carefully | use-as-reference |
| External web/repo | N/A | not-read | n/a | n/a | Not needed for this internal source-driven phase | External info may be outdated or irrelevant | do-not-use |

## Summary

TEAM Phase 3 has enough source to create an implementation impact analysis and a reviewable implementation plan. The ticket spec is explicit about Team CRUD, Team member assignment, role handling, soft delete/inactive behavior, i18n, ADMIN access, and non-scope items.

Current source confirms that TEAM is not yet implemented as a complete module. The implementation can follow existing Organization/Customer CRUD architecture, but it must add a new Team module and a Team-Member relation model because the existing member table fields `team_id` and `role_id` must not be used as the new membership source.

## Unavailable / Partial Sources

| source area | status | detail | planned handling |
|---|---|---|---|
| Team backend module | unavailable | No complete `TeamController`, `TeamService`, `TeamRepositoryPort`, `TeamRepositoryAdapter`, `TeamMapper`, `TeamDtos`, `Team`, or `TeamMember` was identified in current source. | Treat as to-be-created in implementation plan. |
| Team frontend module | unavailable | No complete `TeamPage.tsx` or `endpoints.teams.*` was identified. | Treat as to-be-created following Organization/Customer page/API patterns. |
| `tbl_team_member` | unavailable | Required by spec but no migration/table was identified. | Add migration and mapping plan. |
| Role/member lookup API for Team detail | to-be-created | Source has `tbl_dim_role` and `tbl_dim_member_pseudonym`, and project owner selected option A: implement minimal lookup endpoints within TEAM scope. | Add minimal read-only lookup support for selectable active members and roles; do not expand into member/role master management. |
| Team Code unique scope | partially available | Spec says unique by defined scope; current source has no Team code implementation. | Plan global active Team Code uniqueness unless product/data owner changes it before implementation. |
| `tbl_dim_team.project_id` removal impact | partially available | Spec resolves removal from Team schema, but existing migration and index reference it. Other metric tables may reference `team_id`. | Verify dependencies before writing migration; avoid destructive change without review. |
| Runtime test verification | unavailable in this phase | Phase 3 creates docs only; no code/test run is required. Prior sandbox had missing `mvn` and FE optional dependency/permission issue. | Keep all test status as planned/not run until test phase. |

## Risk Before Implementation

| risk | severity | evidence | mitigation |
|---|---|---|---|
| DB migration can break legacy references to `tbl_dim_team.project_id` or `idx_team_project` | high | `V4__init_shema_v2.sql` defines `project_id` and `idx_team_project`; spec says remove `project_id`. | Inspect all SQL/mapper references before migration; prefer additive changes except confirmed safe drop. |
| TEAM requires member/role lookup endpoint to be added | low/medium | Spec requires adding existing member and role from `tbl_dim_role`; project owner selected option A for minimal lookup support. | Implement minimal read-only lookup endpoints in TEAM scope; reject expansion into member/role master management. |
| Auth standards drift from source | medium | Standards/architecture mention session cookie; source uses bearer token and `CurrentUser`. | Follow current source for implementation; document drift and do not rework global auth in TEAM. |
| Admin authorization must not rely only on `SecurityConfig` | high | `SecurityConfig` only authenticates `anyRequest`; Organization/Customer services enforce ADMIN. | Implement `requireAdmin(caller)` inside Team service for all use cases. |
| i18n coverage can be incomplete | medium | Spec requires `ja`, `vi`, `en` labels/messages/errors. | Add locale keys in all three files and include i18n checklist/test cases. |
| Unique active membership can be enforced only in app layer if DB index is missed | high | AC-TEAM-13/14 require strict one active membership per Team/member. | Enforce both service-level check and DB partial unique index where supported. |

## Required Human Decision

| ID | decision | current status | required before code? |
|---|---|---|---|
| HD-TEAM-1 | Does Team manage Team-Project assignment? | Resolved: No | No |
| HD-TEAM-2 | Can one member belong to multiple Teams? | Resolved: Yes | No |
| HD-TEAM-3 | How many active roles can a member have in one Team? | Resolved: One | No |
| HD-TEAM-4 | Which role source is used? | Resolved: `tbl_dim_role` | No |
| HD-TEAM-5 | Is `tbl_team_member` required? | Resolved: Yes | No |
| HD-TEAM-6 | Is Team/member removal physical delete? | Resolved: No, soft delete/inactive | No |
| HD-TEAM-7 | Can Team Code be edited after creation? | Resolved: Yes, with uniqueness check | No |
| HD-TEAM-8 | Should deleting Team inactive memberships? | Resolved: Yes | No |
| HD-TEAM-9 | Migrate legacy `tbl_dim_member_pseudonym.team_id/role_id`? | Resolved: No | No |
| HD-TEAM-10 | Add Team-specific audit log module? | Resolved: No | No |
| HD-TEAM-11 | Remove `tbl_dim_team.project_id`? | Resolved in spec, but implementation safety check needed | Yes, if destructive migration is proposed |
| HD-TEAM-12 | Add detailed Team-specific permission model? | Resolved: No, ADMIN only | No |
| HD-TEAM-13 | Business error translation owner | Resolved: BE returns code, FE translates | No |
| HD-TEAM-14 | Member/role lookup approach | Resolved: implement minimal lookup endpoints within TEAM scope | No |
