# Ticket Rules

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (Tech Lead prep)
**Update date**: 2026-08-17

## Must Follow

- Không thêm specification nào ngoài `spec-pack.md` (nguồn đúng duy nhất).
  Điểm mơ hồ mới phát sinh khi implement → ghi vào `open-issues.md`, KHÔNG tự
  quyết định.
- Đọc `context.md` và `source-map.md` (file này cùng thư mục) trước khi sửa
  bất kỳ file source nào — 2 file đó liệt kê chính xác method/cột/pattern tồn
  tại và không tồn tại.
- Bám sát pattern hexagonal hiện có của chính domain Security Dashboard
  (Service mỏng → Port interface → JDBC Adapter dùng
  `NamedParameterJdbcTemplate` + SQL text block → Controller → DTO record với
  `from(...)` factory). Xem `source-map.md` để biết chính xác method nào gọi
  method nào.
- Nguồn dữ liệu **duy nhất**: `tbl_fact_security_scan`, lọc
  `scanner_type = 'SAST'`, theo `ticket_id` (cột có sẵn trực tiếp trên bảng).
  Chỉ dùng 2 cột: `unresolved_count` (xác định cycle) và `collected_at` (mốc
  thời gian). Không dùng cột nào khác của bảng này cho field mới.
- Business rule bắt buộc tuân theo `spec-pack.md` §5.2 (BR-1 → BR-7): duyệt
  lịch sử scan theo `collected_at` tăng dần, xác định các "cycle" (mở khi
  `unresolved_count` chuyển 0→>0, đóng khi lần đầu quay lại =0), cộng dồn
  **tất cả cycle đã đóng**, bỏ qua open cycle cuối cùng (đã xác nhận
  `H-SECFINDRES-4`), hiển thị `HH:mm:ss` không giới hạn giờ ở 24, hoặc `"-"`
  nếu không có cycle nào đã đóng.
- `SecurityTicketDetail` là Java **record** (bất biến) — khi thêm field, phải
  cập nhật **đồng thời**: định nghĩa record
  (`SecurityDashboardModels.java:123-135`) + **cả 2** vị trí khởi tạo record
  trong `SecurityDashboardJdbcAdapter.findTicketDetail(...)`.
- Constructor injection cho mọi Service/Adapter/Controller mới hoặc bị sửa
  (`10-style.md`) — không `@Autowired` field injection.
- `@Transactional(readOnly = true)` bắt buộc cho method Service đọc dữ liệu
  (giữ nguyên pattern hiện có của `SecurityDashboardService`).
- DTO record + static `from(Model m)` factory — đúng 100% pattern
  `SecurityDashboardDtos.java` hiện có, không dùng thư viện mapping khác.
- Exception dùng lại `ForbiddenException` (`application.exception`) và
  `NotFoundException` (`domain.exception`) — không tạo class exception mới,
  không thêm `ResponseEntity` status code tùy biến trong controller
  (`30-security.md`).
- FE: named export, không default export (`10-style.md`); type mới thêm vào
  `SecurityTicketDetail` trong `types.ts`; mọi call API qua `lib/api.ts`
  (không cần sửa file này — generic type tự động áp dụng).
- i18n: thêm key mới **đồng thời ở cả 3 file**
  `public/locales/{en,vi,ja}/locale.json`, dưới nhánh
  `Pages.SecurityDashboard.drawer`, namespace `locale` (không tạo namespace
  mới, không tạo file locale mới).
- Business code value phải dùng enum/constant có sẵn (`Set<String>` hằng số
  kiểu `SAST_STATUSES` trong `SecurityDashboardService`, hoặc enum DB
  `run_status`/`severity_level`/`finding_status`) thay vì magic string — tuy
  nhiên field này **không dùng bất kỳ enum trạng thái nào** (chỉ dùng
  `unresolved_count` dạng số), nên không cần thêm enum mới.
