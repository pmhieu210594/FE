# Source Availability

**Ticket ID**: AC-TEST-COVERAGE   
**Create date**: 2026-06-26    
**Author**: OpenAI   
**Update date**: 2026-06-26   

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest source | `docs/changes/AC-TEST-COVERAGE/spec-pack.md` | read | high | Ticket owner | AC definition, scope, and MVP boundary | if spec and source drift, later implementation will map the wrong AC universe | always-read |
| Ticket context | `docs/changes/AC-TEST-COVERAGE/context.md` | read | high | Ticket owner | Current runtime boundary, method inventory, and forbidden areas | if stale, direct/indirect impact will be understated | always-read |
| Ticket rules | `docs/changes/AC-TEST-COVERAGE/ticket-rules.md` | read | high | Ticket owner | Parser-only, reuse-first, and no-manual-mapping guardrails | if skipped, the implementation can easily invent a new surface or mapping | always-read |
| Phase 3 input set | `docs/architecture/`, `docs/standards/`, `.claude/rules/` | read | high | Repo owner | Architecture and engineering constraints for impact analysis and plan | if stale or partially read, the plan may miss cross-cutting constraints | always-read |
| DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | read | high | BE / DB | Canonical schema for AC coverage, test run, evidence event, and data quality | if a later migration changed the same tables, assumptions must be rechecked | required-if-db |
| Current BE parser source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestPlanParseService.java` | read | high | BE | Planned coverage ingestion path and AC validation hook | source already carries the rule logic; a duplicate implementation would be risky | verify-with-source |
| Current BE parser source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestResultsParseService.java` | read | high | BE | Executed evidence ingestion path and AC validation hook | same as above; keep planned vs executed state separate | verify-with-source |
| Current BE validation source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/docparse/TestCoverageValidationService.java` | read | high | BE | Canonical AC mismatch detector | if rewritten elsewhere, the rule becomes inconsistent | verify-with-source |
| Current BE persistence source | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/docparse/TestEvidenceJdbcAdapter.java` | read | high | BE | Writes planned coverage and test run facts | if bypassed, auditability and idempotency are lost | verify-with-source |
| Current BE read-model source | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | read | high | BE | Reads AC/test signal for dashboard scoring | if not reused, dashboard metrics will fork | verify-with-source |
| Current BE service source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | read | high | BE | Aggregates score and downstream read model signals | if duplicated, score logic may diverge from coverage logic | verify-with-source |
| Current BE orchestration source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | read | medium | BE | Batch orchestration and parser triggering | if read as a UI flow, scope will be confused | verify-with-source |
| Current API surface | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/TestPlanParseController.java`, `TestResultsParseController.java`, `EvidenceQualityScoreController.java`, `ArtifactScannerController.java` | read | medium | BE API | Existing controller patterns for parse, score, and admin-only batch entrypoints | no dedicated AC-Test Coverage controller exists yet | verify-with-source |
| Current FE surface | `EDCAP_FE/src/App.tsx`, `EDCAP_FE/src/components/Layout.tsx`, `EDCAP_FE/src/pages/traceability/TraceabilityPage.tsx` | read | medium | FE | Reference for protected routing and current dashboard-like surfaces | there is no dedicated AC-Test Coverage page today | verify-with-source |
| Architecture docs | `docs/architecture/overview.md`, `docs/architecture/repository-db-map.md`, `docs/architecture/route-api-map.md`, `docs/architecture/service-layer-map.md`, `docs/architecture/test-map.md` | read | medium-high | Architecture | Cross-check runtime boundaries and existing patterns | some maps may lag the actual source tree | verify-with-source |
| Standards | `docs/standards/backend.md`, `docs/standards/database.md`, `docs/standards/security.md`, `docs/standards/maintenance.md`, `docs/standards/testing.md` | read | high | Standards owner | Engineering guardrails for reuse, logging, schema, and tests | if not read fully, plan may violate style or audit rules | always-read |
| Internal rules | `.claude/rules/20-architecture.md`, `.claude/rules/30-security.md`, `.claude/rules/40-testing.md` | read | high | Rule owner | Local repo-specific constraints for architecture, security, and testing | missing these rules can invalidate the whole phase plan | always-read |
| API spec | No dedicated AC-Test Coverage API spec in the current repo | unavailable | medium | BE / FE | Dedicated contract for a future dashboard surface | contract must be derived from existing controller/read-model patterns if needed later | verify-with-source |
| Original Excel/PPT/PDF | None identified for this ticket | unavailable | low | N/A | Not a primary source for this ticket | not applicable | not-read |
| External web/repo | Not used | not-read | low | N/A | Internal ticket, internal repository only | injection/outdated | not-read |

## Summary

The key runtime sources needed for Phase 3 are available: the AC spec, ticket rules, V4 schema, parser services, persistence adapter, and score/read-model adapter. The repo already contains the planned and executed evidence pipeline that AC-Test Coverage relies on, so Phase 3 is mainly about freezing the impact boundary and documenting the implementation path rather than inventing a new subsystem.

## Unavailable / Partial Sources

- There is no dedicated AC-Test Coverage API spec yet; any future read endpoint must be derived from the current controller patterns.
- There is no dedicated FE page for AC-Test Coverage today; the current FE only has protected admin/project/customer/repository/team/role/traceability surfaces.
- Some architecture docs are useful but not canonical runtime truth; the source tree and V4 migration remain the final authority.

## Risk Before Implementation

- If a future step introduces manual mapping or FE-side recomputation, the ticket rules will be violated.
- If a future step assumes a new table or a new API contract without checking the current source first, the reuse-first decision will be lost.
- If later source changes are made on top of V4 without rechecking the migration history, the impact analysis can become stale quickly.

## Required Human Decision

- No human decision is required to close Phase 3 itself.
- If the next phase needs a new public read endpoint or a new FE dashboard surface, confirm the preferred placement before coding.
