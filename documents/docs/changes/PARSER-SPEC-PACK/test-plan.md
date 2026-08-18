# Test Plan

**Ticket ID**: PARSER-SPEC-PACK  
**Create date**: 2026-06-19  
**Author**: nk_trung  
**Update date**: 2026-06-22  

## 1. Purpose

Build a test plan for the `spec-pack.md` parser against the 10 confirmed ACs, while also covering runtime wiring in the controller and scanner pipeline to prove that parser output flows through the real backend path.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-PARSER-SPEC-PACK-1 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-2 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-3 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-4 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-5 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-6 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-7 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-8 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-9 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SPEC-PACK-10 | N/A | Added | Added | N/A | N/A | N/A | Added |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Actual `spec-pack.md` parse snapshot | P0 | Proves the parser reads the real file and counts ACs/sections/tables correctly |
| Path guard for `parseFile` | P0 | Prevents a generic file-read primitive |
| Front matter priority | P0 | If precedence is wrong, ticket mapping becomes incorrect |
| AC extraction + count | P0 | Directly affects test mapping and downstream consumers |
| Placeholder detection | P0 | Provides completeness warnings for Data Ops |
| Scanner pipeline parse persistence | P0 | Proves parser output reaches backend orchestration |
| AC format warning | P1 | Affects quality but does not fully block parsing |
| Idempotent re-parse | P1 | Affects snapshot and audit |
| Missing artifact handling | P1 | Needed to prove the negative path in the pipeline |
| Normalized output | P1 | Downstream systems depend on it |

## 4. Reused Existing Tests
| existing test | path | covers | gap |
|---|---|---|---|
| `SpecPackMarkdownParserTest` | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Front matter precedence, placeholder handling, invalid AC format, hash normalization | No actual repository fixture parse yet |
| `SpecPackMarkdownParserControllerTest` | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Inline parse, path guard | No file-based parse on a valid fixture yet |
| `ArtifactScannerServiceTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | Ticket scan, missing artifacts, phase0 fallback | Does not assert parser persistence records for spec-pack |
| `ArtifactScannerControllerIntegrationTest` | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/ArtifactScannerControllerIntegrationTest.java` | Controller wiring pattern | Does not cover parser-specific runtime behavior |

## 5. Additional Test This Time
| test | type | target | related AC |
|---|---|---|---|
| Parse repository fixture `spec-pack.md` | BE UT | Actual file content from `docs/changes/PARSER-SPEC-PACK/spec-pack.md` | AC-1, 2, 3, 4, 5, 7, 8 |
| Parse valid file through controller | API IT | `parse-markdown-file` with a fixture from the backend working directory | AC-1, 4, 5, 7, 8 |
| Parse pipeline persists AC/section rows | BE UT | `ArtifactScannerService` + in-memory persistence | AC-1, 3, 5, 8, 9 |
| Warning for invalid AC + placeholder | BE UT | Synthetic Markdown with broken AC and placeholders | AC-6, 7 |
| Idempotent rerun by content hash | BE UT | Same LF/CRLF content and repeated parse | AC-9 |
| Missing artifact handling in scanner | BE UT / API IT | Ticket scope with absent `spec-pack.md` | AC-10 |

### E2E Step-by-step Scenarios
- This feature does not include E2E.

## 6. Areas intentionally left untested for now
| area | reason | risk |
|---|---|---|
| Dedicated FE UI for the parser | Out of scope for this ticket | Low |
| New DB/Migration | Requirement confirms reuse of the existing schema | Low |
| Separate contract test | No official consumer contract for the parser endpoint yet | Low |
| Broad browser E2E flow | Parser is a backend-first feature; no FE journey is needed | Low |
| NLP/semantic expansion | Not part of the requirement | High if done incorrectly |

## 7. Data testing principles

- Test data must be UTF-8 Markdown.
- Do not use real production data.
- Cover normal, error, boundary, and placeholder cases.
- The preferred golden fixture is `docs/changes/PARSER-SPEC-PACK/spec-pack.md` from the repository, to stay close to reality.
- Invalid-format cases must preserve the original content and must not silently change meaning.
- Pipeline parse cases must use ticket-scoped fake source data and must not call the real repository.

## 8. Execution commands
| command | purpose |
|---|---|
| `javac -cp <BOOT-INF/classes+lib> Phase6Verifier.java && java -cp <...> Phase6Verifier` | Smoke verification for the parser, controller file parse, and scanner pipeline |
| `mvn test` in the backend workspace | Run the full unit/integration suite when Maven build is available |
| `mvn test -Dtest=SpecPackMarkdownParserTest,SpecPackMarkdownParserControllerTest,ArtifactScannerServiceTest` | Run only the parser-related tests |

## 9. Stop Condition

- Stop when any AC still lacks a test case or runtime evidence.
- Stop when parser output cannot map back to section/AC/placeholder handling as required.
- Stop when a schema change is needed but database design has not approved it.
- Stop when the scanner pipeline cannot persist AC/sections/evidence as expected.

## 10. Required Human Decision

- No mandatory human decision remains for Phase 6 if the current requirement/database-design are kept as-is.