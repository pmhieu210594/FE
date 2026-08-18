import { Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  CServerTable,
  type IServerTableColumn,
} from "@/components/ui/server-table";
import { ETableAlign } from "@/enums";
import { cn } from "@/lib/utils";
import { acTicketStatusClasses, acTicketStatusLabel } from "../utils";
import type { AcTicketStatus, QaAcTicketRow } from "../types";

type QaTicketAcceptanceCriteriaTableProps = Readonly<{
  rows: QaAcTicketRow[];
  totalElements: number;
  page: number;
  perPage: number;
  searchValue?: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange?: (value?: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}>;

/** Section 3: Acceptance Criteria table for a single ticket, with search + CSV export. */
export function QaTicketAcceptanceCriteriaTable({
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
  isLoading = false,
}: QaTicketAcceptanceCriteriaTableProps) {
  const { t } = useTranslation("locale");

  const columns = useMemo<IServerTableColumn[]>(
    () => [
      {
        name: "acId",
        title: t("Pages.QaDashboard.ticketDetail.acTable.acId"),
        tableItem: {
          width: 220,
        },
      },
      {
        name: "acceptanceCriteria",
        title: t("Pages.QaDashboard.ticketDetail.acTable.acceptanceCriteria"),
        tableItem: { render: (value: string | null) => value ?? "-" },
      },
      {
        name: "status",
        title: t("Pages.QaDashboard.ticketDetail.acTable.status"),
        tableItem: {
          align: ETableAlign.center,
          width: 120,
          render: (value: AcTicketStatus) => (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                acTicketStatusClasses[value],
              )}
            >
              {acTicketStatusLabel[value]}
            </span>
          ),
        },
      },
      {
        name: "testResult",
        title: t("Pages.QaDashboard.ticketDetail.acTable.testResult"),
        tableItem: { align: ETableAlign.center, width: 120 },
      },
      {
        name: "owner",
        title: t("Pages.QaDashboard.ticketDetail.acTable.owner"),
        tableItem: { width: 150 },
      },
    ],
    [t],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {t("Pages.QaDashboard.ticketDetail.acTable.title")}
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
                {t("Pages.QaDashboard.ticketDetail.acTable.export")}
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
        />
      </div>
    </div>
  );
}
