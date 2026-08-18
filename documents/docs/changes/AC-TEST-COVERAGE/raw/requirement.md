# Requirement: AC-Test Coverage Logic

**Purpose of the document**: Define the business and functional requirements for the AC-Test Coverage module in the MVP of the SDD evidence data collection and analysis platform.

**Scope**: MVP, 1 project, 1-2 repositories, data collected from `docs/changes/<TICKET>/` and metadata from Git/PR/CI.

**Priority**: Must

---

## 1. Objective

The AC-Test Coverage logic module must enable the system to identify, track, and display the level of coverage between **Acceptance Criteria (AC)** and **test evidence** for the same ticket.

The purpose of this feature is to answer the following questions:

- How many ACs does this ticket have?
- Has each AC been tested or not?
- Which ACs have tests, but the tests failed?
- Which ACs do not have clear test evidence yet?
- What is the overall AC-Test Coverage percentage for the ticket?

---

## 2. Business Definitions

### 2.1 AC
AC is the list of acceptance criteria extracted from `spec-pack.md` or an equivalent specification file for the ticket. In the MVP, ACs should be clearly numbered in the form `AC-<TICKET>-1`, `AC-<TICKET>-2`, `AC-<TICKET>-3`, ...

### 2.2 Test evidence
Test evidence is information proving that testing has been performed, including one or more of the following sources:

- `test-plan.md`
- `test-results.md`
- CI summary / test metadata from CI if it can be linked to the ticket

### 2.3 Coverage
AC-Test Coverage is the ratio of ACs that have at least one valid test evidence item to the total number of ACs in the ticket.

---

## 3. MVP Scope

In the MVP, this module must be able to perform the following tasks:

1. Extract the AC list from `spec-pack.md`.
2. Extract test information from `test-plan.md`, `test-results.md`, and CI summary if available.
3. Link tests to ACs using explicit references or controlled inference.
4. Detect ACs that do not have test evidence.
5. Detect ACs that have test evidence but the result is failed.
6. Display coverage by ticket and make it usable for the QA Dashboard.

---

## 4. Out of Scope for the MVP

The following items are not required in the MVP:

- Automatically understanding overly ambiguous natural-language ACs.
- Automatically generating test cases from ACs.
- Automatically classifying the severity of test failures by business domain.
- Advanced cross-project or cross-sprint coverage comparison.
- AI-based analysis of test coverage reviews.

---

## 5. Input Data Sources

### 5.1 Required

- `docs/changes/<TICKET>/spec-pack.md`
- `docs/changes/<TICKET>/test-plan.md`
- `docs/changes/<TICKET>/test-results.md`
- CI summary or CI test metadata if the pipeline / collector provides it

### 5.2 Optional

- CI test artifacts or CI summary if they can be mapped to the ticket

---

## 6. AC Extraction Rules

1. ACs must be detected as a numbered list or an equivalent structure.
2. If the spec-pack does not number ACs, the system must record this as a data quality risk.
3. Each AC must have a stable identifier within the scope of the ticket.
4. If there are multiple possible interpretations, prioritize the markdown structure over free-form inference.

---

## 7. Rules for Linking ACs to Tests

The system may link ACs to tests in the following priority order:

1. Direct reference in the test case or test result.
2. Indirect reference through the test case name, scenario, notes, or CI summary containing the AC ID.
3. Reference via manual mapping or controlled metadata.
4. If there is not enough strong evidence, the AC must be marked as `UNTESTED`.

---

## 8. Status of Each AC

Each AC in the ticket must be assigned one of the following statuses:

| Status | Meaning |
|---|---|
| `PASSED` | Valid test evidence exists and the test passed |
| `FAILED` | Test evidence exists, but the test failed |
| `UNTESTED` | No matching test evidence has been found |
| `UNKNOWN` | There are linking signals, but they are not strong enough |

---

## 9. Required Output

### 9.1 Output by AC

Each AC must display at minimum:

