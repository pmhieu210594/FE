import { Tooltip } from "antd";
import type { RenderFunction } from "antd/lib/_util/getRenderPropValue";
import type { TooltipPlacement } from "antd/lib/tooltip";
import React, { type PropsWithChildren } from "react";

/**
 * Tooltip component that wraps the provided children with a tooltip.
 *
 * @component
 * @example
 * ```tsx
 * <CTooltip title="Tooltip title" placement="top">
 *   <Button>Hover me</Button>
 * </CTooltip>
 * ```
 *
 * @param {React.ReactNode | RenderFunction} title - The content of the tooltip.
 * @param {TooltipPlacement} [placement] - The placement of the tooltip. Defaults to "top".
 *
 * @returns {React.ReactElement} The tooltip component.
 */
export const CTooltip = ({
  children,
  title,
  placement,
}: PropsWithChildren<{
  title: React.ReactNode | RenderFunction;
  placement?: TooltipPlacement;
}>) => {
  return (
    <Tooltip title={title} placement={placement} destroyOnHidden={true}>
      {children}
    </Tooltip>
  );
};
CTooltip.displayName = "Tooltip";
