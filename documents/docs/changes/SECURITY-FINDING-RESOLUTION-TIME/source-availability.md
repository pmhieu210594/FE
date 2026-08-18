# Source Availability

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Create date**: 2026-08-17
**Author**: Claude
**Update date**: 2026-08-17

| source | path | read_status | trust_level | owner | purpose | risk | action |
|---|---|---|---|---|---|---|---|
| Business requirement | — | **Missing** | — | — | Định nghĩa "resolution time", ngưỡng, phạm vi | **High — không thể viết spec-pack nếu thiếu** | blocking — cần người dùng cung cấp |
| Wireframe / UI spec | — | **Missing** | — | — | Yêu cầu hiển thị (dashboard, bảng, chart) | Medium | blocking nếu ticket có phần UI |
| `tbl_fact_security_finding` schema | `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql:760-780` | Read | High | Internal | Bảng dữ liệu ứng viên | Low | always-read |
| `tbl_fact_security_scan` schema | `V4__init_shema_v2.sql:740-758` | Read | High | Internal | Bảng cha của security finding | Low | always-read |
| `tbl_fact_finding` schema | `V4__init_shema_v2.sql:610-631` | Read | High | Internal | Bảng finding tổng quát đang dùng (khác domain) | Medium — dễ nhầm với `tbl_fact_security_finding` | verify-with-user |
| Application code cho `tbl_fact_security_finding` | `EDCAP_BE/src/main/java` (toàn bộ) | Read (grep, 0 kết quả) | High | Internal | Xác nhận bảng orphaned | **High — không có pipeline ghi/đọc, cần quyết định scope** | blocking |
| SecurityDashboardModels / SecurityScan | `EDCAP_BE/src/main/java/.../securitydashboard/`, `domain/model/SecurityScan.java` | Read | High | Internal | Model hiện có, không có resolution time | Low | reference |
| FE security-dashboard types | `EDCAP_FE/src/pages/security-dashboard/types.ts` | Read (partial) | High | Internal | Xác nhận FE chưa có field liên quan | Low | reference |
| `docs/changes/SECURITY-DASHBOARD/*` | `docs/changes/SECURITY-DASHBOARD/` | Not read (chỉ biết tồn tại) | Unknown | Internal | Có thể là ticket nền/liên quan | Medium | verify-with-user — cần hỏi có phải ticket kế thừa không |
| `docs/architecture/*`, `docs/standards/*` | — | Partial (liệt kê only) | High | Internal | Không đặc thù cho ticket, sẽ đọc ở impl-plan | Low | deferred |

---

## Summary

- **Business requirement: KHÔNG có sẵn.** Đây là gap chặn (blocking) việc viết
  `spec-pack.md` — không thể tự suy đoán để lấp khoảng trống này theo rule của dự
  án.
- **Database design: có sẵn nhưng orphaned** — bảng `tbl_fact_security_finding` tồn
  tại trong schema nhưng không có code nào ghi/đọc nó ở tầng application. Cần người
  dùng xác nhận đây có phải nguồn dữ liệu đúng hay không, và nếu đúng, ai/luồng nào
  sẽ ghi dữ liệu vào bảng này (hiện chưa có ingestion pipeline nào được tìm thấy).
- **Wireframe: KHÔNG có sẵn.**
- **Ticket nền (SECURITY-DASHBOARD): có tồn tại nhưng chưa xác nhận liên quan** — cần
  người dùng xác nhận ticket này có phải mở rộng của SECURITY-DASHBOARD hay độc lập.
