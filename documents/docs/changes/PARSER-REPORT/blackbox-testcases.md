# BLACK-BOX TEST CASES – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-29
**Author**: Claude
**Update date**: 2026-06-29
**Replaces**: Prior draft (2026-06-26) — section names were incorrect; replaced with actual spec sections.

**Perspective**: External API boundary only.
Input = `(content: String, sourcePath: String, parseMode: String)`.
Output = `ParsedArtifact { parseStatus, errors, warnings, sections, parsedSummary, ticketId, ... }`.
No assumptions about internals.

---

## 1. AC ↔ Black-box Case Mapping

| AC ID | Description | BB Case IDs |
| ----- | ----------- | ----------- |
| AC-1 | errors → FAILED | BB-01, BB-02, BB-03 |
| AC-2 | warnings → PARTIAL | BB-04, BB-05, BB-06 |
| AC-3 | no errors/warnings → DRAFT or OFFICIAL | BB-07, BB-08 |
| AC-4 | sections always String, never array | BB-09, BB-10, BB-11 |
| AC-5 | missing fields → warning, not error | BB-12 |
| AC-6 | ALL_FIELDS = 8 keys in declared order | BB-13 |
| AC-7 | ticketId inferred from sourcePath | BB-14, BB-15 |
| AC-8 | parse → persist snapshot + sections | DEFERRED |
| Controller | security guards + response envelope | BB-19, BB-20, BB-21, BB-26, BB-27 |
| Boundary | edge inputs | BB-16, BB-17, BB-18 |
| Audit/Log | warning codes correct | BB-22, BB-23 |
| Operation | idempotency, performance | BB-24, BB-25 |

---

## 2. Test Cases

### AC-1 — Blank/empty content → FAILED

---

#### BB-01 — Empty string → FAILED

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content)` |
| **Precondition** | none |
| **Input** | `content = ""` |
| **sourcePath** | not provided |
| **parseMode** | default |
| **Expected parseStatus** | `FAILED` |
| **Expected errors** | contains code `markdown_empty` |
| **Expected warnings** | not asserted (may contain `ticket_id_missing`) |
| **Notes** | Core trigger: `MarkdownParserCore` detects blank content and adds error |

---

#### BB-02 — Whitespace-only string → FAILED

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content)` |
| **Precondition** | none |
| **Input** | `content = "   \n  \t  "` |
| **sourcePath** | not provided |
| **parseMode** | default |
| **Expected parseStatus** | `FAILED` |
| **Expected errors** | contains code `markdown_empty` |
| **Notes** | Whitespace-only must be treated identical to empty per spec §6.5 |

---

#### BB-03 — Null content → no crash

| Field | Value |
| ----- | ----- |
| **Priority** | P2 |
| **Method** | `parse(content)` |
| **Precondition** | none |
| **Input** | `content = null` |
| **Expected** | Either returns FAILED with `markdown_empty`, or throws `IllegalArgumentException` — must not throw `NullPointerException` |
| **Notes** | Spec §6.5: `normalizedContent == null → isEmpty`. NPE would be a separate defect. |

---

### AC-2 — Warnings present → PARTIAL

---

#### BB-04 — One section present, 7 missing → PARTIAL

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content, sourcePath)` |
| **Precondition** | none |
| **Input** | `content = "## Summary\nSome valid content."` |
| **sourcePath** | `"docs/changes/PARSER-REPORT/report.md"` |
| **parseMode** | default |
| **Expected parseStatus** | `PARTIAL` |
| **Expected warnings** | contains code `required_fields_missing` |
| **Expected errors** | empty |

---

#### BB-05 — All 8 sections present but with placeholder content → PARTIAL

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content, sourcePath)` |
| **Precondition** | none |
| **Input** | fixture `placeholder-content.md` (all 8 sections; values = TBD / TODO / N/A / `---`) |
| **sourcePath** | `"docs/changes/PARSER-REPORT/report.md"` |
| **Expected parseStatus** | `PARTIAL` |
| **Expected warnings** | contains code `placeholder_detected` |
| **Expected errors** | empty |

---

#### BB-06 — Section body is `N/A` → placeholder warning → PARTIAL

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | inline: all 8 sections present; one body = `N/A` |
| **Expected parseStatus** | `PARTIAL` |
| **Expected warnings** | contains code `placeholder_detected` |
| **Notes** | `N/A` is a placeholder value per spec placeholder detection rules |

---

### AC-3 — No errors or warnings → DRAFT or OFFICIAL

> **ISSUE-1 blocking**: BB-07 and BB-08 are expected to FAIL until ISSUE-1 is resolved.
> Root cause: `detectMissingFields()` uses lowercase keys (`"summary"`) but `sectionMap()` keys are uppercase (`"SUMMARY"`).
> All 8 fields are always reported as missing → parseStatus always PARTIAL for non-empty content.

