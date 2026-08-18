# Review Checklist

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29
**Author**: nk_trung   
**Update date**: 2026-06-29

## 1. Specification / AC Matching

| AC ID | Review point | Severity | Result |
|---|---|---|---|
| AC-FCI-1 | First CI Pass is computed from the earliest CI run at PR grain | Blocker | Pending |
| AC-FCI-2 | Earliest `SUCCESS` run marks the PR as first-pass success | Blocker | Pending |
| AC-FCI-3 | Earliest non-`SUCCESS` run marks the PR as first-pass failure | Blocker | Pending |
| AC-FCI-4 | Dedicated exception section is parsed from `report.md` and `self-review.md` | Blocker | Pending |
| AC-FCI-5 | Explicit exception rows are persisted into `tbl_fact_exception` | Blocker | Pending |
| AC-FCI-6 | Missing exception sections create warnings and no synthetic rows | Blocker | Pending |
| AC-FCI-7 | Exception KPI is derived from explicit exception records only | Blocker | Pending |
| AC-FCI-8 | Approval role resolves to role master when possible | Major | Pending |
| AC-FCI-9 | Re-running on the same source hash does not duplicate rows | Blocker | Pending |
| AC-FCI-10 | Warnings and data-quality issues are recorded, not hidden | Blocker | Pending |
| AC-FCI-11 | No FE screen is required in this phase | Major | Pending |

## 2. General System Review

### 2.1. Number / Input Check
- [X] Clear numeric validation for counts and source ordering
- [X] Full-width numbers are handled or explicitly rejected
- [X] Half-width / full-width mixed numbers are considered
- [X] Empty string / null handling is explicit
- [X] Precision / scale / rounding is explicit where scores or counts appear
- [X] No overflow / underflow in paging or counters

### 2.2. Character Type / Encoding / Locale

- [X] Full-width / half-width / emoji / surrogate-pair handling is considered for source text
- [X] Trim rule is explicit
- [X] Unicode normalization does not change meaning
- [X] No mojibake between UTF-8 and other encodings
- [X] Vietnamese / English / Japanese text stays readable

### 2.3. Literal / Magic Number

- [X] No hard-coded business code values are introduced without enum / master / constant support
- [X] Exception types use stable code values, not ad-hoc strings
- [X] Follow-up status values are sourced from the approved rule set
- [X] Approval roles are mapped from master data, not from arbitrary display text

### 2.4. Operation / Maintainability

- [X] Sufficient metadata logs exist for incident investigation
- [X] TraceId / request correlation is available
- [X] Retry / duplicate execution is considered
- [X] Rollback / manual recovery path is clear
- [X] Configuration is not hard-coded

## 3. FE Review

- [X] No FE implementation is added in this phase
- [X] No FE helper or route is invented prematurely

## 4. BE / API Review

- [X] Controller stays thin if a controller is added later
- [X] Service logic stays in application use cases
- [X] No infrastructure class is imported from `web`
- [X] Only read-only endpoints are used for KPI access
- [X] Standard error envelope and traceId behavior are preserved

## 5. DB / Migration Review

- [X] Existing `tbl_fact_ci_run` and `tbl_fact_exception` are reused first
- [X] `tbl_fact_ci_job` remains diagnostic only
- [X] Any provenance extension is additive and nullable
- [X] No new table is added without explicit approval
- [X] Schema naming stays consistent with V4 conventions

## 6. Security / Privacy Review

- [X] No raw CI logs are stored
- [X] No raw prompt / chat / source text is stored
- [X] No secrets or tokens are persisted or logged
- [X] Approval is role-based, not person-based
- [X] Warnings do not leak sensitive raw content

## 7. Operation / Maintenance Review

- [X] Logs are metadata-only
- [X] Data-quality issues are visible to Data Ops
- [X] Parser reruns are idempotent
- [X] The implementation remains explainable without raw logs
- [X] Maintenance of source-section provenance is clear

## 8. Test Review

- [X] First-run selection test exists
- [X] Success / failure boundary tests exist
- [X] Missing-section warning test exists
- [X] Duplicate rerun / idempotency test exists
- [X] Approval-role resolution test exists
- [X] No-raw-content security test exists

## 9. Documentation / Traceability Review

- [X] Context maps screens / APIs / jobs correctly
- [X] Methods that actually exist are listed separately from methods that do not exist
- [X] DTO / table / migration mapping is explicit
- [X] Code value mapping is explicit
- [X] Open issues are kept separate from confirmed rules

## 10. Release / Rollback Review

- [X] Phase 2 artifacts only; no production code is claimed as done
- [X] Any future migration would be additive only
- [X] Rollback plan is stated for any later code phase
- [X] No scope creep into FE or unrelated collectors

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect report | Record reason for rejection |
| Accepted Risk | Accepted risk | Record impact / owner / deadline |