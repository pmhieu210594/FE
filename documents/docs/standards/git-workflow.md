# Git Workflow

**Resolved:** 2026-06-08 (PJ3)

---

## Branch Naming

```
feat/<ticket-key>-<short-desc>      New feature
fix/<ticket-key>-<short-desc>       Bug fix
chore/<short-desc>                  Tooling, config, dependencies
docs/<short-desc>                   Documentation only
refactor/<short-desc>               Refactoring without behavior change
test/<short-desc>                   Tests only
hotfix/<short-desc>                 Urgent production fix off main
```

Examples:
```
feat/EDCAP-42-ticket-detail-page
fix/EDCAP-57-missing-traceId-in-error
chore/upgrade-spring-boot-3-4-2
docs/add-architecture-overview
```

Rules:
- Branch off `main` (or `develop` if introduced later)
- One ticket = one branch; squash multiple commits if needed before merge
- Delete branch after merge

---

## Commit Messages — Conventional Commits

Format: `<type>(<scope>): <subject>`

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behavior |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `chore` | Build scripts, dependencies, tooling |
| `test` | Adding or updating tests |
| `refactor` | Code restructuring with no behavior change |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

Examples:
```
feat(ticket): add ticket detail page with status badge
fix(webhook): reject HMAC mismatch before payload parsing
chore(deps): upgrade Spring Boot to 3.4.2
test(auth): add unit tests for AppUserService.upsertFromOAuth
docs(architecture): add hexagonal layer diagram
```

Rules:
- Subject: imperative mood, no period at end, max 72 characters
- Body (optional): explain *why*, not *what*
- Breaking change: add `BREAKING CHANGE:` footer or `!` after type (`feat!:`)

---

## Pull Request Process

### Before opening a PR

- [ ] All new code has at least one test
- [ ] `mvn clean verify` passes locally (BE)
- [ ] `npm run lint && npm run typecheck && npm run build` passes locally (FE)
- [ ] Branch is rebased on latest `main`

### PR description template

```markdown
## Summary
<!-- What does this PR do? Why? -->

## Changes
- 
- 

## Test plan
- [ ] Unit tests added/updated
- [ ] Manual smoke test: <describe steps>

## Notes
<!-- Breaking changes, migration steps, rollback notes -->
```

### Review requirements

- 1 reviewer approval required before merge
- CI must be green (build + lint + tests) — once CI is established
- No self-merge on `main`

---

## Branch Protection (to configure on GitHub)

Once CI/CD is established, apply these rules to `main`:

| Rule | Value |
|------|-------|
| Require PR before merging | ✅ |
| Required approvals | 1 |
| Require status checks to pass | build, lint, test |
| Require branches to be up to date | ✅ |
| Restrict force pushes | ✅ |
| Restrict deletions | ✅ |

---

## Versioning — Semantic Versioning 2.0

Format: `MAJOR.MINOR.PATCH`

| Part | When to increment |
|------|------------------|
| `MAJOR` | Breaking API or schema change |
| `MINOR` | New feature, backwards-compatible |
| `PATCH` | Bug fix, backwards-compatible |

Current: pre-release phase (`0.x.x`).
First stable release = `1.0.0` when API and schema are production-stable.

Release steps:
1. Update `docs/changes/CHANGELOG.md`
2. Create git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
3. Push tag: `git push origin vX.Y.Z` → triggers release CI action (Phase 1+)
