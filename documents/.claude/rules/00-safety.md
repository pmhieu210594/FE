# 00 — Safety Rules (read every conversation turn)

These rules **always apply** regardless of phase or task.

---

## 1. Secrets — never read

Never read, print, or extract content from the following files:

- `.env` in any directory
- `*.pem`, `*.key`, `*.p12`, `*.jks`, `*.keystore`
- `*id_rsa*`, `*id_ed25519*`, any SSH private key
- Any file whose name contains `credential`, `secret`, or `token` (excluding normal source code)

If configuration values are needed, read template files like `.env.example` or `application.yml` (not `application-prod.yml`).

---

## 2. Destructive commands — do not run

Never run the following commands autonomously. If they appear necessary, explain why and **wait for user confirmation**:

| Command | Risk |
|---------|------|
| `rm -rf` | Recursive delete, unrecoverable |
| `DROP TABLE`, `DROP DATABASE`, `TRUNCATE TABLE` | Destroys schema / data |
| `git push --force`, `git push -f` | Overwrites remote history |
| `git reset --hard origin/*` | Discards local commits |
| `git clean -f`, `git clean -fd` | Deletes untracked files |
| `kubectl delete` | Removes k8s resources |

---

## 3. Actions requiring explicit confirmation

Stop and **ask the user** before executing:

- `git push` (any form)
- `git commit` (any form)
- DB migration: `mvn flyway:migrate`, `flyway migrate`
- `npm publish`, `mvn deploy`
- `docker rm`, `docker rmi`
- `kubectl apply`

---

## 4. Phase 0 — restricted scope

During Phase 0, **only** create or update:
- `.claude/` (CLAUDE.md, settings.json, rules/)
- `docs/` (documentation, not application source code)

**Do not** modify any files under `EDCAP_BE/src/` or `EDCAP_FE/src/`.

---

## 5. General principles

- When unsure about the impact of an action → **stop and ask the user**
- Prefer read-only operations
- Log all changes to `docs/maintenance/phase0/phase0-execution-log.md`
- Do not make assumptions about the production environment
