# Sources

**Ticket ID**: AC-TEST-COVERAGE
**Create date**: 2026-06-26  
**Author**: OpenAI
**Update date**: 2026-06-26

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| User request / ticket body | conversation context | read | Clearly states Phase 1: Investigation / Spec Pack and the scope for AC-Test Coverage |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition for evidence platform | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02(21).md` | read | high | Source describing MVP, Dashboard, AC-Test Coverage, and the metadata-only principle |
| Existing ticket template | `docs/standards/templates/_ticket-template/*` | read | high | Original template that this work must follow |
| Architecture overview | `docs/architecture/overview.md` | read selectively | high | Overall context |
| Source inventory | `docs/architecture/source-inventory.md` | read selectively | high | Identifies which sources should be read |
| Repository-DB map | `docs/architecture/repository-db-map.md` | read selectively | high | Confirms reuse-first on the existing schema |
| FE/BE contract map | `docs/architecture/fe-be-contract-map.md` | read selectively | medium | Affects the Dashboard read model |
| Test map | `docs/architecture/test-map.md` | read selectively | medium-high | Useful for test strategy |
| Backend standard | `docs/standards/backend.md` | read selectively | medium-high | Layer boundaries and hexagonal design |
| Database standard | `docs/standards/database.md` | read selectively | medium-high | Flyway / schema conventions |
| Security standard | `docs/standards/security.md` | read selectively | high | Metadata-only, no raw prompt/chat |
| Maintenance standard | `docs/standards/maintenance.md` | read selectively | medium | Batch, run log, troubleshooting |
| `.claude` rules | `.claude/rules/*.md`, `.claude/settings.json` | read | high | Local rules, safety, and style constraints |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| AC lookup port | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AcCoveragePort.java` | read | Reads existing AC keys |
| AC lookup adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/AcCoverageJdbcAdapter.java` | read | SQL for AC lookup |
| Coverage validation service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | read | Validation boundary for coverage |
| Test plan parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | read | Planned coverage parser |
| Test results parser | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | read | Executed evidence parser |
| Test evidence persistence | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/TestEvidencePersistencePort.java` | read | Persists coverage/evidence metadata |
| Test evidence JDBC adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | read | Writes into the existing fact tables |
| Evidence quality scoring | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | read | Uses AC/test evidence to compute the score |
| Evidence quality repository adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | read | Aggregates coverage and CI linkage |
| V4 schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | Canonical MVP schema |
| CI metadata migration | `EDCAP_BE/src/main/resources/db/migration/V200__ci_run_metadata.sql` | read selectively | Fields/indexes for CI summary |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit tests | `EDCAP_BE/src/test/java/...` | partially read | Used as an implementation reference |
| BE integration tests | `EDCAP_BE/src/test/java/...` | partially read | Useful for parser-to-DB flow |
| FE tests | `EDCAP_FE/src/...` | not required for Phase 1 | Relevant only for the Dashboard surface in later phases |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| No external web source | N/A | Not used in Phase 1 | Internal repository sources are sufficient |

## Excluded Sources

| source/path | reason |
|---|---|
| Black-box coverage artifacts | Out of scope for MVP after user clarification |
| Raw chat logs / raw prompt logs | Prohibited by design |
| Full source code text outside relevant files | Not needed for Phase 1 |
| Tables before V4 | Not the canonical design for this ticket |

## Source Limitations

- The repository already has implementation paths for AC coverage, but they have not been packaged into a single canonical spec.
- The Dashboard coverage card and ticket detail will read in an AC -> test cases direction.
- `test-plan.md` is the sole source of test cases, while `test-results.md` and `CI summary` are supporting evidence only.
- The read model prioritizes ACs, not test cases.

## Assumptions from Sources

- `spec-pack.md` is the official AC source for this ticket.
- `test-plan.md` is the sole source of test cases.
- `test-results.md` is the source of executed evidence; `CI summary` is supporting evidence only.
- The existing V4 schema is sufficient for MVP.
- Black-box parsing is not part of MVP.
- Manual mapping/pinning is not part of MVP.

## Human Confirmation Required

No open human confirmation is required for Phase 1. The following decisions are already closed:

- Coverage will be shown as `AC -> test cases`.
- `MISSING`, `UNTESTED`, `PARTIAL`, `PASSED`, `FAILED` are the UI statuses to keep.
- The API/read model should prioritize AC.
- `First CI Pass` and `Exception` are included in the MVP spec-pack as supporting KPIs.
- AC-Test Coverage is part of the Dashboard; the UI is only a surface for testing/verification.