- AC ID
- AC content
- Status
- Related test evidence
- Link source
- Notes if missing or ambiguous

### 9.2 Ticket-level summary output

- Total AC count
- Number of PASSED ACs
- Number of FAILED ACs
- Number of UNTESTED ACs
- AC-Test Coverage percentage
- List of untested ACs
- List of failed ACs

### 9.3 Dashboard output

- Ticket ID
- Repository / Project
- Coverage percentage
- Coverage band or warning
- Last updated timestamp

---

## 10. Coverage Calculation Formula

### 10.1 Basic formula

```text
AC-Test Coverage = (Number of ACs with valid test evidence / Total number of ACs) * 100
```

### 10.2 Calculation rules

- An AC is counted as covered only if it has at least one valid test evidence item.
- If an AC has multiple test evidence items, only one valid item is needed for it to count as covered.
- An AC with a test that failed still counts toward coverage in terms of linkage, but its status must be `FAILED`.
- If the test status is unclear, the AC must be marked `UNKNOWN` and must not be counted as passed.

---

## 11. Data Quality Requirements

1. The parser must record an error when it cannot read a file.
2. The parser must record an error when the file is empty or contains only a template.
3. The parser must record when ACs are not numbered.
4. The system must store the reason for parse failures for Data Ops.
5. Missing data must never be silently ignored.

---

## 12. UI Requirements

The ticket detail screen must display an AC-Test Coverage table with at least the following columns:

- AC ID
- AC text
- Status
- Linked tests
- Test result
- Notes

The QA Dashboard must include at least the following information blocks:

- Which tickets have not met the expected coverage
- Which ACs have not been tested
- Which ACs have failed
- Coverage rate by ticket / sprint / project

---

## 13. Related Non-functional Requirements

- Must work with batch ingestion in the MVP.
- Must be fast enough to display ticket details within an acceptable time.
- Must not depend on raw chat logs or raw prompts.
- Must not store prohibited data.

---

## 14. Acceptance Criteria

The AC-Test Coverage logic module is considered MVP-complete if it satisfies all of the following:

1. It can extract ACs from the target ticket's `spec-pack.md`.
2. It can link test evidence from `test-plan.md` and `test-results.md`.
3. It can display `PASSED`, `FAILED`, `UNTESTED`, and `UNKNOWN` statuses for each AC.
4. It can calculate the overall coverage for the ticket.
5. QA can use the list of untested ACs to decide on additional testing.
6. The dashboard can display the result without requiring manual inference from the user.

---

## 15. Errors and Handling

| Situation | Handling |
|---|---|
| No `spec-pack.md` | Report missing artifact |
| No ACs found | Mark the ticket as having a spec quality issue |
| No test files | Mark all ACs as `UNTESTED` |
| AC cannot be mapped to a test | Record `UNKNOWN` or `UNTESTED` depending on confidence |
| File parse error | Log the parse error and the related line count |

---

## 16. Minimal Sample Data

```text
Ticket: <TICKET>
AC-<TICKET>-1: User can submit order successfully.
AC-<TICKET>-2: System returns a readable error when stock is insufficient.
AC-<TICKET>-3: Audit log is created for stock shortage.

Test evidence:
- AC-<TICKET>-1 -> test-result-01 PASS
- AC-<TICKET>-2 -> test-result-02 PASS
- AC-<TICKET>-3 -> no linked test evidence

Result:
- Coverage: 66.7%
- AC-<TICKET>-1 status: UNTESTED
```

---

## 17. Relationship to Other Functions

This module must be compatible with the other parsers and logic in the MVP, especially:

- `parser spec-pack.md`
- `parser test-plan.md / test-results.md`
- `parser report.md`
- `traceability matching logic`
- `evidence quality score engine`

---

## 18. Implementation Notes

- Prioritize clarity and auditability over inference intelligence.
- If the input data is not sufficiently standardized, the system must reflect that condition accurately instead of automatically “beautifying” the coverage.
- This logic should be designed so it can later be reused by other parser features following the same pattern.