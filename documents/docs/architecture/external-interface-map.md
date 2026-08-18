# External Interface Map

## 1. Purpose

Catalogs every connection between EDCAP and the outside world: outbound API calls,
inbound webhooks, file system reads, and authentication providers.

Use this file to:
- Understand what credentials / secrets are required before deploying
- Identify retry, timeout, and pagination gaps before production
- Review sensitive data handling at each integration boundary
- Plan load testing and failure-mode analysis for each external dependency

**Scope:** EDCAP_BE as of Phase 0-B. Source-confirmed only; no reverse-engineered values.

---

## 2. External Interface Summary

| Interface | Type | Direction | Path / Endpoint | Purpose |
|-----------|------|-----------|-----------------|---------|
| GitHub REST API | API | Outbound | `api.github.com/repos/{owner}/{repo}/pulls` | Pull all PRs for a repository |
| Jira REST API | API | Outbound | `{JIRA_BASE_URL}/rest/api/3/search` | Search issues by project JQL |
| CircleCI REST API — pipelines | API | Outbound | `circleci.com/api/v2/project/{slug}/pipeline` | List pipelines for a repository |
| CircleCI REST API — workflows | API | Outbound | `circleci.com/api/v2/pipeline/{id}/workflow` | List workflows for a pipeline |
| Google OAuth2 | Auth Provider | Outbound | Google consent + token exchange (Spring Security) | Authenticate users via Google account |
| GitHub Webhooks | Webhook | Inbound | `POST /api/v1/webhooks/github` | Receive real-time PR events from GitHub |
| CircleCI Webhooks | Webhook | Inbound | `POST /api/v1/webhooks/circleci` | Receive real-time workflow-completed events |
| Git Local filesystem | File | Inbound | `<root>/docs/changes/<TICKET_KEY>/*.md` | Read local SDD artifact Markdown files |

---

## 3. Outbound Interfaces

### 3.1 GitHub REST API

| Attribute | Detail |
|-----------|--------|
| **Target** | GitHub REST API v3 |
| **Caller** | `GithubConnector.syncRepo()` |
| **Path** | `infrastructure/github/GithubConnector.java` |
| **Base URL config** | `app.connectors.github.api-base-url` → `https://api.github.com` |
| **HTTP Client** | Spring WebClient bean `githubWebClient` (`WebClientConfig.java`) |
| **Auth header** | `Authorization: Bearer ${GITHUB_API_TOKEN}` |
| **API version header** | `X-GitHub-Api-Version: 2022-11-28` |
| **Accept header** | `application/vnd.github+json` |
| **Endpoint** | `GET /repos/{owner}/{repo}/pulls` |
| **Query params** | `state=all`, `per_page=100` |
| **Data sent** | Request headers only; no body |
| **Data received** | JSON array of PR objects: `number`, `state`, `title`, `merged_at`, `user.login`, `base.ref`, `head.ref`, `created_at`, `closed_at`, `html_url`, `additions`, `deletions`, `changed_files` |
| **Retry** | **None** — no retry config found |
| **Timeout** | **None** — WebClient default (no per-request timeout set) |
| **Pagination** | `per_page=100`, **single call only** — pages beyond 100 PRs are silently skipped |
| **Error handling** | Exception caught at connector level; logs WARN; returns `ConnectorResult(0, message)` |
| **When called** | `ConnectorOrchestrator.runOne("github", projectId)` — admin-triggered |
| **TX boundary** | HTTP fetch runs outside `@Transactional`; each PR upsert uses `TransactionTemplate` |

---

### 3.2 Jira Cloud REST API

