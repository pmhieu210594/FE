import type { AuditLogFilters } from "./types";

export function parseFilters(searchParams: URLSearchParams): AuditLogFilters {
  return {
    module: searchParams.get("module") ?? "",
    operationType: searchParams.get("operationType") ?? "",
    actor: searchParams.get("actor") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    search: searchParams.get("search") ?? "",
  };
}

export function buildSearchParams(filters: AuditLogFilters) {
  const params = new URLSearchParams();
  if (filters.module) params.set("module", filters.module);
  if (filters.operationType) params.set("operationType", filters.operationType);
  if (filters.actor) params.set("actor", filters.actor);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.search) params.set("search", filters.search);
  return params;
}
