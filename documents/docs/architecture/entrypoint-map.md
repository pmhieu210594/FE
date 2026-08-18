# Entrypoint Map

## 1. Purpose

This document maps all execution entry points of the EDCAP system — the places where user interactions, external events, or runtime triggers initiate control flow. Understanding entry points is essential for:

- **Onboarding:** New developers learn where to instrument code for features
- **Debugging:** Identify the control flow origin for a given feature or bug
- **Testing:** Decide where to mock, stub, or patch dependencies
- **Impact Analysis:** Understand which endpoints are affected by a change
- **Documentation:** Know where to add tracing, logging, or telemetry

Entry points are grouped by type:
1. **Application Bootstraps** — JVM/browser startup
2. **UI Entry Points** — User navigates to a route or screen
3. **API Entry Points** — HTTP requests to backend controllers
4. **CLI / Command Entry Points** — Command-line invocations (if any)
5. **Batch / Scheduled Job Entry Points** — Time-triggered or manual batch runs
6. **Event / Message Entry Points** — Async queue/topic consumers (if any)
7. **External Callback / Webhook Entry Points** — Inbound webhooks from GitHub, Jira, CircleCI, etc.

---

## 2. Application Bootstraps

### Backend Bootstrap

| Entrypoint | Path | Runtime/Framework | Responsibility | Execution Context |
|---|---|---|---|---|
| **Spring Boot Main** | `EDCAP_BE/src/main/java/com/sdd/platform/SddPlatformApplication.java` | Java 21 + Spring Boot 3.4.1 | Entry point for JVM process; initializes Spring context, datasource, security, Flyway migrations | `java -jar platform-0.1.0-SNAPSHOT.jar` or `mvn spring-boot:run` |

**Bootstrap flow:**
1. `SddPlatformApplication.main(String[] args)` called by JVM
2. `SpringApplication.run(SddPlatformApplication.class, args)` starts Spring context
3. Annotations processed:
   - `@SpringBootApplication` — enables component scanning, auto-configuration
   - `@ConfigurationPropertiesScan("com.sdd.platform.config")` — loads `AppProperties` from `application.yml`
   - `@MapperScan("com.sdd.platform.infrastructure.persistence")` — registers MyBatis mappers
4. Spring initializes beans: `SecurityConfig`, `WebMvcConfig`, `WebClientConfig`, `DomainConfig`, `TraceIdFilter`
5. Flyway runs schema migrations from `EDCAP_BE/src/main/resources/db/migration/`
6. Server listens on port 8080 (configurable via `SERVER_PORT` env var)

**Key Beans Registered:**
- `SecurityFilterChain` (OAuth2, CORS, session management)
- `CorsConfigurationSource` (frontend origins whitelist)
- `WebClient` instances (GitHub, Jira, CircleCI adapters)
- `AppUserRepositoryPort` + MyBatis repository adapters
- `CurrentAppUserResolver` (OAuth2 principal → domain AppUser mapper)
- `TraceIdFilter` (request tracing via MDC)

### Frontend Bootstrap

| Entrypoint | Path | Runtime/Framework | Responsibility | Execution Context |
|---|---|---|---|---|
| **React SPA Initialization** | `EDCAP_FE/src/main.tsx` | TypeScript 5.7 + React 18 + Vite 6 | Entry point for browser SPA; mounts React DOM, sets up providers (TanStack Query, Router, store, i18n) | Browser opens `http://localhost:5173` (dev) or `http://app.host` (prod) |

**Bootstrap flow:**
1. Vite dev server or production server serves `index.html`
2. `<script type="module" src="/src/main.tsx"></script>` triggers browser to load `main.tsx`
3. Main.tsx execution:
   - Imports React, ReactDOM, TanStack Query, React Router, i18n config, CSS
   - `ReactDOM.createRoot(document.getElementById("root")!).render(...)` mounts React tree into `#root` div
