# Requirement - Traceability Matching Logic MVP

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Feature name**: Traceability Matching Logic MVP
**Scope note**: This ticket provides Ticket → Artifact → PR → Commit → CI → Test → Report traceability visibility and completeness calculation.

---

## 1. Purpose

This feature helps PM, QA, Developer, Security and Data Ops users answer these questions without manual investigation:

1. Does the ticket contain all required SDD artifacts?
2. Which PR belongs to the ticket?
3. Which commits belong to the ticket?
4. Which CI runs belong to the ticket?
5. Which test evidence belongs to the ticket?
6. Which traceability links are missing?
7. What is the traceability completeness score?

---

## 2. Agreed MVP Direction

### 2.1 Traceability Root

Ticket is the root node.

All traceability relationships are linked through Ticket ID.

### 2.2 Matching Sources

Matching sources:

* Artifact path
* Artifact metadata
* PR title
* Branch name
* Commit message
* CI metadata

### 2.3 Persistence Rule

The implementation may use only existing `tbl_` tables.

Approved table set:

* `tbl_dim_ticket`
* `tbl_fact_artifact_snapshot`
* `tbl_fact_pull_request`
* `tbl_fact_ci_run`
* `tbl_fact_traceability_link`
* `tbl_fact_evidence_event`

### 2.4 Matching Strategy

Priority order:

1. Explicit Ticket ID
2. Artifact metadata
3. PR title
4. Branch name
5. Commit message

---

## 3. Scope

### In Scope

* Traceability matching
* Traceability link persistence
* Traceability completeness
* Broken link detection
* Timeline view
* Read-only UI

### Out of Scope

* Manual link editing
* Auto repair
* AI root cause analysis
* Cross-project dependency graph

---

## 4. Functional Requirements

### FR-1 Artifact Traceability

The system must link:

* spec-pack.md
* impl-plan.md
* review-checklist.md
* self-review.md
* test-plan.md
* test-results.md
* report.md

to a ticket.

### FR-2 PR Traceability

The system must link PRs to tickets.

### FR-3 Commit Traceability

The system must link commits to tickets.

### FR-4 CI Traceability

The system must link CI runs to tickets.

### FR-5 Traceability Completeness

The system must calculate:

```text
Found Links
÷
Expected Links
× 100
```

### FR-6 Broken Link Detection

The system must identify:

* Missing artifact
* Missing PR
* Missing CI
* Missing report

### FR-7 Timeline View

The system must show evidence events chronologically.

### FR-8 Read-only Access

Users can view traceability data.

Manual modification is not allowed.

---

## 5. Acceptance Criteria

* AC-TRACEABILITY-01: User can view linked artifacts for a ticket.
* AC-TRACEABILITY-02: User can view linked PRs.
* AC-TRACEABILITY-03: User can view linked commits.
* AC-TRACEABILITY-04: User can view linked CI runs.
* AC-TRACEABILITY-05: System calculates traceability completeness.
* AC-TRACEABILITY-06: Missing links are highlighted.
* AC-TRACEABILITY-07: User can view timeline events.
* AC-TRACEABILITY-08: Traceability links are persisted using approved `tbl_` tables only.
* AC-TRACEABILITY-09: Non-existing links do not cause UI failures.
* AC-TRACEABILITY-10: Manual modification is not available.
