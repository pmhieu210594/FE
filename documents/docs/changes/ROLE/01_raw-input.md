# Requirement: CRUD Role Management

## 1. Bối cảnh

Cần xây dựng một màn hình quản lý Role trong hệ thống.
Màn hình này dùng để quản lý danh sách vai trò người dùng, phục vụ cơ chế phân quyền RBAC.

Role là một thành phần cơ bản trong hệ thống phân quyền. Mỗi user có thể được gán một hoặc nhiều role tùy theo thiết kế hiện tại của hệ thống.

## 2. Mục tiêu

Tạo chức năng CRUD cho Role, bao gồm:

* Xem danh sách Role
* Tạo mới Role
* Xem chi tiết Role
* Cập nhật Role
* Xóa Role
* Kiểm soát quyền thao tác theo RBAC

## 3. Phạm vi chức năng

### 3.1. Trong phạm vi

Chức năng cần hỗ trợ:

1. Hiển thị danh sách role hiện có.
2. Tạo mới role.
3. Cập nhật thông tin role.
4. Xóa role.
5. Validate dữ liệu nhập.
6. Kiểm tra quyền truy cập theo RBAC.
7. Hiển thị thông báo thành công / thất bại.
8. Lưu dữ liệu role vào bảng `dim_role`.

### 3.2. Ngoài phạm vi

Các chức năng sau chưa thuộc phạm vi yêu cầu này, trừ khi hệ thống hiện tại đã có sẵn và cần tích hợp:

1. Quản lý user.
2. Gán role cho user.
3. Quản lý permission chi tiết.
4. Gán permission cho role.
5. Import / export danh sách role.
6. Audit log nâng cao.
7. Soft delete nếu hệ thống hiện tại chưa có cơ chế này.

## 4. Cấu trúc database

### 4.1. Bảng chính

Tên bảng:

```text
dim_role
```

Danh sách cột:

| Cột        | Ý nghĩa                        | Ghi chú          |
| ---------- | ------------------------------ | ---------------- |
| role_id    | ID định danh role              | Khóa chính       |
| role_name  | Tên role                       | Không được trùng |
| created_at | Thời điểm tạo row dữ liệu      |                  |
| created_by | Người tạo row dữ liệu          |                  |
| updated_at | Thời điểm cập nhật row dữ liệu |                  |
| created_by | Người cập nhật row dữ liệu     |                  |


### 4.2. Đề xuất ràng buộc database

```text
Primary Key: role_id
Unique Key: role_name
```

### 4.3. Ghi chú cần AI kiểm tra thêm

AI cần kiểm tra source code / migration / schema hiện có để xác định:

* Kiểu dữ liệu thực tế của `role_id`
* `role_id` là auto increment, UUID, sequence hay được nhập thủ công
* Độ dài tối đa của `role_name`
* Bảng `dim_role` đã tồn tại hay cần tạo mới
* Hệ thống đang dùng hard delete hay soft delete

Không được tự ý thêm cột mới nếu chưa có approval.

## 5. Danh sách role khởi tạo / tham khảo

Danh sách role ban đầu gồm:

```text
PO
PM
Engineer
QA
Security
```

Có thể mở rộng thêm các role khác sau này.

## 6. Quy tắc nghiệp vụ

### 6.1. Danh sách Role

Người dùng có quyền xem Role Management có thể xem danh sách role.

Danh sách cần hiển thị tối thiểu:

| Trường    | Mô tả                                        |
| --------- | -------------------------------------------- |
| STT       | Đánh số thứ tự                               |
| Role ID   | ID của role                                  |
| Role Name | Tên role                                     |
| Action    | Các thao tác được phép: View / Edit / Delete |

### 6.2. Tạo Role

Người dùng có quyền tạo role mới được phép tạo role.

Điều kiện hợp lệ:

* `role_name` là bắt buộc.
* `role_name` không được trống.
* `role_name` không được chỉ chứa khoảng trắng.
* `role_name` không được trùng với role đã tồn tại.
* `role_name` nên được trim trước khi lưu.
* Không cho phép tạo role nếu người dùng không có quyền tương ứng.

Ví dụ hợp lệ:

```text
PO
PM
Engineer
QA
Security
```

Ví dụ không hợp lệ:

```text
<empty>
"   "
"PM" nếu PM đã tồn tại
```

### 6.3. Cập nhật Role

Người dùng có quyền cập nhật role được phép sửa tên role.

Điều kiện hợp lệ:

* Role cần cập nhật phải tồn tại.
* `role_name` mới là bắt buộc.
* `role_name` mới không được trống.
* `role_name` mới không được chỉ chứa khoảng trắng.
* `role_name` mới không được trùng với role khác.
* Không cho phép cập nhật nếu người dùng không có quyền tương ứng.

