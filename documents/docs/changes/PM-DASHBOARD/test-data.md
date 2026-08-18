# Test Data

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: claude-sonnet-4-6
**Update date**: 2026-06-26

---

## Data Policy

- Use synthetic data only.
- Do not use production PII, secrets, or raw evidence content.
- Keep fixtures small but representative.
- Include at least one boundary fixture for EQS 0 and one for EQS 100.
- All `ownerDisplay` values must use role-based pseudonyms only (no real names).
- Use hardcoded UUIDs with prefix `90000000-0000-0000-0000-` for test records.

---

## 1. Reference Data

| type | name | UUID | purpose |
|---|---|---|---|
| Project | EDCAP | `90000000-0000-0000-0000-000000000001` | Primary filter |
| Project | ALPHA | `90000000-0000-0000-0000-000000000002` | Second project for filter isolation |
| Repository | EDCAP_BE | `90000000-0000-0000-0000-000000000010` | Backend ticket source |
| Repository | EDCAP_FE | `90000000-0000-0000-0000-000000000011` | Frontend ticket source |
| Phase | SPEC | `90000000-0000-0000-0000-000000000020` | Specification phase |
| Phase | PLAN | `90000000-0000-0000-0000-000000000021` | Planning phase |
| Phase | REVIEW | `90000000-0000-0000-0000-000000000022` | Review phase |
| Phase | TEST | `90000000-0000-0000-0000-000000000023` | Testing phase |
| Phase | REPORT | `90000000-0000-0000-0000-000000000024` | Report phase |

---

## 2. User Personas

| alias | role | export permission | refresh permission | UUID |
|---|---|---|---|---|
| U-PM | PM | No | No | `90000000-0000-0000-0000-000000000100` |
| U-PM-EXP | PM | Yes | No | `90000000-0000-0000-0000-000000000101` |
| U-PM-REF | PM | No | Yes | `90000000-0000-0000-0000-000000000102` |
| U-OTHER | VIEWER (non-PM) | No | No | `90000000-0000-0000-0000-000000000103` |
| U-ANON | Unauthenticated | — | — | — |

U-PM covers the view-only happy path (BB-001, BB-005, BB-007, BB-008, BB-009, BB-012–017, BB-018–026, BB-028–034, BB-039, BB-047–049).
U-PM-EXP is needed for BB-036, BB-038, BB-042.
U-PM-REF is needed for BB-040, BB-044.
U-OTHER is needed for BB-003.
U-ANON is needed for BB-002.

---

## 3. Test Tickets

| alias | UUID | external_key | title | project | repository | phase | EQS | score_band | blocked | age_days | owner_display |
|---|---|---|---|---|---|---|---|---|---|---|---|
| T-ALL-OK | `90000000-0000-0000-0000-000000000200` | TST-100 | All Evidence Present | EDCAP | EDCAP_BE | SPEC | 100 | EXCELLENT | false | 0 | "Backend Role" |
| T-MISSING | `90000000-0000-0000-0000-000000000201` | TST-101 | Missing Evidence Case | ALPHA | EDCAP_FE | PLAN | 45 | RISKY | false | 4 | "Frontend Role" |
| T-BLOCKED | `90000000-0000-0000-0000-000000000202` | ABC-124 | Blocked in Plan Phase | EDCAP | EDCAP_BE | PLAN | 68 | WARNING | true | 12 | "QA Role" |
| T-ZERO | `90000000-0000-0000-0000-000000000203` | TST-103 | All Evidence Missing | EDCAP | EDCAP_BE | PLAN | 0 | CRITICAL | false | 7 | "Infra Role" |
| T-RISK-MULTI | `90000000-0000-0000-0000-000000000204` | TST-104 | Multiple Risk Levels | EDCAP | EDCAP_FE | REVIEW | 72 | WARNING | false | 2 | "PM Role" |
| T-STALE | `90000000-0000-0000-0000-000000000205` | TST-105 | Stale Snapshot Case | ALPHA | EDCAP_BE | TEST | 55 | WARNING | false | 30 | "Backend Role" |

