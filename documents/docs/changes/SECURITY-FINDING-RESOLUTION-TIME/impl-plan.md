# impl-plan

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (Principal Engineer prep)
**Update date**: 2026-08-17

---

## Phương châm implement

**Vấn đề cần quyết định** (đã được `ticket-rules.md`/`context.md` đánh dấu là
"Stop/Ask — không tự chọn rồi code thẳng"): đặt logic cycle-detection
(BR-2→BR-4) ở đâu — Service (Java, dễ unit test) hay Adapter/SQL (đúng phong
cách hiện tại của `SecurityDashboardJdbcAdapter`, khó unit test)?

**Phương án được chọn: KHÔNG phải 1 trong 2 phương án trên, mà là phương án
thứ 3 dung hòa cả hai** — trình bày rõ để không bị hiểu là "tự ý chọn 1 trong
2 rồi code thẳng":

| # | Phương án | Ưu điểm | Nhược điểm | Quyết định |
|---|---|---|---|---|
| A | Logic cycle viết bằng SQL (window function/CTE) trong `SecurityDashboardJdbcAdapter` | Đúng 100% phong cách hiện tại của file (mọi aggregation khác đều là SQL) | Khó unit test theo `40-testing.md` (phải test qua DB thật/Testcontainer, không mock được) | Không chọn |
| B | Logic cycle viết bằng Java trong `SecurityDashboardService`, thêm method mới vào `SecurityDashboardRepositoryPort` để lấy raw history | Dễ unit test (mock port) | Phá vỡ pattern hiện tại: `SecurityDashboardService.getTicketDetail` từ chỗ pass-through thuần túy trở thành có business logic, đồng thời `SecurityTicketDetail` phải được build lại 1 lần nữa ở Service sau khi Adapter đã trả về (record bất biến → phải unpack/rebuild 2 lần: Adapter rồi Service) | Không chọn |
| **C** | **Trích xuất thuật toán cycle-detection thành 1 class/method Java thuần túy, KHÔNG phụ thuộc Spring/DB** (`SecurityFindingResolutionTimeCalculator`, package `application/usecase/securitydashboard`), nhận `List<SecurityScanSnapshot>` (đã sort ASC theo `collected_at`) và trả về `String`. `SecurityDashboardJdbcAdapter.findTicketDetail(...)` tự query raw history (giống hệt cách nó đã tự query `scans`/`checklistSections`/`exceptions`) rồi **gọi thẳng** class thuần túy này để lấy `resolutionTime`, ghép vào `SecurityTicketDetail` cuối cùng — **giống hệt pattern hiện có** (Adapter tự assemble toàn bộ record) | **Giữ nguyên 100% pattern hiện có** (Adapter vẫn tự assemble, Service vẫn pass-through thuần túy, KHÔNG cần thêm method vào `SecurityDashboardRepositoryPort`) **và** logic tính toán vẫn unit-test được **không cần mock gì cả** (class thuần Java, instantiate trực tiếp, input/output rõ ràng) — tốt hơn cả yêu cầu tối thiểu của `40-testing.md` (mock port) vì đây là test đơn vị thật (pure function) | **được test dễ hơn nhưng nằm trong `infrastructure` gọi sang `application`** — hợp lệ theo `20-architecture.md` (`infrastructure` được phép phụ thuộc `application`, không phải chiều ngược lại) | **✅ CHỌN** |

Lý do chọn C là tối ưu nhất cho **"implementation tối thiểu và an toàn"**:
thay đổi ít file nhất (không đổi `SecurityDashboardRepositoryPort`, không đổi
`SecurityDashboardService`), rủi ro phá pattern thấp nhất, và đáp ứng đầy đủ
yêu cầu test mà không cần mock phức tạp.

---

## Danh sách file thay đổi

