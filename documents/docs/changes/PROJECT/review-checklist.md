# Review Checklist

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16  

## 1. Specification/AC Matching

Review result values: `PASS` / `FAIL` / `N/A` / `Accepted Risk` / `Question`.

| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-PROJECT-1 | Allowed user can open Project list and default view shows active Projects only with required list fields. | Major |  |
| AC-PROJECT-2 | Empty Project list renders safe empty state instead of broken table. | Major |  |
| AC-PROJECT-3 | Valid create persists Project and optional Team mappings successfully. | Blocker |  |
| AC-PROJECT-4 | Blank/whitespace alias is rejected and no write occurs. | Major |  |
| AC-PROJECT-5 | Duplicate active alias within the same Customer is rejected using V120 normalized active uniqueness semantics. | Blocker |  |
| AC-PROJECT-6 | Detail view includes required Project fields and current Team assignments. | Major |  |
| AC-PROJECT-7 | Valid update persists latest Project data without introducing `version`. | Blocker |  |
| AC-PROJECT-8 | Missing or soft-deleted Project is rejected in normal detail/update/delete flow. | Major |  |
| AC-PROJECT-9 | Soft delete uses `PUT /api/v1/projects/{id}/delete` and never physically deletes the Project row. | Blocker |  |
| AC-PROJECT-10 | Unauthorized caller is rejected by backend role-based authorization. | Blocker |  |
| AC-PROJECT-11 | Team sync makes active `tbl_project_team` rows match submitted Team IDs. | Blocker |  |
| AC-PROJECT-12 | Error responses preserve standard envelope and traceId behavior. | Major |  |

### 1.1. AC Traceability Table

| AC ID | Specification summary | Design / implementation area | Required evidence | Related review items | Status |
|---|---|---|---|---|---|
| AC-PROJECT-1 | Authorized user sees active Project list by default | FE route/page, BE list API, active filter/query | Screenshot/manual result, API response, test result | FE-001, FE-005, BE-001, DB-007, TEST-001 |  |
| AC-PROJECT-2 | Empty list renders safely | FE empty state and list wiring | UI/manual evidence or component test | FE-006, TEST-002 |  |
| AC-PROJECT-3 | Valid create persists Project and optional Team mappings | FE create form, POST API, service validation, insert SQL, bridge sync | Create success test and DB verification | FE-007, BE-002, BE-009, DB-008, TEST-003 |  |
| AC-PROJECT-4 | Blank alias is rejected | FE/BE validation and trim rules | Validation/error test, no-write verification | GEN-003, BE-007, TEST-004 |  |
| AC-PROJECT-5 | Duplicate active alias is rejected | Service duplicate check, V120 active uniqueness semantics | Conflict test for active duplicate and deleted-row reuse | GEN-004, BE-008, DB-009, TEST-005 |  |
| AC-PROJECT-6 | Detail includes Team assignments | Detail API, joins, FE detail/edit preload | Detail response/manual check | FE-008, BE-003, DB-010, TEST-006 |  |
| AC-PROJECT-7 | Update works without `version` | PUT API, service update rules, FE edit flow | Update success test and payload inspection | FE-009, BE-004, BE-011, TEST-007 |  |
| AC-PROJECT-8 | Missing/deleted Project is unavailable | Detail/update/delete not-found handling | 404/manual/API test | BE-012, TEST-008 |  |
| AC-PROJECT-9 | Soft delete uses approved endpoint only | FE delete flow, BE delete route, soft-delete SQL | Route verification, DB row remains | FE-010, BE-005, DB-011, TEST-009 |  |
| AC-PROJECT-10 | Unauthorized caller is rejected | FE guard, BE role enforcement, error response | FE/API unauthorized tests | FE-002, SEC-001, SEC-002, TEST-010 |  |
| AC-PROJECT-11 | Team mapping set matches submitted Teams | Service bridge sync, repository write logic | Team add/remove/sync verification | GEN-005, BE-010, DB-012, TEST-011 |  |
| AC-PROJECT-12 | Standard error envelope with traceId | Global exception handling and FE error display | Error response evidence | BE-013, SEC-003, OP-001, TEST-012 |  |

## 2. General System Review

