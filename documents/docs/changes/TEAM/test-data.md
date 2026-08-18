# Test Data

**Ticket ID**: TEAM  
**Create date**: 2026-06-15  
**Author**: nk_trung  
**Update date**: 2026-06-15  

## Data Policy

- Use synthetic data only.
- Do not use production member/customer/organization/project data.
- Do not store secrets, tokens, external user hashes, access tokens, or sensitive PII in artifacts.
- Use deterministic prefixes so data is easy to find and cleanup: `TEAM_BB_`, `MEMBER_BB_`, `ROLE_BB_`, `USER_BB_`.
- Test data must be repeatable. If repeated execution is required, append a safe run suffix such as date/time or test run ID.
- Destructive tests such as delete Team and remove member must use isolated synthetic records.
- Do not run cleanup SQL against shared/prod DB. Cleanup must be limited to lower/local test environments.

## Master Data

| name | value | purpose |
|---|---|---|
| Role Developer | Existing or seed active role `Developer` | Add member normal case and role display. |
| Role QA | Existing or seed active role `QA` | Update member role from Developer to QA. |
| Role Manager | Existing or seed active role `Manager` | Additional role selector coverage and multi-member cases. |
| Inactive/Invalid Role | Inactive role or non-existing role ID/key | Negative role validation case. |
| Member Alpha | Existing or seed `MEMBER_BB_ALPHA` / `member_alpha_bb` | Add member, duplicate same Team, multi-Team membership. |
| Member Beta | Existing or seed `MEMBER_BB_BETA` / `member_beta_bb` | Multiple member list and delete Team membership cascade. |
| Member Gamma | Existing or seed `MEMBER_BB_GAMMA` / `member_gamma_bb` | Empty-to-non-empty member list and remove/re-add behavior. |
| Invalid Member | Non-existing or inactive member ID/key | Negative add-member case. |

## User / Permission Data

| user | role | permission | purpose |
|---|---|---|---|
| `USER_BB_TEAM_ADMIN` | ADMIN | Team screen/API allowed | Positive list/create/update/delete/member operations. |
| `USER_BB_TEAM_VIEWER` | VIEWER or non-ADMIN role | Team screen/API denied | Non-ADMIN route/API permission check. |
| `USER_BB_TEAM_EDITOR` | EDITOR or non-ADMIN role | Team screen/API denied | Additional non-ADMIN role check if available. |
| anonymous | none | Team screen/API denied | Unauthenticated access/session expired cases. |

## Organization / Customer / Project Preconditions

| data | requirement | purpose |
|---|---|---|
| Existing active Organization | Required only if Team creation currently needs upstream organization context. | Create Team precondition if UI/API depends on organization. |
| Existing active Customer | Required only if Team creation currently needs customer context. | Keep Team test data valid in integrated environment. |
| Existing active Project | Not used for Team-to-Project assignment in this phase. | Confirm AC-TEAM-17 does not introduce assignment operation. |

## Normal Data

| ID | data | purpose |
|---|---|---|
| TD-TEAM-N-001 | `teamCode=TEAM_BB_ALPHA`, `teamName=Team Blackbox Alpha`, `description=Alpha normal Team` | List, search, detail, update base flow. |
| TD-TEAM-N-002 | `teamCode=TEAM_BB_BETA`, `teamName=Team Blackbox Beta`, `description=Beta normal Team` | Duplicate update target and multi-Team membership. |
| TD-TEAM-N-003 | `teamCode=TEAM_BB_GAMMA`, `teamName=Team Blackbox Gamma`, empty description | Empty/optional description and empty member list. |
| TD-TEAM-N-004 | `teamCode=TEAM_BB_DELETE`, `teamName=Team Blackbox Delete` | Soft delete and membership cascade tests. |
| TD-TEAM-N-005 | Team Alpha + Member Alpha + Role Developer | Add existing member normal case. |
| TD-TEAM-N-006 | Team Beta + Member Alpha + Role QA | Same member can belong to multiple Teams. |
| TD-TEAM-N-007 | Team Delete + Member Alpha + Role Developer + Member Beta + Role Manager | Delete Team inactivates multiple active memberships. |
| TD-TEAM-N-008 | Team Gamma with no memberships | Empty member list case. |

