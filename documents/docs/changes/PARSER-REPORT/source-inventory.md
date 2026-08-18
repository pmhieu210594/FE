# SOURCE-INVENTORY – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Parser Layer

### Existing

* MarkdownParserCore
* BaseParseService (pattern)

### New

* ReportMarkdownParser
* ReportParseService

---

## 2. DTO Layer

### Existing DTO

* ParseSnapshot
* ParseField

### Extended Fields

* parsedSummary (JSON)
* parseStatus

---

## 3. Service Layer

### Existing

* ImplPlanParseService
* TestPlanParseService

### New

* ReportParseService

---

## 4. Persistence Layer

### Existing

* DocParsePersistencePort
* Repository (JPA/MyBatis)

### Update

* Mapping cho report parser

---

## 5. Validation Layer

* Required field validation (reuse pattern)
* Parse status evaluation

---

## 6. Mapping Rules

| Section          | Key              |
| ---------------- | ---------------- |
| Summary          | summary          |
| Impact           | impact           |
| Review Result    | review_result    |
| Test Result      | test_result      |
| Risks            | risks            |
| Remaining Issues | open_issues      |
| Rollback         | rollback         |
| Exceptions       | exceptions       |

---

## 7. Enum / Constants

* ParseStatus:

  * FAILED
  * PARTIAL
  * DRAFT
  * OFFICIAL

---

## 8. Test Assets

* Sample report.md (valid)
* Missing required fields case
* Mixed format case
* Empty file case

---

## 9. External Dependency

* Không có dependency mới
* Reuse internal modules

---

## 10. Kết luận

Inventory đầy đủ cho implementation, không cần thêm module mới.
