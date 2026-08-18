import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import classNames from "classnames";
import dayjs from "dayjs";

import { CSvgIcon } from "../svg-icon";

export const FieldInfo = ({
  field,
  item,
  t,
  form,
}: {
  field: AnyFieldApi;
  item: IForm;
  t: TFunction;
  form: AnyFormApi;
}) => {
  return (
    <Fragment>
      {generateInput({
        item,
        value: field.state.value,
        name: field.name,
        t,
        field,
        form,
      })}

      <div className={classNames("feedback")}>
        {field.state.meta.isTouched && field?.state?.meta?.errors?.length > 0
          ? Array.from(new Set(field.state.meta.errors)).join(",")
          : field.state.meta.isValidating && (
              <Fragment>
                {t("Validating")} <Spin size="small" />
              </Fragment>
            )}
      </div>
    </Fragment>
  );
};

import {
  Checkbox,
  DatePicker as DateAntDesign,
  Input,
  Radio,
  Spin,
  Switch,
  TimePicker,
} from "antd";
import type { TFunction } from "i18next";

const InputOTP = Input.OTP;

import { EFormType, EIcon } from "@/enums";
import type { IForm } from "@/interfaces";
import { API, TYPE_FORMAT_DATE } from "@/utils";
import { Fragment } from "react";
import { CUpload } from "../upload";
import {
  CIAddable,
  CIChips,
  CIDatePicker,
  CIEditor,
  CIMask,
  CIPassword,
  CISelect,
  CISelectTable,
  CITab,
  CITreeSelect,
} from "./input";

/**
 * Generates an input component based on the provided item and form data.
 *
 * @param item - The item object containing information about the input.
 * @param value - the current form value.
 * @param name - The name of the input.
 * @param generateForm - The function used to generate the form.
 * @param form - The form instance.
 * @param t - The translation function.
 * @returns The generated input component.
 */
