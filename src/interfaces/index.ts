import type { AnyFormApi } from "@tanstack/react-form";
import type { CheckboxOptionType } from "antd";
import type dayjs from "dayjs";

import type {
  EFormPickerDate,
  EFormRuleType,
  EFormType,
  ETableAlign,
  ETableFilterType,
} from "@/enums";
import type { API, FULL_TEXT_SEARCH } from "@/utils";

/**
 * Represents the response object returned by an API request.
 * @template T - The type of the data property in the response object.
 */
export interface IResponses<T> {
  statusCode?: 200 | 201 | 500 | 404;
  message?: string;
  data?: T;
  meta?: {
    pageIndex?: number;
    page_index?: number;
    pageSize?: number;
    page_size?: number;
    totalItemCount?: number;
    total_item_count?: number;
    totalPageCount?: number;
    total_page_count?: number;
    hasNext?: boolean;
    has_next?: boolean;
    hasPrevious?: boolean;
    has_previous?: boolean;
  };
}

/**
 * Represents a common entity.
 *
 * @interface ICommonEntity
 * @property {string} [id] - The ID of the entity.
 * @property {string} [createdAt] - The creation date of the entity.
 * @property {boolean} [isDisable] - Indicates if the entity is disabled.
 */
export interface ICommonEntity {
  id?: string;
  createdAt?: string;
  isDisable?: boolean;
}

/**
 * Represents a pagination query object.
 *
 * @template T - The type of the object.
 */
export interface IPaginationQuery<T = object> {
  [selector: string]: any;
  pageSize?: number;
  pageIndex?: number;
  like?: string | T;
  sort?: string | T;
  extend?: string | T;
  skip?: string | T;
  fullTextSearch?: string;
  include?: string;
}

/**
 * Represents a data table.
 */
export interface IDataTable {
  name?: string;
  title?: any;
  tableItem?: ITableItem;
}

/**
 * Represents an item in a table.
 */
export interface ITableItem {
  list?: { label: string; value: string | number }[];
  filter?: ETableFilterType;
  filterValue?: (row: any) => string;
  width?: number;
  fixed?: string;
  sorter?: boolean;
  onCell?: (record: any) => { style?: any; onClick?: any; className?: string };
  align?: ETableAlign;
  onClick?: any;
  render?: (
    text: any,
    item: any,
    meta?: { columnId?: string; columnSize?: number },
  ) => JSX.Element | string;
  isDateTime?: boolean;
}

/**
 * Represents the configuration options for retrieving data from a table.
 *
 * @remarks
 * This interface defines the properties that can be used to customize the behavior of the data retrieval process.
 *
 * @public
 */
export interface ITableGet {
  keyApi?: string;
  method?: string;
  format?: (item: any) => CheckboxOptionType;
  params?: (props: { [FULL_TEXT_SEARCH]: string; value: any }) => any;
  data?: any;
  column?: IDataTable[];
  keepUnusedDataFor?: number;
}

/**
 * Represents an item in a table filter list.
 */
export interface ITableItemFilterList {
  label?: string;
  value?: string | number;
}

/**
 * Represents the structure of an editable table.
 */
export interface IEditTable {
  fields?: {
    columns?: IColumnEditTable[];
    rows?: string[];
  };
  meta?: {
    field?: string;
    name?: string;
    fullName?: string;
    type?: string;
    formula?: string;
  }[];
  totals?: {
    row?: {
      subTotalsDimensions?: string[];
      reverseSubLayout?: boolean;
      subLabel?: string;
    };
  };
  data?: any[];
}

/**
 * Represents a column in an editable table.
 */
export interface IColumnEditTable {
  key?: string;
  children?: IColumnEditTable[];
}

/**
 * Represents a form.
 */
export interface IForm {
  id?: string;
  name: string;
  title: string;
  formItem?: IFormItem;
}