4. Providers initialized (order matters):
   - `React.StrictMode` — enables additional checks in dev
   - `QueryClientProvider` — TanStack Query with cache strategy
   - `HashRouter` — React Router with hash-based URLs (enables bookmarking + refresh)
   - `App` component (root of React tree)
5. `App.tsx` renders:
   - `Routes` definition (login, admin pages, redirects)
   - `RequireAuth` guard (checks `useAuth()` hook)
6. Initial route is determined by URL or redirected to default language

**Key Providers Setup:**
- `queryClient` from `lib/queryClient.ts` — TanStack Query config (refetch on window focus, retry strategy)
- `i18n` from `src/i18n.ts` — react-i18next initialization with language detection
- Router from `App.tsx` — React Router v6 with language-first URL scheme

---

## 3. UI Entry Points

### Frontend Routes

All UI entry points are prefixed with language segment: `/:lang/...` where `lang ∈ {en, ja, vi}`.

| Route/Screen | Path (Component) | Component/Page | Note | Auth Required? |
|---|---|---|---|---|
| **Default Redirect** | `/` | `App.tsx` → `DefaultLanguageRedirect` | Redirects to `/:lang/` using stored i18n language (default: en) | ❌ No |
| **Login Page** | `/:lang/login` | `src/pages/LoginPage.tsx` | OAuth2 login form; Google OAuth2 button; displays login error if OAuth2 flow failed | ❌ No (public) |
| **Home Redirect** | `/:lang/` (index) | `App.tsx` → `HomeRedirect` | Redirects to `/:lang/admin` if authenticated, else `/:lang/login` | ⚠️ Conditional |
| **Admin Dashboard** | `/:lang/admin` | `src/pages/AdminPage.tsx` | Protected page; displays connector list, run history, trigger connector sync buttons | ✅ Yes (ADMIN role required) |
| **Layout Wrapper** | `/:lang` | `src/components/Layout.tsx` | Top-level layout with header, sidebar, language toggle; all authenticated pages are children of this route | ✅ Yes |
| **Root Layout** | `(hash router root)` | `index.html` | Static HTML; mounts React app in `<div id="root"></div>` | N/A |

### Route Transitions

**OAuth2 Login Flow:**
1. User navigates to `/:lang/login` or is redirected (not authenticated)
2. LoginPage displays: language-first URL in navbar, Google login button
3. User clicks "Login with Google" → `loginWithGoogle()` (from `hooks/useAuth.ts`)
4. Browser redirects to `/oauth2/authorization/google` (Spring Security endpoint)
5. Google OAuth2 server: user authenticates, authorizes scope (openid, profile, email)
6. Google redirects back to backend: `/login/oauth2/code/google?code=...&state=...`
7. Spring Security backend:
   - Exchanges authorization code for access token with Google API
   - Calls `CurrentAppUserResolver` to upsert `AppUser` in DB
   - Issues session cookie (JSESSIONID)
   - Redirects frontend to `http://localhost:5173` (or production frontend URL)
8. Frontend now sees authenticated session → router redirects to `/:lang/admin`

**Logout Flow:**
1. User clicks logout button (from Layout component, not shown in current code but implied)
2. Frontend navigates to backend `/logout` endpoint
3. Spring Security:
   - Invalidates session cookie (JSESSIONID)
   - Clears Google OAuth2 token
   - Redirects to frontend base URL
4. Frontend navigates back to `/:lang/login` (unauthenticated)

---

## 4. API Entry Points

### REST Controllers

