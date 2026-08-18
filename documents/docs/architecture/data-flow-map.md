# Data Flow Map

## 1. Purpose

Documents all primary data flows in EDCAP: how data enters the system, passes through
validation, services, and persistence, and what is returned. Covers both BE and FE.

**Use this file to:**
- Understand which layers a given change will touch
- Verify validation points and error behaviors before implementing
- Identify sensitive data handling requirements
- Locate state/status transitions and DB write points

**Scope:** EDCAP_BE + EDCAP_FE as of Phase 0-B. Source-confirmed flows only.

---

## 2. High-level Data Flow

```text
Input / UI / External System
  ↓
HTTP Entry (filter layer)
  TraceIdFilter  → generates traceId, sets MDC, sets X-Trace-Id header
  SecurityFilter → validates session cookie or HMAC (webhooks)
  ↓
Controller / Webhook Handler  (web layer — thin, no business logic)
  Request parsing, @Valid bean validation, @CurrentUser resolution
  ↓
Use Case / Service  (application layer — @Service, @Transactional where needed)
  Business rules, orchestration, domain object construction
  ↓
Port Interface  (boundary — application layer defines, infra implements)
  ↓
Adapter / Connector  (infrastructure layer)
  Persistence adapter  → MyBatis XML → PostgreSQL
  External connector   → WebClient → GitHub / Jira / CircleCI APIs
  Git connector        → filesystem read → ArtifactNormalizer
  ↓
Response / Output
  DTO returned by controller → serialized to JSON
  ErrorResponse returned by GlobalExceptionHandler on any exception
  FE: ApiError thrown by lib/api.ts on non-2xx → TanStack Query error state
```

---

## 3. Main Flows

| Flow ID | Flow Name | Trigger | Output | Note |
|---------|-----------|---------|--------|------|
| FLOW-001 | OAuth2 Login & User Upsert | User clicks login; Google redirects back | Session cookie + `UserDto` | First user auto-promoted to ADMIN |
| FLOW-002 | Current User Fetch (FE boot) | FE `useAuth` hook on app mount | `UserDto` or 401 | Determines authenticated state |
| FLOW-003 | GitHub Webhook — PR Event | GitHub POST to webhook endpoint | 200 + result or 401 | HMAC verified before any DB write |
| FLOW-004 | CircleCI Webhook — Workflow Completed | CircleCI POST to webhook endpoint | 200 + result or 401 | HMAC verified before any DB write |
| FLOW-005 | Admin Connector Sync | Admin triggers `POST /api/v1/admin/connectors/{name}/run` | `ConnectorRunDto` | Calls external API outside transaction; per-item TX |
| FLOW-006 | GitLocal Artifact Ingestion | Part of connector sync for `git_local` | Artifact rows + AC rows in DB | Reads local filesystem; parses Markdown |
| FLOW-007 | Artifact Markdown Parsing (Demo) | `POST /api/v1/demo/parse-markdown` or parse-markdown-file | `ParsedArtifact` map | DEV-only endpoint; no DB write |
| FLOW-008 | FE Generic API Request | Component renders; TanStack Query fires | Typed data or error state | General pattern for all FE→BE calls |

---

## 4. Flow Details

### FLOW-001: OAuth2 Login & User Upsert

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | Browser / FE | — | Click "Login" | Redirect to `/oauth2/authorization/google` | |
| 2 | Spring Security | `config/SecurityConfig.java` | GET `/oauth2/authorization/google` | Redirect to Google consent URL | Handled entirely by Spring OAuth2 client |
| 3 | Google OAuth2 | External | User consent | Auth code callback to `/login/oauth2/code/google` | |
| 4 | Spring Security | `SecurityConfig.java` | Auth code | Token exchange → `OAuth2User` principal | Spring handles token exchange |
| 5 | `AppUserService` | `application/usecase/governance/AppUserService.java` | `OAuth2User` | `AppUser` (created or updated) | `@Transactional` |
| 6 | `AppUserRepositoryPort` | `application/port/out/persistence/` | `provider` + `providerUid` | `Optional<AppUser>` | Read to check if existing user |
| 7 | First-user rule | `AppUserService.upsertFromOAuth()` | `repo.count()` | `role = ADMIN` if 0, else `VIEWER` | Business rule: bootstrap first admin |
| 8 | `AppUserRepositoryAdapter` | `infrastructure/persistence/adapter/` | `AppUser` entity | `AppUser` with `id` set | INSERT or UPDATE `app_user` |
| 9 | Spring Security | `SecurityConfig.java` | Successful upsert | Set-Cookie: JSESSIONID | Session created (IF_REQUIRED) |
| 10 | Browser redirect | FE | Session cookie | Redirect to app | FE then calls GET /api/v1/me |

