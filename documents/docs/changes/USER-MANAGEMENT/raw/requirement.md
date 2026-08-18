# Requirement — USER_ACCOUNT — CRUD tài khoản đăng nhập

## 0. Thông tin ticket

| Mục | Nội dung |
|---|---|
| Ticket | USER_ACCOUNT |
| Tên chức năng | Màn hình quản lý User Account |
| Mục đích | Cho phép Admin quản lý tài khoản đăng nhập nội bộ dùng cho chức năng LOGIN |
| Người dùng chính | Admin |
| Quyền truy cập | Chỉ user có role `ADMIN` được vào màn hình và thao tác |
| Entity chính | `tbl_auth_user_account` |
| Liên quan | LOGIN, MEMBER_CRUD, ORGANIZATION, ADMIN |

---

## 1. Background / Purpose

Chức năng LOGIN đã hoàn thành với cơ chế đăng nhập bằng `username/password`, xác thực qua bảng `tbl_auth_user_account`, dùng token, redirect theo role và có kiểm soát failed login.

Sau khi có LOGIN, hệ thống cần màn hình quản lý tài khoản đăng nhập để Admin có thể tạo, xem, sửa, kích hoạt/vô hiệu hóa tài khoản dùng để đăng nhập vào hệ thống.

Chức năng này phục vụ quản trị hệ thống, không phục vụ người dùng tự đăng ký hoặc tự reset mật khẩu.

---

## 2. Scope

### 2.1 In Scope

| Nhóm | Nội dung |
|---|---|
| Danh sách | Hiển thị danh sách tài khoản login |
| Tìm kiếm | Tìm theo username, display name/email nếu có, trạng thái active |
| Lọc | Lọc theo trạng thái active/inactive, role, team nếu có mapping |
| Tạo mới | Admin tạo tài khoản login mới |
| Xem chi tiết | Admin xem thông tin tài khoản |
| Cập nhật | Admin sửa thông tin tài khoản |
| Đổi trạng thái | Admin vô hiệu hóa hoặc kích hoạt lại tài khoản |
| Reset mật khẩu bởi Admin | Admin đặt mật khẩu tạm thời hoặc mật khẩu mới cho tài khoản |
| Role mapping | Gắn account với member/role/team thông qua dữ liệu hiện có |
| Validation | Validate username, password, active status, member mapping |
| Quyền | Chỉ Admin được vào màn hình |

### 2.2 Out of Scope

| Không làm trong scope này | Lý do |
|---|---|
| User tự đăng ký tài khoản | Không phù hợp với hệ thống nội bộ |
| User tự forgot password | Ticket LOGIN đã tạm thời chưa làm forgot password |
| SSO/OIDC/Google OAuth | LOGIN hiện tại dùng username/password nội bộ |
| MFA | Chưa thuộc scope MVP |
| Hard delete tài khoản | Tránh mất traceability và lịch sử |
| Quản lý toàn bộ Member profile | Đã có hoặc sẽ có chức năng MEMBER_CRUD riêng |
| Audit chính thức | Hiện LOGIN cũng chưa làm audit; chỉ thiết kế để bổ sung sau |

---

## 3. Source of Truth / Related Sources

| ID | Source | Vai trò |
|---|---|---|
| SRC-01 | LOGIN requirement/spec hiện tại | Căn cứ auth method, token, failed login, forgot password out of scope |
| SRC-02 | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Căn cứ RBAC, quản trị, bảo mật, không lưu secret/password/token, role/project/customer scope |
| SRC-03 | ORGANIZATION screen/wireframe | Tham khảo layout list/search/table/form/detail |
| SRC-04 | ADMIN screen | Tham khảo cách đặt màn quản trị và quyền Admin |
| SRC-05 | `tbl_auth_user_account` | Bảng chính để quản lý tài khoản đăng nhập |
| SRC-06 | `tbl_dim_member_pseudonym`, `tbl_dim_team`, `tbl_dim_role` | Mapping member, team, role nếu cần hiển thị hoặc phân quyền |

