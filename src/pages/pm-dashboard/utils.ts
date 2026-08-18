import type { PmDashboardTicketRow } from "@/lib/api";
import type { EvidenceBottleneckBucket, DashboardFilters } from "./types";

/** Score-band -> badge tone, used both on summary cards and table rows. */
export const scoreBandClasses: Record<string, string> = {
  EXCELLENT: "border-emerald-200 bg-emerald-50 text-emerald-800",
  GOOD: "border-sky-200 bg-sky-50 text-sky-800",
  WARNING: "border-amber-200 bg-amber-50 text-amber-800",
  RISKY: "border-orange-200 bg-orange-50 text-orange-800",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-800",
};

/** Risk-level -> badge tone. */
export const riskClasses: Record<string, string> = {
  LOW: "border-sky-200 bg-sky-50 text-sky-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-orange-200 bg-orange-50 text-orange-800",
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-800",
  INFO: "border-slate-200 bg-slate-50 text-slate-700",
};

/** Reads dashboard filters out of the URL search params, with sane defaults. */
export function parseFilters(searchParams: URLSearchParams): DashboardFilters {
  return {
    projectId: searchParams.get("projectId") ?? "",
    repositoryId: searchParams.get("repositoryId") ?? "",
    scoreBand: searchParams.get("scoreBand") ?? "",
    riskLevel: searchParams.get("riskLevel") ?? "",
    search: searchParams.get("search") ?? "",
    page: Math.max(Number(searchParams.get("page") ?? "1") || 1, 1),
    size: (() => {
      const raw = searchParams.get("size");
      if (raw === null) return 25;
      const n = Number(raw);
      return Math.min(Math.max(Number.isNaN(n) ? 25 : n, 1), 100);
    })(),
  };
}

/** Serializes dashboard filters back into URL search params (omits defaults). */
export function buildSearchParams(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.repositoryId) params.set("repositoryId", filters.repositoryId);
  if (filters.scoreBand) params.set("scoreBand", filters.scoreBand);
  if (filters.riskLevel) params.set("riskLevel", filters.riskLevel);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.size !== 20) params.set("size", String(filters.size));
  return params;
}

/** Formats an "age" in days for the dashboard tables (e.g. "4d"). */
export function ageLabel(ageDays: number) {
  if (ageDays <= 0) return "0d";
  return `${ageDays}d`;
}

export function scoreBandLabel(scoreBand: string | null) {
  return scoreBand ?? "-";
}

/**
 * Builds the "PM Attention Items" list: tickets that are either blocked or
 * waiting on review, oldest first, capped to a short list for the dashboard
 * surface (full list still lives in the detail table / drawer).
 */
export function formatScore(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Groups tickets by repository and sums the missing evidence counts. This
 * keeps the dashboard centered on traceability-style evidence gaps instead of
 * phase state.
 */
export function buildEvidenceBottleneck(
  rows: PmDashboardTicketRow[],
  limit = 6,
): EvidenceBottleneckBucket[] {
  const buckets = new Map<
    string,
    EvidenceBottleneckBucket & { order: number }
  >();

  for (const row of rows) {
    if (row.missingEvidenceCount <= 0) continue;
    const bucketKey = row.repositoryId || row.projectId;
    const existing = buckets.get(bucketKey);
    if (existing) {
      existing.missingEvidenceCount += row.missingEvidenceCount;
      existing.order = Math.max(existing.order, row.ageDays);
    } else {
      buckets.set(bucketKey, {
        bucketKey,
        bucketName: row.repositoryName ?? row.projectAlias ?? bucketKey,
        missingEvidenceCount: row.missingEvidenceCount,
        order: row.ageDays,
      });
    }
  }

  return Array.from(buckets.values())
    .sort(
      (a, b) =>
        b.missingEvidenceCount - a.missingEvidenceCount || b.order - a.order,
    )
    .slice(0, limit)
    .map(({ order: _order, ...bucket }) => bucket);
}
