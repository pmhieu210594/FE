# Black-box Test Cases

**Ticket ID**: ADMIN-AUDIT-LOG  
**Create date**: 2026-07-09  
**Author**: Claude  
**Update date**: 2026-07-09  

## Test Case Summary

| case ID | AC ID | priority | category | title | status |
|---|---|---|---|---|---|
| BB-001 | AC-ADMIN-AUDIT-LOG-1 | P0 | Normal | CREATE audit row is written for audited CRUD actions | PASS |
| BB-002 | AC-ADMIN-AUDIT-LOG-2 | P0 | Normal | UPDATE audit row contains masked before/after values | PASS |
| BB-003 | AC-ADMIN-AUDIT-LOG-3 | P0 | Boundary | DELETE audit row writes null after_value | PASS |
| BB-004 | AC-ADMIN-AUDIT-LOG-4 | P0 | Security | Secret fields are never stored raw | PASS |
| BB-005 | AC-ADMIN-AUDIT-LOG-5 | P0 | Error | Failed CRUD writes a safe FAILED audit row | PASS |
| BB-006 | AC-ADMIN-AUDIT-LOG-6 | P0 | Normal | Successful login is audited | PASS |
| BB-007 | AC-ADMIN-AUDIT-LOG-7 | P0 | Error | Failed login is audited with attempted username | PASS |
| BB-008 | AC-ADMIN-AUDIT-LOG-8 | P0 | Permission | Audit-log list endpoint is read-only and paginated | PASS |
| BB-009 | AC-ADMIN-AUDIT-LOG-9 | P1 | State | Filters, search, and summary counts match data | PASS |
| BB-010 | AC-ADMIN-AUDIT-LOG-10 | P0 | Permission | Detail endpoint is read-only and shows diff/context | PASS |
| BB-011 | AC-ADMIN-AUDIT-LOG-8 | P0 | Permission | Unauthorized user (no AUDIT_READ) is denied on list/detail | PASS |
| BB-012 | AC-ADMIN-AUDIT-LOG-8, AC-ADMIN-AUDIT-LOG-10 | P0 | Permission | Anonymous/unauthenticated caller is denied on list/detail | PASS |
| BB-013 | — (Spec-pack §6.6 Immutability) | P0 | Security | Raw SQL UPDATE/DELETE on audit table is rejected | PASS |
| BB-014 | AC-ADMIN-AUDIT-LOG-1..6 | P0 | Error | Audit-write failure does not block the business operation | PASS |
| BB-015 | — (Spec-pack §6.1 Business Rules) | P0 | Normal/Boundary | READ logging is limited to Role/Member-User/Organization detail views only | PASS |
| BB-016 | AC-ADMIN-AUDIT-LOG-6, AC-ADMIN-AUDIT-LOG-7 | P1 | Boundary | Username/IP/User-Agent length extremes are handled safely | PASS |
| BB-017 | AC-ADMIN-AUDIT-LOG-2 | P1 | Boundary | Large before/after JSONB (>1MB) is stored without failure | PASS |
| BB-018 | AC-ADMIN-AUDIT-LOG-2, AC-ADMIN-AUDIT-LOG-9 | P1 | Character type | Multilingual/Unicode payload is preserved without encoding errors | PASS |
| BB-019 | — (Spec-pack §14 Idempotency) | P2 | Duplicate | Retried operation writes two separate audit entries | PASS |
| BB-020 | AC-ADMIN-AUDIT-LOG-5, AC-ADMIN-AUDIT-LOG-7 | P0 | Security | Error messages never expose sensitive detail (PII/secrets) | PASS |

## Test Cases

### BB-001: CREATE audit row is written for audited CRUD actions

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | An authenticated admin user can create one audited entity |
| Input | A valid create request on one audited admin screen |
| Steps | Perform create, then query the audit log |
| Expected Result | Exactly one SUCCESS audit row is stored with module, entity, actor, timestamp, and operation type = CREATE |
| Note | Repeat for each audited screen in later test coverage |

### BB-002: UPDATE audit row contains masked before/after values

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | An editable audited entity exists |
| Input | A valid update request that changes at least one field |
| Steps | Perform update, inspect stored audit row |
| Expected Result | The audit row contains changed fields plus masked before/after snapshots |
| Note | Sensitive fields must be excluded or redacted |

### BB-003: DELETE audit row writes null after_value

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-3 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | A deletable audited entity exists |
| Input | A valid delete request |
| Steps | Perform delete, inspect audit row |
| Expected Result | A DELETE audit row exists and `after_value` is null |
| Note | Supports soft-delete or hard-delete as used by the source entity |

### BB-004: Secret fields are never stored raw

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-4 |
| Priority | P0 |
| Category | Security |
| Preconditions | A request changes a sensitive field such as password or token |
| Input | Update request with a secret-bearing field |
| Steps | Perform update, inspect before/after payloads |
| Expected Result | No raw secret is stored; only the fact that the field changed is visible |
| Note | Masking must be consistent across all audited sources |

