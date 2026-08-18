# spec-pack

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude
**Update date**: 2026-08-17

---

## 1. Tổng quan

Bổ sung 1 field mới **"Security Finding Resolution Time"** vào màn hình chi
tiết ticket của Security Dashboard hiện có
(`SecurityTicketDetailDrawer.tsx`), hiển thị tổng thời gian xử lý các security
finding do SAST scan phát hiện, tính từ dữ liệu lịch sử scan đã có sẵn trong
`tbl_fact_security_scan`. Không tạo bảng/pipeline dữ liệu mới, không có màn
hình mới, không có endpoint mới (mở rộng response của endpoint hiện có).

---

## 2. Bối cảnh / mục tiêu

**Bối cảnh (As-Is):** Security Dashboard
(`docs/changes/SECURITY-DASHBOARD/`) hiện hiển thị trạng thái bảo mật của từng
ticket (Safety Pack, Secret Scan, SAST, SCA, Checklist, Exception, Final
Verdict) qua `SecurityTicketDetailDrawer.tsx` (3 khối: Scans, Checklist,
Exceptions — `SecurityTicketDetailDrawer.tsx:66-165`), nhưng **không hiển thị
thời gian xử lý (resolution time)** của các security finding. Dữ liệu SAST scan
(`tbl_fact_security_scan`) đã tích lũy lịch sử nhiều bản ghi theo thời gian cho
mỗi `(ticket_id, scanner_type)` (xác nhận qua pattern
`ORDER BY collected_at DESC LIMIT 1` ở `SecurityDashboardJdbcAdapter.java:57-63`
dùng để lấy "scan mới nhất"), nhưng chưa có logic nào tính khoảng thời gian
giữa các lần scan.

**Mục tiêu (To-Be):** Khi mở `SecurityTicketDetailDrawer` cho 1 ticket, hệ
thống:

1. Lấy lịch sử `tbl_fact_security_scan` của ticket đó (`scanner_type = 'SAST'`),
   sắp xếp theo `collected_at` tăng dần.
2. Xác định toàn bộ **cycle** (0, 1, hoặc nhiều): một cycle mở khi
   `unresolved_count` chuyển từ 0/chưa có dữ liệu sang > 0, đóng lại khi lần
   đầu tiên sau đó `unresolved_count` quay về 0.
3. Tính `resolutionTime = Σ (resolved.collected_at − detected.collected_at)`
   của **tất cả cycle đã đóng**.
4. Hiển thị dạng `HH:mm:ss` (không giới hạn `HH` ở 24), hoặc `"-"` nếu chưa có
   cycle nào đã đóng.

**Mục tiêu kiến trúc:** Đặt logic xác định cycle ở tầng `application/usecase`
(`SecurityDashboardService`), không đặt trong raw SQL của adapter — theo đúng
`20-architecture.md` (business logic ở application layer) và `40-testing.md`
(unit test phải mock được port interface, không mock domain/SQL). Đây là điểm
khác biệt có chủ đích so với phong cách hiện tại của
`SecurityDashboardJdbcAdapter.java` (vốn đặt nhiều logic tổng hợp trực tiếp
trong SQL) — vì logic cycle là stateful/tuần tự, khó và không nên biểu diễn
thuần bằng SQL nếu muốn unit test đầy đủ theo chuẩn dự án.

---

## 3. Phạm vi (đối tượng)

- Thêm field "Security Finding Resolution Time" vào `SecurityTicketDetailDrawer.tsx`.
- Tính resolution time từ `tbl_fact_security_scan` (`scanner_type = 'SAST'`)
  theo từng ticket, theo mô hình multi-cycle cộng dồn (mục 5).
- Backend: mở rộng `SecurityTicketDetail`
  (`SecurityDashboardModels.java:123-135`) và response của
  `GET /api/v1/security/dashboard/tickets/{ticketId}`
  (`SecurityDashboardController.java`) với field `resolutionTime`.
- Frontend: hiển thị field, định dạng `HH:mm:ss`, đa ngôn ngữ (EN/VI/JP), xử lý
  `"-"` khi chưa có cycle nào đã đóng.
- Đọc dữ liệu đã có sẵn — không có ghi/sửa dữ liệu.

---

## 4. Ngoài phạm vi

- **Không dùng** `tbl_fact_security_finding` (bảng orphaned, không có code
  application nào dùng — loại bỏ ở vòng quyết định đầu tiên).