## Error Data

| ID | data | expected error / behavior |
|---|---|---|
| TD-TEAM-E-001 | Blank Team Code | Required validation error; Team is not created/updated. |
| TD-TEAM-E-002 | Whitespace-only Team Code | Required/trim validation error; Team is not created/updated. |
| TD-TEAM-E-003 | Blank Team Name | Required validation error; Team is not created/updated. |
| TD-TEAM-E-004 | Whitespace-only Team Name | Required/trim validation error; Team is not created/updated. |
| TD-TEAM-E-005 | Duplicate active `teamCode=TEAM_BB_ALPHA` | Duplicate Team Code business error; no second active Team. |
| TD-TEAM-E-006 | Update Team Beta code to `TEAM_BB_ALPHA` | Duplicate Team Code business error; original data remains unchanged. |
| TD-TEAM-E-007 | Add Member Alpha twice to Team Alpha | Duplicate active membership error; only one active membership remains. |
| TD-TEAM-E-008 | Add member without role | Role-required validation error; no membership is created. |
| TD-TEAM-E-009 | Add invalid/non-existing member | Member-not-found or invalid member error; no membership is created. |
| TD-TEAM-E-010 | Update role to invalid/non-existing role | Role-not-found or invalid role error; previous role remains unchanged. |
| TD-TEAM-E-011 | Update/delete using stale version if version is exposed | Conflict error; latest data is not overwritten/deleted by stale state. |
| TD-TEAM-E-012 | Non-ADMIN calls Team API | 403 or existing forbidden standard; no data/write exposure. |
| TD-TEAM-E-013 | Anonymous calls Team API | 401 or existing unauthenticated standard; no data/write exposure. |

## Boundary Data

| ID | item | value | expected |
|---|---|---|---|
| TD-TEAM-B-001 | Team Code minimum valid length | 1 non-whitespace character, if spec allows | Accepted if within final validation rule. |
| TD-TEAM-B-002 | Team Code maximum valid length | Max length defined by spec/shared validation, for example 50 chars if adopted | Accepted. |
| TD-TEAM-B-003 | Team Code over maximum length | Max + 1 characters | Rejected with validation error. |
| TD-TEAM-B-004 | Team Name minimum valid length | 1 non-whitespace character, if spec allows | Accepted if within final validation rule. |
| TD-TEAM-B-005 | Team Name maximum valid length | Max length defined by spec/shared validation, for example 255 chars if adopted | Accepted. |
| TD-TEAM-B-006 | Team Name over maximum length | Max + 1 characters | Rejected with validation error. |
| TD-TEAM-B-007 | Description empty/null | Empty or omitted description | Accepted if description is optional. |
| TD-TEAM-B-008 | Description maximum valid length | Max length defined by spec/shared validation, for example 500 chars if adopted | Accepted. |
| TD-TEAM-B-009 | Description over maximum length | Max + 1 characters | Rejected if max length validation exists. |
| TD-TEAM-B-010 | Search no-match keyword | `NO_SUCH_TEAM_BB_999` | Empty table/state without error. |
| TD-TEAM-B-011 | Search partial keyword | `Alpha`, `TEAM_BB` | Matching Teams are shown. |
| TD-TEAM-B-012 | Search case-variant keyword | Lower/upper variant of a known code/name | Follow final search standard; record observed behavior if unspecified. |
| TD-TEAM-B-013 | Empty member list | Team with no active memberships | Detail shows empty list/empty state. |
| TD-TEAM-B-014 | Multiple members | Team with at least two active memberships | Detail shows all active members with roles. |
| TD-TEAM-B-015 | Deleted/inactive Team | Soft-deleted `TEAM_BB_DELETE` | Excluded from active/default list and cannot be modified as active Team. |

