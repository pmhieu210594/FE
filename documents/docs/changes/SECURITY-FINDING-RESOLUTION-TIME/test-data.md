# test-data

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-18
**Author**: Claude (QA Designer)
**Update date**: 2026-08-18

---

## Dữ liệu chung

- Toàn bộ dữ liệu test dùng ticket/dự án **giả lập**, không dùng ticket/dự án
  thật của khách hàng.
- Nguồn dữ liệu cho field "Security Finding Resolution Time" là **lịch sử các
  lần quét bảo mật SAST** đã có sẵn của ticket (không cần tạo API/ticket mới —
  chỉ cần chuẩn bị đủ chuỗi lịch sử quét theo thời gian cho mỗi ticket test).
- Mỗi ticket test cần tối thiểu: 1 mã ticket, 1 dự án gắn với ticket đó, và 1
  chuỗi các "lần quét" theo thời gian, mỗi lần quét có 2 thông tin: **thời
  điểm quét** và **còn bao nhiêu lỗi chưa xử lý tại thời điểm đó**.
- Quy ước đọc: "đợt xử lý đã đóng" = có ít nhất 1 lần quét ghi nhận lỗi mới
  (số lỗi > 0), sau đó có 1 lần quét sau đó ghi nhận đã hết lỗi (số lỗi = 0).
  "đợt xử lý đang mở" = có lần quét ghi nhận lỗi mới nhưng **chưa** có lần
  quét nào sau đó cho thấy đã hết lỗi.

---

## Dữ liệu normal

| ID | data | purpose |
|---|---|---|
| TD-TICKET-A | Ticket `SEC-201`, dự án "EDCAP Alpha". Lịch sử quét SAST: 01/08/2026 09:00 (còn 3 lỗi) → 02/08/2026 10:00 (còn 1 lỗi) → 03/08/2026 12:30 (hết lỗi). 1 đợt xử lý đã đóng, thời gian = 51 giờ 30 phút | BB-001, BB-004, BB-006, BB-013, BB-014 — case cơ bản, 1 đợt xử lý đã đóng |
| TD-TICKET-D | Ticket `SEC-204`. Lịch sử: 01/08 09:00 (còn 2 lỗi) → 01/08 15:00 (hết lỗi) — đợt 1 (6 giờ); 05/08 08:00 (còn 1 lỗi) → 06/08 08:00 (hết lỗi) — đợt 2 (24 giờ). Tổng 2 đợt = 30 giờ | BB-007 — nhiều đợt xử lý cộng dồn |
| TD-TICKET-G | Ticket `SEC-207`. Lịch sử trong 1 đợt: 01/08 00:00 (còn 3 lỗi) → 01/08 01:00 (còn 1 lỗi) → 01/08 02:00 (còn 2 lỗi, tăng lại) → 01/08 05:00 (hết lỗi). Tổng đợt = 5 giờ | BB-010 — số lỗi dao động lên xuống trong 1 đợt, vẫn tính 1 đợt duy nhất |
| TD-TICKET-H | Ticket `SEC-208` — ticket "đầy đủ" có sẵn: ít nhất 1 kết quả quét loại khác ngoài SAST (vd SCA) **và** kết quả quét SAST, có mục checklist (ít nhất 1 mục), có ít nhất 1 exception đã ghi nhận trước đây | BB-005 — kiểm tra field mới không phá vỡ 3 khối màn hình cũ |

---

## Dữ liệu abnormal

| ID | data | expected error |
|---|---|---|
| TD-TICKET-B | Ticket `SEC-202` — chưa từng có lần quét SAST nào trong lịch sử | Không phải lỗi hệ thống — là trạng thái hợp lệ, hiển thị `"-"` (BB-002) |
| TD-TICKET-C | Ticket `SEC-203` — có đúng 1 lần quét ghi nhận lỗi mới (vd còn 2 lỗi), chưa từng có lần quét nào sau đó cho thấy hết lỗi | Không phải lỗi hệ thống — hiển thị `"-"` (BB-003) |
| TD-TICKET-NOTFOUND | Một mã ticket không tồn tại trong hệ thống (vd `SEC-999999` hoặc mã đã bị xoá) | Thông báo "không tìm thấy" thân thiện, không phải màn hình trắng/lỗi kỹ thuật (BB-012) |
| (Kịch bản lỗi hệ thống) | Backend/CSDL tạm ngưng phục vụ trong lúc người dùng mở chi tiết ticket TD-TICKET-A | Thông báo lỗi chung chung, không lộ thông tin kỹ thuật nội bộ (BB-015) — QA/dev cần thống nhất cách giả lập sự cố này trước khi test (vd tắt tạm service ở môi trường test, không thao tác trên môi trường thật) |

