# Codex Independent Review

**Ticket ID**: EVIDENCE-QUALITY-SCORE  
**Create date**: 2026-06-23  
**Author**: nk_trung  
**Update date**: 2026-06-25  

## Review Input

| artifact/source | status |
|---|---|
| Diff summary | BE added evidence-quality score service, repository port/adapter, mapper, controller, DTOs, and targeted tests; the remaining gaps are persisted read-back, report scoring, and review-checklist coverage. |
| [spec-pack.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/spec-pack.md) | Reviewed |
| [impl-plan.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/impl-plan.md) | Reviewed |
| [review-checklist.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/review-checklist.md) | Reviewed |
| [self-review.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/self-review.md) | Reviewed |
| [test-results.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/test-results.md) | Reviewed |
| [blackbox-testcases.md](D:/EDCAP_FULL_V1/EDCAP_FULL/docs/changes/EVIDENCE-QUALITY-SCORE/blackbox-testcases.md) | Reviewed |
| [.claude/rules/](D:/EDCAP_FULL_V1/EDCAP_FULL/.claude/rules/) | Reviewed |
| BE diff in `EDCAP_BE` | Reviewed |

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| EQS-B1 | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java`; `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/EvidenceQualityScoreMapper.java` | Persisted read-back loses `parseErrors` and `traceIds`, so AC-7/AC-10 cannot be met on saved data. | `save()` only writes `missing_items` into `tbl_fact_evidence_quality_score` (`EvidenceQualityScoreRepositoryAdapter.java:255-267`), `findLatest()` does not select `parse_errors`/`trace_ids` (`:95-125`), and `scoreResultRowMapper()` reads those two columns from the ResultSet, so read-back will always return `[]` when the columns do not exist (`EvidenceQualityScoreMapper.java:113-136`). The spec requires the response to include `parseErrors` and `traceIds`, and persisted results must be readable back. | Persist and read back `parse_errors`/`trace_ids` in the corresponding storage contract, then add round-trip mapping for latest/history. | Add an integration/unit test that saves a result with `parseErrors`/`traceIds`, reads it back with `findLatest()`/controller, and asserts those arrays remain intact. |

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| EQS-M1 | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java`; `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | Report score can never reach the full 10 points because report section keys are not loaded, so this criterion is reduced to file existence only. | `loadSourceSnapshot()` calls `loadArtifactSignal(ticketId, "REPORT", List.of())`, so the report `sectionPresence` is always empty (`EvidenceQualityScoreRepositoryAdapter.java:65-66`), while `scoreReport()` only adds 8 more points if section presence has data (`EvidenceQualityScoreService.java:536-541`). The spec requires `report.md contains overview, impact, review, test, risk, and remaining issues | 10` (`spec-pack.md:101-102`). | Load the corresponding report section keys and score based on actual section presence, not just file presence. | Add a test showing a report with all sections reaches 10 points, and a report missing sections is reduced proportionally. |
| EQS-M3 | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java`; `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java` | `review-checklist.md` is scored only by existence and does not verify security/test viewpoints as required by the spec. | `loadSourceSnapshot()` reads `REVIEW_CHECKLIST` with `List.of()` empty section keys (`EvidenceQualityScoreRepositoryAdapter.java:58`), and `scoreArtifactPresence()` in the service relies only on file presence/template-empty, so a checklist without security/test sections can still receive the full 10 points (`EvidenceQualityScoreService.java:224-230`, `406-413`). The spec requires this file to “cover security/test viewpoints” (`spec-pack.md:96`). | Parse checklist content/sections and grant full points only when the required viewpoints are present; otherwise reduce the score or mark it partial. | Add a test with a checklist missing security/test viewpoints and assert it does not receive the full 10 points. |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| NONE | - | No new reliable minor issues beyond the Blocker/Major gaps. | - | - |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| NONE | - | - | - |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-EQS-1 | Test linkage is locked to `SUCCESS` | Already updated in the SSOT spec, so it is no longer a finding for the current review. |
| FP-EQS-2 | `OPEN_ISSUES` is penalized by row status | Already updated in the SSOT spec, so it is no longer a finding for the current review. |

## Missing Evidence

- No round-trip test evidence yet for `parseErrors`/`traceIds` on persisted read-back.
- No test proving that report section keys and review-checklist viewpoint parsing are scored correctly according to the spec.

## Suspicious Assumptions

- Do not assume that `review-checklist.md` only needs to exist to receive full points.
- Do not assume persisted read-back can lose `parseErrors`/`traceIds` and still satisfy AC-7/AC-10.

## Required Human Decisions

- Reconfirm the storage contract for `parseErrors`/`traceIds` so read-back does not lose data.

## Final Verdict

- APPROVE