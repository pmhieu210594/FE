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
import type { DevTicketRow } from "../types";

type DevTicketTableProps = Readonly<{
  rows: DevTicketRow[];
  totalElements: number;
  page: number;
  perPage: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onSelect: (ticketId: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}>;

function ciStatusClass(status: string | null): string {
  if (status === "FAILURE") return "bg-red-100 text-red-700";
  if (status === "SUCCESS") return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-500";
}

function parserErrorClass(flag: boolean): string {
  return flag ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-400";
}

export function DevTicketTable({
  rows,
  totalElements,
  page,
  perPage,
  searchValue,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onSelect,
  onExport,
  isExporting,
  isLoading,
}: DevTicketTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "externalTicketKey",
        title: t("Pages.DevDashboard.ticketTable.ticket"),
      },
      {
        name: "title",
        title: t("Pages.DevDashboard.ticketTable.title"),
        tableItem: {
          render: (value: string | null) => value ?? "—",
        },
      },
      {
        name: "latestCiStatus",
        title: t("Pages.DevDashboard.ticketTable.ciStatus"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                ciStatusClass(value),
              )}
            >
              {value ?? "—"}
            </span>
          ),
        },
      },
      {
        name: "reviewRoundCount",
        title: t("Pages.DevDashboard.ticketTable.reworkRounds"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) =>
            value > 0 ? (
              <span className="font-semibold text-orange-600">{value - 1}</span>
            ) : (
              <span className="text-slate-400">0</span>
            ),
        },
      },
      {
        name: "reviewRoundCount",
        title: t("Pages.DevDashboard.ticketTable.reviewRounds"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) =>
            value > 0 ? (
              <span className="font-semibold text-orange-600">{value}</span>
            ) : (
              <span className="text-slate-400">0</span>
            ),
        },
      },
      {
        name: "reviewCommentCount",
        title: t("Pages.DevDashboard.ticketTable.reviewComments"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) =>
            value > 0 ? (
              <span className="font-semibold text-orange-600">{value}</span>
            ) : (
              <span className="text-slate-400">0</span>
            ),
        },
      },
      {
        name: "parserErrorFlag",
        title: t("Pages.DevDashboard.ticketTable.parserError"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: boolean) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                parserErrorClass(value),
              )}
            >
              {value
                ? t("Pages.DevDashboard.ticketTable.parserErrorYes")
                : t("Pages.DevDashboard.ticketTable.parserErrorNo")}
            </span>
          ),
        },
      },
      {
        name: "artifactVersion",
        title: t("Pages.DevDashboard.ticketTable.version", {
          defaultValue: "Version",
        }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number | null) => String(value ?? "-"),
        },
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {t("Pages.PmDashboard.allTicketsTitle")}
      </h2>

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
                {t("Pages.DevDashboard.export")}
              </Button>
            ) : undefined
          }
          columns={columns}
          data={rows}
          sort={{}}
          onSortChange={() => {}}
          isLoading={isLoading}
          isPagination
          pagination={{
            total: totalElements,
            page,
            perPage,
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage !== perPage) {
                onPerPageChange(nextPerPage);
              } else {
                onPageChange(nextPage);
              }
            },
          }}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          action={{
            width: 80,
            fixed: "left",
            label: t("Components.Action"),
            name: (row: DevTicketRow) => row.externalTicketKey,
            render: (row: DevTicketRow) => (
              <CTooltip
                title={t("Pages.DevDashboard.viewDetail", {
                  defaultValue: "View detail",
                })}
              >
                <button
                  type="button"
                  title={t("Pages.DevDashboard.viewDetail", {
                    defaultValue: "View detail",
                  })}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(row.ticketId);
                  }}
                >
                  <CSvgIcon name={EIcon.eye} size={25} className="primary" />
                </button>
              </CTooltip>
            ),
          }}
        />
      </div>
    </div>
  );
}
