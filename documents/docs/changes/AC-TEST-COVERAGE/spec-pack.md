# Spec Pack

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-26

## 1. Context / Purpose

The AC-Test Coverage logic feature is used to link Acceptance Criteria (AC) with the test cases already defined in `test-plan.md`, then display coverage status at the ticket level in the Dashboard. This is part of the Dashboard, not a standalone business screen. The UI is only a surface for testing and comparing parser and read model results.

The MVP goal is to make four things clear: which ACs have planned test cases, which ACs have executed evidence, which ACs have no test case and therefore must be `MISSING`, and which ACs have test cases but no executed evidence yet and therefore must be `UNTESTED`.

## 2. Scope

### 2.1. Within range

- Extract numbered ACs from `spec-pack.md`.
- Treat `spec-pack.md` as the single source of truth for ACs.
- Parse `test-plan.md` to extract test cases and AC-to-test mappings.
- Parse `test-results.md` to extract executed evidence and pass/fail results.
- Use `CI summary` as supporting evidence to confirm pass/fail and build health.
- Link ACs to evidence using the current parser rules, with no manual mapping.
- Calculate ticket-level coverage and display it in an `AC -> test cases` orientation.
- Calculate `First CI Pass` and `Exception` as supporting KPIs in the MVP spec pack.
- Persist metadata, warnings, and data quality issues using the existing schema.

### 2.2. Out of range

- Black-box parser or black-box coverage.
- Automatically generating new test cases from ACs.
- Manual mapping/pinning between ACs and test cases.
- Cross-project benchmarking in the MVP.
- Storing raw chat, raw prompt, or full source text in the analytics DB.
- Adding new tables if the existing schema is already sufficient for the MVP.

## 3. Terminology

| terms | meaning | notes |
|---|---|---|
| AC | Acceptance Criteria extracted from `spec-pack.md` | Must have a stable key within the ticket |
| AC Key | The standard AC identifier within the ticket scope, for example `AC-<TICKET>-1` | Used as the primary matching key |
| Test Case | A test item defined in `test-plan.md` | Sole source of test cases |
| Planned Coverage | AC-to-test mapping that appears in `test-plan.md` | Not yet executed evidence |
| Executed Coverage | Coverage with execution evidence from `test-results.md` or CI summary | Used for the final PASS/FAIL state |
| Coverage Status | Standardized coverage state | `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN` |
| CI Summary | Test metadata from CI/pipeline | Supporting evidence only |
| Evidence Event | Parse / validate / compute event | Used for audit and troubleshooting |
| SSOT | Single Source of Truth | Files in the repository are the canonical source |

## 4. As-Is

- The current code already has flows for reading ACs, parsing test-plan, parsing test-results, persisting evidence, and calculating evidence quality score.
- Planned coverage can already be written into the existing AC coverage table.
- However, the rule boundaries are still spread across multiple services, so a canonical spec is needed as the module standard.
- The repository does not yet have a single official spec pack for AC-Test Coverage.
- The MVP does not include black-box parsing.

## 5. To-Be

- `spec-pack.md` is the single source of truth for ACs.
- `test-plan.md` is the sole source of test cases and planned coverage.
- `test-results.md` and `CI summary` are only supporting evidence used to confirm pass/fail.
- The Dashboard reads coverage through the existing read model using ticket scope and nested AC rows.
- ACs without test cases in `test-plan.md` must be shown as `MISSING`.
- ACs with test cases but no executed evidence yet must be shown as `UNTESTED`.
- Coverage may be partial at the ticket level.

## 6. Detailed specification

### 6.1. Business Rules

| rule | detail |
|---|---|
| ACs must be extracted from `spec-pack.md` | Use only numbered ACs or ACs normalized into stable keys |
| `spec-pack.md` is the authoritative AC source | Do not invent new ACs if the spec is incomplete |
| `test-plan.md` is the sole source of test cases | A test case may cover multiple ACs, and an AC may map to multiple test cases |
| `test-results.md` is the source of executed evidence | Used to confirm pass/fail |
| `CI summary` is supporting evidence | Used only to supplement build/test health signals |
| A direct reference beats inference | A direct AC id is stronger than contextual inference |
| Fail beats pass | If there is a conflict within the same calculation window, `FAILED` must override `PASSED` |
| No test case in `test-plan.md` | Status must be `MISSING` |
| Test case exists but no executed evidence | Status must be `UNTESTED` |
| Weak linkage means `UNKNOWN` | Used only when there is a candidate link but insufficient confidence |
| Parse warnings must be visible | Record warnings/data quality issues instead of failing silently |
| Prefer reusing the existing schema | The MVP should not add new tables unless truly necessary |