### 2.1. Number/Input Check

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-001 | Blocker | No hidden `version` requirement exists in create/update/delete flows. | FE payloads, DTOs, service logic, and tests work without optimistic-lock `version`. |  | Main Project deviation from governance defaults. |
| GEN-002 | Major | Required field validation is explicit for `customerId` and `projectAlias`. | Missing/blank required fields return stable validation errors and no write occurs. |  | BE remains final enforcement. |
| GEN-003 | Major | Empty string/null/whitespace alias handling is consistent. | Alias is trimmed, blank rejected, and FE/BE behave consistently. |  | AC-PROJECT-4. |
| GEN-004 | Blocker | Duplicate alias behavior matches V120 semantics. | Normalized alias duplicate under same Customer is rejected only for active rows. |  | Case/trim and deleted-row reuse matter. |
| GEN-005 | Blocker | Team ID list handles empty/duplicate/nonexistent/inactive values safely. | Sync result is deterministic and no invalid Team mapping survives. |  | AC-PROJECT-11. |
| GEN-006 | Major | Pagination/filter inputs, if implemented, are validated safely. | Invalid page/size/status inputs do not cause server error or excessive query. |  | Follow current API convention. |
| GEN-006A | Major | Project UI default page size matches the approved ticket behavior. | Project list initializes with `25` items per page in the UI and related docs/tests do not drift back to `20`. |  | Ticket-specific UI default. |

### 2.2. Character Type / Encoding / Locale

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-007 | Major | Trim rule for `projectAlias` is explicit and consistent. | Leading/trailing spaces do not bypass required/duplicate checks. |  | AC-PROJECT-4, 5. |
| GEN-008 | Major | Unicode/case-insensitive duplicate behavior is reviewed where relevant. | Alias normalization is not accidentally case-sensitive if V120 semantics intend otherwise. |  | Based on `LOWER(BTRIM(project_alias))`. |
| GEN-009 | Major | Locale files remain valid UTF-8. | English/Japanese/Vietnamese Project strings render without mojibake. |  | Avoid copying bad encoding from raw input. |
| GEN-010 | Major | `Project name` UI label and `projectAlias` / `project_alias` mapping are consistent. | No mixed field naming confuses FE, BE, or reviewer. |  | Context/spec alignment. |
| GEN-011 | Minor | Full-width/half-width/emoji/surrogate-pair inputs are considered. | Inputs are stored/displayed safely or rejected consistently. |  | Especially alias and optional text fields if added. |

### 2.3. Literal / Magic Number

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-012 | Major | No hard-coded business values bypass approved enum/master sources. | `severity_level`/status values are centralized or consistently mapped. |  | Avoid ad hoc strings. |
| GEN-013 | Blocker | `project_type` free-text nullable behavior is explicit in code and docs. | No silent drift back to enum/select/master-data semantics. |  | Ticket-specific approved rule. |
| GEN-014 | Major | API paths are defined consistently. | Use only approved Project endpoints; no governance-default `PATCH /delete`. |  | Contract safety. |

### 2.4. Operation / Maintainability

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| GEN-015 | Major | Sufficient logs exist for incident investigation with traceId. | Create/update/delete/team-sync failures are diagnosable. |  | OP-001, OP-002. |
| GEN-016 | Major | Controller/service/repository responsibilities remain separated. | No controller business logic or infrastructure shortcut. |  | Hexagonal architecture. |
| GEN-017 | Major | Configuration is not hard-coded. | API base, role behavior, and environment-sensitive values use existing project configuration patterns. |  | Maintainability. |
| GEN-018 | Major | No out-of-scope work is silently included. | No restore/import/export/batch/auth redesign is added. |  | Scope control. |

