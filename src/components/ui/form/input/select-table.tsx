import { Dropdown } from "antd";
import { useRef, useState } from "react";

import type { ITableGet } from "@/interfaces";
import { API, FULL_TEXT_SEARCH, KEY_TEMP, cleanObjectKeyNull } from "@/utils";
import { CDataTable } from "../../data-table";
import Mask from "./mask";

/**
 * Renders a custom select table component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.form - The form object.
 * @param {boolean} props.isMultiple - Indicates if multiple selections are allowed.
 * @param {Function} props.onChange - The callback function triggered when the selection changes.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {boolean} props.disabled - Indicates if the component is disabled.
 * @param {Object} props.get - The object containing data retrieval information.
 * @returns {JSX.Element} The rendered select table component.
 */
const Component = ({
  isMultiple,
  onChange,
  placeholder,
  disabled,
  get,
  value,
}: Type) => {
  /**
   * Handles the onBlur event for the select-table component.
   * It sets the isOpen state to false after a 200ms delay.
   */
  const onBlur = () => {
    setTimeout(
      () => setTemp((previousState) => ({ ...previousState, isOpen: false })),
      200,
    );
  };
  /**
   * Handles the onFocus event for the select-table component.
   */
  const onFocus = () => loadData("");

  /**
   * Represents an array of data.
   */
  let _data: any = [];
  if (get?.data() && get?.format) {
    _data = isMultiple ? [get?.format(get.data())] : get?.format(get.data());
  }
  /**
   * Retrieves the value of the specified key from the local storage.
   *
   * @param {string} KEY_TEMP - The key to retrieve the value from.
   * @returns {string | null} - The value associated with the key, or null if the key does not exist.
   */
  const _local = localStorage.getItem(KEY_TEMP);
  /**
   * Parses the value of _local and returns it as an object.
   * If _local is not a valid JSON string, an empty object is returned.
   *
   * @returns {object} The parsed object from _local or an empty object.
   */
  const _temp = _local ? JSON.parse(_local) : {};
  /**
   * Represents the state of the select table component.
   * @typedef {Object} SelectTableState
   * @property {any[]} current - The current data.
   * @property {boolean} isOpen - Indicates whether the select table is open or not.
   * @property {any[]} list - The list of data for the select table.
   * @property {boolean} isLoading - Indicates whether the select table is currently loading or not.
   */

  /**
   * Represents the SelectTable component.
   * @component
   */
  const [temp, setTemp] = useState<{
    current: any;
    list: any[];
    isLoading: boolean;
    isOpen: boolean;
  }>({
    current: _data,
    isOpen: false,
    list:
      !get?.keyApi || !_temp["select-table-" + get.keyApi]
        ? []
        : _temp["select-table-" + get.keyApi].data,
    isLoading: false,
  });

  /**
   * Loads data for the select table.
   *
   * @param {string} fullTextSearch - The full text search value.
   * @returns {Promise<void>} - A promise that resolves when the data is loaded.
   */
  const loadData = async (fullTextSearch: string) => {
    if (get?.keyApi) {
      const params = cleanObjectKeyNull(
        get.params
          ? get.params({ [FULL_TEXT_SEARCH]: fullTextSearch, value })
          : { [FULL_TEXT_SEARCH]: fullTextSearch },
      );
      const obj = _temp["select-table-" + get.keyApi];
      if (
        !obj ||
        (obj &&
          (Date.now() > obj.time || JSON.stringify(params) != obj.queryParams))
      ) {
        try {
          setTemp((pre) => ({ ...pre, isOpen: true, isLoading: true }));
          _temp["select-table-" + get.keyApi] = {
            time: Date.now() + (get.keepUnusedDataFor ?? 60) * 1000,
            queryParams: JSON.stringify(params),
            data: [],
          };
          const data: any = await API.get({ url: get.keyApi, params });
          setTemp((pre) => ({
            ...pre,
            list: data.data,
            isLoading: false,
          }));
          _temp["select-table-" + get.keyApi].data = data.data;
          localStorage.setItem(KEY_TEMP, JSON.stringify(_temp));
        } catch (e) {
          console.error(e);
        }
      } else setTemp((pre) => ({ ...pre, isOpen: true }));
    }
  };

  /**
   * Ref object for the input element.
   */
  const input = useRef<{ input: HTMLInputElement }>(null);
  /**
   * Handles the row click event for the select table.
   *
   * @param {Event} e - The click event.
   * @returns {Object} - An object containing the onClick function.
   */
  const handleRow = (e: any) => ({
    onClick: () => {
      if (get?.format) {
        const { label, value } = get.format(e);
        onChange(value);
        if (input.current?.input && typeof label === "string") {
          input.current.input.value = label;
        }
      }
      setTimeout(() => input.current?.input?.focus());
    },
  });
  /**
   * Renders a dropdown component.
   *
   * @returns The rendered dropdown component.
   */
  const renderDropdown = () => (
    <div className={"overflow-hidden rounded-lg bg-base-100 drop-shadow-lg"}>
      <CDataTable
        filterGlobal={(row, columnId, value) =>
          row.original[columnId].includes(value)
        }
        data={temp.list}
        isLoading={temp.isLoading}
        onRow={handleRow}
        columns={get?.column || []}
      />
    </div>
  );

  /**
   * Renders an SVG icon based on the current state of the component.
   *
   * @returns The SVG icon element.
   */
  const renderIcon = () => (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="down"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      {temp.isOpen ? (
        <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
      ) : (
        <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path>
      )}
    </svg>
  );
  return (
    <Dropdown
      overlayStyle={{ width: "70vw" }}
      trigger={["click"]}
      open={temp.isOpen}
      placement="bottom"
      dropdownRender={renderDropdown}
    >
      <div>
        <Mask
          value={
            temp.current.length > 0
              ? temp.current[0].label?.toString()
              : (temp?.current?.label ?? value)
          }
          ref={input}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={(e) => loadData(e.target.value)}
          addonAfter={renderIcon}
        />
      </div>
    </Dropdown>
  );
};
/**
 * Represents the properties for the `SelectTable` component.
 *
 * @property {FormInstance} [form] - The form instance.
 * @property {boolean} [isMultiple] - Indicates whether multiple options can be selected.
 * @property {(e: any) => any} onChange - The callback function triggered when the selection changes.
 * @property {string} placeholder - The placeholder text for the select input.
 * @property {boolean} [disabled] - Indicates whether the select input is disabled.
 * @property {ITableGet} [get] - The table get object.
 */
interface Type {
  isMultiple?: boolean;
  onChange: (e: any) => any;
  placeholder: string;
  disabled?: boolean;
  get?: ITableGet;
  value?: any;
}
export default Component;
