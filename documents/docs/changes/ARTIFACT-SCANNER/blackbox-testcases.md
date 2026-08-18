# Black-box Test Cases

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung  
**Update date**: 2026-06-17  


## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-02, AC-ARTIFACT-SCANNER-03 | P0 | Normal | Full scan correctly identifies the ticket and all 8 required artifacts |
| BB-002 | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-04 | P0 | Error | A ticket missing a required artifact is reflected as missing |
| BB-003 | AC-ARTIFACT-SCANNER-04 | P0 | Error | A valid path is still scanned even when the ticket does not yet exist in the dimension |
| BB-004 | AC-ARTIFACT-SCANNER-03 | P1 | Error | A file that does not belong to a configured artifact type does not break the entire run |
| BB-005 | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09 | P1 | Normal | Run scan returns a run summary and artifact results for review/operations |
| BB-006 | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 | P0 | Boundary | Rescan with unchanged content does not mark `need_parse` |
| BB-007 | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 | P0 | Boundary | Rescan with changed content changes the hash and sets `need_parse` to true |
| BB-008 | AC-ARTIFACT-SCANNER-08 | P1 | Normal | Full scan scans phase0 in metadata-only mode |
| BB-009 | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-11 | P0 | Boundary / Error | `TICKET_SCOPED` with empty `ticket_ids` is rejected |
| BB-010 | AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 | P1 | Permission / Operation | Current inventory only displays the latest inventory of a valid repository |
| BB-011 | AC-ARTIFACT-SCANNER-11 | P0 | Permission | Non-admin users cannot run scans or view current inventory |
| BB-012 | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 | P1 | Audit / Operation | Scan results provide sufficient status and minimum debugging information |

## Test Cases

### BB-001: Full scan correctly identifies the ticket and all 8 required artifacts

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-02, AC-ARTIFACT-SCANNER-03 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The repository has a `docs/changes/ARTIFACT-SCANNER/` directory with all 8 required files: `spec-pack.md`, `impl-plan.md`, `review-checklist.md`, `self-review.md`, `test-plan.md`, `test-results.md`, `report.md`, `blackbox-testcases.md`; the `ARTIFACT-SCANNER` ticket already exists in the dimension. |
| Input | Call run scan with `scanMode=FULL`, a valid `repositoryId`, and a valid `branchOrRef`. |
| Steps | 1) Trigger scan 2) Open the run summary 3) Open the artifact result of ticket `ARTIFACT-SCANNER` |
| Expected Result | The scanner correctly identifies `ticket_id=ARTIFACT-SCANNER`; all 8 required artifacts appear in the result with the correct artifact type; no required artifact is missing. |
| Note | This is the baseline case to confirm the scanner's main scope on `docs/changes/<TICKET>/`. |

### BB-002: A ticket missing a required artifact is reflected as missing

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-04 |
| Priority | P0 |
| Category | Error |
| Preconditions | The repository has a sample ticket under `docs/changes/MISSING-CHECK/` that is missing at least 1 required file, for example `review-checklist.md`. |
| Input | Run scan for the repository containing the sample ticket. |
| Steps | 1) Trigger scan 2) View the artifact result/current inventory of `MISSING-CHECK` |
| Expected Result | The result displays all existing artifacts and reflects the missing required file with status `MISSING` or an equivalent message; the entire run does not fail just because the ticket is missing a required file. |
| Note | A parser is not required to determine missing artifacts. |

### BB-003: A valid path is still scanned even when the ticket does not yet exist in the dimension

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-04 |
| Priority | P0 |
| Category | Error |
| Preconditions | There is a `docs/changes/UNKNOWN-TICKET/` directory with the correct structure, but there is no `UNKNOWN-TICKET` record in the ticket dimension yet. |
| Input | Run scan in `FULL` or `TICKET_SCOPED` mode for that ticket. |
| Steps | 1) Trigger scan 2) Check the run summary 3) Check the artifact result of `UNKNOWN-TICKET` |
| Expected Result | The scanner does not fail the entire run; the ticket is identified and still has an artifact inventory for `UNKNOWN-TICKET`; the behavior matches the auto-create minimal ticket policy. |
| Note | This is the black-box case for the unknown ticket policy finalized in the spec. |

### BB-004: A file that does not belong to a configured artifact type does not break the entire run

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-03 |
| Priority | P1 |
| Category | Error |
| Preconditions | In `docs/changes/ARTIFACT-SCANNER/`, there is an extra file that does not belong to the MVP target list, such as `notes.tmp` or `draft.txt`. |
| Input | Run scan for that repository. |
| Steps | 1) Trigger scan 2) View the run summary and artifact result |
| Expected Result | The scanner still completes the run; the file that cannot be mapped to an artifact type does not break valid artifacts; the inventory of target artifacts remains correct. |
| Note | This case confirms that the scanner only recognizes artifacts based on configuration and does not expand scanning to out-of-scope files. |

