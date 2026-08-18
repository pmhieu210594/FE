# Wireframe - Traceability Matching Logic MVP

**Ticket ID**: TRACEABILITY-MATCHING-LOGIC
**Screen name**: Traceability Map
**Route**: `/traceability`
**Menu**: Evidence → Traceability

---

## 1. Screen Purpose

This screen helps users review:

```text
- Artifact traceability
- PR traceability
- Commit traceability
- CI traceability
- Report traceability
- Traceability completeness
```

---

## 2. Overall Layout

```text
+--------------------------------------------------------------------------------+
| Traceability Map                                                               |
| Review Ticket → Artifact → PR → Commit → CI → Test → Report links             |
+--------------------------------------------------------------------------------+

+-----------------------+  +-----------------------+  +-----------------------+
| Total Tickets         |  | Complete Tickets      |  | Broken Links          |
| 120                   |  | 88                    |  | 32                    |
+-----------------------+  +-----------------------+  +-----------------------+

+--------------------------------------------------------------------------------+
| [Ticket Search] [Project] [Status] [Search]                                   |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| Tabs: [Traceability] [Timeline] [Broken Links]                                |
+--------------------------------------------------------------------------------+
```

---

## 3. Traceability Tab

Columns:

* Ticket
* Artifact Coverage
* PR
* CI
* Completeness
* Action

Example:

```text
PARSE-TEST-PLAN-RESULTS | 7/7 | PR-145 | PASS | 100% | View
```

---

## 4. Timeline Tab

```text
2026-06-20 Spec Pack Created
2026-06-21 Impl Plan Created
2026-06-21 PR Opened
2026-06-21 Commit Created
2026-06-22 CI Passed
2026-06-22 Report Created
```

---

## 5. Broken Links Tab

Columns:

* Ticket
* Missing Item
* Severity
* Action

Example:

```text
ABC-123 | Report Missing | WARNING | View
```

---

## 6. Permission / UX Notes

* Viewer can access.
* PM can access.
* QA can access.
* Admin can access.
* No edit functionality.
* Missing links must be visible.
* Missing links must not crash the UI.

---

## 7. Scope Notes

* Read-only screen.
* No graph editing.
* No root cause analysis.
* Focus on traceability visibility and completeness.