### 6.2. Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| `ticket_id` | string | Yes | Must exist in ticket scope | Main lookup key |
| `repository_id` | string | Yes | Must exist in repository scope | Used for traceability |
| `spec-pack.md` | markdown / parsed snapshot | Yes | Must contain numbered AC sections or normalized keys | AC source of truth |
| `test-plan.md` | markdown / parsed snapshot | Yes | Must contain AC-to-test mappings | Planned coverage source |
| `test-results.md` | markdown / parsed snapshot | No | Must contain pass/fail evidence if present | Executed evidence source |
| `CI summary` | structured metadata / text | No | Must be linkable by ticket/PR/test run | Supporting evidence only |
| `trace_id` | string | No | Per system standard | Used for audit |
| `parser_version` | string | No | Semantic version or parser id | Used for debug/rerun |

### 6.3. Output

| item | type | format | notes |
|---|---|---|---|
| `ticket_id` | string | key | Ticket scope |
| `ac_key` | string | `AC-<TICKET>-1` style | Stable key |
| `ac_text` | string | text | Normalized AC content |
| `coverage_status` | enum | `MISSING` / `UNTESTED` / `PARTIAL` / `PASSED` / `FAILED` / `UNKNOWN` | Final status |
| `planned_flag` | boolean | true/false | Whether planned coverage exists |
| `linked_test_case_ids` | array | list | Test cases from `test-plan.md` |
| `linked_test_run_ids` | array | list | Test execution evidence |
| `linked_ci_run_ids` | array | list | Supporting CI evidence |
| `confidence_score` | number | 0-100 | Internal score for weak linkage |
| `coverage_percent` | decimal | 0-100 | Ticket-level aggregate |
| `first_ci_pass_flag` | boolean | true/false | Supporting KPI |
| `exception_flag` | boolean | true/false | Supporting KPI, inferred in the read model |
| `warnings` | array | list | Parse / linkage warnings |

### 6.4. Error / Exception

| case | expected behavior | message/code | notes |
|---|---|---|---|
| `spec-pack.md` missing | Reject or mark ticket as incomplete | `SPEC_PACK_NOT_FOUND` | ACs cannot be finalized |
| AC section missing | Record warning/data quality issue | `AC_SECTION_MISSING` | Do not invent ACs |
| `test-plan.md` missing | All ACs must be `MISSING` | `TEST_PLAN_NOT_FOUND` | No test-case source of truth |
| `test-results.md` missing | Planned coverage may still be `UNTESTED` | `TEST_RESULTS_NOT_FOUND` | Do not infer pass |
| CI summary unlinked | Ignore for final status or use as weak support | `CI_SUMMARY_UNLINKED` | Do not overstate status |
| conflicting evidence | Choose `FAILED` | `COVERAGE_CONFLICT` | Fail beats pass |
| unsupported format | Record source issue | `UNSUPPORTED_FORMAT` | Data Ops should review |

### 6.5. Boundary Value

| item | min | max | special cases | expected |
|---|---|---|---|---|
| Number of ACs in a ticket | 0 | Many | Empty AC section | Tickets without ACs must be warned |
| Number of test cases / AC | 0 | Many | One test case covers multiple ACs | Many-to-many must be supported |
| Number of evidence items for one AC | 0 | Many | Both pass and fail exist | Fail beats pass |
| Coverage status | 0 states | 6 states | `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN` | Output must be stable |

### 6.6. Non-functional

| item | requirement | target / threshold | verification | notes |
|---|---|---|---|---|
| Performance | Ticket coverage read model must be fast enough for Dashboard use | Suitable for internal MVP usage | Integration / smoke test | Not optimized for real-time |
| Security | Do not store raw prompt/chat/full source text | 0 cases | Code review / test | Metadata-only |
| Availability / Reliability | Reparse must be idempotent | Same source hash must not create duplicates | Regression test | Rerun safe |
| Maintainability | Parsing rules must be centralized and easy to adjust when templates change | Parser version available | Review / regression | Avoid scattered logic |
| Observability / Logging | Must have warnings/data-quality and trace id | Always available | Log review | Supports Data Ops |
| Compatibility | Reuse existing schema | No new table unless needed | DB review | MVP reuse-first |

## 7. Acceptance Criteria

| ACID | description | testable? | notes |
|---|---|---|---|
| AC-TEST-COVERAGE-1 | The system can extract ACs from `spec-pack.md` into stable AC Keys | Yes | Official AC source |
| AC-TEST-COVERAGE-2 | The system uses test cases from `test-plan.md` as the only source of planned coverage | Yes | No manual mapping |
| AC-TEST-COVERAGE-3 | The system shows `MISSING` when an AC has no test case in `test-plan.md` | Yes | Required status |
| AC-TEST-COVERAGE-4 | The system shows `UNTESTED` when planned coverage exists but there is no executed evidence yet | Yes | Planned != executed |
| AC-TEST-COVERAGE-5 | The system shows `PARTIAL` when one AC has multiple mappings but coverage is incomplete | Yes | Partial coverage |
| AC-TEST-COVERAGE-6 | The system uses `test-results.md` and `CI summary` as supporting evidence to confirm pass/fail | Yes | CI summary is not the primary source |
| AC-TEST-COVERAGE-7 | The system shows coverage in an `AC -> test cases` orientation at the ticket level | Yes | Dashboard surface |
| AC-TEST-COVERAGE-8 | The system can compute `First CI Pass` and `Exception` as supporting KPIs in the MVP | Yes | Supporting KPIs in the Dashboard |
| AC-TEST-COVERAGE-9 | The system does not allow manual mapping/pinning in the MVP | Yes | Parser only |
| AC-TEST-COVERAGE-10 | The system persists warnings/data-quality issues when parsing or linkage has problems | Yes | No silent failures |

