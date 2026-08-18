# Test Data

**Ticket ID**: DEVELOPER-DASHBOARD
**Create date**: 2026-07-01
**Author**: OpenAI
**Update date**: 2026-07-01

## Data Policy

* Use test data only.
* Do not use production repositories.
* Existing V4 tables are reused.
* Dashboard is read-only.
* No sensitive information shall be stored.

---

## Master Data

| name          | value    | purpose            |
| ------------- | -------- | ------------------ |
| CI Status     | PASS     | Successful CI      |
| CI Status     | FAIL     | Failed CI          |
| Review Status | OPEN     | Review pending     |
| Review Status | RESOLVED | Review completed   |
| Parser Status | SUCCESS  | Successful parsing |
| Parser Status | WARNING  | Parser warning     |
| Parser Status | ERROR    | Parser failure     |

---

## User / Permission Data

| user      | role               | permission     | purpose         |
| --------- | ------------------ | -------------- | --------------- |
| Developer | Authenticated User | Read Dashboard | Normal case     |
| Admin     | Administrator      | Read Dashboard | Compatibility   |
| Anonymous | None               | No Access      | Permission test |

---

## Normal Data

| ID     | data                        | purpose               |
| ------ | --------------------------- | --------------------- |
| ND-001 | Ticket with CI FAIL         | Verify CI KPI         |
| ND-002 | Ticket with Review Findings | Verify Review KPI     |
| ND-003 | Ticket with Parser Errors   | Verify Parser KPI     |
| ND-004 | Ticket with all information | Dashboard integration |
| ND-005 | Multiple repositories       | Filter verification   |

---

## Error Data

| ID     | data                 | expected error               |
| ------ | -------------------- | ---------------------------- |
| ED-001 | Unknown Ticket       | Empty dashboard              |
| ED-002 | Invalid Project      | No matching records          |
| ED-003 | Invalid Repository   | No matching records          |
| ED-004 | Invalid Filter       | Validation or ignored filter |
| ED-005 | Database unavailable | Existing error handler       |

---

## Boundary Data

| ID     | item            | value         | expected              |
| ------ | --------------- | ------------- | --------------------- |
| BD-001 | CI Failures     | 0             | KPI displays 0        |
| BD-002 | Review Findings | 0             | KPI displays 0        |
| BD-003 | Parser Errors   | 0             | KPI displays 0        |
| BD-004 | Ticket Count    | 0             | Empty state           |
| BD-005 | Ticket Count    | Large dataset | Dashboard still loads |

---

## Existing Data Compatibility

* Existing CI data reused.
* Existing Review data reused.
* Existing Parser data reused.
* Existing V4 tables reused.
* No duplicated persistence.

---

## Data Setup Procedure

1. Prepare test repositories.
2. Prepare CI execution data.
3. Prepare Review findings.
4. Prepare Parser results.
5. Verify dashboard data.
6. Execute black-box scenarios.

---

## Data Cleanup Procedure

1. Remove temporary dashboard test data.
2. Restore original test environment.
3. Verify no temporary records remain.

---

## Sensitive Data Handling

* Do not use original production data.
* Do not save PII/secrets to artifacts.
* Do not include real repository credentials.
* Do not include real CI tokens.
* Do not expose security-sensitive review comments.
