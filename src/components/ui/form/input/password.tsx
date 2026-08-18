import { EIcon } from "@/enums";
import { useState } from "react";
import { CSvgIcon } from "../../svg-icon";

/**
 * Renders a password input component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.value - The current value of the input.
 * @param {string} props.placeholder - The placeholder text for the input.
 * @param {boolean} props.disabled - Determines if the input is disabled.
 * @param {Function} props.onChange - The callback function triggered when the input value changes.
 * @returns {JSX.Element} The rendered password input component.
 */
const Component = ({
  value = "",
  placeholder,
  disabled,
  onChange,
  onBlur,
  id,
  testId,
}: {
  value?: string;
  placeholder: string;
  disabled?: boolean;
  onChange?: (e: any) => any;
  onBlur?: (e: any) => any;
  id?: string;
  testId?: string;
}) => {
  /**
   * Toggles the visibility of the password input.
   */
  const [toggle, setToggle] = useState(true);

  return (
    <div className="relative">
      <input
        autoComplete="on"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        type={toggle ? "password" : "text"}
        className="ant-input pr-9"
        onChange={onChange}
        onBlur={onBlur}
        id={id}
        data-testid={testId}
      />
      <CSvgIcon
        name={toggle ? EIcon.eyeSlash : EIcon.eye}
        onClick={() => setToggle(!toggle)}
        className="icon"
      />
    </div>
  );
};
export default Component;