| Attribute | Detail |
|-----------|--------|
| **Target** | Jira Cloud REST API v3 |
| **Caller** | `JiraConnector.sync()` |
| **Path** | `infrastructure/jira/JiraConnector.java` |
| **Base URL config** | `app.connectors.jira.base-url` → `${JIRA_BASE_URL}` |
| **HTTP Client** | Spring WebClient bean `jiraWebClient` (`WebClientConfig.java`) |
| **Auth header** | `Authorization: Basic <base64(email:apiToken)>` |
| **Accept header** | `application/json` |
| **Endpoint** | `GET /rest/api/3/search` |
| **Query params** | `jql=project = <KEY> ORDER BY updated DESC`, `maxResults=100`, `fields=summary,status,issuetype,priority,created,updated,resolutiondate` |
| **Data sent** | Request headers + query params only; no body |
| **Data received** | `{ "issues": [ { "key", "fields": { "summary", "status.name", "issuetype.name", "priority.name", "created", "updated", "resolutiondate" } } ] }` |
| **Status mapping** | `done\|closed\|resolved` → `DONE`; `in progress\|in review` → `IN_PROGRESS`; else → `OPEN` |
| **Type mapping** | `bug` → `BUG`; `story\|feature\|epic` → `FEATURE`; else → `TASK` |
| **Retry** | **None** |
| **Timeout** | **None** |
| **Pagination** | `maxResults=100`, **single call only** — projects with >100 issues lose remaining data |
| **Error handling** | Exception caught; WARN log; returns `ConnectorResult(0, message)` |
| **When called** | `ConnectorOrchestrator.runOne("jira", projectId)` |
| **TX boundary** | HTTP fetch outside TX; per-issue `TransactionTemplate` for upsert |

---

### 3.3 CircleCI REST API (2 calls per sync, per repo)

| Attribute | Detail |
|-----------|--------|
| **Target** | CircleCI API v2 |
| **Caller** | `CircleCiConnector.syncRepo()` |
| **Path** | `infrastructure/circleci/CircleCiConnector.java` |
| **Base URL config** | `app.connectors.circleci.api-base-url` → `https://circleci.com/api/v2` |
| **HTTP Client** | Spring WebClient bean `circleciWebClient` (`WebClientConfig.java`) |
| **Auth header** | `Circle-Token: ${CIRCLECI_API_TOKEN}` |
| **Accept header** | `application/json` |
| **Call 1** | `GET /project/{slug}/pipeline` where `slug = "gh/" + repo.repoKey` |
| **Call 1 response** | `{ "items": [ { "id": <uuid>, ... } ] }` |
| **Call 2 (per pipeline)** | `GET /pipeline/{id}/workflow` |
| **Call 2 response** | `{ "items": [ { "id", "name", "status", "created_at", "stopped_at" } ] }` |
| **Status mapping** | `success` → `SUCCESS`; `failed\|failing\|error` → `FAILED`; `canceled\|cancelled` → `CANCELLED`; else → `RUNNING` |
| **Duration** | Computed: `stopped_at - created_at` in seconds |
| **Link URL** | Hardcoded pattern: `https://app.circleci.com/pipelines/{workflowId}` |
| **Data sent** | Request headers only |
| **Retry** | **None** |
| **Timeout** | **None** — nested calls (pipeline list → workflow list per pipeline) have no cumulative timeout guard |
| **Pagination** | **None** — no pagination loop; only first page returned by CircleCI |
| **Error handling** | Pipeline fetch error: WARN, returns `ConnectorResult(0)`; workflow fetch error per pipeline: WARN, continues to next pipeline |
| **When called** | `ConnectorOrchestrator.runOne("circleci", projectId)` |
| **TX boundary** | HTTP fetches outside TX; per-workflow `TransactionTemplate` |

---

### 3.4 Google OAuth2 (Auth Provider — outbound via Spring Security)

