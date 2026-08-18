import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataOpsFilterBar } from "@/pages/data-ops-dashboard/components/DataOpsFilterBar";
import type {
  DataOpsDashboardOptions,
  DataOpsFilters,
} from "@/pages/data-ops-dashboard/types";

afterEach(cleanup);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const EMPTY_FILTERS: DataOpsFilters = {
  projectId: "",
  repositoryId: "",
  connectorName: "",
  parserStatus: "",
  search: "",
};

const OPTIONS: DataOpsDashboardOptions = {
  projects: [{ value: "proj-1", label: "EDCAP Alpha" }],
  repositories: [{ value: "repo-1", label: "edcap-backend" }],
  connectors: [{ value: "conn-1", label: "github-connector" }],
};

describe("DataOpsFilterBar", () => {
  it("renders project options from the options prop (AC-DATAOPS-7)", () => {
    render(
      <DataOpsFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("EDCAP Alpha")).toBeInTheDocument();
  });

  it("renders repository options from the options prop (AC-DATAOPS-7)", () => {
    render(
      <DataOpsFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("edcap-backend")).toBeInTheDocument();
  });

  it("renders connector options from the options prop (AC-DATAOPS-7)", () => {
    render(
      <DataOpsFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("github-connector")).toBeInTheDocument();
  });

  it("selecting a project calls onChange with projectId and clears repositoryId (AC-DATAOPS-7)", () => {
    const onChange = vi.fn();
    render(
      <DataOpsFilterBar
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
      connectorName: "",
    });
  });

  it("selecting a repository calls onChange and clears connectorName (AC-DATAOPS-7)", () => {
    const onChange = vi.fn();
    render(
      <DataOpsFilterBar
        filters={{ ...EMPTY_FILTERS, projectId: "proj-1" }}
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId("repository-select"), {
      target: { value: "repo-1" },
    });
    expect(onChange).toHaveBeenCalledWith({
      repositoryId: "repo-1",
      connectorName: "",
    });
  });

  it("selecting a parser status calls onChange with parserStatus (AC-DATAOPS-7)", () => {
    const onChange = vi.fn();
    render(
      <DataOpsFilterBar
        filters={EMPTY_FILTERS}
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId("parser-status-select"), {
      target: { value: "ERROR" },
    });
    expect(onChange).toHaveBeenCalledWith({ parserStatus: "ERROR" });
  });

  it("reflects the current filter values in each select", () => {
    const filters: DataOpsFilters = {
      ...EMPTY_FILTERS,
      projectId: "proj-1",
      parserStatus: "WARNING",
    };
    render(
      <DataOpsFilterBar
        filters={filters}
        options={OPTIONS}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId("project-select")).toHaveValue("proj-1");
    expect(screen.getByTestId("parser-status-select")).toHaveValue("WARNING");
  });
});
