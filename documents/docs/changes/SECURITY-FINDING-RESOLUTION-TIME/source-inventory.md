# Source Inventory — SECURITY-FINDING-RESOLUTION-TIME

Tất cả mục dưới đây là **quan sát trực tiếp từ source code hiện có**, kèm đường dẫn
và số dòng. Không có suy đoán nghiệp vụ trong tài liệu này.

## 1. Bảng dữ liệu

### 1.1 `tbl_fact_security_finding` (ứng viên chính cho "security finding")

- Định nghĩa: `EDCAP_BE/src/main/resources/db/migration/V4__init_shema_v2.sql:760-780`
- Cột: `security_finding_id` (PK UUID), `security_scan_id` (FK →
  `tbl_fact_security_scan`), `ticket_id`, `pr_id`, `rule_id`, `scanner_type`,
  `severity` (`severity_level`, NOT NULL), `status` (`finding_status`, DEFAULT
  `'OPEN'`), `finding_summary`, `affected_path_hash`, `detected_at`, `resolved_at`,
  `false_positive_flag`, `resolution_summary`, `created_at/by`, `updated_at/by`.
- Constraint: `ck_security_finding_time`:
  `resolved_at IS NULL OR detected_at IS NULL OR resolved_at >= detected_at`
  (dòng 779) — đảm bảo bất biến thời gian, phù hợp để tính resolution time.
  Index: `idx_security_finding_status ON tbl_fact_security_finding(ticket_id, severity, status)`
  (dòng 1294).
- **Không có Java code (service/adapter/repository/controller) nào trong
  `EDCAP_BE/src/main/java` tham chiếu bảng này** — xác nhận bằng
  `grep -rn "tbl_fact_security_finding|SecurityFinding" EDCAP_BE/src` → 0 kết quả
  ngoài chính file migration.
- **Không có migration nào sau `V4` sửa đổi bảng này** — xác nhận bằng
  `grep -l "tbl_fact_security_finding" *.sql` trong thư mục migration → chỉ có `V4`.
- **Không có test nào tham chiếu bảng/entity này** — xác nhận bằng
  `grep -rl "tbl_fact_security_finding|SecurityFinding" EDCAP_BE/src/test` → 0 kết quả.

### 1.2 `tbl_fact_security_scan` (bảng cha, ĐANG được dùng)

- Định nghĩa: `V4__init_shema_v2.sql:740-758`.
- Cột liên quan: `finding_count`, `unresolved_count`, `started_at`, `finished_at`,
  `collected_at` — không có `resolved_at`/`detected_at` ở mức scan.
- Có entity: `EDCAP_BE/src/main/java/com/sdd/platform/domain/model/SecurityScan.java`
  (đọc toàn bộ, 48 dòng) — map field-by-field với các cột trên; **không có field
  resolution time**.
- Có DTO: `EDCAP_BE/src/main/java/com/sdd/platform/web/dto/SecurityScanDtos.java`,
  `SecurityDashboardDtos.java` (chưa đọc toàn văn, chỉ xác nhận tồn tại qua grep).
- Có adapter: `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/adapter/SecurityDashboardJdbcAdapter.java`
  (chưa đọc toàn văn).
- Model tổng hợp `SecurityDashboardModels.SecurityScanResult` (đọc toàn bộ,
  `SecurityDashboardModels.java:98-105`): `scannerType, scanStatus, severity,
  findingCount, unresolvedCount` — **là số đếm, không phải thời gian**.

### 1.3 `tbl_fact_finding` (finding tổng quát từ review, ĐANG được dùng — KHÔNG phải security scanner)

- Định nghĩa: `V4__init_shema_v2.sql:610-631`.
- Cột: `finding_id`, `ticket_id`, `pr_id`, `review_id`, `review_comment_id`,
  `source_actor_type_id`, `category_id`, `severity`, `status` (`finding_status`),
  `accepted_flag`, `false_positive_reason`, `finding_summary`,
  `source_location_hash`, `detected_at`, `resolved_at`.
- Constraint tương tự: `ck_finding_time` (dòng 630).
- Đang được dùng bởi:
  - `EDCAP_BE/src/main/java/.../infrastructure/persistence/adapter/DevDashboardJdbcAdapter.java`
    (dòng 210, 292, 299, 332, 414 — chỉ `COUNT(*)`, không tính resolution time)
  - `EDCAP_BE/src/main/java/.../infrastructure/persistence/adapter/QaDashboardJdbcAdapter.java`
    (dòng 118 — `COUNT(*)`)
  - `EDCAP_BE/src/main/java/.../infrastructure/persistence/adapter/EvidenceQualityScoreRepositoryAdapter.java`
    (dòng 494-526 — chỉ đếm `finding_count` trong 1 review, không tính resolution
    time)