---

### FLOW-002: Current User Fetch (FE boot)

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | `useAuth` hook | `EDCAP_FE/src/hooks/useAuth.ts` | App mount | `useQuery(["me"])` | Runs on every page load |
| 2 | `lib/api.ts` | `EDCAP_FE/src/lib/api.ts` | `queryFn` | `fetch GET /api/v1/me` with `credentials: "include"` | Session cookie sent automatically |
| 3 | `TraceIdFilter` | `config/TraceIdFilter.java` | HTTP request | `traceId` in MDC; `X-Trace-Id` in response | Highest priority filter |
| 4 | Spring Security | `SecurityConfig.java` | Request | Validate session or return 401 | |
| 5 | `MeController.me()` | `web/rest/MeController.java` | `@AuthenticationPrincipal OAuth2User` | Calls `AppUserService.upsertFromOAuth()` | Upserts on every call (idempotent) |
| 6 | `AppUserService` | `application/usecase/governance/` | `OAuth2User` | `AppUser` domain object | `@Transactional` |
| 7 | `Dtos.UserDto.from()` | `web/dto/Dtos.java` | `AppUser` | `UserDto(id, email, displayName, role, avatarUrl)` | DTO mapping in service/controller |
| 8 | `lib/api.ts` | FE | `200 UserDto` | Returns typed data | |
| 9 | `useAuth` hook | FE | `data` | `{ user, isAuthenticated, isLoading }` | 401 → return `null` user; no retry |

**401 path:** `ApiError(401)` caught by `useAuth` → returns `null` user (no throw, no retry) → FE redirects to login.

---

### FLOW-003: GitHub Webhook — PR Event

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | GitHub | External | PR opened/updated/merged | `POST /api/v1/webhooks/github` | Includes `X-Hub-Signature-256`, `X-GitHub-Event`, `X-GitHub-Delivery` headers |
| 2 | `TraceIdFilter` | `config/TraceIdFilter.java` | HTTP request | `traceId` set in MDC | |
| 3 | Spring Security | `SecurityConfig.java` | POST `/api/v1/webhooks/**` | `permitAll` — no session required | HMAC is the only auth gate |
| 4 | `GithubWebhookController.receive()` | `web/webhook/GithubWebhookController.java` | `byte[] body`, headers | Delegates to service | Passes raw bytes (not parsed) |
| 5 | `GithubWebhookService.handle()` | `application/usecase/ingestion/` | `rawBody`, `signatureHeader`, `eventType`, `deliveryId` | `Result(handled, recordsAffected)` | |
| 6 | HMAC verify | `GithubWebhookService.verifySignature()` | `rawBody` + `X-Hub-Signature-256` | Pass or `SecurityException` | Uses `MessageDigest.isEqual` (constant-time); **must run before any DB access** |
| 7 | Event routing | `GithubWebhookService` | `eventType` | Route to handler | `pull_request` → `handlePullRequest()`; other events → logged and ignored |
| 8 | `handlePullRequest()` | `GithubWebhookService` | `JsonNode payload`, `deliveryId` | — | Parses `repository.full_name` from payload |
| 9 | `RepositoryRepositoryPort.findFirstByRepoKeyAndHostType()` | Port → `RepositoryRepositoryAdapter` | `repoKey` (owner/repo), `GITHUB` | `Optional<Repository>` | If empty → event ignored with WARN log |
| 10 | `GithubConnector.upsertPullRequest()` | `infrastructure/github/GithubConnector.java` | `projectId`, `Repository`, `JsonNode` | — | Maps JSON fields to `PullRequest` domain object |
| 11 | `PullRequestRepositoryPort.findByRepositoryIdAndExternalPrNumber()` | Port → adapter | `repositoryId`, `externalPrNumber` | `Optional<PullRequest>` | Idempotency check |
| 12 | `PullRequestRepositoryPort.save()` | Port → `PullRequestRepositoryAdapter` | `PullRequest` | `PullRequest` with `id` | INSERT or UPDATE `pull_request` |
| 13 | Response | `GithubWebhookController` | `Result` | `200 {"handled": "pull_request", "recordsAffected": 1}` | |

