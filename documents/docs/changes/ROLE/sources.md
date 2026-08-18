# Sources

**Ticket ID**: ROLE  
**Phase**: Phase 1 - Human Decisions Applied  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-12  
**Status**: Draft / Phase 1 Gate PASS

## Ticket / Issue

| source | link/path | status | trust level | note |
|---|---|---|---|---|
| User ticket body | Chat request for Phase 1 ROLE | read | medium | Defines required outputs and artifact list |
| Human Decisions | User-provided decision list, 2026-06-11 | read | high | Closes Phase 1 product/spec blockers |
| Phase 0 plan/result | `EDCAP_BE/documents/docs/changes/ROLE/phase-status.md` | read | medium | Phase 0 artifact status and blockers |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| ROLE raw input | `EDCAP_BE/documents/docs/changes/ROLE/01_raw-input.md` | read | medium | Initial requirement; not edited; `dim_role` wording is superseded by Human Decision |
| ROLE wireframe draft | `EDCAP_BE/documents/docs/changes/ROLE/02_reference-extracts.md` | read | medium | Human-provided UI reference input; not canonical specification by itself |
| ROLE source availability | `EDCAP_BE/documents/docs/changes/ROLE/03_source-availability.md` | read | medium | Phase 0 source inventory |
| ROLE context loading plan | `EDCAP_BE/documents/docs/changes/ROLE/04_context-loading-plan.md` | read | medium | Phase 0 read order and exclusions |
| ROLE impact analysis | `EDCAP_BE/documents/docs/changes/ROLE/impact-analysis.md` | read | medium | Phase 0 impact draft; should be refreshed in Pack 26 |
| ROLE open issues | `EDCAP_BE/documents/docs/changes/ROLE/open-issues.md` | read/update target | high | Phase 1 resolved/open issue ledger |
| ROLE spec pack | `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md` | read/update target | high | Canonical Phase 1 spec after Human Decisions |
| SDD sources template | `EDCAP_BE/documents/docs/standards/templates/_ticket-template/sources.md` | read | template | Format reference |
| SDD brainstorm template | `EDCAP_BE/documents/docs/standards/templates/_ticket-template/00_brainstorm.md` | read | template | Format reference |
| SDD spec-pack template | `EDCAP_BE/documents/docs/standards/templates/_ticket-template/spec-pack.md` | read earlier | template | Format reference |

## Human Decision Trace

| ID | decision | source | effect |
|---|---|---|---|
| HD-ROLE-001 | Use `tbl_dim_role` as official table name | User decision 2026-06-11 | `dim_role` becomes superseded draft wording |
| HD-ROLE-002 | Use role-based RBAC | User decision 2026-06-11 | User has role; role determines allowed actions. FE controls screen/action visibility by role. BE independently enforces authorization for each API/action by role. |
| HD-ROLE-003 | Do not define separate action authorization labels in the ROLE specification | User decision 2026-06-11 | Previously listed action labels are removed from the canonical ROLE specification. |
| HD-ROLE-004 | Previous hard-delete decision | User decision 2026-06-11 | Superseded by `HD-ROLE-DELETE-001` |
| HD-ROLE-DELETE-001 | Use logical delete | User decision 2026-06-12 | Delete sets `delete_flag = 1`; list/search/query and duplicate-check candidate sets exclude deleted records; physical hard delete and cascade delete are out of scope; restore is superseded by later decision |
| HD-ROLE-P26-001 | Role authorization matrix | User decision 2026-06-12 | `ADMIN`: view/create/update/delete; `EDITOR`: view/create/update; `VIEWER`: view only |
| HD-ROLE-P26-002 | Restore scope | User decision 2026-06-12 | Restore is removed from this ticket |
| HD-ROLE-P26-003 | Logical delete columns | User decision 2026-06-12 | Use `delete_flag`, `updated_at`, `updated_by` |
| HD-ROLE-P26-004 | Pagination/list response | User decision 2026-06-12 | BE raw list; FE pagination; no `totalCount` |
| HD-ROLE-P26-005 | Error policy | User decision 2026-06-12 | ROLE APIs use `ErrorResponse`; duplicate returns HTTP 400 |
| HD-ROLE-P26-006 | Timestamp serialization/display | User decision 2026-06-12 | BE returns `createdAt`/`updatedAt` from DB `TIMESTAMPTZ`; FE displays `DD/MM/YYYY HH:mm:ss`; values always exist |
| HD-ROLE-P26-007 | Description behavior | User decision 2026-06-12 | Trim `description`; empty string after trim remains empty string |
| HD-ROLE-P26-008 | FE route source | User decision 2026-06-12 | Use `router.tsx`; superseded by source review in `HD-ROLE-P3-002` |
| HD-ROLE-P26-009 | FE DTO naming | User decision 2026-06-12 and later canonical alignment | Use `RoleDto` |
| HD-ROLE-P26-010 | V4 mapper/adapter/entity missing | User decision 2026-06-12 | Phase 3 implementation planning item, not business decision |
| HD-ROLE-P3-001 | Logical delete endpoint method | User decision 2026-06-12 | Use `PUT /api/v1/roles/{role_id}/delete`; update `delete_flag = 1`; do not use HTTP `DELETE` |
| HD-ROLE-P3-002 | FE route implementation source | Source review 2026-06-12 | `main.tsx` mounts `HashRouter` and renders `App`; `App.tsx` defines `<Routes>`; implement ROLE route in `App.tsx` unless routing is migrated later |
| HD-ROLE-005 | No new seed in ROLE scope | User decision 2026-06-11 | Sample roles are reference/expected existing data only |
| HD-ROLE-006 | Follow existing project error convention | User decision 2026-06-11 | Superseded/refined by `HD-ROLE-P26-005`: ROLE APIs use `ErrorResponse`; duplicate returns HTTP 400 |
| HD-ROLE-007 | Include `description` in role specification | User decision 2026-06-11 | DB/API/FE spec includes description |
| HD-ROLE-008 | Duplicate role names are trim + case-insensitive among active rows only | User decision 2026-06-11 | `PM` and `pm` are duplicates when the compared existing row is active |
| HD-ROLE-009 | Role list requires pagination/search/sort | User decision 2026-06-11 | Minimum search/sort by `role_name` |
| HD-ROLE-010 | Role Management route/menu placement | User decision 2026-06-11 | FE route is `/roles` |
| HD-ROLE-011 | Timestamp display | User decision 2026-06-11 | BE returns `createdAt`, `updatedAt`; FE displays `DD/MM/YYYY HH:mm:ss` in user local timezone; `updatedAt` always exists |
| HD-ROLE-013 | Wireframe labels/copy and i18n mapping | User decision 2026-06-11 plus FE i18n source | Use wireframe label/copy inventory and propose `Pages.RoleManagement.*` keys following existing FE locale pattern |

