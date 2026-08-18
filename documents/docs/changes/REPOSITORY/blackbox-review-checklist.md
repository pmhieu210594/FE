# Black-box Review Checklist – Repository CRUD

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-23
**Author**: ChatGPT
**Update date**: 2026-06-23

## 1. Acceptance Criteria Coverage

* [ ] All AC (AC-1 → AC-8) are covered
* [ ] Each AC has at least one test case
* [ ] No AC is missing or partially covered
* [ ] All test cases are mapped to an AC

---

## 2. Test Case Classification

For each AC:

* [ ] Normal (happy path) cases exist
* [ ] Error cases exist
* [ ] Boundary value cases exist (where applicable)
* [ ] Special rule cases exist (soft delete, uniqueness, trim)

---

## 3. Business Rule Validation

### Repository Rules

* [ ] Repository must belong to a valid project
* [ ] Repository name is required and trimmed
* [ ] Repository name is not empty or whitespace-only
* [ ] Repository name is unique per project (active rows only)

### Soft Delete

* [ ] Soft delete does NOT physically remove data
* [ ] Deleted repositories are excluded from list
* [ ] Deleted repositories are still accessible via detail
* [ ] Update/delete operations on deleted repo are rejected

### Trim Behavior

* [ ] Leading/trailing spaces are trimmed before validation
* [ ] Trimmed value is used for uniqueness check

---

## 4. API Contract Validation

* [ ] All success responses return raw DTO or list
* [ ] No unexpected response wrapping
* [ ] Error responses follow standard ErrorResponse format

### Status Codes

* [ ] 200 → success (GET, PUT)
* [ ] 201 → created (POST)
* [ ] 400 → validation error
* [ ] 403 → unauthorized
* [ ] 404 → not found / invalid / deleted (update/delete)
* [ ] 409 → duplicate conflict

---

## 5. Input Validation Coverage

### Required Fields

* [ ] projectId required
* [ ] repo_name_masked required
* [ ] host_type required

### Optional Fields

* [ ] default_branch handled correctly (null/empty/trim)
* [ ] repo_url_hash handled correctly (raw input)

### Invalid Inputs

* [ ] Empty string
* [ ] Whitespace-only string
* [ ] Invalid enum (host_type)
* [ ] Missing fields
* [ ] Invalid UUID format

---

## 6. Permission & Security

* [ ] Unauthorized access returns 403
* [ ] All CRUD operations enforce permission
* [ ] No reliance on FE-only validation
* [ ] Backend is final authority for authorization

---

## 7. Data Integrity & Consistency

* [ ] No physical delete occurs
* [ ] Soft delete updates status and flags correctly
* [ ] List and detail behavior are consistent with spec
* [ ] Duplicate constraint is enforced at behavior level
* [ ] Trim does not create inconsistent data

---

## 8. Operation & Behavior

* [ ] List excludes deleted records
* [ ] Detail includes deleted records
* [ ] Update reflects immediately in subsequent read
* [ ] Delete reflects immediately in list behavior

---

## 9. Boundary Value Coverage

* [ ] Minimum valid repo name (length = 1 after trim)
* [ ] Maximum repo name length tested
* [ ] Empty optional fields tested
* [ ] Large dataset tested (pagination)

---

## 10. Error Handling

* [ ] All invalid inputs return proper error
* [ ] All error responses contain:

  * [ ] errorCode
  * [ ] message
* [ ] No unexpected 500 errors for known scenarios

---

## 11. Test Data Validation

* [ ] Test data is deterministic
* [ ] Test data is isolated per test
* [ ] Duplicate scenarios correctly configured
* [ ] Soft delete scenarios correctly configured

---

## 12. AC ↔ Test Case Mapping

* [ ] Mapping table exists
* [ ] Every test case maps to an AC
* [ ] No orphan test cases
* [ ] Coverage is traceable

---

## 13. Risk Coverage

* [ ] Soft delete inconsistency risk covered
* [ ] Duplicate constraint risk covered
* [ ] Trim logic risk covered
* [ ] Permission gap risk covered

---

## 14. Final Review

* [ ] All P0 test cases are defined and correct
* [ ] No critical business rule is missing
* [ ] Test cases are clear and executable
* [ ] Expected results are unambiguous
