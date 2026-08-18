import { useQuery } from "@tanstack/react-query";
import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { endpoints, type PmDashboardTicketDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { ScoreThreshold } from "@/pages/threshold-config/types";
import { formatScore, scoreBandLabel } from "../utils";

const MAX_VISIBLE_MISSING_SECTIONS = 5;

function riskStatusVariant(status: string | null | undefined) {
  if (!status) return "secondary" as const;
  const normalized = status.trim().toUpperCase();
  if (normalized === "OPEN") return "warning" as const;
  if (normalized === "CLOSED") return "success" as const;
  return "secondary" as const;
}

function resolveBand(
  thresholds: ScoreThreshold[] | undefined,
  score: number | null | undefined,
) {
  if (!score || score == null || !thresholds || thresholds.length == 0)
    return undefined;
  const threshold = thresholds.find(
    (threshold) => threshold.minScore <= score && score <= threshold.maxScore,
  );
  return threshold ?? undefined;
}

function bandTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

function renderRiskSummary(riskSummary: string | null | undefined) {
  if (!riskSummary) return "-";
  const match = /^\s*risk\s*=\s*(.*?)\s*(?:\||$)/i.exec(riskSummary);
  if (match?.[1]) {
    return match[1].trim();
  }
  return riskSummary.trim();
}

function extractMissingSections(message: string) {
  const match = new RegExp(/missing required section\(s\):\s*(.+)$/i).exec(
    message,
  );
  if (!match) return [];

  return match[1]
    .split(",")
    .map((section) => section.trim())
    .filter(Boolean);
}

function formatSectionKey(sectionKey: string) {
  return sectionKey
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) =>
      token.length === 0
        ? token
        : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(),
    )
    .join(" ");
}

function formatMissingSectionsMessage(message: string) {
  const sections = extractMissingSections(message);
  if (sections.length === 0) return message;
  const formattedSections = sections.map(formatSectionKey);
  return message.replace(
    /missing required section\(s\):\s*(.+)$/i,
    `missing required section(s): ${formattedSections.join(", ")}`,
  );
}

function getVisibleMissingSections(message: string) {
  const missingSections = extractMissingSections(message).map(formatSectionKey);
  const visibleSections =
    missingSections.length > MAX_VISIBLE_MISSING_SECTIONS
      ? missingSections.slice(0, MAX_VISIBLE_MISSING_SECTIONS)
      : missingSections;

  return {
    visibleSections,
    hiddenSectionCount: missingSections.length - visibleSections.length,
  };
}

function hasMissingSectionsIssue(message: string) {
  return extractMissingSections(message).length > 0;
}

type TicketDetailDrawerProps = {
  ticketId: string;
  detail: PmDashboardTicketDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onClose: () => void;
};

