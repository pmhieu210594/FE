# IMPL-PLAN – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Phương châm

* Reuse tối đa:

  * MarkdownParserCore
  * Pattern từ các parser hiện có
* Không thay đổi core architecture
* Implement incremental, có thể test từng bước
* Strict theo spec-pack (không thêm NLP/heuristic ngoài scope)
* Ưu tiên:

  * Deterministic parsing
  * Predictable output

---

## 2. Phương án thay thế và lý do chọn

Tạo:

* ReportMarkdownParser
* Mapping heading → section

**Ưu điểm:**

* Control logic rõ ràng
* Dễ debug
* Align spec
* Không phụ thuộc config phức tạp

---

## 3. Step implement

---

### Step 1 – Tạo skeleton parser

**Thực hiện:**

* Tạo class:

  * ReportMarkdownParser
* Define interface:

  * parse(document)

**Output:**

* Intermediate DTO (raw section map)

**Kiểm chứng:**

* Compile thành công
* Unit test init class

---

### Step 2 – Section mapping

**Thực hiện:**

* Map heading → key:

| Heading          | Key              |
| ---------------- | ---------------- |
| Summary          | summary          |
| Impact           | impact           |
| Review Result    | review_result    |
| Test Result      | test_result      |
| Risks            | risks            |
| Remaining Issues | open_issues      |
| Rollback         | rollback         |
| Exceptions       | exceptions       |

* Normalize:

  * lowercase
  * trim
  * ignore case

**Kiểm chứng:**

* Unit test mapping đúng key
* Case-insensitive test

---

### Step 3 – Extract data

**Thực hiện:**

* Extract nội dung section từ MarkdownParserCore:

| Type | Output |
| ---- | ------ |
| Text | String |

❌ Không convert list → array
❌ Không normalize mixed content

**Kiểm chứng:**

* Test:

  * plain text
  * section tồn tại / không tồn tại

---

### Step 4 – Required field detection

**Required fields:**

ALL_FIELDS:

```
summary
impact
review_result
test_result
risks
open_issues
rollback
exceptions
```

**Thực hiện:**

* Detect missing hoặc empty → generate warning

**Kiểm chứng:**

* Test từng field thiếu
* Multi-missing case

---

### Step 5 – ParseStatus logic

**Enum:**

```
FAILED
PARTIAL
DRAFT
OFFICIAL
```

**Logic:**

```
IF errors → FAILED
ELSE IF warnings → PARTIAL
ELSE IF parseMode == "official" → OFFICIAL
ELSE → DRAFT
```

**Lưu ý:**

* Không dùng missingRequiredFields trực tiếp để set status
* missing fields chỉ tạo warning

---

### Step 6 – Build parsedSummary

**Thực hiện:**

Construct JSON:

```
{
  summary: string,
  impact: string,
  review_result: string,
  test_result: string,
  risks: string,
  open_issues: string,
  rollback: string,
  exceptions: string,

  parse_status: string,
  warning_count: number,
  error_count: number,
  missing_required_count: number
}
```

**Kiểm chứng:**

* Snapshot test JSON
* Validate schema

---

### Step 7 – Build ParseField list

**Thực hiện:**

Generate list:

* fieldName
* value
* presentFlag
* requiredFlag
* validFlag

**Definition:**

* presentFlag = field có tồn tại trong markdown
* requiredFlag = field thuộc danh sách required
* validFlag:

```
TRUE khi:
- presentFlag = true
- AND không phải placeholder (TODO/TBD/---)

FALSE khi:
- empty
- hoặc placeholder
```

**Kiểm chứng:**

* Verify flags:

  * present
  * missing
  * required
  * valid / invalid

---

### Step 8 – Service layer integration

**Thực hiện:**

* Tạo:

  * ReportParseService
* Flow:

```
Markdown → Parser → DTO → PersistencePort
```

**Kiểm chứng:**

* Mock persistence
* Verify flow end-to-end (in-memory)

---

### Step 9 – Persistence mapping

**Thực hiện:**

* Map sang:

  * ParseSnapshot
  * ParseField

* Gọi:

  * DocParsePersistencePort

**Kiểm chứng:**

* DB insert thành công
* Data đúng format

---

### Step 10 – Integration test (E2E)

**Thực hiện:**

* Input:

  * report.md thực tế

* Flow:

  * parse → persist → read back

**Kiểm chứng:**

* parsedSummary đúng
* parseStatus đúng
* field đầy đủ

---

## 4. Cách kiểm chứng từng step

| Step | Verification          |
| ---- | --------------------- |
| 1    | Compile + unit init   |
| 2    | Mapping test          |
| 3    | Extraction test       |
| 4    | Missing field test    |
| 5    | Status logic test     |
| 6    | JSON snapshot         |
| 7    | ParseField validation |
| 8    | Service mock test     |
| 9    | DB integration        |
| 10   | End-to-end            |

---

## 5. Rollback

### Cách rollback

* Disable parser trong orchestration
* Remove mapping từ service layer
* Không cần rollback DB

### Điều kiện rollback

* Parse sai hàng loạt
* JSON schema mismatch
* Gây lỗi ingestion pipeline

---

## 6. Bảng tương ứng Acceptance Criteria (AC)

| AC                              | Step   |
| ------------------------------- | ------ |
| Parse markdown                  | Step 2 |
| Extract section                 | Step 3 |
| Build parsedSummary             | Step 6 |
| Detect missing fields (warning) | Step 4 |
| Determine parseStatus           | Step 5 |
| Persist data                    | Step 9 |

---

## 7. Điều kiện Stop / Ask

### Stop khi:

* MarkdownParserCore không parse đúng structure
* Heading structure không ổn định
* Schema DB không chứa đủ field
* Conflict với parser hiện tại

---

### Ask khi:

* Cần thay đổi DB schema
* Required field thay đổi
* parseStatus rule không cover case mới
* Input markdown không tuân format spec

---

## 8. Kết luận

* Align với implementation hiện tại
* Không enforce validation logic cứng như spec cũ
* Parser đóng vai trò:
  → extract + summarize + emit warnings/errors

---
