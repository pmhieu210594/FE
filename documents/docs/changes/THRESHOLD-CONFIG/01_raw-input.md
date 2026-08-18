# Raw Input

**Ticket ID**: THRESHOLD-CONFIG
**Create date**: 2026-07-21
**Author**: nvt_dung
**Update date**: 2026-07-21

# TÀI LIỆU YÊU CẦU TÍNH NĂNG (PRD)
## MÀN HÌNH CẤU HÌNH NGƯỠNG ĐIỂM (SCORE THRESHOLD CONFIGURATION)

---

## 1. TỔNG QUAN (OVERVIEW)

### 1.1. Mục đích
Tài liệu này mô tả chi tiết các yêu cầu chức năng, giao diện (UI/UX) và quy tắc nghiệp vụ (business rules) để phát triển **Màn hình Cấu hình Ngưỡng điểm Evaluation/Score**. Màn hình này cho phép Quản trị viên (Admin) tùy chỉnh linh hoạt các dải điểm và nhãn trạng thái tương ứng, phục vụ việc đánh giá, phân loại hệ thống/kết quả tự động.

### 1.2. Mức độ ưu tiên
* **Độ ưu tiên:** High (Cao)
* **Đối tượng sử dụng:** System Administrator, Operations Manager.

---

## 2. NGƯỠNG ĐIỂM MẶC ĐỊNH (DEFAULT THRESHOLD CONFIG)

Hệ thống được khởi tạo ban đầu với 5 mức điểm chuẩn như sau:

| Dải điểm (From - To) | Trạng thái / Nhãn (Label) | Mã trạng thái (Code / Level) | Màu sắc gợi ý (Badge Color) |
| :--- | :--- | :--- | :--- |
| **90 - 100** | Excellent | `EXCELLENT` | Xanh lá đậm (Success / Dark Green) |
| **75 - 89** | Good | `GOOD` | Xanh lá nhạt / Xanh dương (Info / Light Green) |
| **60 - 74** | Warning | `WARNING` | Vàng / Cam nhạt (Warning / Yellow) |
| **40 - 59** | Risky | `RISKY` | Cam đậm (Orange) |
| **0 - 39** | Critical | `CRITICAL` | Đỏ (Danger / Red) |

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1. Danh sách tính năng chính (Feature List)

1. **Xem danh sách ngưỡng điểm hiện tại (View Configurations):**
   * Hiển thị danh sách các ngưỡng điểm đang hoạt động (`delete_flag = '0'`) theo thứ tự giảm dần hoặc tăng dần.
   * Hiển thị rõ: ID, Giá trị từ (From), Giá trị đến (To), Nhãn trạng thái (Label), Mã trạng thái (Code/Key), Màu hiển thị.

2. **Chế độ Chỉnh sửa & Chế độ Xem (View/Edit Mode Paradigm):**
   * **Mặc định (View Mode):** Dữ liệu dạng Read-only (chỉ xem), hiển thị dạng Badge/Tag đẹp mắt. Chỉ xuất hiện duy nhất 1 nút **`[Chỉnh sửa]`** ở góc phải màn hình.
   * **Khi kích hoạt Chỉnh sửa (Edit Mode):** 
     * Hàng loạt ô nhập liệu (Inputs/Selects) được mở ra trực tiếp trên Bảng (In-line Editing) hoặc mở Modal/Drawer tùy theo thiết kế UI. Chỉ mở cho các ngưỡng điểm đang hoạt động (`delete_flag = '0'`)
     * Nút **`[Chỉnh sửa]`** ẩn đi, thay thế bằng nhóm nút: **`[Lưu thay đổi]`** (Primary) và **`[Hủy bỏ]`** (Outline / Secondary).

3. **Chức năng của nút `[Hủy bỏ]` (Cancel & Revert):**
   * **Chỉ hiển thị ở Edit Mode.**
   * Khi bấm **`[Hủy bỏ]`**:
     * Hệ thống **hoàn tác (revert)** toàn bộ các chỉnh sửa tạm thời trên UI, khôi phục lại chính xác danh sách dải điểm gốc ban đầu trước khi sửa.
     * Màn hình tự động thoát Edit Mode và quay trở lại **View Mode**.
     * Không phát sinh bất kỳ API call nào xuống Backend.

4. **Thao tác Chỉnh sửa chi tiết (Detailed Editing Actions):**
   * **Đổi dải điểm:** Cho phép thay đổi điểm `From` và `To`.
   * **Đổi tên Nhãn:** Sửa tên `Label` hiển thị (Ví dụ: "Risky" -> "Rủi ro cao").
   * **Đổi Mã Code:** Cho phép sửa `Code` (chỉ áp dụng đối với cấu hình mới hoặc chưa có ràng buộc đặc biệt).
   * **Đổi Màu sắc:** Cho phép chọn lại màu đại diện (Color Picker).

