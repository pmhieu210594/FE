import type { CSSProperties } from "react";

import type { EIcon } from "@/enums";

/**
 * Renders an SVG icon.
 *
 * @param name - The name of the icon.
 * @param size - The size of the icon (optional).
 * @param className - The CSS class name for the icon (optional).
 * @param onClick - The click event handler for the icon (optional).
 * @returns The rendered SVG icon.
 */
export const CSvgIcon = ({
  name,
  size,
  className,
  style,
  ...props
}: {
  name: EIcon;
  size?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: any;
}) => {
  return (
    <svg
      className={["c-svg-icon", className].filter(Boolean).join(" ")}
      style={{ ...(size ? { width: size, height: size } : {}), ...style }}
      {...props}
    >
      <use href={`/assets/images/sprite.svg#icon_${name}`} />
    </svg>
  );
};
