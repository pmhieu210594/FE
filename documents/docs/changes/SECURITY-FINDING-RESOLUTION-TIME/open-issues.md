# Open Issues — SECURITY-FINDING-RESOLUTION-TIME

> **Trạng thái cuối cùng (2026-08-17): TẤT CẢ điểm blocking đã được đóng**, kể
> cả điểm cuối cùng `OI-OPEN-CYCLE-MIX`/`H-SECFINDRES-4` (xác nhận: hiển thị
> tổng, bỏ qua open cycle). File này giữ lại làm **nhật ký lịch sử** của quá
> trình hỏi-đáp; nguồn đúng duy nhất cho trạng thái hiện tại là
> `spec-pack.md` (mục 17 Open Issues, mục 18 Human Decisions Required).

Không mục nào dưới đây được lấp bằng suy đoán. Trạng thái cập nhật 2026-08-17 sau
khi người dùng trả lời OI-1, OI-2, OI-3, OI-4, OI-7. Chi tiết đối chiếu source code
xem `raw/requirement.md`.

## Đã giải quyết (human decision, 2026-08-17)

### OI-1. Ticket có kế thừa `SECURITY-DASHBOARD` không? — **RESOLVED**

**Quyết định:** Đây là field/metric mới bổ sung vào Security Dashboard hiện có,
không phải màn hình độc lập.

### OI-2. Nguồn dữ liệu là bảng nào? — **REVISED (lần 2, 2026-08-17)**

**Quyết định trước đó (đã bị thay thế):** `tbl_connector_run`.

**Quyết định mới:** Dùng **`tbl_fact_security_scan`**
(`V4__init_shema_v2.sql:740-758`), tính "Thời gian giải quyết finding bảo mật"
với nguồn dữ liệu **SAST/review theo từng ticket**.

Đối chiếu source code:

- `tbl_fact_security_scan` có cột `ticket_id` **trực tiếp** (không cần join gián
  tiếp qua repository như phương án `tbl_connector_run` trước đó) — điều này
  **giải quyết luôn OI-9 cũ** (xem bên dưới, đã đóng).
- `scanner_type = 'SAST'` là giá trị có thật, đang dùng trong
  `SecurityDashboardJdbcAdapter.java` (dòng 60, 229, 347, 402 — ví dụ
  `SAST_LATERAL_JOIN`: `WHERE s3.ticket_id = t.ticket_id AND s3.scanner_type =
  'SAST' ORDER BY s3.collected_at DESC LIMIT 1`).
- "review" khớp với bảng `tbl_fact_finding` (`V4__init_shema_v2.sql:610-631`) —
  bảng này có `review_id`/`review_comment_id`, và có `category_id` trỏ tới
  `tbl_dim_finding_category`, trong đó **có category `SECURITY`** (seed data
  `V4__init_shema_v2.sql:1457`: `('SECURITY', 'Security', 'HIGH', 'Security
  issue')`). Bảng này có `detected_at`/`resolved_at` **ở mức từng finding** (khác
  với `tbl_fact_security_scan` — xem OI-14).
- Loại bỏ hoàn toàn phương án `tbl_fact_security_finding` (orphaned, đã bác bỏ ở
  vòng trả lời trước) và `tbl_connector_run` (đã bác bỏ ở vòng này).

→ Còn 2 điểm kỹ thuật mới cần làm rõ: **OI-14** (cách tính resolution time từ
`tbl_fact_security_scan` vì bảng này KHÔNG có `detected_at`/`resolved_at` per
finding) và **OI-15** (cách kết hợp 2 nguồn SAST + review thành 1 giá trị hiển
thị).

### OI-3. Có cần pipeline ghi dữ liệu mới không? — **RESOLVED**

**Quyết định:** Không — dữ liệu đã có sẵn (do Data Ops Dashboard đã ghi), chỉ cần
đọc để tính KPI.

### OI-4. Định nghĩa "resolution time" — **RESOLVED (một phần)**

**Quyết định:** Công thức = `finished_at - started_at` của run trong "Recent
runs" (Data Ops Dashboard). Phần **chưa rõ**: lấy run nào (mới nhất theo ticket,
hay khoảng bao trùm nhiều run) — chuyển thành **OI-9** bên dưới.

### OI-7. Yêu cầu UI/API — **RESOLVED (một phần)**

**Quyết định:** Thêm trường mới trong `SecurityTicketDetailDrawer.tsx`. Phần
**chưa rõ**: tên field, format hiển thị — chuyển thành **OI-12, OI-13** bên dưới.

---

## Đã đóng (do đổi nguồn dữ liệu sang `tbl_fact_security_scan` ở OI-2 lần 2)

### OI-9 (cũ). Cách nối ticket ↔ `tbl_connector_run` — **CLOSED, không còn áp dụng**

Không còn liên quan vì `tbl_fact_security_scan` có sẵn cột `ticket_id`, không cần
đường nối gián tiếp qua `repository_id`/`connector_id` nữa.

### OI-10 (cũ). "Cuối cùng - đầu tiên" của `tbl_connector_run` — **CLOSED, không còn áp dụng**

