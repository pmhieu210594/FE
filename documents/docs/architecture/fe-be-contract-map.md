# FE/BE Contract Map

## 1. Purpose

Documents the contract between the EDCAP_FE and EDCAP_BE: which endpoints are called,
what shapes are sent and received, where validations live, how errors are handled, and
which contracts are currently mismatched or unverified.

Use this file to:
- Catch DTO shape mismatches before they reach production
- Identify one-sided contracts (endpoint exists on one side, not the other)
- List contract test candidates
- Track open compatibility risks

**Method:** Both FE and BE source read directly — no inference from specs.

**Update note (2026-06-10):** This map includes implementation decisions for the upcoming Organization and Customer features, but those features are **not implemented yet**. Current source-code contract sections still describe only the endpoints/components that exist today.

---

## 2. Source Availability

| Side | Source / Path | Status | Note |
|------|--------------|--------|------|
| FE | `EDCAP_FE/src/lib/api.ts` | Read | Typed endpoint helpers, `User`, `ConnectorRun`, `ApiError` |
| FE | `EDCAP_FE/src/hooks/useAuth.ts` | Read | `useAuth`, `loginWithGoogle`, `logout` |
| FE | `EDCAP_FE/src/pages/AdminPage.tsx` | Read | Connector queries + mutation |
| FE | `EDCAP_FE/src/pages/LoginPage.tsx` | Read | Google login, error state |
| FE | `EDCAP_FE/src/interfaces/index.ts` | Read | `IResponses<T>`, `IPaginationQuery`, form/table interfaces |
| FE | `EDCAP_FE/src/interfaces/model.ts` | Read | `IMUser`, `IResetPassword`, `IMChangePassword` |
| FE | `EDCAP_FE/src/services/` | Read | Redux slices (`crud`, `global`); all reducers are no-ops |
| FE | `EDCAP_FE/src/store/uiStore.ts` | Read | Zustand sidebar state |
| FE | `EDCAP_FE/src/enums.ts` | Read | `EFormType`, `EFormRuleType`, `EStatusState`, etc. |
| BE | `EDCAP_BE/web/rest/MeController.java` | Read | `/api/v1/me` |
| BE | `EDCAP_BE/web/rest/AdminController.java` | Read | `/api/v1/admin/**` |
| BE | `EDCAP_BE/web/rest/HealthController.java` | Read | `/api/v1/health` |
| BE | `EDCAP_BE/web/dto/Dtos.java` | Read | `UserDto`, `ConnectorRunDto`, `HealthDto` |
| BE | `EDCAP_BE/web/exception/GlobalExceptionHandler.java` | Read | Exception → HTTP mapping |
| BE | `EDCAP_BE/web/exception/ErrorResponse.java` | Read | `ErrorResponse` record |
| BE | `EDCAP_BE/config/SecurityConfig.java` | Read | Public routes, OAuth2 |
| Spec | `docs/changes/ORGANIZATION/spec-pack.md` | Read | Planned feature contract only; source implementation deferred |
| Spec | `docs/changes/CUSTOMER/spec-pack.md` | Read | Planned feature contract only; source implementation deferred |
| DB | Existing schema | Confirmed decision | Keep existing table names `tbl_dim_organization` and `tbl_dim_customer`; do not rename tables; future DB work should add/update columns only when required |
| API Spec | OpenAPI / Swagger | **Partial** | `springdoc` configured at `/api/v1/openapi` but not verified in runtime |
| Contract Tests | `EDCAP_FE/src/**/*.test.*`, `EDCAP_BE/**/*Test.java` | **Unavailable** | No contract tests exist — all endpoints are untested at the contract layer |

---

## 3. Endpoint Contract Summary