T-ZERO note: missingEvidenceCount = total number of required artifact types for PLAN phase (min 3 per seeded tbl_dim_artifact_type).
T-STALE note: snapshot timestamp must be set to > 24 hours before test run to simulate staleness (BB-046).

---

## 4. Risk Records (tbl_fact_risk)

| UUID | ticket | severity | status | description |
|---|---|---|---|---|
| `90000000-0000-0000-0000-000000000300` | T-BLOCKED | HIGH | OPEN | "Missing rollback plan" |
| `90000000-0000-0000-0000-000000000301` | T-RISK-MULTI | CRITICAL | OPEN | "No security review completed" |
| `90000000-0000-0000-0000-000000000302` | T-RISK-MULTI | HIGH | OPEN | "Dependency on unmerged branch" |
| `90000000-0000-0000-0000-000000000303` | T-RISK-MULTI | LOW | OPEN | "Minor doc gap" |

T-ALL-OK and T-ZERO have 0 risk rows — used to verify "badge absent or shows None" (BB-023).

---

## 5. Missing Evidence Records (tbl_fact_artifact_snapshot)

| ticket | artifact_type | required_flag | exists_flag | phase |
|---|---|---|---|---|
| T-MISSING | impl-plan.md | true | false | PLAN |
| T-MISSING | risk-register.md | true | false | PLAN |
| T-MISSING | report.md | true | false | PLAN |
| T-BLOCKED | impl-plan.md | true | false | PLAN |
| T-BLOCKED | report.md | true | false | PLAN |
| T-STALE | report.md | true | false | TEST |
| T-ALL-OK | spec.md | true | true | SPEC |
| T-ALL-OK | impl-plan.md | true | true | SPEC |
| T-ALL-OK | report.md | true | true | SPEC |

T-ZERO: seed all required artifact types for PLAN phase with exists_flag = false.

---

## 6. EQS Score Records (tbl_fact_evidence_quality_score)

| ticket | spec_score | plan_score | review_score | test_score | ci_score | report_score | total | score_band | score_rule_version |
|---|---|---|---|---|---|---|---|---|---|
| T-ALL-OK | 17 | 17 | 17 | 17 | 16 | 16 | 100 | EXCELLENT | v1 |
| T-MISSING | 10 | 5 | 8 | 9 | 7 | 6 | 45 | RISKY | v1 |
| T-BLOCKED | 15 | 5 | 8 | 9 | 12 | 4 | 53† | WARNING | v1 |
| T-ZERO | 0 | 0 | 0 | 0 | 0 | 0 | 0 | CRITICAL | v1 |
| T-RISK-MULTI | 14 | 13 | 13 | 12 | 11 | 9 | 72 | WARNING | v1 |
| T-STALE | 10 | 10 | 10 | 9 | 9 | 7 | 55 | WARNING | v1 |

† T-BLOCKED sub-scores from spec-pack §8.1 example sum to 53, but the spec example uses total = 68. The total field must be set to 68 in the DB fixture to match the spec example. Sub-score formula is blocked on OI-PM-DASHBOARD-1.

---

## 7. Boundary Data

| ID | item | value | fixture | expected |
|---|---|---|---|---|
| B-001 | EQS | 0 | T-ZERO | score_band = CRITICAL; all sub-scores = 0 |
| B-002 | EQS | 100 | T-ALL-OK | score_band = EXCELLENT; missingEvidenceCount = 0 |
| B-003 | EQS boundary | 90 | T-BOUNDARY-90 (placeholder) | BLOCKED — H-PM-DASHBOARD-2 |
| B-004 | EQS boundary | 75 | T-BOUNDARY-75 (placeholder) | BLOCKED — H-PM-DASHBOARD-2 |
| B-005 | EQS boundary | 60 | T-BOUNDARY-60 (placeholder) | BLOCKED — H-PM-DASHBOARD-2 |
| B-006 | EQS boundary | 40 | T-BOUNDARY-40 (placeholder) | BLOCKED — H-PM-DASHBOARD-2 |
| B-007 | missingEvidenceCount | 0 | T-ALL-OK | row shown; no missing signal; green/neutral indicator |
| B-008 | age_days | 0 | T-ALL-OK (updated today) | display "0d" or "Today" |
| B-009 | search | 1 char "A" | any dataset | HTTP 200; returns matching rows or empty list |
| B-010 | search | 255 chars | any dataset | HTTP 200; request accepted |
| B-011 | search | whitespace-only | any dataset | treated as empty; all rows returned |
| B-012 | page last | page=2, size=20, total=23 | 23-ticket pagination dataset | 3 rows; hasNext = false; totalCount = 23 |
| B-013 | page beyond last | page=99, size=20, total=23 | 23-ticket pagination dataset | empty list; totalCount = 23; HTTP 200 |
| B-014 | size | 0 | any | clamped to min 1 per spec-pack §6.2 |
| B-015 | size | 150 | any | clamped to max 100 per spec-pack §6.2 |

