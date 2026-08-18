# Black-box Test Cases

**Ticket ID**: PARSER-SPEC-PACK
**Create date**: 2026-06-19  
**Author**: nk_trung
**Update date**: 2026-06-22  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-SPEC-PARSER-1 | P0 | Normal | Read `spec-pack.md` from the standard path |
| BB-002 | AC-SPEC-PARSER-2 | P0 | Normal | Recognize `ticket_id` from path/front matter/header |
| BB-003 | AC-SPEC-PARSER-3 | P1 | Boundary | Prefer front matter when a valid conflict exists |
| BB-004 | AC-SPEC-PARSER-4 | P0 | Normal | Extract all core sections |
| BB-005 | AC-SPEC-PARSER-5 | P1 | Normal | Extract the Terminology table and core tables |
| BB-006 | AC-SPEC-PARSER-6 | P0 | Boundary | Separate In Scope and Out of Scope |
| BB-007 | AC-SPEC-PARSER-7 | P0 | Normal | Extract Detailed specification tables |
| BB-008 | AC-SPEC-PARSER-8 | P0 | Normal | Extract and count Acceptance Criteria |
| BB-009 | AC-SPEC-PARSER-9 | P1 | Error | Invalid AC format is preserved and a warning is emitted |
| BB-010 | AC-SPEC-PARSER-10 | P0 | Error | Placeholder handling, idempotent rerun, and missing artifact |

## Test Cases

### BB-001: Read `spec-pack.md` from the standard path

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A valid file exists at `docs/changes/PARSER-SPEC-PACK/spec-pack.md` |
| Input | Standard file path |
| Steps | Call the parser with the standard path |
| Expected Result | The parser reads the correct `spec-pack.md` file and returns the parse result for the correct ticket |
| Note | Must not read an out-of-scope file |

### BB-002: Recognize `ticket_id` from path/front matter/header

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The file contains a ticket path and/or front matter/header |
| Input | Markdown file |
| Steps | Parse the file and check `ticket_id` |
| Expected Result | `ticket_id` matches the ticket of the input file; if multiple sources exist, the resolved priority rule is applied |
| Note | Must not infer a different ticket |

### BB-003: Prefer front matter when a valid conflict exists

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-3 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | The file has valid YAML front matter and the header/path contains different values |
| Input | A file containing `ticket_id`, `schema_version`, `artifact_type`, `created_at`, and `updated_at` in front matter |
| Steps | Parse the file |
| Expected Result | Values in front matter are used as the priority source for the main fields |
| Note | A valid conflict must be resolved according to metadata priority |

### BB-004: Extract all core sections

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The file contains the full heading template |
| Input | Standard Markdown content |
| Steps | Parse the file and inspect the section map |
| Expected Result | Core sections such as Context, Scope, As-Is, To-Be, Detailed Spec, Examples, Impact, and Open Issues are extracted |
| Note | Lightweight section aliases must be normalized |

### BB-005: Extract the Terminology table and core tables

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-5 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Terminology table and Input/Output/Error/Boundary/Non-functional tables exist |
| Input | Terminology section and Detailed specification section |
| Steps | Parse the tables |
| Expected Result | Each row is converted into a structured record while preserving the meaning of term/meaning/notes |
| Note | Must not merge rows incorrectly or lose columns |

### BB-006: Separate In Scope and Out of Scope

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-6 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | The Scope section contains both In and Out parts |
| Input | Scope section |
| Steps | Parse the Scope section |
| Expected Result | `within range` and `out of range` parts are separated and not mixed together |
| Note | If one part is missing, a clear warning must be emitted |

### BB-007: Extract Detailed specification tables

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-7 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Business Rules, Input, Output, Error/Exception, Boundary Value, and Non-functional sections exist |
| Input | Detailed specification section |
| Steps | Parse the tables |
| Expected Result | The tables are normalized into the correct record structure and retain business meaning |
| Note | Any required field must reflect missing/placeholder values if present |

### BB-008: Extract and count Acceptance Criteria

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-8 |
| Priority | P0 |
| Category | Normal |
| Preconditions | An Acceptance Criteria table exists |
| Input | AC table |
| Steps | Parse the AC table and count the items |
| Expected Result | The output includes the AC list and the correct AC count; AC codes are normalized consistently |
| Note | Each AC must have a clear code and description |

### BB-009: Invalid AC format is preserved and a warning is emitted

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-9 |
| Priority | P1 |
| Category | Error |
| Preconditions | At least one AC does not follow the standard pattern |
| Input | Non-conforming AC |
| Steps | Parse the file |
| Expected Result | A warning is recorded, and the AC content remains available for review; the meaning must not be auto-corrected |
| Note | This is a quality-gate case, not a hard fail if the core content is still readable |

### BB-010: Placeholder handling, idempotent rerun, and missing artifact

| item | content |
|---|---|
| Related AC | AC-SPEC-PARSER-10 |
| Priority | P0 |
| Category | Error |
| Preconditions | The file contains placeholders, or the same hash is parsed again, or the PR is missing `spec-pack.md` |
| Input | A file containing `---`, `<...>`, `TBD`, `TODO`, `N/A`, empty/null values; or a rerun with the same `content_hash`; or a missing artifact |
| Steps | Parse the file, parse again with the same hash, and check the state when the file is absent |
| Expected Result | Placeholders are flagged; reruns with the same hash do not create duplicate snapshots; a missing artifact is recorded instead of trying to perform an official parse |
| Note | This case covers the most important audit and operational behaviors of the parser |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [ ] Permission difference
- [ ] State transition
- [x] Character type input
- [x] Numeric input
- [x] Full-width number
- [x] Empty/null
- [ ] Duplicate
- [ ] Non-existing ID
- [x] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output