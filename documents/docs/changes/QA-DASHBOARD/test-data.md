# Test Data

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-29

---

## Data Policy

* Use synthetic data only.
* Do not use production database records.
* Do not store PII, credentials or secrets.
* Test data must produce deterministic KPI values.
* Every KPI must be reproducible.

---

## Master Data

| Name                 | Value                                                                                  | Purpose            |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Project A            | QA Project A                                                                           | Project filter     |
| Project B            | QA Project B                                                                           | Project filter     |
| Repository A         | repo-a                                                                                 | Repository filter  |
| Repository B         | repo-b                                                                                 | Repository filter  |
| Period               | 2026-W23                                                                               | Period filter      |
| Coverage Status      | COVERED / NOT_TESTED                                                                   | AC Coverage        |
| Release Status       | READY / PARTIAL / NOT_READY                                                            | Release Readiness  |
| Finding Status       | OPEN / RESOLVED                                                                        | Defect Leakage     |
| Test Status          | PASS / FAIL / NOT_RUN                                                                  | Test Results       |
| Black-box Viewpoints | Normal, Error, Boundary, Permission, State Transition, Operation, Audit, Compatibility | Black-box Coverage |

---

## User / Permission Data

| User      | Role   | Permission            | Purpose               |
| --------- | ------ | --------------------- | --------------------- |
| qa-admin  | ADMIN  | Full dashboard access | Normal scenario       |
| qa-editor | EDITOR | Read dashboard        | Permission test       |
| qa-viewer | VIEWER | Read dashboard        | Permission test       |
| anonymous | None   | No access             | HTTP 401 verification |

---

## Normal Data

| ID    | Data                                              | Purpose                  |
| ----- | ------------------------------------------------- | ------------------------ |
| N-001 | 5 AC (3 Covered / 2 Not Tested)                   | AC Coverage = 60%        |
| N-002 | 8 viewpoints (6 covered)                          | Black-box Coverage = 75% |
| N-003 | PASS=18 FAIL=2 NOT_RUN=0                          | Test Result KPI          |
| N-004 | Findings: 2 OPEN / 1 RESOLVED                     | Defect Leakage           |
| N-005 | Ticket satisfies all Release Readiness conditions | READY verification       |
| N-006 | Project A contains 5 tickets                      | Project filter           |
| N-007 | Repository A contains 3 tickets                   | Repository filter        |
| N-008 | Period 2026-W23 contains 4 tickets                | Period filter            |

---

## Error Data

| ID    | Data                      | Expected Error   |
| ----- | ------------------------- | ---------------- |
| E-001 | Invalid projectId UUID    | HTTP 400         |
| E-002 | Invalid repositoryId UUID | HTTP 400         |
| E-003 | Search >200 characters    | Validation error |
| E-004 | Invalid periodKey         | Validation error |
| E-005 | No authentication         | HTTP 401         |

---

## Boundary Data

| ID    | Item               | Value | Expected           |
| ----- | ------------------ | ----- | ------------------ |
| B-001 | Total AC           | 0     | Coverage = 0%      |
| B-002 | Covered AC         | 0     | Not Tested = 0     |
| B-003 | Covered Viewpoints | 0/8   | Coverage = 0%      |
| B-004 | Covered Viewpoints | 8/8   | Coverage = 100%    |
| B-005 | PASS Count         | 0     | KPI = 0            |
| B-006 | FAIL Count         | 0     | KPI = 0            |
| B-007 | Findings           | 0     | Leakage = 0        |
| B-008 | Search Length      | 0     | Return all tickets |
| B-009 | Search Length      | 200   | Accepted           |
| B-010 | Release Conditions | 7/7   | READY              |
| B-011 | Release Conditions | 6/7   | PARTIAL            |
| B-012 | Release Conditions | 0/7   | NOT_READY          |

---

## Existing Data Compatibility

* Existing dashboard data must remain unchanged.
* Existing parser results must remain unchanged.
* Existing PM Dashboard data must not be affected.
* Existing V4 tables are reused without modification.

---

## Data Setup Procedure

1. Create Project A and Project B.
2. Create Repository A and Repository B.
3. Create QA tickets.
4. Import parsed Spec Pack.
5. Import parsed Test Plan.
6. Import parsed Test Results.
7. Import parsed Black-box Test Cases.
8. Insert Finding data.
9. Verify dashboard aggregation.

---

## Data Cleanup Procedure

1. Remove synthetic tickets.
2. Remove synthetic findings.
3. Remove synthetic parser data.
4. Verify production data remains unchanged.

---

## Sensitive Data Handling

* Never use production tickets.
* Never use real user accounts.
* Never store credentials.
* Never store secrets.
* Never commit sensitive data into repository.
