# Impact Analysis

**Ticket ID**: DATA-OPS-DASHBOARD
**Create date**: 2026-07-02
**Author**: Claude
**Update date**: 2026-07-02

## 1. Nội dung thay đổi

Bổ sung **Data Ops Dashboard** — một dashboard vận hành, chỉ đọc (read-only), tổng hợp dữ liệu hiện có từ:

- Connector execution history (`tbl_connector_run`)
- Parser/data quality metadata (`tbl_fact_data_quality`)
- Missing evidence (`tbl_fact_artifact_snapshot`)
- Traceability links (`tbl_fact_traceability_link`)

Kiến trúc tái sử dụng pattern **Developer Dashboard** (Controller → Service → RepositoryPort → JDBC Adapter, live aggregation qua `NamedParameterJdbcTemplate`, không snapshot table, không MyBatis XML) — **không** theo pattern PM Dashboard vì PM Dashboard dựa vào `tbl_fact_ticket_dashboard_snapshot`, một bảng cần Flyway migration mà ticket này bị cấm tạo mới.

2 trong số 7 KPI nêu ở scope (Security Alerts, Cost Summary) hiện chưa có nguồn dữ liệu được định nghĩa trong spec-pack (xem mục 14 và Open Issues) — được tách riêng, không nằm trong phạm vi implement đợt đầu cho đến khi có Human Decision.

---

## 2. File chịu ảnh hưởng trực tiếp

| file | lý do | loại thay đổi |
|---|---|---|
| `EDCAP_BE/.../web/rest/DataOpsDashboardController.java` | REST endpoint cho dashboard | Create |
| `EDCAP_BE/.../application/usecase/dataopsdashboard/DataOpsDashboardService.java` | Business logic tổng hợp KPI | Create |
| `EDCAP_BE/.../application/port/out/persistence/DataOpsDashboardRepositoryPort.java` | Port interface | Create |
| `EDCAP_BE/.../infrastructure/persistence/adapter/DataOpsDashboardJdbcAdapter.java` | Query read-only trên 6 bảng V4 | Create |
| `EDCAP_BE/.../web/dto/DataOpsDashboardDtos.java` | Response DTO | Create |
| `EDCAP_FE/src/pages/data-ops-dashboard/DataOpsDashboardPage.tsx` | Trang dashboard | Create |
| `EDCAP_FE/src/pages/data-ops-dashboard/components/{SummaryCards,FilterBar,ConnectorTable,ConnectorDetailDrawer}.tsx` | UI component theo pattern Dev/QA dashboard | Create |
| `EDCAP_FE/src/lib/api.ts` | Thêm `endpoints.dataOpsDashboard` | Modify |

---

## 3. File chịu ảnh hưởng gián tiếp

| file | lý do | rủi ro |
|---|---|---|
| `EDCAP_FE/src/components/dashboard/RoleTabs.tsx` | Thêm tab Data Ops vào dashboard shell | Thấp |
| `EDCAP_FE/src/components/Layout.tsx` | Đăng ký route mới | Thấp |
| `docs/architecture/route-api-map.md`, `fe-be-contract-map.md` | Cần cập nhật sau khi endpoint mới được chốt | Thấp |
| Existing security/session config | Endpoint mới phải nằm dưới cùng cơ chế xác thực hiện có | Thấp — không đổi logic auth |
| Existing logging/TraceId infra | Tái sử dụng, không sửa | Không |

---

## 4. Caller / Callee

| caller | callee | ảnh hưởng |
|---|---|---|
| Browser | `DataOpsDashboardController` (`/api/v1/dataops/dashboard/*`, đề xuất) | Mới |
| Controller | `DataOpsDashboardService` | Mới |
| Service | `DataOpsDashboardRepositoryPort` → `DataOpsDashboardJdbcAdapter` | Mới |
| JdbcAdapter | `tbl_connector_run`, `tbl_fact_data_quality`, `tbl_fact_artifact_snapshot`, `tbl_fact_traceability_link`, `tbl_dim_repository`, `tbl_dim_project` | Read-only, không sửa dữ liệu |

