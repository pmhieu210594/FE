# context.md

**Ticket ID**: SECURITY-FINDING-RESOLUTION-TIME
**Vai trò**: Tech Lead — chuẩn bị context/rule riêng để AI implement không hiểu
sai codebase hiện có.
**Create date**: 2026-08-17

## File đã đọc

**Database / migration:**
- `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql` (dòng
  1-60 — enum; dòng 300-345 — `tbl_connector_run`; dòng 595-785 —
  `tbl_fact_finding`/`tbl_fact_security_scan`/`tbl_fact_security_finding`;
  dòng 1294 — index; dòng 1450-1470 — seed `tbl_dim_finding_category`)
- `EDCAP_BE/src/main/resources/db/migration/V117__safety_pack_existence.sql`
  (toàn bộ 30 dòng đầu — **phát hiện quan trọng**, xem mục "Mapping")
- `EDCAP_BE/src/main/resources/db/migration/V160__artifact_scanner.sql` (30
  dòng đầu — xác nhận `scan_status` ở dòng này thuộc bảng khác
  `tbl_fact_artifact_snapshot`, không phải `tbl_fact_security_scan`)
- Danh sách toàn bộ 60 file migration (`ls`) — xác nhận không có migration nào
  khác sau V117 sửa `tbl_fact_security_scan` liên quan tới field này

**Backend (đọc toàn văn):**
- `application/usecase/securitydashboard/SecurityDashboardService.java` (205 dòng)
- `application/usecase/securitydashboard/SecurityDashboardModels.java` (136 dòng)
- `application/port/out/persistence/SecurityDashboardRepositoryPort.java` (37 dòng)
- `infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java` (638 dòng)
- `web/dto/SecurityDashboardDtos.java` (196 dòng)
- `web/rest/SecurityDashboardController.java` (120 dòng)
- `domain/model/SecurityScan.java` (48 dòng)
- `test/.../SecurityScanRepositoryAdapterTest.java` (30 dòng, toàn bộ)

**Backend (đọc một phần):**
- `test/.../securitydashboard/SecurityDashboardServiceTest.java` (80/nhiều dòng đầu)

**Frontend (đọc toàn văn):**
- `pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx` (170 dòng)
- `pages/security-dashboard/types.ts` (109 dòng)
- `src/i18n.ts` (63 dòng)

**Frontend (đọc một phần / grep):**
- `lib/api.ts` dòng 1302-1404 (block `securityDashboard`)
- `src/__ tests __/security-dashboard/SecurityDashboardPage.test.tsx` (60 dòng đầu)
- `public/locales/en/locale.json` dòng 947-1012 (`Pages.SecurityDashboard`)
- `public/locales/ja/locale.json` dòng 966-1030 (`Pages.SecurityDashboard`)
- `public/locales/vi/locale.json` — xác nhận tồn tại key `SecurityDashboard`
  (dòng 1018), chưa đọc toàn bộ nội dung chi tiết

**Xác nhận package (grep/find, không đọc nội dung):**
- `web/exception/GlobalExceptionHandler.java`
- `application/exception/ForbiddenException.java`
- `domain/exception/NotFoundException.java`

---

## Implementation tương tự

