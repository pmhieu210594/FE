# Repository Intake Checklist

Run this checklist before Claude Code begins substantive work on a new repository.
Purpose: confirm safety constraints, establish context, avoid operating blind.

---

## 1. Safety Gate

- [ ] `.claude/settings.json` exists with `deny` list covering secrets files and destructive commands
- [ ] `.gitignore` includes `.env`, `*.key`, `*.pem`, `*.p12`, `*.jks`, `*secret*`, `*credential*`
- [ ] No secrets files are currently tracked in git (`git ls-files | grep -E '\.env|\.key|\.pem'` returns empty)
- [ ] `detect-secrets` or equivalent is configured in pre-commit hook, OR note the absence

If `.claude/settings.json` is missing: create it with the deny/allow pattern from Phase 0-A before any other work.

---

## 2. Context Files

- [ ] `.claude/CLAUDE.md` exists and is current (architecture, current phase, tech stack)
- [ ] `.claude/rules/` has at minimum `00-safety.md`; ideally rules 10–40
- [ ] `docs/maintenance/phase0/source-availability.md` exists or is scheduled for creation

If `CLAUDE.md` is missing: create it using the EDCAP template before writing any code.

---

## 3. Architecture Survey

Run a quick Explore sweep to confirm:

- [ ] Language and framework versions (Java version, Spring Boot version, Node/React version)
- [ ] Build tool (Maven/Gradle, npm/pnpm/yarn)
- [ ] DB migration tool (Flyway, Liquibase, none)
- [ ] Test framework (JUnit5, Vitest, Jest, Playwright)
- [ ] CI config (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`)

Record findings in `source-availability.md`.

---

## 4. Dependency and Secrets Scan

- [ ] Run `npm audit` (FE) — note any critical vulnerabilities before starting work
- [ ] Run `mvn dependency:check` if OWASP plugin is configured (BE)
- [ ] Scan for accidental secret commits: `git log --all --oneline -- '*.env'` or `detect-secrets scan`

---

## 5. Pre-Existing State

- [ ] Check current branch — confirm you are not on a release branch or hotfix in progress
- [ ] Review open PRs for conflicts with planned work
- [ ] Check `source-availability.md` for open HD items that may affect the current task

---

## 6. Tooling Smoke Test

Run these to confirm the environment is healthy before writing code:

```bash
# Backend
mvn compile        # no compilation errors

# Frontend
npm install        # no peer dependency errors
npx tsc --noEmit   # no type errors
npm run lint       # no lint errors
```

If any of these fail, diagnose and fix before proceeding.

---

## Post-Checklist

Once all items above are confirmed:
- Create or update `source-availability.md` with initial evidence
- Raise any open Pending Judgements to the user before writing code that depends on them
- Begin the planned work
