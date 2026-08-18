# Promotion Candidates

**Ticket ID**: GIT-PR-METADATA-COLLECTOR
**Create date**: 2026-06-18
**Author**: nk_trung
**Update date**: 2026-06-18

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LD-1 | Collector regression test recipe | `docs/standards/testing.md` | Add the targeted Maven slice used for collector/webhook/controller regression so future backend-only metadata tickets can reuse the same verification pattern. | High |
| LD-2 | Webhook-to-collector flow note | `docs/architecture/data-flow-map.md` | Document the final flow `GitHub webhook -> collector -> Artifact Scanner` so the synchronous MVP handoff is easy to rediscover. | Medium |
| LD-3 | Collector note in overview | `docs/architecture/overview.md` | Keep the backend-only collector path visible as an additive ingestion route. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| R-1 | None | N/A | No new rule appears strong enough from this ticket alone; the useful guidance belongs in standards/docs instead. | Low |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| S-1 | Review-state normalization guidance | `docs/standards/database.md` | Record the required `review_state` domain values and the `REVIEW_REQUIRED` fallback to prevent provider/schema drift. |
| S-2 | Collector regression testing note | `docs/standards/testing.md` | Capture the minimal collector/webhook/controller test slice and black-box pass expectation. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| A-1 | GitHub collector flow | `docs/architecture/overview.md` | Add the collector as a first-class ingestion path beside the existing webhook/scanner flow. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-1 | Review-state enum drift between provider and DB | GitHub API introduces or the code reuses a legacy review state such as `COMMENTED` or `REQUESTED` | Normalize to the spec-approved set and add migration/test coverage | Unit test for review-state normalization plus migration validation |
| FMI-2 | Spring test slice conflict | Multiple `@SpringBootConfiguration` classes or over-broad MVC slice setup cause controller tests to fail to start | Use a dedicated minimal Spring test app with explicit exclusions | Focused controller test command in CI/local validation |
| FMI-3 | Collector regression breaks scanner compatibility | Collector orchestration changes alter existing Artifact Scanner behavior | Keep collector additive and run scanner regression after collector changes | Scanner-focused regression tests fail after collector updates |

## Not Promoted

| item | reason |
|---|---|
| CI metadata collector | Explicitly out of scope for this ticket. |
| Raw diff / source storage guidance | Already covered by existing security rules and the spec; no new pattern needed. |
| New rule for manual collect authorization | Existing `ADMIN`-only policy is sufficient; no separate rule is justified yet. |
| Dedicated knowledge doc for this collector | The useful lessons are already captured by the existing architecture/standards updates and the failure-mode index. |

## Human Approval Required

None
