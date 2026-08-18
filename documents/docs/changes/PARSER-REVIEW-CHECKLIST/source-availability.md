# PARSER-REVIEW-CHECKLIST source-availability.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# 1. Mục tiêu

Xác định tính sẵn sàng (availability) và đặc điểm của dữ liệu đầu vào cho parser `review-checklist.md`, nhằm:

* Đảm bảo parser có đủ dữ liệu để hoạt động
* Xác định các trường hợp dữ liệu thiếu hoặc không hợp lệ
* Hỗ trợ thiết kế validation và error handling

---

# 2. Phạm vi

## 2.1 Trong phạm vi

* Input content (markdown dạng string)
* Metadata đi kèm (source_path, parseMode, ticket_id)

---

## 2.2 Ngoài phạm vi

* Không xét nguồn dữ liệu (Git, API, file system)
* Không xét cơ chế thu thập dữ liệu
* Không xét pipeline upstream

---

# 3. Input availability

## 3.1 Content

### Trạng thái có thể xảy ra

| Trạng thái | Mô tả                |
| ---------- | -------------------- |
| Available  | Có nội dung markdown |
| Empty      | Content rỗng         |
| Null       | Không có content     |

---

### Xử lý

| Trạng thái | Hành vi                                                              |
| ---------- | -------------------------------------------------------------------- |
| Available  | Parse bình thường                                                    |
| Empty      | `artifactExists=false`, `artifactStatus="missing"` — không auto-FAILED |
| Null       | Được normalize thành `""`, xử lý như Empty                           |

> parse_status phụ thuộc vào warnings/errors — không tự động là FAILED khi content rỗng.

---

## 3.2 Format

### Trạng thái

| Trạng thái       | Mô tả                |
| ---------------- | -------------------- |
| Valid markdown   | Có thể parse         |
| Invalid markdown | Format không chuẩn   |
| Mixed format     | Kết hợp nhiều format |

---

### Xử lý

* Parser delegate sang `MarkdownParserCore` — cố gắng parse tối đa
* Không fail ngay nếu format không chuẩn
* `MarkdownParserCore` emit warnings/errors nếu cần

---

## 3.3 Required sections

### Trạng thái

| Trạng thái              | Mô tả                                                    |
| ----------------------- | -------------------------------------------------------- |
| Đủ 3 sections           | Heading "SECURITY", "TEST", "PERFORMANCE" đều có nội dung |
| Thiếu ít nhất 1 section | Heading không tồn tại hoặc blank                         |

---

### Xử lý

| Trạng thái              | Hành vi                                             |
| ----------------------- | --------------------------------------------------- |
| Đủ 3 sections           | `requiredFieldsMissing` rỗng                        |
| Thiếu ít nhất 1 section | Warning `required_fields_missing` + ghi vào `requiredFieldsMissing` |

---

## 3.4 Metadata

### ticket_id

| Trạng thái | Mô tả                                                           |
| ---------- | --------------------------------------------------------------- |
| Available  | Infer được từ YAML front matter, source path, hoặc header metadata |
| Missing    | Không infer được từ bất kỳ nguồn nào                            |

---

### Xử lý

| Trạng thái | Hành vi                              |
| ---------- | ------------------------------------ |
| Available  | Gán vào `ticketId`                   |
| Missing    | Warning `ticket_id_missing`          |

### parseMode

| Giá trị     | Hành vi                                    |
| ----------- | ------------------------------------------ |
| `"draft"` (default) | parse_status = DRAFT (nếu không có issues) |
| `"official"`| parse_status = OFFICIAL (nếu không có issues) |

---

# 4. Data completeness

## 4.1 Mức độ đầy đủ

| Thành phần       | Bắt buộc | Ghi chú                             |
| ---------------- | -------- | ----------------------------------- |
| content          | Có       | Null → normalize thành ""           |
| sourcePath       | Không    | Dùng để infer ticket_id             |
| parseMode        | Không    | Default "draft"                     |
| ticket_id        | Không    | Infer từ 3 nguồn, thiếu → warning   |
| sections SECURITY/TEST/PERFORMANCE | Không | Thiếu → warning |

---

## 4.2 Quy tắc

* Thiếu content → `artifactExists=false`, `artifactStatus="missing"`
* Thiếu ticket_id → warning `ticket_id_missing`
* Thiếu required sections → warning `required_fields_missing`

---

# 5. Data reliability

## 5.1 Đặc điểm

* Dữ liệu không đảm bảo format cố định
* Có thể thiếu hoặc không đầy đủ
* Phụ thuộc vào người viết markdown

---

## 5.2 Hệ quả

* Parser phải tolerant với format
* Delegate parsing sang `MarkdownParserCore`
* Không assume cấu trúc cố định

---

# 6. Data variability

## 6.1 Variation có thể xảy ra

* Section heading viết khác nhau (## Security vs ## SECURITY)
* Có hoặc không có YAML front matter

---

## 6.2 Xử lý

* `MarkdownParserCore` normalize headings thành uppercase key
* Section detection check: `sections.get("SECURITY")`, `sections.get("TEST")`, `sections.get("PERFORMANCE")`

---

# 7. Error scenario

## 7.1 Empty content

```text
content = ""
```

→ `artifactExists=false`, `artifactStatus="missing"` (parse_status phụ thuộc warnings/errors)

---

## 7.2 Missing required section

```text
Không có heading "## Security"
```

→ Warning `required_fields_missing`, `requiredFieldsMissing` = `["section:security"]`

---

## 7.3 Missing ticket_id

```text
ticket_id = null (không infer được từ front matter, path, hoặc header)
```

→ Warning `ticket_id_missing`

---

## 7.4 Placeholder detected

```text
Section SECURITY có nội dung "TBD" hoặc "---"
```

→ Warning `placeholder_detected`

---

# 8. Liên hệ với parser

## 8.1 Input

Parser nhận (3 overloads):

```java
parse(String content)
parse(String content, String sourcePath)
parse(String content, String sourcePath, String parseMode)
```

---

## 8.2 Output

Parser trả:

```text
ParsedArtifact (19 fields, bao gồm parsedSummary map)
```

---

# 9. Ràng buộc

* Không giả định input luôn hợp lệ
* Không phụ thuộc nguồn dữ liệu
* Không thay đổi dữ liệu input
* Không bổ sung dữ liệu ngoài parsing

---

# 10. Kết luận

Input của parser:

* Có thể thiếu
* Có thể không chuẩn
* Có thể không đầy đủ

Parser cần:

* Xử lý tolerant (null-safe, delegate sang MarkdownParserCore)
* Áp dụng validation rõ ràng (3 warning codes)
* Trả về kết quả nhất quán qua `ParsedArtifact`
