# Test Plan

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-18
**Author**: Claude (Test Strategist)
**Update date**: 2026-08-18

---

## 1. Mục tiêu

Ánh xạ 9 AC của `spec-pack.md` (§6) sang loại test cụ thể, dựa trên code đã
implement theo `impl-plan.md` (Phương án C): thuật toán cycle-detection tách
riêng thành `SecurityFindingResolutionTimeCalculator` (pure Java, không
Spring/DB) để unit test trực tiếp không cần mock; Adapter tự query raw SAST
history rồi gọi calculator; FE hiển thị field trong
`SecurityTicketDetailDrawer.tsx`.

Nguyên tắc phân bổ: **không tạo mọi loại test cho mọi AC** — chỉ chọn loại
test có giá trị/chi phí hợp lý nhất cho từng AC, ưu tiên test thuật toán
thuần túy (rẻ, nhanh, không cần mock) hơn API IT/E2E (đắt, chậm) khi thuật
toán đã được cô lập đúng theo `impl-plan.md`.

---

## 2. Ma trận AC ↔ loại test

| AC ID | FE UT | BE UT | API IT | Contract Test | DB/Migration | E2E | Black-box |
|---|---|---|---|---|---|---|---|
| AC-SECFINDRES-1 (1 cycle đã đóng, format `HH:mm:ss`) | – | ✅ đã có | – | – | – | – | – |
| AC-SECFINDRES-2 (chưa có scan nào → `"-"`) | ⚠️ thiếu | ✅ đã có | – | – | – | – | – |
| AC-SECFINDRES-3 (1 open cycle, chưa cycle đóng → `"-"`) | ⚠️ thiếu | ✅ đã có | – | – | – | – | – |
| AC-SECFINDRES-4 (label đúng theo EN/VI/JP) | ⚠️ thiếu (chỉ test qua i18n key, không qua bản dịch thật) | – | – | – | – | – | ✅ đề xuất bổ sung |
| AC-SECFINDRES-5 (field mounted trên `SecurityTicketDetailDrawer` thật, không phá 3 khối cũ) | ✅ đã có (`SecurityDashboardPage.test.tsx`) | – | – | – | – | – | – |
| AC-SECFINDRES-6 (read-only, không ghi dữ liệu) | – | ✅ được bảo đảm gián tiếp (query chỉ `SELECT`, review SQL) | – | – | ⚠️ đề xuất bổ sung (assert không có `INSERT/UPDATE`) | – | – |
| AC-SECFINDRES-7 (N≥2 cycle đã đóng, tổng cộng dồn) | – | ✅ đã có | – | – | – | – | – |
| AC-SECFINDRES-8 (N cycle đã đóng + 1 open cycle cuối, bỏ qua open) | – | ✅ đã có | – | – | – | – | – |
| AC-SECFINDRES-9 (>24h, `HH` không giới hạn/reset) | – | ✅ đã có | – | – | – | – | – |
| *(bổ sung, không phải AC riêng nhưng thuộc BR-1/query)* SQL raw history đúng điều kiện `ticket_id + scanner_type='SAST'`, `ORDER BY collected_at ASC` | – | – | ⚠️ đề xuất bổ sung | – | ⚠️ đề xuất bổ sung (nếu có hạ tầng Testcontainer) | – | – |

Ghi chú:
- **BE UT** cho AC-1,2,3,7,8,9 đã **được bảo đảm bởi test hiện có**
  (`SecurityFindingResolutionTimeCalculatorTest.java`) — pure function, không
  mock, cover đủ toàn bộ boundary chính (0 scan, open-only, 1 cycle, N cycle,
  N cycle + trailing open, >24h, và `unresolved_count` dao động không đơn
  điệu trong 1 cycle).
- **API IT / DB integration** cho query raw SAST history trong
  `SecurityDashboardJdbcAdapter.findTicketDetail` **chưa có test** — đây là
  phần rủi ro nhất còn lại (SQL thủ công, alias `s3` tái sử dụng ở nhiều nơi
  trong cùng file — xem `impl-plan.md` "Phương châm data/DB/query").
- Không cần **Contract Test** riêng — thay đổi là additive-only (thêm 1 field
  vào response JSON đã có), không đổi field/route khác; rủi ro tương thích
  ngược đã được xử lý ở FE (không throw nếu `resolutionTime` là
  `undefined`).
- Không cần **E2E** (Playwright) — flow chỉ là "mở drawer → xem 1 giá trị
  text", đã được cover đủ bởi FE UT mounted-on-page (`SecurityDashboardPage.test.tsx`)
  theo đúng yêu cầu AC Closure của `40-testing.md`. Không có multi-step
  business flow nào cần trace qua nhiều màn hình.

---

## 3. Ưu tiên

