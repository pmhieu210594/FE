# 20 — Architecture Rules

## Backend — Hexagonal Layers

- Dependency order: `domain` ← `application` ← `infrastructure` / `web`; never reversed
- `web` must never import from `infrastructure`; call application services only
- Port interfaces belong in `application`; adapter implementations belong in `infrastructure`
- External HTTP calls (GitHub, Jira, CircleCI) run **outside** DB transactions
- Each external upsert uses its own `TransactionTemplate`; never share one transaction across items
- ArchUnit `ArchitectureTest` enforces these rules — keep it green; no new `allowedPackage` exceptions without team review

## Frontend — State and Data

- All async server operations go through **TanStack Query** (`useQuery`, `useMutation`)
- **Redux Toolkit** for global server-synced state (user session, language)
- **Zustand** for ephemeral UI state only (sidebar, modals, scroll position)
- All API calls must go through `lib/api.ts`; never call `fetch` directly elsewhere
- Routing: language segment is always first (`/:lang/...`); use `useLanguage` hook for navigation

→ See [docs/architecture/overview.md](../docs/architecture/overview.md) for layer diagrams and
[docs/standards/coding.md](../docs/standards/coding.md) for concrete examples.
