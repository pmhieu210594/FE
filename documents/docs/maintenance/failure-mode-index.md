# Failure Mode Index

## Purpose

Record failure modes that are worth keeping because they help prevent repeat incidents across tickets.
Keep entries concise and prefer reusable prevention/detection guidance over ticket-specific prose.

---

## Organization-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-ORG-001 | Migration IT fails on a runner without Docker/Testcontainers | Running `OrganizationMigrationIntegrationTest` where Docker socket access is unavailable | Require a Docker-enabled runner for DB migration IT | Test fails before PostgreSQL container startup |
| FMI-ORG-002 | Raw translation keys appear in the UI | Missing or mistyped `Pages.Organization.*` locale entry | Keep FE translations in `public/locales/{en,ja,vi}/locale.json` and test translated labels | UI shows untranslated key text instead of a localized label |
| FMI-ORG-003 | Stale update/delete overwrites newer organization data | `version` is omitted or not checked atomically in update/delete SQL | Require `version` on mutating requests and check affected row count | Concurrent edit/delete unexpectedly succeeds |
| FMI-ORG-004 | Soft-deleted organization code/name cannot be reused | Partial unique index is defined without `deleted_at IS NULL` | Scope uniqueness to active rows only | Create/update fails for a code/name that exists only in Deleted |
| FMI-ORG-005 | Non-admin users can reach Organization UI but get poor feedback | FE route guard is missing or backend returns 200 + error string instead of a real forbidden response | Keep FE admin gate and backend forbidden handling aligned | Non-admin sees the page but a mutation appears to succeed or fails silently |

---

## Customer-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-CUS-001 | Playwright locator strict-mode collision on duplicated labels | The same visible label appears in the list row, the open drawer, and the option popup | Scope option clicks to the active popup/container or use a stable `data-testid` | Playwright reports a strict-mode violation when clicking the option |
| FMI-CUS-002 | Soft-deleted master data cannot be reused | Partial unique index is defined without `deleted_at IS NULL` for code/alias reuse | Keep uniqueness scoped to active rows only | Reusing a value from a soft-deleted row fails unexpectedly |
| FMI-CUS-003 | Stale update/delete overwrites newer master data | `version` is omitted from the mutating `WHERE` clause | Require `version` and verify affected row count | Concurrent edit/delete unexpectedly succeeds |
| FMI-CUS-004 | Raw translation keys appear in the UI | Missing or mismatched locale key for a Customer/Organization message | Keep FE translation keys aligned with the backend message contract | UI shows untranslated `Pages.*` keys or fallback text |

---

## Project-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-PROJ-001 | Authorization is treated as fully proven even though only coarse denial behavior was tested | Ticket intent depends on role-derived action semantics, but the evidence only proves a coarse runtime gate | Require an explicit auth-semantic review note whenever product intent references role tables or role-derived action policy | Final report or test-results show auth as `PARTIAL` with pending human review |
| FMI-PROJ-002 | Exception tickets drift back toward neighboring module defaults | The feature intentionally deviates from nearby contracts, but implementation or review copies the default pattern back in | Repeat approved deviations in spec, tests, review checklist, and final report | Hidden `version`, wrong delete verb, or borrowed default contract shape appears in evidence |
| FMI-PROJ-003 | Final closure implies PR or CI proof that is not locally available | Local-only evidence is summarized as if external PR comment or hosted CI evidence exists | Require closure docs to state "not found locally" when external review or CI artifacts are absent | Final report claims review/CI confidence without a local artifact or limitation note |
| FMI-PROJ-004 | Read-only dashboard silently becomes writable or persistent | A dashboard implementation adds POST/PUT endpoints or a snapshot table instead of staying read-only | Keep dashboard endpoints GET-only and aggregate from existing tables through the service/repository layer | API review or migration review catches a write surface or new table |

---

## Repository-Derived Failure Modes