| test item | priority | reason |
|---|---|---|
| BE UT `SecurityFindingResolutionTimeCalculatorTest` (đã có) | P0 | Chứa toàn bộ business logic dễ sai nhất (cycle detection, đã có 1 lỗi tính toán được phát hiện lúc viết test — xem spec-pack.md ví dụ minh họa) |
| API/Adapter IT cho `findTicketDetail` raw SQL (mới) | P0 | SQL thủ công `ORDER BY collected_at ASC` đi ngược pattern `DESC LIMIT 1` toàn file; sai 1 chỗ WHERE/ORDER BY là sai toàn bộ kết quả mà BE UT không phát hiện được (BE UT chỉ test hàm `compute`, không test query) |
| FE UT: hiển thị `"-"` khi ticket detail trả `resolutionTime: "-"` (mới) | P1 | AC-SECFINDRES-2/3 hiện chỉ được test ở BE; FE chưa test riêng khả năng hiển thị đúng chuỗi `"-"` (không bị coi là falsy/ẩn dòng) |
| Black-box: label hiển thị đúng theo VI/JP thật (không qua key) (mới) | P2 | AC-SECFINDRES-4 — rủi ro thấp (chỉ là copy text), nhưng là AC tường minh trong spec-pack, cần ít nhất 1 lượt xác nhận thủ công/manual |
| DB assert "no write" cho query mới (mới, optional) | P3 | AC-SECFINDRES-6 — rủi ro thấp vì code chỉ có 1 câu `SELECT`, giá trị của việc tự động hoá test này thấp hơn review SQL thủ công |

---

## 4. Tái sử dụng test hiện có

| existing test | path | covers | gap |
|---|---|---|---|
| `SecurityFindingResolutionTimeCalculatorTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/SecurityFindingResolutionTimeCalculatorTest.java` | AC-SECFINDRES-1,2,3,7,8,9 (toàn bộ thuật toán cycle-detection + format) | Không test SQL query lấy input cho calculator (thuộc adapter, không thuộc phạm vi test này) |
| `SecurityDashboardPage.test.tsx` — case `"shows the security finding resolution time in the ticket detail drawer"` | `EDCAP_FE/src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx:303-323` | AC-SECFINDRES-5 (field mounted trên page thật, không phải test cô lập — đúng yêu cầu AC Closure `40-testing.md`); một phần AC-SECFINDRES-1 (hiển thị đúng giá trị `HH:mm:ss` từ mock) | Không cover case `"-"`; không cover đổi locale; test còn lại trong file (`renders the summary cards...`, `does not expose edit/delete/create controls`) xác nhận field mới không phá 3 khối cũ (Scans/Checklist/Exceptions vẫn render bình thường) |
| `SecurityDashboardServiceTest` | `EDCAP_BE/src/test/java/com/sdd/platform/application/usecase/securitydashboard/SecurityDashboardServiceTest.java` | Xác nhận `getTicketDetail`/auth (`requireAnyAccess`/`requireSecurityAccess`) không đổi hành vi — Phương án C không sửa Service | Không liên quan trực tiếp field mới, chỉ dùng để xác nhận "không có regression ở tầng Service" |

---

## 5. Test mới/cập nhật

| TC ID | test | type | target | related AC |
|---|---|---|---|---|
| TC-SECFINDRES-1 | Adapter/IT: `findTicketDetail` trả đúng `resolutionTime` khi ticket có lịch sử SAST scan nhiều bản ghi (dùng dữ liệu seed thật hoặc Testcontainer nếu có hạ tầng sẵn; nếu không có, ít nhất unit-test SQL bằng cách gọi adapter với DataSource test hiện có của `SecurityScanRepositoryAdapterTest`) | API IT / DB | `SecurityDashboardJdbcAdapter.findTicketDetail` | AC-SECFINDRES-1,7,8 (đầu-cuối, không chỉ riêng `compute`) |
| TC-SECFINDRES-2 | Adapter/IT: query raw SAST history chỉ lấy `scanner_type='SAST'`, bỏ qua `SCA`/scanner khác của cùng ticket | API IT / DB | `SecurityDashboardJdbcAdapter.findTicketDetail` | BR-1 |
| TC-SECFINDRES-3 | FE UT: `ticketDetail` trả `resolutionTime: "-"` → drawer hiển thị `"-"` (không ẩn dòng, không hiển thị rỗng/`undefined`) | FE UT | `SecurityTicketDetailDrawer.tsx` | AC-SECFINDRES-2, AC-SECFINDRES-3 |
| TC-SECFINDRES-4 | Black-box: đổi ngôn ngữ ứng dụng sang VI, mở drawer, xác nhận label = "Thời gian xử lý finding bảo mật"; lặp lại cho JP = "セキュリティ指摘解消時間" | Black-box (manual) | `SecurityTicketDetailDrawer.tsx` + 3 file `locale.json` | AC-SECFINDRES-4 |
| TC-SECFINDRES-5 | Black-box: xác nhận field mới hiển thị đúng vị trí, không đè/xô lệch layout 3 khối Scans/Checklist/Exceptions khi mở nhiều ticket khác nhau (regression thị giác) | Black-box (manual) | `SecurityTicketDetailDrawer.tsx` | AC-SECFINDRES-5 |
| TC-SECFINDRES-6 *(optional, P3)* | Review thủ công + assert tĩnh: câu query mới trong `findTicketDetail` chỉ có `SELECT`, không có `INSERT/UPDATE/DELETE` | Code review / static check | `SecurityDashboardJdbcAdapter.java` | AC-SECFINDRES-6 |

