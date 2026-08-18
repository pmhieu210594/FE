# Context

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-25

## Screen / API / Batch / Related Job

### Screen
- PM Dashboard landing page
- Main ticket table
- Read-only detail drawer
- Empty state with filter reset

### Existing related APIs
- `GET /api/v1/auth/me`
- `GET /api/v1/me`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `GET /api/v1/repositories`
- `GET /api/v1/repositories/{id}`
- `GET /api/v1/traceability/{ticketId}`

### Planned PM Dashboard APIs from spec-pack, not yet implemented
- `GET /api/v1/pm/dashboard/summary`
- `GET /api/v1/pm/dashboard/tickets`
- `GET /api/v1/pm/dashboard/tickets/{ticketId}/detail`
- `POST /api/v1/pm/dashboard/export`
- `POST /api/v1/pm/dashboard/refresh`

### Batch / Job
- No batch or scheduled job is confirmed in the current source for PM Dashboard refresh.
- Do not invent a refresh worker, cron, or queue name until the refresh strategy is confirmed.

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| FE page data loading and mutations | `EDCAP_FE/src/pages/ProjectPage.tsx` | Use `useQuery` / `useMutation`, call `endpoints.*`, and keep HTTP access inside `lib/api.ts` |
| FE read-only detail composition | `EDCAP_FE/src/pages/traceability/TraceabilityPage.tsx` | Use `Card`, `Badge`, and query-driven rendering for read-only summary/detail panels |
| FE table + search + action layout | `EDCAP_FE/src/pages/CustomerPage.tsx` | Use `CServerTable`, `CSearch`, `CTooltip`, `message`, and localized labels |
| BE controller thinness | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Controller delegates to service and stays thin |
| BE read-only service pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/traceability/TraceabilityService.java` | `@Transactional(readOnly = true)`, repository port, not-found handling, no web-layer leakage |
| BE auth/login pattern | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Standard controller/service split and centralized auth logic |

## Allowed common components

| component | path | usage note |
|---|---|---|
| `useQuery`, `useMutation`, `useQueryClient` | `@tanstack/react-query` | For server state and mutation invalidation |
| `api`, `endpoints` | `EDCAP_FE/src/lib/api.ts` | The approved FE HTTP boundary |
| `Card`, `Badge` | `EDCAP_FE/src/components/ui/*` | Good fit for summary cards and score/status chips |
| `CButton`, `CSearch`, `CTooltip` | `EDCAP_FE/src/components/ui/*` | Use for toolbar, search, and action affordances |
| `CServerTable` | `EDCAP_FE/src/components/ui/server-table` | Reuse if a paged ticket table is rendered as a server-backed table |
| `CDrawerForm` | `EDCAP_FE/src/components/ui/drawer` | Use only if the detail view is implemented as a read-only drawer shell |
| `message` | `antd` | Toasts for fetch success/failure in FE |
| `GlobalExceptionHandler` / `ErrorResponse` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception` | Standard backend error envelope and traceId behavior |
| `@CurrentUser`, `AppUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security` and domain model | Use for caller context if new BE endpoints are later added |
| `@Transactional(readOnly = true)` | Spring | Use for read-only summary/list/detail flows |

## Forbidden common components

| component | reason |
|---|---|
| Direct `fetch` in page components | Bypasses the typed `endpoints` boundary and makes error handling inconsistent |
| New ad-hoc HTTP helper outside `lib/api.ts` | Duplicates the approved FE network boundary |
| Web layer importing infrastructure classes | Breaks hexagonal layering |
| `CForm` / mutation forms for PM Dashboard read-only screens | The ticket is operational and read-only |
| Ad-hoc backend error bodies | Must use centralized `ErrorResponse` / `GlobalExceptionHandler` |
| Non-existent PM Dashboard helpers such as `endpoints.pmDashboard.*` | No such helper exists yet |
| Invented job/worker names for refresh | Refresh strategy is still unresolved in spec-pack |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `api.get`, `api.post`, `api.put`, `api.patch`, `api.del` | `EDCAP_FE/src/lib/api.ts` | Base HTTP helpers for FE |
| `endpoints.projects.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Reference for dashboard-like FE endpoint helpers |
| `endpoints.repositories.list/get/create/update/softDelete` | `EDCAP_FE/src/lib/api.ts` | Reference for filter/list/detail patterns |
| `endpoints.traceability.get` | `EDCAP_FE/src/lib/api.ts` | Reference for read-only detail fetch |
| `ProjectController.list/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Thin controller pattern |
| `RepositoryController.list/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/RepositoryController.java` | Thin controller pattern |
| `TraceabilityController.get` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TraceabilityController.java` | Read-only GET endpoint pattern |
| `AuthController.login/logout` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AuthController.java` | Auth endpoint pattern |
| `MeController.me` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Current-user endpoint pattern |
| `ProjectService.search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/ProjectService.java` | Business rule + authorization pattern |
| `RepositoryService.search/get/create/update/softDelete` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/RepositoryService.java` | Business rule + read/write pattern |
| `TraceabilityService.getTraceability` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/traceability/TraceabilityService.java` | Read-only use case pattern |
| `AuthTokenService.issueToken/parseAndValidate/issueRefreshToken/hashToken` | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AuthTokenService.java` | Token handling reference only |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `endpoints.pmDashboard.*` | No PM Dashboard helper exists in `lib/api.ts` | Add only after later phase contract is approved |
| `PmDashboardController` | No such controller exists in the current source | Plan the controller in a later phase only if the contract is locked |
| `PmDashboardService` | No such service exists in the current source | Plan later, do not invent methods now |
| `GET /api/v1/pm/dashboard/*` | No such route exists yet | Use existing APIs as reference only |
| Direct `fetch("/api/v1/...")` in page code | Bypasses typed helper and standard error handling | Use `endpoints.*` |
| Web-to-infrastructure direct calls | Breaks hexagonal architecture | Use application service and ports |
| `PATCH /api/v1/projects/{id}/delete` for PM Dashboard work | Not part of this ticket scope | Keep the dashboard read-only |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| FE DTO | `ProjectPageResponse`, `RepositoryPageResponse`, `TraceabilityResponse` | `EDCAP_FE/src/lib/api.ts` | Reference response-shape patterns |
| FE DTO | PM Dashboard response DTOs | not yet implemented | Add only if the API contract is later approved |
| BE DTO | `ProjectDtos`, `RepositoryDtos`, `TraceabilityDtos`, `Dtos` | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/` | Reference mapping style |
| BE DTO | PM Dashboard DTOs | not yet implemented | Keep as planning-only until contract is fixed |
| Domain model | `Project`, `RepositoryModel`, `AppUser` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/` | Reference only |
| Table | `tbl_dim_ticket`, `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_phase` | V4 schema | Master/filter sources for dashboard context |
| Table | `tbl_fact_ticket_phase_status` | V4 schema | Blocked / phase delay source |
| Table | `tbl_fact_artifact_snapshot` | V4 schema | Missing evidence source |
| Table | `tbl_dim_artifact_type` | V4 schema | Required artifact source |
| Table | `tbl_fact_evidence_quality_score` | V4 schema | EQS score and breakdown source |
| Table | `tbl_fact_risk` | V4 schema | Risk signal source |
| Table | `tbl_fact_quality_gate` | V4 schema | CI fail source |
| Table | `tbl_dim_member_pseudonym` | V4 schema | Owner display source |
| Migration | PM Dashboard snapshot migration | not yet implemented | Do not add a migration unless the read-model decision is approved |
| Migration | `raw/database_design.md` proposed tables | non-authoritative | Do not treat as direct migration input |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| Project filter | `project_id` | `tbl_dim_project` / FE query param | Use active projects only if options are loaded dynamically |
| Sprint / Period filter | `sprint_key` / `period_key` | dashboard query params | No SEQNO source confirmed |
| Repository filter | `repository_id` | `tbl_dim_repository` | Use active repositories only if options are loaded dynamically |
| Phase filter | `phase_code` | `tbl_dim_phase` | Use phase code values from the schema |
| Privacy filter/card | role-based access label | spec-pack, permission matrix pending | Display only role-based text, not personal info |
| Updated timestamp | `updated_at` | read model / source tables | Show last refresh time |
| EQS score | numeric score | `tbl_fact_evidence_quality_score.score` | Aggregate metric, not a badge-only status |
| Score band | `score_band` | `tbl_fact_evidence_quality_score.score_band` | Enum values: EXCELLENT / GOOD / WARNING / RISKY / CRITICAL |
| Risk level | `severity_level` | `tbl_fact_risk.severity` | Enum values: INFO / LOW / MEDIUM / HIGH / CRITICAL |
| Ticket status | `ticket_status` | `tbl_dim_ticket` | Relevant for waiting-review / lifecycle interpretation |
| formItemNm | N/A | no form master source confirmed | Do not invent form metadata for this ticket |
| SEQNO | N/A | no sequence master source confirmed | Use explicit UI order from the spec instead |

## Multilingual Note

- Keep all UI strings behind `i18next` keys in FE.
- Do not hardcode PM Dashboard labels in components unless they already follow the repo's i18n convention.
- Existing docs contain mixed English and Vietnamese; new artifacts should stay readable and avoid creating more mixed-encoding noise.

## Encoding / Mojibake Note

- Several source docs in this ticket folder already contain mojibake from prior editing.
- New artifacts should be written in clean UTF-8 and should not copy corrupted text from source docs.
- Prefer ASCII in planning artifacts unless a non-ASCII character is required by an approved existing pattern.

## Log / Audit / Operation Note

- Use the standard `ErrorResponse` shape and `traceId` correlation behavior from the existing backend.
- Do not log raw evidence content, personal names, or secret values.
- Dashboard actions are read-only in this ticket; avoid adding write logs or mutation audit records unless later spec work requires it.
- If export or refresh is later implemented, keep permission checks server-side and log operational failures with `traceId`.

## Ticket-Specific Constraints

- Phase 2 is planning only: no source implementation in this step.
- Do not resolve EQS formula, score thresholds, or read-model strategy by guess.
- Open Issues, Exception, and auth decisions are now anchored by the current PM-DASHBOARD spec-pack; keep them aligned with the latest accepted decision log.
- Do not create a PM Dashboard snapshot table or migration unless a later phase explicitly approves that path.
- Do not use the stale `docs/architecture/overview.md` JWT wording as the final auth decision; `docs/standards/security.md` is the stronger current source.
- Keep the dashboard operational and read-only; no personal ranking or productivity scoring.
