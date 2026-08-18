# Spec Pack

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## 1. Context / Purpose

This spec pack consolidates the current Project Management request into a single planning artifact for later implementation. The immediate goal of Phase 1 is not to finalize every product decision by guesswork, but to:

- anchor the feature to observed source-code conventions and live schema,
- convert acceptance criteria into testable statements,
- surface every blocking ambiguity before Phase 3.

The primary business input is `docs/changes/PROJECT/01_raw-input.md`. Current repository source shows that Project DB support already exists, but Project governance CRUD is not yet implemented in either BE or FE. The original blocking contract questions for this ticket were resolved by human confirmation on 2026-06-16 and are incorporated below.

## 2. Scope

### 2.1. Within range

- Define the intended Project Management behavior for list, detail, create, update, and soft delete.
- Lock what can already be confirmed from current source:
  - Project schema and migration facts
  - governance REST/DTO/error patterns
  - FE/BE integration conventions
- Convert requested behavior into testable ACs.
- Separate unresolved contract/schema/product decisions into explicit decision logs.

### 2.2. Out of range

- Implementing backend or frontend code.
- Inventing missing permission keys, enum sets, or option sources not observable in source.
- Approving schema changes that are not already supported by source or human decision.
- Finalizing production code or non-ticket-wide decisions outside the approved Project contract.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| Project | Business entity stored in `tbl_dim_project` | UI label uses “Project name”; DB field is `project_alias` |
| Customer | Parent entity of Project | `tbl_dim_customer` |
| Team | Related entity used in Project assignment | For this ticket, Project-Team is many-to-many via `tbl_project_team` |
| Soft delete | Marking row inactive/deleted without physical removal | For Project, backed by `status`, `delete_flag`, `deleted_at`, `deleted_by` |
| Active row | Project row not soft deleted | In V120 index terms: `delete_flag = FALSE`, `deleted_at IS NULL`, `status = 'ACTIVE'` |
| Governance pattern | Existing CRUD pattern used by Organization, Customer, Team | Includes page DTOs and optimistic locking |
| Spec source of truth | Canonical planning artifact for later phases | This document after Phase 1 |

## 4. As-Is

- `tbl_dim_project` exists in the V4 schema with Project core fields and audit timestamps.
- `V120__project_management.sql` adds Project soft-delete metadata, active-only uniqueness logic for alias-per-customer, and the `tbl_project_team` bridge table.
- Organization, Customer, and Team governance modules are implemented and establish current conventions:
  - paged list DTOs,
  - `PATCH /{id}/delete` soft delete,
  - optimistic locking via `version`,
  - centralized exception mapping to `ErrorResponse`.
- No implemented Project governance CRUD source was observed in BE or FE during this phase.
- This ticket intentionally deviates from some governance conventions: it does not use `version` in input contracts and uses `PUT /api/v1/projects/{id}/delete` for soft delete.

## 5. To-Be

Project Management should become a governance-style CRUD feature that allows authorized users to:

- list Projects,
- view Project details,
- create a Project,
- update a Project,
- soft delete a Project,
- manage Project-to-Team assignment according to the approved relationship model.

The eventual implementation should follow observed codebase conventions where they do not conflict with the explicit Project-specific decisions already approved for this ticket.

## 6. Detailed specification

### 6.1. Business Rules