| file | thay đổi | lý do | AC liên quan |
|---|---|---|---|
| `EDCAP_BE/.../securitydashboard/SecurityDashboardModels.java` | Thêm record `SecurityScanSnapshot(int unresolvedCount, OffsetDateTime collectedAt)`; thêm field `resolutionTime` (kiểu `String`) vào cuối record `SecurityTicketDetail` | Cần kiểu dữ liệu raw cho lịch sử scan + field output mới | Tất cả AC-SECFINDRES-* |
| `EDCAP_BE/.../securitydashboard/SecurityFindingResolutionTimeCalculator.java` (mới) | Class thuần Java, static method `compute(List<SecurityScanSnapshot>)` | Thuật toán cycle-detection (BR-2→BR-6), tách riêng để unit test không cần mock | AC-SECFINDRES-1,2,3,7,8,9 |
| `EDCAP_BE/.../infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` | Trong `findTicketDetail(...)`: thêm 1 query raw history SAST; gọi `SecurityFindingResolutionTimeCalculator.compute(...)`; cập nhật **cả 2** nơi khởi tạo `SecurityTicketDetail` (header tạm dòng ~471-484: truyền placeholder `"-"`; record cuối dòng ~528-537: truyền giá trị tính được) | Giữ nguyên pattern "Adapter tự assemble toàn bộ" | AC-SECFINDRES-1,2,3,7,8,9 |
| `EDCAP_BE/.../web/dto/SecurityDashboardDtos.java` | `SecurityTicketDetailDto` thêm field `resolutionTime`; cập nhật `from(...)` | Expose field qua JSON | Tất cả |
| `EDCAP_FE/src/pages/security-dashboard/types.ts` | `SecurityTicketDetail` type thêm `resolutionTime: string` | FE type khớp BE | Tất cả |
| `EDCAP_FE/.../components/SecurityTicketDetailDrawer.tsx` | Thêm 1 dòng/khối hiển thị `detail.resolutionTime`, dùng `t("Pages.SecurityDashboard.drawer.resolutionTime")` | Hiển thị field | AC-SECFINDRES-4,5 |
| `EDCAP_FE/public/locales/en/locale.json` | Thêm key `Pages.SecurityDashboard.drawer.resolutionTime` = "Security Finding Resolution Time" | i18n EN | AC-SECFINDRES-4 |
| `EDCAP_FE/public/locales/vi/locale.json` | Thêm key tương ứng = "Thời gian xử lý finding bảo mật" | i18n VI | AC-SECFINDRES-4 |
| `EDCAP_FE/public/locales/ja/locale.json` | Thêm key tương ứng = "セキュリティ指摘解消時間" (literal UTF-8) | i18n JA | AC-SECFINDRES-4 |
| `EDCAP_BE/.../test/.../SecurityFindingResolutionTimeCalculatorTest.java` (mới) | Unit test thuật toán, không cần mock | Test BR-2→BR-6 | AC-SECFINDRES-1,2,3,7,8,9 |
| `EDCAP_BE/.../test/.../SecurityDashboardServiceTest.java` | *(Có thể không cần sửa — xem "Phương châm Test")* | | AC-SECFINDRES-6 |
| `EDCAP_FE/src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx` | Rà soát/mở rộng mock response ticket detail (nếu có) để có field mới; thêm test hiển thị | AC Closure (`40-testing.md`) | AC-SECFINDRES-5 |

**Không đổi**: `SecurityDashboardRepositoryPort.java`, `SecurityDashboardService.java`,
`SecurityDashboardController.java`, `lib/api.ts`, mọi migration DB.

---

## Các bước thay đổi

| step | action | target file | verification | stop condition |
|---|---|---|---|---|
| 1 | Thêm record `SecurityScanSnapshot` + field `resolutionTime` vào `SecurityTicketDetail` | `SecurityDashboardModels.java` | Compile OK (sẽ đỏ ở nơi khởi tạo — dự kiến, sửa ở step 3) | — |
| 2 | Tạo `SecurityFindingResolutionTimeCalculator` + unit test đầy đủ (BR-2→BR-6, AC liên quan) | `SecurityFindingResolutionTimeCalculator.java` + test mới | `mvn test -Dtest=SecurityFindingResolutionTimeCalculatorTest` xanh | Nếu 1 case AC không thể biểu diễn rõ ràng bằng thuật toán đã thiết kế → dừng, quay lại `open-issues.md` |
| 3 | Sửa `SecurityDashboardJdbcAdapter.findTicketDetail(...)`: thêm query raw history + gọi calculator + cập nhật 2 nơi khởi tạo record | `SecurityDashboardJdbcAdapter.java` | Compile OK toàn module | Nếu cột/tên bảng không khớp thực tế khi test tích hợp → dừng |
| 4 | Cập nhật `SecurityDashboardDtos.SecurityTicketDetailDto` + `from(...)` | `SecurityDashboardDtos.java` | Compile OK | — |
| 5 | Chạy `mvn clean verify` (bao gồm `ArchitectureTest`) | toàn `EDCAP_BE` | Xanh, `ArchitectureTest` không có exception mới | Nếu `ArchitectureTest` đỏ do vi phạm layer → dừng, xem lại vị trí đặt class |
| 6 | Cập nhật `types.ts` | `types.ts` | `npm run typecheck` xanh | — |
| 7 | Cập nhật `SecurityTicketDetailDrawer.tsx` | component | Chạy dev server, mở drawer thật kiểm tra thủ công | — |
| 8 | Thêm key vào **cả 3** file `locale.json` | 3 file | Đối chiếu key khớp nhau ở cả 3 ngôn ngữ | Nếu quên 1 file → dừng trước khi commit |
| 9 | Cập nhật/thêm test FE (`SecurityDashboardPage.test.tsx`) | test FE | `npm run test -- security-dashboard` xanh | — |
| 10 | Tự kiểm tra theo `review-checklist.md`, điền `self-review.md` | tài liệu | — | — |

