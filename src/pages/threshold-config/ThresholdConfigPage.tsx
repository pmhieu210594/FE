import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { message } from "antd";

import { CButton } from "@/components/ui/button";
import { ApiError, endpoints } from "@/lib/api";
import { ScoreRangeProgressBar } from "./components/ScoreRangeProgressBar";
import { ThresholdTable } from "./components/ThresholdTable";
import type { EditableThresholdRow } from "./types";
import {
  createEditableRow,
  toEditableRows,
  toSaveRequest,
  toggleRowDeleted,
  validateActiveRows,
} from "./utils";

export function ThresholdConfigPage() {
  const { t } = useTranslation("locale");
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [rows, setRows] = useState<EditableThresholdRow[]>([]);
  const lastErrorToastKeyRef = useRef<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["scoreThresholds", "list"],
    queryFn: endpoints.scoreThresholds.list,
  });

  const activeRows: EditableThresholdRow[] = toEditableRows(
    listQuery.data ?? [],
  );
  const displayRows = mode === "edit" ? rows : activeRows;

  const saveMutation = useMutation({
    mutationFn: endpoints.scoreThresholds.save,
    onSuccess: async () => {
      message.success(t("Components.OK"));
      setMode("view");
      await queryClient.invalidateQueries({
        queryKey: ["scoreThresholds", "list"],
      });
    },
  });

  const handleEdit = () => {
    setRows(toEditableRows(listQuery.data ?? []));
    setMode("edit");
  };

  const handleCancel = () => {
    // BR-THRESHOLD-CONFIG-004: pure client-side revert, zero backend calls.
    setRows([]);
    setMode("view");
  };

  const handleAddBand = () => {
    setRows((prev) => [...prev, createEditableRow()]);
  };

  const handleRowChange = (
    rowKey: string,
    patch: Partial<EditableThresholdRow>,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)),
    );
  };

  const handleToggleDelete = (rowKey: string) => {
    setRows((prev) => toggleRowDeleted(prev, rowKey));
  };

  const handleSave = () => {
    const validationError = validateActiveRows(rows);
    if (validationError) {
      message.error(t(validationError));
      return;
    }
    saveMutation.mutate(toSaveRequest(rows));
  };

  const currentError = listQuery.error ?? saveMutation.error;

  useEffect(() => {
    if (!currentError) {
      lastErrorToastKeyRef.current = null;
      return;
    }
    const toastMessage =
      currentError instanceof ApiError && currentError.status === 500
        ? t("Components.SomethingWentWrong")
        : currentError instanceof Error
          ? currentError.message
          : t("Components.SomethingWentWrong");
    const toastKey =
      currentError instanceof ApiError
        ? `${currentError.status}:${toastMessage}`
        : toastMessage;
    if (lastErrorToastKeyRef.current === toastKey) return;
    lastErrorToastKeyRef.current = toastKey;
    message.error(toastMessage);
  }, [currentError, t]);

  return (
    <div className="wrapper-grid">
      <div className="intro-x right">
        <div className="card overflow-hidden">
          <div className="body">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="space-y-1">
                  <h1
                    className="text-lg font-semibold"
                    style={{ fontSize: "18px" }}
                  >
                    {t("Pages.ThresholdConfig.title")}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {t("Pages.ThresholdConfig.description")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {mode === "view" ? (
                  <CButton
                    text={t("Pages.ThresholdConfig.actions.edit")}
                    className="!bg-primary text-primary-foreground"
                    onClick={handleEdit}
                  />
                ) : (
                  <>
                    <CButton
                      text={t("Pages.ThresholdConfig.actions.addBand")}
                      className="border border-input bg-background text-foreground hover:bg-accent"
                      onClick={handleAddBand}
                    />
                    <CButton
                      text={t("Pages.ThresholdConfig.actions.cancel")}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      onClick={handleCancel}
                    />
                    <CButton
                      text={t("Pages.ThresholdConfig.actions.save")}
                      className="!bg-primary text-primary-foreground"
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                    />
                  </>
                )}
              </div>
            </div>

            <hr className="my-4 border-border/70" />

            <div className="space-y-6">
              <ScoreRangeProgressBar rows={displayRows} />

              <ThresholdTable
                rows={displayRows}
                editable={mode === "edit"}
                onChange={handleRowChange}
                onToggleDelete={handleToggleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
