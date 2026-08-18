# Black-box Test Cases

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Define a clean black-box Project Management test suite derived from the approved specification and acceptance criteria. These cases intentionally verify externally observable behavior only and do not rely on internal service, repository, mapper, schema, or selector implementation details.

## 2. Case-writing Rules

- Use `spec-pack.md` as the source of truth for business behavior and contract expectations.
- Verify observable outcomes only: UI-visible behavior, API-visible responses, and externally verifiable business state.
- Do not assert internal classes, methods, SQL, table names, or framework-specific implementation details in the test case body.
- Reference test data sets from `test-data.md` so that case intent and reusable fixtures stay aligned.
- Keep ticket-specific contract deviations explicit:
  - no `version` field in Project mutation requests
  - delete route is `PUT /api/v1/projects/{id}/delete`
  - Team assignment result must match the submitted Team set

## 3. AC Coverage Matrix

| AC ID | Covered by case IDs | Viewpoints included | Gaps |
|---|---|---|---|
| AC-PROJECT-1 | BB-PROJECT-001, BB-PROJECT-002, BB-PROJECT-003 | Normal, Operation | None |
| AC-PROJECT-2 | BB-PROJECT-004 | Normal, Empty state | None |
| AC-PROJECT-3 | BB-PROJECT-005, BB-PROJECT-006 | Normal, State transition | None |
| AC-PROJECT-4 | BB-PROJECT-007, BB-PROJECT-008 | Error, Boundary | None |
| AC-PROJECT-5 | BB-PROJECT-009, BB-PROJECT-010, BB-PROJECT-011 | Error, Boundary, Duplicate scope | None |
| AC-PROJECT-6 | BB-PROJECT-012 | Normal | None |
| AC-PROJECT-7 | BB-PROJECT-013, BB-PROJECT-014, BB-PROJECT-015 | Normal, Boundary, State transition | None |
| AC-PROJECT-8 | BB-PROJECT-016 | Error, Not found | None |
| AC-PROJECT-9 | BB-PROJECT-017, BB-PROJECT-018 | Operation, Audit-visible | None |
| AC-PROJECT-10 | BB-PROJECT-019 | Permission | None |
| AC-PROJECT-11 | BB-PROJECT-006, BB-PROJECT-015 | Normal, State transition | None |
| AC-PROJECT-12 | BB-PROJECT-020 | Error, Audit/log | None |

## 4. Test Case Summary

| Case ID | AC ID | Priority | Viewpoint / Category | Title |
|---|---|---|---|---|
| BB-PROJECT-001 | AC-PROJECT-1 | P0 | Normal | Authorized caller opens Project list and sees active records |
| BB-PROJECT-002 | AC-PROJECT-1 | P1 | Operation | Default list excludes soft-deleted Projects |
| BB-PROJECT-003 | AC-PROJECT-1 | P1 | Normal | List row shows required summary fields for each Project |
| BB-PROJECT-004 | AC-PROJECT-2 | P1 | Normal / Empty state | Empty Project result shows safe empty state |
| BB-PROJECT-005 | AC-PROJECT-3 | P0 | Normal | Create succeeds with required fields only |
| BB-PROJECT-006 | AC-PROJECT-3, AC-PROJECT-11 | P0 | Normal / State transition | Create succeeds with multiple Team assignments |
| BB-PROJECT-007 | AC-PROJECT-4 | P0 | Error | Create rejects blank or whitespace-only alias |
| BB-PROJECT-008 | AC-PROJECT-4 | P1 | Boundary | Update rejects alias that becomes blank after trimming |
| BB-PROJECT-009 | AC-PROJECT-5 | P0 | Error / Duplicate | Create or update rejects same normalized alias in the same Customer |
| BB-PROJECT-010 | AC-PROJECT-5 | P1 | Boundary / Scope | Same alias is allowed under a different Customer |
| BB-PROJECT-011 | AC-PROJECT-5 | P1 | Boundary / Deleted data | Alias can be reused when only a deleted Project owns it |
| BB-PROJECT-012 | AC-PROJECT-6 | P1 | Normal | Detail view returns Project fields and current Team assignments |
| BB-PROJECT-013 | AC-PROJECT-7 | P0 | Normal | Update succeeds without a `version` field |
| BB-PROJECT-014 | AC-PROJECT-7 | P1 | Boundary | Update trims `projectType` and blank input becomes null |
| BB-PROJECT-015 | AC-PROJECT-7, AC-PROJECT-11 | P1 | State transition | Update Team assignments reconciles to the submitted set |
| BB-PROJECT-016 | AC-PROJECT-8 | P0 | Error / Not found | Detail, update, and delete reject nonexistent or deleted Project IDs |
| BB-PROJECT-017 | AC-PROJECT-9 | P0 | Operation / State transition | Soft delete succeeds through `PUT /api/v1/projects/{id}/delete` |
| BB-PROJECT-018 | AC-PROJECT-9 | P1 | Operation / Audit-visible | Deleted Project disappears from active view after delete |
| BB-PROJECT-019 | AC-PROJECT-10 | P0 | Permission | Unauthorized caller is rejected for Project actions |
| BB-PROJECT-020 | AC-PROJECT-12 | P1 | Error / Audit-log | Backend error uses the standard error envelope with traceId |