function PhaseCard({
  detail,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <section className="grid gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="!text-[18px]">
            {t("Pages.PmDashboard.phase", { defaultValue: "Phase" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2 break-words">
            <div className="break-words">
              {t("Pages.PmDashboard.phase", {
                defaultValue: "Phase",
              })}{" "}
              {detail.row.phaseCode ?? "-"}: {detail.row.phaseName ?? "-"}
            </div>
            <div className="break-words">
              {t("Pages.PmDashboard.phaseDescription", {
                defaultValue: "Description",
              })}
              : {detail.row.phaseDescription ?? "-"}
            </div>
          </div>
          <div className="space-y-2 break-words">
            <div className="break-words">
              {t("Pages.PmDashboard.phaseCreatedAt", {
                defaultValue: "Created at",
              })}
              : {formatDateTime(detail.row.phaseCreatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function OpenIssuesCard({
  issueItems,
  t,
}: Readonly<{
  issueItems: PmDashboardTicketDetail["issueItems"];
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  const openIssueItems = issueItems.filter(
    (issue) => issue.issueStatus?.toUpperCase() === "OPEN",
  );
  const hasOpenIssues = openIssueItems.length > 0;

  return (
    <section className="grid gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="!text-[18px]">
            {t("Pages.PmDashboard.openIssues", { defaultValue: "Open issues" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={hasOpenIssues ? "warning" : "secondary"}>
              {hasOpenIssues ? `${openIssueItems.length} items` : "0 items"}
            </Badge>
            <div className="text-sm text-slate-600">
              {hasOpenIssues
                ? t("Pages.PmDashboard.openIssuesDetail", {
                    defaultValue: "This ticket currently has issue records.",
                  })
                : t("Pages.PmDashboard.noOpenIssuesDetail", {
                    defaultValue: "No issue records for this ticket.",
                  })}
            </div>
          </div>
          {hasOpenIssues ? (
            <div className="space-y-2">
              {openIssueItems.map((issue) => (
                <div
                  key={issue.ticketIssueId}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          {t(`Pages.PmDashboard.${issue.sourceType}`, {
                            defaultValue: issue.sourceType,
                          })}
                        </Badge>
                      </div>
                      <div className="font-medium text-slate-950 break-words">
                        {issue.issueTitle ?? issue.issueSummary}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      #{issue.issueOrder}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function TicketInformationCard({
  detail,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <section className="grid gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="!text-[18px]">
            {t("Pages.PmDashboard.ticketInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2 break-words">
            <div className="break-words">
              {t("Pages.PmDashboard.ticketId")}: {detail.row.externalTicketKey}
            </div>
            <div className="break-words">
              {t("Pages.PmDashboard.repository")}: {detail.row.repositoryName}
            </div>
            <div className="break-words">
              {t("Pages.PmDashboard.project")}: {detail.row.projectAlias}
            </div>
          </div>
          <div className="space-y-2 break-words">
            <div className="break-words">
              {t("Pages.PmDashboard.ownerDisplay", {
                defaultValue: "Owner",
              })}
              : {detail.ownerDisplay ?? detail.row.ownerDisplay}
            </div>
            <div className="break-words">
              {t("Pages.PmDashboard.createAt", {
                defaultValue: "Create at",
              })}
              : {formatDateTime(detail.createdAt ?? detail.row.createdAt)}
            </div>
            <div className="break-words">
              {t("Pages.PmDashboard.updatedAt")}:{" "}
              {formatDateTime(detail.row.updatedAt)}
            </div>
            {detail.row.mergedAt ? (
              <div className="break-words">
                {t("Pages.PmDashboard.mergedAt", { defaultValue: "Merged at" })}:{" "}
                {formatDateTime(detail.row.mergedAt)}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryBadges({
  detail,
  traceabilityIssueCount,
  firstCiPassSuccess,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  traceabilityIssueCount: number;
  firstCiPassSuccess: boolean;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  const openIssueCount = detail.issueItems.filter(
    (issue) => issue.issueStatus?.toUpperCase() === "OPEN",
  ).length;
  const firstCiPassLabel = firstCiPassSuccess
    ? t("Pages.PmDashboard.firstCiPass", { defaultValue: "First CI Pass" })
    : t("Pages.PmDashboard.firstCiFailed", { defaultValue: "First CI Failed" });
  const firstCiPassVariant = firstCiPassSuccess ? "success" : "destructive";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant={detail.reviewCount > 0 ? "secondary" : "outline"}>
          {t("Pages.PmDashboard.reviews", { defaultValue: "Reviews" })} (
          {detail.reviewCount})
        </Badge>
        {openIssueCount > 0 ? (
          <Badge variant="warning">
            {t("Pages.PmDashboard.openIssuesCount", {
              defaultValue: "Open issues",
            })}{" "}
            ({openIssueCount})
          </Badge>
        ) : null}

        {detail.row.exceptionCount > 0 ? (
          <Badge variant="warning">
            {t("Pages.PmDashboard.exceptions", { defaultValue: "Exceptions" })}{" "}
            ({detail.row.exceptionCount})
          </Badge>
        ) : null}
        {detail.row.riskCount > 0 ? (
          <Badge variant="warning">
            {t("Pages.PmDashboard.risks", { defaultValue: "Risks" })} (
            {detail.row.riskCount})
          </Badge>
        ) : null}
        <Badge variant={firstCiPassVariant}>{firstCiPassLabel}</Badge>
        <Badge
          variant={traceabilityIssueCount > 0 ? "destructive" : "secondary"}
        >
          {traceabilityIssueCount > 0
            ? `${t("Pages.PmDashboard.traceabilityIssuesCount", { defaultValue: "Traceability issues" })} (${traceabilityIssueCount})`
            : t("Pages.PmDashboard.traceabilityIssuesCount", {
                defaultValue: "Traceability issues",
              })}
        </Badge>
      </div>
    </section>
  );
}

function EqsSummaryCard({
  eqs,
  bandLabel,
  bandColor,
  score,
  isClean,
  isLoading,
  t,
}: Readonly<{
  eqs:
    | Awaited<ReturnType<typeof endpoints.evidenceQualityScores.getLatest>>
    | undefined;
  bandLabel: string | null;
  bandColor: string | undefined;
  score: number | null;
  isClean: boolean;
  isLoading: boolean;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex flex-col gap-2">
          <CardTitle className="!text-[18px]">
            {t("Pages.PmDashboard.eqsSummary")}
          </CardTitle>
          <Badge
            className="w-fit"
            style={
              bandColor
                ? {
                    backgroundColor: bandColor,
                    borderColor: bandColor,
                    color: bandTextColor(bandColor),
                  }
                : undefined
            }
          >
            {scoreBandLabel(bandLabel)}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="!text-3xl font-black leading-none tracking-tight text-slate-950 tabular-nums sm:text-7xl">
            {formatScore(score)}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {isLoading ? (
              <Badge variant="outline">
                {t("Pages.PmDashboard.loadingDetail")}
              </Badge>
            ) : null}
            {isClean ? <Badge variant="success">Clean</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <div className="grid items-stretch gap-2 md:grid-cols-2">
            {(eqs?.breakdown ?? []).map((item) => (
              <div
                key={item.criterionId}
                className="flex h-full min-h-[100px] flex-col rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="min-h-[20px] font-medium leading-5 break-words">
                      {t(`Pages.PmDashboard.${item.criterionId}`)}
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-3 text-slate-700">
                  <span className="text-base font-bold tabular-nums">
                    {formatScore(item.score)} / {formatScore(item.maxScore)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="text-sm text-slate-500">
                {t("Pages.PmDashboard.loadingDetail")}
              </div>
            ) : null}
            {eqs?.breakdown?.length === 0 ? (
              <div className="text-sm text-slate-500">
                {t("Pages.PmDashboard.none")}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TraceabilityIssuesSection({
  detail,
  lang,
  navigate,
  traceabilityBrokenLinks,
  hasMissingSectionsTraceabilityIssue,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  lang: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
  traceabilityBrokenLinks: NonNullable<
    Awaited<ReturnType<typeof endpoints.traceability.get>>["brokenLinks"]
  >;
  hasMissingSectionsTraceabilityIssue: boolean;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="!text-[18px] font-semibold text-slate-950">
          {t("Pages.PmDashboard.traceabilityIssuesTitle", {
            defaultValue: "Traceability issues",
          })}
        </h3>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-50"
          onClick={() =>
            navigate(
              `/${lang ?? "en"}/traceability?ticketId=${detail.row.ticketId}`,
            )
          }
        >
          {t("Pages.PmDashboard.openTraceability")}
        </button>
      </div>
      <div className="space-y-2">
        {traceabilityBrokenLinks.map((item) => {
          const { visibleSections, hiddenSectionCount } =
            getVisibleMissingSections(item.message);
          const missingSectionsIssue = hasMissingSectionsIssue(item.message);

          return (
            <div
              key={`${item.code}-${item.item}`}
              className="rounded-xl border border-rose-200 bg-rose-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-950">{item.item}</div>
                  {missingSectionsIssue ? (
                    <Badge variant="outline" className="mt-1 w-fit">
                      Missing sections
                    </Badge>
                  ) : null}
                  {visibleSections.length > 0 ? (
                    <div className="mt-1 text-xs leading-5 text-slate-600 break-words">
                      <span className="font-medium text-rose-700">
                        {t("Pages.PmDashboard.missingSections", {
                          defaultValue: "Missing sections",
                        })}
                        :{" "}
                      </span>
                      {visibleSections.join(", ")}
                      {hiddenSectionCount > 0
                        ? `, +${hiddenSectionCount} more`
                        : ""}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-slate-600 break-words">
                      {formatMissingSectionsMessage(item.message)}
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    item.severity === "ERROR" ? "destructive" : "warning"
                  }
                >
                  {item.severity}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      {hasMissingSectionsTraceabilityIssue ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          {t("Pages.PmDashboard.openTraceabilityDescription")}
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs leading-5 text-green-900">
          {t("Pages.PmDashboard.notFoundTraceabilityDescription")}
        </div>
      )}
    </section>
  );
}

function MissingEvidenceSection({
  detail,
  presentEvidenceCount,
  totalEvidenceCount,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  presentEvidenceCount: number;
  totalEvidenceCount: number;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  const missingEvidenceItems =
    detail.missingEvidenceItems.filter((item) => !item.existsFlag) ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h3 className="!text-[18px] font-semibold text-slate-950">
          {t("Pages.PmDashboard.missingEvidenceTitle")}
        </h3>
        <div className="text-xs text-slate-500">
          {presentEvidenceCount}/{totalEvidenceCount} present
        </div>
      </div>
      {missingEvidenceItems.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {t("Pages.PmDashboard.contentMissingEvidenceDetailTicket", {
            defaultValue: "No missing evidence for this ticket.",
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {missingEvidenceItems.map((item) => (
            <div
              key={item.artifactTypeCode}
              className="rounded-xl border border-rose-200 bg-rose-50 p-3"
            >
              <div className="font-medium text-slate-950">
                {item.artifactName}
              </div>
              <div className="text-xs text-slate-600 break-words">
                {item.defaultFileName ?? "-"} | {item.sourcePath ?? "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ExceptionSection({
  detail,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <section className="space-y-3">
      <h3 className="!text-[18px] font-semibold text-slate-950">
        {t("Pages.PmDashboard.exceptionTitle")}
      </h3>
      <div className="space-y-2">
        {detail.exceptionItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
            {t("Pages.PmDashboard.none")}
          </div>
        ) : null}
        {detail.exceptionItems.map((item) => (
          <div
            key={item.exceptionId}
            className="rounded-xl border border-slate-200 p-3"
          >
            <div className="flex justify-start">
              <Badge variant={item.approved ? "success" : "warning"}>
                {item.exceptionType ?? "-"}
              </Badge>
            </div>
            <div className="mt-3 font-medium break-words">
              {item.reason ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskSection({
  detail,
  t,
}: Readonly<{
  detail: PmDashboardTicketDetail;
  t: (key: string, options?: { defaultValue?: string }) => string;
}>) {
  return (
    <section className="space-y-3">
      <h3 className="!text-[18px] font-semibold text-slate-950">
        {t("Pages.PmDashboard.riskTitle")}
      </h3>
      <div className="space-y-2">
        {detail.riskItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
            {t("Pages.PmDashboard.none")}
          </div>
        ) : null}
        {detail.riskItems.map((item) => (
          <div
            key={item.riskId}
            className="rounded-xl border border-slate-200 p-3"
          >
            <div className="flex justify-end">
              <Badge variant={riskStatusVariant(item.status)}>
                {item.status ?? "-"}
              </Badge>
            </div>
            <div className="mt-1 font-medium break-words">
              {renderRiskSummary(item.riskSummary ?? item.riskKey ?? "-")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Right-hand drawer with the full breakdown for a single ticket. */
export function TicketDetailDrawer({
  ticketId,
  detail,
  isLoading,
  isError,
  onClose,
}: Readonly<TicketDetailDrawerProps>) {
  const { t } = useTranslation("locale");
  const navigate = useNavigate();
  const { lang } = useParams();
  const eqsQuery = useQuery({
    queryKey: ["pm-dashboard", "eqs", ticketId],
    queryFn: () => endpoints.evidenceQualityScores.getLatest(ticketId),
    enabled: Boolean(ticketId),
  });
  const traceabilityQuery = useQuery({
    queryKey: ["pm-dashboard", "traceability", ticketId],
    queryFn: () => endpoints.traceability.get(ticketId),
    enabled: Boolean(ticketId),
  });
  const firstCiPassQuery = useQuery({
    queryKey: ["pm-dashboard", "first-ci-pass", ticketId],
    queryFn: () => endpoints.pmDashboard.firstCiPass(ticketId),
    enabled: Boolean(ticketId),
  });
  const scoreThresholdsQuery = useQuery({
    queryKey: ["scoreThresholds", "list"],
    queryFn: endpoints.scoreThresholds.list,
  });
  const eqs = eqsQuery.data;
  const traceability = traceabilityQuery.data;
  const score = eqs?.score ?? detail?.row.evidenceQualityScore ?? null;
  const bandCurrent = resolveBand(scoreThresholdsQuery.data, score);
  const bandLabel = bandCurrent?.label ?? "";
  const bandColor = bandCurrent?.color;
  const presentEvidenceCount =
    detail?.missingEvidenceItems.filter((item) => item.existsFlag).length ?? 0;
  const totalEvidenceCount = detail?.missingEvidenceItems.length ?? 0;
  const traceabilityBrokenLinks = traceability?.brokenLinks ?? [];
  const traceabilityIssueCount = traceabilityBrokenLinks.length;
  const firstCiPassSuccess = firstCiPassQuery.data?.firstPassSuccess ?? false;
  const hasMissingSectionsTraceabilityIssue = traceabilityBrokenLinks.some(
    (item) => hasMissingSectionsIssue(item.message),
  );
  const isClean =
    !detail?.row.blockedFlag &&
    !detail?.row.waitingReviewFlag &&
    detail?.row.missingEvidenceCount === 0 &&
    detail?.row.riskCount === 0 &&
    detail?.row.exceptionCount === 0 &&
    detail?.row.ciFailedCount === 0 &&
    traceabilityIssueCount === 0;

  let content: ReactNode = null;
  if (isLoading) {
    content = (
      <div className="text-sm text-slate-500">
        {t("Pages.PmDashboard.loadingDetail")}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="text-sm text-rose-600">
        {t("Pages.PmDashboard.detailFailed")}
      </div>
    );
  } else if (detail) {
    content = (
      <div className="space-y-6 px-6 py-5">
        <SummaryBadges
          detail={detail}
          traceabilityIssueCount={traceabilityIssueCount}
          firstCiPassSuccess={firstCiPassSuccess}
          t={t}
        />
        <TicketInformationCard detail={detail} t={t} />
        <PhaseCard detail={detail} t={t} />
        <OpenIssuesCard issueItems={detail.issueItems} t={t} />
        <EqsSummaryCard
          eqs={eqs}
          bandLabel={bandLabel}
          bandColor={bandColor}
          score={score}
          isClean={isClean}
          isLoading={eqsQuery.isLoading}
          t={t}
        />

        <TraceabilityIssuesSection
          detail={detail}
          lang={lang}
          navigate={navigate}
          traceabilityBrokenLinks={traceabilityBrokenLinks}
          hasMissingSectionsTraceabilityIssue={
            hasMissingSectionsTraceabilityIssue
          }
          t={t}
        />

        <MissingEvidenceSection
          detail={detail}
          presentEvidenceCount={presentEvidenceCount}
          totalEvidenceCount={totalEvidenceCount}
          t={t}
        />
        <ExceptionSection detail={detail} t={t} />
        <RiskSection detail={detail} t={t} />
      </div>
    );
  }

  return (
    <Drawer
      open={Boolean(ticketId)}
      onClose={onClose}
      size={760}
      styles={{
        body: { padding: 0, overflowX: "hidden", overflowY: "auto" },
      }}
      title={
        detail
          ? detail.row.externalTicketKey
          : t("Pages.PmDashboard.detailTitle")
      }
      destroyOnHidden
    >
      {content}
    </Drawer>
  );
}
