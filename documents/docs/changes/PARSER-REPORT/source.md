# Sources – PARSER-REPORT 

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Primary Requirement

### 1.1 Raw Input Spec

* File: `docs/changes/PARSER-REPORT/01_raw-input.md`
* Type: Product Spec
* Reliability: HIGH

### Nội dung chính đã chốt:

* Parser cho `report.md`
* Strict markdown parsing (không NLP)
* Section-based extraction
* Output JSON + persistence-compatible
* Có parseStatus với 4 trạng thái:

  * FAILED
  * PARTIAL
  * DRAFT
  * OFFICIAL

---

## 2. Parser Architecture (Confirmed Pattern)

### 2.1 Core Parser

* File:

  * `MarkdownParserCore.java`

### Responsibility:

* Parse markdown → `MarkdownDocument`
* Extract:

  * front matter
  * sections
  * tables
  * metadata
  * normalized content
* Detect:

  * empty content
  * structural issues

👉 Đây là layer bắt buộc reuse (KHÔNG viết lại)

---

### 2.2 Parser Pattern (Reference Implementation)

#### Source:

* `SpecPackMarkdownParser.java`

### Pattern chuẩn:

```text
parse()
 → MarkdownParserCore
 → MarkdownDocument
 → extract sections
 → validate
 → build parsedSummary
 → build ParseSnapshot
 → build ParseField[]
```

### Nguyên tắc:

* Không parse markdown trực tiếp
* Fail-soft (không throw exception)
* Accumulate warning/error
* Domain logic nằm ở parser layer

---

## 3. Persistence Model (Confirmed)

### 3.1 Snapshot Table

* `tbl_fact_artifact_snapshot`

### Model:

* `ParseSnapshot`

### Lưu:

* metadata
* parseStatus
* requiredFieldsMissing
* parsedSummaryJson

---

### 3.2 Section Table

* `tbl_fact_artifact_parsed_section`

### Model:

* `ParseField`

### Lưu:

* từng section riêng biệt
* trạng thái:

  * presentFlag
  * validFlag
  * requiredFlag

---

## 4. Parsed Summary Contract

### Structure:

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
"warning_count": 0,
"error_count": 0,
"missing_required_count": 0
}
```

---

## 5. ParseStatus Definition (Finalized)

### Enum:

```text
FAILED
PARTIAL
DRAFT
OFFICIAL
```

### Logic:

```text
if errors → FAILED
else if warnings → PARTIAL
else if parseMode == official → OFFICIAL
else → DRAFT
```

---

## 6. Required Fields (Final)

```text
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

## 7. Section Mapping (Final)

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

## 8. Extraction Capability (From Core + Custom)

| Feature             | Source | Status   |
| ------------------- | ------ | -------- |
| Section extraction  | Core   | ✅        |
| YAML front matter   | Core   | ✅        |
| Table parsing       | Core   | (unused) |
| List extraction     | Custom | ✅        |
| Plain text fallback | Custom | ✅        |

---

## 9. Known Gaps (Resolved / Accepted)

| Gap                 | Status     |
| ------------------- | ---------- |
| parseStatus unclear | ✅ resolved |
| empty file handling | ✅ WARNING  |
| required fields     | ✅ fixed    |
| persistence mapping | ✅ aligned  |
| section mapping     | ✅ fixed    |

---

## 10. Source Availability Summary

| Category         | Status    |
| ---------------- | --------- |
| Requirement      | ✅         |
| Parser core      | ✅         |
| Reference parser | ✅         |
| Persistence      | ✅         |
| Domain model     | ✅ defined |
| Test data        | ⚠ thiếu   |

---

## 11. Constraints (Must Follow)

* MUST use `MarkdownParserCore`
* MUST output:

  * parsedSummary JSON
  * ParseField list
* MUST align với DB schema hiện tại
* MUST implement parseStatus đúng rule
* MUST handle empty file → WARNING

---

## 12. Confidence Level

| Area             | Confidence |
| ---------------- | ---------- |
| Parsing infra    | HIGH       |
| Business mapping | HIGH       |
| Edge cases       | MEDIUM     |

---

## 13. Remaining Risks

* Heading không đúng format (user viết sai)
* Mixed content (list + text)
* Missing optional section không có warning rõ ràng
* ticket_id fallback chưa define fully

---