### BB-005: Run scan returns a run summary and artifact results for review/operations

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09 |
| Priority | P1 |
| Category | Normal |
| Preconditions | There is a valid repository and the user has permission to run the scanner. |
| Input | Call `POST /api/v1/data-ops/artifact-scans` with `repositoryId`, `branchOrRef`, and `scanMode`. |
| Steps | 1) Trigger run scan 2) Call `GET /api/v1/data-ops/artifact-scans/{runId}` 3) Call `GET /api/v1/data-ops/artifact-scans/{runId}/artifacts` |
| Expected Result | The system returns a run summary with a run identifier and run status; the artifact result of the newly created run can be read through API/manual query; the data is sufficient for the reviewer to know which run just ran and which artifacts were scanned. |
| Note | This is the black-box case for review/operation capability and does not bind to a specific UI. |

### BB-006: Rescan with unchanged content does not mark `need_parse`

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | An artifact has been successfully scanned at least once and its content does not change between two scans. |
| Input | Run scan 1 and scan 2 with the same file content. |
| Steps | 1) Run scan the first time 2) Do not change the file 3) Run scan the second time 4) Compare the latest result |
| Expected Result | The artifact is still identified, but it is not marked as changed/new; `need_parse` is not turned on again only because the scan is repeated. |
| Note | This is the boundary for idempotent rescan behavior. |

### BB-007: Rescan with changed content changes the hash and sets `need_parse` to true

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-06, AC-ARTIFACT-SCANNER-07 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | An artifact already has an old snapshot; the file content will be modified with a small but valid change. |
| Input | Run scan before and after modifying the artifact content. |
| Steps | 1) Run scan the first time 2) Modify 1 line of content in the artifact 3) Run scan the second time 4) Check the latest artifact |
| Expected Result | The artifact is reflected as new or changed; the metadata hash differs from the previous run; `need_parse=true`. |
| Note | This case does not require the parser to run. |

### BB-008: Full scan scans phase0 in metadata-only mode

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-08 |
| Priority | P1 |
| Category | Normal |
| Preconditions | The repository has the fixed set of phase0 files under `docs/maintenance/phase0/` according to the list supported by the scanner. |
| Input | Run scan mode `FULL`. |
| Steps | 1) Trigger full scan 2) Check the artifact result related to phase0 |
| Expected Result | Phase0 files that are in the fixed list are recorded at metadata level; there is no requirement for the scanner to parse detailed content; a missing optional phase0 file does not cause the run to fail like a missing required artifact in the ticket change-scope. |
| Note | This is the operation viewpoint for the phase0 part included in the MVP scope. |

### BB-009: `TICKET_SCOPED` with empty `ticket_ids` is rejected

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-01, AC-ARTIFACT-SCANNER-11 |
| Priority | P0 |
| Category | Boundary / Error |
| Preconditions | The scanner run endpoint is available and the user has permission. |
| Input | `scanMode=TICKET_SCOPED` but `ticketIds=[]`, or `ticketIds` is not provided. |
| Steps | 1) Send the run scanner request 2) Observe the response |
| Expected Result | The request is rejected with a clear validation/business error; the system does not create an invalid scan run. |
| Note | This is a boundary of the input contract and does not depend on internal implementation. |

### BB-010: Current inventory only displays the latest inventory of a valid repository

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 |
| Priority | P1 |
| Category | Permission / Operation |
| Preconditions | The repository has been scanned at least twice, and the later scan reflects newer metadata. |
| Input | Call `GET /api/v1/data-ops/artifact-scans/current?repositoryId=<validId>`. |
| Steps | 1) Create at least two scan runs 2) Call current inventory 3) Compare it with the artifact result of the latest run |
| Expected Result | Current inventory reflects the latest status by repository; it does not return an older snapshot when a valid latest inventory exists. |
| Note | This is the black-box case for latest inventory behavior and does not mention internal views. |

### BB-011: Non-admin users cannot run scans or view current inventory

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-11 |
| Priority | P0 |
| Category | Permission |
| Preconditions | There is a valid non-admin account and a repository with seeded scanner data. |
| Input | Use a non-admin account to call `POST /api/v1/data-ops/artifact-scans` or `GET /api/v1/data-ops/artifact-scans/current`. |
| Steps | 1) Log in as non-admin 2) Call the run API 3) Call the current inventory API |
| Expected Result | The request is rejected according to the authorization policy; the non-admin user does not receive inventory data or permission to trigger a scan. |
| Note | If the system redirects/logs out at the UI surface, that is only an external manifestation; the essential point to verify is that non-admin users do not have permission to use the scanner API. |

### BB-012: Scan results provide sufficient status and minimum debugging information

| item | content |
|---|---|
| Related AC | AC-ARTIFACT-SCANNER-05, AC-ARTIFACT-SCANNER-09, AC-ARTIFACT-SCANNER-11 |
| Priority | P1 |
| Category | Audit / Operation |
| Preconditions | There is one successful run and one run with a missing artifact or warning. |
| Input | Open the run summary and artifact result/current inventory of those runs. |
| Steps | 1) Trigger or select the appropriate run 2) View the summary 3) View status/message by artifact |
| Expected Result | From the API/manual query, the reviewer/operator can know which run succeeded, which artifact is missing/error/skipped, and has sufficient status/message information for basic debugging without having to read the DB directly. |
| Note | This is operational observability at the black-box observable output level. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [ ] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [ ] Duplicate
- [x] Non-existing ID
- [ ] Deleted data
- [x] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output