# Promotion Candidates

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-11
**Author**: nk_trung
**Update date**: 2026-06-11  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-ORG-001 | Organization route and API map | `docs/architecture/route-api-map.md` | Add the new `/organizations` FE route and `/api/v1/organizations` BE endpoints so future work can locate the contract quickly. | High |
| LD-ORG-002 | Organization FE/BE contract mapping | `docs/architecture/fe-be-contract-map.md` | Record request/response fields, 403/409 behaviors, and localized error key flow for the new screen. | High |
| LD-ORG-003 | Organization repository / DB mapping | `docs/architecture/repository-db-map.md` | Capture `tbl_dim_organization`, soft-delete metadata, `version`, and partial unique indexes for active rows. | High |
| LD-ORG-004 | Organization test map | `docs/architecture/test-map.md` | Record the BE unit, integration, FE, E2E, and black-box coverage pattern used for this ticket. | Medium |
| LD-ORG-005 | Separate execution evidence from closure narrative | `docs/knowledge/` | Keep `test-results.md` for command/result/evidence and `report.md` for final closure, risks, and open issues. | Medium |
| LD-ORG-006 | Record a concise verification summary alongside trace artifacts | `docs/knowledge/` | Short summaries make review and archive faster without replacing the full evidence trail. | Low |
| LD-ORG-007 | Record clean verification artifacts before sign-off | `docs/knowledge/` | Reproducible final-state checks prevent one-off exceptions from becoming the default. | Low |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-ORG-001 | Use partial unique indexes on `deleted_at IS NULL` for soft-delete reuse scenarios | `docs/standards/database.md` | This ticket proved the pattern is essential for safe code/name reuse after soft delete. | Low |
| RL-ORG-002 | Use locale-aware shared date formatting helper on translated pages | `docs/standards/frontend.md` | Organization date display needed `src/utils/dayjs` locale-based formatting instead of a one-off helper. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-ORG-001 | Standardize soft-delete optimistic locking with atomic `version` checks | `docs/standards/backend.md` | The Organization ticket depends on atomic update/delete SQL to prevent lost updates. |
| ST-ORG-002 | Preserve current-language redirect behavior for auth guards | `docs/standards/frontend.md` | Non-admin Organization access required logout plus redirect to `/:lang/login`. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-ORG-001 | Add Organization flow to FE routing/navigation architecture | `docs/architecture/route-api-map.md` | Keeps Organization route and nav behavior visible to future contributors. |
| AD-ORG-002 | Document Organization BE layering and 403/409 response flow | `docs/architecture/fe-be-contract-map.md` | The ticket introduced a clear contract for ADMIN-only access and stale-version conflicts. |
| AD-ORG-003 | Document Organization table constraints and soft-delete reuse | `docs/architecture/repository-db-map.md` | The DB shape now includes code/name partial unique indexes and versioned soft delete. |
| AD-ORG-004 | Record the Organization test matrix | `docs/architecture/test-map.md` | Captures the final verified coverage pattern for FE, BE, E2E, and black-box checks. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-ORG-001 | Migration IT fails because Docker/Testcontainers is unavailable | Running `OrganizationMigrationIntegrationTest` on a machine without Docker pipe access | Gate the test with a Docker-enabled runner or document the environment requirement | Test fails with `\\.\pipe\docker_engine` access/connectivity errors |
| FMI-ORG-002 | Raw translation keys appear in the UI | Missing `Pages.Organization.*` locale entry or typo in locale JSON | Normalize keys before merge and validate `en/ja/vi` files | FE displays untranslated key text or a fallback string |
| FMI-ORG-003 | Lost update / delete overwrites newer data | Update/delete SQL does not include atomic `version` check | Require `version` in request and check affected row count | Stale edit/delete returns 200 or changes data unexpectedly |
| FMI-ORG-004 | Soft-deleted reuse becomes blocked | Partial unique index is created without `deleted_at IS NULL` | Keep uniqueness scoped to active rows only | Duplicate create/update fails for a code/name that exists only in Deleted |
| FMI-ORG-005 | Non-admin redirect loops or loses language context | Guard logs out repeatedly or drops `/:lang` during redirect | Make the guard idempotent and preserve current language | Browser lands on the wrong login route or keeps bouncing |

## Not Promoted

| item | reason |
|---|---|
| Dedicated audit-log storage | Explicitly out of scope for this ticket; keep it as a project decision rather than a reusable rule. |
| Customer / Project child-data flow restrictions | Explicitly out of scope for Organization and should stay in the child-domain tickets. |
| FE automated Organization tests as a new rule | Tests are already covered in this ticket; no additional rule is needed yet. |
| Attach a concise Playwright summary alongside trace artifacts | Useful for this ticket, but too implementation-specific to become a generic knowledge rule. |
| Physical delete behavior | Forbidden by spec, so it is already a direct requirement rather than a reusable promotion candidate. |
| Local-only PR/CI evidence packaging | Useful for this ticket, but too process-specific to become a general rule. |

## Human Approval Required

- Confirm whether any living-doc candidates should be promoted now.
- Confirm whether the knowledge-pattern items belong in `docs/knowledge/` or should stay ticket-local.
