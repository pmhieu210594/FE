# Source Availability — Template

Use this template when creating a `source-availability.md` for a new repository.
Copy the structure; fill in the evidence from reading the actual source code.

---

## How to Use

1. Run the Explore agent over the new repo: architecture, config, test, tooling
2. For each category below, mark evidence as **Solid**, **Partial**, or **Missing**
3. For any rule you cannot confirm from source, raise it as a **Pending Judgement (PJ)** or **Human Decision (HD)**
4. After the first phase, update the **Resolved Decisions** section

---

## Template

```markdown
# Source Availability — [PROJECT NAME]

*Last updated: YYYY-MM-DD*

## Solid Evidence

Evidence directly observed in source code or configuration files.

| Area | Evidence | Source |
|------|----------|--------|
| Architecture | Hexagonal / layered / monolith | src/ package structure |
| Backend framework | Spring Boot X.Y / Express / Django | build file |
| DB schema | Tables, ENUMs, indexes | migration files |
| Error handling | Exception hierarchy, handler class | source files |
| Logging | Logger type, format pattern, trace ID | config + filter class |
| API shape | URL prefix, pagination style | controller files |
| Auth mechanism | OAuth2 / JWT / session | security config |
| FE framework | React / Vue / Angular + state libs | package.json |
| CI tooling | GitHub Actions / Jenkins | .github/ or Jenkinsfile |
| Test framework | JUnit5+Mockito / Vitest+Playwright | pom.xml / package.json |

## Missing Evidence

Evidence not found in source — reason why.

| Item | Looked in | Why missing |
|------|-----------|-------------|
| Log retention config | logback-spring.xml | File does not exist — using default |
| Coverage thresholds | vitest.config.ts, pom.xml | Not configured |
| PR template | .github/PULL_REQUEST_TEMPLATE.md | File does not exist |
| API versioning policy | Controllers, docs | Only v1 endpoints — no policy |

## Pending Judgements (PJ)

Decisions Claude cannot make from evidence alone. Answered by the team in the
first planning session; once resolved, move to Resolved Decisions.

| ID | Question | Options | Resolved |
|----|----------|---------|---------|
| PJ1 | Table naming convention for new tables | Option A / Option B | ☐ |
| PJ2 | Primary UI component library | Radix / MUI / etc. | ☐ |
| PJ3 | Git workflow | Feature branches + Conventional Commits / other | ☐ |
| PJ4 | Versioning scheme | SemVer / CalVer / date-based | ☐ |
| PJ5 | TypeScript strict settings | Confirm all strict flags in tsconfig | ☐ |

## Human Decisions Required (HD)

Architectural or process decisions that require stakeholder input.
Block related standard rules until resolved.

| ID | Question | Blocks | Status |
|----|----------|--------|--------|
| HD1 | Response envelope shape? | api-contract.md | Open |
| HD2 | Error response consistency | error-handling.md | Open |
| HD3 | Dependency update cadence | maintenance.md | Open |
| HD4 | Test coverage targets | testing.md | Open |
| HD5 | Global error boundary in FE | frontend.md | Open |
| HD6 | Log retention and infra | logging.md | Open |
| HD7 | API versioning strategy | api-contract.md | Open |

## Resolved Decisions

| ID | Decision | Date | Who |
|----|----------|------|-----|
| PJ1 | tbl_ prefix for V5+ tables (new convention) | YYYY-MM-DD | [name] |
```

---

## Notes

- Move items from **Missing Evidence** to **Solid Evidence** as you read more source
- Move items from **Pending Judgements** or **Human Decisions** to **Resolved Decisions** after team confirms
- Do not invent evidence — if you cannot find it, it is missing
