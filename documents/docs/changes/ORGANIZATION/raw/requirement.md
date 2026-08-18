# Requirement Document - Organization Management

**Ticket ID**: ORGANIZATION   
**Create date**: 2026-06-09  
**Author**: nk_trung  
**Update date**: 2026-06-09  

## 1. Screen Overview
- **Screen name:** Organization Management
- **Business purpose of the screen:** Allow administrators to perform CRUD operations for Organization data: create, view list, view detail, update, and soft delete Organizations.
- **Reason for creating the screen:** The SDD platform requirement document defines Organization as a high-level entity in the data model, and the administration function group needs to manage Organizations, Customers, Projects, Repositories, and Teams. Within this function scope, only CRUD for Organization is handled.
- **Goal of the new version:** Provide a simple and clear CRUD screen with required field validation, system-wide duplicate checks for Organization code/name, soft delete support, and operation logging for audit/logging purposes.

## 2. Scope
### In scope
- Display the Organization list.
- Search Organizations by code or name.
- Filter Organizations by usage status: All / Active / Deleted.
- Create a new Organization.
- View Organization details.
- Update Organization information.
- Allow editing the Organization code after creation, but the new code must be checked to ensure it does not already exist.
- Soft delete an Organization.
- Validate required fields and check duplicate Organization code/name system-wide.
- Record operation results for audit/logging purposes.

### Out of scope
- Customer management.
- Project management.
- Repository management.
- Team/Member management.
- Role/Permission management through a separate UI.
- Dashboard, KPI, summary cards, risk score, health score, or Organization operational statistics.
- Evidence collection, Connector configuration, and SDD artifact analysis.
- Bulk import/export.
- Multilingual support for Organization names.
- Management of a separate display code different from the Organization code.

> Note: This is a new administration screen. The scope is limited to Organization CRUD only.

## 3. Current State Summary
Summary based on the requirement document and current workflow:

- **Current sections**
  - There is no dedicated screen for Organization Management.
  - Organization has already been defined as an entity in the platform data model.
  - The administration function group has stated the need to manage organization, customer, project, repository, and team.

- **Current displayed information**
  - Not applicable because this is a new screen.

- **Current user flow / interactions**
  - Not applicable because this is a new screen.

- **Current strengths**
  - The target data model already defines Organization as the root entity.
  - The administration scope has been described in the overall requirement document.

- **Current issues / limitations**
  - There is no place to maintain Organization master data.
  - CRUD rules for Organization have not been separated from Customer/Project/Repository.
  - Without a clearly limited scope, the screen may be misunderstood as an administration dashboard or aggregated governance screen.

## 4. Target State Summary
According to the target design direction:

- **Target structure**
  - Organization list screen.
  - Create Organization form.
  - Organization detail screen or drawer.
  - Edit Organization form.
  - Soft delete confirmation dialog.

- **Target content organization**
  - The list screen displays only the information needed to identify and operate on Organizations.
  - Create/edit forms contain only the basic data fields of an Organization.
  - The detail screen displays Organization data in read-only mode together with basic system metadata.

- **Target visual hierarchy**
  - Primary action: Create Organization.
  - Secondary actions: Search, status filter, view, edit, soft delete.
  - Do not display Summary Cards or dashboard-style widgets.

- **Target interaction expectations**
  - Administrators can quickly find Organizations by keyword or status.
  - Administrators can create and update Organizations with clear validation.
  - Administrators can edit the Organization code after creation, but the system must check that the new code does not already exist.
  - Administrators must confirm before soft deleting an Organization.

- **Expected user experience improvements**
  - Clear CRUD flow with minimal noise.
  - No display of metrics outside the CRUD scope.
  - Reduced confusion between Organization Management and other administration modules.

## 5. Change Requirements
| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| Organization List | Not available | Organization list table | Display the list with search, status filter, pagination, and row-level actions | New | CRUD-only |
| Create Organization | Not available | Create form | Allow administrators to create an Organization with required fields and validation | New | Do not configure Customer/Project in this screen |
| Organization Detail | Not available | Read-only screen/drawer | Display selected Organization information and system metadata | New | Show Edit and Delete buttons when the user has permission |
| Edit Organization | Not available | Edit form | Allow administrators to update Organization code, name, and description | New | Code can be edited but must be system-wide unique |
| Delete Organization | Not available | Soft delete confirmation dialog | Allow soft delete after confirmation | New | No physical delete |
| Summary Cards | Previously proposed | Removed | Do not display statistics cards, risk cards, or KPI cards | Change | User confirmed the function is CRUD only |

