# Black-box Test Cases

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: nk_trung  
**Update date**: 2026-06-26  

## Test Case Summary

| case ID | AC ID | priority | category | title | | status
|---|---|---|---|---|---|
| BB-001 | AC-TEST-COVERAGE-1 | P0 | Normal | Extract stable AC keys from `spec-pack.md` | PASS |
| BB-002 | AC-TEST-COVERAGE-2 | P0 | Normal | Derive planned coverage only from `test-plan.md` | PASS |
| BB-003 | AC-TEST-COVERAGE-3 | P0 | Error | Show `MISSING` when an AC has no planned test coverage | PASS |
| BB-004 | AC-TEST-COVERAGE-4 | P0 | Boundary | Show `UNTESTED` when planned coverage has no execution evidence |
| BB-005 | AC-TEST-COVERAGE-5 | P0 | Boundary | Show `PARTIAL` for incomplete many-to-many coverage | PASS |
| BB-006 | AC-TEST-COVERAGE-6 | P0 | Error | Resolve conflicting pass/fail evidence as `FAILED` | PASS |
| BB-007 | AC-TEST-COVERAGE-7 | P0 | Normal | Render dashboard coverage as `AC -> test cases` | PASS |
| BB-008 | AC-TEST-COVERAGE-8 | P1 | Operation | Expose `First CI Pass` and `Exception` KPI signals | PASS |
| BB-009 | AC-TEST-COVERAGE-9 | P0 | Permission | Reject manual mapping or pinning attempts | PASS |
| BB-010 | AC-TEST-COVERAGE-10 | P0 | Audit | Persist warnings and data-quality issues when parsing or linking fails | PASS |
| BB-011 | AC-TEST-COVERAGE-1, AC-TEST-COVERAGE-10 | P1 | Boundary | Handle a ticket with zero ACs without inventing coverage | PASS |
| BB-012 | AC-TEST-COVERAGE-2, AC-TEST-COVERAGE-10 | P1 | Error | Warn on unknown AC references and malformed source blocks | PASS |

## Test Cases

### BB-001: Extract stable AC keys from `spec-pack.md`

| item | content |
|---|---|
| Related AC | AC-AC-TEST-COVERAGE-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Synthetic ticket data `ND-001` provides a `spec-pack.md` snapshot with 10 numbered AC blocks and no duplicated keys. |
| Input | Parse the synthetic `spec-pack.md` snapshot only. |
| Steps | 1) Parse the spec pack 2) Inspect the emitted AC key list 3) Compare the keys with the numbered AC blocks in the source |
| Expected Result | The output contains stable ticket-scoped AC keys (`AC-TEST-COVERAGE-1` through `AC-TEST-COVERAGE-10`) and no invented AC. |
| Note | This case verifies source-of-truth extraction without depending on parser internals. |

### BB-002: Derive planned coverage only from `test-plan.md`

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Synthetic ticket data `ND-001` includes a `test-plan.md` with explicit AC mappings and an unrelated markdown note with no approved mapping semantics. |
| Input | Parse `spec-pack.md` plus `test-plan.md`; ignore the unrelated note. |
| Steps | 1) Parse the spec pack 2) Parse the test plan 3) Compare the planned coverage output with the AC references in `test-plan.md` |
| Expected Result | Planned coverage is derived only from `test-plan.md`; unrelated text does not create, rename, or extend any AC mapping. |
| Note | This protects the canonical planned-coverage source rule. |

### BB-003: Show `MISSING` when an AC has no planned test coverage

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-3 |
| Priority | P0 |
| Category | Error |
| Preconditions | Synthetic ticket data `ED-001` contains an AC in `spec-pack.md` but no matching row in `test-plan.md`. |
| Input | Parse the spec pack and the incomplete test plan. |
| Steps | 1) Parse the source set 2) Query the ticket coverage view 3) Inspect the row for the uncovered AC |
| Expected Result | The uncovered AC is shown as `MISSING`, and the system does not fabricate a planned test case. |
| Note | No silent fallback is allowed. |

### BB-004: Show `UNTESTED` when planned coverage has no execution evidence

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-4 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Synthetic ticket data `ND-002` has planned coverage in `test-plan.md` but no matching `test-results.md` evidence for the target AC. |
| Input | Parse `spec-pack.md` and `test-plan.md` only, then read the coverage view. |
| Steps | 1) Parse the two sources 2) Query the ticket coverage view 3) Inspect the AC row and status |
| Expected Result | The AC is shown as `UNTESTED`; planned coverage is visible, but execution evidence is absent. |
| Note | Planned coverage must not be promoted to executed coverage. |

### BB-005: Show `PARTIAL` for incomplete many-to-many coverage

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-5 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Synthetic ticket data `ND-003` has one AC linked to two planned test cases, but only one of the two has matching execution evidence. |
| Input | Parse all available synthetic sources for the ticket. |
| Steps | 1) Parse spec, plan, and results 2) Query the ticket coverage view 3) Compare the status with the planned/executed linkage count |
| Expected Result | The AC is shown as `PARTIAL`; the view makes incomplete coverage explicit rather than hiding it. |
| Note | This case covers the many-to-many boundary. |

