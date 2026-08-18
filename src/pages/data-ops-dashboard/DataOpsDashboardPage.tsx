import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { message } from "antd";

import { RoleTabs } from "@/components/dashboard/RoleTabs";
import { getDashboardRouteForRole } from "@/components/dashboard/dashboardRoutes";
import { endpoints } from "@/lib/api";

import { DataOpsFilterBar } from "./components/DataOpsFilterBar";
import { DataOpsSummaryCards } from "./components/DataOpsSummaryCards";
import { DataOpsConnectorTable } from "./components/DataOpsConnectorTable";
import { DataOpsConnectorDetailDrawer } from "./components/DataOpsConnectorDetailDrawer";
import { useDataOpsDashboardFilters } from "./hooks/useDataOpsDashboardFilters";
import type {
  DataOpsFilters,
  DataOpsDashboardSummary,
  DataOpsDashboardOptions,
  DataOpsConnectorRow,
  DataOpsMissingEvidenceItem,
} from "./types";

type RepositoryIssueConnector = {
  connectorId: string;
  connectorName: string;
  failedRunCount: number;
  parseErrorCount: number;
  latestRunStatus: string | null;
  latestRunAt: string | null;
};

type RepositoryIssueSummary = {
  repositoryId: string;
  repositoryName: string;
  connectorCount: number;
  failedConnectorCount: number;
  parseErrorCount: number;
  missingEvidenceCount: number;
  connectors: RepositoryIssueConnector[];
  missingEvidenceItems: DataOpsMissingEvidenceItem[];
};

const EMPTY_SUMMARY: DataOpsDashboardSummary = {
  connectorFailureCount: 0,
  parseErrorCount: 0,
  missingEvidenceCount: 0,
  staleFreshnessCount: 0,
  brokenLinkCount: 0,
};

const EMPTY_OPTIONS: DataOpsDashboardOptions = {
  projects: [],
  repositories: [],
  connectors: [],
};

