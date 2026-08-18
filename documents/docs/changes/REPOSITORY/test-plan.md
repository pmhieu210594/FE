# Test Plan – Repository Feature

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: ChatGPT
**Update date**: 2026-06-23

## 1. Scope

This document defines the testing strategy for the Repository feature based on:

* `spec-pack.md`
* `impact-analysis.md`
* Existing test coverage
* Testing standards (`.claude/rules/40-testing.md`)

---

## 2. Acceptance Criteria Coverage

### AC ↔ Test Type Matrix

| AC ID      | Description                                   | Unit | Integration | E2E | Existing Coverage | Plan   |
| ---------- | --------------------------------------------- | ---- | ----------- | --- | ----------------- | ------ |
| AC-REPO-01 | List returns only active repositories         | ❌    | ✅           | ✅   | None              | Add    |
| AC-REPO-02 | Detail returns repository (including deleted) | ❌    | ✅           | ❌   | None              | Add    |
| AC-REPO-03 | Create repository                             | ✅    | ✅           | ✅   | Partial           | Extend |
| AC-REPO-04 | Update repository                             | ❌    | ✅           | ✅   | None              | Add    |
| AC-REPO-05 | Soft delete repository                        | ❌    | ✅           | ✅   | None              | Add    |
| AC-REPO-06 | Standard error handling                       | ✅    | ✅           | ❌   | Partial           | Extend |
| AC-REPO-07 | FE refresh & validation behavior              | ❌    | ❌           | ✅   | None              | Add    |
| AC-REPO-08 | Trim repository name input                    | ✅    | ✅           | ❌   | None              | Add    |

---

## 3. Existing Test Coverage

### 3.1 Covered

* Generic API test patterns (CRUD baseline)
* Standard error response format
* Pagination handling

### 3.2 Not Covered

* Repository-specific business rules
* Soft delete behavior
* Unique constraint within project
* AES-256-GCM encoding for `repo_url`
* FE end-to-end flows

---

## 4. Test Strategy

### 4.1 Unit Tests

Focus:

* Input validation
* Data transformation
* Business rules (pure logic)

Targets:

* Trim name
* Validate empty input
* Hash repo URL (AES-256-GCM)
* Duplicate detection (same project)

---

### 4.2 Integration Tests

Focus:

* API behavior
* DB interaction
* Business rules enforcement

Endpoints:

#### GET /repositories

* Return only active records
* Pagination works

#### GET /repositories/{id}

* Return active → 200
* Return deleted → 200
* Not found → 404

#### POST /repositories

* Valid → 201
* Invalid input → 400
* Duplicate name (same project) → 409

#### PUT /repositories/{id}

* Success update
* Deleted repo → 404
* Duplicate → 409

#### PUT /repositories/{id}/delete

* Set delete_flag
* Not physically removed
* Excluded from list API

---

### 4.3 E2E Tests

Focus:

* Critical user flows

Flows:

#### Create Flow

* User submits form
* Repository appears in list

#### Update Flow

* User edits repository
* Data persists after reload

#### Delete Flow

* Repository removed from list
* Still accessible via detail

#### Validation Flow

* Invalid input → error shown
* Correct input → success

---

## 5. Test Data Policy

### 5.1 Principles

* Deterministic
* Isolated
* Reproducible

### 5.2 Strategy

* Each test creates its own project
* No shared mutable state
* Use factory/helper for test data

### 5.3 Data Rules

* Duplicate test must use same `project_id`
* Soft delete test must verify both:

  * List exclusion
  * Detail inclusion

### 5.4 Encoding Rule

* Input: raw `repo_url`
* Stored: AES-256-GCM hash
* Response: raw value (if applicable)

---

## 6. Tests to be Added

### Unit Tests

* Validator (trim, required fields)
* Service logic (hashing, duplicate check)

### Integration Tests

* Full API coverage for all endpoints
* Error scenarios (400, 404, 409)

### E2E Tests

* Create / Update / Delete flows
* Validation behavior

---

## 7. Tests Intentionally Skipped

| Scope                         | Reason                |
| ----------------------------- | --------------------- |
| UI styling / pixel validation | Not business critical |
| Performance / load testing    | Out of current scope  |
| External integrations         | Mocked / trusted      |
| Restore deleted repository    | Not in spec           |

---

## 8. Test Environment

| Component         | Setup            |
| ----------------- | ---------------- |
| Database          | Isolated test DB |
| API               | Local / CI       |
| External services | Mocked           |
| E2E               | Playwright       |

---

## 9. Test Execution

### Commands

```
npm run test
npm run test:api
npm run test:e2e
```

---

## 10. Output

Test results will be recorded in:

```
docs/changes/REPOSITORY/test-results.md
```

---

## 11. Definition of Done

* All AC mapped to test types
* All critical flows covered by E2E
* API fully covered by integration tests
* No failing tests
* Test results documented

---

## 12. Risk & Mitigation

| Risk               | Mitigation                     |
| ------------------ | ------------------------------ |
| Missing edge cases | Add negative tests             |
| Flaky tests        | Proper async handling, mocking |
| Slow test suite    | Separate unit vs e2e           |

---

## 13. Key Risk Areas (from spec)

* Soft delete logic (list vs detail inconsistency)
* Unique constraint per project
* repo_url hashing (input vs storage mismatch)
