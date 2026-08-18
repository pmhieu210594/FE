# IMPACT-ANALYSIS – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Nội dung thay đổi

Thêm parser mới `ReportMarkdownParser` để:

* Parse file report.md
* Extract section theo heading
* Sinh parsedSummary (JSON)
* Sinh danh sách ParseField
* Xác định parseStatus
* Detect missing required fields
* Persist dữ liệu qua DocParsePersistencePort

---

## 2. File chịu ảnh hưởng trực tiếp

### New

* ReportMarkdownParser.java
* ReportParseService.java

### Modify

* Mapping trong DocParsePersistencePort (nếu cần)

---

## 3. File chịu ảnh hưởng gián tiếp

* Artifact ingestion flow
* Validation service
* UI đọc parsedSummary

---

## 4. Caller / Callee

### Caller

* Artifact ingestion
* Parse orchestration service

### Callee

* MarkdownParserCore
* Validation service
* Persistence port

---

## 5. Ảnh hưởng FE

* Không ảnh hưởng trực tiếp
* Gián tiếp:

  * UI có thể hiển thị parsedSummary
  * parseStatus mới

---

## 6. Ảnh hưởng BE

* Thêm parser mới
* Không thay đổi kiến trúc hiện tại

---

## 7. Ảnh hưởng API contract

* Không thay đổi API public
* DTO nội bộ mở rộng

---

## 8. Ảnh hưởng DTO / Schema / Validation

### DTO

parsedSummary gồm:

* summary (string)
* impact (string)
* review_result (string)
* test_result (string)
* risks (string)
* open_issues (string)
* rollback (string)
* exceptions (string)
* parse_status
* warning_count
* error_count
* missing_required_count


### Validation

Required fields:

ALL_FIELDS:

  summary
  impact
  review_result
  test_result
  risks
  open_issues
  rollback
  exceptions


---

## 9. Ảnh hưởng DB / Migration

* Không cần migration nếu JSON column đã có
* Cần verify enum parseStatus

---

## 10. Ảnh hưởng Batch / Job / Event

* Không có job mới
* Trigger từ CI / ingestion

---

## 11. Ảnh hưởng Test

### Unit test

* Parser logic
* Mapping
* Status

### Integration test

* End-to-end parse → DB

---

## 12. Ảnh hưởng Operation / Monitoring

* Logging parseStatus
* Logging missing fields

---

## 13. Ảnh hưởng Rollout / Rollback

### Rollout

* Deploy parser mới

### Rollback

* Disable parser mapping

---

## 14. Vùng không ảnh hưởng

| Vùng               | Lý do           |
| ------------------ | --------------- |
| MarkdownParserCore | chỉ reuse       |
| Existing parsers   | không sửa       |
| DB schema          | reuse           |
| Public API         | internal only   |
| FE hiện tại        | không phụ thuộc |

---

## 15. Kết luận

* Low-risk change
* Isolated parser addition
* Không ảnh hưởng hệ thống hiện tại
