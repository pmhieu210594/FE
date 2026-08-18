# Test Data

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude  
**Update date**: 2026-07-09  

## Data Policy

- Use only synthetic or non-production data.
- Keep all data UTF-8.
- Do not store raw secrets, passwords, API keys, tokens, or production PII.

## Master Data

| name | value | purpose |
|---|---|---|
| Module codes | `LOGIN`, `ROLE`, `ORGANIZATION`, `CUSTOMER`, `PROJECT`, `REPOSITORY`, `TEAM`, `MEMBER_USER` | Audit-source classification |
| Operation types | `CREATE`, `READ`, `UPDATE`, `DELETE`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT` | Event classification |
| Access permission | `AUDIT_READ` | Read-only audit access |
| Masked fields | `password`, `password_hash`, `token`, `access_token`, `refresh_token`, `secret`, `api_key` | Fields that must not be persisted raw |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin_user` | ADMIN | `AUDIT_READ` | Authorized audit-log access |
| `audit_user` | SECURITY / AUDIT | `AUDIT_READ` | Read-only reviewer |
| `standard_user` | EDITOR | none | Negative access test |
| `anonymous_request` | NONE | none | Unauthorized access test |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | Valid create/update/delete requests for each audited admin screen | CRUD audit capture |
| N-02 | Valid login request | Successful login audit |
| N-03 | Valid logout request | Logout audit |
| N-04 | Audit-log list rows across multiple modules | Filter/search coverage |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | Invalid login password | LOGIN_FAILED audit row |
| E-02 | Validation failure in audited CRUD request | Audit row written with an error message (no status column) |
| E-03 | Attempt to update/delete audit log row | Rejected by DB/API design |
| E-04 | Missing actor identity table confirmation | Open issue before migration |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | Username length | short / max-length / blank | Validation and safe logging behavior |
| B-02 | IP address | IPv4 / IPv6 / empty | Stored safely or left blank |
| B-03 | User agent | short / long | Stored or truncated according to implementation |
| B-04 | Date range | single day / wide range / empty | List endpoint remains stable |
| B-05 | Payload text | Vietnamese / English / mixed | UTF-8 preserved |

## Permission Test Data (supports BB-011, BB-012)

| case | caller | expected |
|---|---|---|
| standard_user → list | `standard_user` (EDITOR, no `AUDIT_READ`) calls `GET /api/v1/admin/audit-logs` | 403 Forbidden |
| standard_user → detail | `standard_user` calls `GET /api/v1/admin/audit-logs/{id}` | 403 Forbidden |
| anonymous_request → list | No Bearer token, calls `GET /api/v1/admin/audit-logs` | 401 Unauthorized |
| anonymous_request → detail | No Bearer token, calls `GET /api/v1/admin/audit-logs/{id}` | 401 Unauthorized |

## Immutability Test Data (supports BB-013)

| item | value |
|---|---|
| Target table | `tbl_admin_audit_log` |
| DB role used | `app_write_role` (the application's own runtime role — must NOT succeed) |
| Attempted statement 1 | `UPDATE tbl_admin_audit_log SET error_message = 'tampered' WHERE admin_audit_log_id = <existing_id>;` |
| Attempted statement 2 | `DELETE FROM tbl_admin_audit_log WHERE admin_audit_log_id = <existing_id>;` |
| Expected | Both fail with a permission-denied error (from the `REVOKE UPDATE, DELETE` DDL); row is unchanged |

## Audit-Write-Failure Simulation Data (supports BB-014)

| item | value |
|---|---|
| Simulation method | Point `AdminAuditLogPersistencePort` at an unreachable/invalid connection, or revoke INSERT on `tbl_admin_audit_log` for the test session only, while leaving business tables untouched |
| Business action under test | One CREATE, one UPDATE, one DELETE, one login success |
| Expected | Business action still returns success/expected result; no audit row is fabricated; internal error is logged (not user-facing) |

## READ-Scope Test Data (supports BB-015)

| entity | detail view expected to log READ? | list view expected to log READ? |
|---|---|---|
| Role | Yes | No |
| Member/User | Yes | No |
| Organization | Yes | No |
| Customer | No | No |
| Project | No | No |
| Repository | No | No |
| Team | No | No |

## Large Payload Test Data (supports BB-017)

| item | value | purpose |
|---|---|---|
| Large-update sample | A Role entity updated with a `permissions` array containing several hundred synthetic permission codes so the serialized before/after JSONB exceeds 1MB | Confirms large snapshot storage without failure |
| Note | Use synthetic permission codes only (e.g., `PERM_TEST_0001` .. `PERM_TEST_0800`), never real permission identifiers tied to production roles |

## Retry/Idempotency Test Data (supports BB-019)

| item | value |
|---|---|
| Scenario | Same valid CREATE (or login) request submitted twice within a short window, simulating a client retry after a perceived timeout |
| Expected | Two distinct audit rows, each with its own `admin_audit_log_id` and `trace_id` |

## Error-Message Sanitization Test Data (supports BB-020)

| scenario | unsafe example (must NOT appear) | safe example (expected) |
|---|---|---|
| Duplicate username on CREATE | `Duplicate username john.smith@example.com` | `Duplicate username` |
| Invalid login password | Any echoed password value | `Invalid credentials` |
| Duplicate entity name | Full entity payload in the message | `Duplicate name` or similar generic reason |

## Existing Data Compatibility

- Reuse the confirmed schema and current CRUD/auth entities from the backend source.
- Reuse `tbl_auth_user_account` as the current confirmed identity table candidate until the open issue is resolved.
- Do not introduce production data into test artifacts.

## Data Setup Procedure

1. Create synthetic admin and audit users.
2. Seed a few master-data records for each audited screen.
3. Produce at least one login success and one login failure sample.
4. Generate an audited update that changes a sensitive field so masking can be checked.

## Data Cleanup Procedure

1. Remove only the synthetic data created for the test run.
2. Keep audit evidence in the test-result artifact only.
3. Do not keep any output that contains raw secrets or production identifiers.

## Sensitive Data Handling

- Never use production secrets.
- Never copy raw credentials into the docs.
- Never save a plaintext password or token in a test artifact.