| Feature / Screen | Method | Endpoint | FE Caller | BE Handler | Contract Status |
|-----------------|--------|----------|-----------|------------|-----------------|
| Authentication check (boot) | GET | `/api/v1/me` | `useAuth` → `endpoints.me()` | `MeController.me()` | **Verified** — shapes match |
| Health check | GET | `/api/v1/health` | `endpoints.health()` | `HealthController.health()` | **Verified** — shapes match |
| List available connectors | GET | `/api/v1/admin/connectors` | `AdminPage` → `endpoints.availableConnectors()` | `AdminController.connectors()` | **Risk** — FE expects `{ available: string[] }`; BE returns `Map<String,Object>` — key "available" confirmed but value type not strictly typed in BE |
| Trigger connector run | POST | `/api/v1/admin/connectors/{name}/run` | `AdminPage` → `endpoints.runConnector(name, projectId)` | `AdminController.runConnector()` | **Risk** — role-gate returns 200 + error Map, not 4xx (HD2); FE cannot detect this failure |
| Connector run history | GET | `/api/v1/admin/connectors/{name}/runs` | `AdminPage` → `endpoints.connectorRuns(name)` | `AdminController.runHistory()` | **Verified** — both sides list of `ConnectorRun`/`ConnectorRunDto` |
| Google OAuth2 login | GET | `/oauth2/authorization/google` | `loginWithGoogle()` → location redirect | Spring Security | **Verified** — standard OAuth2 redirect |
| Logout | POST | `/logout` | `logout()` in `useAuth.ts` | Spring Security default | **Verified** — Spring Security handles; FE redirects after completion |
| GitHub webhook | POST | `/api/v1/webhooks/github` | External (GitHub) | `GithubWebhookController` | **No FE caller** — server-to-server only |
| CircleCI webhook | POST | `/api/v1/webhooks/circleci` | External (CircleCI) | `CircleCiWebhookController` | **No FE caller** — server-to-server only |
| Demo parse markdown | POST | `/api/v1/demo/parse-markdown` | Not found in FE source | `DemoController.parseInline()` | **No FE caller found** — BE-only dev tool |
| Paginated tickets, projects, etc. | — | — | `SCrud` / `IResponses<T>` infrastructure exists | No matching BE endpoints found | **One-sided FE** — Redux CRUD infrastructure has no active BE counterpart; all reducers are no-ops |
| Organization Management | — | Planned, TBD | Not implemented yet | Not implemented yet | **Planned / Deferred** — spec exists; no FE route/page/API client and no BE controller/use case/repository implementation should be assumed at this time |
| Customer Management | — | Planned, TBD | Not implemented yet | Not implemented yet | **Planned / Deferred** — spec exists; no FE route/page/API client and no BE controller/use case/repository implementation should be assumed at this time |

---

## 4. Request DTO Mapping

| Endpoint | FE Request Shape | BE Request DTO / Schema | Required / Nullability Match? |
|----------|-----------------|------------------------|------------------------------|
| `GET /api/v1/me` | No body | `@AuthenticationPrincipal OAuth2User` (from session) | ✅ No request body needed |
| `GET /api/v1/health` | No body | No parameters | ✅ |
| `GET /api/v1/admin/connectors` | No body | No parameters | ✅ |
| `POST /api/v1/admin/connectors/{name}/run` | `{}` (empty JSON body) + `?projectId=<number>` | `@PathVariable name`, `@RequestParam Long projectId`, `@CurrentUser AppUser` | ⚠️ **Risk:** FE sends `projectId` from `string` input — integer parse is the FE caller's responsibility; no FE-side validation of `projectId` range seen |
| `GET /api/v1/admin/connectors/{name}/runs` | `?limit=<number>` (default 20) | `@RequestParam(defaultValue="20") int limit` | ✅ Defaults match |
| `POST /logout` | No body; `credentials: "include"` | Spring Security default logout | ✅ |

---

## 5. Response DTO Mapping

### `GET /api/v1/me`

| Field | BE `UserDto` | FE `User` interface | Compatibility |
|-------|-------------|---------------------|---------------|
| `id` | `Long` | `number` | ✅ Safe for IDs < 2^53 |
| `email` | `String` (nullable in DB) | `string \| null` | ✅ |
| `displayName` | `String` (nullable) | `string \| null` | ✅ |
| `role` | `String` (enum name: VIEWER/EDITOR/ADMIN) | `"VIEWER" \| "EDITOR" \| "ADMIN"` | ✅ |
| `avatarUrl` | `String` (nullable) | `string \| null` | ✅ |

> **Separate risk:** `interfaces/model.ts` defines `IMUser` with `name` (not `displayName`).
> If `IMUser` is ever used as the auth user type instead of `User`, the displayName field is silently lost.

---

### `GET /api/v1/health`

| Field | BE `HealthDto` | FE expected shape | Compatibility |
|-------|---------------|-------------------|---------------|
| `status` | `String` | `string` | ✅ |
| `traceId` | `String` | `string` | ✅ |

