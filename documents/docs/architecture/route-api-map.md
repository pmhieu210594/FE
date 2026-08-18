# Route API Map

## 1. Purpose

Map HTTP routes and API endpoints to their controller/handler, service/use-case, DTOs/schemas, and related middleware. This helps engineers and AI agents quickly locate the code that implements each API surface and understand authentication, validation, and error handling policies.

---

## 2. API Route Summary

| method | route | controller/handler | service | auth required | note |
|---|---|---|---|---|---|
| GET | `/api/v1/health` | `HealthController.health()` | none (direct DTO) | No | Liveness check; returns `Dtos.HealthDto` |
| GET | `/api/v1/me` | `MeController.me()` | `AppUserService.upsertFromOAuth()` | Yes (session cookie via OAuth2) | Returns `Dtos.UserDto` derived from `AppUser` |
| GET | `/api/v1/admin/connectors` | `AdminController.connectors()` | `ConnectorOrchestrator.availableConnectors()` | Yes (ADMIN role) | Returns Map `{ available: string[] }` |
| POST | `/api/v1/admin/connectors/{name}/run` | `AdminController.runConnector()` | `ConnectorOrchestrator.runOne(name, projectId)` | Yes (ADMIN role) | Request: path `{name}`, query `projectId` (Long). Returns `Dtos.ConnectorRunDto` |
| GET | `/api/v1/admin/connectors/{name}/runs` | `AdminController.runHistory()` | `ConnectorRunRepositoryPort.findRecentByConnectorName(...)` | Yes (ADMIN role) | Query param `limit` optional; returns List<`Dtos.ConnectorRunDto`> |
| POST | `/api/v1/demo/parse-markdown` | `DemoController.parseInline(ParseRequest)` | `ArtifactNormalizer.parse(String)` | No (DEV only) | Request DTO: `ParseRequest(content)`; response: parsed artifact map |
| POST | `/api/v1/demo/parse-markdown-file` | `DemoController.parseFile(ParseFileRequest)` | `ArtifactNormalizer.parse(String)` | No (DEV only) | Request DTO: `ParseFileRequest(path)`; server reads file from disk (guards: extension whitelist, path inside CWD) |
| POST | `/api/v1/webhooks/github` | `GithubWebhookController.receive(byte[], signature, event, delivery)` | `GithubWebhookService.handle(rawBody, signature, event, delivery)` | No (HMAC required) | Body received as raw `byte[]` for exact HMAC verification; supports `pull_request` and `workflow_job`; responds with `{ handled, recordsAffected }` |
| POST | `/api/v1/webhooks/circleci` | `CircleCiWebhookController.receive(byte[], signature, event)` | `CircleCiWebhookService.handle(rawBody, signature, event)` | No (HMAC required) | CircleCI signature header `Circleci-Signature`; supports `workflow-completed` event |

---

## 3. Request / Response Mapping

| method | route | request DTO/schema | response DTO/schema | validation |
|---|---|---|---|---|
| GET | `/api/v1/health` | none | `Dtos.HealthDto { status, traceId }` | none |
| GET | `/api/v1/me` | none (authenticated user) | `Dtos.UserDto { id, email, displayName, role, avatarUrl }` | none (auth required) |
| GET | `/api/v1/admin/connectors` | none | `{ available: string[] }` | caller must be ADMIN (checked in controller) |
| POST | `/api/v1/admin/connectors/{name}/run` | path `{name: string}`, query `projectId: Long` | `Dtos.ConnectorRunDto` | `projectId` required; controller checks caller role (ADMIN) and connector existence (orchestrator throws IllegalArgumentException for unknown connector) |
| GET | `/api/v1/admin/connectors/{name}/runs` | path `{name}`, query `limit` (int, default 20) | `List<ConnectorRunDto>` | limit parsed as int; controller delegates to repo with pagination defaults |
| POST | `/api/v1/demo/parse-markdown` | `DemoController.ParseRequest { content: String (NotBlank) }` | Map(body) — parsed front matter, sections, acceptanceCriteria, contentHashSha256 | Bean validation: `@NotBlank` on `content` record field (Jakarta validation used) |
| POST | `/api/v1/demo/parse-markdown-file` | `DemoController.ParseFileRequest { path: String (NotBlank) }` | Map(filePath, result) — includes `filePath` and parsed `result` | Validation: `@NotBlank` for `path`; runtime guards: extension whitelist (.md/.markdown), path must be inside backend CWD; throws IllegalArgumentException if invalid |
| POST | `/api/v1/webhooks/github` | raw `byte[]` body (JSON) | `GithubWebhookService.Result { handled, recordsAffected }` | HMAC verification against `X-Hub-Signature-256` header using `EDCAP_WEBHOOK_SECRET`; handles `pull_request` and `workflow_job`; throws SecurityException -> 401, IllegalArgumentException -> 400 |
| POST | `/api/v1/webhooks/circleci` | raw `byte[]` body (JSON) | `CircleCiWebhookService.Result { handled, recordsAffected }` | HMAC verification using `Circleci-Signature` header and `CIRCLECI_WEBHOOK_SECRET`; accepts `v1=` prefixed signatures; throws SecurityException/IllegalArgumentException accordingly |

