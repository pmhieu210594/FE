import type {
  ColumnPinningState,
  FilterFn,
  Table,
} from "@tanstack/react-table";
import { Popconfirm, Spin } from "antd";
import dayjs from "dayjs";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
  type UIEventHandler,
} from "react";
import { useTranslation } from "react-i18next";

import { EIcon, ETableAlign } from "@/enums";
import type { IDataTable, ITableItem, IPaginationQuery } from "@/interfaces";
import { CButton } from "../button/index";
import { CGridVirtualizer } from "../grid-virtualizer";
import { CSearch } from "../search";
import { CSvgIcon } from "../svg-icon";
import { CTooltip } from "../tooltip";

type TGroupedHeaderRow = {
  className?: string;
  cells: {
    key: string;
    title: JSX.Element | string;
    columnIds: string[];
    className?: string;
  }[];
};
/**
 * A custom data table component.
 *
 * @component
 */
const CDataTable = <TData,>(
  {
    columns = [],
    data,
    heightCell = 28,
    defaultParams = {},
    rightHeader,
    leftHeader,
    paginationDescription = (from: number, to: number, total: number) =>
      from + "-" + to + " of " + total + " items",
    showSearch = true,
    searchValue: controlledSearchValue,
    onSearchChange,
    isLoading = false,
    action,
    expandedRow,
    expandedKeys,
    groupedHeaderRows,
    ...props
  }: Props,
  ref: Ref<Table<TData> | undefined>,
) => {
  useImperativeHandle(ref, () => refFilter.current);
  const { t } = useTranslation("locale", { keyPrefix: "Components" });
  const [localSearchValue, setLocalSearchValue] = useState("");
  const searchValue = controlledSearchValue ?? localSearchValue;
  const savedPageIndexRef = useRef<number | null>(null);
  const hasActiveSearchRef = useRef(false);

  const columnsWithAction = useMemo(() => {
    const hasActionColumn = columns.some((item) => item.name === "action");
    if (!action?.label || hasActionColumn) {
      return columns;
    }

    return [
      ...columns,
      {
        name: "action",
        title: t("actions"),
        tableItem: {
          width: action.width ?? 90,
          fixed: action.fixed,
          align: ETableAlign.center,
          render: (_: string, data: any) => (
            <div className="action flex w-full items-center justify-center gap-2">
              {action?.render?.(data)}
              {!!action.onDisable && (
                <CTooltip
                  title={t(data.isDisable ? "Disabled" : "Enabled", {
                    name: action.name(data),
                    label: action.label.toLowerCase(),
                  })}
                >
                  <Popconfirm
                    title={t(
                      data.isDisable
                        ? "AreYouSureWantEnable"
                        : "AreYouSureWantDisable",
                      {
                        name: action.name(data),
                        label: action.label.toLowerCase(),
                      },
                    )}
                    onConfirm={() =>
                      action.onDisable({
                        id: data.code ?? data.id ?? data,
                        isDisable: !data.isDisable,
                      })
                    }
                  >
                    <button
                      title={t(data.isDisable ? "Disabled" : "Enabled", {
                        name: action.name(data),
                        label: action.label.toLowerCase(),
                      })}
                    >
                      {data.isDisable ? (
                        <CSvgIcon name={EIcon.disable} className="warning" />
                      ) : (
                        <CSvgIcon name={EIcon.check} className="success" />
                      )}
                    </button>
                  </Popconfirm>
                </CTooltip>
              )}

              {!!action.onEdit && (
                <CTooltip
                  title={t("Edit", {
                    name: action.name(data),
                    label: action.label.toLowerCase(),
                  })}
                >
                  <button
                    title={t("Edit", {
                      name: action.name(data),
                      label: action.label.toLowerCase(),
                    })}
                    onClick={() =>
                      action.onEdit({
                        id: data.code ?? data.id ?? data,
                        params: defaultParams,
                      })
                    }
                  >
                    <CSvgIcon name={EIcon.edit} className="primary" />
                  </button>
                </CTooltip>
              )}

              {!!action.onDelete && (
                <CTooltip
                  title={t("Delete", {
                    name: action.name(data),
                    label: action.label.toLowerCase(),
                  })}
                >
                  <Popconfirm
                    title={t("AreYouSureWantDelete", {
                      name: action.name(data),
                      label: action.label.toLowerCase(),
                    })}
                    onConfirm={() =>
                      action.onDelete(data.code ?? data.id ?? data)
                    }
                  >
                    <button
                      title={t("Delete", {
                        name: action.name(data),
                        label: action.label.toLowerCase(),
                      })}
                    >
                      <CSvgIcon name={EIcon.trash} className="error" />
                    </button>
                  </Popconfirm>
                </CTooltip>
              )}
            </div>
          ),
        } as ITableItem,
      } as IDataTable,
    ];
  }, [columns, action, t, defaultParams]);

  const columnPinning: ColumnPinningState = { left: [], right: [] };
  columnsWithAction.forEach((item) => {
    if (item.tableItem?.fixed && item.name) {
      if (item.tableItem.fixed === "left") columnPinning.left?.push(item.name);
      else if (item.tableItem.fixed === "right")
        columnPinning.right?.push(item.name);
    }
    if (item?.tableItem?.isDateTime && !item.tableItem?.render) {
      item.tableItem.render = (text: any) => (
        <CTooltip title={dayjs(text).localeData().longDateFormat("L")}>
          {dayjs(text).localeData().longDateFormat("L")}
        </CTooltip>
      );
    }
  });

  /**
   * Renders the header of the data table.
   *
   * @returns The JSX element representing the header.
   */
  const renderHeader = () =>
    (!!showSearch || !!leftHeader || !!rightHeader) && (
      <div className="top-header">
        <div className="flex items-center gap-2">
          {!!action?.onAdd && (
            <CButton
              icon={<CSvgIcon name={EIcon.plus} size={12} />}
              text={action?.labelAdd}
              onClick={() =>
                action?.onAdd({ data: undefined, isVisible: true })
              }
            />
          )}
          {rightHeader}
          <Spin spinning={isLoading} />
        </div>

        {(!!showSearch || !!leftHeader) && (
          <div className={"right"}>
            {showSearch ? (
              <CSearch
                value={searchValue}
                onTableChange={(value) => {
                  if (onSearchChange) {
                    onSearchChange(value);
                    return;
                  }

                  const isClearing = !value;
                  setLocalSearchValue(value ?? "");
                  if (!isClearing && !hasActiveSearchRef.current) {
                    savedPageIndexRef.current =
                      refFilter.current?.getState().pagination.pageIndex ?? 0;
                    hasActiveSearchRef.current = true;
                    refFilter.current?.setGlobalFilter(value);
                    refFilter.current?.setPageIndex(0);
                  } else if (isClearing && hasActiveSearchRef.current) {
                    const restorePage = savedPageIndexRef.current ?? 0;
                    savedPageIndexRef.current = null;
                    hasActiveSearchRef.current = false;
                    refFilter.current?.setGlobalFilter("");
                    refFilter.current?.setPageIndex(restorePage);
                  } else if (!isClearing) {
                    refFilter.current?.setGlobalFilter(value);
                    refFilter.current?.setPageIndex(0);
                  }
                }}
              />
            ) : (
              <div />
            )}
            {leftHeader}
          </div>
        )}
      </div>
    );

  const refFilter = useRef<Table<any>>();

  return data ? (
    <div className="data-table">
      {renderHeader()}
      <CGridVirtualizer<TData>
        heightCell={heightCell}
        ref={refFilter}
        columnPinning={columnPinning}
        data={data}
        pageSize={props.pagination?.perPage}
        pagination={props.pagination}
        paginationDescription={paginationDescription}
        columns={columnsWithAction.map((item) => ({
          ...(item.tableItem?.filterValue
            ? {
                id: item.name,
                accessorFn: (row: any) => item.tableItem!.filterValue!(row),
              }
            : { accessorKey: item.name }),
          header: item.title,
          size: item.tableItem?.width,
          meta: {
            sorter: item.tableItem?.sorter,
            onCell: item.tableItem?.onCell,
            align: item.tableItem?.align,
            filter: item.tableItem?.filter,
            list: item.tableItem?.list,
          },
          cell:
            item?.tableItem?.render && item.name
              ? ({ row, column }) =>
                  item.tableItem!.render!(
                    (row.original as Record<string, any>)[item.name ?? ""],
                    row.original,
                    {
                      columnId: column.id,
                      columnSize: column.getSize(),
                    },
                  )
              : undefined,
        }))}
        expandedRow={expandedRow}
        expandedKeys={expandedKeys}
        groupedHeaderRows={groupedHeaderRows}
        {...props}
      />
    </div>
  ) : null;
};
const ForwardedCDataTable = forwardRef(CDataTable) as <TData>(
  props: Props & { ref?: Ref<Table<TData> | undefined> },
) => ReturnType<typeof CDataTable>;