---

#### BB-07 — All 8 valid sections, default mode → DRAFT

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content, sourcePath)` |
| **Precondition** | **ISSUE-1 must be fixed** |
| **Input** | fixture `valid-full-report.md` (all 8 sections, substantive content) |
| **sourcePath** | `"docs/changes/PARSER-REPORT/report.md"` |
| **parseMode** | default (not specified) |
| **Expected parseStatus** | `DRAFT` |
| **Expected errors** | empty |
| **Expected warnings** | empty |
| **Current status** | ❌ FAILS — actual `PARTIAL` due to ISSUE-1 |

---

#### BB-08 — All 8 valid sections, official mode → OFFICIAL

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content, sourcePath, parseMode)` |
| **Precondition** | **ISSUE-1 must be fixed** |
| **Input** | fixture `valid-full-report.md` |
| **sourcePath** | `"docs/changes/PARSER-REPORT/report.md"` |
| **parseMode** | `"official"` |
| **Expected parseStatus** | `OFFICIAL` |
| **Current status** | ❌ FAILS — actual `PARTIAL` due to ISSUE-1 |

---

### AC-4 — Sections always String, never array

---

#### BB-09 — Bullet list section body → raw String

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | fixture `list-content.md` (`## Risks` body = `- Risk one: ...\n- Risk two: ...`) |
| **Expected** | `sections.get("RISKS")` is non-null String containing `"Risk one"` |
| **Not expected** | List, array, or any parsed collection type |

---

#### BB-10 — Numbered list section body → raw String

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | inline text block: `## Risks\n1. Risk A\n2. Risk B` |
| **Expected** | `sections.get("RISKS")` is String containing `"1. Risk A"` |

---

#### BB-11 — Fenced code block in section body → raw String

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | inline text block: `## Summary\n\`\`\`java\nSystem.out.println("hi");\n\`\`\`` |
| **Expected** | `sections.get("SUMMARY")` is String containing backticks |

---

### AC-5 — Missing required field → warning, not error

---

#### BB-12 — 6/8 sections present → required_fields_missing warning, errors empty

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | fixture `missing-two-sections.md` (missing `## Impact` and `## Rollback`) |
| **sourcePath** | `"docs/changes/PARSER-REPORT/report.md"` |
| **Expected errors** | empty (missing fields must not produce errors) |
| **Expected warnings** | contains code `required_fields_missing` |
| **Not expected** | any error code for missing sections |

---

### AC-6 — ALL_FIELDS contract

---

#### BB-13 — ALL_FIELDS constant = 8 keys in declared order

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | `ReportMarkdownParser.ALL_FIELDS` (static constant) |
| **Expected size** | 8 |
| **Expected order** | `summary`, `impact`, `review_result`, `test_result`, `risks`, `open_issues`, `rollback`, `exceptions` |

---

### AC-7 — TicketId inference from sourcePath

---

#### BB-14 — TicketId inferred from path segment

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | `content = "## Summary\nContent."`, `sourcePath = "docs/changes/PARSER-REPORT/report.md"` |
| **Expected** | `ticketId = "PARSER-REPORT"` |
| **Notes** | Segment between `changes/` and `/report.md` is the ticket ID |

---

#### BB-15 — Null sourcePath → ticket_id_missing warning

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Method** | `parse(content, sourcePath)` |
| **Input** | `content = "## Summary\nContent."`, `sourcePath = null` |
| **Expected warnings** | contains code `ticket_id_missing` |

---

### Boundary Values

---

#### BB-16 — Single character content → no crash

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | `content = "A"` |
| **Expected** | no exception thrown; `parseStatus` is one of `FAILED / PARTIAL / DRAFT / OFFICIAL` |
| **Notes** | `"A"` is not blank, so `markdown_empty` error must not fire |

---

#### BB-17 — Section heading present, body is whitespace-only

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | inline: `## Summary\n   \n   ` |
| **Expected** | section counted as blank/empty → contributes to missing fields |
| **Expected parseStatus** | `PARTIAL` |

---

#### BB-18 — Section heading only, no body

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | inline: `## Summary` (no subsequent lines) |
| **Expected** | `sections.get("SUMMARY")` is blank or empty String |
| **Expected parseStatus** | `PARTIAL` |

---

### Controller — Security Guards

---

#### BB-19 — Non-.md extension → Guard 1 exception

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `controller.parseFile(request)` |
| **Input** | `ParseFileRequest(path = "D:\\temp\\report.txt", parseMode = "draft")` |
| **Expected** | throws `IllegalArgumentException` |
| **Expected message** | contains `".md"` |

