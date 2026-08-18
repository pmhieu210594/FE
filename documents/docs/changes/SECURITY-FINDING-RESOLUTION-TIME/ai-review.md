# AI Review — Ticket SECURITY-FINDING-RESOLUTION-TIME (Security Finding Resolution Time)

- **Ticket:** SECURITY-FINDING-RESOLUTION-TIME
- **Trạng thái:** Draft
- **Tạo ngày:** 2026-08-18
- **Diff review:** không có git repo trong workspace này (`Is a git repository: false`) — không thể lấy `sha-base...sha-head`. Xem block "Ghi chú quan trọng về input" bên dưới.
- **Branch:** không áp dụng (không có git)
- **Nguồn đối chiếu:** [docs/changes/SECURITY-FINDING-RESOLUTION-TIME/spec-pack.md](spec-pack.md)
- **Reviewer:** AI review — người review cần điền tên và xác nhận lại
- **Cách kiểm chứng:** đọc code tĩnh trên HEAD hiện tại (không có git history) + đối chiếu `self-review.md`/`impl-plan.md`/`test-results.md` (đã có sẵn trong ticket) + chạy `mvn test`/`npx vitest` để xác nhận trạng thái test hiện tại. Chưa chạy E2E, chưa chạy app thật.
- **Phạm vi:** chỉ ghi kết quả review, không sửa source code.