| Flow | Vai trò tham khảo | Đã đọc mức nào |
|---|---|---|
| **Security Dashboard** (chính ticket này mở rộng) | Toàn bộ pattern hexagonal (Service/Port/Adapter/Controller/DTO) cho đúng domain đang sửa | Toàn văn tất cả file liên quan |
| **Artifact Scanner** (`application/usecase/scanner/`) | Ví dụ 1 flow hexagonal đầy đủ khác (Service+Port+Adapter+Controller+DTO) để đối chiếu convention đặt tên/cấu trúc | Chỉ liệt kê file, chưa đọc nội dung |
| **Evidence Quality Score** (`application/usecase/quality/`) | Ví dụ tính 1 metric tổng hợp từ nhiều tín hiệu có sẵn (tương tự việc tính resolution time từ lịch sử scan) | Đọc 1 đoạn (`EvidenceQualityScoreRepositoryAdapter.java:480-529`) ở phase trước |
| **Data Ops Dashboard "Recent runs"** (`DataOpsConnectorRunItem`) | Phương án nguồn dữ liệu ĐÃ BỊ LOẠI (`tbl_connector_run`) — chỉ còn giá trị tham khảo về cách hiển thị 1 danh sách "run" theo thời gian, KHÔNG dùng làm nguồn cho ticket này | Đọc ở phase trước, đã loại bỏ |
| **SecurityScanRepositoryAdapter** (MyBatis, `SecurityScanMapper`) | **KHÔNG liên quan tới ticket này** — đây là adapter **ghi** (write-side, ingest scan từ GitHub Actions), khác hoàn toàn với `SecurityDashboardJdbcAdapter` (đọc, dashboard). Cùng bảng `tbl_fact_security_scan` nhưng 2 adapter riêng biệt theo 2 bounded context (ghi vs đọc) | Đọc toàn văn test (30 dòng) |

---

## Pattern nên dùng

1. **Đọc dữ liệu dashboard** → `NamedParameterJdbcTemplate` với SQL dạng text
   block (`"""..."""`), named parameter (`:paramName`), giống 100% style của
   `SecurityDashboardJdbcAdapter` — **không dùng MyBatis Mapper** cho phần đọc
   này (MyBatis chỉ dùng ở write-side, khác adapter).
2. **Service layer mỏng**: `SecurityDashboardService` hiện tại chỉ
   validate/normalize rồi gọi thẳng `repository.xxx(...)` — nếu thêm logic
   cycle-detection vào Service (khuyến nghị của spec-pack §9, A-8), đây sẽ là
   **lần đầu Service này có business logic thực sự** thay vì chỉ pass-through;
   vẫn giữ `@Transactional(readOnly = true)` như các method khác.
3. **Port interface mở rộng**: thêm method mới vào
   `SecurityDashboardRepositoryPort` (interface), implement ở
   `SecurityDashboardJdbcAdapter` — đúng pattern `application` định nghĩa port,
   `infrastructure` implement (`20-architecture.md`).
4. **DTO mapping**: mỗi model có DTO record riêng + static factory
   `from(Model m)` — theo đúng pattern toàn bộ `SecurityDashboardDtos.java`
   (không dùng MapStruct/ModelMapper, không có trong dự án).
5. **Exception**: `ForbiddenException` (`application.exception`) cho permission,
   `NotFoundException` (`domain.exception`) cho ticket không tồn tại — dùng lại
   y nguyên, không tạo class exception mới.
6. **Permission**: field mới nằm trong response đã được bảo vệ bởi
   `service.requireSecurityAccess(caller, projectId)` gọi từ
   `SecurityDashboardController.ticketDetail(...)` — không cần thêm permission
   check riêng.
7. **FE type**: thêm field vào `type SecurityTicketDetail` trong `types.ts`
   (named export, không default export — `10-style.md`).
8. **FE hiển thị**: thêm 1 block/dòng mới trong `SecurityTicketDetailDrawer.tsx`,
   dùng `t("Pages.SecurityDashboard.drawer.xxx")` giống 100% các label khác
   trong cùng file (dòng 68, 108, 138 hiện có).
9. **i18n**: thêm key mới đồng thời vào **cả 3 file**
   `public/locales/{en,vi,ja}/locale.json`, dưới `Pages.SecurityDashboard.drawer`
   — namespace `locale` đã có sẵn, không tạo namespace mới.
10. **`lib/api.ts` không cần sửa** — `endpoints.securityDashboard.ticketDetail`
    (dòng 1378-1379) dùng generic `api.get<SecurityTicketDetail>(...)`, field
    mới tự động có mặt khi type `SecurityTicketDetail` được cập nhật.

---

## Pattern cấm dùng

- **Không tạo endpoint mới** — field bổ sung vào response
  `GET /api/v1/security/dashboard/tickets/{ticketId}` đã có.
