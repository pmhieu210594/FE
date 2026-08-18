# Requirement – Parser `self-review.md` (based on the old template, parsed strictly like `spec-pack.md`)

**Goal**: keep the legacy `self-review.md` template unchanged, but make the parser read it as a fixed-structure document, with required / recommended / optional section classification, following the spirit of the `spec-pack.md` parser.

**Source of truth**: the old `self-review.md` template has only 11 sections, starts with `# Self Review`, includes 4 header lines, and contains 11 sections from `## 1` to `## 11`. This is the reference template the parser must support reliably. fileciteturn10file0

## 1. Purpose

The `self-review.md` parser is used to extract structured self-review data for:
- confirming what was implemented,
- matching Spec / AC / test / checklist items,
- recording commands that were run and their results,
- recording bugs that were found and fixed,
- recording pending items / risks / exceptions,
- capturing AI and human review notes,
- and finalizing the ticket verdict.

The system requirements explicitly state that `self-review.md` must provide confirmed content, executed commands, concerns, unresolved items, and exceptions so evidence analysis and command evidence rate can be supported. fileciteturn1file0L634-L634

## 2. Parser design principles

The parser for `self-review.md` must follow the same 4 principles as the `spec-pack.md` parser:

1. **Fixed template**: recognize only the headings defined in the legacy template; do not infer freely.
2. **Clear structure**: if a section contains a table, parse it as a table; if it is free text, preserve it with minimal structure.
3. **Downgrade quality when important pieces are missing**: do not break the entire parse if optional parts are missing, but mark `WARNING` / `PARTIAL` / `NEEDS_UPDATE` according to severity.
4. **No front matter required in MVP**: the legacy file remains valid if it contains only the 4-line header and 11 sections.

## 3. Standard template structure to support

The parser must support the following legacy template exactly:

1. `# Self Review`
2. `**Ticket ID**: <TICKET>`
3. `**Create date**: <Create_date>`
4. `**Author**: <Author>`
5. `**Update date**: <Update_date>`
6. `## 1. Implementation Summary`
7. `## 2. Specification/AC Matching`
8. `## 3. List of Changed Files`
9. `## 4. Runn Command and Results`
10. `## 5. Self-Check using Review Checklist`
11. `## 6. Test Plan Corresponding Status`
12. `## 7. Bugs Found and Resolved`
13. `## 8. Unprocessed / Pending / Accepted Risk`
14. `## 9. AI-generated predictions`
15. `## 10. Items reviewed by humans`
16. `## 11. Final Self-Verdict`

## 4. Section criticality classification

To keep the parser strict like `spec-pack.md`, the template remains 11 sections, but the parser must classify them clearly:

### 4.1 Required sections
These sections are the core of a useful self-review:
- `## 1. Implementation Summary`
- `## 2. Specification/AC Matching`
- `## 4. Runn Command and Results`
- `## 5. Self-Check using Review Checklist`
- `## 6. Test Plan Corresponding Status`
- `## 8. Unprocessed / Pending / Accepted Risk`
- `## 11. Final Self-Verdict`

### 4.2 Recommended sections
These sections should exist to improve evidence quality, but they must not hard-fail the parse if missing:
- `## 3. List of Changed Files`
- `## 7. Bugs Found and Resolved`
- `## 10. Items reviewed by humans`

### 4.3 Optional sections
This section supports advanced analytics but should not be mandatory in the MVP:
- `## 9. AI-generated predictions`

### 4.4 Rule for determining whether a section has content
The parser must evaluate content by subtree, not just by a single heading. The rule is:
- A section is considered **non-empty** if the section itself contains real text, a table, a list, a code block, or at least one direct or indirect child section with real content.
- A section is considered **empty** if it contains only a heading and no real text in the section itself, and none of its child sections contain real content either.
- When a parent section has child sections with real content, the parent still counts as having content. For example, `## 1. Implementation Summary` can be considered non-empty if `1.1`, `1.2`, etc. contain actual descriptions, even when `## 1` itself only acts as a container heading.
- Real content means: paragraph text, bullet lists, tables, code blocks, quotes, or any non-empty text line with business meaning.
- Child headings that only contain numbering or placeholders without real text do not count as content.

## 5. Functional requirements

### 5.1 Header metadata recognition
The parser must read and normalize the 4 header lines:
- Ticket ID
- Create date
- Author
- Update date

If any of the 4 fields is missing, the parser must emit a warning or error depending on severity.

### 5.2 Recognize the 11 sections in the legacy order
The parser must:
- recognize the correct heading names,
- preserve section order,
- not treat arbitrary renaming as valid,
- emit a warning if a required section is missing or if a section is placed significantly out of order.

### 5.3 Extract tables in structured sections
The parser must read the following tables:

#### Section 2 – Specification/AC Matching
Required columns:
- `AC ID`
- `status`
- `evidence`

#### Section 3 – List of Changed Files
Required columns:
- `file`
- `summary`
- `reason`

#### Section 4 – Runn Command and Results
Required columns:
- `command`
- `result`
- `note`

#### Section 5 – Self-Check using Review Checklist
Required columns:
- `checklist area`
- `result`
- `note`

#### Section 7 – Bugs Found and Resolved
Required columns:
- `bug`
- `cause`
- `fix`
- `test`

#### Section 8 – Unprocessed / Pending / Accepted Risk
Required columns:
- `item`
- `reason`
- `impact`
- `owner`
- `deadline`

### 5.4 Extract free text
The parser must support the free-text sections:
- `## 1. Implementation Summary`
- `## 6. Test Plan Corresponding Status`
- `## 9. AI-generated predictions`
- `## 10. Items reviewed by humans`
- `## 11. Final Self-Verdict`

For section 11, the final verdict must be normalized to one of:
- `PASS`
- `NEEDS_UPDATE`
- `BLOCKED`

### 5.5 Strict completeness validation
The parser must determine:
- whether all header metadata fields exist,
- whether all required sections exist,
- whether the required sections contain their expected tables,
- whether the final verdict exists,
- whether AC / command / risk / bug / human review data exists.

If a required section is missing, the parser must return at least `PARTIAL` or `NEEDS_UPDATE`. Only missing recommended / optional sections may be handled with warnings only.

### 5.6 No over-inference
The parser may only extract information that is actually present in the file.
It must not infer state if the file does not state it.
It must not fill in missing data automatically.

### 5.7 Evaluate parent sections by subtree
When checking completeness, the parser must score a parent section by aggregating the content of its entire subtree:
- If a parent section contains any child section with real content, the parent section should be marked `has_content = true`.
- If the entire subtree consists only of headings or placeholders, the parent section should be marked `has_content = false`.
- This rule is especially important for items that may be split into `1.1`, `1.2`, `1.3`, etc.

### 5.8 Preserve backward compatibility with the legacy template
Do not force the legacy template into a new format if users are still producing files in this format.
The parser must remain backward compatible with the current headings and current order.

## 6. Desired output data

The parser should emit an object or record that includes at least the following groups:

- `ticket_id`
- `create_date`
- `author`
- `update_date`
- `implementation_summary`
- `ac_matching[]`
- `changed_files[]`
- `commands[]`
- `self_check[]`
- `test_plan_status`
- `bugs[]`
- `pending_risks[]`
- `ai_predictions`
- `human_reviews`
- `final_verdict`
- `required_sections_status`
- `warnings[]`
- `errors[]`

## 7. Parsing rules

### 7.1 Recognize sections by fixed headings
The parser must rely on Markdown headings exactly as defined by the legacy template, not on natural-language interpretation.

### 7.2 Allow empty recommended / optional sections
Recommended / optional sections may be empty in early stages. In such cases the parser must not fail completely, but it must emit a warning.

### 7.3 Parse table rows row-by-row
Tables in sections 2, 3, 4, 5, 7, and 8 must be parsed row-by-row and preserve original record order.

### 7.4 Classify quality based on the amount of missing content
- Missing `required` sections: severe quality downgrade, potentially `PARTIAL` / `NEEDS_UPDATE`.
- Missing `recommended` sections: warning only.
- Missing `optional` sections: do not fail; only record them for analytics.

### 7.5 Normalize verdicts
If section 11 uses different casing or extra spaces, the parser must normalize it to one of:
- `PASS`
- `NEEDS_UPDATE`
- `BLOCKED`

## 8. Expected system outcome

The parser must produce data sufficient for downstream processing:
- ticket traceability,
- evidence quality / completeness,
- command evidence,
- test linkage,
- risk / exception tracking,
- human approval tracking,
- AI finding analytics.

## 9. Acceptance criteria

1. The parser reads the legacy template correctly without requiring front matter.
2. The parser can extract all 4 header fields when they exist.
3. The parser recognizes all 11 sections in the legacy order.
4. The parser reads all tables in sections 2, 3, 4, 5, 7, and 8.
5. The parser reads the final verdict from section 11.
6. The parser does not fail when recommended / optional sections are empty.
7. The parser emits warnings when required sections or required tables are missing.
8. The parser returns enough data to support evidence analysis, command evidence, and ticket risk analysis.

## 10. Implementation notes

- The legacy template should be preserved to avoid breaking existing self-review files.
- The parser should prioritize backward compatibility.
- In the MVP stage, required sections must be checked strictly; the remaining sections should only enrich the data.
- If migration to a new template is required later, it must have a clear transition period and must not break backward compatibility.