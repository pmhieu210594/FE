import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Cell,
  type CellContext,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ExpandedState,
  type FilterFn,
  type FilterFns,
  type PaginationState,
  type SortingState,
  type Table,
  type TableOptions,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox, DatePicker, Dropdown, theme } from "antd";
import classNames from "classnames";
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type CSSProperties,
  type MutableRefObject,
  type Ref,
  type RefObject,
  type SetStateAction,
  type UIEventHandler,
} from "react";
import { useTranslation } from "react-i18next";

import { EIcon, ETableFilterType } from "@/enums";
import { TYPE_FORMAT_DATE } from "@/utils/variable";
import dayjs from "dayjs";
import { CButton } from "../button/index";
import { CIMask, CISelect } from "../form/input";
import { CPagination } from "../pagination";
import { CSvgIcon } from "../svg-icon";
import "./index.less";

const DEFAULT_COMPONENT_PAGE_SIZE = 100;

/**
 * Renders a virtual scroll grid component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} [props.onScroll] - The callback function for scrolling.
 * @param {number} [props.widthCell=28] - The width of each cell in the grid.
 * @param {number} [props.heightCell=28] - The height of each cell in the grid.
 * @param {Array} props.data - The array of rows in the grid.
 * @param {Array} props.columns - The array of columns in the grid.
 * @param {Function} props.render - The render function for each cell in the grid.
 * @param {*} [props.firstItem] - The first item to render in the grid.
 * @returns {JSX.Element} The rendered virtual scroll grid component.
 */

interface Props<TData> {
  onScroll?: UIEventHandler<HTMLDivElement>;
  widthCell?: number;
  heightCell?: number;
  data: TData[];
  columns: ColumnDef<TData>[];
  firstItem?: any;
  columnPinning?: ColumnPinningState;
  isExpanded?: boolean;
  isResizing?: boolean;
  onExpand?: (row: any) => void;
  isPagination?: boolean;
  paginationDescription?: (from: number, to: number, total: number) => string;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    onChange: ({ page, perPage }: { page: number; perPage: number }) => void;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  isFilter?: boolean;
  filterGlobal?: FilterFn<TData>;
  onRow?: (data: any) => { onDoubleClick?: () => void; onClick?: () => void };
  rowSelection?: {
    onChange?: (selectedRows: any[]) => void;
    columnWidth?: number;
  };
  pageSize?: number;
  parentRef?: RefObject<HTMLDivElement>;
  style?: CSSProperties;
  className?: string;
  isVirtualized?: boolean;
  expandedRow?: any;
  expandedKeys?: Set<string>;
  scaleColumns?: boolean;
  autoResetPageIndex?: boolean;
  groupedHeaderRows?: {
    className?: string;
    cells: {
      key: string;
      title: JSX.Element | string;
      columnIds: string[];
      className?: string;
    }[];
  }[];
}

