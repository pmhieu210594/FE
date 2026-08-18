# Review Checklist

**Ticket ID**: <TICKET>
**Create date**: <Create_date> 
**Author**: <Author>
**Update date**: <Update_date> 

## 1. Specification/AC Matching
| AC ID | Review Point | Severity | Result |
|---|---|---|---|

## 2. General System Review

### 2.1. Number/Input Check
- [ ] Clear Numeric Validation
- [ ] Full-width Numbers are Processed or Clearly Not Supported
- [ ] Half-width/Full-width Mixed Numbers are Considered
- [ ] Empty String/Null are Processed
- [ ] Clear Digit/Precision/Scale/Rounding
- [ ] No Overflow/Underflow

### 2.2. Character Type / Encoding / Locale

- [ ] Full-width/half-width/emoji/surrogate pair considered
- [ ] Clear trim rule
- [ ] Unicode normalization if needed
- [ ] No mojibake Shift-JIS/UTF-8
- [ ] Japanese/Vietnamese/English messages are not misspelled

### 2.3. Literal / Magic Number

- [ ] No hard-coded business code value
- [ ] Enum/constant/master used correctly
- [ ] Clear mapping display/internal value

### 2.4. Operation / Maintainability

- [ ] Sufficient logs for incident investigation
- [ ] Correlation ID/request ID if needed
- [ ] Retry/double execution considered
- [ ] Clear rollback/manual recovery
- [ ] Configuration not hard-coded

## 3. FE Review

## 4. BE/API Review

## 5. DB/Migration Review

## 6. Security/Privacy Review

- [ ] {Security/Privacy Review}
- [ ] {Security/Privacy Review}
- [ ] {Security/Privacy Review}
- [ ] {Security/Privacy Review}

## 7. Operation/Maintenance Review

## 8. Test Review

- [ ] {Operation/Maintenance Review}
- [ ] {Operation/Maintenance Review}
- [ ] {Operation/Maintenance Review}
- [ ] {Operation/Maintenance Review}

## 9. Documentation/Traceability Review

## 10. Release/Rollback Review

## Severity Definition
| severity | meaning | required action |
|---|---|---|
| Blocker | Cannot be released | Must fix |
| Major | High probability of becoming a bug | Fix or accepted risk |
| Minor | Minor improvement | Optional |
| Question | Spec confirmation required | Open Issue |
| False Positive | Incorrect Report | Record Reason for Rejection |
| Accepted Risk | Accepted Risk | Record Impact/Owner/Deadline |