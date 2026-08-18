# PARSER-REVIEW-CHECKLIST source-inventory.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

## 1. Mục tiêu

Liệt kê toàn bộ:

* Source liên quan trực tiếp
* Source liên quan gián tiếp
* Mapping giữa source ↔ chức năng

---

## 2. Source Structure (Hiện tại)

### 2.1 Data Source (Markdown)

```
docs/changes/<TICKET>/
 ├── spec-pack.md
 ├── context.md
 ├── review-checklist.md
```

---

### 2.2 Documentation

```
docs/architecture/*
docs/standards/*
.claude/rules/*
```

---

## 3. Target Source (Đã implement — Java)

### 3.1 Parser Module (Domain Layer)

```
EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/reviewchecklist/
 └── ReviewChecklistMarkdownParser.java
```

Phụ thuộc:

```
EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/
 └── MarkdownParserCore.java
```

---

### 3.2 Scanner Integration (Application Layer)

```
EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/
 └── ArtifactScannerService.java
      └── persistReviewChecklistParse()
```

---

### 3.3 Test Module

```
EDCAP_BE/src/test/java/...
 ├── ReviewChecklistMarkdownParserTest.java   (unit test parser)
 └── ArtifactScannerServiceIT.java           (integration test scanner)
```

---

## 4. Mapping Source → Responsibility

| Class / Method                           | Responsibility                          |
| ---------------------------------------- | --------------------------------------- |
| `ReviewChecklistMarkdownParser.parse()`  | Entry point parser — trả về ParsedArtifact |
| `MarkdownParserCore.parse()`             | Core markdown parsing (sections, tables, front matter) |
| `detectMissingFields()`                  | Kiểm tra section SECURITY/TEST/PERFORMANCE |
| `inferTicketId()`                        | Infer ticket_id từ 3 nguồn             |
| `buildParsedSummary()`                   | Tổng hợp parsedSummary map              |
| `ArtifactScannerService.persistReviewChecklistParse()` | Persist ParsedArtifact vào DB |

---

## 5. Mapping Source → Acceptance Criteria

| AC                                         | Class / Method                              |
| ------------------------------------------ | ------------------------------------------- |
| AC-1: 3 sections → DRAFT                   | `detectMissingFields()`                     |
| AC-2: null/empty → artifactExists=false    | `parse()` input normalization               |
| AC-3: Thiếu section → warning              | `detectMissingFields()`                     |
| AC-4: parseMode=official → OFFICIAL        | `determineParseStatus()`                    |
| AC-5: ticket_id inference 3 nguồn          | `inferTicketId()`                           |
| AC-6: parsedSummary đầy đủ dù có warning   | `buildParsedSummary()`                      |
| AC-7: Idempotency ở scanner                | `ArtifactScannerService.buildSnapshot()`    |

---

## 6. Caller / Callee Mapping

### 6.1 Caller (Upstream)

* `ArtifactScannerService.scanTicketDirectory()` — gọi parser khi `snapshot.needParse() && snapshot.existsFlag()`

---

### 6.2 Callee (Downstream)

```
ArtifactScannerService
 └── reviewChecklistParser.parse(content, sourcePath)
      └── ReviewChecklistMarkdownParser
           ├── core.parse(content, sourcePath)    → MarkdownParserCore
           ├── inferTicketId()
           ├── detectMissingFields()
           └── buildParsedSummary()
      └── persistReviewChecklistParse(snapshot, ticketId, ...)
           ├── persistence.updateSnapshotParsedSummary()
           ├── persistence.deleteParsedSectionsByTicketIdAndSectionType()
           ├── persistence.insertParsedSection() per section
           ├── persistence.insertEvidenceEvent()
           ├── persistence.insertDataQualityRecord()  (khi có issues)
           └── evidenceQualityScoreService.recalculateFromParser()
```

---

## 7. External Dependency

### 7.1 Allowed

* `MarkdownParserCore` (domain layer)
* Logging (SLF4J)
* Java standard library

---

### 7.2 Not Allowed (parser layer)

* Database
* External API
* Spring framework (parser là plain Java)

---

## 8. Test Source Mapping

| Test Type        | Class                                   |
| ---------------- | --------------------------------------- |
| Unit Test        | `ReviewChecklistMarkdownParserTest.java` |
| Integration Test | `ArtifactScannerServiceIT.java`          |

---

## 9. Configuration / Setting

* `PARSER_VERSION = "review-checklist-markdown-parser-v1"` (constant trong parser)
* `DEFAULT_PARSE_MODE = "draft"` (constant trong parser)
* `ALL_FIELDS = ["security", "test", "performance"]` (constant trong parser)

---

## 10. Dependency Graph (Logical)

```
ArtifactScannerService
        ↓
ReviewChecklistMarkdownParser
        ↓
MarkdownParserCore
        ↓
ParsedArtifact (returned)
        ↓
persistReviewChecklistParse()
        ↓
DB (tbl_fact_artifact_snapshot + tbl_parsed_section + evidence events)
```

---

## 11. Non-impact Source

Các source KHÔNG bị ảnh hưởng:

* FE code
* API controller (parser không expose REST endpoint riêng)
* DB schema (dùng parsedSummary map, không thêm column)
* Migration script
* Các parser khác (SpecPackMarkdownParser, SelfReviewMarkdownParser, ...)

---

## 12. Kết luận

* Parser module là **isolated component** trong domain layer
* Phụ thuộc duy nhất: `MarkdownParserCore`
* Integration vào `ArtifactScannerService` theo pattern chung của hệ thống
