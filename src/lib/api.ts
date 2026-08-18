import { KEY_REFRESH_TOKEN, KEY_TOKEN } from "@/utils/variable";

import i18next from "i18next";

const BASE = ""; // proxy handles it in dev; production: import.meta.env.VITE_API_BASE_URL

function readStoredAccessToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(KEY_TOKEN);
}

let accessToken: string | null = readStoredAccessToken();

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof localStorage === "undefined") return;
  if (token) {
    localStorage.setItem(KEY_TOKEN, token);
  } else {
    localStorage.removeItem(KEY_TOKEN);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  setAccessToken(null);
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(KEY_REFRESH_TOKEN);
  }
}

export function hasAccessToken() {
  return !!accessToken;
}

export class ApiError extends Error {
  status: number;
  traceId?: string;
  messageKey?: string;
  errorCode?: string;
  constructor(
    message: string,
    status: number,
    traceId?: string,
    messageKey?: string,
    errorCode?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status;
    this.traceId = traceId;
    this.messageKey = messageKey;
    this.errorCode = errorCode;
  }
}

// Maps a backend ErrorResponse.error code to an i18n key, taking priority over
// guessing a key from the (often non-translatable) message text.
const ERROR_CODE_I18N_KEYS: Record<string, string> = {
  UNSAFE_INPUT: "UnsafeInputDetected",
};