## 3. FE Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| FE-001 | Major | Project route is implemented in the approved application flow. | Route works without breaking existing auth/login routes. |  | Route exact path must match implementation decision. |
| FE-002 | Blocker | FE access behavior aligns with approved role direction and does not rely on FE-only hiding. | Direct URL access does not become the only protection; BE still enforces auth. |  | AC-PROJECT-10. |
| FE-003 | Major | Menu/label uses i18n keys instead of hard-coded text. | Project nav and page labels exist in `en`, `ja`, `vi`. |  | Locale parity. |
| FE-004 | Blocker | Project API calls go through `EDCAP_FE/src/lib/api.ts`. | No direct `fetch`/custom raw HTTP in Project page code. |  | Ticket rule. |
| FE-005 | Major | List view matches approved contract and default active behavior. | Customer name, alias, status, created/updated timestamps render correctly. |  | AC-PROJECT-1. |
| FE-006 | Major | Empty/loading/error states are implemented. | Users can distinguish no data, loading, and API failure safely. |  | AC-PROJECT-2, 12. |
| FE-007 | Major | Create form validation matches the approved Project contract. | Required/enum/Team selection errors are shown correctly. |  | AC-PROJECT-3, 4. |
| FE-008 | Major | Detail/edit preload includes Team assignments. | Edit/detail UI shows current Customer/Team/value selections correctly. |  | AC-PROJECT-6. |
| FE-009 | Blocker | Update flow does not send `version`. | Payload inspection confirms no optimistic-lock field is sent. |  | AC-PROJECT-7. |
| FE-010 | Blocker | Delete flow uses `PUT /api/v1/projects/{id}/delete`. | No `PATCH /delete` or physical-delete call path exists. |  | AC-PROJECT-9. |
| FE-011 | Major | Customer/team option loading matches approved source and contract. | Options are loaded from the agreed APIs and mapped consistently. |  | Context/spec alignment. |
| FE-012 | Major | API errors display localized, non-leaking messages. | Raw backend internals are not shown in the UI. |  | AC-PROJECT-12. |

## 4. BE/API Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| BE-001 | Major | List endpoint supports default active list and approved fields. | `GET /api/v1/projects` excludes deleted rows by default and returns expected page shape. |  | AC-PROJECT-1. |
| BE-002 | Major | Create endpoint uses `POST /api/v1/projects`. | Valid create returns expected success response/status. |  | AC-PROJECT-3. |
| BE-003 | Major | Detail endpoint uses `GET /api/v1/projects/{id}`. | Existing active Project detail includes current Team assignments. |  | AC-PROJECT-6. |
| BE-004 | Blocker | Update endpoint uses `PUT /api/v1/projects/{id}` without `version`. | No normal update path requires optimistic locking input. |  | AC-PROJECT-7. |
| BE-005 | Blocker | Soft delete endpoint uses `PUT /api/v1/projects/{id}/delete`. | Row is updated, not physically deleted. |  | AC-PROJECT-9. |
| BE-006 | Major | Request DTOs match approved contract. | `customerId`, `projectAlias`, optional `projectType`, optional `riskLevel`, optional `teamIds`, and no `version`. |  | Public contract lock. |
| BE-007 | Major | Validation returns stable client-safe errors. | Missing/blank/invalid inputs use standard 400-style handling and no internal leak. |  | AC-PROJECT-4. |
| BE-008 | Blocker | Duplicate alias handling returns intended conflict behavior. | Active duplicate under same Customer is rejected and deleted-row reuse remains allowed if spec permits. |  | AC-PROJECT-5. |
| BE-009 | Major | Create/update write logic is transactional. | Project row and Team bridge writes do not drift apart. |  | AC-PROJECT-3, 11. |
| BE-010 | Blocker | Team sync uses `tbl_project_team` as the source of truth. | Add/remove/update behavior reconciles to the submitted Team set only through the bridge table. |  | AC-PROJECT-11. |
| BE-011 | Major | Missing/deleted Project handling is consistent. | Detail/update/delete on unavailable Project returns the agreed not-found path. |  | AC-PROJECT-8. |
| BE-012 | Blocker | Backend authorization is enforced for every Project action. | Non-authorized direct API access is rejected even if FE hides buttons/routes. |  | AC-PROJECT-10. |
| BE-013 | Major | Standard `ErrorResponse` shape is preserved. | `timestamp/status/error/message/traceId` remain intact. |  | AC-PROJECT-12. |
| BE-014 | Major | Controller remains thin. | No controller business logic or infrastructure imports. |  | Architecture rule. |