- Kiểm tra full-width/half-width khi format số hiển thị: giữ nguyên chữ số
  ASCII (half-width) cho `HH:mm:ss`, không chuyển sang ký tự full-width kiểu
  Nhật (vd. không dùng `：` full-width colon) — xem mục "Rule đặc thù i18n"
  bên dưới.
- Không export secret/PII vào log — tính năng này không xử lý dữ liệu nhạy
  cảm, nhưng nếu thêm logging debug, không log toàn bộ payload ticket.

## Must Not Do

- Không tạo bảng/cột/migration DB mới.
- Không dùng `tbl_fact_security_finding`, `tbl_connector_run`,
  `tbl_fact_finding` (category `SECURITY`) làm nguồn dữ liệu — cả 3 đã bị loại
  qua các vòng quyết định trước (xem `00_brainstorm.md` Phụ lục).
- Không đọc/dùng cột `resolved_at`/`detected_at` cho bảng
  `tbl_fact_security_scan` — bảng này **không có** 2 cột đó (chúng thuộc bảng
  khác đã bị loại khỏi scope).
- Không nhầm cột `status` (`run_status` enum — trạng thái CHẠY của scan job)
  với cột `scan_status` (VARCHAR business status PASS/WARNING/FAIL/MISSING) —
  cả hai đều **không** dùng cho field này; chỉ dùng `unresolved_count`.
- Không tạo endpoint mới — field bổ sung vào response
  `GET /api/v1/security/dashboard/tickets/{ticketId}` đã có sẵn.
- Không dùng MyBatis Mapper (`SecurityScanMapper`)/`SecurityScanRepositoryAdapter`
  cho phần đọc — đó là adapter **ghi** (write-side ingest), khác hoàn toàn
  domain đọc-dashboard của ticket này dù cùng chạm bảng
  `tbl_fact_security_scan`.
- Không dùng `Duration.toString()`/`Duration.format()` mặc định của Java để
  tạo chuỗi `HH:mm:ss` — cho ra sai định dạng (`"PT27H30M"`).
- Không dùng `@Data` Lombok trên domain model — dùng
  `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor`.
- Không gọi `fetch` trực tiếp ở FE, không dùng `any` không có comment
  `// reason:` (`10-style.md`).
- Không thêm ngưỡng SLA/cảnh báo màu sắc — ngoài phạm vi đã chốt (`OI-6`,
  deferred).
- Không thêm biểu đồ/trend theo thời gian — chỉ 1 giá trị scalar/ticket.
- Không bịa ra method/API chưa tồn tại — xem danh sách đầy đủ trong
  `context.md` mục "Method tồn tại / method không tồn tại".
- Không sửa `SecurityDashboardController.ticketDetail(...)` logic gọi (chỉ
  DTO/Model/Adapter thay đổi, route/permission-gate giữ nguyên).
- Không amend/sửa các test có sẵn (`SecurityDashboardServiceTest.java`,
  `SecurityScanRepositoryAdapterTest.java`) để che giấu lỗi mới — chỉ thêm
  test case mới.

## Stop / Ask Conditions

- Nếu cần chọn giữa "logic cycle-detection đặt ở Service (Java)" vs "đặt trong
  SQL của Adapter" (xem `context.md` mục "Chú ý khi implement" #2) mà chưa có
  quyết định rõ trong `impl-plan.md` → **dừng lại, hỏi Tech Lead/PM**, không tự
  chọn hướng rồi code thẳng — ảnh hưởng khả năng unit test theo `40-testing.md`.
- **Đã xác nhận** (đọc `V231__dedupe_security_evidence_upsert.sql`):
  `tbl_fact_security_scan` có UNIQUE constraint
  `(repository_id, commit_sha, scanner_type)` — scan lại **cùng 1 commit** sẽ
  upsert đè row cũ, KHÔNG tạo row mới. Lịch sử nhiều row chỉ có khi ticket có
  **nhiều commit khác nhau** được scan. Nếu khi implement phát hiện dữ liệu
  thực tế không khớp mô tả này (ví dụ vẫn thấy nhiều row cho cùng
  `repository_id + commit_sha + scanner_type`) → **dừng lại ngay**, báo cáo
  mâu thuẫn, không tự suy diễn thêm.
