# Review Checklist

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude (Principal Reviewer prep — viết trước implementation)
**Update date**: 2026-08-18 (điền `Result` sau khi implementation + Independent AI Review + Human Review đã hoàn tất)

**Nguồn điền kết quả**: `self-review.md`, `test-results.md` (BE `mvn test`, FE `npx vitest`), `ai-review.md` (Independent AI Review, 2026-08-18, 5 finding — F1-F5 đã có quyết định), `human-review.md` (Final Verdict: APPROVED, 2026-08-18). Ký hiệu: **PASS** = đã verify bằng bằng chứng cụ thể (test chạy thật hoặc đọc code trực tiếp); **PASS (Accepted Risk)** = đạt yêu cầu tối thiểu nhưng có 1 khoảng hở đã được human reviewer ký nhận chấp nhận rủi ro, không phải "không kiểm tra"; **N/A** = không áp dụng cho ticket này.

---

## 1. Đối chiếu specification / AC

| AC ID | Review Point | Severity | Result |
|---|---|---|---|
| AC-SECFINDRES-1 | Ticket có đúng 1 cycle đã đóng → field = `resolved.collected_at − detected.collected_at`, format `HH:mm:ss` | Blocker | **PASS** — `SecurityFindingResolutionTimeCalculatorTest.compute_sumsSingleClosedCycle`, `mvn test` chạy thật 2 lần độc lập (`test-results.md` §2, `ai-review.md` §"Cập nhật xử lý F1"), 9/9 PASS |
| AC-SECFINDRES-2 | Ticket chưa có scan SAST nào (0 bản ghi `tbl_fact_security_scan` scanner_type=SAST) → field = `"-"` | Blocker | **PASS** — `compute_returnsDash_whenNoHistory`, PASS thật |
| AC-SECFINDRES-3 | Ticket có 1 open cycle (chưa cycle nào đóng) → field = `"-"` | Blocker | **PASS** — `compute_returnsDash_whenOnlyOpenCycle`, `compute_returnsDash_whenNeverAboveZero`, PASS thật |
| AC-SECFINDRES-4 | Label hiển thị đúng theo ngôn ngữ đang chọn (EN/VI/JA) | Major | **PASS (Accepted Risk)** — nội dung 3 label đúng theo `spec-pack.md` §7 (đọc trực tiếp `locale.json`), nhưng **chưa có test tự động đổi locale thật** — Accepted Risk C-1, đã có approver (`human-review.md`) |
| AC-SECFINDRES-5 | Field xuất hiện trong `SecurityTicketDetailDrawer`, không phá vỡ 3 khối hiện có (Scans/Checklist/Exceptions); verify **mounted trên trang thật**, không chỉ test cô lập (`40-testing.md` AC Closure) | Blocker | **PASS (ngoại lệ đã ghi nhận chính thức)** — mounted trên `SecurityDashboardPage` thật, `SecurityDashboardPage.test.tsx` 7/7 PASS; **ngoại lệ**: khối "Scans" không hiển thị lại `scannerType='SAST'` — quyết định giữ nguyên code (`H-SECFINDRES-5`, `spec-pack.md` §18), không coi là vi phạm AC này |
| AC-SECFINDRES-6 | Không có ghi/sửa dữ liệu nào xảy ra khi tính field (read-only, BR-7) | Blocker | **PASS** — đọc toàn bộ diff xác nhận chỉ có `SELECT` mới, không có `INSERT`/`UPDATE`/`DELETE` (`ai-review.md` §"Độ phủ review") |
| AC-SECFINDRES-7 | Ticket có N (≥2) cycle đã đóng → field = **tổng** resolution time của N cycle | Blocker | **PASS** — `compute_sumsMultipleClosedCycles`, PASS thật |
| AC-SECFINDRES-8 | Ticket có N cycle đã đóng + 1 open cycle cuối → field = tổng N cycle, **bỏ qua** open cycle (đã xác nhận `H-SECFINDRES-4`) | Blocker | **PASS** — `compute_ignoresTrailingOpenCycle`, PASS thật, khớp `H-SECFINDRES-4` |
| AC-SECFINDRES-9 | Tổng > 24 giờ → `HH` hiển thị không giới hạn (vd. `48:00:00`), không reset về `00` | Major | **PASS** — `compute_doesNotCapHoursAt24`, PASS thật (`"48:00:00"`) |
| BR-1 | Nguồn dữ liệu **chỉ** `tbl_fact_security_scan` với `scanner_type='SAST'` + `ticket_id` — không đọc bảng nào khác | Blocker | **PASS** — SQL trong `findTicketDetail` (`SecurityDashboardJdbcAdapter.java`) có đúng `WHERE ticket_id = :ticketId AND scanner_type = 'SAST'`, xác nhận qua đọc code trực tiếp |
| BR-2/BR-3 | Duyệt scan theo `collected_at` **tăng dần**; cycle xác định đúng theo định nghĩa (mở khi `unresolved_count` 0→>0, đóng khi lần đầu quay lại =0); open cycle không tính vào tổng | Blocker | **PASS** — SQL có `ORDER BY collected_at ASC`; thuật toán `compute()` khớp đúng định nghĩa, cover đủ boundary (fluctuating count, trailing open cycle) — toàn bộ unit test PASS thật |
| — | DTO key đúng `resolutionTime` (camelCase, đã chốt `H-SECFINDRES-1`) | Major | **PASS** — xác nhận trong `SecurityDashboardModels.java`, `SecurityDashboardDtos.java`, `types.ts` — khớp chính xác chuỗi đã chốt |