- **Không dùng** `tbl_connector_run` (phương án bị thay thế ở vòng quyết định
  thứ hai — không có `ticket_id`, đo ingestion connector chứ không đo security
  finding).
- Không tạo bảng/cột/migration DB mới.
- Không tạo pipeline ghi dữ liệu mới.
- Không có ngưỡng SLA / cảnh báo màu sắc theo mức độ nghiêm trọng (deferred —
  mục 17, `OI-6`).
- Không có biểu đồ xu hướng (trend) theo thời gian — chỉ 1 giá trị scalar duy
  nhất cho ticket đang xem.
- Không thay đổi bất kỳ endpoint/contract nào khác của Security Dashboard.

---

## 5. Thuật ngữ nghiệp vụ / tiền đề

### 5.1. Thuật ngữ

| terms | meaning | notes |
|---|---|---|
| SAST | Static Application Security Testing | Existing implementation, `scanner_type = 'SAST'` trong `tbl_fact_security_scan` |
| Security Scan | 1 bản ghi trong `tbl_fact_security_scan`, ứng với 1 lần scan (thường gắn với 1 CI run) | Existing table, có `ticket_id` trực tiếp |
| `unresolved_count` | Số finding chưa xử lý tại thời điểm scan đó | Cột có sẵn, dùng làm tín hiệu trạng thái |
| Cycle | 1 khoảng thời gian liên tục từ lúc `unresolved_count` chuyển từ 0 (hoặc chưa từng có dữ liệu) sang > 0, cho tới lần đầu tiên sau đó `unresolved_count` quay về 0 | Định nghĩa mới cho ticket này |
| Detected scan (của 1 cycle) | Bản ghi scan đầu tiên của cycle đó, có `unresolved_count > 0` | Định nghĩa mới |
| Resolved scan (của 1 cycle) | Bản ghi scan đầu tiên sau đó (theo `collected_at`) có `unresolved_count = 0`, đóng cycle lại | Định nghĩa mới |
| Open cycle | Cycle đã có detected scan nhưng chưa có resolved scan (tính đến thời điểm truy vấn) | Không được cộng vào tổng (BR-3) |
| Security Finding Resolution Time | Tổng thời lượng của tất cả cycle đã đóng của ticket | Metric mới của ticket này |

### 5.2. Tiền đề nghiệp vụ (Business Rules)

**BR-1 — Nguồn dữ liệu**
Nguồn dữ liệu duy nhất là `tbl_fact_security_scan` với điều kiện
`scanner_type = 'SAST'` và `ticket_id = :ticketId`. Không dùng bảng nào khác.

**BR-2 — Xác định cycle**
Duyệt các bản ghi scan (thỏa BR-1) theo thứ tự `collected_at` tăng dần:
- Cycle mở tại bản ghi đầu tiên có `unresolved_count > 0` khi chưa có cycle
  nào đang mở.
- Cycle đóng lại tại bản ghi tiếp theo (gần nhất về sau) có
  `unresolved_count = 0`.
- Sau khi 1 cycle đóng, nếu có bản ghi `unresolved_count > 0` tiếp theo → mở
  cycle mới, độc lập với cycle trước.

**BR-3 — Chỉ tính cycle đã đóng**
Một cycle chỉ được tính vào tổng nếu đã đóng (có cả detected và resolved
scan). Open cycle (tại thời điểm truy vấn) không được cộng vào tổng — kể cả
khi đó là cycle duy nhất/cuối cùng (xem thêm mục 17, `OI-OPEN-CYCLE-MIX`).

**BR-4 — Công thức tổng**
`resolutionTime = Σ (resolved_scan.collected_at − detected_scan.collected_at)`
tính trên toàn bộ cycle đã đóng của ticket. Nếu ticket chỉ có đúng 1 cycle đã
đóng, công thức tương đương phép trừ đơn giản.

**BR-5 — Trường hợp không có cycle đã đóng**
Nếu không có cycle nào đã đóng (chưa từng có `unresolved_count > 0`, hoặc có
nhưng chưa từng quay lại `unresolved_count = 0` sau đó) → hiển thị `"-"`. Áp
dụng kể cả khi có 1 open cycle đang chạy dở — không hiển thị số 0.

