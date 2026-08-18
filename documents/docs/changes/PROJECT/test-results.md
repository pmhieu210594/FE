# Test Results

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Record the authoritative Phase 8 execution evidence for the PROJECT ticket. This file distinguishes executed proof from code-reading-only conclusions and preserves unresolved verification gaps honestly.

## 2. Evidence-source Note

- `Executed evidence` means a command or test run was recorded in the workspace evidence.
- `Artifact evidence` means the conclusion comes from an existing reviewed artifact such as `self-review.md`, `review-checklist.md`, `blackbox-testcases.md`, or `test-plan.md`.
- `Code-reading only` is not treated as a passing test result in this file.
- No local PROJECT-specific PR comment artifact or hosted CI-result artifact was found in the workspace on 2026-06-17.

## 3. Execution Summary

| Item | Result | Evidence source | Note |
|---|---|---|---|
| Backend targeted Project tests | PASS | Executed evidence | `ProjectServiceTest` and `ProjectControllerTest` passed via targeted Maven run |
| Frontend targeted Project component tests | PASS | Executed evidence | `ProjectPage.test.tsx` passed with 8 tests |
| Frontend targeted Project E2E tests | PASS | Executed evidence | `project.spec.ts` passed with 6 tests after Playwright browser install |
| Playwright browser install | PASS | Executed evidence | Browser binaries downloaded successfully after initial missing-executable blocker |
| Frontend build verification | FAIL | Executed evidence | Blocked by unrelated pre-existing FE backup/conflict file `src/components/Layout_BACKUP_1565.tsx` |
| Locale JSON strict PowerShell parse | FAIL | Executed evidence | Existing duplicate keys `classification` and `Classification` prevent strict object conversion |
| Manual runtime/browser checks | Not run | Executed evidence | No app runtime started in the recorded evidence |
| PROJECT-specific PR comment evidence | Not found locally | Artifact evidence | Do not imply external PR review proof exists |
| PROJECT-specific hosted CI-result evidence | Not found locally | Artifact evidence | Do not imply hosted CI proof exists |

## 4. Command Log

| Command | Result | Evidence |
|---|---|---|
| `cd EDCAP_BE && mvn -q "-Dtest=ProjectServiceTest,ProjectControllerTest" test` | PASS | Service/controller tests executed successfully |
| `cd EDCAP_FE && npx vitest run "src/__ tests __/project/ProjectPage.test.tsx"` | PASS | 1 file passed, 8 tests passed |
| `cd EDCAP_FE && npx playwright install` | PASS | Installed missing Playwright browser binaries |
| `cd EDCAP_FE && npx playwright test e2e_tests/tests/project/project.spec.ts` | FAIL | First run blocked because Playwright browsers were not installed |
| `cd EDCAP_FE && npx playwright test e2e_tests/tests/project/project.spec.ts` | PASS | Second run passed all 6 Project E2E tests |
| `cd EDCAP_FE && npm run build` | FAIL | Build stops on merge-conflict markers in unrelated `src/components/Layout_BACKUP_1565.tsx` |
| `Get-Content EDCAP_FE/public/locales/en/locale.json -Raw \| ConvertFrom-Json \| Out-Null` | FAIL | Duplicate keys `classification` and `Classification` |
| `Get-Content EDCAP_FE/public/locales/ja/locale.json -Raw \| ConvertFrom-Json \| Out-Null` | FAIL | Duplicate keys `classification` and `Classification` |
| `Get-Content EDCAP_FE/public/locales/vi/locale.json -Raw \| ConvertFrom-Json \| Out-Null` | FAIL | Duplicate keys `classification` and `Classification` |

## 5. AC Result Matrix

| AC ID | Status | Evidence | Evidence type | Note |
|---|---|---|---|---|
| AC-PROJECT-1 | PASS | `ProjectServiceTest.search_requiresAdminAndDefaultsToActiveFilter`; `ProjectControllerTest.list_returnsPagedProjects`; `project.spec.ts` create/list scenario | Executed evidence | Backend and E2E proof |
| AC-PROJECT-2 | PASS | `project.spec.ts` search/empty-state scenario | Executed evidence | Playwright execution proved safe empty-state path |
| AC-PROJECT-3 | PASS | `ProjectServiceTest.create_trimsValidatesAndSyncsTeams`; `ProjectControllerTest.create_returnsCreatedProjectWithoutVersion`; `project.spec.ts` create scenario | Executed evidence | Covers no-`version` create contract |
| AC-PROJECT-4 | PASS | `ProjectServiceTest.create_rejectsMissingCustomerDuplicateAliasAndInvalidTeam` | Executed evidence | Covers blank alias rejection path |
| AC-PROJECT-5 | PASS | `ProjectServiceTest.create_rejectsMissingCustomerDuplicateAliasAndInvalidTeam`; `project.spec.ts` duplicate scenario | Executed evidence | Duplicate alias rejection covered in BE and E2E |
| AC-PROJECT-6 | PASS | `ProjectServiceTest.get_returnsActiveProjectWithAssignments`; `ProjectControllerTest.get_returnsDetailWithTeamAssignments`; `project.spec.ts` detail scenario | Executed evidence | Detail screen proved end-to-end |
| AC-PROJECT-7 | PASS | `ProjectServiceTest.update_reconcilesTeamAssignmentsWithoutVersion`; `ProjectControllerTest.update_usesPutWithoutVersion`; `project.spec.ts` edit scenario | Executed evidence | No `version` in update contract |
| AC-PROJECT-8 | PASS | `ProjectServiceTest.getAndDeleteRejectDeletedProjectAsUnavailable`; `ProjectControllerTest.exceptions_mapToExpectedStatus`; `project.spec.ts` delete/deleted-list scenario | Executed evidence | Normal-flow unavailability plus deleted-view behavior |
| AC-PROJECT-9 | PASS | `ProjectServiceTest.softDelete_marksProjectDeleted`; `ProjectControllerTest.softDelete_usesPutDeleteEndpoint`; `project.spec.ts` delete scenario | Executed evidence | Soft delete route locked to `PUT /delete` |
| AC-PROJECT-10 | PARTIAL | `ProjectServiceTest.nonAdminIsDeniedForEveryEntryPoint`; `ProjectControllerTest.exceptions_mapToExpectedStatus`; `project.spec.ts` access-guard scenario | Executed evidence | FE guard and coarse backend denial are proved; full `tbl_dim_role` semantics are still not integration-tested |
| AC-PROJECT-11 | PASS | `ProjectServiceTest.create_trimsValidatesAndSyncsTeams`; `ProjectServiceTest.update_reconcilesTeamAssignmentsWithoutVersion`; `ProjectPage.test.tsx` add/remove team behavior | Executed evidence | Dedicated E2E persistence proof stayed optional because of selector stability tradeoff |
| AC-PROJECT-12 | PASS | `ProjectControllerTest.exceptions_mapToExpectedStatus` | Executed evidence | Standard error shape covered at controller advice level |

