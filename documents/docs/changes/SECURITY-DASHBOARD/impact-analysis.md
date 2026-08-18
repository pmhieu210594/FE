# Impact Analysis

**Ticket ID**: SECURITY-DASHBOARD  
**Create date**: 2026-07-02  
**Author**: OpenAI  
**Update date**: 2026-07-02

---

## 1. Change Content

Introduce a new **Security Dashboard** providing a centralized operational view of security posture.

The dashboard aggregates existing security evidence from:

- Safety Pack
- Secret Scan
- SAST
- SCA
- Security Checklist Parser
- Security Exceptions

The dashboard is **read-only** and does not modify existing Security workflows.

---

## 2. Directly Affected Files

| file | reason | change type |
|---|---|---|
| SecurityDashboardPage | New dashboard UI | Create |
| SecurityDashboardController | Dashboard REST API | Create |
| SecurityDashboardService | Dashboard aggregation | Create |
| SecurityDashboardRepository | Read existing metadata | Create |
| SecurityDashboardDtos | Dashboard response | Create |
| Dashboard API helper | FE integration | Modify |

---

## 3. Indirectly Affected Files

| file | reason | risk |
|---|---|---|
| Existing Dashboard Layout | Shared layout reused | Low |
| Dashboard Filter | Existing filter reused | Low |
| Dashboard Drawer | Existing drawer reused | Low |
| Existing Authentication | Existing security | None |
| Existing Logging | Existing TraceId | None |
| Existing Repository Layer | Shared Repository pattern | Low |

---

## 4. Caller / Callee

| caller | callee | impact |
|---|---|---|
| Browser | Security Dashboard API | New |
| Dashboard API | SecurityDashboardController | New |
| Controller | SecurityDashboardService | New |
| Service | SecurityDashboardRepository | New |
| Repository | Existing V4 Security tables | Read-only |

---

## 5. FE Impact

- New Security Dashboard page.
- Existing Dashboard Layout reused.
- Existing Summary Cards reused.
- Existing Filter reused.
- Existing Drawer reused.
- Ticket-based table added.
- Existing API helper extended.

---

## 6. BE Impact

- New REST Controller.
- New Dashboard Service.
- New Repository.
- New DTO.
- Existing Security modules reused.

---

## 7. API Contract Impact

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| Dashboard Summary | New | Summary DTO | Yes |
| Ticket Detail | New | Detail DTO | Yes |

Existing APIs remain unchanged.

---

## 8. DTO / Schema / Validation Impact

- Dashboard Summary DTO.
- Ticket Detail DTO.
- Existing entities reused.
- Existing validation reused.
- Existing enum reused.

---

## 9. DB / Migration Impact

- Existing V4 tables reused.
- No migration.
- No schema modification.
- No duplicated persistence.
- Read-only SQL only.

---

## 10. Batch / Job / Event Impact

No impact.

Existing

- Safety Pack Scan
- Secret Scan
- SAST
- SCA
- Checklist Parser

continue unchanged.

Dashboard consumes results only.

---

## 11. Test Impact

Additional tests required:

- Dashboard Service
- Dashboard Repository
- Dashboard API
- Dashboard UI
- Filter
- Ticket Detail
- KPI aggregation

Existing Security modules remain unaffected.

---

## 12. Operation / Monitoring Impact

- Existing Logging reused.
- Existing TraceId reused.
- Existing Monitoring reused.
- No operational workflow changes.
- Existing Security lifecycle unchanged.

---

## 13. Rollout / Rollback Impact

Rollout

- Deploy BE.
- Deploy FE.

Rollback

- Remove Security Dashboard code only.

No database rollback required.

---

## 14. Areas Determined to be Unaffected and Based on

| area | judgment | evidence |
|---|---|---|
| Safety Pack Scan | Not affected | Dashboard is read-only |
| Secret Scan | Not affected | Existing Security module reused |
| SAST execution | Not affected | Existing Security module reused |
| SCA execution | Not affected | Existing Security module reused |
| Security Checklist Parser | Not affected | Existing parser reused |
| Security Exception lifecycle | Not affected | Existing module reused |
| Existing V4 schema | Not affected | Existing tables reused |

---

## 15. Required Options

- Read-only aggregation.
- Existing Dashboard reuse.
- Existing Security module reuse.
- Existing V4 table reuse.

---

## 16. Human Decision Required

| ID | decision item | owner | status |
|---|---|---|---|
| H-SECURITY-1 | Final Security Verdict calculation | PM | Open |
| H-SECURITY-2 | Security Alert rule | PM | Open |
| H-SECURITY-3 | Checklist weighting | PM | Open |
| H-SECURITY-4 | Export capability | PM | Open |
| H-SECURITY-5 | Exception priority | PM | Open |

---

## 17. Risk Summary

| ID | risk | severity | mitigation |
|---|---|---|---|
| R-1 | Existing Security schema changes | Medium | Verify latest schema |
| R-2 | Final Verdict undefined | High | Human Decision |
| R-3 | Security Alert undefined | High | Human Decision |
| R-4 | Existing Dashboard architecture changes | Medium | Verify latest Dashboard implementation |
| R-5 | Aggregation performance | Low | Existing Repository optimization |