import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  ApiError,
  clearAccessToken,
  endpoints,
  type AuthUser,
} from "@/lib/api";

const ME_QUERY_KEY = ["me"];

/**
 * Single source of truth for the current auth state.
 * A 401 means anonymous, not a hard error.
 */
export function useAuth() {
  const { data, isLoading, isError, error, refetch } = useQuery<
    AuthUser | null,
    Error
  >({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await endpoints.authMe();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    retry: false,
  });

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export async function logout() {
  try {
    await endpoints.authLogout();
  } catch {
    // Logout should still clear the local token even if the backend is unreachable.
  } finally {
    clearAccessToken();
    queryClient.setQueryData(ME_QUERY_KEY, null);
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    queryClient.removeQueries({ queryKey: ["dashboard-home"] });
    queryClient.removeQueries({ queryKey: ["dashboard-access"] });

    const lang = localStorage.getItem("i18nextLng") || "en";
    globalThis.location.hash = `#/${lang}/login`;
  }
}