| Attribute | Detail |
|-----------|--------|
| **Target** | Google OAuth2 / OpenID Connect |
| **Caller** | Spring Security OAuth2 client (not application code) |
| **Path** | `config/SecurityConfig.java` |
| **Scopes** | `openid`, `profile`, `email` |
| **Config** | `spring.security.oauth2.client.registration.google` |
| **Client ID** | `${GOOGLE_CLIENT_ID}` |
| **Flow** | Redirect to consent → auth code → token exchange → `OAuth2User` principal |
| **Data received** | `sub` (providerUid), `email`, `name` (displayName), `picture` (avatarUrl) |
| **Timeout / retry** | Managed by Spring Security; not configurable at application level |
| **Error handling** | Spring Security redirects to `/error` on failure |
| **Note** | GitHub OAuth2 config is present in `application.yml` but commented out (`# github:`) — not active |

---

## 4. Inbound Interfaces

### 4.1 GitHub Webhooks

| Attribute | Detail |
|-----------|--------|
| **Source** | GitHub (webhook delivery from repository settings) |
| **Endpoint** | `POST /api/v1/webhooks/github` |
| **Handler** | `GithubWebhookController.receive()` → `GithubWebhookService.handle()` |
| **Path** | `web/webhook/GithubWebhookController.java` + `application/usecase/ingestion/GithubWebhookService.java` |
| **Security** | `permitAll` in Spring Security; auth gate is HMAC-SHA256 |
| **Auth header** | `X-Hub-Signature-256: sha256=<hex>` |
| **HMAC algorithm** | `HmacSHA256` via `javax.crypto.Mac`; constant-time comparison via `MessageDigest.isEqual` |
| **Secret config** | `app.connectors.github.webhook-secret` → `${GITHUB_WEBHOOK_SECRET}` |
| **Other headers** | `X-GitHub-Event` (event type); `X-GitHub-Delivery` (UUID for logging/idempotency) |
| **Body format** | Raw JSON bytes (used as-is for HMAC; parsed with Jackson after verification) |
| **Supported events** | `ping` (no-op), `pull_request` (upserts PR) |
| **Unsupported events** | Logged and ignored; returns `Result("ignored:<type>", 0)` |
| **Data received** | PR JSON: `pull_request.number`, `state`, `title`, `merged_at`, `user.login`, `base.ref`, `head.ref`, `repository.full_name`, `html_url`, dates |
| **Success response** | `200 { "handled": "<event>", "recordsAffected": <int> }` |
| **HMAC fail response** | `401 { "error": "signature_invalid" }` (not `ErrorResponse` shape — raw Map) |
| **Bad payload response** | `400 { "error": "bad_payload" }` (raw Map) |
| **Idempotency** | DB `UNIQUE(repository_id, external_pr_number)` — duplicate deliveries → upsert |
| **Note** | HMAC must succeed before JSON is parsed; payload body not logged on failure |

---

### 4.2 CircleCI Webhooks

| Attribute | Detail |
|-----------|--------|
| **Source** | CircleCI (webhook delivery from project settings) |
| **Endpoint** | `POST /api/v1/webhooks/circleci` |
| **Handler** | `CircleCiWebhookController.receive()` → `CircleCiWebhookService.handle()` |
| **Path** | `web/webhook/CircleCiWebhookController.java` + `application/usecase/ingestion/CircleCiWebhookService.java` |
| **Security** | `permitAll` in Spring Security; auth gate is HMAC-SHA256 |
| **Auth header** | `Circleci-Signature: v1=<hex>[,v2=<hex>]` (comma-separated versions) |
| **HMAC algorithm** | `HmacSHA256`; parses all `v1=` entries; accepts if any entry matches |
| **Secret config** | `app.connectors.circleci.webhook-secret` → `${CIRCLECI_WEBHOOK_SECRET}` |
| **Event type** | `Circleci-Event-Type` header; fallback to `payload.type` field in body |
| **Body format** | Raw JSON bytes (HMAC verified before parsing) |
| **Supported events** | `ping` (no-op), `workflow-completed` (upserts CI run) |
| **Unsupported events** | Ignored; returns `Result("ignored:<type>", 0)` |
| **Data received** | `workflow.id`, `workflow.name`, `workflow.status`, `workflow.created_at`, `workflow.stopped_at`, `project.slug` (e.g., `gh/owner/repo`) |
| **Repo routing** | Strips `gh/` prefix from slug → `repoKey`; looks up in DB as `GITHUB` host type |
| **Success response** | `200 { "handled": "<event>", "recordsAffected": <int> }` |
| **HMAC fail response** | `401 { "error": "signature_invalid" }` |
| **Bad payload response** | `400 { "error": "bad_payload" }` |
| **Idempotency** | DB `UNIQUE(provider, external_run_id)` — duplicate deliveries → upsert |

