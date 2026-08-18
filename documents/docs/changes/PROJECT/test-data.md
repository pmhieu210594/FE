# Test Data

**Ticket ID**: PROJECT  
**Create date**: 2026-06-16  
**Author**: Codex  
**Update date**: 2026-06-17

## 1. Purpose

Define the reusable black-box test data catalog for Project Management verification. This catalog uses synthetic fixtures only and is organized so later manual, API, component, and E2E tests can reference the same business-facing data sets consistently.

## 2. Data Design Rules

- Use synthetic names, UUIDs, and users only.
- Do not use secrets, production data, or real personal data.
- Keep data aligned to business-facing behavior, not internal implementation details.
- Maintain explicit coverage for normal, error, boundary, permission, audit, and operation viewpoints.
- Do not include `version` in any Project create or update payload.
- Keep delete scenarios aligned to `PUT /api/v1/projects/{id}/delete`.
- Treat `projectType` as free-text nullable input and `riskLevel` as a constrained severity value.

## 3. Core Fixture Sets

### 3.1 Customer Fixtures

| Data ID | Fixture | Example | Purpose |
|---|---|---|---|
| TD-CUSTOMER-01 | Active Customer A | `CUST_A / "Customer Alpha"` | Primary parent Customer for create, update, duplicate, and delete scenarios |
| TD-CUSTOMER-02 | Active Customer B | `CUST_B / "Customer Beta"` | Secondary Customer for duplicate-scope checks |
| TD-CUSTOMER-03 | Inactive or unavailable Customer | `CUST_X / "Customer Retired"` | Negative reference for invalid-parent scenarios if needed later |

### 3.2 Team Fixtures

| Data ID | Fixture | Example | Purpose |
|---|---|---|---|
| TD-TEAM-01 | Active Team set | `TEAM_ALPHA`, `TEAM_BETA`, `TEAM_GAMMA` | Valid Team assignment and reconciliation scenarios |
| TD-TEAM-02 | Duplicate Team input shape | `TEAM_ALPHA`, `TEAM_ALPHA` | Input-quality boundary scenario for later automation design |
| TD-TEAM-03 | Nonexistent Team reference | `TEAM_UNKNOWN` | Invalid Team reference scenario |
| TD-TEAM-04 | Inactive or unavailable Team | `TEAM_RETIRED` | Negative Team-availability scenario |

### 3.3 User / Authorization Fixtures

| Data ID | Fixture | Example | Purpose |
|---|---|---|---|
| TD-USER-AUTH-01 | Authorized caller | `project_admin_user` | Positive Project list/detail/create/update/delete paths |
| TD-USER-AUTH-02 | Unauthorized caller | `limited_user` | Permission rejection across Project actions |
| TD-USER-AUTH-03 | Authenticated but empty-result caller | `project_view_user` | Empty-state and read-only viewpoints if needed |

## 4. Project Business-State Fixtures

| Data ID | Fixture | Example | Purpose |
|---|---|---|---|
| TD-PRJ-ACTIVE-01 | Editable active Project | `PRJ_A / "Project Atlas"` under `CUST_A` | Baseline detail, update, and delete target |
| TD-PRJ-ACTIVE-02 | Second active Project | `PRJ_B / "Project Beacon"` under `CUST_A` | Multi-row list behavior |
| TD-PRJ-ACTIVE-03 | Active Project under another Customer | `PRJ_C / "Project Atlas"` under `CUST_B` | Same-alias cross-customer allowed case |
| TD-PRJ-DELETED-01 | Soft-deleted Project | `PRJ_D / "Project Legacy"` under `CUST_A` | Deleted visibility and unavailable-flow checks |
| TD-PRJ-DETAIL-01 | Active Project with Team assignments | `PRJ_E / "Data Analytics"` under `CUST_A` with `TEAM_ALPHA`, `TEAM_BETA` | Detail and Team-display verification |

## 5. Reusable Scenario Data Sets

### 5.1 List / Empty-State Data

| Data ID | Composition | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-LIST-01 | At least two active Projects under visible Customers | BB-PROJECT-001, BB-PROJECT-003 | Normal list shows active rows and required summary fields |
| TD-PRJ-LIST-02 | Mix of active and deleted Projects | BB-PROJECT-002 | Default active view excludes deleted rows |
| TD-PRJ-LIST-03 | No matching active Project for current view | BB-PROJECT-004 | Safe empty state is shown |

### 5.2 Create / Update Data

| Data ID | Composition | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-CREATE-01 | `customerId = CUST_A`, unique alias, optional fields omitted | BB-PROJECT-005 | Create succeeds with required fields only |
| TD-PRJ-CREATE-02 | `customerId = CUST_A`, unique alias, multiple valid Team IDs | BB-PROJECT-006 | Create succeeds and Team set matches the input |
| TD-PRJ-UPDATE-01 | Existing active Project plus valid changed alias/type/riskLevel | BB-PROJECT-013 | Update succeeds without `version` |
| TD-PRJ-TEAM-01 | Existing Project with original Team set and target replacement Team set | BB-PROJECT-015 | Final Team set matches the submitted Team set |
| TD-PRJ-DELETE-01 | Existing active Project eligible for soft delete | BB-PROJECT-017, BB-PROJECT-018 | Delete removes Project from active flow |