| Method | Route | Controller/Handler | Path | Responsibility | Auth Required? |
|---|---|---|---|---|---|
| **GET** | `/api/v1/health` | `HealthController.health()` | `web/rest/HealthController.java` | Liveness probe; returns `{"status": "UP", "traceId": "..."}` | ❌ No (public) |
| **GET** | `/api/v1/me` | `MeController.me()` | `web/rest/MeController.java` | Fetch current authenticated user info; returns `UserDto` (name, email, role) | ✅ Yes (session cookie) |
| **GET** | `/api/v1/admin/connectors` | `AdminController.connectors()` | `web/rest/AdminController.java` | List available connector types (github, jira, circleci, git-local) | ✅ Yes (ADMIN role) |
| **POST** | `/api/v1/admin/connectors/{name}/run` | `AdminController.runConnector()` | `web/rest/AdminController.java` | Trigger a connector sync (e.g., fetch GitHub PRs for a project) | ✅ Yes (ADMIN role) |
| **GET** | `/api/v1/admin/connectors/{name}/runs` | `AdminController.runHistory()` | `web/rest/AdminController.java` | Fetch recent connector run records (with status, timestamp, records affected) | ✅ Yes (ADMIN role) |
| **POST** | `/api/v1/demo/parse-markdown` | `DemoController.parseInline()` | `web/rest/DemoController.java` | Dev-only: parse Markdown with front matter; request body: `{"content": "..."}` | ❌ No (dev only) |
| **POST** | `/api/v1/demo/parse-markdown-file` | `DemoController.parseFile()` | `web/rest/DemoController.java` | Dev-only: parse Markdown file from disk; request body: `{"path": "sample-repo/docs/..."}` | ❌ No (dev only) |

### Request / Response Format

**Authentication:**
- Session-based: frontend sends `credentials: "include"` (cookie JSESSIONID)
- OAuth2 principal is resolved via `CurrentAppUserResolver` → `AppUser` domain model
- Non-authenticated endpoints (health, demo, webhooks) do not require session

**Authorization:**
- `@CurrentUser AppUser caller` resolver in controllers
- Admin endpoints check `caller.getRole() == AppUser.Role.ADMIN`; return 403 if not

**Error Responses:**
- Centralized via `GlobalExceptionHandler` (maps exceptions to HTTP status codes)
- Format: `ErrorResponse(timestamp, status, errorCode, message, traceId)`
- Stack traces never sent to client; logged server-side with traceId for correlation

**CORS:**
- Allowed origins from `AppProperties.cors().allowedOrigins()`:
  - Dev: `http://localhost:5173`, `http://localhost:4173`
  - Production: whitelist configured via env vars
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Max age: 3600 seconds

---

## 5. CLI / Command Entry Points

| Command | Path | Handler | Note | Execution Context |
|---|---|---|---|---|
| (None currently) | N/A | N/A | No Spring Boot `CommandLineRunner` or `ApplicationRunner` beans found | N/A |

**Future consideration:** If batch jobs or administrative tasks are needed, implement via:
- Spring Boot `@Bean ApplicationRunner` (runs once at startup, with access to Spring context)
- Separate CLI tool (using Spring Boot embedded server or standalone CLI library)
- External job scheduler (cron job, Kubernetes CronJob, etc.)

---

## 6. Batch / Scheduled Job Entry Points

| Job | Trigger/Schedule | Path | Responsibility | Note |
|---|---|---|---|---|
| (None currently) | N/A | N/A | No `@Scheduled` annotations or batch job definitions found | Future: Scheduled metric refreshes, cleanup tasks, etc. |

**Future consideration:** Implement scheduled jobs via:
- Spring Boot `@Scheduled` method on a `@Service` or `@Component`
- Quartz Scheduler (if distributed job coordination needed)
- External job scheduler (Jenkins, Airflow, GitHub Actions, etc.)

**Example (not implemented):**
```java
@Component
public class MetricRefreshJob {
  @Scheduled(cron = "0 0 * * * *")  // Every hour
  public void refreshMetrics() {
    // Trigger connector sync for all projects
  }
}
```

---

## 7. Event / Message Entry Points

| Event/Topic/Queue | Consumer | Path | Responsibility | Note |
|---|---|---|---|---|
| (None currently) | N/A | N/A | No Kafka listeners, RabbitMQ listeners, or JMS listeners found | Webhooks are synchronous, not async queues |

