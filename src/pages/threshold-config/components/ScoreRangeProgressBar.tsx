import * as React from "react";

import { cn } from "@/lib/utils";
import { toProgressSegments } from "../utils";
import type { EditableThresholdRow } from "../types";

export interface ScoreRangeProgressBarProps {
  rows: EditableThresholdRow[];
  className?: string;
}

/**
 * Realtime 0-100 coverage bar (AC-THRESHOLD-CONFIG-13) — pure UI state derived from
 * the in-progress edit rows, no side effects or API calls.
 */
export const ScoreRangeProgressBar = React.forwardRef<
  HTMLDivElement,
  ScoreRangeProgressBarProps
>(({ rows, className }, ref) => {
  const segments = toProgressSegments(rows);

  return (
    <div ref={ref} className={cn("space-y-1", className)}>
      <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {segments.map((segment) => {
          const widthPercent = Math.max(
            0,
            segment.maxScore - segment.minScore + 1,
          );
          return (
            <div
              key={segment.rowKey}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.minScore}-${segment.maxScore}`}
              className="h-full"
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
});
ScoreRangeProgressBar.displayName = "ScoreRangeProgressBar";
