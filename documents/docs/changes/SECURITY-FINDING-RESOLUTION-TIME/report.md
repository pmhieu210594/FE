# report

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-18
**Author**: Claude (SDD Reporter)
**Update date**: 2026-08-18 (bản dựng lại sau khi `human-review.md` được APPROVED và `ai-review.md` chạy STEP F1)

---

## Tổng quan sửa đổi

Bổ sung field mới **"Security Finding Resolution Time"** (`resolutionTime`)
vào response của `GET /api/v1/security/dashboard/tickets/{ticketId}` và
hiển thị trong `SecurityTicketDetailDrawer.tsx`. Giá trị suy diễn từ lịch sử
`tbl_fact_security_scan` (`scanner_type='SAST'`) theo mô hình "cycle" (mở khi
`unresolved_count` 0→>0, đóng khi quay lại 0), cộng dồn toàn bộ cycle đã
đóng, bỏ qua cycle còn mở (H-SECFINDRES-4). Additive change — không
migration DB, không endpoint mới, không đổi contract khác.

**Trạng thái tại thời điểm viết report: ĐÃ APPROVED (human reviewer,
2026-08-18)**, khác với phiên báo cáo trước (khi đó còn 1 regression mở).
Toàn bộ điểm blocking đã được xử lý qua 1 chuỗi quyết định (`H-SECFINDRES-5`,
`H-SECFINDRES-6`, `H-SECFINDRES-7`) và 1 lượt Independent AI Review
(`ai-review.md`) chạy sau khi approve. Còn đúng **1 gap thủ tục non-blocking**
(`review-checklist.md` chưa được điền `Result`) và **3 finding Minor** từ
`ai-review.md` (F3, F4, F5) chưa được quyết định chính thức — không chặn
merge nhưng cần ghi nhận để không bị quên.

---

## Đối ứng specification/AC

| ACID | status | evidence |
|---|---|---|
| AC-SECFINDRES-1 | PASS | `SecurityFindingResolutionTimeCalculatorTest.compute_sumsSingleClosedCycle` — chạy thật bằng `mvn test`, 8/8 PASS (`test-results.md` §2, xác nhận lại lần 2 ở `ai-review.md` §"Cập nhật xử lý F1": `mvn -DskipITs -Dtest=SecurityFindingResolutionTimeCalculatorTest test` → BUILD SUCCESS) |
| AC-SECFINDRES-2 | PASS | cùng test suite + FE `renders the dash placeholder when no cycle has closed yet (BR-5)` PASS |
| AC-SECFINDRES-3 | PASS | cùng test suite trên |
| AC-SECFINDRES-4 (label EN/VI/JA) | PASS nội dung, **PARTIAL về tự động hóa test** | 3 label đúng theo `spec-pack.md` §7; **chưa có test tự động đổi locale thật** (Accepted Risk C-1, đã có approver) |
| AC-SECFINDRES-5 (mounted, không phá 3 khối cũ) | PASS **với 1 ngoại lệ đã ghi nhận chính thức** | `H-SECFINDRES-5` (`spec-pack.md` §18): SAST không còn hiển thị lại trong khối "Scans" (coi như đã chuyển sang `resolutionTime`) — quyết định giữ nguyên code, test mâu thuẫn đã bị xóa, `SecurityDashboardPage.test.tsx` hiện 6/6 PASS |
| AC-SECFINDRES-6 (read-only) | PASS (theo review code, không có test DB tự động) | Diff chỉ thêm `SELECT`; chưa có assert tự động "no write" (Can Follow Later C-5, không bắt buộc) |
| AC-SECFINDRES-7 | PASS | cùng BE test suite |
| AC-SECFINDRES-8 | PASS | cùng BE test suite; đúng quyết định `H-SECFINDRES-4` |
| AC-SECFINDRES-9 | PASS | cùng BE test suite (`compute_doesNotCapHoursAt24`, `"48:00:00"`) |

**9/9 AC ở trạng thái PASS** (không còn AC nào FAIL) — khác biệt so với báo
cáo trước đó (khi AC-SECFINDRES-5 còn FAIL do regression SAST/Scans, nay đã
đóng bằng Human Decision thay vì sửa code).

---

## Phạm vi ảnh hưởng

