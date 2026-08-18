import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  GitPullRequest,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { ApiError, endpoints } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import React from "react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type TraceabilityArtifactState = {
  artifactTypeCode: string;
  artifactName: string;
  defaultFileName: string;
  existsFlag: boolean;
  sourcePath: string | null;
  collectedAt: string | null;
  schemaVersion: number | null;
};

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  if (typeof text !== "string") return <>{text}</>;

  // Regex bắt @username và #issue
  const parts = text.split(/(@[a-zA-Z0-9_-]+|#[0-9]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const username = part.substring(1);
          return (
            <a
              key={index}
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#0969da",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {part}
            </a>
          );
        }
        if (part.startsWith("#")) {
          return (
            <span key={index} style={{ color: "#0969da", fontWeight: 600 }}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

const artifactOrder = [
  "SPEC_PACK",
  "IMPL_PLAN",
  "REVIEW_CHECKLIST",
  "SELF_REVIEW",
  "TEST_PLAN",
  "TEST_RESULTS",
  "REPORT",
] as const;

function shortHash(value: string | null | undefined) {
  if (!value) return "-";
  return value.length > 200 ? `${value.slice(0, 12)}...` : value;
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

// S6594, S8786: Use RegExp.exec() and simplify regex to reduce backtracking
function formatMissingSectionsMessage(message: string) {
  const regex = /(missing required section\(s\):\s*)(.*)/i;
  const match = regex.exec(message);
  if (!match) return message;
  const formattedSections = match[2]
    .split(",")
    .map((section) => formatSectionKey(section))
    .filter(Boolean);
  return `${match[1]}${formattedSections.join(", ")}`;
}

function listScrollClass(count: number) {
  return count > 10 ? "max-h-[32rem] overflow-y-auto pr-2" : "";
}

function completenessTone(percent: number) {
  if (percent >= 100) {
    return {
      badge: "success" as const,
      label: "Excellent",
      icon: CheckCircle2,
      accent: "from-emerald-50 via-white to-white",
      iconClass: "text-emerald-700",
      ringClass: "ring-emerald-100",
      barClass: "bg-emerald-600",
    };
  }

  if (percent >= 80) {
    return {
      badge: "warning" as const,
      label: "On track",
      icon: CheckCircle2,
      accent: "from-amber-50 via-white to-white",
      iconClass: "text-amber-700",
      ringClass: "ring-amber-100",
      barClass: "bg-amber-500",
    };
  }

  return {
    badge: "destructive" as const,
    label: "Needs work",
    icon: ShieldAlert,
    accent: "from-rose-50 via-white to-white",
    iconClass: "text-rose-700",
    ringClass: "ring-rose-100",
    barClass: "bg-rose-600",
  };
}

// S3776: Refactor countTone to reduce cognitive complexity by splitting into smaller functions
function getBrokenTone(count: number) {
  return {
    badge: count ? ("destructive" as const) : ("secondary" as const),
    label: count ? "Issues found" : "All clear",
    icon: count ? AlertTriangle : CheckCircle2,
    accent: count
      ? "from-rose-50 via-white to-white"
      : "from-slate-50 via-white to-white",
    iconClass: count ? "text-rose-700" : "text-slate-500",
    ringClass: count ? "ring-rose-100" : "ring-slate-100",
  };
}

function getReviewRoundTone(count: number) {
  return {
    badge: count ? ("secondary" as const) : ("outline" as const),
    label: "Review round count",
    icon: GitPullRequest,
    accent: "from-sky-50 via-white to-white",
    iconClass: "text-sky-700",
    ringClass: "ring-sky-100",
  };
}

function getPrTone(count: number) {
  return {
    badge: count ? ("secondary" as const) : ("outline" as const),
    label: count ? "Linked" : "No PRs",
    icon: GitPullRequest,
    accent: "from-sky-50 via-white to-white",
    iconClass: "text-sky-700",
    ringClass: "ring-sky-100",
  };
}

function getCiTone(count: number) {
  return {
    badge: count ? ("success" as const) : ("outline" as const),
    label: count ? "Passing" : "No runs",
    icon: GitCommit,
    accent: "from-violet-50 via-white to-white",
    iconClass: "text-violet-700",
    ringClass: "ring-violet-100",
  };
}

function getArtifactTone(count: number) {
  return {
    badge: count ? ("success" as const) : ("warning" as const),
    label: count ? "Ready" : "Missing items",
    icon: CheckCircle2,
    accent: count
      ? "from-emerald-50 via-white to-white"
      : "from-amber-50 via-white to-white",
    iconClass: count ? "text-emerald-700" : "text-amber-700",
    ringClass: count ? "ring-emerald-100" : "ring-amber-100",
  };
}

function countTone(
  count: number,
  kind: "artifact" | "pr" | "ci" | "broken" | "reviewRound",
) {
  switch (kind) {
    case "broken":
      return getBrokenTone(count);
    case "pr":
      return getPrTone(count);
    case "ci":
      return getCiTone(count);
    case "artifact":
      return getArtifactTone(count);
    case "reviewRound":
      return getReviewRoundTone(count);
  }
}

// S3358: Extract nested ternary operations into helper functions
function renderEmptyState(t: any, onBackClick: () => void) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 text-sm text-muted-foreground">
        <div>{t("Pages.Traceability.emptyState")}</div>
        <div>
          <Button variant="outline" onClick={onBackClick}>
            {t("Pages.Traceability.backToDashboard", {
              defaultValue: "Back to dashboard",
            })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderLoadingState(t: any) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">
        {t("Pages.Traceability.loading")}
      </CardContent>
    </Card>
  );
}

function renderErrorState(error: any, t: any) {
  const isNotFound = error instanceof ApiError && error.status === 404;
  const message = isNotFound
    ? t("Pages.Traceability.NotFound")
    : t("Pages.Traceability.loadingFailed");

  return (
    <Card>
      <CardContent className="p-6 text-sm text-rose-600">{message}</CardContent>
    </Card>
  );
}

// S3776, S107: Extract the complex render logic with config object to reduce parameters
interface ContentCardsConfig {
  summary: any;
  artifacts: TraceabilityArtifactState[];
  pullRequests: any[];
  commits: any[];
  ciRuns: any[];
  brokenLinkCount: number;
  completeness: any;
  artifactTone: any;
  prTone: any;
  brokenTone: any;
  artifactSectionId: string;
  pullRequestSectionId: string;
  ciRunSectionId: string;
  traceabilityQuery: any;
  t: any;
  reviewRoundTone: any;
  reviewComments: any[];
}

function renderContentCards(config: ContentCardsConfig) {
  const {
    summary,
    artifacts,
    pullRequests,
    commits,
    ciRuns,
    brokenLinkCount,
    completeness,
    artifactTone,
    prTone,
    brokenTone,
    artifactSectionId,
    pullRequestSectionId,
    ciRunSectionId,
    traceabilityQuery,
    t,
    reviewRoundTone,
    reviewComments,
  } = config;
  const CompletenessIcon = completeness.icon;
  const ArtifactIcon = artifactTone.icon;
  const PrIcon = prTone.icon;
  const BrokenIcon = brokenTone.icon;
  const primaryCommit = commits[0] ?? null;
  const primaryCiRun = ciRuns[0] ?? null;
  const ReviewRoundIcon = reviewRoundTone.icon;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card
          className={cn(
            "overflow-hidden border shadow-sm",
            completeness.ringClass,
            `bg-gradient-to-br ${completeness.accent}`,
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>
                  {t("Pages.Traceability.completeness")}
                </CardDescription>
                <CardTitle className="!text-3xl font-semibold tracking-tight lg:text-5xl">
                  {summary.completenessPercent}%
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200">
                <CompletenessIcon
                  className={cn("h-5 w-5", completeness.iconClass)}
                />
              </div>
            </div>
            <Badge variant={completeness.badge} className="w-fit">
              {completeness.label}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className={cn("h-full rounded-full", completeness.barClass)}
                style={{ width: `${summary.completenessPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "overflow-hidden border shadow-sm",
            artifactTone.ringClass,
            `bg-gradient-to-br ${artifactTone.accent}`,
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>
                  {t("Pages.Traceability.artifacts")}
                </CardDescription>
                <CardTitle className="!text-3xl font-semibold tracking-tight lg:text-5xl">
                  {summary.artifactCount}/{artifactOrder.length}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200">
                <ArtifactIcon
                  className={cn("h-5 w-5", artifactTone.iconClass)}
                />
              </div>
            </div>
            <Badge variant={artifactTone.badge} className="w-fit">
              {artifactTone.label}
            </Badge>
          </CardHeader>
        </Card>
        <Card
          className={cn(
            "overflow-hidden border shadow-sm",
            prTone.ringClass,
            `bg-gradient-to-br ${prTone.accent}`,
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>{t("Pages.Traceability.prs")}</CardDescription>
                <CardTitle className="!text-3xl font-semibold tracking-tight lg:text-5xl">
                  {summary.prCount}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200">
                <PrIcon className={cn("h-5 w-5", prTone.iconClass)} />
              </div>
            </div>
            <Badge variant={prTone.badge} className="w-fit">
              {prTone.label}
            </Badge>
          </CardHeader>
        </Card>
        <Card
          className={cn(
            "overflow-hidden border shadow-sm",
            brokenTone.ringClass,
            `bg-gradient-to-br ${brokenTone.accent}`,
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>
                  {t("Pages.Traceability.brokenLinks")}
                </CardDescription>
                <CardTitle className="!text-3xl font-semibold tracking-tight lg:text-5xl">
                  {summary.brokenLinkCount}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200">
                <BrokenIcon className={cn("h-5 w-5", brokenTone.iconClass)} />
              </div>
            </div>
            <Badge variant={brokenTone.badge} className="w-fit">
              {brokenTone.label}
            </Badge>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            "overflow-hidden border shadow-sm",
            reviewRoundTone.ringClass,
            `bg-gradient-to-br ${reviewRoundTone.accent}`,
          )}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardDescription>
                  {t("Pages.Traceability.reviewRounds")}
                </CardDescription>
                <CardTitle className="!text-3xl font-semibold tracking-tight lg:text-5xl">
                  {summary?.reviewRoundCount ?? 0}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-white/80 p-2.5 shadow-sm ring-1 ring-slate-200">
                <ReviewRoundIcon
                  className={cn("h-5 w-5", reviewRoundTone.iconClass)}
                />
              </div>
            </div>
            <Badge variant={reviewRoundTone.badge} className="w-fit">
              {reviewRoundTone.label}
            </Badge>
          </CardHeader>
        </Card>
      </div>

      <Card id={artifactSectionId} className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t("Pages.Traceability.traceabilityTab")}</CardTitle>
          <CardDescription>
            {summary.externalTicketKey}
            {summary.title ? ` - ${summary.title}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent
          className={cn("overflow-x-auto", listScrollClass(artifacts.length))}
        >
          <table className="w-full text-sm table-fixed">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 w-1/5">{t("Pages.Traceability.item")}</th>
                <th className="py-2 w-28">{t("Pages.Traceability.state")}</th>

                <th className="py-2">{t("Pages.Traceability.path")}</th>

                <th className="py-2 text-center w-40">
                  {t("Pages.Traceability.version", { defaultValue: "Version" })}
                </th>

                <th className="py-2 w-40">
                  {t("Pages.Traceability.updatedAt")}
                </th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((artifact: any) => (
                <tr
                  key={artifact.artifactTypeCode}
                  id={`artifact-${artifact.artifactTypeCode}`}
                  className="border-t"
                >
                  <td className="py-3 pr-2">
                    <div className="font-medium">{artifact.artifactName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {artifact.defaultFileName}
                    </div>
                  </td>
                  <td className="py-3 pr-2">
                    <Badge
                      variant={artifact.existsFlag ? "success" : "warning"}
                    >
                      {artifact.existsFlag
                        ? t("Pages.Traceability.present")
                        : t("Pages.Traceability.missing")}
                    </Badge>
                  </td>

                  <td className="py-3 pr-2 text-slate-600 break-all">
                    {artifact.sourcePath ?? "-"}
                  </td>

                  <td className="py-3 pr-2 text-slate-600 text-center font-mono">
                    {artifact.schemaVersion ?? "-"}
                  </td>
                  <td className="py-3 text-slate-600">
                    {formatDateTime(artifact.collectedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t("Pages.Traceability.brokenLinksTitle")}</CardTitle>
        </CardHeader>
        <CardContent
          className={cn("space-y-3", listScrollClass(brokenLinkCount))}
        >
          {brokenLinkCount ? (
            traceabilityQuery.data?.brokenLinks.map((item: any) => (
              <div
                key={`${item.code}-${item.item}`}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div>
                  <div className="font-medium">{item.item}</div>
                  <div className="text-xs text-slate-500">
                    {formatMissingSectionsMessage(item.message)}
                  </div>
                </div>
                <Badge
                  variant={
                    item.severity === "ERROR" ? "destructive" : "warning"
                  }
                >
                  {item.severity}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("Pages.Traceability.noBrokenLinks")}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("Pages.Traceability.reviewComments")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewComments.length === 0 ? (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {t("Pages.Traceability.noReviewComments")}
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto pr-1">
              <div className="space-y-4">
                {reviewComments.map((item) => (
                  <div
                    key={item.reviewCommentId}
                    className={cn(
                      "rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm",
                      {
                        "border-red-100 bg-red-50/50":
                          item.state === "CHANGES_REQUESTED",
                        "border-green-100 bg-green-50/50":
                          item.state === "APPROVED",
                        "border-yellow-100 bg-yellow-50/50":
                          item.state === "REVIEW_REQUIRED",
                      },
                    )}
                    style={{
                      color: "#1F2328",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between border-b border-gray-100 pb-2 mb-2",
                        {
                          "border-red-100": item.state === "CHANGES_REQUESTED",
                          "border-green-100": item.state === "APPROVED",
                          "border-yellow-100": item.state === "REVIEW_REQUIRED",
                        },
                      )}
                    >
                      <div className="font-semibold text-slate-900 text-sm">
                        {item.submittedBy} - {formatDateTime(item.submittedAt)}
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 font-bold tracking-wide uppercase shrink-0",
                          {
                            "bg-red-100 text-red-700":
                              item.state === "CHANGES_REQUESTED",
                            "bg-green-100 text-green-700":
                              item.state === "APPROVED",
                            "bg-yellow-100 text-yellow-700":
                              item.state === "REVIEW_REQUIRED",
                          },
                        )}
                      >
                        {item.state}
                      </span>
                    </div>
                    {item.commentSummary ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          // 1. HEADERS
                          h1: ({ children }) => (
                            <h1
                              style={{
                                fontSize: "2em",
                                fontWeight: 600,
                                borderBottom: "1px solid #hsla(210,18%,87%,1)",
                                paddingBottom: "0.3em",
                                marginTop: "24px",
                                marginBottom: "16px",
                              }}
                            >
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2
                              style={{
                                fontSize: "1.5em",
                                fontWeight: 600,
                                borderBottom: "1px solid #d0d7de",
                                paddingBottom: "0.3em",
                                marginTop: "24px",
                                marginBottom: "16px",
                              }}
                            >
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <>
                              <style>{`
                                  .custom-gfm-h3 {
                                    font-size: 1.25em !important;
                                    font-weight: 600 !important;
                                    margin-top: 24px !important;
                                    margin-bottom: 16px !important;
                                  }
                                `}</style>
                              <h3 className="custom-gfm-h3">{children}</h3>
                            </>
                          ),

                          // 2. BLOCKQUOTE
                          blockquote: ({ children }) => (
                            <blockquote
                              style={{
                                margin: "0 0 16px 0",
                                padding: "0 1em",
                                color: "#59636e",
                                borderLeft: "0.25em solid #d0d7de",
                              }}
                            >
                              {children}
                            </blockquote>
                          ),

                          // 3. UNORDERED & NUMBERED LIST
                          ul: ({ children }) => (
                            <ul
                              key={item.reviewCommentId}
                              style={{
                                paddingLeft: "2em",
                                marginTop: 0,
                                marginBottom: "16px",
                                listStyleType: "disc",
                              }}
                            >
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol
                              key={item.reviewCommentId}
                              style={{
                                paddingLeft: "2em",
                                marginTop: 0,
                                marginBottom: "16px",
                                listStyleType: "decimal",
                              }}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children, className }) => {
                            // Kiểm tra xem li này có phải là Tasklist không
                            const isTaskList =
                              className && className.includes("task-list-item");
                            return (
                              <li
                                key={item.reviewCommentId}
                                style={{
                                  marginTop: "0.25em",
                                  listStyleType: isTaskList
                                    ? "none"
                                    : undefined,
                                  marginLeft: isTaskList ? "-1.5em" : undefined,
                                }}
                              >
                                {children}
                              </li>
                            );
                          },

                          // 4. TASKLIST CHECKBOX
                          input: ({ type, checked }) => {
                            if (type === "checkbox") {
                              return (
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  readOnly
                                  style={{
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                    cursor: "default",
                                  }}
                                />
                              );
                            }
                            return null;
                          },

                          // 5. MENTION & TEXT FORMATTING (@username, #123)
                          p: ({ children }) => {
                            return (
                              <p style={{ marginTop: 0, marginBottom: "16px" }}>
                                {React.Children.map(children, (child) =>
                                  typeof child === "string" ? (
                                    <FormattedText text={child} />
                                  ) : (
                                    child
                                  ),
                                )}
                              </p>
                            );
                          },

                          // 6. CODE INLINE & CODE BLOCK BASIC
                          code: ({
                            inline,
                            children,
                            ...props
                          }: {
                            inline?: boolean;
                            children?: React.ReactNode;
                          }) => {
                            const content = String(children);
                            // Kiểm tra xem chuỗi có chứa xuống dòng hay không
                            const hasNewLine = content.includes("\n");

                            // Nếu là inline code chuẩn (không có xuống dòng) -> Render thẻ <code> nhỏ
                            if (inline && !hasNewLine) {
                              return (
                                <code
                                  style={{
                                    backgroundColor: "rgba(175,184,193,0.2)",
                                    padding: "0.2em 0.4em",
                                    borderRadius: "6px",
                                    fontSize: "85%",
                                    fontFamily:
                                      "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }

                            // Nếu là code block (hoặc inline code nhưng có chứa xuống dòng \n) -> Render khối <pre><code>
                            return (
                              <pre
                                style={{
                                  backgroundColor: "#f6f8fa",
                                  padding: "16px",
                                  borderRadius: "6px",
                                  overflow: "auto",
                                  fontSize: "85%",
                                  lineHeight: "1.45",
                                  fontFamily:
                                    "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace",
                                  marginTop: "0",
                                  marginBottom: "16px",
                                  border: "1px solid #d0d7de",
                                }}
                              >
                                <code
                                  style={{
                                    fontFamily: "inherit",
                                    whiteSpace: "pre",
                                  }}
                                >
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {item.commentSummary}
                      </ReactMarkdown>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card id={pullRequestSectionId} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("Pages.Traceability.prs")}</CardTitle>
          </CardHeader>
          <CardContent
            className={cn("space-y-3", listScrollClass(pullRequests.length))}
          >
            {pullRequests.length ? (
              pullRequests.map((pr: any) => (
                <div
                  key={pr.prId}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{pr.title ?? "-"}</div>
                      <div className="text-xs text-slate-500">
                        {pr.sourceBranch ?? "-"}
                        {" -> "}
                        {pr.targetBranch ?? "-"}
                      </div>
                    </div>
                    <Badge variant="secondary">{pr.status}</Badge>
                  </div>
                  <div className="mt-3">
                    {pr.externalPrUrl ? (
                      <a
                        href={pr.externalPrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700 hover:decoration-slate-500"
                      >
                        PR #{pr.externalPrId}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-slate-900">
                        PR #{pr.externalPrId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("Pages.Traceability.noLinks")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {t("Pages.Traceability.commits")}
            </CardTitle>
            <CardDescription>
              {primaryCommit ? (
                <span title={primaryCommit.commitHash}>
                  {t("Pages.Traceability.lastCommit")}:{" "}
                  {shortHash(primaryCommit.commitHash)}
                </span>
              ) : (
                t("Pages.Traceability.noLinks")
              )}
            </CardDescription>
          </CardHeader>
          <CardContent
            className={cn("space-y-3", listScrollClass(commits.length))}
          >
            {commits.length ? (
              commits.map((commit: any) => (
                <div
                  key={commit.commitId}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {commit.commitUrl ? (
                        <a
                          href={commit.commitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-base font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700 hover:decoration-slate-500"
                          title={commit.commitHash}
                        >
                          {shortHash(commit.commitHash)}
                        </a>
                      ) : (
                        <div
                          className="truncate text-base font-semibold text-slate-900"
                          title={commit.commitHash}
                        >
                          {shortHash(commit.commitHash)}
                        </div>
                      )}
                      <div className="mt-0.5 truncate text-sm text-slate-600">
                        {commit.branchName ?? "-"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("Pages.Traceability.noLinks")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id={ciRunSectionId} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("Pages.Traceability.ciRuns")}</CardTitle>
            <CardDescription>
              {t("Pages.Traceability.lastRun")}:{" "}
              {primaryCiRun
                ? `Run #${primaryCiRun.externalCiRunId}`
                : t("Pages.Traceability.noLinks")}
            </CardDescription>
          </CardHeader>
          <CardContent
            className={cn("space-y-3", listScrollClass(ciRuns.length))}
          >
            {ciRuns.length ? (
              ciRuns.map((run: any) => (
                <div
                  key={run.ciRunId}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate font-medium text-slate-900"
                        title={run.workflowName ?? "-"}
                      >
                        {run.workflowName ?? "-"}
                      </div>
                      <div className="text-xs text-slate-500">{run.status}</div>
                    </div>

                    {run.ciUrl ? (
                      <a
                        href={run.ciUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center rounded-md text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700 hover:decoration-slate-500"
                      >
                        Run #{run.externalCiRunId}
                      </a>
                    ) : (
                      <span className="shrink-0 text-sm font-medium text-slate-900">
                        Run #{run.externalCiRunId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("Pages.Traceability.noLinks")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function TraceabilityPage() {
  const { t } = useTranslation("locale");
  const navigate = useNavigate();
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId")?.trim() ?? "";
  const from = searchParams.get("from")?.trim();

  const traceabilityQuery = useQuery({
    queryKey: ["traceability", ticketId],
    queryFn: () => endpoints.traceability.get(ticketId),
    enabled: !!ticketId,
  });

  const artifacts = useMemo<TraceabilityArtifactState[]>(() => {
    const items = traceabilityQuery.data?.artifacts ?? [];
    return artifactOrder.map((code) => {
      const found =
        items.find((item) => item.artifactTypeCode === code) ?? null;
      return {
        artifactTypeCode: code,
        artifactName: found?.artifactName ?? code,
        defaultFileName: found?.defaultFileName ?? code.toLowerCase(),
        existsFlag: found?.existsFlag ?? false,
        sourcePath: found?.sourcePath ?? null,
        collectedAt: found?.collectedAt ?? null,
        schemaVersion: found?.schemaVersion ?? null,
      };
    });
  }, [traceabilityQuery.data?.artifacts]);

  const backToDashboard = () => {
    const fallback = `/${lang ?? "en"}/${from || "pm-dashboard"}`;
    navigate(fallback, { replace: true });
  };

  const summary = traceabilityQuery.data?.summary;
  const reviewComments = traceabilityQuery.data?.reviewComments ?? [];
  const pullRequests = traceabilityQuery.data?.pullRequests ?? [];
  const commits = traceabilityQuery.data?.commits ?? [];
  const ciRuns = traceabilityQuery.data?.ciRuns ?? [];
  const ticketKey = summary?.externalTicketKey;
  const ticketKeyLabel = t("Pages.Traceability.ticket", {
    defaultValue: "Ticket key",
  });

  const completeness = completenessTone(summary?.completenessPercent ?? 0);
  const artifactTone = countTone(summary?.artifactCount ?? 0, "artifact");
  const prTone = countTone(summary?.prCount ?? 0, "pr");

  const artifactSectionId = "traceability-artifacts";
  const pullRequestSectionId = "traceability-pull-requests";
  const ciRunSectionId = "traceability-ci-runs";
  const brokenLinkCount = traceabilityQuery.data?.brokenLinks.length ?? 0;
  const brokenTone = countTone(brokenLinkCount, "broken");
  const reviewRoundCount = summary?.reviewRoundCount ?? 0;
  const reviewRoundTone = countTone(reviewRoundCount, "reviewRound");

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 px-4 pb-8 pt-4">
      <Card className="min-h-[10rem] border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-lg">
        <CardHeader className="space-y-3 pb-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            {t("Pages.Traceability.title")}
          </h1>
          <h2>{t("Pages.Traceability.description")}</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-xs uppercasetext-slate-500">
              {ticketKeyLabel}: {ticketKey ?? t("Pages.Traceability.loading")}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={backToDashboard}
            className="justify-self-start md:justify-self-end"
          >
            {t("Pages.Traceability.backToDashboard", {
              defaultValue: "Back to dashboard",
            })}
          </Button>
        </CardContent>
      </Card>

      {(() => {
        if (!ticketId) return renderEmptyState(t, backToDashboard);
        if (traceabilityQuery.isLoading) return renderLoadingState(t);
        if (traceabilityQuery.isError)
          return renderErrorState(traceabilityQuery.error, t);
        if (summary)
          return renderContentCards({
            summary,
            artifacts,
            pullRequests,
            commits,
            ciRuns,
            brokenLinkCount,
            completeness,
            artifactTone,
            prTone,
            brokenTone,
            artifactSectionId,
            pullRequestSectionId,
            ciRunSectionId,
            traceabilityQuery,
            t,
            reviewRoundTone,
            reviewComments,
          });
        return null;
      })()}
    </div>
  );
}
