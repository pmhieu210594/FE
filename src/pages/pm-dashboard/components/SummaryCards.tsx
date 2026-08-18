import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { PmDashboardSummary } from "@/lib/api";

type AccentTone = "blue" | "red" | "orange";

const ACCENT_BAR_CLASS: Record<AccentTone, string> = {
  blue: "bg-blue-500",
  red: "bg-rose-500",
  orange: "bg-amber-500",
};

type SummaryCardDef = {
  key: string;
  title: string;
  description: string;
  value: number | string;
  tone: AccentTone;
};

type SummaryCardsProps = {
  summary: PmDashboardSummary | undefined;
};

/**
 * The 2x3 grid of KPI cards under the dashboard title: each card has a thin
 * accent bar on top (color signals severity) and a short Vietnamese
 * description line, matching the EDCAP PM dashboard mock.
 */
export function SummaryCards({ summary }: Readonly<SummaryCardsProps>) {
  const { t } = useTranslation("locale");

  const cards: SummaryCardDef[] = [
    {
      key: "blockedTickets",
      title: t("Pages.PmDashboard.cards.ticketBlock.title", {
        defaultValue: "Tickets are stuck",
      }),
      description: t("Pages.PmDashboard.cards.ticketBlock.description", {
        defaultValue:
          "The ticket remains open and is stalled due to a long-pending PR, missing evidence, pending review, CI failure, open issues, or risks.",
      }),
      value: summary?.blockedTicketCount ?? 0,
      tone: "red",
    },
    {
      key: "missingEvidence",
      title: t("Pages.PmDashboard.cards.missingEvidence.title", {
        defaultValue: "Missing Evidence",
      }),
      description: t("Pages.PmDashboard.cards.missingEvidence.description", {
        defaultValue:
          "The ticket is missing at least one required evidence file.",
      }),
      value: summary?.missingEvidenceTicketCount ?? 0,
      tone: "red",
    },
    {
      key: "ciFailure",
      title: t("Pages.PmDashboard.cards.ciFailure.title", {
        defaultValue: "CI Failed",
      }),
      description: t("Pages.PmDashboard.cards.ciFailure.description", {
        defaultValue: "The ticket has a failed CI run.",
      }),
      value: summary?.ciFailedTicketCount ?? 0,
      tone: "red",
    },
    {
      key: "firstCiPassRate",
      title: t("Pages.PmDashboard.cards.firstCIPassRate.title", {
        defaultValue: "First CI Pass Rate",
      }),
      description: t("Pages.PmDashboard.cards.firstCIPassRate.description", {
        defaultValue:
          "The percentage of tickets that pass their first CI run out of the total tickets that have CI runs.",
      }),
      value: formatFirstCiPassRate(
        summary?.firstCiPassTicketCount ?? 0,
        summary?.ticketWithCiCount ?? 0,
      ),
      tone: "blue",
    },
    {
      key: "exception",
      title: t("Pages.PmDashboard.cards.exception.title", {
        defaultValue: "Exception",
      }),
      description: t("Pages.PmDashboard.cards.exception.description", {
        defaultValue: "Number of tickets with exceptions.",
      }),
      value: summary?.exceptionTicketCount ?? 0,
      tone: "orange",
    },
    {
      key: "risk",
      title: t("Pages.PmDashboard.cards.risk.title", { defaultValue: "Risk" }),
      description: t("Pages.PmDashboard.cards.risk.description", {
        defaultValue: "The ticket has an open risk signal.",
      }),
      value: summary?.riskTicketCount ?? 0,
      tone: "orange",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          title={card.title}
          description={card.description}
          value={card.value}
          tone={card.tone}
        />
      ))}
    </div>
  );
}

function formatFirstCiPassRate(firstPass: number, totalWithCi: number) {
  if (totalWithCi <= 0) return "N/A";
  const rate = (firstPass / totalWithCi) * 100;
  const rounded = Math.round(rate * 10) / 10;
  return `${rounded}%`;
}

function SummaryCard({
  title,
  description,
  value,
  tone,
}: Readonly<{
  title: string;
  description: string;
  value: number | string;
  tone: AccentTone;
}>) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={cn("h-1.5 w-full", ACCENT_BAR_CLASS[tone])} />
      <div className="space-y-2 p-5">
        <div className="text-sm font-medium text-slate-500">{title}</div>
        <div className="!text-3xl font-black tracking-tight tabular-nums text-slate-950">
          {value}
        </div>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