Additive-only trên 1 API/1 UI component đã tồn tại
(`SecurityDashboardModels.java`, `SecurityFindingResolutionTimeCalculator.java`
mới, `SecurityDashboardJdbcAdapter.java`, `SecurityDashboardDtos.java`,
`SecurityTicketDetailDrawer.tsx`, `types.ts`, 3 file `locale.json`). Không
migration DB, không endpoint mới, không đổi `SecurityDashboardService`/
`SecurityDashboardRepositoryPort`/`SecurityDashboardController`/`lib/api.ts`.
Chi tiết đầy đủ: `impact-analysis.md`.

**Thay đổi tài liệu phát sinh sau implementation** (không phải code):
`spec-pack.md` được cập nhật 3 lần sau khi implement để phản ánh Human
Decision phát sinh trong lúc review/test (`H-SECFINDRES-5/6/7`) — đây là
tài liệu, không phải rollback/thay đổi hành vi.

---

## Nội dung implementation

| file | summary | reasons |
|---|---|---|
| `SecurityDashboardModels.java` | Thêm record `SecurityScanSnapshot`; thêm field `resolutionTime` (String) vào cuối record `SecurityTicketDetail` | Kiểu raw cho lịch sử scan + field output mới |
| `SecurityFindingResolutionTimeCalculator.java` (mới) | Class Java thuần, `compute(List<SecurityScanSnapshot>)` → `String` (`HH:mm:ss`/`"-"`) | Thuật toán cycle-detection (BR-2→BR-6), tách để unit-test không cần mock (Phương án C, `impl-plan.md`) |
| `SecurityDashboardJdbcAdapter.java` | Thêm query raw SAST history (`ORDER BY collected_at ASC`, không `LIMIT`), gọi calculator, cập nhật **cả 2** nơi khởi tạo `SecurityTicketDetail` | Giữ nguyên pattern "Adapter tự assemble" |
| `SecurityDashboardDtos.java` | `SecurityTicketDetailDto` thêm field `resolutionTime`, cập nhật `from(...)` — đã xác nhận mapping 1:1 đúng thứ tự (`ai-review.md` §"Độ phủ review") | Expose field qua JSON |
| `types.ts` | `SecurityTicketDetail` thêm `resolutionTime: string` | FE type khớp BE |
| `SecurityTicketDetailDrawer.tsx` | Thêm block hiển thị `resolutionTime`; khối "Scans" giữ nguyên filter ẩn `scannerType='SAST'` (quyết định `H-SECFINDRES-5`, không sửa) | Hiển thị field mới; ngoại lệ Scans đã chính thức hóa |
| 3 file `locale.json` (en/vi/ja) | Thêm key `drawer.resolutionTimeTitle` | i18n 3 ngôn ngữ |
| `SecurityFindingResolutionTimeCalculatorTest.java` (mới) | 8 test case, chạy PASS thật bằng `mvn test` (xác nhận lại 2 lần độc lập) | Cover BR-2→BR-6, toàn bộ AC 1,2,3,7,8,9 |
| `SecurityDashboardPage.test.tsx` | Fixture cập nhật; xóa 1 test lỗi thời (`still shows the existing SAST scan entry...`, mâu thuẫn `H-SECFINDRES-5`); hiện 6/6 PASS | Đóng gap coverage FE + đồng bộ với quyết định mới |
| `spec-pack.md` | 3 lần cập nhật: sửa ví dụ §6 (27:30:00→51:30:00), thêm `H-SECFINDRES-5/6/7` §18, thêm ghi chú ngoại lệ AC-SECFINDRES-5 §6 | Phát hiện trong lúc implement/review, phải phản ánh vào spec để không lệch tài liệu-thực tế |

**Không đổi**: `SecurityDashboardService.java`, `SecurityDashboardRepositoryPort.java`,
`SecurityDashboardController.java`, `lib/api.ts`, mọi migration DB.

**Không sửa code trong pha review**: theo yêu cầu tường minh của human
reviewer ("giữ nguyên code cũ tránh ảnh hưởng"), toàn bộ các quyết định về
sau (M-1, F1) được xử lý bằng cập nhật tài liệu/xóa test lỗi thời, không
chỉnh sửa logic component/adapter đã chạy ổn định.

---

## Kết quả review

