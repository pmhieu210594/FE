# Source Availability

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-10  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| CUSTOMER spec pack | `docs/changes/CUSTOMER/spec-pack.md` | read | high | Ticket | Source of AC/business/API/DB rules | None found for planning; several items intentionally left for Phase 3 decision | always-read |
| CUSTOMER context | `docs/changes/CUSTOMER/context.md` | read | high | Ticket | Phase 2 verified source context/rules | Must keep aligned if implementation source changes | always-read |
| CUSTOMER ticket rules | `docs/changes/CUSTOMER/ticket-rules.md` | read | high | Ticket | Ticket-specific do/do-not rules | Stop/Ask rules must be honored before coding | always-read |
| Architecture docs | `docs/architecture/` | read | high | Project | FE/BE/DB contract, route/API, service/repository/test map | Some maps are current-state only; CUSTOMER not implemented yet | verify-with-source |
| Standards docs | `docs/standards/` | read | high | Project | Coding, security, DB, test, review, template rules | Template headings must be preserved | always-read |
| Claude rules | `.claude/rules/` | read | high | Project | Agent workflow and guardrails | Must not invent existing methods/classes | always-read |
| Ticket template | `docs/standards/templates/_ticket-template/` | read | high | Project | Required artifact structure | Prompt-required sections may need added under template headings | always-read |
| Backend Java source | `EDCAP_BE/src/main/java/` | read | high | BE | Package pattern, controller, service, repository, exception, security | CUSTOMER-specific classes not found; planned files must be marked new | required-if-be |
| Backend migration source | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | DB | Existing `tbl_dim_customer`, `tbl_dim_organization`, `tbl_dim_project` schema | Do not edit V4; new migration required | required-if-db |
| Backend tests | `EDCAP_BE/src/test/` | partial | medium | BE | Existing test pattern check | CUSTOMER tests not found | verify-with-source |
| Frontend source | `EDCAP_FE/src/` | read | high | FE | Route, API helper, auth, layout, components, pages | CUSTOMER-specific page/API not found | required-if-fe |
| Frontend locales | `EDCAP_FE/public/locales/{en,ja,vi}/locale.json` | partial | high | FE | i18n target files | Locale files include UTF-8 text/BOM; edit carefully | required-if-i18n |
| Frontend tests | `EDCAP_FE/src/__ tests __/README.md` and related folders | partial | medium | FE | Test availability | Automated FE implementation deferred by earlier decision | verify-with-source |
| External/web sources | N/A | not-read | low | External | Not needed for project-local Phase 3 planning | Could be stale/untrusted | not-used |

## Summary

Phase 3 planning can proceed. The required ticket documents, architecture, standards, template, representative BE/FE source, and DB schema have been read or partially read where appropriate.

Key availability findings:

- `tbl_dim_customer` exists in `V4__init_shema_v2.sql`.
- `tbl_dim_organization` exists and is the parent of Customer.
- `tbl_dim_project` exists and has `customer_id`, which supports the rule to cascade Customer soft delete through the child tree.
- CUSTOMER-specific BE controller/use case/repository/mapper/DTO are not currently available.
- CUSTOMER-specific FE route/page/API helper/types are not currently available.
- FE has existing `RequireAuth`/layout/auth/API helper patterns, including `EDCAP_FE/src/lib/api.ts` with `get`, `post`, `put`, `del`, and `patch`.
- Existing BE `GlobalExceptionHandler` returns `ErrorResponse` with `message`; the CUSTOMER ticket uses that field as the translated key.
- Existing `AdminController#runConnector` returns a standard HTTP `403` status but uses an ad-hoc body `Map.of("error", ...)`; do not copy the body pattern for CUSTOMER.

## Unavailable / Partial Sources

| source | status | impact | action |
|---|---|---|---|
| `CustomerController` | not found | API implementation must create new BE entry point | Plan as new file/class |
| Customer use case/service | not found | Business rules not implemented | Plan as new application/domain service |
| Customer repository/mapper/port | not found | DB access not implemented | Plan repository port + adapter/mapper following existing persistence pattern |
| Customer request/response DTOs | not found | API contract not implemented | Plan new DTOs or extend `Dtos` only if consistent with project style |
| Customer FE page/route | not found | UI not implemented | Plan new page/route/menu entry |
| Customer FE API helper/types | not found | FE cannot call API yet | Plan new typed endpoint helpers using `src/lib/api.ts` |
| `api.patch` in `src/lib/api.ts` | found | Spec/proposed convention uses `PATCH /delete`; helper already supports patch | Use `PATCH /api/v1/customers/{id}/delete` |
| `messageKey` in BE `ErrorResponse` | not found | The ticket keeps current `message` as the translated key | No BE contract change required for this ticket |
| Organization active lookup API | not found as implemented Organization Management API | Customer create/edit dropdown needs active Organizations | Dependency on Organization implementation/API or create read-only options endpoint |
| DB integration test setup | partial/not confirmed | Migration and unique index confidence | Decide later: Testcontainers/local DB/manual verification |

## Risk Before Implementation

| risk | severity | reason | mitigation |
|---|---|---|---|
| Existing data violates future case-insensitive unique alias rule | Blocker | Replacing `uq_customer_alias_per_org` with lower-case active-scope unique index can fail | Add pre-check query before migration; Stop/Ask on duplicates |
| Existing unique constraint blocks alias reuse after soft delete | Major | Current `UNIQUE (organization_id, customer_alias)` ignores `deleted_at` | Replace with partial unique index after adding `deleted_at` |
| Soft delete uses PATCH `/customers/{id}/delete` and FE helper already supports patch | Low | Convention is now aligned | Keep implementation consistent |
| Error contract uses current `message` field as translated key | Low | FE/BE behavior stays consistent with current code | Keep implementation consistent |
| Organization active/non-deleted source depends on Organization migration | Major | Current `tbl_dim_organization` has no `deleted_at` in V4 | Align with Organization ticket/migration before Customer implementation |
| Project child-tree cascade depends on `tbl_dim_project` FK path | Major | Customer soft delete now cascades through child Projects/descendants | Define exact cascade scope if additional descendants exist |
| FE route path is `/:lang/customers` | Low | Route impacts menu and UX | Keep implementation consistent |
| Classification code source could expand beyond `INTERNAL`/`EXTERNAL` | Minor/Major | Spec says this release uses two values | Confirm product decision before validation hardening |

## Required Human Decision

| ID | decision needed | proposed default | needed before |
|---|---|---|---|
| HD-CUS-001 | Customer update endpoint method | `PUT /api/v1/customers/{customerId}` | FE/BE API implementation |
| HD-CUS-002 | Soft delete endpoint method | `PATCH /api/v1/customers/{customerId}/delete` | FE/BE API implementation |
| HD-CUS-003 | Duplicate alias HTTP status | `409 Conflict` | API tests |
| HD-CUS-004 | Inactive/deleted Organization on create/update HTTP status | `422 Unprocessable Entity` if project supports it; otherwise `400 Bad Request` or `409 Conflict` must be chosen | API tests |
| HD-CUS-005 | Active Project prevents delete HTTP status | `409 Conflict` | API tests |
| HD-CUS-006 | Customer route/menu | `/:lang/customers`, menu key `Menu.Customer` | FE route/nav implementation |
| HD-CUS-007 | Error response contract | Keep current `message` as i18n key | BE/FE error implementation |
| HD-CUS-008 | Classification values | `INTERNAL`, `EXTERNAL` only | BE validation and FE select options |
| HD-CUS-009 | Organization lookup source | Reuse Organization API/options endpoint if implemented; otherwise create minimal read-only options endpoint | Customer create/edit UI |