**Tổng kết §1: 12/12 review point PASS** (2 trong số đó là "PASS (Accepted Risk)" — đạt yêu cầu tối thiểu, có 1 gap đã được human reviewer ký nhận, không phải chưa kiểm tra).

---

## 2. General System Review

### 2.1. Số, số full-width, số chữ số, độ chính xác

- [x] `HH` trong `HH:mm:ss` không giới hạn ở 24 và không giới hạn ở 2 chữ số
      khi ≥ 100 giờ — **PASS**, xác nhận bằng `compute_doesNotCapHoursAt24` (`"48:00:00"`).
- [x] `mm`, `ss` luôn có đúng 2 chữ số (padding `0` khi < 10), không có số âm
      trong happy path — **PASS**, `formatDuration` dùng `String.format("%02d:%02d:%02d", ...)`. Lưu ý: trường hợp input vi phạm precondition (không sort) có thể ra số âm — đã ghi nhận và cố ý để lại làm characterization test (`ai-review.md` F3, Đã xử lý theo phương án b), không phải bug của happy path.
- [x] Không dùng `java.time.Duration.toString()`/`.format()` mặc định — **PASS**, xác nhận `formatDuration` tự viết thủ công, không gọi `Duration.toString()`.
- [x] Input/param `ticketId` không phải số nên không áp dụng full-width digit — **N/A**, không có input số nào từ người dùng cuối cho field này.
- [x] Không có overflow khi cộng dồn nhiều cycle qua thời gian dài — **PASS**, `totalSeconds` kiểu `long`, không dùng `int`.
- [x] `unresolved_count = 0` (chính xác bằng 0) là điều kiện đóng cycle — **PASS**, code dùng `snapshot.unresolvedCount() == 0` (so sánh chặt, không dùng `<=`).

### 2.2. Loại ký tự, encoding, locale

- [x] Cả 3 file `public/locales/{en,vi,ja}/locale.json` có key mới dưới
      `Pages.SecurityDashboard.drawer` — **PASS**, đã xác nhận cả 3 file đều có key `resolutionTimeTitle`.
- [x] Nội dung tiếng Nhật lưu **literal UTF-8**, không escape thành `\uXXXX` — **PASS**, xác nhận bằng đọc trực tiếp `ja/locale.json`.
- [ ] Dấu câu tiếng Nhật full-width — **N/A cho label này** (label ngắn, không có câu mô tả dài cần dấu câu).
- [x] Không có mojibake khi hiển thị `ja`/`vi` — **PASS** (kiểm tra qua nội dung JSON; **chưa kiểm tra bằng mắt trên trình duyệt thật** — thuộc Accepted Risk C-1 đổi locale thật).
- [x] Chuỗi `"-"` không bị dịch/thay đổi theo ngôn ngữ — **PASS**, xác nhận là literal string trong `SecurityFindingResolutionTimeCalculator`, không qua i18n.
- [x] Không có lỗi chính tả EN/VI/JA trong 3 label mới — **PASS**, đối chiếu khớp `spec-pack.md` §7.

