# Sources

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket request | Conversation thread | Available | User asked to align docs/code and keep template files unchanged. |
| Scope correction | Conversation thread | Available | Security Exception management is deferred out of this ticket. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Raw requirement | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/requirement.md` | Available | High | Raw business intent. |
| Raw wireframe | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/wireframe.md` | Available | High | UI structure and button constraints. |
| Raw database design | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/database_design.md` | Available | High | `tbl_`-only DB direction. |
| Platform requirement | `VI_02_SDD_evidence_data_collection_analysis_requirements_V02.md` | Available | High | Safety/security evidence requirement reference. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| BE safety pack service | `src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | Available | Filesystem scan and Safety Pack normalization. |
| BE evidence ingest service | `src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | Available | Normalized summary ingest. |
| BE evidence controller | `src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | Available | Admin API surface. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit | `src/test/java/com/sdd/platform/application/usecase/governance/SafetyPackServiceTest.java` | Available | Safety Pack scan behavior. |
| BE integration | `src/test/IntegrationTest/java/com/sdd/platform/web/rest/SecurityEvidenceControllerIntegrationTest.java` | Available | Admin controller routes. |

## External / Office / PDF / Web References

| source | type | handling policy | note |
|---|---|---|---|
| Template docs | local docs | read and mirror structure | Use as the required file layout reference. |
| Workflow file | local CI source | read and mirror behavior | Use exact names only after confirmation. |

## Excluded Sources

| source/path | reason |
|---|---|
| Security Exception code paths | Out of scope for this ticket. |
| Raw secrets/tokens/private keys | Never allowed. |
| Non-`tbl_` persistence | Forbidden by ticket scope. |

## Source Limitations

- Workflow/job correlation rules for retries are still open.
- Ingest auth/signature scheme is still open.
- Detailed security findings are deferred unless confirmed otherwise.

## Assumptions from Sources

- Safety Pack source lives under `.claude`.
- GitHub Actions is the source of CI evidence.
- The current ticket is evidence-oriented, not exception-management oriented.

## Human Confirmation Required

- Confirm workflow/job correlation rules for retries.
- Confirm ingest auth/signature rule.
- Confirm whether detailed security findings are needed in MVP.
