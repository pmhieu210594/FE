import type { DataOpsFilters } from "./types";

export function parseFilters(searchParams: URLSearchParams): DataOpsFilters {
  return {
    projectId: searchParams.get("projectId") ?? "",
    repositoryId: searchParams.get("repositoryId") ?? "",
    connectorName: searchParams.get("connectorName") ?? "",
    parserStatus: searchParams.get("parserStatus") ?? "",
    search: searchParams.get("search") ?? "",
  };
}

export function buildSearchParams(filters: DataOpsFilters) {
  const params = new URLSearchParams();
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.repositoryId) params.set("repositoryId", filters.repositoryId);
  if (filters.connectorName) params.set("connectorName", filters.connectorName);
  if (filters.parserStatus) params.set("parserStatus", filters.parserStatus);
  if (filters.search) params.set("search", filters.search);
  return params;
}
