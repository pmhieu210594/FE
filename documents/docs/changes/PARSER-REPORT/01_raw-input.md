# Spec – Markdown Parser cho `report.md` (MVP)

## 1. Mục tiêu

Chức năng parser `report.md` có nhiệm vụ:

- Trích xuất thông tin có cấu trúc từ file `report.md`
- Chuyển thành metadata phục vụ:
  - Evidence Quality Score
  - Traceability
  - Exception management

### Giới hạn (MVP)

- Không thực hiện webhook hoặc ingest
- Không xử lý business logic
- Không suy luận nội dung (no NLP)
- Chỉ parse theo cấu trúc Markdown

---

## 2. Input / Output

### 2.1 Input

- File: `docs/changes/<TICKET>/report.md`
- Optional:
  - YAML front matter (nếu có)

---

### 2.2 Output (JSON structure)

```json
{
  "ticket_id": "string | null",
  "parse_mode": "string",
  "parse_status": "FAILED | PARTIAL | DRAFT | OFFICIAL",
  "artifact_status": "present | invalid | missing",
  "content_hash": "string",
  "summary": "string | null",
  "impact": "string | null",
  "review_result": "string | null",
  "test_result": "string | null",
  "risks": "string | null",
  "open_issues": "string | null",
  "rollback": "string | null",
  "exceptions": "string | null",
  "section_count": "number",
  "table_count": "number",
  "warning_count": "number",
  "error_count": "number",
  "placeholder_count": "number",
  "missing_required_count": "number",
  "has_missing_required_sections": "boolean",
  "has_open_issue_detected": "boolean",
  "has_risk_detected": "boolean",
  "has_rollback_detected": "boolean"
}
```

---

## 3. Mapping Section

Parser chỉ parse theo heading rõ ràng:

| Markdown Heading              | Field         |
| ----------------------------- | ------------- |
| `## Tổng quan` / `## Summary` | summary       |
| `## Ảnh hưởng` / `## Impact`  | impact        |
| `## Kết quả review`           | review_result |
| `## Kết quả test`             | test_result   |
| `## Rủi ro`                   | risks         |
| `## Vấn đề còn lại`           | open_issues   |
| `## Rollback`                 | rollback      |
| `## Ngoại lệ`                 | exceptions    |

> Không suy đoán từ nội dung text.

---

## 4. Rules Parsing

### 4.1 Section-based

- Dựa vào heading (`##`, `###`)
- Nội dung section = từ heading → trước heading tiếp theo

---

### 4.2 List extraction

Không convert sang array
→ giữ nguyên dạng string từ MarkdownParserCore

---

### 4.3 Plain text → array (fallback)

```markdown
## Rủi ro

Có khả năng ảnh hưởng API client
```

→

```json
["Có khả năng ảnh hưởng API client"]
```

---

### 4.4 Empty section

→

```json
[]
```

---

### 4.5 Section detection

Không có sections_detected

Detection thông qua:

"has_open_issue_detected": true/false

---

## 5. YAML Front Matter (optional)

Nếu tồn tại:

```yaml
---
schema_version: sdd-artifact-v1
artifact_type: report
ticket_id: ABC-123
---
```

- Ưu tiên dùng metadata này
- Không suy đoán nếu thiếu

---

## 6. Parse Status

| Status   | Điều kiện                                     |
| -------  | --------------------------------------------- |
| FAILED   | Có errors                                     |
| PARTIAL  | Không errors nhưng có warnings                |
| DRAFT    | Không warning/error và parse_mode != official |
| OFFICIAL | parse_mode = official                         |

---

## 7. Errors

```json
{
  "code": "string",
  "severity": "warning | error",
  "message": "string",
  "sourcePath": "string",
  "sectionKey": "string | null",
  "line": "number"
}
```
---

## 8. Required Fields

TẤT CẢ fields là required:

```
summary, impact, review_result, test_result,
risks, open_issues, rollback, exceptions
```

---

## 9. Nguyên tắc thiết kế (MVP)

### Không làm

- Không NLP
- Không suy luận
- Không enrich dữ liệu
- Không tính score

### Chỉ làm

- Parse Markdown theo cấu trúc
- Extract đúng field
- Normalize JSON output

---

## 10. Acceptance Criteria

- Parse được ≥ 80% report.md trong MVP
- Không crash khi thiếu section
- Detect được thiếu section
- Output JSON hợp lệ
- Không lưu raw content ngoài phạm vi cần thiết

---

## 11. DB Persistence (MVP – bổ sung)

### 11.1 Nguyên tắc

- Không thay đổi thiết kế parser hiện tại
- Không tạo bảng riêng cho report content
- Chỉ bổ sung bước lưu DB tương tự parser hiện có
- Tuân thủ nguyên tắc:
  - metadata-first
  - repo là SSOT

---

### 11.2 Data flow bổ sung

```text
report.md
   ↓
parser (existing)
   ↓
parser_output (JSON)
   ↓
DB persistence layer (NEW - reuse pattern cũ)
   ↓
fact tables
```

---

### 11.3 Mapping vào DB

#### (1) Artifact Snapshot

Bảng: `tbl_fact_artifact_snapshot`

| Field                   | Mapping                  |
| ----------------------- | ------------------------ |
| artifact_type           | "report"                 |
| exists                  | true                     |
| hash                    | file hash                |
| schema_valid            | parse_status != "failed" |
| required_fields_missing | từ sections_detected     |

---

#### (2) Exception

Bảng: `tbl_fact_exception`

Nguồn: `sections.exceptions`

- Mỗi item → 1 record

| Field          | Mapping            |
| -------------- | ------------------ |
| ticket_id      | từ parser          |
| source         | "report.md"        |
| type           | nội dung exception |
| reason_present | true               |
| approved       | null (MVP)         |
| expiry         | null (MVP)         |

---

#### (3) Evidence Event

Bảng: `tbl_fact_evidence_event`

Sinh event từ parser output:

| Event                  | Condition             |
| ---------------------- | --------------------- |
| REPORT_CREATED         | file tồn tại          |
| REPORT_MISSING_SECTION | thiếu section         |
| REPORT_HAS_RISK        | risks not empty       |
| REPORT_HAS_OPEN_ISSUES | open_issues not empty |

---

#### (4) Data Quality

Bảng: `tbl_fact_data_quality`

| Field             | Mapping            |
| ----------------- | ------------------ |
| parse_error_count | length(errors)     |
| missing_count     | số section missing |
| source            | "report.md"        |

---

### 11.4 Staging (nếu hệ thống hiện tại có)

Nếu parser cũ đã có bảng staging → reuse:

`tbl_stg_parsed_artifact`

```json
{
  "artifact_type": "report",
  "ticket_id": "...",
  "parsed_json": {...},
  "parsed_at": "timestamp"
}
```

#### Lưu ý

- Không dùng làm source chính
- TTL ngắn (1–7 ngày)
- Chỉ phục vụ debug / retry

---

### 11.5 Scope giới hạn (MVP)

Parser KHÔNG:

- ghi trực tiếp vào `tbl_fact_metric_value`
- tính score
- xử lý business rule

→ các bước này thuộc downstream layer

---

### 11.6 Compatibility với hệ thống hiện tại

- Reuse cùng pattern lưu DB của parser hiện có
- Không tạo thêm pipeline mới
- Không thay đổi schema core

---
