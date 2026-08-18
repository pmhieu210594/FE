# 00_brainstorm

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (SDD analyst)
**Update date**: 2026-08-17

## Purpose

Bổ sung 1 field mới **"Security Finding Resolution Time"** vào màn hình chi
tiết ticket của Security Dashboard (`SecurityTicketDetailDrawer`), tính thời
gian xử lý (resolution time) của các security finding phát hiện bởi SAST scan,
dựa trên dữ liệu đã có sẵn — không cần pipeline ghi dữ liệu mới.

## Known Information

- Ticket là field/metric mới bổ sung vào `docs/changes/SECURITY-DASHBOARD/`,
  không phải màn hình độc lập.
- Nguồn dữ liệu duy nhất: `tbl_fact_security_scan`
  (`EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql:740-758`),
  lọc `scanner_type = 'SAST'`, theo `ticket_id`.
- Bảng này **không có** `detected_at`/`resolved_at` per finding — chỉ có
  `unresolved_count` tổng hợp theo mỗi lần scan (`collected_at`). Resolution
  time phải **suy diễn** từ chuỗi scan theo thời gian, không đọc trực tiếp từ 1
  cột.
- Công thức đã chốt (chi tiết đầy đủ ở `spec-pack.md` §5–§7):
  - Duyệt lịch sử scan theo `collected_at` tăng dần.
  - Một "cycle" mở khi `unresolved_count` chuyển từ 0/chưa có dữ liệu sang > 0,
    đóng lại khi lần đầu tiên sau đó `unresolved_count = 0`.
  - `resolutionTime = Σ (resolved.collected_at - detected.collected_at)` của
    **tất cả cycle đã đóng** (quyết định "tính tổng toàn bộ chu kỳ", không chỉ
    chu kỳ đầu).
  - Chưa có cycle nào đã đóng → hiển thị `"-"`.
  - Đơn vị: giờ, định dạng `HH:mm:ss`, không giới hạn `HH` ở 24 (dạng duration).
  - DTO key: `resolutionTime` (camelCase, khớp convention hiện có của
    `SecurityTicketDetail`).
  - Label: EN "Security Finding Resolution Time", VI "Thời gian xử lý finding
    bảo mật", JP "セキュリティ指摘解消時間".
- Vị trí hiển thị: `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx`.
- Endpoint BE liên quan: `GET /api/v1/security/dashboard/tickets/{ticketId}`
  (`SecurityDashboardController.java`), trả về `SecurityTicketDetail`.
- Không tạo bảng/migration/pipeline ghi dữ liệu mới — chỉ đọc dữ liệu đã có.
- Các phương án nguồn dữ liệu khác (`tbl_fact_security_finding`,
  `tbl_connector_run`, `tbl_fact_finding` category `SECURITY`) đã bị loại bỏ
  qua các vòng trả lời trước — xem Phụ lục.

## Undetermined Points

**Không còn điểm blocking nào.** Điểm cuối cùng đã được người dùng xác nhận
(2026-08-17): khi ticket có N cycle đã đóng và thêm 1 open cycle cuối cùng
đang chạy dở → hiển thị **tổng của N cycle đã đóng, bỏ qua open cycle**
(`H-SECFINDRES-4`, `OI-OPEN-CYCLE-MIX` — đã Resolved trong `spec-pack.md`).

Các điểm phụ, không chặn implementation (đã ghi ở `spec-pack.md` §17/§18):

- Ngưỡng SLA/cảnh báo theo severity — deferred, ngoài phạm vi phiên bản này.
- `tbl_fact_security_scan` có index phù hợp cho truy vấn
  `(ticket_id, scanner_type, collected_at)` hay chưa — cần kiểm tra khi viết
  `impl-plan.md`.

## Expected Risks

- **Rủi ro business-logic**: công thức "cycle" là suy diễn từ dữ liệu lịch sử
  scan (không phải cột có sẵn) — nếu dữ liệu `tbl_fact_security_scan` không
  thực sự tích lũy lịch sử đầy đủ theo thời gian cho mỗi ticket (ví dụ bị dọn
  dẹp/archive), kết quả tính toán sẽ sai lệch mà không có cách phát hiện qua
  schema. Cần kiểm chứng bằng dữ liệu thực tế ở `impl-plan.md`/khi test.
