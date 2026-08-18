# Self Review

**Ticket ID**: ARTIFACT-SCANNER  
**Create date**: 2026-06-16  
**Author**: nk_trung  
**Update date**: 2026-06-16

## 1. Implementation Summary

The Artifact Scanner was implemented as a metadata-only component on the V4 schema. The scanner writes runs/snapshots to V4, supports current inventory and manual/API verification, and does not depend on full content persistence.
The scanner looks up repositories from `tbl_dim_repository` and no longer depends on legacy tables. `push` is treated as an ignored event if a related webhook flow exists.

The scanner currently stores only the metadata required for parser handoff: path, hash, size, updated time, scan status, message, and `needParse`. When a ticket path is valid but does not yet exist in `tbl_dim_ticket`, the scanner upserts a minimal ticket and continues scanning. `TICKET_SCOPED` scans only files under the specified ticket, while phase0 runs only in `FULL` mode.

The test/manual view has been reduced to a read-only form used to enter `repositoryId`, open current inventory, and view the run summary plus artifact result when UI support is needed.

## 2. Specification/AC Matching

| AC ID | status | evidence |
|---|---|---|
| AC-ARTIFACT-SCANNER-1 | PASS | `GithubWebhookServiceTest.pull_request_opened_triggers_artifact_scan_and_ticket_upsert` triggers a scan when a PR is opened. |
| AC-ARTIFACT-SCANNER-2 | PASS | The scanner derives the ticket from the path `docs/changes/<TICKET>/...` using the GitHub PR files API. |
| AC-ARTIFACT-SCANNER-3 | PASS | Artifact type mapping by filename is tested using the `ArtifactTypeScope` fixture. |
| AC-ARTIFACT-SCANNER-4 | PASS | Missing artifacts are reflected as `MISSING`, and ticket-scoped unknown tickets are auto-upserted before scanning continues. |
| AC-ARTIFACT-SCANNER-5 | PASS | The snapshot returns all required fields: `sourcePath`, `contentHash`, `sizeBytes`, `sourceUpdatedAt`, `scanStatus`, and `scanMessage`. |
| AC-ARTIFACT-SCANNER-6 | PASS | Re-scanning after changing `spec-pack.md` shows that the hash changed and `needParse=true`. |
| AC-ARTIFACT-SCANNER-7 | PASS | `needParse` is enabled for new/changed artifacts and is not enabled for unchanged files. |
| AC-ARTIFACT-SCANNER-8 | PASS | `FULL` scan also scans the fixed file set under `docs/maintenance/phase0/`; `TICKET_SCOPED` does not scan phase0. |
| AC-ARTIFACT-SCANNER-9 | PASS | Run logs are written through the V4 `tbl_connector_run` path; the scan test returns a successful `ScanRun`. |
| AC-ARTIFACT-SCANNER-10 | PASS | The scanner does not store full Markdown content; it only stores metadata/hash and source references. |
| AC-ARTIFACT-SCANNER-11 | PASS | The API/manual test flow displays the summary and artifact result. |

## 3. List of Changed Files

