# Key Flows

## 1. JWT Authentication (Username / Password)

```
Browser                 EDCAP_FE            EDCAP_BE
   │                       │                    │                        │
   │── submit username/password ────────────────►│
   │                        │                    │ AuthController/AuthService
   │                        │                    │ └── authenticate credentials
   │                        │                    │ └── issue JWT access token
   │                        │                    │ └── create/update app_user row if needed
   │                        │◄── auth response ──│
   │── store token / call me ───────────────────►│
   │                        │                    │ AppUserService / AuthTokenService
   │◄── UserDto / 401 ───────┤                    │
```

**Code locations:**
- Auth API: `application/usecase/governance/AuthService.java`
- Token service: `application/usecase/governance/AuthTokenService.java`
- Auth hook: `EDCAP_FE/src/hooks/useAuth.ts`
- Frontend API wrapper: `EDCAP_FE/src/lib/api.ts`

---

## 2. GitHub Webhook Processing

```
GitHub                     EDCAP_BE
   │                           │
   │── POST /api/v1/webhooks/github
   │   X-Hub-Signature-256: sha256=<hmac>
   │   X-GitHub-Event: push / pull_request / ...
   │                           │
   │                           │ GithubWebhookController
   │                           │ └── GithubWebhookService.handle(body, signature, event, delivery)
   │                           │     └── verifyHmacSha256(body, signature)  ← validates FIRST
   │                           │         └── on failure: throw SecurityException → 401
   │                           │     └── route by event type
   │                           │         └── handlePullRequest() / handlePush() / etc.
   │                           │             └── IngestionService.upsert*(projectId, payload)
   │                           │                 └── TransactionTemplate per item
   │◄── 200 OK ────────────────│
```

**Key constraint:** HMAC validation happens before any DB write. Webhook endpoint is
`permitAll` in Spring Security — signature is the only auth gate.

**Code locations:**
- Controller: `web/webhook/GithubWebhookController.java`
- Service: `application/GithubWebhookService.java`
- HMAC util: inside `GithubWebhookService` or a shared `HmacUtils`

---

## 3. External Connector Sync (e.g., GitHub PRs)

```
Scheduler / API call         GithubConnector                 PostgreSQL
        │                          │                              │
        │── sync(projectId) ───────►│                             │
        │                          │                              │
        │                          │  1. fetch from GitHub API    │
        │                          │  (WebClient, OUTSIDE tx)     │
        │                          │  └── GET /repos/{owner}/{repo}/pulls
        │                          │                              │
        │                          │  2. for each PR:             │
        │                          │  TransactionTemplate.execute │
        │                          │  └── upsert pull_request row │──►│
        │                          │  └── upsert artifacts        │──►│
        │                          │                              │
        │                          │  3. persist ConnectorRun     │──►│
        │◄── ConnectorResult ───────│   (success / failure count) │
```

**Why per-item transactions?**
External fetch can return 100+ items. A single transaction would hold a DB connection
for the entire HTTP fetch duration. Per-item `TransactionTemplate` allows partial
success: one bad item is rolled back without losing all others.

**Code location:** `infrastructure/github/GithubConnector.java`

---

## 4. Frontend API Request

```
Component / Hook          TanStack Query          lib/api.ts           EDCAP_BE
     │                         │                      │                    │
     │── useQuery(["me"]) ─────►│                     │                    │
     │                          │── queryFn() ────────►│                   │
     │                          │                      │── fetch /api/v1/me►│
     │                          │                      │                    │ GlobalExceptionHandler
     │                          │                      │                    │ └── on success: 200 + DTO
     │                          │                      │                    │ └── on 401: ErrorResponse
     │                          │                      │◄── response ───────│
     │                          │                      │ if 401 → throw ApiError(401)
     │                          │                      │ if !ok  → throw ApiError(status)
     │                          │◄── data or error ────│
     │◄── { data, isLoading, isError } ────────────────│
```

**Auth error handling:** `useAuth` catches `ApiError(401)` and returns `null` (unauthenticated
state) without retrying — preventing infinite redirect loops.

**Code locations:**
- Fetch wrapper: `EDCAP_FE/src/lib/api.ts`
- Query client: `EDCAP_FE/src/lib/queryClient.ts`
- Auth hook: `EDCAP_FE/src/hooks/useAuth.ts`