- **Rủi ro performance**: truy vấn toàn bộ lịch sử scan theo ticket mỗi lần mở
  drawer có thể chậm nếu ticket có nhiều bản ghi scan và thiếu index phù hợp
  (`OI-INDEX`).
- **Rủi ro kiến trúc**: nếu logic cycle được viết trực tiếp trong SQL (theo
  phong cách `SecurityDashboardJdbcAdapter.java` hiện tại, vốn đặt nhiều logic
  trong raw SQL), sẽ khó unit test theo `40-testing.md` (yêu cầu mock port
  interface) — nên đặt logic cycle ở tầng `application/usecase`
  (`SecurityDashboardService`), adapter chỉ trả về raw scan history.

## What AI Needs to Investigate

- Đã hoàn tất trong các phase trước: xác nhận schema `tbl_fact_security_scan`,
  loại bỏ các phương án nguồn dữ liệu sai, xác nhận endpoint BE hiện có.
- Còn lại cho `impl-plan.md`: xác nhận index hiện có trên
  `tbl_fact_security_scan`, đọc toàn văn `SecurityDashboardServiceTest.java` và
  `SecurityScanRepositoryAdapterTest.java` để theo đúng pattern test hiện có,
  xác định vị trí chính xác thêm field trong `SecurityDashboardDtos.java`.

## What Humans Need to Ask

- Xác nhận có cần bổ sung ngưỡng SLA/cảnh báo (`OI-6`, hiện đang deferred) hay
  không, cho phiên bản này hoặc phiên bản sau — không blocking.

## Conditions Under Which Implementation Is Not Permitted

- **Đã gỡ bỏ điều kiện chặn về `OI-OPEN-CYCLE-MIX`** — đã được người dùng xác
  nhận 2026-08-17 (hiển thị tổng, bỏ qua open cycle). Có thể bắt đầu
  `impl-plan.md` và code logic tính cycle.
- Không được thêm ngưỡng SLA/cảnh báo màu sắc nếu chưa có quyết định mới (hiện
  tại ngoài phạm vi — `OI-6` deferred).
- Không được tạo bảng/migration DB mới, không được dùng lại các bảng đã bị
  loại (`tbl_fact_security_finding`, `tbl_connector_run`, `tbl_fact_finding`).
- Không được đặt logic tính cycle trong tầng `web`/`infrastructure` thuần SQL
  nếu không có unit test tương ứng ở tầng `application` (vi phạm
  `20-architecture.md` + `40-testing.md`).

---

## Phụ lục: Lịch sử ra quyết định đầy đủ (giữ nguyên bằng chứng, không rút gọn)

### Vòng 0 — Trước khi có quyết định của người dùng

Suy luận ban đầu (từ tên ticket, KHÔNG phải specification) từng cân nhắc
`tbl_fact_security_finding` làm nguồn dữ liệu — bảng này khớp tên miền nhưng
**không có bất kỳ code application nào dùng** (0 kết quả grep trong
`EDCAP_BE/src`), là bảng orphaned kể từ khi tạo migration V4. Phương án này đã
bị loại bỏ.

### Vòng 1 — OI-1, OI-2 (lần 1), OI-3, OI-4 (lần 1), OI-7 (lần 1)

- OI-1: Field mới bổ sung vào Security Dashboard hiện có.
- OI-2 (lần 1): Dùng `tbl_connector_run` — **sau đó bị thay thế ở vòng 2.**
- OI-3: Không cần pipeline ghi dữ liệu mới.
- OI-4 (lần 1): Công thức = `finished_at - started_at` của run trong "Recent
  runs" (Data Ops Dashboard) — gắn với `tbl_connector_run`, sau đó không còn áp
  dụng.
- OI-7 (lần 1): Vị trí hiển thị = `SecurityTicketDetailDrawer`.

Quan sát tại thời điểm đó: `tbl_connector_run` đo thời lượng đồng bộ dữ liệu
(ingestion) của connector, không đo thời gian khắc phục 1 security finding cụ
thể, và không có cột `ticket_id` — gây khó khăn khi nối với 1 ticket cụ thể.

### Vòng 2 — OI-2 sửa lại (Rev. 2)

