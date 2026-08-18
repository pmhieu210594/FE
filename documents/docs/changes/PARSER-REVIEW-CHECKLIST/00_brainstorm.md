# Brainstorm — Parser review-checklist.md (Final Aligned)

---

## 1. Mục tiêu suy nghĩ

* Hiểu đúng bản chất parser trong **data pipeline**
* Không xem parser là function đơn lẻ
* Align với:

  * Git-based ingestion
  * Landing layer
  * DWH (tbl_fact_artifact_snapshot)

---

## 2. Reframing Problem (QUAN TRỌNG)

### ✅ Đúng (theo thiết kế)

* Parser = **một bước trong data pipeline**

```text
Git → Connector → Landing → Parser → DWH
```

👉 Parser là:
→ **Data transformation stage**

---

## 3. Core Responsibility

Parser phải:

1. Nhận input từ upstream (Git connector / landing)
2. Xử lý markdown → metadata
3. Ghi kết quả vào fact table
4. Đảm bảo:

   * idempotency (qua scanner, không phải parser)
   * lineage
   * data quality

---

## 4. Input Thinking

### Input của parser

Parser thực nhận (3 overloads):

```java
parse(String content)
parse(String content, String sourcePath)
parse(String content, String sourcePath, String parseMode)
```

👉 Insight:

* Parser không tự đọc file từ disk
* Parser **consume data đã collect**
* `source_hash` và `updated_at` **không** là input của parser — được quản lý bởi scanner

---

## 5. SSOT Thinking

### Nguyên tắc:

* Git repository = SSOT
* Database = derived

👉 Implication:

* Không được:

  * đọc file từ DB
  * dùng DB làm source truth

* Parser luôn:

  * trust Git data

---

## 6. Data Flow Thinking

### Pipeline đầy đủ:

```text
Git Repo
  ↓
Git Connector
  ↓
Landing Layer (metadata only)
  ↓
ArtifactScannerService (idempotency check via buildSnapshot())
  ↓
ReviewChecklistMarkdownParser.parse()
  ↓
persistReviewChecklistParse()
  ↓
tbl_fact_artifact_snapshot + tbl_parsed_section
```

---

### Key realization:

* Parser không control upstream
* Parser không control downstream
* Parser chỉ:
  → **transform + enrich**

---

## 7. Parsing Logic Thinking

### Core logic — section-based (FINAL DECISION):

1. Delegate sang `MarkdownParserCore.parse()` → `MarkdownDocument`
2. Infer `ticket_id` từ 3 nguồn (front matter → path → header metadata)
3. Check required sections (`detectMissingFields()`)
4. Check placeholder
5. Build `parsedSummary` + trả về `ParsedArtifact`

---

### Không nên:

* parse full AST markdown
* keyword-based detection (đã loại bỏ)
* over-engineer

---

## 8. Required Section Detection Thinking

### Requirement:

* Detect sự tồn tại của 3 heading sections:

  * SECURITY
  * TEST
  * PERFORMANCE

---

### Strategy đã chọn:

#### Section-based detection ✅

* `sections.get("SECURITY")` — check null/blank
* `sections.get("TEST")` — check null/blank
* `sections.get("PERFORMANCE")` — check null/blank

Nếu blank → `requiredFieldsMissing.add("section:<field>")`

#### Không dùng keyword-based ❌

* Không match "security/auth/secret" trong text
* Không match "test/qa" trong text
* Quyết định: section-based là deterministic và không có false positive từ content

---

## 9. Parse Status Thinking

### Values thực tế:

| Status   | Điều kiện                                       |
| -------- | ----------------------------------------------- |
| FAILED   | Có errors                                       |
| PARTIAL  | Có warnings (không có errors)                   |
| OFFICIAL | Không warning/error + parseMode = "official"    |
| DRAFT    | Không warning/error + parseMode ≠ "official"    |

### Insight:

* Không drop record khi lỗi
* Luôn ghi vào fact table (kể cả PARTIAL/FAILED)

---

## 10. Data Modeling Thinking

### Output không phải JSON thuần

