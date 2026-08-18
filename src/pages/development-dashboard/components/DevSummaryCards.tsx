import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { DevDashboardSummary } from "../types";

type SummaryCardDef = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  value: string;
  tone: DashboardAccentTone;
};

type DevSummaryCardsProps = Readonly<{
  summary: DevDashboardSummary;
}>;

export function DevSummaryCards({ summary }: DevSummaryCardsProps) {
  const { t } = useTranslation("locale");

  const cards: SummaryCardDef[] = [
    {
      key: "ciFailure",
      titleKey: "Pages.DevDashboard.cards.ciFailure.title",
      descriptionKey: "Pages.DevDashboard.cards.ciFailure.description",
      value: String(summary.ciFailureCount),
      tone: "red",
    },
    {
      key: "reviewComment",
      titleKey: "Pages.DevDashboard.cards.reviewComment.title",
      descriptionKey: "Pages.DevDashboard.cards.reviewComment.description",
      value: String(summary.reviewCommentCount),
      tone: "orange",
    },
    {
      key: "parserError",
      titleKey: "Pages.DevDashboard.cards.parserError.title",
      descriptionKey: "Pages.DevDashboard.cards.parserError.description",
      value: String(summary.parserErrorCount),
      tone: "orange",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
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
