# Sources

**Ticket ID**: ORGANIZATION    
**Create date**: 2026-06-09  
**Author**: nk_trung      
**Update date**: 2026-06-09  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket body / Phase 1 prompt | Conversation instruction | read | Defines Phase 1 objective, required input, required artifacts, mandatory `spec-pack.md` sections, and output expectations. |
| Human clarification - multilingual messages | Conversation on 2026-06-09 | read | System supports `ja/en/vi`; BE returns message keys and FE translates localized messages. |
| Human clarification - Phase 1 decisions | Conversation on 2026-06-09 | read | ADMIN-only access, PATCH soft delete endpoint, description max 500, post-create returns to list, optimistic locking required, deleted records allow code/name reuse, no real data migration review, audit log out of scope, child-data flows out of scope. |
| Human clarification - Phase 3 design details | Conversation on 2026-06-09 | read | Optimistic locking uses numeric `version`; active-record uniqueness predicate uses `deleted_at IS NULL`; FE translation resources are under `public/locales/{en,ja,vi}/locale.json`. |
| Ticket identifier | `docs/changes/ORGANIZATION/` | inferred from repository structure | Existing change folder and raw input indicate the ticket is `ORGANIZATION`. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement Document - Organization Management | `docs/changes/ORGANIZATION/raw/requirement.md` | read | high | Primary business and UAT-level requirement source. Defines CRUD-only Organization scope, functional requirements, business rules, API candidates, permissions, open-question decisions, and AC list `AC-ORG-01` to `AC-ORG-12`. |
| Database Design - Organization Management Function | `docs/changes/ORGANIZATION/raw/database_design.md` | read | high | Primary DB design source. Defines existing `tbl_dim_organization`, required added columns, uniqueness, soft delete, sample SQL, validation, screen mapping, and migration checklist. |
| Wireframe - Organization Management | `docs/changes/ORGANIZATION/raw/wireframe.md` | read | high | Primary UI behavior source. Defines list, empty state, create/edit/detail/delete dialog, validation messages, permission behavior, and navigation flow. |
| Architecture Overview | `docs/architecture/overview.md` | read | high | Confirms BE Hexagonal Architecture, FE React SPA architecture, PostgreSQL/Flyway, Spring Security OAuth2, current testing stack. |
| Route API Map | `docs/architecture/route-api-map.md` | read | high | Confirms existing API route patterns and that Organization endpoints are not currently mapped. |
| FE/BE Contract Map | `docs/architecture/fe-be-contract-map.md` | partial | medium | Used to confirm existing FE/BE contract conventions and traceId/error behavior. Full endpoint-specific Organization contract does not exist yet. |
| Repository DB Map | `docs/architecture/repository-db-map.md` | partial | medium | Used to confirm DB mapping and that Organization CRUD repository mapping is not documented as implemented. |
| Test Map | `docs/architecture/test-map.md` | partial | medium | Used to identify current test coverage posture and test stack. |
| API Contract Standard | `docs/standards/api-contract.md` | partial | high | Used for API consistency expectations. Organization-specific contract is still to be defined in Phase 3. |
| Backend Standard | `docs/standards/backend.md` | partial | high | Used to align BE design with layering and validation/error handling expectations. |
| Frontend Standard | `docs/standards/frontend.md` | partial | high | Used to align FE design with existing React/TanStack Query/fetch wrapper conventions. |
| Database Standard | `docs/standards/database.md` | partial | high | Used to align DB migration and uniqueness/soft-delete considerations. |
| Security Standard | `docs/standards/security.md` | partial | high | Used to classify permission/audit/privacy impact. |
| Testing Standard | `docs/standards/testing.md` | partial | high | Used to frame test strategy summary and AC testability. |
| Claude Safety Rule | `.claude/rules/00-safety.md` | read | high | Confirms no implementation, no destructive action, no secret/PII handling in this phase. |
| Claude Architecture Rule | `.claude/rules/20-architecture.md` | read | high | Confirms architectural layering and source-aware approach. |
| Claude Security Rule | `.claude/rules/30-security.md` | read | high | Confirms security/privacy handling expectations. |
| Claude Testing Rule | `.claude/rules/40-testing.md` | read | high | Confirms tests must be planned as evidence. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| BE DB migration | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read relevant sections | Confirms `tbl_dim_organization` already exists with `organization_id`, `name_masked`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`; no `organization_code`, `description`, `deleted_at`, or `deleted_by` in current table definition. |
| BE REST controllers | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/` | read relevant files | Confirms existing controllers: `HealthController`, `MeController`, `DemoController`, `AdminController`; no Organization controller currently exists. |
| BE DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | read | Confirms current DTO style uses Java records and static `from(...)` methods for response DTOs. |
| BE error handling | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | read | Confirms error response mapping and traceId in error body. |
| BE security config | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | read | Confirms `/api/**` requires authentication except explicitly permitted endpoints; role-specific Organization permissions are not implemented yet. |
| FE API wrapper | `EDCAP_FE/src/lib/api.ts` | read | Confirms fetch wrapper, `credentials: "include"`, `ApiError`, and typed endpoint helper pattern. |
| FE router | `EDCAP_FE/src/router.tsx` | read | Confirms React Router setup and currently empty `children`; no Organization route currently exists. |
| FE Login page | `EDCAP_FE/src/pages/AdminPage.tsx` | read | Used as existing page/query/mutation pattern reference; it is connector-admin specific and not Organization-specific. |
| FE UI components | `EDCAP_FE/src/components/ui/table.tsx`, `EDCAP_FE/src/components/ui/button.tsx` | read | Confirms reusable table/button components exist for possible Organization UI implementation. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE architecture test | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | available, not deeply read | Relevant for future Phase 3/5 because new BE code must respect layer rules. |
| BE unit tests | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java`, `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | available, not deeply read | Existing tests are unrelated to Organization but provide JUnit style references. |
| FE tests | `EDCAP_FE/src/__ tests __/README.md` and package config | partial / limited | Test stack exists, but no Organization FE tests exist. |
| Organization-specific tests | BE and FE source trees | unavailable | No Organization-specific test code found. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External Web / Office / PDF | N/A | not used | No external website, Office, or PDF source was needed for Phase 1. |