| ID | Rule | Basis |
|---|---|---|
| BR-1 | A Project belongs to exactly one Customer. | Raw input + existing `tbl_dim_project.customer_id` |
| BR-2 | A Project must have a non-blank `project_alias` after trimming. | Raw input |
| BR-3 | New active Projects under the same Customer must not share the same normalized alias. | `V120__project_management.sql` unique index |
| BR-4 | Soft-deleted Projects are excluded from the default list, normal detail flow, and normal update flow. | Raw input + governance convention |
| BR-5 | Soft delete for Project must update deletion metadata rather than physically remove the row. | V120 migration + raw input |
| BR-6 | `status` for a deleted Project must be `DELETED`. | Raw input + governance pattern |
| BR-7 | FE validation may improve UX, but backend validation remains the final enforcement point. | Raw input + standards |
| BR-8 | Authorization must be enforced in BE for each action; FE affordance hiding alone is not sufficient. | Raw input + security rules + user confirmation |
| BR-9 | Project soft delete uses `PUT /api/v1/projects/{id}/delete` and does not require `version` in the request contract. | User confirmation on 2026-06-16 |
| BR-10 | Project-Team assignment uses many-to-many mapping through `tbl_project_team`, and backend sync must make the active mapping set match the submitted Team set. | User confirmation + `V120__project_management.sql` |
| BR-11 | `project_type` is free-text user input, trimmed before persistence, and may be `null` when left blank. | Updated ticket decision |
| BR-12 | Authorization data for this feature should be based on `tbl_dim_role`; no separate permission-role model is introduced by this ticket. | User confirmation on 2026-06-16 |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `customerId` | UUID | Yes | Must refer to an allowed, existing active Customer | Naming may later align to DTO convention |
| `projectAlias` | string | Yes | Trim before persistence; reject empty/whitespace-only | UI label: Project name |
| `projectType` | string | No | Trim before persistence; blank/whitespace-only becomes `null`; maximum 100 characters | Backed by current `VARCHAR(100)` schema |
| `riskLevel` | string | No | If provided, value should align to `severity_level` enum values | `INFO/LOW/MEDIUM/HIGH/CRITICAL` observed in V4 |
| `teamIds` | list of UUID | No | Each ID must refer to an allowed Team; backend syncs active mappings in `tbl_project_team` | Approved many-to-many model |
| list `keyword` | string | No | Trim/search behavior not yet requested explicitly | May be omitted in v1 if not approved |
| list `customerId` filter | UUID | No | Filter semantics to be defined if supported | Wireframe suggests customer filter |
| list `status` filter | string | No | Normal list likely active-only by default | Deleted-view behavior not requested |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| Project list response | page DTO | `items, page, size, totalElements, totalPages` | Keeps governance-style paging for list reads |
| Project list item | object | UUID + strings + timestamps | Minimum requested fields: action affordances derive from role-based authorization, customer name, project alias, status, created/updated timestamps |
| Project detail response | object | DTO | Must include enough data for detail screen and edit prefill |
| Mutation response | object | DTO | Governance modules return the updated resource DTO |
| Error response | object | `timestamp, status, error, message, traceId` | Must follow code, not stale docs |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Missing or blank required fields | Reject request | HTTP 400 via validation/domain rule path | Exact message key/text must follow implementation convention |
| Duplicate active alias in same Customer | Reject request | Expected conflict semantics; target is HTTP 409 | Backed by V120 uniqueness intent |
| Project not found | Reject detail/update/delete | HTTP 404 | Consistent with `NotFoundException` |
| Project already deleted | Treat as unavailable for normal flow | Usually HTTP 404 in governance flow | Must be confirmed in implementation |
| Caller lacks permission | Reject action | HTTP 403 | Must use centralized exception mapping and role-based authorization data |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| `projectAlias` | 1 non-space char after trim | DB length limit not yet revalidated beyond `VARCHAR(255)` | whitespace-only, leading/trailing spaces, case-only duplicates | Reject blank; normalize duplicate check using DB index behavior |
| `teamIds` | 0 or more | TBD | duplicate IDs, inactive IDs, nonexistent IDs | Backend must reconcile active `tbl_project_team` mappings to the submitted set |
| `page` | 0 | TBD | omitted value | Governance modules default to `0` |
| `size` / `pageSize` | 1 | TBD | omitted value | Default UI page size is `25`; backend may still apply its own normal validation/default handling when the parameter is omitted or invalid |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | List/detail should use indexed active-row access paths where available | Use V120 active indexes for normal queries | SQL/code review + tests later | Source-based expectation only |
| Security | Authenticated and authorized access only | BE permission check on each action | Web/API tests later | Required |
| Availability / Reliability | Project create/update/delete should be atomic for Project row and related mappings | One transactional flow | Service/integration tests later | Important if Team sync is included |
| Maintainability | Must respect existing layered architecture | No web-to-infrastructure shortcut | Arch review + tests later | Required |
| Observability / Logging | Failures should surface `traceId` through standard error handling | Standard `ErrorResponse` on exceptions | Web tests later | Required |
| Compatibility | New Project contracts should stay consistent with repo conventions except for the explicitly approved deviations in this ticket | Minimal surprise to FE/BE | Spec review now, contract tests later | Approved deviations: no `version`, `PUT /delete` |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-PROJECT-1 | Given an authorized caller and at least one active Project, when the caller opens the Project list, then the API/UI returns only non-deleted Projects and includes customer name, project alias, status, created timestamp, and updated timestamp for each item. | Yes | List contract shape still depends on final governance alignment |
| AC-PROJECT-2 | Given an authorized caller and no matching active Projects, when the caller opens the Project list, then the UI shows the defined empty state instead of a broken table. | Yes | FE behavior |
| AC-PROJECT-3 | Given an authorized caller and a valid create payload, when the caller creates a Project, then one active Project row is persisted and the response/UI reflects the new Project successfully. | Yes | If `teamIds` are provided, active `tbl_project_team` mappings are created to match them |
| AC-PROJECT-4 | Given a create or update payload with `projectAlias` empty after trimming, when the request is submitted, then the request is rejected and no Project data is changed. | Yes | Backend mandatory |
| AC-PROJECT-5 | Given an active Project already exists for a Customer with the same normalized alias, when another active Project is created or updated with that normalized alias under that Customer, then the request is rejected as a duplicate and no conflicting write is committed. | Yes | Mirrors V120 uniqueness intent |
| AC-PROJECT-6 | Given an authorized caller and an existing active Project, when the caller opens the Project detail view, then the response/UI includes the minimum Project detail fields needed by the approved detail screen, including current Team assignments. | Yes | Team assignments come from active `tbl_project_team` mappings |
| AC-PROJECT-7 | Given an authorized caller and a valid update payload for an existing active Project, when the caller updates the Project, then the latest persisted Project data is returned and reflected in subsequent reads. | Yes | No optimistic-lock `version` field is part of this ticket contract |
| AC-PROJECT-8 | Given a nonexistent or soft-deleted Project ID, when the caller requests detail, update, or delete through the normal Project flow, then the API rejects the request as unavailable and no new mutation occurs. | Yes | Expected 404 path |
| AC-PROJECT-9 | Given an authorized caller and an existing active Project, when the caller performs Project delete through `PUT /api/v1/projects/{id}/delete`, then the Project is soft deleted and no longer appears in the default active list. | Yes | Approved ticket contract |
| AC-PROJECT-10 | Given a caller without the required role-based authorization for a Project action, when that caller invokes list, detail, create, update, or delete, then the backend rejects the action with the project-standard authorization response. | Yes | Authorization source is role data in `tbl_dim_role` |
| AC-PROJECT-11 | Given create or update submits Team selections, when the mutation completes successfully, then the persisted active `tbl_project_team` relationship set matches the submitted Team set. | Yes | Approved contract |
| AC-PROJECT-12 | Given a backend error occurs during a Project API call, when the error response is returned, then the response uses the standard backend error envelope with `traceId`. | Yes | Based on observed code |