---

## 4. As-Is / To-Be

### 4.1 As-Is

- Hệ thống đã có LOGIN bằng username/password.
- Account đăng nhập dùng bảng `tbl_auth_user_account`.
- Chưa có màn hình cho Admin tạo/sửa/kích hoạt/vô hiệu hóa account login.
- Nếu cần thêm user, dev hoặc DBA có thể phải thao tác trực tiếp DB, khó kiểm soát và dễ lỗi.

### 4.2 To-Be

- Admin đăng nhập hệ thống.
- Admin vào menu quản trị `User Accounts`.
- Admin xem danh sách tài khoản login.
- Admin tạo mới account, gắn với member/role/team phù hợp.
- Admin reset mật khẩu khi user quên mật khẩu.
- Admin deactivate tài khoản thay vì xóa cứng.
- User account sau khi tạo có thể dùng để login qua chức năng LOGIN.

---

## 5. Terminology

| Thuật ngữ | Giải thích |
|---|---|
| User Account | Tài khoản dùng để đăng nhập vào hệ thống |
| Member | Thành viên nội bộ được quản lý trong dữ liệu member/pseudonym |
| Role | Vai trò dùng cho RBAC, ví dụ Admin/User/PM/QA/Security |
| Team | Nhóm mà member thuộc về |
| Active | Trạng thái cho phép đăng nhập |
| Inactive | Trạng thái không cho phép đăng nhập |
| Reset password | Admin đặt lại mật khẩu cho user |
| Temporary password | Mật khẩu tạm do Admin đặt hoặc hệ thống sinh ra |

---

## 6. Data / Database Requirement

### 6.1 Main table

| Table | Mục đích |
|---|---|
| `tbl_auth_user_account` | Lưu tài khoản đăng nhập nội bộ |

### 6.2 Expected fields

| Field | Bắt buộc | Mô tả |
|---|---:|---|
| `account_id` | Yes | Khóa chính hoặc định danh account |
| `username` | Yes | Tên đăng nhập, unique |
| `password_hash` | Yes | Mật khẩu đã hash, không lưu plain text |
| `password_algo` | Yes | Thuật toán hash, mặc định bcrypt |
| `is_active` | Yes | Có cho phép login hay không |
| `member_key` | Should | Mapping tới member/pseudonym nếu có |
| `created_at` | Should | Thời điểm tạo |
| `updated_at` | Should | Thời điểm cập nhật |
| `last_login_at` | Could | Thời điểm login gần nhất, nếu đã có cơ chế lưu |
| `failed_login_count` | Could | Số lần login sai, nếu lockout lưu trong DB |
| `locked_until` | Could | Thời điểm khóa tạm, nếu lockout lưu trong DB |

### 6.3 Related tables

| Table | Mục đích |
|---|---|
| `tbl_dim_member_pseudonym` | Lấy thông tin member, pseudonym, team/role mapping nếu có |
| `tbl_dim_team` | Danh sách team |
| `tbl_dim_role` | Danh sách role |

---

## 7. Functional Requirements

### 7.1 USERACC-FR-001 — Access Control

| Mục | Nội dung |
|---|---|
| Requirement | Chỉ user có role `ADMIN` được truy cập màn User Account Management |
| Priority | Must |
| Acceptance | Non-admin truy cập URL trực tiếp thì bị chặn và hiển thị lỗi quyền hoặc redirect về Home |

### 7.2 USERACC-FR-002 — List User Accounts

| Mục | Nội dung |
|---|---|
| Requirement | Admin xem được danh sách tài khoản login |
| Priority | Must |
| Columns | Username, Member, Team, Role, Status, Last Login, Updated At, Actions |
| Acceptance | Danh sách hiển thị theo pagination/sort mặc định |

### 7.3 USERACC-FR-003 — Search / Filter