---

### `GET /api/v1/admin/connectors`

| Field | BE `Map<String, Object>` | FE `{ available: string[] }` | Compatibility |
|-------|-------------------------|------------------------------|---------------|
| `available` | `List<String>` of connector names | `string[]` | ✅ Structurally compatible — but BE map is dynamically typed; no compile-time guarantee the key is always `"available"` |

---

### `POST /api/v1/admin/connectors/{name}/run` (success path)

| Field | BE `ConnectorRunDto` | FE `ConnectorRun` | Compatibility |
|-------|--------------------|--------------------|---------------|
| `id` | `Long` | `number` | ✅ Safe for current data sizes |
| `connectorName` | `String` | `string` | ✅ |
| `status` | `String` (RUNNING/SUCCESS/FAILED) | `"RUNNING" \| "SUCCESS" \| "FAILED"` | ✅ |
| `recordsIngested` | `int` | `number` | ✅ |
| `errorMessage` | `String` (nullable) | `string \| null` | ✅ |
| `startedAt` | `OffsetDateTime` → ISO-8601 string | `string` | ✅ — but FE treats as opaque string; no parsing/timezone handling |
| `finishedAt` | `OffsetDateTime` (nullable) → ISO-8601 | `string \| null` | ✅ same |

**ADMIN role failure path (separate risk):**

| Scenario | BE Response | FE Handling |
|----------|-------------|-------------|
| Caller is not ADMIN | `200 OK` + `{ "error": "ADMIN role required" }` | **No ApiError thrown** (status is 200); FE receives `{ error: string }` parsed as `ConnectorRun` — TypeScript allows at runtime; field `id` would be `undefined` |

---

### `GET /api/v1/admin/connectors/{name}/runs`

| Field | BE `List<ConnectorRunDto>` | FE `ConnectorRun[]` | Compatibility |
|-------|--------------------------|---------------------|---------------|
| (all fields) | Same as `ConnectorRunDto` above | Same as `ConnectorRun` above | ✅ Same analysis |

---

## 6. Validation Parity

| Item | FE Validation | BE Validation | Match? | Note |
|------|--------------|---------------|--------|------|
| `projectId` on connector run trigger | **None observed** — `projectIdInput` is raw string state in `AdminPage` | `@RequestParam Long projectId` — required, parsed as Long by Spring | ⚠️ **Mismatch** — FE passes string; Spring parses it, but non-numeric input causes 400 with no FE-side error message |
| Connector name | Not validated FE-side; selected from available list | Validated by `ConnectorOrchestrator` (unknown name → `IllegalArgumentException` → 400) | ✅ FE only shows available connectors; UI prevents invalid names |
| Login (OAuth2) | No form fields — button click only | Spring Security validates OAuth2 token | ✅ No form validation needed |
| Session / auth | `useAuth` returns null on 401 | Spring Security validates JSESSIONID | ✅ |
| `@NotBlank` on demo endpoints | No FE caller found | `@Valid @RequestBody ParseRequest` | N/A — no FE consumer |

---

## 7. Error Code / Message Mapping

| Error Case | BE Code / Response | FE Display Behavior | Note |
|------------|-------------------|---------------------|------|
| Not authenticated | `401` + no `ErrorResponse` body (Spring Security intercepts) | `useAuth` returns `null`; `LoginPage` renders | 401 is caught before `GlobalExceptionHandler` |
| Not authenticated on API call | `401 ErrorResponse(errorCode=UNAUTHORIZED)` | `ApiError(401)` thrown; depends on call site | `useAuth` swallows; other hooks propagate via `isError` |
| Resource not found | `404 ErrorResponse(errorCode=NOT_FOUND, message=...)` | `ApiError(message, 404)` — displayed via `error.message` on component | ✅ `body.message` extracted by `lib/api.ts` |
| Validation error | `400 ErrorResponse(errorCode=VALIDATION_ERROR, message="field: rule")` | `ApiError(message, 400)` — displayed via `error.message` | First-field-only from BE |
| Domain rule violation | `400 ErrorResponse(errorCode=DOMAIN_RULE_VIOLATION)` | `ApiError(message, 400)` | ✅ |
| Application conflict | `409 ErrorResponse(errorCode=APPLICATION_ERROR)` | `ApiError(message, 409)` | ✅ |
| Internal server error | `500 ErrorResponse(errorCode=INTERNAL_ERROR, traceId=...)` | `ApiError(message, 500)` + `traceId` available | FE has `traceId` on `ApiError`; not currently surfaced in UI |
| **ADMIN role gate failure** | `200 OK { "error": "ADMIN role required" }` | **Silently parsed as `ConnectorRun`** — no error thrown, no toast | ⚠️ **Critical gap** — FE never shows an error for non-ADMIN connector trigger; mutation `onSuccess` fires instead |
| OAuth2 login failure | Redirect to `/en/login?error` | `LoginPage` checks `params.has("error")` → shows `t("Pages.Login.loginFailed")` | ✅ |
| Unknown connector name | `400 ErrorResponse(errorCode=BAD_REQUEST)` | `ApiError(message, 400)` | ✅ — FE only shows available names so this path is UI-prevented |
| Webhook HMAC failure | `401 { "error": "signature_invalid" }` (raw Map, NOT ErrorResponse) | **No FE consumer** — server-to-server only | The 401 body format diverges from `ErrorResponse` shape |