| review type | result | notes |
|---|---|---|
| Self Review | Điền đầy đủ (`self-review.md`) | Ghi nhận đúng thời điểm còn giới hạn môi trường (`mvn test` chưa chạy được) — đã gỡ bỏ ở phiên test sau |
| Independent AI Review | **Đã thực hiện** (`ai-review.md`, 2026-08-18) | 0 Blocker, 2 Major (F1, F2), 3 Minor (F3, F4, F5). Verdict: "Approve with comments". F1 đã xử lý trong cùng phiên (STEP F1: quyết định "Không fix", chính thức hóa Accepted Risk, có chạy lại `mvn test` xác nhận baseline 8/8 PASS không đổi). F2 khớp với Accepted Risk đã có (`H-SECFINDRES-7`). **F3, F4, F5 (Minor) vẫn ở trạng thái "Chưa xử lý"** — chưa có quyết định chính thức, không chặn merge nhưng cần theo dõi (xem "Open Issues") |
| Human Review | **Đã thực hiện, APPROVED** (`human-review.md`, 2026-08-18) | Tích hợp self-review + test-results; qua 2 vòng quyết định (M-1: giữ nguyên code SAST/Scans; 4 Open Question: tie-break/format String/Review Mode/CTooltip) đã đóng toàn bộ Must Fix và Should Fix S-1/S-2. Final Verdict: **APPROVED** |

**Gap thủ tục còn lại**: `review-checklist.md` (khung review viết trước
implementation) **vẫn còn nguyên cột `Result` trống** — chưa từng được điền
bởi bất kỳ ai. `ai-review.md` đóng vai trò review độc lập thực tế đã chạy,
nhưng không tự động điền hộ `review-checklist.md` vì khác cấu trúc/mục đích
(ghi nhận rõ trong `human-review.md` mục S-3, không chặn merge).

---

## Kết quả test

| test type | result | evidence |
|---|---|---|
| BE Unit (`SecurityFindingResolutionTimeCalculatorTest`) | **PASS thật**, xác nhận **2 lần độc lập** bằng `mvn test` (8/8 cả 2 lần) | `test-results.md` §2 (lần 1, phiên Test Strategist); `ai-review.md` §"Cập nhật xử lý F1" (lần 2, phiên STEP F1) |
| BE Unit (`SecurityDashboardServiceTest`) | PASS (12/12) | `test-results.md` §2, §4 |
| BE Unit (`SecurityScanRepositoryAdapterTest`) | PASS (1/1) | `test-results.md` §2, §4 |
| BE `ArchitectureTest` | **Không tồn tại trong codebase** | Xác nhận qua `ai-review.md` C-4/F4-liên quan; Maven bỏ qua âm thầm, không phải gate thật |
| FE (`SecurityDashboardPage.test.tsx`) | **6/6 PASS** (đã đổi từ 7 xuống 6 sau khi xóa 1 test lỗi thời) | Chạy lại lần cuối trong phiên xử lý M-1: `npx vitest run "SecurityDashboardPage.test.tsx"` → 6/6 PASS |
| API/DB Integration test cho query raw SAST history mới | **Không tồn tại, không chạy được — đã chính thức hóa thành Accepted Risk** | Thiếu hạ tầng Testcontainer trong repo (`test-results.md` §8, `ai-review.md` F1) |
| Black-box test cases (BB-001→BB-016) | **Vẫn chưa có bằng chứng đã thực thi** | `blackbox-testcases.md` là bảng test case thiết kế, không có log kết quả thực thi — **không đổi so với báo cáo trước**, cần nêu rõ đây vẫn là gap chưa xử lý |

**Không được báo cáo là "đã test đầy đủ"**: chưa từng chạy black-box test
case nào trên môi trường thật (BB-001→BB-016), chưa có integration test cho
SQL mới (đã Accept Risk, không phải đã test), chưa có test tự động cho đổi
locale thật (đã Accept Risk).

---

## Viewpoint security / operation

- Read-only, tái sử dụng `requireSecurityAccess` hiện có, không thêm
  permission/role mới, không secret/token liên quan (`spec-pack.md` §11).
- Không log payload nhạy cảm (không thêm log mới trong implementation này).
- `OI-INDEX` (index cho `(ticket_id, scanner_type, collected_at)`) và
  `OI-DATA-RETENTION` (xác minh dữ liệu lịch sử không bị archive) **vẫn ở
  trạng thái "Open" trong `spec-pack.md` §17** — nhưng đã được human reviewer
  ký nhận thành Accepted Risk trong `human-review.md` (không mâu thuẫn: "Open"
  ở spec-pack nghĩa là chưa xác minh kỹ thuật, "Accepted" ở human-review
  nghĩa là đã đồng ý merge dù chưa xác minh — 2 trạng thái khác chiều, cần
  đọc cả 2 để hiểu đầy đủ).