export { ForwardedCDataTable as CDataTable };
/**
 * Represents the type definition for the DataTable component.
 *
 * @remarks
 * This interface defines the props for the DataTable component, including the columns, default request, header elements, save flag, pagination description, facade, data, data formatting function, pagination and search visibility, row actions, loading state, table height, expandable rows, and scroll event handler.
 */
interface Props {
  columns: IDataTable[];
  groupedHeaderRows?: TGroupedHeaderRow[];
  defaultParams?: IPaginationQuery;
  rightHeader?: JSX.Element;
  leftHeader?: JSX.Element;
  paginationDescription?: (from: number, to: number, total: number) => string;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    onChange: ({ page, perPage }: { page: number; perPage: number }) => void;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  data?: any[];
  isPagination?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value?: string) => void;
  onRow?: (data: any) => { onDoubleClick?: () => void; onClick?: () => void };
  isLoading?: boolean;
  action?: {
    onDisable?: any;
    onEdit?: any;
    onDelete?: any;
    label: any;
    name: any;
    onAdd?: any;
    labelAdd?: any;
    render?: any;
    width?: number;
    fixed?: string;
  };
  filterGlobal?: FilterFn<any>;
  style?: CSSProperties;
  onScroll?: UIEventHandler<HTMLDivElement>;
  isExpanded?: boolean;
  onExpand?: (row: any) => void;
  heightCell?: number;
  rowSelection?: {
    onChange?: (selectedRows: any[]) => void;
    columnWidth?: number;
  };
  isVirtualized?: boolean;
  expandedRow?: any;
  expandedKeys?: Set<string>;
  scaleColumns?: boolean;
  autoResetPageIndex?: boolean;
  className?: string;
  isResizing?: boolean;
}
