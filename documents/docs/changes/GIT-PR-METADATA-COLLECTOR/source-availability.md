# Source Availability

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-17  
**Author**:  nk_trung
**Update date**: 2026-06-17  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest ticket spec | `docs/changes/GIT-PR-METADATA-COLLECTOR/spec-pack.md` | read | high | Ticket author | Primary implementation basis and AC source of truth | None after human decisions were closed | always-read |
| Ticket context | `docs/changes/GIT-PR-METADATA-COLLECTOR/context.md` | read | high | Ticket author | Existing code touchpoints, allowed/common components, known constraints | Can become stale if code changes later | always-read |
| Ticket rules | `docs/changes/GIT-PR-METADATA-COLLECTOR/ticket-rules.md` | read | high | Ticket author | Implementation guardrails, stop/ask conditions, review focus | Must stay aligned with spec-pack | always-read |
| Phase 1 source log | `docs/changes/GIT-PR-METADATA-COLLECTOR/sources.md` | read | medium | Ticket author | Source provenance and resolved human clarifications | Not the final implementation contract by itself | support-only |
| Architecture docs | `docs/architecture/` | read | medium | Architecture | Structural guidance and system boundaries | Some pages may lag behind current code | always-read |
| Standards and templates | `docs/standards/`, `docs/standards/templates/_ticket-template/` | read | high | Standards owner | Required structure for artifacts and documentation quality bar | None | always-read |
| Claude rules | `.claude/rules/` | read | medium | Repository rules | Local implementation/review conventions | Can be broad and not ticket-specific | always-read |
| Webhook controller source | `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java` | read | high | BE | Existing webhook entrypoint that must be reused | None | always-read |
| Webhook use case source | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | read | high | BE | Current PR webhook flow, HMAC verification, current scanner integration | Current logic is scanner-oriented, not full collector logic | always-read |
| GitHub integration port/adapter | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestFilesAdapter.java` | read | high | BE | Existing provider integration pattern and currently available GitHub calls | Only files and last-commit time are available today; more fields still need implementation | always-read |
| Artifact Scanner controller and DTOs | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/ArtifactScannerController.java`, `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/ArtifactScannerDtos.java` | read | high | BE | Manual API pattern, DTO style, run response style | Scanner request shape is not a drop-in contract for PR collector | always-read |
| Artifact Scanner persistence | `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ArtifactScannerPersistencePort.java`, `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | read | high | BE | Existing repository lookup and connector run persistence pattern | Scanner persistence does not yet persist full PR metadata | required-if-db |
| Domain role model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/AppUser.java` | read | high | BE | Actual role enum for manual authorization | No `DATA_OPS` enum exists; MVP must use `ADMIN` | always-read |
| DB definition | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql`, `V160__artifact_scanner.sql`, `V161__artifact_scanner_ticket_status.sql`, `V162__drop_legacy_non_tbl_tables.sql` | read | high | DB/BE | Table/enum/index basis for schema and migration planning | Existing PR table shape may not be sufficient for full MVP semantics; verify before coding | required-if-db |
| Legacy DB definition | `EDCAP_BE/src/main/resources/db/migration/V1__init_schema.sql` | read | medium | DB/BE | Historical context only | Legacy table names are not current source of truth | reference-only |
| API DTO examples | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java`, `ArtifactScannerDtos.java` | read | medium | BE | Response DTO patterns and traceId/run response style | Not a direct manual collector contract | verify-with-source |
| Existing tests | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/ArtifactScannerControllerIntegrationTest.java`, scanner persistence tests, governance role tests | read | medium | QA/BE | Good example tests for admin permission, connector run persistence, integration setup | No dedicated PR collector tests exist yet | always-read |
| FE source | `EDCAP_FE/src/` | partial | low | FE | Confirm whether committed FE impact exists | Manual UI is explicitly test-only and not part of committed scope | not-required-for-mvp |
| External GitHub API docs | GitHub REST API reference | not-read | variable | External | Supplemental field-level confirmation during implementation | External drift / auth / scope mismatch | human-intake |
| Binary assets / generated outputs | ZIP binaries, `target/`, `dist/`, `node_modules/`, reports | not-read | low | Generated | Not implementation source of truth | Noise, outdated, large | exclude |

## Summary

The implementation basis is sufficient to proceed to coding. The ticket has a stable spec (`spec-pack.md`), ticket-local rules (`ticket-rules.md`), and concrete existing code touchpoints for webhook handling, GitHub integration, scanner run logging, role enforcement, and current DB tables.

The strongest sources are the ticket-local spec/rules plus backend source and Flyway migrations. Architecture docs and standards are supportive, not authoritative over code. FE source is not required for the committed MVP because the manual test UI is explicitly out of committed scope.

## Unavailable / Partial Sources

- No existing dedicated PR metadata collector module exists yet; implementation must extend current webhook/integration/persistence layers.
- Existing GitHub integration only exposes changed-file paths and last commit timestamp; detailed PR metadata, review summary, commit metadata, and authoritative changed-file statistics still need new adapter methods.
- No committed manual collector API or DTO currently exists; this will be added in implementation.
- No existing PR-level changed-file table exists; a new migration is required.
- External GitHub API field-level details were not treated as source of truth in Phase 3 and must still be confirmed while implementing the adapter.

## Risk Before Implementation

- `tbl_fact_pull_request` already exists, but its current columns do not obviously cover all normalized status/review/timestamp/use-case needs. Migration must remain additive and preserve Artifact Scanner compatibility.
- `tbl_dim_ticket.status` was previously reused for Artifact Scanner convenience. The new collector must not accidentally treat it as PR status.
- `GithubWebhookService` is currently scanner-centric. If the new orchestration is added carelessly, the service can become too large and hard to test.
- GitHub API pagination and error handling can affect synchronous webhook latency. MVP is still synchronous, so adapter calls and persistence sequencing must stay bounded and observable.
- Ticket inference ambiguity must not silently auto-pick the wrong ticket.

## Required Human Decision

None. All Phase 1 and Phase 2 human decisions required for MVP implementation have already been resolved in the current `spec-pack.md` and `ticket-rules.md`.