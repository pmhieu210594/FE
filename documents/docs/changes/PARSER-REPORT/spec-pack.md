# SPEC PACK – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Bối cảnh / Mục đích

Hệ thống cần parser cho file `report.md` để:

* Chuẩn hoá nội dung báo cáo thành JSON có cấu trúc
* Lưu trữ vào hệ thống thông qua:

  * `ParseSnapshot` (metadata + summary JSON)
  * `ParseField` (section-level tracking)
* Phục vụ:

  * hiển thị UI
  * tracking chất lượng
  * audit & analytics

Parser phải reuse `MarkdownParserCore` và tuân theo pattern của các parser hiện có.

---

## 2. Scope

### 2.1 In Scope

* Parse markdown `report.md`
* Extract các section theo heading
* Convert thành:

  * parsedSummary JSON
  * List<ParseField>
* Determine parseStatus
* Detect missing required fields
* Map sang DB model (`ParseSnapshot`, `ParseField`)
* Persist thông qua `DocParsePersistencePort`

---

### 2.2 Out of Scope

* NLP / semantic parsing
* Table parsing
* Complex hierarchy validation
* Auto-correction nội dung
* Multi-file aggregation
* Parser trực tiếp thao tác DB

---

## 3. Thuật ngữ

| Term             | Ý nghĩa                      |
| ---------------- | ---------------------------- |
| MarkdownDocument | output từ MarkdownParserCore |
| Section          | phần nội dung dưới heading   |
| ParseSnapshot    | snapshot lưu DB              |
| ParseField       | record của từng section      |
| parsedSummary    | JSON summary chính           |
| parseStatus      | trạng thái parse             |

---

## 4. As-Is

* Đã có:

  * MarkdownParserCore
  * Persistence layer (snapshot + sections)
* Chưa có:

  * ReportMarkdownParser

---

## 5. To-Be

```java
ReportMarkdownParser
```

Flow:

```text
Markdown
 → MarkdownParserCore
 → MarkdownDocument
 → ReportMarkdownParser (build parsed data)
 → Application Service (map to DB model)
 → DocParsePersistencePort
 → Database
```

---

## 6. Specification chi tiết

### 6.1 Section Mapping

| Heading          | Key              |
| ---------------- | ---------------- |
| summary          | summary          |
| impact           | impact           |
| review result    | review_result    |
| test result      | test_result      |
| risks            | risks            |
| open issues      | open_issues      |
| rollback         | rollback         |
| exceptions       | exceptions       |

Rule:

* Case-insensitive
* Trim whitespace

---

### 6.2 Data Extraction

Tất cả section được giữ dạng:

```java
Map<String, String>
```

---

### 6.3 Required Fields

Tất cả fields trong `ALL_FIELDS` được coi là required:

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

---

### 6.4 Parse Status

#### Enum

```java
enum ParseStatus {
  FAILED,
  PARTIAL,
  DRAFT,
  OFFICIAL
}
```

#### Logic

```java
if (!errors.isEmpty()) → FAILED
else if (!warnings.isEmpty()) → PARTIAL
else if (parseMode == "official") → OFFICIAL
else → DRAFT
```
---

### 6.5 Empty File Detection

```java
boolean isEmpty =
  normalizedContent == null
  || normalizedContent.trim().isEmpty();
```

---

### 6.6 Missing Fields

```json
["section:summary", "section:impact"]
```

---

### 6.7 Parsed Summary JSON

```json
{
  "ticket_id": "...",
  "parse_mode": "...",
  "parse_status": "...",
  "artifact_status": "...",
  "content_hash": "...",

  "summary": "...",
  "impact": "...",
  "review_result": "...",
  "test_result": "...",
  "risks": "...",
  "open_issues": "...",
  "rollback": "...",
  "exceptions": "...",

  "section_count": 0,
  "table_count": 0,
  "warning_count": 0,
  "error_count": 0,
  "placeholder_count": 0,
  "missing_required_count": 0,

  "has_missing_required_sections": true,
  "has_open_issue_detected": true,
  "has_risk_detected": true,
  "has_rollback_detected": true
}
```

---

### 6.8 ParseField

