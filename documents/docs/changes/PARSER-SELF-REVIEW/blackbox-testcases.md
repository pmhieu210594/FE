# Black-box Test Cases

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung       
**Update date**: 2026-06-23  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-2 | P0 | Normal | Parse canonical self-review file and resolve ticket metadata |
| BB-002 | AC-PARSER-SELF-REVIEW-3, AC-PARSER-SELF-REVIEW-4 | P0 | Boundary | Detect section order drift and nested subsection overflow |
| BB-003 | AC-PARSER-SELF-REVIEW-5 | P0 | Normal | Extract structured rows from all table sections |
| BB-004 | AC-PARSER-SELF-REVIEW-6, AC-PARSER-SELF-REVIEW-8 | P0 | Boundary | Preserve free-text sections and treat placeholders as incomplete |
| BB-005 | AC-PARSER-SELF-REVIEW-7 | P0 | Normal | Normalize final verdict to supported values |
| BB-006 | AC-PARSER-SELF-REVIEW-9 | P0 | Error | Missing required section yields partial parse warning |
| BB-007 | AC-PARSER-SELF-REVIEW-5, AC-PARSER-SELF-REVIEW-9 | P0 | Error | Malformed table is reported without losing readable content |
| BB-008 | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-9 | P0 | Permission | Path outside the allowed ticket scope is rejected |
| BB-009 | AC-PARSER-SELF-REVIEW-10 | P1 | Boundary | Re-parse the same content and keep the same content hash |
| BB-010 | AC-PARSER-SELF-REVIEW-9, AC-PARSER-SELF-REVIEW-10 | P1 | Error | Missing artifact is reported clearly and not finalized as official parse |

## Test Cases

### BB-001: Parse canonical self-review file and resolve ticket metadata

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Canonical `self-review.md` fixture exists under `docs/changes/PARSER-SELF-REVIEW/` and matches the 11-section template |
| Input | UTF-8 Markdown content from the standard self-review file |
| Steps | Parse the file using the parser or guarded endpoint |
| Expected Result | Ticket metadata is resolved correctly from the ticket file, the canonical sections are recognized, and the parse completes without structural failure |
| Note | Baseline happy path for the ticket |

### BB-002: Detect section order drift and nested subsection overflow

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-3, AC-PARSER-SELF-REVIEW-4 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Fixture includes section order drift and at least one subsection deeper than one level below a heading |
| Input | Markdown with moved headings and nested headings such as `####` under a section |
| Steps | Parse the file and inspect section tree / warnings |
| Expected Result | Section order drift is reported, nested subsection overflow is warned, and content deeper than the allowed level is not promoted into structured output |
| Note | Boundary case for structural tolerance |

### BB-003: Extract structured rows from all table sections

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-5 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Fixture contains the table sections used by the template |
| Input | Markdown with rows in sections 2, 3, 4, 5, 7, and 8 |
| Steps | Parse the file and inspect the row records |
| Expected Result | Table rows are preserved as structured records, row counts are correct, and no row is silently dropped |
| Note | Covers normal table extraction behavior |

### BB-004: Preserve free-text sections and treat placeholders as incomplete

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-6, AC-PARSER-SELF-REVIEW-8 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Fixture includes free-text sections with multilingual content and placeholder-only fields |
| Input | Markdown containing `---`, `TBD`, `TODO`, `N/A`, `<...>`, or blank entries in important fields |
| Steps | Parse the file and inspect the free-text output and completeness flags |
| Expected Result | Free-text is preserved in a readable form, placeholders are flagged, and placeholder-only content is not treated as complete evidence |
| Note | Tests both preservation and quality-gate behavior |

### BB-005: Normalize final verdict to supported values

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-7 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Fixture contains verdict text with mixed case, extra spaces, or supported aliases |
| Input | Verdict text such as `pass`, `Needs_Update`, or ` blocked ` |
| Steps | Parse the file and inspect the final verdict field |
| Expected Result | Final verdict is normalized to `PASS`, `NEEDS_UPDATE`, or `BLOCKED` only |
| Note | Downstream contract stability case |

### BB-006: Missing required section yields partial parse warning

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-9 |
| Priority | P0 |
| Category | Error |
| Preconditions | Fixture is missing at least one required section from the template |
| Input | Incomplete self-review Markdown |
| Steps | Parse the file |
| Expected Result | Parser returns partial parse state, records the missing section in warnings/errors, and does not silently mark the artifact as complete |
| Note | Required-section failure must be visible to QA/Data Ops |

### BB-007: Malformed table is reported without losing readable content

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-5, AC-PARSER-SELF-REVIEW-9 |
| Priority | P0 |
| Category | Error |
| Preconditions | One or more table sections are malformed, for example missing separators or replaced with bullets |
| Input | Markdown with broken table syntax |
| Steps | Parse the file and inspect warnings/errors plus retained content |
| Expected Result | Parser reports the table issue, keeps any readable surrounding content, and does not rewrite the meaning of the broken table |
| Note | Ensures error handling is observable rather than destructive |

### BB-008: Path outside the allowed ticket scope is rejected

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-1, AC-PARSER-SELF-REVIEW-9 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Caller attempts to parse a file outside `docs/changes/PARSER-SELF-REVIEW/self-review.md` |
| Input | Out-of-scope path or traversal-like path |
| Steps | Call the guarded parse operation with the invalid path |
| Expected Result | Request is rejected by path guard and no official parse result is produced |
| Note | Security boundary case |

### BB-009: Re-parse the same content and keep the same content hash

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-10 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Same fixture is parsed twice without content change |
| Input | Identical self-review Markdown content |
| Steps | Parse the same file twice and compare the reported hash |
| Expected Result | The content hash stays the same across runs and the rerun does not create a new semantic snapshot for unchanged content |
| Note | Idempotency / repeatability case |

### BB-010: Missing artifact is reported clearly and not finalized as official parse

| item | content |
|---|---|
| Related AC | AC-PARSER-SELF-REVIEW-9, AC-PARSER-SELF-REVIEW-10 |
| Priority | P1 |
| Category | Error |
| Preconditions | The target file does not exist or is deleted before the parse run |
| Input | Non-existing `self-review.md` path |
| Steps | Trigger the parse operation against the missing artifact |
| Expected Result | The missing artifact is reported clearly, and the run does not produce an official complete parse |
| Note | Operational failure handling case |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output