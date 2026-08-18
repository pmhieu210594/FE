# Context

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09       
**Author**: nk_trung                         
**Update date**: 2026-06-10    

## Screen / API / Batch / Related Job

| type | item | status | note |
|---|---|---|---|
| FE screen | Customer Management list | planned / not implemented | Customer list/search/filter screen in administration area. Route follows the Organization style as `/:lang/customers` with ADMIN-only guard in FE. |
| FE screen | Customer create/edit | planned / not implemented | Create/edit form must include active Organization selector, customer alias/name, classification, status/version fields as required by spec. |
| FE screen | Customer detail | planned / not implemented | Detail view only for Customer master data; no Project/Repository child list in this release. |
| FE route | Login route `/:lang/login` | existing | Confirmed by `EDCAP_FE/src/App.tsx`. Non-ADMIN Customer access must logout/redirect here. |
| FE route | Admin route `/:lang/admin` | existing | Confirmed by `EDCAP_FE/src/App.tsx`; current AdminPage is connector admin, not Customer Management. |
| BE API | `GET /api/v1/customers` | planned / not implemented | List/search/filter Customers; default list only shows active/non-soft-deleted Customers. |
| BE API | `GET /api/v1/customers/{customerId}` | planned / not implemented | Detail; returns `version`. |
| BE API | `POST /api/v1/customers` | planned / not implemented | Create; validate Organization active/non-soft-deleted and alias uniqueness. |
| BE API | `PUT /api/v1/customers/{customerId}` | planned / not implemented | Update; require numeric `version`; reject deleted Customer. |
| BE API | `PATCH /api/v1/customers/{customerId}/delete` | planned / not implemented | Soft delete; require `version`; cascade soft delete to child Projects/descendants. Uses the same PATCH `/delete` pattern as Organization. |
| BE lookup/API dependency | Active Organization lookup for dropdown | dependency / not implemented | Customer create/edit needs active/non-deleted Organizations. Do not implement Organization Management UI in this ticket. |
| Batch / Job | Customer batch/job | not applicable | No Customer-specific batch/job/event requirement found in spec or source. |
| Event / Webhook | Connector/webhook flows | not impacted | GitHub/Jira/CircleCI ingestion flows are out of scope. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| BE controller package placement | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Use REST controller placement/package pattern only. Do **not** copy its `Map.of("error", ...)` error-body pattern for Customer authorization. |
| BE use case/service placement | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/...` | Put Customer business logic in application/use case layer, not in controller. |
| BE repository port pattern | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/*RepositoryPort.java` | Create a Customer repository port if needed; controller/service should not depend on infrastructure directly. |
| BE repository adapter pattern | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/*RepositoryAdapter.java` | Use adapter to implement persistence port. |
| BE mapper pattern | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/*Mapper.java` | Use mapper layer for DB row/domain conversion if following current architecture. |
| BE error envelope | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` and `GlobalExceptionHandler.java` | Use traceId/error response convention; Customer keeps the current `message` field as the translated message key for this ticket. |
| FE authenticated route pattern | `EDCAP_FE/src/App.tsx` | `RequireAuth` redirects unauthenticated users to `/:lang/login`; Customer additionally needs ADMIN-only behavior. |
| FE layout/navigation pattern | `EDCAP_FE/src/components/Layout.tsx` | Admin-only nav filtering exists via `adminOnly`; Customer menu should follow this pattern once route is confirmed. |
| FE API helper | `EDCAP_FE/src/lib/api.ts` | Use shared `api.get/post/put/del` and endpoint helper style; do not bypass credentials/session handling. |
| FE page/API query style | `EDCAP_FE/src/pages/AdminPage.tsx` | TanStack Query usage pattern can be referenced for query/mutation/invalidate behavior, but Admin connector UI itself is not a Customer UI pattern. |
| DB migration style | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Current table definitions and triggers are source of truth. Add new migration later; do not edit old V4 for implementation. |
| FE i18n resource location | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | Add Customer keys in all three locales; files currently contain BOM and JSON structure under `Layout` and `Pages`. |

## Allowed common components
| component | path | usage note |
|---|---|---|
| Layout | `EDCAP_FE/src/components/Layout.tsx` | Use for authenticated app shell/navigation. Customer route should integrate here when implemented. |
| Button | `EDCAP_FE/src/components/ui/button.tsx` / `button/index.tsx` | Use existing button component instead of raw inconsistent buttons where practical. |
| Card | `EDCAP_FE/src/components/ui/card.tsx` | Useful for Customer list/detail/form layout if consistent with current UI. |
| Badge | `EDCAP_FE/src/components/ui/badge.tsx` | Can display status/classification. |
| Data table / server table | `EDCAP_FE/src/components/ui/data-table/index.tsx`, `server-table/index.tsx`, `table.tsx` | Candidate for Customer list after verifying props/behavior in implementation phase. |
| Search | `EDCAP_FE/src/components/ui/search/index.tsx` | Candidate for search/filter UI after verifying API/props. |
| Form generator/input/select | `EDCAP_FE/src/components/ui/form/*` | Candidate for create/edit form and Organization selector after verifying project usage. |
| `useAuth` / `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Must be used/extended for non-ADMIN logout/redirect behavior. |
| `useLanguage` | `EDCAP_FE/src/hooks/useLanguage.ts` | Keep language-first routing and locale behavior. |
| `api` / `endpoints` | `EDCAP_FE/src/lib/api.ts` | Required path for Customer API helper unless project standard changes. |
| TanStack Query | Existing usage in `AdminPage.tsx` | Use for list/detail/mutation cache handling if FE implementation follows current app style. |

## Forbidden common components
| component | reason |
|---|---|
| Direct `fetch` or raw axios in Customer pages | Bypasses existing `credentials: "include"`, trace/error handling, and endpoint conventions in `src/lib/api.ts`. |
| `AdminController` authorization response body pattern | Current `ResponseEntity.status(403).body(Map.of("error", "ADMIN role required"))` is a known inconsistent pattern; Customer must use standard 403/error handling. |
| Connector Admin page as business/UI model | `AdminPage.tsx` is connector sync admin, not CRUD master UI; use only query/mutation style, not business flow. |
| Physical DB `DELETE` for Customer | Spec requires soft delete only. |
| Project/Repository child list in Customer detail | Explicitly out of scope. |
| Customer dashboard/KPI/report/export components | Explicitly out of scope. |
| Any Organization Management UI implementation inside Customer ticket | Organization Management is out of scope; Customer may only depend on active Organization lookup/validation. |

## List of methods that actually exist
| method/class | path | usage |
|---|---|---|
| `RequireAuth` | `EDCAP_FE/src/App.tsx` | Existing unauthenticated guard; redirects to `/:lang/login`. |
| `HomeRedirect` | `EDCAP_FE/src/App.tsx` | Redirects authenticated users to admin and unauthenticated users to login. |
| `DefaultLanguageRedirect` | `EDCAP_FE/src/App.tsx` | Ensures default language path. |
| `Layout` | `EDCAP_FE/src/components/Layout.tsx` | App shell and admin-only nav filter. |
| `logout` | `EDCAP_FE/src/hooks/useAuth.ts` | Existing logout helper; should be used for non-ADMIN Customer access behavior if implementation supports it. |
| `api.get` / `api.post` / `api.put` / `api.del` / `api.patch` | `EDCAP_FE/src/lib/api.ts` | Existing shared HTTP wrapper. `api.patch` is available for Customer soft delete. |
| `endpoints.me` / `availableConnectors` / `runConnector` / `connectorRuns` | `EDCAP_FE/src/lib/api.ts` | Existing typed endpoint helper examples. No Customer endpoint exists. |
| `AdminPage` | `EDCAP_FE/src/pages/AdminPage.tsx` | Existing page using TanStack Query/mutation. Not Customer-specific. |
| `AdminController#connectors` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing admin API for connectors. |
| `AdminController#runConnector` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing admin-only action with inline 403; do not copy error pattern. |
| `AdminController#runHistory` | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Existing run history API. |
| `GlobalExceptionHandler#handleNotFound` | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Existing 404 mapping. |
| `GlobalExceptionHandler#handleDomain` | same | Existing DomainException -> 400 mapping. |
| `GlobalExceptionHandler#handleApplication` | same | Existing ApplicationException -> 409 mapping. |
| `GlobalExceptionHandler#handleValidation` | same | Existing validation -> 400 mapping. |
| `AppUser.Role` | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Existing enum: `VIEWER`, `EDITOR`, `ADMIN`. |
| `CurrentUser` | `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentUser.java` | Existing controller argument annotation for authenticated local user. |
| `tbl_dim_customer` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing table. |
| `tbl_dim_organization` | same | Existing parent table. |
| `tbl_dim_project` | same | Existing child table with FK to Customer. |

## Forbidden methods / methods that do not exist
| method/API | reason | alternative |
|---|---|---|
| `CustomerController` | Not found in current BE source. | Create later in implementation phase if approved. |
| `CustomerService` / `CustomerUseCase` | Not found in current BE source. | Create later under application/usecase following architecture. |
| `CustomerRepositoryPort` | Not found in current BE source. | Create later if Customer persistence is implemented. |
| `CustomerRepositoryAdapter` | Not found in current BE source. | Create later under infrastructure/persistence/adapter. |
| `CustomerMapper` | Not found in current BE source. | Create later under infrastructure/persistence/mapper if needed. |
| `CustomerCreateRequest` / `CustomerUpdateRequest` / `CustomerResponse` | Not found in current BE source. | Create DTOs later under web DTO package or dedicated Customer DTO package. |
| `endpoints.customers.*` | Not found in `EDCAP_FE/src/lib/api.ts`. | Add typed endpoint helpers later. |
| `CustomerPage` / `CustomerListPage` / `CustomerForm` | Not found in FE source. | Create later if implementation phase proceeds. |
| `api.patch` | Found in `EDCAP_FE/src/lib/api.ts`. | Use for Customer soft delete to match the Organization pattern. |
| Direct SQL physical delete | Violates soft delete requirement. | Update `status`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `version`. |
| `organizationService.*` as existing dependency | Organization-specific implementation is not present in current source. | Validate Organization through planned repository/query or wait for Organization implementation dependency. |

## DTO / Entity / Table / Migration mapping
| layer | name | path | Note |
|---|---|---|---|
| DB table | `tbl_dim_customer` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Existing Customer table; keep name. |
| DB column | `customer_id` | same | UUID PK. |
| DB column | `organization_id` | same | FK to `tbl_dim_organization(organization_id)`. Required. |
| DB column | `customer_alias` | same | Required alias/name, `VARCHAR(255)`. Existing unique constraint is case-sensitive normal unique. |
| DB column | `classification` | same | `VARCHAR(50) NOT NULL DEFAULT 'INTERNAL'`. Spec allows `INTERNAL` / `EXTERNAL`. |
| DB column | `status` | same | `record_status NOT NULL DEFAULT 'ACTIVE'`; deleted Customer should use `DELETED`. |
| DB column | `created_at`, `created_by`, `updated_at`, `updated_by` | same | Existing audit metadata. Trigger updates `updated_at`. |
| DB missing column | `deleted_at` | not present | Needed for soft delete and active-scope partial unique index. |
| DB missing column | `deleted_by` | not present | Needed for audit. |
| DB missing column | `version` | not present | Needed for optimistic locking. |
| DB existing constraint | `uq_customer_alias_per_org UNIQUE (organization_id, customer_alias)` | V4 | Must be replaced/adjusted later if alias reuse after soft delete and case-insensitive uniqueness are implemented. |
| DB index | `idx_customer_org` | V4 | Existing index on `organization_id`. |
| DB child table | `tbl_dim_project.customer_id` | V4 | Used to cascade Customer soft delete through the child tree. |
| BE domain/entity | Customer model | not found | Candidate to create later. |
| BE DTO | Customer request/response DTOs | not found | Candidate to create later. Must include `version` on update/delete. |
| FE type | Customer interfaces | not found | Candidate to create later in FE source. |
| Migration | Customer alter migration | not found | Candidate to create later. Do not modify old V4. |

## formItemNm / SEQNO / Master Data / Code Value Mapping
| display/item | internal value | source | note |
|---|---|---|---|
| Customer alias/name | `customer_alias` | spec + V4 | Required, max 255. No multilingual alias/name in this release. |
| Organization | `organization_id` | spec + V4 | Required; only active/non-soft-deleted Organizations selectable (`status = 'ACTIVE' AND deleted_at IS NULL`). |
| Classification: Internal | `INTERNAL` | spec + V4 default | No master/config UI in this ticket. Treat as controlled code value/enum candidate. |
| Classification: External | `EXTERNAL` | spec | No DB enum found; `classification` is `VARCHAR(50)`. Validate in BE. |
| Status: Active | `ACTIVE` | `record_status` enum in V4 | Persisted status. Default for new Customers. |
| Status: Deleted | `DELETED` | `record_status` enum in V4 | Persisted status for soft delete. |
| Status filter: All | request filter only | spec | Not a persisted DB value. |
| formItemNm | N/A | not found | No `formItemNm` usage found for Customer in current source/spec. |
| SEQNO | N/A | not found | No Customer SEQNO requirement found. |
| Master data management for classification | out of scope | spec | Do not build separate classification master/config UI. |

## Multilingual Note

- Customer user-facing labels/messages must be added to `EDCAP_FE/public/locales/en/locale.json`, `ja/locale.json`, and `vi/locale.json`.
- Spec and the current project convention are aligned on using `message` as the translated key for this ticket.
- Current FE `src/lib/api.ts` reads `body.message`; older `src/utils/api.ts` has `translateApiMessage`. Customer implementation should keep one consistent API/i18n path and avoid raw English user-facing backend messages.
- Suggested Customer keys currently mix `Pages.Customer.*` and lowercase `customer.*` keys in spec. Phase 3 should normalize key convention before implementation.
- Keep all JSON locale files valid UTF-8; existing locale files contain a BOM, so edit carefully to avoid mojibake.

## Encoding / Mojibake Note

- Vietnamese and Japanese labels must remain UTF-8.
- Do not copy garbled characters from generated artifacts or terminal output.
- Validate locale JSON syntax after updates.
- Avoid using production/customer-sensitive aliases as sample test data.

## Log / Audit / Operation Note

- Do not log secrets, OAuth tokens, session IDs, or excessive Customer payloads.
- Customer create/update/soft-delete should be auditable through `created_by`, `updated_by`, `deleted_by`, timestamps, and traceId/error logs.
- Soft delete must update audit metadata and increment `version` when implemented.
- Cascade delete should be observable through business success/error and traceId, but should not dump child records to logs.
- Migration that changes uniqueness must be rollout-safe and preserve existing data.

## Ticket-Specific Constraints

- Customer ticket must not implement Organization Management.
- Customer ticket must not implement Project Management or Project/Repository detail lists.
- Customer must use existing `tbl_dim_customer`; do not rename or recreate the table.
- Existing table may be altered only via new migration when implementation phase begins.
- Organization dependency must be validated in BE, not only hidden in FE dropdown.
- Customer-specific BE/FE code does not exist now; any planned class/method must be marked as future implementation, not existing source.
