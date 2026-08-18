# Spec Pack

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Create date**: 2026-06-23
**Author**: OpenAI
**Update date**: 2026-06-23

## 1. Context / Purpose

Provide a Traceability Map that connects Ticket, Artifact, PR, Commit, CI, Test and Report evidence and exposes traceability completeness for users.

## 2. Scope

### 2.1. Within range

* Ticket ↔ Artifact matching
* Ticket ↔ PR matching
* PR ↔ Commit matching
* PR ↔ CI matching
* Traceability completeness calculation
* Broken link detection
* Timeline display
* Read-only traceability view

### 2.2. Out of range

* Manual graph editing
* Auto repair
* AI root cause analysis
* Cross-project dependency graph
* Multi-PR support

## 3. Terminology

| terms             | meaning                                    | notes                         |
| ----------------- | ------------------------------------------ | ----------------------------- |
| Traceability Link | Relationship between evidence entities     | Stored in traceability table  |
| Completeness      | Coverage of required traceability evidence | Percentage                    |
| Confidence        | Matching confidence                        | HIGH / MEDIUM / LOW           |
| Evidence Event    | Timeline event                             | Existing evidence event model |

## 4. As-Is

* Artifact snapshots exist.
* PR ingestion exists.
* CI ingestion exists.
* No unified traceability visibility exists.

## 5. To-Be

Users can view complete traceability information and identify missing evidence through one screen.

## 6. Detailed specification

### 6.1. Business Rules

* One Ticket maps to one PR.
* Ticket is the traceability root.
* Commits are displayed but not counted in completeness.
* Traceability links are read-only.
* Missing links remain visible.

### 6.2. Input

| item              | type            | required | validation        | notes            |
| ----------------- | --------------- | -------- | ----------------- | ---------------- |
| Ticket ID         | String          | Yes      | Existing ticket   | Root entity      |
| Artifact Snapshot | Existing entity | Yes      | Existing snapshot | Evidence source  |
| Pull Request      | Existing entity | No       | Existing PR       | Linked by ticket |
| CI Run            | Existing entity | No       | Existing CI       | Linked by PR     |

### 6.3. Output

| item               | type       | format | notes         |
| ------------------ | ---------- | ------ | ------------- |
| Traceability Links | Collection | JSON   | Read-only     |
| Completeness Score | Percentage | 0-100  | Derived       |
| Broken Links       | Collection | JSON   | ERROR/WARNING |
| Timeline Events    | Collection | JSON   | Chronological |

### 6.4. Error / Exception

| case                      | expected behavior | message/code                  | notes   |
| ------------------------- | ----------------- | ----------------------------- | ------- |
| Missing Artifact          | Warning/Error     | TRACEABILITY_MISSING_ARTIFACT | Visible |
| Missing PR                | Error             | TRACEABILITY_MISSING_PR       | Visible |
| Missing CI                | Error             | TRACEABILITY_MISSING_CI       | Visible |
| Missing Report            | Error             | TRACEABILITY_MISSING_REPORT   | Visible |
| Missing Optional Evidence | Warning           | TRACEABILITY_WARNING          | Visible |

### 6.5. Boundary Value

| item           | min | max | special cases             | expected      |
| -------------- | --- | --- | ------------------------- | ------------- |
| PR Count       | 0   | 1   | Missing PR                | Error         |
| CI Count       | 0   | N   | No CI                     | Error         |
| Artifact Count | 0   | N   | Missing required artifact | Warning/Error |

### 6.6. Non-functional

| item                       | requirement                   | target / threshold       | verification        | notes |
| -------------------------- | ----------------------------- | ------------------------ | ------------------- | ----- |
| Performance                | Ticket traceability retrieval | < 2 sec                  | API test            |       |
| Security                   | Read-only access              | No modification          | Security review     |       |
| Availability / Reliability | Stable retrieval              | Existing DB availability | Integration test    |       |
| Maintainability            | Reuse existing schema         | No new tables            | Architecture review |       |
| Observability / Logging    | Traceability events visible   | Existing evidence events | Log verification    |       |
| Compatibility              | Existing ingestion compatible | No ingestion rewrite     | Integration test    |       |

