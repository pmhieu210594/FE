# Black-box Test Cases

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 | P0 | Normal | Safety Pack source-dir precedence and file coverage |
| BB-002 | AC-SAFETY-PACK-3 | P0 | Boundary | settings.json permission count parsing |
| BB-003 | AC-SAFETY-PACK-4 | P0 | Error | invalid settings.json returns PARSE_ERROR |
| BB-004 | AC-SAFETY-PACK-5 | P0 | External IF | persisted evidence is exposed only as normalized authenticated-visible data |
| BB-005 | AC-SAFETY-PACK-6, AC-SAFETY-PACK-7, AC-SAFETY-PACK-8, AC-SAFETY-PACK-9, AC-SAFETY-PACK-10 | P0 | Normal | normalized GitHub Actions ingest and scan policy mapping |
| BB-006 | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 | P1 | Error | malformed normalized summary is rejected safely |
| BB-007 | AC-SAFETY-PACK-11 | P0 | Permission | authenticated users of any role can access the APIs |
| BB-008 | AC-SAFETY-PACK-10 | P0 | Normal | duplicate GitHub Actions retry updates the same logical evidence row |
| BB-009 | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 | P0 | Normal | GitHub tree snapshot resolves nested `.claude` content |

## Test Cases

### BB-001: Safety Pack source-dir precedence and file coverage

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Repository fixture contains `documents/.claude/` and `.claude/` variants, with at least one valid `CLAUDE.md`, one valid `settings.json`, and at least one `rules/*.md` file in the preferred location. |
| Input | Run the Safety Pack scan for the repository fixture. |
| Steps | 1. Load the Safety Pack result. 2. Compare the reported source location and file existence flags. 3. Confirm the coverage flags for `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md`. |
| Expected Result | The result uses `documents/.claude/` when both locations exist, and the file coverage flags match the actual fixture contents. |
| Note | This case covers local filesystem precedence and file presence only, not parsing errors or GitHub tree resolution. |

### BB-002: settings.json permission count parsing

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-3 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Repository fixture contains a valid `settings.json` with permission arrays that are empty, missing, or populated at the boundary. |
| Input | Valid `settings.json` variants with `deny`, `ask`, and `allow` present or absent. |
| Steps | 1. Load the Safety Pack result for each fixture variant. 2. Compare the reported deny / ask / allow counts. 3. Verify the result stays stable when an array is missing or empty. |
| Expected Result | Missing arrays are treated as zero, empty arrays are counted as zero, and populated arrays return the expected counts. |
| Note | This is the main boundary-value case for count parsing. |

### BB-003: invalid settings.json returns PARSE_ERROR

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-4 |
| Priority | P0 |
| Category | Error |
| Preconditions | Repository fixture contains a malformed `settings.json` and otherwise readable Safety Pack files. |
| Input | Run the Safety Pack scan for the malformed fixture. |
| Steps | 1. Load the Safety Pack result. 2. Observe the status shown for the pack. 3. Verify the response remains usable. |
| Expected Result | The Safety Pack status becomes `PARSE_ERROR`, and the scan does not crash or block unrelated fields from being shown. |
| Note | This case also covers safe failure behavior. |

### BB-004: persisted evidence is exposed only as normalized authenticated-visible data

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-5 |
| Priority | P0 |
| Category | External IF |
| Preconditions | A successful Safety Pack scan or CI ingest has already produced stored evidence. |
| Input | Call the admin API that reads back the stored evidence. |
| Steps | 1. Request the evidence through the supported admin surface. 2. Inspect the returned fields. 3. Confirm no raw secrets, tokens, private keys, or raw finding bodies are exposed. |
| Expected Result | The response contains only normalized evidence fields that are allowed by the contract, with no raw sensitive content. |
| Note | This is the black-box check for the persistence rule. |

### BB-005: normalized GitHub Actions ingest and scan policy mapping

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-6, AC-SAFETY-PACK-7, AC-SAFETY-PACK-8, AC-SAFETY-PACK-9, AC-SAFETY-PACK-10 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The ingest endpoint is reachable and the test environment has a valid authenticated caller for the CI push contract. |
| Input | Normalized summary v1 payload containing SECRET, SAST, and SCA scan records with representative statuses. |
| Steps | 1. Post the normalized payload to the ingest endpoint. 2. Check the returned result. 3. Open the admin evidence API and verify the stored summary values. 4. Confirm the policy mapping for unresolved SECRET, critical SAST, and critical SCA outcomes. |
| Expected Result | The payload is accepted, the summary is stored in normalized form, unresolved SECRET findings map to `FAIL`, critical SAST findings map to `FAIL` and high findings to `WARNING`, critical SCA findings map to `FAIL` and high findings to `WARNING`, and only normalized counts/metadata are exposed. |
| Note | This case covers the main happy path plus the policy outcomes required by AC-7/8/9/10. |

### BB-006: malformed normalized summary is rejected safely

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-6, AC-SAFETY-PACK-10 |
| Priority | P1 |
| Category | Error |
| Preconditions | The ingest endpoint is reachable. |
| Input | Payload missing required repository, commit SHA, workflow run id, or scans data, or payload with invalid scan type / invalid status values. |
| Steps | 1. Submit the malformed payload. 2. Observe the HTTP or API failure response. 3. Check that the admin evidence API does not show partial or corrupted data. |
| Expected Result | The request is rejected safely, no raw payload content is leaked, and no partial normalized evidence is exposed as a successful ingest. |
| Note | This is the main validation-error case for the ingest contract. |

### BB-007: authenticated users of any role can access the APIs

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-11 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Two authenticated user sessions with different roles are available. |
| Input | Call the Safety Pack and Security Scan APIs from each authenticated session. |
| Steps | 1. Attempt to call the APIs with each role. 2. Compare the response. |
| Expected Result | Access is granted consistently for authenticated users of any role, and the APIs expose the same evidence data. |
| Note | This case confirms role-agnostic access rather than role-based denial. |

### BB-008: duplicate GitHub Actions retry updates the same logical evidence row

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-10 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The ingest endpoint is reachable and an evidence row for the same repository / commit / scanner already exists. |
| Input | Send the same normalized summary v1 payload twice, using the same repository, commit SHA, workflow run id, workflow job id if present, and scan type. |
| Steps | 1. Post the payload once and record the row count. 2. Post the identical payload again. 3. Re-query the admin evidence API or database view. |
| Expected Result | The second delivery updates the existing logical row instead of creating a duplicate row, and the visible evidence remains normalized. |
| Note | This is the black-box check for the retry-safe upsert behavior. |

### BB-009: GitHub tree snapshot resolves nested `.claude` content

| item | content |
|---|---|
| Related AC | AC-SAFETY-PACK-1, AC-SAFETY-PACK-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | The repository tree contains `.claude/` files nested under a path such as `documents/.claude/` or another repo subdirectory. |
| Input | Trigger the GitHub Actions snapshot flow for that repository / branch / commit. |
| Steps | 1. Run the snapshot flow. 2. Inspect the stored Safety Pack evidence. 3. Verify the reported source directory and file coverage flags. |
| Expected Result | The nested `.claude` location is resolved and scanned, and the resulting Safety Pack evidence reflects the actual nested source contents. |
| Note | This is the black-box check for GitHub tree-based `.claude` resolution. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [ ] Permission difference
- [ ] State transition
- [x] Character type input
- [x] Numeric input
- [x] Full-width number
- [x] Empty/null
- [ ] Duplicate
- [ ] Non-existing ID
- [x] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [ ] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output