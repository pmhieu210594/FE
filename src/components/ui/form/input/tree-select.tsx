import { Checkbox, TreeSelect } from "antd";
import { Fragment, useEffect, useRef, useState } from "react";

import { EIcon } from "@/enums";
import type { IFormItem } from "@/interfaces";
import { CButton } from "../../button/index";
import { CSvgIcon } from "../../svg-icon";

/**
 * Renders a TreeSelect component.
 *
 * @component
 * @param {Type} props - The component props.
 * @param {FormItem} props.formItem - The form item configuration.
 * @param {string} props.placeholder - The placeholder text.
 * @param {Function} props.onChange - The change event handler.
 * @param {any[]} props.value - The selected value(s).
 * @param {boolean} props.disabled - Specifies if the component is disabled.
 * @param {boolean} [props.showSearch=true] - Specifies if the search input is shown.
 * @returns {JSX.Element} The rendered TreeSelect component.
 */
const Component = ({
  formItem,
  placeholder,
  onChange,
  value,
  disabled,
  showSearch = true,
}: Type) => {
  /**
   * Represents the state of the TreeSelect component.
   * @typedef {Object} TreeSelectState
   * @property {Array} list - The list of items in the TreeSelect component.
   * @property {boolean} checkAll - Indicates whether all items are checked in the TreeSelect component.
   */

  /**
   * Represents the TreeSelect component.
   * @component
   */
  const [temp, setTemp] = useState({
    list: formItem.list || [],
    checkAll: false,
  });
  /**
   * Reference to hold all values.
   */
  const allValue = useRef<any>([]);

  /**
   * Initializes the function.
   *
   * This function checks if the value is an object, has a length greater than 0, and does not contain any nested objects.
   * If the conditions are met, it calls the onChange function with a modified value array.
   * It also updates the 'checkAll' property of the 'temp' state based on the length of the value array.
   */
  const initFunction = async () => {
    if (
      typeof value === "object" &&
      value.length > 0 &&
      !value?.filter((item: any) => typeof item === "object")?.length
    ) {
      onChange?.(value.map((item: any) => ({ value: item, label: item })));
    }
    setTemp((pre) => ({
      ...pre,
      checkAll: value?.length > 0 && value?.length === allValue.current.length,
    }));
  };

  useEffect(() => {
    initFunction();
  }, [value]);

  /**
   * Recursively retrieves all values from the given item and its children.
   * @param item - The item to retrieve values from.
   */
  const handleGetAllValue = (item: any) => {
    allValue.current.push({ value: item.value, label: item.title });

    if (item?.children?.length) {
      item?.children?.forEach(handleGetAllValue);
    }
  };

  useEffect(() => {
    temp.list.forEach(handleGetAllValue);
  }, [temp.list, handleGetAllValue]);

  /**
   * Filters an array based on a given valueTag.
   * @param array - The array to filter.
   * @param valueTag - The valueTag to use for filtering.
   * @returns The filtered array.
   */
  const handleGetData = (array: any, valueTag: any) => {
    return array.filter((item: any) => handleFindId(item, valueTag));
  };

  /**
   * Checks if the given item has a value that matches the specified valueTag.
   * @param item - The item to check.
   * @param valueTag - The value to compare against.
   * @returns True if the item's value matches the valueTag, or if any of its children have a matching value; otherwise, undefined.
   */
  const handleFindId = (item: any, valueTag: any) => {
    if (item.value === valueTag) {
      return true;
    } else if (item?.children?.length) {
      return handleGetData(item.children, valueTag)?.length;
    }
  };

  /**
   * Calculates the total number of children in a tree-like structure.
   *
   * @param obj - The object representing a node in the tree.
   * @param length - The current length of the children.
   * @param arrayValue - An array of values to check against.
   * @returns The total number of children in the tree.
   */
  const totalChildren = (obj: any, length: number, arrayValue: any[]) => {
    if (!obj.value.includes("__") && arrayValue.includes(obj.value)) {
      length += 1;
    }
    if (obj?.children?.length) {
      length = [...obj.children].reduce((previousValue, currentValue) => {
        return totalChildren(currentValue, previousValue, arrayValue);
      }, length);
    }
    return length;
  };

  /**
   * Removes a specific tag from the given value recursively.
   *
   * @param object - The object to check for tag removal.
   * @param value - The value to remove the tag from.
   * @returns The updated value with the tag removed.
   */
  const clearTag = (object: any, value: any) => {
    value = value.filter((item: any) => item.value !== object.value);
    if (object?.children?.length > 0) {
      object?.children?.map((item: any) => {
        value = clearTag(item, value);
        return item;
      });
    }
    return value;
  };

  /**
   * Renders the dropdown content for the tree select input.
   *
   * @param originNode - The original dropdown content.
   * @returns The modified dropdown content.
   */
  const dropdownRender = (originNode: any) => (
    <Fragment>
      {formItem.isMultiple && (
        <Checkbox
          checked={temp.checkAll}
          onChange={() => onChange?.(temp.checkAll ? [] : allValue.current)}
        >
          Select all
        </Checkbox>
      )}
      {originNode}
    </Fragment>
  );

  /**
   * Renders a custom tag for the TreeSelect component.
   *
   * @param props - The props object containing the value of the tag.
   * @returns The JSX element representing the custom tag.
   */
  const tagRender = (props: any) => {
    const item = handleGetData(temp.list, props.value);
    const arrayValue = value.map((item: any) => item.value);
    if (
      arrayValue.includes(props.value) &&
      !!item.length &&
      (!arrayValue.includes(item[0].value) ||
        arrayValue.indexOf(item[0].value) === arrayValue.indexOf(props.value))
    ) {
      const arraySlice = arrayValue.slice(0, arrayValue.indexOf(props.value));
      let checkShow = true;
      if (!!arraySlice.length && !arrayValue.includes(item[0]?.value)) {
        arraySlice.map((valueSlide: any) => {
          if (checkShow) {
            const itemSlice = handleGetData(temp.list, valueSlide);
            if (!!itemSlice.length && item[0].value === itemSlice[0].value) {
              checkShow = false;
            }
          }
          return valueSlide;
        });
      }
      return (
        checkShow && (
          <div className="relative -left-2.5 mr-2.5 rounded-xl bg-primary/20 px-2 py-1">
            <CButton
              icon={
                <CSvgIcon name={EIcon.times} size={20} className="fill-error" />
              }
              className="absolute -right-2 -top-1 z-10 rounded-full !bg-error/20 leading-none !text-error"
              onClick={() => onChange?.(clearTag(item[0], value))}
              disabled={disabled}
            />
            {item[0].title} ({totalChildren(item[0], 0, arrayValue)})
          </div>
        )
      );
    }
    return <></>;
  };

  return (
    <TreeSelect
      treeNodeFilterProp={"title"}
      listHeight={200}
      allowClear={true}
      showSearch={showSearch}
      onChange={onChange}
      dropdownRender={dropdownRender}
      treeDefaultExpandAll={!!formItem.list}
      labelInValue={true}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      treeCheckable={formItem.isMultiple}
      treeData={temp.list}
      tagRender={tagRender}
      placement={"bottomLeft"}
      showCheckedStrategy={TreeSelect.SHOW_ALL}
    />
  );
};
/**
 * Represents the props for the TreeSelect component.
 *
 * @remarks
 * This interface defines the properties that can be passed to the TreeSelect component.
 *
 * @public
 */
interface Type {
  formItem: IFormItem;
  placeholder: string;
  onChange?: (e: any) => any;
  value?: any;
  disabled?: boolean;
  showSearch?: boolean;
}
export default Component;