Không có caller/callee nào của Connector, Parser, hoặc Traceability module hiện tại bị thay đổi — dashboard chỉ là consumer mới.

---

## 5. Ảnh hưởng FE

- Trang mới `DataOpsDashboardPage.tsx`, đăng ký thêm 1 route + 1 tab trong `RoleTabs.tsx`.
- Tái sử dụng: dashboard layout, filter bar pattern, table component, drawer component (theo Dev/QA Dashboard).
- Thêm `endpoints.dataOpsDashboard` vào `lib/api.ts` (không sửa endpoint cũ).
- TanStack Query hooks mới cho summary/detail; không đổi state Redux/Zustand hiện có.

---

## 6. Ảnh hưởng BE

- REST Controller, Service, Port, JDBC Adapter, DTO mới hoàn toàn theo hexagonal layering hiện có (`domain ← application ← infrastructure/web`).
- Không sửa `application`/`infrastructure` của Connector, Parser, Traceability module.
- `@Transactional(readOnly = true)` ở Service, theo đúng pattern Dev/PM Dashboard.

---

## 7. Ảnh hưởng API contract

| endpoint | request impact | response impact | backward compatible? |
|---|---|---|---|
| `GET /api/v1/dataops/dashboard/summary` (mới) | Filter (project/repository/connector/parserStatus/search) | Dashboard Summary DTO | Yes (endpoint mới) |
| `GET /api/v1/dataops/dashboard/connectors/{id}/detail` (mới) | Path param | Connector Detail DTO | Yes |

Không endpoint hiện có nào bị sửa. Prefix đề xuất cần verify với `docs/architecture/route-api-map.md` trước khi chốt (chưa đọc — xem source-availability.md).

---

## 8. Ảnh hưởng DTO / Schema / Validation

- DTO mới: `DataOpsDashboardSummaryDto`, `DataOpsConnectorDetailDto`, `DataOpsDashboardFilterDto` (theo mapping ở context.md).
- Không sửa DTO/entity hiện có của Connector/Parser/Traceability.
- Validation filter parameter (project/repository/connector UUID tồn tại, parserStatus thuộc enum SUCCESS/WARNING/ERROR) thực hiện ở Service layer, tái dùng `GlobalExceptionHandler` cho lỗi.

---

## 9. Ảnh hưởng DB / Migration

- **Không migration, không bảng mới.** Chỉ đọc 6 bảng V4 đã tồn tại (đã xác nhận cột qua grep `V4__init_shema_v2.sql`).
- Khác với PM Dashboard (dùng snapshot table qua V330/V391/V394) — Data Ops Dashboard theo pattern Developer Dashboard (live aggregation, không snapshot), phù hợp với ràng buộc BR-5 của spec-pack.

---

## 10. Ảnh hưởng Batch / Job / Event

Không ảnh hưởng. Dashboard chỉ đọc kết quả đã có của Connector Scheduler và Parser Scheduler hiện tại; không kích hoạt, không sửa lịch chạy, không tạo job/event mới.

---

## 11. Ảnh hưởng Test

Test cần bổ sung:
- BE: `DataOpsDashboardServiceTest` (mock port, theo pattern `QaDashboardServiceTest`/`PmDashboardServiceTest` — **cần xác nhận đúng test source root** trước khi thêm, vì hiện có 2 root khác nhau: `src/test/java` và `src/test/UnitTest/java`).
- BE: `@WebMvcTest` cho `DataOpsDashboardController`.
- FE: Vitest cho `DataOpsDashboardPage`, `SummaryCards`, `FilterBar`, `ConnectorTable`, `ConnectorDetailDrawer` (theo `__ tests __/dev-dashboard/` pattern).
- Không ảnh hưởng test hiện có của Connector/Parser/Traceability/PM/QA/Dev Dashboard.

---