| Mục | Nội dung |
|---|---|
| Requirement | Admin tìm kiếm và lọc account |
| Priority | Must |
| Search | username, member display/pseudonym/email nếu có |
| Filter | status, role, team |
| Acceptance | Khi nhập search/filter, table reload đúng điều kiện |

### 7.4 USERACC-FR-004 — Create User Account

| Mục | Nội dung |
|---|---|
| Requirement | Admin tạo account login mới |
| Priority | Must |
| Required input | username, password hoặc temporary password, active status, member mapping nếu bắt buộc |
| Acceptance | Account mới tạo có thể login nếu active và password hợp lệ |

### 7.5 USERACC-FR-005 — Validate Username

| Mục | Nội dung |
|---|---|
| Requirement | Username bắt buộc, không trùng, không chứa khoảng trắng đầu/cuối sau khi trim |
| Priority | Must |
| Rule | Trim username trước khi lưu/lookup |
| Acceptance | Username trùng hoặc rỗng bị báo lỗi validation |

### 7.6 USERACC-FR-006 — Password Hashing

| Mục | Nội dung |
|---|---|
| Requirement | Password không được lưu plain text |
| Priority | Must |
| Default | bcrypt |
| Acceptance | DB chỉ lưu `password_hash` và `password_algo`; response/API không trả raw password/hash |

### 7.7 USERACC-FR-007 — Update User Account

| Mục | Nội dung |
|---|---|
| Requirement | Admin sửa thông tin account |
| Priority | Must |
| Editable fields | member mapping, active status, role/team mapping nếu thuộc account screen, display metadata nếu có |
| Non-editable fields | account_id, password_hash trực tiếp, created_at |
| Acceptance | Update thành công phản ánh lại ở list/detail |

### 7.8 USERACC-FR-008 — Deactivate / Reactivate

| Mục | Nội dung |
|---|---|
| Requirement | Admin có thể deactivate/reactivate account |
| Priority | Must |
| Rule | Không hard delete trong MVP |
| Acceptance | Inactive account không login được; reactivate thì login lại được nếu credential đúng |

### 7.9 USERACC-FR-009 — Admin Reset Password

| Mục | Nội dung |
|---|---|
| Requirement | Admin có thể reset password cho user |
| Priority | Should |
| Rule | Password mới phải được hash bằng bcrypt; không hiển thị password hiện tại |
| Acceptance | Sau reset, user dùng password mới để login được; password cũ không dùng được |

### 7.10 USERACC-FR-010 — Protect Admin Account

| Mục | Nội dung |
|---|---|
| Requirement | Hạn chế thao tác nguy hiểm với account Admin cuối cùng |
| Priority | Should |
| Rule | Không cho deactivate account Admin cuối cùng hoặc tự deactivate chính mình nếu sẽ mất quyền quản trị |
| Acceptance | Hệ thống báo lỗi nghiệp vụ khi thao tác làm mất Admin cuối cùng |

### 7.11 USERACC-FR-011 — No Sensitive Exposure

| Mục | Nội dung |
|---|---|
| Requirement | Không hiển thị password, password hash, token, secret trên UI/API |
| Priority | Must |
| Acceptance | List/detail response không chứa `password_hash`, token, secret |

### 7.12 USERACC-FR-012 — Error Handling

| Mục | Nội dung |
|---|---|
| Requirement | Lỗi validation và lỗi quyền được hiển thị rõ cho Admin |
| Priority | Must |
| Acceptance | 400/403/404/409 có message phù hợp và không lộ thông tin nhạy cảm |

---

## 8. API Requirements

### 8.1 Proposed API

