# Source Availability

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung  
**Update date**: 2026-06-23  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| New source | `docs/changes/PARSER-SELF-REVIEW/spec-pack.md`, `docs/changes/PARSER-SELF-REVIEW/context.md`, `docs/changes/PARSER-SELF-REVIEW/ticket-rules.md`, `docs/changes/PARSER-SELF-REVIEW/raw/requirement.md`, `docs/changes/PARSER-SELF-REVIEW/raw/database-design.md`, `docs/changes/PARSER-SELF-REVIEW/raw/self-review-template.md` | read | high | Ticket owner | Canonical scope, AC, template, and storage constraints for this ticket | drift if an older export is used | always-read |
| DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`, `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql`, `EDCAP_BE/src/main/resources/db/migration/V161__artifact_scanner_ticket_status.sql` | read | high | BE/DB | Reuse-first schema and snapshot / section / evidence support | schema drift or unnecessary migration | required-if-db |
| API spec | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SelfReviewMarkdownParserController.java`, `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java`, `docs/architecture/route-api-map.md`, `docs/architecture/fe-be-contract-map.md` | read | medium | BE/Architecture | Internal parse endpoint and scan contract for the parser pipeline | path-guard or contract drift | verify-with-source |
| Nguyên bản Excel/PPT/PDF | N/A | not-read | medium | Ticket owner | No binary reference is required for this ticket | binary/outdated | extract-first |
| Web/Repo ngoài | `docs/architecture/*.md`, `docs/standards/*.md`, `.claude/rules/*` | read | high | Architecture / Standards / Rules | Backend boundaries, security, logging, and testing policies | stale guidance if ignored | always-read |

## Summary

All mandatory sources are available for Phase 3. The ticket-specific spec, context, rules, and raw template/database design are present, and the current backend source already contains the parser, controller, scanner service, and regression tests needed to analyze impact and plan implementation.

## Unavailable / Partial Sources

- No blocking source gap was found.
- Binary references are not required for this ticket.
- Public FE surface is intentionally absent; the parser remains backend-only.

## Risk Before Implementation

- The main risk is scope drift: the parser must stay rule-based and internal-only.
- The other risk is overreaching into new schema or public API changes when the current design already supports reuse-first parsing and scanner persistence.
- Path-guard behavior and alias normalization must stay strict to avoid turning the parser into a generic Markdown/file reader.

## Required Human Decision

No blocking human decision remains for Phase 3. The default decision is to keep the parser backend-only, internal-only, and reuse-first for persistence.