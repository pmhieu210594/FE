# Sources

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-15  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket body / USER-MANAGEMENT prompt | Conversation instruction | read | Defines the documentation normalization request and target files. |
| Human clarification - team scope | Conversation / current docs | read | Team assignment is out of scope; `team_id = NULL` is intentional. |
| Human clarification - access/security | Conversation / current docs | read | ADMIN-only access, no hard delete, no sensitive-field exposure. |
| Current USER-MANAGEMENT corrected docs | `docs/changes/USER-MANAGEMENT/*` | read | Working source for the documentation package. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Spec pack | `docs/changes/USER-MANAGEMENT/spec-pack.md` | rewritten | high | SSOT for USER-MANAGEMENT scope and AC. |
| Raw requirement / source extracts | `docs/changes/USER-MANAGEMENT/01_raw-input.md`, `02_reference-extracts.md` | read | medium | Background support for the corrected doc package. |
| Organization reference docs | `docs/changes/ORGANIZATION/*` | read | high | Used as style/structure reference. |
| Ticket template docs | `docs/standards/templates/_ticket-template/*` | read | high | Used to normalize file shape. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| FE route | `EDCAP_FE/src/App.tsx` | read | Confirms Admin route and route guard pattern. |
| FE API | `EDCAP_FE/src/lib/api.ts` | read | Confirms typed helper approach and account endpoints. |
| FE pages | `EDCAP_FE/src/pages/user/` | read | Confirms user account UI patterns. |
| BE controller/service/mapper | `EDCAP_BE/src/main/java/...UserAccount...` | read | Confirms account + pseudonym write behavior. |
| BE mapper XML | `UserAccountAdminMapper.xml` | read | Confirms `team_id = NULL` behavior. |
| LOGIN source | LOGIN docs/source | read | Confirms login compatibility regression scope. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE UT | `UserAccountAdminServicePhase6Test.java` | available | Service/business-rule coverage reference. |
| BE IT | `UserAccountAdminApiIntegrationTest.java` | available | API/security/response coverage reference. |
| FE UT | `UserAccountFormConfig.test.ts`, `UserAccountsPage.test.tsx` | available | Form/page behavior reference. |
| E2E | `user-management.spec.ts` | available | Browser flow reference. |
| Black-box | `blackbox-testcases.md` | rewritten | User-visible behavior reference. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| External office docs, PDFs, slides if any | Local workspace attachment | Use only if they appear in the ticket folder or are clearly attached to the ticket | None found for this ticket. |
| Public web sources | Web | Do not use unless explicitly requested | Internal docs are sufficient for the documentation normalization pass. |

## Excluded Sources

| source/path | reason |
|---|---|
| Production data, secrets, tokens | Safety/security exclusion. |
| Generated dependency caches | Not needed for documentation correction. |
| Unrelated tickets | Not needed for USER-MANAGEMENT normalization. |

## Source Limitations

- The docs correction pass does not execute runtime tests.
- FE/BE password-policy mismatch remains an open doc/source note.
- Formal audit logging remains out of scope for this ticket.

## Assumptions from Sources

- `USER-MANAGEMENT` is treated as the ticket ID because the change folder is `docs/changes/USER-MANAGEMENT/`.
- `team_id = NULL` is the intentional MVP behavior and should remain documented consistently.
- `ADMIN` is the authorization role for this ticket.

## Human Confirmation Required

- Confirm whether password-policy parity must be enforced before release.
- Confirm whether any additional USER-MANAGEMENT documents should be normalized to the same template style.
