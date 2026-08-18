# Source Availability

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Raw ticket input | `docs/changes/PROJECT/01_raw-input.md` | Read | Medium | Ticket author | Capture requested business behavior | May conflict with repo conventions or naming | Reconcile through `spec-pack.md`, not direct implementation |
| Source log | `docs/changes/PROJECT/sources.md` | Read | High | Ticket owner | Provenance and evidence log | If stale, assumptions can look stronger than they are | Keep in sync when new sources are read |
| Spec pack | `docs/changes/PROJECT/spec-pack.md` | Read | High | Ticket owner | Canonical requirement source | Later docs may drift if not cross-checked | Treat as source of truth for AC/scope |
| Context | `docs/changes/PROJECT/context.md` | Read | High | Ticket owner | Implementation bridge to repo reality | Can become stale if code evolves | Validate against observed source before coding |
| Ticket rules | `docs/changes/PROJECT/ticket-rules.md` | Read | High | Ticket owner | Guardrails and approved deviations | Highest risk is being ignored during coding | Repeat in impact and impl docs |
| Impl plan draft | `docs/changes/PROJECT/impl-plan.md` | Read | High | Ticket owner | Phase 3 implementation handoff | Must stay aligned with spec and context | Keep synchronized with later evidence |
| Architecture docs | `docs/architecture/*` | Partial | Medium | Architecture owner | Route/service/repository/test context | Some maps may lag code | Use as support, prefer code when conflicts appear |
| Standards docs | `docs/standards/*` | Read | High | Engineering standards owner | Repo standards and artifact structure | Generic standards can hide ticket-specific deviations | Follow structure only where generic |
| Ticket templates | `docs/standards/templates/_ticket-template/*` | Read | High | Engineering standards owner | Required file/section structure | Template does not carry Project-specific decisions | Use structure, not default semantics |
| Claude rules | `.claude/rules/*` | Partial | Medium | Repo governance owner | Additional repo-specific constraints | Some rules are broad and not Project-specific | Apply only where supported by source |
| FE app routing | `EDCAP_FE/src/App.tsx` | Read | High | FE codebase | Existing route and guard pattern | No current Project route exists | Use as reference only |
| FE API layer | `EDCAP_FE/src/lib/api.ts` | Read | High | FE codebase | Canonical HTTP helper and endpoint pattern | `endpoints.projects.*` does not exist yet | Extend this layer; no direct `fetch` |
| FE auth hook | `EDCAP_FE/src/hooks/useAuth.ts` | Read | High | FE codebase | Existing session/auth usage | Does not encode Project action rules | Reuse only for auth/session pattern |
| FE governance modules | `EDCAP_FE/src/features/admin/**` and related pages | Partial | High | FE codebase | Reference list/form/query patterns | Most modules assume governance defaults such as `version`/PATCH delete | Reuse structure selectively |
| BE controller/service patterns | Organization / Customer / Team code | Partial | High | BE codebase | Reference CRUD layering and DTO/service structure | Existing modules use optimistic locking/delete semantics different from Project | Reuse layering, not contract defaults |
| BE error contract | `ErrorResponse`, `GlobalExceptionHandler` | Read | High | BE codebase | Standard error envelope and exception mapping | Docs can drift from actual fields | Use observed code fields only |
| BE security / resolver | Security config and current-user resolver classes | Partial | High | BE codebase | Authorization and caller-context pattern | Exact Project role-to-action mapping is not yet encoded | Keep as stop/ask condition during coding |
| DB base schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Read | High | DB history | Base schema truth for Project table and enum | Historical schema alone is insufficient without later migrations | Cross-check with V120/V140 |
| DB Project migration | `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql` | Read | High | DB history | Project soft delete, uniqueness, Team bridge | Could be ignored if implementer copies old assumptions | Treat as direct schema truth |
| DB Team migration | `EDCAP_BE/src/main/resources/db/migration/V140__team_management.sql` | Read | High | DB history | Team schema changes affecting Project relation | Old assumptions about `tbl_dim_team.project_id` will be wrong | Treat bridge table as sole relation source |
| Existing tests | FE/BE test directories | Partial | Medium | Codebase | Reuse testing style and infra | No Project-specific coverage exists yet | Plan new tests explicitly |
| Organization Phase 3 docs | `docs/changes/ORGANIZATION/*` | Read | Medium | Prior ticket owner | Reference for depth and structure | Contains governance defaults not approved for Project | Copy structure only |

## Summary

The current source set is sufficient to complete Phase 3 planning and hand off implementation without reopening the core Project contract. The main gaps are expected runtime gaps: Project-specific code, tests, and any generated API/runtime snapshots are not present yet.

Human decisions already resolved in available sources:

- no `version`
- `PUT /api/v1/projects/{id}/delete`
- Team sync through `tbl_project_team`
- authorization direction aligned to `tbl_dim_role`
- `project_type` is free-text nullable and stored in `VARCHAR(100)`

## Unavailable / Partial Sources

| source | status | why partial or unavailable | impact |
|---|---|---|---|
| Project implementation classes and pages | Unavailable | Feature is not implemented yet | Expected; captured as missing files and direct impact surface |
| Runtime OpenAPI / generated API client | Unavailable | Not observed in repo ticket sources | Do not claim generated contract coverage |
| Running DB schema snapshot | Unavailable | Only migration source was reviewed | Base decisions on migration truth only |
| Exact Project role-action mapping | Partial | Direction via `tbl_dim_role` is confirmed, but enforcement detail is not yet implemented | Keep stop/ask condition during coding |
| Governance reference modules | Partial | Strong structural reference, but semantics differ | Reuse carefully; do not inherit defaults |

## Risk Before Implementation

| risk | level | description | mitigation |
|---|---|---|---|
| Governance-default drift | High | Implementer may reintroduce `version` or PATCH delete because other modules use them | Encode deviations repeatedly in plan, tests, review |
| Wrong Team relation model | High | Implementer may depend on removed `tbl_dim_team.project_id` | Keep V140 + `tbl_project_team` rule explicit |
| `project_type` contract drift | Medium | Older docs/tests assumed severity-based values while current ticket treats it as free text | Keep docs/tests aligned to free-text nullable behavior |
| Auth enforcement detail gap | Medium | `tbl_dim_role` direction is approved, but exact coding rule is not prebuilt | Keep stop/ask condition narrow and visible |
| Stale docs vs code | Medium | Some docs may not match actual helper/envelope behavior | Prefer observed source over older docs |

## Required Human Decision

No additional human decision is blocking Phase 3 planning.

Items that still require implementation attention, but not a spec reopen:

- Exact mapping from `tbl_dim_role` records to Project actions
- Final FE menu placement for Project screens
- Whether later coding reveals a real need for a new additive migration
