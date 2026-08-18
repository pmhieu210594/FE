# PARSER-REVIEW-CHECKLIST spec-pack.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# Spec Pack — Parser review-checklist.md (Aligned with Final Design)

---

## 1. Bối cảnh / Mục đích

Parser `review-checklist.md` là một thành phần trong hệ thống chuẩn hóa dữ liệu SDD nhằm:

* Cung cấp dữ liệu cho **Evidence Quality Score**
* Phát hiện thiếu hụt section review (security / test / performance)
* Hỗ trợ cải tiến rule và template

Nguyên tắc:

* Input được cung cấp từ upstream
* Database chỉ lưu **metadata phái sinh** (qua `parsedSummary` và `ParsedSection`)
* Parser không đọc dữ liệu từ database

---

## 2. Scope

### 2.1 In Scope

* Parse markdown content của `review-checklist.md` qua `MarkdownParserCore`
* Trích xuất:

  * `ticket_id` (từ YAML front matter, source path, hoặc header metadata)
  * section content của security / test / performance
* Parse YAML front matter (nếu có)
* Xác định `parse_status` và `artifactStatus`
* Phát hiện warnings: `ticket_id_missing`, `required_fields_missing`, `placeholder_detected`
* Trả về `ParsedArtifact` record
* Persist vào DB qua `ArtifactScannerService.persistReviewChecklistParse()`

---

### 2.2 Out of Scope

* Đọc file từ Git / file system
* Data ingestion pipeline
* NLP semantic parsing / keyword-based perspective detection
* Validate nội dung checklist
* Suggest cải thiện
* Logic idempotency (thuộc `ArtifactScannerService`)

---

## 3. Thuật ngữ

| Term | Định nghĩa |
| --- | --- |
| Artifact | Nội dung markdown đầu vào |
| ParsedArtifact | Output record trả về bởi parser, chứa toàn bộ kết quả parse |
| ParsingIssue | Warning hoặc error item (code, severity, message, path, sectionKey, line) |
| parseMode | Chế độ parse: "draft" (default) hoặc "official" — ảnh hưởng tới parse_status cuối |
| parsedSummary | Map key-value tổng hợp được persist vào DB snapshot |
| artifactStatus | Trạng thái artifact: "present" / "missing" / "invalid" |
| sections | Map các section heading → nội dung, trả về từ MarkdownParserCore |
| MarkdownParserCore | Component core xử lý markdown (parse front matter, sections, tables) |
| Metadata | Dữ liệu phái sinh |
| Parser | Module xử lý markdown (`ReviewChecklistMarkdownParser`) |

---

## 4. As-Is / To-Be

### As-Is

* Markdown không có metadata machine-readable
* Không tracking section coverage (security / test / performance)

---

### To-Be

* Metadata chuẩn hóa qua `parsedSummary`
* Dữ liệu có thể dùng cho analytics & scoring
* Không thay đổi kiến trúc hệ thống hiện tại

---

## 5. Data Flow (BẮT BUỘC)

```text
Input content (string) + sourcePath + parseMode
        ↓
ReviewChecklistMarkdownParser.parse()
        ↓
MarkdownParserCore.parse()  →  MarkdownDocument (frontMatter, sections, tables, warnings, errors)
        ↓
ticket_id inference + detectMissingFields()
        ↓
ParsedArtifact (includes parsedSummary)
        ↓
ArtifactScannerService.persistReviewChecklistParse()
        ↓
tbl_fact_artifact_snapshot (parsedSummary) + tbl_parsed_section + evidence events
```

### Quy tắc

* Parser nhận input: `content (string)`, `sourcePath`, `parseMode`
* Parser không:

  * đọc file
  * truy cập database
  * thực hiện idempotency check (thuộc scanner service)

---

## 6. Specification chi tiết

### 6.1 Input

| Parameter | Type | Required | Default | Ghi chú |
| --- | --- | --- | --- | --- |
| `content` | string | Yes | — | Null được xử lý thành `""` |
| `sourcePath` | string | No | null | Path dùng để infer ticket_id |
| `parseMode` | string | No | "draft" | "draft" hoặc "official" |

---

### 6.2 Output — `ParsedArtifact` record

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

#### parsedSummary — map được persist vào DB

