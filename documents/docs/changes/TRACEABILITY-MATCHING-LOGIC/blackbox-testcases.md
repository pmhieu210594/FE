# Black-box Test Cases

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC  
**Create date**: 2026-06-23  
**Author**: OpenAI  
**Update date**: 2026-06-23  

## Test Case Summary

| case ID | AC ID | priority | category | title |
|---|---|---|---|---|
| BB-001 | AC-TRACEABILITY-MATCHING-LOGIC-1 | P0 | Normal | Ticket shows artifact trace links |
| BB-002 | AC-TRACEABILITY-MATCHING-LOGIC-2 | P0 | Normal | Ticket shows one linked PR |
| BB-003 | AC-TRACEABILITY-MATCHING-LOGIC-3 | P0 | Normal | Commit links are visible but not counted in completeness |
| BB-004 | AC-TRACEABILITY-MATCHING-LOGIC-4 | P0 | Normal | PR shows linked CI run |
| BB-005 | AC-TRACEABILITY-MATCHING-LOGIC-5 | P0 | Boundary | Completeness is 100 percent when required evidence is complete |
| BB-006 | AC-TRACEABILITY-MATCHING-LOGIC-5 | P0 | Boundary | Completeness drops when required evidence is missing |
| BB-007 | AC-TRACEABILITY-MATCHING-LOGIC-6 | P0 | Error | Missing PR stays visible as a broken link |
| BB-008 | AC-TRACEABILITY-MATCHING-LOGIC-6 | P0 | Error | Missing CI or report stays visible as a broken link |
| BB-009 | AC-TRACEABILITY-MATCHING-LOGIC-7 | P1 | State | Timeline order is chronological and tie-break stable |
| BB-010 | AC-TRACEABILITY-MATCHING-LOGIC-8 | P1 | Normal | Read model works with approved tbl_ fixtures |
| BB-011 | AC-TRACEABILITY-MATCHING-LOGIC-9 | P1 | Normal | Confidence values render with approved enums only |
| BB-012 | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | Permission | Read-only user cannot edit, delete, or repair links |
| BB-013 | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | Permission | Invalid, empty, or non-existing ticket ID is rejected cleanly |
| BB-014 | AC-TRACEABILITY-MATCHING-LOGIC-10 | P1 | State | Access log contains traceId and ticketId only |
| BB-015 | AC-TRACEABILITY-MATCHING-LOGIC-10 | P0 | Permission | Anonymous or expired-session access is rejected cleanly |

## Test Cases

### BB-001: Ticket shows artifact trace links

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-1 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Synthetic ticket has at least one artifact snapshot row and the view is reachable by an authenticated reader. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Open the traceability view for the ticket and inspect the artifact section. |
| Expected Result | Artifact trace links are visible, readable, and associated with the correct ticket. |
| Note | This is the main happy-path evidence display check. |

### BB-002: Ticket shows one linked PR

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-2 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Synthetic ticket is linked to exactly one PR in the fixture data. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Open the traceability view and inspect the PR section. |
| Expected Result | Exactly one PR link is shown and it matches the seeded PR identifier. |
| Note | This validates the one-ticket-one-PR MVP assumption. |

### BB-003: Commit links are visible but not counted in completeness

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-3 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Ticket fixture contains one PR with one or more commit links. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Open the traceability summary and inspect both the commit area and completeness display. |
| Expected Result | Commit links are shown, but the completeness value does not count commit presence as a required item. |
| Note | Commits may be displayed for context, but they do not raise or lower the required completion count. |

### BB-004: PR shows linked CI run

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-4 |
| Priority | P0 |
| Category | Normal |
| Preconditions | Fixture data includes a PR that has a matching CI run. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Open the traceability view and inspect the CI section under the PR. |
| Expected Result | The linked CI run is visible and associated with the correct PR. |
| Note | Use the same synthetic ticket to keep the scenario deterministic. |

### BB-005: Completeness is 100 percent when required evidence is complete

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-5 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Fixture contains the full approved evidence set for the ticket root, PR, artifact, and CI, with no required link missing. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Open the summary panel and read the completeness value. |
| Expected Result | Completeness is displayed as 100 percent, or the equivalent full-complete state defined by the product. |
| Note | This is the upper boundary case. |

### BB-006: Completeness drops when required evidence is missing

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-5 |
| Priority | P0 |
| Category | Boundary |
| Preconditions | Fixture removes one required evidence item while keeping the rest of the trace chain intact. |
| Input | Ticket fixture `T-TRACE-PARTIAL-001` |
| Steps | Open the traceability summary and compare the completeness against the full fixture. |
| Expected Result | Completeness is lower than the full case and the missing item is reflected in the summary. |
| Note | This is the lower/partial boundary case for the calculation. |

### BB-007: Missing PR stays visible as a broken link

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-6 |
| Priority | P0 |
| Category | Error |
| Preconditions | Ticket has an artifact but no PR row in the fixture data. |
| Input | Ticket fixture `T-TRACE-MISSING-PR-001` |
| Steps | Open the traceability view and inspect the PR area. |
| Expected Result | The missing PR is shown as a broken link or warning state instead of being hidden or crashing the view. |
| Note | The error must remain visible to the user. |