**BR-6 — Định dạng hiển thị**
Định dạng `HH:mm:ss`, đơn vị gốc là giờ. Khi tổng vượt quá 24 giờ, `HH` hiển
thị tổng số giờ không giới hạn (dạng duration, không phải wall-clock, ví dụ
`48:00:00`).

**BR-7 — Read-only**
Tính năng chỉ đọc dữ liệu, không ghi/sửa `tbl_fact_security_scan` hay bất kỳ
bảng nào khác.

---

## 6. Acceptance Criteria

| AC ID | description | testable? | notes |
|---|---|---|---|
| AC-SECFINDRES-1 | Với ticket có đúng 1 cycle đã đóng, field hiển thị đúng `resolved.collected_at − detected.collected_at`, định dạng `HH:mm:ss` | Yes | BR-1→BR-4, BR-6 |
| AC-SECFINDRES-2 | Với ticket chưa có scan SAST nào, field hiển thị `"-"` | Yes | BR-5 |
| AC-SECFINDRES-3 | Với ticket có 1 open cycle (chưa cycle nào đóng), field hiển thị `"-"` | Yes | BR-5 |
| AC-SECFINDRES-4 | Field hiển thị đúng nhãn theo ngôn ngữ đang chọn (EN/VI/JP) | Yes | Mục 7 |
| AC-SECFINDRES-5 | Field xuất hiện trong `SecurityTicketDetailDrawer`, không phá vỡ 3 khối hiện có (Scans/Checklist/Exceptions) | Yes | `40-testing.md` AC Closure — phải verify mounted trên trang thật, không chỉ test cô lập. **Ngoại lệ đã xác nhận (`H-SECFINDRES-5`, 2026-08-18)**: khối "Scans" **không hiển thị lại** dòng `scannerType = 'SAST'` — đã có ở `resolutionTime`, giữ nguyên code hiện tại để tránh ảnh hưởng, không coi là vi phạm AC này |
| AC-SECFINDRES-6 | Không có ghi/sửa dữ liệu nào xảy ra khi tính field này | Yes | BR-7 |
| AC-SECFINDRES-7 | Với ticket có N (N ≥ 2) cycle đã đóng, field hiển thị **tổng** resolution time của cả N cycle | Yes | BR-2, BR-3, BR-4 |
| AC-SECFINDRES-8 | Với ticket có N cycle đã đóng và thêm 1 open cycle đang chạy dở, field hiển thị tổng của N cycle đã đóng, bỏ qua open cycle | Yes | BR-3, BR-5 — **đã xác nhận (H-SECFINDRES-4, 2026-08-17)** |
| AC-SECFINDRES-9 | Với tổng resolution time vượt quá 24 giờ, `HH` hiển thị không giới hạn (vd. `48:00:00`), không reset về `00` | Yes | BR-6 |

### Ví dụ minh họa

**Normal case — 1 cycle:** Ticket có Scan A (`collected_at=2026-08-01 09:00`,
`unresolved_count=3`) → Scan B (`2026-08-02 10:00`, `unresolved_count=1`) →
Scan C (`2026-08-03 12:30`, `unresolved_count=0`). Kết quả: 1 cycle
(A→C), resolution time = `51:30:00` (2026-08-01 09:00 → 2026-08-03 12:30 = 2
ngày 3 giờ 30 phút = 51 giờ 30 phút — **đã sửa lỗi tính toán so với bản trước
đây ghi nhầm `27:30:00`**, phát hiện khi viết unit test lúc implementation).

**Normal case — nhiều cycle cộng dồn:** Scan A (`08-01 09:00`,
`unresolved_count=2`, mở cycle 1) → Scan B (`08-01 15:00`,
`unresolved_count=0`, đóng cycle 1: 6 giờ) → Scan C (`08-05 08:00`,
`unresolved_count=1`, mở cycle 2) → Scan D (`08-06 08:00`,
`unresolved_count=0`, đóng cycle 2: 24 giờ). Kết quả: tổng = `30:00:00`.

**Boundary case — chưa có cycle đã đóng:** Chỉ có Scan A
(`unresolved_count=2`), chưa có scan nào sau đó với `unresolved_count=0`.
Kết quả: `"-"`.

