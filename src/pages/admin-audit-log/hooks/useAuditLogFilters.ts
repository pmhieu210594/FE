import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { buildSearchParams, parseFilters } from "../utils";
import type { AuditLogFilters } from "../types";

export function useAuditLogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams.toString()],
  );

  const updateFilters = (next: Partial<AuditLogFilters>) => {
    const merged: AuditLogFilters = {
      ...parseFilters(searchParams),
      ...next,
    };
    setSearchParams(buildSearchParams(merged));
  };

  const clearFilters = () => setSearchParams({});

  return { filters, updateFilters, clearFilters };
}
