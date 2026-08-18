import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

type PrSignal = "CI Failed" | "Review Comment" | "Stale" | "Merge Conflict";

type PendingPrRow = Readonly<{
  prKey: string;
  signal: PrSignal;
  detail: string;
  evidence: "Attached" | "Missing";
}>;

type PendingPrTableProps = Readonly<{
  rows: readonly PendingPrRow[];
}>;

const prSignalClasses: Record<PrSignal, string> = {
  "CI Failed": "bg-rose-100 text-rose-700",
  "Review Comment": "bg-amber-100 text-amber-700",
  Stale: "bg-slate-100 text-slate-600",
  "Merge Conflict": "bg-rose-100 text-rose-700",
};

const evidenceClasses: Record<"Attached" | "Missing", string> = {
  Attached: "bg-emerald-100 text-emerald-700",
  Missing: "bg-rose-100 text-rose-700",
};

export function PendingPrTable({ rows }: PendingPrTableProps) {
  const { t } = useTranslation("locale");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {t("Pages.DevDashboard.pendingPrs.title")}
      </h2>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-4">
                {t("Pages.DevDashboard.pendingPrs.pr")}
              </th>
              <th className="py-2 pr-4">
                {t("Pages.DevDashboard.pendingPrs.signal")}
              </th>
              <th className="py-2 pr-4">
                {t("Pages.DevDashboard.pendingPrs.detail")}
              </th>
              <th className="py-2 pr-4">
                {t("Pages.DevDashboard.pendingPrs.evidence")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.prKey}
                className="border-t border-slate-100 text-slate-700 transition hover:bg-slate-50"
              >
                <td className="py-3 pr-4 font-semibold text-slate-900">
                  {row.prKey}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      prSignalClasses[row.signal],
                    )}
                  >
                    {row.signal}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-500">{row.detail}</td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      evidenceClasses[row.evidence],
                    )}
                  >
                    {row.evidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            {t("Pages.DevDashboard.emptyState")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