---

## Ý định thay đổi theo class/function/method

| target | action | input | output | note |
|---|---|---|---|---|
| `SecurityDashboardModels.SecurityScanSnapshot` (record, mới) | Add | — | `(int unresolvedCount, OffsetDateTime collectedAt)` | Chỉ 2 field cần cho thuật toán (BR-2), không thêm field thừa |
| `SecurityDashboardModels.SecurityTicketDetail` (record) | Modify | — | Thêm field cuối: `String resolutionTime` | Append cuối để giảm rủi ro nhầm thứ tự tham số ở các nơi gọi khác (nếu có) |
| `SecurityFindingResolutionTimeCalculator.compute` (mới, `public static String`) | Add | `List<SecurityScanSnapshot> historyAscByCollectedAt` (giả định đã sort ASC theo `collectedAt`, method **không tự sort** — trách nhiệm sort thuộc caller/adapter, ghi rõ trong Javadoc) | `String` — `"HH:mm:ss"` (không giới hạn `HH`) hoặc `"-"` | Pseudocode: duyệt tuần tự, `cycleStart = null`; nếu `cycleStart == null && unresolvedCount > 0` → mở cycle; nếu `cycleStart != null && unresolvedCount == 0` → cộng `Duration.between(cycleStart, collectedAt).getSeconds()` vào tổng, đóng cycle (`cycleStart = null`); cuối vòng lặp: nếu tổng giây > 0 hoặc có ít nhất 1 cycle đã đóng → format `HH:mm:ss` thủ công (`totalSeconds/3600`, `%3600/60`, `%60`, dùng `String.format("%02d:%02d:%02d", h, m, s)` — **không** dùng `Duration.toString()`); ngược lại → `"-"` |
| `SecurityFindingResolutionTimeCalculator.formatDuration` (private static, helper) | Add | `long totalSeconds` | `String` `HH:mm:ss` | Tách riêng để test độc lập nếu cần (test > 99 giờ) |
| `SecurityDashboardJdbcAdapter.findTicketDetail` | Modify | `UUID ticketId` (không đổi chữ ký) | `Optional<SecurityTicketDetail>` (không đổi) | Thêm 1 block query mới (xem "Phương châm data/DB/query"), gọi calculator, truyền kết quả vào constructor record ở dòng cuối; dòng header tạm (đầu method) truyền literal `"-"` vì giá trị đó bị bỏ (chỉ lấy `ticketId/ticketKey/...` từ header) |
| `SecurityDashboardDtos.SecurityTicketDetailDto` + `.from(...)` | Modify | `SecurityTicketDetail d` | Thêm field `resolutionTime` | Giữ nguyên thứ tự các field khác, append cuối |
| `SecurityDashboardService`, `SecurityDashboardRepositoryPort`, `SecurityDashboardController` | **Không đổi** | — | — | Theo Phương án C đã chọn |

---

## Phương châm data/DB/query

**Ý định**: lấy toàn bộ lịch sử scan SAST của 1 ticket, sắp xếp theo thời gian
tăng dần, để `SecurityFindingResolutionTimeCalculator` duyệt tuần tự.

- **Table mục tiêu**: `tbl_fact_security_scan` (đã tồn tại, không migration).
- **Điều kiện WHERE**: `ticket_id = :ticketId AND scanner_type = 'SAST'`
  (đúng BR-1 — nguồn dữ liệu duy nhất).
