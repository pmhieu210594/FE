# Codex Independent Review

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-30  
**Author**: OpenAI  
**Update date**: 2026-06-30  

## Review Input

| artifact/source | status |
|---|---|
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md` | reviewed |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md` | reviewed |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/review-checklist.md` | reviewed |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/self-review.md` | reviewed |
| `.claude/rules/00-safety.md` / `10-style.md` / `20-architecture.md` / `30-security.md` / `40-testing.md` | reviewed |
| Diff code (`ArtifactScannerService`, `SelfReviewMarkdownParser`, `ArtifactScannerJdbcAdapter`, V234, controllers/DTOs, tests) | reviewed |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| FCI-B1 | `src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java`<br>`src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java`<br>`src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java`<br>`docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/report.md` | `report.md` has an `Exception Record Summary` table, but the pipeline is parsing it with `SelfReviewMarkdownParser`, so all exception rows in the report are ignored. AC-FCI-4/5/7/10 are therefore not satisfied for the `report.md` branch. | `report.md` L98-L105 uses the heading `Exception Record Summary`; `MarkdownParserCore.canonicalSectionKey()` L353-L397 maps this heading to `EXCEPTION_RECORD_SUMMARY`; `SelfReviewMarkdownParser.extractExceptionRecords()` L633-L685 only handles tables with the exact section key `EXCEPTION_RECORD`; `ArtifactScannerService` L328-L337 calls `selfReviewParser.parse(...)` for `report.md`. | Separate a dedicated parser for `report.md` or extend the alias/schema to recognize `EXCEPTION_RECORD_SUMMARY`; map the report columns correctly and persist exception rows from the report. | Add a `report.md` fixture with at least one exception row; verify the scanner persists exceptions from `sourceSection=report` and the KPI/read model increases correctly. |

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| FCI-M1 | `src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java`<br>`src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | When `approvedByRoleName` cannot be resolved, the implementation only stores `NULL` and does not emit a warning/data-quality record as required by the spec. | Spec-pack BR-FCI-8 L86-L87 requires a role that cannot be resolved to still allow the row **with a warning**; `findRoleIdByName()` / `resolveRoleId()` L651-L740 only return `null`; `persistExceptionRecords()` L555-L583 does not include `log.warn()` or `insertDataQualityRecord()` for this case. | When role resolution fails, write a warning/data-quality record with a code such as `APPROVED_ROLE_UNRESOLVED`, including `sourcePath`, `sourceSection`, and `roleName`, so operators can clearly see which exception rows have not been mapped to the role master. | Add a test for an exception row with a non-existent role; verify `approved_by_role_id` is `NULL` but a warning/data-quality record is created. |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| FCI-N1 | `src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | There is no test coverage specifically for the `report.md` exception parsing flow or the unresolved role case. | The existing test file only covers report score recalculation (`L371-L416`) and spec-pack/self-review parsing (`L135-L184`, `L324-L369`); there is no assertion verifying exception rows from `report.md` or a warning when the role cannot be resolved. | Add unit/integration tests for the `report.md` exception table and for a role-unresolved case to lock in the behavior described above. |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| Q-1 | Is the exception table in `report.md` a separate schema, or should it be normalized to match `self-review.md` before parsing? | AC-FCI-4 / BR-FCI-8 | Finalize the parser contract for `report.md` to avoid continuing to miss exception rows. |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-1 | `REPORT` artifact type seed in V234 | This is a valid change to enable `report.md` scanning; there is no evidence that it introduces a separate regression. |

## Missing Evidence

- There is no fresh runtime/compile build evidence in this review environment.
- There is no fixture/test evidence proving that `report.md` exception rows are persisted successfully.

## Suspicious Assumptions

- Do not assume `SelfReviewMarkdownParser` can be used as-is for `report.md`; the heading and table schemas of the two documents are different.
- Do not assume that a `NULL` approved role is automatically sufficient to satisfy the spec; the spec requires an accompanying warning.

## Required Human Decisions

- Whether to split out a dedicated parser for `report.md` or normalize the report schema so the current parser can be reused.
- Whether persistence of a warning/data-quality record for an unresolved role is mandatory, or whether logging alone is sufficient.
- Whether additional test coverage for the report exception path is required before merge.

## Final Verdict

- APPROVE