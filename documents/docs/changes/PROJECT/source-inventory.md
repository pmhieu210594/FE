# Source Inventory

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16

| category | artifact | path | status | role in planning | notes |
|---|---|---|---|---|---|
| Ticket doc | Source provenance | `docs/changes/PROJECT/sources.md` | Exists | Evidence log | Supports trust and inference boundaries |
| Ticket doc | Brainstorm | `docs/changes/PROJECT/00_brainstorm.md` | Exists | Early ambiguity/decision notes | Useful for tracing ticket evolution |
| Ticket doc | Raw input | `docs/changes/PROJECT/01_raw-input.md` | Exists | Requested behavior | Not canonical after spec-pack approval |
| Ticket doc | Spec pack | `docs/changes/PROJECT/spec-pack.md` | Exists | Canonical requirement source | Primary source for AC/scope |
| Ticket doc | Context | `docs/changes/PROJECT/context.md` | Exists | Implementation bridge | Phase 2 source |
| Ticket doc | Ticket rules | `docs/changes/PROJECT/ticket-rules.md` | Exists | Must-follow rules | Encodes approved deviations |
| Ticket doc | Impl plan | `docs/changes/PROJECT/impl-plan.md` | Exists | Implementation handoff | Upgraded in Phase 3 |
| Ticket doc | Review checklist | `docs/changes/PROJECT/review-checklist.md` | Exists | Review seed | Filled later with evidence |
| Ticket doc | Self review | `docs/changes/PROJECT/self-review.md` | Exists | Evidence skeleton | Filled after implementation |
| Ticket doc | Test plan | `docs/changes/PROJECT/test-plan.md` | Exists | Test strategy seed | Expanded during coding |
| Ticket doc | Test results | `docs/changes/PROJECT/test-results.md` | Exists | Execution evidence skeleton | Filled after tests run |
| Ticket doc | Black-box cases | `docs/changes/PROJECT/blackbox-testcases.md` | Exists | Scenario seed | AC-facing manual/E2E cases |
| Ticket doc | Test data | `docs/changes/PROJECT/test-data.md` | Exists | Synthetic data guidance | Includes duplicate/boundary ideas |
| Ticket doc | Report | `docs/changes/PROJECT/report.md` | Exists | Final summary skeleton | Filled after implementation |
| Architecture | Route/API map | `docs/architecture/route-api-map.md` | Exists | FE/API reference | Validate against code if conflicts appear |
| Architecture | Service layer map | `docs/architecture/service-layer-map.md` | Exists | BE layering reference | Supporting evidence only |
| Architecture | Repository/DB map | `docs/architecture/repository-db-map.md` | Exists | Persistence reference | Cross-check with actual code/migrations |
| Architecture | Other architecture docs | `docs/architecture/*` | Exists | Test/ops/context support | Freshness varies |
| Standards | Repo standards | `docs/standards/*` | Exists | General conventions | Use where source-supported |
| Standards | Ticket template | `docs/standards/templates/_ticket-template/*` | Exists | Mandatory artifact structure | Main structural baseline |
| Rules | Claude rules | `.claude/rules/*` | Exists | Additional repo rules | Use selectively |
| FE source | App routing | `EDCAP_FE/src/App.tsx` | Exists | Route and guard pattern | No Project route yet |
| FE source | API helper | `EDCAP_FE/src/lib/api.ts` | Exists | Shared HTTP and endpoint conventions | Must be reused |
| FE source | Auth hook | `EDCAP_FE/src/hooks/useAuth.ts` | Exists | Session/auth pattern | No Project-specific action logic |
| FE source | Governance/admin modules | `EDCAP_FE/src/features/admin/**`, related pages/components | Exists | UI/query/form patterns | Contract semantics differ from Project |
| FE source | Shared components | `EDCAP_FE/src/components/**` | Exists | Common UI building blocks | Reuse if contract-compatible |
| BE source | Organization pattern | `EDCAP_BE/src/main/java/**/organization/**` | Exists | CRUD/controller/service reference | Do not inherit version/delete semantics |
| BE source | Customer pattern | `EDCAP_BE/src/main/java/**/customer/**` | Exists | Lookup/reference pattern | Useful for customer option source |
| BE source | Team pattern | `EDCAP_BE/src/main/java/**/team/**` | Exists | Team lookup/reference pattern | Must respect V140 bridge-table reality |
| BE source | Error envelope | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Exists | Standard API error contract | Use observed fields only |
| BE source | Exception mapping | `EDCAP_BE/src/main/java/**/GlobalExceptionHandler.java` | Exists | Standard status/error mapping | Reuse rather than custom logic |
| BE source | Security/resolver | `EDCAP_BE/src/main/java/**/security/**` and current-user resolvers | Exists | Auth and caller-context pattern | Exact Project action map still to be implemented |
| DB | Base migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Exists | Base Project table + enum truth | Defines `severity_level` |
| DB | Project migration | `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql` | Exists | Project soft delete + bridge table | Key schema authority |
| DB | Team migration | `EDCAP_BE/src/main/resources/db/migration/V140__team_management.sql` | Exists | Team relation change | Drops `tbl_dim_team.project_id` |
| Test | Existing FE/BE tests | FE/BE test directories | Exists | Test style/infrastructure reference | No Project-specific cases yet |
| Reference ticket | Organization Phase 3 docs | `docs/changes/ORGANIZATION/*` | Exists | Depth reference | Never copy governance defaults blindly |

## Important Files

### Ticket docs

- `docs/changes/PROJECT/spec-pack.md`
- `docs/changes/PROJECT/context.md`
- `docs/changes/PROJECT/ticket-rules.md`
- `docs/changes/PROJECT/impl-plan.md`

### Frontend

- `EDCAP_FE/src/App.tsx`
- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/hooks/useAuth.ts`
- `EDCAP_FE/src/features/admin/**`
- `EDCAP_FE/src/components/**`

### Backend

- Organization / Customer / Team controller, DTO, service, repository, mapper patterns under `EDCAP_BE/src/main/java/**`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java`
- `EDCAP_BE/src/main/java/**/GlobalExceptionHandler.java`
- Security and current-user resolver classes under `EDCAP_BE/src/main/java/**/security/**`

### Database / migration

- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`
- `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql`
- `EDCAP_BE/src/main/resources/db/migration/V140__team_management.sql`

## Generated / Excluded Files

| artifact type | handling | reason |
|---|---|---|
| Build outputs | Excluded | Not source of truth for planning |
| Coverage reports | Excluded | Useful only after tests run |
| Generated API clients / OpenAPI artifacts | Not observed | Do not invent generation workflow |
| IDE-only open tabs or external local downloads | Excluded unless imported into repo docs | Not canonical ticket evidence |

## Missing Files

Project-specific implementation assets not currently present as observed source:

- `ProjectController`
- `ProjectService`
- `ProjectRepositoryPort`
- `ProjectRepositoryAdapter`
- `ProjectMapper`
- `ProjectMapper.xml` or equivalent SQL mapping
- Project request/response/page DTOs
- Project domain/entity classes if the repo separates them
- `endpoints.projects.*`
- Project FE pages for list/detail/create/edit/delete
- Project-specific FE types/forms/hooks
- Project-specific FE/BE tests
- Project-specific locale/message keys if not yet added