## 12. Ảnh hưởng Operation / Monitoring

- Tái sử dụng TraceId và logging framework hiện có, không thêm cơ chế mới.
- Không thay đổi alerting/monitoring hiện tại của Connector/Parser scheduler.
- Không sinh thêm audit record.

---

## 13. Ảnh hưởng Rollout / Rollback

**Rollout**: Deploy code BE + FE như một tính năng độc lập, không cần thay đổi cấu hình môi trường hay bảng dữ liệu.

**Rollback**: Gỡ bỏ Controller/Service/Adapter/DTO (BE) và Page/route/tab (FE). Không cần rollback DB vì không có migration/persistence mới.

---

## 14. Vùng phán định không ảnh hưởng và căn cứ

| vùng | phán định | căn cứ |
|---|---|---|
| Connector execution/scheduler | Không ảnh hưởng | Dashboard chỉ đọc `tbl_connector_run`, không gọi service thực thi connector (context.md liệt kê `ConnectorRetryService` là forbidden method) |
| Parser execution/scheduler | Không ảnh hưởng | Tương tự — chỉ đọc `tbl_fact_data_quality`, không gọi `ParserRetryService` |
| PM / QA / Developer Dashboard hiện có | Không ảnh hưởng | Data Ops Dashboard là module mới, độc lập route/controller/service, chỉ dùng chung shared FE component (`RoleTabs`, `SummaryCard`) theo cách composition, không sửa file của các dashboard kia |
| Authentication / Authorization | Không ảnh hưởng logic | Tái dùng cơ chế session hiện có, chỉ thêm endpoint mới dưới security config sẵn có, không đổi rule auth |
| V4 schema hiện tại | Không ảnh hưởng | Chỉ SELECT, không ALTER/INSERT/UPDATE/DELETE trên 6 bảng liên quan |
| Security Alerts / Cost Summary implementation | Chưa xác định — không phán định "không ảnh hưởng" | Thiếu nguồn dữ liệu được định nghĩa trong spec-pack Output/AC (mục 7, 8) — cần Human Decision trước khi kết luận |

---

## 15. Required Options

- Read-only aggregation.
- Reuse Developer Dashboard architecture (not PM Dashboard's snapshot pattern).
- Reuse existing shared dashboard FE shell/components.

---

## 16. Human Decision Required

| ID | decision item | reasons | owner | status |
|---|---|---|---|---|
| H-DATAOPS-1 | Freshness threshold | Dashboard KPI (spec-pack §16) | PM | Open |
| H-DATAOPS-2 | Connector Health calculation | Dashboard KPI (spec-pack §16) | PM | Open |
| H-DATAOPS-3 | Cost calculation | No data source mapped in Output/AC | PM | Open |
| H-DATAOPS-4 | Security Alerts data source | Scope lists it in-range but Output/AC don't define it; `contains_secret_detected` is only a candidate | PM | Open |

---

## 17. Risk Summary

| ID | risk | severity | mitigation |
|---|---|---|---|
| R-1 | Following PM Dashboard's snapshot pattern instead of Developer Dashboard's live-aggregation pattern | High | Explicitly follow `DevDashboardJdbcAdapter.java` as the reference, not `PmDashboardJdbcAdapter.java` |
| R-2 | Security Alerts / Cost Summary scoped but undefined | High | Implement the other 5 KPIs first (Connector Status, Parse Errors, Missing Evidence, Freshness, Broken Links); gate these 2 behind Human Decision |
| R-3 | Endpoint prefix collision with existing dashboards | Medium | Verify `docs/architecture/route-api-map.md` before finalizing `@RequestMapping` |
| R-4 | Two BE test source roots in use (`src/test/java` vs `src/test/UnitTest/java`) | Medium | Confirm via `pom.xml` test source config before adding new test class |
| R-5 | Live aggregation query performance across 6 tables at scale | Low | Reuse Developer Dashboard's existing indexing/query assumptions (already aggregates 5+ fact tables live) |
