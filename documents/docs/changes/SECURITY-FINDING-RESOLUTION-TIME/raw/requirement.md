# Requirement Document - Security Finding Resolution Time

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Người dùng (trả lời trực tiếp trong phiên chat SDD), ghi lại bởi Claude
**Update date**: 2026-08-17 (Rev. 2 — OI-2 đổi từ `tbl_connector_run` sang
`tbl_fact_security_scan` + `tbl_fact_finding`)

> Nguồn: câu trả lời của người dùng cho `open-issues.md` qua 2 vòng trong phiên
> làm việc ngày 2026-08-17:
> - Vòng 1: OI-1, OI-2 (`tbl_connector_run`), OI-3, OI-4, OI-7.
> - Vòng 2: OI-2 **được sửa lại** thành `tbl_fact_security_scan`, kèm gợi ý cách
>   tính dùng nguồn "SAST/review theo từng ticket".
>
> Tài liệu này phản ánh **quyết định mới nhất (Rev. 2)**. Quyết định vòng 1 về
> `tbl_connector_run` được coi là **đã bị thay thế** — giữ lại trong
> `00_brainstorm.md` mục "Cập nhật 2026-08-17 (lần 2)" làm chứng cứ lịch sử, không
> lặp lại chi tiết ở đây. Phần nào người dùng chưa trả lời được giữ ở mục 9 (Open
> Points), không suy đoán thêm.

---

# 1. Screen Overview

- **Screen/Field name:** Security Finding Resolution Time (field mới, không phải
  màn hình mới).
- **Business purpose:** Bổ sung 1 field/metric vào Security Dashboard hiện có
  (`docs/changes/SECURITY-DASHBOARD/`) để thể hiện "resolution time" liên quan đến
  security finding của một ticket.
- **Vị trí hiển thị:** `SecurityTicketDetailDrawer`
  (`EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx`).
- **Goal of this version:** Đọc dữ liệu đã có sẵn để tính và hiển thị field này —
  **không xây pipeline ghi dữ liệu mới** (xác nhận theo OI-3).

---

# 2. Scope

## 2.1 In Scope (theo xác nhận của người dùng, Rev. 2)

- Thêm 1 field hiển thị "Security Finding Resolution Time" trong
  `SecurityTicketDetailDrawer` (OI-7).
- Nguồn dữ liệu (OI-2, Rev. 2): bảng **`tbl_fact_security_scan`**
  (`scanner_type = 'SAST'`) và bảng **`tbl_fact_finding`** lọc theo
  `category = 'SECURITY'` (nguồn "review"), tính theo từng ticket.
- Chỉ đọc dữ liệu đã tồn tại, không thêm ingestion/ghi dữ liệu mới (OI-3).

## 2.2 Out of Scope

- Không dùng `tbl_fact_security_finding` (orphaned, loại bỏ ở vòng trả lời đầu).
- Không dùng `tbl_connector_run` (loại bỏ ở vòng trả lời thứ hai — Rev. 2).
- Không tạo bảng/pipeline ghi dữ liệu mới.
- Chưa xác nhận: ngưỡng SLA, cảnh báo, biểu đồ xu hướng (xem mục 9).

---

# 3. Current State Summary

- `SecurityTicketDetailDrawer` hiện hiển thị 3 khối: Scans, Checklist, Exceptions
  (đọc trực tiếp từ
  `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx:66-165`).
  Không có khối/field nào về thời gian resolution.
- **`tbl_fact_security_scan`** (`V4__init_shema_v2.sql:740-758`): cột
  `security_scan_id`, `repository_id`, **`ticket_id`** (trực tiếp, không cần join
  gián tiếp), `pr_id`, `ci_run_id`, `scanner_type`, `scanner_name`, `status`
  (`run_status`), `severity`, `finding_count`, `unresolved_count`, `started_at`,
  `finished_at`, `collected_at`.
  - **Không có `detected_at`/`resolved_at` ở mức từng finding** — chỉ có số đếm
    tổng hợp theo mỗi lần scan.
  - `status` là `run_status` enum (`SUCCESS, FAILED, CANCELLED, SKIPPED, RUNNING,
    PENDING, UNKNOWN, QUEUED, IN_PROGRESS, FAILURE` — `V4:41`) — mô tả kết quả
    chạy scan, **không phải trạng thái finding đã resolve hay chưa**.
  - `SecurityDashboardJdbcAdapter.java:57-63` (`SAST_LATERAL_JOIN`) luôn lấy scan
    **mới nhất** theo `collected_at` cho `(ticket_id, scanner_type)` — cho thấy có
    thể có nhiều bản ghi scan theo thời gian cho cùng 1 ticket (lịch sử scan).
- **`tbl_fact_finding`** (`V4__init_shema_v2.sql:610-631`): cột `finding_id`,
  `ticket_id`, `pr_id`, `review_id`, `review_comment_id`, `source_actor_type_id`,
  `category_id`, `severity`, `status` (`finding_status`), `detected_at`,
  `resolved_at`.
  - Có **per-finding `detected_at`/`resolved_at`** — không cần suy diễn.
  - `category_id` trỏ tới `tbl_dim_finding_category`, trong đó **có category
    `SECURITY`** (seed data `V4__init_shema_v2.sql:1457`:
    `('SECURITY', 'Security', 'HIGH', 'Security issue')`) — đây là cơ sở cho
    "nguồn review" theo gợi ý của người dùng.
  - Đang được dùng (chỉ COUNT, không tính resolution time) bởi
    `DevDashboardJdbcAdapter.java`, `QaDashboardJdbcAdapter.java`,
    `EvidenceQualityScoreRepositoryAdapter.java`.

---

# 4. Target State Summary

