# Sources

**Ticket ID**: PARSER-SELF-REVIEW  
**Create date**: 2026-06-22  
**Author**: nk_trung           
**Update date**: 2026-06-22

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| Ticket folder | `docs/changes/PARSER-SELF-REVIEW/` | Active | Thư mục làm việc duy nhất cho Phase 1 investigation, spec pack và handoff implement sau này. |
| Raw requirement pack | `docs/changes/PARSER-SELF-REVIEW/raw/requirement.md` | Reviewed | Nguồn requirement chính cho scope parser self-review, policy section và intent acceptance. |
| Raw template | `docs/changes/PARSER-SELF-REVIEW/raw/self-review-template.md` | Reviewed | Template canonical 11 section mà parser phải nhận diện. |
| Raw database design | `docs/changes/PARSER-SELF-REVIEW/raw/database-design.md` | Reviewed | Thiết kế storage theo hướng reuse-first và hướng dẫn map output. |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| Requirement definition | `docs/changes/PARSER-SELF-REVIEW/raw/requirement.md` | Reviewed | Primary | Mô tả parsing strict, required/recommended/optional section, subtree completeness và output cần có. |
| Database design | `docs/changes/PARSER-SELF-REVIEW/raw/database-design.md` | Reviewed | Primary | Định nghĩa reuse-first storage, idempotency và cách dùng evidence downstream. |
| Self-review template | `docs/changes/PARSER-SELF-REVIEW/raw/self-review-template.md` | Reviewed | Primary | Template gốc phải giữ backward compatible. |
| Architecture overview | `docs/architecture/overview.md` | Reviewed | Supporting | Cho bối cảnh platform và kiến trúc backend hexagonal. |
| Source inventory | `docs/architecture/source-inventory.md` | Reviewed | Supporting | Xác nhận parser-related source và test nên nằm ở đâu. |
| Service layer map | `docs/architecture/service-layer-map.md` | Reviewed | Supporting | Giúp xác định boundary parser/service và gap implementation hiện tại. |
| Repository DB map | `docs/architecture/repository-db-map.md` | Reviewed | Supporting | Xác nhận hướng schema reuse-first cho output parser. |
| Test map | `docs/architecture/test-map.md` | Reviewed | Supporting | Hữu ích để hiểu gap coverage test hiện tại của parser. |
| Backend standards | `docs/standards/backend.md` | Reviewed | Supporting | Xác nhận kỳ vọng layering controller/service/domain. |
| Logging standards | `docs/standards/logging.md` | Reviewed | Supporting | Xác nhận traceId, log hygiene và rule không log dữ liệu nhạy cảm. |
| Security standards | `docs/standards/security.md` | Reviewed | Supporting | Xác nhận path-guard, không lộ raw content và xử lý error an toàn. |
| Testing standards | `docs/standards/testing.md` | Reviewed | Supporting | Xác nhận kỳ vọng unit/integration/regression cho parser work. |
| Architecture rules | `.claude/rules/20-architecture.md` | Reviewed | Supporting | Xác nhận hướng dependency và không để layer leakage. |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Markdown parser core | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/core/MarkdownParserCore.java` | Reviewed | Baseline parser utilities cho front matter, sections, tables, placeholders và hashes. |
| Spec-pack parser | `EDCAP_BE/src/main/java/com/sdd/platform/domain/service/markdown/specpack/SpecPackMarkdownParser.java` | Reviewed | Parser strict có sẵn cho template khác; hữu ích làm pattern tham chiếu. |
| Parser controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SpecPackMarkdownParserController.java` | Reviewed | Minh họa endpoint parse dev-only và path guard hiện tại. |
| Artifact scanner service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java` | Reviewed | Xác nhận flow artifact scanning và kỳ vọng file-name `self-review.md`. |
| Artifact scan models | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerModels.java` | Reviewed | Xác nhận shape cho snapshot, parsed-section, decision, risk, event và quality record. |
| Artifact model | `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/Artifact.java` | Reviewed | Xác nhận `SELF_REVIEW` đã là artifact type được nhận biết. |
| Scanner persistence adapter | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/scanner/ArtifactScannerJdbcAdapter.java` | Reviewed | Hữu ích cho mapping persistence theo hướng reuse-first. |
| Source code search | `EDCAP_BE/src/main/java/...` | Partial | Chưa tìm thấy dedicated self-review parser class. |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| Parser unit test | `EDCAP_BE/src/test/java/com/sdd/platform/domain/service/SpecPackMarkdownParserTest.java` | Reviewed | Baseline tốt cho style parsing, nhưng đang target spec-pack chứ không phải self-review. |
| Parser controller test | `EDCAP_BE/src/test/java/com/sdd/platform/web/rest/SpecPackMarkdownParserControllerTest.java` | Reviewed | Xác nhận path guard và pattern parse file. |
| Scanner service test | `EDCAP_BE/src/test/UnitTest/java/com/sdd/platform/application/usecase/governance/ArtifactScannerServiceTest.java` | Reviewed | Xác nhận pattern orchestration của scanning. |
| Self-review parser test | `EDCAP_BE/src/test/...` | Not found | Chưa tìm thấy test dedicated cho self-review parser trong source hiện tại. |

## Excluded Sources

| source/path | reason |
|---|---|
| `EDCAP_BE/target/`, `EDCAP_FE/dist/`, `EDCAP_FE/node_modules/`, `EDCAP_FE/coverage/` | Artifact sinh ra, không phải bằng chứng source. |
| Secrets, `.env`, logs, credential dumps | Nhạy cảm và không cần cho Phase 1. |
| External web sources | Không cần vì raw pack và source local đã đủ cho phase này. |

## Source Limitations

- Requirement đủ rõ để draft strict parser contract, nhưng vẫn còn vài lựa chọn vận hành cần con người xác nhận.
- Chưa tìm thấy dedicated self-review parser class; hiện chỉ có general markdown parser và spec-pack parser làm reference.
- Coverage test hiện tại hữu ích cho style và layering, nhưng chưa đặc thù cho self-review parsing.
- Raw requirement và raw template phải được ưu tiên hơn các tài liệu architecture hoặc standards nếu có xung đột.

## Assumptions from Sources

- `self-review.md` là artifact bắt buộc trong thư mục `docs/changes/<TICKET>/`.
- Parser phải giữ backward compatibility với template 11 section và header 4 dòng.
- Parser không được suy diễn nghĩa business vượt ra ngoài template và quy tắc subtree đã được định nghĩa trong requirement.
- Storage theo hướng reuse-first và rerun idempotent là kỳ vọng cho workflow evidence downstream.

## Human Confirmation Required

| item | status | note |
|---|---|---|
| Xác nhận output parser có phải chỉ chuẩn hóa verdict về `PASS`, `NEEDS_UPDATE` và `BLOCKED` hay vẫn phải hỗ trợ thêm giá trị legacy để tương thích. | Closed | Đã chốt chuẩn verdict nội bộ cho Phase 1; legacy không phải phạm vi hiện tại. |
| Xác nhận parser có cần hỗ trợ alias heading ngoài canonical text hay không. | Closed | Chỉ hỗ trợ alias trong map cố định của parser. |
| Xác nhận có cần lưu raw text song song với normalized output hay không. | Closed | Không lưu raw text riêng trong output chuẩn hóa. |
| Xác nhận có cần audit record riêng ngoài table reuse hiện có hay không. | Closed | Không tạo audit record riêng; dùng warnings/errors/summary hiện có. |
