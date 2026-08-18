# 02_reference-extracts

## Phase 1 Intake Note

This wireframe draft was used as a Phase 1 reference input for `spec-pack.md` on 2026-06-11.
It remains reference material only. The canonical ROLE specification is `spec-pack.md`.
Items not explicitly promoted into `spec-pack.md` remain draft/reference and require Pack 26 or human confirmation before implementation.

## UI Wireframe Draft

> Status: Draft by Human
> Purpose: Input for Phase 1 Spec Pack update
> Note: Nội dung dưới đây là wireframe nháp, chưa tự động được xem là specification cuối cùng.

## Screen: QUẢN LÝ VAI TRÒ

### Route / URL
- TBD / chưa xác định

### Purpose
- Mục đích màn hình:
hiển thị danh sách role, có thể xem chi tiết, sửa, xóa, tạo mới role

### Layout Draft

# WIREFRAME: CHỨC NĂNG QUẢN LÝ VAI TRÒ (ROLE MANAGEMENT)

Tài liệu này mô tả cấu trúc wireframe (giao diện dạng văn bản/ký tự) cho chức năng Quản lý vai trò (Role Management), bao gồm 3 màn hình/giao diện chính theo yêu cầu.

---

## 1. MÀN HÌNH DANH SÁCH VAI TRÒ (ROLE LIST SCREEN)

**Mô tả:** Màn hình chính hiển thị danh sách các vai trò trong hệ thống, hỗ trợ tìm kiếm và phân trang.

```
[ Thanh Điều Hướng Hệ Thống / Sidebar ]
--------------------------------------------------------------------------------------------------
HỆ THỐNG > QUẢN LÝ VAI TRÒ

+----------------------------------------------------------------------------------------------+
|  [ Tìm kiếm theo tên...               ]  [ Tìm kiếm ]                       [+ Thêm Vai Trò] |
+----------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------+
| Tên vai trò (Role Name)       | Ngày tạo (Create Day)   | Hành động (Action)                 |
+-------------------------------+-------------------------+------------------------------------+
| Administrator                 | 10/05/2026              | [Xem chi tiết]  [Sửa]  [Xóa]       |
| Editor                        | 12/05/2026              | [Xem chi tiết]  [Sửa]  [Xóa]       |
| Moderator                     | 15/05/2026              | [Xem chi tiết]  [Sửa]  [Xóa]       |
| Viewer                        | 20/05/2026              | [Xem chi tiết]  [Sửa]  [Xóa]       |
| Support Staff                 | 01/06/2026              | [Xem chi tiết]  [Sửa]  [Xóa]       |
+----------------------------------------------------------------------------------------------+
| Hiển thị 1-5 trên tổng số 25 mục                     [Đầu] [<]  1  [2]  3  4  5  [>] [Cuối]  |
+----------------------------------------------------------------------------------------------+
```

### Các thành phần chi tiết:
* **Thanh tìm kiếm (Search Box):** Ô nhập dữ liệu dạng text để tìm kiếm theo `role_name`. Bên cạnh là nút "Tìm kiếm".
* **Nút Thêm vai trò:** Để mở dialog tạo mới vai trò (nếu cần mở rộng).
* **Bảng danh sách (Table):** Gồm 3 cột chính xác theo yêu cầu:
    * `role_name`: Tên của vai trò.
    * `create_day`: Ngày tạo định dạng DD/MM/YYYY.
    * `action`: Chứa các nút thao tác nhanh bao gồm *Xem chi tiết* (để mở Dialog chi tiết), *Sửa*(để mở Dialog chi tiết) và *Xóa* (để mở Dialog xác nhận xóa).
* **Phân trang (Pagination):** Hiển thị số lượng bản ghi và các nút chuyển trang nhanh.

---

## 2. DIALOG CHI TIẾT VAI TRÒ (ROLE DETAIL DIALOG)

**Mô tả:** Hộp thoại xuất hiện khi người dùng nhấn vào nút "Xem chi tiết" hoặc "Sửa" ở màn hình danh sách.

