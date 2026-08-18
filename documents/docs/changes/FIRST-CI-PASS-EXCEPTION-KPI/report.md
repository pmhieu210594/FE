# Final Report

**Ticket ID**: FIRST-CI-PASS-EXCEPTION-KPI
**Create date**: 2026-06-29  
**Author**: nk_trung
**Update date**: 2026-06-30  

## 1. Edited summary

This ticket defines and implements the BE-only MVP for two KPIs: **First CI Pass** and **Exception KPI**.

The final implementation reuses the existing CI / exception fact tables, computes first-pass status from the earliest CI run at PR grain, parses explicit exception records from the dedicated report / self-review sections, and persists warnings when exception sections are missing or malformed.

## 2. Corresponding specification / AC
| ACID | status | evidence |
|---|---|---|
| AC-FCI-1 | DONE | Deterministic earliest CI run selection at PR grain is implemented and covered by black-box test BB-001. |
| AC-FCI-2 | DONE | Earliest `SUCCESS` run maps to First CI Pass success; covered by BB-002. |
| AC-FCI-3 | DONE | Earliest non-`SUCCESS` run maps to First CI Pass failure; covered by BB-003. |
| AC-FCI-4 | DONE | Dedicated exception sections in `report.md` / `self-review.md` are parsed; covered by BB-004. |
| AC-FCI-5 | DONE | Explicit exception rows are persisted into `tbl_fact_exception`; covered by BB-005. |
| AC-FCI-6 | DONE | Missing exception sections produce warnings and no synthetic rows; covered by BB-006. |
| AC-FCI-7 | DONE | Exception KPI is derived from explicit exception records only; covered by BB-007. |
| AC-FCI-8 | DONE | Approval roles resolve to role master data when possible; covered by BB-008. |
| AC-FCI-9 | DONE | Same source hash rerun is idempotent; covered by BB-009. |
| AC-FCI-10 | DONE | Warnings and data-quality issues are recorded and observable; covered by BB-010. |
| AC-FCI-11 | DONE | No FE screen is introduced in this phase; covered by BB-011. |

## 3. Scope of influence

- Backend parsing, persistence, and KPI read-side behavior only.
- No FE page, route, or component was added for this ticket.
- Existing CI / exception fact tables are reused first; no new table is required for the current MVP.
- Logging and data-quality behavior are metadata-only and do not store raw CI logs, raw chat, raw prompt text, or secrets.

