import classNames from "classnames";
import type { TFunction } from "i18next";

import { EFormRuleType, EFormType } from "@/enums";
import type { IForm, IFormItemRule, TRuleValidation } from "@/interfaces";
import { API } from "@/utils";

import { Fragment } from "react";
import { FieldInfo } from "./field-info";

/**
 * Generates a form based on the provided configuration.
 *
 * @param item - The configuration object for the form item.
 * @param index - The index of the form item.
 * @param name - The name of the form item.
 * @param values - The values for the form.
 * @param form - The form instance.
 * @param t - The translation function for localization.
 * @returns The generated form item.
 */
export const generateForm = ({
  item,
  index,
  name,
  values,
  form,
  t,
  isLabel = true,
}: {
  item: IForm;
  index: any;
  name: string;
  values: any;
  form: any;
  t: TFunction;
  isLabel?: boolean;
}): any => {
  if (
    item?.formItem?.type === EFormType.hidden ||
    (!!item?.formItem?.condition &&
      !item?.formItem?.condition({ value: values[item.name], index, values }))
  )
    return;
  if (item.formItem) {
    const rules: TRuleValidation[] = [];
    if (!item.formItem.type) item.formItem.type = EFormType.text;

    if (item.formItem.rules) {
      item.formItem.rules
        .filter((item) => !!item)
        .forEach((rule) => mapRule({ rule, rules, item, t }));
    }
    if (!item.formItem.notDefaultValid)
      switch (item.formItem.type) {
        case EFormType.number:
          rules.push(({ value }) => {
            if (
              !value ||
              (/^-?[1-9]*\d+(\.\d{1,2})?$/.test(value) &&
                Number.parseInt(value) < 1000000000)
            )
              return "";
            return t("PleaseEnterOnlyNumber");
          });
          break;
        case EFormType.name:
          rules.push(({ value }) => {
            if (
              !value ||
              /^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF\s-]*$/u.test(value)
            )
              return "";
            return t("PleaseEnterOnlyText");
          });
          break;
        case EFormType.password:
          rules.push(({ value }) => {
            if (
              !value ||
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%)(^&*+_-])[A-Za-z\d#?!@$%)(^&*+_-]{8,20}$/.test(
                value,
              )
            ) {
              return "";
            } else return t("PasswordNeedsToHaveAtLeast8Characters");
          });
          break;
        case EFormType.onlyNumber:
          rules.push(({ value }) => {
            if (!value || /^\d+$/.test(value)) return "";
            return t("PleaseEnterOnlyNumber");
          });
          break;
        case EFormType.otp:
          rules.push(({ value }) => {
            const maxLength = 5;
            if (value && value.length < maxLength)
              return t("PleaseEnterAtLeastCharacters", { min: maxLength });
            return "";
          });
          break;
        default:
      }

    /**
     * Generates the otherProps object for the form component.
     *
     * @param item - The item object.
     * @param name - The name of the item.
     * @param rules - The validation rules for the item.
     * @returns The otherProps object.
     */
    const otherProps = buildProps({ item, name, rules });
    const rule = item.formItem?.rules?.find(
      (rule) => rule.type === EFormRuleType.api,
    );

    delete otherProps.key;
    const runRules = ({ value }: { value: any }) => {
      let message = "";
      otherProps.rules.forEach((rule: any) => {
        if (!message) message = rule({ value, form });
      });
      return message;
    };
    const validateDebounceMs = item.formItem.validateDebounceMs;

    return (
      <form.Field
        key={index + item.name}
        name={otherProps.name}
        validators={{
          onChange: ({ value }: { value: any }) => {
            if (validateDebounceMs) return "";
            return runRules({ value });
          },
          onSubmit: runRules,
          onBlur: validateDebounceMs ? runRules : undefined,
          onBlurAsync: rule?.api?.url
            ? async ({ value }: { value: any }) => {
                const res: any = await API.get({
                  url: rule.api!.url,
                  params: { type: rule.api!.name, value, id: rule.api!.id },
                });
                if (res?.data?.exists === true) {
                  return t("IsAlreadyTaken", { label: rule.api!.label, value });
                }
              }
            : null,
        }}
      >
        {(field: any) => (
          <div
            className={classNames(
              "item type-" + (item?.formItem?.type ?? EFormType.text),
              "sm:col-span-" + (item?.formItem?.col ?? 12),
              "col-span-12",
              {
                error:
                  field.state.meta.errors.length ||
                  field.state.meta.isValidating,
              },
            )}
          >
            {item?.formItem?.render ? (
              item?.formItem?.render({ values, generateForm, index })
            ) : (
              <Fragment>
                {isLabel && (
                  <label
                    title={otherProps.label}
                    className="block text-base-content"
                    htmlFor={otherProps.name}
                  >
                    {otherProps.label}{" "}
                    {otherProps.required && (
                      <span
                        className="text-error"
                        style={{ color: "hsl(var(--destructive))" }}
                      >
                        *
                      </span>
                    )}
                  </label>
                )}
                <FieldInfo field={field} item={item} t={t} form={form} />
              </Fragment>
            )}
          </div>
        )}
      </form.Field>
    );
    // generateInput({ item, values, name: otherProps.name, generateForm, t })
  }
  return null;
};

