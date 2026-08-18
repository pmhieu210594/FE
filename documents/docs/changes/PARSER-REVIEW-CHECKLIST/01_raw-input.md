# Thiết kế chức năng: Parser review-checklist.md

---

# 1. Mục tiêu

Xây dựng chức năng parser `review-checklist.md` nhằm:

* Parse markdown → structured data

* Xác định coverage của 3 required sections (security / test / performance)

* Chuẩn hóa metadata phục vụ:

  * Evidence Quality Score
  * Review coverage analysis
  * Data Quality

* Lưu kết quả vào hệ thống dữ liệu (`tbl_fact_artifact_snapshot`)

---

# 2. Nguyên tắc thiết kế

## 2.1 Kiến trúc tổng thể

Parser tuân theo pattern chung của hệ thống:

* Stateless
* Domain layer (pure Java, không có framework dependency)
* Delegate sang `MarkdownParserCore` cho core parsing
* Không phụ thuộc:

  * Git repository
  * Database

Tách biệt rõ:

* Parsing (ReviewChecklistMarkdownParser)
* Persistence (ArtifactScannerService.persistReviewChecklistParse)

---

## 2.2 Flow tổng thể

```text
Git Repository (SSOT)
        ↓
Git Connector / File Loader
        ↓
Raw Markdown Content (string)
        ↓
ArtifactScannerService (idempotency check)
        ↓
ReviewChecklistMarkdownParser.parse()
        ↓
MarkdownParserCore.parse()
        ↓
ParsedArtifact (in-memory, 19 fields + parsedSummary)
        ↓
ArtifactScannerService.persistReviewChecklistParse()
        ↓
tbl_fact_artifact_snapshot (DB)
```

---

# 3. Input / Output

## 3.1 Input

```java
parse(String content)
parse(String content, String sourcePath)
parse(String content, String sourcePath, String parseMode)
```

| Parameter  | Type   | Required | Default  | Ghi chú                            |
| ---------- | ------ | -------- | -------- | ---------------------------------- |
| content    | String | Yes      | —        | Null được normalize thành ""       |
| sourcePath | String | No       | null     | Dùng để infer ticket_id            |
| parseMode  | String | No       | "draft"  | "draft" hoặc "official"            |

### Nguồn dữ liệu

* Git Connector (blob content)

Parser không thực hiện việc đọc file

---

## 3.2 Output — `ParsedArtifact` record

```java
public record ParsedArtifact(
    String sourcePath,
    String ticketId,
    String parseMode,
    String parseStatus,           // OFFICIAL | DRAFT | PARTIAL | FAILED
    String artifactStatus,        // "present" | "missing" | "invalid"
    boolean artifactExists,
    Map<String, String> frontMatter,
    Map<String, String> headerMetadata,
    Map<String, String> sections,          // key = uppercase heading
    List<MarkdownTable> tables,
    List<?> acceptanceCriteria,
    List<MarkdownPlaceholder> placeholders,
    List<ParsingIssue> warnings,
    List<ParsingIssue> errors,
    List<String> requiredFieldsMissing,    // e.g. ["section:security"]
    String normalizedContent,
    String contentHash,
    String parserVersion,
    Map<String, Object> parsedSummary
)
```

### parsedSummary — map được persist vào DB

| Key                        | Ý nghĩa                              |
| -------------------------- | ------------------------------------ |
| `ticket_id`                | ticket id inferred                   |
| `parse_mode`               | "draft" hoặc "official"              |
| `parse_status`             | OFFICIAL / DRAFT / PARTIAL / FAILED  |
| `artifact_status`          | "present" / "missing" / "invalid"    |
| `content_hash`             | SHA-256 của content                  |
| `parser_version`           | `review-checklist-markdown-parser-v1`|
| `security`                 | nội dung section SECURITY (nullable) |
| `test`                     | nội dung section TEST (nullable)     |
| `performance`              | nội dung section PERFORMANCE (nullable)|
| `section_count`            | tổng số sections                     |
| `table_count`              | tổng số tables                       |
| `warning_count`            | số warnings                          |
| `error_count`              | số errors                            |
| `placeholder_count`        | số placeholders                      |
| `missing_required_count`   | số required sections thiếu           |
| `has_missing_required_sections` | boolean                         |
| `has_open_issue_detected`  | boolean — có section "open_issues"   |
| `has_risk_detected`        | boolean — có section "risks"         |
| `has_rollback_detected`    | boolean — có section "rollback"      |

---

# 4. Parsing Flow chi tiết

## 4.1 Bước 1: Input normalization

* `content = null` → normalize thành `""`
* `content` trống (sau normalize) → `artifactExists = false`, `artifactStatus = "missing"`
* `content` có nội dung → `artifactExists = true`
* Parse status **không** tự động là FAILED khi content rỗng — phụ thuộc warnings/errors

---

## 4.2 Bước 2: Core parsing (delegate)

* Gọi `MarkdownParserCore.parse(content, sourcePath)`
* Core trả về `MarkdownDocument` gồm:
  * `frontMatter` (YAML)
  * `headerMetadata` (key-value từ header)
  * `sections` (Map<String, String>, key = uppercase heading)
  * `tables`, `placeholders`
  * `warnings`, `errors`
  * `normalizedContent`, `contentHash`

---

## 4.3 Bước 3: ticket_id inference (3 nguồn)

Ưu tiên:

1. **YAML front matter**: key `ticket_id`, `ticket-id`, hoặc `ticketid`
2. **Source path pattern**: `.../changes/<TICKET>/review-checklist.md`
3. **Header metadata**: key `ticket_id`, `ticket-id`, hoặc `ticketid`