5. **Thêm mới ngưỡng điểm (Add New Threshold):**
   * Cho phép chèn thêm một ngưỡng điểm mới vào danh sách ở Edit Mode (chưa có `id` khi gửi lên Backend).

6. **Xóa ngưỡng điểm - Mềm / Logic (Soft Delete Threshold):**
   * Cho phép xóa một dải điểm khỏi cấu hình hiện tại ở Edit Mode.
   * Khi thực hiện lưu, Backend sẽ **xóa mềm (Soft Delete)** bằng cách cập nhật cờ `delete_flag = '1'` cho bản ghi tương ứng trong Cơ sở dữ liệu thay vì xóa cứng (`DELETE FROM`).

---

### 3.2. Quy tắc Validation & Kiểm tra dữ liệu (Validation Rules)

Hệ thống **BẮT BUỘC** thực hiện validation dữ liệu ngay tại Client (Frontend) và xác thực lại tại Server (Backend) trước khi cho phép lưu:

* **Tính liên tục & Không khoảng trống (No Gaps):**
  * Dải điểm của các bản ghi đang hoạt động (`delete_flag = '0'`) phải phủ kín toàn bộ khoảng từ **0 đến 100**. Không được có "khoảng trống" (gap) giữa các dải (Ví dụ: 0-39, 45-100 là KHÔNG hợp lệ vì thiếu 40-44).
* **Không chồng lấp (No Overlap):**
  * Các khoảng điểm không được đè lên nhau (Ví dụ: 0-40 và 40-100 là đè nhau ở điểm 40).
* **Giá trị giới hạn:**
  * Giá trị nhỏ nhất toàn hệ thống = `0`.
  * Giá trị lớn nhất toàn hệ thống = `100`.
  * Điểm bắt đầu phải nhỏ hơn hoặc bằng điểm kết thúc (`From <= To`).
* **Trường dữ liệu bắt buộc & Duy nhất:**
  * Nhãn (Label) và Mã (Code) không được để trống.
  * Mã (Code) phải duy nhất (Unique) đối với các bản ghi đang hoạt động (`delete_flag = '0'`), viết hoa, không chứa khoảng trắng hoặc ký tự đặc biệt.
* **Quy tắc Duy nhất Mã khi Xóa Mềm (Unique Constraint Handling):**
  * Do CSDL lưu vết bằng xóa mềm (`delete_flag = '1'`), index hoặc logic kiểm tra trùng mã `Code` tại Backend chỉ tính trên tập dữ liệu đang hoạt động (`WHERE delete_flag = '0'`). Lịch sử dữ liệu cũ gắn với bản ghi đã ẩn (`delete_flag = '1'`) vẫn được bảo lưu toàn vẹn.

---

## 4. LUỒNG XỬ LÝ VÀ THIẾT KẾ KỸ THUẬT (TECHNICAL DESIGN & FLOW)

### 4.1. Vai trò của cột "Mã Code" (Code / Key)
* **Phân tách giữa UI và Logic System:** `Code` là hằng số cố định dùng trong câu lệnh `IF/ELSE`, Database Query, và kết nối API. `Label` chỉ phục vụ mục đích hiển thị cho người dùng.
* **Hỗ trợ Đa ngôn ngữ (Multilingual/I18n):** Giúp hệ thống đổi ngôn ngữ giao diện (Việt, Anh, Nhật...) mà không làm gãy logic xử lý ở Backend.
* **An toàn khi đổi tên Label:** Giúp Admin thoải mái sửa tên nhãn (ví dụ: "Risky" -> "Rủi ro cao") mà không gây lỗi thuật toán.

---

### 4.2. Luồng thao tác Giao diện Chỉnh sửa (UI State & Edit Flow)

1. **Trạng thái 1: Xem (Read-only State)**
   * Người dùng truy cập màn hình, toàn bộ dữ liệu ở dạng hiển thị (Text / Color Badges).
   * Nút thao tác chính trên Header: **`[Chỉnh sửa]`**.

2. **Trạng thái 2: Chỉnh sửa (Editing State)**
   * Khi bấm **`[Chỉnh sửa]`**:
     * Tất cả các dòng chuyển sang dạng Input Form (In-line Edit).
     * Nút **`[Chỉnh sửa]`** ẩn đi, thay bằng 3 nút: **`[Lưu thay đổi]`** (Primary), **`[Hủy bỏ]`** (Secondary / Outline) và **`[+ Thêm dải điểm]`** 
     * Cột Thao tác hiển thị nút **`[Xóa]`** (Icon thùng rác) cho từng dòng.
   * Nếu người dùng bấm **`[Hủy bỏ]`**: Hệ thống hoàn tác tất cả các thay đổi tạm thời trên UI, quay về Trạng thái Xem.

