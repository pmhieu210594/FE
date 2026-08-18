# Review Checklist - TRACEABILITY-MATCHING-LOGIC

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## 1. Specification / AC Matching

| AC ID                             | Review Point                                              | Severity | Result |
| --------------------------------- | --------------------------------------------------------- | -------- | ------ |
| AC-TRACEABILITY-MATCHING-LOGIC-1  | Ticket is correctly linked to artifacts                   | Blocker  | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-2  | Ticket is correctly linked to PR                          | Blocker  | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-3  | Commit links are displayed but excluded from completeness | Major    | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-4  | PR is correctly linked to CI runs                         | Blocker  | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-5  | Completeness calculation follows approved formula         | Blocker  | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-6  | Missing links remain visible                              | Major    | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-7  | Timeline ordering is deterministic                        | Major    | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-8  | Existing tbl_ tables are reused only                      | Blocker  | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-9  | Confidence level mapping is correct                       | Major    | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-10 | View remains read-only                                    | Blocker  | [X]     |

### 1.1 AC Traceability Table

| AC ID                             | Specification Summary | Implementation Area     | Required Evidence | Status |
| --------------------------------- | --------------------- | ----------------------- | ----------------- | ------ |
| AC-TRACEABILITY-MATCHING-LOGIC-1  | Ticket ↔ Artifact     | Query Adapter           | API + DB Test     | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-2  | Ticket ↔ PR           | Query Adapter           | API + DB Test     | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-3  | Commit exclusion rule | Completeness Calculator | Unit Test         | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-4  | PR ↔ CI               | Query Adapter           | API + DB Test     | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-5  | Completeness          | Service Layer           | Unit Test         | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-6  | Broken Links          | Service Layer           | Black-box Test    | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-7  | Timeline              | Service Layer           | Unit/API Test     | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-8  | Reuse Existing Tables | Persistence Review      | Source Review     | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-9  | Confidence            | Service Layer           | Unit Test         | [X]     |
| AC-TRACEABILITY-MATCHING-LOGIC-10 | Read-only             | FE/BE Review            | Black-box Test    | [X]     |

---

## 2. General System Review

### 2.1 Number / Input Check

* [X]  Completeness percentage calculation is correct
* [X]  Null ticketId handling exists
* [X]  Empty ticketId handling exists
* [X]  Invalid UUID handling exists
* [X]  Percentage rounding rule is explicit

### 2.2 Character Type / Encoding / Locale

* [X]  UTF-8 preserved
* [X]  Ticket IDs are not translated
* [X]  Commit hashes remain unchanged
* [X]  Branch names remain unchanged
* [X]  No mojibake

### 2.3 Literal / Magic Number

* [X]  Completeness denominator is not hardcoded without explanation
* [X]  Confidence values use approved constants
* [X]  Severity values use approved constants

### 2.4 Operation / Maintainability

* [X]  traceId logged
* [X]  Missing evidence visible
* [X]  Read model isolated from write model
* [X]  No duplicated matching logic

---

## 3. FE Review

| item                      | result | note |
| ------------------------- | ------ | ---- |
| Traceability page renders | [X]     |      |
| Timeline renders          | [X]     |      |
| Broken links visible      | [X]     |      |
| Completeness visible      | [X]     |      |
| Read-only UI enforced     | [X]     |      |
| No edit button            | [X]     |      |
| No repair button          | [X]     |      |

---

## 4. BE/API Review

| item                            | result | note |
| ------------------------------- | ------ | ---- |
| No invented methods used        | [X]     |      |
| No invented APIs used           | [X]     |      |
| Existing persistence reused     | [X]     |      |
| Completeness calculator correct | [X]     |      |
| Broken-link classifier correct  | [X]     |      |
| Timeline ordering deterministic | [X]     |      |

---

## 5. DB / Migration Review

| item                             | result | note |
| -------------------------------- | ------ | ---- |
| Reuse tbl_fact_traceability_link | [X]     |      |
| Reuse tbl_fact_artifact_snapshot | [X]     |      |
| Reuse tbl_fact_pull_request      | [X]     |      |
| Reuse tbl_fact_ci_run            | [X]     |      |
| No new table introduced          | [X]     |      |
| No destructive migration         | [X]     |      |

---

## 6. Security / Privacy Review

| item                         | result | note |
| ---------------------------- | ------ | ---- |
| No raw markdown persisted    | [X]     |      |
| No raw source code persisted | [X]     |      |
| No secret stored             | [X]     |      |
| No token stored              | [X]     |      |
| Read-only endpoint           | [X]     |      |
| Access control enforced      | [X]     |      |

---

## 7. Operation / Maintenance Review

| item                             | result | note |
| -------------------------------- | ------ | ---- |
| traceId available                | [X]     |      |
| Broken-link visibility preserved | [X]     |      |
| Timeline observable              | [X]     |      |
| Logging sufficient               | [X]     |      |
| Future rule changes isolated     | [X]     |      |

---

## 8. Test Review

| item                    | result | note |
| ----------------------- | ------ | ---- |
| Unit tests exist        | [X]     |      |
| Integration tests exist | [X]     |      |
| Black-box tests exist   | [X]     |      |
| Completeness tested     | [X]     |      |
| Broken links tested     | [X]     |      |
| Permission tested       | [X]     |      |
| Timeline tested         | [X]     |      |

---

## 9. Documentation / Traceability Review

| item                       | result | note |
| -------------------------- | ------ | ---- |
| Spec aligned               | [X]     |      |
| Context aligned            | [X]     |      |
| Impact analysis aligned    | [X]     |      |
| Open Issues documented     | [X]     |      |
| Human decisions documented | [X]     |      |

---

## 10. Release / Rollback Review

| item                           | result | note |
| ------------------------------ | ------ | ---- |
| Rollback is code-only          | [X]     |      |
| No DB rollback required        | [X]     |      |
| Existing collectors unaffected | [X]     |      |
| Existing ingestion unaffected  | [X]     |      |

---

## Severity Definition

| severity       | meaning                 | required action         |
| -------------- | ----------------------- | ----------------------- |
| Blocker        | Cannot be released      | Must fix                |
| Major          | High probability bug    | Fix or accepted risk    |
| Minor          | Improvement             | Optional                |
| Question       | Human decision required | Open Issue              |
| False Positive | Invalid finding         | Record rejection reason |
| Accepted Risk  | Accepted risk           | Record owner and impact |
