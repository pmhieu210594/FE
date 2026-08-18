# REVIEW-CHECKLIST – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

# 1. Specification & Acceptance Criteria Alignment

> ⚠️ Lưu ý: Acceptance Criteria (AC) trong tài liệu này được **derive từ `spec-pack.md`**, do spec không định nghĩa AC-ID explicit.
> Mỗi AC đều trace về rule cụ thể trong spec.

---

## 1.1 Checklist

* [ ] Tất cả behavior trong `spec-pack.md` đã được implement
* [ ] Parse status logic đúng spec (FAILED / PARTIAL / DRAFT / OFFICIAL)
* [ ] Required fields = ALL_FIELDS (8 fields)
* [ ] Section parsing = string (không array)
* [ ] Empty file được map thành artifact_status + warning
* [ ] Không dùng sections_detected
* [ ] Warning/Error theo ParsingIssue


---

## 1.2 AC Traceability Table

> Updated 2026-06-29: AC IDs aligned with `spec-pack.md §8`. Added AC-7 and AC-8. FAILED trigger clarified.

| AC ID | Description | Implemented | Tested | Notes |
| ----- | ----------- | ----------- | ------ | ----- |
| AC-1 | Blank/empty content → error `markdown_empty` → FAILED | ✔ | ❌ | Error from MarkdownParserCore, not parser itself |
| AC-2 | Có warning → parseStatus = PARTIAL | ✔ | ❌ | Missing fields / placeholder / no ticketId → warning |
| AC-3 | Không warning/error → DRAFT hoặc OFFICIAL | ✔ | ❌ | OFFICIAL iff parseMode == "official" |
| AC-4 | Section luôn là string (không array) | ✔ | ❌ | `Map<String, String>` from sectionMap() |
| AC-5 | Missing required fields → warning (không phải error) | ✔ | ❌ | `required_fields_missing` warning |
| AC-6 | Required fields = ALL_FIELDS (8 fields) | ✔ | ❌ | summary, impact, review_result, test_result, risks, open_issues, rollback, exceptions |
| AC-7 | TicketId có thể infer từ sourcePath | ✔ | ❌ | `changes/<TICKET>/report.md` pattern |
| AC-8 | Parse xong → dữ liệu lưu vào DB | ✘ | ❌ | ReportParseService chưa tạo; persistence chưa wired |

---

# 2. General System Review

## Checklist

* [ ] Implementation phù hợp với `impl-plan.md`
* [ ] Không lệch khỏi flow parse → validate → persist
* [ ] Code structure rõ ràng (parser / validator / mapper)
* [ ] Tuân thủ `docs/standards/`
* [ ] Không có logic duplicate
* [ ] Logging đầy đủ cho parse flow
* [ ] Error handling nhất quán

---

# 3. FE Review (nếu có)

## Checklist

* [ ] Hiển thị parse status đúng (FAILED / PARTIAL / DRAFT / OFFICIAL)
* [ ] Hiển thị missing fields rõ ràng
* [ ] Không crash khi data thiếu / malformed
* [ ] API contract được dùng đúng
* [ ] Loading / empty state hợp lý

---

# 4. BE / API Review

## Checklist

* [ ] API trả về parseStatus đúng spec
* [ ] Mapping từ raw input → parsed model đúng
* [ ] Validation đúng required fields
* [ ] Không swallow error
* [ ] Error response consistent
* [ ] Idempotent nếu re-parse

---

# 5. DB / Migration Review

## Checklist

* [ ] Schema ParseSnapshot đúng design
* [ ] Schema ParseField đúng design
* [ ] Mapping field → DB column chính xác
* [ ] Không mất dữ liệu khi parse lại
* [ ] Migration có rollback
* [ ] Index hợp lý (nếu query nhiều)

---

# 6. Security / Privacy Review

## Checklist

* [ ] Input text được sanitize
* [ ] Không có injection (SQL / command)
* [ ] Không log raw sensitive content
* [ ] Không expose internal structure qua API
* [ ] Validate input size (tránh abuse)

---

# 7. Operation / Maintenance Review

## Checklist

* [ ] Có log cho từng bước parse
* [ ] Có thể trace từ file → snapshot → field
* [ ] Có config (không hardcode rule)
* [ ] Dễ debug khi parse fail
* [ ] Có thể re-run parser safely

---

# 8. Test Review

## Checklist

* [ ] Match với `test-plan.md`
* [ ] Cover đủ:

  * empty file
  * whitespace file
  * missing required field
  * full valid file
* [ ] Có test cho list parsing
* [ ] Có test cho text fallback
* [ ] Test persistence đúng DB
* [ ] Test reproducible

---

# 9. Documentation / Traceability Review

## Checklist

* [ ] AC ↔ Spec ↔ Code ↔ Test trace được
* [ ] Spec không bị hiểu sai
* [ ] Parser behavior được document
* [ ] Decision parsing rule được ghi lại
* [ ] Không có ambiguity trong mapping

---

# 10. Release / Rollback Review

## Checklist

* [ ] Có thể deploy parser độc lập
* [ ] Có thể rollback code
* [ ] Migration rollback được
* [ ] Không phá dữ liệu cũ
* [ ] Parse cũ không bị invalid

---

# 11. Issues & Severity

| Issue | Severity (Blocker/Major/Minor) | Area | Description | Suggested Fix |
| ----- | ------------------------------ | ---- | ----------- | ------------- |
|       |                                |      |             |               |

---

# 12. Final Review Summary

* Tổng số issue:
* Blocker:
* Major:
* Minor:

## Decision

* [ ] Approve
* [ ] Request Changes
* [ ] Reject

## Notes

*
