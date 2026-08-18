# SOURCE-AVAILABILITY – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Tổng quan

Tài liệu này xác định mức độ availability của source code, tài liệu và dependency cần thiết để implement parser `ReportMarkdownParser`.

---

## 2. Input tài liệu

| Path                                       | Trạng thái | Ghi chú           |
| ------------------------------------------ | ---------- | ----------------- |
| docs/changes/PARSER-REPORT/spec-pack.md    | Available  | AC chính          |
| docs/changes/PARSER-REPORT/context.md      | Available  | Context nghiệp vụ |
| docs/changes/PARSER-REPORT/ticket-rules.md | Available  | Rule parsing      |
| docs/architecture/                         | Available  | Pattern hệ thống  |
| docs/standards/                            | Available  | Coding standard   |
| .claude/rules/                             | Available  | Rule nội bộ       |

---

## 3. Source code

| Thành phần            | Trạng thái | Ghi chú        |
| --------------------- | ---------- | -------------- |
| MarkdownParserCore    | Available  | Reuse          |
| Existing ParseService | Available  | Reuse pattern  |
| Persistence Port      | Available  | Có thể mở rộng |
| DTO ParseSnapshot     | Available  | Reuse          |
| DTO ParseField        | Available  | Reuse          |

---

## 4. Database

| Thành phần          | Trạng thái      | Ghi chú              |
| ------------------- | --------------- | -------------------- |
| ParseSnapshot table | Available       | JSON column          |
| ParseField table    | Available       | No change            |
| Enum parseStatus    | Verify required | Cần check đủ giá trị |

---

## 5. API / Integration

| Thành phần         | Trạng thái | Ghi chú   |
| ------------------ | ---------- | --------- |
| Artifact ingestion | Available  | Caller    |
| CI pipeline        | Available  | Trigger   |
| FE consumer        | Available  | Read-only |

---

## 6. Missing / Risk

| Item                          | Mức độ | Ghi chú                 |
| ----------------------------- | ------ | ----------------------- |
| parseStatus enum completeness | Medium | Có thể thiếu            |
| Markdown edge-case handling   | Medium | Nested structure        |
| Section naming inconsistency  | Low    | Handle case-insensitive |

---

## 7. Kết luận

* Không có blocker lớn
* Có thể implement ngay
* Cần verify enum và edge-case parsing