---

## 8. Error Data

| ID | scenario | input | expected |
|---|---|---|---|
| E-001 | Unknown ticket UUID | `ticketId = 00000000-0000-0000-0000-000000000999` | HTTP 404 NOT_FOUND |
| E-002 | Non-PM role | U-OTHER on any PM endpoint | HTTP 403 FORBIDDEN |
| E-003 | No session | U-ANON on any PM endpoint | HTTP 401 UNAUTHORIZED |
| E-004 | Invalid score_band | `scoreBand=INVALID_VALUE` | HTTP 400 VALIDATION_ERROR |
| E-005 | Export without permission | U-PM on `POST /export` | HTTP 403 FORBIDDEN |
| E-006 | Refresh without permission | U-PM on `POST /refresh` | HTTP 403 FORBIDDEN |
| E-007 | Upstream failure during refresh | mock upstream down | HTTP 503 INTERNAL_ERROR; no stack trace in body |

---

## 9. Pagination Dataset

Seed 23 tickets (external keys TST-200 through TST-222) to test BB-048 and BB-049.

| field | value |
|---|---|
| project | EDCAP |
| repository | EDCAP_BE |
| phase | SPEC |
| score_band | WARNING |
| blocked_flag | false |
| missingEvidenceCount | 0 |
| UUID range | `90000000-0000-0000-0000-0000000003xx` (01–23) |

These records do not conflict with the 6 main test tickets in section 3.

---

## 10. Data Setup Procedure

1. Seed reference data: projects (EDCAP, ALPHA), repositories (EDCAP_BE, EDCAP_FE), phases (SPEC, PLAN, REVIEW, TEST, REPORT).
2. Seed required artifact types for PLAN phase — minimum 3 types with required_flag = TRUE.
3. Seed 6 test tickets (section 3).
4. Seed risk records (section 4).
5. Seed missing evidence records (section 5).
6. Seed EQS score records (section 6); set T-BLOCKED total = 68.
7. Seed user personas (U-PM, U-PM-EXP, U-PM-REF, U-OTHER); U-ANON needs no seeding.
8. For pagination tests (BB-048, BB-049): seed 23 additional tickets (section 9).
9. For staleness tests (BB-046): set snapshot updated_at on T-STALE to more than 24 hours before test execution.

---

## 11. Data Cleanup Procedure

1. Remove tickets with UUID prefix `90000000-0000-0000-0000-0000000002xx` and `90000000-0000-0000-0000-0000000003xx`.
2. Remove associated risk records, artifact snapshot records, and EQS score records.
3. Remove test user personas (UUID prefix `90000000-0000-0000-0000-0000000001xx`).
4. Do not remove reference data (projects, repositories, phases) if shared with other test suites.

---

## 12. Sensitive Data Handling

- Do not use real names in ownerDisplay. Role-based pseudonyms only ("Backend Role", "QA Role", etc.).
- Do not use production UUIDs or copy any row from production tables.
- Do not include secrets, credentials, or raw CI logs in any fixture.
- All fixtures are fully synthetic; no personal information is present.

---

## Existing Data Compatibility

- Existing V4 table names are the authoritative source for any integration fixtures.
- Do not assume a snapshot table exists until the read-model strategy implementation is complete (OI-PM-DASHBOARD-9 closed to snapshot approach).
- score_rule_version must be set to "v1" in all fixtures; do not seed multiple version rows unless testing score versioning explicitly.
