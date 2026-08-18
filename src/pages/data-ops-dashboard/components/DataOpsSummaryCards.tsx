import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { DataOpsDashboardSummary } from "../types";

type SummaryCardDef = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  value: number;
  tone: DashboardAccentTone;
};

type DataOpsSummaryCardsProps = Readonly<{
  summary: DataOpsDashboardSummary;
}>;

export function DataOpsSummaryCards({ summary }: DataOpsSummaryCardsProps) {
  const { t } = useTranslation("locale");

  const cards: SummaryCardDef[] = [
    {
      key: "connectorFailure",
      titleKey: "Pages.DataOpsDashboard.cards.connectorFailure.title",
      descriptionKey:
        "Pages.DataOpsDashboard.cards.connectorFailure.description",
      value: summary.connectorFailureCount,
      tone: "red",
    },
    {
      key: "parseError",
      titleKey: "Pages.DataOpsDashboard.cards.parseError.title",
      descriptionKey: "Pages.DataOpsDashboard.cards.parseError.description",
      value: summary.parseErrorCount,
      tone: "orange",
    },
    {
      key: "missingEvidence",
      titleKey: "Pages.DataOpsDashboard.cards.missingEvidence.title",
      descriptionKey:
        "Pages.DataOpsDashboard.cards.missingEvidence.description",
      value: summary.missingEvidenceCount,
      tone: "purple",
    },
    {
      key: "staleFreshness",
      titleKey: "Pages.DataOpsDashboard.cards.staleFreshness.title",
      descriptionKey: "Pages.DataOpsDashboard.cards.staleFreshness.description",
      value: summary.staleFreshnessCount,
      tone: "blue",
    },
    {
      key: "brokenLink",
      titleKey: "Pages.DataOpsDashboard.cards.brokenLink.title",
      descriptionKey: "Pages.DataOpsDashboard.cards.brokenLink.description",
      value: summary.brokenLinkCount,
      tone: "green",
    },
  ];

  return (
    <div
      data-testid="data-ops-summary-cards"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          title={t(card.titleKey)}
          description={t(card.descriptionKey)}
          value={card.value}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
