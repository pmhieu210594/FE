# Black-box Test Cases

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung  
**Update date**: 2026-06-30  

## Test Case Summary

| case ID | AC ID | priority | category | title | status |
|---|---|---|---|---|
| BB-001 | AC-FCI-1 | P0 | Boundary | Earliest CI run is selected deterministically | PASS |
| BB-002 | AC-FCI-2 | P0 | Normal | Earliest CI run marked SUCCESS becomes First CI Pass | PASS |
| BB-003 | AC-FCI-3 | P0 | Normal | Earliest CI run marked FAILED is not First CI Pass | PASS |
| BB-004 | AC-FCI-4 | P0 | Normal / Error | Dedicated exception section is parsed from report/self-review | PASS |
| BB-005 | AC-FCI-5 | P0 | Normal / Duplicate | Explicit exception row persists once into tbl_fact_exception | PASS |
| BB-006 | AC-FCI-6 | P0 | Error | Missing exception section records warning only | PASS |
| BB-007 | AC-FCI-7 | P0 | Normal / Boundary | Exception KPI counts explicit records only | PASS |
| BB-008 | AC-FCI-8 | P1 | Boundary / Permission | Approval role resolves when possible, otherwise warns | PASS |
| BB-009 | AC-FCI-9 | P0 | Duplicate | Same source hash rerun is idempotent | PASS |
| BB-010 | AC-FCI-10 | P0 | State / Audit | Warning and data-quality output is visible | PASS |
| BB-011 | AC-FCI-11 | P1 | Permission / Scope | No FE screen is required in this phase | PASS |

## AC Coverage Matrix

| AC ID | Covered by | Coverage note |
|---|---|---|
| AC-FCI-1 | BB-001 | Deterministic earliest-run selection, including tie/ordering boundary. |
| AC-FCI-2 | BB-002 | Success-path First CI Pass at PR grain. |
| AC-FCI-3 | BB-003 | Failure-path First CI Pass at PR grain. |
| AC-FCI-4 | BB-004 | Dedicated exception section parsing from both markdown sources. |
| AC-FCI-5 | BB-005 | Persistence of explicit exception row with source metadata. |
| AC-FCI-6 | BB-006 | Missing section produces warning, not synthetic data. |
| AC-FCI-7 | BB-007 | KPI read result counts explicit records only. |
| AC-FCI-8 | BB-008 | Approval role reference is persisted when resolvable. |
| AC-FCI-9 | BB-009 | Re-run on same source hash remains idempotent. |
| AC-FCI-10 | BB-010 | Warnings / data-quality issues are observable. |
| AC-FCI-11 | BB-011 | BE-only scope guard; no FE artifact is introduced. |

## Test Cases

### BB-001: Earliest CI run is selected deterministically

| item | content |
|---|---|
| Related AC | AC-FCI-1 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | The same PR has at least two CI runs in scope. One run has an earlier `started_at`; the other may have a later status, including `SUCCESS`. |
| Input | Two CI runs for the same PR with different timestamps; optional tie case where `started_at` is equal but collected order differs. |
| Steps | 1) Request the KPI/read-model result for the PR. 2) Repeat the request after reloading the source data. 3) Compare which run is used as the first run. |
| Expected Result | The same earliest run is selected every time. When the ordering is tied or ambiguous, the system still resolves one deterministic earliest run and does not switch between reruns. |
| Note | CI job rows are diagnostic only and must not override the run-level decision. |

### BB-002: Earliest CI run marked SUCCESS becomes First CI Pass

| item | content |
|---|---|
| Related AC | AC-FCI-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The PR has exactly one earliest CI run and its normalized status is `SUCCESS`. |
| Input | One PR with one CI run; later rerun entries may exist but are later than the first run. |
| Steps | 1) Read the KPI result for the PR. 2) Confirm the first run status. |
| Expected Result | `first_ci_pass_flag = true` and the earliest run status is `SUCCESS`. |
| Note | Later reruns do not change the truth value of the first-run KPI. |

### BB-003: Earliest CI run marked FAILED is not First CI Pass

| item | content |
|---|---|
| Related AC | AC-FCI-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The PR has an earliest CI run with a normalized failing status. |
| Input | One PR with earliest run `FAILED`; a later rerun may exist with `SUCCESS`. |
| Steps | 1) Read the KPI result for the PR. 2) Verify the earliest run status used for the KPI. |
| Expected Result | `first_ci_pass_flag = false` and the earliest run is still the source of truth. |
| Note | A later successful rerun does not retroactively convert the first-run KPI. |

### BB-004: Dedicated exception section is parsed from report/self-review