## 5. Detailed Test Cases

### BB-PROJECT-001: Authorized caller opens Project list and sees active records

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-1 |
| Priority | P0 |
| Viewpoint / Category | Normal |
| Preconditions | Authorized caller exists. Data set `TD-PRJ-LIST-01` is available with at least two active Projects. |
| Test Data Reference | `TD-PRJ-LIST-01`, `TD-USER-AUTH-01` |
| Input | Open the Project list through the normal Project entry point. |
| Steps | 1. Authenticate as an authorized caller. 2. Open Project Management. 3. Observe the default list response or screen. |
| Expected Result | The list loads successfully and shows active Projects available to the caller. No unexpected error or broken state is shown. |

### BB-PROJECT-002: Default list excludes soft-deleted Projects

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-1 |
| Priority | P1 |
| Viewpoint / Category | Operation |
| Preconditions | Authorized caller exists. Data set `TD-PRJ-LIST-02` contains both active and deleted Projects. |
| Test Data Reference | `TD-PRJ-LIST-02`, `TD-USER-AUTH-01` |
| Input | Open the Project list in the default active view. |
| Steps | 1. Authenticate as an authorized caller. 2. Open Project Management. 3. Compare visible records with the prepared active/deleted set. |
| Expected Result | Active Projects are shown in the default view. Soft-deleted Projects are not shown in the default view. |

### BB-PROJECT-003: List row shows required summary fields for each Project

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-1 |
| Priority | P1 |
| Viewpoint / Category | Normal |
| Preconditions | Authorized caller exists. Data set `TD-PRJ-LIST-01` contains Projects with distinct Customer, alias, status, created timestamp, and updated timestamp values. |
| Test Data Reference | `TD-PRJ-LIST-01`, `TD-USER-AUTH-01` |
| Input | Open the Project list. |
| Steps | 1. Authenticate as an authorized caller. 2. Open Project Management. 3. Inspect one or more returned rows. |
| Expected Result | Each returned Project item includes customer name, project alias, status, created timestamp, and updated timestamp in the externally visible list result. |

### BB-PROJECT-004: Empty Project result shows safe empty state

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-2 |
| Priority | P1 |
| Viewpoint / Category | Normal / Empty state |
| Preconditions | Authorized caller exists. Data set `TD-PRJ-LIST-03` produces no matching active Project records for the current view. |
| Test Data Reference | `TD-PRJ-LIST-03`, `TD-USER-AUTH-01` |
| Input | Open the Project list in a state with no matching active Projects. |
| Steps | 1. Authenticate as an authorized caller. 2. Open Project Management. 3. Observe the result when no active records match. |
| Expected Result | The screen or response completes safely and shows the defined empty state instead of a broken table, raw exception, or misleading success data. |

### BB-PROJECT-005: Create succeeds with required fields only

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-3 |
| Priority | P0 |
| Viewpoint / Category | Normal |
| Preconditions | Authorized caller exists. An active Customer exists. The chosen alias is unique within that Customer. |
| Test Data Reference | `TD-PRJ-CREATE-01`, `TD-CUSTOMER-01`, `TD-USER-AUTH-01` |
| Input | Valid Project create request with `customerId` and `projectAlias`; optional fields omitted. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit a create request with only required valid inputs. 3. Re-open list or detail for the new Project. |
| Expected Result | One active Project is created successfully. The new Project appears in normal reads and reflects the submitted required values. |

### BB-PROJECT-006: Create succeeds with multiple Team assignments

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-3, AC-PROJECT-11 |
| Priority | P0 |
| Viewpoint / Category | Normal / State transition |
| Preconditions | Authorized caller exists. One active Customer and multiple valid active Teams exist. |
| Test Data Reference | `TD-PRJ-CREATE-02`, `TD-CUSTOMER-01`, `TD-TEAM-01`, `TD-USER-AUTH-01` |
| Input | Valid create request with required fields plus multiple `teamIds`. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit the create request with multiple Team selections. 3. Open the created Project detail. |
| Expected Result | The Project is created successfully. The Project detail shows the Team assignment result matching the submitted Team set. |

