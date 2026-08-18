# PARSER-REVIEW-CHECKLIST ticket-rules.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# 1. Mục tiêu

Định nghĩa các rule kiểm tra dữ liệu của `review-checklist.md` sau khi được parse, nhằm:

* Đảm bảo chất lượng dữ liệu
* Phát hiện thiếu sót trong review checklist
* Hỗ trợ downstream (Evidence Quality Score, Data Quality)

---

# 2. Phạm vi

## 2.1 Đầu vào

Dữ liệu đầu vào cho rule là:

```text
ParsedArtifact
```

Không làm việc trực tiếp với markdown content

---

## 2.2 Đầu ra

Kết quả:

* `parse_status` (OFFICIAL / DRAFT / PARTIAL / FAILED)
* `warnings` list — `List<ParsingIssue>` với code, severity, message
* `errors` list — `List<ParsingIssue>`
* `requiredFieldsMissing` — `List<String>` (e.g. `["section:security"]`)

---

# 3. Nguyên tắc

* Rule chỉ áp dụng trên dữ liệu đã parse
* Không truy cập markdown raw
* Không truy cập database
* Không thay đổi dữ liệu
* Chỉ kiểm tra và đánh giá

---

# 4. Nhóm rule

## 4.1 Rule về nội dung

### Rule 1: Empty content

**Điều kiện**

```text
content rỗng hoặc null
```

**Kết quả**

```text
artifactExists = false
artifactStatus = "missing"
```

> Không tự động là FAILED — parse_status phụ thuộc warnings/errors

---

## 4.2 Rule về ticket_id

### Rule 2: Missing ticket_id

**Điều kiện**

```text
Không infer được ticket_id từ: YAML front matter, source path, hoặc header metadata
```

**Kết quả**

```text
warnings.add(ParsingIssue(code="ticket_id_missing", severity="warning"))
```

---

## 4.3 Rule về required sections

### Rule 3: Missing required section

**Điều kiện**

```text
sections.get("SECURITY") == null hoặc blank
sections.get("TEST") == null hoặc blank
sections.get("PERFORMANCE") == null hoặc blank
```

**Kết quả**

```text
warnings.add(ParsingIssue(code="required_fields_missing", severity="warning"))
requiredFieldsMissing.add("section:security")  // hoặc "section:test", "section:performance"
```

---

### Rule 4: Placeholder detected

**Điều kiện**

```text
Có MarkdownPlaceholder trong sections (nội dung là "TBD", "---", "TODO", "N/A", "<...>", ...)
```

**Kết quả**

```text
warnings.add(ParsingIssue(code="placeholder_detected", severity="warning"))
```

---

# 5. Xác định parse_status

## 5.1 Nguyên tắc

```text
if errors not empty  → parse_status = FAILED
if warnings not empty → parse_status = PARTIAL
if parseMode = "official" → parse_status = OFFICIAL
else → parse_status = DRAFT
```

---

## 5.2 Thứ tự ưu tiên

| Ưu tiên | Status   | Điều kiện                                      |
| ------- | -------- | ---------------------------------------------- |
| 1 (cao) | FAILED   | Có errors                                      |
| 2       | PARTIAL  | Có warnings (không có errors)                  |
| 3       | OFFICIAL | Không warning/error + parseMode = "official"   |
| 4 (thấp)| DRAFT    | Không warning/error + parseMode ≠ "official"   |

---

# 6. Warning / Error detail

## 6.1 ParsingIssue structure

```java
record ParsingIssue(
    String code,       // e.g. "ticket_id_missing"
    String severity,   // "warning" hoặc "error"
    String message,
    String sourcePath,
    String sectionKey,
    int line
)
```

## 6.2 Warning codes

| Code                     | Điều kiện                                              |
| ------------------------ | ------------------------------------------------------ |
| `ticket_id_missing`      | Không infer được ticket_id                             |
| `required_fields_missing`| Thiếu ≥1 heading section (SECURITY/TEST/PERFORMANCE)   |
| `placeholder_detected`   | Có placeholder token trong sections                    |

> Ngoài ra, `MarkdownParserCore` có thể emit thêm warnings/errors riêng.

---

# 7. Thứ tự áp dụng rule

```text
1. Normalize content (null → "")
2. Delegate sang MarkdownParserCore.parse()
3. Infer ticket_id (3 nguồn)
4. detectMissingFields() (sections SECURITY/TEST/PERFORMANCE)
5. Check placeholder
6. Determine parse_status
7. Build ParsedArtifact + parsedSummary
```

---

# 8. Ví dụ

## 8.1 Case hợp lệ đầy đủ

```text
Content có heading ## Security, ## Test, ## Performance với nội dung
ticket_id inferred từ source path
parseMode = "draft"
```

**Kết quả**

```text
requiredFieldsMissing = []
warnings = []
parse_status = DRAFT
```

---

## 8.2 Case thiếu section

```text
Không có heading ## Performance
```

**Kết quả**

```text
requiredFieldsMissing = ["section:performance"]
warnings = [ParsingIssue(code="required_fields_missing")]
parse_status = PARTIAL
```

---

## 8.3 Case empty content

```text
content = ""
```

**Kết quả**

```text
artifactExists = false
artifactStatus = "missing"
warnings = [ticket_id_missing, required_fields_missing]
parse_status = PARTIAL
```

---

# 9. Ràng buộc

* Không thêm rule ngoài spec
* Không thay đổi dữ liệu ParsedArtifact
* Không phụ thuộc vào external system

---

# 10. Kết luận

Các rule:

* Áp dụng trên `ParsedArtifact`
* Xác định chất lượng dữ liệu
* Thiết lập `parse_status` và `warnings/errors` list

Đảm bảo:

* Logic đơn giản (section-based, không keyword-based)
* Dễ kiểm tra
* Phù hợp với phạm vi parser
