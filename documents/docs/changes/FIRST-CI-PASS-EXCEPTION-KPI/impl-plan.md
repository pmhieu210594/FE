# Implementation Plan

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI  
**Create date**: 2026-06-29  
**Author**: nk_trung      
**Update date**: 2026-06-29  

## 1. Implementation Principle

- Keep the phase BE-only and reuse the existing V4 schema first.
- Keep First CI Pass at PR grain, with CI job rows staying diagnostic only.
- Keep Exception KPI derived from explicit exception records only.
- Keep parsing deterministic, idempotent, and metadata-only.
- Prefer the smallest additive nullable schema change only when provenance cannot be represented otherwise.
- Keep logs, evidence, and warnings free of raw markdown, raw CI logs, raw chat, raw prompt text, and secrets.

## 2. Alternative Plan

| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Reuse `tbl_fact_ci_run`, `tbl_fact_ci_job`, `tbl_fact_exception`, and the current parser/scan pattern; add only a minimal nullable provenance column if required | Best aligns with reuse-first and avoids schema sprawl | Requires careful parser and read-model design | Selected |
| B | Add a new KPI summary table or snapshot table | Simple read queries later | Adds schema surface, migration risk, and maintenance overhead | Rejected |
| C | Infer exception rows from generic risk / open-issue text | Less parser work | Violates the explicit-record rule and produces unstable KPI results | Rejected |

## 3. Reason for Choosing the Alternative Plan

- The spec-pack explicitly prefers reuse of the current V4 schema.
- The current backend already contains the core fact tables needed for First CI Pass and explicit exception rows.
- The existing scanner/parser pipeline already shows how markdown artifacts are parsed, warned, and persisted.
- The KPI must remain explainable to PM, QA, and Data Ops without raw log inspection.

## 4. Expected Change File

