# Self Review

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-19

## 1. Implementation Summary

Implemented the parser with a layered approach:
- `MarkdownParserCore` is the shared core under `markdown/core`: it normalizes Markdown, reads YAML front matter, extracts headings/sections, reads tables, detects placeholders, normalizes issues, and computes hashes.
- `SpecPackMarkdownParser` is the dedicated parser for `spec-pack.md` under `markdown/specpack`: it infers `ticket_id`, normalizes ACs according to the template, and builds a consistent output envelope.
- `ArtifactNormalizer` is now only a compatibility wrapper.
- `SpecPackMarkdownParserController` was tightened with a path guard so it only reads `docs/changes/<TICKET>/spec-pack.md`.

## 2. Specification/AC Matching
| AC ID | status | evidence |
|---|---|---|
| AC-SPEC-PARSER-1 | Pass | `SpecPackMarkdownParser.parse(...)`, `SpecPackMarkdownParserController.parseFile(...)`, `SpecPackMarkdownParserTest` |
| AC-SPEC-PARSER-2 | Pass | infer `ticket_id` from front matter / header / path |
| AC-SPEC-PARSER-3 | Pass | front matter is prioritized in `SpecPackMarkdownParser.parse(...)` |
| AC-SPEC-PARSER-4 | Pass | section extraction in `MarkdownParserCore` |
| AC-SPEC-PARSER-5 | Pass | table extraction + summary output |
| AC-SPEC-PARSER-6 | Pass | `SCOPE_WITHIN_RANGE` / `SCOPE_OUT_OF_RANGE` are separated |
| AC-SPEC-PARSER-7 | Pass | Business Rules / Input / Output / Error / Boundary / Non-functional tables are parsed by section |
| AC-SPEC-PARSER-8 | Pass | Acceptance Criteria table parse + count |
| AC-SPEC-PARSER-9 | Pass | invalid AC format raises a warning but keeps the content |
| AC-SPEC-PARSER-10 | Partial | placeholder detection + stable hash are implemented; persistence-level snapshot de-dup / missing-artifact routing is not yet connected to the scanner pipeline |

## 3. List of Changed Files
| file | summary | reason |
|---|---|---|
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Shared core parser for Markdown | Splits out normalize/front matter/section/table/placeholder/hash |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Dedicated parser for `spec-pack.md` | Standardizes ticket_id, ACs, warnings/errors, and summary |
| `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java` | Compatibility wrapper | Preserves the old API for legacy callers |
| `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Tightens the parse endpoint and emits the new response envelope | Blocks generic file read, serves spec-pack parsing |
| `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Unit test for the parser | Locks front matter, placeholder handling, AC format, hash stability |
| `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Unit test for controller guard | Locks the path guard and inline response |
| `docs/changes/PARSER-SPEC-PACK/storage-map.md` | DB mapping document for parser output storage | Prepared for independent review |
| `docs/changes/PARSER-SPEC-PACK/review-checklist.md` | Updated review checklist with results | Prepared for independent review |
| `docs/changes/PARSER-SPEC-PACK/self-review.md` | Post-implementation self review | Current handoff status |
| `docs/changes/PARSER-SPEC-PACK/handoff.md` | Consolidated handoff file for changed files | For quick copy/review |
| `docs/changes/PARSER-SPEC-PACK/test-results.md` | Test results with evidence | Records runtime evidence |

## 4. Run Command and Results
| command | result | note |
|---|---|---|
| `mvn test "-Dtest=SpecPackMarkdownParserTest,SpecPackMarkdownParserControllerTest"` | PASS | Parser core + spec-pack parser + controller guard compiled and passed tests successfully |

## 5. Self-Check using Review Checklist
| checklist area | result | note |
|---|---|---|
| Specification/AC Matching | PASS / Partial | 9 ACs pass; AC-10 is partial because persistence pipeline de-dup has not yet been connected |
| Encoding / Locale | PASS | UTF-8 is preserved; normalization does not remove diacritics |
| Security / Privacy | PASS | Path guard only allows `spec-pack.md` |
| Operation / Maintainability | PASS / Partial | Envelope includes hash/status/counts, but runtime de-dup is not yet connected to DB |
| Test Review | PASS | Unit tests pass |

## 6. Test Plan Corresponding Status

- BE unit tests for front matter / section / table / AC / placeholder / hash parsing: done.
- Web controller unit test for file guard + inline envelope: done.
- API/integration test for scanner pipeline: not done in this change set.
- Black-box artifact mapping already exists in docs, but runtime evidence currently only covers parser unit tests.

## 7. Bugs Found and Resolved
| bug | cause | fix | test |
|---|---|---|---|
| `ArtifactNormalizer` only parsed headings/AC lines and did not parse tables/placeholders | The old parser was too simplified | Added `MarkdownParserCore` + spec-pack parser | `SpecPackMarkdownParserTest` |
| The dev endpoint could have become an overly broad file-read API | The previous guard only relied on extension | Tightened the path to `docs/changes/<TICKET>/spec-pack.md` | Compile + unit test |
| Javadoc could break because of `**/` | Comment text contained a comment-closing sequence | Changed the description to the `<TICKET>` form | Maven compile |

## 8. Unprocessed / Pending / Accepted Risk
| item | reason | impact | owner | deadline |
|---|---|---|---|---|
| Persistence-level idempotent snapshot de-dup | This change set only covers parser/core and does not yet connect the DB pipeline | AC-10 still lacks end-to-end runtime evidence | Backend/Data Ops | Next phase |
| Missing-artifact handling in the scanner pipeline | Needs integration into ingest/scanner orchestration | Missing files are not yet recorded from a run | Backend/Data Ops | Next phase |
| Official parse gating by PR + CI | Needs runtime orchestration and is outside parser core | Official/Draft currently exist only as parse metadata | Backend/Data Ops | Next phase |

## 9. AI-generated Predictions

- The current parser core is already a good foundation for adding adapters for other file types without changing the shared normalization logic.
- The biggest remaining risk is that orchestration/persistence has not yet caught up with the new output envelope.

## 10. Items reviewed by humans

- `spec-pack.md`
- `context.md`
- `ticket-rules.md`
- `review-checklist.md`
- `impl-plan.md`
- Template `_ticket-template`

## 11. Final Self-Verdict

- PASS 