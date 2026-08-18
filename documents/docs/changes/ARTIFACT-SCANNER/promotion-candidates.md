# Promotion Candidates

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-17  
**Author**: nk_trung  
**Update date**: 2026-06-17  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-AS-001 | Scanner endpoint and manual-operation flow map | `docs/architecture/route-api-map.md` | Preserve the final `/api/v1/data-ops/artifact-scans` contract and operational read paths for later contributors. | High |
| LD-AS-002 | V4 scanner persistence and current inventory view map | `docs/architecture/repository-db-map.md` | Capture the V4-only run/snapshot/view path and prevent accidental legacy-table reuse. | High |
| LD-AS-003 | Scanner test matrix map | `docs/architecture/test-map.md` | Keep the unit, integration, manual/API, and black-box coverage pattern reusable. | High |
| LD-AS-004 | Metadata-only scanner reminder | `docs/standards/security.md` | Reuse the boundary that scanner stores metadata only and must not persist full markdown content. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-AS-001 | Unknown ticket paths should auto-create a minimal ticket instead of failing the whole run. | `docs/standards/testing.md` or ticket rules | This behavior is now part of the final scanner contract and is easy to regress. | Low |
| RL-AS-002 | Current inventory must be read from the latest view snapshot, not historical rows. | `docs/standards/database.md` | Prevents inconsistent inventory answers when multiple scans exist. | Low |
| RL-AS-003 | Scanner must remain metadata-only and never persist full markdown content. | `docs/standards/security.md` | Core design boundary for future tickets and reviews. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-AS-001 | Use black-box cases as the final observable contract for scanner-like backend features. | `docs/standards/testing.md` | This ticket’s closure was strongest when black-box, BE tests, and manual/API evidence were kept in sync. |
| ST-AS-002 | Keep closure evidence and execution evidence separate. | `docs/standards/testing.md` | `test-results.md` worked well as execution evidence while `report.md` stayed the summary/closure artifact. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-AS-001 | Add scanner routes and manual verification flow | `docs/architecture/route-api-map.md` | Make the final scanner contract easy to rediscover. |
| AD-AS-002 | Document V4 scanner tables and current inventory view | `docs/architecture/repository-db-map.md` | Prevent confusion between V4 scanner persistence and legacy tables. |
| AD-AS-003 | Record scanner test and black-box coverage | `docs/architecture/test-map.md` | Preserve the final verification pattern for future metadata-first tickets. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-AS-001 | Scanner boundary drifts back into parser behavior | Someone adds Markdown parsing inside the scanner flow | Keep parser handoff limited to metadata and source references | Review diff for parsing logic or content persistence |
| FMI-AS-002 | Unknown ticket becomes a hard failure | Ticket path is not found in dimension and code exits early | Preserve auto-create minimal ticket behavior | Missing-ticket test and run result failure |
| FMI-AS-003 | Legacy tables get reused accidentally | New code follows old mapper patterns instead of V4-only path | Review persistence path against V4 schema and current inventory view | DB review and integration test mismatch |
| FMI-AS-004 | Current inventory returns stale data | Query does not read latest snapshot/view semantics | Always read from `vw_artifact_inventory_current` | Latest-vs-oldest inventory comparison test |
| FMI-AS-005 | Phase0 seed or artifact-type mapping drifts | Future changes update file scope without updating seed/config | Keep phase0 file list and artifact types documented together | Full scan plus missing-mapping review |

## Not Promoted

| item | reason |
|---|---|
| Full markdown content persistence | Explicitly out of scope and contrary to the metadata-only scanner boundary. |
| Legacy connector tables or mappers | The final design is V4-only and should not normalize legacy paths. |
| FE-heavy UI expansion beyond manual/test surface | The ticket is backend-centric; UI is only a verification surface. |
| CHANGED_FILES_SCOPED MVP support | Not prioritized for MVP v1 and should stay out of the promoted baseline for now. |

## Human Approval Required

None at this time.