| Key | Ý nghĩa |
| --- | --- |
| `ticket_id` | ticket id inferred |
| `parse_mode` | "draft" hoặc "official" |
| `parse_status` | OFFICIAL / DRAFT / PARTIAL / FAILED |
| `artifact_status` | "present" / "missing" / "invalid" |
| `content_hash` | SHA-256 của content |
| `parser_version` | `review-checklist-markdown-parser-v1` |
| `security` | nội dung section SECURITY (nullable) |
| `test` | nội dung section TEST (nullable) |
| `performance` | nội dung section PERFORMANCE (nullable) |
| `section_count` | tổng số sections |
| `table_count` | tổng số tables |
| `warning_count` | số warnings |
| `error_count` | số errors |
| `placeholder_count` | số placeholders |
| `missing_required_count` | số required sections thiếu |
| `has_missing_required_sections` | boolean |
| `has_open_issue_detected` | boolean — có section "open_issues" |
| `has_risk_detected` | boolean — có section "risks" |
| `has_rollback_detected` | boolean — có section "rollback" |

---

## 7. Processing Logic

### Step 1 — Input normalization

* `content = null` → được xử lý thành `""`
* `content` trống (sau normalize) → `artifactExists = false`, `artifactStatus = "missing"`
* `content` có nội dung → `artifactExists = true`
* Parse status **không** tự động là FAILED khi content rỗng — phụ thuộc warnings/errors

---

### Step 2 — Core parsing (delegate)

* Gọi `MarkdownParserCore.parse(content, sourcePath)`
* Core trả về `MarkdownDocument` gồm:
  * `frontMatter` (YAML)
  * `headerMetadata` (key-value từ header)
  * `sections` (Map<String, String>, key = uppercase heading)
  * `tables`
  * `placeholders`
  * `warnings`, `errors`
  * `normalizedContent`, `contentHash`

---

### Step 3 — ticket_id inference (3 nguồn, theo thứ tự ưu tiên)

1. **YAML front matter**: key `ticket_id`, `ticket-id`, hoặc `ticketid`
2. **Source path pattern**: `.../changes/<TICKET>/review-checklist.md`
3. **Header metadata**: key `ticket_id`, `ticket-id`, hoặc `ticketid`

Validation: `ticket_id` phải match `^[A-Z0-9][A-Z0-9-]*$`.

Nếu không infer được → emit warning `ticket_id_missing`.

> **Lưu ý:** `artifact_type` **không** được extract từ YAML — field này không tồn tại trong `ParsedArtifact`.

---

### Step 4 — Required section detection

```java
ALL_FIELDS = ["security", "test", "performance"]

for each field in ALL_FIELDS:
    value = sections.get(field.toUpperCase())  // "SECURITY", "TEST", "PERFORMANCE"
    if value == null or blank:
        missingFields.add("section:" + field)
```

Nếu `missingFields` không rỗng → emit warning `required_fields_missing`.

> **Không có keyword matching.** Parser kiểm tra sự tồn tại của **heading section** đúng tên,
> không phân tích từ khóa trong nội dung.

---

### Step 5 — Placeholder detection

* Nếu có `MarkdownPlaceholder` trong required fields → emit warning `placeholder_detected`

---

### Step 6 — Warning summary

| Warning code | Điều kiện |
| --- | --- |
| `ticket_id_missing` | Không infer được ticket_id từ bất kỳ nguồn nào |
| `required_fields_missing` | Thiếu ≥ 1 section trong security / test / performance |
| `placeholder_detected` | Có placeholder token trong required fields |

Ngoài ra, `MarkdownParserCore` có thể emit thêm warnings/errors riêng.

---

### Step 7 — Parse Status

