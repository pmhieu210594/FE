# Test Plan

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung    
**Update date**: 2026-06-23  

## 1. Purpose

Validate the `self-review.md` parser against the Phase 1/Phase 2 contract: canonical headings, tables, verdict, placeholders, path guard, idempotency, and traceability.

## 2. AC Matrix ↔ Test Type
| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-PARSER-SELF-REVIEW-1 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-2 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-3 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-4 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-5 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-6 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-7 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-8 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-9 | N/A | Added | Added | N/A | N/A | N/A | Added |
| AC-PARSER-SELF-REVIEW-10 | N/A | Added | Added | N/A | N/A | N/A | Added |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Canonical fixture parse | P0 | Baseline contract |
| Missing section / malformed table | P0 | Prevent false success |
| Nested subsection boundary | P0 | Tolerance limited to 1 level |
| Verdict normalization | P1 | Downstream quality |
| Path guard / file scope | P0 | Security boundary |
| Idempotency / hash stability | P1 | Rerun behavior |
| Unicode / CRLF-LF | P1 | Compatibility |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `SpecPackMarkdownParserTest` | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Pattern for parser tests, warnings, hash stability | Different template, does not cover self-review |
| `SpecPackMarkdownParserControllerTest` | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Path guard + endpoint shape | No self-review endpoint/fixture yet |
| `ArtifactScannerServiceTest` | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | Scan orchestration style | Not specific to the self-review parser |

## 5. Additional Test This Time
| test | type | target | related AC |
|---|---|---|---|
| Parse canonical self-review fixture | BE UT / Black-box | Canonical 11-section file | AC-1..AC-8 |
| Missing required section | BE UT / Black-box | Incomplete template | AC-3, AC-4, AC-9 |
| Malformed table / wrong verdict | BE UT / Black-box | Invalid rows / verdict | AC-5, AC-7, AC-9 |
| Nested subsection > 1 level | BE UT / Black-box | Nesting boundary | AC-3, AC-4 |
| Path guard denial | API IT / Black-box | File path outside scope | AC-1, AC-9 |
| Reparse same content hash | BE UT | Same input twice | AC-10 |
| Verdict normalization + alias lookup | BE UT | Lowercase / whitespace verdict tokens, section alias helper | AC-7, AC-1 |

### E2E Step-by-step Scenarios

- This function does not perform E2E.

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|
| DB schema changes | Phase 2 does not add migrations | Low |
| FE screen changes | There is no FE screen in this ticket | Low |
| Public production exposure | Internal by default; surface not expanded yet | Medium |

## 7. Data testing principles

- Use a small canonical fixture, but include enough sections.
- Have separate fixtures for missing sections, malformed tables, nested boundaries, and Vietnamese Unicode.
- Do not use real production data.
- Do not store raw secrets or sensitive source material in test artifacts.

## 8. Execution command
| command | purpose |
|---|---|
| `./mvnw test -Dtest=SelfReviewMarkdownParserTest` | Run parser unit tests |
| `./mvnw test -Dtest=SelfReviewMarkdownParserControllerTest` | Run controller/path-guard tests |
| `./mvnw test` | Run the full related suite |

## 9. Stop Condition

- The canonical fixture is not finalized yet.
- The path guard is not safe enough.
- Verdict normalization or nested tolerance is still ambiguous.
- Hash/idempotency differs when rerunning the same input.

## 10. Required Human Decision

- Confirm the final class/controller name for the self-review parser.
- Confirm whether the scan-flow hook is in Phase 3.
- Confirm the naming for summary fields if additional persistence is needed.