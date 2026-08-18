# Test Data

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-10
**Author**:  nk_trung
**Update date**: 2026-06-11

## Data Policy

- Use synthetic data only.
- Do not use production data, production-like customer names, real OAuth credentials, real access tokens, or secrets.
- Use deterministic prefixes such as `ORG_BB_`, `ORG_TEST_`, or `ORG_E2E_` so cleanup can safely identify test data.
- Existing seed or migrated data may include `Brycen Vietnam`; do not depend on that record unless the test environment explicitly documents it as test-safe.
- Test data must include active and soft-deleted Organizations because duplicate uniqueness applies only to non-deleted records.
- Test data must include current and stale numeric `version` values for optimistic locking cases.
- For boundary data, count characters according to the user-visible/API validation rule. Record whether multi-byte characters are counted as characters or bytes if runtime behavior differs.

## Master Data

| name | value | purpose |
|---|---|---|
| Organization Status | `ACTIVE` | Default state for newly created and usable Organizations. |
| Organization Status | `DELETED` | State for soft-deleted Organizations. |
| Status Filter | `Active` | Default list/status filter; deleted records must be excluded. |
| Status Filter | `Deleted` | Displays only soft-deleted Organizations. |
| Status Filter | `All` | Displays both active and deleted Organizations. |
| Role | `ADMIN` | Allowed to view/create/update/soft-delete Organizations. |
| Role | `VIEWER` | Authenticated non-ADMIN role for permission-negative testing. |
| Role | `EDITOR` | Authenticated non-ADMIN role for permission-negative testing if available. |
| Message Key | `Pages.Organization.Code.Required` | Expected code-required validation key/localized equivalent. |
| Message Key | `Pages.Organization.Name.Required` | Expected name-required validation key/localized equivalent. |
| Message Key | `Pages.Organization.Code.Duplicate` | Expected duplicate-code validation key/localized equivalent. |
| Message Key | `Pages.Organization.Name.Duplicate` | Expected duplicate-name validation key/localized equivalent. |
| Message Key | `Pages.Organization.Description.MaxLength` | Expected description max-length validation key/localized equivalent. |
| Message Key | `Pages.Organization.Conflict.Version` | Expected stale-version conflict key/localized equivalent. |
| Message Key | `Component.Permission.Denied` | Expected direct non-ADMIN API permission error key/localized equivalent. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin_bb@example.test` | ADMIN | View, create, update, soft-delete Organization | P0/P1 normal, boundary, duplicate, conflict, delete cases. |
| `viewer_bb@example.test` | VIEWER | No Organization Management permission | FE logout/redirect and BE 403 cases. |
| `editor_bb@example.test` | EDITOR | No Organization Management permission for this ticket unless project policy says otherwise | Additional non-ADMIN negative case. |
| Unauthenticated session | N/A | No authenticated access | Organization API 401/unauthenticated behavior. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| ORG-NORMAL-001 | code `ORG_BB_BVN_ACTIVE`, name `Organization BB Vietnam Active`, description `Active org for list/search/edit/delete`, status `ACTIVE`, version `0` or current version | Default active list, detail, update, delete. |
| ORG-NORMAL-002 | code `ORG_BB_TOKYO_ACTIVE`, name `Organization BB Tokyo Active`, description `Second active org`, status `ACTIVE`, version `0` or current version | Search, duplicate negative pair, filter All/Active. |
| ORG-NORMAL-003 | code `ORG_BB_DESC_ACTIVE`, name `Organization BB Description Active`, description with multiple lines under 500 characters, status `ACTIVE` | Optional description create/update verification. |
| ORG-NORMAL-004 | code `ORG_BB_SEARCH_MULTI`, name `Organization BB Multi Byte テスト Việt Nam`, description `Multi-byte search data`, status `ACTIVE` | Character type and multi-byte search/display. |
| ORG-CREATE-001 | code `ORG_BB_CREATE_001`, name `Organization Blackbox Create 001`, description empty | Create valid required fields only. |
| ORG-CREATE-002 | code `ORG_BB_CREATE_DESC`, name `Organization Blackbox Create Description`, description `Line 1\nLine 2 - under 500 characters` | Create with optional description. |
| ORG-UPDATE-001 | existing code `ORG_BB_UPDATE_SRC`, new code `ORG_BB_UPDATE_DST`, existing name `Organization BB Update Source`, new name `Organization BB Update Target`, status `ACTIVE`, current version known | Update code/name success. |
| ORG-DELETE-001 | code `ORG_BB_DELETE_ACTIVE`, name `Organization BB Delete Active`, status `ACTIVE`, current version known | Soft-delete success. |

## Error Data

| ID | data | expected error |
|---|---|---|
| ERR-CODE-EMPTY | `organizationCode=''`, valid unique name | Code required message, expected `Pages.Organization.Code.Required`; no record created/updated. |
| ERR-CODE-WHITESPACE | `organizationCode='   '`, valid unique name | Code required message, expected `Pages.Organization.Code.Required`; no record created/updated. |
| ERR-NAME-EMPTY | Valid unique code, `organizationName=''` | Name required message, expected `Pages.Organization.Name.Required`; no record created/updated. |
| ERR-NAME-WHITESPACE | Valid unique code, `organizationName='   '` | Name required message, expected `Pages.Organization.Name.Required`; no record created/updated. |
| ERR-CODE-DUP-CREATE | Existing active code `ORG_BB_BVN_ACTIVE`; create code `ORG_BB_BVN_ACTIVE` | Duplicate-code error, expected `Pages.Organization.Code.Duplicate`; no new active duplicate. |
| ERR-CODE-DUP-CASE | Existing active code `ORG_BB_BVN_ACTIVE`; create/update code `org_bb_bvn_active` | Duplicate-code error if case-insensitive duplicate check is active; record observed runtime behavior if not finalized. |
| ERR-NAME-DUP-CREATE | Existing active name `Organization BB Vietnam Active`; create same name | Duplicate-name error, expected `Pages.Organization.Name.Duplicate`; no new active duplicate. |
| ERR-NAME-DUP-CASE | Existing active name `Organization BB Vietnam Active`; create/update case variant | Duplicate-name error if case-insensitive duplicate check is active; record observed runtime behavior if not finalized. |
| ERR-CODE-DUP-UPDATE | Update ORG-NORMAL-002 code to `ORG_BB_BVN_ACTIVE` | Duplicate-code error; updated Organization remains unchanged. |
| ERR-NAME-DUP-UPDATE | Update ORG-NORMAL-002 name to `Organization BB Vietnam Active` | Duplicate-name error; updated Organization remains unchanged. |
| ERR-VERSION-STALE-UPDATE | Read version N; another client updates to N+1; submit update with N | HTTP 409 or UI conflict response with `Pages.Organization.Conflict.Version`; no overwrite. |
| ERR-VERSION-STALE-DELETE | Read version N; another client updates/deletes first; submit delete with N | HTTP 409 or UI conflict response with `Pages.Organization.Conflict.Version`; no stale delete. |
| ERR-DELETED-EDIT | Try to edit a row already in `DELETED` status | Edit is blocked by read-only UI or rejected by API; no update occurs. |
| ERR-DELETED-DELETE | Try to delete a row already in `DELETED` status | Safe rejection or no-op according to final API contract; no physical deletion. |
| ERR-NONADMIN-FE | Authenticated `viewer_bb@example.test` opens Organization screen | FE logs out and redirects to `/:lang/login`; Organization data not displayed. |
| ERR-NONADMIN-API | Authenticated `viewer_bb@example.test` calls Organization API directly | HTTP 403 with `Component.Permission.Denied` or localized equivalent; no data/write. |
| ERR-UNAUTH-API | No session/cookie/token calls Organization API | Existing unauthenticated response, normally HTTP 401; no data/write. |
| ERR-NOTFOUND-ID | Request detail/update/delete for non-existing Organization ID | Existing not-found behavior; no data/write. Include traceId/error shape if available. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BND-CODE-001 | organizationCode | 1 character, for example `A` with unique suffix strategy if needed | Accepted if valid and unique. |
| BND-CODE-050 | organizationCode | 50 characters | Accepted if valid and unique. |
| BND-CODE-051 | organizationCode | 51 characters | Rejected; no create/update. |
| BND-NAME-001 | organizationName | 1 character | Accepted if valid and unique. |
| BND-NAME-255 | organizationName | 255 characters | Accepted if valid and unique. |
| BND-NAME-256 | organizationName | 256 characters | Rejected; no create/update. |
| BND-DESC-NULL | description | null/not provided | Accepted. |
| BND-DESC-EMPTY | description | empty string | Accepted. |
| BND-DESC-500 | description | 500 characters | Accepted. |
| BND-DESC-501 | description | 501 characters | Rejected with description max-length message, expected `Pages.Organization.Description.MaxLength`. |
| BND-DESC-MULTILINE | description | Multi-line text within 500 characters | Accepted and displayed safely if UI supports multi-line input/display. |
| BND-SEARCH-NOMATCH | search keyword | Unique no-match keyword such as `NO_MATCH_ORG_BB_999` | Empty state or empty table; no error. |
| BND-SEARCH-PARTIAL | search keyword | Partial code/name keyword, for example `BVN` or `Vietnam` | Matching records displayed; non-matching records excluded. |
| BND-SEARCH-MULTIBYTE | search keyword | `テスト` or `Việt` if matching data exists | Matching records displayed if search supports the character set; otherwise record observed behavior. |
| BND-VERSION-CURRENT | version | Current numeric version N | Update/delete succeeds if all other input is valid. |
| BND-VERSION-STALE | version | Old numeric version N after target changed to N+1 | HTTP 409 conflict with `Pages.Organization.Conflict.Version`; no overwrite/delete. |
| BND-VERSION-MISSING | version | Missing version in update/delete request | Rejected by request validation or existing error contract; no write. |
| BND-VERSION-NONNUMERIC | version | Non-numeric value in update/delete request | Rejected by request validation or existing error contract; no write. |
| BND-DOUBLE-SUBMIT | create/update submit | Two rapid identical submissions | At most one success; no duplicate active Organization or unintended double update. |

## Deleted / Compatibility Data

| ID | data | purpose | expected |
|---|---|---|---|
| ORG-DELETED-001 | code `ORG_BB_DELETED_REUSE`, name `Organization BB Deleted Reuse`, status `DELETED`, deleted metadata set | Deleted filter, read-only detail, code/name reuse | Hidden from default/Active list; visible in Deleted filter; does not block create with same code/name. |
| ORG-DELETED-002 | code `ORG_BB_DELETED_READONLY`, name `Organization BB Deleted Readonly`, status `DELETED` | Deleted read-only detail and edit-block test | Detail is viewable read-only; update is blocked/rejected. |
| ORG-COMPAT-001 | Existing pre-migration Organization row if test DB includes one | Existing data compatibility | Row remains accessible after migration with valid code/status/version according to migration policy. |
| ORG-COMPAT-002 | Existing Customer/Project references to Organization if present in test DB | Relationship compatibility | Organization primary key/reference behavior is not broken by Organization changes. |

## Test Data to Test Case Mapping

| test data ID | used by case IDs |
|---|---|
| `admin_bb@example.test` | BB-ORG-001..BB-ORG-026, BB-ORG-030..BB-ORG-033 |
| `viewer_bb@example.test` / `editor_bb@example.test` | BB-ORG-027, BB-ORG-028 |
| Unauthenticated session | BB-ORG-029 |
| ORG-NORMAL-001 | BB-ORG-001, BB-ORG-003, BB-ORG-004, BB-ORG-006, BB-ORG-013, BB-ORG-014, BB-ORG-017, BB-ORG-019 |
| ORG-NORMAL-002 | BB-ORG-003, BB-ORG-004, BB-ORG-006, BB-ORG-017, BB-ORG-019 |
| ORG-NORMAL-003 | BB-ORG-008, BB-ORG-020, BB-ORG-021 |
| ORG-NORMAL-004 | BB-ORG-005 |
| ORG-CREATE-001 | BB-ORG-007 |
| ORG-CREATE-002 | BB-ORG-008 |
| ORG-UPDATE-001 | BB-ORG-016, BB-ORG-018, BB-ORG-020, BB-ORG-021, BB-ORG-022, BB-ORG-032 |
| ORG-DELETE-001 | BB-ORG-023, BB-ORG-024 |
| ORG-DELETED-001 | BB-ORG-006, BB-ORG-015, BB-ORG-025 |
| ORG-DELETED-002 | BB-ORG-026 |
| ERR-* rows | BB-ORG-009, BB-ORG-010, BB-ORG-012, BB-ORG-013, BB-ORG-014, BB-ORG-017, BB-ORG-019, BB-ORG-022, BB-ORG-024, BB-ORG-027, BB-ORG-028, BB-ORG-029, BB-ORG-030 |
| BND-* rows | BB-ORG-005, BB-ORG-011, BB-ORG-012, BB-ORG-020, BB-ORG-021, BB-ORG-022, BB-ORG-024, BB-ORG-032 |
| ORG-COMPAT-* rows | BB-ORG-030, existing data compatibility review |

## Existing Data Compatibility

- Existing Organization table data must remain compatible after the Organization management change.
- Existing Organization rows must have valid values for required Organization fields after migration/backfill in the target environment.
- Existing Customer/Project references to Organization must not be broken by the Organization change.
- Soft-delete must not physically remove Organization rows because existing references may depend on them.
- Duplicate tests must not depend on production-like existing rows; create isolated synthetic active/deleted records instead.

## Data Setup Procedure

1. Prepare an isolated test database or approved QA environment.
2. Create or identify synthetic ADMIN and non-ADMIN users.
3. Insert or create active Organization records listed in Normal Data.
4. Insert or create soft-deleted Organization records listed in Deleted / Compatibility Data.
5. Confirm no active records already use the planned unique codes/names.
6. For stale-version tests, read target version N, perform a successful update/delete in another session, then submit the stale request using version N.
7. For double-submit tests, use a unique timestamp/suffix so repeated runs do not collide with previous unfinished data.
8. For boundary tests, generate exact-length values before execution and record the generated value or generator rule in test evidence.

## Data Cleanup Procedure

1. Delete or archive only synthetic data with approved test prefixes such as `ORG_BB_`, `ORG_TEST_`, or `ORG_E2E_`.
2. Do not physically delete production or production-like data.
3. If cleanup must remove synthetic rows, ensure no unrelated test references remain.
4. Reset test users/sessions according to environment policy.
5. For local/CI runs, prefer database reset or migration-managed test fixtures over manual cleanup.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not commit session cookies, OAuth tokens, passwords, or personal email addresses except synthetic `example.test` values.
- Do not paste raw server logs containing secrets into test evidence. Redact any trace/log evidence before saving.
