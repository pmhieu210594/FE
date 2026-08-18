# Sources

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (SDD analyst), theo quyết định của người dùng
**Update date**: 2026-08-17

## Ticket / Issue

| source | link/path | status | note |
|---|---|---|---|
| SECURITY-FINDING-RESOLUTION-TIME | `docs/changes/SECURITY-FINDING-RESOLUTION-TIME/` | Read/Write | Ticket working directory, tạo mới trong phiên SDD này |
| Yêu cầu nghiệp vụ | `docs/changes/SECURITY-FINDING-RESOLUTION-TIME/raw/requirement.md` | Read | Ghi lại quyết định của người dùng qua chat, đối chiếu source code — không phải tài liệu bên ngoài |

## Requirement / Design Documents

| source | path | status | trust level | note |
|---|---|---|---|---|
| 00_brainstorm (lịch sử quyết định) | `docs/changes/SECURITY-FINDING-RESOLUTION-TIME/00_brainstorm.md` | Read/Write | High | Nguồn duy nhất ghi nhận toàn bộ quyết định người dùng qua 4 vòng trả lời |
| Open Issues | `docs/changes/SECURITY-FINDING-RESOLUTION-TIME/open-issues.md` | Read/Write | High | Theo dõi điểm mơ hồ đã đóng/còn mở |
| spec-pack (bản trước) | `docs/changes/SECURITY-FINDING-RESOLUTION-TIME/spec-pack.md` | Read | High | Bản nháp trước, dùng làm nguồn nội dung để tái cấu trúc theo template mới |
| Wireframe / mockup | — | **Không tồn tại** | — | Không có, vị trí field trong `SecurityTicketDetailDrawer` do impl-plan quyết định dựa trên UI hiện có |
| Ticket nền: SECURITY-DASHBOARD | `docs/changes/SECURITY-DASHBOARD/spec-pack.md` | Partial (chỉ đọc để tham chiếu cấu trúc, chưa đọc toàn văn requirement gốc) | High | Ticket cha — field này bổ sung vào dashboard đã có |
| Template spec-pack chuẩn | `docs/standards/templates/_ticket-template/spec-pack.md` | Read | High | Dùng làm cấu trúc tham chiếu (18 mục theo yêu cầu người dùng lần này là biến thể tiếng Việt của template này) |
| Template sources | `docs/standards/templates/_ticket-template/sources.md` | Read | High | Áp dụng trực tiếp cho file này |
| Template 00_brainstorm | `docs/standards/templates/_ticket-template/00_brainstorm.md` | Read | High | Áp dụng trực tiếp cho `00_brainstorm.md` |
| Kiến trúc hệ thống | `docs/architecture/overview.md`, `service-layer-map.md`, `repository-db-map.md`, `route-api-map.md` | Partial (đọc mục lục, chưa đọc toàn văn — route-api-map.md không có mục Security Dashboard, xác nhận bằng source code thay vì tài liệu) | High | `20-architecture.md`: nếu tài liệu và source mâu thuẫn, ưu tiên source |
| Coding/testing/security standards | `docs/standards/coding.md`, `backend.md`, `testing.md`, `security.md`, `api-contract.md` | Partial | High | Áp dụng ở mục Validation/Security/Test Strategy |
| `.claude/rules/*` | `.claude/rules/00-safety.md`, `10-style.md`, `20-architecture.md`, `30-security.md`, `40-testing.md` | Read (nạp qua system context) | High | Ràng buộc bắt buộc cho toàn bộ artifact |

## Existing Source Code

