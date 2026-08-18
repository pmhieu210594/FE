import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { EIcon } from "@/enums";
import { uuidv4 } from "@/utils";
import { CIMask } from "../form/input";
import { CSvgIcon } from "../svg-icon";
import "./index.less";

/**
 * Component for rendering a search input in a data table.
 *
 * @component
 * @example
 * ```tsx
 * <CSearch
 *   value={value}
 *   onTableChange={handleTableChange}
 * />
 * ```
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The pagination query parameters.
 * @param {TFunction} props.t - The translation function.
 * @param {Function} props.handleTableChange - The function to handle table changes.
 * @returns {JSX.Element} The rendered component.
 */
export const CSearch = ({
  value,
  onTableChange,
}: {
  value?: string;
  onTableChange: (value?: string) => void;
}) => {
  /**
   * A reference to the unique identifier for the table.
   */
  const idTable = useRef("temp-" + uuidv4());

  /**
   * Handles the press of the Enter key in the search input field.
   * Retrieves the value from the search input field, trims it, and passes it to the handleTableChange function along with the current filters.
   */
  const handlePressEnter = () => {
    const value = (
      document.getElementById(
        idTable.current + "_input_search",
      ) as HTMLInputElement
    ).value.trim();
    onTableChange(value);
    setState(value);
  };

  /**
   * Handles the change event for the search input.
   * Clears the current timeout and sets a new timeout to trigger the handlePressEnter function after 300 milliseconds.
   */
  const timeoutSearch = useRef<ReturnType<typeof setTimeout>>();
  const handleChange = () => {
    if (timeoutSearch.current) clearTimeout(timeoutSearch.current);
    timeoutSearch.current = setTimeout(() => handlePressEnter(), 300);
  };

  /**
   * Clears the search input and triggers a table change event.
   */
  const handClick = () => {
    if (state) {
      setState(undefined);
      onTableChange(undefined);
    } else handlePressEnter();
  };
  const [state, setState] = useState(value);
  const { t } = useTranslation("locale", { keyPrefix: "Components" });

  useEffect(() => {
    setState(value);
  }, [value]);

  return (
    <div className="c-search">
      <CIMask
        id={idTable.current + "_input_search"}
        value={state}
        placeholder={t("Search")}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
      />
      <CSvgIcon
        className="cursor-pointer"
        name={state ? EIcon.times : EIcon.search}
        onClick={handClick}
      />
    </div>
  );
};
