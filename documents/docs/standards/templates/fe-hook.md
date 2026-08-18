# Template: Frontend Custom Hook

Location: `EDCAP_FE/src/hooks/use<Name>.ts`

## Data-Fetching Hook (TanStack Query)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { IResponses } from "@/interfaces";
import type { <Entity> } from "@/interfaces/<entity>";

// Query keys as const — prevents typos and enables targeted invalidation
export const <ENTITY>_KEYS = {
  all:    () => ["<entity>"] as const,
  list:   (filters?: Record<string, unknown>) => ["<entity>", "list", filters] as const,
  detail: (id: number) => ["<entity>", "detail", id] as const,
};

// Fetch list
export function use<Entity>List(filters?: Record<string, unknown>) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: <ENTITY>_KEYS.list(filters),
    queryFn: () => api.get<IResponses<<Entity>[]>>("/api/v1/<entities>"),
  });
  return {
    items:     data?.data ?? [],
    total:     data?.meta?.total ?? 0,
    isLoading,
    isError,
    error,
  };
}

// Fetch single
export function use<Entity>(id: number) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: <ENTITY>_KEYS.detail(id),
    queryFn: () => api.get<IResponses<<Entity>>>(`/api/v1/<entities>/${id}`),
    enabled:  id > 0,
  });
  return { item: data?.data ?? null, isLoading, isError, error };
}

// Mutation (create / update / delete)
export function useCreate<Entity>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Create<Entity>Payload) =>
      api.post<IResponses<<Entity>>>("/api/v1/<entities>", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: <ENTITY>_KEYS.all() });
    },
  });
}
```

## UI State Hook (Zustand)

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface <Name>State {
  isOpen: boolean;
  activeId: number | null;
  open:  (id: number) => void;
  close: () => void;
}

export const use<Name>Store = create<<Name>State>()(
  persist(
    (set) => ({
      isOpen:   false,
      activeId: null,
      open:  (id) => set({ isOpen: true, activeId: id }),
      close: ()   => set({ isOpen: false, activeId: null }),
    }),
    {
      name:    "sdd-<name>-state",
      storage: createJSONStorage(() => localStorage),
      version: 1,   // increment when state shape changes
    },
  ),
);
```

## Checklist

- [ ] File: `src/hooks/use<Name>.ts`
- [ ] Return object with named properties (never a bare tuple)
- [ ] Query keys defined as `const` arrays for type safety
- [ ] `enabled: !!param` guard when query depends on a param
- [ ] Mutations call `invalidateQueries` on success
- [ ] Zustand stores: increment `version` when shape changes
- [ ] Add test: `src/hooks/__tests__/use<Name>.test.ts`
