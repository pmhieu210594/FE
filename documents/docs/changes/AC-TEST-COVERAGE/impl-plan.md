# Implementation Plan

**Ticket ID**: AC-TEST-COVERAGE   
**Create date**: 2026-06-26  
**Author**: OpenAI  
**Update date**: 2026-06-26  

## 1. Implementation Principle

- Parser-only, reuse-first, AC-first.
- `spec-pack.md` defines the AC universe.
- `test-plan.md` defines planned coverage.
- `test-results.md` and CI summary remain supporting evidence only.
- Prefer the existing parser services, persistence adapter, and read-model adapter before any new runtime surface.
- Keep the dashboard/read view read-only; do not create a manual mapping workflow or FE-side recomputation.

## 2. Alternative Plan
| option | summary | pros | cons | decision |
|---|---|---|---|---|
| A | Reuse the current AC lookup, parser, persistence, and read-model path; add only the smallest missing glue if a gap is found | Lowest risk, matches current source, preserves audit trail | Requires careful verification that no missing step is hidden in the current source | Selected |
| B | Add a new dedicated AC-Test Coverage aggregate table and a new read/write service | Clear separation of concerns | Higher schema and migration cost, duplicates existing data, violates reuse-first preference | Rejected |
| C | Add manual mapping/pinning or FE-side recomputation | Flexible for edge cases | Violates ticket rules, weakens auditability, and creates rule drift | Rejected |

## 3. Reason for Choosing the Alternative Plan

The repository already contains the main runtime pieces: AC lookup, planned coverage persistence, test-run persistence, warning/data-quality output, and score/read-model aggregation. That means the safest implementation path is to reuse the current source and only add glue where a real gap is proven. This matches the ticket rules and avoids creating a second interpretation of AC coverage.

