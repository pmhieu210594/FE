# Self Review

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-16  

## 1. Implementation Summary

Fill this section only with implementation facts that actually happened.

| Item | Content |
|---|---|
| Implemented summary | Added backend Project CRUD/service/repository/mapper/controller path, backend unit/controller tests, FE Project page/API helpers/route/nav wiring, and locale keys for `en`/`ja`/`vi`. |
| Not implemented | No new DB migration, no FE automated tests, no browser/manual runtime smoke against a running app. |
| Deferred items | Independent review of auth granularity against `tbl_dim_role`, FE build validation after unrelated backup/conflict files are cleaned, and end-to-end runtime verification. |
| Scope deviations | None against the approved Project contract. |
| Final implementation scope | Phase 5 implementation stayed within Project CRUD + Team bridge sync + FE route/page wiring + review evidence updates. |

Required summary checklist:

- [x] Project list/default active behavior implemented
- [x] Project detail implemented
- [x] Project create/update implemented
- [x] Project soft delete implemented with `PUT /api/v1/projects/{id}/delete`
- [x] No `version` field introduced into Project request contract
- [x] Team sync implemented through `tbl_project_team`
- [x] `project_type` is free-text nullable and `riskLevel` follows `severity_level`
- [ ] Backend authorization aligned to `tbl_dim_role`
- [x] Standard `ErrorResponse` and traceId behavior preserved
- [x] Any migration added is additive only
- [x] No physical delete / no out-of-scope auth redesign / no restore-import-export-batch work

## 2. Specification/AC Matching

Use actual execution evidence only; do not mark `PASS` from code reading alone without noting the evidence type.

| AC ID | status | evidence |
|---|---|---|
| AC-PROJECT-1 | PASS | `ProjectServiceTest.search_requiresAdminAndDefaultsToActiveFilter`, `ProjectControllerTest.list_returnsPagedProjects` |
| AC-PROJECT-2 | PARTIAL | FE empty-state code added in `ProjectPage.tsx`; no automated FE or browser execution evidence yet |
| AC-PROJECT-3 | PASS | `ProjectServiceTest.create_trimsValidatesAndSyncsTeams`, `ProjectControllerTest.create_returnsCreatedProjectWithoutVersion` |
| AC-PROJECT-4 | PASS | `ProjectServiceTest.create_rejectsMissingCustomerDuplicateAliasAndInvalidTeam` covers required-field rejection |
| AC-PROJECT-5 | PASS | `ProjectServiceTest.create_rejectsMissingCustomerDuplicateAliasAndInvalidTeam` covers duplicate alias rejection |
| AC-PROJECT-6 | PASS | `ProjectServiceTest.get_returnsActiveProjectWithAssignments`, `ProjectControllerTest.get_returnsDetailWithTeamAssignments` |
| AC-PROJECT-7 | PASS | `ProjectServiceTest.update_reconcilesTeamAssignmentsWithoutVersion`, `ProjectControllerTest.update_usesPutWithoutVersion` |
| AC-PROJECT-8 | PASS | `ProjectServiceTest.getAndDeleteRejectDeletedProjectAsUnavailable`, `ProjectControllerTest.exceptions_mapToExpectedStatus` |
| AC-PROJECT-9 | PASS | `ProjectServiceTest.softDelete_marksProjectDeleted`, `ProjectControllerTest.softDelete_usesPutDeleteEndpoint` |
| AC-PROJECT-10 | PARTIAL | Backend ADMIN-only enforcement covered in `ProjectServiceTest.nonAdminIsDeniedForEveryEntryPoint`; exact `tbl_dim_role` mapping remains human-review item |
| AC-PROJECT-11 | PASS | `ProjectServiceTest.create_trimsValidatesAndSyncsTeams`, `ProjectServiceTest.update_reconcilesTeamAssignmentsWithoutVersion` |
| AC-PROJECT-12 | PASS | `ProjectControllerTest.exceptions_mapToExpectedStatus`; FE displays `ApiError` messages through shared API client |

## 3. List of Changed Files

List only files actually changed during implementation or review-result updates.

| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/ProjectService.java` | Added Project business logic and transaction boundaries | Backend CRUD implementation |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ProjectRepositoryPort.java` | Added Project persistence port methods and compatibility overload | Persistence contract |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Project.java` | Added Project governance fields while preserving existing connector compatibility fields | Domain model |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/ProjectTeamAssignment.java` | Added bridge-table assignment model | Team sync support |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/ProjectMapper.java` | Added mapper contract | Persistence implementation |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/ProjectRepositoryAdapter.java` | Added repository adapter methods | Persistence implementation |
| `EDCAP_BE/src/main/resources/mapper/ProjectMapper.xml` | Added Project SQL for list/detail/create/update/delete/team sync | DB access |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ProjectDtos.java` | Added request/response DTOs without `version` | API contract |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ProjectController.java` | Added Project endpoints including `PUT /delete` | API surface |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ProjectServiceTest.java` | Added Project service tests | Backend verification |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/web/rest/ProjectControllerTest.java` | Added controller/exception mapping tests | Backend verification |
| `EDCAP_FE/src/lib/api.ts` | Added typed Project endpoints and types | FE contract |
| `EDCAP_FE/src/pages/ProjectPage.tsx` | Added Project list/detail/create/edit/delete UI flow | FE implementation |
| `EDCAP_FE/src/App.tsx` | Wired Project admin route | FE route |
| `EDCAP_FE/src/components/Layout.tsx` | Added Project navigation entry | FE navigation |
| `EDCAP_FE/public/locales/en/locale.json` | Added Project locale keys | FE i18n |
| `EDCAP_FE/public/locales/ja/locale.json` | Added Project locale keys | FE i18n |
| `EDCAP_FE/public/locales/vi/locale.json` | Added Project locale keys | FE i18n |
| `docs/changes/PROJECT/self-review.md` | Filled with actual Phase 5 evidence | Review artifact |
| `docs/changes/PROJECT/test-results.md` | Filled with executed test evidence and blockers | Review artifact |
| `docs/changes/PROJECT/report.md` | Filled with implementation summary and handoff state | Final reporting |

## 4. Run Command and Results

Record every command that was actually run. Use `Not run` explicitly instead of leaving gaps.

| command | result | note |
|---|---|---|
| `cd EDCAP_BE && mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | PASS | Targeted backend tests for Project service/controller passed. |
| `cd EDCAP_FE && npm run build` | FAIL | Blocked by unrelated pre-existing file `src/components/Layout_BACKUP_1565.tsx` containing merge-conflict markers. |
| `Get-Content locale.json -Raw \| ConvertFrom-Json` for `en`/`ja`/`vi` | FAIL | Existing duplicate keys `classification` and `Classification` prevent strict PowerShell JSON object conversion; this predates Project keys and should be cleaned separately. |
| Manual API smoke / curl / Postman / browser checks | Not run | No app runtime started in this turn. |

## 5. Self-Check using Review Checklist

Use `docs/changes/PROJECT/review-checklist.md` as the source checklist.

| checklist area | result | note |
|---|---|---|
| Specification / AC Matching | PASS with partial items | FE runtime-only items remain partial because FE build/test execution is blocked outside ticket scope. |
| General System Review | PASS with question | Contract stays no-`version`/`PUT /delete`; auth granularity remains a review question. |
| FE Review | Accepted Risk | Code added, but FE build/test proof is blocked by unrelated backup/conflict files. |
| BE/API Review | PASS | Targeted Project endpoints, DTOs, and exception mapping are covered by passing tests. |
| DB/Migration Review | PASS with question | No migration added; bridge-table sync implemented, but no live DB integration test ran. |
| Security/Privacy Review | Question | Backend denies non-admin callers, but exact `tbl_dim_role` enforcement mapping needs human confirmation. |
| Operation/Maintenance Review | PASS | Standard error path preserved; no out-of-scope operational change added. |
| Test Review | PASS with partial items | Backend targeted tests passed; FE/runtime coverage incomplete. |
| Documentation/Traceability Review | PASS | Phase 5 evidence docs updated. |
| Release/Rollback Review | PASS with accepted risk | No DB rollout needed; FE release confidence depends on cleaning unrelated FE conflict files first. |

| Severity | Count | Notes |
|---|---:|---|
| Blocker findings remaining | 0 | No Project-specific blocker remained in backend implementation scope. |
| Major findings remaining | 1 | FE build/test cannot currently be proven because of unrelated backup/conflict files in FE workspace. |
| Minor findings remaining | 0 |  |
| Question findings remaining | 1 | Exact auth-to-`tbl_dim_role` mapping is still a human-review item. |
| Accepted risks | 2 | FE verification gap and auth-granularity interpretation. |

## 6. Test Plan Corresponding Status

Map actual verification status back to `test-plan.md`, `blackbox-testcases.md`, and `test-results.md`.

| Test area | Planned? | Executed? | Result | Evidence / command | Notes |
|---|---|---|---|---|---|
| Active default Project list | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-1 |
| UI default page size `25` | Yes | No | PARTIAL | Ticket docs and FE code expect `25`, but no FE runtime verification was executed in this turn | Pagination contract/UI expectation |
| Empty-state behavior | Yes | No | PARTIAL | Code-only in `ProjectPage.tsx` | AC-PROJECT-2 |
| Create valid Project | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-3 |
| Blank alias validation | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-4 |
| Duplicate alias conflict | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-5 |
| Detail with Team assignments | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-6 |
| Update without `version` | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-7 |
| Missing/deleted Project handling | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-8 |
| Soft delete with `PUT /delete` | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-9 |
| Authorization behavior | Yes | Yes | PARTIAL | Backend non-admin rejection tested; final role-table semantics not integration-tested | AC-PROJECT-10 |
| Team sync correctness | Yes | Yes | PASS | `mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | AC-PROJECT-11 |
| Standard error envelope and traceId | Yes | Yes | PASS | `ProjectControllerTest.exceptions_mapToExpectedStatus` | AC-PROJECT-12 |
| `project_type` free-text / `riskLevel` severity mapping | Yes | Yes | PASS | Updated Project service/controller tests after contract change | Ticket-specific rule |
| i18n rendering in `en` / `ja` / `vi` | Yes | No | PARTIAL | Keys added; FE runtime not executed, strict PowerShell JSON parse blocked by existing duplicate keys | FE/i18n quality |
| Migration verification if schema changed | No | N/A | N/A | No migration added | Only if new migration exists |

