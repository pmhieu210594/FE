# Source Availability

**Ticket ID**: ROLE  
**Phase**: Phase 0 - Source Availability  
**Create date**: 2026-06-10  
**Author**: Codex  
**Update date**: 2026-06-10  
**Status**: Draft / Requires Human Approval

## Summary

This artifact records source availability for ROLE (CRUD Role Management) before implementation.
The canonical artifact location for this ticket is `EDCAP_BE/documents/docs/changes/ROLE/`.

Both FE and BE repositories are present in the workspace and both were observed on branch `feature/role`.
Implementation is not allowed in Phase 0.

`spec-pack.md` was missing before Phase 0 artifact creation and is created as a draft in this phase.
It must not be treated as implementation-approved until PO / PM / Tech Lead review is complete.

## Availability Matrix

| source | path | repo | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|---|
| Raw ROLE input | `EDCAP_BE/documents/docs/changes/ROLE/01_raw-input.md` | BE | read | medium | PO / PM / Tech Lead | Initial ROLE requirement input | Encoding/mojibake observed in shell output | use-with-review |
| Raw ROLE input | `EDCAP_FE/documents/docs/changes/ROLE/01_raw-input.md` | FE | read | medium | PO / PM / Tech Lead | Mirror initial ROLE requirement input | Encoding/mojibake observed in shell output | use-with-review |
| ROLE spec pack | `EDCAP_BE/documents/docs/changes/ROLE/spec-pack.md` | BE | unavailable before Phase 0, created as draft | high after approval only | PO / PM / Tech Lead | Single source of specification after approval | Not yet human-approved | human-review-required |
| FE source | `EDCAP_FE/src/**` | FE | not-read | high | FE owner | FE implementation context | API/RBAC contract cannot be judged yet | read-next-phase |
| BE source | `EDCAP_BE/src/**` | BE | not-read | high | BE owner | BE implementation context | API/RBAC/DB contract cannot be judged yet | read-next-phase |
| DB migrations | `EDCAP_BE/src/main/resources/db/migration/**` | BE | not-read | high | BE owner | DB schema and migration convention | `dim_role` existence/type unknown | read-next-phase |
| API standards | `EDCAP_BE/documents/docs/standards/api-contract.md` | BE | read | medium | Tech Lead | Existing API convention reference | Must verify against source | verify-with-source |
| SDD templates | `EDCAP_BE/documents/docs/standards/templates/_ticket-template/*.md` | BE | partial | medium | Tech Lead | Artifact format reference | Template only, not ticket spec | use-as-template |

## Files Already Read

| path | repo | reason |
|---|---|---|
| `EDCAP_BE/documents/docs/changes/ROLE/01_raw-input.md` | BE | Initial ROLE requirement input |
| `EDCAP_FE/documents/docs/changes/ROLE/01_raw-input.md` | FE | FE-side mirror of initial ROLE requirement input |
| `EDCAP_BE/documents/docs/standards/templates/_ticket-template/03_source-availability.md` | BE | Artifact template |
| `EDCAP_BE/documents/docs/standards/templates/_ticket-template/04_context-loading-plan.md` | BE | Artifact template |
| `EDCAP_BE/documents/docs/standards/templates/_ticket-template/spec-pack.md` | BE | Artifact template |
| `EDCAP_BE/documents/docs/standards/templates/_ticket-template/impact-analysis.md` | BE | Artifact template |
| `EDCAP_BE/documents/docs/standards/templates/_ticket-template/promotion-candidates.md` | BE | Artifact template |
| `EDCAP_BE/documents/docs/standards/api-contract.md` | BE | API convention reference |

## Files Not Yet Read

| area | path/pattern | repo | reason |
|---|---|---|---|
| FE API client | `EDCAP_FE/src/lib/api.ts`, `EDCAP_FE/src/utils/api.ts`, service files | FE | Needed before API contract judgment |
| FE auth/RBAC | `EDCAP_FE/src/hooks/**`, auth stores/services | FE | Needed before UI permission behavior judgment |
| FE routing/pages | `EDCAP_FE/src/router*`, `EDCAP_FE/src/pages/**` | FE | Needed before screen placement judgment |
| FE types/tests | `EDCAP_FE/src/interfaces/**`, `EDCAP_FE/src/__ tests __/**`, `EDCAP_FE/e2e_tests/**` | FE | Needed before DTO/test planning |
| BE controllers/DTO | `EDCAP_BE/src/main/java/**/web/**` | BE | Needed before endpoint/DTO/error judgment |
| BE security/RBAC | `EDCAP_BE/src/main/java/**/config/**`, `EDCAP_BE/src/main/java/**/security/**` | BE | Needed before permission enforcement judgment |
| BE service/repository/mapper | `EDCAP_BE/src/main/java/**/application/**`, `EDCAP_BE/src/main/java/**/infrastructure/**`, `EDCAP_BE/src/main/resources/mapper/**` | BE | Needed before implementation impact judgment |
| BE DB migration | `EDCAP_BE/src/main/resources/db/migration/**` | BE | Needed before `dim_role` schema judgment |
| Standards | `security.md`, `database.md`, `testing.md`, `error-handling.md` | BE/FE | Needed before implementation plan |
| Architecture maps | `documents/docs/architecture/**` | BE/FE | Only search snippets read so far |

## Excluded Sources

| path/pattern | reason |
|---|---|
| `.env*` | Secret/credential risk |
| `*secret*`, `*key*`, credentials | Secret/credential risk |
| Raw production logs, `*.log`, `logs/**` | Sensitive data and production data risk |
| `.git/**` | Repository internals not needed for Phase 0 artifact content |
| `node_modules/**`, `target/**` | Generated/dependency/build output |
| External/binary documents | Require safe intake and human approval before use |

## Unavailable / Partial Sources

| source | status | impact |
|---|---|---|
| Approved ROLE `spec-pack.md` | Unavailable before Phase 0; draft created in this phase | Cannot implement until approved |
| FE API client + BE controller/DTO/security read pair | Not yet read | Cannot judge API contract |
| DB schema for `dim_role` | Not yet read | Cannot judge `role_id`, audit columns, delete policy |
| Current RBAC permission naming | Not yet read / not confirmed | Cannot implement permissions |

## Risk Before Implementation

| risk | severity | reason | required action |
|---|---|---|---|
| API contract mismatch | Major | FE and BE contract sources not yet jointly read | Apply Pack 26 and read both sides |
| DB schema uncertainty | Major | `dim_role`, `role_id`, and delete strategy not confirmed | Read migrations/schema and get human decision |
| RBAC uncertainty | Major | Permission naming and enforcement model not confirmed | Read source and get human decision |
| Raw input encoding risk | Medium | Mojibake observed in shell output | Verify content encoding before final spec approval |

## Required Human Decision

| ID | decision item | owner | status |
|---|---|---|---|
| HD-ROLE-001 | Approve `spec-pack.md` as canonical ROLE specification | PO / PM / Tech Lead | Open |
| HD-ROLE-002 | Confirm RBAC permission names | Tech Lead / Security Reviewer | Open |
| HD-ROLE-003 | Confirm delete behavior for assigned/referenced roles | PO / PM / Tech Lead | Open |
| HD-ROLE-004 | Confirm hard delete vs soft/logical delete | Tech Lead / DB owner | Resolved later: logical delete; restore is out of scope |
| HD-ROLE-005 | Confirm `role_id` type/generation after source review | Tech Lead / DB owner | Open |
