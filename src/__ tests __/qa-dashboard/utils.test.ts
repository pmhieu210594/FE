import { describe, expect, it } from "vitest";

import { acStatusClasses, acStatusLabel } from "@/pages/qa-dashboard/utils";

describe("acStatusClasses", () => {
  it("provides Tailwind classes for PASSED", () => {
    expect(acStatusClasses.PASSED).toContain("emerald");
  });

  it("provides Tailwind classes for PARTIAL", () => {
    expect(acStatusClasses.PARTIAL).toContain("amber");
  });

  it("provides Tailwind classes for NOT_TESTED", () => {
    expect(acStatusClasses.NOT_TESTED).toContain("rose");
  });
});

describe("acStatusLabel", () => {
  it("returns human-readable labels for each status", () => {
    expect(acStatusLabel.PASSED).toBe("Passed");
    expect(acStatusLabel.PARTIAL).toBe("Partial");
    expect(acStatusLabel.NOT_TESTED).toBe("Not Tested");
  });
});