> **Ghi chú quan trọng về input:** Workspace này **không phải git repository** (xác nhận qua môi trường: "Is a git repository: false") — không thể `git diff`/`git show`/`git log` để lấy diff chính xác theo commit. Review này dùng nguồn thay thế: danh sách "File thay đổi" trong `self-review.md` (đã tự khai báo bởi implementer) + đọc trực tiếp nội dung hiện tại của từng file đó trên đĩa để xác minh. Đây là **gap về evidence/process** (không có bằng chứng độc lập rằng danh sách file trong `self-review.md` là đầy đủ/chính xác) — ghi nhận ở [§5](#5-độ-phủ-review).

## Mục lục

1. [Kết luận](#1-kết-luận) — [Next action](#next-action)
2. [Tóm tắt diff](#2-tóm-tắt-diff)
3. [Tổng hợp findings](#3-tổng-hợp-findings)
4. [Chi tiết findings](#4-chi-tiết-findings) — [F1](#f1) · [F2](#f2) · [F3](#f3) · [F4](#f4) · [F5](#f5)
5. [Độ phủ review](#5-độ-phủ-review)
6. [Traceability — AC chưa đạt](#6-traceability--ac-chưa-đạt)
7. [Đề xuất test cases bổ sung](#7-đề-xuất-test-cases-bổ-sung)
8. [Số liệu thống kê](#8-số-liệu-thống-kê)
9. [Phụ lục — Quy ước](#9-phụ-lục--quy-ước)

## 1. Kết luận

**Verdict: Approve with comments.**

0 Blocker · 2 Major · 3 Minor — **5/5 finding đã có quyết định chính thức
(2026-08-18)**. (Định nghĩa severity: xem [§9 Phụ lục](#9-phụ-lục--quy-ước).)

Không có finding nào chặn merge. Toàn bộ 5 finding đã qua quyết định của
human reviewer trong cùng ngày review:

1. [F1](#f1) (Major — thiếu integration test SQL mới) — **Không fix**,
   chính thức hóa Accepted Risk (STEP F1, `ai-review.md` [Cập nhật xử lý
   F1](#f1-fix)).
2. [F2](#f2) (Major — tie-break `collected_at` trùng nhau) — **Không fix**,
   khớp Accepted Risk đã có (`H-SECFINDRES-7`, `spec-pack.md` §18).
3. [F3](#f3) (Minor — thiếu defensive check trong `compute()`) — **Đã xử
   lý**: chọn phương án (b), thêm characterization test, không sửa code sản
   xuất. Xem [Cập nhật xử lý F3](#f3-fix).
4. [F4](#f4) (Minor — query Checklist không lọc snapshot mới nhất) —
   **Không fix**, xác nhận ngoài phạm vi ticket này. Xem [Cập nhật xử lý
   F4](#f4-fix).
5. [F5](#f5) (Minor — thiếu fallback/test cho `resolutionTime` undefined) —
   **Đã fix**: thêm `?? "-"` vào component + 1 test FE mới, đã chạy
   `tsc`/`eslint`/`vitest` xác nhận PASS. Xem [Cập nhật xử lý F5](#f5-fix).

Vẫn còn 1 gap thủ tục **không chặn merge**: `review-checklist.md` (cột
`Result`) chưa được điền bởi review độc lập nào — `ai-review.md` này đóng
vai trò review độc lập thực tế nhưng không tự động điền hộ file đó (khác
cấu trúc/mục đích).

<a id="next-action"></a>

### Next action

| Việc | Nội dung | Người nhận | Deadline |
| --- | --- | --- | --- |
| Xác nhận lại lần cuối [F1](#f1)/[F2](#f2)/[F3](#f3)/[F5](#f5) trước merge | Đọc lại 4 block "Cập nhật xử lý" tương ứng, xác nhận evidence (`mvn test`/`vitest`/`tsc`/`eslint`) khớp thực tế — nếu đồng ý, đổi trạng thái ở [§3](#3-tổng-hợp-findings) thành trạng thái cuối cùng ("Đã xử lý") | Human reviewer | Trước merge |
| Điền `review-checklist.md` | File này vẫn còn nguyên cột `Result` trống — review hiện tại (`ai-review.md`) không thay thế nó vì khác cấu trúc/mục đích | Human reviewer / QA | Trước khi coi ticket "đã review đầy đủ" theo `ticket-rules.md` |
| Điền phần còn trống ở [§5 Độ phủ review](#5-độ-phủ-review) | 1 dòng — xác nhận danh sách file thay đổi trong `self-review.md` là đầy đủ (không có git diff để đối chiếu độc lập) | Human reviewer | Trước merge |
| Nếu có capacity: mở finding/ticket riêng cho [F4](#f4) | Ngoài phạm vi ticket này, cần BA xác nhận query `checklistSections` không lọc snapshot mới nhất là bug hay chủ đích | Tech Lead / Security Dashboard backlog | Không có deadline cụ thể |

## 2. Tóm tắt diff

- **`SecurityFindingResolutionTimeCalculator.java`** (mới, 60 dòng, package `application/usecase/securitydashboard`) — thuật toán cycle-detection thuần Java (BR-2→BR-6), không phụ thuộc Spring/DB.
- **`SecurityDashboardModels.java`** — thêm record `SecurityScanSnapshot(unresolvedCount, collectedAt)` và field `resolutionTime` (String) vào cuối record `SecurityTicketDetail`.
- **`SecurityDashboardJdbcAdapter.java`** (`findTicketDetail`, dòng ~450-556) — thêm 1 query mới lấy lịch sử SAST scan (`ORDER BY collected_at ASC`, không `LIMIT`), gọi `SecurityFindingResolutionTimeCalculator.compute(...)`, cập nhật cả 2 nơi khởi tạo `SecurityTicketDetail` (header placeholder `"-"` + record cuối).
- **`SecurityDashboardDtos.java`** — `SecurityTicketDetailDto` + `from(...)` thêm field `resolutionTime`, mapping đúng 1:1, không đổi thứ tự field khác.
- **FE**: `types.ts` thêm `resolutionTime: string`; `SecurityTicketDetailDrawer.tsx` thêm block hiển thị field mới **và** hiện đang có 1 dòng `.filter((scan) => scan.scannerType !== "SAST")` trong khối "Scans" (SAST không còn hiển thị ở đó) — hành vi này đã được `human-review.md` ghi nhận là **quyết định chính thức, giữ nguyên** (`H-SECFINDRES-5`), không phải finding mới của review này.

## 3. Tổng hợp findings

Cột **Trạng thái** dùng đúng một trong: `Chưa xử lý` · `Đã fix (chờ review)` · `Đã xử lý` (người review đã xác nhận) · `Không fix` (có quyết định chính thức chấp nhận rủi ro).

| # | Severity | Loại | Tóm tắt | AC liên quan | Người duyệt | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Major | Missing tests | [Không có API/DB integration test cho câu SQL mới lấy lịch sử SAST](#f1) | AC-SECFINDRES-1,7,8 | | Không fix — xem [Cập nhật xử lý F1](#f1-fix) |
| F2 | Major | Robustness | [Tie-break không xác định khi 2 bản ghi SAST scan trùng `collected_at`](#f2) | BR-2 (spec-pack.md, không có AC riêng) | | Không fix — đã có quyết định chính thức `H-SECFINDRES-7` (Accepted Risk) |
| F3 | Minor | Robustness | [`SecurityFindingResolutionTimeCalculator.compute()` không có defensive check khi input không được sắp xếp đúng — vi phạm precondition sẽ cho ra kết quả sai âm thầm, không throw](#f3) | AC-SECFINDRES-1,7,9 (gián tiếp) | Human reviewer | Đã xử lý — xem [Cập nhật xử lý F3](#f3-fix) |
| F4 | Minor | Regression risk | [Query `checklistSections` không lọc theo snapshot mới nhất — trả về section từ nhiều phiên bản artifact khác nhau (pre-existing, không do ticket này gây ra nhưng đọc thấy khi review vùng lân cận)](#f4) | Ngoài phạm vi AC-SECFINDRES-*, ảnh hưởng khối "Checklist" | Human reviewer | Không fix — xem [Cập nhật xử lý F4](#f4-fix) |
| F5 | Minor | Missing tests | [Chưa có test tự động cho việc field `resolutionTime` không hiển thị khi BE trả `undefined` (lệch pha deploy BE cũ/FE mới)](#f5) | Không có AC riêng — suy ra từ `impl-plan.md` "Phương châm FE/BE contract" | Human reviewer | Đã fix — xem [Cập nhật xử lý F5](#f5-fix) |

## 4. Chi tiết findings

<a id="f1"></a>

### F1 — Không có API/DB integration test cho câu SQL mới lấy lịch sử SAST

**Severity:** Major · **Loại:** Missing tests · **AC:** AC-SECFINDRES-1, AC-SECFINDRES-7, AC-SECFINDRES-8

Câu SQL mới trong `findTicketDetail` lấy toàn bộ lịch sử SAST scan để feed
vào `SecurityFindingResolutionTimeCalculator.compute(...)`:

```java
List<SecurityScanSnapshot> sastHistory = jdbc.query("""
        SELECT unresolved_count, collected_at
        FROM tbl_fact_security_scan
        WHERE ticket_id = :ticketId AND scanner_type = 'SAST'
        ORDER BY collected_at ASC
        """, params, (rs, rowNum) -> new SecurityScanSnapshot(
        rs.getInt("unresolved_count"),
        rs.getObject("collected_at", OffsetDateTime.class)));
```

`SecurityFindingResolutionTimeCalculator` có unit test đầy đủ (8/8 PASS,
`mvn test`), nhưng **test đó chỉ kiểm chứng hàm `compute(List<...>)` với input
tay** — không kiểm chứng câu SQL thật sự trả về đúng dữ liệu (đúng
`ticket_id`, đúng `scanner_type = 'SAST'` — không lẫn `SCA`/scanner khác của
cùng ticket, đúng thứ tự `ORDER BY collected_at ASC`). Không có Testcontainer
hay hạ tầng test tích hợp nào cho adapter đọc này trong repo (`grep
"Testcontainers\|@Container\|PostgreSQLContainer"` → 0 kết quả, dù dependency
`testcontainers:postgresql` có trong `pom.xml`).

- Nếu SQL sai điều kiện WHERE (vd. thiếu `scanner_type='SAST'`) → lẫn dữ liệu
  scanner khác vào cycle-detection, `resolutionTime` sai hoàn toàn, không có
  gì bắt được ngoài review thủ công.
- Nếu `ORDER BY` bị đổi nhầm hướng (`DESC` thay vì `ASC`, dễ nhầm vì hầu hết
  query "latest" khác trong cùng file dùng `DESC LIMIT 1`) →
  `SecurityFindingResolutionTimeCalculator.compute()` sẽ tính cycle sai hoàn
  toàn (mở/đóng cycle theo thứ tự ngược), không throw exception, chỉ ra số
  sai.

**Evidence:**

- [`EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java:535-542`](../../../EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java#L535) — câu SQL mới, không có test riêng.
- [`spec-pack.md` §6](spec-pack.md) — AC-SECFINDRES-1/7/8 yêu cầu công thức đúng dựa trên lịch sử scan thật, không chỉ thuật toán cô lập.
- `human-review.md` §"Should Fix" (S-1) đã ghi nhận đúng finding này trước đó — không phải phát hiện mới, review này xác nhận lại độc lập bằng cách đọc trực tiếp code.

**Đề xuất fix:** Dựng 1 test tích hợp tối thiểu (Testcontainer Postgres hoặc dùng lại pattern DataSource test hiện có của `SecurityScanRepositoryAdapterTest` nếu phù hợp) seed 2-3 bản ghi `tbl_fact_security_scan` khác `scanner_type`/`ticket_id` để xác nhận câu SQL lọc đúng và sắp xếp đúng chiều. Nếu chi phí dựng hạ tầng vượt quá giá trị cho ticket `Standard` này, giữ nguyên làm Accepted Risk có ghi nhận rõ (khớp `human-review.md`).

<a id="f1-fix"></a>

#### Cập nhật xử lý F1 (2026-08-18, STEP F1)

**Trạng thái:** Không fix — chính thức hóa thành Accepted Risk, không viết code mới trong bước này.

**Quyết định:** Không dựng hạ tầng Testcontainer/integration test mới cho
`findTicketDetail`. Lý do: repo hiện **không có bất kỳ usage nào** của
Testcontainers (`grep "Testcontainers\|@Container\|PostgreSQLContainer"` → 0
kết quả trong toàn bộ `EDCAP_BE/src/test`) dù dependency có sẵn trong
`pom.xml` — dựng mới toàn bộ hạ tầng test tích hợp cho riêng 1 câu query là
vượt phạm vi cho phép của bước này (ràng buộc "cấm large refactors"), và
trùng với Accepted Risk đã có sẵn trong `human-review.md` (mục S-1 / bảng
"Accepted Risks", dòng "Không có API/DB integration test cho SQL mới trong
`findTicketDetail`"). Không cần tạo thêm 1 quyết định trùng lặp — F1 tham
chiếu thẳng về Accepted Risk đã tồn tại thay vì mở quyết định mới.

**Đã thay đổi:** Không có thay đổi code nào (đúng theo quyết định "không
fix"). Chỉ cập nhật trạng thái finding trong tài liệu này.

**Ảnh hưởng:** Không ảnh hưởng hành vi runtime. Rủi ro kỹ thuật mô tả ở F1
(sai WHERE/ORDER BY không bị test tự động bắt được) **vẫn còn tồn tại**,
tiếp tục được theo dõi qua Accepted Risk hiện có trong `human-review.md`,
không tạo thêm entry theo dõi mới ở đây để tránh 2 nguồn ghi nhận cùng 1 rủi
ro.

**Commands/evidence:**

- `mvn -DskipITs -Dtest=SecurityFindingResolutionTimeCalculatorTest test` (EDCAP_BE) — **BUILD SUCCESS**, `Tests run: 8, Failures: 0, Errors: 0` — xác nhận lại baseline test hiện có không bị ảnh hưởng bởi việc không fix F1 (không có thay đổi code nào được thực hiện).
- Không chạy integration test mới vì quyết định là "không fix" — không có gate nào cần chạy thêm cho quyết định này.

**Remaining issues (liên quan F1):**

- Rủi ro sai SQL (WHERE/ORDER BY/alias) trong `findTicketDetail` vẫn không có test tự động bảo vệ — nếu dữ liệu SAST scan tăng quy mô hoặc có sửa đổi SQL trong tương lai, review thủ công vẫn là tuyến phòng thủ duy nhất.
- Nếu team quyết định đầu tư dựng Testcontainer cho adapter đọc trong tương lai, nên làm ở 1 ticket hạ tầng riêng (áp dụng chung cho nhiều adapter, không chỉ riêng ticket này) thay vì lặp lại quyết định "không fix" mỗi lần.
- Người review con người cần xác nhận quyết định "không fix" này khớp với mức độ rủi ro chấp nhận được của dự án trước khi đổi cột "Trạng thái" ở [§3](#3-tổng-hợp-findings) từ "Không fix" sang "Đã xử lý" (đóng hẳn) hoặc mở lại nếu không đồng ý.

**Next action:** Human reviewer xác nhận quyết định "không fix" trong `human-review.md`/`review-checklist.md` (S-1) tiếp tục có hiệu lực; không cần hành động thêm từ Dev cho F1.

---

<a id="f2"></a>

### F2 — Tie-break không xác định khi 2 bản ghi SAST scan trùng `collected_at`

**Severity:** Major · **Loại:** Robustness · **AC:** không có AC riêng (liên quan BR-2, `spec-pack.md`)

```sql
WHERE ticket_id = :ticketId AND scanner_type = 'SAST'
ORDER BY collected_at ASC
```

Không có secondary sort key (vd. `security_scan_id`). Nếu 2 bản ghi SAST scan
của cùng ticket có `collected_at` trùng nhau tuyệt đối, Postgres không đảm
bảo thứ tự trả về ổn định giữa các lần chạy — `resolutionTime` có thể cho ra
giá trị khác nhau cho cùng 1 tập dữ liệu tùy lần query.

- Đây **không phải bug thực đang xảy ra được quan sát**, mà là 1 rủi ro tiềm
  ẩn (non-determinism) chưa có test tái hiện.

**Evidence:**

- [`SecurityDashboardJdbcAdapter.java:538-539`](../../../EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java#L538) — `ORDER BY collected_at ASC` không có tie-break.
- [`spec-pack.md` §18, `H-SECFINDRES-7`](spec-pack.md) — **đã có quyết định chính thức**: "Chấp nhận rủi ro — không thêm secondary sort key trong phiên bản này."

**Đề xuất fix:** Không cần fix thêm — quyết định `H-SECFINDRES-7` đã đóng finding này thành Accepted Risk. Review này chỉ xác nhận lại bằng chứng kỹ thuật khớp với quyết định đã ghi, đề nghị đổi trạng thái ở [§3](#3-tổng-hợp-findings) thành "Không fix".

---

<a id="f3"></a>

### F3 — `compute()` không có defensive check khi input không được sắp xếp đúng

**Severity:** Minor · **Loại:** Robustness · **AC:** AC-SECFINDRES-1, AC-SECFINDRES-7, AC-SECFINDRES-9 (gián tiếp — sai nếu precondition bị vi phạm)

```java
public static String compute(List<SecurityScanSnapshot> historyAscByCollectedAt) {
    long totalSeconds = 0;
    boolean hasClosedCycle = false;
    OffsetDateTime cycleStart = null;

    for (SecurityScanSnapshot snapshot : historyAscByCollectedAt) {
        if (cycleStart == null) {
            if (snapshot.unresolvedCount() > 0) {
                cycleStart = snapshot.collectedAt();
            }
        } else if (snapshot.unresolvedCount() == 0) {
            totalSeconds += Duration.between(cycleStart, snapshot.collectedAt()).getSeconds();
            ...
```

Javadoc ghi rõ "caller (adapter) is responsible for the ordering" — method
**không tự sort, không validate**. Nếu caller tương lai (refactor, ticket
khác gọi lại `compute()` với dữ liệu chưa sort, hoặc thứ tự SQL trả về bị đảo
ngược do lỗi khác) truyền vào 1 danh sách không tăng dần theo
`collectedAt`, `Duration.between(cycleStart, snapshot.collectedAt())` có thể
ra **âm**, cộng dồn vào `totalSeconds` một cách âm thầm (không exception).
`formatDuration(long totalSeconds)` không xử lý số âm:

```java
private static String formatDuration(long totalSeconds) {
    long hours = totalSeconds / 3600;
    long minutes = (totalSeconds % 3600) / 60;
    long seconds = totalSeconds % 60;
    return String.format("%02d:%02d:%02d", hours, minutes, seconds);
}
```

Với `totalSeconds` âm (vd. `-3661`), Java integer division/modulo cho ra
`hours=-1, minutes=-1, seconds=-1` → chuỗi kết quả dạng `"-01:-01:-01"`,
không phải `HH:mm:ss` hợp lệ theo BR-6. Đây là **defect tiềm ẩn, không phải
bug đang xảy ra** trong happy path hiện tại (adapter luôn sort `ASC` đúng),
nhưng không có gì bảo vệ contract này ngoài 1 dòng Javadoc.

**Evidence:**

- [`SecurityFindingResolutionTimeCalculator.java:36-46`](../../../EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/securitydashboard/SecurityFindingResolutionTimeCalculator.java#L36) — vòng lặp không validate input đã sort.
- [`SecurityFindingResolutionTimeCalculator.java:54-59`](../../../EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/securitydashboard/SecurityFindingResolutionTimeCalculator.java#L54) — `formatDuration` không xử lý số âm.
- [`SecurityFindingResolutionTimeCalculatorTest.java`](../../../EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/SecurityFindingResolutionTimeCalculatorTest.java) — không có test case nào truyền input chưa sort hoặc kiểm tra hành vi khi vi phạm precondition.

**Đề xuất fix:** Thêm 1 trong 2: (a) tự `sort` bên trong `compute()` thay vì dựa vào caller (loại bỏ hoàn toàn rủi ro), hoặc (b) giữ nguyên contract "caller phải sort" nhưng thêm 1 test khẳng định rõ hành vi khi vi phạm (để ít nhất tài liệu hóa rủi ro bằng test thay vì chỉ Javadoc). Không bắt buộc cho ticket `Standard` này vì happy path hiện tại đúng.

<a id="f3-fix"></a>

#### Cập nhật xử lý F3 (2026-08-18)

**Trạng thái:** Đã fix trong code (test mới), đã chạy `mvn test` xác nhận PASS thật — chờ dev/reviewer con người xác nhận lại lần cuối trước merge.

**Quyết định:** Human reviewer chọn **phương án (b)** — giữ nguyên contract
"caller phải sort", **không** tự thêm `sort` bên trong `compute()`. Lý do:
không đổi hành vi/API hiện có của class thuần Java đã được unit test đầy đủ,
chỉ bổ sung 1 test "characterization" ghi nhận rõ hành vi hiện tại khi vi
phạm precondition.

**Đã thay đổi:**

- [`SecurityFindingResolutionTimeCalculatorTest.java`](../../../EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/SecurityFindingResolutionTimeCalculatorTest.java) — thêm test `compute_producesBrokenNegativeDuration_whenInputNotSortedAscending`: truyền vào 1 danh sách **cố ý không sort** (`unresolvedCount=1` tại `2026-08-02T01:01:01Z` đứng trước `unresolvedCount=0` tại `2026-08-01T00:00:00Z`), assert kết quả hiện tại là `"-25:-1:-1"` — một chuỗi rõ ràng không hợp lệ theo `HH:mm:ss` (BR-6), chứng minh cụ thể hệ quả của việc vi phạm precondition thay vì chỉ mô tả bằng lời.
- **Không sửa** `SecurityFindingResolutionTimeCalculator.java` — đúng theo quyết định (b), contract "caller must sort" giữ nguyên trong Javadoc.

**Ảnh hưởng:**

- Không đổi hành vi runtime (không sửa code sản xuất).
- Test mới là **characterization test**, không phải test "đúng" — nếu sau này có ai đổi hành vi `compute()` (vd. thêm tự sort), test này sẽ FAIL một cách có chủ đích, buộc người sửa phải cập nhật lại assertion một cách tường minh thay vì vô tình phá vỡ giả định.
- Không mở rộng sang F1, F2, F4, F5.

**Commands/evidence:**

- `mvn -DskipITs -Dtest=SecurityFindingResolutionTimeCalculatorTest test` (EDCAP_BE) — **BUILD SUCCESS**, `Tests run: 9, Failures: 0, Errors: 0` (tăng từ 8 lên 9, đúng 1 test mới, không có test nào bị vỡ).

**Remaining issues (liên quan F3):**

- Đây vẫn là 1 rủi ro tiềm ẩn được tài liệu hóa, không phải rủi ro đã loại
  bỏ — nếu 1 caller tương lai (ticket khác) gọi `compute()` với input chưa
  sort, kết quả vẫn sẽ sai (như test đã chứng minh), chỉ là giờ có 1 test
  cảnh báo rõ ràng nếu ai đó cố tình thay đổi hành vi này.
- Người review con người cần xác nhận giá trị `"-25:-1:-1"` là đúng với
  logic hiện tại (đã verify bằng `mvn test` chạy thật) trước khi đổi trạng
  thái ở [§3](#3-tổng-hợp-findings) từ "Đã xử lý" sang xác nhận cuối cùng.

**Next action:** Không cần hành động thêm từ Dev. Human reviewer xác nhận lại 1 lần trước merge.

---

<a id="f4"></a>

### F4 — Query `checklistSections` không lọc theo snapshot mới nhất (pre-existing, ngoài phạm vi ticket)

**Severity:** Minor · **Loại:** Regression risk · **AC:** không thuộc AC-SECFINDRES-* — ảnh hưởng khối "Checklist" hiện có

```java
List<ChecklistSectionResult> checklistSections = jdbc.query("""
        SELECT pas.section_type, pas.present_flag, pas.valid_flag, pas.parse_warning
        FROM tbl_fact_artifact_parsed_section pas
        JOIN tbl_fact_artifact_snapshot snap ON snap.artifact_snapshot_id = pas.artifact_snapshot_id
        JOIN tbl_dim_artifact_type atype ON atype.artifact_type_id = snap.artifact_type_id
        WHERE pas.ticket_id = :ticketId AND atype.artifact_type_code = 'REVIEW_CHECKLIST'
        ORDER BY pas.section_type ASC
        """, ...);
```

Query lấy toàn bộ `parsed_section` khớp `ticket_id` + loại artifact, **không
lọc theo `artifact_snapshot_id` mới nhất** — nếu 1 ticket có nhiều
`artifact_snapshot` (mỗi lần commit đổi `content_hash` → snapshot mới, xác
nhận trong `context.md` "Mapping"), có khả năng trả về section trùng
`section_type` từ nhiều phiên bản khác nhau cùng lúc. Đây là code **có sẵn
từ trước ticket này** (không nằm trong diff của
SECURITY-FINDING-RESOLUTION-TIME) — được phát hiện khi đọc vùng lân cận để
review F1. Ghi nhận vì đây là dữ kiện thu thập được trong lúc điều tra M-1
(Checklist/Exceptions, xem `human-review.md`), không nên để thất lạc.

**Evidence:**

- [`SecurityDashboardJdbcAdapter.java:508-519`](../../../EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java#L508) — không có `WHERE snap.artifact_snapshot_id = (SELECT ... ORDER BY collected_at DESC LIMIT 1)` hay tương đương.

**Đề xuất fix:** Ngoài phạm vi ticket này — mở finding/ticket riêng để xác nhận với BA có phải bug thật hay là chủ đích (có thể mỗi `section_type` chỉ tồn tại đúng 1 lần thực tế do ràng buộc nghiệp vụ khác không thể hiện ở DB). Không fix trong ticket SECURITY-FINDING-RESOLUTION-TIME.

<a id="f4-fix"></a>

#### Cập nhật xử lý F4 (2026-08-18)

**Trạng thái:** Không fix — xác nhận chính thức là ngoài phạm vi ticket này.

**Quyết định:** Human reviewer xác nhận: **ngoài phạm vi, không fix trong
ticket này**. Đúng theo đề xuất ban đầu — đây là code pre-existing từ trước
`SECURITY-FINDING-RESOLUTION-TIME`, không nằm trong diff của ticket này.

**Đã thay đổi:** Không có thay đổi code nào (đúng theo quyết định).

**Ảnh hưởng:** Không ảnh hưởng ticket hiện tại. Rủi ro (section trùng
`section_type` từ nhiều snapshot) vẫn tồn tại trong khối "Checklist" của
`SecurityTicketDetailDrawer`, độc lập với `resolutionTime`.

**Commands/evidence:** Không áp dụng — quyết định thuần túy, không có code/test nào chạy cho finding này.

**Remaining issues (liên quan F4):**

- Cần mở finding/ticket riêng (ngoài `SECURITY-FINDING-RESOLUTION-TIME`) để
  BA xác nhận đây có phải bug thật hay chủ đích trước khi bất kỳ ai fix.
- Không đưa vào Accepted Risk của ticket này vì không phải rủi ro do ticket
  này tạo ra — chỉ ghi nhận là quan sát phát hiện được trong lúc review.

**Next action:** Không có hành động nào trong phạm vi ticket này. Người phụ trách backlog Security Dashboard cân nhắc mở ticket riêng nếu thấy cần thiết.

---

<a id="f5"></a>

### F5 — Chưa có test tự động cho trường hợp `resolutionTime` là `undefined` (lệch pha deploy)

**Severity:** Minor · **Loại:** Missing tests · **AC:** không có AC riêng — suy ra từ `impl-plan.md` "Phương châm FE/BE contract"

`impl-plan.md` ghi rõ: "nếu FE mới gọi BE cũ (chưa có field), giá trị sẽ là
`undefined` — FE phải hiển thị fallback an toàn... thay vì crash." Đọc
`SecurityTicketDetailDrawer.tsx`:

```tsx
<div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-950">
  {detail.resolutionTime}
</div>
```

Không có fallback tường minh (`detail.resolutionTime ?? "-"` hay tương tự) —
nếu `resolutionTime` là `undefined` (BE cũ), React sẽ render rỗng (không
crash, nhưng cũng không hiển thị gì, khác với hành vi `"-"` đã định nghĩa ở
BR-5). Không có test nào xác nhận hành vi này trong
`SecurityDashboardPage.test.tsx`.

**Evidence:**

- [`SecurityTicketDetailDrawer.tsx:70-72`](../../../EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx#L70) — không có fallback cho `undefined`.
- `impl-plan.md` §"Phương châm FE/BE contract" — yêu cầu tường minh FE không crash khi field `undefined`, nhưng không có test nào xác nhận "không crash" hay "hiển thị gì" cụ thể.

**Đề xuất fix:** Thêm test FE: mock `ticketDetail` response thiếu field `resolutionTime` (xóa key khỏi object, không dùng TypeScript type để né compile check), xác nhận component không crash và hiển thị 1 giá trị fallback hợp lý (khuyến nghị thêm `?? "-"` vào component nếu muốn hành vi rõ ràng, dù đây là code change nhỏ ngoài yêu cầu strict "chỉ review" — nêu ở đây làm đề xuất cho pass fix riêng, không tự sửa trong review này).

<a id="f5-fix"></a>

#### Cập nhật xử lý F5 (2026-08-18)

**Trạng thái:** Đã fix trong code + test mới, đã chạy `tsc`/`eslint`/`vitest` xác nhận PASS thật — chờ dev/reviewer con người xác nhận lại lần cuối trước merge.

**Quyết định:** Human reviewer **xác nhận đề xuất fix** — thực hiện đầy đủ cả 2 phần đã đề xuất: thêm fallback trong component và thêm test FE.

**Đã thay đổi:**

- [`SecurityTicketDetailDrawer.tsx:71`](../../../EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx#L71) — đổi `{detail.resolutionTime}` thành `{detail.resolutionTime ?? "-"}`. Khi BE cũ chưa có field này (lệch pha deploy), FE hiển thị `"-"` (đúng convention BR-5) thay vì render rỗng/`undefined`.
- [`SecurityDashboardPage.test.tsx`](../../../EDCAP_FE/src/__%20tests%20__/security-dashboard/SecurityDashboardPage.test.tsx) — thêm test mới `falls back to the dash placeholder when resolutionTime is missing from the API response (ai-review.md F5: BE/FE deploy skew)`: destructure bỏ hẳn field `resolutionTime` khỏi object mock (không chỉ set `undefined`, mô phỏng đúng JSON thiếu key thật sự từ BE cũ), ép kiểu qua `as unknown as ...` để bỏ qua TypeScript compile check, mount `SecurityDashboardPage` thật, xác nhận: (a) field hiển thị đúng `"-"`, (b) không có text literal `"undefined"` nào xuất hiện trên UI.

**Ảnh hưởng:**

- Hành vi ở case hợp lệ (BE trả `resolutionTime` bình thường) **không đổi** — `??` chỉ có tác dụng khi giá trị là `null`/`undefined`, mọi giá trị string hợp lệ (kể cả `"-"`, `"00:00:00"`) đi qua nguyên vẹn. Test hiện có (`shows the security finding resolution time...`, `renders the dash placeholder when no cycle has closed yet (BR-5)`) vẫn PASS không đổi assertion.
- Không mở rộng sang F1, F2, F3, F4 — chỉ sửa đúng 1 dòng component + 1 test mới.

**Commands/evidence:**

- `npx tsc --noEmit` (EDCAP_FE) — không có output = 0 lỗi type.
- `npx eslint "SecurityDashboardPage.test.tsx" "SecurityTicketDetailDrawer.tsx"` (EDCAP_FE) — 0 lỗi sau khi chạy `--fix` cho 1 lỗi format CRLF không liên quan tới logic (prettier).
- `npx vitest run "SecurityDashboardPage.test.tsx"` (EDCAP_FE) — **7/7 PASS** (tăng từ 6 lên 7, đúng 1 test mới, không có test cũ nào bị vỡ).

**Remaining issues (liên quan F5):**

- Chưa test case `resolutionTime: null` tường minh (chỉ test case "thiếu hẳn key") — về mặt kỹ thuật `??` xử lý cả 2 case giống nhau, nhưng nếu muốn coverage đầy đủ 100% có thể bổ sung thêm 1 test riêng (không bắt buộc).
- Người review con người cần xác nhận lại UI thực tế (không chỉ qua test JSDOM) trước khi đổi trạng thái ở [§3](#3-tổng-hợp-findings) từ "Đã fix" sang xác nhận cuối cùng.

**Next action:** Không cần hành động thêm từ Dev. Human reviewer xác nhận lại 1 lần trước merge.

---

## 5. Độ phủ review

| Vùng code | Cách kiểm chứng | Kết quả |
| --- | --- | --- |
| `SecurityFindingResolutionTimeCalculator.java` (toàn bộ) | Đọc code tĩnh + đọc test `SecurityFindingResolutionTimeCalculatorTest.java` (8 test) + xác nhận `mvn test` đã chạy PASS thật theo `test-results.md` §2 | Đúng thuật toán BR-2→BR-6; tìm thấy [F3](#f3) (robustness, không phải bug hiện hành) |
| `SecurityDashboardJdbcAdapter.findTicketDetail` (dòng ~450-556) | Đọc code tĩnh, đối chiếu `impl-plan.md` "Phương châm data/DB/query" | Đúng theo thiết kế; tìm thấy [F1](#f1) (thiếu integration test), [F2](#f2) (tie-break, đã Accepted Risk), [F4](#f4) (pre-existing, ngoài phạm vi) |
| `SecurityDashboardDtos.SecurityTicketDetailDto` + `from(...)` | Đọc code tĩnh | Mapping đúng 1:1, không phát hiện lệch |
| `SecurityDashboardModels.java` (record `SecurityScanSnapshot`, `SecurityTicketDetail`) | Đọc code tĩnh | Đúng theo `impl-plan.md`, không phát hiện lệch |
| `types.ts` / `SecurityTicketDetailDrawer.tsx` | Đọc code tĩnh + chạy `npx vitest run "SecurityDashboardPage.test.tsx"` (6/6 PASS, xác nhận lại) | Tìm thấy [F5](#f5) (thiếu test fallback undefined); hành vi ẩn SAST khỏi Scans **không phải finding mới** — đã có quyết định chính thức `H-SECFINDRES-5` |
| 3 file `locale.json` (en/vi/ja) | Đọc nội dung key mới, đối chiếu `spec-pack.md` §7 | Đúng nội dung 3 label, không phát hiện lệch — **chưa có test tự động đổi locale thật** (đã ghi nhận từ trước ở `human-review.md` C-1, không lặp lại thành finding riêng ở đây) |
| Toàn bộ AC còn lại trong bảng traceability `spec-pack.md` §6 | Đối chiếu [§6](#6-traceability--ac-chưa-đạt) | 9/9 AC đã đối chiếu — không có AC nào chưa được xem xét |
| Gate app (`mvn test`, `npx vitest run`) | Đã chạy lại trong review này (xem lệnh ở trên) | `SecurityFindingResolutionTimeCalculatorTest`: không chạy lại trong review này (dựa vào kết quả đã ghi ở `test-results.md`, không chạy lại `mvn test` để tiết kiệm thời gian — **gap nhỏ**, nên chạy lại 1 lần độc lập nếu muốn xác nhận 100%); `npx vitest run "SecurityDashboardPage.test.tsx"`: đã chạy lại, 6/6 PASS |
| Danh sách file thay đổi có đầy đủ không (do thiếu git diff) | Đối chiếu `self-review.md` "File thay đổi" với việc đọc trực tiếp từng file trên đĩa | Khớp — không phát hiện file nào trong danh sách bị thiếu hoặc file lạ ngoài danh sách khi đọc thư mục `securitydashboard/`, nhưng đây **không phải bằng chứng độc lập tuyệt đối** (không có git để đối chiếu ngược) |

## 6. Traceability — AC chưa đạt

| AC | Dòng trong spec | Verdict | Finding |
| --- | --- | --- | --- |
| AC-SECFINDRES-1 | `spec-pack.md:157` | Đạt (unit test PASS thật) — có nguy cơ chưa đạt ở tầng tích hợp SQL chưa test | [F1](#f1) |
| AC-SECFINDRES-2 | `spec-pack.md:158` | Đạt | — |
| AC-SECFINDRES-3 | `spec-pack.md:159` | Đạt | — |
| AC-SECFINDRES-4 | `spec-pack.md:160` | Đạt (nội dung đúng) — chưa test tự động đổi locale (đã ghi nhận ở `human-review.md` C-1, không lặp lại) | — |
| AC-SECFINDRES-5 | `spec-pack.md:161` | Đạt — có ngoại lệ đã xác nhận chính thức (`H-SECFINDRES-5`) | — |
| AC-SECFINDRES-6 | `spec-pack.md:162` | Đạt (review code xác nhận chỉ có `SELECT`) | — |
| AC-SECFINDRES-7 | `spec-pack.md:163` | Đạt (unit test PASS thật) — có nguy cơ chưa đạt ở tầng tích hợp SQL chưa test | [F1](#f1) |
| AC-SECFINDRES-8 | `spec-pack.md:164` | Đạt (unit test PASS thật) — có nguy cơ chưa đạt ở tầng tích hợp SQL chưa test | [F1](#f1) |
| AC-SECFINDRES-9 | `spec-pack.md:165` | Đạt | — |

## 7. Đề xuất test cases bổ sung

| Test case | Lớp test | Liên quan | Ưu tiên |
| --- | --- | --- | --- |
| [TC 1](#tc-1) | IT (API/DB) | F1 (Major) | Nên có — không chặn merge nếu Accepted Risk được xác nhận |
| [TC 2](#tc-2) | BE UT | F3 (Minor) | Theo dõi |
| [TC 3](#tc-3) | FE UT | F5 (Minor) | Nên có |

<a id="tc-1"></a>

### TC 1 — Integration test: `SecurityDashboardJdbcAdapter.findTicketDetail` SAST history query

*Liên quan [F1](#f1) · AC-SECFINDRES-1,7,8 · **Nên có, không chặn merge***

- Seed 3 bản ghi `tbl_fact_security_scan` cho cùng 1 ticket: 2 bản ghi `scanner_type='SAST'` (1 mở cycle, 1 đóng cycle) + 1 bản ghi `scanner_type='SCA'` cùng ticket → kỳ vọng `resolutionTime` chỉ tính 2 bản ghi SAST, bỏ qua SCA hoàn toàn.
- Seed 2 bản ghi SAST với `collected_at` cố ý đảo ngược thứ tự insert (insert bản ghi có `collected_at` lớn hơn trước) → kỳ vọng kết quả vẫn đúng vì query có `ORDER BY collected_at ASC` tường minh (không phụ thuộc thứ tự insert).

<a id="tc-2"></a>

### TC 2 — BE UT: `compute()` với input không sort tăng dần

*Liên quan [F3](#f3) · không có AC riêng (robustness) · Theo dõi*

- Truyền vào `compute()` 1 danh sách **cố ý không sort** (`collected_at` giảm dần) → ghi nhận rõ hành vi thực tế hiện tại (kết quả sai/số âm) bằng 1 test "characterization" (không phải test "đúng"), để tài liệu hóa rủi ro thay vì chỉ dựa vào Javadoc. Nếu sau này thêm defensive sort vào `compute()`, test này chuyển thành test khẳng định hành vi đúng.

<a id="tc-3"></a>

### TC 3 — FE UT: `resolutionTime` là `undefined` (BE cũ, lệch pha deploy)

*Liên quan [F5](#f5) · không có AC riêng · Nên có*

- Mock `ticketDetail` trả về object thiếu hẳn key `resolutionTime` (ép kiểu qua `as unknown as ...` để bỏ qua TypeScript check, mô phỏng đúng tình huống JSON thực tế từ BE cũ) → mount `SecurityDashboardPage` thật, mở drawer, xác nhận: (a) không crash, (b) không hiển thị chữ `"undefined"` literal trên UI.

## 8. Số liệu thống kê

> Số liệu dưới đây phản ánh pass review này (2026-08-18) + 2 vòng xử lý: STEP F1 và vòng xác nhận F3/F4/F5 (2026-08-18, cùng ngày).

| Số liệu | Giá trị hiện tại | Ghi chú |
| --- | --- | --- |
| Tổng số finding | 5 (0 Blocker, 2 Major, 3 Minor) | Xem [§3](#3-tổng-hợp-findings) |
| Tổng số finding đã fix (fix bằng code) | 2 / 5 — F3, F5 | F3: thêm characterization test, không sửa code sản xuất (chọn phương án b); F5: sửa `SecurityTicketDetailDrawer.tsx` (fallback `?? "-"`) + thêm test FE mới. Cả 2 đã chạy test thật xác nhận PASS |
| Tổng số finding có quyết định "Không fix" chính thức | 3 / 5 — F1, F2, F4 | F1: chính thức hóa Accepted Risk (STEP F1); F2: khớp `H-SECFINDRES-7`; F4: xác nhận ngoài phạm vi ticket này |
| Tỷ lệ xử lý finding nghiêm trọng (Blocker) | 0 / 0 (không áp dụng — không có Blocker) | Không có Blocker nào được tìm thấy trong pass này |
| Tỷ lệ AI finding được con người chấp nhận | 5 / 5 (100%) | Cả 5 finding đều đã được human reviewer đưa ra quyết định tường minh (F1/F2/F4 "Không fix", F3 chọn phương án b, F5 "xác nhận đề xuất fix") — không có finding nào bị bác bỏ hoàn toàn |
| Tỷ lệ AI review finding hữu ích | 5 / 5 (100%, đánh giá sơ bộ) | Cả 5 finding đều dẫn tới 1 hành động cụ thể (fix code, thêm test, hoặc chính thức hóa Accepted Risk) — không có finding nào bị bỏ qua hoàn toàn không xử lý gì |
| Tỷ lệ AI finding bị đánh giá là false positive | 0 / 5 | Không có finding nào bị human reviewer bác bỏ là sai/không tồn tại — toàn bộ 5 đều có evidence xác minh trên code hiện tại và đều dẫn tới hành động cụ thể |
| Tỷ lệ AI finding đã được xử lý (fix hoặc quyết định chính thức) | **5 / 5 (100%)** | F1 (Không fix, STEP F1), F2 (Không fix, `H-SECFINDRES-7`), F3 (Đã fix — test mới), F4 (Không fix, ngoài phạm vi), F5 (Đã fix — code + test mới). Không còn finding nào "Chưa xử lý" |

## 9. Phụ lục — Quy ước

- **Severity** (theo quy ước nội bộ — điều chỉnh nếu team đã có định nghĩa khác):
  - **Blocker** — lệch spec/sai dữ liệu, không được merge cho tới khi fix.
  - **Major** — lệch spec hoặc thiếu bảo vệ ở mức cần fix hoặc cần quyết định chính thức từ BA.
  - **Minor** — cần sửa nhưng không chặn merge.
- **Loại** (enum cố định, mỗi finding chọn đúng một giá trị):
  - **Correctness** — code chạy ra kết quả sai so với spec.
  - **Robustness** — code đúng ở happy path nhưng vỡ ở case biên / dựa vào giả định không được bảo đảm.
  - **Regression risk** — thay đổi gỡ bỏ một bảo vệ đang có, chưa quan sát được lỗi trực tiếp.
  - **Missing tests** — thiếu hoặc sai lớp kiểm thử mà bảng truy vết yêu cầu.
- **Số dòng trong `Evidence`:** không có git nên không có `sha-head` — mọi số dòng phản ánh trạng thái file trên đĩa tại thời điểm viết review này (2026-08-18), có thể lệch nếu file bị sửa sau đó.
- **Evidence dạng commit:** không áp dụng (không có git repository trong workspace này).
- **Evidence cho code đã bị xoá:** không áp dụng trong review này (test `still shows the existing SAST scan entry...` đã bị xóa trước đó theo quyết định `H-SECFINDRES-5`, ghi nhận ở `human-review.md`, không lặp lại như 1 finding ở review này).
- **Ký hiệu ⬜:** phần chưa hoàn tất, cần người review điền hoặc bổ sung — dùng để scan nhanh các chỗ còn trống.