## Architecture / Standards

| source | path | status | trust level | note |
|---|---|---|---|---|
| API standards | `EDCAP_BE/documents/docs/standards/api-contract.md` | read | medium-high | `/api/v1`, raw DTO/list, session cookie, status guidance |
| Error standards | `EDCAP_BE/documents/docs/standards/error-handling.md` | read | medium-high | Global exception handling and ErrorResponse standard |
| Security standards | `EDCAP_BE/documents/docs/standards/security.md` | read | medium-high | OAuth2 session, no secrets, auth routes |
| Database standards | `EDCAP_BE/documents/docs/standards/database.md` | read | medium-high | Flyway, table naming, MyBatis, timestamp conventions |
| Testing standards | `EDCAP_BE/documents/docs/standards/testing.md` | read | medium-high | BE/FE test patterns and known gaps |
| Frontend standards | `EDCAP_BE/documents/docs/standards/frontend.md` | read | medium-high | API layer, UI states, i18n, testing expectations |
| Backend standards | `EDCAP_BE/documents/docs/standards/backend.md` | read | medium-high | Hexagonal layers, controller/service/mapper rules |
| FE/BE contract map | `EDCAP_BE/documents/docs/architecture/fe-be-contract-map.md` | read | medium-high | Existing verified/mismatched contracts |
| Repository DB map | `EDCAP_BE/documents/docs/architecture/repository-db-map.md` | read | medium-high | V1/V4 schema split and V4 mapper gap |
| Test map | `EDCAP_BE/documents/docs/architecture/test-map.md` | read | medium-high | Current tests and coverage gaps |

## Existing Source Code

