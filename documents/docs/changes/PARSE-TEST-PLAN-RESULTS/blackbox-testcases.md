# Black-box Test Cases

**Ticket ID**: PARSE-TEST-PLAN-RESULTS  
**Create date**: 2026-06-19  
**Author**: OpenAI  
**Update date**: 2026-06-22  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-PARSE-TEST-PLAN-RESULTS-1 | P0 | Normal | Parse test-plan.md independently |
| BB-002 | AC-PARSE-TEST-PLAN-RESULTS-2 | P0 | Normal | Parse test-results.md independently |
| BB-003 | AC-PARSE-TEST-PLAN-RESULTS-3 | P0 | Normal | Extract canonical sections |
| BB-004 | AC-PARSE-TEST-PLAN-RESULTS-4 | P0 | Normal | Persist snapshot immediately |
| BB-005 | AC-PARSE-TEST-PLAN-RESULTS-5 | P0 | Error | Missing section / placeholder / parse error |
| BB-006 | AC-PARSE-TEST-PLAN-RESULTS-6 | P0 | Boundary | Re-parse same source hash |
| BB-007 | AC-PARSE-TEST-PLAN-RESULTS-7 | P1 | Normal | Pair View by ticket |

## Test Cases

### BB-001: Parse `test-plan.md` canonical fields

| item | content |
|---|---|
| Related AC | AC-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A valid `test-plan.md` exists for a ticket |
| Input | Valid markdown content aligned to template |
| Steps | Run parser on `test-plan.md` |
| Expected Result | Snapshot stores all canonical sections for `test-plan.md` |
| Note | |

### BB-002: Parse `test-results.md` canonical fields

| item | content |
|---|---|
| Related AC | AC-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | A valid `test-results.md` exists for a ticket |
| Input | Valid markdown content aligned to template |
| Steps | Run parser on `test-results.md` |
| Expected Result | Snapshot stores all canonical sections for `test-results.md` |
| Note | |

### BB-003: Re-parse same file/hash

| item | content |
|---|---|
| Related AC | AC-4 |
| Priority | P0 |
| Category | Error |
| Preconditions | Same file and hash already parsed once |
| Input | Same markdown source hash |
| Steps | Parse again |
| Expected Result | Snapshot is updated atomically; no duplicate logical row |
| Note | |

### BB-004: View paired artifacts for a ticket

| item | content |
|---|---|
| Related AC | AC-5 |
| Priority | P1 |
| Category | Permission |
| Preconditions | Both artifacts exist for one ticket |
| Input | Ticket ID |
| Steps | Open paired view |
| Expected Result | Both test-plan and test-results can be viewed together |
| Note | |

### BB-005: Missing pair member

### BB-005: Missing section / placeholder / parse error

| item | content |
|---|---|
| Related AC | AC-PARSE-TEST-PLAN-RESULTS-5 |
| Priority | P0 |
| Category | Error |
| Preconditions | Parser available |
| Input | Missing section OR placeholder OR malformed markdown |
| Steps | Execute parser |
| Expected Result | Warning generated or parse status updated according to parser rules |
| Note | Covers missing section, placeholder detection, parse error |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [ ] State transition
- [x] Character type input
- [ ] Numeric input
- [x] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
