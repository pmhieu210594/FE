import { Drawer } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { cn, formatDateTime } from "@/lib/utils";
import { endpoints } from "@/lib/api";
import type { DevTicketDetail } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import remarkBreaks from "remark-breaks";

// 1. Khai báo Interface cho Props của FormattedText
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

type DevTicketDetailDrawerProps = Readonly<{
  ticketId: string;
  detail: DevTicketDetail | null;
  onClose: () => void;
}>;

function ciStatusClass(status: string): string {
  if (status === "FAILURE") return "text-red-600 font-semibold";
  if (status === "SUCCESS") return "text-green-600 font-semibold";
  return "text-slate-500";
}

function ExternalLinkIcon() {
  return (
    <svg
      className="ml-1 h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

export function DevTicketDetailDrawer({
  ticketId,
  detail,
  onClose,
}: DevTicketDetailDrawerProps) {
  const { t } = useTranslation("locale");
  const navigate = useNavigate();
  const { lang } = useParams();

  const traceabilityQuery = useQuery({
    queryKey: ["devDashboard", "traceability", ticketId],
    queryFn: () => endpoints.traceability.get(ticketId),
    enabled: Boolean(ticketId),
  });
  const brokenLinks = (traceabilityQuery.data?.brokenLinks ?? []).filter(
    (item) => item.code !== "PR" && item.code !== "CI",
  );

  const reviews = detail?.reviewComments ?? [];

  const latestFailureCiRuns =
    detail?.ciRuns
      .filter((run) => run.status === "FAILURE")
      .slice()
      .sort((a, b) => {
        const aTime = a.startedAt ? Date.parse(a.startedAt) : 0;
        const bTime = b.startedAt ? Date.parse(b.startedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, 1) ?? [];

  const ciRunsToShow =
    latestFailureCiRuns.length > 0
      ? latestFailureCiRuns
      : (detail?.ciRuns ?? []);

  return (
    <Drawer
      open={Boolean(ticketId)}
      onClose={onClose}
      size={760}
      title={
        detail
          ? detail.row.externalTicketKey
          : t("Pages.DevDashboard.detail.title")
      }
      destroyOnHidden
    >
      {detail == null ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          {t("Pages.DevDashboard.emptyState")}
        </div>
      ) : (
        <div className="space-y-6">
          {/* CI Runs */}
          {ciRunsToShow.length > 0 ? (
            <section>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("Pages.DevDashboard.detail.ciRuns")}
                </p>

                {ciRunsToShow[0]?.ciUrl ? (
                  <a
                    href={ciRunsToShow[0].ciUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none shadow-sm"
                  >
                    {t("Pages.DevDashboard.detail.viewCiRun")}
                    <ExternalLinkIcon />
                  </a>
                ) : null}
              </div>

              <ul className="space-y-2">
                {ciRunsToShow.map((run) => (
                  <li
                    key={run.ciRunId}
                    className="flex items-center justify-between rounded border border-slate-100 p-2 text-sm bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-slate-700 font-medium truncate">
                        {run.workflowName ?? "—"}
                      </span>
                      {run.failureCategory ? (
                        <span className="text-xs text-slate-400 truncate">
                          {run.failureCategory}
                        </span>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <span className={ciStatusClass(run.status)}>
                        {run.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("Pages.DevDashboard.detail.reviewComments")}
              </p>
            </div>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {t("Pages.DevDashboard.detail.noReviewComments")}
              </div>
            ) : (
              <div className="max-h-[370px] overflow-y-auto space-y-4">
                {reviews.map((item) =>
                  item.commentSummary != "" ? (
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
                            "border-red-100":
                              item.state === "CHANGES_REQUESTED",
                            "border-green-100": item.state === "APPROVED",
                            "border-yellow-100":
                              item.state === "REVIEW_REQUIRED",
                          },
                        )}
                      >
                        <div className="font-semibold text-slate-900 text-sm">
                          {item.submittedBy} -{" "}
                          {formatDateTime(item.submittedAt)}
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
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </section>

          {/* Parser error */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("Pages.DevDashboard.detail.parserErrors")}
              </p>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none shadow-sm"
                onClick={() =>
                  navigate(
                    `/${lang ?? "en"}/traceability?ticketId=${detail.row.ticketId}&from=development-dashboard`,
                  )
                }
              >
                {t("Pages.DevDashboard.detail.openTraceability")}
              </button>
            </div>

            {brokenLinks.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {t("Pages.DevDashboard.detail.noParserErrors")}
              </div>
            ) : (
              <div className="space-y-4">
                {brokenLinks.map((item) => (
                  <div
                    key={`${item.code}-${item.item}`}
                    className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-red-100 pb-2 mb-2">
                      <div className="font-semibold text-slate-900 text-sm">
                        {item.item}
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase shrink-0",
                          item.severity === "ERROR"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700",
                        )}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 break-words">
                      {item.message.includes("missing required section(s):") ? (
                        <div>
                          <span className="font-medium block mb-1">
                            {item.message.split(":")[0]}:
                          </span>
                          <ul className="list-inside list-disc pl-2 space-y-1 text-slate-700 font-mono text-[11px]">
                            {item.message
                              .split(":")[1]
                              ?.split(/,\s(?=[A-Z])/)
                              .map((section, idx) => (
                                <li key={idx} className="tracking-wide">
                                  {section.trim()}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : (
                        item.message
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}