## 6. Functional Requirements
### 6.1 Organization List
- **Purpose:** Allow administrators to view and search Organizations.
- **Displayed information:** Organization code, Organization name, status, short description, created date, updated date, actions.
- **Display rules:**
  - Display data in table format.
  - By default, display only active Organizations.
  - Allow filtering to view soft-deleted Organizations.
  - Sort by latest updated time by default.
  - Display pagination when the number of records exceeds the page size.
  - Do not display Summary Cards, KPIs, or metrics.
- **User interactions:**
  - Search by Organization code or name.
  - Filter by status: All / Active / Deleted.
  - Click Create Organization.
  - Click View, Edit, Delete on each row.
- **Conditions / state behavior:**
  - Only users with Organization management permission can access the screen.
  - If the user only has view permission, Create/Edit/Delete buttons are hidden or disabled.
  - Soft-deleted Organizations cannot be edited unless a restore requirement is added in the future.
- **Empty state:** Display “No Organizations found.” and show the Create button if the user has permission.
- **Error state:** Display a general error message and `traceId` if the list cannot be loaded.

### 6.2 Create Organization
- **Purpose:** Allow administrators to register a new Organization.
- **Displayed information:** Create form with Organization code, Organization name, and description fields.
- **Display rules:**
  - Required fields must be visually indicated.
  - The Save button is disabled while submitting.
  - Validation errors are displayed near the relevant fields.
- **User interactions:**
  - Enter Organization code.
  - Enter Organization name.
  - Enter description.
  - Click Save or Cancel.
- **Conditions / state behavior:**
  - Organization code is required and must be system-wide unique.
  - Organization name is required and must be system-wide unique.
  - A newly created Organization has the default status Active.
  - After successful creation, the system navigates to the detail screen or list screen and displays a success message.
- **Empty state:** Not applicable.
- **Error state:** Display validation errors, duplicate data errors, authorization errors, or system errors with `traceId`.

### 6.3 Organization Detail
- **Purpose:** Allow administrators to check Organization information before editing or soft deleting.
- **Displayed information:** Organization code, Organization name, status, description, created by, created date, last updated by, last updated date, deleted by, and deleted date if soft deleted.
- **Display rules:**
  - Display in read-only mode by default.
  - Show the Edit button if the user has update permission and the Organization is not soft deleted.
  - Show the Delete button if the user has delete permission and the Organization is not soft deleted.
- **User interactions:**
  - Click Edit.
  - Click Delete.
  - Return to list.
- **Conditions / state behavior:**
  - If the Organization no longer exists or the user has no view permission, display an appropriate message.
  - If the user loses permission during the operation, display an authorization error.
- **Empty state:** Not applicable.
- **Error state:** Display an error message and `traceId`.

### 6.4 Edit Organization
- **Purpose:** Allow administrators to update an existing Organization.
- **Displayed information:** Edit form prefilled with current data.
- **Display rules:**
  - Internal Organization ID cannot be edited.
  - Organization code can be edited.
  - No separate display code field is needed.
  - No multilingual name field is needed.
  - Required fields must be visually indicated.
- **User interactions:**
  - Update Organization code.
  - Update Organization name.
  - Update description.
  - Click Save or Cancel.
- **Conditions / state behavior:**
  - Validate required fields.
  - If the Organization code is changed, the system must verify that the new code does not already exist system-wide.
  - If the Organization name is changed, the system must verify that the new name does not already exist system-wide.
  - Do not allow editing a soft-deleted Organization.
  - If optimistic locking is used, block the update when the data has been changed by another user.
- **Empty state:** Not applicable.
- **Error state:** Display validation errors, conflict errors, authorization errors, or system errors with `traceId`.

### 6.5 Soft Delete Organization
- **Purpose:** Allow administrators to soft delete an Organization that is no longer used.
- **Displayed information:** Confirmation dialog containing Organization code, Organization name, and the impact of the action.
- **Display rules:**
  - Confirmation is required before execution.
  - Do not physically delete the record from the database.
  - After soft deletion, the Organization is marked as Deleted and is not displayed in the default list.
- **User interactions:**
  - Click Delete.
  - Confirm or cancel.
- **Conditions / state behavior:**
  - Only active Organizations can be soft deleted.
  - After successful soft delete, refresh the list and display a success message.
  - Do not allow creating or updating Customer/Project/Repository under a soft-deleted Organization.
- **Empty state:** Not applicable.
- **Error state:** Display authorization errors, conflict errors, or system errors with `traceId`.

#### State Matrix - Organization
| State | Displayed tag | Display condition |
|---|---|---|
| Active | Active | Organization has not been soft deleted |
| Deleted | Deleted | Organization has been soft deleted and has `deleted_at` or an equivalent soft delete flag |