- **Tie-break khi `collected_at` trùng nhau**: đã có quyết định chính thức
  chấp nhận rủi ro (`H-SECFINDRES-7`) — không thêm secondary sort key.

---

## Accepted risk

| risk | impact | owner | deadline | approver | status |
|---|---|---|---|---|---|
| Không có API/DB integration test cho SQL mới trong `findTicketDetail` | Trung bình-Cao — sai điều kiện WHERE/JOIN/alias không bị bắt bởi test tự động, chỉ phát hiện qua review thủ công hoặc lỗi thực tế production | Dev/QA | Trước khi merge lên production | **Human reviewer, 2026-08-18** | CLOSED (ký nhận) |
| `OI-INDEX` — chưa xác nhận index cho `(ticket_id, scanner_type, collected_at)` | Trung bình — performance nếu ticket có nhiều lịch sử scan | Dev/DBA | Trước khi rollout production | **Human reviewer, 2026-08-18** | CLOSED (ký nhận, chưa xác minh kỹ thuật) |
| `OI-DATA-RETENTION` — chưa xác minh dữ liệu staging đủ nhiều commit để test multi-cycle thật | Thấp-Trung bình — nếu dữ liệu bị archive, `resolutionTime` tính thiếu một cách âm thầm | Dev | Trước khi rollout production | **Human reviewer, 2026-08-18** | CLOSED (ký nhận, chưa xác minh kỹ thuật) |
| Tie-break `collected_at` trùng nhau (2 bản ghi SAST scan cùng timestamp) — không có secondary sort key | Thấp — hiếm khi xảy ra, nhưng khi xảy ra `resolutionTime` có thể non-deterministic giữa các lần chạy | Product owner/Dev | Đã accept, không cần deadline | **Human reviewer, 2026-08-18** | CLOSED — chính thức hóa `H-SECFINDRES-7` |
| Chưa có test tự động đổi locale thật (vi/ja) | Thấp — chỉ là copy text tĩnh | QA | Có thể bổ sung sau merge | **Human reviewer, 2026-08-18** | CLOSED (ký nhận) |
| `ArchitectureTest` không tồn tại dù được tài liệu (`CLAUDE.md`/`impl-plan.md`) coi là gate bắt buộc | Trung bình — không có gate ArchUnit thật nào bảo vệ quyết định đặt layer cho `SecurityFindingResolutionTimeCalculator`; tài liệu tạo cảm giác an toàn giả | Tech Lead | Ngoài phạm vi ticket này — theo dõi riêng | **Human reviewer, 2026-08-18** | CLOSED (ký nhận, theo dõi ở ticket khác) |

**Khác biệt so với báo cáo trước**: toàn bộ 6 Accepted Risk ở lần báo cáo
trước đều **chưa có approver** ("chưa có — cần reviewer ký tên"); nay **cả
6 đã có chữ ký chính thức của human reviewer** (2026-08-18). Đây là tiến
triển thực chất, không phải chỉ đổi câu chữ.

---

## Open Issues