### 6.4. Xóa Role

Người dùng có quyền xóa role được phép xóa role.

Điều kiện cần kiểm tra trước khi xóa:

* Role cần xóa phải tồn tại.
* Nếu role đang được gán cho user hoặc đang được sử dụng trong dữ liệu khác, không được xóa cứng nếu hệ thống có ràng buộc liên quan.
* Không cho phép xóa nếu người dùng không có quyền tương ứng.

Nếu hệ thống chưa có thông tin về bảng user-role mapping, AI phải ghi vào Open Issues và không tự ý quyết định hành vi xóa.

## 7. RBAC

### 7.1. Mục tiêu RBAC

Chỉ người dùng có quyền phù hợp mới được truy cập và thao tác trên màn hình Role Management.

### 7.2. Permission đề xuất

Các permission cần có cho chức năng này:

| Permission  | Ý nghĩa                       |
| ----------- | ----------------------------- |
| role.view   | Xem danh sách / chi tiết role |
| role.create | Tạo role                      |
| role.update | Cập nhật role                 |
| role.delete | Xóa role                      |

### 7.3. Quy tắc hiển thị UI theo quyền

| Quyền của user       | Hành vi UI                                   |
| -------------------- | -------------------------------------------- |
| Không có `role.view` | Không được truy cập màn hình Role Management |
| Có `role.view`       | Được xem danh sách và chi tiết role          |
| Có `role.create`     | Hiển thị nút tạo mới                         |
| Có `role.update`     | Hiển thị nút chỉnh sửa                       |
| Có `role.delete`     | Hiển thị nút xóa                             |

### 7.4. Quy tắc kiểm tra phía backend

Backend bắt buộc kiểm tra quyền cho từng API / action.

Không được chỉ ẩn button ở frontend rồi coi là đã bảo vệ đủ.

Nếu user không có quyền, hệ thống trả lỗi phù hợp theo chuẩn hiện có của project.

## 8. UI yêu cầu

### 8.1. Màn hình danh sách Role

Màn hình Role Management cần có:

* Tiêu đề màn hình: Role Management
* Bảng danh sách role
* Nút tạo mới role nếu user có quyền
* Nút chỉnh sửa nếu user có quyền
* Nút xóa nếu user có quyền
* Hiển thị trạng thái loading khi đang tải dữ liệu
* Hiển thị empty state khi chưa có role nào
* Hiển thị thông báo lỗi khi tải dữ liệu thất bại

### 8.2. Form tạo / cập nhật Role

Form cần có:

| Field     | Bắt buộc | Ghi chú  |
| --------- | -------- | -------- |
| role_name | Có       | Tên role |

Validation message đề xuất:

| Trường hợp         | Message                                            |
| ------------------ | -------------------------------------------------- |
| Role name trống    | Role name is required.                             |
| Role name bị trùng | Role name already exists.                          |
| Role không tồn tại | Role does not exist.                               |
| Không có quyền     | You do not have permission to perform this action. |

Message thực tế cần tuân theo convention hiện có của project.

## 9. API / Backend yêu cầu

AI cần kiểm tra project hiện tại để xác định framework và convention API.

API đề xuất nếu hệ thống chưa có chuẩn khác:

| Method    | Endpoint           | Mục đích           | Permission  |
| --------- | ------------------ | ------------------ | ----------- |
| GET       | `/roles`           | Lấy danh sách role | role.view   |
| GET       | `/roles/{role_id}` | Lấy chi tiết role  | role.view   |
| POST      | `/roles`           | Tạo role           | role.create |
| PUT/PATCH | `/roles/{role_id}` | Cập nhật role      | role.update |
| DELETE    | `/roles/{role_id}` | Xóa role           | role.delete |

Không được tự ý tạo endpoint nếu project hiện tại đã có pattern route khác.

## 10. Acceptance Criteria

### AC-1: Xem danh sách role

Given user có quyền `role.view`
When user mở màn hình Role Management
Then hệ thống hiển thị danh sách role từ bảng `dim_role`.

### AC-2: Không có quyền xem role

Given user không có quyền `role.view`
When user truy cập màn hình Role Management
Then hệ thống không cho phép truy cập và hiển thị lỗi hoặc chuyển hướng theo convention hiện có.

### AC-3: Tạo role thành công

Given user có quyền `role.create`
And role name chưa tồn tại
When user nhập role name hợp lệ và submit
Then role mới được tạo trong bảng `dim_role`
And hệ thống hiển thị thông báo thành công.

### AC-4: Không cho tạo role trùng tên

Given user có quyền `role.create`
And role name đã tồn tại
When user tạo role với cùng role name
Then hệ thống không tạo role mới
And hiển thị thông báo lỗi trùng tên.

