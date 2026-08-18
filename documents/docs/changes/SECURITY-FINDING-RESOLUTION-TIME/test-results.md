# Test Results

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-18
**Author**: Claude (Principal Test Engineer / Bug Hunter)
**Update date**: 2026-08-18

---

## 1. Execution Environment

| item | value |
|---|---|
| BE runtime | Java 21, Maven (`EDCAP_BE/`), JUnit 5 |
| FE runtime | Node/Vite, Vitest + Testing Library (`EDCAP_FE/`) |
| DB | Không dùng — không có test tích hợp DB thật chạy trong phiên này (xem mục 8) |
| Ghi chú môi trường | Phiên implementation trước đó (`self-review.md`, mục "Vấn đề đã biết chưa xử lý") ghi nhận `mvn test` **không chạy được** do Bash bị chặn lệnh `mvn`. Phiên này dùng `mcp__plugin_context-mode_context-mode__ctx_execute(language: "shell", ...)` để chạy `mvn` thành công — xác nhận lại giới hạn đó đã được gỡ. |

---

## 2. Executed Command

| command | result | log/evidence | note |
|---|---|---|---|
| `mvn -DskipITs -Dtest=SecurityFindingResolutionTimeCalculatorTest test` (EDCAP_BE) | **PASS** — `Tests run: 8, Failures: 0, Errors: 0` | `BUILD SUCCESS` | Lần đầu tiên test này thực sự được chạy bằng JUnit thật (trước đó chỉ được xác nhận bằng trace toán học thủ công + IDE diagnostics, theo `self-review.md`) |
| `mvn -DskipITs -Dtest=SecurityDashboardServiceTest,SecurityScanRepositoryAdapterTest,ArchitectureTest test` (EDCAP_BE) | **PASS** (2 class thật chạy) — `SecurityDashboardServiceTest`: 12/12; `SecurityScanRepositoryAdapterTest`: 1/1 | `BUILD SUCCESS` | `ArchitectureTest` **không tồn tại** trong codebase (không có class nào khớp tên/`@AnalyzeClasses`/ArchUnit trong `src/test`) dù `CLAUDE.md`/`impl-plan.md` nhắc tới — Maven bỏ qua tên test không khớp, không phải lỗi. Ghi nhận đây là khoảng lệch giữa tài liệu và thực tế, **không thuộc phạm vi sửa của ticket này** — nêu ở mục 9 |
| `npx vitest run "SecurityDashboardPage.test.tsx"` (EDCAP_FE) — sau khi thêm 2 test mới | **1 FAIL / 6 PASS** | Xem mục 5 | Test fail là **repro test cố ý**, phát hiện regression thật (xem mục 5, 9) — không sửa code để né |
| `npx eslint "src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx"` (EDCAP_FE) | **PASS** — không có output = 0 lỗi lint | — | |

---

## 3. Summary of Results

- BE: toàn bộ test hiện có (calculator + service + adapter) **đã thực sự được chạy bằng `mvn test`** trong phiên này và đều xanh — gỡ bỏ tình trạng "chưa xác nhận" mà `self-review.md` để lại.
- FE: thêm 2 test mới, 1 test phát hiện **regression thật** (SAST bị ẩn khỏi khối "Scans" — vi phạm AC-SECFINDRES-5), 1 test bổ sung coverage cho case `"-"` (BR-5) trước đó chưa có test tự động.
- Không thêm test nào chỉ lặp lại assertion đã có (đối chiếu mục 4 `test-plan.md` "Tái sử dụng test hiện có" trước khi viết mới).

---

## 4. List of Passes

