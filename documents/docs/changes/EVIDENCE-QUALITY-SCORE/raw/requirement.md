# Requirement Document - Evidence Quality Score Engine

**Ticket ID**: EVIDENCE-QUALITY-SCORE
**Create date**: 2026-06-23
**Author**: nk_trung
**Update date**: 2026-06-23

---

## 1. Function Overview

- **Function name:** Evidence Quality Score Engine
- **Business purpose:** Calculate an evidence quality score for each SDD ticket based on the artifacts, metadata, and traceability links that have been collected.
- **Reason for creating this function:** The platform needs an explainable measure to identify which tickets have a complete evidence set, which tickets are still missing pieces, and which tickets have low evidence quality and need improvement.
- **Goal of this version:** Provide a simple BE engine that calculates a score from 0 to 100, returns a clear breakdown, and supports dashboard / API display in a later step.

> Note: This function is the **BE engine**. Screen display belongs to the Dashboard function.

---

## 2. Scope

### 2.1 In Scope

- Calculate Evidence Quality Score for each ticket.
- Return a score on a 0-100 scale.
- Return a score breakdown by criteria group.
- Read input data from Artifact Inventory, parser output, PR/CI metadata, test results, and traceability links.
- Classify the score into bands: `Excellent`, `Good`, `Warning`, `Risky`, `Critical`.
- Persist the score result so that the dashboard and API can query it later.
- Return the reason for a low score when artifacts are missing, AC is missing, tests are missing, CI links are missing, or the report is missing.
- Handle incomplete input data or parse errors safely.
- Support recalculating the score when source data changes.
- Provide an API that Postman or test tools can call directly.

### 2.2 Out of Scope

- Displaying the score in the Dashboard UI.
- Individual ranking or performance comparison across people.
- Storing raw prompts, raw chat logs, or full source code.
- Managing score formula versions in the MVP.
- Real-time scoring on every keystroke or tiny change.
- AI cost analysis.
- Customer-facing PDF/Excel reports.

> Note: In the MVP, the engine only needs to calculate the score and return a stable breakdown for FE/dashboard consumption.

---

## 3. Current State Summary

- The system currently has mechanisms for collecting artifacts, PR metadata, CI metadata, and parsers for some SDD documents.
- There is no dedicated service for the Evidence Quality Score Engine yet.
- There is no standard logic to normalize a 0-100 score for a ticket.
- There is no consistent breakdown output for the dashboard to display.
- There is no score band rule or explanation for the score result.
- There is no synchronization check between artifact existence, AC, tests, CI, and report under a unified score scale.

---

## 4. Target State

- There is a BE service that accepts a `ticketId` or a list of `ticketId` values as input.
- The service returns the total score, score band, and breakdown by category.
- The score is calculated from ingested and parsed source data.
- The score reflects both completeness and evidence linkage quality.
- The result can be queried later through the API.
- When source data changes, the score can be recalculated.
- Data errors or missing data do not break the entire pipeline.

---

## 5. Requirement Change Table

| Part | Current State | Target State | Requirement | Change Type | Notes |
|---|---|---|---|---|---|
| Data input | Distributed across multiple sources | Standardized input for the engine | BE must read artifacts, parse output, PR/CI metadata, test results, and traceability links | New | Do not use raw chat |
| Total score | Not available | Score 0-100 available | Calculate a score for each ticket | New | Required for MVP |
| Breakdown | Not available | Breakdown by criteria group available | Return positive/negative contribution or weight of each part | New | Must be explainable |
| Score band | Not available | Result band available | Classify into Excellent/Good/Warning/Risky/Critical | New | Used by dashboard |
| Persist result | Not available | Result can be stored | Store the score for later lookup | New | Supports FE/API |
| Error handling | Not standardized | Pipeline remains stable | Parse errors or missing data must fail safely | New | Log fully |
| Formula versioning | Not needed in MVP | Can be added later | Manage formula version and change history | Future | Not required in MVP |

---

## 6. Functional Requirements

### 6.1 Evidence Quality Scoring

- The system must calculate an Evidence Quality Score for each ticket.
- The score must be between 0 and 100.
- The score must reflect the completeness and linkage quality of SDD evidence.
- The score must not depend only on whether artifacts exist.

### 6.2 Input Data

The engine must be able to use the following data sources:

> Note: For review, the canonical source of truth is PR review metadata/comments. Internal review files, if any, are only supplemental evidence.

- `spec-pack.md`
- `impl-plan.md`
- `review-checklist.md`
- `self-review.md`
- `test-plan.md`
- `test-results.md`
- `report.md`
- Artifact Inventory
- Traceability links among Ticket / PR / Commit / CI / Test / Report
- CI run metadata
- PR metadata
- PR review metadata/comments as the source of truth for review information (reviewer, review state, comment, approval/reject/request-changes, related processed findings).

### 6.3 Minimum Criteria Groups

The score must consider at least the following criteria groups:

1. **Artifact completeness**
   - Whether `spec-pack.md` exists
   - Whether `impl-plan.md` exists
   - Whether `review-checklist.md` exists
   - Whether `self-review.md` exists
   - Whether `test-plan.md` and `test-results.md` exist
   - Whether `report.md` exists