---

## 8. Permission / Role Mapping

| Action | FE Condition | BE Authorization | Match? |
|--------|-------------|-----------------|--------|
| View `/admin` page | FE `AdminPage` renders for all authenticated users — no role check in component | BE `AdminController.runConnector()` checks `caller.getRole() == ADMIN` inline | ⚠️ **Mismatch** — FE shows admin page to VIEWER/EDITOR; BE silently returns 200 + error string |
| Trigger connector run | No FE-side role guard | Inline ADMIN check in controller → `200 { "error": ... }` not 403 | ⚠️ **Mismatch** — no visible feedback to non-ADMIN user |
| View connector list | No FE-side role guard | No BE role guard on `GET /admin/connectors` | ✅ Consistent (no restriction on either side) |
| View connector run history | No FE-side role guard | No BE role guard on `GET /admin/connectors/{name}/runs` | ✅ Consistent |
| View current user | Any authenticated user | Any authenticated user | ✅ |
| View health | Not authenticated required | `permitAll` | ✅ |

---

## 9. UI State Mapping

| State | FE Behavior | BE / API Condition | Note |
|-------|-------------|-------------------|------|
| Loading — auth check | `isLoading=true` while `useQuery(["me"])` in flight | First fetch to `/api/v1/me` | `LoginPage` returns `null` while loading |
| Authenticated | `isAuthenticated=true`; `user` populated | 200 with `UserDto` | `LoginPage` redirects to `/:lang/admin` |
| Unauthenticated | `user=null`; `isAuthenticated=false` | 401 response | `LoginPage` shows Google login button |
| Login error | `?error` in URL | Spring Security redirect with `?error` on OAuth failure | `LoginPage` renders `t("Pages.Login.loginFailed")` |
| Connectors loading | `connectorsQuery.isLoading` | GET in-flight | Admin page shows loading state |
| Connectors empty | `connectorsQuery.data?.available === []` | BE returns empty `available` array | Admin page shows no connectors |
| Connector run loading | `runMutation.isPending` | POST in-flight | Button disabled during run |
| Connector run success | `queryClient.invalidateQueries(["connector-runs"])` | `ConnectorRunDto` returned | Runs list refreshed |
| Connector run ADMIN error | **No error state** | `200 { "error": "..." }` | ⚠️ FE shows success; no visible error |
| Run history loading | `runsQuery.isLoading` (when `selectedConnector` set) | GET in-flight | |
| Run history empty | `runsQuery.data === []` | Empty list returned | |
| `sidebarCollapsed` | Zustand `sidebarCollapsed`; persisted in `localStorage["sdd-ui-state"]` | No BE equivalent | FE-only UI state |

---

## 10. Organization / Customer Planning Decisions

These decisions are recorded for future implementation planning only. They do not mean the source code currently contains Organization or Customer implementation.

