import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { QaSummary } from "../types";

type SummaryCardDef = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  value: string;
  tone: DashboardAccentTone;
};

type QaSummaryCardsProps = {
  summary: QaSummary;
};

/**
 * The 2x3 grid of QA KPI cards: AC-Test Coverage, AC not tested, Blackbox
 * Coverage, Test Results, Defect Leakage, and Acceptance-ready count.
 */
export function QaSummaryCards({ summary }: QaSummaryCardsProps) {
  const { t } = useTranslation("locale");

  const cards: SummaryCardDef[] = [
    {
      key: "acTestCoverage",
      titleKey: "Pages.QaDashboard.cards.acTestCoverage.title",
      descriptionKey: "Pages.QaDashboard.cards.acTestCoverage.description",
      value: `${summary.acTestCoveragePercent}%`,
      tone: "orange",
    },
    {
      key: "acNotTested",
      titleKey: "Pages.QaDashboard.cards.acNotTested.title",
      descriptionKey: "Pages.QaDashboard.cards.acNotTested.description",
      value: String(summary.acNotTestedCount),
      tone: "red",
    },
    {
      key: "testResults",
      titleKey: "Pages.QaDashboard.cards.testResults.title",
      descriptionKey: "Pages.QaDashboard.cards.testResults.description",
      value: `${summary.testResultsPassPercent}%`,
      tone: "green",
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
