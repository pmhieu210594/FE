# Source Map

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Target Area

Admin User Management for login accounts, linked member pseudonym data, and related permission/login regression behavior.

## Entry Points

| entry | path | note |
|---|---|---|
| FE route | `/:lang/admin/user-accounts` | Main ADMIN-only entry point. |
| FE API | `EDCAP_FE/src/lib/api.ts` | Typed endpoint helper location. |
| BE API | `/api/v1/admin/user-accounts` | List/detail/create/update/status/reset namespace. |
| BE roles API | `/api/v1/admin/roles` | Role dropdown and validation source. |

## Call Flow

| caller | callee | note |
|---|---|---|
| Admin user | FE route/page | Screen render and user actions. |
| FE page | typed API helper | List/search/create/update/reset/deactivate/reactivate calls. |
| API helper | BE controller | HTTP contract entry point. |
| BE controller | BE service | Business rules and ADMIN guard. |
| BE service | repository port/mapper | Writes account + member pseudonym; keeps `team_id = NULL`. |
| BE service | LOGIN regression path | Active/inactive login compatibility. |

## Data Flow

- UI form state -> API request DTO -> BE request DTO -> service validation -> mapper write -> DB rows.
- List/detail responses -> safe response DTO -> FE table/detail UI.
- Password input -> bcrypt hash -> stored hash only.

## Test Map

- `blackbox-testcases.md` covers user-visible behavior.
- `test-plan.md` maps each AC to FE/BE/API/DB/E2E/black-box coverage.
- `test-data.md` defines synthetic users, roles, account states, and boundary data.

## Unknown Source Areas

- Any remaining FE/BE password-policy mismatch detail.
- Any future formal audit implementation.
- Any team-assignment behavior outside this MVP.