Thay thế bằng OI-14 bên dưới (cách tính resolution time từ `tbl_fact_security_scan`).

---

## Còn mở — phát sinh mới sau quyết định OI-2 lần 2 (nguồn = `tbl_fact_security_scan` + `tbl_fact_finding`)

### OI-14. Cách tính "resolution time" từ `tbl_fact_security_scan` (Blocking)

`tbl_fact_security_scan` (`V4__init_shema_v2.sql:740-758`) **không có cột
`detected_at`/`resolved_at`** ở mức từng finding — chỉ có `finding_count`,
`unresolved_count` là số đếm tổng hợp theo **mỗi lần scan** (`started_at`,
`finished_at`, `collected_at`), và `status` là `run_status` (SUCCESS/FAILED/…,
tức trạng thái chạy scan, **không phải trạng thái finding đã resolve hay
chưa** — xác nhận qua `CREATE TYPE run_status AS ENUM ('SUCCESS', 'FAILED',
'CANCELLED', 'SKIPPED', 'RUNNING', 'PENDING', 'UNKNOWN', 'QUEUED',
'IN_PROGRESS', 'FAILURE')` tại `V4__init_shema_v2.sql:41`).

Code hiện tại (`SecurityDashboardJdbcAdapter.java:57-63`, pattern
`SAST_LATERAL_JOIN`) luôn lấy **1 scan mới nhất** theo `collected_at` cho mỗi
`(ticket_id, scanner_type)` — gợi ý rằng có **nhiều bản ghi scan theo thời gian**
cho cùng 1 ticket (mỗi lần CI chạy lại scan → 1 row mới), tức có thể tồn tại một
"lịch sử scan" để so sánh.

→ Đề xuất kỹ thuật khả dĩ (chỉ là gợi ý, **chưa phải quyết định**, cần người
dùng xác nhận hoặc chỉnh sửa):
- "Detected": bản ghi scan **sớm nhất** của ticket+scanner_type có
  `unresolved_count > 0`.
- "Resolved": bản ghi scan **sớm nhất sau đó** (theo thời gian) của cùng
  ticket+scanner_type có `unresolved_count = 0`.
- Resolution time = timestamp(resolved) − timestamp(detected).
- Cột timestamp nào dùng để so sánh: `collected_at` (đang được dùng làm thứ tự
  "mới nhất" trong code hiện có), hay `started_at`/`finished_at`?

Nếu ticket chưa từng có scan nào với `unresolved_count = 0` sau khi đã có
`unresolved_count > 0` → coi là "chưa resolved" (chưa có giá trị).

### OI-15. Cách kết hợp nguồn "SAST" và nguồn "review" — **RESOLVED, 2026-08-17**

**Quyết định:** Chỉ dùng nguồn `tbl_fact_security_scan` (SAST). **Không dùng**
nguồn "review" (`tbl_fact_finding` category `SECURITY`) trong phiên bản này —
loại khỏi scope. → **OI-16 do đó không còn áp dụng (moot)**, giữ lại ghi chú bên
dưới chỉ để tránh nhầm lẫn lịch sử.

### OI-16. (Moot — không còn áp dụng vì OI-15 chỉ chọn nguồn SAST)

Câu hỏi này chỉ áp dụng nếu dùng nguồn review; do OI-15 loại bỏ nguồn review nên
không cần trả lời.

### OI-14. Cách tính "resolution time" từ `tbl_fact_security_scan` — **RESOLVED, 2026-08-17**

**Quyết định:** Xác nhận đúng theo đề xuất kỹ thuật đã nêu (detected = scan sớm
nhất có `unresolved_count > 0`; resolved = scan sớm nhất sau đó có
`unresolved_count = 0`; resolution time = hiệu 2 mốc đó). **Cột so sánh:
`collected_at`** (đã xác nhận, không dùng `started_at`/`finished_at`).

### OI-11. Trường hợp biên (edge case) — **RESOLVED, 2026-08-17**

**Quyết định:** Ticket chưa có scan nào đạt `unresolved_count = 0` sau khi đã
phát hiện lỗi (SAST chưa "resolved") → hiển thị **`"-"`**. Áp dụng tương tự cho
trường hợp ticket không có scan SAST nào (không có cả detected scan).

### OI-12. Đơn vị & định dạng hiển thị — **RESOLVED, 2026-08-17**

**Quyết định:** Đơn vị tính là **giờ**, định dạng hiển thị **`HH:mm:ss`**.
(Điểm kỹ thuật phát sinh: `HH` có giới hạn 24 hay không khi resolution time vượt
1 ngày — chưa được xác nhận rõ, chuyển thành Human Decision H-SECFINDRES-2 trong
`spec-pack.md`, không chặn việc viết spec-pack vì đã có giả định hợp lý ghi rõ.)

### OI-13. Tên field chính xác — **RESOLVED, 2026-08-17**

**Quyết định:**

| Locale | Label |
|---|---|
| EN | Security Finding Resolution Time |
| VI | Thời gian xử lý finding bảo mật |
| JP | セキュリティ指摘解消時間 |