---

## 5. File Import / Export

| File Type | Path | Format | Encoding | Note |
|-----------|------|--------|----------|------|
| SDD Markdown artifacts (read) | `<APP_GIT_LOCAL_ROOT>/docs/changes/<TICKET_KEY>/*.md` | CommonMark Markdown with YAML front-matter | UTF-8 (default) | Read by `GitLocalConnector`; parsed by `ArtifactNormalizer` |
| `spec-pack.md` | `<root>/docs/changes/<KEY>/spec-pack.md` | Markdown | UTF-8 | Maps to `Artifact.ArtifactType.SPEC_PACK` |
| `sources.md` | `<root>/docs/changes/<KEY>/sources.md` | Markdown | UTF-8 | `SOURCES` |
| `impl-plan.md` | `<root>/docs/changes/<KEY>/impl-plan.md` | Markdown | UTF-8 | `IMPL_PLAN` |
| `review-checklist.md` | `<root>/docs/changes/<KEY>/review-checklist.md` | Markdown | UTF-8 | `REVIEW_CHECKLIST` |
| `self-review.md` | `<root>/docs/changes/<KEY>/self-review.md` | Markdown | UTF-8 | `SELF_REVIEW` |
| `test-plan.md` | `<root>/docs/changes/<KEY>/test-plan.md` | Markdown | UTF-8 | `TEST_PLAN` |
| `test-results.md` | `<root>/docs/changes/<KEY>/test-results.md` | Markdown | UTF-8 | `TEST_RESULTS` |
| `blackbox-testcases.md` | `<root>/docs/changes/<KEY>/blackbox-testcases.md` | Markdown | UTF-8 | `BLACKBOX_TESTCASES` |
| `test-data.md` | `<root>/docs/changes/<KEY>/test-data.md` | Markdown | UTF-8 | `TEST_DATA` |
| `report.md` | `<root>/docs/changes/<KEY>/report.md` | Markdown | UTF-8 | `REPORT` |
| Demo parse (read, DEV only) | Any `.md` file under CWD | Markdown | UTF-8 | `DemoController.parseFile()` — extension-whitelisted, path-guarded; **must be removed before production** |

**No file export.** EDCAP does not write files to disk (other than Flyway migration execution during startup). All data is persisted in PostgreSQL.

---

## 6. Queue / Event / Message

**No queue, event bus, or message broker is used.**

All flows are synchronous:
- Webhook handler runs inline (no background queue)
- Connector sync runs inline in the HTTP request thread for the admin trigger
- No `@Async`, `@Scheduled`, `ApplicationEventPublisher`, Kafka, RabbitMQ, SQS, or similar infrastructure found

> **Risk:** Heavy webhook payloads or slow connector syncs block the request thread.
> The service layer comments note: *"Heavy work should be enqueued"* — async queue is
> a planned improvement for connector sync and potentially webhook handling.

---

## 7. Error / Retry / Idempotency