| ID           | Failure mode                                                | Trigger                                                                             | Prevention                                                                                      | Detection                                                              |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| FMI-REPO-001 | Soft delete behavior inconsistent between list and detail   | List query or UI does not exclude deleted rows OR detail API blocks deleted records | Enforce rule: list = active-only, detail = allow deleted; align FE/BE behavior                  | E2E: delete → verify not in list but accessible in detail              |
| FMI-REPO-002 | Duplicate validation scope mismatch (per project vs global) | Uniqueness enforced globally or inconsistently between DB and BE                    | Define uniqueness scope explicitly (per project, active-only); align DB index and BE validation | Integration: duplicate same project → 409; different project → success |
| FMI-REPO-003 | Missing trim before validation causes duplicate bypass      | Input is not trimmed before validation or duplicate check                           | Always trim before validation, duplicate check, and persistence                                 | Unit + integration: `"  repo-A  "` conflicts with `"repo-A"`           |
| FMI-REPO-004 | FE-only validation allows invalid or unauthorized requests  | Backend does not enforce validation or permission                                   | Backend must validate all inputs and enforce authorization                                      | Integration: invalid payload → 400; unauthorized → 403                 |

---

## PM-Dashboard-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-PM-001 | Numeric URL param clamp silently ignores `0` — `Number(x) \|\| default` treats `0` as absent | Any numeric URL param where `0` is a valid value and code uses the `\|\| default` idiom | Use explicit `raw === null` guard before coercion: `if (raw === null) return default; const n = Number(raw); return isNaN(n) ? default : clamp(n)` | Unit test with `?param=0` input; caught in `parseFilters` size clamp (PM-DASHBOARD test phase) |
| FMI-PM-002 | Stale raw DB design doc drives a migration that duplicates or conflicts with existing V4 schema | Developer reads `raw/database_design.md` and creates a migration without cross-checking V4 | Spec-pack must document an explicit proposed-table → V4-table mapping; pre-migration checklist: "verified against V4 authoritative schema?" | Code review sees a new migration creating a table that already exists in V4 |
| FMI-PM-003 | Auth doc inconsistency — `architecture.md` JWT wording misleads a new developer into adding Bearer token headers | New developer reads `overview.md` and adds `Authorization: Bearer` to a new endpoint | Keep a cross-reference note in `overview.md` pointing to `security.md` as the canonical auth source; update stale wording when confirmed | Code review: new endpoint uses Bearer token header instead of the session cookie confirmed in `security.md` |
| FMI-PM-004 | Owner display PII leak — snapshot query falls back to raw `updated_by`/`created_by` instead of joining the pseudonym table | New snapshot or report query uses `updated_by` as the display value because the pseudonym join is omitted or falls through | Never use `updated_by`/`created_by` as a display value; always join `tbl_dim_member_pseudonym.pseudonym`; add a unit test asserting `ownerDisplay` does not match an email pattern | Unit test asserting pseudonym-only value; code review of any new snapshot query that touches owner/author columns |

## Parser Failure Modes

| ID | Failure Mode | Trigger | Prevention | Detection |
|----|-------------|--------|------------|-----------|
| FMI-PARSER-001 | Missing required section leads to partial parsing | Markdown thiếu section bắt buộc | Define required section list + optional strict mode validation | Parser trả PARTIAL/WARNING + missing fields |
| FMI-PARSER-002 | Malformed header prevents section detection | Header sai format (`##`, typo, level sai) | Header normalization + fallback matching | Section không detect → missing field |
| FMI-PARSER-003 | Silent data loss due to malformed structure | Markdown không đúng format nhưng parser vẫn chạy | Add validation layer + warning/error state | Output thiếu dữ liệu nhưng không fail rõ ràng |
| FMI-PARSER-004 | Inconsistent section naming breaks mapping | Naming khác nhau giữa document | Central naming registry + alias mapping | Mapping fail hoặc field missing |
| FMI-PARSER-005 | Partial document ingested as valid | Document chưa hoàn chỉnh | Completeness score + draft detection | Output PARTIAL nhưng vẫn downstream |
| FMI-PARSER-006 | Spec and test drift undetected | Spec define nhưng test không cover | Cross-document validator | Không có signal cảnh báo |
| FMI-PARSER-007 | Implementation diverges from spec | Impl không match spec | Spec–Impl traceability check | Sai behavior nhưng không detect |
| FMI-PARSER-008 | Lowercase key lookup silently misses all sections | Parser gọi `sections.get(field)` với lowercase key nhưng `MarkdownParserCore.sectionMap()` trả về UPPERCASE canonical keys (e.g. `"SUMMARY"`, `"OPEN_ISSUES"`) | Dùng `sections.get(field.toUpperCase())`; verify key format bằng diagnostic test trước khi implement section lookup | `detectMissingFields()` báo all-missing; `parsedSummary` section fields đều null; `parseStatus` luôn `PARTIAL` với mọi non-empty content |

---