### AC-5: Không cho tạo role khi role name trống

Given user có quyền `role.create`
When user submit form với role name trống hoặc chỉ có khoảng trắng
Then hệ thống không tạo role
And hiển thị lỗi validation.

### AC-6: Cập nhật role thành công

Given user có quyền `role.update`
And role cần cập nhật tồn tại
And role name mới hợp lệ
When user cập nhật role
Then dữ liệu role trong bảng `dim_role` được cập nhật
And hệ thống hiển thị thông báo thành công.

### AC-7: Không cho cập nhật role thành tên trùng

Given user có quyền `role.update`
And role name mới đã tồn tại ở role khác
When user cập nhật role
Then hệ thống không cập nhật
And hiển thị thông báo lỗi trùng tên.

### AC-8: Xóa role thành công

Given user có quyền `role.delete`
And role cần xóa tồn tại
And role không bị ràng buộc bởi dữ liệu khác
When user xác nhận xóa
Then role được xóa khỏi hệ thống
And hệ thống hiển thị thông báo thành công.

### AC-9: Không cho thao tác nếu thiếu quyền

Given user không có permission tương ứng
When user gọi API hoặc thao tác Create / Update / Delete
Then hệ thống từ chối thao tác
And không thay đổi dữ liệu trong `dim_role`.

### AC-10: Backend phải enforce RBAC

Given user không có quyền nhưng cố gọi API trực tiếp
When request được gửi tới backend
Then backend phải kiểm tra quyền và từ chối request.

## 11. Test viewpoint

AI cần tạo test plan bao gồm tối thiểu:

### 11.1. Normal cases

* Xem danh sách role thành công.
* Tạo role mới thành công.
* Cập nhật role thành công.
* Xóa role thành công.

### 11.2. Error cases

* Tạo role trùng tên.
* Cập nhật role thành tên trùng.
* Role name trống.
* Role không tồn tại.
* Không có quyền truy cập.
* Không có quyền create/update/delete.

### 11.3. Boundary cases

* Role name chỉ có khoảng trắng.
* Role name có khoảng trắng đầu/cuối.
* Role name đạt độ dài tối đa nếu DB/schema có giới hạn.
* Role name vượt quá độ dài tối đa nếu DB/schema có giới hạn.

### 11.4. RBAC cases

* User chỉ có `role.view`.
* User có `role.view` + `role.create`.
* User có `role.view` + `role.update`.
* User có `role.view` + `role.delete`.
* User có toàn quyền quản lý role.
* User không có quyền nào liên quan đến role.

## 12. Security / Privacy

* Không có PII trong bảng `dim_role`.
* Không log dữ liệu nhạy cảm.
* Backend phải kiểm tra quyền cho từng action.
* Không tin tưởng kiểm soát quyền chỉ ở frontend.
* Không cho phép SQL injection hoặc query không parameterized.
* Không expose stack trace hoặc thông tin nội bộ khi có lỗi.

## 13. Assumptions

Các giả định hiện tại:

1. Hệ thống đã có cơ chế login / authentication.
2. Hệ thống đã có hoặc sẽ có cơ chế RBAC.
3. Role được lưu trong bảng `dim_role`.
4. `role_name` là unique.
5. Danh sách role ban đầu gồm PO, PM, Engineer, QA, Security.
6. Message lỗi sẽ tuân theo convention hiện có của project.

## 14. Open Issues

Các điểm cần AI kiểm tra hoặc cần con người xác nhận:

1. Kiểu dữ liệu của `role_id` là gì?
2. `role_id` được sinh tự động hay nhập thủ công?
3. Có cần soft delete không?
4. Có bảng mapping user-role hiện tại không?
5. Nếu role đã được gán cho user thì có được xóa không?
6. RBAC permission hiện tại đang được đặt tên theo convention nào?
7. Endpoint API hiện tại theo convention REST hay convention khác?
8. Có cần seed dữ liệu ban đầu cho các role PO, PM, Engineer, QA, Security không?
9. Có cần phân trang, search, sort cho danh sách role không?
10. Có cần đa ngôn ngữ cho message không?
11. Role name có phân biệt chữ hoa / chữ thường khi check trùng không?

## 15. Human Decision Required

Cần con người xác nhận trước khi implement:

1. Có cần seed sẵn các role PO, PM, Engineer, QA, Security vào database không?
2. Cho phép hard delete hay bắt buộc soft delete?
3. Có cho phép xóa role đang được user sử dụng không?
4. Permission naming sẽ dùng `role.view`, `role.create`, `role.update`, `role.delete` hay theo chuẩn khác của project?
5. Có cần search / pagination / sort trong màn hình danh sách role không?
6. Có cần audit log khi tạo / sửa / xóa role không?
