# Ticket Rules:

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Create date**: 2026-06-15  
**Author**: ChatGPT  
**Update date**: 2026-06-17  

## Must Follow

- Do not add specifications not included in the spec-pack.
- Ambiguous points must be returned as Open Issues.
- Before implementation, read the target source and existing tests.
- Follow existing patterns.
- Do not reuse obvious errors, vulnerabilities, or existing SonarLint violations.
- Check for full-width numbers, half-width numbers, empty strings, nulls, digits, and precision.
- Business code values should be in enum/constant/master format instead of magic numbers.
- Do not export secrets/PII to logs.

## Must Not Do

- Do not add Security Exception management to this ticket.
- Do not add raw artifact pull as the main evidence flow.
- Do not use non-`tbl_` tables for persistence.
- Do not add frontend or browser E2E scope to this ticket.
- Do not add Refresh or Reset buttons to the evidence contract docs.

## Stop / Ask Conditions

- Stop and ask if the GitHub Actions workflow/job correlation rules are not confirmed.
- Stop and ask if the ingest auth/signature scheme is not confirmed.
- Stop and ask if detailed security findings are required for MVP.

## Review Focus

- Safety Pack source-dir precedence.
- deny / ask / allow parsing from `.claude/settings.json`.
- Normalized CI evidence ingest for SECRET / SAST / SCA.
- Authenticated access on the evidence APIs.

## Test Focus

- BE unit tests for scan and ingest normalization.
- BE integration tests for admin controller routes.
- Black-box checks for authenticated API access and absence of raw sensitive data.
