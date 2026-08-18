# Test Data – Repository CRUD

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-19
**Author**: ChatGPT
**Update date**: 2026-06-23


## 1. Principles

* Deterministic: dữ liệu cố định, dễ reproduce
* Isolated: mỗi test không phụ thuộc nhau
* Reusable: dùng chung cho nhiều test case

---

## 2. Base Entities

### 2.1 Projects

| Key             | Description           |
| --------------- | --------------------- |
| PROJECT_1       | Project hợp lệ        |
| PROJECT_2       | Project hợp lệ khác   |
| PROJECT_INVALID | Project không tồn tại |

---

### 2.2 Repositories

| Key    | Name   | Project   | Status  |
| ------ | ------ | --------- | ------- |
| REPO_A | repo-A | PROJECT_1 | ACTIVE  |
| REPO_B | repo-B | PROJECT_1 | DELETED |
| REPO_C | repo-A | PROJECT_2 | ACTIVE  |

---

## 3. Input Data Sets

### 3.1 repo_name_masked

| Case       | Value        | Expected        |
| ---------- | ------------ | --------------- |
| Valid      | "repo-A"     | Accepted        |
| Trim       | "  repo-A  " | Trim → "repo-A" |
| Empty      | ""           | Reject (400)    |
| Whitespace | "   "        | Reject (400)    |
| Max length | 255 chars    | Accepted        |
| Over max   | >255 chars   | Reject          |

---

### 3.2 host_type

| Case    | Value     | Expected         |
| ------- | --------- | ---------------- |
| Valid   | "github"  | Accepted         |
| Valid   | "gitlab"  | Accepted         |
| Invalid | "unknown" | Reject (400/422) |

---

### 3.3 default_branch

| Case  | Value      | Expected       |
| ----- | ---------- | -------------- |
| Valid | "main"     | Accepted       |
| Empty | ""         | Stored as null |
| Null  | null       | Accepted       |
| Trim  | "  main  " | Trim → "main"  |

---

### 3.4 repo_url_hash (UI input)

| Case     | Value                    | Expected              |
| -------- | ------------------------ | --------------------- |
| Valid    | "https://github.com/a/b" | Accepted              |
| Empty    | ""                       | Stored as null        |
| Null     | null                     | Accepted              |
| Long URL | long string              | Accepted within limit |

> Note:

* UI uses raw value
* DB stores AES-256-GCM encoded value (not validated in black-box)

---

## 4. Special Data Sets

### 4.1 Duplicate Name (Same Project)

* Existing:

  * PROJECT_1 → repo-A
* Input:

  * Create repo-A in PROJECT_1
* Expected:

  * Conflict (409)

---

### 4.2 Duplicate Name (Different Project)

* Existing:

  * PROJECT_1 → repo-A
* Input:

  * Create repo-A in PROJECT_2
* Expected:

  * Allowed

---

### 4.3 Soft Delete Set

* REPO_B:

  * status = DELETED
  * delete_flag = true

Used for:

* List exclusion
* Detail inclusion
* Update/delete rejection

---

### 4.4 Trim Conflict Case

* Existing:

  * repo-A
* Input:

  * "  repo-A  "
* Expected:

  * Trim → conflict (409)

---

## 5. ID Formats

| Field         | Format |
| ------------- | ------ |
| projectId     | UUID   |
| repository_id | UUID   |

Example:

* projectId: `11111111-1111-1111-1111-111111111111`
* repository_id: `22222222-2222-2222-2222-222222222222`

---

## 6. Permission Data

| Case              | Description    |
| ----------------- | -------------- |
| AUTHORIZED_USER   | Có quyền CRUD  |
| UNAUTHORIZED_USER | Không có quyền |

Used for:

* 403 validation
* Permission test cases

---

## 7. Invalid Data Sets

### 7.1 Invalid projectId

* Null
* Non-existent UUID

---

### 7.2 Invalid repository_id

* Non-existent UUID
* Deleted repository (for update/delete)

---

### 7.3 Invalid payload

* Missing required fields
* Wrong data type
* Malformed JSON

---

## 8. Combined Scenario Data

### 8.1 Create → Delete → Recreate

* Step 1: Create repo-A
* Step 2: Delete repo-A
* Step 3: Create repo-A again

Expected:

* Allowed (soft delete frees uniqueness)

---

### 8.2 Large Data Set

* Many repositories (> page size)

Used for:

* Pagination tests

---

## 9. Reusable Constants

| Key          | Value        |
| ------------ | ------------ |
| VALID_NAME   | "repo-A"     |
| TRIM_NAME    | "  repo-A  " |
| EMPTY_NAME   | ""           |
| SPACE_NAME   | "   "        |
| VALID_HOST   | "github"     |
| INVALID_HOST | "invalid"    |
| VALID_BRANCH | "main"       |

---

## 10. Notes

* Không validate internal encoding (AES) trong black-box
* Không dùng shared mutable state giữa test
* Mỗi test nên setup data riêng (factory pattern nếu cần)