/**
 * Builds the props object for a form item.
 *
 * @param {Object} options - The options for building the props.
 * @param {IForm} options.item - The form item.
 * @param {number} options.index - The index of the form item.
 * @param {string} [options.name] - The name of the form item.
 * @param {any} options.rules - The validation rules for the form item.
 * @returns {Object} The props object for the form item.
 */
export const buildProps = ({
  item,
  name,
  rules,
}: {
  item: IForm;
  name?: string;
  rules: TRuleValidation[];
}) => {
  const otherProps: any = {
    label: item.title,
    name: name ?? item.name,
    rules,
  };
  otherProps.required = item.formItem?.rules?.some(
    (rule: any) => rule.type === EFormRuleType.required,
  );
  delete otherProps.key;
  return otherProps;
};

/**
 * Maps a form item rule to a validation rule.
 *
 * @param {Object} options - The options for mapping the rule.
 * @param {IFormItemRule} options.rule - The form item rule to map.
 * @param {any[]} options.rules - The array of validation rules.
 * @param {IForm} options.item - The form item.
 * @param {TFunction} options.t - The translation function.
 *
 * @returns {IFormItemRule} The mapped form item rule.
 */
export const mapRule = ({
  rule,
  rules,
  item,
  t,
}: {
  rule: IFormItemRule;
  rules: TRuleValidation[];
  item: IForm;
  t: TFunction;
}) => {
  if (item.formItem) {
    switch (rule.type) {
      case EFormRuleType.required:
        {
          const message = t(
            rule.message ??
              (!item.formItem.type ||
              [
                EFormType.text,
                EFormType.name,
                EFormType.number,
                EFormType.hidden,
                EFormType.password,
                EFormType.textarea,
                EFormType.otp,
              ].includes(item.formItem.type)
                ? "PleaseEnter"
                : "PleaseChoose"),
            {
              title: item.title.toLowerCase(),
            },
          );
          rules.push(({ value }) => (value ? "" : message));
        }
        break;
      case EFormRuleType.email:
        rules.push(({ value }) => {
          const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (
            !value ||
            (typeof value === "string" && regexEmail.test(value.trim()))
          )
            return "";
          return t(rule.message ?? "PleaseEnterAValidEmailAddress");
        });
        break;
      case EFormRuleType.phone:
        rules.push(({ value }) => {
          if (!value) return "";
          else if (/^\d+$/.test(value)) {
            if (value?.trim().length < 10)
              return t("PleaseEnterAtLeastCharacters", { min: 10 });
            else if (value?.trim().length > 12)
              return t("PleaseEnterMaximumCharacters", { max: 12 });
            else return "";
          } else return t("PleaseEnterOnlyNumber");
        });
        break;
      case EFormRuleType.min:
        generateValidMin({ rule, rules, item, t });
        break;
      case EFormRuleType.max:
        generateValidMax({ rule, rules, item, t });
        break;
      case EFormRuleType.onlyText:
        rules.push(({ value }) => {
          if (!value || /^[A-Za-z]+$/.test(value)) return "";
          return t(rule.message ?? "PleaseEnterOnlyText");
        });
        break;
      case EFormRuleType.onlyTextSpace:
        rules.push(({ value }) => {
          if (!value || /^[a-zA-Z ]+$/.test(value)) return "";
          return t(rule.message ?? "PleaseEnterOnlyText");
        });
        break;
      case EFormRuleType.noXss:
        rules.push(({ value }) => {
          if (!value || typeof value !== "string") return "";
          const XSS_PATTERN = /<\/?[a-zA-Z][^>]*>/i;
          if (XSS_PATTERN.test(value)) {
            return t(rule.message ?? "UnsafeInputDetected");
          }
          return "";
        });
        break;
      case EFormRuleType.textarea:
        rules.push(({ value }) => {
          if (value && value?.trim()?.length > 500) {
            return t(rule.message ?? "PleaseEnterMaximumCharacters", {
              max: 500,
            });
          }
          return "";
        });
        break;
      case EFormRuleType.custom:
        if (rule.validator) rules.push(rule.validator);
        break;
      default:
    }
  }
  return rule;
};

