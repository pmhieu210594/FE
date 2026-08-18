import type { FilterFn, Table } from "@tanstack/react-table";
import { DatePicker, Dropdown, theme } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
  type UIEventHandler,
} from "react";
import { useTranslation } from "react-i18next";

import { CButton } from "@/components/ui/button/index";
import { CDataTable } from "@/components/ui/data-table";
import { CIMask } from "@/components/ui/form/input";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { EIcon, ETableAlign } from "@/enums";
import type { IDataTable } from "@/interfaces";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortDir = "asc" | "desc";

export interface IServerTableColumn extends Omit<IDataTable, "title"> {
  /** Column key sent to API as `sort_by` param. Omit to disable sorting for this column. */
  sortKey?: string;
  /** Column key sent to API as server-side filter param. Shows a filter icon in header. */
  serverFilterKey?: string;
  /** Filter input type for server-side filter UI. */
  serverFilterType?: "text" | "date" | "month" | "month_range";
  /** Original title text (string). If sortKey is set, a sort header is rendered automatically. */
  title: string;
  tableItem?: IDataTable["tableItem"];
}

export interface IServerTableSort {
  sortBy?: string;
  sortDir?: SortDir;
}

export interface IServerTableAction {
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
}

// ---------------------------------------------------------------------------
// Context — lets SortHeader always read the latest sort state without relying
// on Tanstack Table to propagate JSX-element props through flexRender.
// ---------------------------------------------------------------------------

interface SortContextValue {
  sort: IServerTableSort;
  onSortChange: (sort: IServerTableSort) => void;
}

const SortContext = createContext<SortContextValue>({
  sort: {},
  onSortChange: () => {},
});

// ---------------------------------------------------------------------------
// Server filter context
// ---------------------------------------------------------------------------

interface ServerFilterContextValue {
  serverFilters: Record<string, string | undefined>;
  onServerFilterChange: (key: string, value: string) => void;
}

const ServerFilterContext = createContext<ServerFilterContextValue>({
  serverFilters: {},
  onServerFilterChange: () => {},
});

// ---------------------------------------------------------------------------
// SortHeader
// ---------------------------------------------------------------------------

interface SortHeaderProps {
  title: string;
  sortKey?: string;
  serverFilterKey?: string;
  serverFilterType?: "text" | "date" | "month" | "month_range";
}