- Nguồn finding này gắn với review/PR (`source_actor_type_id`,
  `review_comment_id`), **không có `scanner_type`/`security_scan_id`** — không đồng
  nhất về mặt schema với "security finding" theo đúng nghĩa scanner.

### 1.4 Bảng `finding` (legacy, schema V1, có khả năng đã bị drop)

- Định nghĩa cũ: `V1__init_schema.sql:141-156` — cột `source_actor`,
  `raised_at`/`resolved_at`, không có `scanner_type`.
- `V3__drop_unused_tables.sql` và `V162__drop_legacy_non_tbl_tables.sql` tồn tại
  trong thư mục migration (tên gợi ý drop bảng non-`tbl_` cũ) — **chưa đọc nội dung
  để xác nhận bảng `finding` legacy có bị drop hay không**. Không dùng bảng này làm
  căn cứ vì không tham chiếu trong bất kỳ code nghiệp vụ nào hiện tại.

## 2. Enum liên quan

- `finding_status`: `V4__init_shema_v2.sql:49` — `('OPEN', 'ACCEPTED', 'REJECTED',
  'RESOLVED', 'FALSE_POSITIVE', 'WONT_FIX')`.
- `severity_level`: dùng chung nhiều bảng (chưa trích dòng định nghĩa cụ thể, xuất
  hiện nhiều nơi trong `V4__init_shema_v2.sql`).

## 3. Frontend

- `EDCAP_FE/src/pages/security-dashboard/types.ts` (đọc 100 dòng đầu): có
  `SecurityFilters`, `SecurityDashboardSummary`, `SecurityTicketRow`,
  `SecurityScanResult`, `SecurityException`, `SecurityTicketDetail` — **không có bất
  kỳ field nào về thời gian resolution** (không có `resolvedAt`, `detectedAt`,
  `resolutionTimeSeconds`, v.v.).
- `EDCAP_FE/src/pages/security-dashboard/components/SecurityTicketDetailDrawer.tsx`
  — tồn tại (từ grep), chưa đọc nội dung.

## 4. Ticket liên quan trong `docs/changes/`

- `docs/changes/SECURITY-DASHBOARD/` — ticket đã hoàn thành đầy đủ artifact SDD
  (spec-pack, impl-plan, test-plan, v.v.) cho dashboard hiện có. Có thể chứa
  promotion-candidate liên quan đến resolution time — **chưa đọc nội dung
  `spec-pack.md`/`promotion-candidates.md` của ticket này**, cần đọc ở bước tiếp
  theo nếu người dùng xác nhận đây là ticket kế thừa/mở rộng từ SECURITY-DASHBOARD.
- `docs/changes/ARTIFACT-SCANNER/` — tồn tại, liên quan đến scanner nói chung
  (`ArtifactScannerJdbcAdapter.java` có xử lý `tbl_fact_risk.resolved_at`, không
  phải `tbl_fact_security_finding`) — chưa đọc nội dung ticket.
- `docs/changes/EVIDENCE-QUALITY-SCORE/`, `docs/changes/FIRST-CI-PASS-EXCEPTION-KPI/`
  — ví dụ pattern ticket dạng KPI/metric đã hoàn thành, có thể tham khảo cấu trúc
  spec-pack/impl-plan ở bước sau — chưa đọc nội dung.

## 5. Kết luận rút ra (fact, không phải spec)

1. Có đúng 1 bảng khớp tên miền "security finding" với đủ cột thời gian:
   `tbl_fact_security_finding`, nhưng **orphaned** ở tầng application (0 dòng code
   tham chiếu).
2. Không có existing API/DTO/UI nào phơi bày "resolution time" cho security finding.
3. Do đó ticket này gần như chắc chắn là **tính năng mới hoàn toàn** (cần: đọc dữ
   liệu từ `tbl_fact_security_finding`, tính khoảng `resolved_at - detected_at`,
   expose qua API + UI), chứ không phải sửa/mở rộng tính năng đã có.
4. Toàn bộ câu hỏi "công thức tính, đơn vị, ngưỡng SLA, phạm vi lọc, có cần ghi dữ
   liệu vào bảng orphaned trước không, ai ghi dữ liệu vào đó" đều chưa có câu trả
   lời trong source code hay tài liệu — xem `open-issues.md`.
