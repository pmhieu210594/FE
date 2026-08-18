import * as React from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { CSvgIcon } from "@/components/ui/svg-icon";
import { CTooltip } from "@/components/ui/tooltip";
import { EIcon } from "@/enums";
import { cn, formatDateTime } from "@/lib/utils";
import type { EditableThresholdRow } from "../types";
import { ColorPicker } from "./ColorPicker";

const statusBadgeClass: Record<EditableThresholdRow["status"], string> = {
  ACTIVE: "border-transparent bg-blue-600 text-white",
  DELETE: "border-transparent bg-red-600 text-white",
};

export interface ThresholdTableProps {
  rows: EditableThresholdRow[];
  editable: boolean;
  onChange?: (rowKey: string, patch: Partial<EditableThresholdRow>) => void;
  onToggleDelete?: (rowKey: string) => void;
  className?: string;
}

export const ThresholdTable = React.forwardRef<
  HTMLDivElement,
  ThresholdTableProps
>(({ rows, editable, onChange, onToggleDelete, className }, ref) => {
  const { t } = useTranslation("locale");

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-x-auto rounded-lg border border-slate-200",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.from")}
            </th>
            <th className="px-3 py-2">{t("Pages.ThresholdConfig.table.to")}</th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.label")}
            </th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.code")}
            </th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.color")}
            </th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.status")}
            </th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.createdInfo")}
            </th>
            <th className="px-3 py-2">
              {t("Pages.ThresholdConfig.table.updatedInfo")}
            </th>
            {editable && (
              <th className="px-3 py-2">
                {t("Pages.ThresholdConfig.table.actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isDeleted = row.status === "DELETE";
            return (
              <tr
                key={row.rowKey}
                className={cn("border-t border-slate-100 hover:bg-muted/40")}
              >
                <td className={cn("px-3 py-2", isDeleted && "opacity-50")}>
                  {editable ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      maxLength={3}
                      value={row.minScore}
                      disabled={isDeleted}
                      onChange={(e) =>
                        onChange?.(row.rowKey, {
                          minScore: Number(e.target.value),
                        })
                      }
                      className="w-16 rounded border border-slate-200 px-2 py-1"
                    />
                  ) : (
                    row.minScore
                  )}
                </td>
                <td className={cn("px-3 py-2", isDeleted && "opacity-50")}>
                  {editable ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      maxLength={3}
                      value={row.maxScore}
                      disabled={isDeleted}
                      onChange={(e) =>
                        onChange?.(row.rowKey, {
                          maxScore: Number(e.target.value),
                        })
                      }
                      className="w-16 rounded border border-slate-200 px-2 py-1"
                    />
                  ) : (
                    row.maxScore
                  )}
                </td>
                <td className={cn("px-3 py-2", isDeleted && "opacity-50")}>
                  {editable ? (
                    <input
                      type="text"
                      maxLength={255}
                      value={row.label}
                      disabled={isDeleted}
                      onChange={(e) =>
                        onChange?.(row.rowKey, { label: e.target.value })
                      }
                      className="w-32 rounded border border-slate-200 px-2 py-1"
                    />
                  ) : (
                    row.label
                  )}
                </td>
                <td className={cn("px-3 py-2", isDeleted && "opacity-50")}>
                  {editable ? (
                    <input
                      type="text"
                      maxLength={100}
                      value={row.code}
                      disabled={isDeleted}
                      onChange={(e) =>
                        onChange?.(row.rowKey, {
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-32 rounded border border-slate-200 px-2 py-1 font-mono uppercase"
                    />
                  ) : (
                    <span className="font-mono">{row.code}</span>
                  )}
                </td>
                <td className={cn("px-3 py-2", isDeleted && "opacity-50")}>
                  {editable ? (
                    <ColorPicker
                      value={row.color}
                      disabled={isDeleted}
                      onChange={(next) =>
                        onChange?.(row.rowKey, { color: next })
                      }
                    />
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-mono text-xs">{row.color}</span>
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={statusBadgeClass[row.status]}
                  >
                    {isDeleted
                      ? t("Pages.ThresholdConfig.status.DELETED")
                      : t("Pages.ThresholdConfig.status.ACTIVE")}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {row.createdAt ? (
                    <span>{formatDateTime(row.createdAt)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {row.updatedAt ? (
                    <span>{formatDateTime(row.updatedAt)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                {editable && (
                  <td className="px-3 py-2">
                    <div className="action">
                      <CTooltip
                        title={
                          isDeleted
                            ? t("Pages.ThresholdConfig.actions.undo")
                            : t("Pages.ThresholdConfig.actions.delete")
                        }
                      >
                        <button
                          type="button"
                          title={
                            isDeleted
                              ? t("Pages.ThresholdConfig.actions.undo")
                              : t("Pages.ThresholdConfig.actions.delete")
                          }
                          onClick={() => onToggleDelete?.(row.rowKey)}
                        >
                          <CSvgIcon
                            name={isDeleted ? EIcon.undo : EIcon.trash}
                            className={isDeleted ? "primary" : "error"}
                          />
                        </button>
                      </CTooltip>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
ThresholdTable.displayName = "ThresholdTable";
