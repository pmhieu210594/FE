# PARSER-REVIEW-CHECKLIST impl-plan.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-30

---

# 1. Mục tiêu

Triển khai chức năng parser cho `review-checklist.md` nhằm:

* Xác định coverage của 3 required sections (security / test / performance)
* Chuẩn hóa dữ liệu thành `ParsedArtifact`
* Lưu metadata vào `tbl_fact_artifact_snapshot` + `tbl_parsed_section`

---

# 2. Phạm vi

## 2.1 Trong phạm vi

* Parse markdown content (string)
* Trả về `ParsedArtifact` (19 fields + parsedSummary)
* Lưu dữ liệu vào database thông qua `ArtifactScannerService.persistReviewChecklistParse()`

---

## 2.2 Ngoài phạm vi

* Không đọc file từ Git (parser nhận content string từ scanner)
* Không xử lý ingestion pipeline
* Không xử lý idempotency (thuộc scanner)
* Không xử lý downstream analytics

---

# 3. Thành phần cần triển khai

## 3.1 ReviewChecklistMarkdownParser

### Methods

```java
public ParsedArtifact parse(String content)
public ParsedArtifact parse(String content, String sourcePath)
public ParsedArtifact parse(String content, String sourcePath, String parseMode)
```

### Constants

```java
private static final String PARSER_VERSION = "review-checklist-markdown-parser-v1";
private static final String DEFAULT_PARSE_MODE = "draft";
public static final List<String> ALL_FIELDS = List.of("security", "test", "performance");
```

### Trách nhiệm

* Delegate sang `MarkdownParserCore`
* Infer ticket_id từ 3 nguồn
* Detect required sections
* Check placeholder
* Build `ParsedArtifact` + `parsedSummary`

---

## 3.2 ArtifactScannerService.persistReviewChecklistParse()

### Trách nhiệm

Persist `ParsedArtifact` vào DB theo 5 bước:

1. `updateSnapshotParsedSummary()` — persist parsedSummary map
2. `deleteParsedSectionsByTicketIdAndSectionType(ticketId, "review-checklist")` + `insertParsedSection()` per section
3. `insertEvidenceEvent()` — event log `REVIEW_CHECKLIST_PARSE / PARSE_COMPLETED`
4. `insertDataQualityRecord()` — khi có `requiredFieldsMissing` hoặc errors
5. `evidenceQualityScoreService.recalculateFromParser()` — trigger tính lại score

---

# 4. Chi tiết implementation

## 4.1 Parser flow

### Bước 1: Input normalization

* `content == null` → `""`
* Tính `artifactExists` từ `normalizedContent.trim().isEmpty()`

---

### Bước 2: Core parsing (delegate)

```java
MarkdownDocument document = core.parse(content, sourcePath);
```

Core trả về: `frontMatter`, `headerMetadata`, `sections` (uppercase keys), `tables`, `placeholders`, `warnings`, `errors`, `normalizedContent`, `contentHash`

---

### Bước 3: ticket_id inference

Ưu tiên:

1. YAML front matter: key `ticket_id`, `ticket-id`, `ticketid`
2. Source path: `.../changes/<TICKET>/review-checklist.md`
3. Header metadata: key `ticket_id`, `ticket-id`, `ticketid`

Validation: phải match `^[A-Z0-9][A-Z0-9-]*$`

Nếu không infer được → emit `ParsingIssue(code="ticket_id_missing")`

---

### Bước 4: Required section detection

```java
for (String field : ALL_FIELDS) {  // ["security", "test", "performance"]
    String value = sections.get(field.toUpperCase());
    if (value == null || value.isBlank()) {
        missingFields.add("section:" + field);
    }
}
if (!missingFields.isEmpty()) {
    warnings.add(new ParsingIssue("required_fields_missing", ...));
}
```

---

### Bước 5: Placeholder check

```java
if (!placeholders.isEmpty()) {
    warnings.add(new ParsingIssue("placeholder_detected", ...));
}
```

---

### Bước 6: Determine parse_status

```java
if (!errors.isEmpty()) return "FAILED";
if (!warnings.isEmpty()) return "PARTIAL";
return "official".equalsIgnoreCase(parseMode) ? "OFFICIAL" : "DRAFT";
```

---

### Bước 7: Determine artifactStatus

```java
artifactStatus = artifactExists ? (errors.isEmpty() ? "present" : "invalid") : "missing";
```

---

### Bước 8: Build ParsedArtifact + parsedSummary

```java
Map<String, Object> parsedSummary = buildParsedSummary(...);
return new ParsedArtifact(sourcePath, ticketId, normalizedParseMode, parseStatus,
    artifactStatus, artifactExists, frontMatter, headerMetadata, sections,
    tables, List.of(), placeholders, warnings, errors, missingFields,
    document.normalizedContent(), document.contentHash(), PARSER_VERSION, parsedSummary);
```

---

## 4.2 Scanner integration

```java
} else if ("review-checklist.md".equalsIgnoreCase(artifactFileName)) {
    byte[] blob = source.readBlob(repoFullName, entry.sha());
    String content = new String(blob, StandardCharsets.UTF_8);
    var parsed = reviewChecklistParser.parse(content, sourcePath);
    persistReviewChecklistParse(snapshot, ticket.ticketId(), repositoryId, runId, sourcePath, parsed);
}
```

---

# 5. Error handling

## 5.1 Parser

* Không throw exception với lỗi dữ liệu
* Trả về warnings/errors list trong ParsedArtifact

---

## 5.2 Scanner

* Exception từ parser → `persistParseFailure()` → emit `PARSE_FAILED` event
* Scan run tiếp tục (non-blocking failure)

---

# 6. Test strategy

## 6.1 Unit test (Parser)

* Section detection (SECURITY/TEST/PERFORMANCE present/absent)
* ticket_id inference (3 nguồn: front matter, path, header)
* Warning codes (3 loại)
* parse_status logic (OFFICIAL / DRAFT / PARTIAL / FAILED)
* parsedSummary fields đầy đủ

---

## 6.2 Integration test (Scanner)

Flow:

```text
Input content
    ↓
reviewChecklistParser.parse()
    ↓
persistReviewChecklistParse()
    ↓
DB assertions
```

---

## 6.3 Idempotency test

* `needParse = false` khi contentHash không đổi → parser không được gọi

---

# 7. Deliverables

* `ReviewChecklistMarkdownParser.java` (domain layer)
* Cập nhật `ArtifactScannerService.java` (persistReviewChecklistParse + scanner branch)
* Unit test: `ReviewChecklistMarkdownParserTest.java`
* Integration test: `ArtifactScannerServiceIT.java`

---

# 8. Ràng buộc

* Parser không phụ thuộc DB
* Parser là pure Java, không có Spring annotation
* Không thay đổi DB schema
* Không thay đổi contract của `tbl_fact_artifact_snapshot`
* Section type khi persist phải là `"review-checklist"`

---

# 9. Kết luận

Implementation gồm 2 phần:

1. Parser (`ReviewChecklistMarkdownParser`):

   * delegate sang `MarkdownParserCore`
   * section-based detection
   * trả về `ParsedArtifact`

2. Persistence (`ArtifactScannerService.persistReviewChecklistParse`):

   * 5-step persist vào database

Đảm bảo:

* Tách biệt trách nhiệm
* Dễ test (parser là pure Java)
* Phù hợp kiến trúc Hexagonal hiện tại
