import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { buildSearchParams, parseFilters } from "../utils";
import type { DataOpsFilters } from "../types";

export function useDataOpsDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams.toString()],
  );

  const updateFilters = (next: Partial<DataOpsFilters>) => {
    const merged: DataOpsFilters = {
      ...parseFilters(searchParams),
      ...next,
    };
    setSearchParams(buildSearchParams(merged));
  };

  const clearFilters = () => setSearchParams({});

  return {
    filters,
    updateFilters,
    clearFilters,
    searchParams,
    setSearchParams,
  };
}
