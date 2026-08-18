# Source Availability - FE/BE Contract Pack

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft / Pack 26

## Summary

Pack 26 is required because ROLE spans FE repo, BE repo, API contract, DB table `tbl_dim_role`, validation, error handling, role-based authorization, timestamp display, i18n, and tests.

## Files Read

### Core ROLE Artifacts

| file | status | note |
|---|---|---|
| `EDCAP_BE/documents/docs/changes/ROLE/02_reference-extracts.md` | Read | Wireframe/reference only |
| `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md` | Read | Canonical spec |
| `EDCAP_BE/documents/docs/changes/ROLE/impact-analysis.md` | Read earlier / referenced | Phase 0 impact draft |
| `EDCAP_BE/documents/docs/changes/ROLE/impl-plan.md` | Read | Phase 2 preliminary plan, blocked until Pack 26 |
| `EDCAP_BE/documents/docs/changes/ROLE/context.md` | Read | Phase 2 implementation context |
| `EDCAP_BE/documents/docs/changes/ROLE/ticket-rules.md` | Read | Ticket-specific rules |
| `EDCAP_BE/documents/docs/changes/ROLE/open-issues.md` | Read | Open issue ledger |
| `EDCAP_BE/documents/docs/changes/ROLE/promotion-candidates.md` | Read / update target | Living-doc candidates only |

### FE Source

| file/source | status | evidence |
|---|---|---|
| `EDCAP_FE/src/router.tsx` | Read | Uses `createHashRouter`, root `/:lang`, empty children in this file |
| `EDCAP_FE/src/main.tsx` | Read | App rendered inside `HashRouter`, QueryClientProvider |
| `EDCAP_FE/src/router.ts` | Read | `messageRef` only |
| `EDCAP_FE/src/router-links.ts` | Read | Empty link/API map; not usable as contract source |
| `EDCAP_FE/src/router-message.ts` | Read | AntD message instance setter |
| `EDCAP_FE/src/lib/api.ts` | Read | `api.get/post/put/del`, `ApiError`, typed endpoint helpers |
| `EDCAP_FE/src/components/Layout.tsx` | Read | Existing admin nav hidden unless `user.role === "ADMIN"` |
| `EDCAP_FE/src/i18n.ts` | Read earlier | `react-i18next`, namespace `locale` |
| `EDCAP_FE/public/locales/en/locale.json` | Read earlier | Existing `Layout.*`, `Pages.*` key shape |
| `EDCAP_FE/public/locales/vi/locale.json` | Read earlier | Locale key shape mirrors English |
| `EDCAP_FE/public/locales/ja/locale.json` | Read earlier | Locale key shape mirrors English |
| `EDCAP_FE/package.json` | Read | Vitest, Playwright, Radix Dialog dependency present |
| `EDCAP_FE/src/components/ui/**` | Listed/searched | Button, table, search, pagination, form, server-table candidates |
| `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | Listed | Minimal E2E smoke only |

### BE Source

| file/source | status | evidence |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | Read | Existing admin endpoints, 403 Map error for non-ADMIN |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | Read earlier | `/api/v1/me` pattern |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | Read | Existing DTO record style; no ROLE DTO yet; accepted FE DTO/list/detail name is `RoleDto` |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | Read | Error mapping source |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | Read | Actual fields: `timestamp`, `status`, `error`, `message`, `traceId` |
| `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | Read | `/api/**` authenticated except public routes; OpenAPI configured public |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | Read earlier / searched | Existing role enum `VIEWER`, `EDITOR`, `ADMIN` |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Searched/read relevant slices | `tbl_dim_role`, FK references, auth tables, seed rows |
| Existing BE tests | Listed | 3 test files; no ROLE tests |
| `EDCAP_BE/pom.xml` | Read | Springdoc OpenAPI dependency, surefire/failsafe configured |

### Architecture / Standards

| source | status | note |
|---|---|---|
| `documents/docs/architecture/fe-be-contract-map.md` | Read | Existing contract patterns and risks |
| `documents/docs/architecture/route-api-map.md` | Read | Existing route/controller mapping |
| `documents/docs/architecture/repository-db-map.md` | Read | V4 mapper gap and DB mapping |
| `documents/docs/architecture/service-layer-map.md` | Read | Hexagonal layering and service pattern |
| `documents/docs/architecture/test-map.md` | Read | Existing test coverage and gaps |
| `documents/docs/standards/api-contract.md` | Read | `/api/v1`, raw DTO/list, `limit`/`offset` |
| `documents/docs/standards/frontend.md` | Read | API/i18n/components rules |
| `documents/docs/standards/backend.md` | Read | Hexagonal/service/mapper rules |
| `documents/docs/standards/security.md` | Read | Session auth, ErrorResponse, no secrets |
| `documents/docs/standards/testing.md` | Read | FE/BE test patterns |
| `documents/docs/standards/logging.md` | Read | traceId/logging rules |
| `EDCAP_BE/documents/.claude/rules/*.md` | Read earlier | Safety/architecture/security/testing rules |

## Contract Source Availability

| source type | status | note |
|---|---|---|
| OpenAPI | Dependency/config present | `springdoc` configured at `/api/v1/openapi`; runtime schema not generated/read |
| GraphQL | Not found | No GraphQL source/schema found |
| gRPC | Not found | No gRPC proto/service found |
| Mock schema | Not found | No ROLE mock schema found |
| Pact/Spring Cloud Contract | Not found | No contract-test framework found |
| API IT | Not found for ROLE | Existing BE tests are unit/domain/architecture only |
| E2E | Minimal only | FE smoke test exists, not contract-specific |
| Source Intelligence 23 artifact | Not found under ROLE path | Use Phase 2 `context.md` and architecture maps as available source intelligence |

## Files Not Yet Read

| source | reason |
|---|---|
| Full FE UI component implementations | Not needed for initial contract pack; only searched/listed relevant components |
| Full BE V4 SQL file line-by-line | Relevant role/FK slices read/search-confirmed |
| Runtime OpenAPI output | Requires running backend; not done in this documentation-only pack |
| Full generated coverage/build artifacts | Excluded/generated |

## Excluded Sources

| source/path | reason |
|---|---|
| `.env*` | Secret/credential risk |
| `*.key`, `*.pem`, `*.p12`, credentials, tokens | Secret/credential risk |
| Raw production logs, `*.log`, `logs/**` | Sensitive data/PII risk |
| `.git/**` | Repo internals not needed |
| `node_modules/**`, `target/**`, build/coverage output | Dependency/build/generated output |
| External/binary docs | Require separate safe intake |

## Facts

- FE and BE source are both available.
- ROLE-specific FE and BE implementation does not exist yet.
- `tbl_dim_role` exists in V4 migration.
- Multiple FK references point to `tbl_dim_role.role_id`.
- `HD-ROLE-DELETE-001` resolves the previous hard-delete FK blocker by using logical delete and preserving FK references.
- Existing app role enum is `VIEWER`, `EDITOR`, `ADMIN`.
- Existing FE layout hides admin nav for non-ADMIN users.
- Existing BE `AdminController` has an inline ADMIN guard, but its failure body is a `Map`, not `ErrorResponse`.

## Assumptions

| ID | assumption | basis | risk |
|---|---|---|---|
| A26-SA-001 | ROLE endpoints should follow `/api/v1/roles` | API standard + spec candidate | Medium until Pack 26 review approved |
| A26-SA-002 | `ADMIN` has all ROLE actions | Human Decision | Accepted |

## Open Questions

- What exact search/sort query names should implementation use?
- What FE default page size/page origin should implementation use?

## Human Decisions Required

- None for Phase 3 entry.
