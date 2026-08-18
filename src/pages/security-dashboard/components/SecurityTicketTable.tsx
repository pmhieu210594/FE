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
import { statusBadgeClass, statusLabel } from "../utils";
import type { SecurityTicketRow } from "../types";

type SecurityTicketTableProps = Readonly<{
  rows: SecurityTicketRow[];
  totalElements: number;
  page: number;
  perPage: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  onSelectTicket: (ticketId: string) => void;
  isLoading?: boolean;
}>;

function StatusBadge({
  status,
}: Readonly<{ status: string | null | undefined }>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        statusBadgeClass(status),
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function SecurityTicketTable({
  rows,
  totalElements,
  page,
  perPage,
  searchValue,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onExport,
  isExporting,
  onSelectTicket,
  isLoading = false,
}: SecurityTicketTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "ticketKey",
        title: t("Pages.SecurityDashboard.table.ticket"),
      },
      {
        name: "repositoryName",
        title: t("Pages.SecurityDashboard.table.repository"),
        tableItem: {
          render: (value: string | null) => value ?? "—",
        },
      },
      {
        name: "safetyStatus",
        title: t("Pages.SecurityDashboard.table.safety"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => <StatusBadge status={value} />,
        },
      },
      {
        name: "secretScanStatus",
        title: t("Pages.SecurityDashboard.table.secretScan"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => <StatusBadge status={value} />,
        },
      },
      // {
      //   name: "sastStatus",
      //   title: t("Pages.SecurityDashboard.table.sast"),
      //   tableItem: {
      //     align: ETableAlign.center,
      //     render: (value: string | null) => <StatusBadge status={value} />,
      //   },
      // },
      {
        name: "scaStatus",
        title: t("Pages.SecurityDashboard.table.sca"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => <StatusBadge status={value} />,
        },
      },
      {
        name: "exceptionStatus",
        title: t("Pages.SecurityDashboard.table.exception"),
        tableItem: {
          align: ETableAlign.center,
          render: (value: string | null) => <StatusBadge status={value} />,
        },
      },
      {
        name: "artifactVersion",
        title: t("Pages.SecurityDashboard.table.version", {
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
        {t("Pages.SecurityDashboard.table.title")}
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
                {t("Pages.SecurityDashboard.export")}
              </Button>
            ) : undefined
          }
          columns={columns}
          data={rows}
          sort={{}}
          onSortChange={() => {}}
          isPagination
          pagination={{
            // `page` here is 0-indexed (matches the security-dashboard API);
            // CServerTable's pagination UI is 1-indexed, so convert at the boundary.
            total: totalElements,
            page: page + 1,
            perPage,
            onChange: ({ page: nextPage, perPage: nextPerPage }) => {
              if (nextPerPage !== perPage) {
                onPerPageChange(nextPerPage);
              } else {
                onPageChange(nextPage - 1);
              }
            },
          }}
          showSearch
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          isLoading={isLoading}
          action={{
            width: 130,
            fixed: "left",
            label: t("Components.Action"),
            name: (row: SecurityTicketRow) => row.ticketKey,
            render: (row: SecurityTicketRow) => (
              <CTooltip title={t("Pages.SecurityDashboard.drawer.title")}>
                <button
                  type="button"
                  title={t("Pages.SecurityDashboard.drawer.title")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTicket(row.ticketId);
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
