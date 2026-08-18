import { cn } from "@/lib/utils";

export type DashboardAccentTone =
  | "blue"
  | "red"
  | "orange"
  | "green"
  | "purple";

const ACCENT_BAR_CLASS: Record<DashboardAccentTone, string> = {
  blue: "bg-blue-500",
  red: "bg-rose-500",
  orange: "bg-amber-500",
  green: "bg-emerald-500",
  purple: "bg-violet-500",
};

type SummaryCardProps = {
  title: string;
  description: string;
  value: string | number;
  tone: DashboardAccentTone;
};

/**
 * A single KPI card with a thin accent bar on top (color signals severity),
 * a bold metric, and a short description line. Shared by every Chapter 9
 * dashboard's summary grid.
 *
 * Note: the metric uses `!text-4xl` (force-important) because a global rule
 * in index.css (`body * { font-size: inherit !important; }`) otherwise
 * overrides every Tailwind text-size utility app-wide.
 */
export function SummaryCard({
  title,
  description,
  value,
  tone,
}: SummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={cn("h-1.5 w-full", ACCENT_BAR_CLASS[tone])} />
      <div className="space-y-2 p-5">
        <div className="text-sm font-medium text-slate-500">{title}</div>
        <div className="!text-4xl font-black tracking-tight tabular-nums text-slate-950">
          {value}
        </div>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