| issue | impact | next action |
|---|---|---|
| **[Mới, từ `ai-review.md` F3]** `SecurityFindingResolutionTimeCalculator.compute()` không có defensive check khi input không được sắp xếp đúng theo `collectedAt` — vi phạm precondition sẽ cho `totalSeconds` âm, `formatDuration` không xử lý số âm (`"-01:-01:-01"`) | Minor — không phải bug đang xảy ra (happy path adapter luôn sort đúng), nhưng không có gì bảo vệ contract ngoài Javadoc | Cân nhắc tự sort trong `compute()` hoặc thêm 1 test "characterization" ghi nhận rủi ro. Chưa có quyết định chính thức — human reviewer chưa xác nhận |
| **[Mới, từ `ai-review.md` F4]** Query `checklistSections` trong `findTicketDetail` không lọc theo `artifact_snapshot_id` mới nhất — có thể trả về section trùng `section_type` từ nhiều phiên bản artifact khác nhau. **Pre-existing, không do ticket này gây ra** | Ngoài phạm vi AC-SECFINDRES-*, ảnh hưởng khối "Checklist" hiện có | Mở finding/ticket riêng để xác nhận với BA — không fix trong ticket này |
| **[Mới, từ `ai-review.md` F5]** Chưa có test tự động cho trường hợp `resolutionTime` là `undefined` (lệch pha deploy BE cũ/FE mới) — component không có fallback tường minh (`?? "-"`) | Minor — không crash nhưng hiển thị rỗng, khác `"-"` đã định nghĩa ở BR-5 | Thêm test FE mock response thiếu field; cân nhắc thêm fallback trong component (ngoài phạm vi "chỉ review" của `ai-review.md`, cần 1 pass fix riêng) |
| `review-checklist.md` — cột `Result` vẫn để trống | Thủ tục — chưa có gate chính thức xác nhận từng review point đã qua | Có thể điền retroactive dựa trên `ai-review.md` + `human-review.md`, hoặc chấp nhận `ai-review.md` là review độc lập thay thế (cần quyết định chuẩn hóa quy trình, không riêng ticket này) |
| `OI-INDEX`, `OI-DATA-RETENTION` (kế thừa spec-pack §17) | Xem "Accepted risk" — đã CLOSED bằng ký nhận, nhưng chưa xác minh kỹ thuật | Thực hiện `EXPLAIN`/xác minh staging trước khi rollout production, đúng deadline đã ghi |

---

## Human Decisions

| decision | owner | result |
|---|---|---|
| DTO key casing (`resolutionTime` camelCase) | Người dùng | Resolved — `H-SECFINDRES-1` |
| Định dạng `HH:mm:ss` không giới hạn 24h | Người dùng | Resolved — `H-SECFINDRES-2` |
| Xử lý nhiều cycle: tính tổng toàn bộ cycle đã đóng | Người dùng | Resolved — `H-SECFINDRES-3` |
| N cycle đã đóng + 1 open cycle cuối → hiển thị tổng, bỏ qua open cycle | Người dùng | Resolved (2026-08-17) — `H-SECFINDRES-4` |
| SAST bị ẩn khỏi khối "Scans" — chủ đích hay bug? | Người dùng | **Resolved (2026-08-18)** — `H-SECFINDRES-5`: giữ nguyên code, không sửa, để tránh ảnh hưởng code đã ổn định |
| `resolutionTime` trả `String` đã format sẵn ở BE (không phải số giây thô) | Người dùng | **Resolved (2026-08-18)** — `H-SECFINDRES-6`: xác nhận đúng ý muốn |
| Tie-break `collected_at` trùng nhau: thêm secondary sort key hay chấp nhận rủi ro? | Người dùng | **Resolved (2026-08-18)** — `H-SECFINDRES-7`: chấp nhận rủi ro |
| Review Mode: nâng lên `Heavy` hay giữ `Standard`? | Người dùng | **Resolved (2026-08-18)** — giữ `Standard`, không đổi `spec-pack.md` §15 |
| Hành vi `CTooltip` lạ trong JSDOM khi test — có phải vấn đề UX thật? | Người dùng | **Resolved (2026-08-18)** — xác nhận là đặc thù môi trường test, không cần điều tra thêm |

**Tất cả 9 Human Decision của ticket này đều đã Resolved** — không còn mục
nào ở trạng thái Open.

---

## Source Analysis Limitations

- Toàn bộ quyết định nghiệp vụ (nguồn dữ liệu, công thức, format, label) đã
  **Available** — xác nhận trực tiếp bởi người dùng qua nhiều vòng hỏi-đáp
  (`open-issues.md`) + 3 vòng bổ sung sau implementation (`H-SECFINDRES-5/6/7`).
- Chưa xác minh bằng dữ liệu thực tế (staging/production) rằng
  `tbl_fact_security_scan` tích lũy đầy đủ lịch sử không bị archive (`A-7`,
  `OI-DATA-RETENTION`) — đã Accept Risk, không phải đã xác minh.
- Không có hạ tầng test tích hợp DB (Testcontainer) sẵn có trong repo — giới
  hạn khả năng test tự động hóa phần SQL mới, đã Accept Risk.
