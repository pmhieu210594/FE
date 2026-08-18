import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { endpoints } from "@/lib/api";

import { QaTicketSummaryCard } from "./components/QaTicketSummaryCard";
import { QaTicketStatsCards } from "./components/QaTicketStatsCards";
import { QaTicketAcceptanceCriteriaTable } from "./components/QaTicketAcceptanceCriteriaTable";
import type { QaAcTicketPage } from "./types";

const AC_INITIAL_PAGE_SIZE = 25;
const CSV_EXPORT_SIZE = 1000;
const ANIMATION_DURATION_MS = 200;

const EMPTY_AC_PAGE: QaAcTicketPage = {
  items: [],
  page: 0,
  size: AC_INITIAL_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  totalAcCount: 0,
  testedCount: 0,
  notTestedCount: 0,
  coveragePercent: 0,
  testResultPercent: 0,
};

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

interface QaTicketDetailModalProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

export function QaTicketDetailModal({
  ticketId,
  open,
  onClose,
}: Readonly<QaTicketDetailModalProps>) {
  const { t } = useTranslation("locale");

  const [acPage, setAcPage] = useState(0);
  const [acSize, setAcSize] = useState(AC_INITIAL_PAGE_SIZE);
  const [acSearch, setAcSearch] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timeout = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, ANIMATION_DURATION_MS);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const enabled = Boolean(ticketId) && open;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!shouldRender) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [shouldRender]);

  useEffect(() => {
    setAcPage(0);
    setAcSearch(undefined);
  }, [ticketId]);

  const detailQuery = useQuery({
    queryKey: ["qa-ticket-detail", ticketId],
    queryFn: () => endpoints.qaDashboard.ticketDetail(ticketId || ""),
    enabled,
  });

  const acQuery = useQuery({
    queryKey: ["qa-ticket-ac", ticketId, acPage, acSize, acSearch],
    queryFn: () =>
      endpoints.qaDashboard.ticketAcceptanceCriteria(ticketId || "", {
        page: acPage,
        size: acSize,
        search: acSearch,
      }),
    enabled,
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    if (!ticketId) return;
    setIsExporting(true);
    try {
      const page = await endpoints.qaDashboard.ticketAcceptanceCriteria(
        ticketId,
        { page: 0, size: CSV_EXPORT_SIZE, search: acSearch },
      );
      const header =
        "ac_id,acceptance_criteria,status,linked_test_case,test_result,owner\n";
      const body = page.items
        .map((row) =>
          [
            row.acId,
            row.acceptanceCriteria ?? "",
            row.status,
            row.linkedTestCase,
            row.testResult,
            row.owner,
          ]
            .map((value) => csvEscape(String(value)))
            .join(","),
        )
        .join("\n");
      const blob = new Blob([header + body], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ticket-${ticketId}-acceptance-criteria.csv`;
      anchor.click();
      globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsExporting(false);
    }
  };

  if (!shouldRender) return null;

  const acData = acQuery.data ?? EMPTY_AC_PAGE;

  return createPortal(
    <div
      role="button"
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/40 p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={() => {}}
    >
      <div
        className={`relative my-auto w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl transition-all duration-300 ease-out ${
          isClosing ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label={t("Pages.QaDashboard.ticketDetail.back")}
        >
          <X className="h-4 w-4" />
        </button>

        {detailQuery.isLoading && (
          <div className="p-10 text-sm text-slate-500">
            {t("Pages.QaDashboard.ticketDetail.loading")}
          </div>
        )}

        {!detailQuery.isLoading &&
          (detailQuery.isError || !detailQuery.data) && (
            <div className="space-y-4 p-4">
              <div className="text-sm text-rose-600">
                {t("Pages.QaDashboard.ticketDetail.notFound")}
              </div>
            </div>
          )}

        {!detailQuery.isLoading && detailQuery.data && (
          <div className="space-y-6">
            <QaTicketSummaryCard detail={detailQuery.data} />

            <QaTicketStatsCards acPage={acData} />

            <QaTicketAcceptanceCriteriaTable
              rows={acData.items}
              totalElements={acData.totalElements}
              page={acPage}
              perPage={acSize}
              searchValue={acSearch}
              onPageChange={setAcPage}
              onPerPageChange={(perPage) => {
                setAcSize(perPage);
                setAcPage(0);
              }}
              onSearchChange={(value) => {
                setAcSearch(value || undefined);
                setAcPage(0);
              }}
              onExport={handleExport}
              isExporting={isExporting}
              isLoading={acQuery.isFetching}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
