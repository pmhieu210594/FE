# Test Data

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## Data Policy

Use only synthetic ticket IDs, synthetic AC keys, synthetic test plans, synthetic test results, and synthetic CI metadata. Do not use production tickets, production logs, production tokens, raw source text, or any secret material outside the allowed metadata model.

## Master Data

| name | value | purpose |
|---|---|---|
| AC status | `ACTIVE`, `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN` | Coverage state verification. |
| Execution status | `SUCCESS`, `FAILED`, `CANCELLED`, `SKIPPED`, `RUNNING`, `PENDING`, `UNKNOWN` | Test-result and CI summary verification. |
| Parse mode | `DRAFT`, `PUBLISHED` | Snapshot / rerun distinction. |
| Evidence signal | `FIRST_CI_PASS`, `EXCEPTION`, `WARNING`, `DATA_QUALITY` | KPI / audit verification. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `system` | N/A | parser/write service | Synthetic actor for parse and persistence flows. |
| `admin-user` | ADMIN | read dashboard / attempt write override | Verify that admin can read but still cannot create manual coverage pinning. |
| `viewer-user` | VIEWER | read-only dashboard | Verify read-only consumption paths. |
| `anonymous` | N/A | no auth | Verify that no silent write path exists for unauthenticated access. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| ND-001 | Ticket with 10 AC blocks, a matching `test-plan.md`, 4 planned test cases, and complete execution evidence | Happy-path extraction and AC-first grouping. |
| ND-002 | Ticket with one AC and one planned test case, but no `test-results.md` evidence | `UNTESTED` boundary. |
| ND-003 | Ticket with one AC mapped to two planned tests, only one executed | `PARTIAL` boundary. |
| ND-004 | Ticket with an earliest passing CI run and a later warning / exception run | `First CI Pass` and `Exception` KPI verification. |

## Error Data

| ID | data | expected error |
|---|---|---|
| ED-001 | AC exists in `spec-pack.md` but no matching row exists in `test-plan.md` | `MISSING` / coverage warning. |
| ED-002 | Planned coverage exists but no `test-results.md` evidence is available | `UNTESTED`. |
| ED-003 | `test-plan.md` references an unknown AC key | `UNKNOWN_AC_REFERENCE`. |
| ED-004 | The same AC has both pass and fail evidence in the same evaluation window | Final `FAILED` / `COVERAGE_CONFLICT`. |
| ED-005 | Malformed or unsupported source block in the spec or plan snapshot | `UNSUPPORTED_FORMAT` / source warning. |
| ED-006 | Manual mapping / pinning attempt from a UI or API write action | Rejected / not available. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| BD-001 | AC count | 0 | Empty AC section is flagged and no fabricated AC rows appear. |
| BD-002 | AC count | 1 | Single-AC ticket still renders a stable key and status. |
| BD-003 | Planned tests per AC | 2 | If only one of two executions exists, status resolves to `PARTIAL`. |
| BD-004 | ACs per test case | 2 | One test case may cover multiple ACs without duplication errors. |
| BD-005 | CI summary availability | 0 | Final status stays based on executed evidence; KPI support may be absent. |
| BD-006 | Evidence count for one AC | pass + fail | `FAILED` wins over `PASSED`. |

## Existing Data Compatibility

- Reuse `tbl_fact_acceptance_criteria` as the AC master.
- Reuse `tbl_fact_test_case` for planned coverage links.
- Reuse `tbl_fact_test_run` for execution evidence.
- Reuse `tbl_fact_ac_test_coverage` for planned / executed linkage and status readback.
- Reuse `tbl_fact_ci_run` for CI summary metadata when available.
- Reuse `tbl_fact_evidence_event` and `tbl_fact_data_quality` for audit and warnings.
- Do not add a new table for the black-box test design.

## Data Setup Procedure

1. Seed a synthetic ticket scope with the chosen `ticket_id` and `repository_id`.
2. Insert or parse the synthetic `spec-pack.md` AC blocks.
3. Insert or parse the synthetic `test-plan.md` mappings.
4. Insert or parse the synthetic `test-results.md` rows when the scenario requires execution evidence.
5. Add synthetic CI summary metadata only for KPI or conflict scenarios.
6. Record warnings and data-quality signals as metadata, not raw text.

## Data Cleanup Procedure

1. Remove synthetic ticket/test rows created for the scenario.
2. Delete temporary parse snapshots and evidence events after the scenario is complete.
3. Reset the fixture set to the baseline synthetic data before the next review pass.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII or secrets to artifacts.
- Do not copy raw source text into the test data file.