## 6. Black-box Coverage Cross-check

| Coverage area | Status | Evidence | Note |
|---|---|---|---|
| AC-to-black-box mapping | PASS | `blackbox-testcases.md` AC coverage matrix | No AC gap is recorded |
| Normal flow coverage | PASS | `BB-PROJECT-001`, `005`, `006`, `012`, `013` | Covered in black-box suite |
| Error/negative coverage | PASS | `BB-PROJECT-007`, `009`, `016`, `020` | Covered in black-box suite |
| Boundary coverage | PASS | `BB-PROJECT-008`, `010`, `011`, `014`, `015` | Covered in black-box suite |
| Permission coverage | PASS | `BB-PROJECT-019` | Designed and partially runtime-proved |
| Operation/state-transition coverage | PASS | `BB-PROJECT-002`, `017`, `018` | Designed and delete flow runtime-proved |
| Audit/error-envelope coverage | PASS | `BB-PROJECT-020` | Designed and controller-level proof exists |

## 7. Defects / Findings

| ID | Severity | Summary | Status | Note |
|---|---|---|---|---|
| TR-PROJECT-001 | Major | FE build cannot currently be completed because of unrelated backup/conflict file in FE workspace. | Open outside ticket | Project code should be revalidated after workspace cleanup. |
| TR-PROJECT-002 | Major | Strict locale JSON parse fails because existing locale files contain duplicate keys. | Open outside ticket | Not introduced by Project keys alone, but blocks strict JSON-object validation. |
| TR-PROJECT-003 | Question | Auth enforcement is currently proven at coarse ADMIN-only level, not full `tbl_dim_role` semantics. | Pending human review | Needs confirmation against intended auth model. |
| TR-PROJECT-004 | Major | Old `project_type` severity-based contract had previously drifted across artifacts. | Updated in this ticket evidence set | Evidence docs were revised to reflect free-text nullable behavior. |
| TR-PROJECT-005 | Major | Project UI default page size must stay aligned to the approved `25/page` ticket behavior. | Updated in this ticket evidence set | Ticket docs were revised to reflect the approved UI pagination default. |
| TR-PROJECT-006 | Info | Phase 6 added a dedicated Project Playwright spec modeled after Team E2E. | Closed | Runtime result is now recorded here. |
| TR-PROJECT-007 | Info | First Playwright run failed due to missing browser binaries, then passed after `npx playwright install`. | Resolved | Environment blocker removed. |

## 8. Deferred / Not Executed

| Area | Reason | Next action |
|---|---|---|
| FE build in full app context | Unrelated workspace conflict files stop frontend build before Project route can be validated cleanly in app context | Clean FE backup/conflict files, then rerun build and FE tests |
| Manual browser verification | No runtime started in the recorded evidence | Run app and exercise Project list/detail/create/edit/delete manually if release confidence needs it |
| DB integration verification | No new migration and no running DB integration scenario executed | Add targeted integration test or manual DB verification against a running environment if dispute arises |
| Full auth-to-role-table verification | Requires human confirmation or additional runtime evidence | Review Project authorization against intended `tbl_dim_role` semantics |
| Hosted PR / CI evidence | No local artifact exists | Record absence explicitly in final report rather than inventing proof |

## 9. Phase 8 Test Verdict

- Test evidence is strong for backend behavior, FE component behavior, and targeted Project E2E behavior.
- Release confidence is reduced by two non-Project-local blockers:
  - FE build is blocked by unrelated workspace conflict files
  - strict locale JSON-object parsing fails because of pre-existing duplicate keys
- Authorization remains `PARTIAL` at the semantic level because the recorded evidence proves denial behavior but not full `tbl_dim_role` mapping.