Validation: phải match `^[A-Z0-9][A-Z0-9-]*$`

Nếu không infer được → emit warning `ticket_id_missing`

> **Lưu ý:** `artifact_type` **không** được extract từ YAML — field này không tồn tại trong `ParsedArtifact`.

---

## 4.4 Bước 4: Required section detection

```java
ALL_FIELDS = ["security", "test", "performance"]

for each field in ALL_FIELDS:
    value = sections.get(field.toUpperCase())  // "SECURITY", "TEST", "PERFORMANCE"
    if value == null or blank:
        missingFields.add("section:" + field)
```

Nếu `missingFields` không rỗng → emit warning `required_fields_missing`

> **Không có keyword matching.** Parser kiểm tra sự tồn tại của **heading section** đúng tên.

---

## 4.5 Bước 5: Placeholder detection

* Nếu có `MarkdownPlaceholder` trong required fields → emit warning `placeholder_detected`

---

## 4.6 Bước 6: Warning summary

| Warning code | Điều kiện |
| --- | --- |
| `ticket_id_missing` | Không infer được ticket_id từ bất kỳ nguồn nào |
| `required_fields_missing` | Thiếu ≥ 1 section trong security / test / performance |
| `placeholder_detected` | Có placeholder token trong required fields |

Ngoài ra, `MarkdownParserCore` có thể emit thêm warnings/errors riêng.

---

## 4.7 Bước 7: Parse Status

```text
if errors not empty  → FAILED
if warnings not empty → PARTIAL
if parseMode = "official" → OFFICIAL
else → DRAFT
```

| Status | Điều kiện |
| --- | --- |
| OFFICIAL | Không có warning/error, parseMode = "official" |
| DRAFT | Không có warning/error, parseMode ≠ "official" |
| PARTIAL | Có warning (không có error) |
| FAILED | Có error |

---

## 4.8 Bước 8: Build ParsedArtifact + parsedSummary

Parser trả về `ParsedArtifact` record đầy đủ 19 fields, bao gồm `parsedSummary` map.

---

# 5. Storage Layer

## 5.1 Trách nhiệm

`ArtifactScannerService.persistReviewChecklistParse()`:

1. `updateSnapshotParsedSummary()` — persist `parsedSummary` vào snapshot
2. `deleteParsedSectionsByTicketIdAndSectionType(ticketId, "review-checklist")` + `insertParsedSection()` per section
3. `insertEvidenceEvent()` — ghi event `REVIEW_CHECKLIST_PARSE` / `PARSE_COMPLETED`
4. `insertDataQualityRecord()` — khi có `requiredFieldsMissing` hoặc errors
5. `evidenceQualityScoreService.recalculateFromParser()` — trigger tính lại score

---

## 5.2 Mapping sang database

### Bảng chính:

```text
tbl_fact_artifact_snapshot (parsedSummary JSON)
tbl_parsed_section (per section row)
```

---

### Mapping chi tiết

| ParsedArtifact field     | DB                                       |
| ------------------------ | ---------------------------------------- |
| `sourcePath`             | `source_path`                            |
| `contentHash`            | `content_hash` / `source_hash`           |
| `parserVersion`          | `parser_version`                         |
| `parsedSummary`          | persisted via `updateSnapshotParsedSummary()` |
| `sections` (per entry)   | `tbl_parsed_section` row                 |

---

## 5.3 Idempotency rule

* Idempotency **không thuộc parser** — được xử lý bởi `ArtifactScannerService.buildSnapshot()`
* Scanner so sánh `contentHash` với snapshot trước đó:
  * `contentHash` không đổi → `needParse = false` → parser không được gọi

---

# 6. Data Lineage

### Được cung cấp bởi parser (`ParsedArtifact`)

| Field | Ý nghĩa |
| --- | --- |
| `sourcePath` | path của file |
| `contentHash` | SHA-256 của content (= source_hash) |
| `parserVersion` | `review-checklist-markdown-parser-v1` |

### Được bổ sung bởi `ArtifactScannerService` khi persist

| Field | Ý nghĩa |
| --- | --- |
| `job_run_id` | UUID của scan run (`connectorRunId`) |
| `parsed_at` | timestamp khi persist (UTC) |

---

# 7. Ràng buộc

## 7.1 Metadata First

* Không lưu raw markdown

---

## 7.2 Repo as SSOT

* Repository là nguồn chính
* Database là dữ liệu phái sinh

---

## 7.3 Idempotency

* source_hash không đổi → scanner không gọi parser

---

## 7.4 Data Quality

* Parse lỗi vẫn lưu record (PARTIAL/FAILED)
* DataQualityRecord được insert khi có issues

---

# 8. Hạn chế (MVP)

* Section-based detection (không semantic understanding)
* Không đánh giá chất lượng nội dung trong section
* Không NLP

---

# 9. Mở rộng

* Semantic content analysis trong section
* Template enforcement (strict heading format)
* Cross-artifact consistency check

---

# Kết luận

Hệ thống gồm 2 bước rõ ràng:

1. Parser (`ReviewChecklistMarkdownParser`):

   * delegate sang `MarkdownParserCore`
   * section-based detection
   * tạo `ParsedArtifact`

2. Persistence (`ArtifactScannerService.persistReviewChecklistParse`):

   * persist vào `tbl_fact_artifact_snapshot` + `tbl_parsed_section`

Thiết kế đảm bảo:

* Tách biệt trách nhiệm rõ ràng
* Dễ test (parser là pure Java, không có DB dependency)
* Phù hợp với kiến trúc Hexagonal của hệ thống
