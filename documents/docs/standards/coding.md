# Coding Standards — Index

This file covers **cross-cutting** conventions that apply to both backend and frontend.
For language-specific detail, see the dedicated files.

| Area | File |
|------|------|
| Java / Spring Boot | [backend.md](backend.md) |
| TypeScript / React | [frontend.md](frontend.md) |
| Database / MyBatis / Flyway | [database.md](database.md) |
| Logging | [logging.md](logging.md) |
| Error handling | [error-handling.md](error-handling.md) |
| API endpoints and contracts | [api-contract.md](api-contract.md) |

---

## Cross-Cutting Principles

**Naming**
- Names describe what something **is** or **does** — not its type or implementation detail
- `findByProjectId` not `getProjectIdItems`; `TicketRepositoryPort` not `ITicketRepository`
- Avoid abbreviations unless the abbreviation is the canonical name (e.g., `Id`, `Dto`, `UI`)

**No dead code**
- Remove unused imports, variables, methods, and files
- Commented-out code must not be committed — use git history to recover it

**No magic numbers or strings**
- Named constants or enums for all domain values
- `Ticket.Status.OPEN` not `"OPEN"` in comparisons

**Small units**
- Functions and methods do one thing
- If a method needs a comment to explain what each section does, split it

**No silent failures**
- Every error must be either handled (recovery path) or propagated (caller decides)
- Do not catch exceptions and return null or an empty collection as a substitute for a real response

---

## File Organization

```
EDCAP_BE/src/main/java/com/sdd/platform/
  domain/          entity classes, domain exceptions
  application/     use case @Service classes, port interfaces
  infrastructure/  adapters, mappers, config
  web/             @RestController classes, DTOs, request/response records

EDCAP_FE/src/
  components/      reusable UI components (forwardRef + CVA)
  hooks/           custom React hooks
  pages/           page-level components
  store/           Redux slices + Zustand stores
  lib/             api.ts, utils.ts, other shared utilities
  interfaces/      TypeScript interface definitions
  enums.ts         shared enums
```
