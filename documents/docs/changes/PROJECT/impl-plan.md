# Implementation Plan

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## 1. Implementation Principle

- Implement only Project Management scope from `spec-pack.md`.
- Use existing `tbl_dim_project` and `tbl_project_team`; do not rename, drop, recreate, or replace them.
- Keep UI label `Project name` mapped to DB field `project_alias`.
- Add DB changes through a new Flyway migration only if later implementation proves they are needed; do not edit V4/V120/V140 migrations.
- Follow BE hexagonal architecture:
  - web/controller -> application/use case -> persistence port -> infrastructure adapter/mapper -> DB.
  - web/application must not directly depend on infrastructure.
- Preserve current page DTO contract style for list responses: `items/page/size/totalElements/totalPages`.
- Enforce the approved Project-specific deviations:
  - no `version` in request contracts,
  - soft delete route is `PUT /api/v1/projects/{id}/delete`,
  - Project-Team assignment uses `tbl_project_team`,
  - `project_type` is free-text nullable and normalized with trim-to-null behavior.
- Use FE translations from `public/locales/{en,ja,vi}/locale.json`; do not hard-code user-facing Project text.
- Use `EDCAP_FE/src/lib/api.ts` typed endpoint helpers for Project API calls.
- Preserve existing traceId/error logging behavior. Dedicated audit-log storage is out of scope.
- Keep the plan aligned to observed repo truth; do not invent runtime/OpenAPI/test-environment facts not found in source.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| API-A | Follow governance mutation convention with `version` and `PATCH /delete` | Matches Organization/Customer/Team | Explicitly rejected by ticket decision | Reject |
| API-B | Use approved Project contract: no `version`, `PUT /delete` | Matches ticket decision and current spec | Deviates from governance mutation defaults | Select |
| REL-A | Model Project-Team through direct `tbl_dim_team.project_id` ownership | Simpler mental model | Conflicts with `V140` and approved ticket decision | Reject |
| REL-B | Model Project-Team through `tbl_project_team` | Matches `V120`, `V140`, and ticket decision | Requires explicit sync logic | Select |
| TYPE-A | Treat `project_type` as free text because the DB column is `VARCHAR(100)` | Matches schema and updated ticket rule | Requires length/blank normalization | Select |
| TYPE-B | Constrain `project_type` to `severity_level` values | Reuses existing FE option pattern | Conflicts with updated ticket rule | Reject |
| AUTH-A | Invent new permission-key model | Could be more granular | Out of scope and not approved | Reject |
| AUTH-B | Use role-based authorization aligned to `tbl_dim_role` guidance | Matches ticket decision | Exact enforcement detail still needs implementation design | Select |

## 3. Reason for Choosing the Alternative Plan

The selected approach minimizes contract drift from the approved `PROJECT` spec:

- The mutation contract is intentionally simpler than other governance modules, so the implementation plan must preserve that rather than normalize it away.
- The Team relationship must follow the bridge-table model because `V140__team_management.sql` removes `project_id` from `tbl_dim_team`.
- `project_type` is intentionally free-text nullable in this ticket; implementation and review must not drift back to enum/select semantics.
- Role-based authorization should stay aligned with current repo auth/role context instead of introducing a new permission system during Project Management work.
- Current migrations already encode most of the required data model, so the default path is to implement on top of the existing schema first and only introduce a new migration if a real gap is discovered.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V{next}__*.sql` | Add any required Project-specific additive DB changes only if later implementation proves gaps remain | Preserve schema safety; no edits to V4/V120/V140 | AC-PROJECT-3..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Project*.java` | Add governance-side Project domain model(s) if needed | Backend domain representation | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ProjectRepositoryPort.java` | Add persistence port | Hexagonal architecture | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/.../ProjectService.java` | Add Project business rules/use case | Validation, duplicate handling, Team sync, soft delete, auth | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/ProjectRepositoryAdapter.java` | Add repository adapter | Port implementation | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/ProjectMapper.java` | Add MyBatis mapper interface | DB access abstraction | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/resources/mapper/ProjectMapper.xml` | Add Project SQL queries and commands | List/detail/create/update/delete/team sync | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` or equivalent | Add request/response DTOs | API contract | AC-PROJECT-1..12 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Add REST endpoints | API surface | AC-PROJECT-1..12 |
| `EDCAP_FE/src/lib/api.ts` | Add Project types and endpoint helpers | FE API contract | AC-PROJECT-1..12 |
| `EDCAP_FE/src/App.tsx` | Add Project route and chosen access behavior | FE routing/auth | AC-PROJECT-1, AC-PROJECT-10 |
| `EDCAP_FE/src/components/Layout.tsx` | Add Project nav item if required | FE navigation | AC-PROJECT-1 |
| `EDCAP_FE/src/pages/ProjectPage.tsx` or `src/pages/projects/*` | Add list/form/detail/delete UI | Main FE implementation | AC-PROJECT-1..12 |
| `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Add Project locale keys | i18n | AC-PROJECT-1..12 |
| `docs/changes/PROJECT/test-results.md` | Update after execution | Verification evidence | AC-PROJECT-1..12 |
| `docs/changes/PROJECT/self-review.md` | Update after self-review | Review evidence | AC-PROJECT-1..12 |
| `docs/changes/PROJECT/report.md` | Update after completion | Handoff/report evidence | AC-PROJECT-1..12 |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `ProjectController.list` | add | query params: keyword/customerId/status/page/size | Project page response DTO | Keep governance-style paging |
| `ProjectController.get` | add | `projectId` UUID | Project detail DTO | Includes current Team assignments |
| `ProjectController.create` | add | create request DTO | created Project DTO | No `version` in request |
| `ProjectController.update` | add | `projectId` UUID + update request DTO | updated Project DTO | No optimistic-lock field |
| `ProjectController.softDelete` | add | `projectId` UUID | deleted Project DTO or success response | Route fixed to `PUT /{id}/delete` |
| `ProjectService.search/list` | add | filter criteria | projects | Default active list |
| `ProjectService.create` | add | customer/alias/type/risk/teamIds/caller | created Project | Validates duplicate alias and Team references |
| `ProjectService.update` | add | id, fields, teamIds, caller | updated Project | Reconciles Team bridge rows |
| `ProjectService.softDelete` | add | id, caller | deleted Project or result | Soft delete only |
| `ProjectRepositoryPort` | add | repository method signatures | domain models/results | Do not expose MyBatis types upward |
| `ProjectRepositoryAdapter` | add | port inputs | domain models/results | Delegates to mapper |
| `ProjectMapper` / XML | add | MyBatis params | rows/affected count | Must include Project + Team bridge operations |
| `endpoints.projects.list` | add | filter params | typed Project page response | Use `api.get` |
| `endpoints.projects.get` | add | id | Project detail type | New helper |
| `endpoints.projects.create` | add | create request | Project type | New helper |
| `endpoints.projects.update` | add | id + update request | Project type | New helper |
| `endpoints.projects.softDelete` | add | id | response | Must use `api.put`, not `api.patch` |
| Project page handlers | add | UI events | API calls/mutations | Use TanStack Query pattern |

Patterns that must not be copied blindly:

- governance update/delete handlers that require `version`
- `PATCH /delete` or physical `DELETE`
- Team persistence paths depending on `tbl_dim_team.project_id`
- FE direct `fetch` bypassing `EDCAP_FE/src/lib/api.ts`

## 6. SQL / Query / Repository Policy

- New SQL must target `tbl_dim_project` and `tbl_project_team`.
- Do not use physical `DELETE FROM tbl_dim_project` for the user-facing delete action.
- Do not assume `tbl_dim_team.project_id` exists; `V140` removes it.
- Default list should filter non-deleted active Projects.
- Duplicate alias checks must follow V120 semantics:
  - compare normalized alias using trim/lower rules,
  - scope uniqueness to active/non-deleted rows within the same customer.
- Team sync should reconcile active `tbl_project_team` rows to match submitted `teamIds`.
- Queries for detail/list should join Customer name and current Team data as needed by the approved DTO shape.
- If authorization logic requires role lookup, keep it explicit and reviewable.
- Any new migration must be additive and documented with rollback limitations.

## 7. Validation / Error / Logging Policy

Validation policy:

- `customerId` required and must resolve to a valid/allowed Customer.
- `projectAlias` required, trimmed, non-blank, and bounded by DB/API rules.
- `projectType`, if provided, is trimmed free text with a maximum of 100 characters; blank normalizes to `null`.
- `riskLevel`, if provided, should align to `severity_level`.
- `teamIds`, if provided, must resolve to valid/allowed Teams.
- No `version` validation is part of the Project contract.
- Duplicate handling must reflect normalized active uniqueness, not raw string comparison only.

Error policy:

- Use standard `ErrorResponse(timestamp,status,error,message,traceId)`.
- Duplicate active alias target behavior is HTTP 409.
- Missing/invalid input is HTTP 400.
- Missing/deleted Project in normal flow is HTTP 404.
- Authorization failures are HTTP 403 with standard error shape.
- Do not expose stack traces or internal SQL details.

Logging/operation policy:

- Preserve existing `TraceIdFilter` and MDC behavior.
- Log enough context to troubleshoot create/update/delete and Team-sync outcomes with traceId.
- Do not log secrets or unnecessary PII.
- Dedicated audit-log storage remains out of scope.

## 8. Migration / Rollback Policy

- Do not edit committed migrations `V4`, `V120`, or `V140`.
- Any new schema change must be additive and must preserve existing Project/Team/Customer/Role table identity.
- Prefer no new migration unless implementation discovers a concrete schema gap.
- Rollback should favor app-code rollback over destructive DB rollback.
- If a new index/column causes rollout issues, use a targeted corrective migration rather than mutating history.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Reconfirm Project contract and open issues | `spec-pack.md`, `ticket-rules.md`, this plan | No unresolved blocker for route/no-version/team sync/type mapping | Stop if contract is changed |
| 2 | Assess whether a new migration is actually needed | migration inventory + schema | Clear go/no-go on DB change necessity | Stop if proposed change requires editing old migrations |
| 3 | Add BE domain/port/repository/mapper skeleton | BE domain/application/infrastructure files | Compile; architecture remains clean | Stop if layer violation appears |
| 4 | Implement BE read path first | mapper/repository/service/controller list-detail path | List/detail path is reviewable and returns required data | Stop if Customer/Team joins reveal schema misunderstanding |
| 5 | Implement BE create/update rules | service, DTOs, repository write logic | Validation, duplicate handling, Team sync, and no-`version` contract are covered | Stop if auth or schema assumptions become invalid |
| 6 | Implement BE soft delete | controller/service/repository delete path | `PUT /delete` updates soft-delete state only | Stop if delete flow pressures a different endpoint model |
| 7 | Add FE API types/helpers | `EDCAP_FE/src/lib/api.ts` | Typecheck and endpoint contract alignment | Stop if helper contract diverges from BE |
| 8 | Add FE route/nav/page | FE route/layout/pages | Manual flows and guards behave as intended | Stop if route/auth behavior becomes ambiguous |
| 9 | Add locale keys | `public/locales/{en,ja,vi}/locale.json` | Keys resolve, no mojibake | Stop if wording is still ambiguous |
| 10 | Execute tests and black-box checks | BE/FE/test artifacts | AC table can be marked with evidence | Stop if blocker AC fails |
| 11 | Update evidence artifacts | `test-results.md`, `report.md`, `self-review.md` | Final evidence and risks recorded | Stop if docs and implementation diverge |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| 1 | Review decisions table and open items | No contract blocker remains |
| 2 | Compare required behavior against V4/V120/V140 schema | Migration need is explicit and justified |
| 3 | Build/compile and architecture checks | No package/layer violation |
| 4 | Repository/mapper review and tests | SQL matches approved Project list/detail and relation behavior |
| 5 | Service/API tests | Create/update validation, duplicate rules, and Team sync behave correctly |
| 6 | Manual/API contract checks | `PUT /delete` works and no physical delete or `version` dependency appears |
| 7 | FE typecheck/build | Helpers compile and align to API shape |
| 8 | Manual browser checks | Route, list, form, delete, and guard behavior works |
| 9 | Locale parse and UI smoke | No raw keys or mojibake |
| 10 | Run planned tests | Evidence exists for AC coverage |
| 11 | Artifact review | Implementation, tests, gaps, and risks are traceable |

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-PROJECT-1 | FE route/page, BE list API, default active filter | Admin/allowed user sees active Projects by default |
| AC-PROJECT-2 | FE empty state handling | Empty list renders safely |
| AC-PROJECT-3 | Create API/service/SQL + FE create form | Valid create persists Project and optional Team mappings |
| AC-PROJECT-4 | FE/BE validation | Blank alias rejected |
| AC-PROJECT-5 | Service duplicate check + V120 uniqueness | Duplicate active alias rejected |
| AC-PROJECT-6 | Detail API/service/joins + FE detail view | Detail includes Team assignments and audit data |
| AC-PROJECT-7 | Update API/service/SQL + FE edit form | Valid update persists latest Project data |
| AC-PROJECT-8 | Not-found/deleted handling | Missing/deleted Project rejected in normal flow |
| AC-PROJECT-9 | Soft-delete endpoint and SQL update only | `PUT /delete` sets deleted state; no physical delete |
| AC-PROJECT-10 | FE/BE role-based authorization | Unauthorized caller is rejected |
| AC-PROJECT-11 | Team sync through `tbl_project_team` | Active mapping set matches submitted Teams |
| AC-PROJECT-12 | Standard error envelope and traceId | API errors keep standard shape |

## 12. Stop / Ask Condition

- Stop if implementation would require `version` despite the approved contract.
- Stop if Team assignment cannot be safely modeled through `tbl_project_team`.
- Stop if role-based authorization needs a broader auth redesign outside ticket scope.
- Stop if a new requirement tries to turn `project_type` back into an enum/select/master-data field without a ticket/spec change.
- Stop if implementation would require renaming/recreating existing Project/Team/Customer/Role tables.
- Stop if a future requirement introduces restore/import/export/batch behavior into the same ticket.
- Stop if FE route/nav integration would require a wider UI architecture rewrite outside Project scope.

## 13. Do Not Do This Ticket

- Do not implement Organization, Customer, Team-member, connector, or dashboard features beyond what Project depends on.
- Do not rework the repo-wide auth model.
- Do not reintroduce governance optimistic locking for Project.
- Do not use physical delete.
- Do not edit old migrations.
- Do not implement restore/import/export/bulk-edit/batch-job flows.
- Do not assume `project_type` is enum-backed, select-only, or sourced from master data unless the ticket changes.

## 14. Open Related Issues

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-PH3-PROJECT-001 | Exact role-to-action enforcement details are not yet observable from source | Authorization implementation detail | Lock during BE service/controller implementation |
| OI-PH3-PROJECT-002 | Final DTO field names for Project detail/list are not yet implemented | FE/BE contract detail | Finalize during API/DTO implementation while staying inside spec |
| OI-PH3-PROJECT-003 | `project_type` semantic naming is non-obvious because the field name can still be mistaken for categorized master data even though the approved contract treats it as free-text nullable | UX/API clarity risk | Keep explicit mapping notes and review focus |
| OI-PH3-PROJECT-004 | Customer/Team active-state filtering assumptions may still need early runtime validation | Query/validation risk | Validate during backend read-path implementation |