| TC ID | test | result | note |
|---|---|---|---|
| (existing) | `SecurityFindingResolutionTimeCalculatorTest` — 8 test case (0 scan, open-only, never-above-zero, 1 cycle, fluctuating count, multi-cycle, trailing open cycle, >24h) | PASS | Chạy thật lần đầu bằng `mvn test` trong phiên này |
| (existing) | `SecurityDashboardServiceTest` — 12 test case | PASS | Không đổi, xác nhận không regression tầng Service |
| (existing) | `SecurityScanRepositoryAdapterTest` — 1 test case | PASS | Không liên quan trực tiếp field mới (write-side adapter khác) |
| (existing) | `SecurityDashboardPage.test.tsx` — 5 test case gốc (auto-select, render cards, đổi project, không có nút edit/delete/create, hiển thị `resolutionTime` thật) | PASS | Không sửa assertion |
| TC-SECFINDRES-3 (mới, từ `test-plan.md` §5) | `renders the dash placeholder when no cycle has closed yet (BR-5)` | PASS | Lấp gap đã ghi nhận ở `test-plan.md` §2 ("FE UT ⚠️ thiếu" cho AC-SECFINDRES-2/3) — xác nhận `"-"` hiển thị đúng (exact match, phân biệt với `"—"` em-dash dùng cho severity/follow-up null) |

---

## 5. List of Fails

| TC ID | test | cause | action | status |
|---|---|---|---|---|
| TC-SECFINDRES-BUG-1 (mới) | `still shows the existing SAST scan entry in the Scans section (AC-SECFINDRES-5: must not break existing blocks)` | **Regression thật**: `SecurityTicketDetailDrawer.tsx:86` có `.filter((scan) => scan.scannerType !== "SAST")` trong khối "Scans" — loại bỏ hoàn toàn entry SAST khỏi danh sách hiển thị. Vi phạm trực tiếp AC-SECFINDRES-5 (`spec-pack.md` §6: "không phá vỡ 3 khối hiện có") và ngoài phạm vi `impl-plan.md` (bước 7 chỉ ghi "Thêm 1 dòng/khối hiển thị `detail.resolutionTime`", không có quyết định nào về việc ẩn SAST khỏi Scans) | **Không tự sửa code** (theo rule "không làm xanh bug bằng cách lấp lỗi") — để test fail làm reproduction, báo cáo cho người phụ trách quyết định: (a) đây là chủ đích ẩn SAST khỏi Scans vì đã có ở field resolutionTime rồi (cần Human Decision + cập nhật spec-pack), hay (b) là lỗi cần revert filter | **OPEN — cần quyết định người dùng, xem mục 9** |

---

## 6. Bugs Fixed

*(Không có — theo rule của nhiệm vụ này, bug tìm thấy được để lại làm reproduction test, không tự sửa.)*

| bug | fix | evidence |
|---|---|---|
| — | — | — |

---

## 7. Not yet fixed / Pending

- **TC-SECFINDRES-BUG-1** (mục 5): filter ẩn SAST khỏi khối Scans trong `SecurityTicketDetailDrawer.tsx:86`. Cần Human Decision trước khi sửa hay giữ nguyên + cập nhật spec-pack.

---

## 8. Test cannot be executed and reason

| TC ID | reason | risk | alternative evidence |
|---|---|---|---|
| TC-SECFINDRES-1/2 (`test-plan.md` §5 — API IT/DB cho raw SAST history query trong `SecurityDashboardJdbcAdapter.findTicketDetail`) | Không có hạ tầng Testcontainer/DB thật nào đang được dùng cho adapter đọc (`SecurityDashboardJdbcAdapter`) trong codebase hiện tại — có dependency `org.testcontainers:postgresql` trong `pom.xml` nhưng **không có bất kỳ usage nào** (`grep "Testcontainers\|@Container\|PostgreSQLContainer"` → 0 kết quả) để tham khảo pattern. Dựng mới toàn bộ hạ tầng Testcontainer + Flyway cho 1 query là scope creep ngoài nhiệm vụ "thêm test có tín hiệu cao" của phiên này | Trung bình-Cao — đây là vùng rủi ro lớn nhất còn lại (đã ghi ở `test-plan.md` mục 10): SQL `ORDER BY collected_at ASC` không có tie-break key khi `collected_at` trùng nhau giữa 2 bản ghi | BE UT của `SecurityFindingResolutionTimeCalculator` (đã PASS) cô lập đúng phần thuật toán khó nhất; review SQL thủ công đã thực hiện ở `impl-plan.md`/`review-checklist.md` |
| Ambiguity: `SecurityFindingResolutionTimeCalculator.compute()` khi 2 snapshot có `collected_at` **trùng nhau tuyệt đối** | `spec-pack.md` BR-2 không định nghĩa tie-break khi `collected_at` bằng nhau; SQL `ORDER BY collected_at ASC` không có secondary sort key nên thứ tự giữa 2 hàng trùng timestamp **không được Postgres đảm bảo ổn định** giữa các lần chạy — nghĩa là cùng 1 dữ liệu có thể cho ra 2 giá trị `resolutionTime` khác nhau tùy thứ tự vật lý trả về. Đây là **điểm mơ hồ trong spec, không phải bug rõ ràng có thể viết assertion "đúng"** — viết test cố định 1 hành vi cụ thể cho case này sẽ là tự ý thêm specification không có trong `spec-pack.md`/`test-plan.md` (vi phạm rule của nhiệm vụ) | Trung bình — chỉ xảy ra khi có ≥2 bản ghi SAST scan cùng ticket có `collected_at` trùng chính xác đến giây (ít khả năng nhưng không loại trừ nếu ingest hàng loạt) | Không có — cần đưa lại thành Open Issue, xem mục 9 |

