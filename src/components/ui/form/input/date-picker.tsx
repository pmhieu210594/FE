import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";

import { SGlobal } from "@/services/global";
import { TYPE_FORMAT_DATE, uuidv4 } from "@/utils/variable";

/**
 * Renders a date picker component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the date picker.
 * @param {string} [props.id] - The ID of the date picker.
 * @param {Function} props.onChange - The function to be called when the value of the date picker changes.
 * @param {string} [props.format] - The format of the date to be displayed.
 * @param {Function} [props.disabledDate] - The function to determine if a date should be disabled.
 * @param {boolean} [props.showTime] - Whether to show the time picker.
 * @param {string} [props.picker] - The type of the date picker to be rendered.
 * @param {boolean} [props.disabled] - Whether the date picker is disabled.
 * @returns {JSX.Element} The rendered date picker component.
 */
const Component = ({
  name,
  id = "date-picker-" + uuidv4(),
  onChange,
  format,
  disabledDate,
  picker,
  disabled,
  value,
  ...props
}: Type) => {
  /**
   * Represents the global state of the application.
   */
  const sGlobal = SGlobal();

  /**
   * Handles the open change event for the date picker.
   *
   * @param {Event} e - The event object.
   * @returns {void}
   */
  const handleOpenChange = (e: any) => {
    if (!e) {
      const { value }: any = document.getElementById(id);
      const selectDate = dayjs(value, format ?? "DD/MM/YYYY");
      if (selectDate.isValid() && onChange && name) {
        onChange(selectDate, value);
      }
    }
    setTimeout(() => document.getElementById(id)?.focus());
  };
  if (value) value = dayjs(value);
  return (
    <DatePicker
      value={value}
      id={id}
      onChange={onChange}
      format={
        format ??
        ({
          format: dayjs.localeData().longDateFormat("L"),
          type: TYPE_FORMAT_DATE,
        } as any)
      }
      disabledDate={disabledDate}
      picker={picker}
      locale={sGlobal.localeDate}
      disabled={disabled}
      {...props}
      onOpenChange={handleOpenChange}
    />
  );
};
/**
 * Represents the properties for the DatePicker component.
 *
 * @interface Type
 * @property {FormInstance} form - The form instance.
 * @property {string} [name] - The name of the DatePicker.
 * @property {string} [placeholder] - The placeholder text for the DatePicker.
 * @property {string} [id] - The ID of the DatePicker.
 * @property {(selectDate: any, value: any) => void} onChange - The callback function called when the DatePicker value changes.
 * @property {string} [format] - The format of the DatePicker value.
 * @property {(current: any) => boolean} disabledDate - The function to determine if a date should be disabled.
 * @property {boolean} showTime - Specifies whether to show the time picker.
 * @property {'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined} picker - The type of the DatePicker.
 * @property {boolean} [disabled] - Specifies whether the DatePicker is disabled.
 */
interface Type {
  value?: Dayjs;
  name?: string;
  placeholder?: string;
  id?: string;
  onChange: (selectDate: any, value: any) => void;
  format?: string;
  disabledDate: (current: any) => boolean;
  picker: "time" | "date" | "week" | "month" | "quarter" | "year" | undefined;
  disabled?: boolean;
}
export default Component;
