# Requirement - Safety / Security Evidence MVP

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Feature name**: Safety / Security Evidence MVP  
**Scope note**: This ticket keeps the original Safety Pack Existence name, but the agreed MVP scope covers Safety Pack inventory, GitHub Actions security evidence, and Security Exception Management. High-risk human approval remains out of scope.

---

## 1. Purpose

This feature helps Admin, Security, and Data Ops users answer these questions without manual copy/paste:

1. Does the repository have a minimum Safety Pack?
2. Does `.claude/settings.json` contain deny / ask / allow controls?
3. Did GitHub Actions run Secret Scan, and are unresolved secrets zero?
4. Did GitHub Actions run SAST/SCA, and are critical/high findings visible?
5. Are there any approved/open/expired Security Exceptions?

---

## 2. Agreed MVP Direction

### 2.1 Safety Pack

Safety Pack evidence is read from repository content:

1. `documents/.claude/`
2. `.claude/`

Required files:
- `CLAUDE.md`
- `settings.json`
- `rules/`
- `rules/*.md`

### 2.2 Secret / SAST / SCA

Secret Scan, SAST, and SCA evidence must **not** be read from `_ticket-template`.

Source of truth is GitHub Actions. The workflow must push a normalized JSON summary to backend internal API.

### 2.3 Persistence Rule

The implementation may use only tables with `tbl_` prefix. Non-`tbl_` tables are not allowed in this ticket.

Approved table set:
- `tbl_dim_project`
- `tbl_dim_repository`
- `tbl_dim_ticket`
- `tbl_connector_run`
- `tbl_fact_pull_request`
- `tbl_fact_ci_run`
- `tbl_fact_safety_pack_status`
- `tbl_fact_security_scan`
- `tbl_fact_security_finding`
- `tbl_fact_exception`
- `tbl_dim_role`

### 2.4 Selected Tools

- Secret Scan: Gitleaks
- SAST: Semgrep
- SCA: Trivy
- CI/CD provider: GitHub Actions

---

## 3. Scope

### In Scope

- Safety Pack scan
- deny / ask / allow summary
- GitHub Actions normalized summary push to BE
- Secret Scan evidence
- SAST evidence
- SCA evidence
- Security Exception Management
- Admin-only UI/API

### Out of Scope

- High-risk human approval
- Parsing Secret/SAST/SCA from ticket-template files
- BE artifact pull as the primary design
- Raw secret or raw sensitive finding storage
- Refresh / Reset buttons

---

## 4. Functional Requirements

### FR-1 Safety Pack Coverage

The system must detect whether the repository contains:
- `CLAUDE.md`
- `settings.json`
- `rules/`
- at least one `rules/*.md`

The system must compute:
- `READY`
- `WARNING`
- `MISSING`
- `PARSE_ERROR`

### FR-2 settings.json Summary

The system must parse `.claude/settings.json` and store:
- allow count
- ask count
- deny count

The system must not store raw sensitive command content if storing it would create security/privacy risk.

### FR-3 GitHub Actions Security Evidence Push

GitHub Actions must POST normalized summary v1 to BE internal API with:
- repository
- branch
- commit SHA
- PR number if available
- workflow run id
- scan type
- scan tool
- scan status
- severity counts
- unresolved count
- scanned timestamp

### FR-4 Secret Scan Policy

- Tool: Gitleaks
- `unresolved_count > 0` => `FAIL`
- `unresolved_count = 0` => `PASS`

### FR-5 SAST / SCA Policy

- SAST tool: Semgrep
- SCA tool: Trivy
- `critical_count > 0` => `FAIL`
- `critical_count = 0` and `high_count > 0` => `WARNING`
- missing evidence => `NOT_AVAILABLE`

### FR-6 Security Exception Management

The system must support exception create/update/close with:
- reason
- approved role
- approver
- expiry date
- alternative control
- target type / target id
- status

Expired exceptions must be visible in the Admin screen.

### FR-7 Permission

Only Admin users can access this feature.

### FR-8 Privacy / Security

The system must never store:
- raw secret values
- tokens
- private keys
- raw sensitive findings

---

## 5. Acceptance Criteria

- AC-SAFETY-PACK-1: The system can scan Safety Pack from `documents/.claude/` or `.claude/`, preferring `documents/.claude/`.
- AC-SAFETY-PACK-2: The system records whether `CLAUDE.md`, `settings.json`, `rules/`, and `rules/*.md` exist.
- AC-SAFETY-PACK-3: The system stores deny / ask / allow summary counts from `.claude/settings.json`.
- AC-SAFETY-PACK-4: Invalid `settings.json` results in `PARSE_ERROR` without crashing scan.
- AC-SAFETY-PACK-5: The system persists evidence only in approved `tbl_` tables.
- AC-SAFETY-PACK-6: GitHub Actions can push normalized summary v1 to BE.
- AC-SAFETY-PACK-7: Secret Scan policy produces PASS/FAIL based on unresolved count.
- AC-SAFETY-PACK-8: SAST policy produces FAIL/WARNING according to critical/high counts.
- AC-SAFETY-PACK-9: SCA policy produces FAIL/WARNING according to critical/high counts.
- AC-SAFETY-PACK-10: No raw secret / token / private key / raw sensitive finding is stored.
- AC-SAFETY-PACK-11: Admin can create/update Security Exceptions with required fields.
- AC-SAFETY-PACK-12: Expired exceptions are visible.
- AC-SAFETY-PACK-13: Non-admin users are blocked.
- AC-SAFETY-PACK-14: High-risk human approval remains out of scope.

---

## 6. Open Items

- Exact GitHub Actions workflow/job names.
- Internal auth/signature method for BE ingest API.
- Approver role in `tbl_dim_role`.
- Whether `tbl_fact_security_finding` is needed in MVP.
- Exact rule for exception expiry date boundary.
