# Promotion Candidates

**Ticket ID**: LOGIN  
**Create date**: 2026-06-11  
**Author**: Codex  
**Update date**: 2026-06-11  

## Candidates for Living Docs

| ID | candidate | target doc | reason | priority |
|---|---|---|---|---|
| PC-LOGIN-LD-001 | Promote after approval: LOGIN API contract summary | API living docs | Login/logout/current-user response shapes and error codes are reused by FE, tests, and QA. | High |
| PC-LOGIN-LD-002 | Promote after approval: bearer-token auth flow | Architecture living docs | FE token storage, Authorization header, bearer filter, active token session, and `/me` compatibility need a shared explanation. | High |
| PC-LOGIN-LD-003 | Promote after approval: login access policy | Operations/security docs | Reset, unlock, and cleanup must be understood outside this ticket. | High |
| PC-LOGIN-LD-004 | Promote now as ticket-local pattern only: auth test playbook | QA living docs | The successful command set is reusable, but command escalation details are environment-specific. | Medium |
| PC-LOGIN-LD-005 | Do not promote until decided: LOGIN open security decisions | Security decision record | Refresh-token, localStorage, email exposure, audit, and logout permit policy are unresolved and must not become guidance yet. | High |

## Candidates for Rules

| ID | rule candidate | target | reason | risk of rule bloat |
|---|---|---|---|---|
| PC-LOGIN-RULE-001 | Defer: auth tickets must not implement open product/security decisions implicitly. | Ticket implementation rules | Valuable, but should be approved as a general workflow rule before becoming permanent. | Low |
| PC-LOGIN-RULE-002 | Promote after security approval: never place raw passwords, hashes, JWT secrets, access tokens, refresh tokens, or production auth data in docs/test artifacts. | Security rules | General, high-value prevention against leakage. | Low |
| PC-LOGIN-RULE-003 | Do not promote as global rule yet: check ticket artifact headings against `_ticket-template` before final response. | Documentation workflow rules | Useful for this workflow, but may be too procedural as a permanent rule. | Medium |
| PC-LOGIN-RULE-004 | Do not promote: when Vite/Maven fail from sandbox/network restrictions, rerun with approved escalation before treating as product failure. | Tooling rules | Environment-specific; better kept as knowledge/pattern, not rule. | Medium |

## Candidates for Standards

| ID | standard candidate | target | reason |
|---|---|---|---|
| PC-LOGIN-STD-001 | Promote after API/security review: auth error response standard | API/error standards | FE localization and security depend on stable machine-readable safe codes. |
| PC-LOGIN-STD-002 | Promote after architecture review: current-user endpoint compatibility policy | API standards | `/api/v1/auth/me` and `/api/v1/me` compatibility reduced rollout risk. |
| PC-LOGIN-STD-003 | Promote now as template candidate only: black-box AC mapping format | Testing standards | AC to `BB-LOGIN-*` mapping made manual review coverage explicit. |
| PC-LOGIN-STD-004 | Promote after security approval: synthetic auth test-data policy | Testing/security standards | Prevents production credential/PII/token leakage. |

## Candidates for Architecture Docs

| ID | update candidate | target | reason |
|---|---|---|---|
| PC-LOGIN-ARCH-001 | Promote after owner approval: replace or mark historical OAuth/session login assumptions | Architecture auth docs | Current LOGIN source of truth is username/password bearer-token MVP. |
| PC-LOGIN-ARCH-002 | Promote after security/architecture review: token-session revocation architecture | Security/auth architecture | Logout and protected API behavior depend on active token-session hashes. |
| PC-LOGIN-ARCH-003 | Do not promote until decided: refresh-token MVP decision | Security/auth architecture | Current response includes refresh token while active refresh flow is disabled. |
| PC-LOGIN-ARCH-004 | Defer: auth operation model | Operations architecture | Lockout cleanup, helpdesk unlock, audit logging, and session cleanup are release concerns but still under-specified. |

## Candidates for Failure Mode Index

| ID | failure mode | trigger | prevention | detection |
|---|---|---|---|---|
| FM-LOGIN-001 | Promote if failure-mode index is created: account existence leakage | Different observable behavior for unknown username vs wrong password | Generic error codes/messages and black-box comparison | FE/BE negative tests, BB-LOGIN-011 |
| FM-LOGIN-002 | Promote if failure-mode index is created: secret leakage in UI/API/logs/docs | Request body/token/hash/secret copied into response, log, screenshot, or artifact | Redaction rule and synthetic test data policy | Security review, BB-LOGIN-025/031 |
| FM-LOGIN-003 | Defer: refresh-token contract drift | Refresh token returned/stored but refresh flow disabled | Human decision record and contract test | API review, report open issue |
| FM-LOGIN-004 | Promote if failure-mode index is created: token revocation mismatch | Logout succeeds but old access token remains accepted | Active token-session validation and revoked-token E2E | BE integration/manual revoked-token test |
| FM-LOGIN-005 | Promote if failure-mode index is created: auth documentation drift | Multiple LOGIN doc packages updated inconsistently | Canonical location or sync rule | Template/source inventory review |
| FM-LOGIN-006 | Do not promote: sandbox false negative | Vite/Maven blocked by sandbox/network | Escalation retry policy | Compare failure text with sandbox patterns |
| FM-LOGIN-007 | Defer: encoding/template drift | Unicode headings/locales become mojibake | UTF-8 editor and template-heading check | Heading diff command |
| FM-LOGIN-008 | Promote as AC-20 pattern after review: out-of-scope auth path becomes active | OAuth/SSO/returnUrl/refresh/Remember Me introduced without decision | Ticket-rules stop condition | Black-box AC-20 cases |

## Not Promoted

| item | reason |
|---|---|
| Password reset behavior | Explicitly out of LOGIN MVP scope; no reusable decision. |
| Registration/invitation behavior | Explicitly out of LOGIN MVP scope; no reusable decision. |
| OAuth/SSO/MFA behavior | Explicitly out of LOGIN MVP scope and stale docs need owner review first. |
| Active refresh-token rotation flow | Requires unresolved human/security decision. |
| `/home` route and `returnUrl` implementation details | Requires unresolved product/security decision. |
| Sandbox escalation workflow as a global rule | Too environment-specific; keep as ticket-local knowledge unless repeated across tickets. |
| Full LOGIN architecture rewrite | Too large and requires human architecture approval. |
| New `docs/knowledge` tree | Directory does not exist; creating a new permanent structure needs owner approval. |
| New `docs/maintenance/failure-mode-index.md` | File does not exist; creating the index should be a separate approved maintenance task. |

## Human Approval Required

- Approve whether to create `docs/maintenance/failure-mode-index.md` and seed it with FM-LOGIN-001, FM-LOGIN-002, FM-LOGIN-004, FM-LOGIN-005, and FM-LOGIN-008.
- Approve whether to create `docs/knowledge/` and store an auth-ticket verification pattern there.
- Approve promotion of auth/security rules before moving them into `.claude/rules` or shared standards.
- Assign owners for refresh-token policy, token storage posture, email exposure, audit/unlock/cleanup, and documentation source-of-truth.
- Decide whether LOGIN architecture docs should mark older OAuth/session assumptions historical or replace them with the bearer-token MVP flow.
