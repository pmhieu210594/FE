# Black-box Test Cases – Repository CRUD

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: ChatGPT
**Update date**: 2026-06-23

## AC-REPOSITORY-1: List repositories

### TC-01: List returns active repositories only

* Priority: P0
* Precondition:

  * Project P1 has:

    * Repo A (ACTIVE)
    * Repo B (DELETED)
* Input:

  * GET `/api/v1/repositories`
* Expected:

  * Status: 200
  * Response contains Repo A
  * Response does NOT contain Repo B

---

### TC-02: List with no repositories

* Priority: P1
* Precondition:

  * Project P2 has no repositories
* Input:

  * GET `/api/v1/repositories`
* Expected:

  * Status: 200
  * Empty list returned

---

### TC-03: Unauthorized list request

* Priority: P0
* Precondition:

  * User has no permission
* Input:

  * GET `/api/v1/repositories`
* Expected:

  * Status: 403
  * ErrorResponse returned

---

### TC-04: List pagination behavior

* Priority: P1
* Precondition:

  * More repositories than page size
* Input:

  * GET `/api/v1/repositories?page=1`
* Expected:

  * Status: 200
  * Paginated response

---

## AC-REPOSITORY-2: Repository detail

### TC-05: Get detail of active repository

* Priority: P0
* Precondition:

  * Repo A exists (ACTIVE)
* Input:

  * GET `/api/v1/repositories/{id}`
* Expected:

  * Status: 200
  * Correct repository data returned

---

### TC-06: Get detail of deleted repository

* Priority: P0
* Precondition:

  * Repo B exists (DELETED)
* Input:

  * GET `/api/v1/repositories/{id}`
* Expected:

  * Status: 200
  * status = DELETED

---

### TC-07: Get detail with invalid ID

* Priority: P0
* Input:

  * GET `/api/v1/repositories/{invalid_id}`
* Expected:

  * Status: 404

---

### TC-08: Unauthorized detail access

* Priority: P0
* Input:

  * GET `/api/v1/repositories/{id}`
* Expected:

  * Status: 403

---

## AC-REPOSITORY-3: Create repository

### TC-09: Create valid repository

* Priority: P0
* Precondition:

  * Valid project exists
* Input:

  * POST valid payload
* Expected:

  * Status: 201
  * Repository created successfully

---

### TC-10: Create with trimmed name

* Priority: P0
* Input:

  * repo_name_masked = "  repo-A  "
* Expected:

  * Stored as "repo-A"

---

### TC-11: Create with empty name

* Priority: P0
* Input:

  * repo_name_masked = ""
* Expected:

  * Status: 400

---

### TC-12: Create with whitespace name

* Priority: P0
* Input:

  * repo_name_masked = "   "
* Expected:

  * Status: 400

---

### TC-13: Duplicate name in same project

* Priority: P0
* Precondition:

  * Repo A exists in Project P1
* Input:

  * Create repo with same name in P1
* Expected:

  * Status: 409

---

### TC-14: Duplicate name in different project

* Priority: P1
* Precondition:

  * Repo A exists in P1
* Input:

  * Create repo with same name in P2
* Expected:

  * Allowed (Status 201)

---

### TC-15: Missing projectId

* Priority: P0
* Input:

  * projectId = null
* Expected:

  * Status: 400

---

### TC-16: Invalid host_type

* Priority: P1
* Input:

  * host_type = "invalid"
* Expected:

  * Status: 400 or 422

---

### TC-17: Unauthorized create

* Priority: P0
* Input:

  * POST request without permission
* Expected:

  * Status: 403

---

## AC-REPOSITORY-4: Update repository

### TC-18: Update valid repository

* Priority: P0
* Input:

  * PUT valid payload
* Expected:

  * Status: 200
  * Data updated

---

### TC-19: Update with trimmed name

* Priority: P0
* Input:

  * "  repo-A  "
* Expected:

  * Stored as "repo-A"

---

### TC-20: Update deleted repository

* Priority: P0
* Precondition:

  * Repo is DELETED
* Expected:

  * Status: 404

---

### TC-21: Update with duplicate name

* Priority: P0
* Expected:

  * Status: 409

---

### TC-22: Update invalid ID

* Priority: P0
* Expected:

  * Status: 404

---

### TC-23: Unauthorized update

* Priority: P0
* Expected:

  * Status: 403

---

## AC-REPOSITORY-5: Soft delete

### TC-24: Soft delete repository

* Priority: P0
* Input:

  * PUT `/repositories/{id}/delete`
* Expected:

  * Status: 200
  * Repository marked as deleted

---

### TC-25: Deleted repo excluded from list

* Priority: P0
* Expected:

  * Repo not returned in list API

---

### TC-26: Deleted repo accessible in detail

* Priority: P0
* Expected:

  * GET detail returns 200

---

### TC-27: Delete already deleted repo

* Priority: P1
* Expected:

  * Status: 404

---

### TC-28: Unauthorized delete

* Priority: P0
* Expected:

  * Status: 403

---

## AC-REPOSITORY-6: Error handling

### TC-29: Invalid payload format

* Priority: P1
* Expected:

  * Status: 400

---

### TC-30: Error response structure

* Priority: P1
* Expected:

  * Contains errorCode and message

---

## AC-REPOSITORY-7: FE behavior

### TC-31: After create → list refresh

* Priority: P1
* Expected:

  * New repo appears in list

---

### TC-32: After update → UI updated

* Priority: P1
* Expected:

  * Updated values displayed

---

### TC-33: After delete → removed from list

* Priority: P0
* Expected:

  * Repo disappears from list

---

## AC-REPOSITORY-8: Trim logic

### TC-34: Leading/trailing spaces trimmed

* Priority: P0
* Expected:

  * Stored value is trimmed

---

### TC-35: Trim causes duplicate conflict

* Priority: P0
* Expected:

  * Duplicate detected after trim → 409
