# Black-box Test Cases

**Ticket ID**: PARSE-IMPL-PLAN  
**Create date**: 2026-06-19  
**Author**: ChatGPT  
**Update date**: 2026-06-19  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-PARSE-IMPL-PLAN-1 | P0 | Normal | Detect ticket-scoped impl-plan file |
| BB-002 | AC-PARSE-IMPL-PLAN-2, AC-PARSE-IMPL-PLAN-3, AC-PARSE-IMPL-PLAN-4 | P0 | Normal | Extract required template sections |
| BB-003 | AC-PARSE-IMPL-PLAN-5 | P0 | Error | Missing section is reported explicitly |
| BB-004 | AC-PARSE-IMPL-PLAN-1 | P0 | Error | Missing file is reported as NOT_FOUND |
| BB-005 | AC-PARSE-IMPL-PLAN-5 | P1 | Error | Malformed / duplicate heading is not silently accepted |
| BB-006 | AC-PARSE-IMPL-PLAN-6 | P0 | State | Re-parse same source hash does not duplicate |
| BB-007 | AC-PARSE-IMPL-PLAN-7 | P1 | External IF | Query parsed result is available for later display |
| BB-008 | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-5 | P1 | Boundary | Large multilingual markdown remains stable |

## Test Cases

### BB-001: Detect ticket-scoped impl-plan file

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A ticket folder contains `docs/changes/PARSE-IMPL-PLAN/impl-plan.md` |
| Input | Ticket-scoped file path |
| Steps | Run the parser against the ticket folder |
| Expected Result | Parser identifies the file and starts parsing without error |
| Note | This confirms the parser is scoped to the ticket artifact |

### BB-002: Extract required template sections

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-2, AC-PARSE-IMPL-PLAN-3, AC-PARSE-IMPL-PLAN-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A template-compliant `impl-plan.md` exists |
| Input | Valid markdown containing all required headings |
| Steps | Run the parser and inspect the normalized result |
| Expected Result | Parser returns structured data for implementation principle, alternative plan, reason for chosen plan, expected change files, methods, SQL/query/repository policy, validation/error/logging policy, migration/rollback policy, steps, verification, AC table, stop/ask condition, do-not-do list, and open issues |
| Note | This is the main happy-path coverage |

### BB-003: Missing section is reported explicitly

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-5 |
| Priority | P0 |
| Category | Error |
| Preconditions | File exists but one required heading is missing |
| Input | Incomplete markdown |
| Steps | Run the parser |
| Expected Result | Parse status becomes `PARTIAL` and missing section names are listed in the result |
| Note | The parser must not silently treat the missing section as valid |

### BB-004: Missing file is reported as NOT_FOUND

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-1 |
| Priority | P0 |
| Category | Error |
| Preconditions | Ticket folder does not contain `impl-plan.md` |
| Input | Non-existing path |
| Steps | Run the parser |
| Expected Result | Parse status becomes `NOT_FOUND` and no crash occurs |
| Note | The result must be explicit and safe |

### BB-005: Malformed / duplicate heading is not silently accepted

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-5 |
| Priority | P1 |
| Category | Error |
| Preconditions | File contains duplicated headings or malformed table structure |
| Input | Broken markdown |
| Steps | Run the parser |
| Expected Result | Parser returns `PARTIAL` or `PARSE_ERROR` consistently and reports the issue in the safe error summary |
| Note | Do not infer missing structure as a valid section |

### BB-006: Re-parse same source hash does not duplicate

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-6 |
| Priority | P0 |
| Category | State |
| Preconditions | A parse result already exists for the same source hash |
| Input | Same `impl-plan.md` content |
| Steps | Run the parser twice with the same source hash |
| Expected Result | The stored parse result is updated, not duplicated |
| Note | Idempotency check |

### BB-007: Query parsed result is available for later display

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-7 |
| Priority | P1 |
| Category | External IF |
| Preconditions | A parse result has already been stored |
| Input | Ticket ID / source hash query |
| Steps | Request the parsed result from the read side |
| Expected Result | Read model returns parsed fields and parse status |
| Note | The UI, if any, should be read-only for this PoC |

### BB-008: Large multilingual markdown remains stable

| item | content |
|---|---|
| Related AC | AC-PARSE-IMPL-PLAN-4, AC-PARSE-IMPL-PLAN-5 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | File contains very long bullet lists and mixed Vietnamese / English text |
| Input | Large valid or near-valid markdown |
| Steps | Run the parser |
| Expected Result | Parser remains stable, does not corrupt encoding, and reports parse quality correctly |
| Note | Boundary and encoding coverage |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [ ] Permission difference
- [x] State transition
- [x] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [ ] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
