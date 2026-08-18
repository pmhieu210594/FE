# PARSER-REVIEW-CHECKLIST blackbox-testcases.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# 1. Mục tiêu

Xác minh chức năng parser `review-checklist.md` theo hướng black-box:

* Không phụ thuộc implementation
* Dựa trên input/output theo specification
* Đảm bảo đáp ứng Acceptance Criteria (AC)

---

# 2. Phạm vi

* Parsing markdown input
* Section detection: SECURITY / TEST / PERFORMANCE
* ticket_id inference từ 3 nguồn
* parseMode ảnh hưởng tới parse_status
* Validate: parse_status, artifactExists, warnings
* parsedSummary đầy đủ khi có warning

---

# 3. Danh sách test case

---

## 3.1 AC-1 — Content hợp lệ đủ 3 sections → DRAFT

### TC-01 (P0) — Full valid content

**Input**

```markdown
## Security
Đã review security impact. Không có thay đổi auth.

## Test
Unit test và integration test đã pass.

## Performance
Không có ảnh hưởng performance.
```

sourcePath = `docs/changes/FEAT-123/review-checklist.md`, parseMode = `"draft"`

**Expected**

* `parseStatus` = `DRAFT`
* `requiredFieldsMissing` = `[]`
* `warnings` = `[]`
* `artifactExists` = `true`
* `artifactStatus` = `"present"`
* `parsedSummary.missing_required_count` = `0`

---

### TC-02 (P1) — Sections với content đơn giản

**Input**

```markdown
## Security
OK

## Test
OK

## Performance
OK
```

**Expected**

* `parseStatus` = `DRAFT`
* `requiredFieldsMissing` = `[]`

---

## 3.2 AC-2 — Null/empty content → artifactExists=false

### TC-03 (P0) — Empty string input

**Input**

```text
content = ""
```

**Expected**

* `artifactExists` = `false`
* `artifactStatus` = `"missing"`
* `parseStatus` ≠ `FAILED` tự động — phụ thuộc warnings emitted

---

### TC-04 (P1) — Null input

**Input**

```text
content = null
```

**Expected**

* `artifactExists` = `false`
* `artifactStatus` = `"missing"`
* Parser không crash (null được normalize thành `""`)

---

### TC-05 (P1) — Whitespace-only input

**Input**

```text
content = "   \n   "
```

**Expected**

* `artifactExists` = `false`
* `artifactStatus` = `"missing"`

---

## 3.3 AC-3 — Thiếu section → warning required_fields_missing

### TC-06 (P0) — Thiếu section PERFORMANCE

**Input**

```markdown
## Security
Reviewed.

## Test
Passed.
```

**Expected**

* `warnings` chứa `ParsingIssue(code="required_fields_missing")`
* `requiredFieldsMissing` = `["section:performance"]`
* `parseStatus` = `PARTIAL`
* `parsedSummary.missing_required_count` = `1`

---

### TC-07 (P0) — Thiếu cả 3 sections

**Input**

```markdown
# Review Checklist

Không có security, test, performance section.
```

**Expected**

* `requiredFieldsMissing` = `["section:security", "section:test", "section:performance"]`
* `parsedSummary.has_missing_required_sections` = `true`
* `parseStatus` = `PARTIAL`

---

### TC-08 (P1) — Section tồn tại nhưng blank

**Input**

```markdown
## Security

## Test
Passed.

## Performance
OK.
```

**Expected**

* `requiredFieldsMissing` chứa `"section:security"` (section tồn tại nhưng blank)
* `parseStatus` = `PARTIAL`

---

## 3.4 AC-4 — parseMode=official + no issues → OFFICIAL

### TC-09 (P0) — Official mode với content đầy đủ

**Input**

```markdown
## Security
Reviewed.

## Test
Passed.

## Performance
OK.
```

sourcePath = `docs/changes/FEAT-123/review-checklist.md`, parseMode = `"official"`

**Expected**

* `parseStatus` = `OFFICIAL`
* `parseMode` = `"official"`

---

### TC-10 (P1) — Official mode nhưng thiếu section → PARTIAL (không phải OFFICIAL)

**Input**

```markdown
## Security
Reviewed.
```

parseMode = `"official"`

**Expected**

* `parseStatus` = `PARTIAL` (warnings trump parseMode)