/**
 * Generates a validation rule for minimum value.
 *
 * @param {Object} options - The options for generating the validation rule.
 * @param {IFormItemRule} options.rule - The rule object containing the minimum value.
 * @param {any[]} options.rules - The array of existing validation rules.
 * @param {IForm} options.item - The form item object.
 * @param {TFunction options.t - The translation function.
 * @returns {void}
 */
export const generateValidMin = ({
  rule,
  rules,
  item,
  t,
}: {
  rule: IFormItemRule;
  rules: TRuleValidation[];
  item: IForm;
  t: TFunction;
}) => {
  if (item.formItem?.type === EFormType.number)
    rules.push(({ value }) => {
      if (
        !value ||
        (/^0$|^-?[1-9]\d*(\.\d+)?$/.test(value) &&
          Number.parseFloat(value) < rule.value)
      ) {
        return t(rule.message ?? "PleaseEnterMinimumNumber", {
          min: rule.value,
        });
      }
      return "";
    });
  else {
    let message = rule.message ?? "";
    if (!message) {
      if (item.formItem?.type) {
        message = t("PleaseEnterAtLeastNumberCharacters", { min: rule.value });
      } else {
        message = t("PleaseEnterMinimumNumber", { min: rule.value });
      }
    }
    rules.push(({ value }) => {
      if (!value || value.length < rule.value) return message;
      return "";
    });
  }
};

/**
 * Generates a validation rule for the maximum value of a form item.
 *
 * @param {Object} options - The options for generating the validation rule.
 * @param {IFormItemRule} options.rule - The rule object containing the maximum value.
 * @param {any[]} options.rules - The array of existing validation rules.
 * @param {IForm} options.item - The form item object.
 * @param {TFunction} options.t - The translation function.
 */
export const generateValidMax = ({
  rule,
  rules,
  item,
  t,
}: {
  rule: IFormItemRule;
  rules: TRuleValidation[];
  item: IForm;
  t: TFunction;
}) => {
  if (item.formItem?.type === EFormType.number)
    rules.push(({ value }) => {
      if (
        !value ||
        (/^0$|^-?[1-9]\d*(\.\d+)?$/.test(value) &&
          Number.parseFloat(value) > rule.value)
      ) {
        return t(rule.message ?? "PleaseEnterMaximumNumber", {
          max: rule.value,
        });
      }
      return "";
    });
  else {
    let message = rule.message ?? "";
    if (!message) {
      if (item.formItem?.type === EFormType.onlyNumber) {
        message = t("PleaseEnterMaximumNumberCharacters", { max: rule.value });
      } else {
        message = t("PleaseEnterMaximumCharacters", { max: rule.value });
      }
    }
    rules.push(({ value }) => {
      if (!value || value.length <= rule.value) return "";
      return message;
    });
  }
};
