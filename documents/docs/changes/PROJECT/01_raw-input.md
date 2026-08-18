# Requirement: CRUD Project Management

## 1. Bối cảnh

Cần xây dựng màn hình quản lý Project trong hệ thống hiện có.

Quy tắc quan hệ dữ liệu:

- 1 Project thuộc đúng 1 Customer.
- 1 Project có thể liên kết nhiều Team.
- Quan hệ Project - Team là quan hệ nhiều-nhiều, lưu qua bảng trung gian `tbl_project_team`.

## 2. Mục tiêu

Xây dựng chức năng CRUD cho Project, bao gồm:

- Xem danh sách Project
- Tạo mới Project
- Xem chi tiết Project
- Cập nhật Project
- Xóa Project theo cơ chế soft delete

## 3. Phạm vi chức năng

### 3.1. Trong phạm vi

Chức năng cần hỗ trợ:

1. Hiển thị danh sách Project hiện có.
2. Tạo mới Project.
3. Xem chi tiết Project.
4. Cập nhật thông tin Project.
5. Xóa Project theo cơ chế soft delete.
6. Validate dữ liệu nhập ở frontend và backend.
7. Hiển thị thông báo thành công / thất bại theo convention hiện có của project.
8. Lưu dữ liệu Project vào bảng `tbl_dim_project`.
9. Lưu mapping Team của Project vào bảng trung gian `tbl_project_team`.
10. Kiểm tra quyền cho từng API / action.

### 3.2. Ngoài phạm vi

Các nội dung sau hiện chưa nằm trong phạm vi requirement này nếu chưa có yêu cầu riêng:

- Khôi phục Project đã bị xóa mềm (restore)
- Quản lý lịch sử thay đổi (change history/audit UI)
- Import/export Project
- Bulk delete / bulk update

## 4. Cấu trúc database

### 4.1. Bảng chính

Bảng chính lưu Project là `tbl_dim_project`.

Các cột chính được sử dụng trong phạm vi chức năng này:

- `project_id`
- `customer_id`
- `project_alias`
- `project_type`
- `risk_level`
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
CREATE TABLE IF NOT EXISTS tbl_dim_project (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES tbl_dim_customer(customer_id),
    project_alias VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),
    risk_level severity_level DEFAULT 'MEDIUM',
    status record_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT uq_project_alias_per_customer UNIQUE (customer_id, project_alias)
);
```

Lưu ý:

- Schema hiện có đã bổ sung cột phục vụ soft delete trong migration/schema của project, do đó chức năng soft delete được phép triển khai theo cấu trúc đã được approval.
- Không tự ý thêm cột mới ngoài schema hiện có nếu chưa có approval.
- Cần kiểm tra migration / schema thực tế để lấy đúng định nghĩa đầy đủ cho `delete_flag`, `deleted_at`, `deleted_by`, enum `record_status`, enum `severity_level`, và cấu trúc bảng `tbl_project_team`.

### 4.2. Bảng liên quan

Cần sử dụng thêm các bảng hiện có trong hệ thống:

- `tbl_dim_customer`: lưu thông tin Customer
- `tbl_project_team`: bảng mapping nhiều-nhiều giữa Project và Team
- Bảng Team thực tế theo schema hiện có của hệ thống

### 4.3. Quy ước dữ liệu soft delete

Khi xóa Project, thực hiện soft delete trên `tbl_dim_project` theo schema hiện có.

Trạng thái sau khi xóa:

- `status` chuyển sang `DELETED`
- cập nhật các cột soft delete như `delete_flag`, `deleted_at`, `deleted_by` theo schema hiện có

Mặc định các API danh sách / chi tiết / cập nhật không xử lý trên Project đã bị soft delete, trừ khi có yêu cầu riêng sau này.

## 5. Quy tắc nghiệp vụ

### 5.1. Danh sách Project

Người dùng có quyền xem Project Management có thể xem danh sách Project.

Danh sách cần hiển thị tối thiểu các cột sau:

| Trường | Mô tả |
| --- | --- |
| Action | Các thao tác được phép: View / Edit / Delete |
| Customer Name | Tên Customer |
| Project Name | Tên Project, map với trường `project_alias` |
| Status | Trạng thái Project |
| Create date | Ngày tạo Project |
| Update date | Ngày cập nhật Project |

Quy tắc dữ liệu danh sách:

- Chỉ hiển thị Project chưa bị soft delete.
- Dữ liệu Project phải join được thông tin Customer name.
- Nếu có mapping Team thì không bắt buộc hiển thị ở list, nhưng cần có ở màn detail.

### 5.2. Tạo Project

Form tạo mới cần có:

- Dropdown chọn `customer`
- Control chọn nhiều `team`
- Ô nhập `project_alias` (label hiển thị ở UI là Project Name)
- Ô nhập/chọn `project_type`
- Ô nhập/chọn `risk_level`

Điều kiện hợp lệ:

- `customer_id` là bắt buộc.
- `project_alias` là bắt buộc.
- `project_alias` không được trống.
- `project_alias` không được chỉ chứa khoảng trắng.
- `project_alias` phải được trim trước khi lưu.
- `project_alias` được xem là trùng khi đồng thời trùng cả:
  - `customer_id`
  - `project_alias`
- Rule duplicate cần áp dụng trên tập dữ liệu Project chưa bị xóa mềm, trừ khi project hiện tại có convention khác đã được áp dụng trong codebase.
- `status` được gán mặc định là `ACTIVE` ngay khi tạo mới.
- Team là quan hệ nhiều-nhiều, do đó có thể chọn nhiều Team cho 1 Project.

Ví dụ hợp lệ:

```text
Project A
Project B
Data Analytics
```

Ví dụ không hợp lệ:

```text
<empty>
"   "
"Project A" nếu trong cùng customer đã tồn tại Project có `project_alias` là "Project A"
```

Kết quả khi tạo thành công:

- Tạo bản ghi mới trong `tbl_dim_project`
- Tạo các bản ghi mapping tương ứng trong `tbl_project_team`
- `status = ACTIVE`
- cập nhật `created_at`, `created_by`, `updated_at`, `updated_by` theo convention hiện có của hệ thống

### 5.3. Cập nhật Project

Cho phép cập nhật các trường sau:

- `customer_id`
- `project_alias`
- danh sách `team_ids`
- `project_type`
- `risk_level`

Điều kiện hợp lệ:

- Project cần cập nhật phải tồn tại và chưa bị soft delete.
- `customer_id` là bắt buộc.
- `project_alias` mới là bắt buộc.
- `project_alias` mới không được trống.
- `project_alias` mới không được chỉ chứa khoảng trắng.
- `project_alias` mới phải được trim trước khi lưu.
- `project_alias` mới không được trùng với Project khác trong cùng `customer_id`.
- Khi cập nhật Team, hệ thống cần đồng bộ lại mapping ở `tbl_project_team` theo danh sách Team được submit từ form.

Quy tắc cập nhật Team:

- Vì Project - Team là nhiều-nhiều, UI phải hỗ trợ chọn nhiều Team.
- Request update gửi danh sách Team hiện tại mong muốn của Project.
- Backend thực hiện đồng bộ mapping theo danh sách được gửi lên.

### 5.4. Xóa Project

Người dùng có quyền xóa Project được phép xóa Project.

Điều kiện cần kiểm tra trước khi xóa:

- Project cần xóa phải tồn tại.
- Project cần xóa chưa bị soft delete.

Cách xử lý khi xóa:

- Không xóa cứng dữ liệu.
- Thực hiện soft delete theo schema hiện có.
- `status` chuyển sang `DELETED`.
- cập nhật `delete_flag`, `deleted_at`, `deleted_by` theo schema hiện có.

### 5.5. Xem chi tiết Project

Người dùng có quyền xem Project có thể xem chi tiết Project.

Màn hình chi tiết cần hiển thị tối thiểu:

| Trường | Mô tả |
| --- | --- |
| Project ID | Mã định danh Project |
| Customer Name | Tên Customer |
| Project Name | Giá trị của `project_alias` |
| Project Type | Loại Project |
| Risk Level | Mức độ rủi ro |
| Status | Trạng thái hiện tại |
| Team List | Danh sách Team đang liên kết |
| Created At | Thời điểm tạo |
| Created By | Người tạo |
| Updated At | Thời điểm cập nhật gần nhất |
| Updated By | Người cập nhật gần nhất |

Quy tắc:

- Không hiển thị detail cho Project đã bị soft delete trong flow thông thường.
- Nếu Project không tồn tại hoặc đã bị xóa mềm, trả lỗi theo chuẩn hiện có của project.

## 6. Quy tắc kiểm tra dữ liệu

### 6.1. Validation phía frontend

Frontend cần kiểm tra sớm các trường cơ bản để cải thiện UX, bao gồm tối thiểu:

- bắt buộc nhập `customer_id`
- bắt buộc nhập `project_alias`
- không cho phép chỉ nhập khoảng trắng cho `project_alias`

Frontend validation không thay thế backend validation.

### 6.2. Validation phía backend

Backend là nơi bắt buộc kiểm tra cuối cùng cho toàn bộ rule nghiệp vụ.

Backend cần kiểm tra tối thiểu:

- quyền truy cập theo từng action
- Project tồn tại hay không
- Project đã bị soft delete hay chưa
- `customer_id` hợp lệ hay không
- `project_alias` hợp lệ hay không
- duplicate theo cặp (`customer_id`, `project_alias`)
- danh sách Team gửi lên có hợp lệ hay không theo dữ liệu hiện có

## 7. Quy tắc phân quyền

Backend bắt buộc kiểm tra quyền cho từng API / action.

Không được chỉ ẩn button ở frontend rồi coi là đã bảo vệ đủ.

Các action cần được bảo vệ riêng:

- View Project list
- View Project detail
- Create Project
- Update Project
- Delete Project

Tên quyền cụ thể cần tuân theo convention phân quyền hiện có của project.

Nếu user không có quyền, hệ thống trả lỗi phù hợp theo chuẩn hiện có của project.

## 8. UI yêu cầu

## 8.1. Màn hình danh sách Project

Màn hình Project Management cần có tối thiểu:

- Tiêu đề màn hình: `Project Management`
- Bảng danh sách Project
- Nút tạo mới Project
- Action View
- Action Edit
- Action Delete
- Hiển thị trạng thái loading khi đang tải dữ liệu
- Hiển thị empty state khi chưa có Project nào
- Hiển thị thông báo lỗi khi tải dữ liệu thất bại

Đề xuất hành vi UI:

- Click `Create` mở form tạo mới
- Click `View` mở màn chi tiết Project
- Click `Edit` mở form cập nhật Project
- Click `Delete` mở hộp thoại confirm trước khi xóa mềm

### 8.2. Màn hình chi tiết Project

Màn detail cần có tối thiểu:

- Tiêu đề hoặc header thể hiện Project Name
- Thông tin Customer
- Thông tin Project Type
- Thông tin Risk Level
- Trạng thái Status
- Danh sách Team liên kết
- Thông tin audit cơ bản: created/updated
- Nút Back hoặc Close
- Nút Edit nếu user có quyền cập nhật
- Nút Delete nếu user có quyền xóa

Màn detail có thể triển khai dưới dạng page riêng, drawer hoặc modal, nhưng cần thống nhất theo pattern UI hiện có của hệ thống.

### 8.3. Form tạo / cập nhật Project

Form tạo và form cập nhật cần có tối thiểu các field sau:

| Field | Bắt buộc | Ghi chú |
| --- | --- | --- |
| Customer name | Có | Chọn từ danh sách Customer hiện có |
| Project name | Có | Map với `project_alias` |
| Team | Không | Control chọn nhiều Team |
| Project type | Không | Theo source dữ liệu/convention hiện có |
| Risk level | Không | Theo enum/convention hiện có |

Lưu ý UI:

- `Project name` là tên hiển thị ở UI, dữ liệu map vào `project_alias`.
- `Team` phải là control hỗ trợ chọn nhiều giá trị.
- Khi ở màn update, form cần load sẵn danh sách Team đã được liên kết.

### 8.4. Validation message đề xuất

| Trường hợp | Message |
| --- | --- |
| Project name trống | Project name is required. |
| Project name bị trùng trong cùng customer | Project name already exists in selected customer. |
| Project không tồn tại | Project does not exist. |
| Customer name trống | Customer name is required. |
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
| GET | `/api/v1/projects` | Lấy danh sách Project |
| GET | `/api/v1/projects/{project_id}` | Lấy chi tiết Project |
| POST | `/api/v1/projects` | Tạo Project |
| PUT | `/api/v1/projects/{project_id}` | Cập nhật Project |
| PUT | `/api/v1/projects/{project_id}/delete` | Xóa mềm Project |

Nếu codebase hiện tại có pattern route khác nhưng tương đương về chức năng, cần bám theo pattern hiện có thay vì tự tạo convention mới.

### 9.3. Contract dữ liệu ở mức tối thiểu

#### API tạo Project

Request body tối thiểu:

```json
{
  "customer_id": "uuid",
  "project_alias": "Project A",
  "project_type": "string",
  "risk_level": "MEDIUM",
  "team_ids": ["uuid-1", "uuid-2"]
}
```

#### API cập nhật Project

Request body tối thiểu:

```json
{
  "customer_id": "uuid",
  "project_alias": "Project A Updated",
  "project_type": "string",
  "risk_level": "HIGH",
  "team_ids": ["uuid-1", "uuid-3"]
}
```

#### API chi tiết Project

Response tối thiểu cần đủ dữ liệu để render màn detail:

```json
{
  "project_id": "uuid",
  "customer_id": "uuid",
  "customer_name": "Customer A",
  "project_alias": "Project A",
  "project_type": "Internal",
  "risk_level": "MEDIUM",
  "status": "ACTIVE",
  "team_ids": ["uuid-1", "uuid-2"],
  "teams": [
    {
      "team_id": "uuid-1",
      "team_name": "Team Alpha"
    },
    {
      "team_id": "uuid-2",
      "team_name": "Team Beta"
    }
  ],
  "created_at": "2026-06-16T10:00:00Z",
  "created_by": "SYSTEM",
  "updated_at": "2026-06-16T10:00:00Z",
  "updated_by": "SYSTEM"
}
```

#### API danh sách Project

Mỗi item tối thiểu cần có:

```json
{
  "project_id": "uuid",
  "customer_name": "Customer A",
  "project_alias": "Project A",
  "status": "ACTIVE",
  "created_at": "2026-06-16T10:00:00Z",
  "updated_at": "2026-06-16T10:00:00Z"
}
```

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
| 409 | Xung đột dữ liệu | Trùng `project_alias` trong cùng customer |
| 422 | Vi phạm rule nghiệp vụ | Dữ liệu hợp lệ về format nhưng vi phạm business rule khác |
| 429 | Rate limit | Gọi API quá nhiều |
| 500 | Lỗi server | Lỗi không dự kiến |
| 503 | Lỗi hệ thống liên kết | Service liên quan unavailable |

### 10.2. Mapping lỗi đề xuất

- Thiếu `customer_id`, thiếu `project_alias`, sai format request: `400`
- Không có quyền: `403`
- Project không tồn tại hoặc đã bị soft delete: `404`
- Trùng `project_alias` trong cùng `customer_id`: `409`
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
- Tên hiển thị ở UI là `Project name`, nhưng field dữ liệu tương ứng trong DB là `project_alias`.
- Team là quan hệ nhiều-nhiều, vì vậy toàn bộ UI/API/backend phải xử lý theo danh sách Team thay vì `team_id` đơn lẻ.
- Clarification from the approved ticket contract: `project_type` is now treated as free-text nullable user input, trimmed before persistence, blank/whitespace-only becomes `null`, and maximum length follows `VARCHAR(100)`. `risk_level` remains the only field aligned to `severity_level`.
