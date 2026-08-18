# Source Inventory

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Ticket docs | `docs/changes/USER-MANAGEMENT/*` | documentation | docs owner | read | Core corrected package. |
| Template reference | `docs/standards/templates/_ticket-template/*` | template | docs owner | read | Used to normalize file structure. |
| Organization reference | `docs/changes/ORGANIZATION/*` | documentation reference | docs owner | read | Used as shape/style reference. |
| FE source | `EDCAP_FE/src/pages/user/` | source reference | FE owner | read | Existing User Management UI source. |
| FE route/API | `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/lib/api.ts` | source reference | FE owner | read | Route and typed API helpers. |
| BE source | `EDCAP_BE/src/main/java/...UserAccount...` | source reference | BE owner | read | Controller/service/repository/mapper implementation. |
| BE mapper | `UserAccountAdminMapper.xml` | source reference | BE owner | read | `team_id = NULL` behavior. |
| Generated tests | `UserAccountAdminServicePhase6Test.java`, `UserAccountAdminApiIntegrationTest.java`, FE tests, E2E spec | generated test artifacts | test owner | read | AC alignment reference. |

## Important Files

- `spec-pack.md`
- `context.md`
- `ticket-rules.md`
- `test-plan.md`
- `blackbox-testcases.md`
- `review-checklist.md`
- `self-review.md`
- `report.md`

## Generated / Excluded Files

- Generated test package content is treated as reference evidence.
- Extra template-mismatch files from the older package are excluded from the corrected shape.

## Missing Files

- None for the documentation correction step.
