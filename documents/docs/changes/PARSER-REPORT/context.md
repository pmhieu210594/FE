# CONTEXT – REPORT PARSER

**Ticket ID**: PARSER-REPORT
**Create date**: 2026-06-26
**Author**: ChatGPT
**Update date**: 2026-06-26

---

## 1. Entry Points

### 1.1 API Layer

Dựa trên `route-api-map.md` và structure BE:

* API không trực tiếp expose parser
* Parser được gọi thông qua:

  * Artifact ingestion flow
  * Internal service orchestration

➡️ Parser thuộc **internal usecase**, không phải public controller

---

### 1.2 Service Layer Entry

Các service liên quan (đã verify từ code):

* `ImplPlanParseService`
* `TestPlanParseService`
* `TestResultsParseService`
* `TestCoverageValidationService`
* `TestArtifactPairViewService`

📌 Pattern:

```
Controller (nếu có)
 → Usecase Service (docparse)
   → Parser logic
     → DTO
       → Repository
```

➡️ PARSER-REPORT sẽ follow cùng pattern với:

* `*ParseService` trong package:

  ```
  com.sdd.platform.application.usecase.docparse
  ```

---

### 1.3 Batch / Job

Theo `data-flow-map.md`:

* Flow ingestion:

  * GitHub webhook
  * Artifact Scanner
  * CI metadata ingestion

Parser có thể được trigger từ:

* Artifact Scanner pipeline
* CI ingestion flow

➡️ Không phải cron job độc lập

---

## 2. Processing Flow (Real Architecture)

### Flow chuẩn trong hệ thống:

```
Document (Markdown)
 → Parser Service (*ParseService)
   → Structured DTO
     → Validation Service
       → Repository Layer (Mapper XML / DB)
         → Snapshot tables
           → Downstream analytics
```

### Chi tiết:

1. Read file (Markdown spec/report)
2. Parse theo template chuẩn (heading + table)
3. Normalize:

   * Trim
   * Remove placeholder
   * Detect missing
4. Convert → DTO
5. Validate:

   * Required fields
   * AC format
6. Persist:

   * Snapshot tables (artifact-based)
7. Return structured result

---

## 3. Existing Good Implementations (IMPORTANT)

### 3.1 TestPlanParseService

* Parse markdown test-plan
* Extract sections + structured data
* Normalize AC/Testcase

### 3.2 TestResultsParseService

* Parse execution result
* Map status / result

### 3.3 ImplPlanParseService

* Parse implementation plan
* Extract task breakdown

➡️ Đây là **reference chuẩn cho PARSER-REPORT**

---

## 4. Common Components

### 4.1 Được phép dùng

* Spring Boot Service layer
* Mapper XML (MyBatis style)
* DTO class (application layer)
* Common parsing util (string, regex)
* Logging (SLF4J / standard logging.md)
* Validation pattern từ existing parser

---

### 4.2 Không được dùng

* ❌ Direct JDBC
* ❌ Bypass Mapper layer
* ❌ Parse bằng hardcoded line index
* ❌ Custom framework ngoài chuẩn project

---

## 5. Method Inventory (Verified)

### 5.1 Existing Parse Services

Các method pattern:

* `parse(String content)`
* `extractSections(...)`
* `normalizeData(...)`
* `validate(...)`

(Từ các service docparse)

---

### 5.2 Repository Layer

Mapper XML files:

* `ProjectMapper.xml`
* `RepositoryMapper.xml`
* `EvidenceRepositoryMapper.xml`
* `SecurityScanMapper.xml`

➡️ DB access thông qua mapper XML

---

### 5.3 Forbidden / Not Exist

* Không có:

  * Generic Parser Engine
  * Reflection-based parser
* Không có:

  * Dynamic schema parser

➡️ Parser phải implement riêng từng artifact

---

## 6. Data Mapping

### 6.1 Architecture

Theo `repository-db-map.md`:

* Data được lưu dạng:

  * Snapshot tables
  * Artifact-based schema

---

### 6.2 Mapping Pattern

```
Markdown → DTO → Snapshot Entity → DB Table
```

Ví dụ (từ spec-pack):

* AC → AC table
* Terminology → lookup table
* Input/Output → structured JSON field

---

### 6.3 Migration

DB migration files:

* `V160__artifact_scanner.sql`
* `V161__artifact_scanner_ticket_status.sql`

➡️ Parser phải tương thích schema hiện tại

---

## 7. Domain Mapping

### 7.1 Ticket-based

* Tất cả parser gắn với:

  ```
  docs/changes/<TICKET>/
  ```

---

### 7.2 Acceptance Criteria

Format chuẩn:

```
AC-<TICKET>-<n>
```

Parser phải:

* Count AC
* Detect invalid format

---

### 7.3 Placeholder Detection

Các giá trị cần detect:

* `TBD`
* `TODO`
* `---`
* `<...>`
* empty / null

---

### 7.4 Master Data

* Status (pass/fail)
* Artifact type
* Ticket status

➡️ mapping từ DB hoặc enum

---

## 8. i18n / Encoding

Theo `standards/backend.md`:

* UTF-8 bắt buộc
* Markdown có thể chứa:

  * English
  * Vietnamese

Parser phải:

* Không fail với unicode
* Normalize whitespace

---

## 9. Logging / Audit / Operation

### 9.1 Logging (theo logging.md)

Bắt buộc log:

* Start parsing
* End parsing
* Error detail
* Warning (missing section)

---

### 9.2 Audit

Theo governance:

* Track:

  * ticket_id
  * timestamp
  * parser result

---

### 9.3 Operation Rules

* Idempotent parsing
* Retry safe
* Không duplicate record

---

## 10. Key Constraints

* Parser phải deterministic
* Không phụ thuộc thứ tự section (nhưng phải đúng heading)
* Không chấp nhận heading variant

---

## 11. Gap Analysis (Quan trọng cho Phase 3)

Hiện tại:

* Có parser cho:

  * test-plan
  * test-results
  * impl-plan

Chưa có:

* ❗ Report parser (PARSER-REPORT)

➡️ Cần:

* Tạo service mới:

  ```
  ReportParseService
  ```
* Reuse pattern từ:

  * TestPlanParseService
  * ImplPlanParseService

---

## 12. Kết luận

PARSER-REPORT phải:

* Tuân thủ docparse pattern hiện có
* Không phá architecture
* Reuse parsing strategy
* Output consistent với downstream analytics