**HMAC failure path:** `SecurityException` → `GlobalExceptionHandler` → `401 ErrorResponse` with `traceId`. Payload is never read.

---

### FLOW-003B: Git/PR Metadata Collector — PR Event and Manual Collection

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | GitHub webhook / Admin API | External / HTTP | PR event or manual collect request | Request body + headers | Manual collect uses the admin-only API; webhook reuses the existing GitHub endpoint |
| 2 | Controller / webhook handler | `web/rest/` or `web/webhook/` | Raw request, signature, `@CurrentUser` where applicable | Delegates to service | Keep controller thin and do not place collector business logic here |
| 3 | `GitPrMetadataCollectorService` | `application/usecase/ingestion/` | Repository ID, PR number, traceId, caller | Collector run | Handles ticket inference, review-state normalization, and idempotent orchestration |
| 4 | GitHub metadata port | `application/port/out/integration/` | Repository/PR reference | PR graph, commits, changed files, review state | Provider fetch boundary |
| 5 | Persistence port | `application/port/out/persistence/` | Collector graph | Upserted PR, commit, file, traceability, and run rows | Keep writes idempotent |
| 6 | Scanner compatibility path | Existing scanner flow | Updated ticket context | Existing Artifact Scanner behavior remains intact | Collector must not break existing evidence inventory behavior |

**Validation notes:** HMAC must still be verified before payload processing on the webhook path; manual collection must remain `ADMIN`-only.

---

### FLOW-004: CircleCI Webhook — Workflow Completed

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | CircleCI | External | Workflow completed event | `POST /api/v1/webhooks/circleci` | Includes `Circleci-Signature`, `Circleci-Event-Type` headers |
| 2 | `TraceIdFilter` | `config/TraceIdFilter.java` | HTTP request | `traceId` set | |
| 3 | Spring Security | `SecurityConfig.java` | POST `/api/v1/webhooks/**` | `permitAll` | |
| 4 | `CircleCiWebhookController.receive()` | `web/webhook/CircleCiWebhookController.java` | `byte[] body`, headers | Delegates to service | |
| 5 | `CircleCiWebhookService.handle()` | `application/usecase/ingestion/` | `rawBody`, `signatureHeader`, `eventType` | `Result` | |
| 6 | HMAC verify | `CircleCiWebhookService.verifySignature()` | `rawBody` + `Circleci-Signature` | Pass or `SecurityException` | Constant-time compare; **runs first** |
| 7 | Event routing | `CircleCiWebhookService` | `eventType` | Route handler | `workflow-completed` → `handleWorkflowCompleted()` |
| 8 | `handleWorkflowCompleted()` | `CircleCiWebhookService` | `JsonNode payload` | — | Parses VCS repo info from payload |
| 9 | `RepositoryRepositoryPort.findFirstByRepoKeyAndHostType()` | Port → adapter | `repoKey`, `GITHUB` | `Optional<Repository>` | Uses GITHUB host type for CircleCI repos |
| 10 | `CircleCiConnector.upsertCiRun()` | `infrastructure/circleci/CircleCiConnector.java` | `Repository`, `JsonNode` | — | Maps workflow fields to `CiRun` domain object |
| 11 | `CiRunRepositoryPort.findByProviderAndExternalRunId()` | Port → adapter | `CIRCLECI`, `externalRunId` | `Optional<CiRun>` | Idempotency check |
| 12 | `CiRunRepositoryPort.save()` | Port → `CiRunRepositoryAdapter` | `CiRun` | `CiRun` with `id` | INSERT or UPDATE `ci_run` |
| 13 | Response | `CircleCiWebhookController` | `Result` | `200 {"handled": "workflow-completed", "recordsAffected": 1}` | |

---