export function DataOpsDashboardPage() {
  const { t } = useTranslation("locale");
  const { lang } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { filters, updateFilters } = useDataOpsDashboardFilters();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [selectedRepository, setSelectedRepository] =
    useState<RepositoryIssueSummary | null>(null);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState("");
  const [activeParserStatus, setActiveParserStatus] = useState(
    filters.parserStatus,
  );

  useEffect(() => {
    setActiveParserStatus(filters.parserStatus);
  }, [filters.parserStatus]);

  const updateFiltersAndResetPage = useCallback(
    (next: Partial<DataOpsFilters>) => {
      updateFilters(next);
      setPage(1);
    },
    [updateFilters],
  );

  const optionsQuery = useQuery({
    queryKey: [
      "dataOpsDashboard",
      "options",
      filters.projectId,
      filters.repositoryId,
    ],
    queryFn: () =>
      endpoints.dataOpsDashboard.options({
        projectId: filters.projectId || undefined,
        repositoryId: filters.repositoryId || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });
  const options = optionsQuery.data ?? EMPTY_OPTIONS;

  const displayProjectId =
    filters.projectId || options.projects[0]?.value || "";
  const displayRepositoryId =
    filters.repositoryId ||
    (displayProjectId ? options.repositories[0]?.value || "" : "");
  const displayConnectorName = filters.connectorName;

  const apiParams = useMemo(
    () => ({
      projectId: displayProjectId || undefined,
      repositoryId: displayRepositoryId || undefined,
      connectorName: displayConnectorName || undefined,
      parserStatus: activeParserStatus || undefined,
      search: filters.search || undefined,
    }),
    [
      displayProjectId,
      displayRepositoryId,
      displayConnectorName,
      activeParserStatus,
      filters.search,
    ],
  );

  const { data: summary = EMPTY_SUMMARY } = useQuery({
    queryKey: ["dataOpsDashboard", "summary", apiParams],
    queryFn: () => endpoints.dataOpsDashboard.summary(apiParams),
    enabled: Boolean(displayProjectId) && Boolean(displayRepositoryId),
  });

  const { data: connectorsPage, isFetching: isConnectorsFetching } = useQuery({
    queryKey: ["dataOpsDashboard", "connectors", apiParams, page, perPage],
    queryFn: () =>
      endpoints.dataOpsDashboard.connectors({
        ...apiParams,
        page,
        size: perPage,
      }),
    enabled: Boolean(displayProjectId) && Boolean(displayRepositoryId),
  });

  const handleProjectChange = (projectId: string) => {
    const nextProject = options.projects.find(
      (option) => option.value === projectId,
    );
    const nextRoute = getDashboardRouteForRole(nextProject?.role);
    if (nextProject && nextRoute && nextRoute !== "data-ops-dashboard") {
      navigate(`/${lang ?? "en"}/${nextRoute}?projectId=${nextProject.value}`, {
        replace: true,
      });
      return;
    }
    updateFiltersAndResetPage({
      projectId,
      repositoryId: "",
      connectorName: "",
    });
  };

  const detailQuery = useQuery({
    queryKey: ["dataOpsDashboard", "detail", selectedConnectorId],
    queryFn: () => endpoints.dataOpsDashboard.detail(selectedConnectorId),
    enabled: Boolean(selectedConnectorId),
  });

  const repositoryMissingEvidenceQuery = useQuery({
    queryKey: [
      "dataOpsDashboard",
      "repositoryMissingEvidence",
      selectedRepositoryId,
    ],
    queryFn: () =>
      endpoints.dataOpsDashboard.repositoryMissingEvidence(
        selectedRepositoryId,
      ),
    enabled: Boolean(selectedRepositoryId),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      endpoints.dataOpsDashboard.exportCsv({
        projectId: displayProjectId || undefined,
        repositoryId: displayRepositoryId || undefined,
        connectorName: displayConnectorName || undefined,
        parserStatus: activeParserStatus || undefined,
        search: filters.search || undefined,
      }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "data-ops-dashboard.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      message.success(t("Pages.DataOpsDashboard.exportSuccess"));
    },
    onError: () => {
      message.error(t("Pages.DataOpsDashboard.exportFailed"));
    },
  });

  useEffect(() => {
    if (!options.projects.length) return;

    const selectedProject = options.projects.find(
      (option) => option.value === filters.projectId,
    );

    if (!selectedProject) {
      updateFiltersAndResetPage({
        projectId: options.projects[0].value,
        repositoryId: "",
        connectorName: "",
      });
      return;
    }

    const route = getDashboardRouteForRole(selectedProject.role);
    if (route && route !== "data-ops-dashboard") {
      navigate(`/${lang ?? "en"}/${route}?projectId=${selectedProject.value}`, {
        replace: true,
      });
    }
  }, [
    filters.projectId,
    lang,
    navigate,
    options.projects,
    updateFiltersAndResetPage,
  ]);

  useEffect(() => {
    if (!filters.projectId || !options.repositories.length) return;

    const repositoryIds = new Set(
      options.repositories.map((option) => option.value),
    );
    if (!filters.repositoryId || !repositoryIds.has(filters.repositoryId)) {
      updateFiltersAndResetPage({
        repositoryId: options.repositories[0].value,
        connectorName: "",
      });
    }
  }, [
    filters.projectId,
    filters.repositoryId,
    options.repositories,
    updateFiltersAndResetPage,
  ]);

  useEffect(() => {
    if (
      !filters.projectId ||
      !filters.repositoryId ||
      !options.connectors.length ||
      !filters.connectorName
    )
      return;

    const connectorNames = new Set(
      options.connectors.map((option) => option.value),
    );
    if (!connectorNames.has(filters.connectorName)) {
      updateFiltersAndResetPage({ connectorName: "" });
    }
  }, [
    filters.projectId,
    filters.repositoryId,
    filters.connectorName,
    options.connectors,
    updateFiltersAndResetPage,
  ]);

  const repositoryIssues = useMemo(() => {
    const rows = connectorsPage?.items ?? [];
    if (rows.length === 0) return [];

    const grouped = new Map<string, RepositoryIssueSummary>();

    rows.forEach((row) => {
      const nextMissingEvidenceCount = row.missingEvidenceCount ?? 0;
      const nextConnector = row.connectorId
        ? {
            connectorId: row.connectorId,
            connectorName: row.connectorName ?? row.connectorId,
            failedRunCount: row.failedRunCount,
            parseErrorCount: row.parseErrorCount,
            latestRunStatus: row.latestRunStatus,
            latestRunAt: row.latestRunAt,
          }
        : null;
      const existing = grouped.get(row.repositoryId);

      if (existing) {
        existing.connectorCount += row.connectorId ? 1 : 0;
        existing.failedConnectorCount +=
          row.connectorId && row.failedRunCount > 0 ? 1 : 0;
        existing.parseErrorCount = Math.max(
          existing.parseErrorCount,
          row.parseErrorCount,
        );
        existing.missingEvidenceCount = Math.max(
          existing.missingEvidenceCount,
          nextMissingEvidenceCount,
        );
        if (nextConnector) {
          existing.connectors.push(nextConnector);
        }
      } else {
        grouped.set(row.repositoryId, {
          repositoryId: row.repositoryId,
          repositoryName: row.repositoryName,
          connectorCount: row.connectorId ? 1 : 0,
          failedConnectorCount:
            row.connectorId && row.failedRunCount > 0 ? 1 : 0,
          parseErrorCount: row.parseErrorCount,
          missingEvidenceCount: nextMissingEvidenceCount,
          connectors: nextConnector ? [nextConnector] : [],
          missingEvidenceItems: [],
        });
      }
    });

    return Array.from(grouped.values());
  }, [connectorsPage?.items]);

  const prefetchRepositoryIssue = async (row: DataOpsConnectorRow) => {
    const tasks: Promise<unknown>[] = [];
    const connectorId = row.connectorId;
    const repositoryId = row.repositoryId;

    if (connectorId) {
      tasks.push(
        queryClient.prefetchQuery({
          queryKey: ["dataOpsDashboard", "detail", connectorId],
          queryFn: () => endpoints.dataOpsDashboard.detail(connectorId),
        }),
      );
    }

    tasks.push(
      queryClient.prefetchQuery({
        queryKey: [
          "dataOpsDashboard",
          "repositoryMissingEvidence",
          repositoryId,
        ],
        queryFn: () =>
          endpoints.dataOpsDashboard.repositoryMissingEvidence(repositoryId),
      }),
    );

    await Promise.all(tasks);
  };

  const handleRepositoryHover = (row: DataOpsConnectorRow) => {
    void prefetchRepositoryIssue(row);
  };

  const buildRepositoryIssue = (
    row: DataOpsConnectorRow,
  ): RepositoryIssueSummary => ({
    repositoryId: row.repositoryId,
    repositoryName: row.repositoryName,
    connectorCount: row.connectorId ? 1 : 0,
    failedConnectorCount: row.connectorId && row.failedRunCount > 0 ? 1 : 0,
    parseErrorCount: row.parseErrorCount,
    missingEvidenceCount: row.missingEvidenceCount ?? 0,
    connectors: row.connectorId
      ? [
          {
            connectorId: row.connectorId,
            connectorName: row.connectorName ?? row.connectorId,
            failedRunCount: row.failedRunCount,
            parseErrorCount: row.parseErrorCount,
            latestRunStatus: row.latestRunStatus,
            latestRunAt: row.latestRunAt,
          },
        ]
      : [],
    missingEvidenceItems: [],
  });

  const handleRepositoryClick = (row: DataOpsConnectorRow) => {
    const matched = repositoryIssues.find(
      (repo) => repo.repositoryId === row.repositoryId,
    );

    setSelectedConnectorId(row.connectorId ?? "");
    setSelectedRepository(matched ?? buildRepositoryIssue(row));
    setSelectedRepositoryId(row.repositoryId);
    void prefetchRepositoryIssue(row);
  };

  const selectedRepositoryWithEvidence = selectedRepository
    ? {
        ...selectedRepository,
        missingEvidenceItems:
          repositoryMissingEvidenceQuery.data?.missingEvidenceItems ?? [],
      }
    : null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4">
        <DataOpsFilterBar
          filters={{
            ...filters,
            projectId: displayProjectId,
            repositoryId: displayRepositoryId,
            connectorName: displayConnectorName,
            parserStatus: activeParserStatus,
          }}
          options={options}
          isDisabled={optionsQuery.isLoading && options.projects.length === 0}
          onChange={(next) => {
            if (next.projectId !== undefined) {
              handleProjectChange(next.projectId);
              return;
            }
            if (next.parserStatus !== undefined) {
              setActiveParserStatus(next.parserStatus);
            }
            updateFiltersAndResetPage(next);
          }}
        />
        <RoleTabs active="data-ops" />
      </div>

      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-900">
          {t("Pages.DataOpsDashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("Pages.DataOpsDashboard.description")}
        </p>
      </div>

      <DataOpsSummaryCards summary={summary} />

      <div className="sr-only">Repository issues</div>

      <DataOpsConnectorTable
        rows={connectorsPage?.items ?? []}
        totalElements={connectorsPage?.totalElements ?? 0}
        page={connectorsPage?.page ?? page}
        perPage={connectorsPage?.size ?? perPage}
        totalPages={connectorsPage?.totalPages ?? 1}
        searchValue={filters.search}
        onSearchChange={(value) =>
          updateFiltersAndResetPage({ search: value ?? "" })
        }
        onPageChange={setPage}
        onPerPageChange={(nextPerPage) => {
          setPage(1);
          setPerPage(nextPerPage);
        }}
        onRepositoryHover={handleRepositoryHover}
        onRepositoryClick={handleRepositoryClick}
        onExport={() => exportMutation.mutate()}
        isExporting={exportMutation.isPending}
        isLoading={isConnectorsFetching}
      />

      <DataOpsConnectorDetailDrawer
        connectorId={selectedConnectorId}
        detail={detailQuery.data ?? null}
        repository={selectedRepositoryWithEvidence}
        isLoading={
          detailQuery.isLoading || repositoryMissingEvidenceQuery.isLoading
        }
        onClose={() => {
          setSelectedConnectorId("");
          setSelectedRepository(null);
          setSelectedRepositoryId("");
        }}
      />
    </div>
  );
}