```
+---------------------------------------------------------------------------------------+
| CHI TIẾT VAI TRÒ                                                                  [X] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  Tên vai trò (Role Name)                                                              |
|  +---------------------------------------------------------------------------------+  |
|  | Administrator                                                                   |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
|  Mô tả (Description)                                                                  |
|  +---------------------------------------------------------------------------------+  |
|  | Quản trị viên toàn quyền hệ thống, có khả năng quản lý cấu hình, người dùng,     |  |
|  | bảo mật và xem toàn bộ lịch sử hệ thống.                                        |  |
|  |                                                                                 |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
|  Ngày tạo (Create Day)                                                                |
|  +---------------------------------------------------------------------------------+  |
|  | 10/05/2026                                                                      |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
|  Ngày cập nhật (Update Day)                                                           |
|  +---------------------------------------------------------------------------------+  |
|  | 11/05/2026                                                                      |  |
|  +---------------------------------------------------------------------------------+  |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|                                                           [ Cập nhật ]    [ Đóng ]    |
+---------------------------------------------------------------------------------------+
```

### Các thành phần chi tiết:
Form thông tin được thiết kế rõ ràng gồm các trường dữ liệu:
* `role_name`: Ô nhập/Hiển thị tên vai trò.
* `descript` (Description): Ô nhập văn bản nhiều dòng (Textarea) để mô tả chi tiết quyền hạn của vai trò.
* `create_day`: Ô hiển thị ngày tạo (ở chế độ Read-only/Disabled không cho sửa).
* `update_day`: Ô hiển thị ngày tạo (ở chế độ Read-only/Disabled không cho sửa).
* **Nút điều hướng:** Nút [X] ở góc phải hoặc nút [Đóng] dưới cùng để tắt dialog. Nút [Cập nhật] nếu ở chế độ chỉnh sửa.

---

## 3. DIALOG XÁC NHẬN XÓA VAI TRÒ (DELETE CONFIRMATION DIALOG)

**Mô tả:** Hộp thoại cảnh báo xuất hiện khi người dùng nhấn vào nút "Xóa" ở cột Action nhằm tránh việc xóa nhầm dữ liệu.

```
+---------------------------------------------------------------------------------------+
| XÁC NHẬN XÓA VAI TRÒ                                                              [X] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [!] Bạn có chắc chắn muốn xóa vai trò "Administrator" không?                        |
|                                                                                       |
|  Lưu ý: Hành động này không thể hoàn tác và có thể ảnh hưởng đến các tài khoản        |
|  đang được gán vai trò này.                                                          |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|                                                               [ Xóa ]     [ Hủy bỏ ]  |
+---------------------------------------------------------------------------------------+
```

### Các thành phần chi tiết:
* **Tiêu đề:** Cảnh báo rõ ràng hành động xóa.
* **Nội dung thông báo:** Hiển thị rõ tên vai trò sắp bị xóa (`role_name`) kèm theo dòng lưu ý rủi ro.
* **Nút chức năng:**
    * Nút **[ Xóa ]**: Thường có màu đỏ (Danger color) để biểu thị hành động có tính phá hủy. Khi nhấn sẽ thực hiện xóa và đóng dialog.
    * Nút **[ Hủy bỏ ]** hoặc **[X]**: Đóng dialog và giữ nguyên dữ liệu, không thực hiện xóa.

----

## 4. DIALOG TẠO MỚI VAI TRÒ (ROLE DETAIL DIALOG)

**Mô tả:** Hộp thoại xuất hiện khi người dùng nhấn vào nút "Xem chi tiết" hoặc "Sửa" ở màn hình danh sách.

```
+---------------------------------------------------------------------------------------+
| TẠO MỚI VAI TRÒ                                                                   [X] |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  Tên vai trò (Role Name)        [________________________]                            |
|                                                                                       |
|  Mô tả (Description)            +-----------------------------------------+           |
|                                 | Nhập mô tả chi tiết cho vai trò này...  |           |
|                                 |                                         |           |
|                                 |                                         |           |
|                                 |                                       //|           |
|                                 +-----------------------------------------+           |
|                                                                                       |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|                                                           [ Tạo mới ]    [ Đóng ]     |
+---------------------------------------------------------------------------------------+
```

### Các thành phần chi tiết:
Form thông tin được thiết kế rõ ràng gồm các trường dữ liệu:
* `role_name`: Ô nhập/Hiển thị tên vai trò.
* `descript` (Description): Ô nhập văn bản nhiều dòng (Textarea) để mô tả chi tiết quyền hạn của vai trò.
* **Nút điều hướng:** Nút [X] ở góc phải hoặc nút [Đóng] dưới cùng để tắt dialog. Nút [Tạo mới] thực hiện thêm dữ liệu vào database.