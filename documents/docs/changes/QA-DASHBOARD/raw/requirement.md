# Requirement Document - QA Dashboard

**Ticket ID**: QA-DASHBOARD
**Create date**: 2026-06-26
**Author**: OpenAI
**Update date**: 2026-06-26

---

## 1. Screen Overview

* **Screen name:** QA Dashboard
* **Business purpose:** Allows QA members to monitor Acceptance Criteria coverage, test execution status, black-box coverage, release readiness, and defect leakage from a single dashboard.
* **Reason for creating the screen:** The SDD Evidence Platform requirement defines a dedicated QA Dashboard so QA engineers can quickly identify testing gaps, acceptance coverage, and release readiness without manually reviewing every ticket artifact.
* **Goal of this version:** Provide a QA operational dashboard focused on test readiness and acceptance quality for the PoC.

---

## 2. Scope

### 2.1 In Scope

* Display QA Dashboard.
* Display AC-Test Coverage.
* Display Acceptance Criteria not yet covered by tests.
* Display Black-box Coverage.
* Display Test Results summary.
* Display Defect Leakage summary.
* Display Release Readiness.
* Search tickets.
* Filter by:

  * Project
  * Repository
  * Sprint / Period
  * Ticket
  * Test Status
  * Coverage Status
* Drill down into ticket evidence.
* Read-only dashboard.

### 2.2 Out of Scope

* Editing Test Cases.
* Editing Test Results.
* Creating Acceptance Criteria.
* Managing CI configuration.
* Managing Pull Requests.
* Security Dashboard.
* PM Dashboard.
* Executive Dashboard.
* Personal performance ranking.
* AI analytics.

> **Note:** This feature is an operational dashboard for QA activities only. It does not replace external Test Management tools.

---

## 3. Current State Summary

Current situation:

* QA engineers manually inspect:

  * `spec-pack.md`
  * `test-plan.md`
  * `test-results.md`
  * `blackbox-testcases.md`
  * `report.md`
* Acceptance Criteria coverage is checked manually.
* Missing test evidence is difficult to discover.
* Black-box coverage cannot be summarized automatically.
* Release readiness depends on manual inspection.
* There is currently no unified QA Dashboard.

---

## 4. Target State Summary

Target state:

* QA Dashboard is available.
* QA members can immediately see:

  * AC-Test Coverage
  * Acceptance Criteria not yet tested
  * Black-box Coverage
  * Test execution status
  * Defect Leakage
  * Release Readiness
* Ticket drill-down is supported.
* Manual document inspection is significantly reduced.
* Dashboard remains read-only.

---

## 5. Change Requirements

| Section             | Current State                | Target State      | Requirement                     | Keep / Change / New | Notes                                  |
| ------------------- | ---------------------------- | ----------------- | ------------------------------- | ------------------- | -------------------------------------- |
| QA Overview         | Not available                | QA Dashboard      | Dashboard for QA activities     | New                 | Operational dashboard                  |
| AC-Test Coverage    | Manual verification          | Dashboard card    | Display coverage summary        | New                 | Based on parsed AC and test mapping    |
| Acceptance Criteria | Manual comparison            | Ticket list       | Display uncovered AC            | New                 | QA follow-up list                      |
| Black-box Coverage  | Manual review                | Dashboard summary | Display testing viewpoints      | New                 | Normal / Error / Boundary / Permission |
| Test Results        | Distributed across artifacts | Unified summary   | PASS / FAIL / NOT_RUN           | New                 | CI-linked if available                 |
| Defect Leakage      | Manual collection            | Dashboard summary | Display QA / Production leakage | New                 | Ticket-based                           |
| Release Readiness   | Manual judgement             | Readiness panel   | Show release preparation status | New                 | Based on required evidence             |

---

## 6. Functional Requirements

### 6.1 QA Dashboard Overview

The system shall:

* Display a QA Dashboard landing page.
* Display dashboard refresh timestamp.
* Display current filter conditions.
* Display summary KPI cards.

### 6.2 AC-Test Coverage

The system shall:

* Display total Acceptance Criteria.
* Display covered Acceptance Criteria.
* Display uncovered Acceptance Criteria.
* Display AC coverage percentage.
* Allow QA users to drill down into uncovered Acceptance Criteria.

### 6.3 Acceptance Criteria Not Yet Tested

The system shall display:

* Ticket ID.
* AC ID.
* AC Description.
* Missing Test Type.
* Priority.
* Current Status.

QA users shall be able to identify Acceptance Criteria that still require testing.
### 6.4 Black-box Coverage

The system shall:

* Display Black-box Coverage percentage.
* Display coverage by test viewpoint.
* Display uncovered viewpoints.
* Display related ticket and artifact.

Supported viewpoints:

* Normal Case
* Error Case
* Boundary Value
* Permission
* State Transition
* Operation
* Audit
* Compatibility

The dashboard shall allow QA users to identify missing testing viewpoints before release.

---

### 6.5 Test Results

The system shall display:

* Total executed test cases.
* PASS count.
* FAIL count.
* NOT_RUN count.
* Latest execution time.
* Latest CI run.

The dashboard shall allow QA users to drill down into failed tests.

---

### 6.6 Defect Leakage

The system shall display:

* Total production defects.
* Total QA defects.
* Defect leakage trend.
* Root phase.

Each defect shall reference:

* Ticket
* Severity
* Status
* Root Cause Phase

---

### 6.7 Release Readiness

