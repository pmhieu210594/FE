# TEST DATA – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-29
**Author**: Claude
**Update date**: 2026-06-29
**Replaces**: Prior draft (2026-06-26) — section names were incorrect (used wrong headings not in spec).

Required sections per spec §6.3: `summary`, `impact`, `review_result`, `test_result`, `risks`, `open_issues`, `rollback`, `exceptions`.

---

## 1. Fixture File Index

| File | Location | Used by BB Cases | Description |
| ---- | -------- | ---------------- | ----------- |
| `valid-full-report.md` | `src/test/resources/test-fixtures/PARSER-REPORT/` | BB-07, BB-08, BB-24, BB-26 | All 8 sections with substantive non-placeholder content |
| `missing-two-sections.md` | `src/test/resources/test-fixtures/PARSER-REPORT/` | BB-12, BB-22 | 6 sections present; `## Impact` and `## Rollback` absent |
| `placeholder-content.md` | `src/test/resources/test-fixtures/PARSER-REPORT/` | BB-05, BB-06, BB-23 | All 8 sections; bodies = TBD / TODO / N/A / `---` |
| `list-content.md` | `src/test/resources/test-fixtures/PARSER-REPORT/` | BB-09 | All 8 sections; `## Risks` body is a bullet list |

---

## 2. Fixture File Contents

### 2.1 valid-full-report.md

All 8 required sections. Content is substantive — no placeholders.

```markdown
## Summary
The PARSER-REPORT feature implements a markdown parser for report.md artifacts.
All implementation goals have been achieved and verified through unit testing.

## Impact
Only new files have been added. No existing files modified except ArtifactScannerServiceTest
(constructor arity fix). No API changes.

## Review Result
All review criteria met. Architecture conforms to hexagonal layer rules.
ArchUnit passes. No new dependency exceptions added.

## Test Result
16 unit tests created across 2 test classes. 13 pass, 3 fail due to ISSUE-1 (tracked).
Regression: 30/30 existing parser tests pass.

## Risks
Implementation is isolated. No risk to existing parsers or persistence layer.
ISSUE-1 (section key case mismatch) is a known bug tracked separately.

## Open Issues
ISSUE-1: detectMissingFields() uses lowercase keys but sectionMap() returns uppercase canonical keys.
Fix: change sections.get(field) to sections.get(field.toUpperCase()) in detectMissingFields() and buildParsedSummary().

## Rollback
Revert the three new source files: ReportMarkdownParser.java, ReportMarkdownParserController.java,
and the test classes. Revert ArtifactScannerServiceTest.java constructor fix.

## Exceptions
No exceptions to standard process. AC-8 (persistence) deferred by team decision.
```

---

### 2.2 missing-two-sections.md

6 of 8 sections present. `## Impact` and `## Rollback` deliberately absent.

```markdown
## Summary
Summary content for the PARSER-REPORT feature implementation.

## Review Result
All review criteria have been met and verified.

## Test Result
All unit tests pass. No regression detected in the existing test suite.

## Risks
Implementation risk is low. Parser is isolated and does not affect existing parsers.

## Open Issues
No open issues remaining.

## Exceptions
No exceptions noted.
```

---

### 2.3 placeholder-content.md

All 8 sections present. Bodies contain only placeholder values.

```markdown
## Summary
TBD

## Impact
TODO

## Review Result
---

## Test Result
N/A

## Risks
TBD

## Open Issues
TODO

## Rollback
---

## Exceptions
N/A
```

---

### 2.4 list-content.md

All 8 sections present. `## Risks` section uses bullet list format to verify AC-4 (String, not array).

```markdown
## Summary
Summary content for the PARSER-REPORT feature implementation.

## Impact
Impact is minimal. Only new files added, no existing files modified.

## Review Result
All review criteria have been met and verified.

## Test Result
All unit tests pass. No regression detected in the existing test suite.

## Risks
- Risk one: parser may encounter malformed markdown files in edge cases
- Risk two: edge cases with Unicode or special characters in section headings

## Open Issues
No open issues remaining.

## Rollback
Revert the implementation commits to restore the previous parser state.

## Exceptions
No exceptions noted.
```

---

## 3. Inline String Catalog (Java Text Blocks)

Inline strings used for BB cases that do not require fixture files.

### 3.1 BB-01 — Empty string

```java
String content = "";
```

Expected: `parseStatus = "FAILED"`, errors contain `markdown_empty`.

---

### 3.2 BB-02 — Whitespace-only

```java
String content = "   \n  \t  ";
```

Expected: `parseStatus = "FAILED"`, errors contain `markdown_empty`.

---

### 3.3 BB-04 — One section only

```java
String content = """
        ## Summary
        Present content only in one section.
        """;
String sourcePath = "docs/changes/PARSER-REPORT/report.md";
```