**Current Architecture:**
- Webhooks are handled **synchronously** in controller (fast return to caller)
- No async message broker (Kafka, RabbitMQ, AWS SQS) is configured
- Rationale: MVP simplicity; webhook handlers are intentionally kept light to return 2xx within 10 seconds (GitHub timeout)

**Future consideration:** If async processing is needed:
- Implement Spring `@KafkaListener` with Kafka topics
- Or use Amazon SQS / Google Cloud Pub/Sub via Spring Cloud
- Heavy lifting (e.g., cloning large repos) can be enqueued instead of blocking webhook handler

---

## 8. External Callback / Webhook Entry Points

### Inbound Webhooks

| External Source | Endpoint/Handler | Path | Responsibility | Trigger |
|---|---|---|---|---|
| **GitHub** | `POST /api/v1/webhooks/github` | `web/webhook/GithubWebhookController.java` | Receive GitHub webhook events (`pull_request`, `workflow_job`, etc.); validate HMAC signature; store PR and CI job data | GitHub repository webhook configuration: `https://app.host/api/v1/webhooks/github` |
| **CircleCI** | `POST /api/v1/webhooks/circleci` | `web/webhook/CircleCiWebhookController.java` | Receive CircleCI workflow completion events; validate signature; store CI run status | CircleCI project webhook configuration: `https://app.host/api/v1/webhooks/circleci` |
| **Jira** | (Not yet implemented) | N/A | Candidate: Receive Jira ticket creation/update events | Jira webhook would be configured: `https://app.host/api/v1/webhooks/jira` |

### Webhook Handler Details

**GitHub Webhook Handler:**

| Aspect | Detail |
|---|---|
| **Path** | `POST /api/v1/webhooks/github` |
| **Handler** | `GithubWebhookController.receive(byte[] body, String signature, String event, String delivery)` |
| **Validation** | HMAC-SHA256 signature verification (see `docs/standards/security.md`) |
| **Request Headers** | `X-Hub-Signature-256`, `X-GitHub-Event`, `X-GitHub-Delivery` |
| **Response Time** | Returns 2xx within ~1 second (GitHub timeout: 10 seconds, considers > 10s a failure and retries) |
| **Service Layer** | `GithubWebhookService.handle(byte[] body, String signature, String event, String delivery)` → upserts PRs; `GithubWorkflowJobWebhookService.handle(...)` → upserts CI job metadata |
| **Error Handling** | SecurityException (invalid signature) → 401; IllegalArgumentException (bad payload) → 400 |
| **Transaction** | Outside DB transaction (HMAC validation happens first; if valid, data upsert begins) |

**CircleCI Webhook Handler:**

| Aspect | Detail |
|---|---|
| **Path** | `POST /api/v1/webhooks/circleci` |
| **Handler** | `CircleCiWebhookController.receive(byte[] body, String signature, String event)` |
| **Validation** | HMAC-SHA256 signature verification |
| **Request Headers** | `Circleci-Signature`, `Circleci-Event-Type` |
| **Response Time** | Returns 2xx within ~1 second |
| **Service Layer** | `CircleCiWebhookService.handle(byte[] body, String signature, String event)` → upserts CI run data |
| **Error Handling** | SecurityException (invalid signature) → 401; IllegalArgumentException (bad payload) → 400 |

**Why byte[] for body?**
- HMAC is computed on the **exact bytes** GitHub/CircleCI signed
- If Spring parses to JsonNode → re-serialization changes whitespace/key-order → signature mismatch
- Solution: receive raw `byte[]`, compute HMAC, then parse JSON for business logic

### Webhook Security

- All webhook endpoints are `permitAll()` in Spring Security (no session cookie required)
- **HMAC-SHA256 signature is the only authentication gate**
- Signature secrets configured via environment variables (not committed):
  - `EDCAP_WEBHOOK_SECRET` → GitHub → Backend communication
  - `CIRCLECI_WEBHOOK_SECRET` → CircleCI → Backend communication
- Reject with 401 if signature is missing or invalid; log at WARN level

---

## 9. Candidate Entry Points