/**
 * Interface representing a form item.
 *
 * @interface IFormItem
 *
 * @property {EFormType} [type] - The type of the form item.
 * @property {number} [col] - The column span of the form item.
 * @property {(props: { value: string; index: number; values: any }) => boolean} [condition] - A function to determine if the form item should be displayed based on certain conditions.
 * @property {any[]} [list] - A list of options or items related to the form item.
 * @property {IFormItemRule[]} [rules] - Validation rules for the form item.
 * @property {IForm[]} [column] - Nested form items within this form item.
 * @property {(props: { value: any }) => boolean} [disabled] - A function to determine if the form item should be disabled.
 * @property {string} [placeholder] - Placeholder text for the form item.
 * @property {number} [maxLength] - Maximum number of characters allowed for the form item.
 * @property {(props: { value: any }) => void} [onChange] - Callback function triggered when the form item value changes.
 * @property {(props: { value: any; form: AnyFormApi; name: string; api: typeof API; }) => void} [onBlur] - Callback function triggered when the form item loses focus.
 * @property {(props: { values: any; generateForm: any; index: number }) => JSX.Element} [render] - Custom render function for the form item.
 * @property {boolean} [notDefaultValid] - Flag indicating if the form item should not be validated by default.
 * @property {(data: { value: any; values: any; dayjs: typeof dayjs }) => any} [convert] - Function to convert the form item value.
 * @property {boolean} [isMultiple] - Flag indicating if the form item supports multiple values.
 * @property {ITableGet} [api] - API configuration for the form item.
 * @property {Object} [date] - Date picker configuration for the form item.
 * @property {(props: { current: any }) => boolean} [date.disabledDate] - Function to determine if a date should be disabled.
 * @property {EFormPickerDate} [date.picker] - The type of date picker to use.
 * @property {string} [tab] - The tab identifier for the form item.
 * @property {Object} [text] - Text configuration for the form item.
 * @property {any} [text.mask] - Mask configuration for the text input.
 * @property {() => JSX.Element} [text.addonBefore] - Function to render an addon before the text input.
 * @property {() => JSX.Element} [text.addonAfter] - Function to render an addon after the text input.
 * @property {Object} [addable] - Configuration for addable form items.
 * @property {string} [addable.textAdd] - Text for the add button.
 * @property {(props: { values: any }) => void} [addable.onAdd] - Callback function triggered when the add button is clicked.
 * @property {boolean} [addable.isTable] - Flag indicating if the form item is a table.
 * @property {any} [addable.showRemove] - Configuration for showing the remove button.
 * @property {any} [addable.idCheck] - Configuration for checking the ID of the form item.
 */
export interface IFormItem {
  type?: EFormType;
  col?: number;
  condition?: (props: { value: string; index: number; values: any }) => boolean;
  list?: any[];
  rules?: IFormItemRule[];
  column?: IForm[];
  disabled?: (props: { value: any }) => boolean;
  allowClear?: boolean;
  placeholder?: string;
  maxLength?: number;
  validateDebounceMs?: number;
  onChange?: (props: {
    value: any;
    form?: AnyFormApi;
    name?: string;
    api?: typeof API;
  }) => void;
  onBlur?: (props: {
    value: any;
    form: AnyFormApi;
    name: string;
    api: typeof API;
  }) => void;
  onFocus?: (props: {
    value: any;
    form: AnyFormApi;
    name: string;
    api: typeof API;
  }) => void;
  render?: (props: {
    values: any;
    generateForm: any;
    index: number;
  }) => JSX.Element;
  notDefaultValid?: boolean;
  convert?: (data: { value: any; values: any; dayjs: typeof dayjs }) => any;

  isMultiple?: boolean;
  api?: ITableGet;
  date?: {
    disabledDate?: (props: { current: any }) => boolean;
    picker?: EFormPickerDate;
    format?: string;
  };
  tab?: string;
  text?: {
    mask?: any;
    addonBefore?: () => JSX.Element;
    addonAfter?: () => JSX.Element;
    normalizeInput?: (value: string) => string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  };
  addable?: {
    textAdd?: string;
    onAdd?: (props: { values: any }) => void;
    isTable?: boolean;
    showRemove?: any;
    idCheck?: any;
    defaultValue?: any;
  };
  className?: string;
  /** CSS class applied to the table cell (header + body) when used inside EFormType.addable */
  classItem?: string;
}

export type TRuleValidation = (props: {
  value: string;
  form: AnyFormApi;
}) => string;

/**
 * Represents the interface for a form item rule.
 *
 * @interface IFormItemRule
 */
export interface IFormItemRule {
  type?: EFormRuleType;
  message?: string;
  value?: any;
  validator?: TRuleValidation;
  min?: number;
  max?: number;
  api?: {
    url: string;
    name: string;
    label: string;
    id?: string;
  };
}

/**
 * Represents the interface for the Form API.
 */
export interface IFormApi {
  link?: () => string;
  format?: (item: any) => CheckboxOptionType;
  params?: (props: { fullTextSearch: string }) => any;
}

/**
 * Represents an object that contains properties and methods related to a form modal.
 */
export interface IFormModalRefObject {
  handleEdit?: (item?: { id?: string }) => Promise<void>;
  handleEditWithData?: (item?: { id?: string }) => Promise<void>;
}

/**
 * Represents an extended query parameters object.
 *
 * @template T - The type of the object.
 */
export interface IExtendedQueryParams<T = object> extends IPaginationQuery<T> {
  allocateDate?: string;
}
