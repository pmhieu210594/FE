import type { ReactNode } from "react";

type DashboardFilterPillProps = {
  label: string;
  children: ReactNode;
};

/**
 * A single labeled filter "pill" (PROJECT / SPRINT / REPOSITORY / ...),
 * shared across every Chapter 9 dashboard so the filter row always looks
 * the same regardless of which fields a given dashboard exposes.
 */
export function DashboardFilterPill({
  label,
  children,
}: Readonly<DashboardFilterPillProps>) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </div>
  );
}

export const dashboardPillSelectClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-400";
