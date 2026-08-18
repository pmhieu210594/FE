# Wireframe — USER_ACCOUNT — Màn hình quản lý User Account

## 0. Screen Overview

| Mục | Nội dung |
|---|---|
| Screen name | User Account Management |
| Route đề xuất | `/admin/user-accounts` |
| Menu | Admin → User Accounts |
| Người dùng | Admin only |
| Mục đích | CRUD tài khoản login nội bộ dùng cho chức năng LOGIN |
| Style tham khảo | Màn ORGANIZATION list/form và khu vực ADMIN |

---

## 1. Navigation / Permission

```text
Login → Admin Dashboard → User Accounts
```

Rule:

```text
- ADMIN nhìn thấy menu User Accounts.
- USER thường không nhìn thấy menu.
- USER thường nhập URL trực tiếp thì hiển thị 403 hoặc redirect Home.
```

---

## 2. Page Layout

```text
+--------------------------------------------------------------------------------+
| Header / Top bar                                                               |
| [Logo] EDCAP                                      [User menu] [Logout]          |
+--------------------------------------------------------------------------------+
| Sidebar                         | Main content                                  |
| - Dashboard                     |                                                |
| - Organization                  | User Accounts                                  |
| - Member                        | Manage login accounts and access status.       |
| - User Accounts   <selected>    |                                                |
| - Settings                      | [Search.............] [Status v] [Role v]      |
|                                 | [Team v]                         [+ New User]  |
|                                 |                                                |
|                                 | +--------------------------------------------+ |
|                                 | | Username | Member | Team | Role | Status | | |
|                                 | |----------|--------|------|------|--------| | |
|                                 | | admin    | Admin  | Ops  |ADMIN | Active |⋯| |
|                                 | | user01   | User01 | Dev  |USER  | Active |⋯| |
|                                 | | user02   | User02 | QA   |QA    |Inactive|⋯| |
|                                 | +--------------------------------------------+ |
|                                 | Showing 1-20 of N                 < 1 2 3 >   |
+--------------------------------------------------------------------------------+
```

---

## 3. Header Area

| Element | Nội dung |
|---|---|
| Title | `User Accounts` |
| Description | `Manage internal login accounts, roles, teams, and active status.` |
| Primary action | `+ New User` |

---

## 4. Search / Filter Area

```text
+----------------------------------------------------------------------------+
| Search keyword                                                              |
| [ username / member name / email............................ ] [Search]      |
|                                                                            |
| Status [All v]   Role [All v]   Team [All v]                 [Reset]        |
+----------------------------------------------------------------------------+
```

| Control | Type | Behavior |
|---|---|---|
| Search keyword | Text input | Search username/member/email if available |
| Status | Select | All / Active / Inactive |
| Role | Select | All / ADMIN / USER / PM / QA / SECURITY ... |
| Team | Select | All teams |
| Search | Button | Reload list |
| Reset | Button | Clear filters |

---

## 5. List Table

| Column | Nội dung | Note |
|---|---|---|
| Username | Tên đăng nhập | Link hoặc text |
| Member | Tên member/pseudonym | Nếu chưa map thì hiển thị `Unmapped` |
| Team | Team name | Từ team mapping |
| Role | Role name | Badge |
| Status | Active / Inactive / Locked | Badge |
| Last Login | Thời điểm login gần nhất | `-` nếu chưa login |
| Updated At | Thời điểm update gần nhất | ISO/local time |
| Actions | View/Edit/Reset Password/Deactivate/Reactivate | Theo trạng thái |

### Action menu

```text
[⋯]
  - View detail
  - Edit
  - Reset password
  - Deactivate    // nếu active
  - Reactivate    // nếu inactive
```

Không có `Delete` trong MVP.

---

## 6. Empty / Loading / Error State

### Loading

```text
Loading user accounts...
```

### Empty

```text
No user accounts found.
[+ New User]
```

### Error

```text
Failed to load user accounts.
[Retry]
Trace ID: xxxxx
```

---

## 7. Create User Account Modal / Page

```text
+-------------------------------------------------------------+
| New User Account                                      [x]    |
+-------------------------------------------------------------+
| Username *                                                  |
| [ user01................................................ ]   |
|                                                             |
| Member                                                     |
| [ Select member v                                      ]    |
|                                                             |
| Team *                                                     |
| [ Select team v                                        ]    |
|                                                             |
| Role *                                                     |
| [ Select role v                                        ]    |
|                                                             |
| Temporary Password *                                       |
| [ ***************                                      ]    |
|                                                             |
| Confirm Password *                                         |
| [ ***************                                      ]    |
|                                                             |
| Status                                                     |
| (o) Active    ( ) Inactive                                  |
|                                                             |
| [Cancel]                                      [Create User] |
+-------------------------------------------------------------+
```

### Create validation