Người dùng đổi quyết định: dùng **`tbl_fact_security_scan`**, gợi ý tính theo
nguồn "SAST/review theo từng ticket". Đối chiếu source code:
- `tbl_fact_security_scan` có `ticket_id` trực tiếp — giải quyết vấn đề nối
  ticket ↔ dữ liệu mà `tbl_connector_run` gặp phải.
- "SAST" khớp giá trị thật `scanner_type = 'SAST'`
  (`SecurityDashboardJdbcAdapter.java:57-63`).
- "review" từng được cân nhắc khớp với `tbl_fact_finding` category `SECURITY`
  (seed data `V4__init_shema_v2.sql:1457`), nhưng bị loại ở OI-15 (vòng 3).

Phát sinh 2 vấn đề kỹ thuật mới ở vòng này: cách tính resolution time từ
`tbl_fact_security_scan` (không có `detected_at`/`resolved_at` per finding —
OI-14), và cách kết hợp nguồn SAST + review (OI-15).

### Vòng 3 — OI-14, OI-15, OI-11, OI-12, OI-13

- OI-14: Xác nhận đúng đề xuất kỹ thuật (detected = scan sớm nhất
  `unresolved_count > 0`; resolved = scan sớm nhất sau đó
  `unresolved_count = 0`), cột so sánh = `collected_at`.
- OI-15: Chỉ dùng nguồn `tbl_fact_security_scan` — loại bỏ nguồn "review"
  (`tbl_fact_finding`).
- OI-11: Chưa có resolved scan sau khi phát hiện lỗi → hiển thị `"-"`.
- OI-12: Đơn vị giờ, định dạng `HH:mm:ss`.
- OI-13: Label EN/VI/JP; DTO key người dùng viết `ResolutionTime`.

Ở vòng này, spec-pack đầu tiên được viết với mô hình "chỉ tính chu kỳ đầu
tiên" (giả định A-4 cũ), kèm 3 Human Decision còn mở: DTO casing, định dạng khi
> 24 giờ, và xử lý nhiều chu kỳ.

### Vòng 4 — Chốt 3 Human Decision cuối

- DTO casing: **`resolutionTime`** (camelCase, không giữ PascalCase như người
  dùng viết ban đầu — áp dụng convention dự án).
- Định dạng > 24 giờ: **duration không giới hạn** (vd. `48:00:00`).
- Multi-cycle: **tính tổng toàn bộ chu kỳ đã đóng** (thay thế hoàn toàn giả
  định A-4 cũ "chỉ chu kỳ đầu tiên").

Khi hiện thực hóa quyết định multi-cycle, phát sinh điểm mơ hồ mới chưa được
hỏi trực tiếp: trường hợp hỗn hợp (N cycle đã đóng + 1 open cycle cuối) — xem
mục "Undetermined Points" ở trên (`OI-OPEN-CYCLE-MIX`).

### Vòng 5 (phiên hiện tại) — Tái cấu trúc theo template chính thức

Không có quyết định nghiệp vụ mới. Toàn bộ nội dung trên được tái cấu trúc vào
`spec-pack.md` theo 18 mục do người dùng chỉ định, và `sources.md`/
`00_brainstorm.md` được căn chỉnh theo
`docs/standards/templates/_ticket-template/`. Đã bổ sung tham chiếu kiến trúc
tới các flow hexagonal hiện có (Artifact Scanner, Evidence Quality Score) để
đảm bảo spec bám sát pattern triển khai thực tế của dự án.

### Vòng 6 — Chốt điểm mơ hồ cuối cùng

Người dùng xác nhận `OI-OPEN-CYCLE-MIX`/`H-SECFINDRES-4`: khi ticket có N cycle
đã đóng và thêm 1 open cycle cuối cùng đang chạy dở → **hiển thị tổng của N
cycle đã đóng, bỏ qua open cycle** (khớp với suy luận kỹ thuật A-6 đã đề xuất
trước đó). Đã cập nhật `spec-pack.md` (AC-SECFINDRES-8, BR-3/BR-5 note, A-6,
Open Issues, Human Decisions) sang trạng thái Resolved. **Không còn điểm
blocking nào — spec-pack sẵn sàng làm input cho `impl-plan.md`.**