## 7. Acceptance Criteria

| ACID                              | description                                              | testable? | notes |
| --------------------------------- | -------------------------------------------------------- | --------- | ----- |
| AC-TRACEABILITY-MATCHING-LOGIC-1  | System links ticket to artifacts                         | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-2  | System links ticket to PR                                | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-3  | System links PR to commit                                | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-4  | System links PR to CI                                    | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-5  | System calculates completeness                           | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-6  | System highlights missing links                          | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-7  | System provides timeline view                            | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-8  | System persists traceability links using approved tables | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-9  | System stores confidence level                           | Yes       |       |
| AC-TRACEABILITY-MATCHING-LOGIC-10 | Traceability view is read-only                           | Yes       |       |

## 8. Examples

### 8.1. Normal Case

```text
Ticket
 ↓
Spec Pack
 ↓
PR
 ↓
CI
 ↓
Report
```

### 8.2. Error Case

```text
Ticket
 ↓
Spec Pack
 ↓
PR
 ↓
Missing Report
```

Result:

```text
ERROR
Traceability Completeness reduced
```

### 8.3. Boundary Case

```text
Ticket
 ↓
PR
 ↓
No CI
```

Result:

```text
ERROR
Completeness reduced
```

## 9. Source Availability Summary

* Requirement: Available
* DB Design: Available
* Wireframe: Available
* Existing Schema: Available
* Existing Traceability Service: Not Found

## 10. Complexity Classification

```text
- Complexity: Standard
- System shape: FE+BE
- Primary risk: Contract / Operation
- Review mode: Standard
- Required options: Source Analysis, FE-BE Contract
```

## 11. FE/BE Contract Impact

New traceability retrieval API required.

## 12. DB/Migration Impact

Reuse:

* tbl_fact_traceability_link
* tbl_fact_artifact_snapshot
* tbl_fact_pull_request
* tbl_fact_ci_run

No new table.

## 13. Security/Privacy Impact

* Metadata only.
* No source code persistence.
* No secret persistence.

## 14. Operation/Maintenance Impact

* Requires matching rerun capability.
* Requires visibility of broken links.

## 15. Test Strategy Summary

* Unit tests
* Integration tests
* Completeness calculation tests
* Broken-link tests
* Timeline tests

## 16. Human Decision Required

| ID                              | decision item                           | reasons            | owner | status   |
| ------------------------------- | --------------------------------------- | ------------------ | ----- | -------- |
| H-TRACEABILITY-MATCHING-LOGIC-1 | One Ticket = One PR                     | MVP simplification | User  | Approved |
| H-TRACEABILITY-MATCHING-LOGIC-2 | Commit excluded from completeness       | Business decision  | User  | Approved |
| H-TRACEABILITY-MATCHING-LOGIC-3 | Broken link severity uses ERROR/WARNING | Business decision  | User  | Approved |

## 17. Assumptions and Inference Log

| ID                              | assumption                              | basis                             | risk | need confirmation? |
| ------------------------------- | --------------------------------------- | --------------------------------- | ---- | ------------------ |
| A-TRACEABILITY-MATCHING-LOGIC-1 | Existing ingestion data is sufficient   | Existing parsers and CI ingestion | Low  | No                 |
| A-TRACEABILITY-MATCHING-LOGIC-2 | Existing traceability table is reusable | Existing schema                   | Low  | No                 |

## 18. Open Issues

| ID                               | issue                                  | impact | owner        | status |
| -------------------------------- | -------------------------------------- | ------ | ------------ | ------ |
| OI-TRACEABILITY-MATCHING-LOGIC-1 | Future support for multiple PRs        | Medium | Architecture | Open   |
| OI-TRACEABILITY-MATCHING-LOGIC-2 | Future configurable completeness rules | Low    | Product      | Open   |
