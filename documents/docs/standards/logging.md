# Logging Standards

## Framework

SLF4J + Logback (Spring Boot default). No `Log4j`. No `System.out.println`.

---

## Logger Declaration (Confirmed)

One logger per class, `private static final`:

```java
private static final Logger log = LoggerFactory.getLogger(ClassName.class);
```

---

## Log Format (Confirmed)

Pattern configured in `application.yml`:

```
%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-}] %logger{36} - %msg%n
```

Fields in order: `timestamp · thread · level · traceId (MDC) · logger class (max 36) · message`

---

## Trace ID (Confirmed)

`TraceIdFilter` (`OncePerRequestFilter`, highest precedence) injects a `traceId` into MDC on every
request and cleans it up in the `finally` block.

- Format: `"trc_"` + first 12 hex chars of a random UUID (no hyphens)
- MDC key: `"traceId"`
- Response header: `X-Trace-Id` (visible to frontend for log correlation)

**Never generate a traceId manually.** Read from MDC when you need to store it:

```java
// Storing traceId on a run entity
entity.setTraceId(MDC.get("traceId"));
```

---

## Parameterized Logging (Confirmed)

Always use SLF4J `{}` placeholders — never string concatenation or `String.format`:

```java
// Good — argument evaluation is deferred; no allocation when level is disabled
log.info("Connector {} completed for project {} in {}ms", connectorName, projectId, elapsedMs);
log.error("Webhook signature invalid for delivery {}", deliveryId, ex);

// Bad
log.info("Connector " + connectorName + " completed for project " + projectId);
```

When logging an exception, pass it as the **last** argument (SLF4J prints the stack trace):

```java
log.error("Failed to sync repository {}", repoId, exception);
```

---

## Log Levels (Confirmed)

| Level | When to use |
|-------|-------------|
| `ERROR` | Unhandled exception; external call failure; data integrity violation |
| `WARN` | Recoverable problem; unexpected input from external system; deprecated path hit |
| `INFO` | Significant lifecycle events (app startup, connector sync start/end, auth event) |
| `DEBUG` | Detailed flow; SQL parameters; internal state — **dev/staging only** |
| `TRACE` | Not used |

**Level config** (`application.yml`):

```yaml
logging:
  level:
    root: INFO
    com.sdd.platform: DEBUG    # change to INFO in production
    org.springframework.security: INFO
```

---

## Sensitive Data — Never Log (Confirmed)

- OAuth tokens, API keys, webhook secrets
- Full request/response bodies that may contain PII (names, emails, addresses)
- Database credentials or connection strings
- Webhook payload body beyond event type and IDs

---

## Candidate Rules

> The following rules require **HD6** (log infrastructure decision) before they become confirmed standards.

- **[Candidate]** Production logging: structured JSON via Logstash encoder (not plain text)
- **[Candidate]** Log retention: minimum 30 days in centralized log store
- **[Candidate]** Alert on `ERROR` rate exceeding threshold (oncall integration)
- **[Candidate]** Log aggregation target: CloudWatch / ELK / Loki (not yet decided)

→ See [security.md](security.md) for the `traceId` correlation pattern in error responses.
