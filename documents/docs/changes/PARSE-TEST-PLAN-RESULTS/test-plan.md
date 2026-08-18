# Test Plan

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-19
**Author**: OpenAI
**Update date**: 2026-06-22

## 1. Purpose

* Verify that `test-plan.md` and `test-results.md` are parsed into canonical snapshot data.
* Verify field extraction, snapshot persistence, and pair-view retrieval.
* Verify handling of missing files, empty files, missing sections, and duplicate headings.

## 2. AC Matrix ↔ Test Type

| AC ID                             | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
| --------------------------------- | ----- | ----- | ------ | ------------- | ------------ | --- | --------- |
| AC-1 Parse test-plan.md           |       | ✅     |        |               |              |     | ✅         |
| AC-2 Parse test-results.md        |       | ✅     |        |               |              |     | ✅         |
| AC-3 Persist snapshot             |       |       | ✅      |               | ✅            |     | ✅         |
| AC-4 Extract test-plan fields     |       | ✅     |        |               |              |     | ✅         |
| AC-5 Extract test-results fields  |       | ✅     |        |               |              |     | ✅         |
| AC-6 Pair View retrieval          |       |       | ✅      |               |              |     | ✅         |
| AC-7 Missing section handling     |       | ✅     |        |               |              |     | ✅         |
| AC-8 Re-parse behavior            |       |       | ✅      |               | ✅            |     | ✅         |
| AC-9 Sensitive data handling      |       | ✅     | ✅      |               |              |     | ✅         |
| AC-10 Duplicate heading detection |       | ✅     |        |               |              |     | ✅         |
| AC-11 Empty file handling         |       | ✅     |        |               |              |     | ✅         |
| AC-12 Missing file handling       |       | ✅     |        |               |              |     | ✅         |

## 3. Priority

| test item                   | priority | reason                 |
| --------------------------- | -------- | ---------------------- |
| Parse test-plan.md          | P0       | Core parser capability |
| Parse test-results.md       | P0       | Core parser capability |
| Snapshot persistence        | P0       | Source of truth        |
| Missing section handling    | P0       | Evidence quality       |
| Duplicate heading detection | P1       | Parser robustness      |
| Pair View retrieval         | P1       | Dashboard requirement  |

## 4. Reuse Existing Test

| existing test                       | path          | covers                       | gap                             |
| ----------------------------------- | ------------- | ---------------------------- | ------------------------------- |
| Existing parser test framework      | src/test/java | Common parser infrastructure | No test-plan specific scenarios |
| Existing integration test framework | src/test/java | REST/API validation          | No parser artifact coverage     |

## 5. Additional Test This Time

| test                        | type   | target              | related AC        |
| --------------------------- | ------ | ------------------- | ----------------- |
| TestPlanParseServiceTest    | BE UT  | test-plan parser    | AC-1,4,7,10,11,12 |
| TestResultsParseServiceTest | BE UT  | test-results parser | AC-2,5,7,10,11,12 |
| Snapshot Persistence Test   | API IT | persistence layer   | AC-3,8            |
| Pair View Retrieval Test    | API IT | pair view endpoint  | AC-6              |

### E2E Step-by-step Scenarios

| scenario | precondition     | steps | expected | related AC |
| -------- | ---------------- | ----- | -------- | ---------- |
| N/A      | Backend-only PoC | N/A   | N/A      | N/A        |

## 6. Areas intentionally left untested this time

| area                   | reason           | risk   |
| ---------------------- | ---------------- | ------ |
| Frontend UI rendering  | Out of scope     | Low    |
| E2E workflow           | Backend-only PoC | Low    |
| AC coverage validation | Not implemented  | Medium |

## 7. Data testing principles

* Use synthetic markdown samples only.
* Do not use production data.
* Validate normal, missing, duplicate, empty, and missing-file scenarios.
* Keep test content aligned with template headings.

## 8. Execution command

| command    | purpose                          |
| ---------- | -------------------------------- |
| mvn test   | Execute unit tests               |
| mvn verify | Execute integration verification |

## 9. Stop Condition

* Parser cannot map canonical fields correctly.
* Snapshot persistence is not idempotent.
* Pair View cannot retrieve both artifacts consistently.

## 10. Required Human Decision

* Placeholder detection scope.
* AC coverage validation approach.
* Pair View readiness criteria.