## 8. Examples

### 8.1. Normal Case

- Create Project:
  - Input: active `customerId`, `projectAlias = "Data Analytics"`, optional `projectType`, optional `riskLevel`, optional `teamIds`.
  - Expected: Project persists as active, appears in default list, and detail can be read immediately.

- Update Project:
  - Input: existing active Project ID, changed alias/type/risk/team selection.
  - Expected: updated Project data is returned and shown in subsequent list/detail reads.

- Soft delete Project:
  - Input: existing active Project ID via `PUT /api/v1/projects/{id}/delete`.
  - Expected: Project leaves active list and normal detail flow.

### 8.2. Error Case

- Blank alias:
  - Input: `"   "`
  - Expected: request rejected; no write committed.

- Duplicate alias under same Customer:
  - Input: alias that normalizes to an existing active Project alias in same Customer.
  - Expected: request rejected as duplicate.

- Unauthorized delete:
  - Input: valid Project ID, caller without delete permission.
  - Expected: request rejected with authorization error.

- Detail for deleted Project:
  - Input: soft-deleted Project ID through normal detail flow.
  - Expected: unavailable/not-found style response.

### 8.3. Boundary Case

- Alias with leading/trailing spaces:
  - Input: `"  Project A  "`
  - Expected: stored/compared using trimmed value.

- Alias differs only by case and surrounding spaces:
  - Input: existing active `"Project A"` and new `"  project a  "`
  - Expected: rejected if final implementation follows V120 normalized index semantics.

- Empty Team selection:
  - Input: no Team IDs selected.
  - Expected: allowed, and the Project ends with no active rows in `tbl_project_team`.

## 9. Source Availability Summary

- Strong evidence exists for Project DB state, soft delete support, uniqueness behavior, governance API conventions, and real backend error envelope.
- Partial or stale evidence exists in docs that still mention older response conventions.
- Missing evidence remains for Project implementation code and exact role-to-action enforcement details, but the original contract decisions are now resolved.
- See `docs/changes/PROJECT/sources.md` for detailed provenance.

## 10. Complexity Classification

```text
- Complexity: Complex
- System shape: FE+BE+DB
- Primary risk: Contract / DB / Source
- Review mode: Heavy
- Required options: Source Analysis / FE-BE Contract / DB Migration / Full Security
```

## 11. FE/BE Contract Impact

- Project should align to existing governance contracts unless a deviation is approved.
- Contract items that must be locked before implementation:
  - list response wrapper shape,
  - detail DTO shape,
  - create/update/delete request bodies,
  - how customer/team option data is loaded.
- Approved ticket deviations:
  - no `version` in request contracts,
  - soft delete route is `PUT /api/v1/projects/{id}/delete`.
- FE should continue using `lib/api.ts` and TanStack Query for all server interactions.

## 12. DB/Migration Impact

