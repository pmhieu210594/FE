# Review Checklist

**Ticket ID**: PM-DASHBOARD
**Create date**: 2026-06-25
**Author**: Codex
**Update date**: 2026-06-25

## 1. Specification / AC Matching

| AC ID | Review point | Severity | Result | Evidence |
|---|---|---|---|---|
| AC-PM-DASHBOARD-1 | Landing page loads with PM Dashboard title, summary area, and core dashboard shell | Blocker | Pending | |
| AC-PM-DASHBOARD-2 | KPI area shows blocked, missing evidence, open issues, waiting review, CI failed, EQS, risk/exception, and bottleneck signals | Blocker | Pending | |
| AC-PM-DASHBOARD-3 | Filters actually change the ticket table result set | Major | Pending | |
| AC-PM-DASHBOARD-4 | Search matches ticket ID, title, repository, phase, and keyword fields | Major | Pending | |
| AC-PM-DASHBOARD-5 | Missing evidence is visible, countable, and explainable | Major | Pending | |
| AC-PM-DASHBOARD-6 | Risk and exception signals are visible and not mixed with personal ranking | Major | Pending | |
| AC-PM-DASHBOARD-7 | EQS numeric value and score band are both visible | Major | Pending | |
| AC-PM-DASHBOARD-8 | Detail view exposes EQS breakdown from the read-only drawer | Major | Pending | |
| AC-PM-DASHBOARD-9 | Clicking a card or row opens a read-only detail drawer | Major | Pending | |
| AC-PM-DASHBOARD-10 | No personal ranking, real names, email, or user identifier leak to the UI | Blocker | Pending | |
| AC-PM-DASHBOARD-11 | Export is hidden or blocked when permission is absent | Blocker | Pending | |
| AC-PM-DASHBOARD-12 | Refresh is hidden or blocked when permission is absent | Blocker | Pending | |
| AC-PM-DASHBOARD-13 | No write action is exposed for source evidence | Blocker | Pending | |

## 2. General System Review

### 2.1 Number / Input / Boundary

- [ ] Numeric validation for EQS, counts, and page size is explicit
- [ ] Full-width numbers are accepted or explicitly rejected by rule
- [ ] Mixed full-width and half-width input is handled consistently
- [ ] Empty string and `null` are handled explicitly
- [ ] Precision and rounding for score display are defined
- [ ] Pagination boundaries do not overflow or underflow

### 2.2 Character / Encoding / Locale

- [ ] Full-width, half-width, emoji, and surrogate pair behavior is considered where input exists
- [ ] Search and filter trim behavior is explicit
- [ ] Unicode normalization is not silently broken
- [ ] Vietnamese and English labels remain readable
- [ ] No mojibake is introduced in new artifacts

### 2.3 Literal / Magic Number

- [ ] No hard-coded score thresholds are introduced unless approved
- [ ] No hard-coded permission assumptions are introduced
- [ ] Enum and constant values are used where possible
- [ ] Display values are mapped intentionally from code values

### 2.4 Performance / Compatibility / Maintenance

- [ ] Dashboard load behavior is acceptable for the expected dataset size
- [ ] Staleness or refresh behavior is documented
- [ ] Browser compatibility expectations are explicit
- [ ] Configuration is not hard-coded
- [ ] Correlation ID / traceId behavior is preserved

## 3. FE Review

- [ ] Uses typed `endpoints` from `lib/api.ts`
- [ ] Uses React Query or the repo-approved server-state pattern
- [ ] Uses shared UI primitives instead of ad-hoc widgets
- [ ] No direct fetch in page components
- [ ] No write forms for read-only dashboard interactions
- [ ] No personal ranking or identity leakage

## 4. BE / API Review

- [ ] Web layer remains thin
- [ ] Application layer owns business logic
- [ ] No direct infrastructure access from controller
- [ ] Standard error envelope is used
- [ ] `traceId` is present on errors
- [ ] Permission gates are enforced server-side
- [ ] API response shape matches spec-pack and contract assumptions

