export type DevFilters = {
  projectId: string;
  repositoryId: string;
  ciStatus: string;
  reviewStatus: string;
  search: string;
};

export type DevDashboardOption = {
  value: string;
  label: string;
  role?: string | null;
};

export type DevDashboardOptions = {
  projects: DevDashboardOption[];
  repositories: DevDashboardOption[];
};

export type DevDashboardSummary = {
  ciFailureCount: number;
  reviewCommentCount: number;
  parserErrorCount: number;
};

export type DevTicketRow = {
  ticketId: string;
  projectId: string;
  projectAlias: string;
  externalTicketKey: string;
  title: string | null;
  ticketStatus: string;
  ciFailCount: number;
  latestCiStatus: string | null;
  openFindingCount: number;
  reviewCommentCount: number;
  parserErrorFlag: boolean;
  ageDays: number;
  artifactVersion: number | null;
};

export type DevCiRunItem = {
  ciRunId: string;
  workflowName: string | null;
  status: string;
  failureCategory: string | null;
  ciUrl: string | null;
  startedAt: string | null;
};

export type DevFindingItem = {
  findingId: string;
  severity: string;
  status: string;
  findingSummary: string | null;
};

export type DevReviewCommentItem = {
  reviewCommentId: string;
  filePathHash: string | null;
  lineNumber: number | null;
  severity: string | null;
  commentSummary: string | null;
  resolvedFlag: boolean | null;
  commitUrl: string | null;
  state: string;
  submittedAt: string;
  submittedBy: string;
};

export type DevParserSummary = {
  parseErrorCount: number;
  schemaViolationCount: number;
  missingCount: number;
};

export type DevTicketDetail = {
  row: DevTicketRow;
  ciRuns: DevCiRunItem[];
  findings: DevFindingItem[];
  reviewComments: DevReviewCommentItem[];
  parserSummary: DevParserSummary;
};

export type DevDashboardPage = {
  items: DevTicketRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
