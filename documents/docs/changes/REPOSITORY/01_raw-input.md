# Requirement: CRUD Repository Management

## 1. Bối cảnh

Cần xây dựng màn hình quản lý Repository trong hệ thống hiện có.

Quy tắc quan hệ dữ liệu:

- 1 Project có thể có nhiều repository.
- 1 Repository chỉ thuộc đúng 1 Project.


## 2. Mục tiêu

Xây dựng chức năng CRUD cho Repository, bao gồm:

- Xem danh sách Repository
- Tạo mới Repository
- Xem chi tiết Repository
- Cập nhật Repository
- Xóa Repository theo cơ chế soft delete

## 3. Phạm vi chức năng

### 3.1. Trong phạm vi

Chức năng cần hỗ trợ:

1. Hiển thị danh sách Repository hiện có.
2. Tạo mới Repository.
3. Xem chi tiết Repository.
4. Cập nhật thông tin Repository.
5. Xóa Repository theo cơ chế soft delete.
6. Validate dữ liệu nhập ở frontend và backend.
7. Hiển thị thông báo thành công / thất bại theo convention hiện có của Repository.
8. Lưu dữ liệu Repository vào bảng `tbl_dim_repository`.
9. Kiểm tra quyền cho từng API / action.
10. Chỉ có quyền ADMIN mới có thể thực hiện các action của màn hình này

### 3.2. Ngoài phạm vi

Các nội dung sau hiện chưa nằm trong phạm vi requirement này nếu chưa có yêu cầu riêng:

- Khôi phục Repository đã bị xóa mềm (restore)
- Quản lý lịch sử thay đổi (change history/audit UI)
- Import/export Repository
- Bulk delete / bulk update

## 4. Cấu trúc database

### 4.1. Bảng chính

Bảng chính lưu Project là `tbl_dim_project`.

Các cột chính được sử dụng trong phạm vi chức năng này:

- `repository_id`
- `project_id`
- `repo_name_masked`
- `host_type`
- `default_branch`
- `repo_url_hash`
- `status`
- `delete_flag`
- `deleted_at`
- `deleted_by`
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`

DDL tham chiếu hiện có:

```sql
CREATE TABLE IF NOT EXISTS tbl_dim_repository (
    repository_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES tbl_dim_project(project_id),
    repo_name_masked VARCHAR(255) NOT NULL,
    host_type VARCHAR(50) NOT NULL,
    default_branch VARCHAR(255),
    repo_url_hash VARCHAR(128),
    status record_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT uq_repo_per_project UNIQUE (project_id, repo_name_masked)
);
```

Lưu ý:

- Schema hiện có đã bổ sung cột phục vụ soft delete trong migration/schema của repository, do đó chức năng soft delete được phép triển khai theo cấu trúc đã được approval.
- Không tự ý thêm cột mới ngoài schema hiện có nếu chưa có approval.
- Cần kiểm tra migration / schema thực tế để lấy đúng định nghĩa đầy đủ cho `delete_flag`, `deleted_at`, `deleted_by`, enum `status` và cấu trúc bảng `tbl_dim_repository`.

### 4.2. Bảng liên quan

Cần sử dụng thêm các bảng hiện có trong hệ thống:

- `tbl_dim_project`: lưu thông tin Project
- Bảng Project thực tế theo schema hiện có của hệ thống

### 4.3. Quy ước dữ liệu soft delete

Khi xóa Repository, thực hiện soft delete trên `tbl_dim_repository` theo schema hiện có.

Trạng thái sau khi xóa:

- `status` chuyển sang `DELETED`
- cập nhật các cột soft delete như `delete_flag`, `deleted_at`, `deleted_by` theo schema hiện có

Mặc định các API danh sách / chi tiết / cập nhật không xử lý trên Repository đã bị soft delete, trừ khi có yêu cầu riêng sau này.

## 5. Quy tắc nghiệp vụ

lưu ý: tất cả các label, message, ... trên màn hình đều có thể sử dụng đa ngôn ngữ

### 5.1. Danh sách Repository

Người dùng có quyền xem Repository Management có thể xem danh sách Repository.

Danh sách cần hiển thị tối thiểu các cột sau:

| Trường | Mô tả |
| --- | --- |
| Action | Các thao tác được phép: View / Edit / Delete |
| Project Name | Tên Project |
| Repository Name | Tên Repository, map với trường `repo_name_masked` |
| Host Type | Loại Repository (ví dụ: github, gitlab, ...) |
| Status | Trạng thái Repository |
| Create date | Ngày tạo Repository |
| Update date | Ngày cập nhật Repository |

Quy tắc dữ liệu danh sách:

- Chỉ hiển thị Repository chưa bị soft delete.
- Dữ liệu Repository phải join được thông tin `project_alias` từ `tbl_dim_project`.

### 5.2. Tạo Repository

Form tạo mới cần có:

- Dropdown chọn `project`
- Ô nhập `repo_name_masked`
- Ô nhập `repository_type`
- Ô nhập `default_branch`
- Ô nhập `repo_url_hash`

Điều kiện hợp lệ:

- `project_id` là bắt buộc.
- `repo_name_masked` là bắt buộc.
- `repo_name_masked` không được trống.
- `repo_name_masked` không được chỉ chứa khoảng trắng.
- `repo_name_masked` phải được trim trước khi lưu.
- `repo_name_masked` được xem là trùng khi đồng thời trùng cả:
- Rule duplicate cần áp dụng trên tập dữ liệu Repository chưa bị xóa mềm, trừ khi Repository hiện tại có convention khác đã được áp dụng trong codebase.
- `status` được gán mặc định là `ACTIVE` ngay khi tạo mới.

Ví dụ hợp lệ:

```text
Repository A
Repository B
Data Analytics
```

Ví dụ không hợp lệ:

```text
<empty>
"   "
"Repository A" nếu trong cùng Project đã tồn tại Repository có `repo_name_masked` là "Repository A"
```

Kết quả khi tạo thành công:

- Tạo bản ghi mới trong `tbl_dim_repository`
- `status = ACTIVE`
- cập nhật `created_at`, `created_by`, `updated_at`, `updated_by` theo convention hiện có của hệ thống

### 5.3. Cập nhật Repository

Cho phép cập nhật các trường sau:

- `project`
- `repo_name_masked`
- `repository_type`
- `risk_level`
- `default_branch`
- `repo_url_hash`

Điều kiện hợp lệ:

- Repository cần cập nhật phải tồn tại và chưa bị soft delete.
- `project_id` là bắt buộc.
- `repo_name_masked` mới là bắt buộc.
- `repo_name_masked` mới không được trống.
- `repo_name_masked` mới không được chỉ chứa khoảng trắng.
- `repo_name_masked` mới phải được trim trước khi lưu.
- `repo_name_masked` mới không được trùng với Repository khác trong cùng `project_id`.

### 5.4. Xóa Repository

Người dùng có quyền xóa Repository được phép xóa Repository.

Điều kiện cần kiểm tra trước khi xóa:

- Repository cần xóa phải tồn tại.
- Repository cần xóa chưa bị soft delete.

Cách xử lý khi xóa:

- Không xóa cứng dữ liệu.
- Thực hiện soft delete theo schema hiện có.
- `status` chuyển sang `DELETED`.
- cập nhật `delete_flag`, `deleted_at`, `deleted_by` theo schema hiện có.

### 5.5. Xem chi tiết Repository

Người dùng có quyền xem Repository có thể xem chi tiết Repository.

Màn hình chi tiết cần hiển thị tối thiểu:

| Trường | Mô tả |
| --- | --- |
| Repository ID | Mã định danh Repository |
| Customer Name | Tên Customer |
| Repository Name | Giá trị của `Repository_alias` |
| Host type | Loại Repository (giá trị của `host_type`) |
| Default Branch | Branch mặc định của repository (giá trị của `default_branch`) |
| Repository url | Repository url (giá trị của `repo_url_hash` đã được giải mã) |
| Status | Trạng thái hiện tại |
| Created At | Thời điểm tạo |
| Created By | Người tạo |
| Updated At | Thời điểm cập nhật gần nhất |
| Updated By | Người cập nhật gần nhất |

Quy tắc:
- cho phép hiển thị chi tiết cho repository đã bị xóa(xóa mềm)

## 6. Quy tắc kiểm tra dữ liệu

### 6.1. Validation phía frontend

Frontend cần kiểm tra sớm các trường cơ bản để cải thiện UX, bao gồm tối thiểu:

- bắt buộc nhập `project_id`
- bắt buộc nhập `repo_name_masked`
- không cho phép chỉ nhập khoảng trắng cho `repo_name_masked`
- bắt buộc nhập `host_type`
- không cho phép chỉ nhập khoảng trắng cho `host_type`

Frontend validation không thay thế backend validation.

### 6.2. Validation phía backend

Backend là nơi bắt buộc kiểm tra cuối cùng cho toàn bộ rule nghiệp vụ.

Backend cần kiểm tra tối thiểu:

- Repository tồn tại hay không
- Repository đã bị soft delete hay chưa
- `project_id` hợp lệ hay không
- `repo_name_masked` hợp lệ hay không
- `host_type` hợp lệ hay không
- duplicate theo cặp (`project_id`, `repo_name_masked`)
- danh sách Team gửi lên có hợp lệ hay không theo dữ liệu hiện có

## 7. Quy tắc phân quyền

Backend bắt buộc kiểm tra quyền cho từng API / action.

Không được chỉ ẩn button ở frontend rồi coi là đã bảo vệ đủ.

Các action cần được bảo vệ riêng:

- View Repository list
- View Repository detail
- Create Repository
- Update Repository
- Delete Repository

Tên quyền cụ thể cần tuân theo convention phân quyền hiện có của Repository.

Nếu user không có quyền, hệ thống trả lỗi phù hợp theo chuẩn hiện có của Repository.

## 8. UI yêu cầu

## 8.1. Màn hình danh sách Repository

Màn hình Repository Management cần có tối thiểu:

- Tiêu đề màn hình: `Repository Management`
- Bảng danh sách Repository
- Nút tạo mới Repository
- Action View
- Action Edit
- Action Delete
- Hiển thị trạng thái loading khi đang tải dữ liệu
- Hiển thị empty state khi chưa có Repository nào
- Hiển thị thông báo lỗi khi tải dữ liệu thất bại

Đề xuất hành vi UI:

- Click `Create` mở form tạo mới
- Click `View` mở màn chi tiết Repository
- Click `Edit` mở form cập nhật Repository
- Click `Delete` mở hộp thoại confirm trước khi xóa mềm

### 8.2. Màn hình chi tiết Repository

Màn detail cần có tối thiểu:

- Tiêu đề hoặc header thể hiện Repository Name
- Thông tin Project
- Thông tin Host Type
- Thông tin Default branch
- Thông tin Repository url
- Trạng thái Status
- Thông tin audit cơ bản: created/updated
- Nút Back hoặc Close
- Nút Edit nếu user có quyền cập nhật
- Nút Delete nếu user có quyền xóa

Màn detail có thể triển khai dưới dạng page riêng, drawer hoặc modal, nhưng cần thống nhất theo pattern UI hiện có của hệ thống.

### 8.3. Form tạo / cập nhật Repository

Form tạo và form cập nhật cần có tối thiểu các field sau:

| Field | Bắt buộc | Ghi chú |
| --- | --- | --- |
| Project alias | Có | Chọn từ danh sách Project hiện có, map với `project_alias` |
| Repository name | Có | Map với `repo_name_masked` |
| Host type | có | Map với `host_type` |
| Default branch | Không | Map với `default_branch` |
| Repository url | Không | Map với `repo_url_hash` |

Lưu ý: 
- giá trị hiển thị Repository url là giá trị map với `repo_url_hash` và đã được giải mã

### 8.4. Validation message đề xuất

| Trường hợp | Message |
| --- | --- |
| Repository name trống | Repository name is required. |
| Repository name bị trùng trong cùng Project | Repository name already exists in selected Project. |
| Repository không tồn tại | Repository does not exist. |
| Project alias trống | Project alias is required. |
| Host type trống | Host type is required. |
| Không có quyền | You do not have permission to perform this action. |

Message thực tế cần tuân theo convention hiện có của project.

## 9. API requirement

### 9.1. Phương châm API

- API version cơ bản dùng URL version `/api/v1/`.
- Không được tự ý tạo endpoint nếu project hiện tại đã có pattern route khác.
- Cần kiểm tra framework, route convention, response convention và error format hiện có của project trước khi implement chính thức.

### 9.2. Danh sách API tối thiểu

Endpoint mục tiêu ở mức requirement như sau:

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | `/api/v1/repositories` | Lấy danh sách Repository |
| GET | `/api/v1/repositories/{repository_id}` | Lấy chi tiết Repository |
| POST | `/api/v1/repositories` | Tạo Repository |
| PUT | `/api/v1/repositories/{repository_id}` | Cập nhật Repository |
| PUT | `/api/v1/repositories/{repository_id}/delete` | Xóa mềm Repository |

Nếu codebase hiện tại có pattern route khác nhưng tương đương về chức năng, cần bám theo pattern hiện có thay vì tự tạo convention mới.



### 9.4. Quy tắc xử lý API

- API list chỉ trả về Project chưa bị soft delete.
- API detail chỉ trả về Project còn hiệu lực.
- API update không cho cập nhật Project đã bị soft delete.
- API delete thực hiện soft delete, không xóa cứng.
- Backend phải xử lý lưu Project và mapping Team trong cùng flow transaction nếu project hiện tại đang dùng transaction cho các thao tác tương tự.

## 10. Mã lỗi và xử lý lỗi

### 10.1. Phương châm mã lỗi

| HTTP | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| 400 | Thiếu hoặc sai input | Thiếu mục bắt buộc, định dạng sai |
| 401 | Chưa xác thực | Hết phiên đăng nhập |
| 403 | Thiếu quyền | Không có quyền thực hiện action |
| 404 | Không có đối tượng | Project không tồn tại hoặc không còn khả dụng |
| 409 | Xung đột dữ liệu | Trùng `repo_name_masked` trong cùng customer |
| 422 | Vi phạm rule nghiệp vụ | Dữ liệu hợp lệ về format nhưng vi phạm business rule khác |
| 429 | Rate limit | Gọi API quá nhiều |
| 500 | Lỗi server | Lỗi không dự kiến |
| 503 | Lỗi hệ thống liên kết | Service liên quan unavailable |

### 10.2. Mapping lỗi đề xuất

- Thiếu `project_id`, thiếu `repo_name_masked`, sai format request: `400`
- Không có quyền: `403`
- Repository không tồn tại hoặc đã bị soft delete: `404`
- Trùng `repo_name_masked` trong cùng `project_id`: `409`
- Vi phạm rule nghiệp vụ khác theo convention hệ thống: `422`

Error response format thực tế cần bám theo chuẩn hiện có của project.

## 11. Hành vi sau thao tác

### 11.1. Sau khi tạo thành công

- Hiển thị message thành công theo convention hiện có.
- Điều hướng hoặc reload dữ liệu theo pattern UI hiện có của hệ thống.

### 11.2. Sau khi cập nhật thành công

- Hiển thị message thành công theo convention hiện có.
- Màn list/detail phải phản ánh dữ liệu mới nhất.

### 11.3. Sau khi xóa thành công

- Hiển thị message thành công theo convention hiện có.
- Bản ghi không còn xuất hiện ở danh sách mặc định.
- Nếu user đang ở màn detail của Project vừa xóa, UI cần điều hướng về list hoặc trạng thái phù hợp theo pattern hiện có của hệ thống.

## 12. Ghi chú implement

- Cần kiểm tra migration / schema / source code hiện có để bám đúng enum, route pattern, permission key, response format và transaction convention của hệ thống.
- Không tự ý thay đổi schema ngoài phần đã được approval.
- `project_id` là khóa tham chiếu duy nhất cho Repository.
- `project_alias` phải được join từ `tbl_dim_project`, không lấy từ input FE hay cache tạm.
- Tên hiển thị ở UI là `Project name`, nhưng field dữ liệu tương ứng trong DB là `project_alias` từ `tbl_dim_project`.
- Tên hiển thị ở UI là `Repository name`, nhưng field dữ liệu tương ứng trong DB là `repo_name_masked`.
- Tên hiển thị ở UI là `Host type`, nhưng field dữ liệu tương ứng trong DB là `host_type`.
- Tên hiển thị ở UI là `Default branch`, nhưng field dữ liệu tương ứng trong DB là `default_branch`.
- Tên hiển thị ở UI là `Repository url`, nhưng field dữ liệu tương ứng trong DB là `repo_url_hash`.
