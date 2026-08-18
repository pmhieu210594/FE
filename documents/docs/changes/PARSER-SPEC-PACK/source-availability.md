# Source Availability

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-19  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest source | `docs/changes/PARSER-SPEC-PACK/spec-pack.md` | read | high | Ticket owner | Single source of truth for the scope/AC/trace of this phase | drift if an older export is used | always-read |
| Ticket context | `docs/changes/PARSER-SPEC-PACK/context.md` | read | high | Ticket owner | Finalizes the screens/APIs/jobs/files/methods that are actually related | wrong context will distort the implementation scope | always-read |
| Ticket rules | `docs/changes/PARSER-SPEC-PACK/ticket-rules.md` | read | high | Ticket owner | Constraints that cannot be crossed during implementation | ignoring rules will break the template or scope | always-read |
| Raw requirement | `docs/changes/PARSER-SPEC-PACK/raw/requirement.md` | read | high | BA/Owner | Source of truth for AC, draft/official flow, and business goals | using a different requirement version will break AC mapping | always-read |
| Raw database design | `docs/changes/PARSER-SPEC-PACK/raw/database-design.md` | read | high | DB/Backend | Source of truth for reuse schema, table/seed/JSONB mapping | misunderstanding it may generate unnecessary migrations | required-if-db |
| Raw template | `docs/changes/PARSER-SPEC-PACK/raw/spec-pack-template.md` | read | high | Ticket owner | Standard template for sections/headers/tables | a wrong template will make the parser/plan drift from the standard | always-read |
| Architecture docs | `docs/architecture/*.md` | read | medium | Architecture | Confirm ingest flow, routes/APIs, service layer, DB map, and test map | some mappings may be stale compared with current source | verify-with-source |
| Backend standards | `docs/standards/backend.md` | read | high | Standards owner | Layer/boundary/package constraints for the backend | architecture rule violation | always-read |
| Database standards | `docs/standards/database.md` | read | high | Standards owner | Reuse-first / migration / idempotency constraints | drifting away from DB reuse-first | always-read |
| Security standards | `docs/standards/security.md` | read | high | Standards owner | Path guard, secret hygiene, raw content minimization | risk of file-read primitive / data leakage | always-read |
| Logging standards | `docs/standards/logging.md` | read | medium | Standards owner | TraceId, audit, warning/error logging | insufficient audit for parse runs | always-read |
| Testing standards | `docs/standards/testing.md` | read | high | Standards owner | Unit/integration/regression strategy for the parser | missing coverage against AC | always-read |
| Architecture rules | `.claude/rules/20-architecture.md` | read | high | Rule owner | Keep layer dependency and boundaries correct | cross-layer / wrong boundary issues | always-read |
| Security rule | `.claude/rules/30-security.md` | read | high | Rule owner | Do not store raw prompt/chat/source code; reduce surface area | internal data leakage | always-read |
| Testing rule | `.claude/rules/40-testing.md` | read | high | Rule owner | AC must be mapped to tests | missing test traceability | always-read |
| Current backend parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | read | high | BE | Existing Markdown parser baseline for the strict spec-pack parser | currently too lenient for spec-pack | verify-with-source |
| Current scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | read | high | BE | Existing ingest/run flow, where parser and persistence will be attached | scan flow may need an extra parse step | verify-with-source |
| Current scanner persistence | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | read | high | BE/DB | Persistence pattern for snapshot/run/current inventory | may need expansion if parsed sections/AC are written | verify-with-source |
| Current parse API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | read | medium | BE | DEV-only endpoint to try parsing `spec-pack.md` | must not become a general file-read endpoint | verify-with-source |
| Current scanner API | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java` | read | medium | BE | Existing admin endpoint for scan/run/current inventory | contract can remain unchanged if only internals change | verify-with-source |
| Current tests | `EDCAP_BE/src/test/java/com/sdd/platform/...` | partial | medium | QA | No parser-specific test yet; current tests focus on webhook/security/integration cases | clear parser test gap | verify-with-source |

## Summary

The currently available sources are sufficient to move into Phase 4 without further speculation about scope or AC. The main source set is `spec-pack.md` + `context.md` + `ticket-rules.md` + the raw requirement/database-design files; the architecture/standards documents and current source code are used only to lock the impact scope and implementation approach in the real system.

## Unavailable / Partial Sources

- No dedicated parser for `spec-pack.md` is visible in the current source; only the baseline Markdown parser `ArtifactNormalizer` exists.
- No dedicated test for the spec-pack parser is visible; the current tests focus on other webhook/security/persistence areas.
- There is no current FE caller for the parser/scanner; the FE is in a state with no new contract.
- If the target branch lacks the `ARTIFACT_SCANNER` or `SPEC_PACK` seed, the existing migrations/seeds should be rechecked before implementation, but these seeds already exist in the current repository.

## Risk Before Implementation

- If the existing parser is reused without enforcing the standard template, section/AC mapping will drift from the requirement.
- If the parser logic is changed but the persistence adapter is untouched, the parsed output will not flow into the existing reuse tables.
- If tests only cover the parse endpoint and not the scan flow, draft/official states and idempotency will be missed.
- If a new schema/migration is added by mistake, it will violate the reuse-first database design.

## Required Human Decision

No new manual decision is needed for Phase 3; the standard template and heading policy have already been locked to **accept only the standard template**.