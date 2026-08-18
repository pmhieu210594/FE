# Claude Context Loading Policy

Defines what Claude Code loads, in what order, and when.

---

## Always-On (Every Conversation)

These files are loaded automatically by Claude Code at conversation start:

| File | Content | Why always-on |
|------|---------|---------------|
| `.claude/CLAUDE.md` | Project overview, architecture, current phase | Entry point — orients Claude to the repo |
| `.claude/rules/00-safety.md` | Secrets and destructive-command rules | Safety gate must be active from the first turn |
| `.claude/rules/10-style.md` | BE and FE style rules | Applied to every code write |
| `.claude/rules/20-architecture.md` | Layer rules for hexagonal arch | Applied to every code write |
| `.claude/rules/30-security.md` | Security rules | Applied to every code write |
| `.claude/rules/40-testing.md` | Testing rules | Applied to every code write |

---

## On-Demand (Load When Task Requires)

Claude loads these files when the task is related to their domain:

| File | Load when |
|------|-----------|
| `docs/standards/backend.md` | Writing or reviewing Java/Spring code |
| `docs/standards/frontend.md` | Writing or reviewing TypeScript/React code |
| `docs/standards/database.md` | Writing Flyway migrations, MyBatis mappers |
| `docs/standards/logging.md` | Adding log statements; reviewing log output |
| `docs/standards/error-handling.md` | Adding exception handling; reviewing error responses |
| `docs/standards/api-contract.md` | Adding or reviewing API endpoints |
| `docs/standards/security.md` | Adding auth, webhook, or secrets handling |
| `docs/standards/testing.md` | Writing or reviewing tests |
| `docs/standards/git-workflow.md` | Preparing commits, branches, or PRs |
| `docs/standards/review.md` | Reviewing a PR |
| `docs/standards/coding.md` | Cross-cutting conventions reference |
| `docs/architecture/overview.md` | Structural questions, new module placement |
| `docs/architecture/key-flows.md` | Tracing request flows end-to-end |
| `docs/maintenance/phase0/source-availability.md` | Checking open decisions (HD1–HD7) |

---

## Load Order

When multiple files are relevant, load in this order:

1. Safety (`00-safety.md`) — already active
2. Architecture context (`overview.md`, `key-flows.md`) if needed
3. Standards file(s) for the specific task
4. Templates from `docs/standards/templates/` if writing new code

---

## Missing Context Handling

If a file listed above does not exist:
- Do not guess its content
- State that the file is missing and ask the user before proceeding
- Suggest creating it if the task would benefit from it

If `source-availability.md` lists an open HD item relevant to the task:
- Surface the open decision to the user before writing code that depends on it
- Write the code for the most defensible interpretation and mark it with a comment

---

## Files NOT Loaded by Default

These are always excluded:
- `.env` and any secrets files (blocked by `settings.json` deny rules)
- Build artifacts: `target/`, `dist/`, `node_modules/`
- Generated files: anything in `generated/`

---

## Updating This Policy

This file should be updated when:
- New `docs/standards/` files are added
- New `.claude/rules/` files are added
- A new phase of work changes what context is relevant by default