| Candidate | Path | Reason | Confirmation Needed |
|---|---|---|---|
| **Jira Webhook** | (No controller found) | `infrastructure/jira/` adapter exists; webhook receiver may be planned but not yet implemented | Read `JiraWebhookService` if exists; check if `JiraWebhookController.java` is in progress |
| **OAuth2 Logout Endpoint** | `/logout` | Spring Security handles logout; not explicitly shown in controller | Confirm logout flow; check if custom logout handler is registered |
| **Application Event Listener** | N/A | Spring `ApplicationEvent` listeners could be used for async tasks; none found in current code | Search for `@EventListener` or `ApplicationListener` implementations |
| **Servlet Filter Entry Point** | `TraceIdFilter` | Custom filter for request tracing (MDC population); may be an entry point for request lifecycle | Review `web/config/TraceIdFilter.java` to confirm it's invoked for all requests |

---

## 10. Reading Order for Ticket Analysis

When analyzing a feature request or bug ticket, read entry points in this order:

### For API Tickets (Backend)
1. **Identify HTTP route** → Find in §4 API Entry Points table
2. **Open controller** → `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/*.java`
3. **Trace service call** → `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/`
4. **Understand domain logic** → `EDCAP_BE/src/main/java/com/sdd/platform/domain/`
5. **Check adapter** → `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/`
6. **Review tests** → `EDCAP_BE/src/test/java/` (if tests exist for this feature)

### For UI Tickets (Frontend)
1. **Identify route** → Find in §3 UI Entry Points table
2. **Open page component** → `EDCAP_FE/src/pages/*.tsx`
3. **Trace hook usage** → `EDCAP_FE/src/hooks/*.ts` (e.g., `useAuth`, `useQuery`)
4. **Check API layer** → `EDCAP_FE/src/lib/api.ts`
5. **Review component structure** → `EDCAP_FE/src/components/`
6. **Check tests** → `EDCAP_FE/src/__tests__/` or `e2e_tests/tests/` (if tests exist)

### For Webhook Tickets
1. **Identify external source** → Find in §8 External Callback / Webhook Entry Points table
2. **Open webhook controller** → `EDCAP_BE/src/main/java/com/sdd/platform/web/webhook/*WebhookController.java`
3. **Review service layer** → `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/ingestion/*WebhookService.java`
4. **Check security** → Verify HMAC validation in handler
5. **Review tests** → Webhook integration tests (if present)

### For Authentication Tickets
1. **Start at** → `EDCAP_BE/src/main/java/com/sdd/platform/config/SecurityConfig.java`
2. **OAuth2 flow** → `docs/architecture/key-flows.md` § OAuth2 Login Flow
3. **Principal resolver** → `EDCAP_BE/src/main/java/com/sdd/platform/web/security/CurrentAppUserResolver.java`
4. **Frontend hook** → `EDCAP_FE/src/hooks/useAuth.ts`

---

## 11. Unknown / Need Confirmation

| Item | Reason | Required Action |
|---|---|---|
| **Jira Webhook Implementation Status** | `JiraWebhookService` may exist in `application/usecase/ingestion/` but no controller found | Confirm: Is Jira webhook receiver planned? Is `JiraWebhookController.java` in progress? |
| **Logout Endpoint Behavior** | Spring Security provides default `/logout` but custom behavior unclear | Confirm: Does `/logout` delete cookies? Redirect to login or frontend? Is there a custom LogoutSuccessHandler? |
| **Request Tracing Scope** | `TraceIdFilter` populates MDC, but scope (all requests? API only? webhooks?) not documented | Review `TraceIdFilter` implementation; confirm it wraps all servlet requests |
| **Error Response Interceptor** | `GlobalExceptionHandler` maps exceptions to HTTP responses; scope not fully documented | Audit: Which exception types are caught? Are all domain/app exceptions mapped? Any blind spots? |
| **Frontend Service Worker** | `public/firebase-messaging-sw.js` suggests Firebase Cloud Messaging; integration unclear | Confirm: Is push notification setup complete? Is FCM enabled in frontend? What triggers notifications? |
| **OAuth2 Refresh Token Handling** | Session cookie may expire; Google token refresh flow unclear | Confirm: How are expired tokens handled? Is there a token refresh mechanism? Manual re-login required? |
| **API Rate Limiting** | No Spring Cloud `@RateLimiter` or Bucket4j configuration found | Confirm: Is rate limiting needed? Should be added to prevent abuse of admin/webhook endpoints? |
| **Webhook Retry Logic** | GitHub/CircleCI retry behavior on 5xx is known; our side handling unclear | Confirm: Does backend persist received webhooks? Can webhooks be replayed? Is idempotency key used? |

