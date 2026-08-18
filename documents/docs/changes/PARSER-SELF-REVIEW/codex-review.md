# Codex Independent Review

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: Codex  
**Update date**: 2026-06-23  

## Review Input

| artifact/source | status |
|---|---|
| docs/changes/PARSER-SPEC-PACK/spec-pack.md | read |
| docs/changes/PARSER-SPEC-PACK/impl-plan.md | read |
| docs/changes/PARSER-SPEC-PACK/review-checklist.md | read |
| docs/changes/PARSER-SPEC-PACK/self-review.md | read |
| docs/changes/PARSER-SPEC-PACK/raw/requirement.md | read |
| docs/changes/PARSER-SPEC-PACK/raw/database-design.md | read |
| docs/standards/templates/_ticket-template/codex-review.md | read |
| docs/standards/testing.md | read |
| .claude/rules/ | read |
| Diff / source files for SpecPack parser and controller | read |

Diff summary: replaced the Markdown parser for `spec-pack.md`, added inline/file parse controllers, added a shared parser core, and expanded unit/controller tests for front matter, placeholders, line endings, and path guards.

## Findings

### Blocker

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|

### Major

| ID | file/path | finding | evidence | suggested fix | test proposal |
|---|---|---|---|---|---|
| M-1 | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | `parseFile()` currently allows any path containing `/changes/` and ending in `/spec-pack.md`, instead of locking strictly to `docs/changes/<TICKET>/spec-pack.md` as required by the spec. | `spec-pack.md:20-23,81-83`; `SpecPackMarkdownParserController.java:40-57`. The current test also shows that `target/test-fixtures/changes/.../spec-pack.md` is accepted (`SpecPackMarkdownParserControllerTest.java:28-49`). | Tighten the guard so it accepts only `docs/changes/<TICKET>/spec-pack.md`, and verify canonical/parent paths clearly before reading the file. | Add negative tests for `target/test-fixtures/changes/...` and `other/changes/...`; confirm the endpoint rejects paths outside the `docs/changes` tree. |
| M-2 | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` / `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | The `ci_status_at_parse` input is missing, so the parser cannot fully implement the rule that an official parse should only finalize when PR + CI pass. | `spec-pack.md:91-104,132-133`; the parser signature only accepts `content/sourcePath/parseMode` (`SpecPackMarkdownParser.java:90-100,454-463`), and the request DTO also has no CI field (`SpecPackMarkdownParserController.java:32-39,93-95`). | Add `ciStatusAtParse` to the request/API and use it in the OFFICIAL finalization decision; if CI fails or is unknown, keep the output as draft/partial as specified. | Add UT/IT coverage for `ciStatusAtParse=fail` or `pending` to verify that no OFFICIAL snapshot is produced. |

### Minor

| ID | file/path | finding | evidence | suggested fix |
|---|---|---|---|---|
| m-1 | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | The summary flag `has_traceability_detected` checks the wrong key, so it is always false. | `buildParsedSummary()` uses `ASSUMPTIONS_INFERENCE_LOG` (`SpecPackMarkdownParser.java:448-450`), while the canonical key and required key are both `ASSUMPTIONS_INFERENCE_LOG` (`SpecPackMarkdownParser.java:63-64,392`). | Change the key to `ASSUMPTIONS_INFERENCE_LOG` and add a UT for this section. |

### Question

| ID | question | related spec | required decision |
|---|---|---|---|
| Q-1 | Is `parseFile()` dev-only, or is it allowed for internal runtime use? If it is runtime-facing, the path guard needs stricter authz/allow-list handling. | `spec-pack.md:20-23,81-83`; `SpecPackMarkdownParserController.java:40-57` | Confirm the operating scope so the path guard can be tightened appropriately. |

### False Positive Candidates

| ID | finding | reason |
|---|---|---|
| FP-1 | `parseStatus = PARTIAL` in the current fixture/test | This is because the spec-pack fixture contains placeholders, so the parser returns PARTIAL; that behavior matches the spec and the existing tests. |

## Missing Evidence

- No negative test was found for `ci_status_at_parse=fail/pending`.
- No negative test was found for a path outside `docs/changes/<TICKET>/spec-pack.md`.
- No test was found for `has_traceability_detected` when the `Assumptions and Inference Log` section is present.

## Suspicious Assumptions

- It is assumed that `parseFile()` may be called outside a local/dev environment, so the path guard should be tightened according to the spec rather than only relative to the working tree.
- It is assumed that downstream consumers may use `parsedSummary.has_traceability_detected`; if they do not, the impact of m-1 is lower.

## Required Human Decisions

- Decide whether `parseFile()` should be hard-locked to the exact `docs/changes/<TICKET>/spec-pack.md` tree or continue to accept any `*/changes/*/spec-pack.md`.
- Decide whether `ci_status_at_parse` should be added to the parser contract in this ticket or handled in another orchestration layer.

## Final Verdict

- NEEDS_UPDATE