Notes:
- Demo endpoints are explicitly marked DEV-only in `DemoController` and are permitted by `SecurityConfig` while intended to be removed in production.
- For webhook HMAC verification the controller reads raw bytes; parsing occurs in service after verification.

---

## 4. Middleware / Guard / Permission

| route/group | middleware/guard | purpose | path |
|---|---|---|---|
| `/api/**` | `TraceIdFilter` (OncePerRequestFilter) | Populate MDC `traceId`, set `X-Trace-Id` response header for correlation | `config/TraceIdFilter.java` (component, highest precedence) |
| `/api/**` | `SecurityFilterChain` (Spring Security) | Enforce auth rules (permit health, openapi, demo, webhooks) and require authentication for other endpoints | `config/SecurityConfig.java` (bean) |
| `@CurrentUser AppUser` | `CurrentAppUserResolver` (HandlerMethodArgumentResolver) | Resolve `AppUser` from OAuth2 principal for controller method params annotated `@CurrentUser` | `web/security/CurrentAppUserResolver.java` |
| Admin endpoints `/api/v1/admin/**` | Controller-level role check (explicit in `runConnector` method) | Additional authorization: Admin-only; controllers check `caller.getRole()` | `web/rest/AdminController.java` |
| Request body validation | Jakarta Bean Validation (e.g., `@NotBlank`) | Validate incoming JSON mapped to record types | DemoController uses `@NotBlank` on record fields; global validation handled via `MethodArgumentNotValidException` |

---

## 5. Error Handling Mapping

| route/group | error type/code | handler | message source |
|---|---|---|---|
| All controllers | `NotFoundException` -> 404 | `GlobalExceptionHandler.handleNotFound()` | ex.getMessage() |
| All controllers | `DomainException` -> 400 | `GlobalExceptionHandler.handleDomain()` | ex.getMessage() |
| All controllers | `ApplicationException` -> 409 | `GlobalExceptionHandler.handleApplication()` | ex.getMessage() |
| Bean validation errors | `MethodArgumentNotValidException` -> 400 | `GlobalExceptionHandler.handleValidation()` | first field error message |
| Illegal args | `IllegalArgumentException` -> 400 | `GlobalExceptionHandler.handleIllegalArg()` | ex.getMessage() |
| Any other exception | 500 | `GlobalExceptionHandler.handleUnknown()` | generic "An unexpected error occurred"; stack trace logged server-side with traceId |
| Webhooks | `SecurityException` (HMAC mismatch / secret missing) -> 401 | controller catches or service throws -> controller returns 401 with `signature_invalid` | message is not echoed to avoid leak; controller returns fixed error code/value |

---

## 6. External API Routes

| method | route | external consumer/provider | note |
|---|---|---|---|
| POST | `/api/v1/webhooks/github` | GitHub webhooks (repo-level/webhook config) | Header: `X-Hub-Signature-256`, `X-GitHub-Event`, `X-GitHub-Delivery`; expects quick 2xx response; handles `ping`, `pull_request`, `workflow_job`, others ignored by default |
| POST | `/api/v1/webhooks/circleci` | CircleCI webhooks | Header: `Circleci-Signature`, `Circleci-Event-Type`; supports `workflow-completed` |

---

## 7. Deprecated / Legacy Routes

| method | route | reason/status | note |
|---|---|---|---|
| (none identified) | N/A | N/A | No explicit `@Deprecated` controllers or legacy route comments found; demo endpoints are explicitly DEV-only and should be removed before production.

---

## 8. Unknown / Dynamic Routes

| route/pattern | reason unclear | required confirmation |
|---|---|---|
| Dynamic API generation via `routerLinks` / frontend helper | `EDCAP_FE/src/lib/router-links.ts` contains empty placeholder for generating links/APIs dynamically — actual mapping not present in source | Confirm how frontend constructs any additional API paths at runtime (none found) |
| Potential Jira webhook route | No `JiraWebhookController.java` found in `web/webhook/` though `infrastructure/jira/` adapter exists | Confirm whether Jira webhook receiver is planned/implemented elsewhere |
| Any controller registered via runtime/reflection | Spring component scanning could pick up controllers in other packages | Confirm no other controllers outside `web/rest` and `web/webhook` directories |

---

## 9. Source Files Read

Files inspected to build this map (not exhaustive of repo):
- `EDCAP_BE/src/main/java/com/sdd/platform/SddPlatformApplication.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/config/TraceIdFilter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/HealthController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/DemoController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/CircleCiWebhookController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/Dtos.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/ConnectorOrchestrator.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/CircleCiWebhookService.java`
- `EDCAP_BE/src/main/resources/application.yml` (for config keys referenced)
- `EDCAP_FE/src/lib/api.ts` (frontend endpoint helpers)
- `EDCAP_FE/src/pages/LoginPage.tsx`, `EDCAP_FE/src/pages/AdminPage.tsx`, `EDCAP_FE/src/main.tsx`, `EDCAP_FE/src/App.tsx` (routing) 

