# Service Layer Map

## 1. Purpose

Document the application/service/use-case layer: responsibilities of each service, which controllers call them, which repositories and external interfaces they use, transaction boundaries, and where important business rules live. This map helps engineers and reviewers locate logic for features, testing, and impact analysis.

---

## 2. Layering Overview

| layer | path | responsibility | note |
|---|---|---|---|
| **Web / Controllers** | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/`, `.../web/webhook/` | HTTP entrypoints, request/response mapping, lightweight auth checks and argument resolution | Controllers delegate business logic to application use-case services; keep controllers thin |
| **Application / Use Cases (Service Layer)** | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/` | Orchestrate domain logic and ports (persistence or integration). Implement transactional use-cases and coordination between repos/adapters and domain services | Primary service layer per hexagonal architecture; services are `@Service` Spring beans |
| **Domain** | `EDCAP_BE/src/main/java/com/sdd/platform/domain/` | Core entities, pure domain services (no Spring) and domain rules | Domain services are wired into Spring via `config/DomainConfig` when needed (example: `ArtifactNormalizer`) |
| **Infrastructure / Repositories / Adapters** | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/` | Implements output ports (persistence mappers, external API adapters, connectors) | Adapters implement the `application.port.out.*` interfaces and are registered as Spring beans (e.g., `AppUserRepositoryAdapter`) |

---

## 3. Service / Use Case List

| service/use case | path | responsibility | called by | calls |
|---|---|---|---|---|
| `AppUserService` | `application/usecase/governance/AppUserService.java` | Map OAuth2 principal into local `app_user` row; bootstrap first user as ADMIN; update user fields | `MeController.me()` (via controller) | `AppUserRepositoryPort` (persistence) |
| `ConnectorOrchestrator` | `application/usecase/collection/ConnectorOrchestrator.java` | Find named connector adapter and run it while recording `connector_run` rows (start/finish/status/error) | `AdminController.runConnector()` | `EvidenceConnectorPort` (integration connectors), `ConnectorRunRepositoryPort` (persistence) |
| `GithubWebhookService` | `application/usecase/ingestion/GithubWebhookService.java` | Verify HMAC, parse raw webhook payloads, dispatch event handlers (e.g., upsert PR), idempotency relying on DB constraints | `GithubWebhookController.receive()` | `RepositoryRepositoryPort` (find repo by repo_key), `PullRequestIngestionPort` (ingestion port into domain/db) |
| `CircleCiWebhookService` | `application/usecase/ingestion/CircleCiWebhookService.java` | Verify HMAC, parse CircleCI payloads, handle `workflow-completed` events | `CircleCiWebhookController.receive()` | `RepositoryRepositoryPort`, `CiRunIngestionPort` |
| `ArtifactNormalizer` (domain service) | `domain/service/ArtifactNormalizer.java` (bean via `config/DomainConfig`) | Parse Markdown front-matter, extract sections and AC lines, compute content hash — pure domain logic | `DemoController` (via `ArtifactNormalizer.parse()`), potentially other ingestion flows | No external calls; pure function returns `ParsedArtifact` |
| `PmDashboardService` | `application/usecase/pmdashboard/PmDashboardService.java` | PM Dashboard read model: PM role gate, filter normalization, ticket list / detail / summary / insights / CSV export / refresh delegation | `PmDashboardController` | `PmDashboardRepositoryPort` (persistence) |
| `DataOpsDashboardService` | `application/usecase/dataopsdashboard/DataOpsDashboardService.java` | Data Ops Dashboard read model: role gate, filter normalization, KPI aggregation, connector detail lookup | `DataOpsDashboardController` | `DataOpsDashboardRepositoryPort` (read-only V4 aggregation) |
| Ingestion adapters (ports) | `application.port.out.integration.*` (interfaces) | Abstraction points for ingestion into domain DB (pull requests, CI runs) | Called by webhook services, orchestrators | Implemented by infrastructure adapters (e.g., MyBatis mappers + repository adapter or specialized adapters) |

Notes:
- The codebase follows Hexagonal pattern: application/usecase classes orchestrate domain + ports; infrastructure contains adapters that implement output ports.
- Service classes are annotated `@Service` and constructed via DI; domain classes avoid Spring annotations and are wired via `DomainConfig` when needed.

---

## 4. Controller to Service Mapping

| controller/handler | service/use case | purpose |
|---|---|---|
| `MeController.me()` | `AppUserService.upsertFromOAuth()` | Upsert user from OAuth2 principal and return `Dtos.UserDto` |
| `AdminController.connectors()` | `ConnectorOrchestrator.availableConnectors()` | Return list of available connector names |
| `AdminController.runConnector()` | `ConnectorOrchestrator.runOne(name, projectId)` | Trigger single connector run and persist `ConnectorRun` row |
| `AdminController.runHistory()` | `ConnectorRunRepositoryPort.findRecentByConnectorName(...)` (via controller/service) | Fetch connector run history for UI dashboard |
| `DemoController.parseInline()` / `parseFile()` | `ArtifactNormalizer.parse()` | Parse Markdown content or file to structured `ParsedArtifact` |
| `GithubWebhookController.receive()` | `GithubWebhookService.handle()` | Validate HMAC and process GitHub webhook payloads into domain via ingestion port |
| `CircleCiWebhookController.receive()` | `CircleCiWebhookService.handle()` | Validate HMAC and process CircleCI webhook payloads into domain via ingestion port |
| `PmDashboardController.*` (summary, insights, tickets, detail, export, refresh) | `PmDashboardService` | Read-only PM Dashboard endpoints under `/api/v1/pm/dashboard`; PM role required; export and refresh require additional permission |
| `DataOpsDashboardController.*` (summary, connectors, filters, detail) | `DataOpsDashboardService` | Read-only operational dashboard endpoints under `/api/v1/data-ops/dashboard`; data-ops role required; aggregates live V4 metadata |

---

## 5. Service to Repository Mapping

| service / use case | repository / data access (port) | data / table / entity |
|---|---|---|
| `AppUserService` | `AppUserRepositoryPort` → implemented by `infrastructure.persistence.adapter.AppUserRepositoryAdapter` | `app_user` (domain `AppUser`) |
| `ConnectorOrchestrator` | `ConnectorRunRepositoryPort` → `ConnectorRunRepositoryAdapter` | `connector_run` (domain `ConnectorRun`) |
| `GithubWebhookService` | `RepositoryRepositoryPort` → `RepositoryRepositoryAdapter` | `repository` (domain `Repository`); also uses `PullRequestIngestionPort` to upsert PR rows (`pull_request` table via its adapter) |
| `CircleCiWebhookService` | `RepositoryRepositoryPort` and `CiRunIngestionPort` → `CiRunRepositoryAdapter` | `ci_run` (domain `CiRun`) |
| Ingestion ports (`PullRequestIngestionPort`, `CiRunIngestionPort`) | Implemented in `infrastructure` (e.g., `PullRequestRepositoryAdapter`, `CiRunRepositoryAdapter`) | `pull_request`, `ci_run`, related tables |
| `ArtifactNormalizer` | None (pure domain) | Returns `ParsedArtifact` (not persisted directly by normalizer) |
| `PmDashboardService` | `PmDashboardRepositoryPort` → `PmDashboardJdbcAdapter` | `tbl_fact_ticket_dashboard_snapshot` (read-only snapshot queries; table added in V232) |

---

## 6. Service to External Interface Mapping

| service / use case | external API / queue / file | purpose |
|---|---|---|
| `ConnectorOrchestrator` → `EvidenceConnectorPort` implementations | GitHub API, Jira API, CircleCI API, local git | Connector adapters sync evidence from external systems into the platform (called synchronously by orchestrator) |
| `GithubWebhookService` | GitHub webhook payloads (incoming) | Receives events from GitHub; does not call external API during handling except possibly via ingestion adapter later if needed |
| `CircleCiWebhookService` | CircleCI webhook payloads | Receives CI events; ingestion adapter may call internal persistence only |
| `AppUserService` | OAuth2 providers (Google/GitHub) — via Spring Security | AppUserService receives `OAuth2User` principal provided by Spring Security; authentication exchange handled by `SecurityConfig` and Spring OAuth2 client |
| `ArtifactNormalizer` | File content (path) read by `DemoController.parseFile()` | Reads files under backend working directory when invoked (DEV only) |

Notes:
- External outbound calls (to GitHub/Jira/CircleCI) are performed by infrastructure connector adapters implementing `EvidenceConnectorPort` or WebClient beans defined in `WebClientConfig`.
- The application layer uses ports (`application.port.out.integration.*`) to remain agnostic of concrete external APIs.

---

## 7. Transaction Boundary

| service / use case | transaction boundary | note |
|---|---|---|
| `AppUserService.upsertFromOAuth()` | `@Transactional` on method | Explicit transactional boundary; upsert and save executed in a transaction |
| `ConnectorOrchestrator.runOne()` | No `@Transactional` annotation present | Orchestrator saves start row, calls connector (external/integration), then updates run row — not enclosed in a single DB transaction (by design: long-running external calls should not hold DB transaction) |
| `GithubWebhookService.handle()` | No `@Transactional` annotation present | Service verifies HMAC then performs upserts via ingestion port; ingestion adapters may manage transactions at repository level; overall no explicit service-level transaction annotation found |
| `CircleCiWebhookService.handle()` | No explicit `@Transactional` annotation | Same considerations as GitHub service |
| `DataOpsDashboardService` | `@Transactional(readOnly = true)` on read methods | Read-only dashboard aggregation should not hold write intent; aligns with live read model behavior |
| `AdminAuditLogWriter` (ADMIN-AUDIT-LOG 2026-07) | `NESTED` propagation for CRUD audit hooks, `REQUIRES_NEW` for login/logout hooks | Best-effort side-effect write pattern — see below |

Notes:
- Transactional design is conservative: only short, critical DB updates (user upsert) are transactional.
- Long-running external syncs are intentionally not wrapped in a transaction to avoid long DB locks and to allow partial progress and retry handling.

### Best-Effort Audit Write Pattern (Confirmed — ADMIN-AUDIT-LOG 2026-07-10)

When a cross-cutting write (e.g. an audit log entry) must never cause the primary business operation to fail or roll back, give it its own transaction boundary rather than letting it share the caller's:

- **Hook called from inside an existing business `@Transactional` method** (e.g. a CRUD service's `create()`/`update()`/`delete()`): use `Propagation.NESTED` on the audit write. A savepoint isolates the audit insert — if it throws, only the audit insert rolls back, not the caller's business transaction.
- **Hook called from outside any business transaction** (e.g. login/logout, which run before/after the request's own transactional scope): use `Propagation.REQUIRES_NEW` so the audit write gets its own transaction rather than silently running non-transactionally.
- Catch and log (SLF4J) any exception from the audit write inside the writer; never let it propagate to the caller.
- This pattern generalizes to any future cross-cutting write that must be "fire and forget" relative to the primary operation. See `AdminAuditLogWriter.java` and `docs/knowledge/admin-audit-log.md` for the reference implementation.

---

## 8. Important Business Rules Location

| business rule | service/path | note |
|---|---|---|
| First user bootstrap becomes ADMIN | `AppUserService.upsertFromOAuth()` | `repo.count() == 0 ? ADMIN : VIEWER` — recorded in code and must be considered when seeding environments |
| Connector run lifecycle recording | `ConnectorOrchestrator.runOne()` | Creates `ConnectorRun` with `RUNNING` status, updates to `SUCCESS`/`FAILED`, records error messages and finishedAt; important for Data Ops dashboard |
| Webhook idempotency / uniqueness rely on DB constraints | `GithubWebhookService.handle()` + ingestion adapters | Code comments mention UNIQUE constraints on `(repository_id, external_pr_number)` to handle GitHub retries; ingestion should upsert rather than insert duplicates |
| HMAC verification required for webhooks | `GithubWebhookService.verifySignature()` / `CircleCiWebhookService.verifySignature()` | Throws `SecurityException` if missing secret or mismatch; controllers map to 401 response; secrets stored in env-config `application.yml` keys (not read here) |
| Demo file parsing guards | `DemoController.parseFile()` | Extension whitelist and path normalization to prevent reading arbitrary files; still marked DEV-only and should be removed in production |
| Data Ops KPI definitions stay provisional until Product confirms them | `DataOpsDashboardService` / `DataOpsDashboardJdbcAdapter` | Freshness threshold, connector health formula, and broken traceability proxy should remain documented as open issues until confirmed |

---

## 9. Anti-patterns / Risky Areas

| area | risk | evidence |
|---|---|---|
| Synchronous heavy work in webhook controllers | Potential for long execution causing upstream retries or timeouts | `GithubWebhookController` comment: "Heavy work... should be enqueued — current handler is light enough"; measure and consider moving heavy tasks to async queue if needed |
| No global transaction for connector runs | Partial updates possible if connector sync partially fails | `ConnectorOrchestrator.runOne()` intentionally creates run row, calls external connector, updates row; if connector performs multiple DB writes, idempotency and partial failure handling must be considered |
| Demo endpoint reading filesystem | Risk of information disclosure, directory traversal if guards bypassed | `DemoController.parseFile()` has validation and path checks, but marked DEV-only; should be removed before production deployment |
| Missing explicit scheduled/CLI jobs | Operational tasks may be ad-hoc without dedicated jobs | No `@Scheduled`, `CommandLineRunner`, or `ApplicationRunner` beans located; may be intentional but requires operational plan |

---

## 10. Unknown / Need Confirmation

- Are there additional application/usecase services beyond the ones inspected? (Search included main `application/usecase` packages but confirm any other subpackages.)
- Confirm where ingestion ports (`PullRequestIngestionPort`, `CiRunIngestionPort`) are implemented in `infrastructure` (adapters present but mapping to exact DB tables may need verification).
- Confirm production policy for `DemoController` endpoints removal and whether any retention policy exists for parsed artifacts/logs.
- Confirm whether connector adapters implement retries/backoff for outbound API calls (GitHub/Jira/CircleCI) — inspect `infrastructure/github/` adapter implementations.
- Verify if any service-level metrics or APM hooks exist for long-running `ConnectorOrchestrator` runs.

---

## 11. Source Files Read

Files explicitly read to build this map:
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/AppUserService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/collection/ConnectorOrchestrator.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/GithubWebhookService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/CircleCiWebhookService.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/AppUserRepositoryPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/ConnectorRunRepositoryPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/persistence/RepositoryRepositoryPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/PullRequestIngestionPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/CiRunIngestionPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/application/port/out/integration/EvidenceConnectorPort.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/AppUserRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/ConnectorRunRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/RepositoryRepositoryAdapter.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/ArtifactNormalizer.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/config/DomainConfig.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/MeController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/AdminController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/DemoController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/GithubWebhookController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/CircleCiWebhookController.java`
- `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/*` (list of domain entities inspected: `ConnectorRun`, `AppUser`, `Repository`, `PullRequest`, etc.)

Files intentionally NOT read: `.env*`, production secrets, private keys, build artifacts.

---

*End of Service Layer Map*