## Excluded Sources

| source/path | reason |
|---|---|
| `.git/` | Not needed for Phase 1 specification pack; reading repository history is out of scope. |
| `.env`, credentials, keys, production logs | Safety/security exclusion. Do not read or copy secrets/PII/credentials/log production raw content. |
| Generated dependencies / build output such as `node_modules`, `target`, caches | Not needed for Phase 1; high noise and no specification value. |
| Full source tree beyond referenced BE/FE files | Phase 1 only requires source and tests needed to confirm As-Is and impact. Full implementation analysis belongs to Phase 3 / Source Intelligence if needed. |

## Source Limitations

- Requirement, DB design, and wireframe are consistent on CRUD-only Organization scope, duplicate checks, editable code, and soft delete.
- Source code confirms DB table exists, but Organization CRUD API/FE screen is not implemented yet.
- Organization-specific FE/BE contract, DTO names, request/response schemas, exact route path style, and detailed permission model are not implemented in source yet.
- The existing DB table uses `name_masked` for Organization name; this is confirmed in DB design as the current mapping, but the business meaning of "masked" vs display name may need future clarification if privacy requirements change.
- Existing source confirms application-level role enum such as ADMIN/EDITOR/VIEWER, while raw requirement describes Organization-specific permissions such as Organization View/Create/Update/Delete/Admin. Mapping between these is not yet defined.
- This phase did not run build/test/lint because it is an investigation/specification phase only.

## Assumptions from Sources

- `ORGANIZATION` is treated as the ticket ID because the raw input folder is `docs/changes/ORGANIZATION/raw/`.
- `tbl_dim_organization.name_masked` is treated as the Organization Name field for this ticket because both current DDL and DB design explicitly map it that way.
- New Organization endpoints should be under `/api/v1/organizations` because the requirement proposes those primary APIs and current BE route convention uses `/api/v1/...`.
- FE should use `EDCAP_FE/src/lib/api.ts` endpoint helpers and TanStack Query-style page logic because this is the established pattern in current FE source.

## Human Confirmation Required

All blocking Phase 1 human questions have been answered on 2026-06-09. Additional Phase 3 design details were also clarified:

- Optimistic locking uses numeric `version`.
- Partial unique indexes for active records use `deleted_at IS NULL`.
- FE translation resources live under `public/locales/{en,ja,vi}/locale.json`.

Remaining Phase 3 design detail:

- Use the Organization message keys and translations fixed in `spec-pack.md` section 6.4.1 under `public/locales/{en,ja,vi}/locale.json`.