## Locale Data

| ID | language | route/input | expected |
|---|---|---|---|
| TD-TEAM-L-001 | English | `/en/teams` or language switch to English | Team list, buttons, placeholders, validation and business messages display in English. |
| TD-TEAM-L-002 | Vietnamese | `/vi/teams` or language switch to Vietnamese | Team list, buttons, placeholders, validation and business messages display in Vietnamese. |
| TD-TEAM-L-003 | Japanese | `/ja/teams` or language switch to Japanese | Team list, buttons, placeholders, validation and business messages display in Japanese. |
| TD-TEAM-L-004 | Error message sample | Required Team Code, duplicate Team Code, duplicate member, missing role | No raw i18n key or mojibake appears in any supported language. |

## Operation / Audit / Log Data

| ID | data | expected |
|---|---|---|
| TD-TEAM-O-001 | Duplicate Team Code request | User-facing error is clear; no stack trace or secret is exposed. |
| TD-TEAM-O-002 | Permission denied request | Standard forbidden/unauthenticated behavior is returned and logged according to existing project standard. |
| TD-TEAM-O-003 | Team create/update/delete/member operations | Dedicated Team audit-log storage is not required for this phase; absence is not a failure. |
| TD-TEAM-O-004 | Request with trace/correlation if available | Existing trace/log behavior remains observable in lower environment if project standard exposes it. |

## Migration / Compatibility Data

| ID | data | expected |
|---|---|---|
| TD-TEAM-M-001 | Fresh migrated database with no explicit Team memberships | Team membership list starts empty unless explicit seed/test fixture creates memberships. |
| TD-TEAM-M-002 | Existing member master data with legacy `team_id/role_id` values if present in source baseline | No automatic membership is created from those legacy fields. |
| TD-TEAM-M-003 | Existing member master data after migration | Member remains available for explicit Add Member operation. |
| TD-TEAM-M-004 | Explicitly created membership after migration | Membership appears only after Team add-member operation or controlled fixture. |

## Data Mapping to Black-box Cases