| Field          | Meaning    |
| -------------- | ---------- |
| sectionKey     | key        |
| sectionSummary | nội dung   |
| presentFlag    | có tồn tại |
| requiredFlag   | bắt buộc   |
| validFlag      | hợp lệ     |
| parseWarning   | cảnh báo   |

---

### 6.9 Mapping sang DB Model

#### ParseSnapshot

```java
ParseSnapshot snapshot = ParseSnapshot.builder()
  .ticketId(resolveTicketId(...))
  .artifactTypeCode("REPORT")
  .parseMode(parseMode)
  .parseStatus(parseStatus.name())
  .sourcePath(sourcePath)
  .contentHash(hash(content))
  .schemaVersion("1.0")
  .schemaValid(true)
  .templateEmptyFlag(isEmpty)
  .requiredFieldsMissing(missingFields)
  .parsedSummaryJson(toJson(parsedSummary))
  .parserVersion("report-parser:v1")
  .collectedAt(now)
  .build();
```

---

#### ParseField

```java
ParseField(
  sectionKey,
  sectionSummary,
  presentFlag,
  requiredFlag,
  validFlag,
  parseWarning
)
```

---

### 6.10 Persistence Contract

```java
DocParsePersistencePort.save(
  ParseSnapshot snapshot,
  List<ParseField> sections
)
```

---

### 6.11 Implementation Responsibility

| Layer               | Responsibility                          |
| ------------------- | --------------------------------------- |
| Parser              | parse + build summary + compute metrics |
| Application Service | map → snapshot + sections               |
| Persistence Adapter | save DB                                 |

---

## 7. Non-functional

* < 100ms với file < 100KB
* Không throw exception
* Deterministic
* Idempotent

---

## 8. Acceptance Criteria

### AC-1

Có error → FAILED

### AC-2

Có warning → PARTIAL

### AC-3

Không warning/error:

* parseMode=official → OFFICIAL
* else → DRAFT

### AC-4

Section luôn là string

### AC-5

Missing fields → warning

### AC-6

Không có sections_detected

### AC-7

TicketId có thể infer từ path

### AC-8

Parse xong → dữ liệu được lưu vào:

* `tbl_fact_artifact_snapshot`
* `tbl_fact_artifact_parsed_section`

---

## 9. Examples

### Normal

```markdown
## Summary
Done
```

→ `"summary": "Done"`

---

### Empty

```
""
```

→ `"parseStatus": "FAILED"` (error: `markdown_empty` from `MarkdownParserCore`)

> ⚠️ Correction (2026-06-29): Original example showed `"WARNING"` which is not a valid `ParseStatus` value. Actual behavior: blank/empty content triggers a `markdown_empty` error → `FAILED`. Missing required fields trigger warnings → `PARTIAL`.

---

### Boundary

```markdown
## Risks
Some text
```

→ `"risks": "Some text"` (string, not array)

---

## 10. Source Availability Summary

| Source           | Status |
| ---------------- | ------ |
| Raw input        | ✅      |
| Parser core      | ✅      |
| Reference parser | ✅      |
| Persistence      | ✅      |
| Test data        | ⚠      |

---

## 11. Complexity Classification

| Area       | Level  |
| ---------- | ------ |
| Parsing    | LOW    |
| Mapping    | MEDIUM |
| Edge cases | MEDIUM |

---

## 12. FE/BE Contract Impact

* Không đổi API
* ParseStatus values: FAILED / PARTIAL / DRAFT / OFFICIAL (không có WARNING)

---

## 13. DB/Migration Impact

* Không cần migration
* Reuse:

  * tbl_fact_artifact_snapshot
  * tbl_fact_artifact_parsed_section

---

## 14. Security / Privacy

* Không xử lý dữ liệu nhạy cảm
* Không cần masking

---

## 15. Operation / Maintenance

* Parser versioning:

  * `report-parser:v1`
* Logging:

  * warnings
  * errors

---

## 16. Test Strategy

* Unit:

  * parseStatus
  * section mapping
* Integration:

  * parse → save DB (snapshot + sections)
* Edge:

  * empty file
  * whitespace file

---

## 17. Human Decision Required
---

## 18. Assumptions

* Heading tiếng Anh
* Required fields cố định
* Không validate semantic

---

## 19. Open Issues

1. ticket_id fallback
2. optional section warning

---
