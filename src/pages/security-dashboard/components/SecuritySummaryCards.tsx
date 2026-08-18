import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { SecurityDashboardSummary } from "../types";

type SummaryCardDef = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  value: string;
  tone: DashboardAccentTone;
};

type SecuritySummaryCardsProps = {
  summary: SecurityDashboardSummary;
};

/** KPI cards for Safety Pack, Secret Scan, SAST/SCA, and Open Exception. */
export function SecuritySummaryCards({
  summary,
}: Readonly<SecuritySummaryCardsProps>) {
  const { t } = useTranslation("locale");

  const cards: SummaryCardDef[] = [
    {
      key: "safetyPack",
      titleKey: "Pages.SecurityDashboard.cards.safetyPack.title",
      descriptionKey: "Pages.SecurityDashboard.cards.safetyPack.description",
      value: String(
        summary.safetyPack.warningCount + summary.safetyPack.missingCount,
      ),
      tone: "blue",
    },
    {
      key: "secretScan",
      titleKey: "Pages.SecurityDashboard.cards.secretScan.title",
      descriptionKey: "Pages.SecurityDashboard.cards.secretScan.description",
      value: String(summary.secretScan.failCount),
      tone: "red",
    },
    // {
    //   key: "sastSca",
    //   titleKey: "Pages.SecurityDashboard.cards.sastSca.title",
    //   descriptionKey: "Pages.SecurityDashboard.cards.sastSca.description",
    //   value: String(summary.sastSca.failCount),
    //   tone: "orange",
    // },
    {
      key: "exception",
      titleKey: "Pages.SecurityDashboard.cards.exception.title",
      descriptionKey: "Pages.SecurityDashboard.cards.exception.description",
      value: String(summary.exception.openCount),
      tone: "green",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
