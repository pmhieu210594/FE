import { Select } from "antd";
import { useEffect, useState } from "react";

import type { ITableGet, ITableItemFilterList } from "@/interfaces";
import {
  API,
  FULL_TEXT_SEARCH,
  KEY_TEMP,
  arrayUnique,
  cleanObjectKeyNull,
} from "@/utils";

/**
 * Renders a custom Select component.
 *
 * @component
 * @param {Type} props - The component props.
 * @param {FormInstance} props.form - The form instance.
 * @param {any} props.value - The selected value(s).
 * @param {boolean} [props.showSearch=true] - Determines whether to show the search input.
 * @param {number} [props.maxTagCount] - The maximum number of tags to display.
 * @param {Function} props.onChange - The callback function triggered when the value changes.
 * @param {Function} props.onBlur - The callback function triggered when the component loses focus.
 * @param {string} [props.placeholder] - The placeholder text.
 * @param {boolean} [props.disabled] - Determines whether the component is disabled.
 * @param {object} props.get - The configuration object for fetching data.
 * @param {string} [props.get.keyApi] - The API key for fetching data.
 * @param {Function} [props.get.params] - The function to generate the request parameters.
 * @param {number} [props.get.keepUnusedDataFor] - The duration (in seconds) to keep unused data in local storage.
 * @param {Array<any>} [props.list=[]] - The list of options.
 * @param {boolean} [props.isMultiple] - Determines whether multiple values can be selected.
 * @param {string} [props.className=''] - The CSS class name.
 * @param {boolean} [props.allowClear=true] - Determines whether to show the clear button.
 * @returns {JSX.Element} The rendered Select component.
 */