const CGridVirtualizer = <TData,>(
  {
    columns,
    data,
    widthCell = 28,
    heightCell = 28,
    columnPinning = { left: [], right: [] },
    isResizing = true,
    isExpanded,
    onExpand,
    isPagination = true,
    rowSelection,
    expandedRow,
    expandedKeys,
    scaleColumns = false,
    ...props
  }: Props<TData>,
  ref: Ref<Table<TData> | undefined>,
) => {
  //expand row
  const expandRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  useEffect(() => {
    if (expandedRow) {
      if (expandedRow.parent_uuid) {
        setTimeout(() => {
          expandRefs.current[expandedRow.parent_uuid]?.click();
        }, 50);
      } else {
        setTimeout(() => {
          expandRefs.current[expandedRow.task_uuid]?.click();
          expandRefs.current[expandedRow.task_uuid]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          expandRefs.current[expandedRow.task_uuid]?.focus();
        }, 50);
      }
    }
  }, [expandedRow]);

  if (isExpanded && columns.length > 0) {
    columns[0].meta ??= {};
    const firstColumnMeta = columns[0].meta as any;
    const currentFirstColumnCell = columns[0].cell as any;
    // Prevent nested wrapping when the same columns reference is reused across renders.
    // If current cell is already our expanded wrapper, recover the original base renderer.
    const resolvedBaseCell = currentFirstColumnCell?.__isExpandedWrapper
      ? currentFirstColumnCell.__baseCell
      : currentFirstColumnCell;

    if (!firstColumnMeta.__expandedBaseCell) {
      firstColumnMeta.__expandedBaseCell = resolvedBaseCell;
    }
    const firstColumnCell = firstColumnMeta.__expandedBaseCell;

    const expandedWrapperCell = (ctx: CellContext<any, any>) => {
      const { row, getValue } = ctx;
      return (
        <Fragment>
          {row.getCanExpand() && (
            <button
              ref={(el) => {
                if (el) expandRefs.current[row.original.task_uuid] = el;
              }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
                onExpand?.(row.original);
              }}
            >
              <CSvgIcon
                name={EIcon.arrow}
                size={13}
                className={classNames({ "rotate-90": row.getIsExpanded() })}
              />
            </button>
          )}
          {firstColumnCell ? (
            flexRender(firstColumnCell, ctx)
          ) : (
            <span>{getValue()}</span>
          )}
        </Fragment>
      );
    };
    (expandedWrapperCell as any).__isExpandedWrapper = true;
    (expandedWrapperCell as any).__baseCell = firstColumnCell;
    columns[0].cell = expandedWrapperCell;
    columns[0].meta.cellStyle = ({ row }: CellContext<any, any>) => ({
      paddingLeft: `${row.depth * 1.5}rem`,
    });
  }
  if (rowSelection) {
    const header = ({ table }: any) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    );
    const cell = ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    );
    columns.unshift({
      accessorKey: "rowSelection",
      size: rowSelection.columnWidth ?? 30,
      header,
      cell,
    });
  }

  const { i18n } = useTranslation("locale", { keyPrefix: "Components" });
  const [state, setState] = useState<{ columns?: ColumnDef<TData>[] }>({});
  const parentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scaleColumns) {
      const calcColumns = () => {
        if (!parentRef.current) return;
        const containerWidth = parentRef.current.getBoundingClientRect().width;
        if (containerWidth === 0) return;
        // Keep a safety gap for borders/rounding/scrollbar metrics so default view does not trigger horizontal scrollbars.
        const availableWidth = Math.max(containerWidth - 16, 0);
        const sizes = columns.map((col) => col.size ?? 0);
        const totalFixed = sizes.reduce((a, b) => a + b, 0);
        const unsizedCount = sizes.filter((s) => !s).length;
        let newColumns: ColumnDef<TData>[];
        if (unsizedCount > 0 && totalFixed < availableWidth) {
          const fill = (availableWidth - totalFixed) / unsizedCount;
          newColumns = columns.map((col) => ({
            ...col,
            size: col.size ?? fill,
          }));
        } else {
          const total = totalFixed > 0 ? totalFixed : availableWidth;
          const scale = availableWidth / total;
          newColumns = columns.map((col) => ({
            ...col,
            size: (col.size ?? 80) * scale,
          }));
        }
        newColumns.at(-1)!.size = (newColumns.at(-1)!.size ?? 0) - 1;
        setState({ columns: newColumns });
      };
      calcColumns();
      const observer = new ResizeObserver(calcColumns);
      if (parentRef.current) observer.observe(parentRef.current);
      return () => observer.disconnect();
    } else if (parentRef.current) {
      const arrayWidthColumn = columns.map((column) => column.size ?? 0);
      const totalWidthColumns = arrayWidthColumn.reduce(
        (prve, next) => prve + next,
        0,
      );
      const widthCell =
        (parentRef.current.getBoundingClientRect().width - totalWidthColumns) /
        arrayWidthColumn.filter((size) => !size).length;
      const newColumns = columns.map((column) => ({
        ...column,
        size: column.size ?? widthCell,
      }));
      newColumns.at(-1)!.size = (newColumns.at(-1)!.size ?? 0) - 1;
      setState({ columns: newColumns });
    }
  }, [columns, i18n.language, scaleColumns]);
  const refFilter = useRef<Table<any>>();
  useImperativeHandle(ref, () => refFilter.current);

  return useMemo(
    () => (
      <div ref={parentRef}>
        {state.columns && (
          <ForwardedComponent<TData>
            {...props}
            ref={refFilter}
            data={structuredClone(data)}
            widthCell={widthCell}
            heightCell={heightCell}
            parentRef={parentRef}
            columns={state.columns}
            rowSelection={rowSelection}
            columnPinning={columnPinning}
            isResizing={isResizing}
            isExpanded={isExpanded}
            pageSize={props.pageSize ?? DEFAULT_COMPONENT_PAGE_SIZE}
            isPagination={isPagination}
            isFilter={columns.some(
              (obj) => obj.meta && Object.keys(obj.meta).includes("filter"),
            )}
            expandedRow={expandedRow}
            expandedKeys={expandedKeys}
          />
        )}
      </div>
    ),
    [
      columnPinning,
      columns,
      data,
      expandedKeys,
      expandedRow,
      heightCell,
      isExpanded,
      isPagination,
      isResizing,
      props,
      rowSelection,
      state,
      widthCell,
    ],
  );
};
const ForwardedCGridVirtualizer = forwardRef(CGridVirtualizer) as <TData>(
  props: Props<TData> & { ref?: Ref<Table<TData> | undefined> },
) => ReturnType<typeof CGridVirtualizer>;

export { ForwardedCGridVirtualizer as CGridVirtualizer };
/**
 * Calculates the number of pages based on the height of the document body.
 *
 * @param height - The height of each page in pixels. Default is 39.
 * @param minusNumber - The number to subtract from the calculated page count. Default is 2.
 * @returns The number of pages based on the height of the document body.
 */
export const getSizePageByHeight = ({
  height = 28,
  minusNumber = 4,
  element = document.getElementsByTagName("tbody")[0],
}: any) =>
  Math.max(
    1,
    Math.floor(
      (document.body.getBoundingClientRect().height -
        element.getBoundingClientRect().top) /
        height,
    ) - minusNumber,
  );

