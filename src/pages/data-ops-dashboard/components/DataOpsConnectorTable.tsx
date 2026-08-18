import { Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon, ETableAlign } from "@/enums";
import { cn } from "@/lib/utils";
import type { DataOpsConnectorRow } from "../types";

type DataOpsConnectorTableProps = Readonly<{
  rows: DataOpsConnectorRow[];
  totalElements: number;
  page: number;
  perPage: number;
  totalPages: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
  onRepositoryHover?: (row: DataOpsConnectorRow) => void;
  onRepositoryClick: (row: DataOpsConnectorRow) => void;
}>;

function runStatusClass(status: string | null): string {
  if (status === "FAILED" || status === "FAILURE")
    return "bg-red-100 text-red-700";
  if (status === "SUCCESS") return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-500";
}

function parseErrorClass(count: number): string {
  return count > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-800";
}

export function DataOpsConnectorTable({
  rows,
  totalElements,
  page,
  perPage,
  totalPages: _totalPages,
  searchValue,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onExport,
  isExporting,
  isLoading,
  onRepositoryHover,
  onRepositoryClick,
}: DataOpsConnectorTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "connectorName",
        title: t("Pages.DataOpsDashboard.connectorTable.connector"),
        tableItem: {},
      },
      {
        name: "repositoryName",
        title: t("Pages.DataOpsDashboard.connectorTable.repository"),
        tableItem: {},
      },
      {
        name: "latestRunStatus",
        title: t("Pages.DataOpsDashboard.connectorTable.latestRunStatus"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                runStatusClass(value),
              )}
            >
              {value ?? "—"}
            </span>
          ),
        },
      },
      {
        name: "failedRunCount",
        title: t("Pages.DataOpsDashboard.connectorTable.failedRunCount"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) =>
            value > 0 ? (
              <span className="font-semibold text-red-600">{value}</span>
            ) : (
              <span className="text-slate-800">0</span>
            ),
        },
      },
      {
        name: "parseErrorCount",
        title: t("Pages.DataOpsDashboard.connectorTable.parseErrorCount"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                parseErrorClass(value),
              )}
            >
              {value}
            </span>
          ),
        },
      },
      {
        name: "missingEvidenceCount",
        title: t("Pages.DataOpsDashboard.connectorTable.missingEvidence", {
          defaultValue: "Missing evidence",
        }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                value > 0
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-800",
              )}
            >
              {value}
            </span>
          ),
        },
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("Pages.DataOpsDashboard.connectorTable.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("Pages.DataOpsDashboard.connectorTable.description", {
              defaultValue:
                "Monitor connector health and drill into repository-level issues.",
            })}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <CServerTable
          leftHeader={
            onExport ? (
              <Button
                onClick={onExport}
                disabled={isExporting}
                className="h-9 rounded-lg bg-blue-600 px-3 font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("Pages.DataOpsDashboard.export")}
              </Button>
            ) : undefined
          }
          columns={columns}
          data={rows}
          sort={{}}
          onSortChange={() => {}}
          isLoading={isLoading}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          isPagination
          pagination={{
            total: Math.max(totalElements, _totalPages * perPage),
            page,
            perPage,
            pageSizeOptions: [perPage, 25, 50, 75, 100, 125],
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage !== perPage) {
                onPerPageChange(nextPerPage);
                return;
              }
              onPageChange(nextPage);
            },
          }}
          action={{
            width: 120,
            fixed: "left",
            label: t("Pages.DataOpsDashboard.connectorTable.actions", {
              defaultValue: "Actions",
            }),
            name: (row: DataOpsConnectorRow) =>
              row.connectorId ?? row.repositoryId,
            render: (row: DataOpsConnectorRow) => (
              <CTooltip
                title={t(
                  "Pages.DataOpsDashboard.connectorTable.viewRepository",
                  {
                    defaultValue: "View repository",
                  },
                )}
              >
                <button
                  type="button"
                  title={t(
                    "Pages.DataOpsDashboard.connectorTable.viewRepository",
                    {
                      defaultValue: "View repository",
                    },
                  )}
                  aria-label={t(
                    "Pages.DataOpsDashboard.connectorTable.viewRepository",
                    {
                      defaultValue: "View repository",
                    },
                  )}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  onMouseEnter={() => {
                    onRepositoryHover?.(row);
                  }}
                  onFocus={() => {
                    onRepositoryHover?.(row);
                  }}
                  onClick={() => {
                    onRepositoryClick(row);
                  }}
                >
                  <CSvgIcon name={EIcon.eye} size={25} className="primary" />
                </button>
              </CTooltip>
            ),
          }}
          onRow={(row: DataOpsConnectorRow) => ({
            onClick: () => {
              onRepositoryClick(row);
            },
          })}
        />
      </div>
    </div>
  );
}
