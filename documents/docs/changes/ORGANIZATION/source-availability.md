# Source Availability      

**Ticket ID**: ORGANIZATION        
**Create date**: 2026-06-10      
**Author**:  nk_trung
**Update date**: 2026-06-10     

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Source mới nhất | `docs/changes/ORGANIZATION/spec-pack.md` | read | high | PM / Tech Lead | Căn cứ AC, scope, business rule, API/DB/i18n requirement | Spec contains a few message-key/copy typos that must not be copied blindly | always-read |
| Ticket context | `docs/changes/ORGANIZATION/context.md` | read | high | PM / Tech Lead | Phase 2 context: existing/non-existing methods, components, DB decisions | Must stay aligned with source inspection | always-read |
| Ticket rules | `docs/changes/ORGANIZATION/ticket-rules.md` | read | high | PM / Tech Lead | Ticket-specific do/don't rules | Implementation must not bypass these rules | always-read |
| Architecture docs | `docs/architecture/` | read | high | Architect / Tech Lead | FE/BE/DB/test/contract context | Some docs describe known violations or pending decisions; verify with source | always-read |
| Standards | `docs/standards/` | read | high | Tech Lead | Coding, database, API, error, security, test, template rules | Generic rules must be narrowed to this ticket | always-read |
| Ticket template | `docs/standards/templates/_ticket-template/` | read | high | Tech Lead | Required artifact structure | Missing required prompt sections must be added under template headings | always-read |
| Claude rules | `.claude/rules/` and `.claude/CLAUDE.md` | read | high | Tech Lead | Agent workflow and implementation constraints | Rules are process-level; source remains the implementation truth | always-read |
| BE source | `EDCAP_BE/src/main/java/com/sdd/platform/` | read | high | BE Lead | Verify package structure, controller/service/port/adapter/security/error patterns | Organization-specific implementation does not exist yet | required |
| BE DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | DBA / BE Lead | Existing `tbl_dim_organization` schema and enum values | Must not edit existing committed migration; add new Flyway migration later | required-if-db |
| BE mapper XML | `EDCAP_BE/src/main/resources/mapper/` | read | high | BE Lead | MyBatis mapper XML pattern | No Organization mapper XML exists yet | required-if-db |
| BE tests | `EDCAP_BE/src/test/java/` | read | medium | BE Lead / QA | Existing unit/ArchUnit patterns | No controller/API/DB integration test currently exists | verify-with-source |
| FE source | `EDCAP_FE/src/` | read | high | FE Lead | Verify route, page, API, auth, i18n, component patterns | There are two API helper styles; ticket rule selects `src/lib/api.ts` | required |
| FE locale files | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | read | high | FE Lead | i18n resource location and current key shape | No `Pages.Organization` keys currently exist | required |
| FE tests | `EDCAP_FE/e2e_tests/tests/`, `EDCAP_FE/src/__ tests __/README.md` | read | medium | FE Lead / QA | Existing FE test availability | FE unit tests are placeholder only; E2E smoke assertion is weak | verify-with-source |
| API spec / OpenAPI | Runtime `/api/v1/openapi` / Swagger | partial | medium | BE Lead | Potential API contract verification | Runtime not available in this phase; rely on source/spec | verify-with-source |
| DB runtime schema | Running PostgreSQL / Flyway history | unavailable | medium | DBA / BE Lead | Runtime migration verification | Not available in planning phase | required-before-implementation-test |
| Nguyên bản Excel/PPT/PDF | None supplied for this phase | not-read | medium | PM | Tài liệu phụ trợ | N/A | human-intake |
| Web/Repo ngoài | None used | not-read | variable | N/A | External reference | Avoid external drift/injection | not-required |

## Summary

Source availability is sufficient to create the Phase 3 impact analysis and implementation plan for the `ORGANIZATION` ticket. The most important findings are:

- `tbl_dim_organization` already exists in `V4__init_shema_v2.sql` and must be kept. Do not rename, drop, or recreate it.
- Existing `tbl_dim_organization` columns are `organization_id`, `name_masked`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`.
- Required Organization columns not present in the current table are `organization_code`, `description`, `deleted_at`, `deleted_by`, and `version`.
- `record_status` enum already contains `ACTIVE`, `INACTIVE`, `ARCHIVED`, and `DELETED`. The Organization ticket uses `ACTIVE` and `DELETED`; `All` is a FE/API filter value, not a persisted status.
- No Organization-specific BE controller, DTO, use case, repository port, adapter, mapper, or mapper XML exists yet.
- No Organization-specific FE route, page, component, API endpoint helper, type, or locale section exists yet.
- Existing FE route/auth baseline is in `App.tsx`, `Layout.tsx`, `useAuth.ts`, and `src/lib/api.ts`.
- Existing BE security authenticates `/api/**` by default, but role-specific Organization authorization must still be implemented in new Organization endpoints.
- Existing `AdminController` has a known 403 contract violation pattern for non-admin connector run. It must not be copied for Organization.
- Existing BE `ErrorResponse` has `message`, not `messageKey`; current ticket rules say Organization should treat `message` as an i18n key unless a later contract change is approved.
- Existing test coverage is not enough for Organization implementation; Phase 3 can plan tests, but FE automated test implementation is deferred by user decision.

## Unavailable / Partial Sources

| source | status | impact | required action |
|---|---|---|---|
| Runtime OpenAPI / Swagger | partial | Endpoint contract cannot be verified at runtime in Phase 3 | Generate/verify after BE implementation |
| Running DB schema / Flyway history | unavailable | Migration cannot be executed/validated in this phase | Run Flyway migration in later implementation/test phase |
| Organization-specific BE implementation | unavailable | New BE files are required later | Create in implementation phase only |
| Organization-specific FE implementation | unavailable | New FE files are required later | Create in implementation phase only |
| Organization-specific automated tests | unavailable | Test impact must be planned from AC | Add BE tests later; FE tests remain deferred unless decision changes |
| Existing production/staging data | unavailable / not required by spec | Backfill values for current rows still need migration-safe handling | Use deterministic backfill or DBA-approved value in migration |
| `Pages.Organization` locale entries | unavailable | FE cannot localize Organization screen/messages yet | Add `en`, `ja`, `vi` keys later |
| Dedicated audit log mechanism | out of scope | Do not create audit storage/table in this ticket | Use traceId and actor columns only |
| Child cascade behavior | required | Organization soft delete must cascade to Customer / Project / Repository / Team / Ticket | Restore is not supported in this release |

## Risk Before Implementation

| risk | source/evidence | severity | mitigation |
|---|---|---|---|
| Migration with `organization_code NOT NULL` can fail on existing rows | Existing V4 seed creates `tbl_dim_organization` without `organization_code` | high | Add column nullable/backfill/update/set NOT NULL, or add column with safe default then backfill; do not assume empty table at SQL level |
| Unique index on existing `name_masked` may fail if duplicate active rows exist | New requirement requires case-insensitive active-scope uniqueness | medium | Check duplicates before applying unique index; stop/ask if duplicates exist |
| `deleted_at IS NULL` unique predicate does not distinguish `ACTIVE` vs `INACTIVE`/`ARCHIVED` | `record_status` enum has more values than ticket uses | medium | Ticket rule says Organization uses `ACTIVE` and `DELETED`; confirm whether existing non-deleted non-active rows are possible before migration in real environments |
| BE permission errors may repeat known bad pattern | `AdminController.runConnector()` returns `403` body as `Map.of("error", ...)`, not `ErrorResponse` | high | Add Organization-specific authorization exception/handler or explicit standard `ErrorResponse`; do not copy AdminController pattern |
| Error handler maps `ApplicationException` to 409 by default | `GlobalExceptionHandler.handleApplication()` | medium | Use a specific path for 403 authorization and 409 optimistic locking; do not overload generic exceptions incorrectly |
| Message-key typos can leak raw keys | Spec contains `Name.Eequired`, lowercase conflict key variants, Vietnamese typo `Organizationc` | medium | Normalize keys before implementation and locale updates |
| FE has two API helper styles | `src/lib/api.ts` and `src/utils/api.ts` both exist | medium | Follow ticket rule: Organization uses `EDCAP_FE/src/lib/api.ts` typed endpoint helpers |
| FE authenticated non-ADMIN logout redirect is stronger than current generic auth guard | Current `RequireAuth` only checks authentication | high | Add Organization-specific admin guard that calls existing `logout()` when `user.role !== ADMIN` |
| No Organization test database setup | No `application-test.yml` or DB integration tests found | medium | Add test DB/Testcontainers plan or manual migration verification in later phase |

## Required Human Decision

| ID | decision item | status | note |
|---|---|---|---|
| HD-P3-ORG-001 | Use existing `tbl_dim_organization` without rename/recreate | decided | User confirmed; all plans must follow this. |
| HD-P3-ORG-002 | `tbl_dim_customer` table naming | decided | Use existing table name for future Customer work; Customer is out of Organization scope. |
| HD-P3-ORG-003 | Implement Organization/Customer now? | decided | Not in Phase 3. Phase 3 only creates analysis/plan artifacts. |
| HD-P3-ORG-004 | FE automated test implementation now? | decided | Deferred. Test plan/skeleton only unless later changed. |
| HD-P3-ORG-005 | Backfill strategy for existing `tbl_dim_organization.organization_code` | pending for implementation | Spec says no real data review required, but migration SQL must still be safe for seeded/existing rows. |
| HD-P3-ORG-006 | Normalize typo/case variants in message keys before implementation | pending confirmation recommended | Recommended normalized keys: `Pages.Organization.Name.Required`, `Pages.Organization.Conflict.Version`, `Component.Permission.Denied`. |
