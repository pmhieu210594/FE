# human-review

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-18
**Author**: Claude (Review Coordinator)
**Update date**: 2026-08-18 

---

## Executive Summary

- 7/9 AC có test chạy thật **PASS** (BE `mvn test`: `SecurityFindingResolutionTimeCalculatorTest` 8/8, `SecurityDashboardServiceTest` 12/12, `SecurityScanRepositoryAdapterTest` 1/1).
- **Tất cả vấn đề tồn đọng đã được xử lý (2026-08-18)**: 6/6 Accepted Risk có
  approver ký tên, 4/4 Open Question đã có câu trả lời chính thức (ghi vào
  `spec-pack.md` `H-SECFINDRES-6`/`H-SECFINDRES-7`), S-1/S-2 trong Should Fix
  đã đóng thành Accepted Risk. Không còn mục nào ở trạng thái "pending/chưa
  có" trong tài liệu này — chỉ còn S-3 (điền `review-checklist.md` đầy đủ) là
  follow-up thủ tục, không chặn merge.

---

## Must Fix Before Merge

*(Trống.)*

---

## Should Fix

| # | file path | căn cứ | ảnh hưởng | đề xuất sửa | test? |
|---|---|---|---|---|---|
| S-1 | `EDCAP_BE/.../infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` (query raw SAST history mới trong `findTicketDetail`) | Không có API/DB integration test cho câu SQL mới; repo có dependency `testcontainers:postgresql` nhưng 0 usage thực tế — không có pattern sẵn để tham khảo (`test-results.md` §8) | Trung bình-Cao — sai điều kiện WHERE/JOIN/alias không bị bất kỳ test tự động nào bắt được, chỉ phát hiện qua review thủ công hoặc lỗi thực tế production | ~~Ngắn hạn: reviewer tự đọc kỹ SQL... dài hạn: cân nhắc dựng test tích hợp tối thiểu~~ **Đã chuyển thành Accepted Risk** (`ai-review.md` F1, "Không fix" — xem bảng Accepted Risks) | **Không** |
| ~~S-2~~ | `SecurityFindingResolutionTimeCalculator.compute(...)` — case 2 scan trùng `collected_at` | BR-2 (`spec-pack.md`) không định nghĩa tie-break | ~~Trung bình~~ | ✅ **Resolved (2026-08-18)** — chấp nhận rủi ro, ghi nhận `H-SECFINDRES-7` (xem Open Questions #1 + Accepted Risks) | **Không** |
| S-3 | `docs/changes/.../review-checklist.md` | Toàn bộ cột `Result` đang để trống — không có bằng chứng review độc lập nào đã chạy qua diff cuối | Thủ tục — thiếu 1 tầng kiểm chứng trước merge theo quy trình dự án | **Đã có 1 phần**: `ai-review.md` (senior code review độc lập, 2026-08-18, 5 finding) đã chạy qua diff — nhưng **`review-checklist.md` bản thân vẫn còn nguyên cột `Result` trống** (khác cấu trúc/mục đích, `ai-review.md` không tự động điền hộ file này) | Không áp dụng |

---

## Can Follow Later

| # | file path | căn cứ | ảnh hưởng | đề xuất sửa | test? |
|---|---|---|---|---|---|
| C-1 | `public/locales/{vi,ja}/locale.json` + `SecurityTicketDetailDrawer.tsx` | AC-SECFINDRES-4 chỉ được xác nhận bằng đọc code/JSON, chưa có test tự động đổi locale thật; black-box BB-004 (manual) chưa có bằng chứng đã thực thi | Thấp — chỉ là copy text tĩnh, đã đối chiếu đúng `spec-pack.md` §7 | Bổ sung test tự động đổi locale (P2), hoặc ít nhất 1 lượt manual QA xác nhận BB-004 trước khi đóng ticket hẳn | **Không** |
| C-2 | `tbl_fact_security_scan` — index cho `(ticket_id, scanner_type, collected_at)` (`OI-INDEX`) | Chưa xác nhận có index hỗ trợ; UNIQUE constraint hiện có (`repository_id, commit_sha, scanner_type`) không hỗ trợ trực tiếp pattern truy vấn này | Trung bình — performance nếu ticket có nhiều lịch sử scan | `EXPLAIN` thực tế trước khi merge lên môi trường dữ liệu lớn | **Không** |
| C-3 | `tbl_fact_security_scan` retention (`OI-DATA-RETENTION`) | Chưa xác minh dữ liệu thực tế trên staging đủ nhiều commit để test multi-cycle thật (khác với unit test dùng dữ liệu giả lập) | Thấp-Trung bình — nếu dữ liệu bị archive, `resolutionTime` tính thiếu một cách âm thầm | Xác minh trên staging trước khi rollout production | **Không** |
| C-4 | Toàn bộ mention "`ArchitectureTest` phải xanh" trong `CLAUDE.md`/`impl-plan.md`/`review-checklist.md` | `ArchitectureTest` **không tồn tại** trong codebase (0 class khớp `@AnalyzeClasses`/ArchUnit trong `src/test`) — Maven bỏ qua tên test không khớp một cách âm thầm, không phải build fail | Trung bình — tài liệu tạo cảm giác an toàn giả; không có gate ArchUnit thật nào bảo vệ quyết định đặt layer của `SecurityFindingResolutionTimeCalculator` | Không thuộc phạm vi ticket này — mở ticket riêng để audit/dựng lại `ArchitectureTest`, hoặc sửa tài liệu không nhắc tới gate không tồn tại | **Không áp dụng cho ticket này** |
| C-5 | AC-SECFINDRES-6 (read-only) | Chỉ được đảm bảo bằng review code (chỉ có `SELECT`), chưa có assert tự động "no write" | Thấp — code hiện tại chỉ có 1 câu SELECT, giá trị của việc tự động hoá thấp | Có thể bổ sung static/DB assert nếu muốn (P3, optional) | **Không** |

---

## False Positives

| # | claim ban đầu | lý do bác bỏ |
|---|---|---|
| FP-1 | "`SecurityDashboardRepositoryPort`/`SecurityDashboardService` không được cập nhật — có thể là thiếu sót" | Đây là **chủ đích** theo Phương án C đã chốt ở `impl-plan.md` (tách calculator thuần Java, Adapter tự gọi trực tiếp, không cần thêm method port) — không phải bug, đã ghi rõ lý do kiến trúc |
| FP-2 | "`mvn test`/`mvn compile` chưa từng chạy được, không thể xác nhận BE test PASS" | Đúng tại thời điểm `self-review.md` được viết (giới hạn môi trường), nhưng **đã được gỡ bỏ và xác nhận lại** ở phiên test sau (`test-results.md` §2: `mvn test` chạy thật, 8/8 + 12/12 + 1/1 PASS) — claim này không còn áp dụng |
| FP-3 | "`SecurityDashboardServiceTest.java` cần sửa vì thêm field mới vào `SecurityTicketDetail`" | Xác nhận bằng grep: không có test nào trong file này construct `SecurityTicketDetail` thủ công — test cũ chạy PASS nguyên trạng (12/12), không cần sửa |
| FP-4 | "SAST bị ẩn khỏi khối 'Scans' là bug cần code fix" | **Đã được human reviewer xác nhận là chấp nhận được** — quyết định giữ nguyên code (`H-SECFINDRES-5`, `spec-pack.md` §18), không phải bug cần sửa. Test tương ứng đã bị xóa vì không còn phản ánh hành vi mong muốn |

---

## Accepted Risks

| risk | impact | owner | deadline | approver |
|---|---|---|---|---|
| Không có API/DB integration test cho SQL mới trong `findTicketDetail` (S-1) | Trung bình-Cao — sai sót SQL không bị bắt bởi test tự động | Dev/QA | Trước khi merge lên production | **Human reviewer (2026-08-18)** ✅ — xác nhận theo `ai-review.md` F1 (quyết định "Không fix") |
| `OI-INDEX` chưa xác nhận (C-2) | Trung bình — performance | Dev/DBA | Trước khi rollout production | **Human reviewer (2026-08-18)** ✅ |
| `OI-DATA-RETENTION` chưa xác minh (C-3) | Thấp-Trung bình — tính thiếu resolution time âm thầm | Dev | Trước khi rollout production | **Human reviewer (2026-08-18)** ✅ |
| Tie-break `collected_at` trùng nhau chưa định nghĩa (S-2) | Thấp — hiếm khi xảy ra nhưng non-deterministic khi xảy ra | Product owner/Dev | Đã accept, không cần deadline | **Human reviewer (2026-08-18)** ✅ — chính thức hóa thành `H-SECFINDRES-7` trong `spec-pack.md` §18 |
| Chưa test tự động đổi locale vi/ja (C-1) | Thấp — chỉ copy text tĩnh | QA | Có thể bổ sung sau merge | **Human reviewer (2026-08-18)** ✅ |
| `ArchitectureTest` không tồn tại dù được tài liệu coi là gate bắt buộc (C-4) | Trung bình (thủ tục/niềm tin sai về coverage) | Tech Lead | Ngoài phạm vi ticket này — theo dõi riêng | **Human reviewer (2026-08-18)** ✅ |

**Đã đóng (không còn nằm trong bảng theo dõi)**: SAST không hiển thị lại
trong khối "Scans" — human reviewer đã accept trực tiếp (2026-08-18, xem
`spec-pack.md` §18 `H-SECFINDRES-5`), không cần theo dõi thêm.

**Tất cả 6 risk trong bảng trên đã có approver ký tên (2026-08-18)** —
không còn mục nào ở trạng thái "chưa có/pending". Đây là follow-up sau merge
đã được chính thức chấp nhận, không phải điều kiện chặn.

---

## Open Questions

*(Trống — cả 4 câu hỏi đã được human reviewer trả lời, 2026-08-18. Giữ lại
bảng dưới đây làm nhật ký quyết định.)*

| # | câu hỏi | trả lời | trạng thái |
|---|---|---|---|
| 1 | Tie-break khi `collected_at` trùng nhau (S-2): thêm secondary sort key hay chấp nhận rủi ro non-deterministic? | **Chấp nhận rủi ro** — không thêm secondary sort key | ✅ Resolved — `spec-pack.md` §18 `H-SECFINDRES-7`; Accepted Risk đã có approver |
| 2 | `resolutionTime` trả về `String` đã format sẵn ở BE (không phải số giây thô) — có đúng ý muốn không? | **Đã xác nhận** — giữ nguyên `String` format sẵn ở BE | ✅ Resolved — `spec-pack.md` §18 `H-SECFINDRES-6` |
| 3 | Đề xuất nâng Review Mode lên `Heavy` cho bước review contract — có áp dụng không? | **Giữ `Standard`** | ✅ Resolved — không đổi `spec-pack.md` §15 |
| 4 | Hành vi `CTooltip` trong JSDOM khi test click mở drawer — có phản ánh vấn đề UX thật không? | **Đặc thù môi trường test** (JSDOM), không phải vấn đề UX thật | ✅ Resolved — không cần điều tra thêm trên dev server thật |

---

## Spec Updates Required

*(Trống — không còn mục nào thiếu.)*

---

## Test Updates Required

---

## Failure Mode Candidates

| # | failure mode | rule đề xuất cho lần sau |
|---|---|---|
| FM-1 | Thêm 1 field hiển thị vào component có sẵn nhưng vô tình đổi/ẩn nội dung khối khác trong cùng diff (filter không nằm trong impl-plan) | Review checklist bắt buộc: đối chiếu diff của component UI với danh sách "khối/nội dung hiện có phải giữ nguyên" đã liệt kê trong spec-pack, không chỉ kiểm tra "field mới có xuất hiện" |
| FM-2 | `review-checklist.md` được tạo trước implementation nhưng không có cơ chế bắt buộc điền `Result` trước khi report | Thêm gate: `report.md`/reporter không được tạo Final Verdict = DONE nếu `review-checklist.md` còn cột `Result` trống |
| FM-3 | Business rule suy diễn từ chuỗi thời gian (`collected_at`) không định nghĩa tie-break khi 2 mốc trùng nhau | Khi spec-pack có logic dựa trên `ORDER BY <timestamp>` không có secondary key, bắt buộc hỏi rõ hành vi tie-break trước khi chuyển sang impl-plan |
| FM-4 | Tài liệu (`CLAUDE.md`/`impl-plan.md`) tham chiếu tới 1 gate test (`ArchitectureTest`) không thực sự tồn tại trong codebase, tạo cảm giác an toàn giả | Định kỳ audit các tên test/class được nhắc trong rule/tài liệu để xác nhận chúng thực sự tồn tại và chạy được, không chỉ tồn tại trong văn bản |
| FM-5 | Adapter chứa SQL mới không có hạ tầng test tích hợp sẵn có, dẫn tới rủi ro SQL sai không bị bắt bởi test nào | Khi impl-plan quyết định đặt logic ở Adapter (SQL-heavy), bắt buộc đánh giá tường minh: có hạ tầng test tích hợp cho adapter đó không — nếu không có, ghi Accepted Risk ngay từ impl-plan, không để tới `test-results.md` mới phát hiện |
| FM-6 | Khi 1 Human Decision làm đổi kỳ vọng hành vi so với 1 test đang FAIL, có nguy cơ để khoảng trống giữa spec (đã đổi) và test (chưa đổi) nếu tách thành việc làm sau | Ticket này xử lý đúng: cập nhật spec + xóa/sửa test lỗi thời trong cùng phiên ghi nhận quyết định — giữ làm rule mẫu: không để CI đỏ không rõ lý do cho người không đọc `human-review.md` |

---

**Final Verdict: APPROVED**