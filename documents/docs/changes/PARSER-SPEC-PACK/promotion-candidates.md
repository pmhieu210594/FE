# Promotion Candidates

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-22  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-PSP-001 | Parser test matrix and AC traceability map | `docs/architecture/test-map.md` | Preserve the final UT/IT/BB split and the AC-to-test trace used to close this ticket. | High |
| LD-PSP-002 | Scanner snapshot/history separation | `docs/architecture/repository-db-map.md` | Document the run-specific snapshot lookup and avoid future confusion with current inventory semantics. | High |
| LD-PSP-003 | Parser core vs scanner orchestration boundary | `docs/architecture/service-layer-map.md` | Keep the shared parser core and scanner orchestration boundary discoverable for future work. | High |
| LD-PSP-004 | Metadata-only / path-scoped parser reminder | `docs/standards/security.md` | Reuse the boundary that the parser endpoint must stay scoped to `spec-pack.md` and not become a generic file reader. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| RL-PSP-001 | The spec-pack parse endpoint must remain path-scoped to `docs/changes/<TICKET>/spec-pack.md`. | `docs/standards/security.md` | Prevents a future generic file-read regression. | Low |
| RL-PSP-002 | Idempotent reruns must remain keyed by normalized `content_hash`. | `docs/standards/testing.md` | Protects rerun stability and avoids duplicate snapshots. | Low |
| RL-PSP-003 | Historical run artifact queries must read snapshot history, not current inventory. | `docs/standards/database.md` | Prevents run history from drifting when current state changes. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| ST-PSP-001 | Keep AC-to-test traceability mandatory for parser-like backend tickets. | `docs/standards/testing.md` | This ticket was easiest to review once every AC had an explicit UT/IT/BB mapping. |
| ST-PSP-002 | Separate execution evidence from closure synthesis. | `docs/standards/testing.md` | `test-results.md` and `report.md` were clearer when they played different roles. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| AD-PSP-001 | Document the spec-pack parser endpoint and scan-time parser handoff | `docs/architecture/external-interface-map.md` | Makes the path-scoped parser flow easy to rediscover. |
| AD-PSP-002 | Document scanner snapshot/history query semantics | `docs/architecture/repository-db-map.md` | Prevents accidental reuse of current-only views for historical run queries. |
| AD-PSP-003 | Document parser/scanner layer responsibilities | `docs/architecture/service-layer-map.md` | Keeps the parser core, scanner orchestration, and persistence boundary explicit. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-PSP-001 | Hash drift after normalization changes | Line-ending, whitespace, or normalization logic changes without regression coverage | Keep SHA-256/hash regression tests in the parser/scanner slice | Compare rerun hashes on the same fixture |
| FMI-PSP-002 | Historical run lookup accidentally becomes current-only | A future refactor points `getRunArtifacts()` back to current inventory logic | Keep the run-snapshot query isolated in the persistence adapter | Run-specific artifact lookup test |
| FMI-PSP-003 | Commit timestamp traceability disappears | GitHub commit fallback logic returns null again | Keep the commit API fallback and adapter test | Source adapter regression test |
| FMI-PSP-004 | Parser endpoint widens into a generic file reader | Path guard is relaxed or removed | Keep the path guard and negative controller test | Security/review diff check |
| FMI-PSP-005 | Placeholder / AC normalization drifts when template changes | New template variants are added without parser regression updates | Keep placeholder and AC-format cases in the parser test pack | Parser unit test and BB review checklist |

## Not Promoted

| item | reason |
|---|---|
| Generic file-read utility | Contradicts the path-scoped parser boundary and expands security risk. |
| New schema for parser-only state | The final implementation already reuses existing scanner persistence paths. |
| FE-facing parser UI | The ticket is backend-centric; UI is not part of the final contract. |

## Human Approval Required

None at this time.