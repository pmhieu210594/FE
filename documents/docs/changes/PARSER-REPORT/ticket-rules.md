# TICKET RULES – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Overview

Report parser được sử dụng để đọc và phân tích nội dung từ file `report.md`, chuyển đổi dữ liệu markdown thành cấu trúc có thể xử lý và kiểm tra.

Parser tập trung vào:

* Hiểu cấu trúc tài liệu
* Trích xuất nội dung theo từng section
* Đánh giá mức độ đầy đủ và chất lượng nội dung

---

## 2. Parser Characteristics

### 2.1 Execution Model

* Parser hoạt động độc lập trên từng input
* Không phụ thuộc trạng thái trước đó
* Kết quả được tạo ra hoàn toàn từ nội dung đầu vào

---

### 2.2 Deterministic Behavior

* Với cùng một nội dung đầu vào, parser luôn trả về cùng một kết quả
* Không phụ thuộc vào môi trường hoặc runtime context

---

### 2.3 Section-driven Parsing

Cấu trúc tài liệu được xác định dựa trên markdown heading:

```text
## Section Name
```

Mỗi section được:

* Nhận diện
* Trích xuất nội dung
* Xử lý riêng biệt

---

## 3. Target Structure

Parser xử lý các section chính trong `report.md`:

* summary
* impact
* review_result
* test_result
* risks
* open_issues
* rollback
* exceptions

Mỗi section được ánh xạ trực tiếp theo key nội bộ của parser.

Rule:

* Case-insensitive
* Không suy đoán từ nội dung

---

## 4. Data Representation

### 4.1 Output Model

Kết quả parser bao gồm:

* Nội dung đã parse theo section (string-based)
* parsedSummary (flatten JSON)
* Danh sách warning / error (ParsingIssue)
* parseStatus:

  * FAILED
  * PARTIAL
  * DRAFT
  * OFFICIAL
* artifact_status (present / invalid / missing)


---

### 4.2 Data Format

* Nội dung được giữ nguyên ý nghĩa gốc
* Có thể được chuẩn hóa về format (whitespace, line break)

---

## 5. Parsing Flow

```text
report.md
 → đọc nội dung
 → xác định các section
 → trích xuất nội dung từng section
 → chuẩn hóa dữ liệu
 → kiểm tra nội dung
 → xây dựng kết quả
```

---

## 6. Normalization

Quá trình chuẩn hóa bao gồm:

* Loại bỏ khoảng trắng dư thừa
* Chuẩn hóa line break
* Loại bỏ dòng trống không cần thiết

---

## 7. Validation

### 7.1 Section Presence

* Kiểm tra sự tồn tại của các section chính
* Ghi nhận trường hợp thiếu section

---

### 7.2 Content Completeness

* Kiểm tra section có nội dung hay không
* Phân biệt giữa:

  * nội dung hợp lệ
  * nội dung placeholder
  * nội dung rỗng

---

### 7.3 Placeholder Detection

Các giá trị được xem là placeholder:

* `TBD`
* `TODO`
* `---`
* `<...>`
* chuỗi rỗng hoặc chỉ chứa khoảng trắng

---

### 7.4 Content Quality

* Đánh giá nội dung có đủ thông tin hay không
* Xác định các section chưa được hoàn thiện

---

## 8. Warning & Result Handling

### 8.1 Warning

Các trường hợp tạo warning:

* Section bị thiếu
* Section rỗng
* Section chứa placeholder
* Nội dung không đầy đủ

---

### 8.2 Result Structure

Parser trả về:

* parsedSummary (JSON)
* warnings (list)
* errors (list)
* parseStatus (FAILED / PARTIAL / DRAFT / OFFICIAL)

Lưu ý:

* Parser không trả về validation result dạng boolean
* Parser không thực hiện business validation
* Parser đóng vai trò extract + summarize + emit signal (warning/error)

---

## 9. Performance

* Parser xử lý theo từng dòng nội dung
* Độ phức tạp tuyến tính theo kích thước file

---

## 10. Testing Expectations

### 10.1 Functional Cases

* Parse đúng tất cả section
* Nhận diện đúng nội dung từng section

---

### 10.2 Validation Cases

* Phát hiện section thiếu
* Phát hiện placeholder
* Phát hiện nội dung rỗng

---

### 10.3 Edge Cases

* File rỗng
* Section bị lặp
* Heading không đúng format

---

## 11. Completion Criteria

Parser được xem là hoàn thành khi:

* Trích xuất đúng toàn bộ cấu trúc tài liệu
* Xác định được các vấn đề trong nội dung
* Trả về kết quả đầy đủ và nhất quán

---

## 12. Principle

Parser tập trung vào việc diễn giải cấu trúc và nội dung của tài liệu, đồng thời cung cấp thông tin đánh giá để hỗ trợ kiểm tra chất lượng.

---

## 13. Parse Mode & Status

Parser sử dụng parse_mode để xác định trạng thái cuối:

* official → OFFICIAL
* default → DRAFT

ParseStatus được xác định theo:

* Có error → FAILED
* Có warning → PARTIAL
* Không warning/error:

  * parseMode = official → OFFICIAL
  * else → DRAFT