**Boundary case — cycle đã đóng + open cycle cuối:** Scan A
(`unresolved_count=1`) → Scan B (`unresolved_count=0`, đóng cycle 1, 2 giờ) →
Scan C (`unresolved_count=3`, mở cycle 2, chưa có scan nào sau đó). Theo
BR-3/BR-5 (đã xác nhận bởi người dùng, `H-SECFINDRES-4`): kết quả = `02:00:00`
(chỉ tính cycle 1 đã đóng, bỏ qua open cycle 2).

---

## 7. Input / Output

### Input

| item | type | required | validation | notes |
|---|---|---|---|---|
| ticketId | UUID | Yes | Ticket tồn tại trong `tbl_dim_ticket` | Lấy từ context hiện có của `SecurityTicketDetailDrawer`, không có input mới từ người dùng cuối |

### Output

| item | type | format | notes |
|---|---|---|---|
| Security Finding Resolution Time | Duration | `HH:mm:ss`, hoặc `"-"` nếu chưa có cycle đã đóng | Field mới trong `SecurityTicketDetail` |

DTO key: **`resolutionTime`** (camelCase — đã được người dùng xác nhận, khớp
convention hiện có của `SecurityTicketDetail`: `ticketId`, `ticketKey`,
`findingCount`, `unresolvedCount`).

Label hiển thị (đa ngôn ngữ, đã xác nhận):

| Locale | Label |
|---|---|
| EN | Security Finding Resolution Time |
| VI | Thời gian xử lý finding bảo mật |
| JP | セキュリティ指摘解消時間 |

---

## 8. Ảnh hưởng màn hình / API / DB / Batch / Event

- **Màn hình:** `SecurityTicketDetailDrawer.tsx` — thêm 1 field hiển thị, giữ
  nguyên layout tổng thể (Drawer antd, 3 khối hiện có: Scans/Checklist/
  Exceptions). Không có wireframe cho vị trí chính xác — quyết định cụ thể để
  ở `impl-plan.md`.
- **API:** Không có endpoint mới. Mở rộng response của
  `GET /api/v1/security/dashboard/tickets/{ticketId}`
  (`SecurityDashboardController.java:91`) — response hiện trả về
  `SecurityTicketDetail`, thêm field `resolutionTime`.
- **DB:** Không có migration mới. Chỉ `SELECT` từ `tbl_fact_security_scan` đã
  tồn tại. Cần kiểm tra ở `impl-plan.md` xem đã có index phù hợp cho truy vấn
  `WHERE ticket_id = ? AND scanner_type = 'SAST' ORDER BY collected_at` hay
  chưa — **lưu ý:** index `idx_security_finding_status` hiện có
  (`V4__init_shema_v2.sql:1294`) thuộc bảng `tbl_fact_security_finding` (không
  liên quan ticket này), **không phải** `tbl_fact_security_scan` (xem
  `OI-INDEX`, mục 17).
- **Batch:** Không có — tính toán on-the-fly khi gọi API detail, không có
  job/cron mới.
- **Event:** Không có event/webhook mới.

---

## 9. FE/BE contract

- **BE:** Mở rộng record `SecurityTicketDetail`
  (`SecurityDashboardModels.java:123-135`) thêm field `resolutionTime`
  (kiểu chuỗi đã format sẵn `HH:mm:ss`, hoặc chuỗi `"-"` — quyết định cụ thể về
  kiểu `null` vs. `"-"` literal ở BE hay format ở FE để ở `impl-plan.md`). Mở
  rộng DTO tương ứng trong `SecurityDashboardDtos.java`.
- **Logic tính cycle** đặt tại `SecurityDashboardService` (application layer),
  nhận danh sách raw scan history từ `SecurityDashboardRepositoryPort` (port
  interface hiện có) — **không** đặt trong SQL của
  `SecurityDashboardJdbcAdapter` để đảm bảo unit-testable theo `40-testing.md`
  (mock port, không mock SQL).
- **FE:** Mở rộng type `SecurityTicketDetail` trong
  `EDCAP_FE/src/pages/security-dashboard/types.ts` thêm `resolutionTime:
  string`. Hiển thị trong `SecurityTicketDetailDrawer.tsx`, dùng
  `react-i18next` (`t("Pages.SecurityDashboard.drawer...")`) cho 3 label
  EN/VI/JP theo đúng pattern các label khác trong cùng file.
- Không có breaking change cho contract hiện có — chỉ thêm field mới vào
  response đã tồn tại (additive change).

---