## 8. Examples

### 8.1. Normal Case
- `spec-pack.md` contains 3 ACs.
- `test-plan.md` maps the 3 ACs to 4 test cases.
- `test-results.md` shows 2 ACs passing and 1 AC partial.
- The Dashboard displays AC -> test cases with the corresponding statuses.

### 8.2. Error Case
- `test-plan.md` does not contain a mapping for one AC.
- The system assigns `MISSING` to that AC and records a warning.
- No new test case is automatically generated.

### 8.3. Boundary Case
- One AC has only 1 planned test case but no test results yet.
- The status must be `UNTESTED`.
- If CI summary has a weak signal but the link is not strong enough, the maximum status is still only `UNKNOWN`.

## 9. Source Availability Summary

| source | availability | usage | note |
|---|---|---|---|
| `spec-pack.md` | available | AC source of truth | Mandatory |
| `test-plan.md` | available | planned coverage source | Mandatory |
| `test-results.md` | available | executed evidence source | Supporting |
| `CI summary` | available | supporting evidence | Not the primary source |
| Existing V4 schema | available | persistence layer | Reuse-first |

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: FE+BE+DB
- Primary risk: Spec / Contract / Test
- Review mode: Standard
- Required options: Source Analysis / FE-BE Contract / DB Migration / Full Security
```

## 11. FE/BE Contract Impact

The backend must provide a read model at the ticket scope so the Dashboard can display the coverage card and ticket detail table. The frontend uses this only as a surface for testing and comparison, not as a standalone business screen. The response should prioritize grouping by AC first, then nesting test cases/evidence below.

## 12. DB/Migration Impact

| area | impact | note |
|---|---|---|
| `tbl_fact_acceptance_criteria` | reuse | AC master source |
| `tbl_fact_ac_test_coverage` | reuse | Stores planned/executed linkage if already available |
| `tbl_fact_test_run` | reuse | Stores test run summary |
| `tbl_fact_ci_run` | reuse | Stores CI summary metadata |
| `tbl_fact_evidence_event` | reuse | Stores parse/compute audit events |
| `tbl_fact_data_quality` | reuse | Stores warnings and parse issues |
| `tbl_fact_metric_value` | reuse | Stores metrics if needed for read model |

The MVP does not require new tables if the existing schema is sufficient.

## 13. Security/Privacy Impact

Do not store raw chat, raw prompt, secret, credential, or full source text in the analytics DB. Only store the metadata necessary for linkage, audit, and troubleshooting.

## 14. Operation/Maintenance Impact

The parser must be idempotent. Re-parsing the same source hash must not create duplicates. Warnings and data-quality rows must be readable by Data Ops. The rule set should be centralized so that template changes remain easy to maintain later.

## 15. Test Strategy Summary

- Unit test: parse ACs, map planned coverage, status precedence, coverage percentage.
- Integration test: parser -> persistence -> read model on the V4 schema.
- Data quality test: missing `test-plan.md`, AC without mapping, conflicting evidence.
- Regression test: reparse does not create duplicates and supporting KPIs remain stable.
- Operational verification: Dashboard can read AC -> test cases and recognize `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`.

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-AC-TEST-COVERAGE-1 | The Dashboard coverage card will display in an AC -> test cases orientation | Affects how users read coverage | PM / Backend / FE | Closed |
| H-AC-TEST-COVERAGE-2 | Whether First CI Pass and Exception KPIs are included in the MVP spec pack | Affects Dashboard scope | PM / Data Ops | Closed |
| H-AC-TEST-COVERAGE-3 | The read model uses the existing aggregation endpoint with ticket scope and nested AC rows | Affects the Dashboard contract | Backend / FE | Closed |

## 17. Assumptions and Inference Log

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-AC-TEST-COVERAGE-1 | `spec-pack.md` is the official AC source | Current ticket and parser conventions | Low | No |
| A-AC-TEST-COVERAGE-2 | `test-plan.md` is the sole source of test cases | User decision | Low | No |
| A-AC-TEST-COVERAGE-3 | `test-results.md` and `CI summary` are supporting evidence only | User decision | Low | No |
| A-AC-TEST-COVERAGE-4 | Manual mapping/pinning is not part of the MVP | User decision | Low | No |
| A-AC-TEST-COVERAGE-5 | The existing schema is sufficient for the MVP | The current DB already contains the needed fact tables | Medium | Yes if implementation reveals gaps |

## 18. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-AC-TEST-COVERAGE-1 | There are no remaining business open issues for Phase 1 after the source, status, and read model contract rules have been finalized | No impact on MVP scope | N/A | Closed |