### E2E Step-by-step Scenarios

*Không có kịch bản E2E (Playwright) mới cho ticket này — xem lý do ở mục 2
("Ma trận AC ↔ loại test"). Nếu về sau ticket mở rộng thêm luồng nhiều bước
(vd. lọc theo resolution time, export báo cáo), cần bổ sung bảng này.*

| scenario | precondition | steps | expected | related AC |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 6. Vùng cố ý không test lần này

| area | reason | risk |
|---|---|---|
| E2E Playwright cho toàn bộ flow mở Security Dashboard → chọn ticket → xem resolution time | Flow đã được cover đủ bởi FE UT mounted-on-page; không có multi-step nghiệp vụ đủ phức tạp để biện minh chi phí Playwright | Thấp — nếu FE UT bị mock sai (vd. mock router/query client không khớp thực tế), lỗi tích hợp thật có thể lọt qua |
| Auth/permission riêng cho field `resolutionTime` | Field nằm trong response hiện có của endpoint detail đã có auth (`requireAnyAccess`/`requireSecurityAccess`) — không thêm quyền/route mới, không có ma trận permission mới cần test | Rất thấp — nếu sau này tách quyền riêng cho field nhạy cảm, cần test riêng |
| Idempotency / duplicate submit | Tính năng read-only (GET only), không có action ghi nào để test duplicate submit | Không áp dụng |
| Rollback dữ liệu | Không có migration/ghi dữ liệu — rollback chỉ là revert code, không cần test riêng | Không áp dụng |
| Race condition khi 2 scan ghi đồng thời (`collected_at` trùng nhau) | Không thấy trong AC hiện tại; theo `impl-plan.md` phần "Logging", implementer có thể thêm log WARN nếu phát hiện, nhưng không phải yêu cầu test bắt buộc của ticket này | Trung bình — nếu `collected_at` trùng giữa detected/resolved scan, `Duration.between` trả 0 giây cho cycle đó, làm giảm tổng resolution time một cách âm thầm (không throw lỗi) |
| Timeout / hiệu năng khi ticket có rất nhiều bản ghi scan lịch sử (không `LIMIT`) | `impl-plan.md` đã note là "chưa có benchmark", coi là `OI-INDEX` — thuộc phạm vi vận hành/performance, không phải phạm vi test chức năng của ticket này | Trung bình — nếu ticket có hàng nghìn bản ghi scan lịch sử, query không `LIMIT` + thiếu index phù hợp có thể chậm; cần `EXPLAIN` thực tế trước khi merge lên môi trường dữ liệu lớn (đã ghi trong `impl-plan.md`) |
| DB integration test đầy đủ bằng Testcontainer cho `findTicketDetail` | Chưa xác nhận hạ tầng Testcontainer/embedded DB có sẵn cho adapter này (xem `impl-plan.md` "Phương châm Test") — nếu không có sẵn, review SQL thủ công + BE UT của calculator được coi là đủ cho mức độ `Standard` | Trung bình — lỗi SQL (sai điều kiện WHERE, sai hướng ORDER BY) sẽ không bị bất kỳ test tự động nào bắt được, chỉ có thể phát hiện qua review thủ công hoặc lỗi thực tế trên production |

---

## 7. Phương châm test data

- **Boundary values bắt buộc cover** (đã cover ở BE UT hiện có):
  0 bản ghi scan, đúng 1 bản ghi (open cycle), đúng 2 bản ghi (1 cycle đóng
  gọn), N≥2 cycle đã đóng, N cycle đã đóng + 1 open cycle cuối, tổng vượt 24h.
- **Malformed/null/empty**: không có input người dùng mới (chỉ dùng `ticketId`
  đã có sẵn từ path) — không cần test malformed input riêng cho field này;
  test `List.of()` (empty) đã cover trường hợp "không có dữ liệu" tương đương
  null/empty ở tầng calculator.
- **Full-width number**: không áp dụng — không có input dạng số do người dùng
  nhập cho tính năng này (chỉ đọc `unresolved_count`/`collected_at` từ DB).