| item | content |
|---|---|
| Related AC | AC-FCI-4 |
| Priority | P0 |
| Category | Normal / Error |
| Preconditions | The artifact uses the updated template and contains the dedicated `Exception Record` section. |
| Input | `report.md` or `self-review.md` with one or more explicit exception rows; a second variant with malformed table headers. |
| Steps | 1) Parse the markdown artifact. 2) Check extracted rows. 3) Repeat with malformed input and verify warning handling. |
| Expected Result | Valid rows are extracted as structured exception records. Malformed rows are not silently interpreted as generic risk text. |
| Note | Generic `Accepted Risk` or similar prose is ignored unless explicitly represented in the exception section. |

### BB-005: Explicit exception row persists once into tbl_fact_exception

| item | content |
|---|---|
| Related AC | AC-FCI-5 |
| Priority | P0 |
| Category | Normal / Duplicate |
| Preconditions | A parsed exception record exists and has a valid ticket/source identity. |
| Input | One explicit exception record with reason, follow-up status, and optionally an approval role. |
| Steps | 1) Persist the parsed exception. 2) Re-run persistence with the same source hash. 3) Inspect the resulting table row count. |
| Expected Result | One explicit exception row exists for the source identity; rerun does not create a duplicate. |
| Note | The persisted row should keep provenance fields needed for later read-model usage. |

### BB-006: Missing exception section records warning only

| item | content |
|---|---|
| Related AC | AC-FCI-6 |
| Priority | P0 |
| Category | Error |
| Preconditions | The artifact does not contain the dedicated exception section. |
| Input | Markdown with only generic risk text or with the exception section omitted entirely. |
| Steps | 1) Parse the artifact. 2) Inspect warnings and parsed output. |
| Expected Result | The system records a warning/data-quality issue and does not create synthetic exception rows. |
| Note | This is a trust-boundary test: no invented exception is allowed. |

### BB-007: Exception KPI counts explicit records only

| item | content |
|---|---|
| Related AC | AC-FCI-7 |
| Priority | P0 |
| Category | Normal / Boundary |
| Preconditions | The ticket or PR has at least one explicit exception row in DB. |
| Input | KPI read request for a scope with one explicit exception and one scope with zero explicit exceptions. |
| Steps | 1) Read the KPI result for the populated scope. 2) Read the KPI result for the empty scope. 3) Compare the counts. |
| Expected Result | The populated scope returns counts based only on explicit exception rows; the empty scope returns zero counts and `hasExplicitExceptions = false`. |
| Note | Generic risk text must not affect the count. |

### BB-008: Approval role resolves when possible, otherwise warns

| item | content |
|---|---|
| Related AC | AC-FCI-8 |
| Priority | P1 |
| Category | Boundary / Permission |
| Preconditions | One exception row references a role name that exists in `tbl_dim_role`; another row references a role name that does not exist. |
| Input | Two exception records: one resolvable approval role, one unresolved approval role. |
| Steps | 1) Parse both records. 2) Persist them. 3) Inspect the stored role reference and warnings. |
| Expected Result | The resolvable role is stored as a role reference; the unresolved role stays valid with a null role reference and a warning. |
| Note | The black-box result must be based on role master resolution, not personal names. |

### BB-009: Same source hash rerun is idempotent

| item | content |
|---|---|
| Related AC | AC-FCI-9 |
| Priority | P0 |
| Category | Duplicate |
| Preconditions | The same source artifact is parsed twice with the same parser version and source identity. |
| Input | Two identical parse/persist requests for the same ticket/source hash. |
| Steps | 1) Run the parser and persistence flow once. 2) Run it again with the same input. 3) Compare the count of CI rows and exception rows. |
| Expected Result | No duplicate CI or exception rows are created; the second run behaves as an idempotent re-run. |
| Note | The expected result includes stable output, not just absence of crash. |

### BB-010: Warning and data-quality output is visible

| item | content |
|---|---|
| Related AC | AC-FCI-10 |
| Priority | P0 |
| Category | State / Audit |
| Preconditions | The source contains malformed or incomplete exception data, or a missing exception section. |
| Input | Incomplete exception row, malformed table, or missing section. |
| Steps | 1) Parse and persist the artifact. 2) Inspect returned warnings or stored data-quality records. 3) Verify trace/audit information is present. |
| Expected Result | Warning/data-quality information is recorded and can be observed through the read path or logs; the system does not fail silently. |
| Note | This case is about operability and auditability as well as correctness. |

### BB-011: No FE screen is required in this phase

| item | content |
|---|---|
| Related AC | AC-FCI-11 |
| Priority | P1 |
| Category | Permission / Scope |
| Preconditions | The ticket is in BE-only scope and the phase is validated against repository contents. |
| Input | Scope review of the change set and file structure. |
| Steps | 1) Inspect the delivered artifact set. 2) Verify whether any FE screen, FE route, or FE component was introduced for this ticket. |
| Expected Result | No FE screen is introduced. The phase stays BE-only and the review can sign off this scope guard. |
| Note | This is a scope-control black-box check, not a UI flow test. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [x] Numeric input
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