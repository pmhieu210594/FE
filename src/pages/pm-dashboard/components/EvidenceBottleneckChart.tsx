import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { EvidenceBottleneckBucket } from "../types";

type EvidenceBottleneckChartProps = {
  buckets: EvidenceBottleneckBucket[];
};

function toneForCount(count: number, maxCount: number): string {
  if (maxCount <= 0 || count <= 0) return "bg-slate-200";
  const ratio = count / maxCount;
  if (ratio >= 0.85) return "bg-gradient-to-t from-rose-600 to-rose-400";
  if (ratio >= 0.5) return "bg-gradient-to-t from-amber-600 to-amber-400";
  return "bg-gradient-to-t from-blue-600 to-blue-400";
}

const CHART_HEIGHT_PX = 180;

/**
 * Missing-evidence bottleneck chart: sums missing evidence counts per
 * repository so the dashboard stays aligned with traceability-style coverage
 * rather than phase state.
 */
export function EvidenceBottleneckChart({
  buckets,
}: Readonly<EvidenceBottleneckChartProps>) {
  const { t } = useTranslation("locale");
  const maxCount = Math.max(
    ...buckets.map((bucket) => bucket.missingEvidenceCount),
    1,
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {t("Pages.PmDashboard.missingEvidenceBottleneck", {
          defaultValue: "Missing evidence bottleneck",
        })}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {t("Pages.PmDashboard.missingEvidenceBottleneckDescription", {
          defaultValue:
            "Tickets grouped by repository using missing evidence counts.",
        })}
      </p>

      {buckets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          {t("Pages.PmDashboard.emptyState")}
        </div>
      ) : (
        <div
          className="mt-6 flex flex-1 items-end justify-around gap-4"
          style={{ minHeight: CHART_HEIGHT_PX }}
        >
          {buckets.map((bucket) => {
            const heightPercent = Math.max(
              (bucket.missingEvidenceCount / maxCount) * 100,
              6,
            );
            return (
              <div
                key={bucket.bucketKey}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-sm font-bold text-slate-900">
                  {bucket.missingEvidenceCount}
                </span>
                <div
                  className="flex w-full max-w-[64px] items-end justify-center"
                  style={{ height: CHART_HEIGHT_PX }}
                >
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      toneForCount(bucket.missingEvidenceCount, maxCount),
                    )}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-center text-xs font-medium text-slate-500">
                  {bucket.bucketName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
