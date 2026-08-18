# Code Review Standards

---

## PR Checklist (Confirmed base — expanded by HD3)

Before requesting review, the author confirms:

### Correctness
- [ ] All changed code paths have tests (unit or integration)
- [ ] ArchUnit tests pass (`mvn verify` green)
- [ ] `npm run lint` passes; `npx tsc --noEmit` clean
- [ ] No new `any` types without `// eslint-disable-next-line` comment + reason

### Security
- [ ] No secrets, tokens, or credentials in code or comments
- [ ] New endpoints have auth check (not `permitAll` unless explicitly required)
- [ ] New webhook handlers validate HMAC before business logic
- [ ] SQL uses `#{param}` (not `${param}`) for value bindings

### Database
- [ ] New tables follow `tbl_dim_*` / `tbl_fact_*` / `tbl_auth_*` naming (V5+)
- [ ] Migration is additive only — no editing of committed `.sql` files
- [ ] `TIMESTAMPTZ` columns have `DEFAULT NOW()`; `updated_at` trigger attached

### Architecture
- [ ] Domain layer has no Spring/infrastructure imports
- [ ] Controllers contain no business logic; exceptions flow to `GlobalExceptionHandler`
- [ ] External HTTP calls are outside `@Transactional` boundaries

### Frontend
- [ ] All user-visible strings use `t("Pages.Feature.Key")` (no hardcoded English)
- [ ] Data-loading components handle loading, empty, and error states
- [ ] All API calls go through `lib/api.ts` (`fetch` not called directly)

---

## Review Focus Areas (Confirmed)

Reviewers focus comments on these areas in priority order:

1. **Correctness** — logic errors, missing edge cases, incorrect error handling
2. **Security** — auth bypass, secret leakage, injection risks, signature validation order
3. **Architecture** — layer violations, missing port abstraction, direct infra in web layer
4. **Standards compliance** — naming, `ErrorResponse` shape, transaction boundaries
5. **Test quality** — mock boundaries (ports not domain), `@WebMvcTest` slice correctness

Style comments are low priority — ESLint/Prettier handle them automatically.

---

## Merge Requirements (Confirmed — from git-workflow.md)

- At least 1 approving review
- All CI checks pass (build, test, lint)
- No unresolved review comments
- Merge via **Squash and merge** (keeps main history linear)

> For large refactors, Merge commit is acceptable — discuss in PR description.

---

## Review SLA (Candidate — pending HD3)

> **HD3:** What is the expected review turnaround time? What is the escalation path?

- **[Candidate]** First review within 1 business day of PR creation
- **[Candidate]** Author addresses comments within 1 business day of review
- **[Candidate]** Stale PRs (no activity for 5 business days) are auto-labelled `stale`

---

## Candidate Rules (pending PR template)

> No `.github/PULL_REQUEST_TEMPLATE.md` exists yet — this checklist is not enforced by GitHub.

- **[Candidate]** `.github/PULL_REQUEST_TEMPLATE.md` links to this checklist
- **[Candidate]** Required labels: `feat`, `fix`, `chore`, `docs`, `breaking` applied before merge

→ See [git-workflow.md](git-workflow.md) for branch naming and commit format.
→ See [security.md](security.md) for secret and HMAC validation rules.
