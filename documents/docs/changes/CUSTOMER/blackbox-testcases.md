# Black-box Test Cases

**Ticket ID**: CUSTOMER  
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-12  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-CUSTOMER-1, AC-CUSTOMER-14 | P0 | Permission | ADMIN opens Customer Management |
| BB-002 | AC-CUSTOMER-14 | P0 | Permission | Non-ADMIN opens Customer Management route |
| BB-003 | AC-CUSTOMER-2, AC-CUSTOMER-3, AC-CUSTOMER-4 | P0 | Normal | Default Customer list |
| BB-004 | AC-CUSTOMER-2, AC-CUSTOMER-5 | P1 | Search / Filter | Search and filter Customer list |
| BB-005 | AC-CUSTOMER-7, AC-CUSTOMER-8 | P0 | Normal | Create Customer with active Organization |
| BB-006 | AC-CUSTOMER-9, AC-CUSTOMER-12 | P0 | Error | Create Customer with inactive or deleted Organization is rejected |
| BB-007 | AC-CUSTOMER-8, AC-CUSTOMER-15, AC-CUSTOMER-18 | P0 | Boundary / Error | Validate required fields and length boundaries |
| BB-008 | AC-CUSTOMER-15 | P0 | Duplicate / Boundary | Duplicate code and alias reuse rules |
| BB-009 | AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-12, AC-CUSTOMER-16 | P0 | Normal | View detail and edit active Customer |
| BB-010 | AC-CUSTOMER-11, AC-CUSTOMER-16 | P0 | Conflict / Error | Reject editing deleted Customer and stale version updates |
| BB-011 | AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-17 | P0 | State | Soft delete Customer and cascade full child tree |
| BB-012 | AC-CUSTOMER-18 | P1 | i18n / Observability | Localized messages and traceId are displayed correctly |

## Test Cases

### BB-001: ADMIN opens Customer Management

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-1, AC-CUSTOMER-14 |
| Priority | P0 |
| Category | Permission |
| Preconditions | User is logged in as ADMIN. |
| Input | Open Customer route. |
| Steps | Navigate to Customer Management. |
| Expected Result | Customer Management page is displayed and list content loads normally. |
| Note |  |

### BB-002: Non-ADMIN opens Customer Management route

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-14 |
| Priority | P0 |
| Category | Permission |
| Preconditions | User is logged in as VIEWER or EDITOR. |
| Input | Open Customer route directly. |
| Steps | Navigate to Customer Management URL. |
| Expected Result | FE clears session/logout behavior occurs and the user is redirected to `/:lang/login`; direct API access is forbidden. |
| Note |  |

### BB-003: Default Customer list

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-2, AC-CUSTOMER-3, AC-CUSTOMER-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Active Customer, deleted Customer, and Customer under inactive/deleted Organization exist. |
| Input | Open Customer list without extra filters. |
| Steps | Load default list. |
| Expected Result | Only active Customers under active Organizations are shown by default. |
| Note | Deleted records and Customers under inactive/deleted Organizations must not appear. |

### BB-004: Search and filter Customer list

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-2, AC-CUSTOMER-5 |
| Priority | P1 |
| Category | Search / Filter |
| Preconditions | Multiple Customers exist across Organizations and classifications. |
| Input | Organization, keyword, classification, and status filters. |
| Steps | Search by code/name, then change Organization/classification/status filters. |
| Expected Result | List updates to the matching Customers and the filter result stays consistent with the selected criteria. |
| Note |  |

### BB-005: Create Customer with active Organization

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-7, AC-CUSTOMER-8 |
| Priority | P0 |
| Category | Normal |
| Preconditions | At least one active Organization exists and ADMIN session is available. |
| Input | Active Organization, valid customer code, valid customer alias, valid classification. |
| Steps | Open create form, choose active Organization, enter valid values, submit. |
| Expected Result | Customer is created successfully, appears in the list, and the success message is localized. |
| Note |  |

### BB-006: Create Customer with inactive or deleted Organization is rejected

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-9, AC-CUSTOMER-12 |
| Priority | P0 |
| Category | Error |
| Preconditions | Inactive or deleted Organization exists or is referenced by ID. |
| Input | Inactive/deleted Organization, valid customer values. |
| Steps | Open create form, select or submit the inactive/deleted Organization, then save. |
| Expected Result | Save is rejected and the UI shows a localized validation/business error. |
| Note | Dropdown should not present inactive/deleted Organizations. |

### BB-007: Validate required fields and length boundaries

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-8, AC-CUSTOMER-15, AC-CUSTOMER-18 |
| Priority | P0 |
| Category | Boundary / Error |
| Preconditions | ADMIN session is available. |
| Input | Missing Organization, missing customer code, missing alias, minimum/maximum boundary lengths, over-length values. |
| Steps | Open create/edit form and try saving each boundary combination. |
| Expected Result | Required/over-length inputs are rejected with localized message keys; valid boundary values are accepted. |
| Note | This case covers normal boundary acceptance and validation rejection in one flow. |

### BB-008: Duplicate code and alias reuse rules

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-15 |
| Priority | P0 |
| Category | Duplicate / Boundary |
| Preconditions | Existing active Customer with same code or same alias in same Organization; also a soft-deleted record for reuse check. |
| Input | Duplicate active code, duplicate active alias within same Organization, reused code/alias from soft-deleted record. |
| Steps | Create or update Customers using the duplicate and reused values. |
| Expected Result | Duplicate active code/alias is rejected; code/alias reuse from soft-deleted records is allowed when no active duplicate exists. |
| Note |  |

### BB-009: View detail and edit active Customer

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-10, AC-CUSTOMER-11, AC-CUSTOMER-12, AC-CUSTOMER-16 |
| Priority | P0 |
| Category | Normal |
| Preconditions | An active Customer exists and ADMIN session is available. |
| Input | Open detail, edit a field, submit with current version. |
| Steps | Open detail drawer, switch to edit, change a field, submit. |
| Expected Result | Detail renders the Customer data and the edit is saved with a version-aware update. |
| Note |  |

### BB-010: Reject editing deleted Customer and stale version updates

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-11, AC-CUSTOMER-16 |
| Priority | P0 |
| Category | Conflict / Error |
| Preconditions | A deleted Customer exists or a stale version is available. |
| Input | Edit request for deleted Customer or update/delete request with stale version. |
| Steps | Try editing deleted Customer or retry save with old version. |
| Expected Result | Deleted Customer cannot be edited and stale version is rejected with a conflict message. |
| Note |  |

### BB-011: Soft delete Customer and cascade full child tree

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-13, AC-CUSTOMER-16, AC-CUSTOMER-17 |
| Priority | P0 |
| Category | State |
| Preconditions | Active Customer with child Project tree and descendants exists. |
| Input | Delete request with current version. |
| Steps | Open delete confirmation, confirm soft delete, then inspect deleted state. |
| Expected Result | Customer is soft deleted, version changes, and the full child tree is soft deleted as well. |
| Note |  |

### BB-012: Localized messages and traceId are displayed correctly

| item | content |
|---|---|
| Related AC | AC-CUSTOMER-18 |
| Priority | P1 |
| Category | i18n / Observability |
| Preconditions | UI locale is set to `en`, `ja`, or `vi`. |
| Input | Trigger validation, duplicate, forbidden, or conflict error. |
| Steps | Perform an action that returns an error and observe the message. |
| Expected Result | The UI displays the localized message and the error context includes traceId when available. |
| Note |  |

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
- [ ] External IF failure
- [ ] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [x] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