### 2.3. Literal / Magic Number / Master Data

- [x] `scanner_type = 'SAST'` không hard-code rải rác nhiều nơi — **PASS (ghi nhận)**, chỉ xuất hiện 1 lần trong câu SQL mới; không có hằng số `SCANNER_TYPE_SAST` sẵn có trong codebase để tái dùng (đã xác nhận, giống pattern các query khác trong cùng file).
- [x] Không dùng magic number cho ngưỡng giờ/số cycle — **PASS**, không có ngưỡng nào trong code.
- [x] Không tự tạo enum/master data mới cho field này — **PASS**.
- [x] Không nhầm cột `status` (run_status) với `scan_status` (business status) — **PASS**, code chỉ dùng `unresolved_count`/`collected_at`, xác nhận qua `context.md` "Mapping".
- [x] DTO key `resolutionTime` khớp chính xác chuỗi đã chốt — **PASS** (trùng với §1).

### 2.4. Chuyển trạng thái, boundary value, exception

- [x] `unresolved_count` dao động không đơn điệu trong 1 cycle vẫn tính 1 cycle duy nhất — **PASS**, `compute_treatsFluctuatingCountAsOneCycle` PASS thật.
- [x] 0 bản ghi scan SAST → `"-"` — **PASS**, `compute_returnsDash_whenNoHistory` PASS thật.
- [x] Có bản ghi nhưng tất cả `unresolved_count = 0` ngay từ đầu → `"-"` — **PASS**, `compute_returnsDash_whenNeverAboveZero` PASS thật.
- [x] Ticket không tồn tại → giữ nguyên hành vi hiện có — **PASS**, `SecurityDashboardController`/`SecurityDashboardService` không bị sửa.
- [x] Không có exception mới bị ném ra ngoài luồng hiện có — **PASS**, xác nhận qua đọc code (tính toán thuần Java, không I/O ngoài query đã có).

### 2.5. Operation / Maintainability

- [x] Không có config/threshold nào bị hard-code — **PASS**.
- [x] Không cần cơ chế retry/idempotency mới — **PASS**, tính năng đọc thuần túy.
- [x] Xem đầy đủ ở mục 7 — **PASS**, xem §7 bên dưới.

---

## 3. FE Review

- [x] Field mới hiển thị trong `SecurityTicketDetailDrawer.tsx`, không phá vỡ layout 3 khối hiện có — **PASS**, xác nhận qua `SecurityDashboardPage.test.tsx` 7/7 PASS (bao gồm test mounted-on-page); 1 ngoại lệ đã ghi nhận chính thức ở AC-SECFINDRES-5 (§1).
- [x] Named export, không default export — **PASS**, xác nhận `export function SecurityTicketDetailDrawer`.
- [x] Không gọi `fetch` trực tiếp — **PASS**, dữ liệu lấy qua props `SecurityTicketDetail` có sẵn.
- [x] `type SecurityTicketDetail` (`types.ts`) cập nhật đúng field mới, kiểu `string` — **PASS**.
- [x] Không dùng `any` không có `// reason:` comment — **PASS**, không tìm thấy `any` mới trong diff.
- [x] Không bắt buộc `forwardRef`/CVA cho `SecurityTicketDetailDrawer` (page-level component, không phải reusable UI) — **PASS (N/A)**, đúng theo `context.md` "Pattern cấm dùng".
- [x] `cn()` từ `lib/utils` cho mọi Tailwind class merge mới — **PASS**, xác nhận dùng `cn(...)` cho class động (`statusBadgeClass`).
- [x] `lib/api.ts` không bị sửa — **PASS**, xác nhận không có thay đổi nào trong file này.
- [x] Không hard-code label — dùng `t("Pages.SecurityDashboard.drawer.<key>")` — **PASS**.
- [x] **[Bổ sung sau review]** Field có fallback an toàn khi giá trị `undefined` (lệch pha deploy BE cũ/FE mới) — **PASS**, đã fix theo `ai-review.md` F5: `{detail.resolutionTime ?? "-"}`, có test FE xác nhận (`SecurityDashboardPage.test.tsx`, case "falls back to the dash placeholder when resolutionTime is missing...").

