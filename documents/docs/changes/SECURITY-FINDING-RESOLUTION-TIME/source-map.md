# Source Map

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (Tech Lead prep)
**Update date**: 2026-08-17

## Target Area

Bổ sung field `resolutionTime` vào chi tiết ticket của Security Dashboard,
tính từ lịch sử `tbl_fact_security_scan` (SAST). Vùng tác động: 1 bảng DB (chỉ
đọc), 1 domain hexagonal đầy đủ (`securitydashboard`), 1 component FE, 3 file
i18n. Không có bảng/endpoint/màn hình mới.

## Entry Points

| entry | path | note |
|---|---|---|
| REST endpoint (đã có, mở rộng response) | `GET /api/v1/security/dashboard/tickets/{ticketId}` — `SecurityDashboardController.ticketDetail(...)` (`web/rest/SecurityDashboardController.java:91-99`) | Không đổi route, không đổi permission gate |
| FE hiển thị | `SecurityTicketDetailDrawer` (`pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx`) | Nhận `detail: SecurityTicketDetail` qua props, không tự fetch |
| FE fetch | `endpoints.securityDashboard.ticketDetail(ticketId)` (`lib/api.ts:1378-1379`) | Không cần sửa — generic type |

## Call Flow

| caller | callee | note |
|---|---|---|
| `SecurityDashboardController.ticketDetail` | `SecurityDashboardService.getProjectIdForTicket(ticketId)` | Lấy projectId để check quyền |
| `SecurityDashboardController.ticketDetail` | `SecurityDashboardService.requireSecurityAccess(caller, projectId)` | Permission gate — ném `ForbiddenException` nếu không đủ quyền |
| `SecurityDashboardController.ticketDetail` | `SecurityDashboardService.getTicketDetail(ticketId)` | Trả `SecurityTicketDetail`, ném `NotFoundException` nếu ticket không tồn tại |
| `SecurityDashboardService.getTicketDetail` | `SecurityDashboardRepositoryPort.findTicketDetail(ticketId)` | Port interface — implement bởi `SecurityDashboardJdbcAdapter` |
| `SecurityDashboardJdbcAdapter.findTicketDetail` | 3 query JDBC con hiện có: header (`tbl_dim_ticket`/`tbl_dim_project`/`tbl_fact_safety_pack_status`), `scans` (`tbl_fact_security_scan` — `DISTINCT ON scanner_type ... ORDER BY collected_at DESC`, chỉ lấy **1 bản ghi mới nhất/loại scanner**), `checklistSections`, `exceptions` | **Chưa có** query lấy **toàn bộ lịch sử** `tbl_fact_security_scan` theo `ticket_id + scanner_type='SAST'` sắp `collected_at ASC` — đây là query **mới cần thêm** cho ticket này |
| `SecurityDashboardController.ticketDetail` | `SecurityDashboardDtos.SecurityTicketDetailDto.from(SecurityTicketDetail)` | Map model → DTO trả JSON |
| (mới, dự kiến) `SecurityDashboardService` hoặc `SecurityDashboardJdbcAdapter` | Hàm cycle-detection mới (chưa tồn tại, cần viết) | Xem `context.md` "Chú ý khi implement" #2 để quyết định đặt ở tầng nào |
| FE: `SecurityTicketDetailDrawer` | `t("Pages.SecurityDashboard.drawer.xxx")` (`react-i18next`) | Đúng pattern label hiện có (dòng 68, 108, 138 của file) |

## Data Flow

```
tbl_fact_security_scan (Postgres, scanner_type='SAST', nhiều row theo thời gian
  cho cùng ticket_id, cột dùng: ticket_id, unresolved_count, collected_at)
        │  SELECT ... ORDER BY collected_at ASC   ← query MỚI cần thêm
        ▼
[cycle-detection: duyệt tuần tự, xác định detected/resolved scan mỗi cycle]
        │  BR-2/BR-3 (spec-pack.md §5.2)
        ▼
resolutionTime: String  (tổng các cycle đã đóng, format "HH:mm:ss" hoặc "-")
        │
        ▼
SecurityDashboardModels.SecurityTicketDetail (record, application layer)
        │  SecurityDashboardDtos.SecurityTicketDetailDto.from(...)
        ▼
JSON response  GET /api/v1/security/dashboard/tickets/{ticketId}
        │  api.get<SecurityTicketDetail>(...)  (lib/api.ts, không đổi)
        ▼
FE type SecurityTicketDetail (types.ts) → props.detail.resolutionTime
        │
        ▼
SecurityTicketDetailDrawer.tsx → hiển thị + t("Pages.SecurityDashboard.drawer.<key mới>")
        │
        ▼
public/locales/{en,vi,ja}/locale.json → label 3 ngôn ngữ
```

**Cột KHÔNG nằm trong data flow này (dễ nhầm — xem `context.md` Mapping):**
`status` (run_status), `scan_status` (business status), `finding_count`,
`critical_count/high_count/medium_count/low_count/info_count`, `severity`.

## Test Map