---

## 12. Maintenance Notes

### Last Updated
- **Date:** 2026-06-08
- **Phase:** 0-B completion (Common Base / Source Intelligence)
- **Maintainer:** Tech Lead / Architecture Team

### How to Maintain This Document

**When adding a new endpoint:**
1. Add row to §4 API Entry Points (REST controller methods) OR §8 External Callback / Webhook Entry Points (webhooks)
2. Include: HTTP method, route, controller class, responsibility, auth requirement
3. Update reading order if needed (§10)

**When adding a new route:**
1. Add row to §3 UI Entry Points
2. Include: route pattern, component path, auth requirement, note
3. Test route in hash-based router (`localhost:5173/#/:lang/newroute`)

**When adding scheduled jobs:**
1. Add row to §6 Batch / Scheduled Job Entry Points
2. Include: job name, trigger (cron, manual, event-driven), path, responsibility

**When adding message queue:**
1. Add row to §7 Event / Message Entry Points
2. Include: topic/queue name, consumer class, responsibility, trigger

**When adding external integration:**
1. Add row to §8 External Callback / Webhook Entry Points
2. Include: external source, endpoint, handler path, security model

### Known Gaps (Phase 1+ Action Items)

- [ ] Jira webhook receiver not implemented; confirm if planned
- [ ] No application event listeners currently; may be needed for async tasks
- [ ] No batch jobs (scheduled or CLI); Phase 1 may add metric refresh, cleanup jobs
- [ ] No rate limiting on admin/webhook endpoints; consider adding
- [ ] No webhook idempotency tracking (could receive duplicates from GitHub/CircleCI retries)
- [ ] Firebase Cloud Messaging integration unclear (`.js` file present but not documented)
- [ ] OAuth2 token refresh logic not documented

---

## Quick Reference — Finding Entry Points

| Question | Look in Section | Specific File/Path |
|---|---|---|
| **Where does the app start?** | §2 Application Bootstraps | `SddPlatformApplication.java` (BE), `main.tsx` (FE) |
| **Which API endpoint handles /api/v1/me?** | §4 API Entry Points | `MeController.java` |
| **How does the admin run a connector?** | §4 API Entry Points + §3 UI Entry Points | `AdminController.runConnector()` + `AdminPage.tsx` |
| **What happens when GitHub pushes a commit?** | §8 External Callback / Webhook Entry Points | `GithubWebhookController.receive()` → `GithubWebhookService.handle()` |
| **How does a user log in?** | §3 UI Entry Points + §2 Application Bootstraps | `LoginPage.tsx` + `SecurityConfig.securityFilterChain()` |
| **Where is HMAC signature validated?** | §8 External Callback / Webhook Entry Points | `GithubWebhookController.receive()` → `GithubWebhookService.handle()` |
| **What are the available routes?** | §3 UI Entry Points | `App.tsx` (React Router configuration) |
| **Is there a batch job for metric refresh?** | §6 Batch / Scheduled Job Entry Points | (None currently implemented) |
| **Which controller handles demo Markdown parsing?** | §4 API Entry Points | `DemoController.java` (/api/v1/demo/*) |
| **How to find where a feature is implemented?** | §10 Reading Order for Ticket Analysis | Trace from entry point through layers |

