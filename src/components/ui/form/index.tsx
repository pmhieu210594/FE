import { useForm, type AnyFormApi } from "@tanstack/react-form";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

import type { IForm } from "@/interfaces";
import classNames from "classnames";
import { forwardRef, useImperativeHandle, type Ref } from "react";
import { convertFormValue } from "./convert-form-value";
import { generateForm } from "./generate-form";

/**
 * A custom form component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.className - The CSS class name for the form.
 * @param {Array} props.columns - The array of form columns.
 * @param {Object} props.values - The initial values for the form fields.
 * @param {boolean} props.isLoading - Flag to indicate if the form is in a loading state.
 * @returns {JSX.Element} The rendered form component.
 */

export const CForm = forwardRef(
  (
    {
      className,
      columns,
      values = {},
      isLoading = false,
      onSubmit,
      footerForm,
      isEnterSubmit,
    }: Type,
    ref: Ref<AnyFormApi>,
  ) => {
    const form = useForm({
      defaultValues: convertFormValue(columns, values, false),
      onSubmit,
    });
    useImperativeHandle(ref, () => form);
    const { t } = useTranslation("locale", { keyPrefix: "Components" });

    return (
      <Spin spinning={isLoading}>
        <form
          className={classNames("c-form", className)}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {isEnterSubmit && <input type="submit" hidden />}
          {columns.map((column, index) =>
            generateForm({
              item: column,
              index,
              values,
              form,
              t,
              name: column.name,
            }),
          )}
        </form>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) =>
            footerForm?.({ canSubmit, isSubmitting, form })
          }
        </form.Subscribe>
      </Spin>
    );
  },
);
/**
 * Represents the configuration options for the form component.
 */
interface Type {
  className?: string;
  columns: IForm[];
  values?: any;
  isLoading?: boolean;
  isEnterSubmit?: boolean;
  onSubmit?: (props: { value: any; formApi: AnyFormApi }) => any;
  footerForm?: (props: {
    canSubmit: boolean;
    isSubmitting: boolean;
    form: AnyFormApi;
  }) => JSX.Element;
}