### FLOW-005: Admin Connector Sync

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | FE / Admin UI | — | Admin triggers sync | `POST /api/v1/admin/connectors/{name}/run?projectId=<id>` | |
| 2 | Spring Security | `SecurityConfig.java` | Session cookie | Authenticate user | Route requires authentication |
| 3 | `CurrentAppUserResolver` | `web/security/CurrentAppUserResolver.java` | `OAuth2AuthenticationToken` | `AppUser` injected as `@CurrentUser` | Looks up `AppUser` by provider+uid |
| 4 | `AdminController.runConnector()` | `web/rest/AdminController.java` | `name`, `projectId`, `@CurrentUser AppUser` | — | Inline ADMIN role check: `Map.of("error","ADMIN role required")` if not ADMIN ← known inconsistency (HD2) |
| 5 | `ConnectorOrchestrator.runOne()` | `application/usecase/collection/` | `connectorName`, `projectId` | `ConnectorRun` | No `@Transactional` — long-running; external call outside TX |
| 6 | Create start record | `ConnectorRunRepositoryPort.save()` | `ConnectorRun(RUNNING)` | `ConnectorRun` with `id` | Persists before calling external API |
| 7 | `EvidenceConnectorPort.sync(projectId)` | Port → connector impl | `projectId` | `ConnectorResult(recordsIngested, message)` | See sub-flows per connector below |
| 7a | *GitHub sub-flow* | `GithubConnector.sync()` | `projectId` | PRs upserted | GET GitHub API `/repos/{owner}/{repo}/pulls` (via `githubWebClient`) → per-PR `TransactionTemplate` → upsert `pull_request` |
| 7b | *Jira sub-flow* | `JiraConnector.sync()` | `projectId` | Tickets upserted | JQL search via `jiraWebClient` → per-issue upsert `ticket` |
| 7c | *CircleCI sub-flow* | `CircleCiConnector.sync()` | `projectId` | CI runs upserted | GET CircleCI API → per-workflow upsert `ci_run` |
| 7d | *GitLocal sub-flow* | `GitLocalConnector.sync()` | `projectId` | Artifacts + ACs upserted | See FLOW-006 |
| 8 | Update run record | `ConnectorRunRepositoryPort.save()` | `ConnectorRun(SUCCESS/FAILED, recordsIngested, errorMessage, finishedAt)` | — | Always updates even on failure |
| 9 | Response | `AdminController` | `ConnectorRun` | `ConnectorRunDto` | |

**Role gate:** ADMIN check is inline in `AdminController` (not via Spring Security annotation). Returns `Map.of("error","ADMIN role required")` — not `ErrorResponse` shape — for non-ADMIN callers.

---

### FLOW-006: GitLocal Artifact Ingestion (sub-flow of FLOW-005)

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | `GitLocalConnector.sync()` | `infrastructure/gitlocal/GitLocalConnector.java` | `projectId` | `ConnectorResult` | `@Transactional` on the whole `sync()` — differs from other connectors |
| 2 | Scan ticket dirs | Filesystem | `app.connectors.git-local.root-path` | `List<Path>` (ticket dirs) | E.g. `./sample-repo/docs/changes/PROJ-001/` |
| 3 | Lookup ticket | `TicketRepositoryPort.findByProjectIdAndTicketKey()` | `projectId`, `ticketKey` (dir name) | `Optional<Ticket>` | If not found → upsert new `Ticket` with status OPEN |
| 4 | `ArtifactNormalizer.parse()` | `domain/service/ArtifactNormalizer.java` | File content as `String` | `ParsedArtifact(frontMatter, sections, acceptanceCriteria, contentHash)` | Pure function; no I/O |
| 5 | Compute SHA-256 hash | `ArtifactNormalizer` | File content | `contentHash` | Used for change detection |
| 6 | Check required fields | `GitLocalConnector.checkRequiredFields()` | `artifactType`, `ParsedArtifact` | `List<String>` (missing fields) | Stored as JSON array in `required_fields_missing` |
| 7 | Detect template-only | `GitLocalConnector.isTemplateOnly()` | `ParsedArtifact` | `boolean` | Checks if content is still a placeholder |
| 8 | Upsert artifact | `ArtifactRepositoryPort.save()` | `Artifact` | `Artifact` with `id` | INSERT or UPDATE `artifact`; UNIQUE(ticket_id, artifact_type, file_path) |
| 9 | Sync AC lines | `AcceptanceCriterionRepositoryPort.deleteByTicketId()` + `saveAll()` | `ticketId`, `List<AcceptanceCriterion>` | — | Delete all + re-insert; loses original row IDs |
| 10 | Update `ac_count` | `TicketRepositoryPort.save()` | `Ticket(acCount=parsed.size())` | — | Denormalized count |

---