Ticket detail drawer hiển thị thêm field "Security Finding Resolution Time",
tính từ 2 nguồn theo từng ticket:
1. SAST: suy diễn từ chuỗi bản ghi `tbl_fact_security_scan` theo thời gian (cách
   suy diễn cụ thể — xem OI-14, chưa chốt).
2. Review: `resolved_at - detected_at` trực tiếp từ `tbl_fact_finding` (category
   `SECURITY`).

Cách gộp 2 nguồn thành 1 giá trị hiển thị — xem OI-15 (chưa chốt).

---

# 5. Change Requirements (xác nhận từ người dùng, Rev. 2)

| # | Open Issue gốc | Quyết định của người dùng |
|---|---|---|
| OI-1 | Ticket có kế thừa SECURITY-DASHBOARD không? | **Có** — là field/metric mới bổ sung vào dashboard đó |
| OI-2 (Rev. 2) | Nguồn dữ liệu là bảng nào? | **`tbl_fact_security_scan`** (SAST) + **`tbl_fact_finding`** (category SECURITY, nguồn "review"), theo từng ticket. *(Thay thế quyết định Rev. 1: `tbl_connector_run`)* |
| OI-3 | Cần pipeline ghi dữ liệu mới không? | **Không** — dữ liệu đã có sẵn, chỉ cần đọc để tính KPI |
| OI-7 | Vị trí hiển thị? | Thêm trường trong `SecurityTicketDetailDrawer` |

> OI-4 (công thức tính, trả lời ở Rev. 1 cho `tbl_connector_run`) không còn áp
> dụng nguyên văn sau khi đổi nguồn dữ liệu — công thức mới đang chờ xác nhận ở
> OI-14/OI-15/OI-16.

---

# 6. Functional Requirements

1. Backend: với mỗi ticket, đọc `tbl_fact_security_scan` (scanner_type = SAST) và
   `tbl_fact_finding` (category = SECURITY) để tính resolution time.
   - **Chưa xác định**: công thức suy diễn cho SAST (OI-14), cách gộp 2 nguồn
     (OI-15), cách chọn finding nếu có nhiều review finding (OI-16).
2. Backend: expose giá trị này qua API detail của Security Ticket (khả năng mở
   rộng `SecurityTicketDetail` / `SecurityDashboardModels.java:123-135` và
   `SecurityDashboardDtos.java` tương ứng — **chưa xác nhận với người dùng**, đây
   là suy luận kỹ thuật để hiện thực OI-7, sẽ chốt ở `impl-plan.md`).
3. Frontend: thêm field hiển thị trong `SecurityTicketDetailDrawer.tsx`, và field
   tương ứng trong `SecurityTicketDetail` type (`EDCAP_FE/src/pages/security-dashboard/types.ts`).
   - **Chưa xác định**: format hiển thị, label chính xác, xử lý edge case (OI-11,
     OI-12).

---

# 7. Data Items

| Field | Nguồn | Kiểu | Ghi chú |
|---|---|---|---|
| `resolutionTime` (tên tạm, chưa chốt) | `tbl_fact_security_scan` (SAST, suy diễn) và/hoặc `tbl_fact_finding` (category SECURITY, `resolved_at - detected_at`) | Duration | Công thức SAST và cách gộp 2 nguồn chưa chốt — xem OI-14/OI-15 |

---

# 8. Acceptance Criteria

**Chưa thể viết AC hoàn chỉnh** — thiếu quyết định cho các điểm ở mục 9. Sẽ bổ
sung vào `spec-pack.md` sau khi các Open Points dưới đây được trả lời.

---

# 9. Open Points (chưa được người dùng trả lời — không suy đoán)

1. **OI-14 — Công thức suy diễn resolution time từ `tbl_fact_security_scan`.**
   Bảng này không có `detected_at`/`resolved_at` per finding. Đề xuất kỹ thuật
   (chưa phải quyết định): "detected" = scan sớm nhất có `unresolved_count > 0`;
   "resolved" = scan sớm nhất sau đó có `unresolved_count = 0`; resolution time =
   hiệu 2 timestamp đó. Cần xác nhận: đúng logic này không, và dùng cột thời gian
   nào (`collected_at`, `started_at`, hay `finished_at`)?
2. **OI-15 — Cách gộp nguồn SAST (suy diễn) và nguồn review (trực tiếp) thành 1
   giá trị hiển thị.** Hiển thị riêng 2 giá trị, gộp trung bình/lớn nhất/mới
   nhất, hay ưu tiên 1 nguồn?
3. **OI-16 — Nếu dùng nguồn review**, 1 ticket có thể có nhiều `tbl_fact_finding`
   category SECURITY — tính trên finding nào (mới nhất, trung bình, tất cả)?
4. **OI-11 — Trường hợp biên**: ticket chưa có scan nào đạt `unresolved_count = 0`
   sau khi phát hiện lỗi, hoặc không có finding/scan liên quan nào — hiển thị gì?
5. **OI-12 — Đơn vị & định dạng hiển thị**: giây/phút/giờ/ngày, làm tròn thế nào?
6. **OI-5 (từ open-issues.md, chưa trả lời dứt khoát)**: phạm vi tổng hợp — 1 giá
   trị cho ticket hay chi tiết hơn theo severity/scan?
7. **OI-6 (từ open-issues.md, chưa trả lời)**: có ngưỡng SLA/cảnh báo theo mức độ
   không?
8. **OI-13 — Tên field chính xác** (label UI đa ngôn ngữ, key API/DTO) — chưa
   được cung cấp, tên `resolutionTime` trong tài liệu này chỉ là placeholder.

Toàn bộ các điểm trên đã được đồng bộ vào `open-issues.md` (cập nhật) và phải
được trả lời trước khi `spec-pack.md` có thể coi là hoàn chỉnh.
