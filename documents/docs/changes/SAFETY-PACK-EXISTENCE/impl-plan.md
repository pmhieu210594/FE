# Implementation Plan

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## 1. Implementation Principle

Implement only the backend Safety Pack and CI Security Scan evidence flow. Keep Security Exception management out of this ticket, preserve existing admin/auth patterns, and store only normalized data in approved `tbl_` tables.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Keep current Safety Pack + CI scan scope only | Matches confirmed scope, smaller risk, easier to review | Does not deliver exception management | Chosen |
| B | Re-introduce Security Exception CRUD into this ticket | Broader feature set | Violates scope correction, increases risk and churn | Rejected |

## 3. Reason for Choosing the Alternative Plan

The user explicitly requested that Security Exception management be out of scope, so the implementation must not reintroduce it. The current code and docs are easier to align if the ticket is narrowed to backend Safety Pack + CI scan only.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Scan `.claude` and compute status/counts | Core Safety Pack behavior | AC-SAFETY-PACK-1..4 |
| `src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | Normalize GitHub Actions payload | Core ingest behavior | AC-SAFETY-PACK-6..10 |
| `src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | Evidence endpoints | API surface | AC-SAFETY-PACK-11 |
| `src/main/java/com/sdd/platform/infrastructure/persistence/*` | Approved `tbl_` persistence | DB/storage | AC-SAFETY-PACK-5, AC-SAFETY-PACK-10 |
| `documents/docs/changes/SAFETY-PACK-EXISTENCE/*` | Rewrite docs to template | Traceability | all |

## 5. Class / Function / Method to Add or Modify

No frontend classes or functions are added in this pass.

## 6. SQL / Query / Repository Policy

- No SQL changes are part of this pass except additive `tbl_` persistence if required by the current source.
- No repository or mapper changes are part of this pass unless needed to support the backend flow.

## 7. Validation / Error / Logging Policy

- Keep authenticated access, bcrypt-like security discipline for any persisted credentials, and sensitive-field rules documented.
- Keep safe error/traceId wording documented.
- Keep frontend-related validation out of scope.

## 8. Migration / Rollback Policy

- No migration is required for this pass unless the current source lacks the approved `tbl_` tables.
- Rollback is a documentation revert only if no backend code changes are applied.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Align scope in docs | `documents/docs/changes/SAFETY-PACK-EXISTENCE/*` | Files use backend-only template shape | Stop if scope changes |
| 2 | Verify backend evidence flow | BE service/controller files | API and ingest contracts match | Stop if raw evidence is introduced |
| 3 | Keep persistence additive | BE persistence / migration files | Only approved `tbl_` tables are used | Stop if non-`tbl_` table appears |
| 4 | Close report artifacts | `report.md`, `test-results.md` | Final status is explicit | Stop if runtime claim is fabricated |

## 10. How to Verify Each Step

| step | verification | expected result |
|---|---|---|
| 1 | Read back files | Headers/sections match the template family. |
| 2 | Cross-check AC IDs | `AC-SAFETY-PACK-*` are consistent across docs. |
| 3 | Check persistence scope | Approved `tbl_` tables only. |
| 4 | Check evidence status | Runtime work is not claimed unless actually executed. |

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-SAFETY-PACK-1..12 | Backend evidence flow and docs only in this pass | Cross-file consistency and explicit status notes |

## 12. Stop / Ask Condition

- Stop if any edit would change the business scope rather than the backend documentation shape.
- Stop if a file would require a runtime claim that was not executed.
- Ask if workflow/job correlation rules or ingest auth details must be fixed before release.

## 13. Do Not Do This Ticket

- Do not change frontend source in this pass.
- Do not imply runtime tests were executed when they were not.
- Do not reintroduce Security Exception management.
- Do not remove the workflow/auth open issues without a decision.

## 14. Open Related Issues

| ID | issue | impact | proposed action |
|---|---|---|---|
| OI-1 | Workflow/job names | CI contract ambiguity | Decide before release |
| OI-2 | Ingest auth/signature scheme | Backend verification completeness | Decide before release |
| OI-3 | Detailed security findings | Scope may expand | Keep deferred unless promoted |
