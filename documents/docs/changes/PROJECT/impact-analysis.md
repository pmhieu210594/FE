# Impact Analysis

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## 1. Change Content

This ticket adds Project Management CRUD on top of the existing schema and repo conventions, while preserving approved deviations from the governance defaults.

Change content included in this ticket:

- Project list/detail/create/update/delete API surface
- Project FE list/detail/form/delete flows
- Team assignment sync through `tbl_project_team`
- role-based authorization direction aligned to `tbl_dim_role`
- no-`version` mutation contract
- delete route fixed to `PUT /api/v1/projects/{id}/delete`
- `project_type` value handling changed to free-text nullable while `riskLevel` stays aligned to `severity_level`

Out of scope:

- physical delete
- restore/import/export/bulk edit
- batch/job/event work
- repo-wide auth redesign
- redesign of Organization/Customer/Team governance contracts

## 2. Directly Affected Files

| area | file or file group | expected action | why directly affected |
|---|---|---|---|
| Ticket docs | `docs/changes/PROJECT/source-availability.md` | Add | Phase 3 evidence |
| Ticket docs | `docs/changes/PROJECT/source-inventory.md` | Add | Phase 3 evidence |
| Ticket docs | `docs/changes/PROJECT/impact-analysis.md` | Add | Phase 3 evidence |
| Ticket docs | `docs/changes/PROJECT/impl-plan.md` | Update | Phase 3 handoff plan |
| FE API | `EDCAP_FE/src/lib/api.ts` | Modify | Add Project endpoint helpers/types |
| FE routing | `EDCAP_FE/src/App.tsx` | Modify | Add Project routes/guards |
| FE screens | Project page/component files under `EDCAP_FE/src/**` | Add | Implement Project UI flows |
| FE locale/nav | locale/menu/layout files if needed | Modify/Add | User-facing entry points and text |
| BE controller | `ProjectController` | Add | New Project API routes |
| BE DTOs | Project request/response/page DTO files | Add | Contract implementation |
| BE service | `ProjectService` and related use-case classes | Add | Validation, auth, Team sync |
| BE persistence port/adapter | Project repository port/adapter | Add | Persistence abstraction |
| BE mapper/SQL | `ProjectMapper`, `ProjectMapper.xml` or equivalent | Add | Query/update Project and bridge data |
| BE security integration | Project-specific enforcement points | Modify/Add | Align access to current role direction |
| DB migration | `V{next}__*.sql` only if needed | Maybe Add | Current schema appears mostly sufficient |
| Tests | FE/BE Project test files | Add | Coverage for CRUD/auth/validation/sync |

## 3. Indirectly Affected Files

| area | file or file group | indirect effect |
|---|---|---|
| FE shared layout | shared menu/layout components | May need Project entry visibility |
| FE auth/session | `useAuth.ts` and guard wrappers | Reused by Project routes |
| BE security config | security configuration / current-user resolver | Existing patterns referenced by Project endpoints |
| Customer/Team modules | lookup/list endpoints or DTOs | Used as dependencies for Project option/validation logic |
| Architecture docs | route/service/repository/test maps | May need refresh after implementation lands |
| Review/test artifacts | checklist/test/report files | Updated later with implementation evidence |

## 4. Caller / Callee

Primary call chain:

`route/menu -> Project page -> FE API helper -> ProjectController -> ProjectService -> ProjectRepositoryPort -> ProjectRepositoryAdapter -> mapper/SQL -> tbl_dim_project / tbl_project_team`

Supporting chains:

- Project create/update -> Customer validation lookup
- Project create/update -> Team validation and bridge sync
- Project route access -> auth guard/current user -> Project authorization
- Project delete -> service soft delete -> active uniqueness remains governed by V120 conditions

Do-not-assume callees:

- nonexistent `ProjectController`/`ProjectService` before implementation
- `tbl_dim_team.project_id` as current Team relation source
- governance delete/version handlers as-is

## 5. FE Impact

Frontend impact is medium to high because Project screens and endpoint helpers do not exist yet.

Expected FE impact:

- Add Project routes and guard integration
- Add `endpoints.projects.*` or equivalent typed helpers in `lib/api.ts`
- Add list/detail/create/edit/delete UI
- Bind fields for `projectAlias`, `customerId`, `projectType`, `riskLevel`, `teamIds`
- Load customer/team options from existing APIs
- Use standard API error handling through `ApiError`
- Ensure delete flow uses `PUT /api/v1/projects/{id}/delete`

Explicit non-impact:

- No batch/import/export UI
- No FE-specific permission-role model redesign

## 6. BE Impact

Backend impact is high because Project runtime code is not present yet.

Expected BE impact:

- Add Project CRUD controller endpoints
- Add Project DTOs without `version`
- Add service validation for customer existence, alias uniqueness, enum mapping, Team sync
- Add repository queries/commands for list/detail/create/update/soft delete
- Add bridge-table synchronization logic for `tbl_project_team`
- Reuse standard `ErrorResponse` and global exception mapping
- Add Project auth checks aligned to `tbl_dim_role`

Explicit non-impact:

- No batch/job/event implementation
- No broad auth model rewrite

## 7. API Contract Impact

