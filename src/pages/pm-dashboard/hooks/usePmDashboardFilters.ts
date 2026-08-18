import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { buildSearchParams, parseFilters } from "../utils";
import type { DashboardFilters } from "../types";

/**
 * Centralizes all URL-driven dashboard state: the parsed filters and the
 * mutators that keep the URL in sync so filters survive refresh and are
 * shareable via link.
 */
export function usePmDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parseFilters(searchParams),
    [searchParams.toString()],
  );

  const updateFilters = (
    next: Partial<DashboardFilters>,
    resetPage = false,
  ) => {
    const merged: DashboardFilters = {
      ...filters,
      ...next,
      page: resetPage ? 1 : (next.page ?? filters.page),
    };
    setSearchParams(buildSearchParams(merged));
  };

  const clearFilters = () => setSearchParams({});

  const gotoPage = (page: number) => updateFilters({ page }, false);

  const gotoPageWithSize = (page: number, size: number) =>
    updateFilters({ page, size }, false);

  return {
    filters,
    updateFilters,
    clearFilters,
    gotoPage,
    gotoPageWithSize,
    searchParams,
    setSearchParams,
  };
}
