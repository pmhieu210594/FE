# Backend Standards (Java / Spring Boot)

> Cross-cutting conventions (path aliases, commit format, etc.) are in [coding.md](coding.md).
> Database details are in [database.md](database.md).
> Logging is in [logging.md](logging.md).
> Error handling is in [error-handling.md](error-handling.md).

---

## Domain Layer (Confirmed)

Domain entities are plain Java objects. **No JPA. No Spring annotations.**

```java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    private Long id;
    private Long projectId;
    private String ticketKey;
    private TicketType ticketType;
    private Status status;

    public enum TicketType { FEATURE, BUG, TASK }
    public enum Status { OPEN, IN_PROGRESS, DONE, CLOSED }
}
```

Use `@Builder` + `@Getter` + `@Setter`. Never `@Data` — it generates mutable `equals`/`hashCode`
based on all fields and causes subtle bugs in collections.

Exception hierarchy — always extend `DomainException`, never `RuntimeException` directly:

```java
public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) { super(message); }
}

public class NotFoundException extends DomainException {
    public NotFoundException(String message) { super(message); }
}
```

---

## Application Layer (Confirmed)

Use cases are `@Service` classes. Constructor injection only (via `@RequiredArgsConstructor`).
All state-mutating methods must be explicitly `@Transactional`.

```java
@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepositoryPort ticketRepo;   // port interface, not adapter
    private final ProjectRepositoryPort projectRepo;

    @Transactional
    public Ticket createTicket(CreateTicketCommand cmd) {
        var project = projectRepo.findById(cmd.projectId())
            .orElseThrow(() -> new NotFoundException("Project not found: " + cmd.projectId()));
        var ticket = Ticket.builder()
            .projectId(project.getId())
            .ticketKey(cmd.ticketKey())
            .ticketType(cmd.ticketType())
            .status(Ticket.Status.OPEN)
            .build();
        return ticketRepo.save(ticket);
    }
}
```

Port interfaces live in `application/port/out/`:

```java
public interface TicketRepositoryPort {
    Optional<Ticket> findById(Long id);
    Ticket save(Ticket ticket);
    List<Ticket> findByProjectId(Long projectId);
}
```

---

## Infrastructure Layer (Confirmed)

Adapters implement application ports. Translate `DataAccessException` to `DomainException`
before it escapes the adapter.

```java
@Repository
@RequiredArgsConstructor
public class TicketRepositoryAdapter implements TicketRepositoryPort {
    private final TicketMapper mapper;

    @Override
    public Optional<Ticket> findById(Long id) {
        return mapper.findById(id);
    }

    @Override
    public Ticket save(Ticket ticket) {
        try {
            if (ticket.getId() == null) {
                mapper.insert(ticket);   // sets ticket.id via useGeneratedKeys
            } else {
                mapper.update(ticket);
            }
            return ticket;
        } catch (DataAccessException e) {
            throw new DomainException("Failed to persist ticket: " + e.getMessage()) {};
        }
    }
}
```

External HTTP calls (GitHub, Jira, CircleCI) must be made **outside** `@Transactional` boundaries
to avoid holding a HikariCP connection during network I/O.

---

## Web Layer (Confirmed)

Controllers are thin: call service → map to DTO → return. No business logic.
No `try/catch` for business exceptions — `GlobalExceptionHandler` handles all.

```java
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping("/{id}")
    public TicketDto getById(@PathVariable Long id) {
        return TicketDto.from(ticketService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDto create(@RequestBody @Valid CreateTicketRequest req,
                            @AuthenticationPrincipal OAuth2User principal) {
        return TicketDto.from(ticketService.createTicket(req.toCommand()));
    }
}
```

---

## MyBatis Mapper Conventions (Confirmed)

```xml
<!-- Reusable column fragment -->
<sql id="columns">
    id, project_id, ticket_key, ticket_type, status, created_at, updated_at
</sql>

<!-- INSERT with generated key -->
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO ticket (project_id, ticket_key, ticket_type, status)
    VALUES (#{projectId}, #{ticketKey}, #{ticketType}, #{status})
</insert>

<!-- Paginated SELECT with whitelisted ORDER BY -->
<select id="findByProjectIdPaged" resultType="Ticket">
    SELECT <include refid="columns"/>
    FROM ticket
    WHERE project_id = #{projectId}
    ORDER BY ${orderBy} ${direction}
    LIMIT #{limit} OFFSET #{offset}
</select>
```

Rules:
- `#{param}` for all values (prepared statement)
- `${param}` **only** for whitelisted identifiers (ORDER BY column, direction) — validate the whitelist in Java before the call
- `<sql id="columns">` fragment for every reusable SELECT column list
- `useGeneratedKeys="true" keyProperty="id"` on every INSERT
- No `<if test>`, `<foreach>` unless query is genuinely dynamic
- No `<resultMap>` with nested associations — rely on `map-underscore-to-camel-case` auto-mapping

---

## Transaction Boundary Rules (Confirmed)

| Operation | Transaction | Why |
|-----------|-------------|-----|
| Domain write (single entity) | `@Transactional` on `@Service` method | Standard unit |
| Multi-item connector sync | `TransactionTemplate` per item | Avoids long-running TX |
| External HTTP call | Outside transaction | Prevents HikariCP hold during I/O |
| Read-only query | `@Transactional(readOnly=true)` (optional) | Allows read replica routing later |

---

## ArchUnit Enforcement (Confirmed)

ArchUnit tests verify the following layer rules on every build:

- `domain` packages have no Spring, no infrastructure dependencies
- `application` packages depend only on `domain`
- `infrastructure` packages implement `application` ports
- `web` packages depend only on `application` and `domain`

If an ArchUnit test fails, the build fails. Do not add `@IgnoreArchitectureRules` to bypass it.

---

## Candidate Rules

- **[Candidate]** `@Transactional(readOnly=true)` on all read-only service methods (enables future read-replica routing)
- **[Candidate]** Checkstyle + PMD enforced in CI (not yet configured)
- **[Candidate]** Request/response DTO validation: `@Valid` on all `@RequestBody` parameters
- **[Candidate]** Use `record` for immutable command objects and DTOs (Java 21+)

→ See [logging.md](logging.md) for logger declaration pattern.
→ See [database.md](database.md) for table naming, ENUM types, HikariCP config.
→ See [error-handling.md](error-handling.md) for exception mapping and ErrorResponse shape.