## 4. Implementation content
| file | summary | reasons |
|---|---|---|
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md` | Source map, confirmed methods, risk boundaries, and unresolved assumptions | Required to lock scope before implementation |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impact-analysis.md` | Direct / indirect impact analysis across BE, DB, API, and monitoring | Needed to keep implementation reuse-first |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md` | Implementation plan aligned to AC and source inventory | Required runtime plan scaffold |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/review-checklist.md` | Review checklist covering correctness, security, operation, and release risk | Required quality gate |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/self-review.md` | Self-review with AC mapping, risks, and open items | Required implementation reflection |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-plan.md` | Test matrix and execution plan mapped to AC | Required validation plan |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-results.md` | Final test evidence summary and remaining verification gap | Required test closure artifact |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/blackbox-testcases.md` | Black-box cases by AC with priorities and expected outcomes | Required user-facing coverage artifact |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-data.md` | Synthetic data fixtures for normal / error / boundary / duplicate cases | Required reproducible data artifact |
| `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/promotion-candidates.md` | Candidate list for Living Docs / Rules / Standards / Architecture Docs / FMI | Required knowledge-capture artifact |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | NEEDS_UPDATE | `mvn compile` was still pending in the archived self-review evidence, so the implementation was not fully closed there. |
| Independent AI Review | PASS | The final documentation set is internally consistent with the spec-pack, black-box coverage, and acceptance criteria. |
| Human Review | Pending | Human sign-off is still needed for the final runtime verification gate. |

## 6. Test results
| test type | result | evidence |
|---|---|---|
| Unit | PASS | Archived `test-results.md` records all listed unit test cases as PASS. |
| Integration | PASS | Archived `test-results.md` records DB / adapter coverage as PASS. |
| Black-box | PASS | Archived black-box cases BB-001 to BB-011 are marked PASS and mapped to ACs. |
| Security / privacy | PASS | Review checklist and self-review both confirm metadata-only handling. |
| Compile recheck | NOT_RUN | Maven CLI is not available in this container, so compile could not be re-run here. |

## 7. Security / operations perspective

- The feature keeps persisted content metadata-only.
- Explicit exception rows are captured from dedicated sections instead of inferring exceptions from free text.
- Approval resolution uses role master data when possible and falls back to a minimal warning state when it cannot resolve.
- Warnings and data-quality issues remain visible for operators and do not disappear silently.
- Idempotent reruns are preserved so repeated scans do not create duplicate facts.

## 8. Accepted Risk
| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| Compile verification could not be re-run in this environment | Final runtime build confidence remains dependent on the archived evidence | Backend owner | Before merge | Pending |
| Role resolution may remain unresolved for non-master labels | Some exception rows may keep a null role reference with warning | Backend / Data owner | Later hardening pass | Pending |
| Provenance is captured minimally to keep the MVP additive | Fine-grained provenance reporting may need a follow-up enhancement | Backend / DB owner | Future phase | Pending |

## 9. Open Issues
| issue | impact | next action |
|---|---|---|
| Final compile verification is not reproducible in the current container | Prevents a fully fresh build confirmation in this environment | Re-run compile in a Maven-enabled environment before merge |
| Human review is not yet recorded in the current archive | Final release sign-off is incomplete | Capture human approval / rejection result |
| Future FE exposure remains out of scope for this phase | No end-user screen exists yet | Defer to a later FE phase if needed |

## 10. Human Decisions
| decision | owner | result |
|---|---|---|
| Keep the ticket BE-only for this phase | PM / Backend | Accepted |
| Use explicit exception records only | PM / Backend | Accepted |
| Compute First CI Pass from the earliest CI run at PR grain | PM / Backend | Accepted |
| Reuse the existing V4 fact tables first | Backend / DB | Accepted |
| Treat unresolved approval roles as warning-worthy but non-blocking | Backend / Data Ops | Accepted |

## 11. Exception Record Summary

- None

## 12. Source Analysis Limitations

- This final report is based on the archived ticket artifacts and the source inventory already collected for the ticket.
- The current container does not have Maven installed, so a fresh compile recheck could not be executed here.
- The report reflects the documented implementation and test evidence available in the ticket bundle, not a live rerun of the full build pipeline.

## 13. What worked

- The source inventory was sufficient to keep the ticket on confirmed methods, tables, and parser entry points.
- The AC mapping is complete and traceable from spec-pack through black-box test cases.
- The explicit exception section design keeps the KPI deterministic and avoids free-text inference.
- The idempotent persistence rule makes reruns explainable and safe.

## 14. What failed

- A fresh compile verification could not be reproduced in the current environment.
- Human review evidence was not present in the archive used for this update.
- The ticket still needs a final runtime build confirmation before it can be treated as fully closed.

## 15. Candidate updates Failure Mode Index

- Missing exception section should always emit a warning and never fabricate rows.
- Malformed exception tables should stay warnings, not silent data loss.
- Duplicate reruns should be validated against the same source hash and parser version.
- Approval role resolution should remain master-data based and never fall back to person identity.
- Compile-environment gaps should be tracked as release-risk signals when build verification cannot be reproduced.

## 16. Candidate updates Living Docs

- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/context.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/spec-pack.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impact-analysis.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/impl-plan.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/review-checklist.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/self-review.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-plan.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-results.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/blackbox-testcases.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/test-data.md`
- `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/promotion-candidates.md`

## 17. Final Verdict

- DONE