Project introduces a new API contract and must remain internally consistent across FE, BE, tests, and docs.

Approved endpoints:

- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `POST /api/v1/projects`
- `PUT /api/v1/projects/{id}`
- `PUT /api/v1/projects/{id}/delete`

Approved request direction:

- `customerId`
- `projectAlias`
- optional `projectType`
- optional `riskLevel`
- optional `teamIds`
- explicitly no `version`

Response direction:

- list page DTO with governance-style paging metadata
- detail DTO including Customer and Team assignment data needed by FE
- standard `ErrorResponse`

Contract drift to prevent:

- adding `version`
- switching delete to `PATCH` or `DELETE`
- returning ad hoc error envelopes

## 8. DTO / Schema / Validation Impact

Validation and DTO design are directly shaped by current schema plus approved deviations.

Direct impacts:

- `projectAlias` is required and participates in normalized active uniqueness
- duplicate check must reflect V120 active uniqueness semantics
- `customerId` must resolve to valid Project parent data
- `projectType` is free-text nullable user input rendered as raw text
- `riskLevel` uses `severity_level`
- `teamIds` are optional but, when supplied, must sync to `tbl_project_team`
- delete remains soft delete only

Schema interpretation rules:

- `tbl_dim_project` is the root table
- `tbl_project_team` is the source of truth for Team assignment
- `tbl_dim_team.project_id` must not be reintroduced as a dependency

## 9. DB / Migration Impact

Current migrations already provide most of the required schema:

- V4 defines `tbl_dim_project` and `severity_level`
- V120 adds soft delete, active uniqueness, and `tbl_project_team`
- V140 removes Team direct Project ownership

Expected DB impact:

- read/write on `tbl_dim_project`
- read/write on `tbl_project_team`
- read dependency on `tbl_dim_customer`
- read dependency on `tbl_dim_team`
- directional auth dependency on `tbl_dim_role`

Migration policy impact:

- prefer no new migration
- add one only if implementation proves a real gap
- any new migration must be additive and rollback-aware

## 10. Batch / Job / Event Impact

No direct impact is expected for batch, scheduled jobs, async workers, or events.

This judgment is based on the current scope and the absence of any Project batch/event requirement in the approved spec.

## 11. Test Impact

Expected test impact:

- BE unit tests for validation/auth logic
- BE integration/API tests for CRUD and error responses
- DB-oriented verification for uniqueness and Team bridge sync
- FE unit/component tests for list/detail/form/delete
- FE route/guard behavior checks
- black-box scenarios for normal/error/boundary flows
- contract checks confirming no `version` leaks into Project payloads

## 12. Operation / Monitoring Impact

Operational impact is moderate because new endpoints and UI flows are added.

Key considerations:

- preserve trace correlation via `traceId`
- watch 4xx validation/auth failure rates
- watch duplicate-alias conflicts
- watch Team-sync failures or partial-write symptoms
- avoid logging secrets or unnecessary PII

## 13. Rollout / Rollback Impact

Rollout is primarily application rollout unless a later implementation adds a migration.

Guidance:

- verify FE/BE contract alignment before release
- if a new migration appears later, keep it additive and backward-aware
- application rollback is simpler than DB rollback
- do not assume destructive DB rollback is acceptable

## 14. Areas Determined to be Unaffected and Based on

| unaffected area | basis |
|---|---|
| Batch/job/event subsystems | No requirement or observed Project async dependency |
| Connectors/webhooks | No source indicates Project integration changes |
| Import/export/restore | Explicitly out of scope |
| Unrelated governance domains | Used only as dependencies, not redesign targets |
| Physical delete flow | Ticket and schema direction are soft delete only |

## 15. Required Options

| topic | selected option | rationale |
|---|---|---|
| Concurrency contract | No `version` | Approved ticket deviation |
| Delete contract | `PUT /api/v1/projects/{id}/delete` | Explicit ticket confirmation |
| Team relation model | `tbl_project_team` bridge | Required by V120 and V140 reality |
| Authorization direction | Align to `tbl_dim_role` | Approved ticket direction |
| `project_type` value source | Free-text nullable user input bounded by V4 `VARCHAR(100)` | Approved ticket direction aligned to `spec-pack.md` |

## 16. Human Decision Required

No additional human decision is required to finish Phase 3 planning.

Stop and ask later only if:

- auth code cannot safely express Project access using the current `tbl_dim_role` direction
- Team runtime logic conflicts with `tbl_project_team` as source of truth
- stale severity-based wording for `project_type` causes FE/BE/doc contract drift
- implementation unexpectedly requires `version`

## 17. Risk Summary

| risk | level | why it matters | control |
|---|---|---|---|
| Governance-default drift | High | Would immediately violate approved Project contract | Repeat deviations in plan/tests/review |
| Wrong Team persistence model | High | Would break correctness after V140 | Keep bridge-table-only rule explicit |
| Auth detail gap | Medium | Could block secure endpoint completion | Keep narrow stop/ask condition |
| `project_type` naming confusion | Medium | Can mislead DTO/UI validation into enum-style handling | Document and test free-text nullable mapping |
| Overstated runtime assumptions | Medium | Would weaken planning reliability | Mark unknowns clearly |
