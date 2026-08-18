# Self Review

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## 1. Implementation Summary

- Implemented Team Management as an ADMIN-only CRUD screen with Team detail and Team-Member-Role management.
- Added BE domain, repository port/adapter, mapper, service, controller, DTOs, and Flyway migration support.
- Added FE route, navigation entry, typed API helpers, Team page, and locale entries for `en`, `ja`, and `vi`.
- Kept the implementation compact and aligned with the existing Customer/Organization-style patterns.

## 2. Specification/AC Matching

| AC ID | status | evidence |
|---|---|---|
| AC-TEAM-1 | Implemented | `RequireAdmin` route guard in `EDCAP_FE/src/App.tsx`, `TeamService.requireAdmin`, and controller integration test. |
| AC-TEAM-2 | Implemented | `GET /api/v1/teams` keyword search in `TeamService`, `TeamMapper.xml`, and `TeamPage`. |
| AC-TEAM-3 | Implemented | `POST /api/v1/teams` returns `201 Created` in `TeamController`; covered by integration test. |
| AC-TEAM-4 | Implemented | `teamCode` is editable in the update form and handled by `TeamService#update`. |
| AC-TEAM-5 | Implemented | Active Team Code duplicate check in service plus unique active index in migration. |
| AC-TEAM-6 | Implemented | Team detail returns active members plus member and role lookup options. |
| AC-TEAM-7 | Implemented | `PUT /api/v1/teams/{teamId}` update flow and controller integration test. |
| AC-TEAM-8 | Implemented | `PATCH /api/v1/teams/{teamId}/delete` soft delete flow and tests. |
| AC-TEAM-9 | Implemented | Soft delete cascades active memberships in `TeamService#softDelete` and mapper SQL. |
| AC-TEAM-10 | Implemented | Add-member flow in `TeamService#addMember`, Team detail member drawer, and integration test. |
| AC-TEAM-11 | Implemented | Role required and role existence checks are enforced in service. |
| AC-TEAM-12 | Implemented | Same member can join different Teams because uniqueness is scoped by `team_id`. |
| AC-TEAM-13 | Implemented | Unique active `(team_id, member_key)` index plus service duplicate check. |
| AC-TEAM-14 | Implemented | Duplicate active member is rejected with `Pages.Team.Member.Duplicate`. |
| AC-TEAM-15 | Implemented | Update member role updates the existing row only; no duplicate membership is created. |
| AC-TEAM-16 | Implemented | Remove member inactivates the membership only; no hard delete path. |
| AC-TEAM-17 | Implemented | No Team-Project assignment UI/API/mapper code was added. |
| AC-TEAM-18 | Implemented | `en/vi/ja` locale keys were added and FE build/test passed. |
| AC-TEAM-19 | Implemented | No Team-specific audit table/module was added. |
| AC-TEAM-20 | Implemented | No legacy migration/backfill from `tbl_dim_member_pseudonym.team_id/role_id` was added. |

## 3. List of Changed Files

### 3.1 Backend