| Interface | Error Handling | Retry | Idempotency | Risk |
|-----------|---------------|-------|-------------|------|
| GitHub API (outbound) | Exception caught in `GithubConnector`; WARN log; returns `ConnectorResult(0)` | **None** | Per-item: DB `UNIQUE(repository_id, external_pr_number)` — re-run is safe | No retry means transient GitHub 5xx loses entire sync batch |
| Jira API (outbound) | Exception caught in `JiraConnector`; WARN log; returns `ConnectorResult(0)` | **None** | Per-item: UNIQUE(project_id, ticket_key) — re-run safe | Same risk |
| CircleCI API — pipeline list | Exception caught; WARN; returns 0 | **None** | Per-workflow: `UNIQUE(provider, external_run_id)` | Failure on pipeline list call skips entire repo |
| CircleCI API — workflow list | Exception caught per pipeline; WARN; continues to next pipeline | **None** | Same | One bad pipeline doesn't block others |
| GitHub Webhook (inbound) | Invalid HMAC → 401; bad JSON → 400; unknown repo → 200 with 0 records | None (GitHub retries on 5xx) | DB UNIQUE constraint; upsert pattern | Returning 200 on unknown-repo means GitHub will not retry; event is lost |
| CircleCI Webhook (inbound) | Same pattern as GitHub | None (CircleCI retries on 5xx) | DB UNIQUE constraint | Same lost-event risk on unknown-repo |
| Git Local filesystem | `IOException` per file; continues to next file | **None** | Content hash comparison; same file re-read → same hash → re-upsert is safe | Unreadable files silently skipped |
| Google OAuth2 | Spring Security handles; redirects to `/error` | Spring-managed | Session cookie; re-login generates new session | Token revocation not handled by application |

**Critical gap — no timeout on any outbound WebClient call.** A slow GitHub/Jira/CircleCI
response holds a HikariCP connection for the duration (up to `default-statement-timeout: 30s`
for DB, but WebClient has no connection timeout set).

---

## 8. Security / Privacy Notes

| Interface | Sensitive Data | Security Concern | Mitigation |
|-----------|---------------|------------------|------------|
| GitHub API (outbound) | `GITHUB_API_TOKEN` in `Authorization` header | Leaked if HTTP DEBUG logging is enabled (Spring WebClient logs headers at DEBUG) | Inject via env var; never hardcode; confirm `logging.level.reactor.netty` is not DEBUG in prod |
| Jira API (outbound) | `JIRA_EMAIL` + `JIRA_API_TOKEN` as Basic auth | Same DEBUG log risk; base64 is not encryption | Same mitigation; rotate token if exposed |
| CircleCI API (outbound) | `CIRCLECI_API_TOKEN` in `Circle-Token` header | Same DEBUG log risk | Same mitigation |
| GitHub Webhook (inbound) | `GITHUB_WEBHOOK_SECRET` used for HMAC | Secret used in constant-time compare only; never logged or echoed in responses | `MessageDigest.isEqual` prevents timing attacks; secret from env var |
| CircleCI Webhook (inbound) | `CIRCLECI_WEBHOOK_SECRET` | Same as above | Same mitigation |
| Google OAuth2 | User `email`, `sub`, `name`, `picture` from Google token | Stored in `app_user` table; `email` returned in `UserDto` | No PII encryption at rest; `UserDto.email` visible to authenticated caller; do not log full `UserDto` |
| Git Local filesystem | Markdown file content may include ticket descriptions, code snippets | Files read from a path configured by `APP_GIT_LOCAL_ROOT`; path traversal guarded in `DemoController` only, not in `GitLocalConnector` | `GitLocalConnector` scans `<root>/docs/changes/**` — confirm root path is set to a safe, non-sensitive directory |
| Webhook response bodies | Error messages on HMAC failure | Do not echo exception details | Current impl returns generic `{"error": "signature_invalid"}` — correct |
| `app.jwt.secret` | JWT signing secret configured in `AppProperties` | No JWT-generating code path confirmed active | Rotate key if exposed; confirm whether JWT feature is live or dormant |
| Session cookie | `JSESSIONID` | `HttpOnly; Secure` must be set in production | Dev: `localhost` only; verify Spring Security cookie settings before production deployment |
| CORS | Allowed origins: `localhost:5173`, `localhost:4173` in dev | Dev origins must not reach production | Override `app.cors.allowed-origins` with production domain in prod environment |

