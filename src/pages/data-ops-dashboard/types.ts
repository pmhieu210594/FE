export type DataOpsFilters = {
  projectId: string;
  repositoryId: string;
  connectorName: string;
  parserStatus: string;
  search: string;
};

export type DataOpsDashboardOption = {
  value: string;
  label: string;
  role?: string | null;
};

export type DataOpsDashboardOptions = {
  projects: DataOpsDashboardOption[];
  repositories: DataOpsDashboardOption[];
  connectors: DataOpsDashboardOption[];
};

/** 5 confirmed KPIs only. Security Alerts / Cost Summary are out of scope pending PM decision. */
export type DataOpsDashboardSummary = {
  connectorFailureCount: number;
  parseErrorCount: number;
  missingEvidenceCount: number;
  staleFreshnessCount: number;
  brokenLinkCount: number;
};

export type DataOpsConnectorRow = {
  connectorId: string | null;
  projectId: string;
  projectAlias: string;
  repositoryId: string;
  repositoryName: string;
  connectorName: string | null;
  connectorType: string | null;
  latestRunStatus: string | null;
  latestRunAt: string | null;
  failedRunCount: number;
  parseErrorCount: number;
  missingEvidenceCount: number;
  freshnessDelayMinutes: number | null;
};

export type DataOpsDashboardPage = {
  items: DataOpsConnectorRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type DataOpsConnectorRunItem = {
  connectorRunId: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  recordsRead: number;
  recordsWritten: number;
  errorMessage: string | null;
};

export type DataOpsDataQualityItem = {
  dataQualityId: string;
  sourceType: string;
  missingCount: number;
  parseErrorCount: number;
  schemaViolationCount: number;
  errorSummary: string | null;
  freshnessDelayMinutes: number | null;
  checkedAt: string | null;
};

export type DataOpsMissingEvidenceItem = {
  artifactSnapshotId: string;
  ticketId: string | null;
  ticketExternalKey: string | null;
  ticketTitle: string | null;
  artifactTypeCode: string;
  artifactName: string;
  fileName: string;
  sourcePath: string | null;
  existsFlag: boolean;
  requiredFieldsMissing: string[];
  missingSections: string[];
  collectedAt: string | null;
};

export type DataOpsRepositoryMissingEvidenceResponse = {
  missingEvidenceItems: DataOpsMissingEvidenceItem[];
};

export type DataOpsConnectorDetail = {
  row: DataOpsConnectorRow;
  recentRuns: DataOpsConnectorRunItem[];
  dataQualityChecks: DataOpsDataQualityItem[];
  missingEvidenceItems: DataOpsMissingEvidenceItem[];
};