→ Output = **ParsedArtifact record** (19 fields) + **parsedSummary** map

---

### Mapping:

Parser output → `tbl_fact_artifact_snapshot` (qua `parsedSummary`)

---

### parsedSummary chứa:

```
ticket_id, parse_mode, parse_status, artifact_status, content_hash, parser_version,
security, test, performance (section content),
section_count, table_count, warning_count, error_count, placeholder_count,
missing_required_count, has_missing_required_sections,
has_open_issue_detected, has_risk_detected, has_rollback_detected
```

---

## 11. Data Lineage Thinking

### Bắt buộc:

* `sourcePath` (từ parser)
* `contentHash` (từ parser = source_hash)
* `parserVersion` (từ parser)
* `job_run_id` = `connectorRunId` (từ scanner khi persist)
* `parsed_at` = timestamp khi persist (từ scanner)

---

### Ý nghĩa:

* trace back dữ liệu
* debug pipeline
* audit

---

## 12. Idempotency Thinking

### Rule:

* Nếu `contentHash` không đổi:
  → `needParse = false` → parser không được gọi

---

### Insight:

* **Parser không có idempotency logic**
* Idempotency thuộc `ArtifactScannerService.buildSnapshot()`

---

## 13. Architecture Thinking

Parser thuộc:

* **Domain layer** (pure Java, không có framework dependency)

Không thuộc:

* Controller
* Infrastructure

---

### Dependency:

* Không DB dependency
* Không external API
* Chỉ phụ thuộc `MarkdownParserCore` (cùng domain layer)

→ Pure processing unit

---

## 14. Storage Thinking

### Fixed:

```text
tbl_fact_artifact_snapshot (parsedSummary)
tbl_parsed_section (per section content)
```

---

### Không được:

* Tạo bảng mới
* Lưu raw markdown

---

### Design pattern:

* `parsedSummary` map → JSONB column trong snapshot
* `tbl_parsed_section` → mỗi section là một row

---

## 15. Data Quality Thinking

### Nguyên tắc:

* Parse lỗi vẫn ghi record
* Không silent failure

---

### Insight:

* Dữ liệu lỗi cũng là signal
* `DataQualityRecord` được insert khi `requiredFieldsMissing` không rỗng hoặc có errors

---

## 16. Risk Exploration

### 🔴 High

1. Sai section heading → silent miss (section tên "Security" thay vì "## Security")
2. Không ghi lineage → mất traceability

---

### 🟠 Medium

3. Markdown không chuẩn
4. Heading case mismatch (handled bởi MarkdownParserCore uppercase normalization)

---

### 🟡 Low

5. Encoding issues

---

## 17. Design Decisions (Final)

| Area        | Decision                              |
| ----------- | ------------------------------------- |
| Parser role | pipeline stage                        |
| Input       | từ connector (content + sourcePath + parseMode) |
| Output      | ParsedArtifact record + parsedSummary |
| Storage     | tbl_fact_artifact_snapshot + tbl_parsed_section |
| SSOT        | Git                                   |
| Idempotency | source_hash (via scanner, không phải parser) |
| Parsing     | section-based (MarkdownParserCore delegate) |
| Keyword detection | không dùng                    |
| NLP         | không dùng                           |

---

## 18. Things NOT to Do

* Không đọc DB làm source
* Không lưu raw markdown
* Không tạo bảng mới
* Không keyword-based matching
* Không implement idempotency trong parser

---

## 19. Open Questions (Resolved)

* Keyword có cần config external không? → **Không áp dụng**: section-based, không keyword
* Có cần versioning parser logic không? → **Có**: `PARSER_VERSION = "review-checklist-markdown-parser-v1"`

---

## 20. Future Thinking

* Quality scoring theo section content quality
* Template enforcement (strict heading format)

---

# Kết luận

Parser không phải là:
→ utility đọc markdown + keyword matching

Mà là:
→ **data transformation component trong pipeline ingestion** với section-based detection

Tư duy đúng:

* Pipeline-first
* Metadata-first
* SSOT-first
* Lineage-aware
* Section-based (không keyword-based)