- **ORDER BY**: `collected_at ASC` (**tăng dần** — khác hướng với hầu hết
  query "latest" khác trong cùng file, vốn dùng `DESC LIMIT 1`; đây là điểm
  cần review kỹ theo `review-checklist.md` §2.4).
- **Cột SELECT**: chỉ `unresolved_count`, `collected_at` — không cần
  `scanner_type`, `status`, `scan_status`, `severity`, hay các count breakdown
  khác (BR-1, tránh over-fetch).
- **Không có LIMIT**: cần toàn bộ lịch sử để tính tổng nhiều cycle (BR-4) —
  **rủi ro số lượng/performance**: nếu 1 ticket có rất nhiều commit được scan
  qua thời gian dài, số dòng trả về không giới hạn. Chưa có benchmark cụ thể;
  chấp nhận được cho quy mô dữ liệu hiện tại (đối chiếu `impact-analysis.md`),
  nhưng **cần `EXPLAIN` thực tế trước khi merge** nếu môi trường có dữ liệu
  lớn (`OI-INDEX`, `spec-pack.md` §17 — giữ nguyên chưa xác định).
- **Index**: chưa xác nhận có index nào hỗ trợ
  `(ticket_id, scanner_type, collected_at)`. Unique constraint hiện có
  (`uq_tbl_fact_security_scan_repo_commit_scanner` trên
  `repository_id, commit_sha, scanner_type`) **không** hỗ trợ trực tiếp
  pattern truy vấn này. **Không tự ý thêm migration index mới trong ticket
  này** (ngoài phạm vi spec-pack, cần phê duyệt riêng theo
  `.claude/rules/00-safety.md`) — nếu performance thực tế có vấn đề, đưa
  thành Open Issue / ticket riêng.
- **Transaction**: nằm trong cùng `@Transactional(readOnly = true)` hiện có
  của `SecurityDashboardService.getTicketDetail` — không cần transaction
  riêng (đọc thuần túy, cùng 1 lần gọi).

---

## Phương châm FE/BE contract

- **Additive only**: thêm field `resolutionTime: string` vào response JSON đã
  có của `GET /api/v1/security/dashboard/tickets/{ticketId}` — không đổi
  request, không đổi field khác, không đổi status code.
- **Không có endpoint mới, không đổi route.**
- **Xử lý lệch pha deploy**: nếu FE mới gọi BE cũ (chưa có field), giá trị sẽ
  là `undefined` — FE phải hiển thị fallback an toàn (vd. `"-"` hoặc ẩn dòng)
  thay vì crash. Nếu BE mới chạy trước FE mới, field thừa không ảnh hưởng FE
  cũ (bỏ qua field lạ).
- **DTO key**: `resolutionTime` (camelCase, đã chốt `H-SECFINDRES-1`).
- **`lib/api.ts` không đổi** — generic type tự áp dụng khi `types.ts` cập
  nhật.

---

## Phương châm Error/Validation/Logging

- **Không có input mới từ client** cho field này (chỉ dùng `ticketId` đã có
  sẵn trong request path) → không cần validation mới.
- **Không có exception mới**: nếu `findSecurityScanHistory`-query trả về danh
  sách rỗng, `SecurityFindingResolutionTimeCalculator.compute(List.of())`
  phải trả `"-"` một cách bình thường (không ném exception) — đây là hành vi
  **bắt buộc phải test** (AC-SECFINDRES-2).
- **Không thêm `ResponseEntity` status code tùy biến** trong
  `SecurityDashboardController` (giữ nguyên `30-security.md`).
- **Logging**: không bắt buộc thêm log mới theo spec. Nếu implement viên thấy
  cần log để điều tra (vd. log WARN khi phát hiện dữ liệu bất thường — ví dụ
  `collected_at` trùng nhau giữa 2 bản ghi), phải đảm bảo **không log toàn bộ
  payload finding**, chỉ log `ticketId` + thông tin tối thiểu
  (`ticket-rules.md` — không export PII/dữ liệu nhạy cảm ra log).

---

## Phương châm Test