| Area | Decision | Rationale / Constraint | Implementation Timing |
|------|----------|------------------------|-----------------------|
| Organization table name | Use existing `tbl_dim_organization` | The table already exists; do not rename it | Future Organization implementation |
| Customer table name | Use existing `tbl_dim_customer` | The table already exists; do not rename it | Future Customer implementation |
| DB changes | Add/update columns only when required | Avoid table rename and unnecessary schema churn; migrations should be additive or targeted to existing tables | Future DB migration work |
| Organization implementation | Not implemented now | Current task is documentation/contract clarification only | Deferred |
| Customer implementation | Not implemented now | Customer depends on Organization behavior and will be implemented later | Deferred |
| FE tests | Known gap, but not implemented now | FE test weakness remains a backlog item; do not block current documentation update on test implementation | Deferred |
| Error/i18n contract for new features | Prefer a single consistent rule: either `ErrorResponse.message` is always an i18n key for Organization/Customer, or later introduce `messageKey` explicitly | Current BE `ErrorResponse` has `message`, not `messageKey`; avoid mixing raw English display text and translation keys in the same feature | Decide before implementation starts |

---

## 11. Backward Compatibility

| Contract Area | Compatible? | Risk | Required Action |
|---------------|-------------|------|-----------------|
| `UserDto` shape | ✅ Stable | Low — adding fields is safe; FE ignores unknown fields | Test if `displayName` field is ever null in Google login response |
| `ConnectorRunDto` shape | ✅ Stable | Low | Finalize `startedAt` display format in FE |
| Admin ADMIN-gate response (200 vs 4xx) | ⚠️ **Incompatible** | High — FE treats 200 as success unconditionally | Fix BE to return 403 `ErrorResponse`, OR add FE-side role check before mutation; pending HD2 |
| `IResponses<T>` envelope | ⚠️ **One-sided** | Medium — if BE ever adopts this envelope, all `endpoints.*` helpers break | Decide HD1 (envelope vs raw DTO) before adding new paginated endpoints |
| `IMUser` vs `User` | ⚠️ **Divergent** | Medium — `IMUser.name` ≠ `User.displayName`; `IMUser.id` is `string\|number` | Consolidate to one user type; deprecate `IMUser` or align field names |
| Redux CRUD slice (`SCrud`, `IResponses`) | ⚠️ **No BE counterpart** | Low now, High when features are added | Either wire `SCrud` to real endpoints or remove; all reducers are currently no-ops |
| `RGlobal` actions (`postLogin`, `postRegister`, etc.) | ⚠️ **No BE counterpart** | Low — all no-ops; but implies auth endpoints that do not exist | Remove or document as future-planned; EDCAP uses OAuth2, not form-based login |
| Organization / Customer table naming | ✅ **Decision confirmed** | Low — existing tables already use `tbl_dim_organization` and `tbl_dim_customer` | Keep these table names; future migrations should update columns only when required, not rename tables |
| Organization / Customer source implementation | ✅ **Deferred intentionally** | Low — specs are planning artifacts; no source contract should be expected yet | Do not mark missing FE/BE implementation as a current defect until implementation starts |
| FE test coverage for Organization / Customer | ⚠️ **Backlog** | Medium later — tests will be needed when implementation starts | No implementation now; keep as future quality work |
| `startedAt` / `finishedAt` as `string` | ✅ Works | Low | `OffsetDateTime` serializes as ISO-8601 with offset (e.g., `2026-06-08T10:05:32.123+00:00`); FE `formatDateTime` utility should handle |
| `Long` id as `number` | ✅ Works | Low for current data (< 10^6 rows) | If IDs exceed 2^53, precision loss occurs; consider `string` type for IDs in future |

---

## 12. Contract Test Candidates

> Current decision: FE test implementation is deferred for now. The items below remain backlog candidates, not immediate implementation tasks.

