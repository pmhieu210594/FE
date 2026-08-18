export type DashboardFilters = {
  projectId: string;
  repositoryId: string;
  scoreBand: string;
  riskLevel: string;
  search: string;
  page: number;
  size: number;
};

export type DashboardRoleView =
  | "pm"
  | "qa"
  | "development"
  | "security"
  | "executive"
  | "data-ops";

export type EvidenceBottleneckBucket = {
  bucketKey: string;
  bucketName: string;
  missingEvidenceCount: number;
};