## 5. DB/Migration Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DB-001 | Blocker | Existing `tbl_dim_project` is reused, not renamed/recreated. | Schema history remains intact. |  | Data safety. |
| DB-002 | Blocker | Existing `tbl_project_team` is reused for Team sync. | No alternate relation table or direct Team ownership is introduced. |  | Ticket-specific model. |
| DB-003 | Blocker | Implementation does not rely on `tbl_dim_team.project_id`. | V140 removal is respected in code and SQL. |  | High-risk regression. |
| DB-004 | Major | Existing migrations V4/V120/V140 are not edited. | Any schema change is a new additive migration only if needed. |  | Migration safety. |
| DB-005 | Blocker | V120 active uniqueness semantics are respected. | Alias uniqueness is scoped to active/non-deleted rows within a Customer. |  | AC-PROJECT-5. |
| DB-006 | Major | `project_type` and `risk_level` value handling matches the approved mixed semantics. | `project_type` stores trimmed free text or `null`; `risk_level` aligns to `severity_level`. |  | Ticket-specific mapping. |
| DB-007 | Major | Default active queries use deleted-state rules consistently. | Soft-deleted rows do not leak into default active views. |  | AC-PROJECT-1, 8, 9. |
| DB-008 | Blocker | Create/update persistence writes the intended Project data only once. | No duplicate row side effect or partial Team bridge write. |  | AC-PROJECT-3, 7, 11. |
| DB-009 | Blocker | Soft delete is implemented as an update. | Project row remains and deletion metadata changes. |  | AC-PROJECT-9. |
| DB-010 | Major | Detail/list query joins are correct for Customer/Team display data. | No stale or duplicated Team projection due to wrong joins. |  | AC-PROJECT-1, 6. |
| DB-011 | Major | Any new migration is justified and rollback-aware. | Reviewer can see why the migration exists and what rollback limits apply. |  | Release safety. |
| DB-012 | Blocker | Team sync reconciliation matches submitted active Team set. | Bridge rows correctly add, keep, deactivate, or delete according to final design. |  | AC-PROJECT-11. |

## 6. Security/Privacy Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| SEC-001 | Blocker | BE enforces Project authorization for each endpoint. | FE-only access control is not trusted as sole protection. |  | AC-PROJECT-10. |
| SEC-002 | Blocker | Unauthorized/unauthenticated statuses are correct. | Current security convention for 401/403 remains intact. |  | Review against actual auth flow. |
| SEC-003 | Major | Error responses do not leak stack traces or internals. | Client sees stable error fields only. |  | AC-PROJECT-12. |
| SEC-004 | Major | Logs do not expose secrets/tokens/unnecessary PII. | Only operationally necessary Project/Customer/Team identifiers are logged. |  | Privacy. |
| SEC-005 | Major | `tbl_dim_role` direction is used without inventing a new permission-role model. | Project auth stays inside approved ticket scope. |  | Ticket-specific rule. |
| SEC-006 | Major | FE and BE auth behavior agree. | Hidden UI and rejected API calls are consistent. |  | Defense in depth. |

## 7. Operation/Maintenance Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| OP-001 | Major | Existing traceId/error logging behavior is preserved. | Failures can be correlated between response and logs. |  | AC-PROJECT-12. |
| OP-002 | Major | Team-sync and delete flows are operationally diagnosable. | Logs and error handling make partial-failure triage possible. |  | High-impact flow. |
| OP-003 | Major | No out-of-scope audit-log storage is added silently. | Scope remains aligned to ticket and current conventions. |  | Scope control. |
| OP-004 | Major | Migration pre-check/post-check is documented if DB changes are added. | Operations know what to verify before/after rollout. |  | DB rollout safety. |
| OP-005 | Major | Monitoring points are documented. | Review notes mention 4xx/5xx spikes, duplicate conflicts, auth denials, Team-sync failures. |  | Release support. |