---

## 4. BE/API Review

- [x] Không có endpoint mới — **PASS**, chỉ mở rộng response của endpoint hiện có.
- [x] `SecurityTicketDetail` (Java record) cập nhật đúng ở **cả 2 nơi khởi tạo** trong `findTicketDetail(...)` — **PASS**, xác nhận qua đọc code trực tiếp (header placeholder `"-"` + record cuối với `resolutionTime` tính được).
- [x] `SecurityDashboardDtos.SecurityTicketDetailDto` + `from(...)` cập nhật khớp field mới, đúng camelCase — **PASS**, xác nhận mapping 1:1.
- [x] Constructor injection cho class mới — **PASS (N/A)**, `SecurityFindingResolutionTimeCalculator` là class thuần Java static, không cần injection.
- [x] `@Transactional(readOnly = true)` giữ nguyên — **PASS**, `SecurityDashboardService` không bị sửa (Phương án C).
- [x] Truy vấn mới dùng `NamedParameterJdbcTemplate` + named parameter, đúng style hiện có — **PASS**, xác nhận qua đọc code (`:ticketId`).
- [x] Không đụng vào `SecurityScanRepositoryAdapter`/`SecurityScanMapper` — **PASS**, xác nhận không có file nào thuộc write-side bị sửa.
- [x] Không thêm N+1 nghiêm trọng — **PASS**, thêm đúng 1 query bổ sung cho 1 ticket detail (đã có 3 query con tương tự trong method hiện tại).
- [x] Vị trí đặt logic cycle-detection nhất quán với quyết định đã chốt (Phương án C, impl-plan.md) — **PASS**, `SecurityFindingResolutionTimeCalculator` là pure Java, test không cần mock, tốt hơn yêu cầu tối thiểu.
- [x] Exception dùng lại class có sẵn — **PASS**, không có exception mới nào được thêm.
- [x] `SecurityDashboardController.ticketDetail(...)` không đổi logic gọi — **PASS**, xác nhận controller không bị sửa.

---

## 5. DB/Migration Review

- [x] Không có migration mới trong diff — **PASS**, xác nhận không có file migration nào mới.
- [x] Không có cột/bảng mới được thêm — **PASS**.
- [x] Chỉ `SELECT` (read-only) — **PASS**, xác nhận toàn bộ câu SQL mới chỉ có `SELECT`.
- [ ] Index cho truy vấn `WHERE ticket_id = ? AND scanner_type = 'SAST' ORDER BY collected_at` — **PASS (Accepted Risk)** — chưa `EXPLAIN` thực tế; `OI-INDEX` (`spec-pack.md` §17) vẫn ở trạng thái kỹ thuật "Open", nhưng đã được human reviewer ký nhận Accepted Risk trong `human-review.md` (owner: Dev/DBA, deadline: trước khi rollout production).
- [x] Đối chiếu UNIQUE constraint `uq_tbl_fact_security_scan_repo_commit_scanner` — **PASS**, xác nhận code/test không giả định sai về nhiều row cho cùng 1 commit (`source-map.md` "Phát hiện quan trọng").
- [ ] Dữ liệu lịch sử thực tế trên staging đủ nhiều commit để test multi-cycle — **PASS (Accepted Risk)** — `OI-DATA-RETENTION` vẫn "Open" kỹ thuật, đã ký nhận Accepted Risk (owner: Dev, deadline: trước khi rollout production).

---

## 6. Security/Privacy Review