- `ai-review.md` được viết **không có git repository** trong workspace này
  — không có `git diff`/`git show` để đối chiếu độc lập; diff được suy ra từ
  danh sách file trong `self-review.md` + đọc trực tiếp code trên đĩa. Đây
  là giới hạn về evidence, đã ghi nhận tường minh trong `ai-review.md`.

---

## What worked

- Phương án kiến trúc "C" (tách `SecurityFindingResolutionTimeCalculator`
  thành pure Java class) cho phép unit test đầy đủ BR-2→BR-6 mà không cần
  mock — đã chạy PASS thật **2 lần độc lập** (8/8 cả 2 lần), không có nghi
  ngờ nào về tính đúng đắn của thuật toán cốt lõi.
- Quy trình tách bạch rõ ràng giữa "quyết định business/chấp nhận rủi ro"
  (Human Decision, ghi vào `spec-pack.md`) và "không tự ý sửa code khi có
  yêu cầu tường minh giữ nguyên" — khi human reviewer yêu cầu "giữ nguyên
  code cũ tránh ảnh hưởng", AI đã tuân thủ đúng, chỉ cập nhật tài liệu/xóa
  test lỗi thời thay vì chỉnh sửa component.
- Independent AI Review (`ai-review.md`) chạy **sau** khi ticket đã APPROVED
  vẫn phát hiện thêm 3 finding Minor mới (F3, F4, F5) không có trong
  `human-review.md` trước đó — chứng minh giá trị của việc có 1 lượt review
  độc lập bằng phương pháp khác (đọc code tĩnh có hệ thống theo template)
  thay vì chỉ dựa vào self-review.

---

## What failed

- **`review-checklist.md` chưa bao giờ được điền `Result`** trong suốt vòng
  đời ticket — dù được tạo ra chính vì mục đích này trước implementation.
  Đây là gap quy trình lặp lại từ báo cáo trước, vẫn chưa được đóng.
- Regression thật (SAST bị ẩn khỏi Scans) lọt vào implementation ban đầu và
  chỉ được phát hiện ở phiên test sau — cuối cùng được xử lý bằng cách đổi
  spec để khớp code, không phải sửa code để khớp spec ban đầu. Đây là lựa
  chọn hợp lệ (có Human Decision rõ ràng) nhưng cần lưu ý: **AC-SECFINDRES-5
  hiện đạt được là nhờ spec được nới lỏng, không phải vì implementation ban
  đầu đúng theo đặc tả gốc**.
- `ai-review.md` phát hiện F3/F4/F5 nhưng **chưa có ai (kể cả human
  reviewer) xác nhận chính thức** các finding này trước khi viết report —
  report này phải tự liệt kê chúng vào "Open Issues" thay vì có sẵn quyết
  định, nghĩa là chu trình review chưa thực sự khép kín trước khi tới bước
  report.

---

## Ứng viên cập nhật Failure Mode Index

- **FM: "Filter/thay đổi ngầm ở component đang sửa cho mục đích khác"** —
  khi thêm 1 field hiển thị mới vào 1 component có sẵn, cần kiểm tra diff
  không vô tình đổi/ẩn nội dung khối khác (case cụ thể: filter
  `scannerType !== "SAST"` không nằm trong bất kỳ bước nào của `impl-plan.md`).
- **FM: "Review checklist tồn tại nhưng không có gate bắt buộc điền kết quả
  trước khi coi ticket là review-complete"** — ticket này minh chứng rõ:
  `review-checklist.md` tồn tại suốt vòng đời ticket mà không bao giờ được
  điền, kể cả sau khi có Independent AI Review và Human Review riêng biệt.
- **FM: "`ArchitectureTest` được nhắc tới trong tài liệu như 1 gate bắt buộc
  nhưng không tồn tại trong codebase"** — cần audit lại toàn bộ mention của
  `ArchitectureTest` trong `CLAUDE.md`/rules.
- **FM: "Business rule không định nghĩa tie-break cho timestamp trùng
  nhau"** — khi thiết kế logic suy diễn từ chuỗi thời gian, spec-pack nên
  luôn yêu cầu xác nhận rõ hành vi tie-break trước khi chuyển sang impl-plan.
- **[Mới]** **FM: "Pure-function core logic có precondition ('caller phải
  sort') chỉ được ghi ở Javadoc, không được test/enforce"** — khi tách 1
  thuật toán thành pure function để dễ test (như Phương án C ở ticket này),
  cần đặc biệt cẩn thận với precondition ngầm định dựa vào caller — nếu
  không tự validate/sort bên trong, nên có ít nhất 1 test "characterization"
  ghi nhận hành vi khi vi phạm precondition, không chỉ dựa vào docstring.