---

#### BB-20 — Path without `/changes/<TICKET>/report.md` pattern → Guard 2 exception

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `controller.parseFile(request)` |
| **Input** | `ParseFileRequest(path = "D:\\temp\\notes.md", parseMode = "draft")` |
| **Expected** | throws `IllegalArgumentException` |
| **Expected message** | contains `"changes/<TICKET>/report.md"` |

---

#### BB-21 — Guard 3 (path inside CWD) — implicit coverage

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Status** | SKIPPED (explicit negative case) |
| **Reason** | Explicit "path outside CWD" test not feasible in unit test without mocking `System.getProperty("user.dir")`. Pattern from PARSER-SPEC-PACK: no negative Guard 3 test there either. |
| **Implicit coverage** | BB-26 uses `target/` relative path which resolves inside Maven working directory → implicitly passes Guard 3. |

---

#### BB-26 — parseFile with valid fixture → response envelope shape

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `controller.parseFile(request)` |
| **Precondition** | fixture written to `target/test-fixtures/changes/PARSER-REPORT/report.md` |
| **Input** | `ParseFileRequest(path = fixturePath.toString(), parseMode = "report")` |
| **Expected** | `response.get("filePath")` = absolute path string |
| **Expected** | `result.get("ticketId")` = `"PARSER-REPORT"` |
| **Expected** | `result.get("artifactExists")` = `true` |
| **Expected** | `result.get("parsedSummary")` is `Map` |

---

#### BB-27 — parseInline → response envelope shape

| Field | Value |
| ----- | ----- |
| **Priority** | P0 |
| **Method** | `controller.parseInline(request)` |
| **Input** | `ParseRequest(content = "## Summary\nTest.", sourcePath = "docs/changes/PARSER-REPORT/report.md", parseMode = "draft")` |
| **Expected** | `response.get("ticketId")` = `"PARSER-REPORT"` |
| **Expected** | `response.get("parseMode")` = `"draft"` |
| **Expected** | `response.get("parsedSummary")` is Map |
| **Expected** | `response.get("parseStatus")` is non-null |

---

### Audit — Warning Code Correctness

---

#### BB-22 — Missing required field → warning code exact match

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | `content = "## Summary\nContent."`, `sourcePath` with ticket ID |
| **Expected** | `warnings` contains issue with `code = "required_fields_missing"` |
| **Not expected** | `errors` containing that code |

---

#### BB-23 — Placeholder content → warning code exact match

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | fixture `placeholder-content.md` |
| **Expected** | `warnings` contains issue with `code = "placeholder_detected"` |
| **Not expected** | `errors` containing that code |

---

### Operation

---

#### BB-24 — Same input twice → identical output (idempotent)

| Field | Value |
| ----- | ----- |
| **Priority** | P1 |
| **Input** | call `parse(content, sourcePath)` twice with identical arguments |
| **Expected** | both results have same `parseStatus`, same `errors.size()`, same `warnings.size()` |
| **Notes** | Spec §7: deterministic and idempotent |

---

#### BB-25 — Performance < 100ms for file < 100KB

| Field | Value |
| ----- | ----- |
| **Priority** | P2 |
| **Status** | DOCUMENT ONLY — not implemented as timing assertion |
| **Input** | fixture `valid-full-report.md` (< 100KB) |
| **Expected** | parse completes within 100ms wall-clock |
| **Notes** | Non-functional requirement per spec §7. No JUnit assertion. Track if regression detected. |

---

## 3. Priority Summary

| Priority | Count | Case IDs |
| -------- | ----- | -------- |
| P0 | 9 | BB-01, BB-02, BB-04, BB-05, BB-07\*, BB-08\*, BB-12, BB-19, BB-20, BB-26, BB-27 |
| P1 | 13 | BB-06, BB-09, BB-10, BB-11, BB-13, BB-14, BB-15, BB-16, BB-17, BB-18, BB-21, BB-22, BB-23, BB-24 |
| P2 | 2 | BB-03, BB-25 |
| SKIPPED | 1 | BB-21 |

\*BB-07 and BB-08 are P0 but blocked on ISSUE-1 fix.

---

## 4. Known Issues Affecting Test Cases

| Issue | Affected BB Cases | Impact |
| ----- | ----------------- | ------ |
| ISSUE-1: section key case mismatch in `detectMissingFields()` | BB-07, BB-08 | Expected DRAFT/OFFICIAL, actual PARTIAL — fails until fixed |
| ISSUE-2: AC-8 deferred | AC-8 group | No BB cases for persistence; deferred to integration test phase |
| Guard 3 negative case | BB-21 | Not feasible in unit test; implicitly covered by BB-26 |