### BB-008: Missing CI or report stays visible as a broken link

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-6 |
| Priority | P0 |
| Category | Error |
| Preconditions | Ticket has a PR and artifact, but CI or report evidence is missing from the fixture. |
| Input | Ticket fixture `T-TRACE-MISSING-CI-001` or `T-TRACE-MISSING-REPORT-001` |
| Steps | Open the traceability view and inspect the missing evidence area. |
| Expected Result | The missing CI or report is displayed as a broken link or warning state and the rest of the view remains usable. |
| Note | A separate missing-report fixture is included so both visible failure modes can be exercised. |

### BB-009: Timeline order is chronological and tie-break stable

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-7 |
| Priority | P1 |
| Category | State |
| Preconditions | Fixture contains multiple evidence events with known timestamps, including at least two events with the same timestamp. |
| Input | Ticket fixture `T-TRACE-TIMELINE-001` |
| Steps | Open the timeline section and compare the displayed order against the seeded event order. |
| Expected Result | Events are shown in chronological order and the same-timestamp items keep a deterministic order across reloads. |
| Note | This checks the black-box observable ordering rule only. |

### BB-010: Read model works with approved tbl_ fixtures

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-8 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Seed data is stored only in the approved existing `tbl_` tables named in the spec and impact analysis. |
| Input | Ticket fixture `T-TRACE-FULL-001` loaded from approved table rows |
| Steps | Open the traceability view using the seeded compatibility dataset. |
| Expected Result | The traceability screen renders successfully from the approved stored data set without requiring any new user-visible table or manual graph input. |
| Note | The no-new-table rule is primarily a source/DB review concern; this case confirms the approved table-backed path is usable. |

### BB-011: Confidence values render with approved enums only

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-9 |
| Priority | P1 |
| Category | Normal |
| Preconditions | Fixture includes link confidence values using only the approved set HIGH, MEDIUM, and LOW. |
| Input | Ticket fixture `T-TRACE-CONFIDENCE-001` |
| Steps | Open the traceability view and inspect the confidence badges or labels. |
| Expected Result | Only approved confidence values are displayed, and each seeded value is rendered exactly as stored. |
| Note | Unknown confidence values should not appear in the normal black-box path. |

### BB-012: Read-only user cannot edit, delete, or repair links

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | Authenticated viewer can access the traceability screen. |
| Input | Viewer account `viewer-readonly` |
| Steps | Open the traceability screen and inspect the available actions, buttons, menus, and contextual controls. |
| Expected Result | No edit, delete, repair, or graph manipulation action is available. |
| Note | Repeat with `admin-reader` and expect the same read-only result for this feature. |

### BB-013: Invalid, empty, or non-existing ticket ID is rejected cleanly

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-10 |
| Priority | P0 |
| Category | Error |
| Preconditions | The traceability route or API is opened with malformed input, an empty value, or a ticket ID that does not exist. |
| Input | `""`, `abc`, and `T-TRACE-NOT-FOUND-999` |
| Steps | Submit each input variant through the screen or direct route/API call. |
| Expected Result | The system returns a clear validation or not-found result without exposing stack traces or crashing the page. |
| Note | This covers empty/null, character type, and non-existing ID viewpoints. |

### BB-014: Access log contains traceId and ticketId only

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-10 |
| Priority | P1 |
| Category | State |
| Preconditions | Logging is enabled in the test environment and the traceability endpoint is called once. |
| Input | Ticket fixture `T-TRACE-FULL-001` |
| Steps | Execute one read request and inspect the access/application log output for the request. |
| Expected Result | The log contains traceId and ticketId, and it does not expose raw payloads, secrets, source code blobs, or other sensitive data. |
| Note | This is an operation-viewpoint check, not a write-audit requirement. |

### BB-015: Anonymous or expired-session access is rejected cleanly

| item | content |
|---|---|
| Related AC | AC-TRACEABILITY-MATCHING-LOGIC-10 |
| Priority | P0 |
| Category | Permission |
| Preconditions | The user session is absent or expired before opening the traceability screen. |
| Input | Anonymous session or expired session token |
| Steps | Open the traceability route directly with no valid session. |
| Expected Result | The system rejects access cleanly through the expected auth flow, without exposing traceability data or a broken UI. |
| Note | The exact UX can be redirect or error page, depending on the app shell. |

## Viewpoints Covered

- [x] Normal case
- [x] Error case
- [x] Boundary value
- [x] Permission difference
- [x] State transition
- [x] Character type input
- [ ] Numeric input
- [ ] Full-width number
- [x] Empty/null
- [ ] Duplicate
- [x] Non-existing ID
- [ ] Deleted data
- [ ] External IF failure
- [ ] Timeout/retry
- [ ] Double submit
- [ ] Back/reload
- [x] Session expired
- [x] Existing data compatibility
- [x] Log/audit/notification/report output
