# impact-analysis

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (Principal Engineer prep)
**Update date**: 2026-08-17

---

## Tổng quan thay đổi

Thêm 1 field mới `resolutionTime` vào response của
`GET /api/v1/security/dashboard/tickets/{ticketId}` (`SecurityTicketDetail`),
tính từ lịch sử `tbl_fact_security_scan` (`scanner_type='SAST'`) theo mô hình
"cycle" cộng dồn (BR-1→BR-7, `spec-pack.md` §5.2). Hiển thị field này trong
`SecurityTicketDetailDrawer.tsx`. Không có DB migration, không có endpoint
mới — đây là **additive change** trên 1 API/1 UI component đã tồn tại.

---

## Ảnh hưởng trực tiếp

| file | reason | change type |
|---|---|---|
| `EDCAP_BE/.../securitydashboard/SecurityDashboardModels.java` | `SecurityTicketDetail` record cần thêm field `resolutionTime`; cần thêm 1 record mới cho raw scan snapshot (vd. `SecurityScanSnapshot`) | Modify + Add |
| `EDCAP_BE/.../port/out/persistence/SecurityDashboardRepositoryPort.java` | Thêm method mới lấy lịch sử scan SAST theo ticket (nếu chọn đặt logic cycle ở Service — xem `impl-plan.md` §2/§3) | Modify |
| `EDCAP_BE/.../infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` | Implement method port mới (query raw history); sửa **2 nơi khởi tạo** `SecurityTicketDetail` trong `findTicketDetail(...)` | Modify |
| `EDCAP_BE/.../application/usecase/securitydashboard/SecurityDashboardService.java` | Thêm logic cycle-detection (nếu đặt ở Service) + helper format `HH:mm:ss` | Modify |
| `EDCAP_BE/.../web/dto/SecurityDashboardDtos.java` | `SecurityTicketDetailDto` thêm field `resolutionTime` + cập nhật `from(...)` | Modify |
| `EDCAP_FE/src/pages/security-dashboard/types.ts` | `SecurityTicketDetail` type thêm `resolutionTime: string` | Modify |
| `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx` | Thêm 1 block/dòng hiển thị field mới | Modify |
| `EDCAP_FE/public/locales/en/locale.json` | Thêm key mới dưới `Pages.SecurityDashboard.drawer` | Modify |
| `EDCAP_FE/public/locales/vi/locale.json` | Thêm key mới (đồng bộ) | Modify |
| `EDCAP_FE/public/locales/ja/locale.json` | Thêm key mới (đồng bộ), giữ literal UTF-8 | Modify |

---

## Ảnh hưởng gián tiếp

| file | reason | risk |
|---|---|---|
| `EDCAP_BE/.../test/.../securitydashboard/SecurityDashboardServiceTest.java` | Cần thêm test case cho logic cycle mới (nếu đặt ở Service) | Thấp — chỉ thêm test, không sửa test cũ |
| `EDCAP_FE/src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx` | `SecurityDashboardPage.tsx` lấy detail qua `useQuery` gọi thẳng `endpoints.securityDashboard.ticketDetail(...)` (dòng 189-193), không có object literal `SecurityTicketDetail` nào được construct thủ công trong page — **đã xác minh bằng Grep** (`SecurityTicketDetail` chỉ xuất hiện ở 4 file: `types.ts`, `SecurityTicketDetailDrawer.tsx`, `SecurityDashboardPage.tsx`, `lib/api.ts`) | Thấp — nếu test file mock response JSON thô (không import type), thiếu field không gây lỗi compile, chỉ cần đảm bảo mock đủ field để test hiển thị field mới hoạt động đúng |
| `SecurityDashboardRepositoryPort` — các implementation khác (nếu có) | Thêm method mới vào interface bắt buộc mọi class implement phải có method đó | Thấp — chỉ có 1 implementation (`SecurityDashboardJdbcAdapter`), đã xác nhận qua grep |
| `docs/changes/SECURITY-DASHBOARD/*` (ticket cha) | Field mới thuộc phạm vi dashboard đã có — không sửa file của ticket đó, nhưng nên ghi chú liên kết | Thấp — chỉ tài liệu, không phải code |