export const tableFilterFns = {
  global: (
    row: any,
    columnId: string,
    value: any,
    addMeta: any,
    filterGlobal?: FilterFn<any>,
  ) => {
    return !filterGlobal || filterGlobal(row, columnId, value, addMeta);
  },
  blank: (row: any, columnId: string) =>
    String(row.getValue(columnId) ?? "").length !== 0,
  notBlank: (row: any, columnId: string) =>
    String(row.getValue(columnId) ?? "").length === 0,
  includeText: (row: any, columnId: string, value: any) =>
    !value || (row.getValue(columnId) as string)?.includes(value),
  notIncludeText: (row: any, columnId: string, value: any) =>
    !value || !(row.getValue(columnId) as string)?.includes(value),
  startText: (row: any, columnId: string, value: any) =>
    !value || (row.getValue(columnId) as string)?.startsWith(value),
  endText: (row: any, columnId: string, value: any) =>
    !value || (row.getValue(columnId) as string)?.endsWith(value),
  sameText: (row: any, columnId: string, value: any) =>
    !value || row.getValue(columnId) === value,
  notSameText: (row: any, columnId: string, value: any) =>
    !value || row.getValue(columnId) !== value,
  sameDate: (row: any, columnId: string, value: any) =>
    !value || value.isSame(row.getValue(columnId)),
  beforeDate: (row: any, columnId: string, value: any) =>
    !value || value.isBefore(row.getValue(columnId)),
  afterDate: (row: any, columnId: string, value: any) =>
    !value || value.isAfter(row.getValue(columnId)),
  greaterNumber: (row: any, columnId: string, value: any) =>
    value === undefined || (row.getValue(columnId) as number) > value,
  greaterEqualNumber: (row: any, columnId: string, value: any) =>
    value === undefined || (row.getValue(columnId) as number) >= value,
  lessNumber: (row: any, columnId: string, value: any) =>
    value === undefined || (row.getValue(columnId) as number) < value,
  lessEqualNumber: (row: any, columnId: string, value: any) =>
    value === undefined || (row.getValue(columnId) as number) <= value,
  equalNumber: (row: any, columnId: string, value: any) =>
    value === undefined || row.getValue(columnId) === value,
  notEqualNumber: (row: any, columnId: string, value: any) =>
    value === undefined || row.getValue(columnId) !== value,
  middleNumber: (row: any, columnId: string, value: any) =>
    !value ||
    value?.length !== 2 ||
    ((row.getValue(columnId) as number) >= value[0] &&
      (row.getValue(columnId) as number) <= value[1]),
  notMiddleNumber: (row: any, columnId: string, value: any) =>
    !value ||
    value?.length !== 2 ||
    ((row.getValue(columnId) as number) < value[0] &&
      (row.getValue(columnId) as number) > value[1]),
};

export const applyFilterOptions = <TData,>(
  option: TableOptions<TData>,
  columnFilters: ColumnFiltersState,
  globalFilter: string,
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>,
  setGlobalFilter: (v: string) => void,
) => {
  if (!option.state) return;
  option.state.columnFilters = columnFilters;
  option.state.globalFilter = globalFilter;
  option.onColumnFiltersChange = setColumnFilters;
  option.onGlobalFilterChange = setGlobalFilter;
  option.getFilteredRowModel = getFilteredRowModel();
  option.getFacetedRowModel = getFacetedRowModel();
  option.getFacetedUniqueValues = getFacetedUniqueValues();
  option.getFacetedMinMaxValues = getFacetedMinMaxValues();
};

export const applyResizingOptions = <TData,>(
  option: TableOptions<TData>,
  widthCell: number | undefined,
  parentRef: RefObject<HTMLDivElement> | undefined,
) => {
  option.columnResizeMode = "onChange";
  option.defaultColumn = {
    minSize: widthCell,
    maxSize: parentRef?.current?.getBoundingClientRect().width ?? 1200,
  };
};

export const applyPaginationOptions = <TData,>(
  option: TableOptions<TData>,
  pagination: PaginationState,
  setPagination: Dispatch<SetStateAction<PaginationState>>,
  isServerPagination = false,
) => {
  if (!option.state) return;
  option.state.pagination = pagination;
  option.onPaginationChange = setPagination;
  if (!isServerPagination)
    option.getPaginationRowModel = getPaginationRowModel();
};

export const applyRowSelectionOptions = <TData,>(
  option: TableOptions<TData>,
  rowSelections: Record<string, boolean>,
  setRowSelections: Dispatch<SetStateAction<Record<string, boolean>>>,
) => {
  if (!option.state) return;
  option.state.rowSelection = rowSelections;
  option.onRowSelectionChange = setRowSelections;
  option.enableRowSelection = true;
};

export const applyExpandedOptions = <TData,>(
  option: TableOptions<TData>,
  expanded: ExpandedState,
  setExpanded: Dispatch<SetStateAction<ExpandedState>>,
  expandedKeys: Set<string> | undefined,
  isFilter: boolean | undefined,
  isPagination: boolean | undefined,
) => {
  if (!option.state) return;
  option.getSubRows = (row: any) => row.children;
  option.state.expanded = expanded;
  option.onExpandedChange = setExpanded;
  option.getExpandedRowModel = getExpandedRowModel();
  if (expandedKeys)
    option.getRowId = (row: any) => row.task_uuid ?? row.id ?? row.code;
  if (isFilter) option.filterFromLeafRows = true;
  if (isPagination) option.paginateExpandedRows = false;
};