---

## 3.5 AC-5 — ticket_id inference 3 nguồn

### TC-11 (P0) — ticket_id từ YAML front matter

**Input**

```markdown
---
ticket_id: FEAT-456
---

## Security
OK
## Test
OK
## Performance
OK
```

**Expected**

* `ticketId` = `"FEAT-456"`

---

### TC-12 (P0) — ticket_id từ source path

**Input**

```text
content = "## Security\nOK\n## Test\nOK\n## Performance\nOK"
sourcePath = "docs/changes/FEAT-789/review-checklist.md"
```

**Expected**

* `ticketId` = `"FEAT-789"`

---

### TC-13 (P1) — ticket_id từ header metadata (fallback)

**Input**

```markdown
**Ticket ID**: FEAT-321

## Security
OK
## Test
OK
## Performance
OK
```

sourcePath = null

**Expected**

* `ticketId` = `"FEAT-321"` (inferred từ header metadata)

---

### TC-14 (P1) — Không infer được ticket_id

**Input**

```text
content = "## Security\nOK\n## Test\nOK\n## Performance\nOK"
sourcePath = null
```

**Expected**

* `ticketId` = null
* `warnings` chứa `ParsingIssue(code="ticket_id_missing")`
* `parseStatus` = `PARTIAL`

---

### TC-15 (P2) — ticket_id format không hợp lệ

**Input**

```yaml
ticket_id: ???
```

**Expected**

* `ticketId` = null (invalid format không pass validation)
* Warning `ticket_id_missing`

---

## 3.6 AC-6 — Parse có warning vẫn có parsedSummary đầy đủ

### TC-16 (P0) — parsedSummary populated dù thiếu section

**Input**

```markdown
## Security
Reviewed.
```

sourcePath = `docs/changes/FEAT-123/review-checklist.md`

**Expected**

* `parsedSummary` không null
* `parsedSummary.ticket_id` = `"FEAT-123"`
* `parsedSummary.parse_status` = `"PARTIAL"`
* `parsedSummary.missing_required_count` = `2`
* `parsedSummary.security` có nội dung
* `parsedSummary.test` = null
* `parsedSummary.performance` = null

---

## 3.7 AC-7 — Idempotency ở scanner

### TC-17 (P1) — Parser không có idempotency logic

**Verify**

* `ReviewChecklistMarkdownParser.parse()` không có so sánh `contentHash` với DB
* Idempotency được đảm bảo bởi `ArtifactScannerService.buildSnapshot()` qua `needParse` flag

---

## 3.8 Operation viewpoint

### TC-18 (P1) — Batch processing

**Input**

* Multiple markdown files được scan

**Expected**

* Không crash toàn bộ batch
* Mỗi file xử lý độc lập

---

## 3.9 Logging / Audit

### TC-19 (P2) — Log thông tin parse

**Expected**

* Log `"Review-checklist parsed for {}: parseStatus={}"` sau parse
* Log `"Review-checklist parser failed for {}"` khi có exception

---

# 4. Mapping AC ↔ Test Case

| AC    | Test Cases              |
| ----- | ----------------------- |
| AC-1  | TC-01, TC-02            |
| AC-2  | TC-03, TC-04, TC-05     |
| AC-3  | TC-06, TC-07, TC-08     |
| AC-4  | TC-09, TC-10            |
| AC-5  | TC-11, TC-12, TC-13, TC-14, TC-15 |
| AC-6  | TC-16                   |
| AC-7  | TC-17                   |

---

# 5. Priority Summary

| Priority | Test Cases                           |
| -------- | ------------------------------------ |
| P0       | TC-01, TC-03, TC-06, TC-07, TC-09, TC-11, TC-12, TC-16 |
| P1       | TC-02, TC-04, TC-05, TC-08, TC-10, TC-13, TC-14, TC-17, TC-18 |
| P2       | TC-15, TC-19                         |

---

# 6. Kết luận

Black-box testcases đảm bảo:

* Cover đầy đủ AC-1 đến AC-7
* Có đủ:

  * normal case (TC-01, TC-02, TC-09)
  * error/warning case (TC-06, TC-07, TC-14)
  * boundary case (TC-03 đến TC-05, TC-08)
* Không phụ thuộc implementation
* Expected result rõ ràng, kiểm chứng được