function translateApiMessage(messageKey: string): string {
  if (!messageKey) return messageKey;
  const candidates = new Set<string>([messageKey]);

  if (messageKey === "Unauthorized") {
    candidates.add("Component.Permission.Unauthorized");
  }
  if (!messageKey.startsWith("Components.")) {
    candidates.add(`Components.${messageKey}`);
  }
  if (!messageKey.startsWith("Pages.")) {
    candidates.add(`Pages.${messageKey}`);
  }
  if (!messageKey.startsWith("Component.")) {
    candidates.add(`Component.${messageKey}`);
  }

  for (const key of candidates) {
    const translated = i18next.t(key, { ns: "locale" });
    if (translated !== key) {
      return translated;
    }
  }

  return messageKey;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers,
    ...init,
  });

  const traceId = res.headers.get("X-Trace-Id") ?? undefined;

  if (!res.ok) {
    let messageKey =
      res.status === 401
        ? "Component.Permission.Unauthorized"
        : "Components.SomethingWentWrong";
    let errorCode: string | undefined;
    try {
      const body = await res.json();
      if (typeof body?.error === "string" && body.error.trim()) {
        errorCode = body.error.trim();
      }
      if (typeof body?.message === "string" && body.message.trim()) {
        messageKey = body.message.trim();
      }
      if (errorCode && ERROR_CODE_I18N_KEYS[errorCode]) {
        messageKey = ERROR_CODE_I18N_KEYS[errorCode];
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(
      translateApiMessage(messageKey),
      res.status,
      traceId,
      messageKey,
      errorCode,
    );
  }

  // No body on 204
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}

async function requestBlob(
  path: string,
  init: RequestInit = {},
): Promise<Blob> {
  const headers = new Headers(init.headers);
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers,
    ...init,
  });

  if (!res.ok) {
    let messageKey =
      res.status === 401
        ? "Component.Permission.Unauthorized"
        : "Components.SomethingWentWrong";
    let errorCode: string | undefined;
    try {
      const body = await res.json();
      if (typeof body?.error === "string" && body.error.trim()) {
        errorCode = body.error.trim();
      }
      if (typeof body?.message === "string" && body.message.trim()) {
        messageKey = body.message.trim();
      }
      if (errorCode && ERROR_CODE_I18N_KEYS[errorCode]) {
        messageKey = ERROR_CODE_I18N_KEYS[errorCode];
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(
      translateApiMessage(messageKey),
      res.status,
      undefined,
      messageKey,
      errorCode,
    );
  }

  return await res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  blob: (path: string, init?: RequestInit) => requestBlob(path, init),
};

// ----- Typed endpoint helpers -----

export type Role = "VIEWER" | "EDITOR" | "ADMIN" | "PM";

export interface AuthUser {
  username: string;
  displayName: string | null;
  email: string | null;
  role: string;
  accessScopes: string[];
}

export interface ConnectorRun {
  id: number;
  connectorName: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  recordsIngested: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export type OrganizationStatus = "ACTIVE" | "DELETED";

export interface Organization {
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  description: string | null;
  status: OrganizationStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  version: number;
}

export interface OrganizationPage {
  items: Organization[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type RoleStatus = "ACTIVE" | "DELETED";

export interface RoleDto {
  roleId: string;
  roleName: string;
  description: string;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description: string;
}

export interface UpdateRoleRequest {
  roleName: string;
  description: string;
}

export type CustomerStatus = "ACTIVE" | "DELETED";

export type CustomerClassification = "INTERNAL" | "EXTERNAL";

export interface Customer {
  customerId: string;
  organizationId: string;
  organizationName: string;
  customerCode: string;
  customerAlias: string;
  classification: CustomerClassification;
  status: CustomerStatus;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  version: number;
}

export interface CustomerPage {
  items: Customer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type TeamStatus = "ACTIVE" | "DELETED";

export type TeamMemberStatus = "ACTIVE" | "INACTIVE";

export interface Team {
  teamId: string;
  teamCode: string;
  teamName: string;
  description: string | null;
  status: TeamStatus;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  version: number;
  memberCount: number;
}

export interface TeamPageResponse {
  items: Team[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export type ProjectStatus = "ACTIVE" | "DELETED";

export type ProjectSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ProjectTeamAssignment {
  projectTeamId: string;
  teamId: string;
  teamCode: string | null;
  teamName: string | null;
  status: ProjectStatus | string;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface Project {
  projectId: string;
  customerId: string;
  customerName: string;
  projectAlias: string;
  projectType: string | null;
  riskLevel: ProjectSeverity | string | null;
  status: ProjectStatus | string;
  deleteFlag: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  teamAssignments: ProjectTeamAssignment[];
}

export interface ProjectPageResponse {
  items: Project[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TraceabilitySummary {
  ticketId: string;
  externalTicketKey: string;
  title: string | null;
  completenessPercent: number;
  foundCount: number;
  expectedCount: number;
  artifactCount: number;
  prCount: number;
  commitCount: number;
  ciCount: number;
  brokenLinkCount: number;
  reviewRoundCount: number;
}

export interface TraceabilityReviewComment {
  reviewCommentId: string;
  filePathHash: string;
  lineNumber: number;
  commentSummary: string;
  state: string;
  submittedAt: string;
  submittedBy: string;
}

export interface TraceabilityArtifact {
  artifactSnapshotId: string | null;
  artifactTypeCode: string;
  artifactName: string;
  defaultFileName: string;
  requiredFlag: boolean;
  sourcePath: string | null;
  existsFlag: boolean;
  collectedAt: string | null;
  schemaVersion: number | null;
}

export interface TraceabilityPullRequest {
  prId: string;
  externalPrId: string;
  externalPrUrl: string | null;
  title: string | null;
  status: string;
  sourceBranch: string | null;
  targetBranch: string | null;
  openedAt: string | null;
  mergedAt: string | null;
  closedAt: string | null;
  collectedAt: string | null;
}

export interface TraceabilityCommit {
  commitId: string;
  commitHash: string;
  branchName: string | null;
  messageHash: string | null;
  commitUrl: string | null;
  committedAt: string | null;
  collectedAt: string | null;
}

export interface TraceabilityCiRun {
  ciRunId: string;
  externalCiRunId: string;
  ciUrl: string | null;
  workflowName: string | null;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  collectedAt: string | null;
}

export interface TraceabilityLink {
  traceabilityLinkId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  confidence: number;
  confidenceLevel: string;
  ruleName: string | null;
  evidenceJson: string | null;
  createdAt: string | null;
}

export interface TraceabilityBrokenLink {
  code: string;
  item: string;
  severity: "ERROR" | "WARNING";
  message: string;
}

export interface TraceabilityTimelineEvent {
  eventId: string;
  eventType: string;
  sourceType: string | null;
  sourceRefId: string | null;
  result: string | null;
  summary: string | null;
  eventTimestamp: string;
}

export interface TraceabilityResponse {
  summary: TraceabilitySummary;
  artifacts: TraceabilityArtifact[];
  pullRequests: TraceabilityPullRequest[];
  commits: TraceabilityCommit[];
  ciRuns: TraceabilityCiRun[];
  links: TraceabilityLink[];
  brokenLinks: TraceabilityBrokenLink[];
  timelineEvents: TraceabilityTimelineEvent[];
  reviewComments: TraceabilityReviewComment[];
}

export interface EvidenceQualityScoreBreakdownItem {
  criterionId: string;
  label: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  sourceRefs: string[];
}

export interface EvidenceQualityScoreResponse {
  ticketId: string;
  score: number | null;
  band: string | null;
  breakdown: EvidenceQualityScoreBreakdownItem[];
  missing: string[];
  parseErrors: string[];
  traceIds: string[];
  scoreRuleVersion: string;
  snapshotState: string;
  calculatedAt: string;
}

export interface PmDashboardSummary {
  blockedTicketCount: number;
  missingEvidenceTicketCount: number;
  missingTraceabilitySectionTicketCount: number;
  openIssueCount: number;
  waitingReviewTicketCount: number;
  ciFailedTicketCount: number;
  firstCiPassTicketCount: number;
  ticketWithCiCount: number;
  riskTicketCount: number;
  exceptionTicketCount: number;
  averageEvidenceQualityScore: number | null;
  averageScoreBand: string | null;
  phaseBottleneckPhaseCode: string | null;
  phaseBottleneckPhaseName: string | null;
  phaseBottleneckBlockedCount: number;
  updatedAt: string | null;
}

export interface PmDashboardOption {
  value: string;
  label: string;
  role?: string | null;
}

export interface PmDashboardPhaseOption {
  value: string;
  label: string;
  order: number;
}

export interface PmDashboardOptions {
  projects: PmDashboardOption[];
  periods: PmDashboardOption[];
  repositories: PmDashboardOption[];
  phases: PmDashboardPhaseOption[];
}

export interface PmDashboardTicketRow {
  ticketId: string;
  projectId: string;
  projectAlias: string;
  repositoryId: string;
  repositoryName: string;
  externalTicketKey: string;
  title: string | null;
  status: string | null;
  phaseCode: string | null;
  phaseName: string | null;
  phaseDescription: string | null;
  phaseCreatedAt: string | null;
  phaseOrder: number;
  blockedFlag: boolean;
  waitingReviewFlag: boolean;
  missingEvidenceCount: number;
  traceabilityIssueCount: number;
  openIssueCount: number;
  riskCount: number;
  exceptionCount: number;
  ciFailedCount: number;
  highestRiskSeverity: string | null;
  evidenceQualityScore: number | null;
  scoreBand: string | null;
  scoreRuleVersion: string | null;
  ageDays: number;
  ownerDisplay: string;
  periodKey: string;
  createdAt: string | null;
  updatedAt: string | null;
  refreshedAt: string;
  artifactVersion: number | null;
  mergedAt: string | null;
}

export interface PmDashboardTicketDetail {
  row: PmDashboardTicketRow;
  createdAt: string | null;
  ownerDisplay: string | null;
  reviewCount: number;
  missingEvidenceItems: Array<{
    artifactTypeCode: string;
    artifactName: string;
    defaultFileName: string | null;
    sourcePath: string | null;
    requiredFlag: boolean;
    existsFlag: boolean;
  }>;
  riskItems: Array<{
    riskId: string;
    riskKey: string | null;
    riskSummary: string | null;
    severity: string | null;
    status: string | null;
    mitigationPresent: boolean;
    mitigationSummary: string | null;
  }>;
  exceptionItems: Array<{
    exceptionId: string;
    exceptionType: string | null;
    reason: string | null;
    followUpStatus: string | null;
    approved: boolean;
    linkedReportPath: string | null;
  }>;
  issueItems: Array<{
    ticketIssueId: string;
    ticketId: string;
    repositoryId: string;
    sourceType: string;
    issueOrder: number;
    issueKey: string | null;
    issueTitle: string | null;
    issueImpact: string | null;
    issueOwner: string | null;
    issueStatus: string | null;
    issueSummary: string;
    sourcePath: string;
    collectedAt: string | null;
  }>;
  scoreBreakdown: {
    specScore: number | null;
    planScore: number | null;
    reviewScore: number | null;
    selfReviewScore: number | null;
    testScore: number | null;
    ciScore: number | null;
    blackboxScore: number | null;
    reportScore: number | null;
  };
  traceabilityUrl: string;
}

export interface FirstCiPassDto {
  ciRunId: string;
  pullRequestId: string | null;
  firstRunStatus: string;
  firstPassSuccess: boolean;
  firstRunStartedAt: string;
}

export interface PmDashboardPage {
  items: PmDashboardTicketRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PmDashboardInsights {
  evidenceBottleneckBuckets: Array<{
    bucketKey: string;
    bucketName: string;
    missingEvidenceCount: number;
  }>;
}

export interface PmDashboardRefreshResult {
  refreshedRows: number;
  refreshedAt: string;
}

export type RepositoryStatus = "ACTIVE" | "DELETED";
export type RepositoryHostType = "GITHUB";

export interface Repository {
  repositoryId: string;
  projectId: string;
  projectAlias: string;
  repoNameMasked: string;
  hostType: RepositoryHostType | string;
  defaultBranch: string | null;
  repoUrlHash: string | null;
  status: RepositoryStatus | string;
  deleteFlag: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface RepositoryPageResponse {
  items: Repository[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateRepositoryRequest {
  projectId: string;
  repo_name_masked: string;
  host_type: RepositoryHostType | string;
  default_branch: string | null;
  repo_url_hash: string | null;
}

export interface UpdateRepositoryRequest {
  projectId: string;
  repo_name_masked: string;
  host_type: RepositoryHostType | string;
  default_branch: string | null;
  repo_url_hash: string | null;
}
export interface RoleOption {
  roleId: string;
  roleName: string;
}

export interface UserAccount {
  accountId: string;
  memberKey: string;
  username: string;
  fullname: string;
  email: string | null;
  roleId: string;
  roleName: string;
  teamId: string | null;
  teamName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface UserAccountPage {
  items: UserAccount[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TeamMember {
  teamMemberId: string;
  teamId: string;
  teamName: string | null;
  memberKey: string;
  pseudonym: string;
  roleId: string;
  roleName: string;
  status: TeamMemberStatus | string;
  joinedAt: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  version: number;
}

export interface TeamMemberOption {
  memberKey: string;
  pseudonym: string;
  fullname?: string | null;
}

export interface TeamRoleOption {
  roleId: string;
  roleName: string;
}

export interface TeamDetail {
  team: Team;
  members: TeamMember[];
  memberOptions: TeamMemberOption[];
  roleOptions: TeamRoleOption[];
}

export interface CreateTeamRequest {
  teamCode: string;
  teamName: string;
  description: string | null;
}

export interface UpdateTeamRequest {
  teamCode: string;
  teamName: string;
  description: string | null;
  status: TeamStatus | string;
  version: number;
}

export interface DeleteTeamRequest {
  version: number;
}

export interface AddTeamMemberRequest {
  memberKey: string;
  roleId: string;
}

export interface UpdateTeamMemberRequest {
  roleId: string;
  version: number;
}

export interface DeleteTeamMemberRequest {
  version: number;
}

export interface CreateOrganizationRequest {
  organizationCode: string;
  organizationName: string;
  description: string | null;
}

export interface UpdateOrganizationRequest {
  organizationCode: string;
  organizationName: string;
  description: string | null;
  status: OrganizationStatus;
  version: number;
}

export interface DeleteOrganizationRequest {
  version: number;
}

export interface CreateProjectRequest {
  customerId: string;
  projectAlias: string;
  projectType: string | null;
  riskLevel: ProjectSeverity | string | null;
  teamIds: string[];
}

export interface UpdateProjectRequest {
  customerId: string;
  projectAlias: string;
  projectType: string | null;
  riskLevel: ProjectSeverity | string | null;
  teamIds: string[];
}

export interface CreateUserAccountRequest {
  username: string;
  fullname: string;
  email: string | null;
  password: string;
  confirmPassword: string;
  roleId: string;
  isActive: boolean;
}

export interface UpdateUserAccountRequest {
  fullname: string;
  email: string | null;
  roleId: string;
  isActive: boolean;
}

export interface ResetUserPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
  redirectTo: string;
}

export const endpoints = {
  authMe: () => api.get<AuthUser>("/api/v1/auth/me"),
  me: () => api.get<AuthUser>("/api/v1/me"),
  authLogin: (body: AuthLoginRequest) =>
    api.post<AuthLoginResponse>("/api/v1/auth/login", body),
  authLogout: () => api.post<void>("/api/v1/auth/logout"),
  health: () => api.get<{ status: string; traceId: string }>("/api/v1/health"),
  availableConnectors: () =>
    api.get<{ available: string[] }>("/api/v1/admin/connectors"),
  runConnector: (name: string, projectId: number) =>
    api.post<ConnectorRun>(
      `/api/v1/admin/connectors/${name}/run?projectId=${projectId}`,
      {},
    ),
  connectorRuns: (name: string, limit = 20) =>
    api.get<ConnectorRun[]>(
      `/api/v1/admin/connectors/${name}/runs?limit=${limit}`,
    ),
  organizations: {
    list: (params?: {
      keyword?: string;
      status?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<OrganizationPage>(
        `/api/v1/organizations${query ? `?${query}` : ""}`,
      );
    },
    get: (organizationId: string) =>
      api.get<Organization>(`/api/v1/organizations/${organizationId}`),
    create: (body: CreateOrganizationRequest) =>
      api.post<Organization>("/api/v1/organizations", body),
    update: (organizationId: string, body: UpdateOrganizationRequest) =>
      api.put<Organization>(`/api/v1/organizations/${organizationId}`, body),
    softDelete: (organizationId: string, body: DeleteOrganizationRequest) =>
      api.patch<Organization>(
        `/api/v1/organizations/${organizationId}/delete`,
        body,
      ),
  },
  userAccounts: {
    list: (params?: {
      keyword?: string;
      status?: string;
      roleId?: string;
      roleIds?: string[];
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.roleId) searchParams.set("roleId", params.roleId);
      params?.roleIds?.forEach((roleId) => {
        if (roleId) searchParams.append("roleIds", roleId);
      });
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<UserAccountPage>(
        `/api/v1/admin/user-accounts${query ? `?${query}` : ""}`,
      );
    },
    get: (accountId: string) =>
      api.get<UserAccount>(`/api/v1/admin/user-accounts/${accountId}`),
    create: (body: CreateUserAccountRequest) =>
      api.post<UserAccount>("/api/v1/admin/user-accounts", body),
    update: (accountId: string, body: UpdateUserAccountRequest) =>
      api.put<UserAccount>(`/api/v1/admin/user-accounts/${accountId}`, body),
    activate: (accountId: string) =>
      api.post<UserAccount>(
        `/api/v1/admin/user-accounts/${accountId}/activate`,
        {},
      ),
    deactivate: (accountId: string) =>
      api.post<UserAccount>(
        `/api/v1/admin/user-accounts/${accountId}/deactivate`,
        {},
      ),
    resetPassword: (accountId: string, body: ResetUserPasswordRequest) =>
      api.post<UserAccount>(
        `/api/v1/admin/user-accounts/${accountId}/reset-password`,
        body,
      ),
    roles: () => api.get<RoleOption[]>("/api/v1/admin/roles"),
  },
  customers: {
    list: (params?: {
      organizationId?: string;
      keyword?: string;
      classification?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.organizationId)
        searchParams.set("organizationId", params.organizationId);
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.classification)
        searchParams.set("classification", params.classification);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.pageSize !== undefined)
        searchParams.set("pageSize", String(params.pageSize));
      const query = searchParams.toString();
      return api.get<CustomerPage>(
        `/api/v1/customers${query ? `?${query}` : ""}`,
      );
    },
    get: (customerId: string) =>
      api.get<Customer>(`/api/v1/customers/${customerId}`),
    create: (body: {
      organizationId: string;
      customerCode: string;
      customerAlias: string;
      classification: CustomerClassification | string;
    }) => api.post<Customer>("/api/v1/customers", body),
    update: (
      customerId: string,
      body: {
        organizationId: string;
        customerCode: string;
        customerAlias: string;
        classification: CustomerClassification | string;
        version: number;
      },
    ) => api.put<Customer>(`/api/v1/customers/${customerId}`, body),
    softDelete: (customerId: string, body: { version: number }) =>
      api.patch<Customer>(`/api/v1/customers/${customerId}/delete`, body),
  },
  projects: {
    list: (params?: {
      customerId?: string;
      keyword?: string;
      status?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.customerId) searchParams.set("customerId", params.customerId);
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<ProjectPageResponse>(
        `/api/v1/projects${query ? `?${query}` : ""}`,
      );
    },
    get: (projectId: string) =>
      api.get<Project>(`/api/v1/projects/${projectId}`),
    create: (body: CreateProjectRequest) =>
      api.post<Project>("/api/v1/projects", body),
    update: (projectId: string, body: UpdateProjectRequest) =>
      api.put<Project>(`/api/v1/projects/${projectId}`, body),
    softDelete: (projectId: string) =>
      api.put<Project>(`/api/v1/projects/${projectId}/delete`, {}),
  },
  repositories: {
    list: (params?: {
      projectId?: string;
      status?: string;
      keyword?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<RepositoryPageResponse>(
        `/api/v1/repositories${query ? `?${query}` : ""}`,
      );
    },
    get: (repositoryId: string) =>
      api.get<Repository>(`/api/v1/repositories/${repositoryId}`),
    create: (body: CreateRepositoryRequest) =>
      api.post<Repository>("/api/v1/repositories", body),
    update: (repositoryId: string, body: UpdateRepositoryRequest) =>
      api.put<Repository>(`/api/v1/repositories/${repositoryId}`, body),
    softDelete: (repositoryId: string) =>
      api.put<Repository>(`/api/v1/repositories/${repositoryId}/delete`, {}),
  },
  teams: {
    list: (params?: {
      keyword?: string;
      status?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<TeamPageResponse>(
        `/api/v1/teams${query ? `?${query}` : ""}`,
      );
    },
    get: (teamId: string) => api.get<TeamDetail>(`/api/v1/teams/${teamId}`),
    create: (body: CreateTeamRequest) => api.post<Team>("/api/v1/teams", body),
    update: (teamId: string, body: UpdateTeamRequest) =>
      api.put<Team>(`/api/v1/teams/${teamId}`, body),
    softDelete: (teamId: string, body: DeleteTeamRequest) =>
      api.patch<Team>(`/api/v1/teams/${teamId}/delete`, body),
    listMembers: (teamId: string) =>
      api.get<TeamMember[]>(`/api/v1/teams/${teamId}/members`),
    addMember: (teamId: string, body: AddTeamMemberRequest) =>
      api.post<TeamMember>(`/api/v1/teams/${teamId}/members`, body),
    updateMemberRole: (
      teamId: string,
      teamMemberId: string,
      body: UpdateTeamMemberRequest,
    ) =>
      api.put<TeamMember>(
        `/api/v1/teams/${teamId}/members/${teamMemberId}`,
        body,
      ),
    removeMember: (
      teamId: string,
      teamMemberId: string,
      body: DeleteTeamMemberRequest,
    ) =>
      api.patch<TeamMember>(
        `/api/v1/teams/${teamId}/members/${teamMemberId}/delete`,
        body,
      ),
  },
  roles: {
    list: (params?: { keyword?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.keyword) searchParams.set("keyword", params.keyword);
      if (params?.status) searchParams.set("status", params.status);
      const query = searchParams.toString();
      return api.get<RoleDto[]>(`/api/v1/roles${query ? `?${query}` : ""}`);
    },
    get: (roleId: string) => api.get<RoleDto>(`/api/v1/roles/${roleId}`),
    create: (body: CreateRoleRequest) =>
      api.post<RoleDto>("/api/v1/roles", body),
    update: (roleId: string, body: UpdateRoleRequest) =>
      api.put<RoleDto>(`/api/v1/roles/${roleId}`, body),
    logicalDelete: (roleId: string) =>
      api.put<RoleDto>(`/api/v1/roles/${roleId}/delete`, {}),
  },
  traceability: {
    get: (ticketId: string) =>
      api.get<TraceabilityResponse>(`/api/v1/traceability/${ticketId}`),
  },
  evidenceQualityScores: {
    getLatest: (ticketId: string) =>
      api.get<EvidenceQualityScoreResponse>(
        `/api/v1/evidence-quality-scores/tickets/${ticketId}`,
      ),
  },
  qaDashboard: {
    access: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<void>(
        `/api/v1/qa/dashboard/access${query ? `?${query}` : ""}`,
      );
    },
    summary: (params?: {
      projectId?: string;
      repositoryId?: string;
      ticketId?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ticketId) searchParams.set("ticketId", params.ticketId);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<import("@/pages/qa-dashboard/types").QaSummary>(
        `/api/v1/qa/dashboard/summary${query ? `?${query}` : ""}`,
      );
    },
    acceptanceCriteria: (params?: {
      projectId?: string;
      repositoryId?: string;
      ticketId?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ticketId) searchParams.set("ticketId", params.ticketId);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<
        import("@/pages/qa-dashboard/types").AcceptanceCriteriaPage
      >(`/api/v1/qa/dashboard/acceptance-criteria${query ? `?${query}` : ""}`);
    },
    coverageTrend: (params?: {
      projectId?: string;
      repositoryId?: string;
      ticketId?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ticketId) searchParams.set("ticketId", params.ticketId);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/qa-dashboard/types").AcCoverageTrendPoint[]
      >(`/api/v1/qa/dashboard/coverage-trend${query ? `?${query}` : ""}`);
    },
    options: (params?: { projectId?: string; repositoryId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      const query = searchParams.toString();
      return api.get<import("@/pages/qa-dashboard/types").QaDashboardOptions>(
        `/api/v1/qa/dashboard/options${query ? `?${query}` : ""}`,
      );
    },
    exportCsv: (params?: {
      projectId?: string;
      repositoryId?: string;
      ticketId?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ticketId) searchParams.set("ticketId", params.ticketId);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.blob(
        `/api/v1/qa/dashboard/export${query ? `?${query}` : ""}`,
        { method: "POST" },
      );
    },
    tickets: (params?: {
      projectId?: string;
      repositoryId?: string;
      ticketId?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ticketId) searchParams.set("ticketId", params.ticketId);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<import("@/pages/qa-dashboard/types").QaTicketPage>(
        `/api/v1/qa/dashboard/tickets${query ? `?${query}` : ""}`,
      );
    },
    ticketDetail: (ticketId: string) =>
      api.get<import("@/pages/qa-dashboard/types").QaTicketDetail>(
        `/api/v1/qa/dashboard/tickets/${ticketId}/detail`,
      ),
    ticketAcceptanceCriteria: (
      ticketId: string,
      params?: { search?: string; page?: number; size?: number },
    ) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<import("@/pages/qa-dashboard/types").QaAcTicketPage>(
        `/api/v1/qa/dashboard/tickets/${ticketId}/acceptance-criteria${query ? `?${query}` : ""}`,
      );
    },
    ticketCoverageTrend: (ticketId: string) =>
      api.get<import("@/pages/qa-dashboard/types").AcCoverageTrendPoint[]>(
        `/api/v1/qa/dashboard/tickets/${ticketId}/coverage-trend`,
      ),
  },
  securityDashboard: {
    access: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<void>(
        `/api/v1/security/dashboard/access${query ? `?${query}` : ""}`,
      );
    },
    options: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/security-dashboard/types").SecurityDashboardOptions
      >(`/api/v1/security/dashboard/options${query ? `?${query}` : ""}`);
    },
    summary: (params?: {
      projectId?: string;
      repositoryId?: string;
      search?: string;
      safetyStatus?: string;
      secretScanStatus?: string;
      sastStatus?: string;
      exceptionStatus?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.safetyStatus)
        searchParams.set("safetyStatus", params.safetyStatus);
      if (params?.secretScanStatus)
        searchParams.set("secretScanStatus", params.secretScanStatus);
      if (params?.sastStatus) searchParams.set("sastStatus", params.sastStatus);
      if (params?.exceptionStatus)
        searchParams.set("exceptionStatus", params.exceptionStatus);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/security-dashboard/types").SecurityDashboardSummary
      >(`/api/v1/security/dashboard/summary${query ? `?${query}` : ""}`);
    },
    tickets: (params?: {
      projectId?: string;
      repositoryId?: string;
      search?: string;
      safetyStatus?: string;
      secretScanStatus?: string;
      sastStatus?: string;
      exceptionStatus?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.safetyStatus)
        searchParams.set("safetyStatus", params.safetyStatus);
      if (params?.secretScanStatus)
        searchParams.set("secretScanStatus", params.secretScanStatus);
      if (params?.sastStatus) searchParams.set("sastStatus", params.sastStatus);
      if (params?.exceptionStatus)
        searchParams.set("exceptionStatus", params.exceptionStatus);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<
        import("@/pages/security-dashboard/types").SecurityTicketPage
      >(`/api/v1/security/dashboard/tickets${query ? `?${query}` : ""}`);
    },
    ticketDetail: (ticketId: string) =>
      api.get<import("@/pages/security-dashboard/types").SecurityTicketDetail>(
        `/api/v1/security/dashboard/tickets/${ticketId}`,
      ),
    exportCsv: (params?: {
      projectId?: string;
      repositoryId?: string;
      search?: string;
      safetyStatus?: string;
      secretScanStatus?: string;
      sastStatus?: string;
      exceptionStatus?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.safetyStatus)
        searchParams.set("safetyStatus", params.safetyStatus);
      if (params?.secretScanStatus)
        searchParams.set("secretScanStatus", params.secretScanStatus);
      if (params?.sastStatus) searchParams.set("sastStatus", params.sastStatus);
      if (params?.exceptionStatus)
        searchParams.set("exceptionStatus", params.exceptionStatus);
      const query = searchParams.toString();
      return api.blob(
        `/api/v1/security/dashboard/export${query ? `?${query}` : ""}`,
        { method: "POST" },
      );
    },
  },
  devDashboard: {
    access: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<void>(
        `/api/v1/dev/dashboard/access${query ? `?${query}` : ""}`,
      );
    },
    options: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/development-dashboard/types").DevDashboardOptions
      >(`/api/v1/dev/dashboard/options${query ? `?${query}` : ""}`);
    },
    summary: (params?: {
      projectId?: string;
      repositoryId?: string;
      ciStatus?: string;
      reviewStatus?: string;
      parserStatus?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ciStatus) searchParams.set("ciStatus", params.ciStatus);
      if (params?.reviewStatus)
        searchParams.set("reviewStatus", params.reviewStatus);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/development-dashboard/types").DevDashboardSummary
      >(`/api/v1/dev/dashboard/summary${query ? `?${query}` : ""}`);
    },
    tickets: (params?: {
      projectId?: string;
      repositoryId?: string;
      ciStatus?: string;
      reviewStatus?: string;
      parserStatus?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ciStatus) searchParams.set("ciStatus", params.ciStatus);
      if (params?.reviewStatus)
        searchParams.set("reviewStatus", params.reviewStatus);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<
        import("@/pages/development-dashboard/types").DevDashboardPage
      >(`/api/v1/dev/dashboard/tickets${query ? `?${query}` : ""}`);
    },
    detail: (ticketId: string) =>
      api.get<import("@/pages/development-dashboard/types").DevTicketDetail>(
        `/api/v1/dev/dashboard/tickets/${ticketId}/detail`,
      ),
    exportCsv: (params?: {
      projectId?: string;
      repositoryId?: string;
      ciStatus?: string;
      reviewStatus?: string;
      parserStatus?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.ciStatus) searchParams.set("ciStatus", params.ciStatus);
      if (params?.reviewStatus)
        searchParams.set("reviewStatus", params.reviewStatus);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.blob(
        `/api/v1/dev/dashboard/export${query ? `?${query}` : ""}`,
        { method: "POST" },
      );
    },
  },

  dataOpsDashboard: {
    access: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<void>(
        `/api/v1/data-ops/dashboard/access${query ? `?${query}` : ""}`,
      );
    },
    options: (params?: { projectId?: string; repositoryId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/data-ops-dashboard/types").DataOpsDashboardOptions
      >(`/api/v1/data-ops/dashboard/options${query ? `?${query}` : ""}`);
    },
    summary: (params?: {
      projectId?: string;
      repositoryId?: string;
      connectorName?: string;
      parserStatus?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.connectorName)
        searchParams.set("connectorName", params.connectorName);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<
        import("@/pages/data-ops-dashboard/types").DataOpsDashboardSummary
      >(`/api/v1/data-ops/dashboard/summary${query ? `?${query}` : ""}`);
    },
    connectors: (params?: {
      projectId?: string;
      repositoryId?: string;
      connectorName?: string;
      parserStatus?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.connectorName)
        searchParams.set("connectorName", params.connectorName);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<
        import("@/pages/data-ops-dashboard/types").DataOpsDashboardPage
      >(`/api/v1/data-ops/dashboard/connectors${query ? `?${query}` : ""}`);
    },
    detail: (connectorId: string) =>
      api.get<
        import("@/pages/data-ops-dashboard/types").DataOpsConnectorDetail
      >(`/api/v1/data-ops/dashboard/connectors/${connectorId}/detail`),
    repositoryMissingEvidence: (repositoryId: string) =>
      api.get<
        import("@/pages/data-ops-dashboard/types").DataOpsRepositoryMissingEvidenceResponse
      >(
        `/api/v1/data-ops/dashboard/repositories/${repositoryId}/missing-evidence`,
      ),
    exportCsv: (params?: {
      projectId?: string;
      repositoryId?: string;
      connectorName?: string;
      parserStatus?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.connectorName)
        searchParams.set("connectorName", params.connectorName);
      if (params?.parserStatus)
        searchParams.set("parserStatus", params.parserStatus);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.blob(
        `/api/v1/data-ops/dashboard/export${query ? `?${query}` : ""}`,
        { method: "POST" },
      );
    },
  },
  pmDashboard: {
    access: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<void>(
        `/api/v1/pm/dashboard/access${query ? `?${query}` : ""}`,
      );
    },
    options: (params?: { projectId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      const query = searchParams.toString();
      return api.get<PmDashboardOptions>(
        `/api/v1/pm/dashboard/options${query ? `?${query}` : ""}`,
      );
    },
    summary: (params?: {
      projectId?: string;
      repositoryId?: string;
      phaseCode?: string;
      scoreBand?: string;
      riskLevel?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.phaseCode) searchParams.set("phaseCode", params.phaseCode);
      if (params?.scoreBand) searchParams.set("scoreBand", params.scoreBand);
      if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<PmDashboardSummary>(
        `/api/v1/pm/dashboard/summary${query ? `?${query}` : ""}`,
      );
    },
    insights: (params?: {
      projectId?: string;
      repositoryId?: string;
      phaseCode?: string;
      scoreBand?: string;
      riskLevel?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.phaseCode) searchParams.set("phaseCode", params.phaseCode);
      if (params?.scoreBand) searchParams.set("scoreBand", params.scoreBand);
      if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.get<PmDashboardInsights>(
        `/api/v1/pm/dashboard/insights${query ? `?${query}` : ""}`,
      );
    },
    tickets: (params?: {
      projectId?: string;
      repositoryId?: string;
      phaseCode?: string;
      scoreBand?: string;
      riskLevel?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.phaseCode) searchParams.set("phaseCode", params.phaseCode);
      if (params?.scoreBand) searchParams.set("scoreBand", params.scoreBand);
      if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<PmDashboardPage>(
        `/api/v1/pm/dashboard/tickets${query ? `?${query}` : ""}`,
      );
    },
    detail: (ticketId: string) =>
      api.get<PmDashboardTicketDetail>(
        `/api/v1/pm/dashboard/tickets/${ticketId}/detail`,
      ),
    firstCiPass: (ticketId: string) =>
      api.get<FirstCiPassDto>(`/api/v1/kpi/first-ci-pass/ticket/${ticketId}`),
    refresh: () =>
      api.post<PmDashboardRefreshResult>("/api/v1/pm/dashboard/refresh", {}),
    exportCsv: (params?: {
      projectId?: string;
      repositoryId?: string;
      phaseCode?: string;
      scoreBand?: string;
      riskLevel?: string;
      search?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.repositoryId)
        searchParams.set("repositoryId", params.repositoryId);
      if (params?.phaseCode) searchParams.set("phaseCode", params.phaseCode);
      if (params?.scoreBand) searchParams.set("scoreBand", params.scoreBand);
      if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return api.blob(
        `/api/v1/pm/dashboard/export${query ? `?${query}` : ""}`,
        { method: "POST" },
      );
    },
  },

  adminAuditLogs: {
    list: (params?: {
      module?: string;
      operationType?: string;
      actor?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      page?: number;
      size?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.module) searchParams.set("module", params.module);
      if (params?.operationType)
        searchParams.set("operationType", params.operationType);
      if (params?.actor) searchParams.set("actor", params.actor);
      if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
      if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page !== undefined)
        searchParams.set("page", String(params.page));
      if (params?.size !== undefined)
        searchParams.set("size", String(params.size));
      const query = searchParams.toString();
      return api.get<import("@/pages/admin-audit-log/types").AuditLogPage>(
        `/api/v1/admin/audit-logs${query ? `?${query}` : ""}`,
      );
    },
    detail: (id: string) =>
      api.get<import("@/pages/admin-audit-log/types").AuditLogDetail>(
        `/api/v1/admin/audit-logs/${id}`,
      ),
  },

  scoreThresholds: {
    list: () =>
      api.get<import("@/pages/threshold-config/types").ScoreThreshold[]>(
        "/api/v1/score-thresholds",
      ),
    save: (
      body: import("@/pages/threshold-config/types").SaveScoreThresholdsRequest,
    ) =>
      api.post<import("@/pages/threshold-config/types").ScoreThreshold[]>(
        "/api/v1/score-thresholds",
        body,
      ),
  },
};
