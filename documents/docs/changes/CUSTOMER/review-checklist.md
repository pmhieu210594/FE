# Review Checklist

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung                    
**Update date**: 2026-06-10  

## 1. Specification/AC Matching

| ID | severity | check item | AC reference | status | note |
|---|---|---|---|---|---|
| RC-CUS-SPEC-001 | Blocker | Customer Management remains CRUD-only. | AC-CUSTOMER-1..18 | [X] | No dashboard/KPI/export/restore. |
| RC-CUS-SPEC-002 | Blocker | ADMIN can access Customer function; non-ADMIN cannot. | AC-CUSTOMER-1,14 | [X] | FE logout redirect + BE 403. |
| RC-CUS-SPEC-003 | Blocker | Customer list excludes Customers under inactive/deleted Organizations. | AC-CUSTOMER-3 | [X] | BE query must enforce. |
| RC-CUS-SPEC-004 | Blocker | Default list excludes soft-deleted Customers. | AC-CUSTOMER-4 | [X] | Active default. |
| RC-CUS-SPEC-005 | Major | Search/filter by Organization, alias/name, classification, status. | AC-CUSTOMER-5 | [X] |  |
| RC-CUS-SPEC-006 | Blocker | Create/edit Organization dropdown only shows active/non-deleted Organizations. | AC-CUSTOMER-7,12 | [X] |  |
| RC-CUS-SPEC-007 | Blocker | Create/update rejects inactive/deleted Organization. | AC-CUSTOMER-9 | [X] | BE validation. |
| RC-CUS-SPEC-008 | Blocker | Duplicate alias in same Organization is rejected case-insensitively for non-deleted Customers. | AC-CUSTOMER-15 | [X] | 409 expected later. |
| RC-CUS-SPEC-009 | Blocker | Stale version is rejected with conflict. | AC-CUSTOMER-16 | [X] |  |
| RC-CUS-SPEC-010 | Blocker | Customer soft delete cascades to its full child tree. | AC-CUSTOMER-17 | [X] |  |
| RC-CUS-SPEC-011 | Major | BE returns message key and FE translates `ja/en/vi`. | AC-CUSTOMER-18 | [X] |  |

## 2. General System Review

### 2.1. Number/Input Check

- [X] Clear Numeric Validation
- [X] Full-width Numbers are Processed or Clearly Not Supported
- [X] Half-width/Full-width Mixed Numbers are Considered
- [X] Empty String/Null are Processed
- [X] Clear Digit/Precision/Scale/Rounding
- [X] No Overflow/Underflow

### 2.2. Character Type / Encoding / Locale

- [X] Full-width/half-width/emoji/surrogate pair considered
- [X] Clear trim rule
- [X] Unicode normalization if needed
- [X] No mojibake Shift-JIS/UTF-8
- [X] Japanese/Vietnamese/English messages are not misspelled

### 2.3. Literal / Magic Number

- [X] No hard-coded business code value
- [X] Enum/constant/master used correctly
- [X] Clear mapping display/internal value

### 2.4. Operation / Maintainability

- [X] Sufficient logs for incident investigation
- [X] Correlation ID/request ID if needed
- [X] Retry/double execution considered
- [X] Clear rollback/manual recovery
- [X] Configuration not hard-coded

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-GEN-001 | Blocker | No Organization Management implementation is added in this ticket. | [X] | Customer may depend on active Organization lookup only. |
| RC-CUS-GEN-002 | Blocker | No Project/Repository child list is added to Customer detail. | [X] | Out of scope. |
| RC-CUS-GEN-003 | Major | Existing connector/webhook/metrics flows are not changed. | [X] |  |
| RC-CUS-GEN-004 | Major | Existing architecture layering is followed. | [X] | Controller -> use case -> port/adapter. |

## 3. FE Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-FE-001 | Blocker | Customer route decision is documented before implementation. | [X] | Route is documented as `/:lang/customers` with `Menu.Customer`. |
| RC-CUS-FE-002 | Blocker | Non-ADMIN Customer access logs out and redirects to `/:lang/login`. | [X] |  |
| RC-CUS-FE-003 | Major | Customer API uses `EDCAP_FE/src/lib/api.ts`; no direct fetch/axios. | [X] |  |
| RC-CUS-FE-004 | Major | Organization dropdown excludes inactive/deleted Organizations. | [X] |  |
| RC-CUS-FE-005 | Major | Customer list/search/filter state matches spec. | [X] |  |
| RC-CUS-FE-006 | Major | Validation/i18n messages display in current locale. | [X] | en/ja/vi. |
| RC-CUS-FE-007 | Major | Delete requires confirmation. | [X] |  |
| RC-CUS-FE-008 | Minor | Empty state is translated and usable. | [X] |  |

