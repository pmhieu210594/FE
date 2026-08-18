# Promotion Candidates

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| LC-001 | Template heading parity check before closure | `docs/maintenance/failure-mode-index.md` | Prevents repeat drift between ticket files and the shared template family. | Medium |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FMI-DOC-001 | Ticket docs drift away from the shared template family | Manual rewrite changes section titles or order without template parity check | Compare the ticket file headings against `_ticket-template` before sign-off | Diff shows missing, renamed, or reordered headings |

## Not Promoted

| item | reason |
|---|---|
| Do not add frontend/browser E2E scope to backend-only closure tickets | Ticket-specific scope decision is already captured by the report and test-results docs; promoting it to a rule would be too broad. |
| Backend-only closure docs should use the shared ticket template headings exactly | Best handled by the template family and the failure-mode entry instead of a new standard. |
| Add a short note that this ticket does not change FE runtime architecture | No runtime architecture change occurred; adding an architecture note would be redundant. |
| PR/CI artifact missing notes | Workspace evidence absence is a one-off reporting detail, not a reusable policy. |
| Workflow/job names pending | Open ticket decision, not a general knowledge pattern. |
| Ingest auth/signature pending | Open ticket decision, not a reusable rule candidate. |

## Human Approval Required

- Confirm whether any of the candidate rules should be promoted beyond the ticket folder.
- Confirm whether the new failure mode entry should remain as a maintenance-only note or be referenced from other docs.