| Case | Target | Priority | Note |
|------|--------|----------|------|
| `GET /api/v1/me` returns correct `UserDto` shape | BE unit + FE query | **High** | Core auth; verify all fields including nullables |
| `GET /api/v1/me` with no session → 401 → FE returns null | FE integration | **High** | `useAuth` 401 handling is critical |
| `POST /api/v1/admin/connectors/{name}/run` ADMIN caller → `ConnectorRunDto` | BE `@WebMvcTest` | **High** | Happy path |
| `POST /api/v1/admin/connectors/{name}/run` non-ADMIN caller → verify FE behavior | FE + BE | **High** | Current 200 + error Map is silent — test should fail and drive fix |
| `GET /api/v1/admin/connectors` → `{ available: ["github","jira","circleci","git_local"] }` | BE unit | **Medium** | Confirm key name is exactly `"available"` |
| `GET /api/v1/admin/connectors/{name}/runs` pagination with `limit` param | BE unit | **Medium** | Verify `limit` is respected |
| `ConnectorRunDto.status` values match FE `ConnectorRun.status` union | BE enum + FE type | **Medium** | Currently only RUNNING/SUCCESS/FAILED; BE enum has same three |
| OAuth2 error → `?error` redirect → FE shows error message | E2E | **Medium** | Test OAuth2 failure path |
| `ErrorResponse` shape received by `lib/api.ts` `body.message` extraction | FE unit | **Medium** | Verify `body.message` field name matches `ErrorResponse.message` |
| `IResponses<T>` envelope vs raw DTO — decide and test | Architecture | **Low (after HD1)** | Blocked until HD1 is resolved |
| `IMUser.name` vs `UserDto.displayName` field alignment | FE | **Low** | Debt item; add test when `IMUser` is used with real API data |
| Organization Management contract tests | FE + BE | **Deferred** | Add when Organization implementation starts; not required for this documentation update |
| Customer Management contract tests | FE + BE | **Deferred** | Add when Customer implementation starts; not required for this documentation update |

---

## 13. Team Management Snapshot

The Team feature is now implemented in the current workspace. This snapshot records the live FE/BE contract so future work does not rely on the older planning-only notes above.

### Endpoint Contract Summary

| Feature / Screen | Method | Endpoint | FE Caller | BE Handler | Contract Status |
|-----------------|--------|----------|-----------|------------|-----------------|
| Team list / search | GET | `/api/v1/teams` | `TeamPage` → `endpoints.teams.list()` | `TeamController.list()` | **Verified** — search, paging, and ADMIN guard match |
| Team detail | GET | `/api/v1/teams/{teamId}` | `TeamPage` → `endpoints.teams.get()` | `TeamController.get()` | **Verified** — detail plus active members / lookup data match |
| Team create | POST | `/api/v1/teams` | `TeamPage` → `endpoints.teams.create()` | `TeamController.create()` | **Verified** — create payload and 201 response match |
| Team update | PUT | `/api/v1/teams/{teamId}` | `TeamPage` → `endpoints.teams.update()` | `TeamController.update()` | **Verified** — editable code and versioned update match |
| Team soft delete | PATCH | `/api/v1/teams/{teamId}/delete` | `TeamPage` → `endpoints.teams.softDelete()` | `TeamController.softDelete()` | **Verified** — soft delete and cascade inactive match |
| Team member list | GET | `/api/v1/teams/{teamId}/members` | `TeamPage` → `endpoints.teams.listMembers()` | `TeamController.listMembers()` | **Verified** — active members only |
| Team add member | POST | `/api/v1/teams/{teamId}/members` | `TeamPage` → `endpoints.teams.addMember()` | `TeamController.addMember()` | **Verified** — existing member + required role |
| Team update member role | PUT | `/api/v1/teams/{teamId}/members/{teamMemberId}` | `TeamPage` → `endpoints.teams.updateMemberRole()` | `TeamController.updateMemberRole()` | **Verified** — updates existing membership only |
| Team remove member | PATCH | `/api/v1/teams/{teamId}/members/{teamMemberId}/delete` | `TeamPage` → `endpoints.teams.removeMember()` | `TeamController.removeMember()` | **Verified** — inactivates membership only |

### Validation / Error Mapping

| Item | FE Validation | BE Validation | Match? | Note |
|------|--------------|---------------|--------|------|
| Team Code required | Required field validation in Team form | `teamCode` validation in service / request DTO | ✅ | Trimmed value is used for business checks |
| Team Name required | Required field validation in Team form | `teamName` validation in service / request DTO | ✅ | Trimmed value is used for business checks |
| Duplicate Team Code | FE surfaces business error | Service checks active-scope uniqueness | ✅ | Duplicate create/update rejected consistently |
| Duplicate active member | FE surfaces business error | Service checks active `(team_id, member_key)` | ✅ | Same member can still join other Teams |
| Invalid / missing role | FE surfaces business error | Role existence check in service | ✅ | Role comes from `tbl_dim_role` |
| ADMIN access | FE route guards Team page | Service-level ADMIN check on Team endpoints | ✅ | Menu hiding alone is not used as security |
| Locale keys | `en`, `vi`, `ja` locale JSON | Backend returns stable business error keys | ✅ | Team labels and messages stay localized |

### Error Code / Message Mapping

