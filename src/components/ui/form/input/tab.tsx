import type { IForm } from "@/interfaces";
import { Tabs } from "antd";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { generateForm } from "../generate-form";

/**
 * Renders a tab component for form input.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the component.
 * @param {IForm[]} [props.column=[]] - The array of form columns.
 * @param {any} props.generateForm - The function to generate the form.
 * @param {any} props.list - The list of items.
 * @returns {JSX.Element} The rendered tab component.
 */
const Component = ({
  name,
  column = [],
  list,
  form,
  values,
}: {
  name: string;
  column?: IForm[];
  list: any;
  form: any;
  values: any;
}) => {
  const { t } = useTranslation("locale", { keyPrefix: "Components" });

  /**
   * Renders the tab content for a given name and index.
   *
   * @param name - The name of the tab.
   * @param i - The index of the tab.
   * @returns An array of JSX elements representing the tab content.
   */
  const render = (name: string, i: number) =>
    column.map((col: any, index: number) => (
      <div
        className={classNames(
          col?.formItem?.classItem,
          "sm:col-span-" + (col?.formItem?.col ?? 12),
          "col-span-12",
        )}
        key={"tabs" + index}
      >
        {generateForm({
          item: col,
          index: index + "_" + i,
          name: `${name}[${i}].${col.name}`,
          t,
          form,
          values: values[i],
        })}
      </div>
    ));

  return (
    <form.Field name={name} mode="array">
      {(field: any) => (
        <Tabs
          destroyInactiveTabPane={true}
          items={field.state.value?.map((_: any, i: number) => ({
            label: list[i].label,
            key: i,
            children: (
              <div className={"grid grid-cols-12 gap-x-5"}>
                {render(name, i)}
              </div>
            ),
          }))}
        ></Tabs>
      )}
    </form.Field>
  );
};
export default Component;
