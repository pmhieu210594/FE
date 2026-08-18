# Brainstorm – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Problem Breakdown

Input:

* Markdown file `report.md`

Output:

* Structured JSON + persistence model

Core flow:

```
Markdown text
  ↓
MarkdownParserCore
  ↓
MarkdownDocument
  ↓
ReportMarkdownParser (NEW)
  ↓
ParseSnapshot + ParseField[]
```

---

## 2. Key Design Decision

### 2.1 Không viết parser từ đầu

→ reuse:

* MarkdownParserCore

---

### 2.2 Parser mới cần tạo

```
ReportMarkdownParser
```

Responsibility:

* Map section
* Extract content
* Build parsedSummary JSON
* Build ParseSnapshot
* Build ParseField[]
* Determine parseStatus

---

## 3. Section Mapping Strategy

| Heading (input)  | Output Key       |
| ---------------- | ---------------- |
| summary          | summary          |
| impact           | impact           |
| review result    | review_result    |
| test result      | test_result      |
| risks            | risks            |
| remaining issues | open_issues      |
| rollback         | rollback         |
| exceptions       | exceptions       |

### Rule (Final)

* Case-insensitive
* Trim whitespace
* Không hỗ trợ multi-language (tạm thời)

---

## 4. Section Extraction Logic

Từ MarkdownParserCore:

* sử dụng `sections`

Flow:

* loop từng section
* normalize heading
* map → output key

---

## 5. Data Transformation Rules

### 5.1 Text section

→ string

---

### 5.2 List section

* "- item"
  → array

---

### 5.3 Plain text fallback

```
## Risks
Some text
```

→ ["Some text"]

---

### 5.4 Empty section

* presentFlag = true
* validFlag = false (nếu required)

---

## 6. ParseStatus Logic (Final)

### Enum:

```
FAILED
PARTIAL
DRAFT
OFFICIAL
```

### Rule:

```
IF errors → FAILED
ELSE IF warnings → PARTIAL
ELSE IF parseMode == "official" → OFFICIAL
ELSE → DRAFT
```

---

## 7. Required Fields

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
```result
```

---

## 8. Error Handling (Simplified)

Không sử dụng error type phức tạp.

Thay vào đó:

* parseStatus
* requiredFieldsMissing
* parseWarning trong ParseField

---

## 9. YAML Front Matter

Nếu có:

```
artifact_type
ticket_id
schema_version
```

→ override output

Fallback:

* ticket_id có thể lấy từ path (TBD)

---

## 10. Risk Areas

### 10.1 Heading ambiguity

* "## Summary"
* "## SUMMARY"

---

### 10.2 Mixed content

* list + text

---

### 10.3 Missing sections

* xử lý bằng parseStatus + requiredFieldsMissing

---

## 11. Reuse Pattern từ parser khác

Pattern:

```
MarkdownDocument
 → map sections
 → validate
 → build parsedSummary
 → build snapshot
 → build sections
```

---

## 12. Proposed Class Design

```
ReportMarkdownParser
  - parse(String content)
  - mapSections()
  - extractList()
  - buildParsedSummary()
  - buildSnapshot()
  - buildSections()
  - determineStatus()
```

---

## 13. Complexity

* Parsing logic: LOW
* Mapping: MEDIUM
* Edge cases: MEDIUM

---

## 14. Final Decisions (Resolved)

### 14.1 ParseStatus

* Enum: SUCCESS, WARNING, FAILED
* Empty file → WARNING

---

### 14.2 Required Fields

* summary
* impact
* review_result
* test_result

---

### 14.3 Persistence Model

* Snapshot → tbl_fact_artifact_snapshot
* Sections → tbl_fact_artifact_parsed_section

---

### 14.4 Section Mapping

* Fixed mapping (case-insensitive)
* Không support multi-language

---

### 14.5 Simplifications Accepted

* Không parse table
* Không hierarchy validation
* Không semantic validation

---

## 15. Remaining Open (Minor)

* ticket_id fallback strategy
* có cần warning cho optional section không

---

## 16. Next Step

* Implement ReportMarkdownParser
* Add unit test:

  * parseStatus
  * section mapping
  * empty file handling

---