## 5. DB / Migration Review

- [ ] Existing V4 tables are used as the authoritative source
- [ ] `raw/database_design.md` is not copied blindly into migrations
- [ ] No new snapshot table is created without approval
- [ ] No migration is edited in place
- [ ] No stale table name is introduced by guesswork
- [ ] Index or view impact is documented if a new read model is introduced

## 6. Security / Privacy Review

- [ ] No PII or personal ranking is displayed
- [ ] No raw evidence content is logged
- [ ] Permission checks exist for export and refresh
- [ ] Read-only posture is preserved
- [ ] Auth decision follows the approved source, not stale wording
- [ ] Sensitive data is not exposed in traces, error messages, or exports

## 7. Operation / Maintenance Review

- [ ] Read-only dashboard behavior is obvious to users
- [ ] Empty state is helpful
- [ ] Refresh staleness is explainable
- [ ] Export behavior is safe and permission-gated
- [ ] Logging is useful but not noisy
- [ ] Operational ownership and follow-up path are clear

## 8. Test Review

- [ ] Load, empty, filter, search, and detail scenarios are covered
- [ ] Permission differences are covered
- [ ] Boundary values for EQS and counts are covered
- [ ] Read-only behavior is covered
- [ ] No-write-action behavior is covered
- [ ] Negative cases map to the standard error contract

## 9. Documentation / Traceability Review

- [ ] Context and ticket rules are aligned
- [ ] Spec-pack, design, and review terminology are aligned
- [ ] Open issues remain visible and are not silently resolved
- [ ] No invented API names are introduced in docs
- [ ] AC mapping remains traceable from spec to test and review

## 10. Release / Rollback Review

- [ ] No rollout assumptions are made without implementation confirmation
- [ ] No rollback plan is invented for uncreated migrations
- [ ] Any future migration path is additive only
- [ ] Release notes mention permission and read-only behavior if implemented

## 11. Severity Definition

| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug or policy violation | Fix or accepted risk |
| Minor | Minor improvement or polish item | Optional |

## 12. Review Summary Template

| area | result | notes |
|---|---|---|
| AC matching | Pending | |
| General system review | Pending | |
| FE review | Pending | |
| BE/API review | Pending | |
| DB/Migration review | Pending | |
| Security/Privacy review | Pending | |
| Operation/Maintenance review | Pending | |
| Test review | Pending | |
| Documentation/Traceability review | Pending | |
| Release/Rollback review | Pending | |

## 13. AC Correspondence Table

| AC ID | review checkpoints | test hooks | reviewer notes |
|---|---|---|---|
| AC-PM-DASHBOARD-1 | Landing page shell, title, summary area | Page load, render snapshot | |
| AC-PM-DASHBOARD-2 | KPI cards and summary widgets | Render, data mapping | |
| AC-PM-DASHBOARD-3 | Filter application behavior | Filter interaction | |
| AC-PM-DASHBOARD-4 | Search behavior | Search interaction | |
| AC-PM-DASHBOARD-5 | Missing evidence display | List and detail mapping | |
| AC-PM-DASHBOARD-6 | Risk and exception display | Drawer mapping | |
| AC-PM-DASHBOARD-7 | EQS and score band display | Row mapping | |
| AC-PM-DASHBOARD-8 | EQS breakdown details | Drawer detail mapping | |
| AC-PM-DASHBOARD-9 | Click-to-open drawer | Interaction and read-only check | |
| AC-PM-DASHBOARD-10 | Personal data leakage guard | UI review and DOM inspection | |
| AC-PM-DASHBOARD-11 | Export permission gating | UI and API permission test | |
| AC-PM-DASHBOARD-12 | Refresh permission gating | UI and API permission test | |
| AC-PM-DASHBOARD-13 | No write action exposure | UI and API review | |