export const generateInput = ({
  item,
  value,
  name,
  field,
  t,
  form,
}: {
  item: IForm;
  value: any;
  name: string;
  field: AnyFieldApi;
  t: TFunction;
  form: AnyFormApi;
}) => {
  const { formItem } = item;
  /**
   * Handles the change event of the calendar.
   *
   * @param {Date[]} date - The selected date(s) from the calendar.
   */
  const onCalendarChange = (date: any[]) => {
    form.setFieldValue(
      item.name,
      date?.filter((i: any) => !!i),
    );
    formItem?.onChange?.({ value: date?.filter((i: any) => !!i) });
  };
  if (formItem) {
    switch (formItem.type) {
      case EFormType.hidden:
        return (
          <input
            value={value}
            type={"hidden"}
            name={item.name}
            id={item.id || item.name}
            tabIndex={-1}
          />
        );
      case EFormType.editor:
        return (
          <CIEditor
            value={value}
            onBlur={(value) => {
              formItem.onBlur?.({ value, form, name, api: API });
              field.handleBlur();
              field.handleChange(value);
            }}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            id={item.id || item.name}
          />
        );
      case EFormType.richtext:
        return (
          <CIEditor
            value={value}
            onBlur={(value) => {
              formItem.onBlur?.({ value, form, name, api: API });
              field.handleBlur();
              field.handleChange(value);
            }}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            id={item.id || item.name}
            buttonList={[
              ["bold", "underline", "italic", "strike"],
              ["fontColor", "hiliteColor"],
              ["fontSize"],
              ["align", "list"],
              ["removeFormat"],
            ]}
          />
        );
      case EFormType.upload:
        return (
          <CUpload
            isMultiple={formItem.isMultiple}
            value={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.otp:
        return (
          <InputOTP
            length={5}
            defaultValue={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.password:
        return (
          <CIPassword
            value={value}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            disabled={formItem.disabled?.({ value })}
            onBlur={(e) => {
              formItem.onBlur?.({
                value: e.target.value,
                form,
                name,
                api: API,
              });
              field.handleBlur();
            }}
            onChange={(e) => {
              formItem.onChange?.({ value: e.target.value });
              field.handleChange(e.target.value);
            }}
            id={item.id || item.name}
            testId={item.id || item.name}
          />
        );
      case EFormType.chips:
        return (
          <CIChips
            value={value}
            onBlur={(value) => {
              formItem.onBlur?.({ value, form, name, api: API });
              field.handleBlur();
            }}
            onChange={(value) => {
              formItem.onChange?.({ value: value });
              field.handleChange(value);
            }}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            disabled={formItem.disabled?.({ value })}
            list={formItem.list}
          />
        );
      case EFormType.switch:
        return (
          <Switch
            checkedChildren={
              <CSvgIcon name={EIcon.check} size={20} className="fill-white" />
            }
            unCheckedChildren={
              <CSvgIcon name={EIcon.times} size={20} className="fill-white" />
            }
            checked={value === true || value === 1}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.checkboxSingle:
        return (
          <div className="flex h-full items-center justify-center">
            <Checkbox
              checked={value === true || value === 1}
              disabled={formItem.disabled?.({ value })}
              onChange={({ target }) => {
                formItem.onChange?.({ value: target.checked });
                field.handleChange(target.checked);
              }}
            />
          </div>
        );
      case EFormType.radio:
        return (
          <Radio.Group
            id={item.id || item.name}
            options={formItem.list}
            optionType={"button"}
            disabled={formItem.disabled?.({ value })}
            value={value}
            onChange={({ target }) => {
              formItem.onChange?.({ value: target.value });
              field.handleChange(target.value);
            }}
          />
        );

      case EFormType.tab:
        return (
          <CITab
            name={item.name}
            form={form}
            column={formItem.column}
            list={formItem.list}
            values={value}
          />
        );

      case EFormType.textarea:
      case EFormType.addable:
      case EFormType.date:
      case EFormType.dateRange:
        return switchCaseMore1({
          field,
          form,
          item,
          value,
          t,
          onCalendarChange,
          name,
        });

      case EFormType.treeSelect:
      case EFormType.selectTable:
      case EFormType.time:
      case EFormType.timeRange:
      case EFormType.checkbox:
      case EFormType.select:
        return switchCaseMore2({
          field,
          item,
          value,
          t,
          onCalendarChange,
          form,
        });

      default: {
        const normalizeInput = (rawValue: string) =>
          formItem.text?.normalizeInput?.(rawValue) ?? rawValue;
        return (
          <CIMask
            value={value}
            list={formItem.list}
            mask={formItem.text?.mask}
            addonBefore={formItem.text?.addonBefore}
            addonAfter={formItem.text?.addonAfter}
            maxLength={formItem.maxLength}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            onFocus={() => {
              formItem.onFocus?.({ value, form, name, api: API });
            }}
            onBlur={(e) => {
              const normalizedValue = normalizeInput(e.target.value);
              if (normalizedValue !== e.target.value) {
                e.target.value = normalizedValue;
              }
              formItem.onBlur?.({
                value: normalizedValue,
                form,
                name,
                api: API,
              });
              field.handleBlur();
            }}
            onChange={(e) => {
              const normalizedValue = normalizeInput(e.target.value);
              if (normalizedValue !== e.target.value) {
                e.target.value = normalizedValue;
              }
              formItem.onChange?.({ value: normalizedValue });
              field.handleChange(normalizedValue);
            }}
            onKeyDown={(e) => {
              formItem.text?.onKeyDown?.(e);
            }}
            disabled={formItem.disabled?.({ value })}
            id={item.id || item.name}
            testId={item.id || item.name}
          />
        );
      }
    }
  }
};
/**
 * Renders the appropriate form input based on the provided item's formItem type.
 *
 * @param item - The form item.
 * @param value - The values for the form.
 * @param generateForm - The function to generate the form.
 * @param form - The form instance.
 * @param t - The translation function.
 * @param onCalendarChange - The function to handle calendar changes.
 *
 * @returns The rendered form input component.
 */
const switchCaseMore1 = ({
  item,
  value,
  t,
  onCalendarChange,
  field,
  form,
  name,
}: {
  item: IForm;
  value: any;
  t: TFunction;
  onCalendarChange: any;
  field: AnyFieldApi;
  form: AnyFormApi;
  name: string;
}) => {
  const { formItem } = item;
  if (formItem) {
    switch (formItem.type) {
      case EFormType.textarea:
        return (
          <textarea
            disabled={formItem.disabled?.({ value })}
            className={classNames("ant-input", {
              disabled: formItem.disabled?.({ value }),
            })}
            rows={4}
            maxLength={formItem.maxLength ?? 1000}
            placeholder={t(formItem.placeholder ?? "Enter", {
              title: item.title.toLowerCase(),
            })}
            value={value}
            id={item.id || item.name}
            onBlur={(e) => {
              formItem.onBlur?.({
                value: e.target.value,
                name: item.name,
                api: API,
                form,
              });
              field.handleBlur();
            }}
            onChange={(e) => {
              formItem.onChange?.({ value: e.target.value });
              field.handleChange(e.target.value);
            }}
          />
        );
      case EFormType.addable:
        return (
          <CIAddable
            form={form}
            name={item.name}
            column={formItem.column}
            textAdd={formItem.addable?.textAdd}
            onAdd={formItem.addable?.onAdd}
            isTable={formItem.addable?.isTable}
            showRemove={formItem.addable?.showRemove}
            idCheck={formItem.addable?.idCheck}
            defaultValue={formItem.addable?.defaultValue}
          />
        );
      case EFormType.date:
        return (
          <CIDatePicker
            format={
              formItem.date?.format ?? dayjs.localeData().longDateFormat("L")
            }
            value={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
            disabledDate={(current) =>
              formItem.date?.disabledDate
                ? formItem.date?.disabledDate({ current })
                : false
            }
            picker={formItem.date?.picker ?? "date"}
            disabled={formItem.disabled?.({ value })}
            name={item.name}
            id={item.id || name}
            placeholder={t(formItem.placeholder ?? "Choose", {
              title: item.title.toLowerCase(),
            })}
          />
        );
      case EFormType.dateRange:
        return (
          <DateAntDesign.RangePicker
            id={{
              start: `${item.id || name}-start`,
              end: `${item.id || name}-end`,
            }}
            onCalendarChange={onCalendarChange}
            format={{
              format: dayjs.localeData().longDateFormat("L"),
              type: TYPE_FORMAT_DATE,
            }}
            disabledDate={(current) =>
              formItem.date?.disabledDate
                ? formItem.date?.disabledDate({ current })
                : false
            }
            disabled={formItem.disabled?.({ value })}
            defaultValue={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
    }
  }
};

/**
 * Function that handles the rendering of different form input components based on the type of the form item.
 *
 * @param item - The form item object.
 * @param value - The current values of the form.
 * @param form - The form instance.
 * @param t - The translation function.
 * @param onCalendarChange - The callback function for calendar change event.
 *
 * @returns The JSX element representing the form input component.
 */
const switchCaseMore2 = ({
  item,
  value,
  t,
  onCalendarChange,
  field,
  form,
}: {
  item: IForm;
  value: any;
  t: TFunction;
  onCalendarChange: any;
  field: AnyFieldApi;
  form: AnyFormApi;
}) => {
  const { formItem } = item;
  if (formItem) {
    switch (formItem.type) {
      case EFormType.treeSelect:
        return (
          <CITreeSelect
            formItem={formItem}
            disabled={formItem.disabled?.({ value })}
            placeholder={t(formItem.placeholder ?? "Choose", {
              title: item.title.toLowerCase(),
            })}
            value={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.selectTable:
        return (
          <CISelectTable
            placeholder={t(formItem.placeholder ?? "Choose", {
              title: item.title.toLowerCase(),
            })}
            disabled={formItem.disabled?.({ value })}
            isMultiple={formItem.isMultiple}
            get={formItem.api}
            value={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.time:
        return (
          <TimePicker
            defaultValue={value}
            minuteStep={10}
            format={"HH:mm"}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
            disabledDate={(current) =>
              formItem.date?.disabledDate
                ? formItem.date?.disabledDate({ current })
                : false
            }
            disabled={formItem.disabled?.({ value })}
            name={item.name}
            placeholder={t(formItem.placeholder ?? "Choose", {
              title: item.title.toLowerCase(),
            })}
          />
        );
      case EFormType.timeRange:
        return (
          <TimePicker.RangePicker
            minuteStep={10}
            onCalendarChange={onCalendarChange}
            // onOpenChange={open => {
            //   if (!open && form.getFieldValue(item.name)?.length < 2) form.resetFields([item.name]);
            // }}
            format={"HH:mm"}
            disabledDate={(current) =>
              formItem.date?.disabledDate
                ? formItem.date?.disabledDate({ current })
                : false
            }
            disabled={formItem.disabled?.({ value })}
            defaultValue={value}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
          />
        );
      case EFormType.checkbox:
        return (
          <Checkbox.Group
            options={formItem.list}
            onChange={(value) => {
              formItem.onChange?.({ value });
              field.handleChange(value);
            }}
            disabled={formItem.disabled?.({ value })}
            defaultValue={value}
          />
        );
      case EFormType.select:
        return (
          <CISelect
            maxTagCount={"responsive"}
            value={value}
            allowClear={formItem.allowClear}
            onChange={(value) => {
              formItem.onChange?.({ value, form, name: item.name, api: API });
              field.handleChange(value ?? "");
            }}
            placeholder={t(formItem.placeholder ?? "Choose", {
              title: item.title.toLowerCase(),
            })}
            disabled={formItem.disabled?.({ value })}
            get={formItem.api}
            list={formItem.list}
            isMultiple={formItem.isMultiple}
            className={formItem.className}
            id={item.id || item.name}
          />
        );
    }
  }
};