### BB-PROJECT-007: Create rejects blank or whitespace-only alias

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-4 |
| Priority | P0 |
| Viewpoint / Category | Error |
| Preconditions | Authorized caller exists. |
| Test Data Reference | `TD-PRJ-ALIAS-01`, `TD-CUSTOMER-01`, `TD-USER-AUTH-01` |
| Input | Create request with `projectAlias = ""` or whitespace-only. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit a create request with a blank alias. |
| Expected Result | The request is rejected. No Project is created. An externally visible validation or domain error is returned. |

### BB-PROJECT-008: Update rejects alias that becomes blank after trimming

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-4 |
| Priority | P1 |
| Viewpoint / Category | Boundary |
| Preconditions | Authorized caller exists. An active Project already exists and is editable. |
| Test Data Reference | `TD-PRJ-ALIAS-01`, `TD-PRJ-ACTIVE-01`, `TD-USER-AUTH-01` |
| Input | Update request with `projectAlias = "   "`. |
| Steps | 1. Authenticate as an authorized caller. 2. Open or target an existing active Project. 3. Submit an update with a whitespace-only alias. 4. Re-read the Project. |
| Expected Result | The update is rejected. The existing Project remains unchanged. |

### BB-PROJECT-009: Create or update rejects same normalized alias in the same Customer

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-5 |
| Priority | P0 |
| Viewpoint / Category | Error / Duplicate |
| Preconditions | Authorized caller exists. An active Project already exists in the target Customer with the same normalized alias. |
| Test Data Reference | `TD-PRJ-DUP-01`, `TD-CUSTOMER-01`, `TD-USER-AUTH-01` |
| Input | Create or update request using a same-alias, case-only variant, or trim-only variant within the same Customer. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit the create or update request with the duplicate alias. 3. Re-check the Project list or target record. |
| Expected Result | The request is rejected as a duplicate. No conflicting active Project write is committed. |

### BB-PROJECT-010: Same alias is allowed under a different Customer

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-5 |
| Priority | P1 |
| Viewpoint / Category | Boundary / Scope |
| Preconditions | Authorized caller exists. One active Project already exists under Customer A. A different active Customer B exists. |
| Test Data Reference | `TD-PRJ-DUP-02`, `TD-CUSTOMER-01`, `TD-CUSTOMER-02`, `TD-USER-AUTH-01` |
| Input | Create request that reuses the alias from Customer A under Customer B. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit the create request under a different Customer. 3. Re-open list or detail for the new Project. |
| Expected Result | The request succeeds because duplicate scope is limited to the same Customer. |

### BB-PROJECT-011: Alias can be reused when only a deleted Project owns it

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-5 |
| Priority | P1 |
| Viewpoint / Category | Boundary / Deleted data |
| Preconditions | Authorized caller exists. A deleted Project already owns the target alias and no active Project in that Customer owns it. |
| Test Data Reference | `TD-PRJ-DUP-03`, `TD-CUSTOMER-01`, `TD-USER-AUTH-01` |
| Input | Create request using the alias previously used only by a deleted Project. |
| Steps | 1. Authenticate as an authorized caller. 2. Confirm the prior Project is deleted. 3. Submit the create request. |
| Expected Result | The request succeeds and creates a new active Project. |

### BB-PROJECT-012: Detail view returns Project fields and current Team assignments

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-6 |
| Priority | P1 |
| Viewpoint / Category | Normal |
| Preconditions | Authorized caller exists. An active Project exists with Customer and Team assignments. |
| Test Data Reference | `TD-PRJ-DETAIL-01`, `TD-TEAM-01`, `TD-USER-AUTH-01` |
| Input | Open Project detail for an existing active Project. |
| Steps | 1. Authenticate as an authorized caller. 2. Open the detail view for the prepared Project. |
| Expected Result | The detail result includes the Project information needed by the approved detail screen, including current Team assignments. |

### BB-PROJECT-013: Update succeeds without a `version` field

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-7 |
| Priority | P0 |
| Viewpoint / Category | Normal |
| Preconditions | Authorized caller exists. An active Project exists and is editable. |
| Test Data Reference | `TD-PRJ-UPDATE-01`, `TD-PRJ-ACTIVE-01`, `TD-USER-AUTH-01` |
| Input | Valid update request that changes editable fields and does not include `version`. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit a valid update request for an existing active Project. 3. Re-open list or detail. |
| Expected Result | The update succeeds without requiring a `version` field. Subsequent reads show the latest saved values. |

### BB-PROJECT-014: Update trims `projectType` and blank input becomes null

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-7 |
| Priority | P1 |
| Viewpoint / Category | Boundary |
| Preconditions | Authorized caller exists. An active Project exists and is editable. |
| Test Data Reference | `TD-PRJ-TYPE-01`, `TD-PRJ-ACTIVE-01`, `TD-USER-AUTH-01` |
| Input | Update requests with `projectType = "  Customer Facing  "` and `projectType = "   "`. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit an update with a trimmed non-empty `projectType`. 3. Submit another update with blank `projectType`. 4. Re-read the Project after each update. |
| Expected Result | Non-empty text is saved as trimmed free text. Blank `projectType` is treated as null rather than stored as whitespace text. |