### FLOW-007: Artifact Markdown Parsing (Demo)

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | FE / curl | — | `POST /api/v1/demo/parse-markdown` or `parse-markdown-file` | — | `permitAll` in `SecurityConfig` — no auth needed |
| 2 | `DemoController.parseInline()` | `web/rest/DemoController.java` | `ParseRequest(content: @NotBlank String)` | — | `@Valid` validates `@NotBlank` |
| 2b | `DemoController.parseFile()` | `web/rest/DemoController.java` | `ParseFileRequest(path: @NotBlank String)` | — | Extension whitelist + path normalization guard |
| 3 | Path guard (file variant) | `DemoController` | `path` | Rejected or file content | Extension whitelist; path must be under CWD; prevents directory traversal |
| 4 | `ArtifactNormalizer.parse()` | `domain/service/ArtifactNormalizer.java` | Markdown `String` | `ParsedArtifact` | Pure function; no DB call |
| 5 | Response | `DemoController` | `ParsedArtifact` | `Map<String, Object>` with frontMatter, sections, acceptanceCriteria, contentHash | No DB write |

> **Warning:** This endpoint is `permitAll` and reads the filesystem (file variant).
> It should be removed or gated before production deployment.

---

### FLOW-008: FE Generic API Request (General Pattern)

| Step | Component | Path | Data In | Data Out | Note |
|------|-----------|------|---------|----------|------|
| 1 | React component | `pages/` or `components/` | User action or mount | `useQuery` or `useMutation` | |
| 2 | TanStack Query | `src/lib/queryClient.ts` | Query key + `queryFn` | Deduped, cached fetch | Retry: default 3x (disabled for 401 in `useAuth`) |
| 3 | `lib/api.ts` | `src/lib/api.ts` | Path + method + body | `fetch()` with `credentials: "include"` | All calls go through here — never raw `fetch` in components |
| 4 | `TraceIdFilter` | BE | Request | `X-Trace-Id` response header set | |
| 5 | Spring Security | BE | Session cookie | Authenticated principal or 401 | |
| 6 | Controller | BE | Request body / path vars | Service call | `@Valid` validation on `@RequestBody` |
| 7 | Service | BE | Business logic | Domain operation | `@Transactional` where applicable |
| 8 | DB / External | BE | SQL / HTTP | Result | MyBatis mapper or WebClient |
| 9 | DTO response | BE | Domain entity | Serialized JSON | 200 OK |
| 9b | Error path | BE | Any exception | `GlobalExceptionHandler` → `ErrorResponse(timestamp, status, error, message, traceId)` | |
| 10 | `lib/api.ts` | FE | HTTP response | `data` on 2xx; `throw ApiError(status, message, traceId)` on non-2xx | |
| 11 | Component | FE | `{ data, isLoading, isError, error }` | Render data / skeleton / error message | |

---

## 5. Validation Points

| Flow | Validation Point | Rule / Source | Error Behavior |
|------|-----------------|---------------|----------------|
| FLOW-001 | OAuth2 token validity | Google token expiry / revocation | Spring Security throws; redirects to login |
| FLOW-002 | Session cookie | JSESSIONID must be valid | 401 → `useAuth` returns null user |
| FLOW-003 | HMAC signature | `sha256=<hex>` of raw body with webhook secret (`MessageDigest.isEqual`) | `SecurityException` → 401 `ErrorResponse` |
| FLOW-003 | Repo lookup | `repository` row must exist for `repoKey+hostType` | Event ignored (WARN log); 200 returned |
| FLOW-004 | HMAC signature | `Circleci-Signature` header | `SecurityException` → 401 `ErrorResponse` |
| FLOW-005 | ADMIN role check | `caller.getRole() == ADMIN` (inline in `AdminController`) | `Map.of("error","ADMIN role required")` — NOT `ErrorResponse` shape (HD2) |
| FLOW-005 | Connector name | Must match a registered `EvidenceConnectorPort.name()` | `IllegalArgumentException` → 400 |
| FLOW-006 | File extension | Whitelist in `DemoController.parseFile()` | Rejected with 400 |
| FLOW-006 | Path normalization | Path must resolve within CWD | Rejected with 400 |
| FLOW-007 | `@NotBlank content` | `@Valid` on `ParseRequest` / `ParseFileRequest` | `MethodArgumentNotValidException` → 400 with first-field error message |
| FLOW-008 | Session on all `/api/v1/**` (except health, webhooks, demo) | Spring Security `anyRequest().authenticated()` | 401 → `useAuth` returns null |
| FLOW-008 | `@Valid @RequestBody` | Bean validation on all request objects | 400 `ErrorResponse(errorCode=VALIDATION_ERROR)` |

---

## 6. State / Status Transitions

