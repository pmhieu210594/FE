export type QaFilters = {
  projectId: string;
  repositoryId: string;
  ticketId: string;
  search: string;
};

export type QaDashboardOption = {
  value: string;
  label: string;
  role?: string | null;
};

export type QaDashboardOptions = {
  projects: QaDashboardOption[];
  repositories: QaDashboardOption[];
  tickets: QaDashboardOption[];
};

export type AcStatus = "PASSED" | "PARTIAL" | "NOT_TESTED";

export type AcceptanceCriteriaRow = {
  acId: string;
  ticketKey: string;
  status: AcStatus;
  blackbox: "Yes" | "No" | "Partial";
  gap: string;
};

export type AcCoverageTrendPoint = {
  label: string;
  coveragePercent: number;
};

export type QaSummary = {
  acTestCoveragePercent: number;
  acNotTestedCount: number;
  blackboxCoveragePercent: number;
  testResultsPassPercent: number;
  defectLeakageCount: number;
  acceptanceReadyCount: number;
  updatedAt: string;
};

export type QaDashboardData = {
  summary: QaSummary;
  acceptanceCriteria: AcceptanceCriteriaRow[];
  coverageTrend: AcCoverageTrendPoint[];
};

export type AcceptanceCriteriaPage = {
  items: AcceptanceCriteriaRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type QaTicketRow = {
  ticketId: string;
  projectId: string;
  projectAlias: string;
  repositoryId: string | null;
  externalTicketKey: string;
  title: string | null;
  status: string | null;
  priority: string | null;
  ownerDisplay: string;
  acCoveragePercent: number;
  testResultPercent: number;
  createdAt: string | null;
  updatedAt: string | null;
  artifactVersion: number | null;
};

export type QaTicketPage = {
  items: QaTicketRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

/** description/sprint have no backing source in the current schema — always null. */
export type QaTicketDetail = {
  row: QaTicketRow;
  description: string | null;
  sprint: string | null;
  latestCiRunUrl: string | null;
};

export type AcTicketStatus =
  | "PASSED"
  | "RUNNING"
  | "FAILED"
  | "NOT_TESTED"
  | "SKIPPED"
  | "PARTIAL"
  | "UNKNOWN";

export type QaAcTicketRow = {
  acId: string;
  acceptanceCriteria: string | null;
  status: AcTicketStatus;
  linkedTestCase: string;
  testResult: string;
  owner: string;
};

export type QaAcTicketPage = {
  items: QaAcTicketRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalAcCount: number;
  testedCount: number;
  notTestedCount: number;
  coveragePercent: number;
  testResultPercent: number;
};