| API | Method | Auth | Mục đích |
|---|---|---|---|
| `/api/v1/admin/user-accounts` | GET | ADMIN | List/search/filter account |
| `/api/v1/admin/user-accounts/{accountId}` | GET | ADMIN | Xem chi tiết account |
| `/api/v1/admin/user-accounts` | POST | ADMIN | Tạo account |
| `/api/v1/admin/user-accounts/{accountId}` | PUT | ADMIN | Cập nhật account |
| `/api/v1/admin/user-accounts/{accountId}/activate` | POST | ADMIN | Kích hoạt account |
| `/api/v1/admin/user-accounts/{accountId}/deactivate` | POST | ADMIN | Vô hiệu hóa account |
| `/api/v1/admin/user-accounts/{accountId}/reset-password` | POST | ADMIN | Reset password |
| `/api/v1/admin/roles` | GET | ADMIN | Lấy danh sách role cho dropdown |
| `/api/v1/admin/teams` | GET | ADMIN | Lấy danh sách team cho dropdown |
| `/api/v1/admin/members` | GET | ADMIN | Lấy danh sách member cho dropdown/mapping |

### 8.2 Create request draft

```json
{
  "username": "user01",
  "password": "TemporaryPassword123!",
  "memberKey": "mem_001",
  "roleId": "role_user",
  "teamId": "team_dev",
  "isActive": true
}
```

### 8.3 Response draft

```json
{
  "accountId": "acc_001",
  "username": "user01",
  "memberKey": "mem_001",
  "memberName": "User 01",
  "roleId": "role_user",
  "roleName": "USER",
  "teamId": "team_dev",
  "teamName": "Development",
  "isActive": true,
  "lastLoginAt": null,
  "updatedAt": "2026-06-12T00:00:00Z"
}
```

---

## 9. Validation Rules

| Field | Rule |
|---|---|
| username | Required, trim, unique, max 100 chars |
| password | Required on create/reset, min 8 chars, should contain letters and numbers |
| memberKey | Should exist if provided |
| roleId | Required if account controls RBAC directly; must exist in role master |
| teamId | Required if account controls team scope directly; must exist in team master |
| isActive | Required boolean |

---

## 10. Non-functional Requirements

| ID | Requirement |
|---|---|
| NFR-USERACC-001 | Chỉ Admin được truy cập màn và API quản trị |
| NFR-USERACC-002 | Không lưu hoặc trả về password plain text, password hash, token, secret |
| NFR-USERACC-003 | API response không chứa dữ liệu nhạy cảm không cần thiết |
| NFR-USERACC-004 | Danh sách account phải hỗ trợ pagination để tránh tải lớn |
| NFR-USERACC-005 | Tên cá nhân nên hiển thị theo member/pseudonym phù hợp chính sách privacy |
| NFR-USERACC-006 | Mọi error response phải có message an toàn, không lộ password/hash/token |
| NFR-USERACC-007 | Thiết kế để sau này thêm audit log cho create/update/deactivate/reset password |

---

## 11. Acceptance Criteria

| AC | Nội dung | Test type |
|---|---|---|
| AC-USERACC-001 | Admin nhìn thấy menu/màn `User Accounts` trong khu vực Admin | E2E/BB |
| AC-USERACC-002 | Non-admin không truy cập được màn `User Accounts` dù nhập URL trực tiếp | E2E/Security |
| AC-USERACC-003 | Admin xem được danh sách account với username, member, team, role, status | E2E/BB |
| AC-USERACC-004 | Admin tìm kiếm được account theo username | E2E/IT |
| AC-USERACC-005 | Admin lọc được account theo status active/inactive | E2E/IT |
| AC-USERACC-006 | Admin lọc được account theo role/team nếu có dữ liệu role/team | E2E/IT |
| AC-USERACC-007 | Admin tạo account mới với username duy nhất và password hợp lệ | IT/E2E |
| AC-USERACC-008 | Username trùng bị từ chối với lỗi validation | IT/E2E |
| AC-USERACC-009 | Password được lưu bằng hash, không lưu plain text | UT/IT/Security |
| AC-USERACC-010 | API list/detail không trả `password_hash`, raw password hoặc token | IT/Security |
| AC-USERACC-011 | Account active mới tạo login được qua chức năng LOGIN | IT/E2E |
| AC-USERACC-012 | Admin update role/team/member mapping và dữ liệu hiển thị cập nhật đúng | IT/E2E |
| AC-USERACC-013 | Admin deactivate account, account đó không login được nữa | IT/E2E |
| AC-USERACC-014 | Admin reactivate account, account đó login lại được nếu credential đúng | IT/E2E |
| AC-USERACC-015 | Admin reset password, password mới login được và password cũ không login được | IT/E2E |
| AC-USERACC-016 | Hệ thống không cho deactivate Admin cuối cùng hoặc thao tác làm mất quyền quản trị cuối cùng | IT/Security |
| AC-USERACC-017 | Cancel/Close form không làm mất dữ liệu list hiện tại | BB |
| AC-USERACC-018 | Loading/error/empty state được hiển thị dễ hiểu | BB |

