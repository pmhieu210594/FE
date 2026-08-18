import * as React from "react";
import { ColorPicker as AntdColorPicker } from "antd";

import { cn } from "@/lib/utils";

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export interface ColorPickerProps {
  value: string;
  onChange: (nextHex: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, disabled, className }, ref) => {
    const isValid = HEX_PATTERN.test(value.trim());

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        <AntdColorPicker
          value={isValid ? value : "#10B981"}
          disabled={disabled}
          onChangeComplete={(color) =>
            onChange(`#${color.toHex().toUpperCase()}`)
          }
        />
        <input
          type="text"
          maxLength={20}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "w-24 rounded-md border px-2 py-1 text-xs font-mono",
            isValid ? "border-slate-200" : "border-rose-400 text-rose-600",
          )}
          placeholder="#RRGGBB"
        />
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";
