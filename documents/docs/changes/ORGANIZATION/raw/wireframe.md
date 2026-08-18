# Wireframe - Organization Management

**Ticket ID**: ORGANIZATION
**Create date**: 2026-06-09
**Author**: nk_trung
**Update date**: 2026-06-10

## 1. Wireframe Objective

This wireframe describes the current **Organization Management** screen with a **CRUD-only** scope:

- View the Organization list.
- Search Organizations by code or name.
- Filter Organizations by status.
- Create an Organization.
- View Organization details.
- Edit an Organization.
- Soft delete an Organization.

Do not display Summary Cards, dashboards, KPIs, risk score, health score, or operational statistics.

## 2. Current Screen Layout

The current screen uses a clean admin layout:

- Left sidebar navigation.
- Top application header with language selector.
- Main content area with:
  - title badge and page title
  - Create button on the left
  - Search field and Filter button on the right
  - Organization table below
  - table footer with page size selector and pagination

```text
+----------------------------------------------------------------------------------------------+
| Sidebar | Top bar / language selector                                                       |
+----------------------------------------------------------------------------------------------+
|                                                                                              |
|  [Organization]                                                                              |
|  Organization management                                                                      |
|  Maintain organization master data with search, filtering, create, edit, and soft delete.   |
|                                                                                              |
|  [Create organization]                                                [Search][Filter]      |
|                                                                                              |
|  +--------------------------------------------------------------------------------------------------+
|  | Actions | Code | Name | Status | Updated at                                                     |
|  |-----------------------------------------------------------------------------------------------   |
|  | [eye][edit][delete] | BRYCEN_VIETNAM | Brycen Vietnam | Active | 6/10/26, 10:24 AM           |
|  | [eye][edit][delete] | BRYCEN_VIETNAM753 | BRYCEN_VIETNAM Test123 | Active | 6/10/26, 3:38 PM |
|  +--------------------------------------------------------------------------------------------------+
|  [25/page]  1-2 of 2 items                                                     [pagination]       |
|                                                                                              |
+----------------------------------------------------------------------------------------------+
```

### Display Notes

- By default, the list shows only **Active** Organizations.
- The **Filter** button opens a right-side drawer.
- The filter drawer contains a single **Status** select.
- Status filter options are:
  - All
  - Active
  - DELETED
- Table actions are icon-only buttons.
- Create is placed on the left of the table toolbar.
- Search and Filter are placed on the right of the table toolbar.
- The footer uses the shared server-table style with page size selector, record count text, and pagination controls.

### Data Columns

| Column | Meaning | Notes |
|---|---|---|
| Actions | View / Edit / Delete | Icon buttons only |
| Code | Business identifier of the Organization | Required, editable, unique |
| Name | Display name of the Organization | Required, editable, unique |
| Status | Usage status of the Organization | Active / DELETED |
| Updated at | Last updated time | Format follows system settings |

## 3. Empty State

When no data matches the current search/filter:

```text
+----------------------------------------------------------------------------------------------+
| Organization management                                                                      |
|                                                                                              |
| [Create organization]                                                [Search][Filter]      |
|                                                                                              |
| No Organizations found.                                                                      |
|                                                                                              |
+----------------------------------------------------------------------------------------------+
```

### Notes

- Show the **Create organization** button when the user has create permission.
- If there is no data, the table area is empty and the footer still uses the shared table footer layout.

## 4. Create Organization Drawer

The create form opens as a right-side drawer.

```text
+-----------------------------------------------+
| Create organization                           |
| Provide a unique code, name, and optional description.
|-----------------------------------------------|
| Organization code *                           |
| [ Enter organization code              ]      |
| Organization name *                           |
| [ Enter organization name              ]      |
| Description                                   |
| [ Enter description                    ]      |
|-----------------------------------------------|
| [Cancel]                          [Save]      |
+-----------------------------------------------+
```

### Field Rules

| Field | Required | Input Rules |
|---|---:|---|
| Organization Code | Yes | Must not duplicate any existing code system-wide |
| Organization Name | Yes | Must not duplicate any existing name system-wide |
| Description | No | Free text within the length limit |

### Notes

- A separate display code field is not needed.
- A multilingual name field is not needed.
- A newly created Organization defaults to **ACTIVE**.
- The create drawer does not show a status field.