export const applySortingOptions = <TData,>(
  option: TableOptions<TData>,
  sorting: SortingState,
  setSorting: Dispatch<SetStateAction<SortingState>>,
) => {
  if (!option.state) return;
  option.state.sorting = sorting;
  option.onSortingChange = setSorting;
  option.getSortedRowModel = getSortedRowModel();
};

export const expandedKeysToState = (keys?: Set<string>): ExpandedState =>
  keys ? Object.fromEntries([...keys].map((k) => [k, true])) : {};

export const focusExpandedRowCell = (expandedRow: any, today: string) => {
  if (expandedRow?.parent_uuid == null) return;
  setTimeout(() => {
    const targetKey = `${expandedRow?.task_uuid}|work_progress_${today}`;
    const wpToday = document.querySelector(
      `td[data-key="${targetKey}"] input`,
    ) as HTMLInputElement;
    if (wpToday) {
      if (!wpToday?.disabled)
        wpToday.scrollIntoView({ behavior: "smooth", block: "center" });
      wpToday.focus();
      wpToday.click();
    }
  }, 100);
};

export const getColumnPinningStyles = (column: Column<any>): CSSProperties => {
  if (!column) return {};
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");
  const styleRight = isFirstRightPinnedColumn
    ? "4px 0 4px -4px gray inset"
    : undefined;
  return {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : styleRight,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
    paddingRight: column?.columnDef?.meta?.filter ? "1.5rem" : undefined,
  };
};

export const loopSelection = ({
  id,
  array,
}: {
  id: string;
  array: any[];
}): any => {
  let data: any;
  array.forEach((element: any) => {
    if (!data && element.id === id) {
      data = element;
    } else if (!data && element.children) {
      data = loopSelection({ id, array: element.children });
    }
  });
  return data;
};