| Flow | Entity | From | To | Trigger | Condition |
|------|--------|------|----|---------|-----------|
| FLOW-001 | `AppUser.role` | _(new)_ | `ADMIN` | First user created | `appUserRepository.count() == 0` |
| FLOW-001 | `AppUser.role` | _(new)_ | `VIEWER` | Subsequent user created | `count > 0` |
| FLOW-001 | `AppUser.active` | _(new)_ | `true` | User created | Default |
| FLOW-003 | `PullRequest.state` | `OPEN` | `MERGED` | Webhook `pull_request.action = closed` + `merged = true` | Mapped in `GithubConnector` |
| FLOW-003 | `PullRequest.state` | `OPEN` | `CLOSED` | Webhook `pull_request.action = closed` + `merged = false` | |
| FLOW-004 | `CiRun.status` | `RUNNING` | `SUCCESS` | Webhook `workflow-completed` + CircleCI status = `success` | `CircleCiConnector.mapStatus()` |
| FLOW-004 | `CiRun.status` | `RUNNING` | `FAILED` | Webhook `workflow-completed` + any non-success status | |
| FLOW-005 | `ConnectorRun.status` | _(new)_ | `RUNNING` | `ConnectorOrchestrator.runOne()` starts | Before calling external API |
| FLOW-005 | `ConnectorRun.status` | `RUNNING` | `SUCCESS` | `EvidenceConnectorPort.sync()` returns normally | After sync completes |
| FLOW-005 | `ConnectorRun.status` | `RUNNING` | `FAILED` | Any uncaught exception during sync | `errorMessage` is set |
| FLOW-006 | `Ticket.status` | _(new)_ | `OPEN` | New ticket dir found in GitLocal scan | Default on creation |
| FLOW-006 | `Artifact.templateOnly` | `false` | `true` | `ArtifactNormalizer` detects placeholder content | `isTemplateOnly()` check |

---

## 7. Data Persistence Points

| Flow | Table / Storage | Operation | Repository / Path |
|------|----------------|-----------|-------------------|
| FLOW-001 | `app_user` | INSERT or UPDATE (upsert) | `AppUserRepositoryAdapter` → `AppUserMapper.xml` |
| FLOW-003 | `pull_request` | INSERT or UPDATE | `PullRequestRepositoryAdapter` → `PullRequestMapper.xml` |
| FLOW-004 | `ci_run` | INSERT or UPDATE | `CiRunRepositoryAdapter` → `CiRunMapper.xml` |
| FLOW-005 | `connector_run` | INSERT (start) then UPDATE (finish) | `ConnectorRunRepositoryAdapter` → `ConnectorRunMapper.xml` |
| FLOW-005 (7a) | `pull_request` | INSERT or UPDATE per PR | `PullRequestRepositoryAdapter` |
| FLOW-005 (7b) | `ticket` | INSERT or UPDATE per Jira issue | `TicketRepositoryAdapter` → `TicketMapper.xml` |
| FLOW-005 (7c) | `ci_run` | INSERT or UPDATE per workflow | `CiRunRepositoryAdapter` |
| FLOW-006 | `ticket` | INSERT or UPDATE | `TicketRepositoryAdapter` |
| FLOW-006 | `artifact` | INSERT or UPDATE | `ArtifactRepositoryAdapter` → `ArtifactMapper.xml` |
| FLOW-006 | `acceptance_criterion` | DELETE all by ticketId + INSERT all | `AcceptanceCriterionRepositoryAdapter` → `AcceptanceCriterionMapper.xml` |
| FLOW-007 | _(none)_ | No DB write | Pure parse; `ArtifactNormalizer` is stateless |

---

## 8. External Transmission Points

| Flow | External Target | Data Sent | Risk | Note |
|------|----------------|-----------|------|------|
| FLOW-001 | Google OAuth2 | Auth code (via Spring Security) | Token interception if HTTPS not enforced | Handled by Spring; never touches application code |
| FLOW-005 (7a) | GitHub API `api.github.com` | `GET /repos/{owner}/{repo}/pulls` | API token exposed if logged at DEBUG | Token via `Authorization: Bearer ${GITHUB_API_TOKEN}` header in `WebClientConfig` |
| FLOW-005 (7b) | Jira API (configured `JIRA_BASE_URL`) | `GET /rest/api/3/search` (JQL) | Basic auth credentials in header | `Authorization: Basic base64(email:token)` in `WebClientConfig` |
| FLOW-005 (7c) | CircleCI API `circleci.com/api/v2` | `GET /project/{vcs}/{org}/{repo}/pipeline` | API token | `Circle-Token` header |
| FLOW-003 | Incoming from GitHub | PR payload (full PR JSON) | Contains author login, branch names, PR title | Validated by HMAC; no PII beyond GitHub user identifiers |
| FLOW-004 | Incoming from CircleCI | Workflow payload | Contains VCS repo metadata, workflow status | Validated by HMAC |