| test file | path | liên quan |
|---|---|---|
| `SecurityDashboardServiceTest.java` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/` | Mở rộng nếu logic cycle đặt ở Service — mock `SecurityDashboardRepositoryPort` |
| `SecurityScanRepositoryAdapterTest.java` | `EDCAP_BE/src/test/java/com/sdd/platform/infrastructure/persistence/adapter/` | **Không liên quan** — test cho adapter ghi (write-side, MyBatis), khác `SecurityDashboardJdbcAdapter` |
| `SecurityEvidenceControllerIntegrationTest.java` | `EDCAP_BE/src/test/IntegrationTest/java/com/sdd/platform/web/rest/` | Cùng domain dữ liệu (`tbl_fact_security_scan`) nhưng test luồng ingest, không phải dashboard — tham khảo, không sửa |
| `SecurityDashboardPage.test.tsx` | `EDCAP_FE/src/__ tests __/security-dashboard/` | Pattern chuẩn cho FE test — mock `react-i18next`, `MemoryRouter`, `QueryClientProvider` |
| (mới, cần tạo) test cho cycle-detection | Vị trí tùy quyết định impl-plan (Service test hoặc Adapter test) | Case: 0 scan, 1 open cycle, 1 cycle đóng, N cycle đóng, N cycle đóng + 1 open cuối, > 24h |
| (mới, cần tạo) test FE hiển thị field | `SecurityTicketDetailDrawer.test.tsx` (chưa tồn tại) hoặc mở rộng `SecurityDashboardPage.test.tsx` | Giá trị thật, giá trị `"-"`, label 3 ngôn ngữ |

## ⚠️ Phát hiện quan trọng (đã xác minh, KHÔNG còn là "unknown")

**`V231__dedupe_security_evidence_upsert.sql` đã được đọc toàn văn** —
phát hiện ảnh hưởng trực tiếp tới giả định nền tảng `A-7` của `spec-pack.md`:

- Migration này (1) xóa bản ghi trùng lặp và (2) thêm **UNIQUE constraint**:
  `uq_tbl_fact_security_scan_repo_commit_scanner` trên
  `(repository_id, commit_sha, scanner_type)`.
- **Hệ quả**: `tbl_fact_security_scan` **không** tích lũy vô hạn 1 row/lần
  scan (1 row/CI run) như mô tả ban đầu ở `spec-pack.md` §5.1 ("Security Scan
  = 1 bản ghi... thường gắn với 1 CI run"). Thực tế: **tối đa 1 row cho mỗi
  `(repository_id, commit_sha, scanner_type)`** — nếu CI chạy lại scan trên
  **cùng 1 commit**, kết quả sẽ **upsert đè lên row cũ** (không tạo row mới),
  do tầng ingest (`SecurityEvidenceIngestService`/
  `GithubSecurityEvidenceSnapshotService`, chưa đọc chi tiết) phải tôn trọng
  unique constraint này.
- **Lịch sử theo thời gian (nhiều `collected_at` khác nhau) chỉ tồn tại khi
  ticket có nhiều COMMIT khác nhau được scan** (mỗi commit mới → 1 row mới,
  vì `commit_sha` khác). Nếu ticket chỉ có 1 commit duy nhất được scan nhiều
  lần (re-run CI không đổi code), sẽ **chỉ có 1 row duy nhất** — theo BR-2/BR-3
  của spec-pack, trường hợp này sẽ là "1 cycle open" hoặc "0 cycle" tùy giá trị
  `unresolved_count` cuối cùng, **không thể** vừa có "detected" vừa có
  "resolved" từ cùng 1 row.
- **Điều này không phá vỡ công thức đã chốt** (vẫn dùng `unresolved_count` +
  `collected_at` theo đúng BR-2/BR-3), nhưng **làm rõ lại ngữ nghĩa "cycle"**:
  1 cycle thực chất phản ánh **chuỗi commit/PR** dẫn tới việc finding được
  fix ở 1 commit sau đó, không phải "scan lại nhiều lần trên cùng code".
- **Khuyến nghị**: cập nhật `spec-pack.md` §5.1 (Terminology, định nghĩa
  "Security Scan") và §16 (Assumptions, `A-7`) để phản ánh phát hiện này ở lần
  chỉnh sửa tiếp theo — **ngoài phạm vi 3 file được giao trong task này**, chỉ
  ghi nhận ở đây để không bị thất lạc thông tin.

## Unknown Source Areas

- **Chưa xác nhận** `tbl_fact_security_scan` có index nào hỗ trợ truy vấn
  `WHERE ticket_id = ? AND scanner_type = 'SAST' ORDER BY collected_at` hay
  không — chỉ thấy `idx_connector_run_connector_time` (bảng khác) và
  `idx_security_finding_status` (bảng `tbl_fact_security_finding`, cũng khác)
  qua grep migration. Unique constraint mới tìm thấy
  (`uq_tbl_fact_security_scan_repo_commit_scanner`) tạo index ngầm trên
  `(repository_id, commit_sha, scanner_type)` — **không** khớp pattern truy
  vấn cần cho ticket này (`ticket_id, scanner_type, collected_at`). Chưa
  `EXPLAIN` thực tế trên DB. → `OI-INDEX` (spec-pack §17).
- **Chưa đọc** `SecurityEvidenceIngestService`/
  `GithubSecurityEvidenceSnapshotService` (tầng ghi dữ liệu vào
  `tbl_fact_security_scan`) để xác nhận chính xác cơ chế upsert theo unique
  constraint trên hoạt động thế nào (insert-or-update theo commit_sha) — nên
  đọc ở `impl-plan.md` nếu cần hiểu sâu hơn cơ chế ghi, dù không bắt buộc cho
  việc code phần đọc (read-only) của ticket này.
- **Chưa đọc toàn văn** `SecurityDashboardDtos.java` phần còn lại ngoài
  `SecurityTicketDetailDto` (đã đọc đủ cho ticket này, phần khác không liên
  quan).
- **Chưa grep toàn bộ package `util/`** của `EDCAP_BE` để xác nhận 100% không
  có sẵn helper format duration `HH:mm:ss` không giới hạn giờ — kết luận hiện
  tại ("chưa có") dựa trên các file đã đọc, không phải quét toàn bộ codebase.
- **Chưa đọc** `vi/locale.json` phần `drawer` (chỉ xác nhận `SecurityDashboard`
  tồn tại ở dòng 1018) — cần đọc trước khi thêm key mới để giữ đúng văn phong
  tiếng Việt hiện có.