const Component = <TData,>(
  {
    data,
    firstItem,
    widthCell,
    heightCell,
    parentRef,
    columns,
    columnPinning = {},
    isResizing,
    isExpanded,
    pageSize,
    isPagination,
    pagination: serverPagination,
    paginationDescription,
    isFilter,
    filterGlobal,
    onRow,
    rowSelection,
    className,
    style,
    onScroll,
    isVirtualized,
    expandedRow,
    expandedKeys,
    autoResetPageIndex = true,
    groupedHeaderRows,
  }: Omit<Props<TData>, "onExpand" | "scaleColumns">,
  ref: Ref<Table<TData> | undefined>,
) => {
  useImperativeHandle(ref, () => table);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const option: TableOptions<TData> = {
    filterFns: {
      ...tableFilterFns,
      global: (row, columnId, value, addMeta) => {
        return !filterGlobal || filterGlobal(row, columnId, value, addMeta);
      },
    },
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    initialState: {
      columnPinning,
    },
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "global",
    enableColumnFilters: isFilter,
    getRowId: (row: any, index) =>
      row.id ??
      row.customerId ??
      row.organizationId ??
      row.projectId ??
      row.ticketId ??
      row.repositoryId ??
      row.teamId ??
      row.task_uuid ??
      row.code ??
      index.toString(),
    autoResetPageIndex,
  };

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const refFilterTypeCurrent = useRef<any>({});
  if (isFilter) {
    applyFilterOptions(
      option,
      columnFilters,
      globalFilter,
      setColumnFilters,
      setGlobalFilter,
    );
  }

  if (isResizing) {
    applyResizingOptions(option, widthCell, parentRef);
  }

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? DEFAULT_COMPONENT_PAGE_SIZE,
  });
  if (isPagination) {
    applyPaginationOptions(
      option,
      pagination,
      setPagination,
      !!serverPagination,
    );
  }

  const [rowSelections, setRowSelections] = useState<Record<string, boolean>>(
    {},
  );
  useEffect(() => {
    if (rowSelection?.onChange) {
      rowSelection.onChange(
        Object.keys(rowSelections)
          ?.filter((key: string) => !!rowSelections[key])
          ?.map((id) => loopSelection({ id, array: data })),
      );
    }
  }, [rowSelections]);
  if (rowSelection) {
    applyRowSelectionOptions(option, rowSelections, setRowSelections);
  }

  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    expandedKeysToState(expandedKeys),
  );
  useEffect(() => {
    if (expandedKeys) setExpanded(expandedKeysToState(expandedKeys));
  }, [expandedKeys]);
  if (isExpanded) {
    applyExpandedOptions(
      option,
      expanded,
      setExpanded,
      expandedKeys,
      isFilter,
      isPagination,
    );
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  const isSorter = columns.some(
    (obj) => obj.meta && Object.keys(obj.meta).includes("sorter"),
  );
  if (isSorter) {
    applySortingOptions(option, sorting, setSorting);
  }
  const table = useReactTable<any>(option);
  /**
   * Instead of calling `column.getSize()` on every render for every header
   * and especially every data cell (very expensive),
   * we will calculate all column sizes at once at the root table level in a useMemo
   * and pass the column sizes down as CSS variables to the <table> element.
   */

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    table
      .getAllColumns()
      .map((c) => c.getSize())
      .join(","),
  ]);

  /**
   * A reference to the parent element.
   */

  const { rows } = table.getRowModel();

  /**
   * Virtualizes the rows in the grid component.
   *
   * @remarks
   * This virtualizer is responsible for rendering a subset of rows based on the visible area of the grid.
   *
   * @param count - The total number of rows in the grid.
   * @param getScrollElement - A function that returns the scroll element of the grid.
   * @param estimateSize - A function that estimates the size of each row.
   * @param overscan - The number of additional rows to render outside the visible area.
   *
   * @returns The virtualizer object for the rows in the grid.
   */
  const rowVirtualizer = useVirtualizer({
    enabled: isVirtualized,
    count: rows?.length ?? 0,
    getScrollElement: () => parentRef?.current || document.body,
    estimateSize: () => heightCell!,
    measureElement:
      typeof globalThis !== "undefined" &&
      globalThis.window !== undefined &&
      !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 0,
  });
  /**
   * Retrieves the virtual items for the grid.
   *
   * @returns An array of virtual items for the grid.
   */
  const virtualRows = rowVirtualizer.getVirtualItems();

  const visibleColumns = table.getVisibleLeafColumns();
  /**
   * Initializes the column virtualizer for the grid.
   *
   * @param {Object} options - The options for the column virtualizer.
   * @param {boolean} options.horizontal - Specifies if the virtualizer is horizontal.
   * @param {number} options.count - The number of columns in the virtualizer.
   * @param {Function} options.getScrollElement - A function that returns the scroll element.
   * @param {Function} options.estimateSize - A function that estimates the size of a column.
   * @param {number} options.overscan - The number of additional columns to render outside the visible area.
   */
  const columnVirtualizer = useVirtualizer({
    enabled: isVirtualized,
    horizontal: true,
    count: visibleColumns.length,
    getScrollElement: () => parentRef?.current || document.body,
    estimateSize: (index) => visibleColumns[index].getSize(), //estimate width of each column for accurate scrollbar dragging
    overscan: 0,
  });
  /**
   * Retrieves the virtualized columns for the grid.
   *
   * @returns An array of virtualized column items.
   */
  const virtualColumns = columnVirtualizer.getVirtualItems();

  let virtualPaddingLeft: number | undefined;
  let virtualPaddingRight: number | undefined;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() - (virtualColumns.at(-1)?.end ?? 0);
  }

  //These are the important styles to make sticky column pinning work!
  //Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
  //View the index.css file for more needed styles such as border-collapse: separate
  const getCommonPinningStyles = (column: Column<any>): CSSProperties =>
    getColumnPinningStyles(column);
  const headerGroups = table.getHeaderGroups();
  const getGroupedHeaderWidth = (columnIds: string[]) =>
    columnIds.reduce(
      (sum, columnId) => sum + (table.getColumn(columnId)?.getSize() ?? 0),
      0,
    );

  const { t } = useTranslation("locale", { keyPrefix: "Components" });
  const renderDropdownItem = (column: Column<any>) =>
    [
      {
        label: t("Hide"),
        key: "hide",
        onClick: () => column.toggleVisibility(!column.getIsVisible()),
      },
      column?.getSize() !== column?.columnDef?.size && {
        label: t("ResetSize"),
        key: "reset-size",
        onClick: () => column?.resetSize(),
      },
      column?.getIsPinned() !== "left" && {
        label: t("PinLeft"),
        key: "pin-left",
        onClick: () => column.pin("left"),
      },
      column?.getIsPinned() !== "right" && {
        label: t("PinRight"),
        key: "pin-right",
        onClick: () => column.pin("right"),
      },
      column?.getIsPinned() && {
        label: t("ResetPin"),
        key: "reset-pin",
        onClick: () => column.pin(false),
      },
    ].filter(
      (item): item is { label: string; key: string; onClick: () => void } =>
        !!item,
    );

  const refHeaderGroups = useRef(headerGroups);
  const visibility = refHeaderGroups.current.map((headerGroup) =>
    headerGroup.headers
      .map(
        (header, index) =>
          columnVisibility[header.id] === false && {
            id: header.id,
            index,
          },
      )
      .filter(Boolean),
  );
  //Focus to work progress cell to logtime when task is subTask
  const rowRefs = useRef<Record<string, HTMLTableRowElement[]>>({});
  const today = new Date().toISOString().split("T")[0];
  useEffect(() => focusExpandedRowCell(expandedRow, today), [expandedRow]);
  const globalSearchValue = String(table.getState().globalFilter ?? "").trim();
  const isLocalSearchActive =
    !!serverPagination && globalSearchValue.length > 0;
  const paginationTotal = isLocalSearchActive
    ? table.getFilteredRowModel().rows.length
    : (serverPagination?.total ?? table.getRowCount());
  const paginationPage = isLocalSearchActive
    ? table.getState().pagination.pageIndex + 1
    : (serverPagination?.page ?? table.getState().pagination.pageIndex + 1);
  const paginationPerPage = isLocalSearchActive
    ? table.getState().pagination.pageSize
    : (serverPagination?.perPage ?? table.getState().pagination.pageSize);
  const paginationQueryParams = isLocalSearchActive
    ? undefined
    : serverPagination
      ? serverPagination.onChange
      : undefined;

  return (
    <Fragment>
      <div
        ref={parentRef}
        onScroll={onScroll}
        className={classNames("scrollbar", className)}
        style={style}
      >
        {firstItem}
        <table
          className={classNames("c-virtual-scroll", {
            virtualized: isVirtualized,
          })}
          style={{
            ...columnSizeVars, //Define column sizes on the <table> element
            width: table.getCenterTotalSize(),
          }}
        >
          <thead>
            {groupedHeaderRows?.map((row) => (
              <tr
                key={
                  row.className ?? row.cells.map((cell) => cell.key).join("|")
                }
                className={row.className}
              >
                {row.cells.map((cell) => (
                  <th
                    key={cell.key}
                    className={cell.className}
                    style={{
                      width: getGroupedHeaderWidth(cell.columnIds),
                    }}
                  >
                    <div className="w-full">{cell.title}</div>
                  </th>
                ))}
              </tr>
            ))}
            {headerGroups.map((headerGroup, index) => (
              <tr key={headerGroup.id}>
                {!!isVirtualized &&
                index === headerGroups.length - 1 &&
                virtualPaddingLeft ? (
                  //fake empty column to the left for virtualization scroll padding
                  <th style={{ width: virtualPaddingLeft }} />
                ) : null}
                {(
                  (isVirtualized && index === headerGroups.length - 1
                    ? virtualColumns
                    : headerGroup.headers) as any[]
                ).map((vc: any) => {
                  const header = headerGroup.headers[vc.index];

                  const currentVisibility = visibility[index] ?? [];
                  const arrowLeft: any = currentVisibility.find(
                    (item: any) => item.index === vc.index,
                  );
                  const arrowRight: any = currentVisibility.find(
                    (item: any) => item.index === vc.index + 1,
                  );
                  return (
                    header?.id && (
                      <Dropdown
                        key={header?.id}
                        menu={{
                          items: renderDropdownItem(header?.column),
                        }}
                        trigger={["contextMenu"]}
                      >
                        <th
                          style={{
                            ...getCommonPinningStyles(header?.column),
                            width: `calc(var(--header-${header?.id}-size) * 1px)`,
                          }}
                          className={classNames({
                            "has-sorter": header?.column?.getCanSort(),
                            "has-filter": header?.column?.getCanFilter(),
                          })}
                          aria-label={header?.column?.columnDef.header?.toString()}
                        >
                          {(!!arrowLeft || !!arrowRight) && (
                            <button
                              onClick={() =>
                                table.setColumnVisibility({
                                  ...columnVisibility,
                                  [arrowLeft?.id || arrowRight?.id]: true,
                                })
                              }
                              className={classNames(
                                "absolute top-1/2 h-2 -translate-y-1/2 transform cursor-zoom-in",
                                {
                                  "left-0": arrowLeft,
                                  "right-0.5": arrowRight,
                                },
                              )}
                            >
                              <CSvgIcon
                                name={EIcon.arrow}
                                size={8}
                                className={classNames({
                                  "rotate-180": arrowLeft,
                                })}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            className={classNames(
                              "flex w-full items-center justify-between",
                              {
                                "cursor-default":
                                  !header?.column?.columnDef?.meta?.sorter ||
                                  !header?.column?.getCanSort(),
                              },
                            )}
                            onClick={
                              header?.column?.columnDef?.meta?.sorter
                                ? header?.column?.getToggleSortingHandler()
                                : () => {}
                            }
                          >
                            {!header?.isPlaceholder &&
                              flexRender(
                                header?.column?.columnDef.header,
                                header?.getContext(),
                              )}
                            {{
                              asc: (
                                <CSvgIcon
                                  name={EIcon.sort}
                                  size={10}
                                  className="sort rotate-180"
                                />
                              ),
                              desc: (
                                <CSvgIcon
                                  name={EIcon.sort}
                                  size={10}
                                  className="sort"
                                />
                              ),
                            }[header?.column?.getIsSorted() as string] ?? null}
                          </button>
                          <Filter
                            column={header.column}
                            refFilterTypeCurrent={refFilterTypeCurrent}
                          />

                          {isResizing && (!rowSelection || vc.index > 0) && (
                            <button
                              type="button"
                              onDoubleClick={() => header?.column?.resetSize()}
                              onMouseDown={header?.getResizeHandler()}
                              onTouchStart={header?.getResizeHandler()}
                              className={`resizer ${header?.column?.getIsResizing() ? "resizing" : ""}`}
                            />
                          )}
                        </th>
                      </Dropdown>
                    )
                  );
                })}
                {!!isVirtualized &&
                index === headerGroups.length - 1 &&
                virtualPaddingRight ? (
                  //fake empty column to the right for virtualization scroll padding
                  <th style={{ width: virtualPaddingRight }} />
                ) : null}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: isVirtualized
                ? `${rowVirtualizer.getTotalSize() + 2}px`
                : "auto", //tells scrollbar how big the table is
            }}
          >
            {((isVirtualized ? virtualRows : rows) as any[]).map(
              (virtualRow: any) => {
                const row: any = isVirtualized
                  ? rows[virtualRow.index]
                  : virtualRow;
                const visibleCells = row.getVisibleCells();
                return (
                  <tr
                    className={classNames({ children: row.getParentRow() })}
                    tabIndex={0}
                    key={row.id}
                    // ref={node => {
                    //   rowVirtualizer.measureElement(node);
                    // }}
                    ref={(node) => {
                      if (node) {
                        rowVirtualizer.measureElement(node);
                        rowRefs.current[row.id] ??= [];
                        rowRefs.current[row.id].push(node);
                      }
                    }}
                    data-row-id={row.id}
                    data-index={virtualRow.index}
                    style={{
                      transform: isVirtualized
                        ? `translateY(${virtualRow.start}px)`
                        : "", //this should always be a `style` as it changes on scroll
                    }}
                    onClick={() => !!onRow && onRow(row.original).onClick?.()}
                    onDoubleClick={() =>
                      !!onRow && onRow(row.original).onDoubleClick?.()
                    }
                  >
                    {!!isVirtualized && virtualPaddingLeft ? (
                      //fake empty column to the left for virtualization scroll padding
                      <td style={{ width: virtualPaddingLeft }} />
                    ) : null}
                    {(
                      (isVirtualized ? virtualColumns : visibleCells) as any[]
                    ).map((vc: any) => {
                      const cell: Cell<any, any> = isVirtualized
                        ? visibleCells[vc.index]
                        : vc;
                      const style = cell?.column?.columnDef?.meta?.cellStyle
                        ? cell?.column?.columnDef?.meta?.cellStyle({
                            row,
                            cell,
                          })
                        : {};
                      const attributes = cell?.column?.columnDef?.meta?.onCell
                        ? cell?.column?.columnDef?.meta?.onCell(row.original)
                        : {};
                      if (cell?.column?.columnDef?.meta?.align)
                        style.textAlign = cell?.column?.columnDef?.meta?.align;
                      return (
                        cell?.column?.id && (
                          <td
                            data-key={cell?.id}
                            key={cell?.id}
                            className={attributes?.className}
                            style={{
                              ...getCommonPinningStyles(cell?.column),
                              width: `${cell?.column?.getSize()}px`,
                              minWidth: `${cell?.column?.getSize()}px`,
                              maxWidth: `${cell?.column?.getSize()}px`,
                              flex: `0 0 ${cell?.column?.getSize()}px`,
                              height: heightCell,
                              ...attributes.style,
                            }}
                          >
                            <div
                              style={style}
                              title={
                                ["string", "number"].includes(
                                  typeof cell?.getValue(),
                                )
                                  ? String(cell.getValue())
                                  : undefined
                              }
                            >
                              {flexRender(
                                cell?.column?.columnDef?.cell,
                                cell?.getContext(),
                              ) ?? cell?.getValue()}
                            </div>
                          </td>
                        )
                      );
                    })}
                    {!!isVirtualized && virtualPaddingRight ? (
                      //fake empty column to the right for virtualization scroll padding
                      <td style={{ width: virtualPaddingRight }} />
                    ) : null}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      {isPagination && (
        <CPagination
          total={paginationTotal}
          page={paginationPage}
          perPage={paginationPerPage}
          table={table}
          paginationDescription={paginationDescription}
          queryParams={paginationQueryParams}
          showPageSizeSelector={serverPagination?.showPageSizeSelector}
          pageSizeOptions={serverPagination?.pageSizeOptions}
        />
      )}
    </Fragment>
  );
};
const ForwardedComponent = forwardRef(Component) as <TData>(
  props: Props<TData> & { ref?: Ref<Table<TData> | undefined> },
) => ReturnType<typeof Component>;
const Filter = ({
  column,
  refFilterTypeCurrent,
}: {
  column: Column<any>;
  refFilterTypeCurrent: MutableRefObject<{
    [selector: string]: keyof FilterFns;
  }>;
}) => {
  const { t } = useTranslation("locale", { keyPrefix: "Components" });

  const typeFilter = {
    text: [
      { value: "includeText", label: t("IncludeInputBelow") },
      { value: "notIncludeText", label: t("DoNotIncludeInputBelow") },
      { value: "startText", label: t("StartWithInputBelow") },
      { value: "endText", label: t("EndWithInputBelow") },
      { value: "sameText", label: t("SameWithInputBelow") },
    ],
    date: [
      { value: "sameDate", label: t("DateMakeSame") },
      { value: "beforeDate", label: t("DayBeforeInputBelow") },
      { value: "afterDate", label: t("DayAfterInputBelow") },
    ],
    number: [
      { value: "greaterNumber", label: t("GreaterThanInputBelow") },
      { value: "greaterEqualNumber", label: t("GreaterThanOrEqualTo") },
      { value: "lessNumber", label: t("SmallerThanInputBelow") },
      { value: "lessEqualNumber", label: t("SmallerThanOrEqualTo") },
      { value: "equalNumber", label: t("EqualToBelow") },
      { value: "notEqualNumber", label: t("NotEqualToBelow") },
      { value: "middleNumber", label: t("InTheMiddleOfInputBelow") },
      { value: "notMiddleNumber", label: t("NotInTheMiddleOfInputBelow") },
    ],
    select: [
      { value: "sameText", label: t("SameWithValueBelow") },
      { value: "notSameText", label: t("NotSameWithValueBelow") },
    ],
  };

  const [state, setState] = useState<keyof FilterFns>();
  const { token } = theme.useToken();
  const columnFilterValue = column.getFilterValue();
  const refValue = useRef(columnFilterValue);
  const refValueEnd = useRef(columnFilterValue);
  const refValueDate = useRef(columnFilterValue);
  const render = () => (
    <div
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
      }}
      className={classNames(
        "flex flex-col gap-1 bg-base-100 p-2 text-base-content",
        {
          "w-56": column?.columnDef?.meta?.filter === ETableFilterType.text,
          "w-52": column?.columnDef?.meta?.filter !== ETableFilterType.text,
        },
      )}
    >
      {/* <p>{t('ColumnName')}</p>
      <CIMask disabled={true} placeholder='' value={(column?.columnDef?.header as string) ?? ''} /> */}
      <div className="relative mt-1">
        <hr className="absolute top-1/2 w-full" />
        <strong className="relative bg-base-100 py-1 pr-1">
          {t("ConditionSetting")}
        </strong>
      </div>
      <p>
        {t("Condition")} ({t(column.columnDef.meta?.filter)})
      </p>
      <CISelect
        className="w-full"
        placeholder=""
        onChange={(value) => setState(value)}
        value={refFilterTypeCurrent.current[column.id]}
        list={[
          ...(typeFilter[
            column.columnDef.meta!.filter as keyof typeof typeFilter
          ] ?? []),
          { value: "blank", label: t("Blank") },
          { value: "notBlank", label: t("NotBlank") },
        ]}
      />
      <p>{t("Value")}</p>
      {column.columnDef.meta!.filter === ETableFilterType.select && (
        <CISelect
          className="w-full"
          placeholder=""
          onChange={(value) => (refValue.current = value)}
          value={refFilterTypeCurrent.current[column.id]}
          list={column.columnDef.meta!.list}
        />
      )}

      {column.columnDef.meta!.filter !== ETableFilterType.date &&
        column.columnDef.meta!.filter !== ETableFilterType.select && (
          <CIMask
            disabled={state === "blank" || state === "notBlank"}
            value={
              column.columnDef.meta?.filter === ETableFilterType.number
                ? ((columnFilterValue as [number, number])?.[0]?.toString() ??
                  "")
                : (columnFilterValue?.toString() ?? "")
            }
            placeholder={
              column.columnDef.meta?.filter === ETableFilterType.number
                ? `${t("Min")} (${column.getFacetedMinMaxValues()?.[0] ?? ""})`
                : `${t("Search")}... (${column.getFacetedUniqueValues().size})`
            }
            onChange={(e) => (refValue.current = e.target.value)}
          />
        )}
      {(state === "middleNumber" || state === "notMiddleNumber") && (
        <CIMask
          placeholder={`${t("Max")} (${column.getFacetedMinMaxValues()?.[1] ?? ""})`}
          value={(columnFilterValue as [number, number])?.[1]?.toString() ?? ""}
          onChange={(e) => (refValueEnd.current = e.target.value)}
        />
      )}

      {column.columnDef.meta?.filter === ETableFilterType.date && (
        <DatePicker
          format={{
            format: dayjs.localeData().longDateFormat("L"),
            type: TYPE_FORMAT_DATE,
          }}
          defaultValue={columnFilterValue}
          onChange={(e) => (refValueDate.current = e)}
        />
      )}
      <div className="mt-1 flex justify-end">
        <CButton
          className="w-20"
          text={t("Apply")}
          onClick={() => {
            if (state) {
              refFilterTypeCurrent.current[column.id] = state;
              column.columnDef.filterFn = state as any;
              let value = refValue.current ?? null;
              if (state === "middleNumber" || state === "notMiddleNumber") {
                value =
                  refValue.current && refValueEnd.current
                    ? [refValue.current, refValueEnd.current]
                    : null;
              } else if (
                column.columnDef.meta?.filter === ETableFilterType.date
              )
                value = refValueDate.current ?? null;
              column.setFilterValue(value);
            }
          }}
        ></CButton>
      </div>
    </div>
  );

  return (
    column?.columnDef?.meta?.filter && (
      <Dropdown
        dropdownRender={render}
        trigger={["click"]}
        destroyPopupOnHide={true}
      >
        <button
          type="button"
          className={classNames("filter", {
            "opacity-0": !columnFilterValue,
          })}
        >
          <CSvgIcon
            name={columnFilterValue ? EIcon.filterFill : EIcon.filter}
            size={10}
          />
        </button>
      </Dropdown>
    )
  );
};
