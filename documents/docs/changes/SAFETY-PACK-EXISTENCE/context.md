# Context

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Screen / API / Batch / Related Job

| type | item | route/path | note |
|---|---|---|---|
| API | Internal CI evidence ingest | `POST /api/v1/internal/security-evidence/github-actions` | Primary ingestion endpoint for normalized summary v1. |
| API | Safety Pack list | `GET /api/v1/admin/safety-packs` | Authenticated roles. |
| API | Security Scan list | `GET /api/v1/admin/security-scans` | Authenticated roles. |
| Batch / Job / Connector | GitHub Actions security workflow | `.github/workflows/security-evidence.yml` | Produces normalized summary v1 and pushes it to BE. |
| Batch / Job / Connector | `safety_pack_local` | existing admin connector run path | Reuse existing connector run pattern if present. |

## Example of a correctly implemented code

| purpose | file/path | pattern to follow |
|---|---|---|
| BE controller style | `src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | Reuse current controller and response style. |
| Safety Pack scan logic | `src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Read local `.claude` sources and compute counts/status. |
| GitHub snapshot scan logic | `src/main/java/com/sdd/platform/application/usecase/ingestion/GithubSecurityEvidenceSnapshotService.java` | Resolve `.claude` content from the repository tree and push normalized evidence. |
| Normalized ingest | `src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | Parse payload and persist only normalized values with retry-safe upsert behavior. |
| Existing Flyway migration pattern | BE source | Additive migration only. |

## Allowed common components

| component | path | usage note |
|---|---|---|
| Existing admin API patterns | BE source | Reuse current controller/service/persistence conventions. |
| Existing permission guard | BE source | Ensure authenticated access is consistent across roles. |
| Existing workflow pattern | `.github/workflows/` | Use the current CI publishing pattern. |

## Forbidden common components

| component | reason |
|---|---|
| Non-`tbl_` tables | Forbidden by ticket rule. |
| `_ticket-template` security evidence parsing | Not a real scanner source. |
| Raw secret/token/private-key storage | Security/privacy violation. |
| Security Exception UI/API | Deferred out of this ticket. |

## List of methods that actually exist

| method/class | path | usage |
|---|---|---|
| `SafetyPackService` | `src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Scan `.claude` content and compute status. |
| `SecurityEvidenceIngestService` | `src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | Normalize incoming CI evidence. |
| `SecurityEvidenceController` | `src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | Expose evidence APIs. |

## Forbidden methods / methods that do not exist

| method/API | reason | alternative |
|---|---|---|
| `getSecretScanReportFromTicketTemplate()` | Invented source | Use GitHub Actions normalized summary v1. |
| `parseSastReportFromDocsChanges()` | Invented source | Use normalized ingest parser. |
| `downloadGithubArtifactAsPrimaryFlow()` | Not the selected flow | Use push-to-BE from GitHub Actions. |
| `GET /api/v1/admin/security-exceptions` | Out of scope for this ticket | Use Safety Pack and Security Scan only. |

## DTO / Entity / Table / Migration mapping

| layer | name | path | Note |
|---|---|---|---|
| DTO / model | SafetyPackStatus | BE domain/application | Maps Safety Pack scan results. |
| DTO / model | SecurityScanSummary | BE domain/application | Maps normalized scan summary. |
| Table | `tbl_fact_safety_pack_status` | BE persistence | Additive only. |
| Table | `tbl_fact_security_scan` | BE persistence | Summary storage only unless detail later approved. |
| Table | `tbl_dim_project`, `tbl_dim_repository`, `tbl_dim_ticket`, `tbl_fact_pull_request`, `tbl_fact_ci_run`, `tbl_connector_run`, `tbl_dim_role` | BE persistence | Reuse existing relationship patterns. |

## formItemNm / SEQNO / Master Data / Code Value Mapping

| display/item | internal value | source | note |
|---|---|---|---|
| SafetyPackStatus | `READY`, `WARNING`, `MISSING`, `PARSE_ERROR` | BE enum / constant | Use enum or constant pattern. |
| SettingsParseStatus | `OK`, `MISSING`, `ERROR` | BE enum / constant | Summary parser status. |
| ScanType | `SECRET`, `SAST`, `SCA` | BE enum / constant | CI security scan type. |
| ScanStatus | `PASS`, `FAIL`, `WARNING`, `ERROR`, `NOT_AVAILABLE` | BE enum / constant | Normalized scan status. |

## Multilingual Note

No frontend localization work is in scope for this ticket.

## Encoding / Mojibake Note

Read markdown and JSON files as UTF-8 and avoid breaking mixed Vietnamese / English content in docs.

## Log / Audit / Operation Note

- Log only metadata, counts, repository, commit SHA, PR number, workflow run id, and status.
- Never log raw secret values, tokens, private keys, or raw sensitive findings.
- Internal GitHub Actions ingestion failures must be traceable by safe identifiers only.
- Missing GitHub Actions evidence should be represented safely without crashing.

## Ticket-Specific Constraints

- Local Safety Pack source order is `documents/.claude/` then `.claude/`.
- GitHub tree snapshot resolution accepts nested `.claude/` content in the repository tree and falls back to root `.claude/` when needed.
- Security Exception management is deferred.
- Only approved `tbl_` tables may be used.
- Duplicate CI evidence pushes must update the existing row rather than insert a second copy.