- **[Mới]** **FM: "Additive field mới không có fallback tường minh cho
  trường hợp `undefined` do lệch pha deploy"** — `impl-plan.md` có nêu yêu
  cầu "FE không crash khi field `undefined`" nhưng không có test nào xác
  nhận điều này, và component cũng không có fallback code tường minh — cần
  đưa "test lệch pha deploy" thành hạng mục bắt buộc trong `test-plan.md`
  cho mọi additive field mới, không chỉ nêu ở impl-plan rồi bỏ qua.
- **[Mới]** **FM: "Independent AI Review chạy sau khi đã APPROVED vẫn tìm
  thấy finding mới mà human reviewer chưa xác nhận trước khi report"** —
  cần quy định rõ thứ tự: Independent AI Review nên chạy **trước** khi
  Human Review ra Final Verdict, không phải sau, để tránh tình trạng ticket
  "đã APPROVED" nhưng vẫn phát sinh finding chưa qua quyết định chính thức.

---

## Ứng viên cập nhật Living Docs

- `docs/standards/testing.md`: bổ sung hướng dẫn cụ thể hơn về việc test SQL
  mới trong adapter đọc khi không có sẵn hạ tầng Testcontainer.
- `.claude/rules/40-testing.md`: làm rõ `ArchitectureTest` là gate **kỳ
  vọng**, không phải gate đã tồn tại — hoặc bổ sung `ArchitectureTest` thật.
- `docs/standards/templates/_ticket-template/review-checklist.md`: thêm
  ràng buộc rõ ràng rằng cột `Result` phải được điền trước khi ticket được
  coi là sẵn sàng cho `report.md` — ticket này là ví dụ cụ thể của việc
  thiếu ràng buộc này gây ra gap kéo dài suốt vòng đời ticket.
- `docs/standards/templates/ai-review.template.md` hoặc quy trình liên quan:
  cân nhắc quy định thứ tự bắt buộc "Independent AI Review chạy trước Human
  Review Final Verdict" để tránh tình huống ticket đã APPROVED nhưng vẫn có
  finding Minor/Major mới phát sinh sau đó chưa qua quyết định chính thức.
- `impl-plan.md` template: thêm mục bắt buộc "test lệch pha deploy" cho mọi
  additive field mới ở response API công khai.

---

## Next actions

1. **Không blocking** — Human reviewer xác nhận chính thức 3 finding Minor
   còn "Chưa xử lý" từ `ai-review.md` (F3: defensive check, F4: pre-existing
   Checklist query issue ngoài phạm vi, F5: thiếu test fallback `undefined`).
2. **Không blocking** — Điền `review-checklist.md` (cột `Result`) dựa trên
   `ai-review.md` + `human-review.md` đã có, để đóng gap thủ tục lặp lại
   nhiều phiên.
3. Thực hiện `EXPLAIN` thực tế cho `OI-INDEX` và xác minh dữ liệu staging
   cho `OI-DATA-RETENTION` — đúng deadline "trước khi rollout production"
   đã ghi trong Accepted Risk.
4. Bổ sung test tự động cho đổi ngôn ngữ vi/ja (P2, không chặn merge, đã
   Accept Risk).
5. Nếu có capacity: mở finding/ticket riêng cho F4 (query `checklistSections`
   không lọc snapshot mới nhất) — không thuộc phạm vi ticket này nhưng ảnh
   hưởng tính đúng đắn của khối "Checklist" hiện có.
6. Đưa các đề xuất ở "Ứng viên cập nhật Living Docs" vào backlog cải tiến
   quy trình SDD (không phải công việc của riêng ticket này).

## Final Verdict

**APPROVED** (human reviewer, 2026-08-18) — không còn Blocker, không còn
Major/Question nào ở trạng thái mở chưa quyết định (F1/F2 đã đóng thành
Accepted Risk). 3 finding Minor (F3, F4, F5) và 1 gap thủ tục
(`review-checklist.md`) là follow-up không chặn merge, đã liệt kê đầy đủ ở
"Open Issues"/"Next actions" để không bị thất lạc sau khi đóng ticket.
