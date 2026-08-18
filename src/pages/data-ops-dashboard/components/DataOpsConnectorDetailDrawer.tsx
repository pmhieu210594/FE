import { Drawer } from "antd";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type {
  DataOpsConnectorDetail,
  DataOpsMissingEvidenceItem,
} from "../types";

export type DataOpsRepositoryIssueConnector = {
  connectorId: string;
  connectorName: string;
  failedRunCount: number;
  parseErrorCount: number;
  latestRunStatus: string | null;
  latestRunAt: string | null;
};

export type DataOpsRepositoryIssueSummary = {
  repositoryId: string;
  repositoryName: string;
  connectorCount: number;
  failedConnectorCount: number;
  parseErrorCount: number;
  missingEvidenceCount: number;
  connectors: DataOpsRepositoryIssueConnector[];
  missingEvidenceItems: DataOpsMissingEvidenceItem[];
};

type DataOpsConnectorDetailDrawerProps = Readonly<{
  connectorId?: string;
  detail: DataOpsConnectorDetail | null;
  repository: DataOpsRepositoryIssueSummary | null;
  isLoading?: boolean;
  onClose: () => void;
}>;

const FIELD_LABELS: Record<string, string> = {
  execution_environment: "Execution Environment",
  executed_command: "Executed Command",
  summary_of_results: "Summary of Results",
  list_of_passes: "List of Passes",
  list_of_fails: "List of Fails",
  bugs_fixed: "Bugs Fixed",
  not_yet_fixed_pending: "Not Yet Fixed / Pending",
  test_cannot_be_executed_and_reason: "Test Cannot Be Executed and Reason",
  remaining_risk: "Remaining Risk",
  final_test_verdict: "Final Test Verdict",
};

function formatEvidenceLabel(value: string): string {
  const fieldKey = value.replace(/^section:/i, "");
  return FIELD_LABELS[fieldKey] || fieldKey;
}

