# Template: Frontend React Component

Location: `EDCAP_FE/src/components/<category>/<ComponentName>/index.tsx`

```typescript
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// 1. Define variants with CVA
const <componentName>Variants = cva(
  // base classes
  "base-tailwind-classes here",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes",
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

// 2. Extend HTML element props + variant props
export interface <ComponentName>Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof <componentName>Variants> {
  // add component-specific props here
}

// 3. forwardRef + displayName
export const <ComponentName> = forwardRef<HTMLDivElement, <ComponentName>Props>(
  ({ className, variant, size, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(<componentName>Variants({ variant, size, className }))}
      {...props}
    >
      {children}
    </div>
  ),
);
<ComponentName>.displayName = "<ComponentName>";
```

## For Simple Components (no variants)

```typescript
import { cn } from "@/lib/utils";

export interface <ComponentName>Props extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  isActive?: boolean;
}

export function <ComponentName>({ label, isActive = false, className, ...props }: <ComponentName>Props) {
  return (
    <div
      className={cn("base-class", isActive && "active-class", className)}
      {...props}
    >
      {label}
    </div>
  );
}
```

## Checklist

- [ ] Named export (no `export default`)
- [ ] Props interface extends appropriate HTML element props
- [ ] `forwardRef` + `displayName` for reusable UI primitives
- [ ] CVA for multi-variant components; skip for single-look components
- [ ] `cn()` for all class merging
- [ ] File: `src/components/<category>/<ComponentName>/index.tsx`
- [ ] Add test: `src/components/<category>/<ComponentName>/<ComponentName>.test.tsx`