## 6. Boundary and Negative Input Catalog

### 6.1 Alias Data

| Data ID | Input values | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-ALIAS-01 | `""`, `"   "` | BB-PROJECT-007, BB-PROJECT-008 | Blank alias is rejected and no write occurs |
| TD-PRJ-DUP-01 | `"Project Atlas"`, `"project atlas"`, `"  Project Atlas  "` under same Customer | BB-PROJECT-009 | Normalized duplicate in same Customer is rejected |
| TD-PRJ-DUP-02 | `"Project Atlas"` under `CUST_B` while active under `CUST_A` | BB-PROJECT-010 | Same alias across different Customers is allowed |
| TD-PRJ-DUP-03 | Alias previously used only by `TD-PRJ-DELETED-01` | BB-PROJECT-011 | Alias reuse after delete is allowed |

### 6.2 Project Type Data

| Data ID | Input values | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-TYPE-01 | `"  Customer Facing  "`, `""`, `"   "`, `null` | BB-PROJECT-014 | Non-empty text trims; blank becomes null |
| TD-PRJ-TYPE-02 | 101-character free-text string | Future boundary extension | Overlength input should be rejected if max-length validation is enforced |

### 6.3 Risk Level Data

| Data ID | Input values | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-RISK-01 | `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Create/update normal-path variants | Valid severity values are accepted |
| TD-PRJ-RISK-02 | `URGENT`, `SEVERE`, `""` | Future negative extension | Invalid values should be rejected if submitted |

### 6.4 Team Assignment Data

| Data ID | Input values | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-TEAM-02 | `teamIds = []` | Future create/update extension | Empty Team selection is allowed and results in no assigned Teams |
| TD-PRJ-TEAM-03 | `teamIds = [TEAM_ALPHA, TEAM_BETA]` | BB-PROJECT-006, BB-PROJECT-015 | Multiple valid Teams are accepted |
| TD-PRJ-TEAM-04 | `teamIds = [TEAM_ALPHA, TEAM_ALPHA]` | Future boundary extension | Duplicate Team IDs should not create ambiguous final Team state |
| TD-PRJ-TEAM-05 | `teamIds = [TEAM_UNKNOWN]` | Future negative extension | Nonexistent Team ID should be rejected |
| TD-PRJ-TEAM-06 | `teamIds = [TEAM_RETIRED]` | Future negative extension | Inactive or unavailable Team should be rejected |

### 6.5 ID Availability Data

| Data ID | Input values | Used by cases | Expected-result note |
|---|---|---|---|
| TD-PRJ-ID-01 | Nonexistent Project ID | BB-PROJECT-016 | Normal detail/update/delete flow rejects it |
| TD-PRJ-ID-02 | Deleted Project ID | BB-PROJECT-016 | Normal detail/update/delete flow rejects it |
| TD-PRJ-ID-03 | Nonexistent Customer ID | Future negative extension | Invalid parent reference should be rejected |

## 7. Audit / Error Data

| Data ID | Fixture | Used by cases | Expected-result note |
|---|---|---|---|
| TD-ERR-01 | Controlled request that triggers standard backend error handling | BB-PROJECT-020 | Error envelope includes `traceId` |
| TD-AUDIT-01 | Authorized actor identity for create/update/delete | BB-PROJECT-017, BB-PROJECT-018 | Post-action visibility and audit-sensitive behavior can be checked externally |

## 8. Coverage Cross-check

| Coverage need | Data IDs that satisfy it |
|---|---|
| Same alias same Customer | `TD-PRJ-DUP-01` |
| Same alias different Customer | `TD-PRJ-DUP-02` |
| Deleted-alias reuse | `TD-PRJ-DUP-03` |
| Blank / trimmed alias | `TD-PRJ-ALIAS-01` |
| Null / blank / overlength `projectType` | `TD-PRJ-TYPE-01`, `TD-PRJ-TYPE-02` |
| Valid / invalid `riskLevel` | `TD-PRJ-RISK-01`, `TD-PRJ-RISK-02` |
| Zero / one / multiple / duplicate / nonexistent Team IDs | `TD-PRJ-TEAM-02`, `TD-PRJ-TEAM-03`, `TD-TEAM-02`, `TD-PRJ-TEAM-05` |
| Nonexistent and deleted Project IDs | `TD-PRJ-ID-01`, `TD-PRJ-ID-02` |
| Allowed vs disallowed caller | `TD-USER-AUTH-01`, `TD-USER-AUTH-02` |

## 9. Notes

- The IDs and names above are canonical synthetic references; later automation can replace them with environment-specific concrete values while preserving the business meaning.
- Cases marked as future extension data should remain available so later test automation can grow without redefining the business dataset.
