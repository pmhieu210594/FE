# TEST PLAN – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-29

---

## 1. Objective

Đảm bảo parser:

* Trích xuất đúng cấu trúc từ `report.md`
* Phát hiện được các vấn đề trong nội dung
* Hoạt động ổn định với nhiều dạng input

---

## 2. Scope

Bao gồm:

* Section parsing
* Data normalization
* Validation logic
* Warning generation

---

## 3. Implementation Context (Added 2026-06-29)

Sau khi đọc source code thực tế, các điểm sau ảnh hưởng đến test strategy:

### 3.1 FAILED case (AC-1)

`ReportMarkdownParser` không trực tiếp sinh `errors`. Toàn bộ errors đến từ `MarkdownParserCore`:

| MarkdownParserCore trigger | Condition | Result |
| -------------------------- | --------- | ------ |
| `markdown_empty` (error) | content là blank/null | → FAILED |

Không có trigger nào khác cho FAILED trong implementation hiện tại. Missing fields → warning (PARTIAL), không phải error.

**Test AC-1**: Input là empty string `""` hoặc whitespace-only `"   \n  "`.

### 3.2 Section key case mismatch (Critical Risk)

`MarkdownParserCore.canonicalSectionKey()` trả về **uppercase** canonical keys (ví dụ: `"SUMMARY"`, `"OPEN_ISSUES"`).

`ReportMarkdownParser.ALL_FIELDS` chứa **lowercase** keys (`"summary"`, `"open_issues"`).

`detectMissingFields()` gọi `sections.get(field)` với lowercase → có thể **luôn trả về null**, gây mọi section được báo là missing.

→ Test phải verify behavior này và xác định là bug hay expected.

### 3.3 Controller test scope

Pattern từ `SelfReviewMarkdownParserControllerTest` (reference implementation):
* **Plain unit test** — không dùng `@WebMvcTest`
* Instantiate `new ReportMarkdownParserController(new ReportMarkdownParser())` trực tiếp
* Test security guards + response shape

---

## 4. AC ↔ Test Type Matrix

| AC ID | Description | Test Type | Class | Test Method |
| ----- | ----------- | --------- | ----- | ----------- |
| AC-1 | Blank content → error → FAILED | Unit | `ReportMarkdownParserTest` | `parse_emptyContent_returnsStatusFailed` |
| AC-1 | Whitespace-only → FAILED | Unit | `ReportMarkdownParserTest` | `parse_whitespaceOnlyContent_returnsStatusFailed` |
| AC-2 | Missing required section → warning → PARTIAL | Unit | `ReportMarkdownParserTest` | `parse_missingSections_returnsStatusPartial` |
| AC-2 | Placeholder content → warning → PARTIAL | Unit | `ReportMarkdownParserTest` | `parse_placeholderContent_returnsStatusPartial` |
| AC-3 | All valid + no parseMode → DRAFT | Unit | `ReportMarkdownParserTest` | `parse_fullValidReport_returnsStatusDraft` |
| AC-3 | All valid + parseMode=official → OFFICIAL | Unit | `ReportMarkdownParserTest` | `parse_officialMode_returnsStatusOfficial` |
| AC-4 | Section content là String (không array) | Unit | `ReportMarkdownParserTest` | `parse_sectionWithBulletList_returnsString` |
| AC-5 | Missing field → warning (không phải error) | Unit | `ReportMarkdownParserTest` | `parse_missingField_generatesWarningNotError` |
| AC-6 | Required fields = ALL_FIELDS (8 fields) | Unit | `ReportMarkdownParserTest` | `allFields_containsExactly8RequiredKeys` |
| AC-7 | TicketId inferred từ path | Unit | `ReportMarkdownParserTest` | `parse_ticketIdInferredFromSourcePath` |
| AC-7 | TicketId missing → warning | Unit | `ReportMarkdownParserTest` | `parse_noTicketIdSource_generatesTicketIdWarning` |
| AC-8 | Parse → persist snapshot + sections | — | Deferred | See section 7 |
| — | Section key case mismatch verification | Unit | `ReportMarkdownParserTest` | `parse_sectionKeyLookup_detectsMissingFieldsCorrectly` |
| — | Controller: path outside scope → exception | Unit | `ReportMarkdownParserControllerTest` | `parseFile_rejectsPathsOutsideReportScope` |
| — | Controller: inline parse → response shape | Unit | `ReportMarkdownParserControllerTest` | `parseInline_returnsEnvelope` |