| area | path | status | purpose |
|---|---|---|---|
| Schema `tbl_fact_security_scan` | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql:740-758` | Read | Nguồn dữ liệu duy nhất đã chốt (OI-2 Rev.2) |
| `run_status` enum | `V4__init_shema_v2.sql:41` | Read | Xác nhận `status` là trạng thái chạy scan, không phải trạng thái resolve |
| Security Dashboard service | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/securitydashboard/SecurityDashboardService.java` | Read (toàn bộ, 205 dòng) | Nơi dự kiến bổ sung logic tính cycle (theo hexagonal rule: business logic ở application layer) |
| Security Dashboard models | `.../securitydashboard/SecurityDashboardModels.java` | Read (toàn bộ) | `SecurityTicketDetail` record cần mở rộng field `resolutionTime` |
| Security Dashboard adapter | `.../infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` | Read (một phần, dòng 1-70) | Pattern truy vấn theo `(ticket_id, scanner_type)`, `TICKET_REPO_CTE`, `SAST_LATERAL_JOIN` |
| Security Dashboard controller | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/SecurityDashboardController.java` | Read (route mapping) | Xác nhận endpoint `GET /api/v1/security/dashboard/tickets/{ticketId}` — nơi field mới sẽ xuất hiện trong response |
| Security Dashboard DTO | `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/SecurityDashboardDtos.java` | Not read toàn văn (chỉ xác nhận tồn tại) | Cần mở rộng ở impl-plan |
| FE Security Ticket Detail Drawer | `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx` | Read (toàn bộ, 170 dòng) | Vị trí hiển thị field mới |
| FE Security Dashboard types | `EDCAP_FE/src/pages/security-dashboard/types.ts` | Read (100 dòng đầu) | Cần mở rộng `SecurityTicketDetail` type |
| Artifact Scanner flow (tham chiếu kiến trúc) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/scanner/ArtifactScannerService.java`, `ArtifactScannerJdbcAdapter.java` | Read (danh sách file, chưa đọc toàn văn) | Ví dụ flow hexagonal đầy đủ (Service + Port + Adapter + Controller + DTO) cho 1 chức năng "parse dữ liệu scan" hiện có — dùng làm tham chiếu cấu trúc, không phải nguồn business rule |
| Evidence Quality Score flow (tham chiếu kiến trúc) | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/quality/EvidenceQualityScoreService.java` | Not read toàn văn (chỉ đọc `EvidenceQualityScoreRepositoryAdapter.java:480-529` ở phase trước) | Ví dụ tính toán 1 metric tổng hợp (score) từ nhiều tín hiệu có sẵn — mô hình tương tự việc tính resolution time từ lịch sử scan |

## Existing Tests

| test type | path | status | note |
|---|---|---|---|
| BE unit test | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/SecurityDashboardServiceTest.java` | Not read toàn văn (chỉ xác nhận tồn tại) | Sẽ là nơi bổ sung test case cho logic cycle mới; tham khảo pattern mock port hiện có |
| BE adapter test | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityScanRepositoryAdapterTest.java` | Not read toàn văn | Tham khảo pattern test truy vấn `tbl_fact_security_scan` hiện có |
| FE test | `EDCAP_FE/src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx` | Not read toàn văn | Tham khảo pattern test Testing Library cho trang Security Dashboard |
| BE integration test | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/SecurityEvidenceControllerIntegrationTest.java` | Not read | Liên quan `tbl_fact_security_scan`/ingest, không trực tiếp liên quan field mới nhưng cùng domain |

## External / Office / PDF / Web References

Không có. Toàn bộ input là quyết định trực tiếp của người dùng qua chat + source
code nội bộ. Không có tài liệu Office/PDF/Web nào được cung cấp cho ticket này.

## Excluded Sources

| source/path | reason |
|---|---|
| `tbl_fact_security_finding` (`V4__init_shema_v2.sql:760-780`) | Phương án bị loại ở vòng trả lời đầu tiên (OI-2) — bảng orphaned, không có code application nào dùng |
| `tbl_connector_run` (`V4__init_shema_v2.sql:322-338`) | Phương án bị loại ở vòng trả lời thứ hai (OI-2 Rev.2) — không có `ticket_id`, đo ingestion connector chứ không đo security finding |
| `tbl_fact_finding` category `SECURITY` (nguồn "review") | Bị loại ở OI-15 — quyết định cuối chỉ dùng `tbl_fact_security_scan` |
| Bảng `finding` legacy (`V1__init_schema.sql:141-156`) | Không còn liên quan, không có code nào dùng (V1 đã được thay bằng schema V4) |

## Source Limitations

- Không có wireframe/mockup cho vị trí chính xác của field trong
  `SecurityTicketDetailDrawer` — thứ tự hiển thị cụ thể để lại cho `impl-plan.md`.
- `docs/architecture/route-api-map.md` **không liệt kê** endpoint Security
  Dashboard (`grep` không ra kết quả) — tài liệu kiến trúc bị lỗi thời so với
  source code thực tế; đã xác nhận endpoint thật trực tiếp từ
  `SecurityDashboardController.java` thay vì từ tài liệu (đúng theo nguyên tắc
  "source code ưu tiên hơn tài liệu phụ trợ").
- Chưa đọc toàn văn `SecurityDashboardServiceTest.java`,
  `SecurityScanRepositoryAdapterTest.java` — chỉ xác nhận tồn tại, sẽ đọc chi
  tiết ở `impl-plan.md`/lúc viết test.
- Chưa xác nhận `tbl_fact_security_scan` có index phù hợp cho truy vấn
  `(ticket_id, scanner_type, collected_at)` hay không (xem Open Issues,
  `OI-INDEX`).

## Assumptions from Sources

- Giả định `tbl_fact_security_scan` tích lũy **nhiều bản ghi lịch sử** cho cùng
  `(ticket_id, scanner_type)` theo thời gian (không phải bị overwrite) — suy ra
  từ pattern `ORDER BY collected_at DESC LIMIT 1` dùng để lấy "bản ghi mới nhất"
  trong `SecurityDashboardJdbcAdapter.java:57-63`. Chưa xác minh bằng dữ liệu
  thực tế (chỉ suy luận từ cách code hiện tại truy vấn).

## Human Confirmation Required

- Xem `spec-pack.md` mục 17 (Assumptions) và mục 18 (Human Decisions Required)
  — điểm còn mở duy nhất là `H-SECFINDRES-4` / `OI-OPEN-CYCLE-MIX` (xử lý khi
  ticket có cycle đã đóng lẫn 1 open cycle cuối cùng).