## 7. Bugs Found and Resolved

Record real implementation defects found during the work. If none, write `None found during this turn`.

| bug | cause | fix | test |
|---|---|---|---|
| Existing connector compile coupling to `Project` model | Legacy code expected `Long id`/`projectKey` shape on `Project` | Preserved compatibility fields in `Project` and added safe default overload in `ProjectRepositoryPort` | Backend targeted tests passed after compatibility fix |
| `ProjectServiceTest.create_trimsValidatesAndSyncsTeams` expected one bridge insert | Sync deduplicated input but still needed two inserts for two desired Team IDs | Updated test expectation to `times(2)` | Backend targeted tests passed |
| FE detail fallback text had mojibake characters | Non-ASCII fallback glyph was saved with broken encoding | Replaced fallback with ASCII `-` | Static code review in `ProjectPage.tsx` |

## 8. Unprocessed / Pending / Accepted Risk

Every accepted risk should have an owner and a review point. If no deadline is known yet, say `TBD`.

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| FE build/test verification gap | Existing unrelated backup/conflict files break `npm run build` before Project page can be fully typechecked in app context | Medium; FE release confidence is reduced until workspace cleanup | Human reviewer / FE owner | TBD |
| Project auth mapped to current ADMIN gate, not proven against `tbl_dim_role` data model | Current source exposes coarse runtime role model more clearly than table-driven Project action mapping | Medium; may need alignment change after human review | Tech lead / security reviewer | TBD |

## 9. AI-generated predictions

Record any AI inference that was used during implementation and was not directly confirmed by source/spec/human decision.

| ID | AI assumption / inference | Basis | Risk | Need human review? |
|---|---|---|---|---|
| AIP-001 | Project action authorization is implemented as ADMIN-only for now. | Current runtime code clearly exposes `AppUser.Role.ADMIN/EDITOR/VIEWER`, while Project-specific `tbl_dim_role` action mapping was not already implemented. | Medium | Yes |
| AIP-002 | No new migration is required for Phase 5 implementation. | Existing `tbl_dim_project` + `tbl_project_team` schema in V4/V120/V140 was sufficient for coded contract. | Low | No |
| AIP-003 | Customer/team option loading can reuse existing active list endpoints. | FE patterns in existing governance pages and current endpoints support this reuse. | Low | No |

Suggested areas to record if they occur:

- chosen FE route/path or page/component naming
- exact DTO field names not pre-existing in source
- exact status code/message-key mapping where source did not fully lock it
- no-migration assumption that was later validated by implementation

## 10. Items reviewed by humans

Use this section for high-risk human review requests after implementation.

| ID | area | request / decision | status | note |
|---|---|---|---|---|
| HR-PROJECT-001 | Authorization | Review actual Project action enforcement against `tbl_dim_role` expectations. | Pending | Highest-risk implementation detail. |
| HR-PROJECT-002 | Team sync | Review bridge-table sync correctness for add/remove/update flows. | Pending | Validate `tbl_project_team` behavior. |
| HR-PROJECT-003 | Contract | Review that no `version` leaked into FE/BE contract and delete uses `PUT /delete`. | Pending | Guard against governance drift. |
| HR-PROJECT-004 | Semantics | Review `project_type` free-text nullable behavior and confirm `riskLevel` remains the only severity-backed field. | Pending | Guard against stale rule drift. |
| HR-PROJECT-005 | Release/rollback | Review any migration and rollout/rollback limitations if schema changed. | Pending | Required only if DB change exists. |

## 11. Final Self-Verdict

- NEEDS_UPDATE
