// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const scoreThresholdsApiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  save: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("antd", () => ({
  message: messageMocks,
  ColorPicker: () => null,
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  endpoints: { scoreThresholds: scoreThresholdsApiMocks },
}));

import { ThresholdConfigPage } from "@/pages/threshold-config/ThresholdConfigPage";

const activeBands = [
  {
    id: "id-critical",
    code: "CRITICAL",
    label: "Critical",
    minScore: 0,
    maxScore: 39,
    color: "#F43F5E",
    version: 0,
  },
  {
    id: "id-excellent",
    code: "EXCELLENT",
    label: "Excellent",
    minScore: 90,
    maxScore: 100,
    color: "#10B981",
    version: 0,
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThresholdConfigPage />
    </QueryClientProvider>,
  );
}

describe("ThresholdConfigPage", () => {
  beforeEach(() => {
    scoreThresholdsApiMocks.list.mockReset().mockResolvedValue(activeBands);
    scoreThresholdsApiMocks.save.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders active bands in View Mode with Actions column hidden", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("CRITICAL")).toBeInTheDocument(),
    );
    expect(screen.getByText("EXCELLENT")).toBeInTheDocument();
    expect(
      screen.queryByText("Pages.ThresholdConfig.actions.delete"),
    ).not.toBeInTheDocument();
  });

  it("Edit click switches to Edit Mode with Save/Cancel/Add-band controls", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("CRITICAL")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.edit"));

    expect(
      screen.getByText("Pages.ThresholdConfig.actions.save"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages.ThresholdConfig.actions.cancel"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pages.ThresholdConfig.actions.addBand"),
    ).toBeInTheDocument();
  });

  it("Cancel reverts to View Mode and makes zero network calls", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("CRITICAL")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.edit"));
    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.cancel"));

    expect(
      screen.getByText("Pages.ThresholdConfig.actions.edit"),
    ).toBeInTheDocument();
    expect(scoreThresholdsApiMocks.save).not.toHaveBeenCalled();
    // list is only called once, on initial mount — Cancel itself issues no request.
    expect(scoreThresholdsApiMocks.list).toHaveBeenCalledTimes(1);
  });

  it("Add band inserts a new row with no id, editable inline", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("CRITICAL")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.edit"));
    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.addBand"));

    const labelInputs = screen.getAllByDisplayValue("");
    expect(labelInputs.length).toBeGreaterThan(0);
  });

  it("blocks Save and shows a toast when the active set has a gap", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("CRITICAL")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.edit"));
    fireEvent.click(screen.getByText("Pages.ThresholdConfig.actions.save"));

    expect(scoreThresholdsApiMocks.save).not.toHaveBeenCalled();
    expect(messageMocks.error).toHaveBeenCalledWith(
      "Pages.ThresholdConfig.Coverage.Gap",
    );
  });
});
