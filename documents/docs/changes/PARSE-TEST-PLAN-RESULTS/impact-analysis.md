# Impact Analysis

**Ticket ID**: PARSE-TEST-PLAN-RESULTS
**Create date**: 2026-06-19
**Author**: OpenAI
**Update date**: 2026-06-19

## 1. Change Content

- Add a parser for `test-plan.md` and `test-results.md` only.
- Extract the canonical template fields from each file.
- Persist parser snapshots into the existing project DB pattern.
- Support viewing both files as a pair for one ticket in the UI.
- Keep the parser independent from CI / gate logic.

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| `documents/docs/changes/PARSE-TEST-PLAN-RESULTS/test-plan.md` | Source artifact for the parser. | input spec |
| `documents/docs/changes/PARSE-TEST-PLAN-RESULTS/test-results.md` | Source artifact for the parser. | input spec |
| `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` | Reuse existing artifact snapshot tables or add small additive columns/indexes if necessary. | migration / schema reconciliation |
| `EDCAP_BE/src/main/java/com/sdd/platform/...` parser service package | Parser implementation entry point (exact class to confirm). | new / modify |
| `EDCAP_BE/src/main/java/com/sdd/platform/...` repository / adapter package | Snapshot persistence and idempotent upsert. | new / modify |
| `EDCAP_FE/src/pages/...` ticket evidence / artifact page | If pair-view UI is included in the ticket, it must show both test-plan and test-results. | UI change |
| `EDCAP_FE/src/lib/api.ts` | If FE query helpers are required for the pair view. | UI API change |

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| `docs/architecture/repository-db-map.md` | Must reflect the reused artifact snapshot mapping. | low |
| `docs/architecture/route-api-map.md` | Must reflect any new query endpoint if added. | low |
| `docs/architecture/test-map.md` | Must reflect parser tests and pair-view tests if added. | low |
| `docs/standards/testing.md` | May need a reference update if the new parser flow introduces a new evidence pattern. | low |
| Existing artifact parser modules | Could be reused as implementation patterns. | low |

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| PR / push / webhook trigger | Test-plan / test-results parser | Starts parse and snapshot persistence. |
| Parser service | Artifact snapshot repository | Persists parsed snapshot rows and section rows. |
| Parser service | Artifact pair-view query | Retrieves both artifacts for one ticket in the UI. |
| UI ticket detail page | Parser query / snapshot repository | Displays test-plan and test-results together. |

## 5. FE Impact

- The FE may need a ticket detail or evidence page that can show `test-plan.md` and `test-results.md` as a pair.
- The UI should expose parse status, extracted sections, and a clear source path for each artifact.
- No CI-related FE behavior is required for the parser itself.

## 6. BE Impact

- Add parser logic for the canonical fields in `test-plan.md` and `test-results.md`.
- Add or reuse a snapshot persistence layer with idempotent upsert.
- Add validation for missing sections, placeholders, invalid structure, and mapping mismatches.
- Keep the parser independent from CI / gate logic.

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| Parse trigger / ingest endpoint | May accept ticket/source path / parser mode inputs. | Should return parse status, snapshot id, and summary only. | Yes, if a new endpoint is added without changing existing contracts. |
| Pair-view query endpoint | May accept `ticketId`. | Should return both `test-plan` and `test-results` snapshots and parsed sections. | Yes, if additive. |

## 8. DTO / Schema / Validation Impact

- DTOs must represent snapshot metadata and per-section values for both documents.
- Validation must catch missing required template fields and placeholder content.
- Schema must support a snapshot row plus section rows, or equivalent reusable artifact tables.
- The parser should not persist raw markdown beyond what is necessary for short extracts / hashes / summaries.

## 9. DB / Migration Impact

- Reuse the project DB pattern for artifact snapshots instead of creating parse-specific long-lived tables.
- The PoC should persist a snapshot row and section rows for each parsed artifact.
- If existing tables are already present, use additive migration only if a small nullable column or index is missing.
- The parser should store source hash, parser version, snapshot status, and parsed summary for traceability.

## 10. Batch / Job / Event Impact

- The parser is triggered by PR / push / webhook events.
- Parsing is a document-processing task, not a CI-dependent task.
- If the source changes, the parser updates the snapshot idempotently.

## 11. Test Impact

- Unit tests for template-field extraction from `test-plan.md`.
- Unit tests for template-field extraction from `test-results.md`.
- Unit tests for missing section / placeholder / invalid structure detection.
- Integration tests for snapshot persistence and pair-view query.
- Regression tests to confirm parser independence from CI.

## 12. Operation / Monitoring Impact

- Parser runs should log traceId, ticket, source path, parse status, and safe validation errors.
- Snapshot persistence should be observable by ticket and source hash.
- Operations should be able to distinguish parse failures from missing-content issues.

## 13. Rollout / Rollback Impact

- Roll out incrementally: parser extraction first, snapshot persistence second, pair-view UI third.
- Rollback is code-level disablement of the parser entry point or feature flag off.
- Existing snapshot data should remain readable if a later rollback occurs.

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| CI gate logic | unaffected | The parser is explicitly independent from CI. |
| Security / secret handling | unaffected in principle | The source documents are Markdown templates without secret-bearing input. |
| Raw log storage | unaffected | The parser stores hashes / summaries / sections, not raw payloads. |
| Other document parsers | unaffected | This ticket is limited to `test-plan.md` / `test-results.md`. |

## 15. Required Options

- Decide whether the pair-view UI belongs to this ticket or a follow-up ticket.
- Decide the final DB table mapping if existing artifact tables already exist.
- Decide whether the parser should expose a new query endpoint or only write snapshots.

## 16. Human Decision Required

- Final reusable DB table mapping.
- Pair-view UI scope.
- Whether to add a new query endpoint.

## 17. Risk Summary

- Medium risk: DB mapping may need to align with existing artifact snapshot tables.
- Medium risk: pair-view UI scope may expand if not explicitly limited.
- Low risk: parser field extraction is straightforward because the template field set is known.