The system shall determine whether a ticket is ready for acceptance.

Release readiness shall consider:

* Required evidence exists.
* AC coverage completed.
* Black-box coverage completed.
* Test Results available.
* Report exists.
* Open Issues resolved.
* High Risk accepted or resolved.

Release status shall be one of:

* READY
* PARTIAL
* NOT_READY

---

### 6.8 Dashboard Filters

The system shall support filtering by:

* Project
* Repository
* Sprint / Period
* Ticket
* Test Status
* Release Status
* Coverage Status
* Risk Status

---

### 6.9 Search

The dashboard shall support searching by:

* Ticket ID
* Ticket Title
* Repository
* Acceptance Criteria
* Test Case

---

### 6.10 Drill-down

The dashboard shall allow users to open Ticket Detail.

Ticket Detail shall display:

* Acceptance Criteria
* Test Plan
* Test Results
* Black-box Test Cases
* Report
* Related CI Run

The detail screen shall be read-only.

---

## 7. Data Items

| Field              | Meaning                           | Notes       |
| ------------------ | --------------------------------- | ----------- |
| Ticket ID          | Ticket identifier                 | Primary key |
| Project            | Project                           | Filter      |
| Repository         | Repository                        | Filter      |
| Sprint             | Sprint / Period                   | Filter      |
| Phase              | Current SDD Phase                 | Display     |
| AC Count           | Total Acceptance Criteria         | Summary     |
| Covered AC         | Acceptance Criteria with tests    | Summary     |
| Uncovered AC       | Acceptance Criteria without tests | Summary     |
| AC Coverage        | Coverage percentage               | KPI         |
| Black-box Coverage | Test viewpoint coverage           | KPI         |
| PASS Count         | Executed PASS tests               | KPI         |
| FAIL Count         | Executed FAIL tests               | KPI         |
| NOT_RUN Count      | Planned but not executed tests    | KPI         |
| Defect Leakage     | QA / Production defects           | KPI         |
| Release Readiness  | READY / PARTIAL / NOT_READY       | Summary     |
| CI Run             | Latest linked CI execution        | Optional    |
| Updated Date       | Last dashboard refresh            | Display     |
## 8. Acceptance Criteria

* **AC-QA-1:** QA users can access the QA Dashboard.
* **AC-QA-2:** The dashboard displays AC-Test Coverage by ticket.
* **AC-QA-3:** The dashboard displays Acceptance Criteria that are not yet covered by tests.
* **AC-QA-4:** The dashboard displays Black-box Coverage by ticket.
* **AC-QA-5:** The dashboard displays Test Results summary including PASS / FAIL / NOT_RUN.
* **AC-QA-6:** The dashboard displays Defect Leakage summary.
* **AC-QA-7:** The dashboard displays Release Readiness for every ticket.
* **AC-QA-8:** Users can filter the dashboard by Project, Repository, Sprint, Ticket, Test Status, Release Status and Coverage Status.
* **AC-QA-9:** Users can drill down from dashboard items to Ticket Detail.
* **AC-QA-10:** The dashboard is read-only.
* **AC-QA-11:** Dashboard data is generated from existing evidence and existing database tables.
* **AC-QA-12:** The dashboard does not require manual data entry.

---

## 9. Open Points for Spec Pack

The following points are intentionally left for the Spec Pack phase.

* Exact Release Readiness calculation rule.
* AC-Test Coverage calculation formula.
* Black-box Coverage calculation formula.
* Defect Leakage calculation rule.
* Definition of "Not Tested".
* Definition of "Ready for Acceptance".
* Drill-down permission matrix.
* Refresh interval.
* Export policy.
* Dashboard caching strategy.

---

## 10. Business Rules

### 10.1 AC Coverage Rules

Coverage is calculated only from:

* Parsed Acceptance Criteria
* Parsed Test Plan
* Parsed Test Results

Acceptance Criteria without linked tests are considered **Not Covered**.

---

### 10.2 Black-box Coverage Rules

Supported viewpoints include:

* Normal
* Error
* Boundary
* Permission
* State Transition
* Operation
* Audit
* Compatibility

Missing viewpoints are highlighted.

---

### 10.3 Release Readiness Rules

A ticket is considered **READY** only when:

* Required artifacts exist.
* Acceptance Criteria are covered.
* Test Results exist.
* No blocking Open Issues remain.
* No unresolved High Risk remains.
* Required Report exists.

Otherwise:

* PARTIAL
* NOT_READY

---

### 10.4 Dashboard Rules

The dashboard is operational.

It must not:

* modify ticket data.
* modify test data.
* modify reports.
* execute tests.

The dashboard only visualizes existing evidence.

---

## 11. Non-functional Notes

* Dashboard is read-only.
* Dashboard should load within the platform response target.
* Existing parser outputs are reused.
* Existing database tables are reused.
* Dashboard should not duplicate business data.

---

## 12. Related Features

The QA Dashboard consumes data from:

* Artifact Inventory
* Markdown Parser
* Traceability Map
* AC-Test Coverage
* CI Analysis
* Report Parser
* Review Checklist Parser
* Test Plan Parser
* Test Results Parser

The dashboard itself does not become the system of record for any evidence.

---

## 13. Future Enhancements

The following are outside the current PoC but may be considered later:

* Historical trend analysis.
* Cross-project QA comparison.
* Test automation maturity.
* Flaky test detection.
* Test execution timeline.
* Release prediction.
* AI-assisted QA recommendations.
* Customer quality reports.