Expected: `parseStatus = "PARTIAL"`, warnings contain `required_fields_missing`.

---

### 3.4 BB-10 — Numbered list section (AC-4 boundary)

```java
String content = """
        ## Summary
        Summary content.

        ## Impact
        No impact.

        ## Review Result
        Approved.

        ## Test Result
        Passing.

        ## Risks
        1. Risk A: first item
        2. Risk B: second item

        ## Open Issues
        None.

        ## Rollback
        Revert commits.

        ## Exceptions
        None.
        """;
```

Expected: `sections.get("RISKS")` is String containing `"1. Risk A"`.

---

### 3.5 BB-11 — Code block in section (AC-4 boundary)

```java
String content = """
        ## Summary
        ```java
        System.out.println("hi");
        ```

        ## Impact
        No impact.

        ## Review Result
        Approved.

        ## Test Result
        Passing.

        ## Risks
        None.

        ## Open Issues
        None.

        ## Rollback
        Revert commits.

        ## Exceptions
        None.
        """;
```

Expected: `sections.get("SUMMARY")` is String containing backtick characters.

---

### 3.6 BB-14 — TicketId inference

```java
String content = "## Summary\nContent.";
String sourcePath = "docs/changes/PARSER-REPORT/report.md";
```

Expected: `ticketId = "PARSER-REPORT"`.

---

### 3.7 BB-15 — Null sourcePath

```java
String content = "## Summary\nContent.";
String sourcePath = null;
```

Expected: warnings contain `ticket_id_missing`.

---

### 3.8 BB-16 — Single character (boundary)

```java
String content = "A";
```

Expected: no exception; `parseStatus` is non-null valid enum value.

---

### 3.9 BB-17 — Whitespace-only section body

```java
String content = """
        ## Summary
           
           
        """;
String sourcePath = "docs/changes/PARSER-REPORT/report.md";
```

Expected: `parseStatus = "PARTIAL"` (summary body treated as blank → missing).

---

### 3.10 BB-18 — Heading only, no body

```java
String content = "## Summary";
String sourcePath = "docs/changes/PARSER-REPORT/report.md";
```

Expected: `sections.get("SUMMARY")` is blank/empty; `parseStatus = "PARTIAL"`.

---

### 3.11 BB-27 — parseInline request

```java
ParseRequest request = new ParseRequest(
    """
    ## Summary
    Test content.
    """,
    "docs/changes/PARSER-REPORT/report.md",
    "draft"
);
```

Expected response keys: `ticketId = "PARSER-REPORT"`, `parseMode = "draft"`, `parsedSummary` is Map, `parseStatus` non-null.

---

## 4. Expected Output Shape

### 4.1 ParsedArtifact fields referenced in tests

| Field | Type | BB Cases |
| ----- | ---- | -------- |
| `parseStatus()` | String (`FAILED / PARTIAL / DRAFT / OFFICIAL`) | BB-01..08, BB-12, BB-16..18 |
| `errors()` | `List<ParsingIssue>` — extract `.code()` | BB-01, BB-02, BB-12, BB-22 |
| `warnings()` | `List<ParsingIssue>` — extract `.code()` | BB-04, BB-05, BB-12, BB-14, BB-15, BB-22, BB-23 |
| `sections()` | `Map<String, String>` — keys are UPPERCASE | BB-09, BB-10, BB-11, BB-17, BB-18 |
| `ticketId()` | String | BB-14, BB-15, BB-26, BB-27 |
| `requiredFieldsMissing()` | `List<String>` — format `"section:<key>"` | ISSUE-1 diagnostic |

### 4.2 Controller response envelope fields

| Field | Type | BB Cases |
| ----- | ---- | -------- |
| `filePath` | String (absolute) | BB-26 |
| `result.ticketId` | String | BB-26 |
| `result.artifactExists` | Boolean | BB-26 |
| `result.parsedSummary` | Map | BB-26, BB-27 |
| `ticketId` (inline) | String | BB-27 |
| `parseMode` (inline) | String | BB-27 |
| `parseStatus` (inline) | String | BB-27 |

---

## 5. Known Issues Affecting Test Data

| Issue | Affected data | Impact |
| ----- | ------------- | ------ |
| ISSUE-1: section key case mismatch | `valid-full-report.md` → BB-07, BB-08 | Expected DRAFT/OFFICIAL, actual PARTIAL. Fix: `sections.get(field.toUpperCase())` in `detectMissingFields()` and `buildParsedSummary()`. |
| `parsedSummary` field values | All scenarios | Due to ISSUE-1, all 8 field values in `parsedSummary` are currently null. Will be correct after fix. |
| `has_open_issue_detected` flag | `valid-full-report.md` | Currently always false due to ISSUE-1. Expected true for fixture with `## Open Issues` content. |