---

### 4.3. Chiến lược Cập nhật Dữ liệu Backend (Soft Delete & Upsert)

Backend áp dụng cơ chế **Soft Delete & Batch Update** trong 1 Database Transaction (`@Transactional`):

#### Quy trình xử lý tại Backend:
1. **Bước 1: Validation Request Payload:**
   * Kiểm tra dải điểm của Payload gửi lên phải phủ kín `0 - 100`, không bị hổng (Gap) hoặc đè (Overlap).
   * Kiểm tra trùng lặp `Code` giữa các item trong Payload.
2. **Bước 2: Lấy dữ liệu đang hoạt động từ Database:**
   * Truy vấn danh sách `existing_active_thresholds` từ DB (`WHERE delete_flag = '0'`).
3. **Bước 3: Thực thi Xóa mềm (Soft Delete):**
   * Tìm các `id` có trong DB (`delete_flag = '0'`) nhưng **KHÔNG** xuất hiện trong Payload gửi lên.
   * Thực hiện Cập nhật cờ xóa mềm: `UPDATE tbl_score_thresholds SET delete_flag = '1', updated_at = NOW() WHERE id IN (... deleted_ids ...)`.
4. **Bước 4: Thực thi Cập nhật & Thêm mới (Update / Insert):**
   * **Cập nhật (UPDATE):** Với các item có `id` trùng khớp, cập nhật thông tin mới và đảm bảo `delete_flag = '0'`.
   * **Thêm mới (INSERT):** Với các item không có `id` (mới thêm từ UI), chèn bản ghi mới với `delete_flag = '0'`.
5. **Bước 5: Commit Transaction** và trả kết quả thành công cho Client.

---

### 4.4. Dữ liệu Request/Response (API Schema)

**Endpoint:** `PUT /api/v1/score-thresholds`

**JSON Payload Sample:**
```json
{
  "thresholds": [
    {
      "id": 1,
      "code": "EXCELLENT",
      "label": "Excellent",
      "min_score": 90,
      "max_score": 100,
      "color": "#10B981"
    },
    {
      "id": 2,
      "code": "GOOD",
      "label": "Good",
      "min_score": 75,
      "max_score": 89,
      "color": "#3B82F6"
    },
    {
      "id": 3,
      "code": "WARNING",
      "label": "Warning",
      "min_score": 60,
      "max_score": 74,
      "color": "#F59E0B"
    },
    {
      "id": 4,
      "code": "RISKY",
      "label": "Risky",
      "min_score": 40,
      "max_score": 59,
      "color": "#F97316"
    },
    {
      "code": "CRITICAL",
      "label": "Critical",
      "min_score": 0,
      "max_score": 39,
      "color": "#EF4444"
    }
  ]
}
```

---

## 5. YÊU CẦU GIAO DIỆN NGUỜI DÙNG (UI/UX REQUIREMENTS)

### 5.1. Bố cục màn hình (Screen Layout)

Lưu ý: tất cả label hiển thị được áp dụng đã ngôn ngữ I18n như hệ thống hiện có

1. **Header Block:**
   * Tiêu đề màn hình: **"Cấu hình Ngưỡng điểm Đánh giá"**.
   * Mô tả ngắn: *"Tùy chỉnh dải điểm và phân loại trạng thái đánh giá cho hệ thống."*
   * Nhóm nút thao tác chính:
     * *Khi ở Chế độ Xem:* `[Chỉnh sửa]` (Primary).
     * *Khi ở Chế độ Sửa:* `[Lưu thay đổi]` (Primary) | `[Hủy bỏ]` (Outline) | `[+ Thêm ngưỡng điểm] `.

2. **Visual Progress Bar (Thanh xem trước dải điểm):**
   * Thanh Slider/Progress bar tổng quan thể hiện thị giác dải điểm từ 0 đến 100%, tự động chia màu tương ứng theo cấu hình bên dưới. Cập nhật realtime khi người dùng gõ thay đổi dải điểm ở chế độ Edit.

3. **Data Table / Dynamic Form:**
    * **Cột 1:** Thao tác (Ẩn ở chế độ View / Nút Xóa ở chế độ Edit)
    * **Cột 2:** Trạng thái / Nhãn (`Label` - Text ở chế độ View / Input Text ở chế độ Edit)
    * **Cột 3:** Mã Code (`Code` - Badge ở chế độ View / Input Text ở chế độ Edit)
    * **Cột 4:** Dải điểm (`From` - `To` dạng Text ở chế độ View / 2 Input Number ở chế độ Edit)
    * **Cột 5:** Màu hiển thị (Color Badge ở chế độ View / Color Picker ở chế độ Edit)
    * **Cột 6:** Trạng thái (ACTIVE/DELETE)
---
