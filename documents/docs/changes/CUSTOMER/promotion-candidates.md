# Promotion Candidates

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-CUS-001 | Customer route and API map | `docs/architecture/route-api-map.md` | Record the new `/customers` route and `/api/v1/customers` endpoints for future navigation and contract lookup. | High |
| LD-CUS-002 | Customer FE/BE contract mapping | `docs/architecture/fe-be-contract-map.md` | Capture request/response shape, localized message-key behavior, and `403/409` handling. | High |
| LD-CUS-003 | Customer repository / DB mapping | `docs/architecture/repository-db-map.md` | Document `tbl_dim_customer`, soft-delete columns, optimistic locking, and active-scope uniqueness. | High |
| LD-CUS-004 | Customer test map | `docs/architecture/test-map.md` | Preserve the BE, FE, E2E, and black-box coverage pattern used for this ticket. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-CUS-001 | Use active-scope uniqueness with `deleted_at IS NULL` for soft-delete reuse scenarios | `docs/standards/database.md` | This ticket confirms the safe reuse pattern for code/alias values after soft delete. | Low |
| RL-CUS-002 | Preserve locale-aware auth redirect behavior for non-ADMIN access | `docs/standards/security.md` | Customer requires logout and redirect to `/:lang/login` when a non-ADMIN opens the screen. | Low |
| RL-CUS-003 | Treat backend message keys as the FE translation contract | `docs/standards/error-handling.md` | The Customer flow depends on `message`/message-key translation for user-facing errors. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-CUS-001 | Add a standard for documenting step-by-step E2E scenarios beside black-box cases | `docs/standards/testing.md` | This ticket uses explicit E2E scenario steps and it helps future tickets stay reviewable. |
| ST-CUS-002 | Keep closure evidence separate from execution evidence | `docs/standards/testing.md` | `test-results.md` is now the execution evidence, while `report.md` stays the closure summary. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-CUS-001 | Add Customer flow to route/API architecture | `docs/architecture/route-api-map.md` | Keep the new screen and its endpoints visible to future contributors. |
| AD-CUS-002 | Document Customer BE layering and error flow | `docs/architecture/fe-be-contract-map.md` | Capture ADMIN-only access, message-key translation, and conflict handling. |
| AD-CUS-003 | Document Customer table constraints and soft-delete reuse | `docs/architecture/repository-db-map.md` | The DB shape includes `deleted_at`, `deleted_by`, `version`, and active-scope uniqueness. |
| AD-CUS-004 | Record the Customer test matrix | `docs/architecture/test-map.md` | Preserve the final verified coverage pattern for FE, BE, E2E, and black-box checks. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-CUS-001 | Playwright locator strict-mode collision | Global text match targets a row/list item and a dropdown option at the same time | Scope option selection to the active dropdown container or use stable test IDs | Playwright reports strict-mode violation during option selection |
| FMI-CUS-002 | Soft-delete reuse becomes blocked | Partial unique index is created without `deleted_at IS NULL` | Keep uniqueness scoped to active rows only | Reusing code/alias from a soft-deleted Customer fails unexpectedly |
| FMI-CUS-003 | Stale version overwrite succeeds | Update/delete SQL omits atomic `version` check | Require `version` and verify affected row count | Update/delete returns 200 while overwriting newer data |
| FMI-CUS-004 | Untranslated error text appears in the UI | Missing or mismatched locale key | Validate locale files and message-key mapping | UI shows raw backend keys or fallback text |

## Not Promoted

| item | reason |
|---|---|
| Dedicated audit-log storage | Explicitly out of scope for this ticket. |
| Physical delete behavior | Forbidden by spec; soft delete only is the requirement. |
| Cross-browser matrix as a formal gate | Useful for later hardening, but not required for this ticket closure. |
| Performance/load benchmark standard | No performance NFR was defined for this CRUD ticket. |

## Human Approval Required

None at this time.
