# Requirement Document - Customer Management

**Ticket ID**: CUSTOMER         
**Create date**: 2026-06-09  
**Author**: nk_trung       
**Update date**: 2026-06-09  

---

## 1. Screen Overview

- **Screen name:** Customer Management
- **Business purpose:** Allows administrators to manage Customers under Organizations, including viewing the list, creating new Customers, viewing details, editing, and soft-deleting Customers.
- **Reason for creating the screen:** The platform requirement documents define Customer as an entity under Organization, and the administration feature group needs to manage Organization, Customer, Project, Repository, and Team.
- **Goal of this version:** Provide a simple and clear Customer CRUD screen, excluding dashboards, KPIs, and statistics.

---

## 2. Scope

### 2.1 In Scope

- Display the Customer list.
- Search Customers by name/alias.
- Filter Customers by Organization, classification, and status.
- Create a new Customer.
- View Customer details.
- Edit a Customer.
- Soft-delete a Customer.
- When creating/editing a Customer, only allow selecting Organizations that are active/not soft-deleted.
- In the Customer list, do not display Customers that belong to disabled or soft-deleted Organizations.

### 2.2 Out of Scope

- Organization Management.
- Project Management.
- Repository Management.
- Team/Member Management.
- Dashboards, KPIs, scores, and operational statistics.
- Bulk import/export.
- Role/permission management through a separate screen.
- Handling deeper child-data flows from Customer to Project/Repository.

> Note: This feature only handles Customer CRUD. Detailed rules will be standardized in `spec-pack.md`.

---

## 3. Current State Summary

- There is currently no dedicated Customer Management screen.
- Customer has been defined in the platform data model as an entity under Organization.
- The database currently has a Customer concept associated with Organization.
- There is no standard UI flow for administrators to create, edit, or soft-delete Customers.

---

## 4. Target State Summary

- A Customer list screen is available.
- A Customer creation form is available.
- A Customer detail screen or drawer is available.
- A Customer edit form is available.
- A soft-delete confirmation dialog is available.
- Customer must always be associated with a valid Organization.
- Disabled/soft-deleted Organizations cannot be used to create/edit Customers.
- Customers belonging to disabled/soft-deleted Organizations are not displayed in the default Customer list.

---

## 5. Change Requirements

| Section | Current State | Target State | Requirement | Keep / Change / New | Notes |
|---|---|---|---|---|---|
| Customer List | Not available | Customer list | Display Customers with search, filters for Organization/classification/status, pagination, and actions | New | CRUD-only |
| Create Customer | Not available | Creation form | Allow creating a Customer under an active Organization | New | Organization dropdown does not display inactive/deleted Organizations |
| Customer Detail | Not available | Detail screen/drawer | Display Customer information in read-only mode | New | Do not display Project/Repository details |
| Edit Customer | Not available | Edit form | Allow editing Customer information | New | Do not allow selecting inactive/deleted Organizations |
| Delete Customer | Not available | Soft delete | Allow soft-deleting a Customer after confirmation | New | No physical delete |
| Customer under inactive/deleted Organization | Unclear | Not displayed in list | The Customer list only displays Customers under active/not soft-deleted Organizations | New | Parent-child rule |

---

## 6. Functional Requirements

### 6.1 Customer List

- Display the Customer list.
- Allow searching by Customer alias/name.
- Allow filtering by Organization.
- Allow filtering by classification.
- Allow filtering by Customer status.
- By default, only display active Customers under active/not soft-deleted Organizations.
- Do not display Customers belonging to disabled or soft-deleted Organizations.
- Provide View / Edit / Delete actions for each row.

### 6.2 Create Customer

- Allow administrators to create a new Customer.
- Customer must belong to an Organization.
- The Organization selection list only displays active/not soft-deleted Organizations.
- After successful creation, return to the Customer list.

### 6.3 Customer Detail

- Display Customer information in read-only mode.
- Allow returning to the list.
- Allow navigating to Edit or Delete if the Customer has not been soft-deleted and the user has permission.

### 6.4 Edit Customer

- Allow editing Customer information.
- The Organization selection list only displays active/not soft-deleted Organizations.
- Do not allow editing a soft-deleted Customer.

### 6.5 Delete Customer

- Allow soft-deleting a Customer after user confirmation.
- Soft-deleted Customers are not displayed in the default list.
- No physical delete.

---

## 7. Data Items

| Field | Meaning | Notes |
|---|---|---|
| Customer ID | Internal ID of the Customer | Not directly editable |
| Organization | Parent Organization | Only active/not soft-deleted Organizations can be selected |
| Customer Alias / Name | Customer name/alias | Displayed in list/detail/form |
| Classification | Customer classification | Specific values will be finalized in `spec-pack.md` |
| Status | Customer status | Active / Deleted or based on the system's standard status |
| Created Date | Creation date | Displayed in detail if needed |
| Updated Date | Last updated date | Displayed in list/detail if needed |

---

## 8. Acceptance Criteria

- **AC-CUSTOMER-1:** Administrator can access the Customer Management screen from the administration area.
- **AC-CUSTOMER-2:** Administrator can view the Customer list.
- **AC-CUSTOMER-3:** The Customer list only displays Customers under active/not soft-deleted Organizations.
- **AC-CUSTOMER-4:** Soft-deleted Customers are not displayed in the default list.
- **AC-CUSTOMER-5:** Administrator can search/filter Customers by Organization, name/alias, classification, and status.
- **AC-CUSTOMER-6:** Administrator can open the screen to create a new Customer.
- **AC-CUSTOMER-7:** When creating a Customer, the Organization dropdown only displays active/not soft-deleted Organizations.
- **AC-CUSTOMER-8:** Administrator can create a new Customer with valid required information.
- **AC-CUSTOMER-9:** The system does not allow Customer creation if the selected Organization has been disabled or soft-deleted.
- **AC-CUSTOMER-10:** Administrator can view Customer details.
- **AC-CUSTOMER-11:** Administrator can edit information of a Customer that has not been soft-deleted.
- **AC-CUSTOMER-12:** When editing a Customer, the Organization dropdown does not display disabled or soft-deleted Organizations.
- **AC-CUSTOMER-13:** Administrator can soft-delete a Customer after confirmation.
- **AC-CUSTOMER-14:** Users without Administrator permission cannot access the Customer feature.

---

## 9. Open Points for Spec Pack

The following points are not described in detail in the raw requirement and need to be organized in `spec-pack.md`:

- Official Customer classification list.
- Duplicate Customer alias/name rule: per Organization or system-wide.
- Detailed permissions for Customer Management.
- API contract.
- DB migration/additional columns if needed.
- Validation message keys and i18n.
- Optimistic locking if needed.
- Rule for soft deleting a Customer and cascading to its child tree.
