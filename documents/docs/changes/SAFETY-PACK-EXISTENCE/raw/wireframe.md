# Wireframe - Safety / Security Evidence MVP

**Ticket ID**: SAFETY-PACK-EXISTENCE  
**Screen name**: Safety / Security Evidence  
**Route**: `/admin/safety-packs`  
**Menu**: Admin / Security → Safety Evidence

---

## 1. Screen Purpose

This screen helps Admin, Security, and Data Ops users review:

```text
- Safety Pack coverage
- deny/ask/allow summary
- Secret Scan result from GitHub Actions
- SAST/SCA result from GitHub Actions
- Security Exception status
```

High-risk approval is not displayed in this ticket.

---

## 2. Overall Layout

```text
+--------------------------------------------------------------------------------+
| Safety / Security Evidence                                                     |
| Check repository Safety Pack, GitHub Actions security scan evidence, and       |
| Security Exceptions.                                                           |
+--------------------------------------------------------------------------------+

+-----------------------+  +-----------------------+  +-----------------------+
| Total Repositories    |  | Safety Pack READY     |  | Expired Exceptions    |
| 12                    |  | 8                     |  | 1                     |
+-----------------------+  +-----------------------+  +-----------------------+

+--------------------------------------------------------------------------------+
| [Project dropdown] [Repository keyword] [Status dropdown] [Search]            |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| Tabs: [Safety Pack] [CI Security Scan] [Exceptions]                            |
+--------------------------------------------------------------------------------+

(tab content area)
```

There is **no Refresh button** and **no Reset button** on this screen.

---

## 3. Safety Pack Tab

Columns:

- Repository
- Status
- CLAUDE.md
- settings.json
- Rules
- allow / ask / deny
- Last scanned
- Missing Items
- Action

Row example:

```text
EDCAP_BE | READY | Yes | OK | 5 | 3 / 2 / 8 | 2026-06-16 10:00 | - | View
```

---

## 4. CI Security Scan Tab

Columns:

- Repository
- PR
- Commit SHA
- Workflow Run
- Scan Type
- Tool
- Status
- Critical
- High
- Medium
- Low
- Unresolved
- Scanned At

Rows include:
- SECRET / Gitleaks
- SAST / Semgrep
- SCA / Trivy

---

## 5. Exceptions Tab

Columns:

- Exception Type
- Target
- Reason
- Approved Role
- Approver
- Expiry Date
- Status
- Alternative Control
- Action

Actions:
- Create
- Edit
- Close
- View

Expired rows should be visually highlighted.

---

## 6. Permission / UX Notes

- Admin can access and operate.
- Non-admin is blocked.
- Missing GitHub Actions evidence must be shown as `NOT_AVAILABLE`, not as UI crash.
- The screen must not show raw secret values or raw findings.
