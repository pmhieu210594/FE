# Database Design - Traceability Matching Logic MVP

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Scope**: Traceability matching, traceability persistence, completeness calculation.
**Out of scope**: Manual graph editing.

---

## 1. Overview

This ticket may use only existing `tbl_` tables.

Approved table set:

```text
tbl_dim_ticket
tbl_fact_artifact_snapshot
tbl_fact_pull_request
tbl_fact_ci_run
tbl_fact_traceability_link
tbl_fact_evidence_event
```

No new table is required.

---

## 2. Main Persistence Areas

| Table                      | Purpose                           |
| -------------------------- | --------------------------------- |
| tbl_fact_traceability_link | Stores traceability relationships |
| tbl_fact_artifact_snapshot | Artifact source                   |
| tbl_fact_pull_request      | PR source                         |
| tbl_fact_ci_run            | CI source                         |
| tbl_fact_evidence_event    | Timeline source                   |
| tbl_dim_ticket             | Traceability root                 |

---

## 3. Traceability Link Data

Representative fields:

* ticket_id
* source_type
* source_id
* target_type
* target_id
* confidence
* confidence_level
* rule_name
* evidence
* created_at

---

## 4. Supported Link Types

| Source Type  | Target Type  |
| ------------ | ------------ |
| TICKET       | ARTIFACT     |
| TICKET       | PULL_REQUEST |
| PULL_REQUEST | COMMIT       |
| PULL_REQUEST | CI_RUN       |
| TICKET       | TEST_RESULT  |
| TICKET       | REPORT       |

---

## 5. Completeness Calculation

Expected evidence:

* Spec Pack
* Impl Plan
* Review Checklist
* Self Review
* Test Plan
* Test Results
* Report
* PR
* CI

Completeness:

```text
Found
÷
Expected
× 100
```

---

## 6. Key Rules

* Ticket is the root node.
* Existing traceability table must be reused.
* Existing artifact snapshots must be reused.
* Missing links remain visible.
* No graph-specific table may be introduced.