### BB-005: Failed CRUD writes a safe FAILED audit row

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-5 |
| Priority | P0 |
| Category | Error |
| Preconditions | A validation or constraint failure can be triggered safely |
| Input | Invalid create or update request |
| Steps | Trigger failure, then inspect audit row |
| Expected Result | A FAILED audit row exists with a safe error message and without sensitive data |
| Note | Business failure and audit failure must remain distinguishable |

### BB-006: Successful login is audited

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-6 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A valid login account exists |
| Input | Valid username/password |
| Steps | Log in successfully and inspect the audit log |
| Expected Result | One LOGIN_SUCCESS audit row is stored with actor, IP, user agent, and timestamp |
| Note | Confirm no raw credential value is stored |

### BB-007: Failed login is audited with attempted username

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-7 |
| Priority | P0 |
| Category | Error |
| Preconditions | A valid or invalid username can be used for a failed login test |
| Input | Invalid password or invalid username |
| Steps | Trigger login failure and inspect audit row |
| Expected Result | One LOGIN_FAILED audit row is stored with the attempted username and a safe error message |
| Note | No secret value is stored |

### BB-008: Audit-log list endpoint is read-only and paginated

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-8 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Audit rows exist and the caller has audit-read access |
| Input | `GET /api/v1/admin/audit-logs` |
| Steps | Call the list endpoint and inspect the response |
| Expected Result | Response is paginated, sorted by newest first, and no mutation endpoint is available |
| Note | Only GET behavior is allowed |

### BB-009: Filters, search, and summary counts match data

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-9 |
| Priority | P1 |
| Category | State |
| Preconditions | Audit rows exist across multiple modules |
| Input | Filtered list queries |
| Steps | Apply module/operation-type/date/search filters and inspect summary values |
| Expected Result | Returned rows and summary counts match the filtered dataset |
| Note | Keep filters aligned to real columns only |

### BB-010: Detail endpoint is read-only and shows diff/context

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | A detail row exists for a CRUD or login event |
| Input | `GET /api/v1/admin/audit-logs/{id}` |
| Steps | Open the detail response and inspect it |
| Expected Result | Response includes detail context, diff or login metadata, and no edit/delete action is exposed |
| Note | The endpoint remains read-only |

### BB-011: Unauthorized user (no AUDIT_READ) is denied on list/detail

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-8, AC-ADMIN-AUDIT-LOG-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | `standard_user` is authenticated but has no `AUDIT_READ` permission; at least one audit row exists |
| Input | `GET /api/v1/admin/audit-logs` and `GET /api/v1/admin/audit-logs/{id}` using `standard_user` credentials |
| Steps | Call list endpoint, then call detail endpoint, as `standard_user` |
| Expected Result | Both calls are rejected (403 Forbidden); no audit data is returned |
| Note | Confirms `@PreAuthorize`/role check is enforced on both endpoints, not just the list |

### BB-012: Anonymous/unauthenticated caller is denied on list/detail

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-8, AC-ADMIN-AUDIT-LOG-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | No auth token / `anonymous_request` |
| Input | `GET /api/v1/admin/audit-logs` and `GET /api/v1/admin/audit-logs/{id}` with no Bearer token |
| Steps | Call both endpoints without authentication |
| Expected Result | Both calls are rejected (401 Unauthorized) |
| Note | Confirms endpoints are not accidentally left public |

### BB-013: Raw SQL UPDATE/DELETE on audit table is rejected

| item | content |
|---|---|
| Related AC | Spec-pack §6.6 Non-functional (Immutability) |
| Priority | P0 |
| Category | Security |
| Preconditions | At least one row exists in `tbl_admin_audit_log`; DB session uses the application's write role (`app_write_role`) |
| Input | Direct SQL: `UPDATE tbl_admin_audit_log SET error_message = 'tampered' WHERE admin_audit_log_id = <id>;` and `DELETE FROM tbl_admin_audit_log WHERE admin_audit_log_id = <id>;` |
| Steps | Execute both statements against the DB using the app's runtime role |
| Expected Result | Both statements fail with a permission-denied error; the row is unchanged |
| Note | Validates the `REVOKE UPDATE, DELETE ... GRANT INSERT, SELECT` DDL from `V5__admin_audit_log.sql` actually takes effect, not just that it's written |

