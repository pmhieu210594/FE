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
* [ ] Parse status logic đúng spec (OFFICIAL / DRAFT / PARTIAL / FAILED)
* [ ] Required fields được validate đúng
* [ ] Section parsing đúng type (list / text / fallback)
* [ ] Empty file / whitespace được xử lý đúng
* [ ] Persistence đúng vào DB schema
* [ ] Không có logic ngoài spec mà không ghi nhận

---

## 1.2 AC Traceability Table

| AC ID | Description                                                                           | Source (spec-pack.md)       | Implemented | Tested | Notes |
| ----- | ------------------------------------------------------------------------------------- | --------------------------- | ----------- | ------ | ----- |
| AC-1  | Content hợp lệ có đủ 3 sections → parseStatus = DRAFT, requiredFieldsMissing rỗng   | AC-1                        |             |        |       |
| AC-2  | Content null/empty → artifactExists=false, artifactStatus="missing"                  | AC-2                        |             |        |       |
| AC-3  | Thiếu section SECURITY/TEST/PERFORMANCE → warning required_fields_missing            | AC-3                        |             |        |       |
| AC-4  | parseMode="official" + không có warning/error → parseStatus = OFFICIAL               | AC-4                        |             |        |       |
| AC-5  | ticket_id được infer theo thứ tự: front matter → path → header metadata              | AC-5                        |             |        |       |
| AC-6  | Parse có warning/error vẫn ghi nhận đầy đủ parsedSummary                             | AC-6                        |             |        |       |
| AC-7  | Idempotency được đảm bảo bởi scanner (needParse flag), không phải parser             | AC-7                        |             |        |       |

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

* [ ] Hiển thị parse status đúng (OFFICIAL / DRAFT / PARTIAL / FAILED)
* [ ] Hiển thị missing fields rõ ràng
* [ ] Không crash khi data thiếu / malformed
* [ ] API contract được dùng đúng
* [ ] Loading / empty state hợp lý

---

# 4. BE / API Review

## Checklist

* [ ] API trả về parseStatus đúng spec (OFFICIAL / DRAFT / PARTIAL / FAILED)
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
* [ ] Có test cho section detection (SECURITY/TEST/PERFORMANCE)
* [ ] Có test cho ticket_id inference (3 nguồn)
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