## 5. Organization Detail Drawer

The detail view opens as a right-side drawer and is read-only.

```text
+-----------------------------------------------+
| Organization detail                           |
|-----------------------------------------------|
| Code            BRYCEN_VIETNAM               |
| Name            Brycen Vietnam               |
| Status          ACTIVE / DELETED             |
| Description     Internal organization record |
| Created at      6/10/26, 10:24 AM            |
| Created by      SYSTEM                       |
| Updated at      6/10/26, 3:38 PM             |
| Updated by      SYSTEM                       |
| [Deleted fields are shown only when present]  |
|-----------------------------------------------|
| [Close]                                       |
+-----------------------------------------------+
```

### Notes

- The detail drawer is read-only.
- Deleted metadata is shown only when the record has been deleted.
- The detail view is opened from the list action icons.

## 6. Edit Organization Drawer

The edit form opens as a right-side drawer.

```text
+-----------------------------------------------+
| Edit organization                             |
|-----------------------------------------------|
| Organization code *                           |
| [ Enter organization code              ]      |
| Organization name *                           |
| [ Enter organization name              ]      |
| Description                                   |
| [ Enter description                    ]      |
|-----------------------------------------------|
| [Cancel]                          [Save]      |
+-----------------------------------------------+
```

### Notes

- Organization code can be edited after creation.
- When editing Organization code/name, the system must check duplicates system-wide according to the implemented duplicate rule.
- The edit drawer does not show a status field.
- Validation errors are displayed directly under the corresponding field.

## 7. Filter Drawer

The filter opens as a compact right-side drawer.

```text
+---------------------------------------+
| Filter                                |
| Search by code or name and switch     |
| between active, DELETED, or all       |
| records.                              |
|---------------------------------------|
| Status                                |
| [ Active v ]                          |
|---------------------------------------|
| [Close]                    [Filter]   |
+---------------------------------------+
```

### Notes

- The filter drawer is intentionally compact.
- The status dropdown does not allow clearing to an empty value.
- The current screen uses the filter drawer instead of inline status controls above the table.

## 8. Soft Delete Confirmation

```text
+------------------------------------------------------------+
| Confirm Organization Deletion                              |
+------------------------------------------------------------+
| Are you sure you want to delete this Organization?         |
|                                                            |
| This is a soft delete operation. The data will not be     |
| physically deleted from the system.                        |
|                                                            |
+------------------------------------------------------------+
| [Cancel]                                      [Delete]     |
+------------------------------------------------------------+
```

### Notes

- Deleting an Organization is a **soft delete**.
- After soft deletion, the Organization changes to **DELETED** status.
- Deleted Organizations are excluded from the default list unless the filter is switched to All or DELETED.

## 9. Validation Messages

| Case | Message |
|---|---|
| Organization code is empty | Please enter the Organization code. |
| Organization name is empty | Please enter the Organization name. |
| Duplicate Organization code on creation | Organization code already exists. |
| Duplicate Organization code on edit | The new Organization code already exists. Please enter another code. |
| Duplicate Organization name | Organization name already exists. |
| System error | An unexpected error occurred. Please try again. |

## 10. Permission Behavior

| Permission | List | Detail | Create | Edit | Soft Delete |
|---|---|---|---|---|---|
| Organization View | Yes | Yes | No | No | No |
| Organization Create | Yes | Yes | Yes | No | No |
| Organization Update | Yes | Yes | No | Yes | No |
| Organization Delete | Yes | Yes | No | No | Yes |
| Organization Admin | Yes | Yes | Yes | Yes | Yes |

## 11. Navigation Flow

```text
Organization List
  -> Create Organization
      -> Save successfully -> Organization List / refresh
      -> Cancel -> Organization List

Organization List
  -> View Organization Detail
      -> Edit Organization
          -> Save successfully -> Organization List / refresh
          -> Cancel -> Organization Detail
      -> Delete Organization
          -> Confirm -> Soft delete successfully -> Organization List
          -> Cancel -> Organization Detail
```

## 12. Scope Notes

- This wireframe only describes Organization CRUD.
- It does not include Customer, Project, Repository, or Team management.
- It does not include a separate permission management screen.
- It does not include dashboards or summary cards.
- It does not include import/export.
