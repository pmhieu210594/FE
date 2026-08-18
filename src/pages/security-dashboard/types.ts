export type SecurityFilters = {
  projectId: string;
  repositoryId: string;
  search: string;
  safetyStatus: string;
  secretScanStatus: string;
  sastStatus: string;
  exceptionStatus: string;
};

export type SecurityDashboardOption = {
  value: string;
  label: string;
  role?: string | null;
};

export type SecurityDashboardOptions = {
  projects: SecurityDashboardOption[];
  repositories: SecurityDashboardOption[];
};

export type SafetyPackCounts = {
  readyCount: number;
  warningCount: number;
  missingCount: number;
};

export type SecretScanCounts = {
  passCount: number;
  failCount: number;
};

export type SastScaCounts = {
  passCount: number;
  warningCount: number;
  failCount: number;
};

export type ExceptionCounts = {
  openCount: number;
  totalCount: number;
};

export type SecurityDashboardSummary = {
  safetyPack: SafetyPackCounts;
  secretScan: SecretScanCounts;
  sastSca: SastScaCounts;
  exception: ExceptionCounts;
  updatedAt: string;
};

export type SecurityTicketRow = {
  ticketId: string;
  ticketKey: string;
  projectAlias: string;
  repositoryName: string | null;
  safetyStatus: string | null;
  secretScanStatus: string | null;
  sastStatus: string | null;
  scaStatus: string | null;
  exceptionStatus: string;
  finalVerdict: string;
  artifactVersion: number | null;
};

export type SecurityTicketPage = {
  items: SecurityTicketRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type SecurityScanResult = {
  scannerType: string;
  scanStatus: string | null;
  severity: string | null;
  findingCount: number;
  unresolvedCount: number;
};

export type ChecklistSection = {
  sectionType: string;
  presentFlag: boolean;
  validFlag: boolean | null;
  parseWarning: string | null;
};

export type SecurityException = {
  exceptionType: string;
  approved: boolean;
  followUpStatus: string | null;
  expiryDate: string | null;
};

export type SecurityTicketDetail = {
  ticketId: string;
  ticketKey: string;
  projectAlias: string;
  repositoryName: string | null;
  safetyStatus: string | null;
  scans: SecurityScanResult[];
  checklistSections: ChecklistSection[];
  exceptions: SecurityException[];
  finalVerdict: string;
  artifactVersion: number | null;
};