## 10. Validation / Error / Message

| case | expected behavior | message/code | notes |
|---|---|---|---|
| Ticket không có scan SAST nào | Hiển thị `"-"` | INFO, không phải lỗi | BR-5 |
| Ticket có 1 open cycle, chưa cycle nào đóng | Hiển thị `"-"` | INFO, không phải lỗi | BR-5 |
| Ticket có N cycle đã đóng + 1 open cycle cuối | Hiển thị tổng N cycle đã đóng, bỏ qua open cycle | Không phải lỗi | BR-3, BR-5 — đã xác nhận bởi người dùng (`H-SECFINDRES-4`, `A-6`) |
| Ticket không tồn tại | Theo hành vi hiện có của endpoint detail | Existing (401/403/404 qua `GlobalExceptionHandler`) | Không thay đổi hành vi hiện có |
| Database unavailable | Theo `GlobalExceptionHandler` hiện có | 500 | Không tạo `ResponseEntity` tùy biến (theo `30-security.md`) |

**Boundary Value:**

| item | min | max | special cases | expected |
|---|---|---|---|---|
| Số bản ghi scan SAST của 1 ticket | 0 | Unlimited | 0 bản ghi | `"-"` |
| Số cycle đã đóng | 0 | Unlimited | 0 cycle đã đóng (kể cả khi có open cycle) | 0 → `"-"`; ≥1 → tổng |
| `unresolved_count` tại detected scan (mỗi cycle) | 1 | Unlimited | — | Bất kỳ giá trị > 0 hợp lệ |
| Resolution time (tổng) | — (0 không hiển thị, thay bằng `"-"`) | Unlimited | Nhiều cycle cộng dồn qua nhiều ngày/tuần | `HH:mm:ss`, `HH` không giới hạn 24 (BR-6) |

---

## 11. Security / Privacy / Permission / Audit

- Read-only — không ghi dữ liệu mới, không có thao tác ghi nào cần audit log
  mới.
- Không có dữ liệu nhạy cảm mới bị lộ ra — chỉ là khoảng thời gian tính từ dữ
  liệu scan đã hiển thị công khai trong cùng drawer (đã qua kiểm soát quyền
  truy cập hiện có của Security Dashboard).
- Tái sử dụng authentication/authorization hiện có
  (`SecurityDashboardService.requireAnyAccess`/`requireSecurityAccess`) —
  không thêm quyền/role mới.
- Tuân thủ `30-security.md`: không thêm `ResponseEntity` status code tùy biến,
  dùng `GlobalExceptionHandler` hiện có nếu có lỗi; không có secret/token nào
  liên quan đến field này.
- Không có yêu cầu audit trail mới (tính năng đọc-hiển-thị thuần túy).

---

## 12. Operation / Logging / Monitoring / Recovery

- Tái sử dụng logging/monitoring hiện có của Security Dashboard (traceId theo
  `logging.md`).
- Không có lifecycle vận hành mới — tính toán on-the-fly khi gọi API detail,
  không có job/cron/queue mới, không cần recovery/retry riêng.
- Nếu truy vấn lịch sử scan chậm do thiếu index (`OI-INDEX`), không có cơ chế
  cache riêng cho phiên bản này — đánh giá thêm ở `impl-plan.md` nếu cần.

---

## 13. Test Strategy Summary

- **Backend unit test** (`SecurityDashboardServiceTest.java` — mở rộng, tham
  khảo pattern mock `SecurityDashboardRepositoryPort` hiện có): logic xác định
  cycle (BR-2, BR-3, BR-4) với các case: 0 scan, 1 open cycle (0 cycle đóng),
  1 cycle đã đóng, N cycle đã đóng (cộng dồn), N cycle đã đóng + 1 open cycle
  cuối (bỏ qua open cycle theo `OI-OPEN-CYCLE-MIX`).
- **Backend adapter test** (`SecurityScanRepositoryAdapterTest.java` — tham
  khảo pattern hiện có): truy vấn raw scan history đúng thứ tự `collected_at`.
- **Frontend unit test** (`SecurityTicketDetailDrawer` — Testing Library):
  hiển thị giá trị thật (`HH:mm:ss`), giá trị `"-"`, đúng label theo locale.
