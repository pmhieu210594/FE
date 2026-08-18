import type {
  EditableThresholdRow,
  SaveScoreThresholdsRequest,
  ScoreThreshold,
} from "./types";

const CODE_PATTERN = /^[A-Z0-9_]+$/;
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const FROM_MAX_LENGTH = 3;
const TO_MAX_LENGTH = 3;
const LABEL_MAX_LENGTH = 255;
const CODE_MAX_LENGTH = 100;
const COLOR_MAX_LENGTH = 20;

let rowKeySeq = 0;

function nextRowKey() {
  rowKeySeq += 1;
  return `new-${rowKeySeq}`;
}

export function toEditableRows(
  active: ScoreThreshold[],
): EditableThresholdRow[] {
  return active
    .slice()
    .sort((a, b) => a.minScore - b.minScore)
    .map((row) => ({ ...row, rowKey: row.id, status: "ACTIVE" }));
}

export function createEditableRow(): EditableThresholdRow {
  return {
    rowKey: nextRowKey(),
    code: "",
    label: "",
    minScore: 0,
    maxScore: 0,
    color: "#10B981",
    status: "ACTIVE",
  };
}

export function toggleRowDeleted(
  rows: EditableThresholdRow[],
  rowKey: string,
): EditableThresholdRow[] {
  return rows.map((row) =>
    row.rowKey === rowKey
      ? { ...row, status: row.status === "ACTIVE" ? "DELETE" : "ACTIVE" }
      : row,
  );
}

export function toSaveRequest(
  rows: EditableThresholdRow[],
): SaveScoreThresholdsRequest {
  return {
    thresholds: rows
      .filter((row) => row.status === "ACTIVE")
      .map((row) => ({
        id: row.id,
        code: row.code.trim().toUpperCase(),
        label: row.label.trim(),
        minScore: row.minScore,
        maxScore: row.maxScore,
        color: row.color.trim(),
        createdAt: row.createdAt,
        createdBy: row.createdBy,
        updatedAt: row.updatedAt,
        updatedBy: row.updatedBy,
      })),
  };
}

export type ValidationErrorKey =
  | "Pages.ThresholdConfig.ActiveSet.Empty"
  | "Pages.ThresholdConfig.Label.Required"
  | "Pages.ThresholdConfig.Label.MaxLength"
  | "Pages.ThresholdConfig.Code.Required"
  | "Pages.ThresholdConfig.Code.InvalidFormat"
  | "Pages.ThresholdConfig.Code.MaxLength"
  | "Pages.ThresholdConfig.Code.Duplicate"
  | "Pages.ThresholdConfig.Color.InvalidFormat"
  | "Pages.ThresholdConfig.Color.MaxLength"
  | "Pages.ThresholdConfig.Range.MaxLength"
  | "Pages.ThresholdConfig.Range.OutOfBounds"
  | "Pages.ThresholdConfig.Range.MinGreaterThanMax"
  | "Pages.ThresholdConfig.Coverage.Gap"
  | "Pages.ThresholdConfig.Coverage.Overlap";

/**
 * Client-side mirror of the server's BR-THRESHOLD-CONFIG-005/006/007/008/009
 * validation, re-run on every edit to drive the realtime progress bar and
 * disable Save early — the server re-validates independently (spec-pack §6.1).
 */
export function validateActiveRows(
  rows: EditableThresholdRow[],
): ValidationErrorKey | null {
  const active = rows.filter((row) => row.status === "ACTIVE");
  if (active.length === 0) {
    return "Pages.ThresholdConfig.ActiveSet.Empty";
  }
  for (const row of active) {
    if (!row.label.trim()) {
      return "Pages.ThresholdConfig.Label.Required";
    }
    if (row.label.length > LABEL_MAX_LENGTH) {
      return "Pages.ThresholdConfig.Label.MaxLength";
    }
    const code = row.code.trim();
    if (!code) {
      return "Pages.ThresholdConfig.Code.Required";
    }
    if (code.length > CODE_MAX_LENGTH) {
      return "Pages.ThresholdConfig.Code.MaxLength";
    }
    if (!CODE_PATTERN.test(code)) {
      return "Pages.ThresholdConfig.Code.InvalidFormat";
    }
    if (row.color.trim().length > COLOR_MAX_LENGTH) {
      return "Pages.ThresholdConfig.Color.MaxLength";
    }
    if (!COLOR_PATTERN.test(row.color.trim())) {
      return "Pages.ThresholdConfig.Color.InvalidFormat";
    }
    if (
      String(row.minScore).length > FROM_MAX_LENGTH ||
      String(row.maxScore).length > TO_MAX_LENGTH
    ) {
      return "Pages.ThresholdConfig.Range.MaxLength";
    }
    if (row.minScore < 0 || row.maxScore > 100) {
      return "Pages.ThresholdConfig.Range.OutOfBounds";
    }
    if (row.minScore > row.maxScore) {
      return "Pages.ThresholdConfig.Range.MinGreaterThanMax";
    }
  }

  const seenCodes = new Set<string>();
  for (const row of active) {
    const code = row.code.trim().toUpperCase();
    if (seenCodes.has(code)) {
      return "Pages.ThresholdConfig.Code.Duplicate";
    }
    seenCodes.add(code);
  }

  const ordered = active.slice().sort((a, b) => a.minScore - b.minScore);
  if (ordered[0].minScore !== 0) {
    return "Pages.ThresholdConfig.Coverage.Gap";
  }
  if (ordered[ordered.length - 1].maxScore !== 100) {
    return "Pages.ThresholdConfig.Coverage.Gap";
  }
  for (let i = 1; i < ordered.length; i += 1) {
    const previousMax = ordered[i - 1].maxScore;
    const currentMin = ordered[i].minScore;
    if (currentMin <= previousMax) {
      return "Pages.ThresholdConfig.Coverage.Overlap";
    }
    if (currentMin > previousMax + 1) {
      return "Pages.ThresholdConfig.Coverage.Gap";
    }
  }
  return null;
}

/**
 * Builds the 0-100 segment list the progress bar renders, in score order,
 * skipping pending-delete rows.
 */
export function toProgressSegments(rows: EditableThresholdRow[]) {
  return rows
    .filter((row) => row.status === "ACTIVE")
    .slice()
    .sort((a, b) => a.minScore - b.minScore)
    .map((row) => ({
      rowKey: row.rowKey,
      color: COLOR_PATTERN.test(row.color.trim())
        ? row.color.trim()
        : "#D1D5DB",
      minScore: Math.max(0, Math.min(100, row.minScore)),
      maxScore: Math.max(0, Math.min(100, row.maxScore)),
    }));
}