| file | summary | reason |
|---|---|---|
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/ArtifactScannerSourcePort.java` | Port for reading tree/blob/revision data from the GitHub source | Decouples the data source from the scanner |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubArtifactScannerSourceAdapter.java` | GitHub API adapter for the scan source | Resolves ref/sha, tree, and blob |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Core scanner service using the GitHub API | Removes local checkout dependency and scans metadata-first |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/GithubPullRequestFilesPort.java` | Port for retrieving the PR file list from the GitHub API | Derives ticket scope from PR files |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubPullRequestFilesAdapter.java` | GitHub API adapter for reading the PR file list and commit time | Supports ticket-scope trigger and last commit lookup |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java` | Triggers scan from `pull_request.opened/synchronize/reopened` and updates PR ticket state | Enables automatic GitHub webhook triggering |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/gitlocal/GitLocalConnector.java` | Safely disables the local connector flow | Prevents the local root from being tied to the scan flow |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/resources/application.yml` | Removes `APP_GIT_LOCAL_ROOT` from scanner configuration | Scanner no longer depends on a local checkout |
| `D:/EDCAP_FULL/EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` | Adds `pr_status` and `last_commit_at` to `tbl_dim_ticket` | Persists PR state for webhook-triggered tickets |
| `D:/EDCAP_FULL/EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerServiceTest.java` | Unit tests using a fake GitHub source | Verifies scan logic without filesystem dependency |
| `D:/EDCAP_FULL/EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookServiceTest.java` | Webhook tests for PR opened/synchronize/reopened/closed and ignored push events | Verifies event routing |
| `D:/EDCAP_FULL/docs/changes/ARTIFACT-SCANNER/self-review.md` | Handoff evidence and final review state | Ticket documentation |

## 4. Run Commands and Results

| command | result | note |
|---|---|---|
| `mvn test "-Dtest=GithubWebhookServiceTest,ArtifactScannerServiceTest"` | PASS | BE scanner and webhook tests passed after the GitHub API refactor. |
| `mvn test "-Dtest=GithubWebhookServiceTest,ArtifactScannerServiceTest"` | PASS | BE scanner verification passed. |
| Manual/API verification | PASS | Scan summary and artifact result were checked through the API/manual flow. |

## 5. Self-Check using Review Checklist

| checklist area | result | note |
|---|---|---|
| UI/manual access | PASS | The view is inventory-only and used only for manual verification when needed. |
| BE/API | PASS | The scanner metadata flow is DB-backed and current inventory is available from V4. |
| DB/Migration | PASS | The scanner uses the V4 schema, run/snapshot storage, and current inventory view. |
| Security/Privacy | PASS | No full Markdown persistence; no local checkout is required in the scanner flow. |
| Test | PASS | Targeted BE tests passed; manual/API verification was previously verified. |

## 6. Test Plan Corresponding Status

- BE scanner path test: PASS
- BE webhook trigger test: PASS
- Manual/API verification and BE tests: PASS
- Manual live GitHub webhook end-to-end on a real repository: pending external setup

## 7. Bugs Found and Resolved

| bug | cause | fix | test |
|---|---|---|---|
| Scanner still depended on local repo checkout | The old implementation read from `APP_GIT_LOCAL_ROOT` | Moved the scan source to the GitHub API adapter and removed local-root config from the scanner flow | `mvn test "-Dtest=GithubWebhookServiceTest,ArtifactScannerServiceTest"` |
| GitHub webhook still looked up the legacy repository table | The event handler used the `repository` table instead of the V4 scanner repository scope | Switched GitHub webhook repo lookup to `tbl_dim_repository` through scanner persistence | `mvn test "-Dtest=GithubWebhookServiceTest,ArtifactScannerServiceTest"` |
| Webhook still triggered on push | The event handler reacted to both `push` and `pull_request` | `push` is ignored; only supported PR actions trigger scans | `GithubWebhookServiceTest` |
| PR scope was not derived from changed files | The webhook had no GitHub PR files integration | Added the PR files adapter and ticket scope extraction from `docs/changes/<TICKET>/...` | `GithubWebhookServiceTest` |
| Webhook scan was passing a branch string instead of revision context | The event handler did not extract the SHA from the payload | `pull_request` uses `pull_request.head.sha` with fallback | `GithubWebhookServiceTest` |
| PR ticket state was not persisted | Ticket upsert only stored title/external key | Added `pr_status` and `last_commit_at` columns and webhook upsert mapping | `GithubWebhookServiceTest` |
| `TICKET_SCOPED` was also scanning phase0 files | Phase0 scan was executed unconditionally | Phase0 scan now runs only in `FULL` mode | `ArtifactScannerServiceTest.ticket_scoped_scan_auto_creates_missing_ticket_and_continues` |

## 8. Unprocessed / Pending / Accepted Risk

| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Live GitHub webhook end-to-end on a public repo | Requires a configured webhook URL, secret, and reachable backend | External verification is still needed before production rollout | Implementation owner | When webhook setup is ready |
| Repository mapping must match GitHub `owner/repo` naming | The scanner resolves the source repo by masked name | If DB seed/mapping is inconsistent, webhook-triggered scans will not find the repo | Implementation owner | Before release |

## 9. Exception Record

| exception_type | source_section | reason | approved_by_role | expiry | follow_up | owner | status |
|---|---|---|---|---|---|---|---|
| `REPO_NAME_MAPPING_RISK` | Section 1, Section 8 | Scanner resolves the source repository by `repo_name_masked` instead of the native GitHub `owner/repo`; a mismatch causes webhook-triggered scans to silently fail to find the repo | Tech Lead | N/A | Verify DB seed/mapping matches GitHub `owner/repo` before production rollout | Implementation owner | OPEN |
| `WEBHOOK_PAYLOAD_FALLBACK` | Section 1, Section 7 | Some webhook payloads may omit `after` or `head.sha`; revision resolution falls back to a branch reference, which could scan an outdated ref | Tech Lead | N/A | Monitor webhook logs for fallback usage during live rollout | Implementation owner | OPEN |
| `INVENTORY_DEDUP_KEY_RISK` | Section 1 | The current inventory view relies on a correct deduplication key on snapshots; an incorrect key could surface an older snapshot instead of the latest | Tech Lead | N/A | Add a regression check on the dedup key before wider adoption | Implementation owner | OPEN |

## 10. Items Reviewed by Humans

- Awaiting independent review after implementation.

## 11. Final Self-Verdict

- PASS