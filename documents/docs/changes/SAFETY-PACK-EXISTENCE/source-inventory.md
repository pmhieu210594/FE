# Source Inventory

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

| area | path | type | owner | read status | note |
|---|---|---|---|---|---|
| Safety Pack service | `src/main/java/com/sdd/platform/application/usecase/governance/SafetyPackService.java` | BE source | BE | read | Scan `.claude` and compute status/counts. |
| Evidence ingest service | `src/main/java/com/sdd/platform/application/usecase/ingestion/SecurityEvidenceIngestService.java` | BE source | BE | read | Normalize GitHub Actions payloads. |
| Admin controller | `src/main/java/com/sdd/platform/web/rest/SecurityEvidenceController.java` | BE source | BE | read | Admin APIs for Safety Pack and Security Scan. |
| Workflow file | `.github/workflows/security-evidence.yml` | CI source | DevOps | read | Builds normalized summaries and posts to backend. |
| Template docs | `documents/docs/standards/templates/_ticket-template/*` | doc source | PM | read | Required file layout and section structure. |

## Important Files

- `documents/docs/changes/SAFETY-PACK-EXISTENCE/spec-pack.md`
- `documents/docs/changes/SAFETY-PACK-EXISTENCE/context.md`
- `documents/docs/changes/SAFETY-PACK-EXISTENCE/impact-analysis.md`
- `documents/docs/changes/SAFETY-PACK-EXISTENCE/test-plan.md`

## Generated / Excluded Files

- Generated: runtime test outputs, build artifacts, and workflow artifacts.
- Excluded: raw secrets, tokens, private keys, and raw findings.

## Missing Files

- No missing source categories are currently known for the Safety Pack / CI scan scope.