- **Ưu tiên test thuật toán độc lập** (`SecurityFindingResolutionTimeCalculatorTest`)
  — test thuần Java, không cần Spring context, không cần mock, không cần DB.
  Bao phủ toàn bộ AC: 0 scan (`List.of()`), 1 open cycle, 1 cycle đã đóng,
  N cycle đã đóng (cộng dồn), N cycle đã đóng + 1 open cycle cuối,
  `unresolved_count` dao động không đơn điệu trong 1 cycle, tổng > 24 giờ
  (kiểm tra `HH` ≥ 3 chữ số nếu áp dụng).
- **`SecurityDashboardServiceTest.java`**: vì Phương án C không đổi
  `SecurityDashboardService`, **có thể không cần sửa file này** — xác nhận
  lại khi code xong (nếu behavior `getTicketDetail` không đổi chữ ký/logic ở
  tầng Service, test cũ vẫn xanh nguyên trạng, không cần thêm).
- **`SecurityDashboardJdbcAdapter`**: hiện chưa có test riêng (JDBC integration
  test, nếu dự án có Testcontainer/embedded DB cho adapter test khác — cần
  kiểm tra pattern integration test hiện có ở `impl-plan.md` bước code thực
  tế; nếu không có sẵn hạ tầng test tích hợp cho adapter này, coi việc test
  qua `SecurityFindingResolutionTimeCalculatorTest` (đã cô lập được phần khó
  test nhất) + review SQL thủ công là đủ cho ticket ở mức Standard).
- **FE**: mở rộng `SecurityDashboardPage.test.tsx` theo pattern có sẵn (mock
  `react-i18next`), thêm case: field hiển thị giá trị thật, field hiển thị
  `"-"`, label đổi theo ngôn ngữ. **Bắt buộc** verify mounted trên page thật
  (không test `SecurityTicketDetailDrawer` cô lập) — AC Closure,
  `40-testing.md`.
- **Không sửa assert của test hiện có** để né lỗi mới phát sinh.

---

## Phương châm Rollout/Rollback

- **Rollout**: additive, không cần thứ tự deploy đặc biệt bắt buộc, nhưng
  khuyến nghị deploy BE trước FE (để FE mới luôn nhận được field ngay, tránh
  phải xử lý `undefined`).
- **Không cần feature flag** (spec không yêu cầu, xác nhận trong
  `impact-analysis.md`).
- **Rollback**: revert commit/PR (BE + FE), không thao tác dữ liệu (read-only,
  không migration).
- **Không cần backfill dữ liệu** (tính toán on-the-fly).

---

## Gate trước implementation

Điều kiện phải thỏa trước khi bắt đầu code (implementation steps ở prompt
tiếp theo):

1. ✅ `spec-pack.md` không còn Open Issue/Human Decision nào ở trạng thái
   blocking (đã xác nhận ở phase trước).
2. ✅ Quyết định kiến trúc (Phương án C) đã được trình bày minh bạch ở file
   này — **thay thế** khuyến nghị "dừng lại hỏi" trong `ticket-rules.md`/
   `context.md` bằng 1 phương án cụ thể có lý do rõ ràng, không phải chọn đại
   1 trong 2 rồi code thẳng.
3. ⚠️ **Chưa thỏa — cần xác nhận trước khi merge (không nhất thiết trước khi
   bắt đầu code)**: `OI-INDEX` (index cho query mới), `OI-DATA-RETENTION`
   (dữ liệu thực tế trên staging đủ để test multi-cycle thật).
4. ⚠️ **Đề xuất cần người phụ trách xác nhận**: nâng Review Mode lên `Heavy`
   cho bước review contract (đã nêu ở `impact-analysis.md`) — không chặn việc
   bắt đầu code, nhưng ảnh hưởng độ kỹ của review sau khi có code.
5. Trước khi implement, đọc lại: `SecurityDashboardModels.java`,
   `SecurityDashboardJdbcAdapter.java` (đúng đoạn `findTicketDetail`, dòng
   446-538), `SecurityDashboardDtos.java`, `types.ts`,
   `SecurityTicketDetailDrawer.tsx`, và 3 file `locale.json` — đúng theo rule
   "trước khi implement, đọc source mục tiêu và test hiện có".
6. Nếu trong lúc code phát hiện điều gì mâu thuẫn với giả định ở đây (vd. cột
   không đúng tên, dữ liệu không như mô tả A-7 đã ghi ở `context.md`) → dừng
   lại, cập nhật `open-issues.md`, không tự sửa âm thầm.