- Nếu cần định dạng số giờ ≥ 100 (3 chữ số) cho `HH:mm:ss` mà chưa rõ có cần
  padding/giới hạn hiển thị hay không → hỏi trước khi code cứng.
- Nếu không tìm thấy index phù hợp cho truy vấn
  `(ticket_id, scanner_type, collected_at)` trên `tbl_fact_security_scan`
  (`OI-INDEX`, spec-pack §17) và số lượng bản ghi lịch sử lớn → hỏi trước khi
  quyết định có cần thêm migration index mới (lưu ý: thêm migration **cần
  phê duyệt riêng** theo `.claude/rules/00-safety.md`).
- Nếu cách nối field mới vào `SecurityTicketDetailDrawer.tsx` yêu cầu đổi
  layout/thứ tự hiển thị đáng kể (không chỉ thêm 1 dòng/1 block) → hỏi trước
  vì không có wireframe cho ticket này (spec-pack §14).

## Review Focus

- `SecurityTicketDetail` record được cập nhật đủ ở **cả 2 nơi khởi tạo**
  trong `SecurityDashboardJdbcAdapter.findTicketDetail(...)`, không chỉ 1 nơi.
- Truy vấn lịch sử scan mới không tạo N+1 nghiêm trọng (1 query bổ sung cho
  1 ticket là chấp nhận được, đã có 3 query con tương tự).
- Định dạng `HH:mm:ss` được test với giá trị > 24 giờ để chắc chắn không dùng
  API format sai (`Duration.toString()`).
- Logic duyệt cycle dùng `ORDER BY collected_at ASC` (tăng dần) — **khác
  hướng** với hầu hết query "latest" khác trong cùng file (`DESC LIMIT 1`), dễ
  bị copy nhầm hướng sắp xếp khi review nhanh.
- Cả 3 file `locale.json` (en/vi/ja) có key mới, nội dung tiếng Nhật giữ
  nguyên literal UTF-8 (không phải `\uXXXX`), không tạo namespace mới.
- Không có migration DB mới trong diff.
- Permission gate (`requireSecurityAccess`) vẫn được gọi trước khi trả field
  mới — không bị bypass do refactor.
- Business rule cycle-detection: kiểm tra case `unresolved_count` dao động
  không đơn điệu (3→1→2→0) vẫn tính đúng là 1 cycle.
- Không có code nào đọc cột `resolved_at`/`detected_at` trên
  `tbl_fact_security_scan` (không tồn tại — nếu xuất hiện là bug/hallucination).

## Test Focus

- Unit test logic cycle (dù đặt ở Service hay Adapter) theo đúng
  AC-SECFINDRES-1, 2, 3, 7, 8, 9 (`spec-pack.md` §6): 0 scan, 1 open cycle
  (0 cycle đóng), 1 cycle đã đóng, N cycle đã đóng cộng dồn, N cycle đã đóng +
  1 open cycle cuối (bỏ qua open cycle), > 24 giờ.
- Nếu logic đặt ở Service: mock `SecurityDashboardRepositoryPort` (theo pattern
  `SecurityDashboardServiceTest.java`), không mock domain record trực tiếp
  làm "dữ liệu giả" — record instantiation là dữ liệu thật theo `40-testing.md`.
- FE test theo pattern `SecurityDashboardPage.test.tsx` (mock `react-i18next`
  trả `defaultValue` nếu có) — verify field **thực sự mounted** trên trang
  Security Dashboard thật (`MemoryRouter` + `QueryClientProvider`), không chỉ
  test component `SecurityTicketDetailDrawer` cô lập (AC Closure,
  `40-testing.md`).
- Test giá trị `"-"` khi chưa có cycle đã đóng, kể cả khi có 1 open cycle đang
  chạy dở.
- Test đa ngôn ngữ: label hiển thị đúng theo `en`/`vi`/`ja` khi đổi ngôn ngữ.
