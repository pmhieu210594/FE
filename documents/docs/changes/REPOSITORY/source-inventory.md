# Source Inventory

**Ticket ID**: REPOSITORY-CRUD  
**Update date**: 2026-06-19

## Read First

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
- `.claude/rules/20-architecture.md`
- `.claude/rules/40-testing.md`

## FE Source

### Direct candidates

- `EDCAP_FE/src/lib/api.ts`
- `EDCAP_FE/src/App.tsx`
- `EDCAP_FE/src/components/Layout.tsx`
- `EDCAP_FE/src/pages/ProjectPage.tsx`
- `EDCAP_FE/src/pages/OrganizationPage.tsx`
- `EDCAP_FE/src/pages/CustomerPage.tsx`
- `EDCAP_FE/src/components/ui/drawer/index.tsx`
- `EDCAP_FE/src/components/ui/server-table/index.tsx`
- `EDCAP_FE/src/components/ui/search/index.tsx`
- `EDCAP_FE/src/hooks/useAuth.ts`

### Likely supporting files

- `EDCAP_FE/src/lib/queryClient.ts`
- `EDCAP_FE/src/lib/utils.ts`
- `EDCAP_FE/src/components/ui/button/index.tsx`
- `EDCAP_FE/src/components/ui/badge.tsx`
- `EDCAP_FE/src/components/ui/tooltip.tsx`
- `EDCAP_FE/public/locales/en/locale.json`
- `EDCAP_FE/public/locales/ja/locale.json`
- `EDCAP_FE/public/locales/vi/locale.json`

## BE Source

### Direct candidates

- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/`
- `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql`
- `EDCAP_BE/src/main/resources/mapper/ProjectMapper.xml` (or current equivalent) for `tbl_dim_project` join/reference patterns
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Repository.java`

### Supporting files to compare against

- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/ProjectRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/OrganizationRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/CustomerRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java`

## Tests

### Existing BE tests

- `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/governance/SafetyPackServiceTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestServiceTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/SafetyPackStatusRepositoryAdapterTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityScanRepositoryAdapterTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/web/exception/GlobalExceptionHandlerTest.java`

### Existing FE tests

- `EDCAP_FE/src/__ tests __/auth/useAuth.test.tsx`
- `EDCAP_FE/src/__ tests __/project/ProjectPage.test.tsx`
- `EDCAP_FE/src/__ tests __/organization/OrganizationPage.test.tsx`
- `EDCAP_FE/src/__ tests __/customer/CustomerPage.test.tsx`

## DB / Migration

- `EDCAP_BE/src/main/resources/db/migration/V130__repository_management.sql`
- `EDCAP_BE/src/main/resources/db/migration/V120__project_management.sql`
- `EDCAP_BE/src/main/resources/db/migration/V5__alter_tbl_dim_organization_for_management.sql`
- `tbl_dim_project` schema and join behavior for resolving `project_alias`

## Non-source inputs

- Spec and rules documents in `docs/changes/REPOSITORY/`
- Architecture and standards documents under `docs/architecture/` and `docs/standards/`
- Internal rule files under `.claude/rules/`
