# Source Availability

**Ticket ID**: USER-MANAGEMENT  
**Create date**: 2026-06-12  
**Author**: ChatGPT  
**Update date**: 2026-06-12  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| FE ticket template | `EDCAP_FE/documents/docs/standards/templates/_ticket-template` | read | high | FE/docs owner | Required file list | none | always-read |
| Current USER-MANAGEMENT docs | `docs/changes/USER-MANAGEMENT` | read | high | ticket owner | Identify mismatch | stale/extra files | correct |
| FE source | `EDCAP_FE/src/pages/user/*`, `App.tsx`, `lib/api.ts` | read | high | FE owner | Actual UI/API behavior | source may change | verify before merge |
| BE source | `EDCAP_BE/src/main/java/...UserAccount...` | read | high | BE owner | Actual service/API behavior | source may change | verify before merge |
| DB mapper | `EDCAP_BE/src/main/resources/mapper/UserAccountAdminMapper.xml` | read | high | BE/DB owner | Table mapping | DB local mismatch | required-if-db |
| Generated test files | `USER_MANAGEMENT_test_files.zip` content | read | high | QA/Dev | AC/test alignment | not yet executed here | copy and run |
| Standards/rules | `EDCAP_FE/documents/docs/standards`, `.claude/rules` if present | partial | medium | project owner | Review/test conventions | unavailable in root path | use available FE standards |

## Summary

Sources are sufficient to fix the documentation template and align AC with source/tests.

## Unavailable / Partial Sources

- Root `docs/standards/` and `.claude/rules/` were not treated as the authoritative template for this correction; user explicitly selected the FE `_ticket-template`.

## Risk Before Implementation

- Tests were generated but not executed in this environment.
- FE and BE password-strength rules are not identical.

## Required Human Decision

No blocking human decision remains for documentation correction.
