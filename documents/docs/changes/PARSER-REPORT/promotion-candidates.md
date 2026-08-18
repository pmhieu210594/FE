# PROMOTION CANDIDATES – PARSER-REPORT

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-29
**Author**: Claude
**Purpose**: Tổng hợp các learnings, patterns, và corrections từ ticket này đủ điều kiện để promote vào permanent documentation.

---

## 1. Failure Mode Index — Candidates

### FMIC-1: MarkdownParserCore key contract mismatch

**Category**: Parser implementation trap

**Summary**: `MarkdownParserCore.sectionMap()` trả về UPPERCASE canonical keys. Parser mới dùng lowercase lookup → `sections.get(field)` luôn null → silent failure.

**Occurred in**: `ReportMarkdownParser.detectMissingFields()` và `buildParsedSummary()` (ISSUE-1, 2026-06-29)

**Symptom**: `parseStatus` luôn `PARTIAL` với mọi non-empty content. parsedSummary section fields đều null. Không có exception.

**Root cause**: Contract giữa Core và parser layer không được document. Không có compile-time guard.

**Fix applied**:
```java
// detectMissingFields():
sections.get(field.toUpperCase())   // was: sections.get(field)

// buildParsedSummary():
sections.get(key.toUpperCase())     // was: sections.get(key)
```

**Proposed rule cho FMI**:
- Tên: "Parser/Core key format contract"
- Rule: Trước khi implement lookup vào `sectionMap()`, verify key format bằng một test đơn giản asserting `sections.containsKey("SUMMARY")` vs `sections.containsKey("summary")`
- Trigger: Bất kỳ parser mới nào reuse `MarkdownParserCore`
- Severity nếu vi phạm: Major (silent wrong output, khó detect nếu không có test assert DRAFT/OFFICIAL)

---

### FMIC-2: Service layer skip → AC gap

**Category**: Implementation completeness trap

**Summary**: impl-plan định nghĩa service layer. Implementation skip service layer; controller gọi parser trực tiếp. AC yêu cầu persistence không fulfilled. Không có compile error, không có test failure.

**Occurred in**: PARSER-REPORT — `ReportParseService` không tạo (ISSUE-2)

**Proposed rule cho FMI**:
- Tên: "impl-plan step completeness check"
- Rule: Trước khi close ticket, map từng step trong impl-plan → artifact. Nếu step bị skip, phải có explicit deferral decision ghi trong ticket document.
- Trigger: Bất kỳ ticket nào có impl-plan với nhiều steps
- Severity nếu vi phạm: Major (AC không fulfilled, không phát hiện nếu không có integration test)

---

## 2. Living Docs — Candidates

### LDC-1: ParseStatus enum — FE/BE contract page

**Target document**: `docs/standards/` hoặc shared FE/BE contract page

**Change type**: Add / Clarify

**Content to add**:
```
ParseStatus values (tất cả artifact parsers):
  FAILED   — errors not empty
  PARTIAL  — warnings not empty (và không có errors)
  DRAFT    — không có errors/warnings; parseMode ≠ "official"
  OFFICIAL — không có errors/warnings; parseMode == "official"

Không tồn tại: WARNING (lỗi trong một số spec draft cũ)
```

**Urgency**: High — lỗi `parseStatus: "WARNING"` đã xuất hiện trong spec-pack ban đầu và được correction notice sửa lại. Cần document chính thức để không lặp lại ở parser khác.

---

### LDC-2: MarkdownParserCore — sectionMap() key format

**Target document**: Javadoc của `MarkdownParserCore.sectionMap()` hoặc `docs/architecture/parser-core.md`

**Change type**: Add

**Content to add**:
```
sectionMap() returns keys in UPPERCASE_WITH_UNDERSCORES format,
normalized by canonicalSectionKey().

Examples:
  "Summary"      → "SUMMARY"
  "Open Issues"  → "OPEN_ISSUES"
  "Review Result" → "REVIEW_RESULT"

Consumers MUST use uppercase lookup:
  sections.get(field.toUpperCase())
  // NOT: sections.get(field)
```