```
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

## 8. Non-functional

### 8.1 Idempotency

* Idempotency **không thuộc parser** — được xử lý bởi `ArtifactScannerService.buildSnapshot()`
* Scanner so sánh `contentHash` với snapshot trước đó; nếu không đổi → `needParse = false` → parser không được gọi

---

### 8.2 Performance

* O(n) theo file size
* Phù hợp batch processing

---

### 8.3 Data Quality

* Parse lỗi vẫn ghi nhận metadata (warning/error list + parsedSummary)

---

### 8.4 Metadata First

* Không lưu raw markdown

---

## 9. Data Lineage (BẮT BUỘC)

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

## 10. Storage Design (CRITICAL)

### 10.1 Persist flow — `persistReviewChecklistParse()` trong `ArtifactScannerService`

1. **`updateSnapshotParsedSummary()`** — cập nhật `parsedSummary` map vào snapshot record (`tbl_fact_artifact_snapshot`)
2. **`deleteParsedSectionsByTicketIdAndSectionType(ticketId, "review-checklist")`** → **`insertParsedSection()`** per section — xóa sections cũ, re-insert
3. **`insertEvidenceEvent()`** — ghi event `REVIEW_CHECKLIST_PARSE` / `PARSE_COMPLETED`
4. **`insertDataQualityRecord()`** — chỉ khi có `requiredFieldsMissing` hoặc `errors`
5. **`evidenceQualityScoreService.recalculateFromParser()`** — trigger tính lại score

---

### 10.2 Base Fields (snapshot)

* `ticket_id`, `source_path`, `content_hash`, `parse_status`, `parser_version`, `artifact_status`

---

### 10.3 parsedSummary Fields (review-checklist)

Xem bảng đầy đủ tại Section 6.2 — `parsedSummary`.

Không có các field `has_security_perspective`, `has_test_perspective`, `has_performance_perspective`,
`perspective_count`, `checklist_item_count` — những field này không tồn tại trong implementation.

---

### 10.4 Rule

* Chỉ áp dụng khi:

```
artifact_type = 'review_checklist'
```

---

## 11. Security Impact

* Không xử lý dữ liệu nhạy cảm
* Không expose secret
* Chỉ xử lý metadata

---

## 12. Operation / Maintenance

* Logging parse error (warnings/errors list)
* Track `parserVersion` = `review-checklist-markdown-parser-v1`
* Hỗ trợ reprocess theo `contentHash` (qua `needParse` flag trong scanner)
* `parsedSummary` cho phép query analytics mà không cần re-parse

---

## 13. Test Strategy Summary

* Unit test:

  * section detection (SECURITY / TEST / PERFORMANCE)
  * ticket_id inference (3 nguồn: front matter, path, header)
  * warning emission (3 warning codes)
  * parse_status logic (OFFICIAL / DRAFT / PARTIAL / FAILED)
* Edge cases:

  * null/empty content → `artifactExists=false`, `artifactStatus="missing"`
  * invalid ticket_id format → warning `ticket_id_missing`
  * placeholder trong section → warning `placeholder_detected`
* Không phụ thuộc database

---

## 14. Acceptance Criteria

* AC-1: Content hợp lệ có đủ 3 sections → parseStatus = DRAFT, requiredFieldsMissing rỗng
* AC-2: Content null/empty → artifactExists=false, artifactStatus="missing"
* AC-3: Thiếu section SECURITY/TEST/PERFORMANCE → warning `required_fields_missing`, section xuất hiện trong `requiredFieldsMissing`
* AC-4: parseMode="official" + không có warning/error → parseStatus = OFFICIAL
* AC-5: ticket_id được infer theo thứ tự ưu tiên: front matter → path → header metadata
* AC-6: Parse có warning/error vẫn ghi nhận đầy đủ parsedSummary
* AC-7: Idempotency được đảm bảo bởi scanner (needParse flag), không phải parser

---

## 15. Human Decision Required

* Có bổ sung thêm required section ngoài security / test / performance không?
* Có enforce template format không?

---

## 16. Assumptions

* Markdown UTF-8
* Section names khớp đúng với headings ("## Security", "## Test", "## Performance" → key "SECURITY", "TEST", "PERFORMANCE")
* 3 sections (security/test/performance) đủ cho MVP

---

## 17. Open Issues

### Blocking

* Không có strict schema cho checklist content bên trong sections

### Non-blocking

* ~~`ArtifactScannerService.java:633` — `section_type` hardcoded `"report"`~~ → **Resolved**: code thực tế dùng `"review-checklist"` (line 633), không có bug
* Markdown edge case từ MarkdownParserCore

---

## 18. Complexity Classification

* Level: Medium

Lý do:

* parsing đơn giản, delegate sang MarkdownParserCore
* logic rõ ràng (section-based, không keyword-based)
* không phụ thuộc external system

---

# Kết luận

Spec Pack này:

* Đúng scope parser (section-based, không keyword-based)
* Mô tả chính xác `ParsedArtifact` record và `parsedSummary` map
* Phân tách rõ trách nhiệm: parser cung cấp `ParsedArtifact`, scanner xử lý persist + idempotency
* Không over-design
* Đủ để implement và maintain production parser
