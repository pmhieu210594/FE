export const badgeClassByStatus: Record<string, string> = {
  READY: "bg-emerald-100 text-emerald-700",
  PASS: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-emerald-100 text-emerald-700",
  WARNING: "bg-amber-100 text-amber-700",
  FAIL: "bg-rose-100 text-rose-700",
  OPEN: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-rose-100 text-rose-700",
  MISSING: "bg-slate-100 text-slate-600",
  NONE: "bg-slate-100 text-slate-600",
  NOT_CONFIGURED: "bg-slate-100 text-slate-600",
};

export function statusBadgeClass(status: string | null | undefined) {
  if (!status) return badgeClassByStatus.MISSING;
  return badgeClassByStatus[status] ?? "bg-slate-100 text-slate-600";
}

export function statusLabel(status: string | null | undefined) {
  return status ?? "—";
}
