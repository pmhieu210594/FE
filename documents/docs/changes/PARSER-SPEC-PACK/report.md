# Final Report

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-22  

## 1. Edited summary

- Implemented a dedicated Markdown parser for `spec-pack.md` with a shared core and a spec-pack envelope, so the ticket can be parsed consistently from template structure instead of ad-hoc logic.
- Wired the scanner flow to parse spec-pack content during the artifact scan path and persist parsed artifacts, sections, AC rows, and evidence events.
- Fixed the review findings by restoring a real SHA-256 hash path, reading run artifacts from historical snapshot storage, and resolving `committedAt` from the GitHub commit API.
- Synchronized the review/test artifacts after the code fix so the final report, review docs, and test results are aligned.

## 2. Corresponding specification / AC
| ACID | status | evidence |
|---|---|---|
| AC-PARSER-SPEC-PACK-1 | DONE | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java`, `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` |
| AC-PARSER-SPEC-PACK-2 | DONE | Front matter priority is covered by `SpecPackMarkdownParserTest` and parser envelope output |
| AC-PARSER-SPEC-PACK-3 | DONE | Section extraction is implemented in `SpecPackMarkdownParser.java` and covered by parser unit tests |
| AC-PARSER-SPEC-PACK-4 | DONE | Table extraction is covered by parser output assertions in `SpecPackMarkdownParserTest` |
| AC-PARSER-SPEC-PACK-5 | DONE | Acceptance criteria normalization/counting is covered by parser tests and scanner persistence outputs |
| AC-PARSER-SPEC-PACK-6 | DONE | Invalid AC format warning handling is covered by parser tests |
| AC-PARSER-SPEC-PACK-7 | DONE | Placeholder detection and incomplete marking are covered by parser tests |
| AC-PARSER-SPEC-PACK-8 | DONE | Missing/invalid structure handling is covered by parser tests and controller guard tests |
| AC-PARSER-SPEC-PACK-9 | DONE | Stable SHA-256 rerun behavior is implemented in `ArtifactScannerService.computeSha256()` and verified by test coverage |
| AC-PARSER-SPEC-PACK-10 | DONE | Missing-artifact handling and official scan gating are implemented in `ArtifactScannerService.java` via `ArtifactScanStatus.MISSING` / `REQUIRED_ARTIFACT_MISSING` |

## 3. Scope of influence

- Backend Markdown parser core and spec-pack parser envelope.
- Artifact Scanner use case, snapshot persistence, and evidence/event storage.
- GitHub source adapter logic for commit timestamp resolution.
- Parser/controller guard for the spec-pack dev endpoint.
- Test artifacts and documentation for review, black-box validation, and final reporting.

## 4. Implementation content
| file | summary | reasons |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Backward-compatible parser wrapper | Keeps older call sites stable while the new parser core is used |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Shared Markdown parsing core | Normalizes front matter, headings, tables, placeholders, and hashes |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Dedicated spec-pack parser | Parses the ticket template into structured output |
| `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Scanner orchestration and persistence handoff | Parses spec-pack artifacts during scan flow and persists structured outputs |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Scan snapshot persistence/query adapter | Stores parsed snapshots and queries run-specific artifacts from historical data |
| `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/github/GithubArtifactScannerSourceAdapter.java` | GitHub commit resolution adapter | Resolves `committedAt` from commit data instead of leaving it null |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Spec-pack parse endpoint | Guarded dev endpoint for `spec-pack.md` only |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Parser unit tests | Covers AC mapping, warnings, placeholders, and stable parsing |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Controller tests | Covers file-path guard and endpoint safety |
| `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | Scanner service tests | Covers scan orchestration and persistence behavior |
| `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/github/GithubArtifactScannerSourceAdapterTest.java` | Source adapter tests | Covers commit timestamp resolution |
| `docs/changes/PARSER-SPEC-PACK/test-plan.md` | Test plan | AC-to-test strategy and coverage plan |
| `docs/changes/PARSER-SPEC-PACK/test-results.md` | Test results | Final execution evidence and pass/fail summary |
| `docs/changes/PARSER-SPEC-PACK/blackbox-testcases.md` | Black-box cases | External behavior validation for all AC |
| `docs/changes/PARSER-SPEC-PACK/test-data.md` | Test data | Input/expected result catalog for BB and regression |
| `docs/changes/PARSER-SPEC-PACK/review-checklist.md` | Review checklist | Review traceability for the ticket |
| `docs/changes/PARSER-SPEC-PACK/self-review.md` | Self review | Self-verification artifact |
| `docs/changes/PARSER-SPEC-PACK/report.md` | Final report | This final synthesis artifact |
| `docs/changes/PARSER-SPEC-PACK/promotion-candidates.md` | Promotion candidates | Living docs / rules / FME candidates extracted from the ticket |

## 5. Review results

| review type | result | notes |
|---|---|---|
| Self Review | PASS | Final code path and test evidence are aligned after the review fixes |
| Independent AI Review | APPROVE | The earlier Major findings were resolved before finalization |
| Human Review | APPROVED | Human review accepted the final implementation and review docs |

## 6. Test results
| test type | result | evidence |
|---|---|---|
| BE UT | PASS | 14/14 passed; parser, scanner, and GitHub adapter unit coverage are green |
| BE IT | PASS | 5/5 passed; scanner/integration slice is green |
| Black-box | PASS | 10/10 passed; `blackbox-testcases.md` and `blackbox-review-checklist.md` are aligned |
| Regression slice | PASS | Targeted Maven test runs and final test summary in `test-results.md` |

## 7. Security / operations perspective

- The parser endpoint remains path-scoped to `docs/changes/<TICKET>/spec-pack.md` and is not a generic file reader.
- No raw secret, prompt, chat, or unrelated source content is persisted by the parser path.
- The scanner stores structured metadata, hashes, and evidence events, which are useful for audit and rerun without storing raw Markdown payloads indefinitely.
- Historical run artifact lookup now uses the run snapshot path rather than a current-only view, which is safer for audit and reproducibility.
- `committedAt` is now sourced from GitHub commit metadata, improving traceability and reducing null-based operational gaps.

## 8. Accepted Risk
| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| None | No accepted risk remains after the final fixes and verification pass. | N/A | N/A | N/A |

## 9. Open Issues
| issue | impact | next action |
|---|---|---|
| None | No open issue remains in the final state. | Keep the ticket docs as reference for future parser/scanner changes. |

## 10. Human Decisions
| decision | owner | result |
|---|---|---|
| Keep parser behavior template-driven and path-scoped | Tech Lead / Ticket owner | Chốt |
| Reuse the existing scanner persistence path for run history | Tech Lead / Data Ops | Chốt |
| Keep the black-box case pack as part of closure evidence | QA / Ticket owner | Chốt |

## 11. Source Analysis Limitations

- The working tree does not include external PR-system metadata, so final judgment is based on local source, docs, and test outputs.
- The ticket has many overlapping docs; `spec-pack.md` remains the single source of truth for AC and parser behavior.
- The repository contains legacy and new parser-related files side by side, so final traceability relies on the updated ticket docs and test evidence rather than file names alone.

## 12. What worked

- Separating the shared Markdown core from the spec-pack envelope kept the parser logic easier to test and reason about.
- Keeping the scanner run snapshot path separate from the current inventory path removed ambiguity in run-specific queries.
- Updating review artifacts after code fixes prevented stale review status from leaking into the final report.
- The AC-to-test trace stayed consistent across UT, IT, and BB artifacts.

## 13. What failed

- Early report and review artifacts drifted from the code state before the final sync step.
- The initial implementation path needed an explicit correction for hash stability and historical run lookup.
- Final closure requires keeping `report.md`, `test-results.md`, and the review docs in sync; otherwise the status becomes hard to trust.

## 14. Candidate updates Failure Mode Index

- Content hash drift caused by line-ending or normalization changes.
- Historical run lookup accidentally using current inventory semantics.
- `committedAt` becoming null again if GitHub commit fallback logic regresses.
- Parser endpoint guard widening into a generic file-read primitive.
- Placeholder / AC format normalization drifting when the template changes.

## 15. Candidate updates Living Docs

- `docs/architecture/test-map.md` — keep the UT/IT/BB split and AC mapping pattern discoverable.
- `docs/architecture/repository-db-map.md` — document the scanner snapshot/history query path and current inventory separation.
- `docs/architecture/service-layer-map.md` — document the parser core vs scanner orchestration boundary.
- `docs/standards/testing.md` — preserve the AC-to-test traceability pattern used by this ticket.

## 16. Final Verdict

- DONE