- Confirmed existing DB support:
  - `tbl_dim_project` exists in V4,
  - `V120__project_management.sql` adds soft-delete columns, active-only uniqueness, and `tbl_project_team`.
- Approved DB contract:
  - Project-Team is many-to-many through `tbl_project_team`.
- No Project `version` requirement is part of this ticket contract.

## 13. Security/Privacy Impact

- All Project endpoints must require authenticated session-based access.
- Authorization must be enforced in backend code for each action using role-based data aligned to `tbl_dim_role`.
- Error handling must use the standard backend envelope and avoid leaking internal details.
- No special PII requirement was observed in the raw input, but audit/user fields such as `createdBy`, `updatedBy`, and `deletedBy` are operationally sensitive and should follow existing conventions.

## 14. Operation/Maintenance Impact

- This feature will add a new governance module surface in BE and FE.
- Supportability depends on keeping error handling, logging, and transactional behavior consistent with existing modules.
- If Team assignment sync spans multiple tables, operational debugging will benefit from a single transactional mutation path and standard trace IDs.

## 15. Test Strategy Summary

- Backend unit tests:
  - service validation rules,
  - duplicate handling,
  - role-based authorization enforcement,
  - Team sync logic for `tbl_project_team`.
- Backend web/integration tests:
  - list/detail/create/update/delete routes,
  - error envelope and status mapping,
  - migration/index behavior for alias uniqueness and soft delete.
- Frontend tests:
  - page empty/loading/error states,
  - create/edit/delete flows,
  - permission affordances,
  - API helper and error-handling behavior.
- Contract validation:
  - confirm page DTO shape and detail DTO shape before FE implementation.

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
|H-PROJECT-1|Project mutation contract uses no `version` and soft delete uses `PUT /api/v1/projects/{id}/delete`|Approved ticket-specific deviation from governance modules|Product/Tech Lead|Resolved 2026-06-16|
|H-PROJECT-2|Project-Team relationship uses `tbl_project_team` many-to-many mapping|Approved business/data model for this ticket|Product/DB/Tech Lead|Resolved 2026-06-16|
|H-PROJECT-3|Authorization relies on role data in `tbl_dim_role` and does not introduce a separate permission-role model|Approved auth direction for this ticket|Tech Lead|Resolved 2026-06-16|
|H-PROJECT-4|`project_type` is free-text nullable user input|Updated ticket rule for this ticket|Product/Tech Lead|Resolved 2026-06-17|

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
|A-PROJECT-1|`01_raw-input.md` is the primary business input for this phase|No other ticket body/basic design/memo exists in workspace|Medium|Yes|
|A-PROJECT-2|Project keeps governance-style paging and standard error envelope, but intentionally deviates on delete route and omission of `version`|Observed source + resolved human decisions|Low|No|
|A-PROJECT-3|Default active list should exclude soft-deleted Projects|Raw input + governance patterns + V120 indexes|Low|No|
|A-PROJECT-4|Normalized duplicate detection should follow V120 semantics using trimmed, case-insensitive alias comparison on active rows|Observed unique index|Low|No|
|A-PROJECT-5|`project_type` remains free-text nullable because the DB column is `VARCHAR(100)` and the ticket now explicitly treats it as user-entered text|Updated ticket direction|Low|No|

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
|OI-PROJECT-1|Project implementation code does not yet exist in BE/FE source|Normal implementation work remains for Phase 3|Team|Open|
|OI-PROJECT-2|Exact role-to-action enforcement details are still not observable from source because the feature is not implemented yet|Needs to be encoded consistently during implementation and tests|Tech Lead|Open|
|OI-PROJECT-3|Some repo docs are stale about `ErrorResponse` and API list envelopes|Requires care during implementation and review to avoid copying old conventions|Team|Open|
|OI-PROJECT-4|`project_type` changed from prior severity-based assumption to free-text nullable and all downstream docs/tests must stay aligned|Implementation/doc drift risk if old rule is copied forward|Team|Open|

## 19. Phase 1 Output

### 19.1. Can Phase 3 proceed using only this Spec Pack?

Yes.

The original blocking contract questions have been resolved. This spec pack is now sufficient to hand off into Phase 3, with the remaining open issues being implementation-detail and review concerns rather than unresolved ticket intent.

### 19.2. If not, what information is still missing?

- Exact role-to-action enforcement logic during implementation
- Final DTO field names and page/detail payload shape within the approved contract
- Customer/team option-loading mechanics

### 19.3. What questions require human confirmation?

- No blocking confirmation questions remain for the original Phase 1 scope.
- If implementation needs a finer-grained role-to-action matrix, that can be confirmed during Phase 3 without reopening the ticket contract.

### 19.4. What specialist packs are needed?

- FE/BE contract review
- DB/migration review
- Security/authorization review
- Test strategy review