- **AC Closure** (`40-testing.md`): phải verify field thực sự mounted trên
  `SecurityTicketDetailDrawer` trong trang Security Dashboard thật (không chỉ
  test component cô lập) — tham khảo pattern
  `SecurityDashboardPage.test.tsx`.
- **Black-box test cases**: tạo ở `blackbox-testcases.md` sau khi có
  `impl-plan.md`.

---

## 14. Source Availability Summary

- Quyết định nghiệp vụ (nguồn dữ liệu, công thức, format, label): **Available**
  — người dùng cung cấp trực tiếp qua 5 vòng hỏi-đáp (`open-issues.md`,
  `00_brainstorm.md` Phụ lục).
- Database schema (`tbl_fact_security_scan`): **Available** — đọc trực tiếp từ
  migration `V4__init_shema_v2.sql`.
- Existing dashboard code (`SecurityDashboardService`,
  `SecurityDashboardJdbcAdapter`, `SecurityDashboardController`,
  `SecurityTicketDetailDrawer.tsx`): **Available**, đã đọc.
- Flow tham chiếu kiến trúc (Artifact Scanner, Evidence Quality Score):
  **Partial** — chỉ xác nhận cấu trúc file (Service/Port/Adapter/Controller/
  DTO), chưa đọc toàn văn logic nghiệp vụ (không cần thiết cho spec-pack, cần
  ở `impl-plan.md` nếu tham khảo chi tiết).
- Wireframe/mockup vị trí field trong drawer: **Not available** — để
  `impl-plan.md` quyết định.
- Chi tiết đầy đủ: xem `sources.md`.

---

## 15. Complexity Classification

```text
Complexity : Standard

System Shape : FE + BE

Primary Risk : Business-logic derivation (không có cột resolved_at trực tiếp,
                phải suy diễn cycle từ chuỗi scan theo thời gian; rủi ro thêm
                nếu dữ liệu lịch sử scan không được lưu đầy đủ)

Review Mode : Standard

Required Options :
- Source Analysis
- FE-BE Contract
```

---

## 16. Assumptions

| ID | assumption | basis | risk | need confirmation? |
|---|---|---|---|---|
| A-1 | DTO key dùng camelCase `resolutionTime` | Đã được người dùng xác nhận trực tiếp | Low | No (Resolved) |
| A-2 | Field hiển thị 1 giá trị scalar duy nhất cho ticket (không phải danh sách/trend) | Suy ra trực tiếp từ việc người dùng chỉ cung cấp 1 label/1 DTO key duy nhất, không đề cập chart/table | Low | No |
| A-3 | Định dạng `HH:mm:ss` không giới hạn `HH` ở 24 (duration, không phải wall-clock) | Đã được người dùng xác nhận trực tiếp | Low | No (Resolved) |
| A-4 | Tính tổng toàn bộ cycle đã đóng (không chỉ cycle đầu tiên) | Đã được người dùng xác nhận trực tiếp | Low | No (Resolved) |
| A-5 | Không cần ngưỡng SLA/cảnh báo màu sắc cho field này trong phiên bản này | Người dùng không đề cập khi trả lời các vòng OI-11/12/13 dù đã được hỏi riêng ở OI-6 | Low | No (có thể mở lại ở phase sau) |
| A-6 | Khi có N cycle đã đóng + 1 open cycle cuối: hiển thị tổng N cycle, bỏ qua open cycle (không trả về `"-"`) | **Đã được người dùng xác nhận trực tiếp** (2026-08-17, `H-SECFINDRES-4`) — không còn là suy luận | Low | No (Resolved) |
| A-7 | Lịch sử `tbl_fact_security_scan` tích lũy đầy đủ theo thời gian, không bị dọn dẹp/archive mất bản ghi cũ | Suy ra từ pattern `ORDER BY collected_at DESC LIMIT 1` trong code hiện có, chưa xác minh bằng dữ liệu thực tế | Medium | Yes — nên xác minh ở `impl-plan.md` |
| A-8 | Logic tính cycle đặt ở tầng `application/usecase` (`SecurityDashboardService`), không đặt trong SQL của adapter | Theo `20-architecture.md`/`40-testing.md`, khác với phong cách hiện tại của `SecurityDashboardJdbcAdapter` vốn đặt logic trong SQL | Low | No — là khuyến nghị kiến trúc của Claude, không phải business decision, có thể điều chỉnh ở impl-plan nếu có lý do kỹ thuật |

---