## 4. Expected Change File
| file | change summary | reason | related AC |
|---|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | Keep as the planned-coverage entrypoint; adjust only if a gap is proven | Planned coverage ingestion | AC-AC-TEST-COVERAGE-1,2,3,5,9,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | Keep as the executed-evidence entrypoint; adjust only if a gap is proven | Executed coverage ingestion | AC-AC-TEST-COVERAGE-2,4,6,9,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | Keep as the canonical AC mismatch detector | Warning semantics | AC-AC-TEST-COVERAGE-1,2,3,5,9,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | Keep as the write path for planned coverage and test runs | Auditability and idempotency | AC-AC-TEST-COVERAGE-2,4,6,8,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Keep as the read-model signal source | Dashboard consistency | AC-AC-TEST-COVERAGE-7,8,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Keep as the score consumer / recompute orchestrator | Downstream quality score stability | AC-AC-TEST-COVERAGE-8,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Keep batch orchestration separate from parser logic | Preserve layered boundaries | AC-AC-TEST-COVERAGE-6,10 |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TestPlanParseController.java`, `TestResultsParseController.java`, `EvidenceQualityScoreController.java` | Modify only if a new read-only flow is proven necessary | API surface | AC-AC-TEST-COVERAGE-7,8 |
| `EDCAP_BE/src/test/java/com/sdd/platform/**` | Add or extend tests only where current coverage is weak | Verification | All AC |
| `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/components/Layout.tsx`, `EDCAP_FE/src/lib/api.ts` | Touch only if a new FE surface is approved later | UI contract | AC-AC-TEST-COVERAGE-7 |
| `docs/changes/AC-TEST-COVERAGE/*` | Planning, traceability, and evidence skeletons | Phase documentation | All AC |

## 5. Class / Function / Method to Add or Modify
| target | action | input | output | note |
|---|---|---|---|---|
| `TestPlanParseService.parseAndStore(...)` | Keep / refine only if needed | parse request | persisted planned coverage and warnings | Do not introduce a second coverage rule engine |
| `TestResultsParseService.parseAndStore(...)` | Keep / refine only if needed | parse request | persisted test run and executed evidence | Keep executed evidence separate from planned coverage |
| `TestCoverageValidationService.validateCoverage(...)` | Keep | spec AC keys, matrix/result AC keys | warning list | Canonical AC mismatch rule |
| `TestEvidencePersistencePort.replacePlannedCoverage(...)` | Keep | snapshot, ticket, ac text hash, AC keys | planned coverage rows | Write through the port only |
| `TestEvidencePersistencePort.upsertTestRun(...)` | Keep | test run record | persisted test run | Idempotent test-run write path |
| `EvidenceQualityScoreRepositoryAdapter.loadTestSignal(...)` | Keep | ticketId | test signal aggregate | Read path for coverage-driven KPI |
| `EvidenceQualityScoreService.recalculateFromParser(...)` / `recalculateFromCi(...)` | Keep | ticketId, rule version, actor | score result | Do not let score logic fork |
| `ArtifactScannerService.scan(...)` | Keep | scan request | scan run, artifacts, evidence events | Batch orchestration only |
| `TestPlanParseController.parse(...)` / `TestResultsParseController.parse(...)` | Keep | parse DTOs | parse result DTOs | Controller patterns only |
| `EvidenceQualityScoreController.getLatest(...)` | Keep | ticketId | read-model response | Read-only contract |

## 6. SQL / Query / Repository Policy

- Use the existing `tbl_fact_*` schema first; do not invent a new coverage table for the MVP.
- Keep all writes behind the existing ports/adapters.
- Keep queries parameterized and ticket-scoped.
- Keep the AC read path limited to active AC keys from `tbl_fact_acceptance_criteria`.
- If a later runtime gap proves that the current schema is insufficient, add a new additive migration instead of editing `V4__init_shema_v2.sql`.

## 7. Validation / Error / Logging Policy

- Missing AC, missing test coverage, and unknown AC references must produce warnings or data-quality records.
- Keep `traceId`, `ticketId`, snapshot IDs, run IDs, and source hashes available for troubleshooting.
- Never log raw prompt/chat text, secrets, or full source text.
- Preserve UTF-8 and exact status labels (`MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED`, `UNKNOWN`).
- Any fallback or approximation must be explicit in the warning stream.

## 8. Migration / Rollback Policy

- No migration is expected in this phase.
- If a later runtime gap appears, create a new additive Flyway migration rather than editing V4.
- Rollback for the current phase is documentation rollback only.
- For later runtime changes, rollback should be forward-repair or revert-based, not destructive schema surgery.

## 9. Step Implementation
| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Re-verify that the current runtime source already covers AC lookup, planned coverage persistence, executed evidence persistence, and read-model aggregation | `TestPlanParseService`, `TestResultsParseService`, `TestEvidenceJdbcAdapter`, `EvidenceQualityScoreRepositoryAdapter` | Source inspection against `spec-pack.md` and `context.md` | Stop if a required behavior is missing or a method does not exist |
| 2 | Freeze the non-goals: no manual mapping, no FE recompute, no new coverage table | `ticket-rules.md`, `impact-analysis.md` | Review checklist acceptance | Stop if any non-goal becomes a hidden requirement |
| 3 | Identify the smallest code delta needed for the next runtime phase, if any gap remains | targeted runtime files only | Diff review + unit test plan | Stop if the proposed change introduces a second rule engine |
| 4 | Add or extend tests for the confirmed gap only | `EDCAP_BE/src/test/java/com/sdd/platform/**` | Test execution and assertions | Stop if the test requires a schema or API not already justified |
| 5 | Recalculate the impact and rollout notes after the gap is confirmed | `impact-analysis.md`, `impl-plan.md` | Final review against the template | Stop if the implementation would require a new public workflow |

## 10. How to Verify Each Step

- Verify the source tree still contains the exact runtime entrypoints named in the plan.
- Verify the AC keys are read from `spec-pack.md` and not invented elsewhere.
- Verify planned coverage and executed evidence are not collapsed into one status bucket.
- Verify the write path remains behind `TestEvidencePersistencePort`.
- Verify tests cover idempotency, warning generation, and AC-first read behavior.

## 11. Corresponding AC Table
| AC ID | implementation point | verification |
|---|---|---|
| AC-TEST-COVERAGE-1 | AC keys are sourced from `spec-pack.md` and validated against AC master | Source inspection and parser test |
| AC-TEST-COVERAGE-2 | `test-plan.md` is the only planned coverage source | Parser test and warning test |
| AC-TEST-COVERAGE-3 | Missing AC maps to `MISSING` | Read-model assertion |
| AC-TEST-COVERAGE-4 | Planned coverage without execution maps to `UNTESTED` | Parser/evidence separation test |
| AC-TEST-COVERAGE-5 | Partial multi-mapping maps to `PARTIAL` | Coverage aggregation test |
| AC-TEST-COVERAGE-6 | `test-results.md` and CI summary are supporting evidence only | Validation and read-model test |
| AC-TEST-COVERAGE-7 | Dashboard output is `AC -> test cases` | Read-model contract review |
| AC-TEST-COVERAGE-8 | `First CI Pass` and `Exception` remain supported metrics | Score-service/read-model test |
| AC-TEST-COVERAGE-9 | No manual mapping/pinning | Negative test and code review |
| AC-TEST-COVERAGE-10 | Warnings / data-quality issues persist | Event/data-quality test |

## 12. Stop / Ask Condition

- A new standalone UI workflow becomes necessary.
- A new public API contract becomes necessary.
- A new table is required and the current schema cannot support the requirement.
- Manual mapping or FE-side recomputation is requested.
- The source tree does not contain one of the methods or tables named in this plan.

## 13. Do Not Do This Ticket

- Do not create a dedicated AC-Test Coverage management screen in this phase.
- Do not invent new AC IDs, test-case IDs, or status labels.
- Do not add a new table just to avoid using the current schema.
- Do not hide warnings or data-quality issues.
- Do not store raw prompt/chat text or full source text in logs or DB.

## 14. Open Related Issues

- Whether the next runtime phase needs a dedicated dashboard widget or can reuse an existing read-only surface.
- Whether a dedicated read endpoint should be exposed or the current score/read-model endpoint is sufficient.
- Whether the parser tests should be added first or the read-model tests should be prioritized first.
