import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  CServerTable,
  type IServerTableColumn,
  type IServerTableSort,
} from "@/components/ui/server-table";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon, ETableAlign } from "@/enums";
import { cn, formatDateTime } from "@/lib/utils";
import type { QaTicketRow } from "../types";

type QaTicketsTableProps = Readonly<{
  rows: QaTicketRow[];
  totalElements: number;
  page: number;
  perPage: number;
  searchValue?: string;
  sort: IServerTableSort;
  onSortChange: (sort: IServerTableSort) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onSelect: (ticketId: string) => void;
  isLoading?: boolean;
}>;

const STATUS_CLASSES: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  CLOSED: "bg-emerald-100 text-emerald-700",
  MERGED: "bg-emerald-100 text-emerald-700",
};

function Pill({
  value,
  classes,
}: Readonly<{ value: string | null; classes: Record<string, string> }>) {
  if (!value) return <span className="text-slate-400">-</span>;
  const normalized = value.trim().toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        classes[normalized] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {value}
    </span>
  );
}

/** The QA Dashboard's Ticket table: replaces the old flat AC list with one row per ticket. */
export function QaTicketsTable({
  rows,
  totalElements,
  page,
  perPage,
  searchValue,
  sort,
  onSortChange,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onSelect,
  isLoading = false,
}: QaTicketsTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "externalTicketKey",
        title: t("Pages.QaDashboard.ticketTable.ticketId"),
        sortKey: "ticketId",
      },
      {
        name: "title",
        title: t("Pages.QaDashboard.ticketTable.summary"),
        sortKey: "summary",
        tableItem: { render: (value: string | null) => value ?? "-" },
      },
      {
        name: "status",
        title: t("Pages.QaDashboard.ticketTable.status"),
        sortKey: "status",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => (
            <Pill value={value} classes={STATUS_CLASSES} />
          ),
        },
      },
      {
        name: "ownerDisplay",
        title: t("Pages.QaDashboard.ticketTable.assignee"),
        sortKey: "assignee",
      },
      {
        name: "acCoveragePercent",
        title: t("Pages.QaDashboard.ticketTable.acCoverage"),
        sortKey: "acCoverage",
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) => `${value}%`,
        },
      },
      {
        name: "testResultPercent",
        title: t("Pages.QaDashboard.ticketTable.testResult"),
        sortKey: "testResult",
        tableItem: {
          align: ETableAlign.center,
          render: (value: number) => `${value}%`,
        },
      },
      {
        name: "artifactVersion",
        title: t("Pages.QaDashboard.ticketTable.version", {
          defaultValue: "Version",
        }),
        tableItem: {
          align: ETableAlign.center,
          render: (value: number | null) => String(value ?? "-"),
        },
      },
      {
        name: "updatedAt",
        title: t("Pages.QaDashboard.ticketTable.updatedDate"),
        sortKey: "updatedDate",
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => formatDateTime(value),
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
          columns={columns}
          data={rows}
          sort={sort}
          onSortChange={onSortChange}
          isLoading={isLoading}
          isPagination
          pagination={{
            total: totalElements,
            page: page + 1,
            perPage,
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage === perPage) {
                onPageChange(nextPage - 1);
              } else {
                onPerPageChange(nextPerPage);
              }
            },
          }}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          action={{
            width: 110,
            fixed: "left",
            label: t("Components.Action"),
            name: (row: QaTicketRow) => row.externalTicketKey,
            render: (row: QaTicketRow) => (
              <CTooltip title={t("Pages.QaDashboard.ticketTable.viewDetail")}>
                <button
                  type="button"
                  title={t("Pages.QaDashboard.ticketTable.viewDetail")}
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