- **Không thêm `ResponseEntity` status code tùy biến** trong controller
  (`30-security.md`) — lỗi phải đi qua `GlobalExceptionHandler`
  (`web/exception/GlobalExceptionHandler.java`).
- **Không dùng `@Data`** trên domain model — style hiện có (`SecurityScan.java`)
  dùng `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor`
  (`10-style.md`).
- **Không field-inject `@Autowired`** — toàn bộ Service/Adapter/Controller hiện
  tại dùng constructor injection, giữ nguyên.
- **Không dùng MyBatis Mapper** cho phần đọc dashboard (đó là style write-side
  của `SecurityScanRepositoryAdapter`, khác hoàn toàn với
  `SecurityDashboardJdbcAdapter`).
- **Không tạo bảng/cột/migration DB mới** (spec-pack §4 — Ngoài phạm vi).
- **Không dùng lại** `tbl_fact_security_finding`, `tbl_connector_run`,
  `tbl_fact_finding` (category `SECURITY`) làm nguồn dữ liệu — cả 3 đã bị loại
  qua các vòng quyết định (xem `00_brainstorm.md` Phụ lục).
- **Không escape ký tự tiếng Nhật thành `\uXXXX`** trong file `.json` locale —
  giữ nguyên literal UTF-8 (xem `public/locales/ja/locale.json` hiện tại toàn
  bộ dùng ký tự Nhật trực tiếp, ví dụ `"セキュリティスキャン"`, không phải
  `"セキ..."`).
- **Không dùng `java.time.Duration.toString()` mặc định** để format resolution
  time — kết quả sẽ là chuỗi ISO-8601 kiểu `"PT27H30M"`, KHÔNG khớp yêu cầu
  `HH:mm:ss` đã chốt (BR-6). Phải tự viết formatter thủ công.
- **Không gọi `fetch` trực tiếp ở FE** — mọi API call qua `lib/api.ts`
  (`20-architecture.md`).
- **Không dùng default export** ở bất kỳ file FE nào được sửa/tạo mới
  (`10-style.md`).
- **Không tự thêm `React.forwardRef`** cho `SecurityTicketDetailDrawer` nếu chỉ
  sửa nội dung bên trong — component này hiện tại không dùng `forwardRef` (nó
  là feature/page component, không phải reusable UI component trong
  `components/ui/`); chỉ áp dụng `forwardRef + displayName + CVA` nếu tạo thêm
  1 component **tái sử dụng** mới trong `components/ui/`.

---

## Method tồn tại / method không tồn tại

### Method THỰC SỰ tồn tại (được phép gọi/override)

**`SecurityDashboardService`**: `requireAnyAccess(caller)`,
`requireSecurityAccess(caller, projectId)`, `getSummary(...)`,
`getTickets(...)`, `getProjectIdForTicket(ticketId)`,
`getTicketDetail(ticketId)`, `getOptions(...)`, `exportCsv(...)`,
`normalize(...)` (package-private), `validateEnum(...)` (private),
`csv(...)` (private static).

**`SecurityDashboardRepositoryPort`** (interface): `findSafetyPackCounts`,
`findSecretScanCounts`, `findSastScaCounts`, `findExceptionCounts`,
`findTicketRows`, `findTicketDetail`, `findProjectIdByTicketId`,
`findOptions`, `hasDashboardAccess`, `findProjectRole`.

**`SecurityDashboardJdbcAdapter`**: implement toàn bộ method trên + helper
private `applyRepositoryLevelFilters`, `applyTicketLevelFilters`,
`applyTicketRowFilters`, `applyRepositoryCrossTicketFilters`.