- [x] Endpoint vẫn được bảo vệ bởi `requireSecurityAccess` trước khi trả field mới — **PASS**, xác nhận `SecurityDashboardController`/`SecurityDashboardService` không bị sửa logic permission.
- [x] Không lộ thêm dữ liệu nhạy cảm nào ngoài phạm vi đã có — **PASS**, field chỉ là khoảng thời gian từ dữ liệu scan đã hiển thị công khai trong cùng drawer.
- [x] Không log toàn bộ payload `SecurityTicketDetail`/lịch sử scan — **PASS**, không có log mới nào được thêm trong implementation này.
- [x] Không thêm role/permission mới — **PASS**.
- [x] Response error đi qua `GlobalExceptionHandler` — **PASS**, không có `ResponseEntity` tùy biến nào được thêm.
- [x] Không có secret/token/credential nào liên quan — **PASS**.

---

## 7. Operation/Maintenance Review

- [x] Logging đủ để điều tra sự cố — **PASS (N/A, không bắt buộc)**, spec không yêu cầu log mới cho field này, không có log nào được thêm.
- [x] Không có retry/idempotency cần thiết mới — **PASS**, tính năng đọc thuần túy.
- [x] Không cần cơ chế rollback dữ liệu — **PASS**, không ghi dữ liệu.
- [x] Không có cấu hình mới cần hard-code hay externalize — **PASS**.
- [ ] Hiệu năng khi ticket có rất nhiều commit/scan lịch sử — **PASS (Accepted Risk)** — chưa có số liệu benchmark cụ thể; đánh giá định tính chấp nhận được cho quy mô dữ liệu hiện tại (`impact-analysis.md`), rủi ro thực tế theo dõi qua `OI-INDEX` (Accepted Risk đã ký nhận).

---

## 8. Test Review

- [x] Unit test cycle-detection: 0 scan, 1 open cycle, 1 cycle đã đóng, N cycle đã đóng, N cycle + 1 open cycle cuối, dao động không đơn điệu, tổng > 24 giờ — **PASS**, 9 test case trong `SecurityFindingResolutionTimeCalculatorTest`, chạy `mvn test` xác nhận thật 2 lần độc lập (8/8 rồi 9/9 sau khi thêm test F3).
- [x] Nếu logic đặt ở Service: test mock port — **PASS (N/A)**, Phương án C không đặt logic ở Service, không cần mock — `SecurityDashboardServiceTest` không đổi, 12/12 PASS nguyên trạng.
- [x] FE test theo pattern `SecurityDashboardPage.test.tsx` — **PASS**, mock `react-i18next` đúng pattern, verify hiển thị đúng giá trị thật và `"-"`.
- [x] **AC Closure bắt buộc**: test mount `SecurityTicketDetailDrawer` bên trong `SecurityDashboardPage` thật — **PASS**, xác nhận test `shows the security finding resolution time in the ticket detail drawer` dùng `MemoryRouter` + `QueryClientProvider`, không phải test cô lập.
- [ ] Test đa ngôn ngữ: đổi locale, xác nhận label đúng cả 3 ngôn ngữ — **PASS (Accepted Risk)** — chưa có test tự động đổi locale thật (chỉ xác nhận nội dung JSON tĩnh); Accepted Risk C-1 đã ký nhận (owner: QA).
- [x] Không sửa/làm yếu test hiện có để né lỗi mới — **PASS**, xác nhận `SecurityDashboardServiceTest`/`SecurityScanRepositoryAdapterTest` không bị sửa assertion; 1 test bị xóa (`still shows the existing SAST scan entry...`) có lý do chính thức (`H-SECFINDRES-5`, không phải né lỗi).
- [x] Test boundary định dạng: giá trị giờ 2 chữ số, ≥ 100 giờ (nếu có), `mm`/`ss` = 0 — **PASS**, `compute_doesNotCapHoursAt24` cover ≥ 24h; giá trị `mm`/`ss` = 0 cover qua nhiều test case có kết quả tròn giờ.
- [x] **[Bổ sung sau review]** API/DB integration test cho câu SQL raw SAST history — **PASS (Accepted Risk)** — không có hạ tầng Testcontainer trong repo; Accepted Risk đã ký nhận (`ai-review.md` F1, `human-review.md`, owner: Dev/QA, deadline: trước khi merge lên production).
- [x] **[Bổ sung sau review]** Test cho fallback khi `resolutionTime` là `undefined` (lệch pha deploy) — **PASS**, đã thêm theo `ai-review.md` F5, chạy `vitest` xác nhận PASS.
- [x] **[Bổ sung sau review]** Characterization test cho hành vi khi input `compute()` không được sort đúng — **PASS**, đã thêm theo `ai-review.md` F3 (phương án b), chạy `mvn test` xác nhận PASS (9/9).