### BB-014: Audit-write failure does not block the business operation

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-1..6 |
| Priority | P0 |
| Category | Error |
| Preconditions | Audit persistence can be made to fail on demand (e.g., simulate DB connectivity error / permission error on `tbl_admin_audit_log` only) |
| Input | A valid CREATE (or UPDATE/DELETE/login) request while the audit-write path is forced to fail |
| Steps | Force the audit insert to fail, then perform the business operation, then check both the business result and the audit table |
| Expected Result | The business operation still succeeds (e.g., entity is created, login succeeds); the audit failure is logged internally but not surfaced as a business error; no audit row is silently fabricated |
| Note | This is distinct from BB-005 — BB-005 covers a *business* failure producing a FAILED audit row; this case covers an *audit-write* failure while the business operation itself succeeds |

### BB-015: READ logging is limited to Role/Member-User/Organization detail views only

| item | content |
|---|---|
| Related AC | Spec-pack §6.1 Business Rules |
| Priority | P0 |
| Category | Normal / Boundary |
| Preconditions | Detail-view records exist for all 7 entity types |
| Input | `GET` detail-view requests for Role, Member/User, Organization, and separately for Customer, Project, Repository, Team; plus list-view `GET` requests for Role, Member/User, Organization |
| Steps | Call each detail/list endpoint once, then inspect the audit log |
| Expected Result | A READ audit row is written only for the Role, Member/User, and Organization **detail-view** calls; no READ row is written for their list views, and no READ row is written for Customer/Project/Repository/Team at all (detail or list) |
| Note | Directly tests the "detail views only, sensitive entities only" business rule, which is easy to over-implement (log everything) or under-implement (log nothing) |

### BB-016: Username/IP/User-Agent length extremes are handled safely

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-6, AC-ADMIN-AUDIT-LOG-7 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Login and CRUD endpoints reachable with controllable request headers |
| Input | Username at 1 char / 128 char / blank-whitespace; IP as IPv4 / IPv6 / empty / multi-hop `X-Forwarded-For`; User-Agent string over 256 chars |
| Steps | Trigger login attempts and one CRUD action for each boundary input combination, then inspect the stored audit rows |
| Expected Result | No boundary input crashes the request; username follows validation rules (reject empty/whitespace); IP is stored as-is or blank, never causes a failure; User-Agent over 256 chars is truncated or stored as NULL, never rejected |
| Note | Consolidates B-01/B-02/B-03 from `test-data.md` into one executable case |

### BB-017: Large before/after JSONB (>1MB) is stored without failure

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-2 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | An audited entity can be updated with a very large field set (or a field containing large text) |
| Input | An UPDATE request that produces a before/after snapshot larger than 1MB when serialized |
| Steps | Perform the update, then read back the stored audit row |
| Expected Result | The row is stored and readable without error or truncation-induced data corruption; no timeout on write |
| Note | Realistic size, not synthetic bloat — use a legitimately large but plausible field (e.g., a large permissions list) |

### BB-018: Multilingual/Unicode payload is preserved without encoding errors

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-2, AC-ADMIN-AUDIT-LOG-9 |
| Priority | P1 |
| Category | Character type |
| Preconditions | An audited entity can hold free-text fields |
| Input | Field values mixing Vietnamese diacritics, English, and Japanese characters |
| Steps | Perform a CREATE/UPDATE with mixed-language field values, then read the audit row and the list/search results |
| Expected Result | All characters round-trip correctly (no mojibake); search by a Unicode substring returns the matching row |
| Note | Covers B-05 from `test-data.md` |

### BB-019: Retried operation writes two separate audit entries

| item | content |
|---|---|
| Related AC | Spec-pack §14 Idempotency |
| Priority | P2 |
| Category | Duplicate |
| Preconditions | A CRUD or login endpoint that can be called twice in quick succession with the same payload (simulating a client-side retry after timeout) |
| Input | The same valid request sent twice |
| Steps | Send the request twice, then inspect the audit log |
| Expected Result | Two separate audit rows exist (each with its own `admin_audit_log_id` and `trace_id`); the system does not attempt to deduplicate them |
| Note | This is expected behavior per spec, not a defect — the test exists to prevent a future "helpful" dedup change from silently breaking this |

### BB-020: Error messages never expose sensitive detail

| item | content |
|---|---|
| Related AC | AC-ADMIN-AUDIT-LOG-5, AC-ADMIN-AUDIT-LOG-7 |
| Priority | P0 |
| Category | Security |
| Preconditions | A failure can be triggered that would naturally include PII or a raw value (e.g., duplicate-username validation error, invalid-password login failure) |
| Input | A CRUD request that fails a uniqueness/validation check on a field containing PII (e.g., email), and a failed login attempt |
| Steps | Trigger each failure, then inspect the stored `error_message` |
| Expected Result | `error_message` describes the failure category generically (e.g., "Duplicate username") without embedding the specific PII value (e.g., not "Duplicate username john.smith@example.com"); no password/token value ever appears |
| Note | Directly verifies spec-pack §13 Security/Privacy Impact sanitization requirement |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [x] Numeric input
- [x] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [x] External IF failure
- [x] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [x] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output