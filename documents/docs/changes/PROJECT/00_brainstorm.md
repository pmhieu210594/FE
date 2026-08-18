# PROJECT Brainstorm

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

## 1. Quick context

- Raw input asks for Project Management CRUD with Customer ownership, multi-Team assignment, detail/list/form UI, backend validation, and soft delete.
- The repo already has Project DB support in V4 and a follow-up Project migration in V120.
- The repo does not yet show a Project governance CRUD implementation in BE or FE.
- Existing governance modules for Organization, Customer, and Team establish strong implementation conventions, but this ticket now has approved deviations for Project.

## 2. Confirmed from source

- `tbl_dim_project` already exists with `customer_id`, `project_alias`, `project_type`, `risk_level`, `status`, and audit columns.
- `V120__project_management.sql` adds Project soft-delete support, an active-only uniqueness index on normalized alias within a customer, and the many-to-many bridge table `tbl_project_team`.
- Governance modules use:
  - `GET /api/v1/<resource>` with paged response DTO
  - `GET /api/v1/<resource>/{id}`
  - `POST /api/v1/<resource>`
  - `PUT /api/v1/<resource>/{id}`
  - `PATCH /api/v1/<resource>/{id}/delete`
- Governance updates and soft deletes use optimistic locking via `version`.
- Current backend error envelope is `timestamp, status, error, message, traceId`.
- FE async data flow should go through TanStack Query and `lib/api.ts`.
- Human-confirmed Project decisions:
  - keep the simpler raw-input contract without `version`,
  - use `PUT /api/v1/projects/{id}/delete`,
  - use many-to-many Project-Team mapping via `tbl_project_team`,
  - do not use a separate permission-role model; authorization data is tied to `tbl_dim_role`,
  - treat `project_type` as free-text nullable user input backed by `VARCHAR(100)`.

## 3. Likely by convention

- Project list should still follow the same page DTO shape as Organization/Customer/Team rather than raw `List<ProjectDto>`, unless the implementation phase approves another explicit deviation.
- Project detail likely needs a dedicated detail DTO plus option lists, similar to Team detail patterns, if the FE form needs preloaded customer/team options.
- Project create/update/delete likely should live under the governance layer and use the same service/controller/mapper layering as existing modules.
- Backend authorization checks likely still belong in the application/service layer and map to `ForbiddenException`, even though this ticket will not introduce a separate permission-role model.
- FE route/page behavior should likely mirror existing management modules once Project page exists.

## 4. Need human confirmation

- No blocking human-confirmation items remain for the original contract questions.
- The ticket owner has confirmed:
  - no `version` in Project input contracts,
  - delete route is `PUT /api/v1/projects/{id}/delete`,
  - Project-Team is many-to-many via `tbl_project_team`,
  - authorization should rely on role data in `tbl_dim_role`,
  - `project_type` is free-text nullable and trimmed before persistence.
- Remaining implementation-time clarifications, if any, are non-blocking and should be handled as normal API/DTO design details inside the approved contract.

## 5. Decision points that affect Phase 3 directly

| ID | Decision point | Why it matters |
|---|---|---|
| D-1 | Delete endpoint shape | Resolved as `PUT /api/v1/projects/{id}/delete` |
| D-2 | Use of optimistic locking/version | Resolved as no `version` in Project contract |
| D-3 | Team relationship model | Resolved as many-to-many via `tbl_project_team` |
| D-4 | List/detail DTO shape | Still matters for implementation and tests |
| D-5 | Authorization enforcement source | Resolved as role-based data from `tbl_dim_role`, without a separate permission-role model |
| D-6 | Option-source contracts for customer/team/project type/risk level | Resolved for `project_type`; customer/team option loading still needs normal implementation design |

## 6. Raw input vs source gaps

| Topic | Raw input | Observed source / convention | Initial handling |
|---|---|---|---|
| Delete route | Ticket owner confirms `PUT /api/v1/projects/{id}/delete` | Governance modules use `PATCH /{id}/delete` | Approved Project-specific deviation |
| Update/delete concurrency | Ticket owner confirms no `version` | Governance modules require `version` | Approved Project-specific deviation |
| List response | Minimal item list only | Governance modules use paged DTO wrapper | Spec should follow source unless deviation is approved |
| Error format | Mentions `errorCode`-style mapping | Code currently exposes `error`, not `errorCode` | Spec must follow code |
| Team relation | Ticket owner confirms many-to-many via `tbl_project_team` | V120 now includes `tbl_project_team` | Resolved in favor of ticket decision + migration source |

## 7. Risks if we skip clarification

- We could still design DTOs that conflict with existing governance list/detail conventions and force rework in Phase 3.
- We need to be careful that `project_type` is not mistaken for enum-backed master data, because the field name can still suggest categorized values even though the approved contract treats it as trimmed free text.
- We should keep authorization wording consistent with role data in `tbl_dim_role` and avoid reintroducing a separate permission-key assumption.

## 8. Suggested posture for the spec pack

- Treat `01_raw-input.md` as requested behavior.
- Treat current governance modules and migrations as observed implementation constraints.
- Treat the newly confirmed user decisions as authoritative ticket decisions for Project-specific deviations.
- Encode any unresolved mismatch as either:
  - `Human Decision Required` if it changes contract or schema
  - `Assumption` only if a low-risk default is acceptable
  - `Open Issue` if it still blocks handoff readiness

## 9. Preliminary answer to “can Phase 3 start now?”

- Yes, in principle.
- The original blocking contract questions have now been resolved by ticket-owner confirmation, so the spec pack should be updated to reflect that Phase 3 is no longer blocked on them.