| area | path | status | trust level | purpose |
|---|---|---|---|---|
| FE API wrapper | `EDCAP_FE/src/lib/api.ts` | read | high | `ApiError`, session cookie, raw endpoint helpers, role enum |
| FE auth hook | `EDCAP_FE/src/hooks/useAuth.ts` | read | high | `/api/v1/me`, 401 handling, logout |
| FE layout/nav | `EDCAP_FE/src/components/Layout.tsx` | read | high | Existing nav currently checks `user.role === "ADMIN"` |
| FE admin page | `EDCAP_FE/src/pages/AdminPage.tsx` | read | high | Existing admin pattern, loading/error/empty behavior |
| FE router candidate | `EDCAP_FE/src/router.tsx` | read | high | Defines `createHashRouter` with empty children; not observed as mounted by `main.tsx` |
| FE runtime route source | `EDCAP_FE/src/main.tsx`, `EDCAP_FE/src/App.tsx` | read | high | `main.tsx` mounts `HashRouter`; `App.tsx` defines active `<Routes>` |
| FE i18n setup | `EDCAP_FE/src/i18n.ts` | read | high | Uses `react-i18next`, namespace `locale`, languages `en`, `vi`, `ja` |
| FE English locale | `EDCAP_FE/public/locales/en/locale.json` | read | high | Existing key shape: `Layout.*`, `Pages.Login.*`, `Pages.Admin.*` |
| FE Vietnamese locale | `EDCAP_FE/public/locales/vi/locale.json` | read | high | Existing key shape mirrors English locale |
| FE Japanese locale | `EDCAP_FE/public/locales/ja/locale.json` | read | high | Existing key shape mirrors English locale |
| FE interfaces | `EDCAP_FE/src/interfaces/index.ts` | read | high | `IResponses<T>` envelope exists but BE standard uses raw DTO/list |
| BE security | `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java` | read | high | Session auth; `/api/**` authenticated except permitAll routes |
| BE admin controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java` | read | high | Inline ADMIN gate example and response shape |
| BE me controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java` | read | high | `/api/v1/me` controller pattern |
| BE DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java` | read | high | Java record DTO pattern |
| BE app user | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | read | high | Current `VIEWER/EDITOR/ADMIN` role enum |
| BE user service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java` | read | high | First user ADMIN, others VIEWER |
| BE error handler | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/GlobalExceptionHandler.java` | read | high | Actual ErrorResponse mapping |
| BE error response | `EDCAP_BE/src/main/java/com/sdd/platform/web/exception/ErrorResponse.java` | read | high | Actual fields observed in source |
| DB migration V4 | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read relevant slices | high | `tbl_dim_role`, RBAC tables, seeds, FKs |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit/application | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | listed/read via test map | Existing pattern |
| BE architecture | `EDCAP_BE/src/test/java/com/sdd/platform/architecture/LayerEnforcementTest.java` | listed/read via test map | ArchUnit layer gate |
| BE domain | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/ArtifactNormalizerTest.java` | listed/read via test map | Pure domain test pattern |
| FE unit/component | `EDCAP_FE/src/**/*.test.*`, `EDCAP_FE/src/**/*.spec.*` | none found | No FE unit tests found by search |
| FE E2E | `EDCAP_FE/e2e_tests/tests/smoke.spec.ts` | listed | Minimal smoke only |
| Contract tests | FE/BE | unavailable | No Pact/Spring Cloud Contract/API schema diff found |

## `.claude/rules`

| source | path | status | note |
|---|---|---|---|
| Claude rules | `.claude/rules/` at workspace root | unavailable | `Test-Path` returned false |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External/binary docs | PDF/Office/Web | not read | Require safe intake and human approval before use |

## Excluded Sources

| source/path | reason |
|---|---|
| `.env*` | Secret/credential risk |
| `*secret*`, `*key*`, credentials | Secret/credential risk |
| Raw production logs, `*.log`, `logs/**` | Sensitive data risk |
| `.git/**` | Repo internals not needed |
| `node_modules/**`, `target/**`, coverage output | Dependency/build/generated output |
| External/binary docs | Require safe intake approval |

## Source Limitations

1. Raw ROLE input has encoding/mojibake risk in shell output.
2. Raw ROLE input says `dim_role`, but Human Decision supersedes it with `tbl_dim_role`.
3. V4 RBAC tables exist, but architecture docs say no V4 Java mappers/adapters exist yet.
4. Current app authorization is based on `AppUser.Role` enum and inline ADMIN checks; Pack 26 must confirm the exact role-to-action matrix for ROLE.
5. Standards and source may disagree on exact error fields; ROLE must follow current project convention after source analysis.
6. `02_reference-extracts.md` is a UI wireframe reference only; exact visual layout and validation rendering remain subject to `spec-pack.md` decisions and Pack 26 / Phase 3 source analysis.
7. ROLE `context.md` does not currently exist in `EDCAP_BE/documents/docs/changes/ROLE/`; i18n mapping is recorded in `spec-pack.md` only in this update.

## Assumptions from Sources

| ID | assumption | basis | risk |
|---|---|---|---|
| SRC-ASM-001 | BE ROLE artifact path is canonical | Prior human choice | Low |
| SRC-ASM-002 | Role CRUD targets `tbl_dim_role` | Human Decision 2026-06-11 | Low |
| SRC-ASM-003 | New role APIs likely use `/api/v1/roles` | API standards and FE wrapper | Medium |
| SRC-ASM-004 | Backend should use existing hexagonal style with controller/service/port/adapter/mapper | Backend standards and current code | Medium |

## Human Confirmation Required

All Phase 1 product/spec decisions listed in the Human Decision Trace are closed.
Remaining confirmations are source/contract analysis items for Pack 26 A-6, not Phase 1 blockers:

| ID | question | reason |
|---|---|---|
| SRC-P26-001 | What is the exact FK/reference impact of hard deleting a role? | Must not bypass DB constraints or user-role mappings |
| SRC-P26-002 | What is the exact role-to-action matrix for current `AppUser.Role`/inline ADMIN checks? | Current source uses role enum and inline authorization checks |
| SRC-P26-003 | What is the exact project error shape for ROLE APIs? | Must follow current convention without inventing new format |
| SRC-P26-004 | What are exact pagination defaults/max/response metadata rules for ROLE list? | Needed for FE/BE contract |
| SRC-P26-005 | What is the exact timestamp serialization type for `createdAt` and `updatedAt`? | Needed for FE parsing before `DD/MM/YYYY HH:mm:ss` local-timezone display |
