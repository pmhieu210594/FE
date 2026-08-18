# Phase 0-A Plan (Approved)

> This plan was approved on 2026-06-08.
> Source: `C:\Users\nk_trung.BRYCENVN\.claude\plans\phase-0-a-safety-gate-mutable-lovelace.md`

## Context

EDCAP_FULL is a mono-repo workspace consisting of EDCAP_BE (Spring Boot / Java 21) and EDCAP_FE (React 18 / TypeScript / Vite). At the start of Phase 0-A:
- There was no `.claude/` directory anywhere
- `docs/` existed but was empty
- There was no CI/CD
- An actual `.env` file existed in EDCAP_BE

**Scope**: only create/update configuration and documentation files — do not touch application source code.

## Artifacts Created

```
D:\EDCAP_FULL\
├── .claude\
│   ├── CLAUDE.md
│   ├── settings.json
│   └── rules\
│       └── 00-safety.md
└── docs\
    ├── architecture\README.md
    ├── standards\README.md
    ├── changes\README.md
    └── maintenance\
        └── phase0\
            ├── README.md
            ├── phase0-plan.md         (this file)
            ├── phase0-execution-log.md
            ├── phase0-decisions.md
            ├── phase0-risk-register.md
            └── phase0-review.md
```

## Deny / Ask / Allow Policy

### DENY
- Read: `.env`, `*.pem`, `*.key`, `*.p12`, `*.jks`, `*.keystore`, `*id_rsa*`, `*id_ed25519*`, `*credential*`, `*secret*`
- Bash: `rm -rf`, `DROP TABLE`, `DROP DATABASE`, `TRUNCATE TABLE`, `git push --force`, `git push -f`, `git reset --hard origin/*`, `git clean -f`

### ASK (confirm first)
- `git push`, `git commit`, DB migration, `docker rm/rmi`, `npm publish`, `mvn deploy`, `kubectl apply/delete`

### ALLOW
- Read BE/FE source code, docs, `.claude` config
- Build/test: `mvn clean/test/compile/verify`, `npm run build/test/lint`
- File discovery: `Glob(*)`

## Execution Order

1. `.claude/settings.json` — activate the safety gate first
2. `.claude/rules/00-safety.md`
3. `.claude/CLAUDE.md`
4. `docs/` skeleton
5. `docs/maintenance/phase0/` 6 files
6. `phase0-execution-log.md`
7. `phase0-review.md`