- **`unresolved_count` không đơn điệu trong 1 cycle** (vd. 3→1→2→0): đã cover
  ở BE UT (`compute_treatsFluctuatingCountAsOneCycle`) — đảm bảo không bị
  hiểu nhầm thành nhiều cycle nhỏ.
- **Dữ liệu FE mock**: giữ nguyên giá trị mock hiện có (`"27:30:00"`) trong
  `SecurityDashboardPage.test.tsx` cho test đã có; test mới (TC-SECFINDRES-3)
  dùng thêm 1 mock riêng với `resolutionTime: "-"` để không đổi assertion của
  test cũ.
- **Timezone**: toàn bộ `collected_at` dùng `OffsetDateTime` (đã có offset) —
  test data nên cố ý dùng ít nhất 1 case offset khác `Z` (vd. `+07:00`) để xác
  nhận `Duration.between` tính đúng theo instant tuyệt đối, không theo giờ
  địa phương hiển thị.

---

## 8. Command thực thi

| command | purpose |
|---|---|
| `mvn -pl EDCAP_BE test -Dtest=SecurityFindingResolutionTimeCalculatorTest` | Chạy riêng BE UT thuật toán cycle-detection (đã có, P0) |
| `mvn -pl EDCAP_BE test -Dtest=SecurityDashboardServiceTest` | Xác nhận không regression ở tầng Service (Phương án C không đổi Service) |
| `mvn -pl EDCAP_BE test -Dtest=SecurityScanRepositoryAdapterTest` | Chạy adapter test hiện có + nơi bổ sung TC-SECFINDRES-1/2 (nếu thêm vào file này) |
| `mvn clean verify` (trong `EDCAP_BE/`) | Full build + `ArchitectureTest` — bắt buộc xanh trước khi merge theo `impl-plan.md` bước 5 |
| `npm run test -- security-dashboard` (trong `EDCAP_FE/`) | Chạy `SecurityDashboardPage.test.tsx` gồm test mounted hiện có + TC-SECFINDRES-3 mới |
| `npm run typecheck` (trong `EDCAP_FE/`) | Xác nhận `types.ts` (`resolutionTime: string`) khớp toàn bộ nơi dùng |

---

## 9. Vùng cố ý không test lần này

*(đã trình bày ở mục 6 theo đúng yêu cầu output — mục này giữ để khớp thứ tự
template nếu cần tham chiếu chéo; nội dung không lặp lại.)*

---

## 10. Rủi ro còn lại

| risk | mức độ | ghi chú |
|---|---|---|
| SQL raw history query (`ORDER BY collected_at ASC`, alias `s3`) chưa có test tự động | Trung bình-Cao | Đây là rủi ro lớn nhất còn lại — sai 1 điều kiện WHERE/JOIN sẽ không bị bắt bởi bất kỳ test hiện có nào (BE UT chỉ test hàm `compute` với input tay). Đề xuất: bổ sung TC-SECFINDRES-1/2 trước khi merge, hoặc ít nhất review SQL kỹ theo `review-checklist.md` §2.4 như `impl-plan.md` đã note |
| `OI-INDEX` — chưa xác nhận index phù hợp cho `(ticket_id, scanner_type, collected_at)` | Trung bình | Không thuộc phạm vi test chức năng, nhưng ảnh hưởng hiệu năng thực tế; theo dõi ở `impl-plan.md`, cần `EXPLAIN` trước khi merge lên môi trường dữ liệu lớn |
| `OI-DATA-RETENTION` (A-7) — chưa xác minh `tbl_fact_security_scan` không bị archive mất lịch sử cũ | Thấp-Trung bình | Nếu dữ liệu lịch sử bị dọn dẹp, `resolutionTime` sẽ tính thiếu (cycle bị "cắt cụt" từ giữa) một cách âm thầm, không có lỗi runtime nào cảnh báo |
| `collected_at` trùng nhau giữa 2 bản ghi liên tiếp (detected/resolved) | Thấp | `Duration.between` trả 0 giây cho cycle đó — làm giảm tổng một cách âm thầm; chưa có test/log riêng cho case này |
| Label VI/JP chỉ được xác nhận thủ công (Black-box), không có test tự động | Thấp | Rủi ro thấp (chỉ là copy text), nhưng nếu file `locale.json` bị sửa nhầm key ở 1 trong 3 ngôn ngữ, sẽ không bị CI bắt — chỉ phát hiện qua review thủ công hoặc black-box test |
| FE test hiện có dùng i18n key thô (không mock bản dịch thật) | Thấp | Không phát hiện được lỗi copy/dịch sai nội dung thật, chỉ đảm bảo đúng key được gọi — nhất quán với pattern test FE hiện tại của cả file, không phải vấn đề riêng của ticket này |
