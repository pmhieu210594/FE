# Test Plan

**Ticket ID**: CI-RUN-METADATA
**Create date**: 2026-06-17 
**Author**: ChatGPT
**Update date**: 2026-06-17 

## 1. Purpose

Verify that GitHub Actions CI job metadata is collected, normalized, persisted, and exposed without storing raw CI logs or sensitive data.

Main verification points:

- One row per GitHub Actions job.
- Required metadata fields are stored.
- URL preference/fallback works.
- Idempotency prevents duplicates.
- Connector failures are visible.
- Forbidden data is not persisted.

## 2. AC Matrix ↔ Test Type

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-CI-RUN-METADATA-1 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-2 |  | x | x | x | x |  | x |
| AC-CI-RUN-METADATA-3 |  | x | x |  |  |  | x |
| AC-CI-RUN-METADATA-4 |  | x | x |  |  |  | x |
| AC-CI-RUN-METADATA-5 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-6 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-7 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-8 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-9 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-10 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-11 |  | x | x |  | x |  | x |
| AC-CI-RUN-METADATA-12 |  | x | x | x |  |  | x |

## 3. Priority

| test item | priority | reason |
|---|---|---|
| Multiple jobs in one workflow run | P0 | Validates selected data grain. |
| Duplicate ingest/upsert | P0 | Prevents DB duplication and misleading metrics. |
| Forbidden data persistence check | P0 | Security/privacy gate. |
| Repository unresolved handling | P0 | Prevents orphan CI rows. |
| Status mapping | P1 | Required for dashboard accuracy. |
| URL preference/fallback | P1 | Required for evidence traceability. |
| Running job with null completed time | P1 | Common CI state. |
| PR/ticket unresolved nullable case | P2 | Best-effort linkage behavior. |

## 4. Reuse Existing Test

| existing test | path | covers | gap |
|---|---|---|---|
| TBD | TBD | TBD | Existing test source must be inspected before implementation. |

## 5. Additional Test This Time

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-CI-RUN-METADATA-1 | Workflow run with two jobs persists two rows | Integration / DB | Collector -> DB | AC-CI-RUN-METADATA-1 |
| TC-CI-RUN-METADATA-2 | Required fields persisted | Integration / DB | `tbl_fact_ci_run` | AC-CI-RUN-METADATA-2 |
| TC-CI-RUN-METADATA-3 | Job URL preferred | Unit | URL mapper | AC-CI-RUN-METADATA-3 |
| TC-CI-RUN-METADATA-4 | Workflow run URL fallback | Unit | URL mapper | AC-CI-RUN-METADATA-4 |
| TC-CI-RUN-METADATA-5 | Repository resolution required | Integration | Repository resolver | AC-CI-RUN-METADATA-5 |
| TC-CI-RUN-METADATA-6 | PR linkage if available | Integration | PR resolver | AC-CI-RUN-METADATA-6 |
| TC-CI-RUN-METADATA-7 | Ticket linkage if inferred | Integration | Ticket resolver | AC-CI-RUN-METADATA-7 |
| TC-CI-RUN-METADATA-8 | Duplicate ingest updates existing row | Integration / DB | Upsert repository | AC-CI-RUN-METADATA-8 |
| TC-CI-RUN-METADATA-9 | Running job allows null completed time | Unit / DB | Validator / DB | AC-CI-RUN-METADATA-9 |
| TC-CI-RUN-METADATA-10 | GitHub API failure logged | Integration | Connector run | AC-CI-RUN-METADATA-10 |
| TC-CI-RUN-METADATA-11 | Forbidden data not stored | Security check | DB/log review | AC-CI-RUN-METADATA-11 |
| TC-CI-RUN-METADATA-12 | Query/display returns CI job metadata | API / contract | Dashboard/detail API | AC-CI-RUN-METADATA-12 |

### E2E Step-by-step Scenarios
- This feature does not include E2E

## 6. Areas intentionally left untested this time

| area | reason | risk |
|---|---|---|
| FE unit tests | This phase is backend-first, and AC-12 is covered through API/contract verification instead of FE assertions. | FE rendering regressions may remain until a UI-focused ticket is scheduled. |
| E2E tests | No end-to-end user journey is required after scope refinement. | Cross-layer regressions are covered later by API and integration tests. |
| Raw CI log parsing | Out of scope and forbidden | None; should not be implemented. |
| Test result parsing | Out of scope | Covered by separate ticket if needed. |
| Coverage parsing | Out of scope | Covered by separate ticket if needed. |
| Failure classification | Out of scope | Dashboard only shows status in this ticket. |
| Secret/SAST/SCA summary | Out of scope | Covered by security evidence ticket. |
| Flaky test detection | Out of scope | Future enhancement. |

## 7. Data testing principles

- Use dummy GitHub run/job IDs.
- Do not use real GitHub tokens in test data.
- Do not store raw CI log samples.
- Do not use secret-looking values unless they are clearly dummy and safe.
- Use UTC/timestamptz timestamps.
- Test invalid/null values explicitly.

## 8. Execution command

| command | purpose |
|---|---|
| TBD | Run BE unit tests. |
| TBD | Run integration tests with test DB. |
| TBD | Run migration test. |
| TBD | Run security persistence check. |

## 9. Stop Condition

- DB migration fails.
- Duplicate ingest creates duplicate rows.
- Forbidden data is persisted.
- Repository unresolved case creates orphan CI rows.
- Connector failure is not recorded.
- Tests require real tokens/secrets in repository or artifact files.

## 10. Required Human Decision

| decision | reason |
|---|---|
| GitHub Actions auth method | Needed for integration test design. |
| Exact status mapping for ambiguous GitHub statuses | Needed for mapper expected values. |
| Existing package/test framework convention | Needed before adding test classes. |
| Dashboard display default | Needed for FE/API acceptance. |
