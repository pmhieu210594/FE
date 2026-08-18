# PARSER-REVIEW-CHECKLIST promotion-candidates.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Generated date**: 2026-06-25
**Phase 9 disposition date**: 2026-06-29

---

# 1. Mục tiêu

Trích xuất các ứng viên để:

* Cập nhật **Failure Mode Index (FMI)**
* Cập nhật **Living Docs**
* Cải thiện:

  * Parser robustness
  * Review process
  * Test strategy
  * Governance capability

---

# 2. Failure Mode Index Candidates

## 2.1 Markdown Structure Issues

### FM-001: Missing Required Section

**Description**
Document thiếu section quan trọng (ví dụ: "Test Cases", "Spec")

**Observed Behavior**

* Parser trả:

  * PARTIAL
  * WARNING

**Impact**

* Thiếu dữ liệu downstream
* Mapping không đầy đủ

**Mitigation**

* Define required section list
* Add validation layer (optional strict mode)

---

### FM-002: Malformed Section Header

**Description**
Header không đúng format (`##`, `###`, typo)

**Observed Behavior**

* Section không được detect
* Field bị missing

**Impact**

* Silent data loss

**Mitigation**

* Header normalization
* Fallback fuzzy matching

---

### FM-003: Mixed Content / Noise Text

**Description**
Markdown chứa text ngoài expected format

**Observed Behavior**

* Parser extract được một phần
* Ambiguous mapping

**Impact**

* Data không chính xác hoàn toàn

**Mitigation**

* Improve parser rule priority
* Add confidence score

---

### FM-004: Inconsistent Naming Convention

**Description**
Tên section khác nhau giữa các document

**Observed Behavior**

* Parser không map được field

**Impact**

* Data inconsistency

**Mitigation**

* Central naming registry
* Alias mapping

---

### FM-005: Partial Document

**Description**
Document chưa hoàn chỉnh

**Observed Behavior**

* PARTIAL state

**Impact**

* Incomplete ingestion

**Mitigation**

* Detect draft vs final
* Add completeness score

---

## 2.2 Cross-document Issues

### FM-006: Spec vs Test Mismatch

**Description**
Spec define nhưng test không cover

**Observed Behavior**

* Không detect trong current system

**Impact**

* Hidden bug risk

**Mitigation**

* Cross-document validator

---

### FM-007: Impl vs Spec Drift

**Description**
Implementation không đúng spec

**Observed Behavior**

* Không detect

**Impact**

* Functional inconsistency

**Mitigation**

* Spec → Impl traceability check

---

---

# 3. Living Docs Candidates

## 3.1 Parser Design Pattern

**Candidate**

* Section-based parsing (detect heading "SECURITY", "TEST", "PERFORMANCE")
* State-driven result model:

  * OFFICIAL
  * DRAFT
  * PARTIAL
  * FAILED

**Action**

→ Promote thành guideline chung cho parser

---

## 3.2 Markdown Convention

**Candidate**

Define standard:

* Required sections
* Optional sections
* Naming rules
* Header level rules

**Action**

→ Tạo document:

```id="3bdm4p"
docs/standards/markdown-parser-convention.md
```

---

## 3.3 Test Strategy

**Candidate**

* Test theo loại:

  * Valid input
  * Missing section
  * Malformed input
  * Noise input

**Action**

→ Chuẩn hóa template test

---

## 3.4 Review Checklist

**Candidate**

Checklist cho parser:

* Có handle malformed input?
* Có silent failure không?
* Có logging đủ không?
* Có state rõ ràng không?

**Action**

→ Merge vào review-checklist chung

---

## 3.5 Ingestion Pipeline Pattern

**Candidate**

Pipeline chuẩn:

```id="lj0o1j"
Webhook → Scanner → Parser → Mapping → Persistence
```

**Action**

→ Reuse cho các domain khác

---

---

# 4. Improvement Opportunities

## 4.1 Short-term

* Add strict mode parser
* Add section validation
* Improve logging

---

## 4.2 Mid-term

