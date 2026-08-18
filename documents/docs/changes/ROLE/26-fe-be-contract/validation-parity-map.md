# Validation Parity Map

**Ticket ID**: ROLE  
**Pack**: 26_FE/BE Contract and Impact Analysis  
**Create date**: 2026-06-11  
**Author**: Codex  
**Status**: Draft

## Validation Rules

| field/item | FE validation candidate | BE validation candidate | DB constraint/source | parity status |
|---|---|---|---|---|
| `roleName` required | trim and reject empty | trim and reject empty | `role_name NOT NULL` | Required |
| `roleName` max length | max 100 | max 100 | `VARCHAR(100)` | Required if DB unchanged |
| `roleName` duplicate | case-insensitive check after trim, display error | case-insensitive query/check before save | `UNIQUE(role_name)` exists but may be case-sensitive | Major gap |
| `description` | trim; empty string allowed | trim; empty string allowed | `TEXT` source observed | Accepted |
| `roleId` path | FE passes existing UUID | BE parses UUID and returns 400/404 as appropriate | `UUID` | Required |
| delete action | FE calls `PUT /api/v1/roles/{role_id}/delete` with selected active role ID | BE authorizes ADMIN only, verifies target availability, sets `delete_flag = 1`, updates `updated_at` / `updated_by` | `delete_flag`, `updated_at`, `updated_by` | Required |
| restore action | out of scope | out of scope | out of scope | Not applicable |
| FE pagination | page/page size applied client-side | BE does not validate page/page size | raw list | Required |
| search | optional string | search by `role_name` minimum | no DB constraint | Candidate |
| sort | only allowed fields | whitelist fields | ORDER BY must be whitelisted | Required |

## Boundary Cases

| case | expected behavior | status |
|---|---|---|
| `roleName=""` | reject | Approved |
| `roleName="   "` | trim then reject | Approved |
| `roleName=" QA "` | compare/persist as `QA` or normalized by contract | Needs final persistence detail |
| `roleName="pm"` when `PM` exists | reject duplicate | Approved |
| 101-char `roleName` | reject if max remains 100 | Candidate |
| invalid UUID | reject by project convention | Candidate |
| missing role UUID | 404 | Candidate |
| delete active role | HTTP 200; row remains and `delete_flag = 1` | Approved |
| restore deleted role | out of scope | Approved |

## Open Questions

- Should trimmed value be persisted, or only used for comparison?
- Should `description` be omitted from create/update request or always sent as a string? Empty string behavior is accepted.
- Should FE perform async duplicate precheck or rely on submit error?

## Human Decisions Required

- None for Phase 3 entry.
