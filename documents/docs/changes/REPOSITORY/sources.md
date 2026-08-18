# Sources

**Ticket ID**: REPOSITORY-CRUD  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Requirement definition | `docs/changes/REPOSITORY/01_raw-input.md` | Read | Primary business input; contains mixed-quality text and some inconsistencies |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement / design input | `docs/changes/REPOSITORY/01_raw-input.md` | Read | Medium | Main source for scope, CRUD actions, validation intent, and UI expectations |
| Architecture overview | `docs/architecture/overview.md` | Read | High | Confirms backend/frontend stack and hexagonal layering |
| Route API map | `docs/architecture/route-api-map.md` | Read | High | Confirms current route convention, controller patterns, auth and error policy |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | Read | High | Confirms current FE contract style, raw DTO shape, and error handling constraints |
| Repository DB map | `docs/architecture/repository-db-map.md` | Read | High | Confirms current DB generation split, legacy V1-V4 tables, and the absence of Repository CRUD implementation |
| Source inventory | `docs/architecture/source-inventory.md` | Read | High | Confirms relevant read order, repo structure, and source availability constraints |
| Test map | `docs/architecture/test-map.md` | Read | High | Confirms current test gaps and test strategy constraints |
| Database standards | `docs/standards/database.md` | Read | High | Confirms naming, PK, status, timestamps, and soft-delete conventions |
| API contract standards | `docs/standards/api-contract.md` | Read | High | Confirms raw DTO success shape and `ErrorResponse` error shape |
| Error handling standards | `docs/standards/error-handling.md` | Read | High | Confirms `GlobalExceptionHandler` is the only mapping point |
| Testing standards | `docs/standards/testing.md` | Read | High | Confirms BE/FE test patterns and naming |
| Safety rules | `.claude/rules/00-safety.md` | Read | High | Confirms Phase 0 doc-only rule and forbidden destructive actions |
| Style rules | `.claude/rules/10-style.md` | Read | High | Confirms FE/BE coding style constraints |
| Architecture rules | `.claude/rules/20-architecture.md` | Read | High | Confirms layer boundaries and FE data access rules |
| Security rules | `.claude/rules/30-security.md` | Read | High | Confirms HMAC, session cookie, and error response constraints |
| Testing rules | `.claude/rules/40-testing.md` | Read | High | Confirms current test expectations and gaps |
| Ticket spec template | `docs/standards/templates/_ticket-template/spec-pack.md` | Read | High | Template for output structure |
| Source availability template | `docs/standards/automation/source-availability-template.md` | Read | High | Template for documenting evidence quality |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Backend controller pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Read | Confirms current REST style, request/response flow, and soft-delete route pattern |
| Backend domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java` | Read | Confirms legacy Repository entity exists and is not the ticketed V5-style CRUD model |
| Backend domain model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Project.java` | Read | Confirms soft-delete flags and status conventions used by current feature set |
| Backend DTO mapping | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` | Read | Confirms DTO shape, UUID IDs, and list/detail payload style |
| Backend DB migration | `EDCAP_BE/src/main/resources/db/migration/V5__alter_tbl_dim_organization_for_management.sql` | Read | Confirms V5+ additive migration style and partial unique index / soft-delete pattern |
| Backend DB migration | `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql` | Read | Confirms existing management feature uses UUIDs, soft delete, and uniqueness scoped to active rows |
| Backend DB migration | `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql` | Read | Confirms authoritative Repository schema uses `tbl_dim_repository`, UUID PK, soft-delete fields, and active-row uniqueness |
| Backend project table | `tbl_dim_project` / `ProjectMapper.xml` | Read | Confirms `project_alias` is sourced from Project data by `project_id` |
| Frontend API layer | `EDCAP_FE/src/lib/api.ts` | Read | Confirms FE endpoint helper style, `ApiError`, raw DTO response use, and existing project/customer/organization contract shapes |
| Frontend project page | `EDCAP_FE/src/pages/ProjectPage.tsx` | Read | Confirms current UI behavior pattern for list/detail/create/edit/delete and validation UX |
| Frontend organization page | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Read | Confirms soft-delete UI pattern, detail drawer behavior, and error toast handling |
| Frontend customer page | `EDCAP_FE/src/pages/CustomerPage.tsx` | Read | Confirms form/list/filter pattern and versioned soft delete flow |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Backend unit | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Read | Example of port-mocking style |
| Backend architecture | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | Read | Example of layer enforcement |
| Backend unit | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | Read | Example of pure domain tests |
| Frontend unit | `EDCAP_FE/src/__ tests __/project/project-api.test.ts` | Read | Existing FE test pattern for CRUD API helpers |
| Frontend component | `EDCAP_FE/src/__ tests __/project/ProjectPage.test.tsx` | Read | Existing FE page test pattern for list/detail/edit/delete behavior |
| Frontend E2E | `EDCAP_FE/e2e_tests/tests/project/project.spec.ts` | Read | Existing E2E pattern for page behavior and CRUD flow |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| None used | - | Not applicable | No web or external documents were required for this phase |

## Excluded Sources

| source/path | reason |
|---|---|
| `.env*`, secrets, prod configs | Safety rules forbid reading secrets |
| Build outputs and vendor directories | Not needed for spec selection |
| `EDCAP_BE/src/main/java/**/RepositoryRepositoryAdapter.java` | File does not exist in current workspace |
| `EDCAP_BE/src/main/resources/mapper/RepositoryMapper.xml` | File does not exist in current workspace |
| `EDCAP_BE/src/main/java/**/RepositoryMapper.java` | File does not exist in current workspace |

## Source Limitations

- The raw requirement mixes Repository and Project terminology, but the migration now confirms the Repository table target.
- No live Repository CRUD controller/service/mapper exists in current source to validate implementation details.
- Existing repository domain model is the legacy V1-style `repository` entity, not the ticketed V5+ `tbl_dim_repository` feature.
- Some requirement values conflict with current source conventions, especially ID types, route patterns, and permission shape.

## Assumptions from Sources

- Use the existing `/api/v1/<resource>` route family and raw DTO/list responses unless a confirmed route convention says otherwise.
- Treat V5+ `tbl_` naming, UUID PKs, and soft delete as the confirmed target direction for the new Repository feature.
- Preserve current FE patterns: TanStack Query for server data, `ApiError` for failures, and modal/drawer CRUD UX.
- The repository URL is shown raw in the UI and stored as AES-256-GCM encoded data in the database.
- `project_alias` should be treated as DB-derived Repository response data joined from `tbl_dim_project`.

## Human Confirmation Required

- Confirm whether Repository CRUD is a new implementation or a rewrite of an existing hidden module.
- Confirm the exact permission key / role gate for Repository actions.