---

## 5. Test Scenarios

### 5.1 Valid Input

* File đầy đủ 8 section, nội dung hợp lệ, sourcePath chứa ticket ID
* Expected: DRAFT (default mode) hoặc OFFICIAL (với parseMode=official)

### 5.2 Missing Section

* Thiếu 1 hoặc nhiều section trong ALL_FIELDS
* Expected: warning `required_fields_missing`, parseStatus = PARTIAL

### 5.3 Empty Content

* `""` hoặc `null`
* Expected: error `markdown_empty` từ MarkdownParserCore, parseStatus = FAILED

### 5.4 Whitespace-only Content

* `"   \n  \t  "`
* Expected: treated as blank → error → FAILED

### 5.5 Placeholder Content

* Section chứa TBD / TODO / `---` / `<...>`
* Expected: warning `placeholder_detected`, parseStatus = PARTIAL (not error)

### 5.6 Section with Bullet List

* Section chứa bullet list (`- item1\n- item2`)
* Expected: content là raw string, không convert thành array

### 5.7 TicketId Inference

* sourcePath = `docs/changes/PARSER-REPORT/report.md`
* Expected: `ticketId = "PARSER-REPORT"`

### 5.8 No TicketId Source

* Blank sourcePath, no frontMatter ticket_id
* Expected: warning `ticket_id_missing`

### 5.9 Section Key Case Lookup (Critical)

* Parse markdown với `## Summary` heading
* Check `sections.get("summary")` vs `sections.get("SUMMARY")` → verify which key exists
* Expected: xác định bug hoặc confirm working correctly

### 5.10 Controller Security Guards

* `parseFile` với path ngoài `/changes/<TICKET>/report.md` → IllegalArgumentException
* `parseFile` với extension không phải `.md` → IllegalArgumentException

---

## 6. Test Data Strategy

### Fixture files

```
src/test/resources/test-fixtures/PARSER-REPORT/
  ├── valid-full-report.md        # Đủ 8 section, nội dung thật
  ├── missing-two-sections.md     # Thiếu impact + rollback
  ├── placeholder-content.md      # Sections = TBD / TODO
  └── list-content.md             # Section có bullet list
```

### Inline strings

Dùng Java text blocks (`"""..."""`) cho các edge case ngắn (empty, whitespace, single section).

---

## 7. Tests cố ý bỏ qua và lý do

| Test | Lý do |
| ---- | ----- |
| AC-8: DB integration (parse → upsertSnapshot) | `ReportParseService` chưa được tạo; persistence chưa wired |
| Duplicate section strategy | Phụ thuộc `MarkdownParserCore` first-wins merge; không thể override ở parser level |
| Performance < 100ms | Non-functional; tracked separately |
| FE tests | Không có FE implementation |
| Semantic content validation | Out of scope per spec-pack §2.2 |

---

## 8. Spec Discrepancy — Noted

`spec-pack.md §9` example:
```
"" → "parseStatus": "WARNING"
```

Trạng thái `WARNING` **không tồn tại** trong enum. Behavior thực tế: empty content → error `markdown_empty` → `FAILED`.

→ Spec example có lỗi. Test sẽ assert theo implementation thực tế (FAILED), không theo spec example.

---

## 9. Success Criteria

* Tất cả test trong AC matrix pass
* Section key case mismatch được xác định (bug hoặc working as intended)
* Không có lỗi runtime
* Warning phản ánh đúng tình trạng dữ liệu

---

## 10. Test Types

### 10.1 Unit Test

* Test từng function:
  * `parse()` — status logic
  * `detectMissingFields()` — required field detection
  * `inferTicketId()` — ticket ID inference
  * `determineParseStatus()` — status rules
  * `buildParsedSummary()` — JSON shape

### 10.2 Integration Test (Deferred)

* Test toàn bộ flow parse → persist (blocked on `ReportParseService`)

### 10.3 Controller Unit Test

* Instantiate controller + parser trực tiếp
* Test HTTP binding, security guards, response shape
* Pattern: plain unit test (không dùng `@WebMvcTest`)

---
