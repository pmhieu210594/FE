# Codex Independent Review

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-22  
**Author**: Codex  
**Update date**: 2026-06-22  

## Review Input

| artifact/source | status |
|---|---|
| `docs/changes/PARSER-SPEC-PACK/spec-pack.md` | read |
| `docs/changes/PARSER-SPEC-PACK/impl-plan.md` | read |
| `docs/changes/PARSER-SPEC-PACK/review-checklist.md` | read |
| `docs/changes/PARSER-SPEC-PACK/self-review.md` | read |
| `docs/standards/templates/_ticket-template/codex-review.md` | read and updated |
| `.claude/rules/*` | read |
| `EDCAP_BE` diff/status for `PARSER-SPEC-PACK` related files | reviewed |
| Relevant migrations / view definitions (`V160__artifact_scanner.sql`, `V161__artifact_scanner_ticket_status.sql`) | reviewed |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| None | - | No open blockers remain. | The blocker findings from the earlier review no longer appear in the current diff. | - | - |

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| M1 | `EDCAP_BE/src/main/java/com/sdd/platform/application/service/ArtifactScannerService.java` | `computeSha256()` previously did not generate a proper SHA-256 hex value that matched the AC hash requirement. | It has now been fixed to produce a real SHA-256 hex value with UTF-8; the earlier review required a stable hash, and the current implementation matches the spec. | Keep the current implementation; no further change is needed. | UTs already verify that the hash output is stable and in the correct hex format. |
| M2 | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/jdbc/ArtifactScannerJdbcAdapter.java` | `findRunArtifacts()` previously read from the current view, which lost run history. | It has been fixed to read from `tbl_fact_artifact_snapshot` by `connector_run_id`; the result now reflects the correct run history. | Keep the current historical snapshot query. | ITs already verify that the run-history query returns the correct artifacts for the run. |
| M3 | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubArtifactScannerSourceAdapter.java` | `resolveRevision()` previously always returned `committedAt = null` for GitHub sources. | It has been fixed to call the commit API and derive `committedAt` from the commit date; the earlier review has already been addressed. | Keep the current flow that derives `committedAt` from the commit API. | Tests already verify that the commit timestamp is mapped correctly. |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| None | - | No new minor issues. | The current diff no longer contains any minor issue worth calling out. | - |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| None | - | - | - |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP1 | `source_updated_at = null` could be mistaken as an unresolved bug. | It has already been handled in the production adapter; the null value in the earlier review was the old state, not the post-fix result. |

## Missing Evidence

- None.

## Suspicious Assumptions

- None.

## Required Human Decisions

- None.

## Final Verdict

- APPROVE