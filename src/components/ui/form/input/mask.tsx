import classNames from "classnames";
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";

import type { ITableItemFilterList } from "@/interfaces";
import { CButton } from "../../button/index";

/**
 * Component description.
 *
 * @component
 * @example
 * ```tsx
 * <Component
 *   id="inputId"
 *   mask="inputMask"
 *   value="inputValue"
 *   addonBefore={addonBefore}
 *   addonAfter={addonAfter}
 *   form={form}
 *   disabled={false}
 *   placeholder="inputPlaceholder"
 *   onBlur={handleBlur}
 *   onFocus={handleFocus}
 *   onChange={handleChange}
 *   onPressEnter={handlePressEnter}
 *   list={inputList}
 *   height="inputHeight"
 *   width="inputWidth"
 * />
 * ```
 */
const Component = forwardRef(
  (
    {
      id,
      mask,
      value,
      addonBefore,
      addonAfter,
      disabled,
      placeholder,
      onBlur,
      onFocus,
      onChange,
      onKeyDown,
      onPressEnter,
      list,
      height,
      width,
      maxLength,
      testId,
    }: Type,
    ref: Ref<{ input: HTMLInputElement }>,
  ) => {
    useImperativeHandle(ref, () => ({
      input: input.current!,
    }));
    const input = useRef<HTMLInputElement>(null);
    const safeValue =
      value === undefined || value === null || Number.isNaN(value) ? "" : value;

    useEffect(() => {
      if (input.current) {
        input.current.value = String(safeValue);
      } else
        setTimeout(
          () =>
            !!mask && !!input.current && Inputmask(mask).mask(input.current),
        );
    }, [safeValue]);

    /**
     * Retrieves the current cursor position within an input element.
     *
     * @param el - The input element.
     * @returns The cursor position as a number.
     */
    const getCursorPosition = (el: HTMLInputElement) => {
      if (!el) return 0;
      if ("selectionStart" in el) {
        return el.selectionStart ?? 0;
      }
      return 0;
    };

    /**
     * Sets the caret position in an input element.
     *
     * @param input - The HTMLInputElement where the caret position will be set.
     * @param selectionStart - The starting position of the caret.
     * @param selectionEnd - The ending position of the caret.
     */
    const setCaretPosition = (
      input: HTMLInputElement,
      selectionStart: number,
      selectionEnd: number,
    ) => {
      if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    };

    /**
     * Generates the className for the input element.
     *
     * @param addonBefore - Whether there is an addon before the input.
     * @param addonAfter - Whether there is an addon after the input.
     * @param disabled - Whether the input is disabled.
     * @returns The generated className.
     */
    const className = classNames("ant-input", {
      before: !!addonBefore,
      after: !!addonAfter,
      disabled: disabled,
    });
    /**
     * Handles the click event for the given item.
     *
     * @param item - The item that was clicked.
     */
    const handleClick = (item: any) => {
      if (item.value) {
        const value = input.current?.value ?? "";
        const position = getCursorPosition(input.current!);
        input.current!.value =
          value.slice(0, position) + item.value + value.slice(position);
        if (onChange) onChange({ target: input.current });
        setCaretPosition(
          input.current!,
          position + item.value.toString().length,
          position + item.value.toString().length,
        );
      }
    };

    /**
     * Renders a button component for each item in the list.
     *
     * @returns The rendered button components.
     */
    const renderButton = () =>
      list && (
        <div className={"mt-2 flex flex-wrap gap-2"}>
          {list.map((item, index) => (
            <CButton
              key={item.value!.toString() + index}
              text={item.label}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      );

    return (
      <Fragment>
        <div className={"relative"}>
          {!!addonBefore && <span className="before">{addonBefore()}</span>}
          <input
            id={id}
            ref={input}
            className={className}
            readOnly={disabled}
            defaultValue={safeValue}
            maxLength={maxLength}
            placeholder={placeholder}
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onKeyUp={(e) => e.key === "Enter" && onPressEnter?.(e)}
            style={{ height, width }}
            data-testid={testId}
          />
          {!!addonAfter && <span className="after">{addonAfter()}</span>}
        </div>
        {renderButton()}
      </Fragment>
    );
  },
);
Component.displayName = "Mask Input";
/**
 * Represents the properties for the mask input component.
 */
interface Type {
  id?: string;
  mask?: any;
  value?: string;
  addonBefore?: () => JSX.Element;
  addonAfter?: () => JSX.Element;
  disabled?: boolean;
  placeholder: string;
  onBlur?: (e: any) => any;
  onFocus?: (e: any) => any;
  onChange?: (e: any) => any;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => any;
  onPressEnter?: (e: any) => any;
  list?: ITableItemFilterList[];
  height?: number;
  width?: number;
  maxLength?: number;
  testId?: string;
}
export default Component;