---

## 9. Unknown / Need Confirmation

| Item | Reason | Risk | Required Action |
|------|--------|------|-----------------|
| GitHub API pagination | `per_page=100` single call — repos with >100 PRs lose the rest | High | Read `GithubConnector.syncRepo()` for pagination loop; add `Link: next` header traversal if absent |
| Jira API pagination | `maxResults=100` single call — projects with >100 issues lose the rest | High | Same — verify `startAt` loop in `JiraConnector.sync()` |
| CircleCI API pagination | No pagination loop visible for `/project/{slug}/pipeline` | Medium | Verify; CircleCI returns `next_page_token` for pagination |
| WebClient timeout | No `responseTimeout` or `connectTimeout` on any WebClient | High | Add `.responseTimeout(Duration.ofSeconds(10))` to each WebClient in `WebClientConfig`; add connect timeout at the Netty level |
| WebClient retry | No retry or backoff on any outbound call | Medium | Add `.retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))` for transient 5xx |
| `GitLocalConnector` path traversal | `GitLocalConnector` scans `<root>/docs/changes/**`; if `APP_GIT_LOCAL_ROOT` is misconfigured it could scan unintended paths | Medium | Validate resolved path starts within configured root on startup |
| GitHub OAuth2 (commented out) | `github:` client registration is commented in `application.yml` but `GITHUB_API_TOKEN` is configured for outbound calls | Low | Confirm whether GitHub OAuth2 login is planned; remove commented config or document intent |
| JWT active or dormant | `AppProperties.Jwt` configured; no JWT-generating endpoint visible | Medium | Confirm: search for any class using `jwt.secret` or `JwtUtil` |
| Webhook 200 on unknown-repo | Returning 200 for unknown-repo events means GitHub/CircleCI will not retry | Low–Medium | Confirm intended behavior; if event loss is unacceptable, return 404 to trigger retry |
| `DemoController.parseFile` in production | `permitAll`, reads filesystem, returns parsed content | High | Must be `@Profile("dev")` or removed before production deploy |

---

## 10. Source Files Read

| File | Purpose |
|------|---------|
| `EDCAP_BE/infrastructure/github/GithubConnector.java` | GitHub REST API call, PR upsert, error handling, per-item TransactionTemplate |
| `EDCAP_BE/infrastructure/jira/JiraConnector.java` | Jira REST API call, issue upsert, status/type mapping |
| `EDCAP_BE/infrastructure/circleci/CircleCiConnector.java` | CircleCI pipeline + workflow calls, status mapping, link URL pattern |
| `EDCAP_BE/infrastructure/gitlocal/GitLocalConnector.java` | Filesystem scan, filename→ArtifactType mapping, full-TX boundary |
| `EDCAP_BE/config/WebClientConfig.java` | WebClient beans, auth headers, no timeout/retry config |
| `EDCAP_BE/config/SecurityConfig.java` | permitAll for webhooks, OAuth2 Google, CORS config |
| `EDCAP_BE/config/AppProperties.java` | All external config keys (`github.api-base-url`, `jira.base-url`, etc.) |
| `EDCAP_BE/application/usecase/ingestion/GithubWebhookService.java` | HMAC-SHA256 verification, event routing, PR payload mapping |
| `EDCAP_BE/application/usecase/ingestion/CircleCiWebhookService.java` | HMAC-SHA256 verification, `v1=` header parsing, workflow-completed handler |
| `EDCAP_BE/web/webhook/GithubWebhookController.java` | HTTP entry point, raw byte body, header extraction |
| `EDCAP_BE/web/webhook/CircleCiWebhookController.java` | HTTP entry point |
| `EDCAP_BE/src/main/resources/application.yml` | Base URLs, port configs, connector property keys |

Files intentionally NOT read: `.env*`, `application-prod.yml`, secrets files, private keys, production logs.