---

## 12. Examples

### Normal cases

| Case | Expected |
|---|---|
| Admin mở màn User Accounts | List account hiển thị |
| Admin tạo account active | Account xuất hiện ở list và login được |
| Admin reset password | User login bằng password mới được |
| Admin deactivate account | Account không login được |

### Abnormal cases

| Case | Expected |
|---|---|
| Non-admin mở URL màn User Accounts | Bị từ chối quyền |
| Username đã tồn tại | Báo lỗi duplicate username |
| Password quá ngắn | Báo lỗi validation |
| Reset password cho account không tồn tại | 404 hoặc message phù hợp |
| Deactivate Admin cuối cùng | Bị chặn |

### Boundary cases

| Case | Expected |
|---|---|
| Username có space đầu/cuối | Trim trước khi validate/lưu |
| Username đúng max length | Cho phép |
| Username vượt max length | Báo lỗi validation |
| List không có data | Hiển thị empty state |
| Role/team bị xóa hoặc inactive | Không cho chọn hoặc hiển thị warning |

---

## 13. Open Issues

| ID | Nội dung | Đề xuất xử lý |
|---|---|---|
| OI-USERACC-001 | `role_id` và `team_id` lưu trực tiếp trong account hay thông qua `member_key`? | Nếu DB hiện có role/team ở member thì dùng member làm source; nếu account cần quyền riêng thì lưu/resolve từ account DTO |
| OI-USERACC-002 | Reset password dùng Admin nhập password hay hệ thống generate temporary password? | MVP: Admin nhập password mới; sau này có thể generate |
| OI-USERACC-003 | Có bắt buộc user đổi password lần đầu sau reset không? | MVP: chưa bắt buộc; phase sau thêm `must_change_password` |
| OI-USERACC-004 | API path có dùng `/api/v1/admin/user-accounts` hay theo convention khác? | Chốt trước implement |
| OI-USERACC-005 | Audit create/update/reset/deactivate làm ngay hay phase sau? | Theo LOGIN hiện tại: phase sau |

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Lộ password/hash/token trên API/UI | Không trả field nhạy cảm; test security |
| Admin vô tình khóa chính mình hoặc Admin cuối cùng | Chặn business rule |
| Reset password vận hành thủ công gây rủi ro | Sau này thêm must-change-password/email flow |
| Role/team mapping không thống nhất với MEMBER_CRUD | Chốt rõ source of truth: member hoặc account |
| Không có audit ở MVP khó truy vết thao tác quản trị | Thiết kế API/service có hook để thêm audit sau |

---

## 15. Judgment

Có thể bắt đầu implement MVP nếu chốt thêm 2 điểm trước khi code:

1. `role_id` và `team_id` lấy từ account trực tiếp hay từ member mapping.
2. Reset password do Admin nhập hay hệ thống generate.

Nếu dùng quyết định mặc định trong tài liệu này, có thể implement theo hướng:

```text
Admin nhập password mới khi create/reset.
Account mapping với member/team/role để phục vụ quyền và hiển thị.
Không hard delete, chỉ deactivate/reactivate.
Audit để phase sau.
```