2. **Specification content completeness**
   - Scope / Non-scope present
   - Acceptance Criteria present
   - Risk / Open Issues present

3. **Implementation and verification completeness**
   - Rollback or rollback guidance present when needed
   - Review checklist present
   - Test plan / test results present
   - CI link or CI run ID present

4. **Traceability and review completeness**
   - Ticket is linked to PR / Commit / CI / Test / Report
   - The link chain is not broken
   - Review is taken from PR review metadata/comments as the source of truth

5. **Final report completeness**
   - Overview present
   - Impact present
   - Review present
   - Test present
   - Risk present
   - Remaining issues present

### 6.4 Score Breakdown

- The engine must return a clear breakdown by criteria group.
- The breakdown must show which parts increase the score and which parts decrease it.
- The breakdown must be detailed enough for a reviewer or PM to understand why a ticket has a low score.

### 6.5 Minimum API Response Schema for MVP

The API response must include at least the following fields:

- `ticketId`: the ticket code being scored.
- `score`: total score from 0-100.
- `band`: `Excellent` / `Good` / `Warning` / `Risky` / `Critical`.
- `breakdown[]`: detailed list of scoring items.
- `missing[]`: list of missing artifacts or data.
- `parseErrors[]`: list of parse / normalize errors.
- `traceIds[]`: list of related PR / CI / test / report / artifact IDs.
- `calculatedAt`: the time the score was calculated.

Reference response example:

```json
{
  "ticketId": "ABC-123",
  "score": 82,
  "band": "Good",
  "breakdown": [
    {
      "criterionId": "SPEC_AC_NUMBERED",
      "label": "spec-pack.md exists and has numbered ACs",
      "score": 15,
      "maxScore": 15,
      "status": "pass",
      "sourceRefs": [
        { "type": "artifact", "id": "spec-pack.md" }
      ]
    }
  ],
  "missing": [],
  "parseErrors": [],
  "traceIds": [
    { "type": "pr", "id": "PR-456" }
  ],
  "calculatedAt": "2026-06-23T10:30:00+07:00"
}
```

### 6.6 Score Calculation Proposal

| Item | Score |
|---|---:|
| `spec-pack.md` exists and has numbered ACs | 15 |
| Scope / Non-scope / Open Issues / Risk present | 10 |
| `impl-plan.md` has impact scope, rollback, and AC mapping | 10 |
| PR review metadata/comments are the source of truth for review; review outcome and processing status are present | 10 |
| `review-checklist.md` exists and includes security/test viewpoints | 10 |
| `self-review.md` includes commands run, results, and concerns | 15 |
| Remaining AI review / human review results and handling are present | 10 |
| `test-plan.md` and `test-results.md` are linked to ACs | 10 |
| CI run ID or link exists | 5 |
| `blackbox-testcases.md` covers key ACs | 5 |
| `report.md` includes overview, impact, review, test, risk, and remaining issues | 10 |

| Score | Judgment | Meaning |
|---:|---|---|
| 90-100 | Excellent | Strong for customer explanation and audit |
| 75-89 | Good | Usable in practice |
| 60-74 | Warning | Some gaps exist |
| 40-59 | Risky | Review and reproducibility are concerning |
| 0-39 | Critical | Evidence is insufficient and must be improved |

### 6.7 Missing Data Handling

- If an artifact does not exist, the engine must record the gap rather than crash.
- If parsing fails, the engine must record the parse error in the breakdown.
- If a traceability link is broken, the engine must reflect it in the score.
- If the input data is not sufficient to calculate a part of the score, the engine must mark that part as `missing` or `unknown`.

### 6.8 Persisting and Querying Results

- The score result must be stored so it can be queried later.
- The result must be tied to `ticketId`.
- When source data changes, the engine must be able to recalculate the score.

### 6.9 Usage Rules

- The score is only for improving team / process quality.
- Do not use the score to evaluate individuals.
- Do not use the score as the sole measure for management decisions.

---

## 8. Acceptance Criteria

- AC-1: When a valid ticket is passed in, the system returns a score between 0 and 100.
- AC-2: The system returns a score breakdown.
- AC-3: The system classifies the score band according to the defined threshold.
- AC-4: Missing artifacts or broken traceability links must reduce the score appropriately.
- AC-5: Parse errors must not break the entire score calculation process.
- AC-6: The score result can be queried again by ticketId.
- AC-7: The returned result includes enough data for dashboard display.
- AC-8: The system does not store or process raw prompts / raw chat logs in this engine.

---

## 9. MVP Implementation Notes

- In the MVP, a fixed formula may be used in code.
- In the MVP, formula versioning is not required if there is no operational need to change rules.
- In the MVP, keep it simple, easy to verify with Postman, and easy to debug.
- In the MVP, the FE/dashboard only reads the score data provided by the BE.
- After the MVP, formula versioning, rule change history, and scoring governance can be added.

---

## 10. Decisions to Make Later

- Do we need to store score history for each recalculation, or only the latest result?
- Should manual overrides be allowed for some score components in exceptional cases?
- Should scoring use fixed weights or weights by phase / ticket type?
- Should formula versioning be introduced immediately in the post-MVP phase?