**`SecurityScan`** (domain entity — dùng bởi write-side, KHÔNG dùng cho field
này): `securityScanId`, `repositoryId`, `repositoryNameMasked`, `ticketId`,
`prId`, `ciRunId`, `branchName`, `commitSha`, `pullRequestNumber`,
`workflowRunId`, `workflowJobName`, `scannerType`, `scannerName`, `scanTool`,
`status`, `scanStatus`, `severity`, `findingCount`, `unresolvedCount`,
`criticalCount`, `highCount`, `mediumCount`, `lowCount`, `infoCount`,
`summary`, `scanCountsJson`, `startedAt`, `finishedAt`, `collectedAt` (Lombok
`@Getter`/`@Setter` tự sinh, không có method custom nào khác).

### Method / cột KHÔNG tồn tại — AI dễ tự bịa, TUYỆT ĐỐI KHÔNG dùng

| Bị bịa ra (SAI) | Lý do sai | Thực tế |
|---|---|---|
| `SecurityDashboardRepositoryPort.findSecurityScanHistory(...)` | Nghe hợp lý nhưng **chưa tồn tại** | Phải tự tạo mới nếu impl-plan chọn hướng này |
| `SecurityScan.getResolvedAt()` / `getDetectedAt()` | Tên hợp lý theo domain "finding" nhưng **field này không có trong `SecurityScan.java`** | `SecurityScan` chỉ có `startedAt`/`finishedAt`/`collectedAt` — không có khái niệm resolved/detected ở entity này |
| Cột `resolved_at`/`detected_at` trong `tbl_fact_security_scan` | Các cột này thuộc `tbl_fact_finding`/`tbl_fact_security_finding` (2 bảng **đã bị loại khỏi scope**) | `tbl_fact_security_scan` chỉ có `unresolved_count` + `collected_at` — resolution time phải **suy diễn**, không đọc trực tiếp |
| `SecurityDashboardService.getResolutionTime(...)` | Chưa tồn tại | Cần tạo mới ở impl-plan |
| `SecurityDashboardModels.SecurityTicketDetail.withResolutionTime(...)` | Record Java **không tự sinh** method `withXxx` (không phải dùng thư viện kiểu Lombok `@With`) | Phải tạo lại toàn bộ instance bằng constructor đầy đủ tham số |
| `Duration.toString()` cho ra `"27:30:00"` | **Sai** — `Duration.toString()` cho ra ISO-8601 (`"PT27H30M"`) | Phải tự viết formatter |
| Bất kỳ `DateUtils`/`DurationUtils` có sẵn để format `HH:mm:ss` không giới hạn giờ | Chưa tìm thấy class tiện ích nào như vậy trong `EDCAP_BE` qua các file đã đọc | Coi là chưa có, phải viết mới (xác nhận thêm ở `impl-plan.md` nếu muốn chắc chắn 100%, chưa grep toàn bộ `util/` package) |

---

## Mapping

| DB column (`tbl_fact_security_scan`) | Dùng cho field này? | Java field tương ứng | Ghi chú |
|---|---|---|---|
| `ticket_id` | ✅ Có | filter theo `SecurityFilter`/tham số | Có sẵn trực tiếp trên bảng, không cần join |
| `scanner_type` | ✅ Có (`= 'SAST'`) | `SecurityScan.scannerType` | Giá trị cố định theo BR-1 |
| `unresolved_count` | ✅ Có | `SecurityScan.unresolvedCount` | Tín hiệu chính để xác định cycle (BR-2) |
| `collected_at` | ✅ Có | `SecurityScan.collectedAt` | Mốc thời gian để sắp xếp + tính hiệu số (BR-2, BR-4) |
| `status` (`run_status` enum: SUCCESS/FAILED/CANCELLED/SKIPPED/RUNNING/PENDING/UNKNOWN/QUEUED/IN_PROGRESS/FAILURE) | ❌ Không | `SecurityScan.status` | Trạng thái **chạy** của scan job — KHÔNG liên quan business logic field này |
| `scan_status` (VARCHAR business status: PASS/WARNING/FAIL/MISSING tùy scanner_type — thêm bởi `V117__safety_pack_existence.sql`, KHÔNG phải DB enum) | ❌ Không | `SecurityScan.scanStatus` | Dễ nhầm với "đã resolved" — **SAI**, đây là kết quả PASS/FAIL của lần scan đó, không phải tín hiệu resolved/unresolved của finding |
| `finding_count`, `critical_count`, `high_count`, `medium_count`, `low_count`, `info_count` | ❌ Không | tương ứng | Không dùng cho công thức đã chốt (chỉ dùng `unresolved_count`) |
| `severity` (`severity_level`: INFO/LOW/MEDIUM/HIGH/CRITICAL) | ❌ Không | `SecurityScan.severity` | Không cần cho field này (không phân theo severity — spec-pack A-2) |