DTO key theo người dùng: `ResolutionTime`. Ghi chú kỹ thuật: toàn bộ field khác
trong `SecurityTicketDetail` hiện tại đều dùng camelCase (`ticketId`,
`findingCount`, `unresolvedCount`...). Đã đưa vào `spec-pack.md` như giả định
`resolutionTime` (camelCase) + Human Decision H-SECFINDRES-1 để xác nhận lại nếu
người dùng thực sự muốn PascalCase trong JSON.

### OI-5. Phạm vi tổng hợp (aggregation scope) — **RESOLVED bằng suy luận tất yếu, 2026-08-17**

Với việc người dùng xác nhận 1 label duy nhất + 1 DTO key duy nhất (OI-13) và 1
công thức duy nhất theo 1 nguồn duy nhất (OI-14/OI-15), phạm vi tất yếu là
**1 giá trị scalar duy nhất cho mỗi ticket**, không phải danh sách/trend. Ghi
nhận là suy luận tất yếu (không phải suy đoán tự do) trong `spec-pack.md`
(A-2).

### OI-6. Ngưỡng / SLA — **DEFERRED (không có trong scope phiên bản này)**

Người dùng không đề cập ngưỡng/cảnh báo khi trả lời đầy đủ OI-11/OI-12/OI-13 dù
đã được hỏi riêng trước đó. Ghi nhận là "ngoài phạm vi phiên bản này" trong
`spec-pack.md` (mục 2.2, A-5), có thể mở lại ở ticket sau nếu cần.

### OI-8. Bảng legacy `finding` (V1) — Non-blocking

Không còn liên quan sau khi OI-2 chốt dùng `tbl_fact_security_scan` +
`tbl_fact_finding`. Giữ lại ghi chú để tránh nhầm lẫn lịch sử, không cần trả
lời.

---

## Quan sát cần người dùng lưu ý (không phải câu hỏi cần trả lời, chỉ để minh bạch)

*(Đã lỗi thời — quan sát này áp dụng cho phương án `tbl_connector_run` đã bị
thay thế ở OI-2 lần 2, giữ lại chỉ để làm chứng cứ lịch sử phân tích.)*

~~`tbl_connector_run` đo thời lượng đồng bộ dữ liệu (ingestion) của connector,
không đo thời gian khắc phục một security finding cụ thể.~~ Với nguồn dữ liệu
mới (`tbl_fact_security_scan` + `tbl_fact_finding` category `SECURITY`), tên
field "Security Finding Resolution Time" **khớp đúng bản chất dữ liệu hơn**
(scan tìm ra lỗi bảo mật + review đánh dấu lỗi bảo mật, cả hai đều gắn với
ticket cụ thể). Quan sát còn lại: với nguồn SAST, "resolution time" là **giá
trị suy diễn** từ chuỗi scan theo thời gian (OI-14), không phải cột dữ liệu có
sẵn — cần người dùng xác nhận cách suy diễn này là chấp nhận được.

---

## Vòng trả lời cuối (2026-08-17) — chốt Human Decision trong spec-pack

- **H-SECFINDRES-1 (DTO casing)** — **RESOLVED**: `resolutionTime` (camelCase).
- **H-SECFINDRES-2 (định dạng >24h)** — **RESOLVED**: duration không giới hạn
  (vd. `48:00:00`).
- **H-SECFINDRES-3 (multi-cycle)** — **RESOLVED**: tính **tổng toàn bộ chu kỳ
  đã đóng** (không chỉ chu kỳ đầu tiên). Đã cập nhật lại toàn bộ BR-2→BR-6,
  Terminology, To-Be, AC (AC-SECFINDRES-7/8/9 mới), Examples trong
  `spec-pack.md` để phản ánh mô hình cộng dồn nhiều chu kỳ.

### Phát sinh mới khi hiện thực hóa H-SECFINDRES-3: OI-OPEN-CYCLE-MIX

Khi cho phép nhiều cycle cộng dồn, xuất hiện tình huống chưa từng được người
dùng trả lời trực tiếp: ticket có **N cycle đã đóng VÀ thêm 1 open cycle cuối
cùng** đang chạy dở. Claude đã suy luận kỹ thuật (ghi rõ là suy luận, không
phải quyết định) để dung hòa với OI-11 (chưa resolved → `"-"`): hiển thị tổng N
cycle đã đóng, bỏ qua open cycle, **không** trả về `"-"`. Xem `spec-pack.md`
mục 16 (H-SECFINDRES-4) và mục 17 (A-6). Đây là open issue mới, không chặn
`impl-plan.md` nhưng nên xác nhận trước khi code.

## Cách xử lý tiếp theo

**Toàn bộ điểm blocking đã được giải quyết, bao gồm `OI-OPEN-CYCLE-MIX`**
(xác nhận 2026-08-17: hiển thị tổng, bỏ qua open cycle — xem
`H-SECFINDRES-4` trong `spec-pack.md`). Còn 2 điểm không chặn:
`OI-6` (deferred, ngoài phạm vi) và `OI-INDEX`/`OI-DATA-RETENTION` (kỹ thuật,
để `impl-plan.md` xử lý). **Sẵn sàng chuyển sang `impl-plan.md`.**