| file | change summary | reason | related AC |
|---|---|---|---|
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/source-availability.md` | Phase 3 source inventory of readable inputs | Planning artifact | AC-FCI-1 to AC-FCI-11 |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/source-inventory.md` | File-level inventory and missing-source list | Planning artifact | AC-FCI-1 to AC-FCI-11 |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impact-analysis.md` | Impact analysis across BE / DB / test / ops | Planning artifact | AC-FCI-1 to AC-FCI-11 |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md` | This implementation plan | Planning artifact | AC-FCI-1 to AC-FCI-11 |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/selfreview/SelfReviewMarkdownParser.java` | Extend explicit exception extraction | Parser layer | AC-FCI-4, AC-FCI-6, AC-FCI-8, AC-FCI-9, AC-FCI-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Wire parser output to persistence / warnings | Scan / persist orchestration | AC-FCI-4 to AC-FCI-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/<tbd>/...` | New KPI use case or read-model service if the phase confirms a dedicated service | Read model orchestration | AC-FCI-1 to AC-FCI-10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/<tbd>/...` | Query adapter for first-run selection and explicit exception retrieval | Database access | AC-FCI-1 to AC-FCI-9 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/<tbd>/...` | Read-only KPI controller if the contract is confirmed in implementation | API surface (optional in this phase) | AC-FCI-1, AC-FCI-7, AC-FCI-10, AC-FCI-11 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/<tbd>/...` | KPI DTOs | Typed read contract | AC-FCI-1 to AC-FCI-11 |
| `EDCAP_BE/src/main/resources/db/migration/VXXX__*.sql` | Minimal nullable provenance migration only if needed | DB extension | AC-FCI-5, AC-FCI-8, AC-FCI-9, AC-FCI-10 |
| `EDCAP_BE/src/test/java/...` | Parser, repository, service, and integration tests | Verification | All ACs |

## 5. Class / Function / Method to Add or Modify

| target | action | input | output | note |
|---|---|---|---|---|
| `SelfReviewMarkdownParser` | extend | `self-review.md` content and source path | parsed explicit exception records + warnings | Must not infer from generic risk text |
| report parsing path | extend or add sibling parser logic | `report.md` content and source path | parsed explicit exception records + warnings | Keep the dedicated exception-record section as the only source |
| scanner persistence flow | extend | parsed exception rows, ticket / PR / CI scope | persisted `tbl_fact_exception` rows and data-quality rows | Must remain idempotent |
| KPI read service | add | repository / adapter output and caller scope | first CI pass + exception KPI read model | Keep read-only |
| repository adapter | add or extend | ticket / PR / repository identifiers | deterministic lookup results | Use parameterized SQL only |
| DTO layer | add | KPI model | API response DTO | Keep raw markdown out of DTOs |
| tests | add | fixtures from `report.md` / `self-review.md` | assertions | Cover success, failure, missing-section, and rerun cases |

## 6. SQL / Query / Repository Policy

- Use parameterized SQL only.
- Use `tbl_fact_ci_run` as the run-level KPI source and `tbl_fact_ci_job` only as diagnostic detail.
- Use `tbl_fact_exception` only for explicit exception rows.
- Use `tbl_dim_role` for approval-role resolution when text can be mapped safely.
- Keep the first-run selection deterministic; if multiple runs exist, order explicitly by the strongest available time / identity fields.
- Prefer a nullable additive column over a new table if provenance storage is needed.

## 7. Validation / Error / Logging Policy

- Reject empty or malformed required identifiers explicitly.
- Convert missing exception sections, unresolved roles, duplicate source hashes, and unknown CI runs into warnings / data-quality entries instead of silent fallback.
- Keep logs at metadata level only: traceId, ticketId, repositoryId, prId, sourcePath, parserVersion, parseStatus, warning counts.
- Do not emit raw markdown content, raw CI logs, secrets, or tokens.
- Keep error handling centralized through the standard backend exception envelope.

## 8. Migration / Rollback Policy

- Do not edit the existing V4 migration file in place.
- Do not create a new table unless the spec-pack later proves the current schema is insufficient.
- If provenance cannot be stored through existing fields, add one minimal nullable migration only.
- Roll back by disabling the new KPI path first, then removing the additive field later if it proves unnecessary.

## 9. Step Implementation

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Reconfirm the exact source tables, parser methods, and current scan flow already available | docs + source | Source inventory is complete and no method is guessed | Stop if a method / column is inferred without source support |
| 2 | Lock the explicit exception-record contract for `report.md` and `self-review.md` | spec-pack + ticket-rules + templates | The parser boundary is unambiguous | Stop if free-text inference appears |
| 3 | Define the read/write seam for first CI run selection and exception persistence | impl-plan + context | Read-model boundary is clear | Stop if controller / adapter boundaries are crossed |
| 4 | Extend parser logic for the dedicated exception section(s) | parser files | Parser tests pass for success / missing / malformed cases | Stop if parsing depends on generic risk text |
| 5 | Wire persistence and warning recording | scanner / repository / data-quality paths | Duplicate reruns remain idempotent | Stop if duplicate rows can be created |
| 6 | Add the KPI read model | service / adapter / DTO files | Output is read-only and metadata-only | Stop if write semantics leak into the API |
| 7 | Add the minimal additive migration only if required | migration file | Schema remains backwards compatible | Stop if a new table is proposed without approval |
| 8 | Add tests and review artifacts | test / review files | AC mapping is complete | Stop if idempotency or warning behavior is untested |

## 10. How to Verify Each Step

- Step 1: compare the written context against the exact source files and table DDL.
- Step 2: confirm the template exception section is the only supported parse input.
- Step 3: ensure the design keeps SQL out of controllers and preserves layering.
- Step 4: validate sample exception sections and missing-section warnings.
- Step 5: verify the same source hash does not create duplicate CI or exception rows.
- Step 6: confirm the KPI response contains only metadata and explicit KPI fields.
- Step 7: verify any schema extension is additive, nullable, and backwards compatible.
- Step 8: verify tests cover first-run selection, explicit exception parsing, role resolution, duplicate reruns, and no raw-content storage.

## 11. Corresponding AC Table

| AC ID | implementation point | verification |
|---|---|---|
| AC-FCI-1 | Earliest CI run selection at PR grain | Unit test for deterministic first-run selection |
| AC-FCI-2 | Successful first run sets KPI to pass | Success-path unit test |
| AC-FCI-3 | Failed first run sets KPI to fail | Failure-path unit test |
| AC-FCI-4 | Dedicated exception section parser | Parser test with updated templates |
| AC-FCI-5 | Persist explicit exception row | Persistence / integration test |
| AC-FCI-6 | No synthetic exception on missing section | Warning + no-row test |
| AC-FCI-7 | Exception KPI computed from explicit rows | KPI read-model test |
| AC-FCI-8 | Resolved approval-role reference persisted | Role-resolution test |
| AC-FCI-9 | Rerun on same source hash remains idempotent | Duplicate-run regression test |
| AC-FCI-10 | Warnings / data-quality entries recorded | Warning persistence test |
| AC-FCI-11 | No FE screen in this phase | Scope review |

## 12. Stop / Ask Condition

- Stop if any later implementation step would require a guessed API, guessed table column, or free-text inference that is not backed by the source files and spec-pack.

## 13. Do Not Do This Ticket

- Do not create a new FE dashboard now.
- Do not infer exception records from generic free text.
- Do not store raw CI logs, raw prompt/chat, or secrets.
- Do not add a new table before confirming that a nullable additive column is insufficient.
- Do not bypass the standard error / traceId envelope.
- Do not let CI job rows replace CI run rows for KPI truth.

## 14. Open Related Issues

- Exact parser class and endpoint names are still to be finalized in later phases.
- Whether provenance needs only a nullable column or a more explicit read-model helper still needs implementation confirmation.
- Whether the KPI read side will be exposed via a dedicated controller or through an existing read model path needs contract finalization.