### BB-PROJECT-015: Update Team assignments reconciles to the submitted set

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-7, AC-PROJECT-11 |
| Priority | P1 |
| Viewpoint / Category | State transition |
| Preconditions | Authorized caller exists. An active Project already has Team assignments. Additional valid Teams exist. |
| Test Data Reference | `TD-PRJ-TEAM-01`, `TD-TEAM-01`, `TD-USER-AUTH-01` |
| Input | Valid update request that changes the Team selection from one set to another, including removal and addition. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit an update with a changed Team set. 3. Open the detail view afterward. |
| Expected Result | The Project update succeeds and the resulting Team assignment set exactly matches the submitted Team set. |

### BB-PROJECT-016: Detail, update, and delete reject nonexistent or deleted Project IDs

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-8 |
| Priority | P0 |
| Viewpoint / Category | Error / Not found |
| Preconditions | Authorized caller exists. One nonexistent Project ID and one deleted Project ID are available for testing. |
| Test Data Reference | `TD-PRJ-ID-01`, `TD-PRJ-ID-02`, `TD-USER-AUTH-01` |
| Input | Detail, update, and delete requests for nonexistent or deleted Project IDs. |
| Steps | 1. Authenticate as an authorized caller. 2. Request detail for each unavailable ID. 3. Attempt update for each unavailable ID. 4. Attempt delete for each unavailable ID. |
| Expected Result | Each normal-flow request is rejected as unavailable or not found. No new mutation is committed. |

### BB-PROJECT-017: Soft delete succeeds through `PUT /api/v1/projects/{id}/delete`

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-9 |
| Priority | P0 |
| Viewpoint / Category | Operation / State transition |
| Preconditions | Authorized caller exists. An active Project exists and can be deleted. |
| Test Data Reference | `TD-PRJ-DELETE-01`, `TD-USER-AUTH-01` |
| Input | Delete request to `PUT /api/v1/projects/{id}/delete`. |
| Steps | 1. Authenticate as an authorized caller. 2. Submit the Project delete request through the approved route. 3. Re-open the default active list and the deleted Project detail flow as applicable. |
| Expected Result | The Project is soft deleted successfully through the approved route. The Project is no longer available in the normal active flow afterward. |

### BB-PROJECT-018: Deleted Project disappears from active view after delete

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-9 |
| Priority | P1 |
| Viewpoint / Category | Operation / Audit-visible |
| Preconditions | Authorized caller exists. An active Project exists and can be deleted. |
| Test Data Reference | `TD-PRJ-DELETE-01`, `TD-USER-AUTH-01` |
| Input | Delete an active Project, then refresh the active Project list. |
| Steps | 1. Authenticate as an authorized caller. 2. Delete the Project. 3. Refresh or reopen the default active Project list. |
| Expected Result | The deleted Project no longer appears in the default active list, demonstrating the expected post-delete operational visibility. |

### BB-PROJECT-019: Unauthorized caller is rejected for Project actions

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-10 |
| Priority | P0 |
| Viewpoint / Category | Permission |
| Preconditions | A caller without required Project authorization exists. Relevant target data exists for list, detail, create, update, and delete attempts. |
| Test Data Reference | `TD-USER-AUTH-02`, `TD-PRJ-ACTIVE-01`, `TD-CUSTOMER-01` |
| Input | Invoke Project list, detail, create, update, and delete actions as an unauthorized caller. |
| Steps | 1. Authenticate as a caller without Project permission. 2. Attempt Project list access. 3. Attempt detail access. 4. Attempt create, update, and delete actions. |
| Expected Result | Each disallowed action is rejected with the standard authorization response. No unauthorized mutation succeeds. |

### BB-PROJECT-020: Backend error uses the standard error envelope with traceId

| Item | Content |
|---|---|
| Related AC | AC-PROJECT-12 |
| Priority | P1 |
| Viewpoint / Category | Error / Audit-log |
| Preconditions | A controlled Project API failure can be triggered without relying on production data. |
| Test Data Reference | `TD-ERR-01`, `TD-USER-AUTH-01` |
| Input | Trigger a Project API failure through a controlled invalid or fault-injection scenario allowed by the environment. |
| Steps | 1. Authenticate as an authorized caller. 2. Trigger the prepared failing Project API call. 3. Inspect the returned error payload. |
| Expected Result | The error response uses the standard backend error envelope and includes a `traceId` for operational tracing. |