## 17. Open Issues

| ID | issue | impact | owner | status |
|---|---|---|---|---|
| OI-OPEN-CYCLE-MIX | Ticket có cả cycle đã đóng lẫn 1 open cycle cuối — hiển thị tổng (bỏ qua open cycle) hay `"-"`? | Business logic, ảnh hưởng AC-SECFINDRES-8 | Người dùng | **Resolved (2026-08-17)** — hiển thị tổng |
| OI-6 | Ngưỡng SLA/cảnh báo theo severity | UI/Business | Người dùng | Deferred — giả định không cần cho phiên bản này (A-5) |
| OI-INDEX | Xác nhận `tbl_fact_security_scan` có index phù hợp cho truy vấn `(ticket_id, scanner_type, collected_at)` hay cần thêm | Performance | Dev | Open — cần kiểm tra ở `impl-plan.md` |
| OI-DATA-RETENTION | Xác minh `tbl_fact_security_scan` không bị dọn dẹp/archive làm mất lịch sử scan cũ | Độ chính xác business logic | Dev | Open — liên quan A-7 |

---

## 18. Human Decisions Required

| ID | decision item | quyết định / trạng thái | owner | status |
|---|---|---|---|---|
| H-SECFINDRES-1 | DTO key casing | `resolutionTime` (camelCase) | Người dùng | **Resolved** |
| H-SECFINDRES-2 | Định dạng `HH:mm:ss` khi vượt quá 24 giờ | Không giới hạn (duration, vd. `48:00:00`) | Người dùng | **Resolved** |
| H-SECFINDRES-3 | Xử lý nhiều chu kỳ detected→resolved | Tính tổng toàn bộ chu kỳ đã đóng | Người dùng | **Resolved** |
| H-SECFINDRES-4 | Khi có N cycle đã đóng **và thêm 1 open cycle cuối**: hiển thị tổng (bỏ qua open cycle) hay `"-"`? | **Hiển thị tổng, bỏ qua open cycle** | Người dùng | **Resolved (2026-08-17)** |
| H-SECFINDRES-5 | Khối "Scans" trong `SecurityTicketDetailDrawer.tsx` đang ẩn dòng `scannerType='SAST'` (code hiện tại, ngoài dự kiến ban đầu của `impl-plan.md`) — giữ nguyên hay revert lại hiển thị SAST trong Scans? | **Giữ nguyên code hiện tại (không hiển thị lại SAST trong Scans)** — quyết định không sửa code để tránh ảnh hưởng/rủi ro cho phần code đã chạy ổn định; SAST coi như đã "chuyển" sang hiển thị qua `resolutionTime` | Người dùng | **Resolved (2026-08-18)** |
| H-SECFINDRES-6 | `resolutionTime` trả về kiểu `String` đã format sẵn `HH:mm:ss` ở tầng BE (thay vì số giây thô để FE tự format) — đây là judgment call của `impact-analysis.md`, chưa từng được xác nhận trực tiếp | **Xác nhận đúng ý muốn — giữ nguyên `String` đã format sẵn ở BE**, không đổi sang số giây thô | Người dùng | **Resolved (2026-08-18)** |
| H-SECFINDRES-7 | Tie-break khi 2 bản ghi SAST scan có `collected_at` trùng nhau tuyệt đối (BR-2 không định nghĩa; SQL `ORDER BY collected_at ASC` không có secondary sort key → thứ tự không được đảm bảo ổn định) — thêm secondary sort key hay chấp nhận rủi ro? | **Chấp nhận rủi ro** — không thêm secondary sort key (vd. `security_scan_id`) trong phiên bản này; ghi nhận là Accepted Risk (xem `human-review.md`), không phải bug cần sửa | Người dùng | **Resolved (2026-08-18)** |

---

## Trạng thái spec-pack

**Hoàn tất — không còn Open Issue hay Human Decision nào ở trạng thái "Open".**
Tất cả 4 Human Decision (H-SECFINDRES-1→4) và toàn bộ Open Issues blocking đã
được người dùng chốt. Còn lại 2 mục non-blocking mang tính kỹ thuật cho
`impl-plan.md` (`OI-INDEX`, `OI-DATA-RETENTION`) và 1 mục deferred ngoài phạm
vi (`OI-6`) — không ảnh hưởng tới việc bắt đầu lập `impl-plan.md`.