const Component = ({
  value,
  showSearch = true,
  maxTagCount,
  onChange,
  onBlur,
  placeholder,
  disabled,
  get,
  list = [],
  isMultiple,
  className = "",
  allowClear = true,
  id,
}: Type) => {
  /**
   * Retrieves the value stored in the local storage with the specified key.
   *
   * @returns The value stored in the local storage with the specified key, or null if the key does not exist.
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
   * Represents the state of a select input component.
   * @typedef {Object} SelectState
   * @property {any[]} current - The current selected values.
   * @property {any[]} list - The list of options for the select input.
   * @property {boolean} isLoading - Indicates whether the select input is currently loading.
   */

  /**
   * Represents a select input component.
   * @component
   * @example
   * const [temp, setTemp] = useState<SelectState>({
   *   current: [],
   *   list: !get?.keyApi || !_temp['select-' + get.keyApi]
   *     ? list
   *     : _temp['select-' + get.keyApi].data
   *         .map((e: any) => (get?.format ? get.format(e) : e))
   *         .filter((item: any) => !!item.value),
   *   isLoading: false,
   * });
   */
  const [temp, setTemp] = useState<{
    current: any[];
    list: any[];
    isLoading: boolean;
  }>({
    current: [],
    list:
      !get?.keyApi || !_temp["select-" + get.keyApi]
        ? list
        : _temp["select-" + get.keyApi].data
            .map((e: any) => (get?.format ? get.format(e) : e))
            .filter((item: any) => !!item.value),
    isLoading: false,
  });

  /**
   * Loads data for the select input.
   *
   * @param fullTextSearch - The full text search string.
   */
  const loadData = async (fullTextSearch: string) => {
    if (get?.keyApi) {
      const params = cleanObjectKeyNull(
        get.params
          ? get.params({ [FULL_TEXT_SEARCH]: fullTextSearch, value })
          : { [FULL_TEXT_SEARCH]: fullTextSearch },
      );
      const obj = _temp["select-" + get.keyApi];
      if (
        !obj ||
        (obj &&
          (Date.now() > obj.time || JSON.stringify(params) != obj.queryParams))
      )
        try {
          setTemp((pre) => ({ ...pre, isLoading: true }));
          _temp["select-" + get.keyApi] = {
            time: Date.now() + (get.keepUnusedDataFor ?? 60) * 1000,
            queryParams: JSON.stringify(params),
            data: [],
          };
          const data: any = await API.get({ url: get.keyApi, params });
          setTemp((pre) => ({
            ...pre,
            list: data.data
              .map((e: any) => (get?.format ? get.format(e) : e))
              .filter((item: any) => !!item.value),
            isLoading: false,
          }));
          _temp["select-" + get.keyApi].data = data.data;
          localStorage.setItem(KEY_TEMP, JSON.stringify(_temp));
        } catch (e) {
          console.error(e);
        }
    } else if (list) {
      setTemp((pre) => ({
        ...pre,
        list: list.filter(
          (item: any) =>
            !item?.label?.toUpperCase ||
            item?.label?.toUpperCase().indexOf(fullTextSearch.toUpperCase()) >
              -1,
        ),
      }));
    }
  };

  useEffect(() => {
    if (!get?.keyApi) {
      setTemp((pre) => ({ ...pre, list }));
    }
  }, [list]);

  useEffect(() => {
    if (get?.data) {
      let data = get.data();
      if (get?.format && data) {
        data = isMultiple ? data.map(get.format) : [get.format(data)];
        if (JSON.stringify(data) !== JSON.stringify(temp.current))
          setTemp((pre) => ({ ...pre, current: data }));
      }
    }
  }, [get?.data]);

  /**
   * Represents a list of items.
   */
  let __list = temp.list;
  if (temp.current.length)
    __list = __list?.length
      ? arrayUnique([...temp.current, ...__list], "value")
      : temp.current;

  /**
   * Renders the options for a select input.
   *
   * @returns An array of JSX elements representing the select options.
   */
  const options = __list?.map((item: any, index: number) => ({
    label: <span dangerouslySetInnerHTML={{ __html: item.label }} />,
    value: item.value,
    disabled: item.disabled,
    key: `${item.value}${index}`,
  }));

  return (
    <Select
      id={id}
      maxTagCount={maxTagCount}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      listHeight={200}
      showSearch={
        showSearch
          ? {
              filterOption: false,
              onSearch: loadData,
              optionFilterProp: "label",
            }
          : false
      }
      loading={temp.isLoading}
      allowClear={allowClear}
      defaultValue={value}
      value={isMultiple ? value : (value ?? undefined)}
      maxTagPlaceholder={(array) => "+" + array.length}
      mode={isMultiple ? "multiple" : undefined}
      onBlur={onBlur}
      onOpenChange={(open) => open && !temp.isLoading && loadData("")}
      className={className}
      options={options}
    />
  );
};
/**
 * Represents the properties for the Select component.
 *
 * @interface Type
 * @property {FormInstance} [form] - The form instance.
 * @property {*} [value] - The value of the select.
 * @property {boolean} [showSearch] - Determines whether to show the search input.
 * @property {number | 'responsive'} [maxTagCount] - The maximum number of tags to display.
 * @property {(e: any) => any} onChange - The callback function for when the select value changes.
 * @property {(e: any) => any} [onBlur] - The callback function for when the select loses focus.
 * @property {string} [placeholder] - The placeholder text for the select input.
 * @property {string} [className] - The CSS class name for the select component.
 * @property {boolean} [disabled] - Determines whether the select is disabled.
 * @property {ITableGet} [get] - The table get object.
 * @property {ITableItemFilterList[]} [list] - The list of table item filter objects.
 * @property {boolean} [isMultiple] - Determines whether multiple options can be selected.
 * @property {boolean} [allowClear] - Determines whether to show the clear button.
 */
interface Type {
  id?: string;
  value?: any;
  showSearch?: boolean;
  maxTagCount?: number | "responsive";
  onChange: (e: any) => any;
  onBlur?: (e: any) => any;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  get?: ITableGet;
  list?: ITableItemFilterList[];
  isMultiple?: boolean;
  allowClear?: boolean;
}
export default Component;