**Urgency**: High — không có document hiện tại; ISSUE-1 là direct consequence.

---

### LDC-3: Parser versioning convention

**Target document**: `docs/standards/coding.md` (backend section)

**Change type**: Add

**Content to add**:
```
Parser version string format: <artifact-type>-parser:v<n>

Examples:
  report-parser:v1
  spec-pack-parser:v1
  self-review-parser:v1

Dùng trong ParseSnapshot.parserVersion field.
Increment major version khi schema của parsedSummary thay đổi.
```

**Urgency**: Medium — convention đã dùng nhất quán trong implementations hiện có nhưng chưa documented.

---

### LDC-4: Blackbox review checklist — standard artifact cho parser tickets

**Target document**: `docs/standards/testing.md` hoặc ticket template

**Change type**: Add

**Content to add**:
```
Parser tickets nên include blackbox-review-checklist.md bên cạnh test-plan.md.

Checklist template: docs/changes/PARSER-REPORT/blackbox-review-checklist.md

Sections cần có:
  1. AC Coverage Matrix (BB case → test method mapping)
  2. Input dimension coverage
  3. Output dimension coverage
  4. ParseStatus all-values verification
  5. Known gaps và justification
  6. Reviewer sign-off
```

**Urgency**: Low-Medium — process improvement; không blocking nhưng tạo ra test coverage consistency.

---

## 3. Process — Candidates

### PC-1: Self-review accuracy rule

**Summary**: Phiên bản đầu của `self-review.md` chứa fabricated content (wrong language, non-existent paths, false test results). Đã được correction notice rewrite.

**Proposed rule**:
- Self-review phải derive từ reading actual source code và running actual commands
- Không được viết self-review từ expectation hoặc assumption về implementation
- Nếu code chưa implement → ghi rõ "NOT IMPLEMENTED" thay vì mô tả expected behavior như fact

**Target**: Ticket workflow documentation / onboarding

---

### PC-2: ISSUE-1b lesson — scan toàn bộ occurrences trước khi close fix

**Summary**: Fix ISSUE-1 sửa hai method chính nhưng bỏ sót 3 dòng detection flags ở cuối `buildParsedSummary()`. Pattern lowercase key lookup xuất hiện ở nhiều chỗ trong cùng một method.

**Proposed rule**:
- Khi fix một pattern bug (e.g., lowercase vs uppercase key lookup), grep toàn bộ file/class để tìm tất cả occurrences trước khi close
- Mark residual occurrences explicitly (ISSUE-1b) thay vì để silent

---

## 4. Deferred Items — Tracking

| Item | Description | Target ticket |
| ---- | ----------- | ------------- |
| AC-8 | `ReportParseService` + persistence wiring vào `tbl_fact_artifact_snapshot` / `tbl_fact_artifact_parsed_section` | TBD |
| ISSUE-1b | Fix `has_open_issue_detected`, `has_risk_detected`, `has_rollback_detected` flags → dùng uppercase lookup | Có thể bundle vào AC-8 ticket |
| HD-1 | Confirm AC-8 deferral chính thức | Human decision cần trước khi close PARSER-REPORT |
| HD-2 | Confirm ISSUE-1b deferral | Human decision |
| HD-3 | TicketId fallback behavior khi sourcePath không match | Cần spec clarification |

---

## 5. Summary Table

| Candidate | Category | Target | Urgency |
| --------- | -------- | ------ | ------- |
| FMIC-1: Core key contract | Failure Mode Index | Parser implementation guide | High |
| FMIC-2: Service layer skip | Failure Mode Index | impl-plan checklist | High |
| LDC-1: ParseStatus enum | Living Docs | FE/BE contract | High |
| LDC-2: sectionMap() key format | Living Docs | MarkdownParserCore Javadoc | High |
| LDC-3: Parser versioning | Living Docs | coding.md | Medium |
| LDC-4: Blackbox review checklist | Living Docs | testing.md | Low-Medium |
| PC-1: Self-review accuracy | Process | Ticket workflow | Medium |
| PC-2: Full-occurrence scan on fix | Process | Code review checklist | Medium |