---

## Ảnh hưởng FE

- **Type**: `SecurityTicketDetail` (`types.ts:97-108`) thêm field bắt buộc
  `resolutionTime: string`. **Đã xác minh bằng Grep** (`SecurityTicketDetail`
  trong `EDCAP_FE/src`): chỉ 4 file tham chiếu — `types.ts` (định nghĩa),
  `SecurityTicketDetailDrawer.tsx` (dùng qua props), `SecurityDashboardPage.tsx`
  (dùng qua `useQuery`/`endpoints.securityDashboard.ticketDetail(...)`, không
  construct object thủ công), `lib/api.ts` (định nghĩa generic type param).
  → **Không có nơi nào khác tự construct object literal kiểu này** — rủi ro
  "vỡ compile TypeScript ở nơi khác" nêu ở phase trước **không áp dụng** cho
  codebase hiện tại.
- **Component**: `SecurityTicketDetailDrawer.tsx` thêm 1 khối/dòng hiển thị,
  không đổi 3 khối hiện có (Scans/Checklist/Exceptions), không đổi props.
- **i18n**: 3 file `locale.json` (en/vi/ja) — không tạo namespace/route mới.
- **Không ảnh hưởng** routing, state Redux/Zustand (field chỉ đọc qua props
  TanStack Query hiện có, không cần store mới).
- **Không ảnh hưởng** `lib/api.ts` (generic type tự áp dụng).

---

## Ảnh hưởng BE/API

- **Endpoint không đổi**: `GET /api/v1/security/dashboard/tickets/{ticketId}`
  — cùng route, cùng permission gate (`requireSecurityAccess`), chỉ thêm field
  trong response body.
- **Backward compatible**: additive field — client cũ (nếu có) bỏ qua field
  lạ, không lỗi. Client mới cần field này phải deploy đồng bộ FE/BE hoặc chấp
  nhận `undefined` tạm thời khi lệch pha deploy (xem "Ảnh hưởng Rollout").
- **Service layer**: `SecurityDashboardService.getTicketDetail(ticketId)`
  — logic bên trong thay đổi (thêm bước tính cycle) nhưng chữ ký method giữ
  nguyên.
- **Không ảnh hưởng** các endpoint khác của `SecurityDashboardController`
  (`/access`, `/options`, `/summary`, `/tickets`, `/export`) — không đọc/tính
  `resolutionTime` ở các endpoint đó (đã xác nhận qua đọc toàn văn
  controller).

---

## Ảnh hưởng DTO/Schema/Validation

- `SecurityTicketDetailDto` (`SecurityDashboardDtos.java:169-195`) thêm field
  `resolutionTime` (kiểu `String`, đã format sẵn `HH:mm:ss` hoặc `"-"`).
- Không có validation input mới (field là output thuần túy, không có input
  từ client cho field này).
- Không đổi DTO nào khác trong `SecurityDashboardDtos.java`.
- Kiểu dữ liệu: `String` thay vì `Duration`/`Long` (số giây) — quyết định vì
  format `HH:mm:ss` không giới hạn giờ đã chốt cần custom formatter, xuất ra
  string sẵn tránh FE phải tự format lại (giảm rủi ro sai lệch định dạng giữa
  các nơi gọi, tuy đây là judgment call của impl-plan, không phải quyết định
  đã có trong spec-pack — ghi vào `impl-plan.md` §7 làm rõ).

---

## Ảnh hưởng DB/Migration

- **Không có migration mới.**
- Chỉ thêm 1 câu `SELECT` mới (đọc lịch sử scan) trên bảng
  `tbl_fact_security_scan` đã tồn tại — không `INSERT`/`UPDATE`/`DELETE`.
