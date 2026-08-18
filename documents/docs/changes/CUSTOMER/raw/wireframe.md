# Wireframe - Customer Management

**Ticket ID**: CUSTOMER         
**Create date**: 2026-06-09  
**Author**: nk_trung       
**Update date**: 2026-06-12    

---

## 1. Screen Objective

The Customer Management screen allows administrators to perform Customer CRUD operations:

- View the Customer list.
- Create a Customer.
- View Customer details.
- Edit a Customer.
- Soft-delete a Customer.

Dashboards, KPIs, summary cards, and operational statistics are not displayed.

---

## 2. Customer List

```text
+------------------------------------------------------------------------------------------------------+
| Customer Management                                                                                  |
+------------------------------------------------------------------------------------------------------+
| [Create]                               [Search ____________________] [Filters]                      |
+------------------------------------------------------------------------------------------------------+
| Actions | Customer code | Customer alias | Organization | Classification | Status | Updated at      |
|---------|---------------|---------------|--------------|----------------|--------|-----------------|
| [View] [Edit] [Delete] | CUS-001      | Customer A    | Brycen Vietnam | Internal       | Active | 2026-06-09 09:30 |
| [View] [Edit] [Delete] | CUS-002      | Customer B    | Brycen Japan   | External       | Deleted| 2026-06-08 10:15 |
+------------------------------------------------------------------------------------------------------+
| 25/page                                           1-1 of 1 items                              < 1 >    |
+------------------------------------------------------------------------------------------------------+
```

### Notes

- By default, the list loads active Customers.
- The list includes columns for Customer code, Customer alias, Organization, Classification, Status, and Updated at.
- Row actions are View, Edit, and Delete.
- The top action area uses a Create button on the left and Search / Filters controls on the right.
- The screen does not show a separate subtitle under the title.
- Customers belonging to disabled or soft-deleted Organizations are not displayed in the default active list.
- The Organization filter only displays active/not soft-deleted Organizations.
- Summary cards are not displayed at the top of the screen.

---

## 3. Empty State

```text
+------------------------------------------------------------------------------------------------------+
| Customer Management                                                                                  |
+------------------------------------------------------------------------------------------------------+
| [Create]                               [Search ____________________] [Filters]                      |
+------------------------------------------------------------------------------------------------------+
|                                                                                                      |
| No customers found for the current filters.                                                          |
|                                                                                                      |
| [Create]                                                                                             |
|                                                                                                      |
+------------------------------------------------------------------------------------------------------+
```

---

## 4. Create Customer Form

```text
+--------------------------------------------------------------------------------+
| Create Customer                                                         [X]    |
+--------------------------------------------------------------------------------+
| Organization *                                                                 |
| [ Select active Organization v ]                                               |
|                                                                                |
| Customer Code *                                                                |
| [ ____________________________ ]                                               |
|                                                                                |
| Customer Name / Alias *                                                        |
| [ ____________________________ ]                                               |
|                                                                                |
| Classification *                                                               |
| [ INTERNAL v ]                                                                 |
|                                                                                |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Save]         |
+--------------------------------------------------------------------------------+
```

### Notes

- The Organization dropdown only displays active/not soft-deleted Organizations.
- Customer code is required and searchable in the list.
- Customer alias is required.
- Classification defaults to Internal and can be changed to External.

---

## 5. Customer Detail Drawer

```text
+--------------------------------------------------------------------------------+
| Customer Detail                                                  [Edit] [Delete]|
+--------------------------------------------------------------------------------+
| Customer Code             CUS-001                                               |
| Customer Name / Alias     Customer A                                            |
| Organization              Brycen Vietnam                                        |
| Classification            Internal                                              |
| Status                    Active                                                |
| Version                   3                                                     |
| Updated Date              2026-06-09 09:30                                      |
| Deleted Date              -                                                     |
+--------------------------------------------------------------------------------+
```

### Notes

- Detail is read-only and opens in a drawer.
- Project/Repository details are not displayed on this screen.
- Deleted date is shown only when the Customer is soft-deleted.

---

## 6. Edit Customer Form

```text
+--------------------------------------------------------------------------------+
| Edit Customer                                                           [X]    |
+--------------------------------------------------------------------------------+
| Organization *                                                                 |
| [ Brycen Vietnam v ]                                                           |
|                                                                                |
| Customer Code *                                                                |
| [ CUS-001________________ ]                                                    |
|                                                                                |
| Customer Name / Alias *                                                        |
| [ Customer A________________ ]                                                 |
|                                                                                |
| Classification *                                                               |
| [ Internal v ]                                                                 |
|                                                                                |
+--------------------------------------------------------------------------------+
| [Cancel]                                                        [Save]         |
+--------------------------------------------------------------------------------+
```

### Notes

- The Organization dropdown only displays active/not soft-deleted Organizations.
- Customer code is editable and must remain valid.
- Moving a Customer to an inactive/deleted Organization is not allowed.
- Editing a soft-deleted Customer is not allowed.

---

## 7. Soft Delete Confirmation Dialog

```text
+------------------------------------------------------------+
| Delete Customer                                            |
+------------------------------------------------------------+
| Are you sure you want to delete this Customer?             |
|                                                            |
| Customer code: CUS-001                                     |
| Customer: Customer A                                       |
| Organization: Brycen Vietnam                               |
|                                                            |
| This action is a soft delete and does not physically       |
| delete the data.                                           |
+------------------------------------------------------------+
| [Cancel]                                      [Delete]     |
+------------------------------------------------------------+
```

---

## 8. Out of Scope UI

The following UI items will not be created in this ticket:

- Customer dashboard.
- Customer KPI cards.
- Project list in Customer detail.
- Repository list in Customer detail.
- Separate full-page detail screen.
- Bulk import/export.
- Role/permission management UI.
