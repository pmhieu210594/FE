# PARSER-REVIEW-CHECKLIST test-data.md

**Ticket ID**: PARSER-REVIEW-CHECKLIST
**Create date**: 2026-06-24
**Author**: ChatGPT
**Update date**: 2026-06-25

---

# 1. Mục tiêu

Định nghĩa tập test data dùng cho black-box test:

* Reusable giữa nhiều test case
* Không phụ thuộc file system
* Đảm bảo deterministic

---

# 2. Nguyên tắc

* Data ở dạng **inline string**
* Mỗi data set có **ID riêng**
* Có thể reuse nhiều test case
* Mapping rõ ràng: **Data ↔ Test Case**

---

# 3. Danh sách test data

---

## 3.1 Valid data

### DATA-01 – Minimal valid checklist

```text id="data01"
- [ ] item 1
- [x] item 2
```

**Use for**

* TC-01

---

### DATA-02 – Mixed checklist format

```text id="data02"
- item 1
* item 2
- [x] item 3
```

**Use for**

* TC-02

---

### DATA-03 – Checklist with perspectives

```text id="data03"
- [ ] security check
- [ ] performance optimization
- [ ] test coverage
```

**Use for**

* TC-06

---

---

## 3.2 No checklist / No perspective

### DATA-04 – No checklist

```text id="data04"
This is a document without checklist
```

**Use for**

* TC-03

---

### DATA-05 – No perspective

```text id="data05"
- [ ] random task
```

**Use for**

* TC-07

---

---

## 3.3 YAML data

### DATA-06 – Valid YAML

```yaml id="data06"
ticket_id: ABC-123
artifact_type: review_checklist
```

**Use for**

* TC-09

---

### DATA-07 – Missing ticket_id

```yaml id="data07"
artifact_type: review_checklist
```

**Use for**

* TC-10

---

### DATA-08 – Invalid YAML

```yaml id="data08"
ticket_id: ABC-123
: invalid
```

**Use for**

* TC-14

---

---

## 3.4 Error / Edge data

### DATA-09 – Empty content

```text id="data09"
""
```

**Use for**

* TC-12

---

### DATA-10 – Malformed markdown

```text id="data10"
::: invalid structure
```

**Use for**

* TC-13

---

### DATA-11 – Invalid ticket_id

```yaml id="data11"
ticket_id: ???
```

**Use for**

* TC-11

---

---

## 3.5 Boundary data

### DATA-12 – Checklist in code block

```text id="data12"
\`\`\`
- [ ] item 1
\`\`\`
```

**Use for**

* TC-04

---

### DATA-13 – False positive keyword

```text id="data13"
performance review meeting
```

**Use for**

* TC-08

---

---

## 3.6 Operation data

### DATA-14 – Multiple documents (batch)

```text id="data14"
Doc1:
- [ ] item 1

Doc2:
- [ ] security check
```

**Use for**

* TC-16

---

### DATA-15 – Webhook trigger content

```text id="data15"
- [ ] test coverage improvement
```

**Use for**

* TC-17

---

---

# 4. Mapping Test Data ↔ Test Case

| Data ID | Test Case |
| ------- | --------- |
| DATA-01 | TC-01     |
| DATA-02 | TC-02     |
| DATA-03 | TC-06     |
| DATA-04 | TC-03     |
| DATA-05 | TC-07     |
| DATA-06 | TC-09     |
| DATA-07 | TC-10     |
| DATA-08 | TC-14     |
| DATA-09 | TC-12     |
| DATA-10 | TC-13     |
| DATA-11 | TC-11     |
| DATA-12 | TC-04     |
| DATA-13 | TC-08     |
| DATA-14 | TC-16     |
| DATA-15 | TC-17     |

---

# 5. Kết luận

Test data được thiết kế:

* Bao phủ:

  * normal
  * error
  * boundary
* Có thể reuse cho nhiều test case
* Không phụ thuộc môi trường
* Dễ mở rộng cho future test
