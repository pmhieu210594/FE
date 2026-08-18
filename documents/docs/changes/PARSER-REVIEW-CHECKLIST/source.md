# Sources — Parser review-checklist.md (Final Aligned)

---

## 1. Tổng quan

Tài liệu này mô tả toàn bộ nguồn thông tin (sources) dùng để xây dựng Spec Pack cho Parser `review-checklist.md`, bao gồm:

* Phân tầng authority (tier-based)
* Mapping theo data flow thực tế
* Vai trò trong pipeline (Git → Landing → Parser → DWH)
* Gap và risk sau khi align với thiết kế final

---

## 2. Source Classification (Final)

### 🔴 Tier 1 — Constraint (Hard Rules)

| Source             | Path                               | Vai trò                | Authority |
| ------------------ | ---------------------------------- | ---------------------- | --------- |
| Safety Rules       | `.claude/rules/00-safety.md`       | Boundary hệ thống      | Absolute  |
| Style Rules        | `.claude/rules/10-style.md`        | Coding convention      | Absolute  |
| Architecture Rules | `.claude/rules/20-architecture.md` | Hexagonal constraint   | Absolute  |
| Security Rules     | `.claude/rules/30-security.md`     | Bảo mật, secret, error | Absolute  |
| Testing Rules      | `.claude/rules/40-testing.md`      | Test strategy          | Absolute  |

👉 Tất cả implementation phải tuân thủ 100%

---

### 🟠 Tier 2 — System Design (Docs)

Nguồn từ `docs/architecture/` và `docs/standards/`

#### 2.1 Architecture Docs

| Nhóm               | Vai trò                                          |
| ------------------ | ------------------------------------------------ |
| Data flow          | Định nghĩa pipeline Git → Landing → Parser → DWH |
| Service mapping    | Xác định layer placement                         |
| DB mapping         | Mapping vào fact table                           |
| External interface | Git connector                                    |

👉 Insight:

* Parser là **processing component trong pipeline**
* Không phải standalone util

---

#### 2.2 Standards Docs

| Nhóm     | Vai trò                   |
| -------- | ------------------------- |
| Coding   | Maintainability           |
| Security | Không đọc secret          |
| Testing  | Unit test bắt buộc        |
| Logging  | Traceability              |
| Review   | Template review-checklist |

👉 Insight quan trọng:

* review-checklist có template chuẩn
* Parser có thể dựa vào structure

---

### 🟢 Tier 3 — Feature Design (Final Spec)

| Source       | Path                        | Vai trò                    |
| ------------ | --------------------------- | -------------------------- |
| Final Design | `01_raw_input.md (updated)` | Spec chính thức của parser |

👉 Đây là:

* **Source of truth cho behavior parser**

---

### 🔵 Tier 4 — Data Pipeline Components

(NEW — từ thiết kế final)

| Component                    | Vai trò                 | Source       |
| ---------------------------- | ----------------------- | ------------ |
| Git Repository               | SSOT                    | Final Design |
| Git Connector                | Collect file + metadata | Final Design |
| Landing Layer                | Metadata staging        | Final Design |
| Parser                       | Processing              | Final Design |
| DWH (tbl_fact_artifact_snapshot) | Storage                 | Final Design |

👉 Đây không phải file, nhưng là **source logic bắt buộc**

---

## 3. Source of Truth (CRITICAL)

### 3.1 Repository là SSOT

* File `review-checklist.md` nằm trong Git
* Parser chỉ đọc từ:

  * Git connector
  * hoặc Landing layer

❌ Không đọc từ database

---

### 3.2 Database là derived

* Chỉ lưu metadata
* Không lưu raw markdown

---

## 4. Source Mapping theo Data Flow

```text
Git Repository (SSOT)
        ↓
Git Connector (source_path, content, hash)
        ↓
Landing Layer (metadata only)
        ↓
Parser (consume content)
        ↓
tbl_fact_artifact_snapshot (store metadata)
```

---

## 5. Coverage Analysis (Final)

### 5.1 Functional

| Capability                 | Covered | Source       |
| -------------------------- | ------- | ------------ |
| File parsing               | ✅       | Final Design |
| Required section detection | ✅       | Final Design |
| YAML parsing               | ✅       | Final Design |
| Parse status               | ✅       | Final Design |

---

### 5.2 Data Engineering

| Capability     | Covered | Source            |
| -------------- | ------- | ----------------- |
| Data flow      | ✅       | Architecture Docs |
| SSOT           | ✅       | Final Design      |
| Data lineage   | ✅       | Final Design      |
| Storage design | ✅       | Final Design      |
| Idempotency    | ✅       | Final Design      |

---

### 5.3 Non-functional

| Area            | Covered | Source            |
| --------------- | ------- | ----------------- |
| Security        | ✅       | Rules + Standards |
| Testing         | ✅       | Rules             |
| Maintainability | ✅       | Standards         |
| Logging         | ✅       | Standards         |

---

## 6. Authority Rule (Final)

Priority:

1. Tier 1 — Rules
2. Tier 2 — Architecture / Standards
3. Tier 3 — Final Design
4. Tier 4 — Pipeline logic

---

## 7. Major Alignment Points

### 🔥 A1 — Parser thuộc pipeline, không standalone

* Bị ràng buộc bởi:

  * Git connector
  * Landing layer
  * DWH

---

### 🔥 A2 — SSOT rõ ràng

* Repo = source
* DB = derived

---

### 🔥 A3 — Storage fixed

* Bắt buộc dùng:

  ```
  tbl_fact_artifact_snapshot
  ```

---

### 🔥 A4 — Data lineage bắt buộc

* source_path
* source_hash
* parser_version
* parsed_at

---

### 🔥 A5 — Idempotency theo source_hash

* Không parse lại nếu không đổi

---

## 8. Gap Analysis (Updated)

### 🔴 Không còn gap lớn

Thiết kế đã cover:

* Data flow
* Storage
* Lineage
* Behavior

---

### 🟠 Minor Gap

1. Keyword list chưa exhaustive
2. Markdown edge cases chưa full

---

### 🟡 Optional

3. Template enforcement chưa bắt buộc

---

## 9. Risk Assessment

| Risk                   | Impact | Mitigation             |
| ---------------------- | ------ | ---------------------- |
| File không đúng format | Medium | parse_status = warning |
| Keyword mismatch       | Low    | word-boundary          |
| Missing section        | Low    | fallback keyword       |

---

## 10. Assumptions

* File encoding UTF-8
* Markdown basic format
* Checklist không strict schema

---

## 11. Recommendation

### ✅ Production-ready

* Spec đã đủ để implement pipeline parser

---

### ✅ Nên có

* Config keyword mapping
* Logging structured

---

### ❌ Không cần

* NLP
* Complex parser

---

# Kết luận

Sources hiện tại:

* Fully aligned với thiết kế final
* Không còn thiếu phần critical
* Có thể dùng làm nền cho Phase 3 (implementation)