## 4. BE/API Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-BE-001 | Blocker | BE enforces ADMIN-only access with standard 403. | [X] | Do not copy ad-hoc `Map.of("error")` pattern. |
| RC-CUS-BE-002 | Blocker | BE validates Organization active/non-deleted for create/update. | [X] |  |
| RC-CUS-BE-003 | Blocker | BE list query excludes invalid Organizations and deleted Customers by default. | [X] |  |
| RC-CUS-BE-004 | Blocker | BE prevents editing deleted Customer. | [X] |  |
| RC-CUS-BE-005 | Blocker | BE performs cascade soft delete for Customer child tree. | [X] |  |
| RC-CUS-BE-006 | Major | API status codes are documented and tested. | [X] | 400/403/404/409 candidates. |
| RC-CUS-BE-007 | Major | Error response contract supports message-key i18n. | [X] | Ticket keeps `ErrorResponse.message` as the translated key. |

## 5. DB/Migration Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-DB-001 | Blocker | `tbl_dim_customer` is not renamed/recreated. | [X] |  |
| RC-CUS-DB-002 | Blocker | Old V4 migration is not edited in implementation. | [X] | Use new migration. |
| RC-CUS-DB-003 | Blocker | `deleted_at`, `deleted_by`, `version` are added safely if implemented. | [X] |  |
| RC-CUS-DB-004 | Blocker | Existing unique constraint is migrated safely to active-scope/case-insensitive uniqueness. | [X] | Requires pre-check. |
| RC-CUS-DB-005 | Major | Existing data is preserved. | [X] |  |
| RC-CUS-DB-006 | Major | Cascade delete path is supported by schema/FK relationships. | [X] |  |

## 6. Security/Privacy Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-SEC-001 | Blocker | FE guard is not the only security control; BE enforces role. | [X] |  |
| RC-CUS-SEC-002 | Major | Logs do not expose secrets or unnecessary customer-sensitive data. | [X] |  |
| RC-CUS-SEC-003 | Major | TraceId/error handling remains available. | [X] |  |
| RC-CUS-SEC-004 | Major | Session/auth behavior is not weakened. | [X] |  |

## 7. Operation/Maintenance Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-OPS-001 | Major | Create/update/delete actions are auditable. | [X] | created/updated/deleted metadata. |
| RC-CUS-OPS-002 | Major | Migration has pre-check/post-check notes. | [X] | duplicate alias check. |
| RC-CUS-OPS-003 | Minor | Operational errors have enough context via traceId. | [X] |  |

## 8. Test Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-TEST-001 | Blocker | Test plan covers all ACs. | [X] |  |
| RC-CUS-TEST-002 | Major | BE validation/security/conflict tests are planned. | [X] |  |
| RC-CUS-TEST-003 | Major | DB migration verification is planned. | [X] |  |
| RC-CUS-TEST-004 | Major | FE automated tests are explicitly deferred if not implemented. | [X] | Not accidental omission. |
| RC-CUS-TEST-005 | Major | Blackbox testcases cover permission, duplicate, deleted state, cascade soft delete. | [X] |  |

## 9. Documentation/Traceability Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-DOC-001 | Major | AC mapping remains traceable across spec/context/plan/test. | [X] |  |
| RC-CUS-DOC-002 | Major | Source assumptions are documented. | [X] |  |
| RC-CUS-DOC-003 | Minor | Deferred items are clearly listed. | [X] |  |

## 10. Release/Rollback Review

| ID | severity | check item | status | note |
|---|---|---|---|---|
| RC-CUS-REL-001 | Blocker | Migration rollback/limitation is documented before release. | [X] |  |
| RC-CUS-REL-002 | Major | Unique index migration failure path is documented. | [X] |  |
| RC-CUS-REL-003 | Major | App rollback does not require destructive DB rollback. | [X] |  |

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix before merge/release |
| Major | High probability of becoming a bug | Fix or record accepted risk |
| Minor | Minor improvement | Optional/follow-up acceptable |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect report | Record reason for rejection |
| Accepted Risk | Accepted risk | Record impact/owner/deadline |