* Cross-document validation
* Schema definition layer
* Consistency checker

---

## 4.3 Long-term

* Semantic understanding (LLM-assisted parsing)
* Auto-fix markdown issues
* Governance automation

---

# 5. Promotion Priority

| Candidate            | Priority     |
| -------------------- | ------------ |
| Parser pattern       | HIGH         |
| Markdown convention  | HIGH         |
| Failure Mode Index   | HIGH         |
| Cross-doc validation | MEDIUM       |
| Semantic validation  | LOW (future) |

---

# Final Note

Các candidate trên có thể:

* Giảm lỗi parser trong tương lai
* Tăng consistency của tài liệu
* Là nền tảng cho governance automation

👉 Nên được promote vào:

* Engineering standards
* Review checklist
* Training materials

---

# Phase 9 Disposition (2026-06-29)

## Failure Mode Index Candidates

| Candidate | Disposition | Target | Ghi chú |
| --------- | ----------- | ------ | ------- |
| FM-001: Missing Required Section | ✅ Done | `failure-mode-index.md` FMI-PARSER-001 | Đã permanentize |
| FM-002: Malformed Section Header | ✅ Done | `failure-mode-index.md` FMI-PARSER-002 | Đã permanentize |
| FM-003: Silent data loss / mixed content | ✅ Done | `failure-mode-index.md` FMI-PARSER-003 | Đã permanentize |
| FM-004: Inconsistent naming convention | ✅ Done | `failure-mode-index.md` FMI-PARSER-004 | Đã permanentize |
| FM-005: Partial document | ✅ Done | `failure-mode-index.md` FMI-PARSER-005 | Đã permanentize |
| FM-006: Spec vs Test mismatch | ✅ Done | `failure-mode-index.md` FMI-PARSER-006 | Đã permanentize |
| FM-007: Impl vs Spec drift | ✅ Done | `failure-mode-index.md` FMI-PARSER-007 | Đã permanentize |
| PARSER-REPORT FMIC-1: Core key contract | ✅ Done | `failure-mode-index.md` FMI-PARSER-008 (new, 2026-06-29) | Confirmed bug từ PARSER-REPORT |

## Living Docs Candidates

| Candidate | Disposition | Target | Ghi chú |
| --------- | ----------- | ------ | ------- |
| 3.1 Parser Design Pattern | ⏳ Deferred | — | Quá abstract; concrete patterns đưa vào `docs/knowledge/parser-implementation.md` |
| 3.2 Markdown Convention | ⏳ Deferred | — | Implicit trong existing parser code; chưa đủ unique để cần doc riêng |
| 3.3 Test Strategy | ✅ Partial | `docs/knowledge/parser-implementation.md` | Controller test pattern (plain unit, không @WebMvcTest) được permanentize |
| 3.4 Review Checklist (parser robustness) | ⏳ Watch | — | Đánh giá lại sau khi blackbox checklist xuất hiện thêm ≥ 1 parser ticket |
| 3.5 Ingestion Pipeline Pattern | ⏳ Deferred | — | Flow đã được mô tả trong `docs/architecture/data-flow-map.md` |

## Knowledge Candidates (từ PARSER-REPORT)

| Candidate | Disposition | Target |
| --------- | ----------- | ------ |
| ParseStatus enum contract (LDC-1) | ✅ Done | `docs/knowledge/parser-implementation.md` |
| sectionMap() UPPERCASE key contract (LDC-2) | ✅ Done | `docs/knowledge/parser-implementation.md` |
| Parser versioning convention (LDC-3) | ✅ Done | `docs/knowledge/parser-implementation.md` |
| Blackbox review checklist as standard (LDC-4) | ⏳ Watch | — | Promote sau ticket thứ 2 |

## Process Candidates (từ PARSER-REPORT)

| Candidate | Disposition | Lý do |
| --------- | ----------- | ----- |
| PC-1: Self-review accuracy | ❌ Not permanentized | AI process correction; không phải code-level pattern |
| PC-2: Full-occurrence scan on fix | ❌ Not permanentized | Too specific; một lần |
