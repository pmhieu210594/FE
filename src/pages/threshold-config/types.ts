export type ScoreThreshold = {
  id: string;
  code: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type UpsertScoreThreshold = {
  id?: string;
  code: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type SaveScoreThresholdsRequest = {
  thresholds: UpsertScoreThreshold[];
};

export type ThresholdRowStatus = "ACTIVE" | "DELETE";

export type EditableThresholdRow = UpsertScoreThreshold & {
  rowKey: string;
  status: ThresholdRowStatus;
};
