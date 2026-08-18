import classNames from "classnames";
import React, { type MouseEventHandler } from "react";

import { Spin } from "antd";

/**
 * CButton component represents a custom button.
 *
 * @component
 */
export const CButton = ({
  text = "",
  icon,
  title,
  className,
  disabled,
  isLoading = false,
  isTiny = false,
  ...props
}: Type) => {
  className = classNames("btn", className, {
    "h-8 px-3": !isTiny,
    "h-6 px-2": isTiny,
  });
  const renderLoading = () => (isLoading ? <Spin size="small" /> : icon);
  return (
    <button
      type="button"
      disabled={disabled}
      title={title ?? text ?? ""}
      className={className}
      {...props}
    >
      {renderLoading()}
      {text ? <span>{text}</span> : null}
    </button>
  );
};

/**
 * Represents the properties for the button component.
 *
 * @property {any} text - The text content of the button.
 * @property {boolean} isTiny - Determines if the button should be rendered as a tiny button.
 * @property {React.ReactNode} icon - The icon to be displayed within the button.
 * @property {string} title - The title attribute of the button.
 * @property {string} className - The CSS class name for the button.
 * @property {boolean} disabled - Determines if the button is disabled.
 * @property {boolean} isLoading - Determines if the button is in a loading state.
 * @property {MouseEventHandler<HTMLButtonElement>} onClick - The event handler for the button's click event.
 * @property {(event: any) => Promise<void>} onPaste - The event handler for the button's paste event.
 * @property {string} id - The id attribute of the button.
 * @property {'button' | 'submit' | 'reset'} type - The type attribute of the button.
 */
interface Type {
  text?: any;
  isTiny?: boolean;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPaste?: (event: any) => Promise<void>;
  id?: string;
  "data-testid"?: string;
  "aria-pressed"?: boolean;
  type?: "button" | "submit" | "reset";
}
