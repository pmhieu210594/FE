import { Drawer } from "antd";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { statusBadgeClass, statusLabel } from "../utils";
import type { SecurityTicketDetail } from "../types";

type SecurityTicketDetailDrawerProps = Readonly<{
  ticketId: string;
  detail: SecurityTicketDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onClose: () => void;
}>;

/** Read-only drawer with the security evidence breakdown for a single ticket. */
export function SecurityTicketDetailDrawer({
  ticketId,
  detail,
  isLoading,
  isError,
  error,
  onClose,
}: SecurityTicketDetailDrawerProps) {
  const { t } = useTranslation("locale");

  const errorDetail =
    error instanceof ApiError
      ? t(error.message, { defaultValue: error.message })
      : error instanceof Error
        ? error.message
        : undefined;

  const invalidChecklistSections =
    detail?.checklistSections.filter(
      (section) => section.validFlag === false,
    ) ?? [];

  return (
    <Drawer
      open={Boolean(ticketId)}
      onClose={onClose}
      size={640}
      styles={{ body: { padding: 0, overflowX: "hidden", overflowY: "auto" } }}
      title={
        detail ? detail.ticketKey : t("Pages.SecurityDashboard.drawer.title")
      }
      destroyOnHidden
    >
      {isLoading ? (
        <div className="p-6 text-sm text-slate-500">
          {t("Pages.SecurityDashboard.loadingDetail")}
        </div>
      ) : isError ? (
        <div className="space-y-1 p-6 text-sm text-rose-600">
          <div>{t("Pages.SecurityDashboard.detailFailed")}</div>
          {errorDetail ? (
            <div className="text-xs text-rose-500">{errorDetail}</div>
          ) : null}
        </div>
      ) : detail ? (
        <div className="space-y-6 px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-slate-950">
              {t("Pages.SecurityDashboard.drawer.scansTitle")}
            </h3>
            {detail.scans.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                {t("Pages.SecurityDashboard.none")}
              </div>
            ) : (
              <div className="space-y-2">
                {detail.scans
                  .filter((scan) => scan.scannerType !== "SAST")
                  .map((scan) => (
                    <div
                      key={scan.scannerType}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-950">
                          {scan.scannerType}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            statusBadgeClass(scan.scanStatus),
                          )}
                        >
                          {statusLabel(scan.scanStatus)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {scan.severity ?? "—"} | {scan.unresolvedCount}/
                        {scan.findingCount} unresolved
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-slate-950">
              {t("Pages.SecurityDashboard.drawer.checklistTitle")}
            </h3>
            {invalidChecklistSections.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                {t("Pages.SecurityDashboard.drawer.checklistAllValid")}
              </div>
            ) : (
              <div className="space-y-2">
                {invalidChecklistSections.map((section) => (
                  <div
                    key={section.sectionType}
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{section.sectionType}</span>
                      <Badge variant="destructive">INVALID</Badge>
                    </div>
                    {section.parseWarning ? (
                      <div className="mt-1 text-xs text-rose-600">
                        {section.parseWarning}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-slate-950">
              {t("Pages.SecurityDashboard.drawer.exceptionsTitle")}
            </h3>
            {detail.exceptions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
                {t("Pages.SecurityDashboard.none")}
              </div>
            ) : (
              <div className="space-y-2">
                {detail.exceptions.map((exception, index) => (
                  <div
                    key={`${exception.exceptionType}-${index}`}
                    className="rounded-xl border border-slate-200 p-3 text-sm"
                  >
                    <div className="font-medium text-slate-950">
                      {exception.exceptionType}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {exception.followUpStatus ?? "—"} |{" "}
                      {exception.approved ? "APPROVED" : "NOT APPROVED"}
                      {exception.expiryDate
                        ? ` | expires ${exception.expiryDate}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