function normalizeErrorSummary(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function statusVariant(status: string | null | undefined) {
  if (status === "FAILED" || status === "FAILURE")
    return "destructive" as const;
  if (status === "SUCCESS") return "success" as const;
  if (status === "WARNING") return "warning" as const;
  return "outline" as const;
}

export function DataOpsConnectorDetailDrawer({
  connectorId,
  detail,
  repository,
  isLoading = false,
  onClose,
}: DataOpsConnectorDetailDrawerProps) {
  const { t } = useTranslation("locale");

  const hasContent = Boolean(connectorId || repository);
  const title =
    detail?.row.connectorName ??
    repository?.repositoryName ??
    t("Pages.DataOpsDashboard.detail.title");
  const evidenceItems =
    detail?.missingEvidenceItems ?? repository?.missingEvidenceItems ?? [];
  const repositoryConnectors = repository?.connectors ?? [];

  if (!hasContent && !isLoading) {
    return null;
  }

  let content: JSX.Element | null;

  if (!hasContent) {
    content = null;
  } else if (isLoading || (detail == null && repository == null)) {
    content = (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        {t("Pages.DataOpsDashboard.emptyState")}
      </div>
    );
  } else {
    content = (
      <div className="space-y-6">
        {repository ? (
          <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t("Pages.DataOpsDashboard.repositoryIssues.title", {
                      defaultValue: "Repository issues",
                    })}
                  </p>
                  <CardTitle className="mt-1 text-lg">
                    {repository.repositoryName}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-700"
                  >
                    {t(
                      "Pages.DataOpsDashboard.repositoryIssues.connectorCount",
                      {
                        count: repository.connectorCount,
                        defaultValue: "{{count}} connectors",
                      },
                    )}
                  </Badge>
                  <Badge variant="destructive">
                    {t(
                      "Pages.DataOpsDashboard.repositoryIssues.failedConnectorCount",
                      {
                        count: repository.failedConnectorCount,
                        defaultValue: "{{count}} failed",
                      },
                    )}
                  </Badge>
                  <Badge variant="warning">
                    {t(
                      "Pages.DataOpsDashboard.repositoryIssues.parseErrorCount",
                      {
                        count: repository.parseErrorCount,
                        defaultValue: "{{count}} parse errors",
                      },
                    )}
                  </Badge>
                  <Badge variant="success">
                    {t(
                      "Pages.DataOpsDashboard.repositoryIssues.missingEvidenceCount",
                      {
                        count: repository.missingEvidenceCount,
                        defaultValue: "{{count}} missing evidence",
                      },
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("Pages.DataOpsDashboard.repositoryIssues.connectors", {
                  defaultValue: "Connectors",
                })}
              </p>
              {repositoryConnectors.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {t(
                    "Pages.DataOpsDashboard.repositoryIssues.noConnectorRows",
                    {
                      defaultValue:
                        "Missing evidence was detected, but no connector rows were returned for this repository.",
                    },
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {repositoryConnectors.map((connector) => (
                    <div
                      key={connector.connectorId}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {connector.connectorName}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge
                              variant={statusVariant(connector.latestRunStatus)}
                            >
                              {connector.latestRunStatus ?? "-"}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatDateTime(connector.latestRunAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="destructive">
                            {t(
                              "Pages.DataOpsDashboard.repositoryIssues.failedRuns",
                              {
                                defaultValue: "Failed runs",
                              },
                            )}
                            : {connector.failedRunCount}
                          </Badge>
                          <Badge variant="warning">
                            {t(
                              "Pages.DataOpsDashboard.repositoryIssues.parseErrorsShort",
                              {
                                defaultValue: "Parse errors",
                              },
                            )}
                            : {connector.parseErrorCount}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {detail ? (
          <>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("Pages.DataOpsDashboard.detail.recentRuns")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detail.recentRuns.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    {t("Pages.DataOpsDashboard.detail.noRuns")}
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto pr-1">
                    <ul className="space-y-2">
                      {detail.recentRuns.map((run) => (
                        <li
                          key={run.connectorRunId}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50/50"
                        >
                          <div className="flex min-w-0 flex-col pr-4">
                            <span className="truncate font-medium text-slate-700">
                              {formatDateTime(run.startedAt)}
                            </span>
                            {run.errorMessage ? (
                              <span className="truncate text-xs text-slate-400">
                                {run.errorMessage}
                              </span>
                            ) : null}
                          </div>
                          <div className="shrink-0">
                            <Badge variant={statusVariant(run.status)}>
                              {run.status}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("Pages.DataOpsDashboard.detail.dataQuality")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detail.dataQualityChecks.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    {t("Pages.DataOpsDashboard.detail.noDataQualityIssues")}
                  </div>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.dataQualityChecks.map((item) => (
                      <li
                        key={item.dataQualityId}
                        className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="min-w-0 truncate font-mono text-xs text-slate-600">
                            {item.sourceType}
                          </span>
                          <Badge
                            variant={
                              item.parseErrorCount > 0
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {t(
                              "Pages.DataOpsDashboard.detail.parseErrorCount",
                              {
                                count: item.parseErrorCount,
                              },
                            )}
                          </Badge>
                        </div>
                        {item.parseErrorCount > 0 ? (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            <p className="font-semibold uppercase tracking-wider text-amber-700">
                              {t(
                                "Pages.DataOpsDashboard.detail.errorSummaryLabel",
                                {
                                  defaultValue: "Error summary",
                                },
                              )}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words">
                              {normalizeErrorSummary(item.errorSummary) ??
                                t(
                                  "Pages.DataOpsDashboard.detail.noErrorSummary",
                                  {
                                    defaultValue:
                                      "No parse error summary was recorded.",
                                  },
                                )}
                            </p>
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                {t("Pages.DataOpsDashboard.detail.missingEvidence", {
                  defaultValue: "Evidence files",
                })}
              </CardTitle>
              <Badge variant="warning">
                {t("Pages.DataOpsDashboard.detail.itemCount", {
                  count: evidenceItems.length,
                  defaultValue: "{{count}} items",
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {evidenceItems.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {t("Pages.DataOpsDashboard.detail.noMissingEvidence", {
                  defaultValue:
                    "No missing evidence rows were found for this connector.",
                })}
              </div>
            ) : (
              <div className="max-h-[700px] overflow-y-auto pr-1 csv-evidence-scroll">
                <div className="space-y-3">
                  {evidenceItems.map((item, index) => (
                    <article
                      key={item.artifactSnapshotId}
                      className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-nowrap items-start justify-between gap-3 w-full">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="warning"
                              className="shrink-0 mt-0.5"
                            >
                              {index + 1}/{evidenceItems.length}
                            </Badge>
                            <p className="break-words text-base font-bold text-slate-900">
                              {item.fileName}
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {formatDateTime(item.collectedAt)}
                          </p>
                        </div>
                        <Badge
                          variant={item.existsFlag ? "success" : "destructive"}
                          className="shrink-0"
                        >
                          {item.existsFlag
                            ? t("Pages.DataOpsDashboard.detail.exists", {
                                defaultValue: "exists",
                              })
                            : t("Pages.DataOpsDashboard.detail.missing", {
                                defaultValue: "missing",
                              })}
                        </Badge>
                      </div>

                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                          {t(
                            "Pages.DataOpsDashboard.detail.requiredFieldsMissing",
                            {
                              defaultValue: "Missing section in file",
                            },
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.requiredFieldsMissing.length > 0 ? (
                            item.requiredFieldsMissing.map((field) => (
                              <Badge key={field} variant="warning">
                                {formatEvidenceLabel(field)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Drawer
      open={hasContent}
      onClose={onClose}
      size={760}
      title={title}
      destroyOnHidden
    >
      {content}
    </Drawer>
  );
}
