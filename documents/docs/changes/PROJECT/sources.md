# PROJECT Sources

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## 1. Source policy

- `docs/changes/PROJECT/spec-pack.md` is the intended single source of truth after Phase 1.
- This file records provenance only: what was read, what was inferred, and what is still missing.
- When raw input conflicts with observed source, the spec pack must record both and surface the gap explicitly.

## 2. Source inventory

| Area | Source | Status | Trust | Type | Notes |
|---|---|---|---|---|---|
| Ticket input | `docs/changes/PROJECT/01_raw-input.md` | Read | Medium | Requested behavior | Primary business input for this phase. File encoding is garbled in terminal output, but content is still usable. |
| UI sketch | `docs/changes/PROJECT/wireframe.md` | Read | Medium | Requested behavior | Gives intended list/form/detail layout and filter hint. |
| Spec template | `docs/standards/templates/_ticket-template/spec-pack.md` | Read | High | Process standard | Mandatory section structure for `spec-pack.md`. |
| Source availability guidance | `docs/standards/automation/source-availability-template.md` | Read | High | Process standard | Used to classify evidence and unknowns. |
| Architecture overview | `docs/architecture/overview.md` | Partial | Medium | Repo context | General architecture reference; not project-feature specific. |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | Read | High | Observed source summary | Confirms current API contract conventions, known mismatches, and planning posture. |
| DB/repository map | `docs/architecture/repository-db-map.md` | Partial | High | Observed source summary | Confirms V4 schema exists and highlights older stale descriptions that must not be copied blindly. |
| Test map | `docs/architecture/test-map.md` | Partial | High | Observed source summary | Confirms test landscape and gaps relevant for Project feature planning. |
| API contract standard | `docs/standards/api-contract.md` | Read | Medium | Repo standard | Describes preferred `/api/v1` shape, but some parts are stale versus current governance modules. |
| Security standard | `docs/standards/security.md` | Read | Medium | Repo standard | Useful for auth/error/privacy expectations; contains stale `ErrorResponse` fields. |
| Testing standard | `docs/standards/testing.md` | Read | Medium | Repo standard | Defines expected BE/FE test styles. |
| Architecture rules | `.claude/rules/20-architecture.md` | Read | High | Automation rule | Confirms layer boundaries and FE data access rules. |
| Security rules | `.claude/rules/30-security.md` | Read | Medium | Automation rule | Confirms centralized error handling rule, but field naming is stale versus code. |
| Testing rules | `.claude/rules/40-testing.md` | Read | High | Automation rule | Confirms minimum expectations for new test coverage. |
| V4 base schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Relevant part read | High | Observed source | Confirms `record_status`, `severity_level`, `tbl_dim_project`, and original `tbl_dim_team` shape. |
| Project migration | `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql` | Read | High | Observed source | Confirms Project soft-delete columns, active-row uniqueness index, and `tbl_project_team` many-to-many bridge table. |
| Organization REST pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Read | High | Observed source | Confirms list/detail/create/update/delete route pattern. |
| Customer REST pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/CustomerController.java` | Read | High | Observed source | Confirms page DTO shape and `PATCH /{id}/delete` pattern with `version`. |
| Team REST pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | Read | High | Observed source | Confirms option/detail patterns and optimistic locking on governance entities. |
| Organization DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/OrganizationDtos.java` | Read | High | Observed source | Confirms `items/page/size/totalElements/totalPages` page contract and `version` field. |
| Customer DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/CustomerDtos.java` | Read | High | Observed source | Confirms customer page/detail field patterns. |
| Team DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Read | High | Observed source | Confirms detail + option DTO patterns and member handling. |
| Team SQL mapper | `EDCAP_BE/src/main/resources/mapper/TeamMapper.xml` | Read | High | Observed source | Confirms soft delete, optimistic locking, and option list query patterns. |
| Global error handling | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Read | High | Observed source | Confirms real HTTP mapping used by current code. |
| Error response record | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Read | High | Observed source | Confirms actual fields are `timestamp,status,error,message,traceId`. |
| Existing Project implementation | `EDCAP_BE/src/main/java`, `EDCAP_BE/src/main/resources/mapper`, `EDCAP_FE/src` via search | Partial | High | Observed source | No Project governance CRUD implementation found yet. |
| Existing related spec | `EDCAP_BE/documents/docs/changes/CUSTOMER/spec-pack.md` and mirrored docs hits from search | Search result only | Low | Reference pattern | Useful as precedent only; not treated as canonical source for PROJECT. |
| External spec tab | `docs/changes/PROJECT/spec.md` | Missing in workspace | Low | External/missing | Open in IDE but not present on disk. Must not be treated as canonical. |
| External SQL tab | `C:\Users\nvt_dung\Downloads\V141__project_management.sql` | External | Low | External | Not read from workspace; record only as a possible external reference. |

## 3. Solid evidence

| Topic | Evidence | Source |
|---|---|---|
| Project DB table exists | `tbl_dim_project` exists in V4 with `customer_id`, `project_alias`, `project_type`, `risk_level`, `status`, audit columns | `V4__init_shema_v2.sql` |
| Project soft delete support exists | `delete_flag`, `deleted_at`, `deleted_by` are added by migration `V120__project_management.sql` | `V120__project_management.sql` |
| Active-row uniqueness is intended | Unique index is on `(customer_id, LOWER(BTRIM(project_alias)))` only when active and not deleted | `V120__project_management.sql` |
| Governance modules use optimistic locking | `Organization`, `Customer`, and `Team` update/delete requests require `version` | controllers + DTOs + `TeamMapper.xml` |
| Governance delete route shape | Current governance modules use `PATCH /{id}/delete` rather than bare `DELETE /{id}` | controllers |
| Governance list responses are paged DTOs | Current governance modules return `items/page/size/totalElements/totalPages` | DTOs |
| Error envelope in code | Real code uses `ErrorResponse(timestamp, status, error, message, traceId)` | `ErrorResponse.java` |
| FE async/server access rule | FE must use TanStack Query and `lib/api.ts` | `.claude/rules/20-architecture.md` |
| Project-Team bridge table exists for this ticket | `tbl_project_team` exists with active-row uniqueness on `(project_id, team_id)` | `V120__project_management.sql` |
| Ticket-owner contract decisions | No `version`, delete route `PUT /api/v1/projects/{id}/delete`, authorization tied to `tbl_dim_role`, `project_type` is free-text nullable input | Updated ticket direction |

## 4. Partial or stale evidence

| Topic | Issue | Impact |
|---|---|---|
| API contract docs | `docs/standards/api-contract.md` says raw list DTOs; governance modules now use page DTO wrappers | Do not copy list contract blindly into Project spec |
| Security docs | Some docs mention `errorCode` in `ErrorResponse`; code no longer has that field | Error contract must follow code, not stale docs |
| Repository DB map | Some V4 descriptions are outdated (`org_id`, `project_code`) | Must verify directly in migration before citing columns |
| Raw input | Contains desired endpoints that differ from governance conventions | Now partially superseded by explicit ticket-owner decisions |

## 5. Missing evidence

| Item | Looked in | Why missing |
|---|---|---|
| Canonical ticket body outside `01_raw-input.md` | `docs/changes/PROJECT`, repo search | Not present in workspace |
| Basic design doc | `docs/changes/PROJECT`, `docs/architecture`, repo search | Not present |
| Meeting memo | `docs/changes/PROJECT`, repo search | Not present |
| Project DTOs/controllers/services/mappers | BE/FE source search | Feature not implemented yet |
| Exact per-action authorization rules against `tbl_dim_role` | source search by project feature name | Feature not implemented yet; role-to-action mapping is still an implementation detail |

## 6. External or non-canonical references

| Item | Status | Rule |
|---|---|---|
| IDE tab `docs/changes/PROJECT/spec.md` | Missing from workspace | Do not treat as source until the file exists in repo or is pasted into a tracked doc |
| IDE tab `C:\Users\nvt_dung\Downloads\V141__project_management.sql` | Outside workspace | Do not treat as source until imported or summarized into a tracked doc |

## 7. Pending judgments / human decisions seeded from source review

| ID | Question | Why it matters | Status |
|---|---|---|---|
| PJ-PROJECT-1 | Project uses a simpler contract without `version` and uses `PUT /api/v1/projects/{id}/delete` | Ticket-owner confirmation on 2026-06-16 | Resolved |
| PJ-PROJECT-2 | Project-Team relationship is many-to-many via `tbl_project_team` | Ticket-owner confirmation + `V120__project_management.sql` | Resolved |
| PJ-PROJECT-3 | Authorization should rely on role data in `tbl_dim_role`, not a separate permission-role model | Ticket-owner confirmation on 2026-06-16 | Resolved |
| PJ-PROJECT-4 | `project_type` is free-text nullable user input | Updated ticket direction | Resolved |

## 8. Initial readiness summary

- Source coverage is strong enough to maintain a decision-complete spec pack for Phase 3 handoff.
- Remaining unknowns are implementation details, not the original blocking contract decisions.
