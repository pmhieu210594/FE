# Test Data

**Ticket ID**: ROLE  
**Feature**: CRUD Role Management  
**Phase**: Phase 7 - Black-box Test / Test Data  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-15  
**Status**: Updated from skeleton using synthetic black-box datasets only

## Data Policy

- Use synthetic data only.
- Do not use production data.
- Do not read, copy, or store PII, credentials, secrets, `.env`, keys, or raw production logs.
- Test data must be reusable across QA execution where practical.
- If the environment is mutable, each scenario must either:
  - clean up the created role, or
  - use a unique role name suffix to avoid cross-run collisions.

## Persona Data

| data ID | purpose | setup / precondition | allowed reuse | cleanup |
|---|---|---|---|---|
| `TD-ROLE-USER-ADMIN` | Full-access persona for view/create/update/delete | Authenticated user with `ADMIN` role | Yes | None |
| `TD-ROLE-USER-EDITOR` | Limited mutation persona | Authenticated user with `EDITOR` role | Yes | None |
| `TD-ROLE-USER-VIEWER` | View-only persona | Authenticated user with `VIEWER` role | Yes | None |
| `TD-ROLE-USER-ANON` | Unauthenticated access denial | No login/session | Yes | None |

## Baseline Dataset

| data ID | purpose | setup / precondition | allowed reuse | cleanup |
|---|---|---|---|---|
| `TD-ROLE-DATA-BASELINE` | Standard list/detail/edit/delete coverage | Active roles include at least `ADMIN`, `PM`, `QA` with visible descriptions and timestamps | Yes | None |
| `TD-ROLE-DATA-SEARCH` | Search verification | At least 3 active roles where one or more contain `PM` and one clearly does not | Yes | None |
| `TD-ROLE-DATA-SORT` | Sort verification | Active role names arranged so visible order change can be observed, for example `ADMIN`, `PM`, `QA` | Yes | None |
| `TD-ROLE-DATA-PAGINATION` | FE-side pagination verification | Active role count exceeds one visible page in the environment | Yes | None |
| `TD-ROLE-DATA-TIMESTAMP` | Timestamp display verification | At least one role with known `createdAt` and `updatedAt` values | Yes | None |
| `TD-ROLE-DATA-TIMEZONE-EDGE` | Timezone-boundary verification | At least one role timestamp near UTC date rollover, for example `2026-06-14T23:59:30Z` | Yes | None |
| `TD-ROLE-DATA-DELETED-DUPLICATE` | Logical delete exclusion and duplicate-candidate exclusion | One logically deleted role exists with a known normalized name that is not currently used by any active role | Yes | Reset only if environment requires it |

## Create And Update Inputs

| data ID | value | purpose | expected use |
|---|---|---|---|
| `TD-ROLE-NAME-VALID-NEW` | `QA Lead Phase7` | Valid unique create input for `ADMIN` flow | Create succeeds |
| `TD-ROLE-NAME-VALID-EDITOR` | `Ops Reviewer Phase7` | Valid unique create input for `EDITOR` flow | Create succeeds |
| `TD-ROLE-DESC-VALID` | `Synthetic role description for black-box verification.` | Valid description input | Create/update succeeds |
| `TD-ROLE-UPDATE-VALID` | `Role name = QA Lead Updated Phase7`, `description = Updated synthetic description.` | Valid update input | Update succeeds |
| `TD-ROLE-DELETE-TARGET` | Existing active role not required by other tests | Logical delete target | Delete succeeds for `ADMIN` only |

## Boundary And Error Inputs

| data ID | value | purpose | expected result |
|---|---|---|---|
| `TD-ROLE-NAME-DUP-CASE` | `pm` when active `PM` exists | Case-insensitive duplicate create check | Reject |
| `TD-ROLE-NAME-DELETED-MATCH` | Name matching only a logically deleted role | Duplicate-candidate exclusion check | Allow |
| `TD-ROLE-NAME-BLANK` | `""` | Blank validation | Reject |
| `TD-ROLE-NAME-WHITESPACE` | `"   "` | Whitespace-only validation | Reject |
| `TD-ROLE-NAME-TRIM` | `" QA Lead Trim "` | Trim-visible create/update input | Treat by normalized visible result |
| `TD-ROLE-NAME-LEN-100` | ASCII string length exactly 100 | Upper accepted boundary | Accept if unique |
| `TD-ROLE-NAME-LEN-101` | ASCII string length exactly 101 | Over-limit boundary | Reject |
| `TD-ROLE-UPDATE-DUPLICATE-ACTIVE` | Update target name to normalized value matching another active role | Duplicate-on-update check | Reject |
| `TD-ROLE-UUID-INVALID` | `not-a-uuid` | Invalid path identifier | Reject with standard error behavior |
| `TD-ROLE-UUID-NOTFOUND` | Valid UUID not matching any existing role | Not-found behavior | Reject with standard error behavior |
| `TD-ROLE-REQ-DENIED-VIEW` | Direct list request from disallowed caller context | Permission denial for view API | Reject |
| `TD-ROLE-REQ-LIST` | Standard `GET /api/v1/roles` request | Raw list response verification | Return raw `RoleDto[]` |

## Timestamp Samples

| data ID | sample source value | expected visible result rule | note |
|---|---|---|---|
| `TD-ROLE-DATA-TIMESTAMP` | Known valid DB-backed timestamp values | Display as `DD/MM/YYYY HH:mm:ss` | Use stable visible record |
| `TD-ROLE-DATA-TIMEZONE-EDGE` | Timestamp near UTC midnight, for example `2026-06-14T23:59:30Z` | Display as `DD/MM/YYYY HH:mm:ss` in user's local timezone | Date may differ by timezone; format must remain fixed |

## Suggested Execution Notes

- Prefer unique suffixes such as `Phase7`, date, or run ID when creating disposable roles in shared environments.
- If the environment does not guarantee a deleted-role fixture, create one once under `ADMIN`, logically delete it, and then reuse it for duplicate-candidate exclusion cases.
- Where list volume is insufficient for pagination checks, seed additional synthetic roles only in an approved non-production environment.

## Assumptions

| ID | assumption | reason |
|---|---|---|
| TD-ROLE-ASM-001 | The environment used for black-box execution can provide or safely create synthetic `ADMIN`, `EDITOR`, and `VIEWER` personas | Required by approved RBAC matrix |
| TD-ROLE-ASM-002 | Shared test environments may require name suffixing to avoid collisions across reruns | Supports repeatable execution without relying on cleanup success |

## Human Decisions Required

| ID | decision | reason |
|---|---|---|
| TD-ROLE-HDR-001 | None currently identified for Phase 7 dataset definition | Canonical spec is sufficient to define synthetic black-box data |