### BB-006: Resolve conflicting pass/fail evidence as `FAILED`

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-6 |
| Priority | P0 |
| Category | Error |
| Preconditions | Synthetic ticket data `ED-004` contains both pass and fail evidence for the same AC, plus an optional CI summary that is otherwise compatible with the pass evidence. |
| Input | Parse the spec pack, test plan, test results, and CI summary. |
| Steps | 1) Parse all sources 2) Inspect the final coverage status 3) Inspect the warning or conflict signal |
| Expected Result | The final status is `FAILED`; pass evidence does not override fail evidence. A conflict warning is visible to operators. |
| Note | Fail wins over pass, exactly as the spec requires. |

### BB-007: Render dashboard coverage as `AC -> test cases`

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-7 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Synthetic ticket data `ND-001` contains several AC rows with nested test-case links and execution evidence. |
| Input | Open the ticket coverage read surface for the synthetic ticket. |
| Steps | 1) Open the dashboard surface 2) Expand the ticket 3) Inspect the row grouping and nesting order |
| Expected Result | The top-level grouping is AC-first, and linked test cases appear underneath each AC instead of the other way around. |
| Note | This is a black-box read-model check, not a UI implementation check. |

### BB-008: Expose `First CI Pass` and `Exception` KPI signals

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-8 |
| Priority | P1 |
| Category | Operation |
| Preconditions | Synthetic ticket data `ND-004` includes one run that is the first CI pass and one later run that produces a warning / exception signal. |
| Input | Open the dashboard KPI surface or the ticket coverage read model. |
| Steps | 1) Load the synthetic ticket 2) Inspect the KPI fields 3) Compare the fields with the seeded evidence chronology |
| Expected Result | `First CI Pass` and `Exception` are both visible when the underlying evidence exists, and the values stay aligned with the seeded run chronology. |
| Note | The KPI is supporting information, not a blocking gate. |

### BB-009: Reject manual mapping or pinning attempts

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-9 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Synthetic permission data includes `admin-user`, `viewer-user`, and `anonymous`; the flow attempts to save a manual override for a planned coverage row. |
| Input | Try to persist a manual mapping/pinning action from any role. |
| Steps | 1) Open the read surface as admin or viewer 2) Attempt the manual mapping / pinning action 3) Observe the system response |
| Expected Result | Manual mapping or pinning is unavailable or rejected; the system remains parser-only and does not persist a user-authored coverage override. |
| Note | Read-only access and write prohibition are both validated from the outside. |

### BB-010: Persist warnings and data-quality issues when parsing or linking fails

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-10 |
| Priority | P0 |
| Category | Audit |
| Preconditions | Synthetic error data `ED-001`, `ED-002`, and `ED-003` produce missing coverage, missing execution evidence, or unknown AC reference signals. |
| Input | Run the parse flow for the synthetic ticket set and inspect the observable warnings / audit output. |
| Steps | 1) Parse the sources 2) Query the warning / audit surface 3) Confirm the warning is attached to the ticket or run |
| Expected Result | Warnings and data-quality issues are persisted and visible; the system does not fail silently. |
| Note | This case is about operational auditability. |

### BB-011: Handle a ticket with zero ACs without inventing coverage

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-1, AC-TEST-COVERAGE-10 |
| Priority | P1 |
| Category | Boundary |
| Preconditions | Synthetic boundary data `BD-001` contains a `spec-pack.md` snapshot whose AC section is empty or absent. |
| Input | Parse the empty / zero-AC spec pack together with any associated ticket metadata. |
| Steps | 1) Parse the source set 2) Read the coverage view 3) Inspect the warnings and AC list |
| Expected Result | The system does not invent ACs or synthetic coverage rows; the ticket is flagged with a warning / data-quality issue. |
| Note | This is the zero-value boundary for the AC source. |

### BB-012: Warn on unknown AC references and malformed source blocks

| item | content |
|---|---|
| Related AC | AC-TEST-COVERAGE-2, AC-TEST-COVERAGE-10 |
| Priority | P1 |
| Category | Error |
| Preconditions | Synthetic error data `ED-003` includes an unknown AC key in `test-plan.md`; `ED-005` includes a malformed or unsupported source block. |
| Input | Parse the source set that contains the unknown reference / malformed block. |
| Steps | 1) Run the parser 2) Inspect the coverage and warning outputs 3) Verify that the unknown reference is not accepted as a valid AC mapping |
| Expected Result | The system raises a visible warning or data-quality issue for the unknown reference / malformed block and does not treat it as valid planned coverage. |
| Note | This protects the canonical mapping contract and the source-format boundary. |

## AC ↔ Black-box Mapping

| AC ID | Black-box case IDs | Covered viewpoint |
|---|---|---|
| AC-TEST-COVERAGE-1 | BB-001, BB-011 | Normal / Boundary |
| AC-TEST-COVERAGE-2 | BB-002, BB-012 | Normal / Error |
| AC-TEST-COVERAGE-3 | BB-003 | Error |
| AC-TEST-COVERAGE-4 | BB-004 | Boundary |
| AC-TEST-COVERAGE-5 | BB-005 | Boundary |
| AC-TEST-COVERAGE-6 | BB-006 | Error |
| AC-TEST-COVERAGE-7 | BB-007 | Normal / Operation |
| AC-TEST-COVERAGE-8 | BB-008 | Operation |
| AC-TEST-COVERAGE-9 | BB-009 | Permission |
| AC-TEST-COVERAGE-10 | BB-010, BB-011, BB-012 | Audit / Boundary / Error |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [ ] State transition
- [ ] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [x] Duplicate
- [x] Non-existing ID
- [x] Deleted data
- [x] External IF failure
- [ ] Timeout/retry
- [x] Double submit
- [x] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output