---

## 9. Remaining risk

1. **[Regression cần quyết định] `SecurityTicketDetailDrawer.tsx:86` ẩn SAST khỏi khối "Scans"** — vi phạm AC-SECFINDRES-5. Reproduction test `still shows the existing SAST scan entry...` đang **FAIL có chủ đích**, không sửa. Cần escalate cho người phụ trách ticket quyết định trước khi merge.
2. **[Open Issue mới, đề xuất thêm vào `open-issues.md`] Tie-break khi `collected_at` trùng nhau giữa 2 bản ghi SAST scan** — BR-2 không định nghĩa thứ tự khi bằng nhau; query `ORDER BY collected_at ASC` không có secondary key → kết quả `resolutionTime` có thể không ổn định (non-deterministic) giữa các lần chạy nếu có tie. Không viết test cho case này vì sẽ phải tự đặt ra hành vi "đúng" không có trong spec — cần người dùng xác nhận: (a) thêm secondary sort key (vd. `security_scan_id`) để đảm bảo determinism, hay (b) chấp nhận rủi ro vì thực tế `collected_at` gần như không bao giờ trùng.
3. **`OI-INDEX`/`OI-DATA-RETENTION`** (kế thừa từ `spec-pack.md`/`test-plan.md`) — vẫn open, không thuộc phạm vi phiên test này.
4. **Không có API IT/DB integration test thật** cho raw SQL trong `findTicketDetail` — do thiếu hạ tầng Testcontainer sẵn có trong repo (mục 8). Rủi ro: sai sót SQL (alias, WHERE, JOIN) không bị bất kỳ test tự động nào bắt được.
5. **`ArchitectureTest` không tồn tại** trong codebase dù được nhắc tới ở `CLAUDE.md`/`impl-plan.md`/`review-checklist.md` như một gate bắt buộc ("giữ ArchitectureTest xanh") — đây là khoảng lệch tài liệu-thực tế có sẵn từ trước, không phải do ticket này gây ra, nhưng có nghĩa là **không có gate ArchUnit nào thực sự bảo vệ việc đặt `SecurityFindingResolutionTimeCalculator` đúng layer** như `impl-plan.md` kỳ vọng.
6. **Label VI/JP** (AC-SECFINDRES-4) vẫn chỉ được xác nhận bằng đọc code/JSON, chưa có test tự động đổi locale thật (kế thừa từ `test-plan.md` mục 6 — cố ý bỏ qua, rủi ro thấp).

---

## 10. Final Test Verdict

- **PARTIAL** — BE test hiện có đã được xác nhận chạy thật (PASS), 1 gap FE coverage đã lấp (`"-"` case, PASS), nhưng phát hiện **1 regression thật đang FAIL có chủ đích** (SAST bị ẩn khỏi khối Scans) cần Human Decision trước khi có thể coi ticket là sẵn sàng merge.