## QA-Dashboard-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-QA-DASH-01 | New KPI always returns 0% — parser-dependent table `section_type` value not confirmed from parser source before adapter SQL was written | Writing SQL that queries `tbl_fact_artifact_parsed_section` (or any parser-dependent fact table) for a new artifact type without first reading the parser source; parser not deployed or constant in adapter does not match what parser writes | impl-plan Step 1 Stop Condition: read parser source → record confirmed `section_type` as a named constant → write SQL. Do not write SQL before confirmation. (Rule R-QA-DASH-01) | KPI card stuck at 0% regardless of test data; `SELECT COUNT(*) FROM tbl_fact_artifact_parsed_section WHERE section_type = 'xxx'` returns 0 rows |
| FMI-QA-DASH-02 | PoC `= 0` placeholder persists to production — Deferred formula has no deadline, no escalation path | Formula Deferred in spec-pack without a deadline; team proceeds through Phase 3–5 without Product decision; placeholder value ships | Set a deadline alongside every Deferred label in spec-pack; treat no-deadline Deferred as a Phase 3 go/no-go blocker. (Rule R-QA-DASH-02) | Numeric KPI field always returns `0` across all environments; unit test only verifies placeholder returns `0`; user incident report that a card "never changes" |

---

## Developer-Dashboard-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-DEV-DASH-001 | FE E2E fixture uses a role value the route guard doesn't recognize | Test fixture set `role: "DEVELOPER"` while `RequireDashboard` (`App.tsx:83`) only accepts `PM \| QA \| DEV \| ADMIN` | Before writing a fixture/mock user, confirm the exact role enum values accepted by the FE route guard; reuse `"DEV"` for developer-role fixtures | E2E suite fails at the first step — app redirects to `/login` instead of rendering the dashboard |
| FMI-DEV-DASH-002 | Final verdict reads as an unscoped PASS while a later test round is still pending | Test plan splits FE round and BE round across phases; the FE-only round finishes green and the verdict line doesn't state its scope | State the round scope explicitly in the Final Verdict line (e.g. "PASS — FE round only"); don't let an unscoped PASS stand until the deferred round (e.g. BE Service/Repository unit test) also completes | test-results.md lists BE aggregation as an unverified remaining risk (§9) while §10 states a plain "PASS" |

Note: the strict-mode Playwright violation hit in this ticket (duplicated "Review comments" label) is a recurrence of `FMI-CUS-001`, not a new failure mode — no new row added for it.

---

## Admin-Audit-Log-Derived Failure Modes

| ID | Failure mode | Trigger | Prevention | Detection |
|---|---|---|---|---|
| FMI-AAL-001 | UI component implemented and unit-tested but never mounted on the page it was built for | A new component (e.g. summary cards) is added and tested in isolation, but the page-composition file is not updated in the same change | Require a page-level render/composition check for any AC that specifies a visible UI element; see `docs/standards/testing.md` "AC Closure / Release Gating" | Human/browser review of the actual composed screen catches the missing element (this ticket's `human-review.md` finding M1) |
| FMI-AAL-002 | Error-message sanitizer only truncates, does not redact secret-pattern substrings, before writing to an audit/log payload | A caught exception's message is capped by length only and passed into a log/audit field; the raw message may embed `password`/`token`/`secret`/`apiKey`-style substrings | Redact known secret-pattern substrings before truncating, not truncation alone; see `docs/standards/security.md` masking section | Unit test asserting sanitized output for a message containing a secret-like substring |
| FMI-AAL-003 | Leftover artifact from a prior ticket silently treated as current-ticket review/promotion evidence | A ticket's doc folder carries a file (e.g. `promotion-candidates.md`) whose content/header still belongs to a different ticket, and a later phase reads it without checking | Check each artifact's own Ticket ID header against the current ticket before treating it as input; see `docs/standards/maintenance.md` | A downstream phase (or reviewer) notices content referencing a different ticket ID or unrelated feature |

Note: the Phase 6/7 gap in this ticket where automated-suite `PASS` and black-box-case completion could have been read as the same gate is a recurrence of `FMI-DEV-DASH-002`, not a new failure mode — this ticket's `test-results.md` correctly kept the two scopes separate, so no new row was added for it.

---

## Notes

- Add a new row only when the failure mode has a real chance to recur.
- Avoid turning one-off process issues into permanent general rules.
- Prefer a short link to a living doc when the prevention pattern is already documented elsewhere.