---

## 9. Sensitive Data Handling

| Data | Where Used | Masking / Logging Policy | Risk |
|------|-----------|--------------------------|------|
| `GITHUB_API_TOKEN` | `WebClientConfig` → `githubWebClient` Authorization header | Never logged; injected via env var | Leaked if DEBUG logs capture HTTP headers |
| `JIRA_API_TOKEN` + `JIRA_EMAIL` | `WebClientConfig` → `jiraWebClient` Basic auth | Never logged; injected via env var | Leaked if DEBUG logs capture HTTP headers |
| `CIRCLECI_API_TOKEN` | `WebClientConfig` → `circleciWebClient` Circle-Token header | Never logged; injected via env var | |
| `EDCAP_WEBHOOK_SECRET` | `GithubWebhookService.verifySignature()` | Never logged; compared via `MessageDigest.isEqual` only | Secret must not appear in logs or error messages |
| `CIRCLECI_WEBHOOK_SECRET` | `CircleCiWebhookService.verifySignature()` | Same as above | |
| `JSESSIONID` (session cookie) | Set by Spring Security on login | `HttpOnly; Secure` (in production) | XSS risk if `HttpOnly` is disabled |
| `AppUser.email` | Stored in `app_user.email`; returned in `UserDto` | Not masked in API response | PII — `UserDto` includes email; do not log full `UserDto` |
| `AppUser.avatarUrl` | Returned in `UserDto` | Not masked | External URL; not PII in itself |
| `ConnectorRun.errorMessage` | Stored in DB; returned in `ConnectorRunDto` | May contain internal error messages | Do not include raw exception messages if they contain config details |
| Webhook raw body | Passed as `byte[]` to service | Logged only at event-type level (not full body) | PR titles / commit messages may contain PII |
| `app.jwt.secret` | `AppProperties.Jwt` | Never log | Configured but JWT usage not confirmed in active code path (see §10) |

---

## 10. Unknown / Need Confirmation

| Item | Reason | Risk | Required Action |
|------|--------|------|-----------------|
| JWT active or vestigial? | `AppProperties.Jwt(secret, expirationHours)` is configured; no JWT-generating code found in flows above — auth is session-cookie only | Medium: if JWT is used in a path not yet documented, auth model is inconsistent | Read any `JwtUtil`, `JwtFilter`, or `JwtTokenProvider` class if it exists; confirm or remove config |
| GitHub connector: pagination of PRs? | `GithubConnector.sync()` fetches `/repos/{owner}/{repo}/pulls`; GitHub paginates at 30 per page | High: only first page of PRs may be ingested if pagination is not handled | Read `GithubConnector.syncRepo()` for pagination loop; confirm `Link: next` header handling |
| Jira connector: pagination? | JQL search paginates; `maxResults` + `startAt` must be handled | High: same as above | Read `JiraConnector.sync()` for startAt loop |
| CircleCI connector: per-repo or per-project? | `CircleCiConnector.sync(projectId)` — unclear if it iterates all repos in the project | Medium | Read `CircleCiConnector.syncRepo()` |
| `AdminController` ADMIN check | Role check returns `Map.of("error","ADMIN role required")` — not `ErrorResponse` | Medium: FE must handle two different error shapes for this endpoint | Pending HD2 decision; frontend needs null-safe handling |
| `DemoController` in production | Endpoint is `permitAll` and reads filesystem | High | Must be removed or gated by `@Profile("dev")` before production |
| `springdoc` / OpenAPI accessibility | `api-docs: /api/v1/openapi` and `swagger-ui` are `permitAll` in `SecurityConfig` | Low–Medium: exposes API schema publicly | Confirm if this is intentional; consider requiring auth in production |
| GitLocal `@Transactional` on full `sync()` | Entire local scan runs in one transaction — differs from other connectors which use per-item `TransactionTemplate` | Medium: large local repos may hold DB connection for extended time | Review if GitLocal should also use per-item TX |
| Connector retry / backoff | No retry or backoff visible in `GithubConnector` / `JiraConnector` / `CircleCiConnector` WebClient calls | Medium: transient API errors fail the entire sync with no recovery | Confirm if WebClient has retry config in `WebClientConfig`; add if absent |

---

## 11. Source Files Read