Files intentionally NOT read:
- `.env*`, secrets, keys (per safety rules)
- Build artifacts (`target/`, `node_modules/`)

---

## 10. Maintenance Notes

- Update this file when new controllers, DTOs, or middleware are added.
- When adding a new API: document method, route, controller, service, request/response DTOs, validation rules, and auth requirements.
- For webhook changes: record exact header names used for HMAC and any idempotency keys.

---

## 11. Organization Management Snapshot

The Organization feature is now implemented in the current workspace. This snapshot records the live route/API mapping so future work does not rely on the older planning-only notes above.

| method | route | controller/handler | service | auth required | note |
|---|---|---|---|---|---|
| GET | `/api/v1/organizations` | `OrganizationController.list()` | `OrganizationService.search()` | Yes (caller must be ADMIN) | Query params: `keyword`, `status`, `page`, `size`; default status is `ACTIVE` |
| GET | `/api/v1/organizations/{id}` | `OrganizationController.get()` | `OrganizationService.get()` | Yes (caller must be ADMIN) | Returns a single organization by UUID |
| POST | `/api/v1/organizations` | `OrganizationController.create()` | `OrganizationService.create()` | Yes (caller must be ADMIN) | Creates a new ACTIVE organization and returns 201 |
| PUT | `/api/v1/organizations/{id}` | `OrganizationController.update()` | `OrganizationService.update()` | Yes (caller must be ADMIN) | Request includes `version` for optimistic locking |
| PATCH | `/api/v1/organizations/{id}/delete` | `OrganizationController.softDelete()` | `OrganizationService.softDelete()` | Yes (caller must be ADMIN) | Soft delete only; request includes `version` |

| route/group | middleware/guard | purpose | path |
|---|---|---|---|
| `/api/v1/organizations/**` | `@CurrentUser AppUser` + service-level ADMIN check | Enforce role-based access and return forbidden for non-admin callers | `web/rest/OrganizationController.java` + `OrganizationService.requireAdmin()` |

| route/group | error type/code | handler | message source |
|---|---|---|---|
| Organization APIs | `NotFoundException`, `BusinessRuleException`, `ForbiddenException`, `OptimisticLockingException` | `GlobalExceptionHandler` | Message keys such as `Pages.Organization.*` and `Component.Permission.Denied` |

---

## 12. Team Management Snapshot

The Team feature is now implemented in the current workspace. This snapshot records the live route/API mapping so future work does not rely on the older planning-only notes above.

| method | route | controller/handler | service | auth required | note |
|---|---|---|---|---|---|
| GET | `/api/v1/teams` | `TeamController.list()` | `TeamService.search()` | Yes (caller must be ADMIN) | Query params: `keyword`, `status`, `page`, `size`; keyword searches code/name |
| GET | `/api/v1/teams/{teamId}` | `TeamController.get()` | `TeamService.get()` | Yes (caller must be ADMIN) | Returns Team detail with active members and lookup options |
| POST | `/api/v1/teams` | `TeamController.create()` | `TeamService.create()` | Yes (caller must be ADMIN) | Creates a new Team and returns 201 |
| PUT | `/api/v1/teams/{teamId}` | `TeamController.update()` | `TeamService.update()` | Yes (caller must be ADMIN) | Request includes editable `teamCode` and `version` for optimistic locking |
| PATCH | `/api/v1/teams/{teamId}/delete` | `TeamController.softDelete()` | `TeamService.softDelete()` | Yes (caller must be ADMIN) | Soft delete only; deactivates active memberships in the same transaction |
| GET | `/api/v1/teams/{teamId}/members` | `TeamController.listMembers()` | `TeamService.listMembers()` | Yes (caller must be ADMIN) | Returns active Team members |
| POST | `/api/v1/teams/{teamId}/members` | `TeamController.addMember()` | `TeamService.addMember()` | Yes (caller must be ADMIN) | Adds existing member with required role |
| PUT | `/api/v1/teams/{teamId}/members/{teamMemberId}` | `TeamController.updateMemberRole()` | `TeamService.updateMemberRole()` | Yes (caller must be ADMIN) | Updates existing membership role only |
| PATCH | `/api/v1/teams/{teamId}/members/{teamMemberId}/delete` | `TeamController.removeMember()` | `TeamService.removeMember()` | Yes (caller must be ADMIN) | Inactivates membership only |

| route/group | middleware/guard | purpose | path |
|---|---|---|---|
| `/api/v1/teams/**` | `@CurrentUser AppUser` + service-level ADMIN check | Enforce role-based access and return forbidden for non-admin callers | `web/rest/TeamController.java` + `TeamService.requireAdmin()` |

| route/group | error type/code | handler | message source |
|---|---|---|---|
| Team APIs | `NotFoundException`, `BusinessRuleException`, `ForbiddenException`, `OptimisticLockingException` | `GlobalExceptionHandler` | Message keys such as `Pages.Team.*` and `Component.Permission.Denied` |

---

*End of Route API Map*