## 7. Business Rules
- Organization is high-level master data within the administration scope.
- Organization code is required and must be system-wide unique.
- Organization name is required and must be system-wide unique.
- The Organization code can be edited after creation, but the new code must be checked to ensure it does not already exist.
- No separate display code field is needed.
- Multilingual support for Organization names is not needed.
- Deleting an Organization is a soft delete; the record is not physically deleted from the database.
- Soft-deleted Organizations are not displayed in the default list.
- Soft-deleted Organizations cannot be used to create new child data.
- Create, update, and soft delete operations must check user permissions.
- Create, update, and soft delete operations must be logged for audit purposes.

## 8. Data / API / Integration Notes
- **Primary APIs:**
  - `GET /api/v1/organizations`
  - `GET /api/v1/organizations/{organizationId}`
  - `POST /api/v1/organizations`
  - `PUT /api/v1/organizations/{organizationId}`
  - `DELETE /api/v1/organizations/{organizationId}` or `PATCH /api/v1/organizations/{organizationId}/delete` for soft delete
- **Data sources:** Platform Metadata DB / Master data store.
- **Authorization boundary:** Only users with Organization Admin or equivalent permissions can create, update, and soft delete. Users with view-only permission can only read the list and details.
- **Backward compatibility constraints:** If the Organization code is edited, related tables should reference the internal `organization_id` instead of the Organization code to avoid broken links.
- **Logging / observability expectations:** Log create/update/soft delete operations with actor, action, target, timestamp, result, and traceId. Error APIs must return traceId.

## 9. Open Questions
The open questions have been finalized for this phase:

| Question | Decision |
|---|---|
| Is editing the Organization code after creation allowed? | Yes. It is allowed, but the system must check whether the new code already exists. |
| Is deleting an Organization a physical delete, soft delete, or only deactivation? | Deleting an Organization is a soft delete. |
| Is the Organization name unique system-wide or unique per tenant/environment? | System-wide unique. |
| Is a separate display code different from the internal system code required? | Not required. |
| Is multilingual support for Organization names required? | Not required. |

Business clarification is complete for the Organization CRUD scope in this phase.

## 10. Acceptance Criteria
1. **AC-ORGANIZATION-01:** A user with view permission can access the Organization list screen and view active Organizations.
2. **AC-ORGANIZATION-02:** A user can search Organizations by code or name.
3. **AC-ORGANIZATION-03:** A user can filter Organizations by status: All / Active / Deleted.
4. **AC-ORGANIZATION-04:** A user with create permission can create a new Organization with required code and name.
5. **AC-ORGANIZATION-05:** On creation, the system does not allow entering an Organization code that already exists system-wide.
6. **AC-ORGANIZATION-06:** On creation, the system does not allow entering an Organization name that already exists system-wide.
7. **AC-ORGANIZATION-07:** A user with update permission can edit the Organization code after creation; if the new code already exists, the system must show an error and not save.
8. **AC-ORGANIZATION-08:** A user with update permission can edit the Organization name; if the new name already exists system-wide, the system must show an error and not save.
9. **AC-ORGANIZATION-09:** A user with delete permission can soft delete an Organization after confirmation; the data is not physically deleted.
10. **AC-ORGANIZATION-10:** A soft-deleted Organization is not displayed in the default list and cannot be used to create new child data.
11. **AC-ORGANIZATION-11:** Users without the corresponding permissions cannot see or cannot operate the Create, Edit, and Delete buttons.
12. **AC-ORGANIZATION-12:** Create, update, and soft delete operations are logged with actor, action, target, timestamp, result, and traceId.

### 10.1 Traceability to `spec-pack.md`
- Each `AC-ORG-xx` must be reflected correspondingly in the `spec-pack.md` of the implementation ticket for Organization Management.
- ACs in this document are business/UAT-level.
- `spec-pack.md` may further expand API, data contract, validation, test-layer, and error-handling details.

## 11. Summary of Required Changes
### Top required improvements
- Create a simple Organization CRUD screen without Summary Cards or dashboard widgets.
- Apply required validation and system-wide uniqueness for Organization code/name.
- Allow editing the Organization code after creation with duplicate checks.
- Apply soft delete instead of physical delete.
- Record audit/log entries for administration operations.

### Items that should remain unchanged
- Organization is a high-level entity in the data model.
- The function belongs only to the administration group.
- Customer/Project/Repository/Team are not handled in this screen.

### Items that have been confirmed
- Organization code can be edited after creation.
- Organization name is system-wide unique.
- Deleting an Organization is a soft delete.
- A separate display code is not needed.
- Multilingual support for Organization names is not needed.