| File | Purpose |
|------|---------|
| `docs/architecture/key-flows.md` | 4 existing sequence diagrams (OAuth2, webhook, connector, FE request) |
| `docs/architecture/service-layer-map.md` | Service/controller/port/adapter mapping |
| `docs/architecture/repository-db-map.md` | Table/column/mapper/migration mapping |
| `EDCAP_BE/web/rest/MeController.java` | `/api/v1/me` endpoint |
| `EDCAP_BE/web/rest/AdminController.java` | Connector management endpoints |
| `EDCAP_BE/web/rest/DemoController.java` | Markdown parse endpoint |
| `EDCAP_BE/web/rest/HealthController.java` | `/api/v1/health` |
| `EDCAP_BE/web/webhook/GithubWebhookController.java` | GitHub webhook entry point |
| `EDCAP_BE/web/webhook/CircleCiWebhookController.java` | CircleCI webhook entry point |
| `EDCAP_BE/application/usecase/governance/AppUserService.java` | User upsert service |
| `EDCAP_BE/application/usecase/collection/ConnectorOrchestrator.java` | Connector lifecycle service |
| `EDCAP_BE/application/usecase/ingestion/GithubWebhookService.java` | GitHub event handling |
| `EDCAP_BE/application/usecase/ingestion/CircleCiWebhookService.java` | CircleCI event handling |
| `EDCAP_BE/application/port/out/integration/EvidenceConnectorPort.java` | Connector output port |
| `EDCAP_BE/application/port/out/integration/PullRequestIngestionPort.java` | PR upsert port |
| `EDCAP_BE/application/port/out/integration/CiRunIngestionPort.java` | CI run upsert port |
| `EDCAP_BE/application/port/out/persistence/AppUserRepositoryPort.java` | User persistence port |
| `EDCAP_BE/application/port/out/persistence/TicketRepositoryPort.java` | Ticket persistence port |
| `EDCAP_BE/application/port/out/persistence/PullRequestRepositoryPort.java` | PR persistence port |
| `EDCAP_BE/application/port/out/persistence/CiRunRepositoryPort.java` | CI run persistence port |
| `EDCAP_BE/application/port/out/persistence/ConnectorRunRepositoryPort.java` | Connector run port |
| `EDCAP_BE/application/port/out/persistence/ArtifactRepositoryPort.java` | Artifact persistence port |
| `EDCAP_BE/application/port/out/persistence/AcceptanceCriterionRepositoryPort.java` | AC persistence port |
| `EDCAP_BE/infrastructure/github/GithubConnector.java` | GitHub API + PR ingestion adapter |
| `EDCAP_BE/infrastructure/jira/JiraConnector.java` | Jira API + ticket ingestion adapter |
| `EDCAP_BE/infrastructure/circleci/CircleCiConnector.java` | CircleCI API + CI run ingestion adapter |
| `EDCAP_BE/infrastructure/gitlocal/GitLocalConnector.java` | Filesystem artifact ingestion adapter |
| `EDCAP_BE/config/TraceIdFilter.java` | Request trace ID generation |
| `EDCAP_BE/config/SecurityConfig.java` | Spring Security — auth, CORS, public routes |
| `EDCAP_BE/config/AppProperties.java` | Configuration record — connector secrets, CORS, JWT |
| `EDCAP_BE/config/WebClientConfig.java` | GitHub, Jira, CircleCI WebClient beans |
| `EDCAP_BE/config/WebMvcConfig.java` | `@CurrentUser` argument resolver registration |
| `EDCAP_BE/web/security/CurrentUser.java` | Annotation for injecting resolved `AppUser` |
| `EDCAP_BE/web/security/CurrentAppUserResolver.java` | Resolves `@CurrentUser` from security context |
| `EDCAP_BE/web/dto/Dtos.java` | `UserDto`, `ConnectorRunDto`, `HealthDto` |
| `EDCAP_BE/web/exception/ErrorResponse.java` | Error response record (`OffsetDateTime` timestamp) |
| `EDCAP_BE/web/exception/GlobalExceptionHandler.java` | Exception → HTTP status mapping |
| `EDCAP_BE/domain/service/ArtifactNormalizer.java` | Pure Markdown parser domain service |
| `EDCAP_FE/src/lib/api.ts` | Fetch wrapper, `ApiError`, `credentials: include` |
| `EDCAP_FE/src/hooks/useAuth.ts` | Auth state hook, 401 handling |

Files intentionally NOT read: `.env*`, production secrets, private keys, production logs.
