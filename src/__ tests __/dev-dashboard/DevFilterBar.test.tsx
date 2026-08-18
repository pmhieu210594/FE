import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DevFilterBar } from "@/pages/development-dashboard/components/DevFilterBar";
import type {
  DevDashboardOptions,
  DevFilters,
} from "@/pages/development-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const EMPTY_FILTERS: DevFilters = {
  projectId: "",
  repositoryId: "",
  ciStatus: "",
  reviewStatus: "",
  search: "",
};

const OPTIONS: DevDashboardOptions = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
};

describe("DevFilterBar", () => {
  it("renders project options from the options prop (AC-5)", () => {
    render(
      <DevFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("EDCAP Alpha")).toBeInTheDocument();
  });

  it("renders repository options from the options prop (AC-5)", () => {
    render(
      <DevFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("edcap-backend")).toBeInTheDocument();
  });

  it("selecting a project calls onChange with projectId and clears repositoryId (AC-5)", () => {
    const onChange = vi.fn();
    render(
      <DevFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId("project-select"), {
      target: { value: "proj-1" },
    });
    expect(onChange).toHaveBeenCalledWith({
      projectId: "proj-1",
      repositoryId: "",
    });
  });

  it("selecting a repository calls onChange with repositoryId (AC-5)", () => {
    const onChange = vi.fn();
    render(
      <DevFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId("repository-select"), {
      target: { value: "repo-1" },
    });
    expect(onChange).toHaveBeenCalledWith({ repositoryId: "repo-1" });
  });

  it("reflects the current filter values in each select", () => {
    const filters: DevFilters = {
      ...EMPTY_FILTERS,
      projectId: "proj-1",
    };
    render(
      <DevFilterBar filters={filters} options={OPTIONS} onChange={vi.fn()} />,
    );
    expect(screen.getByTestId("project-select")).toHaveValue("proj-1");
  });
});