| Error Case | BE Code / Response | FE Display Behavior | Note |
|------------|-------------------|---------------------|------|
| Not authenticated | `401` via security filter | Redirect / login flow | Same project-wide auth behavior |
| Not ADMIN | `403` / forbidden via service-level guard | Team page is protected; direct API is blocked | FE and BE must both enforce |
| Duplicate Team Code | Business error code such as `TEAM_CODE_DUPLICATED` | Display localized message | Verified by tests |
| Duplicate active member | Business error code such as `TEAM_MEMBER_ALREADY_EXISTS` | Display localized message | Verified by tests |
| Invalid role/member | Business error / not found mapping | Display localized message | Verified by tests |


---

## 13. Unknown / Need Confirmation

| Item | Reason | Risk | Required Action |
|------|--------|------|-----------------|
| Admin role guard — 200 vs 403 | `AdminController` returns `200 Map.of("error",...)` for non-ADMIN callers; FE treats 200 as success | **High** | Pending HD2: either BE returns 403 `ErrorResponse` or FE reads `role` from `useAuth` and disables mutation for non-ADMIN |
| `AdminPage` role check missing | `AdminPage` renders for all authenticated users; no `role == ADMIN` guard in FE routing or component | **Medium** | Add FE role guard: `if (user.role !== "ADMIN") return <Navigate to="/" />` |
| `IResponses<T>` envelope use | The generic `IResponses<T>` type exists and is used in the `SCrud` CRUD infrastructure, but BE returns raw DTOs | **Medium** | Decide HD1 (envelope vs raw) before new endpoints; document the decision |
| Organization / Customer implementation timing | Specs exist, but source implementation is intentionally deferred | **Low** | Do not treat missing Organization/Customer FE/BE code as a current contract defect; revisit when implementation begins |
| Organization / Customer table names | Table naming is confirmed | **Resolved** | Use existing `tbl_dim_organization` and `tbl_dim_customer`; only add/update columns when required |
| `IMUser` active usage | `IMUser` in `interfaces/model.ts` has `name` (not `displayName`) and nullable `id: string\|number`; not clear if it is used with real API data anywhere | **Medium** | Search FE for uses of `IMUser`; confirm whether it maps to any BE response |
| Redux `RGlobal` no-op actions | `postLogin`, `postRegister`, `patchForgottenPassword`, `patchResetPassword`, `patchChangePassword` are all no-op; implies form-based auth that does not exist | **Low** | Confirm these are leftovers from a template; remove or document as planned |
| `springdoc` OpenAPI availability | `springdoc` is configured; `/api/v1/openapi` endpoint listed as `permitAll` | **Low** | Verify it generates correct schema; use as source of truth for contract tests |
| `formatDateTime` utility | `AdminPage` uses `formatDateTime` to display `startedAt` / `finishedAt`; the format (including timezone display) is not yet confirmed | **Low** | Verify `formatDateTime` handles ISO-8601 with offset correctly; test edge case of null `finishedAt` |
| `projectId` input parsing | `AdminPage` `projectIdInput` is a `string` state; `endpoints.runConnector(name, projectId)` expects `number`; no explicit conversion seen | **Medium** | Confirm `parseInt(projectIdInput)` or `+projectIdInput` is applied before calling `runConnector` |
| `logout()` FE redirect target | After `POST /logout`, FE redirects to `/#/{lang}/login`; Spring Security may redirect to its own URL | **Low** | Verify that `fetch("/logout", {credentials:"include"})` does not follow the server redirect and that the manual `location.href` assignment always fires |

---

## 14. Source Files Read

