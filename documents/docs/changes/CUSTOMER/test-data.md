# Test Data

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

## Data Policy

- Use synthetic, non-production data only.
- Keep every test data set independent and deterministic.
- Prefer stable UUIDs and fixed codes/aliases in tests.
- Do not store secrets, OAuth tokens, or real customer names in artifacts.

## Master Data

| name | value | purpose |
|---|---|---|
| Active Organization | `ORG-ACTIVE-001` / `Brycen Customer Active Org` | Base Organization for create/search/edit scenarios. |
| Deleted Organization | `ORG-DELETED-001` / `Brycen Customer Deleted Org` | Negative validation for create/edit dropdown and BE enforcement. |
| Inactive Organization | `ORG-INACTIVE-001` / `Brycen Customer Inactive Org` | Negative validation for create/edit dropdown and BE enforcement. |
| Active Customer | `CUS-ACTIVE-001` / `Customer Alpha` | Default list, detail, edit, delete, and duplicate tests. |
| Deleted Customer | `CUS-DELETED-001` / `Customer Deleted` | Deleted list and reuse-after-delete tests. |
| Child Project Tree | `PRJ-001`, `PRJ-002`, `TKT-001` | Cascade soft delete verification. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin.customer` | `ADMIN` | Full Customer access | Positive UI/BE/E2E journey. |
| `viewer.customer` | `VIEWER` | Read-only or forbidden Customer access | Non-ADMIN redirect and 403 coverage. |
| `editor.customer` | `EDITOR` | Non-ADMIN account | Alternate non-ADMIN access path. |
| `expired.session` | N/A | Invalid session cookie | Session-expired redirect coverage. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | Customer code `CUS-001`, alias `Customer Alpha`, classification `INTERNAL`, active Organization `ORG-ACTIVE-001` | Valid create scenario. |
| N-02 | Customer code `CUS-002`, alias `Customer Beta`, classification `EXTERNAL`, active Organization `ORG-ACTIVE-001` | Valid search/filter/list scenario. |
| N-03 | Customer code `CUS-003`, alias `Customer Gamma`, active Organization `ORG-ACTIVE-001` | Valid detail/edit scenario. |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | Missing Organization | Validation error for required Organization. |
| E-02 | Missing customer code | Validation error for required code. |
| E-03 | Missing customer alias | Validation error for required alias. |
| E-04 | Duplicate active code `CUS-001` | Duplicate code conflict. |
| E-05 | Duplicate active alias `Customer Alpha` in same Organization | Duplicate alias conflict. |
| E-06 | Inactive Organization `ORG-INACTIVE-001` | Organization unavailable error. |
| E-07 | Deleted Organization `ORG-DELETED-001` | Organization unavailable error. |
| E-08 | Stale `version = 0` after successful update | Optimistic locking conflict. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | Customer code minimum | 1 character | Accept if other values are valid. |
| B-02 | Customer code maximum | 50 characters | Accept if other values are valid. |
| B-03 | Customer code over maximum | 51 characters | Reject with validation error. |
| B-04 | Customer alias minimum | 1 character | Accept if other values are valid. |
| B-05 | Customer alias maximum | 255 characters | Accept if other values are valid. |
| B-06 | Customer alias over maximum | 256 characters | Reject with validation error. |
| B-07 | Full-width number input | `１２３` | Reject or normalize according to spec; record expected validation behavior. |

## Existing Data Compatibility

- Existing active Customers should remain visible in the default list.
- Soft-deleted Customers should remain queryable only through the Deleted/All filter state.
- Existing active Organizations should remain selectable in create/edit.
- Existing deleted or inactive Organizations should not be offered for new Customer assignment.
- Reuse of code/alias from soft-deleted Customers should be accepted when no active duplicate remains.

## Data Setup Procedure

1. Seed one active Organization for positive flows.
2. Seed one deleted Organization and one inactive Organization for negative flows.
3. Seed at least one active Customer under the active Organization.
4. Seed one soft-deleted Customer for reuse and deleted-list checks.
5. Seed one Customer with a child Project tree for cascade-delete verification.
6. Use a fixed admin session and one non-admin session for permission coverage.

## Data Cleanup Procedure

1. Remove Customers created during the test run.
2. Remove Projects and descendant rows created for cascade tests.
3. Remove seed Organizations only if the environment was dedicated to the Customer phase.
4. Clear browser session/local storage after E2E execution.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
