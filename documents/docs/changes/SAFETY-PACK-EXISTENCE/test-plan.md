# Test Plan

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## 1. Purpose

Verify the backend Safety Pack filesystem scan, normalized GitHub Actions ingest, and approved `tbl_` persistence. This ticket is backend-only. Repeated normalized pushes must remain idempotent and not create duplicate rows.

## 2. AC Matrix -> Test Type
| AC ID | BE UT | API IT | Contract Test | DB/Migration | Black-box |
|---|---|---|---|---|---|
| AC-SAFETY-PACK-1 | No | Yes | No | No | Yes |
| AC-SAFETY-PACK-2 | No | Yes | No | No | Yes |
| AC-SAFETY-PACK-3 | No | Yes | No | No | Yes |
| AC-SAFETY-PACK-4 | No | Yes | No | No | Yes |
| AC-SAFETY-PACK-5 | Yes | Yes | Yes | Yes | Yes |
| AC-SAFETY-PACK-6 | Yes | Yes | Yes | Yes | Yes |
| AC-SAFETY-PACK-7 | Yes | Yes | No | No | Yes |
| AC-SAFETY-PACK-8 | Yes | Yes | No | No | Yes |
| AC-SAFETY-PACK-9 | Yes | Yes | No | No | Yes |
| AC-SAFETY-PACK-10 | Yes | Yes | Yes | No | Yes |
| AC-SAFETY-PACK-11 | Yes | Yes | Yes | No | Yes |
| AC-SAFETY-PACK-12 | No | No | Yes | No | No |

## 3. Priority
| test item | priority | reason |
|---|---|---|
| Safety Pack source-dir precedence | P0 | Core scan behavior |
| Safety Pack file existence flags | P0 | Core scan behavior |
| Safety Pack parse errors | P0 | Must fail safely |
| Normalized CI ingest and policy mapping | P0 | Main backend contract |
| `tbl_`-only persistence | P0 | Security/storage boundary |
| Authenticated API access | P0 | Backend access control |
| Duplicate-safe ingest retries | P0 | Prevents repeated webhook deliveries from creating extra rows |

## 4. Reuse Existing Test
| existing test | path | covers | gap |
|---|---|---|---|
| `SafetyPackServiceTest` | `EDCAP_BE/src/test/java/...` | Safety Pack scan behavior | May need fixture updates |
| `SecurityEvidenceControllerIntegrationTest` | `EDCAP_BE/src/test/java/...` | API contract | May need updated auth assertions |

## 5. Additional Test This Time
| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-SAFETY-PACK-1 | Safety Pack source-dir precedence | BE UT | `SafetyPackService` | AC-SAFETY-PACK-1 |
| TC-SAFETY-PACK-2 | Safety Pack existence flags and counts | BE UT | `SafetyPackService` | AC-SAFETY-PACK-2, AC-SAFETY-PACK-3 |
| TC-SAFETY-PACK-3 | invalid settings JSON -> parse error | BE UT | `SafetyPackService` | AC-SAFETY-PACK-4 |
| TC-SAFETY-PACK-4 | authenticated access on safety-packs API | BE IT | `SecurityEvidenceController` | AC-SAFETY-PACK-11 |
| TC-SAFETY-PACK-5 | authenticated access on security-scans API | BE IT | `SecurityEvidenceController` | AC-SAFETY-PACK-11 |
| TC-SAFETY-PACK-6 | normalized GitHub Actions ingest and policy mapping | BE IT | ingest service | AC-SAFETY-PACK-6, AC-SAFETY-PACK-7, AC-SAFETY-PACK-8, AC-SAFETY-PACK-9 |
| TC-SAFETY-PACK-7 | `tbl_`-only persistence review | Review | docs / source inspection | AC-SAFETY-PACK-5, AC-SAFETY-PACK-10 |
| TC-SAFETY-PACK-8 | Duplicate-safe ingest retry | BE IT / DB | `SecurityEvidenceIngestService` + mappers | AC-SAFETY-PACK-10 |
| TC-SAFETY-PACK-9 | GitHub tree nested `.claude` resolution | BE UT / BE IT | GitHub snapshot service | AC-SAFETY-PACK-5, AC-SAFETY-PACK-6 |

### E2E Step-by-step Scenarios
- This feature does not include E2E

## 6. Areas intentionally left untested this time
| area | reason | risk |
|---|---|---|

## 7. Data testing principles

- Use synthetic repository fixtures only.
- Use synthetic workflow payloads only.
- Do not use raw secrets, tokens, private keys, or production data.
- Keep data deterministic so scans and ingest are reproducible.

## 8. Execution command
| command | purpose |
|---|---|
| `cd EDCAP_BE && mvn verify` | Run the backend unit and integration suite. |
| `cd EDCAP_BE && mvn -Dtest=SafetyPackServiceTest test` | Optional focused BE unit coverage if needed. |
| `cd EDCAP_BE && mvn verify -Dit.test=SecurityEvidenceControllerIntegrationTest` | Optional focused BE API coverage if needed. |

## 9. Stop Condition

- Stop if the workflow/auth contract changes unexpectedly.
- Stop if backend validation fails.
- Stop if any test requires real tokens or production data.

## 10. Required Human Decision

| decision | reason |
|---|---|
| Confirm workflow/auth contract | Needed before release if it changes |
| Confirm FE scope | Needed only if UI work is later introduced |
