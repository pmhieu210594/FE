# Project Management — Wireframe

> Wireframe markdown mô phỏng layout tương tự màn hình mẫu Role management.

---

## 1. List page

### Header

**Project management**

---

### Toolbar

| Left                   | Right                                        |
| ---------------------- | -------------------------------------------- |
| `[ + Create project ]` | `[ Customer filter ▼ ]   [ x ]   [ Filter ]` |

---

### Data table

| Actions                | Project name | Customer name | Status | Created date        | Updated date        |
| ---------------------- | ------------ | ------------- | ------ | ------------------- | ------------------- |
| `view` `edit` `delete` | PRJ001       | Customer A    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ002       | Customer A    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ003       | Customer B    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ004       | Customer B    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ005       | Customer C    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ006       | Customer C    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ007       | Customer D    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ008       | Customer D    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |
| `view` `edit` `delete` | PRJ009       | Customer E    | ACTIVE | 15/06/2026 13:05:04 | 15/06/2026 13:05:04 |

---

### Footer / Pagination

| Left                             | Right             |
| -------------------------------- | ----------------- |
| `[ 25/page ▼ ]   1-9 of 9 items` | `⟪  ‹  [1]  ›  ⟫` |

Default UI pagination for this ticket is `25/page`.

---

## 2. Create / Edit form wireframe

### Page title

**Create project** / **Edit project**

---

### Form layout

| Field        | Wireframe                                    | Note                |
| ------------ | -------------------------------------------- | ------------------- |
| Customer     | `[ Select customer ▼ ]`                      | Required            |
| Project name | `[ Enter project name                     ]` | Required            |
| Teams        | `[ Select teams ▼ ]`                         | Multi-select        |
| Project type | `[ Select project type ▼ ]`                  | Optional            |
| Risk level   | `[ Select risk level ▼ ]`                    | Optional            |
| Status       | `[ ACTIVE ]`                                 | Read-only on create |

---

### Actions

`[ Cancel ]   [ Save ]`

---

## 3. Detail page wireframe

### Page title

**Project detail**

---

### Information block

| Field         | Value               |
| ------------- | ------------------- |
| Customer name | Customer A          |
| Project name  | PRJ001              |
| Teams         | Team A, Team B      |
| Project type  | Development         |
| Risk level    | Medium              |
| Status        | ACTIVE              |
| Created date  | 15/06/2026 13:05:04 |
| Created by    | admin               |
| Updated date  | 15/06/2026 13:05:04 |
| Updated by    | admin               |

---

### Actions

`[ Back ]   [ Edit ]`

---

## 4. Empty state

```text
Project management

[ + Create project ]

No projects found.
```

---

## 5. Loading state

```text
Project management

[ + Create project ]

Loading projects...
```

---

## 7. Error state

```text
Failed to load project list.
[ Retry ]
```