| file | summary |
|---|---|
| `EDCAP_BE/src/main/resources/db/migration/V113__team_management.sql` | Add Team metadata fields, drop `project_id`, create `tbl_team_member`, and add active-scope indexes. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Team.java` | Team domain model. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMember.java` | Team-Member domain model. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamMemberOption.java` | Lookup projection for member selection. |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/TeamRoleOption.java` | Lookup projection for role selection. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TeamRepositoryPort.java` | Persistence port for Team and TeamMember flows. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/TeamRepositoryAdapter.java` | Port adapter implementation. |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/TeamMapper.java` | MyBatis mapper contract. |
| `EDCAP_BE/src/main/resources/mapper/TeamMapper.xml` | SQL for Team CRUD, membership, and lookups. |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/TeamService.java` | Business rules, authorization, and transactions. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/TeamDtos.java` | Request/response DTOs. |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TeamController.java` | REST endpoints. |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/TeamServiceTest.java` | Service unit coverage. |
| `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/TeamControllerIntegrationTest.java` | Controller/API smoke coverage. |

### 3.2 Frontend

| file | summary |
|---|---|
| `EDCAP_FE/src/lib/api.ts` | Team API types and typed endpoint helpers. |
| `EDCAP_FE/src/pages/TeamPage.tsx` | Team list/detail/member management screen. |
| `EDCAP_FE/src/App.tsx` | Add `/:lang/teams` ADMIN route. |
| `EDCAP_FE/src/components/Layout.tsx` | Add Teams navigation item. |
| `EDCAP_FE/public/locales/en/locale.json` | Team i18n keys. |
| `EDCAP_FE/public/locales/vi/locale.json` | Team i18n keys. |
| `EDCAP_FE/public/locales/ja/locale.json` | Team i18n keys. |

## 4. Runn Command and Results

| command | purpose | result | note |
|---|---|---|---|
| `mvn test -DskipITs` | BE compile + unit/integration test suite | PASS | Includes `TeamServiceTest` and `TeamControllerIntegrationTest`; 81 tests passed. |
| `npm run build` | FE typecheck + production build | PASS | Team page compiled and built successfully. |
| `npm test -- --run` | FE Vitest suite | PASS | Existing FE tests passed; no regressions found. |
| Flyway runtime migration command | DB migration verification | NOT_RUN | Migration file was added, but no live DB apply was executed in this turn. |

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| Specification / AC | PASS | Implementation stays within the TEAM spec-pack scope. |
| General System | PASS | Trim/validation, pagination, locale JSON, and layered architecture were kept consistent. |
| FE | PASS | Route, menu, API helper, page, locale changes, and build/test verification are in place. |
| BE / API | PASS | Service owns rules; controller stays thin; error mapping follows the existing convention. |
| DB / Migration | NEEDS_HUMAN_REVIEW | Migration is added, but runtime apply was not executed in this environment. |
| Security / Privacy | PASS | ADMIN-only behavior is enforced in FE and BE; no secrets or unnecessary member data are exposed. |
| Operation / Maintenance | PASS | Soft delete is transactional; no audit module was added. |
| Test | PASS | BE and FE build/test commands passed. |
| Documentation / Traceability | PASS | `test-results.md` and `report.md` were updated to reflect implementation status. |
| Release / Rollback | NEEDS_HUMAN_REVIEW | Migration exists; operational rollout/rollback should be reviewed before deployment. |

## 6. Test Plan Corresponding Status

| test area | status | evidence | note |
|---|---|---|---|
| Backend unit tests | PASS | `mvn test -DskipITs` | `TeamServiceTest` passed. |
| Backend controller/API tests | PASS | `TeamControllerIntegrationTest` + `mvn test -DskipITs` | Route/status/error mapping covered. |
| Backend migration/runtime apply | NEEDS_HUMAN_REVIEW | `V113__team_management.sql` | Live DB apply was not executed in this turn. |
| Frontend unit/component tests | PASS | `npm test -- --run` | Existing FE suite passed; Team page compiled in build. |
| Frontend build/typecheck | PASS | `npm run build` | Team page and locale JSON compiled successfully. |
| Black-box/manual review | NEEDS_HUMAN_REVIEW | Not executed in this turn | Ready for independent/human review. |

## 7. Bugs Found and Resolved

| bug | cause | fix | test | status |
|---|---|---|---|---|
| FE build failed on `ColumnsType` import | Imported `ColumnsType` from root `antd` | Switched to `antd/es/table` type import | `npm run build` | RESOLVED |
| Team update could have exposed a delete-like status path | Status change on update could bypass cascade delete semantics | Locked update to basic info only; delete stays on dedicated endpoint | `TeamServiceTest`, `TeamControllerIntegrationTest` | RESOLVED |
| Legacy `team_code` backfill could have collided on old rows | Existing teams could have duplicated names | Backfill now uses name prefix + `team_id` suffix | Migration review | RESOLVED |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | status |
|---|---|---|---|---|
| DB migration apply not executed | No target DB migration command was run in this turn | Need a real DB to validate `V113__team_management.sql` end-to-end | BE/Data | Open for human review |
| No dedicated FE `TeamPage.test.tsx` | Existing FE suite passed, but Team-specific component test was not added in this turn | Reviewers should inspect Team UI manually | FE | Open for human review |

## 9. AI-generated predictions

## 10. Items reviewed by humans

## 11. Final Self-Verdict

- `NEEDS_HUMAN_REVIEW`

Reason: Implementation and local build/test verification are complete, but DB migration runtime apply and a dedicated Team-specific FE component test remain for follow-up human review.
