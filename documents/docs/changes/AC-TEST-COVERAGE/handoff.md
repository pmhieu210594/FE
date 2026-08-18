# Handoff

**Ticket ID**: AC-TEST-COVERAGE  
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## 1. Current Phase

Phase 5 - Implementation / AI Review / Human Review.

## 2. Completed Artifacts

- Implemented executed coverage persistence from `test-results.md`.
- Kept planned coverage and executed coverage separate.
- Updated read-model counting so planned rows do not inflate executed coverage.
- Added/updated backend unit tests for adapter, parser, and read-model behavior.
- Filled `self-review.md` with implementation evidence and AC mapping.

## 3. Incomplete Artifacts

- FE rendering was not changed in this phase.
- Independent review has not yet been run.
- Human review has not yet been run.

## 4. Changed Files

- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapterTest.java`
- `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapterTest.java`
- `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/docparse/TestResultsParseServiceTest.java`
- `docs/changes/AC-TEST-COVERAGE/self-review.md`
- `docs/changes/AC-TEST-COVERAGE/handoff.md`

## 5. Summary of Current Diff

- Added a new executed-coverage persistence contract and record model to the persistence port.
- `TestResultsParseService` now extracts AC-linked executed coverage rows from result tables and passes them to persistence.
- `TestEvidenceJdbcAdapter` now upserts executed test-case rows and AC coverage rows using an idempotent deterministic test-case identity.
- `EvidenceQualityScoreRepositoryAdapter` now excludes `PLANNED` coverage rows from executed coverage counts.
- Unit tests cover the new executed-coverage write path and the read-model counting rule.

## 6. Commands Run and Results

- `mvn "test" "-Dtest=TestEvidenceJdbcAdapterTest,EvidenceQualityScoreRepositoryAdapterTest,TestResultsParseServiceTest"`
- Result: PASS, 16 tests run, 0 failures, 0 errors.

## 7. Open Issues

- FE dashboard rendering is still unverified in-browser.
- End-to-end CI evidence linkage still needs broader integration coverage beyond the targeted unit tests.

## 8. Human Decisions Required

- Confirm whether the next phase should expose any additional dashboard read surface.
- Confirm whether later UI work should keep the current read-only behavior only.

## 9. Stop / Ask Conditions

- A new standalone UI workflow becomes necessary.
- A new public API contract becomes necessary.
- A new table becomes necessary.
- Manual mapping or FE-side recomputation is requested.

## 10. Next Prompt / Next Action

- Run independent review against `review-checklist.md`.
- If the review is green, proceed to human review using the same current diff and self-review evidence.