---

## Dữ liệu boundary value

| ID | item | value | expected |
|---|---|---|---|
| TD-TICKET-E | Ticket `SEC-205` — 1 đợt đã đóng (2 giờ: 01/08 00:00 còn lỗi → 01/08 02:00 hết lỗi) + 1 đợt mới đang mở (02/08 00:00 còn lỗi, chưa có lần quét nào sau đó) | Biên: có cả đợt đã đóng lẫn đợt đang mở | Hiển thị `02:00:00` — chỉ tính đợt đã đóng, bỏ qua đợt đang mở (BB-008) |
| TD-TICKET-F | Ticket `SEC-206` — 1 đợt đã đóng kéo dài đúng 48 giờ (01/08 00:00 → 03/08 00:00) | Biên: vượt qua mốc 24 giờ | Hiển thị `48:00:00`, không quy đổi ra "ngày", không reset về `00` (BB-009) |
| TD-TICKET-F2 | Ticket `SEC-209` — 1 đợt đã đóng kéo dài ≥ 100 giờ (vd đúng 120 giờ) | Biên: số giờ đạt 3 chữ số | Hiển thị đủ số giờ thật, không bị cắt còn 2 chữ số (vd `120:00:00`) (BB-009b) |
| TD-TICKET-I | Ticket `SEC-210` — 1 đợt xử lý cực ngắn: phát hiện lỗi và hết lỗi gần như cùng lúc (chênh lệch vài giây, vd 0 giờ 0 phút 3 giây) | Biên: giá trị nhỏ nhất có thể > 0 | Hiển thị đủ định dạng 2 chữ số cho giờ/phút/giây (vd `00:00:03`), không thiếu số 0 phía trước (BB-016) |

---

## Dữ liệu theo permission

| user | role | permission | purpose |
|---|---|---|---|
| TD-USER-SECURITY | Vai trò "Security" trên đúng dự án chứa ticket test (hoặc vai trò Admin hệ thống) | Được xem đầy đủ Security Dashboard + chi tiết ticket, bao gồm field Resolution Time mới | Dùng cho toàn bộ test case bình thường (BB-001 → BB-016, trừ BB-011) |
| TD-USER-NOACCESS | Vai trò thông thường không có quyền Security trên dự án chứa ticket (vd Developer thường, hoặc có quyền Security nhưng ở **dự án khác**) | Bị từ chối truy cập Security Dashboard / chi tiết ticket của dự án không được cấp quyền | BB-011 — xác nhận field mới không làm lộ dữ liệu ra ngoài luồng phân quyền hiện có |

---

## Cleanup

- Đây là tính năng **chỉ đọc dữ liệu** (không có thao tác ghi/sửa/xoá nào khi
  xem field Resolution Time) — bản thân việc chạy test case không tạo ra dữ
  liệu cần dọn dẹp.
- Dữ liệu lịch sử quét bảo mật giả lập (TD-TICKET-A → TD-TICKET-I) được tạo
  riêng cho môi trường test — sau khi hoàn tất đợt test, xoá các ticket/dự án
  giả lập này khỏi môi trường test theo quy trình dọn dữ liệu test thông
  thường của dự án (không thao tác trên môi trường production).
- Không sử dụng dữ liệu ticket/khách hàng thật cho bất kỳ case nào ở trên.
- Không lưu thông tin nhạy cảm (tên khách hàng thật, số liệu bảo mật thật)
  vào tài liệu test case hay ảnh chụp màn hình đính kèm báo cáo.
