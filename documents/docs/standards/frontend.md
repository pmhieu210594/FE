# Frontend Standards (TypeScript / React)

> Cross-cutting conventions are in [coding.md](coding.md).
> Error handling details are in [error-handling.md](error-handling.md).
> API contract is in [api-contract.md](api-contract.md).

---

## Component Pattern (Confirmed)

All reusable UI components use `forwardRef` + `displayName`:

```typescript
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground", outline: "border border-input" },
      size: { default: "h-9 px-4", sm: "h-8 px-3", lg: "h-10 px-6" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = "Button";
```

Rules:
- Named exports only — no `export default`
- `cn()` from `@/lib/utils` for all class merging (wraps `clsx` + `tailwind-merge`)
- `asChild` + Radix `<Slot>` for polymorphic rendering
- CVA for components with 2+ visual variants

---

## UI Library Policy (Confirmed — PJ2 resolved 2026-06-08)

| Library | Usage rule |
|---------|-----------|
| Radix UI primitives | Default for all new interactive components (Dialog, Dropdown, Select, etc.) |
| Tailwind CSS | All styling — no inline styles, no CSS modules |
| Ant Design | Existing usages only; do not introduce new `<Table>`, `<Form>`, etc. |

Migration path: when a Radix-based equivalent is ready, replace the Ant Design usage in that feature.

---

## Custom Hooks (Confirmed)

Hooks return objects with named properties — never bare tuples:

```typescript
export function useTickets(projectId: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tickets", projectId],
    queryFn: () => api.get<IResponses<Ticket[]>>(`/api/v1/tickets?projectId=${projectId}`),
    enabled: !!projectId,
  });
  return { tickets: data?.data ?? [], isLoading, isError, error };
}
```

---

## API Layer (Confirmed)

All HTTP requests go through `lib/api.ts`. Never call `fetch` directly in components or hooks.

```typescript
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(message: string, public status: number, public traceId?: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? res.statusText, res.status, body.traceId);
  }
  return res.json();
}

export const api = {
  get:    <T>(path: string)               => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: "DELETE" }),
};
```

`credentials: "include"` is mandatory — Spring Security uses a session cookie.

---

## State Management (Confirmed)

| Tool | Use for | Do not use for |
|------|---------|----------------|
| TanStack Query | Fetching, caching, mutating server data | Persistent UI state |
| Redux Toolkit | Global server-synced state (user, language, active project) | Per-component local state |
| Zustand | UI preferences (sidebar, modal) persisted to localStorage | Server data |
| `useState` | Component-local ephemeral state | Cross-component shared state |

---

## i18n (Confirmed)

Translation files live at `public/locales/{lang}/locale.json` (e.g., `en/locale.json`, `vi/locale.json`).

Key naming pattern:

```json
{
  "Pages": {
    "Admin": {
      "Title": "Administration",
      "UserList": "User List"
    },
    "Dashboard": {
      "Welcome": "Welcome, {{name}}"
    }
  }
}
```

Usage in components:

```typescript
const { t } = useTranslation("locale");

// Static key
<h1>{t("Pages.Admin.Title")}</h1>

// Interpolated
<p>{t("Pages.Dashboard.Welcome", { name: user.name })}</p>
```

Rules:
- All user-visible strings must be behind a `t()` call — no hardcoded English
- Key hierarchy: `Pages.{Feature}.{Key}` for page-level strings; flat keys for reused UI labels
- Use `{{variable}}` for runtime values in translation strings
- Never split a sentence across multiple keys (translation context is lost)

---

## Page Composition (Confirmed)

Every page component that loads data must handle three states: loading, empty, and error.

```typescript
export function TicketListPage() {
  const { projectId } = useParams();
  const { tickets, isLoading, isError, error } = useTickets(projectId!);

  if (isLoading) return <Skeleton />;
  if (isError)   return <ErrorMessage message={error.message} />;
  if (!tickets.length) return <EmptyState />;

  return (
    <ul>
      {tickets.map(t => <TicketRow key={t.id} ticket={t} />)}
    </ul>
  );
}
```

For mutations, use `useMutation` with `onError` to display errors inline:

```typescript
const createTicket = useMutation({
  mutationFn: (cmd: CreateTicketCommand) =>
    api.post("/api/v1/tickets", cmd),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  onError: (err: ApiError) => toast.error(err.message),
});
```

---

## Error Display (Confirmed)

- `401` responses: `useAuth` returns `null` — do not throw, do not retry
- Component-level errors: read `query.isError` / `mutation.isError`; display `error.message`
- `traceId` is available on `ApiError` — surface it in a dev/support UI if needed

---

## TypeScript Conventions (Confirmed)

- Strict mode: `strict: true`, `noUnusedLocals`, `noUnusedParameters` (see `tsconfig.json`)
- Path alias: `@/` → `src/` — use it everywhere; avoid `../../../` chains
- API response wrapper: `IResponses<T>` from `src/interfaces/`
- Enums in `src/enums.ts` (e.g., `EFormType`, `ETableFilterType`)
- `no-explicit-any` is **on** globally — see PJ5 for approved override files
- Overrides: `src/components/ui/form/**` and `src/interfaces/**` (dynamic form builder + generic wrappers)
- Anywhere else: `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason: <why>`
- Prefer `interface` over `type` for object shapes; `type` for unions and aliases

---

## URL Search Param Parsing (Confirmed — PM-DASHBOARD 2026-06-26)

When parsing numeric URL query params (page, size, limit, count, etc.) use an explicit `null` guard before coercion. **Never use the `|| default` idiom** — `Number("0") || 20` evaluates to `20` because `0` is falsy, silently ignoring a valid value.

```typescript
// Wrong — treats "0" as absent
const size = Number(searchParams.get("size") ?? "20") || 20;

// Correct — explicit null check before coercion
const size = (() => {
  const raw = searchParams.get("size");
  if (raw === null) return 20;                          // absent → default
  const n = Number(raw);
  return Math.min(Math.max(Number.isNaN(n) ? 20 : n, 1), 100);
})();
```

**Canonical helpers:** `parseFilters` and `buildSearchParams` in `src/pages/pm-dashboard/utils.ts` are the reference implementation for paginated filter pages. Reuse or adapt this pattern for any new page with `page`/`size`/`search` URL params.

---

## Candidate Rules (pending HD5)

> **HD5:** Add global React `<ErrorBoundary>` at the app root?

- **[Candidate]** `<ErrorBoundary>` wraps the entire app router — catches unhandled render errors
- **[Candidate]** Sentry or equivalent error monitoring hooked into the error boundary
- **[Candidate]** `react-i18next` language detection via `navigator.language` on first visit

→ See [api-contract.md](api-contract.md) for URL shape and pagination params.
→ See [error-handling.md](error-handling.md) for `ApiError` class and 401 handling.
