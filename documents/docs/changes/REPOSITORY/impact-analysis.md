# Impact Analysis

**Ticket ID**: REPOSITORY-CRUD  
**Update date**: 2026-06-19

## 1. Content Change Summary

- Add Repository CRUD planning artifacts that map the implementation surface before any code work begins.
- Use the existing platform CRUD pattern as the implementation baseline.
- Lock the current known contract assumptions and the open decision points so implementers do not improvise.

## 2. Directly Affected Files

- `docs/changes/REPOSITORY/source-availability.md`
- `docs/changes/REPOSITORY/source-inventory.md`
- `docs/changes/REPOSITORY/impact-analysis.md`
- `docs/changes/REPOSITORY/impl-plan.md`

## 3. Indirectly Affected Files

- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/App.tsx`
- `EDCAP_FE/src/components/Layout.tsx`
- `EDCAP_FE/src/pages/ProjectPage.tsx`
- `EDCAP_FE/src/pages/OrganizationPage.tsx`
- `EDCAP_FE/src/pages/CustomerPage.tsx`
- `EDCAP_FE/public/locales/en/locale.json`
- `EDCAP_FE/public/locales/ja/locale.json`
- `EDCAP_FE/public/locales/vi/locale.json`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/`
- `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql`
- `EDCAP_BE/src/test/java/com/sdd/platform/`
- `EDCAP_FE/src/__ tests __/`
- `EDCAP_FE/e2e_tests/`

## 4. Caller / Callee Map

- FE page -> `endpoints.repositories.*` helper -> `api.*` -> `/api/v1/repositories`
- FE route guard -> `useAuth()` -> `/api/v1/me`
- BE controller -> Repository service/use case -> persistence port -> adapter/mapper -> `tbl_dim_repository`
- BE delete/update/list/detail flows -> `GlobalExceptionHandler` for error mapping
- Repository service -> project lookup port/use case for parent validation and detail enrichment of `project_alias` from `tbl_dim_project`

## 5. FE Impact

- Add a Repository page with list, drawer-based create/edit/detail, and delete confirmation flow.
- Add route registration under the existing language-first router.
- Add typed repository endpoint helpers to `src/lib/api.ts`.
- Add locale keys for labels, validation text, success/error messages, and deleted-row behavior.
- Reuse current patterns for TanStack Query, drawer forms, server tables, and Popconfirm-based deletes.
- Add FE unit tests for API helper, form normalization, and deleted-row UI restrictions.

## 6. BE Impact

- Add a Repository REST controller under `/api/v1/repositories`.
- Add a Repository use case/service that enforces trimming, required project reference, uniqueness among active rows, and soft delete.
- Add a persistence port and adapter for `tbl_dim_repository`.
- Add request/response DTOs and mapping for list/detail/create/update/delete.
- Add permission checks in the backend as the final authority.
- Add BE unit tests and web tests for validation, not-found, forbidden, duplicate, and soft-delete rules.

## 7. API Contract Impact

- Introduce new `/api/v1/repositories` endpoints for list, detail, create, update, and soft delete.
- Keep success responses raw DTOs or raw DTO lists.
- Keep failure responses as `ErrorResponse`.
- Preserve trace correlation through `traceId`.
- Detail behavior for deleted rows remains governed by the spec and must not be changed silently.

## 8. DTO / Schema / Validation Impact

- Define create/update request DTOs that accept `projectId`, `repo_name_masked`, `host_type`, `default_branch`, and `repo_url_hash` according to the spec.
- Normalize and validate repository name trimming before persistence.
- Validate active-row uniqueness scoped to project.
- Model soft-delete fields and status values in the response DTOs.
- Keep repository URL handling aligned with the spec: UI raw value, DB encoded value.

## 9. DB / Migration Impact

- Use `tbl_dim_repository` only.
- Respect the additive migration already present in `V130__repository_management.sql`.
- Preserve partial unique index behavior for active rows.
- Preserve `delete_flag`, `deleted_at`, and `deleted_by`.
- Do not edit committed migrations during implementation planning.

## 10. Batch / Job / Event Impact

- No batch, job, queue, or event processing is in scope for Repository CRUD.
- The feature is purely synchronous request/response CRUD.
- No webhook or connector paths should be touched.

## 11. Test Impact

- BE unit tests should cover business rules and permission handling.
- BE web tests should cover HTTP contract and error mapping.
- FE unit tests should cover API helper shape, drawer flow, and normalization.
- FE E2E tests should cover the full CRUD journey and deleted-row behavior.
- DB tests should verify schema, partial uniqueness, and soft-delete filtering.

## 12. Operation / Monitoring Impact

- Preserve `traceId` propagation for debugging failures.
- Continue using the platform error handling and logging flow.
- No new monitoring stack or alerting is required for this phase.
- Any future operational runbook should treat soft delete as logical retention, not physical removal.

## 13. Rollout / Rollback Impact

- Rollout should be additive: create the new API and UI surfaces without modifying unrelated features.
- Rollback for implementation work can be done by disabling the new route/page/API wiring and reverting new Repository-specific files.
- DB rollback should rely on a forward migration strategy, not manual edits to committed migrations.
- Because this phase is documentation-only, no production rollback action is required yet.

## 14. Explicit Non-Impact Zones

- Auth bootstrap and session handling are not impacted, because Repository CRUD uses existing authenticated-session patterns only.
- Webhook handlers are not impacted, because Repository CRUD is not event-driven.
- Connector sync and admin connector run flows are not impacted, because their service and route surfaces are separate.
- Audit-log storage is not impacted, because the spec explicitly excludes audit history UI and log-table integration.
- Import/export, bulk operations, and restore flow are not impacted, because they are outside scope.
- Project, Organization, Customer, Team, Role, and unrelated auth features are not impacted except as read-only comparison baselines.

## 15. Evidence Used

- `docs/changes/REPOSITORY/spec-pack.md`
- `docs/changes/REPOSITORY/context.md`
- `docs/changes/REPOSITORY/ticket-rules.md`
- `docs/architecture/route-api-map.md`
- `docs/architecture/fe-be-contract-map.md`
- `docs/architecture/service-layer-map.md`
- `docs/architecture/test-map.md`
- `docs/standards/api-contract.md`
- `docs/standards/backend.md`
- `docs/standards/database.md`
- `docs/standards/testing.md`
- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/pages/ProjectPage.tsx`
- `EDCAP_FE/src/pages/OrganizationPage.tsx`
- `EDCAP_FE/src/pages/CustomerPage.tsx`
- `EDCAP_FE/src/components/Layout.tsx`
- `EDCAP_FE/src/hooks/useAuth.ts`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java`
- `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java`