| Field | Validation |
|---|---|
| Username | Required, unique, max 100, trim |
| Team | Required if team scope is used |
| Role | Required |
| Password | Required, min 8 chars |
| Confirm Password | Must match password |
| Status | Required |

---

## 8. View Detail Drawer / Page

```text
+-------------------------------------------------------------+
| User Account Detail                                  [Edit] |
+-------------------------------------------------------------+
| Username        admin                                      |
| Member          Administrator                              |
| Team            Operations                                 |
| Role            ADMIN                                      |
| Status          Active                                     |
| Last Login      2026-06-12 09:30                           |
| Created At      2026-06-01 10:00                           |
| Updated At      2026-06-12 09:00                           |
|                                                             |
| Security                                                 |
| Password hash    Hidden                                    |
| Token            Not displayed                             |
|                                                             |
| [Reset Password] [Deactivate] [Close]                       |
+-------------------------------------------------------------+
```

---

## 9. Edit User Account Modal / Page

```text
+-------------------------------------------------------------+
| Edit User Account                                    [x]    |
+-------------------------------------------------------------+
| Username                                                    |
| [ user01 ]  // read-only or editable based on policy         |
|                                                             |
| Member                                                     |
| [ Select member v                                      ]    |
|                                                             |
| Team *                                                     |
| [ Select team v                                        ]    |
|                                                             |
| Role *                                                     |
| [ Select role v                                        ]    |
|                                                             |
| Status                                                     |
| (o) Active    ( ) Inactive                                  |
|                                                             |
| [Cancel]                                      [Save Changes]|
+-------------------------------------------------------------+
```

Policy đề xuất:

```text
- Username nên read-only sau khi tạo để tránh ảnh hưởng login/history.
- Nếu cần đổi username, xử lý bằng chức năng riêng sau.
```

---

## 10. Reset Password Modal

```text
+-------------------------------------------------------------+
| Reset Password                                      [x]     |
+-------------------------------------------------------------+
| User: user01                                               |
|                                                             |
| New Password *                                             |
| [ ***************                                      ]    |
|                                                             |
| Confirm Password *                                         |
| [ ***************                                      ]    |
|                                                             |
| Warning: The old password will no longer work.              |
|                                                             |
| [Cancel]                                  [Reset Password]  |
+-------------------------------------------------------------+
```

Behavior:

```text
- Không hiển thị password cũ.
- Không hiển thị password hash.
- Sau reset thành công hiển thị toast: Password has been reset.
```

---

## 11. Deactivate Confirmation

```text
+-------------------------------------------------------------+
| Deactivate User Account                                    |
+-------------------------------------------------------------+
| Are you sure you want to deactivate user01?                 |
| This user will not be able to login after deactivation.     |
|                                                             |
| [Cancel]                                      [Deactivate]  |
+-------------------------------------------------------------+
```

Special rule:

```text
- Không cho deactivate Admin cuối cùng.
- Không cho Admin tự deactivate chính mình nếu hành động làm mất quyền quản trị.
```

---

## 12. Reactivate Confirmation

```text
+-------------------------------------------------------------+
| Reactivate User Account                                    |
+-------------------------------------------------------------+
| Reactivate user02?                                         |
| This user can login again if the password is valid.         |
|                                                             |
| [Cancel]                                      [Reactivate]  |
+-------------------------------------------------------------+
```

---

## 13. Toast Messages

| Action | Success message | Error message |
|---|---|---|
| Create | User account has been created. | Failed to create user account. |
| Update | User account has been updated. | Failed to update user account. |
| Reset password | Password has been reset. | Failed to reset password. |
| Deactivate | User account has been deactivated. | Failed to deactivate user account. |
| Reactivate | User account has been reactivated. | Failed to reactivate user account. |

---

## 14. Responsive / UX Notes

| Mục | Rule |
|---|---|
| Main target | Desktop browser |
| Mobile | Not primary in MVP |
| Long table | Horizontal scroll acceptable for MVP |
| Accessibility | Buttons need text labels; status must not rely only on color |
| Privacy | Không hiển thị password/hash/token |

---

## 15. Screen Flow

```text
Admin opens User Accounts
  → System loads list
    → Admin filters/searches
    → Admin creates user
      → User appears in list
      → User can login via LOGIN
    → Admin edits user
      → List/detail updated
    → Admin resets password
      → User can login with new password
    → Admin deactivates user
      → User cannot login
```

---

## 16. Blackbox Viewpoints

| Viewpoint | Case |
|---|---|
| Normal | Admin creates active user and user can login |
| Normal | Admin edits role/team and list updates |
| Abnormal | Non-admin cannot access screen |
| Abnormal | Duplicate username shows validation error |
| Abnormal | Password too short shows validation error |
| Boundary | Username with leading/trailing spaces is trimmed |
| Boundary | Empty list displays empty state |
| Security | Password/hash/token never displayed |
| Security | Last Admin cannot be deactivated |
