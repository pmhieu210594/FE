# Black-box Review Checklist

**Ticket ID**: PROJECT  
**Create date**: 2026-06-17  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Use this checklist to review whether the Project black-box test design is complete, implementation-neutral, and ready for later manual or automated execution planning.

## 2. AC and Coverage Completeness

- [ ] Every AC from `AC-PROJECT-1` through `AC-PROJECT-12` is mapped to at least one black-box case.
- [ ] The AC coverage matrix in `blackbox-testcases.md` shows no remaining gaps.
- [ ] Case priorities `P0/P1/P2` are applied consistently with ticket criticality.
- [ ] Coverage is not narrowed only to currently automated or currently implemented scenarios.

## 3. Required Viewpoints

- [ ] Normal success flow coverage exists for list, detail, create, update, and delete behavior.
- [ ] Error/negative coverage exists for invalid alias, duplicate alias, and unavailable Project ID behavior.
- [ ] Boundary coverage exists for trimming, duplicate scope, deleted-alias reuse, and value-shaping behavior.
- [ ] Permission coverage exists for unauthorized callers across Project actions.
- [ ] Audit/log or error-envelope coverage exists for backend failures with `traceId`.
- [ ] Operation/state-transition coverage exists for post-delete visibility and safe empty-state behavior.

## 4. Black-box Quality

- [ ] Each test case verifies observable behavior only.
- [ ] No case depends on internal class, method, repository, mapper, SQL, or table assertions.
- [ ] No case depends on unstable implementation selectors unless explicitly reframed as externally visible behavior.
- [ ] Expected results are written in business or API-visible terms rather than implementation terms.
- [ ] Preconditions are sufficient for another engineer or tester to prepare the scenario without guessing intent.

## 5. Data and Expected Results

- [ ] Each detailed case references reusable test data from `test-data.md`.
- [ ] Each detailed case includes preconditions, input, steps, and expected result.
- [ ] Expected results are unambiguous about whether data should be created, changed, unchanged, hidden, or rejected.
- [ ] The test-data catalog covers same-customer duplicate, cross-customer reuse, deleted-alias reuse, and blank alias scenarios.
- [ ] The test-data catalog covers `projectType`, `riskLevel`, Team assignment, nonexistent IDs, and authorization fixtures.

## 6. Contract-protection Checks

- [ ] No black-box case introduces a `version` field into Project create or update behavior.
- [ ] Delete behavior is explicitly validated against `PUT /api/v1/projects/{id}/delete`.
- [ ] Team assignment behavior is validated as "final Team set matches the submitted Team set".
- [ ] The suite preserves active-only normal-flow behavior for soft-deleted Projects.
- [ ] Error-envelope coverage expects the standard backend error shape with `traceId`.

## 7. Review Outcome

- [ ] The suite is ready to guide manual testing.
- [ ] The suite is ready to guide API/component/E2E automation design.
- [ ] Any remaining gaps or assumptions are recorded explicitly rather than left implicit.
