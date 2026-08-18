import type { ETableAlign } from "@/enums";
import type { ITableItemFilter } from "@/interfaces";
import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData> {
    onCell?: (data: TData) => {
      className?: string;
      rowSpan?: number;
      style?: CSSProperties;
    };
    cellStyle?: (props: TProps) => CSSProperties;
    sorter?: boolean;
    align?: ETableAlign;
    filter?: ITableItemFilter;
    list?: { label: string; value: string | number }[];
  }

  interface FilterFns {
    global: FilterFn<unknown>;
    blank: FilterFn<unknown>;
    notBlank: FilterFn<unknown>;
    includeText: FilterFn<unknown>;
    notIncludeText: FilterFn<unknown>;
    startText: FilterFn<unknown>;
    endText: FilterFn<unknown>;
    sameText: FilterFn<unknown>;
    notSameText: FilterFn<unknown>;
    sameDate: FilterFn<unknown>;
    beforeDate: FilterFn<unknown>;
    afterDate: FilterFn<unknown>;
    greaterNumber: FilterFn<unknown>;
    greaterEqualNumber: FilterFn<unknown>;
    lessNumber: FilterFn<unknown>;
    lessEqualNumber: FilterFn<unknown>;
    equalNumber: FilterFn<unknown>;
    notEqualNumber: FilterFn<unknown>;
    middleNumber: FilterFn<unknown>;
    notMiddleNumber: FilterFn<unknown>;
  }
}
