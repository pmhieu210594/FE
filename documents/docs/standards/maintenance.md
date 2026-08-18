# Maintenance Standards

---

## Dependency Updates (Confirmed partial — cadence is HD3)

An `update-all` script exists in `EDCAP_FE/package.json`:

```json
"update-all": "ncu -u && npm install"
```

This runs `npm-check-updates` to bump all deps to latest, then reinstalls.

BE (Maven): there is no equivalent script. Manual `mvn versions:display-dependency-updates`.

**Current state:** No automated tooling (Renovate, Dependabot) is configured.

### Running updates

```bash
# FE — bump all deps and reinstall
cd EDCAP_FE && npm run update-all

# BE — check available updates (does not apply them)
cd EDCAP_BE && mvn versions:display-dependency-updates
```

After running updates:
1. Run `mvn verify` (BE) and `npm run build && npm test` (FE)
2. Review breaking-change notes for any major version bumps
3. Create a `chore(deps): update dependencies` commit

---

## Flyway Migration Maintenance (Confirmed)

- Never edit a committed migration file — Flyway checksums will fail
- To correct a mistake: write a new migration (`V{n+1}__fix_<what>.sql`)
- `baseline-on-migrate: true` allows Flyway to recover if the schema table is missing
- Track schema state in `V4__init_schema_v2.sql` as the current baseline

---

## Log File Maintenance (Candidate — pending HD6)

> No `logback-spring.xml` is present — Spring Boot default logging is used (stdout).

- **[Candidate]** Add `logback-spring.xml` with rolling file appender (daily, 7-day retention in dev)
- **[Candidate]** Production: ship logs to centralized store; no local file rotation needed

---

## Ticket Artifact Provenance (Confirmed — ADMIN-AUDIT-LOG 2026-07-10)

Before treating any file under `docs/changes/<TICKET>/` as review or promotion input, check its own `**Ticket ID**` header against the ticket currently being worked on. A ticket folder created from a template or copied from a prior ticket can carry leftover content whose header still names a different ticket — this happened to `promotion-candidates.md` in `ADMIN-AUDIT-LOG` (content for `PARSER-SPEC-PACK` was found in the file). Do not synthesize decisions from an artifact whose header does not match; flag it and ask instead.

---

## Source Availability Review (Confirmed as process)

`docs/maintenance/phase0/source-availability.md` tracks:
- **Solid evidence** — patterns confirmed in source code
- **Missing evidence** — patterns assumed but not verified
- **Open decisions (HD1–HD7)** — human decisions pending

Review this file when starting a new phase or after a significant architecture change.
Update the Resolved Decisions section when HD items are decided.

---

## Candidate Rules (pending HD3)

> **HD3:** What is the dependency update cadence? Who runs it?

- **[Candidate]** Dependency updates: monthly cadence on a scheduled `chore/deps-YYYY-MM` branch
- **[Candidate]** Renovate config (`renovate.json`) for automated PR creation with grouped updates
- **[Candidate]** `dependabot.yml` as lighter alternative (GitHub-native, less config)
- **[Candidate]** Security-only updates (patch-level): apply immediately without waiting for cadence
- **[Candidate]** OWASP `dependency:check` in CI — block on CVSS ≥ 7.0

→ See [database.md](database.md) for Flyway migration file naming rules.
→ See [git-workflow.md](git-workflow.md) for the `chore(deps):` commit convention.