const SortHeader = ({
  title,
  sortKey,
  serverFilterKey,
  serverFilterType = "text",
}: SortHeaderProps) => {
  const { sort, onSortChange } = useContext(SortContext);
  const { serverFilters, onServerFilterChange } =
    useContext(ServerFilterContext);
  const { t } = useTranslation("locale", { keyPrefix: "Components" });
  const isActive = !!sortKey && sort.sortBy === sortKey;
  const currentDir = isActive ? sort.sortDir : undefined;
  const filterValue = serverFilterKey
    ? (serverFilters[serverFilterKey] ?? "")
    : "";
  const [inputVal, setInputVal] = useState(filterValue);
  const [dateVal, setDateVal] = useState<Dayjs | null>(null);
  const [dateRangeVal, setDateRangeVal] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [open, setOpen] = useState(false);
  const { token } = theme.useToken();

  useEffect(() => {
    setInputVal(filterValue);
    if (serverFilterType === "date" && filterValue) {
      const [from, to] = filterValue.split(",");
      setDateRangeVal([
        from ? dayjs(from, "YYYY-MM-DD") : null,
        to ? dayjs(to, "YYYY-MM-DD") : null,
      ]);
      setDateVal(null);
      return;
    }
    if (serverFilterType === "month_range" && filterValue) {
      const [from, to] = filterValue.split(",");
      setDateRangeVal([
        from ? dayjs(from, "YYYYMM") : null,
        to ? dayjs(to, "YYYYMM") : null,
      ]);
      setDateVal(null);
      return;
    }
    if (serverFilterType === "month" && filterValue) {
      setDateVal(dayjs(filterValue, "YYYYMM"));
      setDateRangeVal(null);
      return;
    }
    setDateVal(null);
    setDateRangeVal(null);
  }, [filterValue, serverFilterType]);

  const handleClick = () => {
    if (!sortKey) return;
    if (!isActive) {
      onSortChange({ sortBy: sortKey, sortDir: "asc" });
    } else if (currentDir === "asc") {
      onSortChange({ sortBy: sortKey, sortDir: "desc" });
    } else {
      onSortChange({ sortBy: undefined, sortDir: undefined });
    }
  };
  const handleSortKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const filterDropdown = () => (
    <div
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
      }}
      className="flex w-48 flex-col gap-1 bg-base-100 p-2 text-base-content"
    >
      {serverFilterType === "text" ? (
        <CIMask
          placeholder={t("Search")}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onPressEnter={() => {
            onServerFilterChange(serverFilterKey!, inputVal);
            setOpen(false);
          }}
        />
      ) : serverFilterType === "date" || serverFilterType === "month_range" ? (
        <DatePicker.RangePicker
          picker={serverFilterType === "month_range" ? "month" : "date"}
          className="w-full"
          format={serverFilterType === "month_range" ? "YYYY/MM" : "YYYY/MM/DD"}
          value={dateRangeVal}
          onChange={(value) =>
            setDateRangeVal(value ? [value[0], value[1]] : null)
          }
          allowClear
          placeholder={[
            t("PleaseChoose", { title }),
            t("PleaseChoose", { title }),
          ]}
        />
      ) : (
        <DatePicker
          picker={serverFilterType === "month" ? "month" : "date"}
          className="w-full"
          format={serverFilterType === "month" ? "YYYY/MM" : "YYYY/MM/DD"}
          value={dateVal}
          onChange={(value) => setDateVal(value)}
          allowClear
          placeholder={t("PleaseChoose", { title })}
        />
      )}
      <div className="mt-1 flex justify-end gap-1">
        <CButton
          className="w-16"
          text={t("Clear")}
          onClick={() => {
            setInputVal("");
            setDateVal(null);
            setDateRangeVal(null);
            onServerFilterChange(serverFilterKey!, "");
            setOpen(false);
          }}
        />
        <CButton
          className="w-16"
          text={t("OK")}
          onClick={() => {
            if (serverFilterType === "text") {
              onServerFilterChange(serverFilterKey!, inputVal);
            } else if (
              serverFilterType === "date" ||
              serverFilterType === "month_range"
            ) {
              const format =
                serverFilterType === "month_range" ? "YYYYMM" : "YYYY-MM-DD";
              const from = dateRangeVal?.[0]?.format(format);
              const to = dateRangeVal?.[1]?.format(format);
              onServerFilterChange(
                serverFilterKey!,
                from && to ? `${from},${to}` : "",
              );
            } else if (serverFilterType === "month") {
              onServerFilterChange(
                serverFilterKey!,
                dateVal ? dateVal.format("YYYYMM") : "",
              );
            } else {
              onServerFilterChange(
                serverFilterKey!,
                dateVal ? dateVal.format("YYYY-MM-DD") : "",
              );
            }
            setOpen(false);
          }}
        />
      </div>
    </div>
  );

  return (
    <span className="flex w-full items-center">
      {/* Title — clickable to sort, takes up remaining space */}
      {sortKey ? (
        <span
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleSortKeyDown}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1 border-0 bg-transparent p-0"
        >
          <span>{title}</span>
        </span>
      ) : (
        <span className="flex-1 text-center">{title}</span>
      )}
      {/* Filter icon */}
      {serverFilterKey && (
        <Dropdown
          open={open}
          onOpenChange={setOpen}
          dropdownRender={filterDropdown}
          trigger={["click"]}
          destroyPopupOnHide
        >
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
              }
            }}
            className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <CSvgIcon
              name={filterValue ? EIcon.filterFill : EIcon.filter}
              size={10}
            />
          </span>
        </Dropdown>
      )}
      {/* Sort icon — only visible when active */}
      {sortKey && isActive && (
        <CSvgIcon
          name={EIcon.sort}
          size={10}
          className={`shrink-0${currentDir === "asc" ? "rotate-180" : ""}`}
        />
      )}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  columns: IServerTableColumn[];
  data?: any[];
  action?: IServerTableAction;
  sort: IServerTableSort;
  isLoading?: boolean;
  isPagination?: boolean;
  isVirtualized?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value?: string) => void;
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
  onSortChange: (sort: IServerTableSort) => void;
  onRow?: (data: any) => { onDoubleClick?: () => void; onClick?: () => void };
  /** Current server-side filter values keyed by serverFilterKey */
  serverFilters?: Record<string, string | undefined>;
  /** Called when user changes a server-side column filter input */
  onServerFilterChange?: (key: string, value: string) => void;
  // Forwarded to CDataTable
  filterGlobal?: FilterFn<any>;
  style?: CSSProperties;
  onScroll?: UIEventHandler<HTMLDivElement>;
  heightCell?: number;
  scaleColumns?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CServerTableInner = (
  {
    columns,
    data,
    action,
    sort,
    isLoading,
    isPagination,
    isVirtualized,
    showSearch,
    searchValue,
    onSearchChange,
    rightHeader,
    leftHeader,
    paginationDescription,
    pagination,
    onSortChange,
    onRow,
    serverFilters = {},
    onServerFilterChange = () => {},
    filterGlobal,
    style,
    onScroll,
    heightCell,
    scaleColumns,
  }: Props,
  ref: Ref<Table<any> | undefined>,
) => {
  // Column structure is stable — only changes when columns definition changes,
  // NOT when sort changes. Sort is read from context inside SortHeader.
  const mappedColumns = useMemo<IDataTable[]>(
    () =>
      columns.map((col) => {
        if (!col.sortKey && !col.serverFilterKey) {
          return { name: col.name, title: col.title, tableItem: col.tableItem };
        }

        return {
          name: col.name,
          title: (
            <SortHeader
              title={col.title}
              sortKey={col.sortKey}
              serverFilterKey={col.serverFilterKey}
              serverFilterType={col.serverFilterType}
            />
          ),
          tableItem: {
            ...col.tableItem,
            align: col.tableItem?.align ?? ETableAlign.left,
          },
        };
      }),
    [columns],
  );

  const contextValue = useMemo<SortContextValue>(
    () => ({ sort, onSortChange }),
    [sort, onSortChange],
  );

  const filterContextValue = useMemo<ServerFilterContextValue>(
    () => ({ serverFilters, onServerFilterChange }),
    [serverFilters, onServerFilterChange],
  );

  return (
    <SortContext.Provider value={contextValue}>
      <ServerFilterContext.Provider value={filterContextValue}>
        <CDataTable
          ref={ref}
          data={data}
          columns={mappedColumns}
          action={action}
          isLoading={isLoading}
          isPagination={isPagination}
          isVirtualized={isVirtualized}
          showSearch={showSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          rightHeader={rightHeader}
          leftHeader={leftHeader}
          pagination={pagination}
          paginationDescription={paginationDescription}
          onRow={onRow}
          filterGlobal={filterGlobal}
          style={style}
          onScroll={onScroll}
          heightCell={heightCell}
          scaleColumns={scaleColumns}
        />
      </ServerFilterContext.Provider>
    </SortContext.Provider>
  );
};

export const CServerTable = forwardRef(CServerTableInner) as (
  props: Props & { ref?: Ref<Table<any> | undefined> },
) => ReturnType<typeof CServerTableInner>;