| case ID | required data |
|---|---|
| BB-TEAM-001 | USER_BB_TEAM_ADMIN, TD-TEAM-N-001 |
| BB-TEAM-002 | USER_BB_TEAM_VIEWER or USER_BB_TEAM_EDITOR |
| BB-TEAM-003 | anonymous user state |
| BB-TEAM-004 | TD-TEAM-N-001 |
| BB-TEAM-005 | TD-TEAM-N-001, TD-TEAM-N-002 |
| BB-TEAM-006 | TD-TEAM-B-010, TD-TEAM-B-011, TD-TEAM-B-012 |
| BB-TEAM-007 | TD-TEAM-N-003 or new unique create data |
| BB-TEAM-008 | TD-TEAM-N-001 with description |
| BB-TEAM-009 | TD-TEAM-E-001, TD-TEAM-E-002 |
| BB-TEAM-010 | TD-TEAM-E-003, TD-TEAM-E-004 |
| BB-TEAM-011 | TD-TEAM-B-002, TD-TEAM-B-005, TD-TEAM-B-008 |
| BB-TEAM-012 | TD-TEAM-B-003, TD-TEAM-B-006, TD-TEAM-B-009 |
| BB-TEAM-013 | TD-TEAM-N-001 |
| BB-TEAM-014 | TD-TEAM-E-005 |
| BB-TEAM-015 | TD-TEAM-E-006 |
| BB-TEAM-016 | TD-TEAM-N-001 |
| BB-TEAM-017 | TD-TEAM-N-008, TD-TEAM-B-013 |
| BB-TEAM-018 | TD-TEAM-N-001 |
| BB-TEAM-019 | TD-TEAM-E-011 |
| BB-TEAM-020 | TD-TEAM-N-004 |
| BB-TEAM-021 | TD-TEAM-N-004, TD-TEAM-B-015 |
| BB-TEAM-022 | TD-TEAM-N-007, TD-TEAM-B-014 |
| BB-TEAM-023 | TD-TEAM-N-005 |
| BB-TEAM-024 | TD-TEAM-E-009 |
| BB-TEAM-025 | TD-TEAM-E-008 |
| BB-TEAM-026 | Role Developer, Role QA, Inactive/Invalid Role |
| BB-TEAM-027 | TD-TEAM-N-005, TD-TEAM-N-006 |
| BB-TEAM-028 | TD-TEAM-E-007 |
| BB-TEAM-029 | TD-TEAM-N-005, Role QA |
| BB-TEAM-030 | TD-TEAM-E-010 |
| BB-TEAM-031 | TD-TEAM-N-005 |
| BB-TEAM-032 | TD-TEAM-N-005 after removal |
| BB-TEAM-033 | Team screens/forms, Project precondition if visible elsewhere |
| BB-TEAM-034 | TD-TEAM-L-001, TD-TEAM-L-002, TD-TEAM-L-003 |
| BB-TEAM-035 | TD-TEAM-L-004 |
| BB-TEAM-036 | TD-TEAM-O-003 |
| BB-TEAM-037 | TD-TEAM-O-001, TD-TEAM-O-002, TD-TEAM-O-004 |
| BB-TEAM-038 | TD-TEAM-M-001, TD-TEAM-M-002 |
| BB-TEAM-039 | TD-TEAM-M-003, TD-TEAM-M-004 |
| BB-TEAM-040 | USER_BB_TEAM_ADMIN, TD-TEAM-N-001 |
| BB-TEAM-041 | Unique create/update data with `TEAM_BB_DOUBLE_*` prefix |
| BB-TEAM-042 | TD-TEAM-N-004 or removable membership test data |

## Existing Data Compatibility

- Do not depend on production-like existing data.
- Do not migrate values from `tbl_dim_member_pseudonym.team_id/role_id` into Team memberships.
- Existing member master records may remain as selectable members, but they must not become Team members until explicitly added.
- Use test-data prefix to distinguish generated black-box data from seed/demo data.
- If legacy fields are absent in the final schema, AC-TEAM-20 is verified by the absence of implicit membership/backfill behavior after migration.

## Data Setup Procedure

1. Prepare lower/local test environment only.
2. Ensure ADMIN and non-ADMIN users exist, or configure test authentication fixture according to project standard.
3. Ensure active role master data exists for Developer, QA and Manager or equivalent role names.
4. Ensure existing member master test data exists for Member Alpha/Beta/Gamma.
5. Create Teams with `TEAM_BB_` prefix through public UI/API where possible.
6. Add Team memberships through the Team Add Member operation for behavior tests.
7. For migration compatibility, use fresh DB migration output or controlled lower-environment DB evidence.
8. Capture generated IDs only in local execution logs; do not commit real secrets/tokens/production identifiers.

## Data Cleanup Procedure

1. Prefer public API/UI soft delete for Teams created by black-box tests.
2. Remove member memberships through Team remove-member operation where possible.
3. Ensure memberships created for `TEAM_BB_` Teams are inactive after cleanup.
4. If DB cleanup is necessary in disposable local/test DB, remove only deterministic test-prefix records after explicit confirmation.
5. Do not run destructive cleanup against shared or production DB.

## Sensitive Data Handling

- Do not use original production data.
- Do not save PII/secrets to artifacts.
- Do not log access tokens, refresh tokens, external user hashes, raw email data, or private configuration.
- Use fake pseudonym/member names only.
- If screenshots are attached to execution evidence, mask tokens, IDs, email addresses and environment-specific secrets.