- **Rủi ro performance chưa xác định**: chưa có index xác nhận cho pattern
  truy vấn `WHERE ticket_id = ? AND scanner_type = 'SAST' ORDER BY
  collected_at` (`OI-INDEX`, vẫn mở). Có `UNIQUE constraint
  (repository_id, commit_sha, scanner_type)` (`V231`) nhưng không tạo index
  hỗ trợ trực tiếp cho truy vấn theo `ticket_id`. Cần `EXPLAIN` thực tế trước
  khi merge nếu bảng lớn (đề xuất ở `impl-plan.md` §6/§12).

---

## Ảnh hưởng Batch/Job/Event/External IF

- **Không ảnh hưởng.** Tính năng đọc thuần túy, tính toán on-the-fly khi gọi
  API detail — không có job/cron/queue/webhook nào liên quan.
- Không ảnh hưởng luồng ingest (`SecurityEvidenceIngestService`,
  `GithubSecurityEvidenceSnapshotService`, `SecurityScanRepositoryAdapter`) —
  đây là adapter **ghi**, hoàn toàn tách biệt khỏi thay đổi đọc-dashboard này
  (xác nhận: không có file nào trong nhóm ghi nằm trong danh sách "Ảnh hưởng
  trực tiếp"/"gián tiếp" ở trên).

---

## Ảnh hưởng Test

- **Test hiện có cần rà soát** (không sửa nội dung assert cũ, chỉ mở rộng nếu
  cần do thêm field bắt buộc vào type/record):
  - `SecurityDashboardServiceTest.java` — nếu thêm method port mới, các test
    hiện có mock `SecurityDashboardRepositoryPort` bằng `Mockito.mock(...)`
    (mock toàn interface) nên **không cần sửa** test cũ (Mockito tự trả
    `null`/default cho method chưa được stub, các test cũ không gọi
    `getTicketDetail` nên không bị ảnh hưởng — cần xác nhận cụ thể khi code).
  - `SecurityDashboardPage.test.tsx` — cần rà soát có fixture/mock response
    ticket detail nào cần thêm field `resolutionTime` để tránh lỗi TypeScript
    hoặc hiển thị `undefined` không mong muốn.
- **Test mới cần thêm**: cycle-detection (0 scan, 1 open cycle, 1 cycle đóng,
  N cycle đóng, N cycle đóng + 1 open cycle cuối, > 24h, dao động không đơn
  điệu) — chi tiết ở `spec-pack.md` §6 (AC) và `review-checklist.md` §8.
- **Không ảnh hưởng** `SecurityScanRepositoryAdapterTest.java` (write-side,
  không liên quan).

---

## Ảnh hưởng Operation/Monitoring

- Không có log/metric mới bắt buộc theo spec (tính năng đọc đơn giản).
- Không có thay đổi cấu hình (`application.yml`, feature flag) theo spec hiện
  tại.
- **Rủi ro hiệu năng vận hành**: nếu 1 ticket có rất nhiều commit/scan lịch
  sử, thời gian tính cycle (vòng lặp Java, nếu đặt ở Service) hoặc thời gian
  query (nếu đặt ở SQL) tăng theo số bản ghi — chưa có benchmark, đánh giá
  định tính là chấp nhận được cho quy mô dữ liệu hiện tại của dự án (đối
  chiếu với các query khác trong cùng file vốn cũng không giới hạn số dòng
  lịch sử một cách tường minh).

---

## Ảnh hưởng Rollout/Rollback

- **Rollout**: additive change — có thể rollout BE trước, FE sau (BE trả field
  thừa, FE cũ bỏ qua) hoặc ngược lại (FE mới cần field từ BE cũ — trong
  trường hợp này FE sẽ nhận `undefined`, cần FE code không crash khi field
  rỗng — đưa vào `impl-plan.md` §7 làm rõ cách FE xử lý `undefined`/thiếu
  field).
- **Rollback**: chỉ cần revert code (BE + FE), không cần thao tác dữ liệu vì
  không có migration/ghi dữ liệu.
- Không cần feature flag theo phạm vi đã chốt trong spec-pack (không có yêu
  cầu bật/tắt tạm thời).

---

## Vùng được phán định là không ảnh hưởng

| area | judgment | evidence |
|---|---|---|
| Các endpoint khác của `SecurityDashboardController` (`/access`, `/options`, `/summary`, `/tickets`, `/export`) | Không ảnh hưởng | Đọc toàn văn `SecurityDashboardController.java` — các method này không gọi `getTicketDetail`/không dùng `SecurityTicketDetail` |
| `SecurityScanRepositoryAdapter` / `SecurityScanMapper` (write-side ingest) | Không ảnh hưởng | Đây là adapter khác (MyBatis, ghi dữ liệu), tách biệt hoàn toàn khỏi `SecurityDashboardJdbcAdapter` (đọc) dù cùng bảng — xác nhận qua đọc toàn văn `SecurityScanRepositoryAdapterTest.java` |
| DB schema / migration | Không ảnh hưởng | Chỉ `SELECT` trên cột có sẵn (`unresolved_count`, `collected_at`, `ticket_id`, `scanner_type`) từ `tbl_fact_security_scan`, không cần cột/bảng mới |
| Các dashboard khác (Dev/QA/PM/Data Ops) | Không ảnh hưởng | Không có model/adapter/service nào của các dashboard đó tham chiếu `SecurityTicketDetail` hay `tbl_fact_security_scan` theo cách bị đổi (grep xác nhận `tbl_fact_security_scan` chỉ dùng bởi domain `securitydashboard` và `scanner`/ingest, không chồng lấn) |
| Permission/Role model | Không ảnh hưởng | Không thêm role/permission mới, dùng lại `requireSecurityAccess` nguyên trạng |
| `Security Exception`/`Security Checklist` modules | Không ảnh hưởng | Field mới không đọc `tbl_fact_exception`/`tbl_fact_artifact_parsed_section` — 2 khối đó trong `SecurityTicketDetail` giữ nguyên |
| Ticket `ARTIFACT-SCANNER`, `EVIDENCE-QUALITY-SCORE` (feature đã hoàn thành khác) | Không ảnh hưởng | Không sửa file nào thuộc `application/usecase/scanner/` hay `application/usecase/quality/` — chỉ tham khảo kiến trúc, không đổi code |
| FE code khác tự construct `SecurityTicketDetail` (mock/fixture) | Không ảnh hưởng | Grep `SecurityTicketDetail` trong `EDCAP_FE/src` chỉ ra đúng 4 file (`types.ts`, `SecurityTicketDetailDrawer.tsx`, `SecurityDashboardPage.tsx`, `lib/api.ts`), không có object literal nào construct thủ công type này |

---

## Điểm chưa rõ

Giữ nguyên trạng thái **chưa xác định** (không suy đoán thành quyết định),
đồng bộ với `open-issues.md`/`spec-pack.md` §17-18:

- **`OI-INDEX`**: chưa xác nhận index phù hợp cho truy vấn lịch sử scan theo
  `ticket_id`. Cần `EXPLAIN` thực tế trước khi merge nếu dữ liệu lớn.
- **`OI-DATA-RETENTION`**: chưa xác minh trên môi trường test/staging có đủ
  dữ liệu nhiều-commit để kiểm thử multi-cycle thực tế (khác với unit test
  dùng dữ liệu giả lập).
- **Đề xuất Heavy Option cho Review Mode**: theo hướng dẫn "nếu có DB change
  hoặc contract change, đề xuất Heavy Option" — ticket này **không có DB
  change** nhưng **có contract change** (additive field trong response JSON
  đã public). Đề xuất: cân nhắc nâng `Review Mode` từ `Standard` (đã ghi
  trong `spec-pack.md` §15) lên **`Heavy`** cho riêng bước review contract
  (FE/BE type đồng bộ, kiểm tra không phá client hiện có), dù độ phức tạp
  business logic vẫn ở mức `Standard`. **Đây là đề xuất, cần người phụ trách
  xác nhận** — không tự ý đổi `Complexity Classification` trong `spec-pack.md`.