## 8. Test Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| TEST-001 | Major | Active default list is verified. | Authorized user sees active Projects by default. |  | AC-PROJECT-1. |
| TEST-002 | Major | Empty-state behavior is verified. | Empty list renders safely. |  | AC-PROJECT-2. |
| TEST-003 | Blocker | Create success is verified. | Valid payload persists Project and optional Team mappings. |  | AC-PROJECT-3. |
| TEST-004 | Major | Blank alias validation is verified. | Rejects blank/whitespace alias with no write. |  | AC-PROJECT-4. |
| TEST-005 | Blocker | Duplicate alias behavior is verified. | Active duplicate is rejected under V120 semantics. |  | AC-PROJECT-5. |
| TEST-006 | Major | Detail view/data projection is verified. | Customer and Team assignment data are correct. |  | AC-PROJECT-6. |
| TEST-007 | Blocker | Update without `version` is verified. | Valid update works and payload contains no `version`. |  | AC-PROJECT-7. |
| TEST-008 | Major | Missing/deleted Project behavior is verified. | Normal flow rejects unavailable Project IDs. |  | AC-PROJECT-8. |
| TEST-009 | Blocker | Soft delete behavior is verified. | `PUT /delete` updates state and row remains in DB. |  | AC-PROJECT-9. |
| TEST-010 | Blocker | Authorization behavior is verified. | Direct API and FE unauthorized scenarios are covered. |  | AC-PROJECT-10. |
| TEST-011 | Blocker | Team sync correctness is verified. | Submitted Team set matches persisted active bridge set. |  | AC-PROJECT-11. |
| TEST-012 | Major | Standard error envelope and traceId are verified. | Error responses keep the standard shape. |  | AC-PROJECT-12. |
| TEST-013 | Major | `project_type` / `riskLevel` mapping is verified. | `project_type` free-text trim-to-null and `riskLevel` severity validation are both consistent. |  | Ticket-specific mapping. |
| TEST-014 | Major | i18n rendering is verified. | `en`, `ja`, `vi` keys render correctly. |  | FE/i18n quality. |
| TEST-015 | Question | Migration verification strategy is recorded if DB changes exist. | DB verification method is explicit if a new migration is added. |  | Only if schema change occurs. |

## 9. Documentation/Traceability Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| DOC-001 | Major | `context.md` remains accurate after implementation. | Existing/new/non-existing methods/components are updated if the implementation differs. |  | Avoid stale context. |
| DOC-002 | Major | `impact-analysis.md` matches actual changed files and boundaries. | Direct/indirect impact sections reflect real implementation. |  | Phase 3 traceability. |
| DOC-003 | Major | `impl-plan.md` deviations remain documented. | No reintroduction of governance defaults without explicit rationale. |  | Contract control. |
| DOC-004 | Major | `test-results.md` records executed commands/tests. | Evidence is not left blank after implementation. |  | Review closure. |
| DOC-005 | Major | `report.md` is updated for final ticket closure. | Final risks, scope, and completion status are visible. |  | Handoff artifact. |
| DOC-006 | Major | Open issues and human-review items remain traceable. | Unresolved auth/migration/semantic concerns are documented, not hidden. |  | Review honesty. |

## 10. Release/Rollback Review

| ID | Severity | Review item | Expected | Result | Notes |
|---|---|---|---|---|---|
| REL-001 | Blocker | Contract deviations from governance defaults are documented in release/review artifacts. | Reviewers/operators can see no-`version` and `PUT /delete` are intentional. |  | High-risk drift point. |
| REL-002 | Blocker | Any schema rollout is additive and safe. | No destructive migration or edited migration history. |  | DB safety. |
| REL-003 | Major | Rollback does not assume destructive data loss. | App rollback is clear; DB rollback limits are documented if migration exists. |  | Release safety. |
| REL-004 | Major | No hidden dependency on stale Team schema remains. | Rollback/release notes mention bridge-table dependency where needed. |  | V140 dependency. |
| REL-005 | Major | Release notes mention new Project API/route/schema behavior if implemented. | Operators/reviewers know what changed. |  | Final handoff. |

## Severity Definition

| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released / merged because it can break core AC, security, data safety, or rollback safety. | Must fix before release, or explicitly stop. |
| Major | High probability of becoming a bug or operational issue. | Fix before release or record as accepted risk with owner/deadline. |
| Minor | Minor improvement, wording, maintainability, or polish. | Optional, but record decision if not fixed. |
| Question | Specification or implementation confirmation required. | Open/resolve issue before affected implementation/test is finalized. |
| False Positive | Incorrect review finding. | Record reason for rejection. |
| Accepted Risk | Known issue intentionally accepted. | Record impact, owner, follow-up, and deadline. |