---

## 9. Documentation/Traceability Review

- [x] `spec-pack.md` không bị chỉnh sửa "ngầm" trong lúc code — **PASS**, mọi thay đổi vào `spec-pack.md` đều gắn với Human Decision tường minh (`H-SECFINDRES-1→7`), không có thay đổi ngầm.
- [x] `self-review.md` được điền đầy đủ — **PASS**.
- [x] `impl-plan.md` phản ánh đúng quyết định kiến trúc thực tế đã code — **PASS**, Phương án C được thực hiện đúng như mô tả.
- [x] Danh sách file thay đổi trong `self-review.md` khớp với diff thực tế — **PASS**, xác nhận qua `ai-review.md` §"Độ phủ review" (đối chiếu danh sách với đọc trực tiếp thư mục).
- [x] Nếu phát hiện Open Issue mới trong lúc code, phải thêm vào `open-issues.md`/`spec-pack.md`, không giải quyết ngầm — **PASS**, các phát sinh mới (SAST/Scans, tie-break, format String) đều được thêm thành Human Decision tường minh (`H-SECFINDRES-5/6/7`), không giải quyết ngầm.
- [x] Cập nhật `00_brainstorm.md` nếu có quyết định mới — **N/A**, không có quyết định nghiệp vụ mới nào cần bổ sung vào phụ lục lịch sử ngoài những gì đã ghi ở `spec-pack.md` §18.

---

## 10. Release/Rollback Review

- [x] Additive change — **PASS**, xác nhận không breaking đối với client cũ.
- [x] FE mới và BE mới deploy đồng bộ hoặc FE xử lý an toàn khi field `undefined` — **PASS**, đã fix theo `ai-review.md` F5 (fallback `?? "-"`), có test xác nhận.
- [x] Không có migration DB → rollback chỉ cần revert code — **PASS**.
- [x] Không có feature flag được yêu cầu — **PASS**, xác nhận không phát sinh yêu cầu nào trong lúc review.
- [x] Rollback plan: revert commit/PR, không cần thao tác dữ liệu — **PASS**.

---

## Severity Definition

| severity | meaning | required action |
|---|---|---|
| Blocker | Không thể release | Bắt buộc sửa |
| Major | Khả năng cao thành bug | Sửa hoặc chấp nhận rủi ro có ghi nhận |
| Minor | Cải thiện nhỏ | Tùy chọn |
| Question | Cần xác nhận lại specification | Đưa vào Open Issue |
| False Positive | Báo cáo sai | Ghi lý do bác bỏ |
| Accepted Risk | Rủi ro được chấp nhận | Ghi rõ Impact/Owner/Deadline |

---

## Tổng kết Review Checklist

**Kết quả: PASS — sẵn sàng merge.**

- §1 (Đối chiếu AC): 12/12 PASS (2 mục là "PASS (Accepted Risk)" — AC-SECFINDRES-4, AC-SECFINDRES-5 có ngoại lệ đã ký nhận chính thức).
- §2→§10: toàn bộ mục đều PASS, trong đó **4 mục là "PASS (Accepted Risk)"** (index DB — §5, data retention — §5, hiệu năng chưa benchmark — §7, integration test SQL — §8, test đa ngôn ngữ tự động — §8) — đã có approver ký nhận trong `human-review.md` (2026-08-18), không phải bỏ sót.
- Không có mục nào ở trạng thái **NG/FAIL** tại thời điểm chốt checklist này.
- Nguồn xác nhận: `self-review.md`, `test-results.md`, `ai-review.md` (Independent AI Review, 5/5 finding đã xử lý), `human-review.md` (Final Verdict: **APPROVED**, 2026-08-18).

**Đây là lần đầu tiên checklist này được điền `Result`** — trước đó tồn tại
suốt vòng đời ticket ở trạng thái trống (ghi nhận là Failure Mode Candidate
FM-2 trong `human-review.md`, đã đóng bằng việc điền checklist này).