| File | Purpose |
|------|---------|
| `EDCAP_FE/src/lib/api.ts` | Endpoint helpers, `User`, `ConnectorRun`, `ApiError`, `Role` types |
| `EDCAP_FE/src/hooks/useAuth.ts` | `useAuth` hook, `loginWithGoogle`, `logout` |
| `EDCAP_FE/src/pages/AdminPage.tsx` | Connector list + run + history queries/mutations |
| `EDCAP_FE/src/pages/LoginPage.tsx` | Google login button, error state from `?error` param |
| `EDCAP_FE/src/interfaces/index.ts` | `IResponses<T>`, `IPaginationQuery`, form/table types |
| `EDCAP_FE/src/interfaces/model.ts` | `IMUser`, `IResetPassword`, `IMChangePassword` |
| `EDCAP_FE/src/services/index.ts` | Redux store setup |
| `EDCAP_FE/src/services/crud/index.ts` | `SCrud` utility, `crudSlice` |
| `EDCAP_FE/src/services/crud/state.ts` | `StateCrud`, `initialStateCrud` |
| `EDCAP_FE/src/services/crud/reducer.ts` | `RCurd`, `CurdState` — all no-ops |
| `EDCAP_FE/src/services/global/index.ts` | `SGlobal`, `globalSlice` |
| `EDCAP_FE/src/services/global/state.ts` | `StateGlobal`, `checkLanguage`, language init |
| `EDCAP_FE/src/services/global/reducer.ts` | `RGlobal` — all no-ops |
| `EDCAP_FE/src/store/uiStore.ts` | Zustand sidebar collapse (no BE counterpart) |
| `EDCAP_FE/src/enums.ts` | `EFormType`, `EFormRuleType`, `EStatusState`, `EIcon`, etc. |
| `EDCAP_FE/src/hooks/useLanguage.ts` | Language switch; URL rewrite; no API call |
| `EDCAP_BE/web/rest/MeController.java` | `/api/v1/me` handler |
| `EDCAP_BE/web/rest/AdminController.java` | `/api/v1/admin/**` handlers + ADMIN role gate |
| `EDCAP_BE/web/rest/HealthController.java` | `/api/v1/health` handler |
| `EDCAP_BE/web/dto/Dtos.java` | `UserDto`, `ConnectorRunDto`, `HealthDto` |
| `EDCAP_BE/web/exception/ErrorResponse.java` | `ErrorResponse` record — `OffsetDateTime timestamp` |
| `EDCAP_BE/web/exception/GlobalExceptionHandler.java` | Exception → HTTP status map |
| `EDCAP_BE/config/SecurityConfig.java` | `permitAll` routes, OAuth2 login config |
| `docs/changes/ORGANIZATION/spec-pack.md` | Planned Organization feature contract; implementation deferred |
| `docs/changes/CUSTOMER/spec-pack.md` | Planned Customer feature contract; implementation deferred |

Files intentionally NOT read: `.env*`, secrets files, production logs, PII.

---

## 15. Organization Management Snapshot

This snapshot records the current implemented Organization contract. It is separate from the older planning notes above so future readers can see the live state quickly.

### Source availability

| Side | Source / Path | Status | Note |
|---|---|---|---|
| FE | `EDCAP_FE/src/pages/OrganizationPage.tsx` | Read | Organization list/search/filter/create/edit/delete UI |
| FE | `EDCAP_FE/src/lib/api.ts` | Read | `endpoints.organizations.*`, request/response types |
| BE | `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/OrganizationController.java` | Read | `/api/v1/organizations` REST endpoints |
| BE | `EDCAP_BE/src/main/java/com/sdd/platform/application/usecase/governance/OrganizationService.java` | Read | ADMIN-only business rules, uniqueness, optimistic locking |
| BE | `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/mapper/OrganizationMapper.java` | Read | MyBatis mapper for search/create/update/delete |
| BE | `EDCAP_BE/src/main/resources/mapper/OrganizationMapper.xml` | Read | SQL for active/deleted filtering and partial uniqueness checks |

### Endpoint contract summary

| Feature | Method | Endpoint | FE caller | BE handler | Contract status |
|---|---|---|---|---|---|
| Organization list/search/filter | GET | `/api/v1/organizations` | `endpoints.organizations.list()` | `OrganizationController.list()` | Verified |
| Organization detail | GET | `/api/v1/organizations/{id}` | `endpoints.organizations.get()` | `OrganizationController.get()` | Verified |
| Organization create | POST | `/api/v1/organizations` | `endpoints.organizations.create()` | `OrganizationController.create()` | Verified |
| Organization update | PUT | `/api/v1/organizations/{id}` | `endpoints.organizations.update()` | `OrganizationController.update()` | Verified |
| Organization soft delete | PATCH | `/api/v1/organizations/{id}/delete` | `endpoints.organizations.softDelete()` | `OrganizationController.softDelete()` | Verified |

### Contract notes

- All Organization mutations require an ADMIN caller in the service layer.
- `version` is required for update and soft delete to prevent stale writes.
- FE error display uses backend message keys and `ApiError` trace/message handling.
- Locale keys live under `Pages.Organization.*`.