**Model / DTO / FE chain (cần đồng bộ khi thêm field):**

| Layer | Vị trí | Thay đổi cần thiết |
|---|---|---|
| DB | `tbl_fact_security_scan` | Không đổi — chỉ đọc |
| Domain/Application model | `SecurityDashboardModels.SecurityTicketDetail` (record, dòng 123-135) | Thêm tham số `String resolutionTime` |
| Application → Adapter contract | `SecurityDashboardRepositoryPort` | Có thể cần thêm method mới (tùy quyết định impl-plan — xem "Pattern nên dùng" #2/#3) |
| Adapter | `SecurityDashboardJdbcAdapter.findTicketDetail(...)` | Sửa **cả 2 nơi khởi tạo** `SecurityTicketDetail` trong method này (dòng ~473 header tạm, dòng ~528 record cuối) |
| Web DTO | `SecurityDashboardDtos.SecurityTicketDetailDto` (dòng 169-195) | Thêm field + cập nhật `from(...)` |
| Controller | `SecurityDashboardController.ticketDetail(...)` | **Không cần sửa** — chỉ gọi `SecurityTicketDetailDto.from(service.getTicketDetail(ticketId))` |
| FE type | `pages/security-dashboard/types.ts` (`SecurityTicketDetail`, dòng 97-108) | Thêm `resolutionTime: string` |
| FE hiển thị | `SecurityTicketDetailDrawer.tsx` | Thêm block hiển thị mới |
| i18n | `public/locales/{en,vi,ja}/locale.json` → `Pages.SecurityDashboard.drawer` | Thêm key mới (tên cụ thể do impl-plan đặt, gợi ý `resolutionTime` hoặc `resolutionTimeTitle`) ở **cả 3 file** |

---

## Rule nghiệp vụ đặc thù

- **Quyền/Permission**: dùng lại `requireSecurityAccess(caller, projectId)` —
  logic: `ADMIN` (role hệ thống) luôn qua; nếu không, phải có role
  `SECURITY` đúng `projectId` của ticket đó (không phải role `SECURITY` ở
  project khác). Không có permission cấp field-level riêng cho
  `resolutionTime` — cùng cấp với toàn bộ `SecurityTicketDetail`.
- **Đa ngôn ngữ**: dự án hỗ trợ đúng 3 ngôn ngữ `en`, `vi`, `ja`
  (`i18n.ts:25`), namespace duy nhất `"locale"` (`i18n.ts:52-53`), file load
  runtime qua `fetch(/locales/{lang}/{ns}.json)` — **không phải bundle tĩnh**,
  nên thiếu key ở 1 ngôn ngữ sẽ hiển thị fallback (`en` theo `fallbackLng`)
  chứ không lỗi build. Vẫn phải thêm đủ cả 3 để đúng UX đa ngôn ngữ đã chốt.
- **Master data / code value**: không có bảng master/code-value riêng nào áp
  dụng cho field này (đã kiểm tra `tbl_dim_finding_category`,
  `severity_level`, `finding_status`, `run_status` — không cái nào liên quan
  trực tiếp tới việc tính `resolutionTime`, chỉ liên quan tới các bảng đã bị
  loại khỏi scope).
- **Không có khái niệm SEQNO/formItemNm** trong toàn bộ vùng dữ liệu liên quan
  (đây là platform quản lý dashboard/metadata kỹ thuật, không phải hệ thống
  form động kiểu SAP/ERP) — không áp dụng cho ticket này.
- **Quan hệ bảng đặc thù cần biết**: `tbl_dim_ticket` **không có cột
  `repository_id`** (ghi rõ trong comment
  `SecurityDashboardJdbcAdapter.java:28-29`) — repository của 1 ticket phải suy
  ra qua CTE `ticket_repo` (COALESCE từ `tbl_fact_security_scan`,
  `tbl_fact_artifact_snapshot`, `tbl_fact_exception`). **Field
  `resolutionTime` của ticket này KHÔNG cần dùng `ticket_repo`/`repository_id`**
  vì `tbl_fact_security_scan.ticket_id` đã có sẵn trực tiếp — chỉ nêu ra để
  tránh AI tự thêm join không cần thiết.
- **⚠️ Quan trọng — `tbl_fact_security_scan` có UNIQUE constraint
  `(repository_id, commit_sha, scanner_type)`** (thêm bởi
  `V231__dedupe_security_evidence_upsert.sql`, đọc toàn văn trong phiên này).
  Hệ quả: KHÔNG có nhiều row cho cùng 1 commit — scan lại cùng commit sẽ
  upsert đè row cũ. "Lịch sử theo thời gian" mà công thức cycle dựa vào **chỉ
  tồn tại xuyên qua các commit khác nhau** của cùng ticket (mỗi commit mới →
  1 row mới vì `commit_sha` đổi). Nếu ticket chỉ có 1 commit được scan (dù
  scan lại nhiều lần), sẽ chỉ có **1 row duy nhất** → không thể có cả
  "detected" và "resolved" từ cùng ticket đó ở thời điểm đó (xem chi tiết đầy
  đủ ở `source-map.md` mục "Phát hiện quan trọng"). Đây là chi tiết **cần
  đồng bộ ngược vào `spec-pack.md`** (Terminology + Assumption A-7) ở bước
  sau — ngoài phạm vi 3 file của task này nhưng không được bỏ qua khi code.
- **`tbl_fact_security_scan` có 2 “nguồn tuổi thọ” cột khác nhau**: cột gốc từ
  `V4` (`status`, `severity`, `finding_count`, `unresolved_count`,
  `started_at`, `finished_at`, `collected_at`) và cột bổ sung từ `V117`
  (`scan_status`, `critical_count`, `high_count`, `medium_count`, `low_count`,
  `info_count`, `scan_tool`, `scan_counts_json`, ...). Cả 2 nhóm cùng tồn tại
  trên **cùng 1 bảng hiện tại** — không phải 2 bảng khác nhau, không phải
  version cũ/mới loại trừ nhau.

---

## Chú ý khi implement

1. `SecurityTicketDetail` là **Java record** (bất biến) — khi thêm field
   `resolutionTime`, phải sửa **constructor call ở cả 2 chỗ** trong
   `SecurityDashboardJdbcAdapter.findTicketDetail(...)` (dòng ~471-484 và
   ~528-537) **và** định nghĩa record trong `SecurityDashboardModels.java`
   (dòng 123-135). Thiếu 1 chỗ sẽ lỗi compile ngay (dễ phát hiện, nhưng dễ quên
   nếu chỉ sửa bằng tìm-thay-thế chuỗi).
2. Nếu đặt logic cycle-detection ở `SecurityDashboardJdbcAdapter` (theo phong
   cách SQL-heavy hiện tại của toàn file) thay vì ở `SecurityDashboardService`
   (khuyến nghị A-8 của spec-pack) — đây là **quyết định kiến trúc cần chốt ở
   impl-plan**, không phải quyết định đã có sẵn. Cả 2 hướng đều hợp lệ về mặt
   compile, nhưng ảnh hưởng trực tiếp tới khả năng unit test (`40-testing.md`:
   mock port interface, không mock SQL).
3. Viết formatter `HH:mm:ss` thủ công (ví dụ: tính tổng giây, chia
   `totalSeconds / 3600` cho `HH` không giới hạn 2 chữ số khi > 99 giờ — làm rõ
   ở impl-plan có cần padding hay không khi giờ ≥ 100).
4. Không đổi tên/behavior của method có sẵn (`getTicketDetail`,
   `findTicketDetail`, ...) — chỉ **mở rộng** dữ liệu trả về.
5. `@Transactional(readOnly = true)` phải giữ nguyên trên bất kỳ method Service
   nào bị sửa/thêm (đúng pattern toàn bộ file).

## Chú ý khi review

1. Kiểm tra `SecurityTicketDetail` record được cập nhật đủ ở **cả 2 nơi khởi
   tạo** trong adapter (không chỉ 1 nơi).
2. Kiểm tra không có thêm N+1 query nghiêm trọng — `findTicketDetail` hiện đã
   chạy 3 query con (scans, checklist, exceptions) cho 1 ticket; thêm 1 query
   lấy lịch sử scan SAST là chấp nhận được, không cần tối ưu gộp query trừ khi
   review yêu cầu.
3. Kiểm tra format `HH:mm:ss` **không** dùng `Duration.toString()`/`.format()`
   mặc định của Java (sẽ ra sai định dạng).
4. Kiểm tra logic cycle duyệt theo `collected_at` **tăng dần** — khác với hầu
   hết query "latest" khác trong cùng file vốn dùng `DESC LIMIT 1`. Dễ copy
   nhầm hướng sắp xếp.
5. Kiểm tra cả 3 file `locale.json` (en/vi/ja) được cập nhật đồng bộ — thiếu 1
   file không lỗi build/runtime (chỉ fallback) nên dễ bị bỏ sót qua review
   thông thường, phải kiểm tra thủ công.
6. Kiểm tra không có cột/bảng mới nào bị thêm vào migration.
7. Kiểm tra permission: endpoint `tickets/{ticketId}` vẫn gọi
   `requireSecurityAccess` trước khi trả field mới (không bypass).

## Chú ý khi test

1. Nếu logic cycle đặt ở Service: unit test mock
   `SecurityDashboardRepositoryPort` (theo đúng pattern
   `SecurityDashboardServiceTest.java` hiện có, dùng `Mockito.mock(...)`), trả
   về danh sách raw scan theo các kịch bản: rỗng, 1 open cycle (0 cycle đóng),
   1 cycle đã đóng, N cycle đã đóng, N cycle đã đóng + 1 open cycle cuối
   (AC-SECFINDRES-1,2,3,7,8).
2. **Không mock `SecurityScan`/record model trực tiếp như "giả lập dữ liệu
   thật"** — theo `40-testing.md`, mock port, khởi tạo record/model bằng dữ
   liệu thật (record instantiation không phải là "mock").
3. Test boundary: `unresolved_count` dao động không đơn điệu (vd.
   3 → 1 → 2 → 0) vẫn phải tính là **1 cycle duy nhất** (chỉ quan tâm
   `> 0` so với `= 0`, không quan tâm giá trị cụ thể tăng/giảm giữa chừng).
4. FE test: theo pattern `SecurityDashboardPage.test.tsx` (mock
   `react-i18next` trả `defaultValue` nếu có, ngược lại trả nguyên `key`) —
   nếu label mới không truyền `defaultValue`, test sẽ thấy key thô
   (`"Pages.SecurityDashboard.drawer.resolutionTime"`) thay vì text hiển thị;
   cần quyết định rõ cách assert ở `impl-plan.md`/lúc viết test.
5. **AC Closure bắt buộc** (`40-testing.md`): phải có test mount
   `SecurityTicketDetailDrawer` bên trong `SecurityDashboardPage` thật (dùng
   `MemoryRouter` + `QueryClientProvider`, đúng theo
   `SecurityDashboardPage.test.tsx`), không chỉ test component cô lập.
6. Test format: xác nhận resolution time > 24 giờ hiển thị đúng
   (`"48:00:00"` không phải `"24:00:00"` hay lỗi tràn).
