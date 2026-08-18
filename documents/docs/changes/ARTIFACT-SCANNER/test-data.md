# Test Data

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16   
**Author**: nk_trung   
**Update date**: 2026-06-17  

## Data Policy

- Use synthetic data only; do not use real customer data, secrets, tokens, or production repositories.
- Test data must be deterministic and reseedable multiple times without depending on execution order.
- Black-box data must be described from a business input/output perspective, without depending on class names or internal table structure.
- Use stable ticket keys such as `ARTIFACT-SCANNER`, `MISSING-CHECK`, `UNKNOWN-TICKET`, and `BOUNDARY-HASH` so expected results are easy to read.
- For change-scope tickets, the standard MVP artifact set is always the 8 required files: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, and `blackbox-testcases.md`.
- For phase0, use only the fixed file list supported by the scanner in this ticket; expected results are metadata-only.
- Hash-change tests must use different but small and deterministic content so changed/new status and `need_parse` are easy to verify.
- Permission tests must clearly separate admin and non-admin data; do not reuse the same session.

## Master Data

| name | value | purpose |
|---|---|---|
| Repository Valid | `REPO-ART-001` | Valid repository used for the normal flow and current inventory. |
| Repository Invalid | `REPO-UNKNOWN-999` | Negative case for a repository that does not exist or cannot be accessed. |
| Scan Mode | `FULL`, `TICKET_SCOPED` | Covers the scanner MVP modes. |
| Trigger Type | `MANUAL`, `WEBHOOK` | Supports the operation viewpoint and run summary. |
| Ticket Valid | `ARTIFACT-SCANNER` | Standard ticket with enough data to verify full inventory. |
| Ticket Missing | `MISSING-CHECK` | Ticket missing required artifacts to verify missing behavior. |
| Ticket Unknown | `UNKNOWN-TICKET` | Ticket appearing in the path but not yet having a dimension record. |
| Ticket Boundary | `BOUNDARY-HASH` | Ticket used for rescan same-hash / changed-hash scenarios. |
| Required Artifact Set | `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md` | Standard scanner MVP v1 file set. |
| Scan Status | `FOUND`, `MISSING`, `INACCESSIBLE`, `ERROR`, `SKIPPED` | Observable values used in expected results. |
| Supported Phase0 Set | Fixed phase0 file set currently supported by the scanner in code/this ticket | Used to verify metadata-only scanning for phase0. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `admin.scanner` | ADMIN | Run scanner, view run summary, view current inventory | Positive flow for manual/API verification. |
| `viewer.scanner` | VIEWER or equivalent non-admin | Not allowed to run scanner or view admin-only current inventory | Permission negative flow. |
| `webhook.scanner` | SYSTEM / service context if supported by the environment | Trigger scan from the integration path | Operation viewpoint when the run source needs to be checked. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| N-01 | Repository `REPO-ART-001` has `docs/changes/ARTIFACT-SCANNER/` with all 8 required files | Verify full inventory and artifact type mapping. |
| N-02 | Repository `REPO-ART-001` also has `docs/maintenance/phase0/` with the full supported phase0 file set | Verify phase0 metadata-only scanning. |
| N-03 | Repository has at least 2 different valid tickets under `docs/changes/` | Verify FULL scan across multiple tickets and current inventory by repository. |
| N-04 | There is at least one previous successful scanner run | Verify reading run summary and artifact result/current inventory. |

## Error Data

| ID | data | expected error |
|---|---|---|
| E-01 | Ticket `MISSING-CHECK` is missing `review-checklist.md` | The required artifact is reflected as missing. |
| E-02 | `docs/changes/UNKNOWN-TICKET/` exists but there is no dimension ticket yet | Scanner does not fail the whole run; the ticket is still scanned according to the unknown-ticket policy. |
| E-03 | Out-of-scope files such as `notes.tmp` or `draft.txt` are located in the ticket directory | Out-of-scope files do not break the run and do not corrupt the target inventory. |
| E-04 | `repositoryId = REPO-UNKNOWN-999` | Run/current inventory request is rejected or returns a repository invalid/not found error. |
| E-05 | `scanMode=TICKET_SCOPED` but `ticketIds=[]` or null | Validation/business error; no invalid run is created. |
| E-06 | `branchOrRef` is empty or blank | Validation error before the scan run. |
| E-07 | Non-admin calls scanner API | Forbidden/unauthorized according to policy. |
| E-08 | Scanner source connector is not configured or source read fails | Run clearly reflects the access/source error at an observable level. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| B-01 | Rescan with the same content | Scan twice consecutively with unchanged artifact content | Artifact is not marked changed/new; `need_parse` is not enabled again merely because of rescan. |
| B-02 | Rescan after changing 1 line | Change 1 small line in `spec-pack.md` or another target file | Hash differs; artifact is reflected as changed/new; `need_parse=true`. |
| B-03 | File size | 0 bytes for an artifact target | Scanner still reflects the artifact at metadata level with status/message according to policy. |
| B-04 | FULL scan on a repository with no valid ticket | No valid `docs/changes/<TICKET>/` exists | Run completes but does not create valid ticket inventory; summary reflects that there was no suitable scan target. |
| B-05 | Current inventory after multiple runs | There are old and new runs for the same repository | Current inventory must reflect the latest state, not return an older snapshot. |

## Existing Data Compatibility

- Existing run history and inventory from previous scans must still be readable in current inventory according to the latest state.
- If the environment already has scanner data, black-box expected results must be based on the latest visible result instead of assuming an empty DB.
- Other change-scope tickets besides `ARTIFACT-SCANNER` must not be affected by this ticket's test data.
- Out-of-scope files or optional missing phase0 files must not make the inventory of the 8 required artifacts incorrect.

## Data Setup Procedure

1. Seed or prepare a test repository `REPO-ART-001` that the scanner can read.
2. Create ticket dimensions for `ARTIFACT-SCANNER`, `MISSING-CHECK`, and `BOUNDARY-HASH` if the environment requires pre-existing dimensions.
3. Do not create a dimension for `UNKNOWN-TICKET` in order to verify the unknown-ticket policy.
4. Create the following fixture directories and files under the test repository:
   - `docs/changes/ARTIFACT-SCANNER/` with all 8 required files.
   - `docs/changes/MISSING-CHECK/` missing at least 1 required file.
   - `docs/changes/UNKNOWN-TICKET/` with at least 1 valid artifact target.
   - `docs/changes/BOUNDARY-HASH/` with 1 artifact used for rescan same-hash / changed-hash testing.
   - `docs/maintenance/phase0/` with the supported phase0 file set.
5. Prepare 2 separate users/sessions: admin and non-admin.
6. If testing current inventory, run at least 2 consecutive scans to obtain latest-vs-oldest data.

## Data Cleanup Procedure

- Delete local fixture files if the test environment is temporary or a dedicated workspace.
- Delete run/snapshot test data created specifically for Phase 7 if the environment requires resetting to baseline.
- Do not delete team-shared master data if the environment is shared dev/test, unless separate guidance exists.
- Delete or invalidate test sessions/tokens after permission verification is completed.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.