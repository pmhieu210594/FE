import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

/**
 * Centralized TanStack Query defaults so we don't repeat retry/error logic.
 * - Don't retry on 401 (let the auth redirect handle it).
 * - Stale time 30s — dashboards refresh on focus.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});
