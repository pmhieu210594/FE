import { describe, expect, it } from "vitest";

import {
  createEditableRow,
  toEditableRows,
  toSaveRequest,
  toggleRowDeleted,
  validateActiveRows,
} from "@/pages/threshold-config/utils";
import type {
  EditableThresholdRow,
  ScoreThreshold,
} from "@/pages/threshold-config/types";

function row(
  overrides: Partial<EditableThresholdRow> = {},
): EditableThresholdRow {
  return {
    rowKey: "k1",
    code: "EXCELLENT",
    label: "Excellent",
    minScore: 90,
    maxScore: 100,
    color: "#10B981",
    status: "ACTIVE",
    ...overrides,
  };
}

describe("toEditableRows", () => {
  it("sorts by minScore and marks all rows ACTIVE", () => {
    const active: ScoreThreshold[] = [
      {
        id: "b",
        code: "GOOD",
        label: "Good",
        minScore: 75,
        maxScore: 89,
        color: "#0EA5E9",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
      },
      {
        id: "a",
        code: "EXCELLENT",
        label: "Excellent",
        minScore: 90,
        maxScore: 100,
        color: "#10B981",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
      },
    ];
    const result = toEditableRows(active);
    expect(result.map((r) => r.id)).toEqual(["b", "a"]);
    expect(result.every((r) => r.status === "ACTIVE")).toBe(true);
  });
});

describe("createEditableRow", () => {
  it("creates a new row with no id and a unique rowKey", () => {
    const a = createEditableRow();
    const b = createEditableRow();
    expect(a.id).toBeUndefined();
    expect(a.rowKey).not.toEqual(b.rowKey);
  });
});

describe("toggleRowDeleted", () => {
  it("flips status between ACTIVE and DELETE for the matching row only", () => {
    const rows = [row({ rowKey: "k1" }), row({ rowKey: "k2" })];
    const toggled = toggleRowDeleted(rows, "k1");
    expect(toggled.find((r) => r.rowKey === "k1")?.status).toBe("DELETE");
    expect(toggled.find((r) => r.rowKey === "k2")?.status).toBe("ACTIVE");

    const toggledBack = toggleRowDeleted(toggled, "k1");
    expect(toggledBack.find((r) => r.rowKey === "k1")?.status).toBe("ACTIVE");
  });
});

describe("toSaveRequest", () => {
  it("drops DELETE-status rows from the payload (backend soft-deletes by omission)", () => {
    const rows = [
      row({ rowKey: "k1", id: "id-1" }),
      row({ rowKey: "k2", status: "DELETE" }),
    ];
    const request = toSaveRequest(rows);
    expect(request.thresholds).toHaveLength(1);
    expect(request.thresholds[0].id).toBe("id-1");
  });

  it("normalizes code to trimmed uppercase and label to trimmed", () => {
    const rows = [row({ code: " excellent ", label: "  Excellent  " })];
    const request = toSaveRequest(rows);
    expect(request.thresholds[0].code).toBe("EXCELLENT");
    expect(request.thresholds[0].label).toBe("Excellent");
  });
});

describe("validateActiveRows", () => {
  it("accepts full 0-100 coverage with no gaps or overlaps", () => {
    const rows = [
      row({ rowKey: "1", code: "CRITICAL", minScore: 0, maxScore: 39 }),
      row({ rowKey: "2", code: "RISKY", minScore: 40, maxScore: 59 }),
      row({ rowKey: "3", code: "WARNING", minScore: 60, maxScore: 74 }),
      row({ rowKey: "4", code: "GOOD", minScore: 75, maxScore: 89 }),
      row({ rowKey: "5", code: "EXCELLENT", minScore: 90, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBeNull();
  });

  it("rejects an empty active set", () => {
    expect(validateActiveRows([])).toBe(
      "Pages.ThresholdConfig.ActiveSet.Empty",
    );
  });

  it("ignores DELETE-status rows when checking coverage", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 100 }),
      row({ rowKey: "2", status: "DELETE", minScore: 50, maxScore: 60 }),
    ];
    expect(validateActiveRows(rows)).toBeNull();
  });

  it("rejects a gap", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 39 }),
      row({ rowKey: "2", code: "B", minScore: 45, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBe("Pages.ThresholdConfig.Coverage.Gap");
  });

  it("rejects an overlap", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 40 }),
      row({ rowKey: "2", code: "B", minScore: 40, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBe(
      "Pages.ThresholdConfig.Coverage.Overlap",
    );
  });

  it("accepts adjacent bands touching at the boundary", () => {
    const rows = [
      row({ rowKey: "1", minScore: 0, maxScore: 39 }),
      row({ rowKey: "2", code: "B", minScore: 40, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBeNull();
  });

  it("rejects a duplicate code within the payload", () => {
    const rows = [
      row({ rowKey: "1", code: "WARNING", minScore: 0, maxScore: 50 }),
      row({ rowKey: "2", code: "WARNING", minScore: 51, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBe(
      "Pages.ThresholdConfig.Code.Duplicate",
    );
  });

  it("rejects a lowercase or special-char code", () => {
    const rows = [
      row({ code: "excellent score!", minScore: 0, maxScore: 100 }),
    ];
    expect(validateActiveRows(rows)).toBe(
      "Pages.ThresholdConfig.Code.InvalidFormat",
    );
  });

  it("rejects an invalid color", () => {
    const rows = [row({ color: "not-a-color", minScore: 0, maxScore: 100 })];
    expect(validateActiveRows(rows)).toBe(
      "Pages.ThresholdConfig.Color.InvalidFormat",
    );
  });

  it("rejects minScore greater than maxScore", () => {
    const rows = [row({ minScore: 80, maxScore: 60 })];
    expect(validateActiveRows(rows)).toBe(
      "Pages.ThresholdConfig.Range.MinGreaterThanMax",
    );
  });
});
