# Source Availability

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Latest spec pack | `documents/docs/changes/SAFETY-PACK-EXISTENCE/spec-pack.md` | read | high | PM / Author | Scope and AC source of truth | low | always-read |
| Ticket rules | `documents/docs/changes/SAFETY-PACK-EXISTENCE/ticket-rules.md` | read | high | PM / Author | Scope guardrails | low | required |
| Context file | `documents/docs/changes/SAFETY-PACK-EXISTENCE/context.md` | read | high | PM / Author | API / route / source mapping | low | required |
| Raw requirement | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/requirement.md` | read | medium | PM | Raw business intent | medium | extract-first |
| Raw wireframe | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/wireframe.md` | read | medium | PM / UX | UI structure and button constraints | medium | extract-first |
| Raw database design | `documents/docs/changes/SAFETY-PACK-EXISTENCE/raw/database_design.md` | read | medium | PM / BE | DB direction and table naming | medium | extract-first |
| BE source patterns | `src/main/java/com/sdd/platform/...` | partial | high | BE | Existing admin, ingest, and persistence patterns | medium | inspect before code |
| Workflow files | `.github/workflows/` | partial | medium | DevOps | Exact workflow/job/artifact names | medium | inspect before code |
| `.claude` source folders | `documents/.claude/`, nested `.claude/` paths in GitHub tree | read | high | Repo | Safety Pack source examples | low | required |

## Summary

The current source set is sufficient to implement Safety Pack and normalized CI evidence ingestion, but the workflow/auth details still need confirmation.

## Unavailable / Partial Sources

- Exact GitHub Actions workflow/job correlation rules for retries.
- Internal auth/signature/token scheme for the ingest endpoint.
- Whether detailed security findings are required in MVP.

## Risk Before Implementation

- Risk of inventing endpoints or tables if source patterns are not verified.
- Risk of template drift if old exception-management wording remains in change docs.
- Risk of security/privacy drift if raw findings are stored or logged.
- Risk of duplicate evidence rows if the retry-safe upsert contract is not understood.

## Required Human Decision

- Confirm workflow/job correlation rules.
- Confirm ingest auth/signature rule.
- Confirm whether detailed security findings are needed now or later.
