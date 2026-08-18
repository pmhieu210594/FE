# PARSER-REVIEW-CHECKLIST blackbox-review-checklist.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-25
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# 1. Mục tiêu

Checklist để review chất lượng black-box test:

* Đảm bảo test bám sát specification
* Không phụ thuộc implementation
* Cover đầy đủ acceptance criteria (AC)
* Có đủ test case quan trọng

---

# 2. Coverage checklist

## 2.1 Acceptance Criteria coverage

| Check                                                                         | Status |
| ----------------------------------------------------------------------------- | ------ |
| Mỗi AC có ít nhất 2 test case                                                 | ☐      |
| AC-1 (content hợp lệ 3 sections → DRAFT) được cover                          | ☐      |
| AC-2 (null/empty content → artifactExists=false) được cover                  | ☐      |
| AC-3 (thiếu section → warning required_fields_missing) được cover             | ☐      |
| AC-4 (parseMode=official + no issues → OFFICIAL) được cover                  | ☐      |
| AC-5 (ticket_id inference 3 nguồn) được cover                                | ☐      |
| AC-6 (parse có warning vẫn có parsedSummary đầy đủ) được cover               | ☐      |
| AC-7 (idempotency ở scanner, không phải parser) được cover                   | ☐      |

---

## 2.2 Test type coverage

| Type           | Check                  | Status |
| -------------- | ---------------------- | ------ |
| Normal case    | Có test happy path     | ☐      |
| Error case     | Có test lỗi            | ☐      |
| Boundary value | Có test edge case      | ☐      |
| Negative case  | Thiếu section, không có ticket_id | ☐ |

---

# 3. Test case quality

## 3.1 Input / Output clarity

| Check                               | Status |
| ----------------------------------- | ------ |
| Input rõ ràng, cụ thể               | ☐      |
| Expected result measurable          | ☐      |
| Không mơ hồ (e.g. "đúng", "hợp lệ") | ☐      |

---

## 3.2 Independence

| Check                         | Status |
| ----------------------------- | ------ |
| Test không phụ thuộc lẫn nhau | ☐      |
| Có thể chạy độc lập           | ☐      |

---

## 3.3 Black-box principle

| Check                                  | Status |
| -------------------------------------- | ------ |
| Không sử dụng chi tiết implementation  | ☐      |
| Không phụ thuộc internal logic         | ☐      |
| Chỉ dựa vào input/output               | ☐      |

---

# 4. Test data quality

| Check                       | Status |
| --------------------------- | ------ |
| Có file test-data.md riêng  | ☐      |
| Data reusable               | ☐      |
| Có mapping data ↔ test case | ☐      |
| Có data cho error case      | ☐      |
| Có data cho boundary case   | ☐      |

---

# 5. Priority & risk

| Check                       | Status |
| --------------------------- | ------ |
| Có phân loại P0 / P1 / P2   | ☐      |
| P0 cover core functionality | ☐      |
| P1 cover edge cases         | ☐      |
| P2 cover rare cases         | ☐      |

---

# 6. Operation viewpoint

| Check                     | Status |
| ------------------------- | ------ |
| Có test batch processing  | ☐      |
| Không crash toàn flow     | ☐      |

---

# 7. Logging / audit

| Check                                                         | Status |
| ------------------------------------------------------------- | ------ |
| Có test log SUCCESS parse                                     | ☐      |
| Có test log ERROR parse                                       | ☐      |
| Có test parse_status (OFFICIAL/DRAFT/PARTIAL/FAILED)          | ☐      |

---

# 8. Consistency

| Check                              | Status |
| ---------------------------------- | ------ |
| Test case ↔ test data mapping đúng | ☐      |
| Không có test dư / duplicate       | ☐      |
| Naming consistent                  | ☐      |

---

# 9. Review kết luận

## 9.1 Summary

* Coverage: ☐ Good / ☐ Partial / ☐ Missing
* Quality: ☐ Good / ☐ Needs improvement

---

## 9.2 Issues (nếu có)

* Issue 1:
* Issue 2:

---

## 9.3 Recommendation

* [ ] Bổ sung test case
* [ ] Cải thiện expected result
* [ ] Tách test data rõ hơn
* [ ] Khác:

---

# 10. Kết luận

Black-box test được coi là đạt khi:

* Cover đầy đủ AC-1 đến AC-7
* Có đủ normal / error / boundary case
* Không phụ thuộc implementation
* Expected result rõ ràng, kiểm chứng được
* Có thể dùng trực tiếp cho QA / UAT / audit
