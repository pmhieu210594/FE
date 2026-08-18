import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { QaTicketDetail } from "../types";

function statusVariant(status: string | null) {
  const normalized = status?.trim().toUpperCase();
  if (normalized === "CLOSED" || normalized === "MERGED")
    return "success" as const;
  if (normalized === "IN_PROGRESS") return "warning" as const;
  return "secondary" as const;
}

/** Section 1: Ticket Summary — key/value pairs plus status/priority badges. */
export function QaTicketSummaryCard({
  detail,
}: Readonly<{ detail: QaTicketDetail }>) {
  const { t } = useTranslation("locale");
  const { row } = detail;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="!text-[22px]">
            {row.externalTicketKey}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">{row.title ?? "-"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.latestCiRunUrl ? (
            <div className="flex flex-wrap items-center gap-2 break-words">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs"
              >
                <a
                  href={detail.latestCiRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("Pages.QaDashboard.ticketDetail.viewCiRun", {
                    defaultValue: "View CI Run",
                  })}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ) : null}
          <Badge variant={statusVariant(row.status)}>{row.status ?? "-"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm md:grid-cols-2">
        <div className="space-y-2 break-words">
          <div className="break-words">
            <span className="font-medium text-slate-700">
              {t("Pages.QaDashboard.ticketDetail.description")}:
            </span>{" "}
            {detail.description ?? "-"}
          </div>
          <div className="break-words">
            <span className="font-medium text-slate-700">
              {t("Pages.QaDashboard.ticketDetail.assignee")}:
            </span>{" "}
            {row.ownerDisplay}
          </div>
        </div>
        <div className="space-y-2 break-words">
          <div className="break-words">
            <span className="font-medium text-slate-700">
              {t("Pages.QaDashboard.ticketDetail.createdDate")}:
            </span>{" "}
            {formatDateTime(row.createdAt)}
          </div>
          <div className="break-words">
            <span className="font-medium text-slate-700">
              {t("Pages.QaDashboard.ticketDetail.updatedDate")}:
            </span>{" "}
            {formatDateTime(row.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
