import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { QaAcTicketPage } from "../types";

type StatDef = {
  key: string;
  titleKey: string;
  value: string;
  tone: DashboardAccentTone;
};

/** Section 2: Statistics cards for the ticket's AC coverage/testing. */
export function QaTicketStatsCards({
  acPage,
}: Readonly<{ acPage: QaAcTicketPage }>) {
  const { t } = useTranslation("locale");

  const stats: StatDef[] = [
    {
      key: "acCoverage",
      titleKey: "Pages.QaDashboard.ticketDetail.stats.acCoverage",
      value: `${acPage.coveragePercent}%`,
      tone: "blue",
    },
    {
      key: "totalAc",
      titleKey: "Pages.QaDashboard.ticketDetail.stats.totalAc",
      value: String(acPage.totalAcCount),
      tone: "purple",
    },
    {
      key: "testedAc",
      titleKey: "Pages.QaDashboard.ticketDetail.stats.testedAc",
      value: String(acPage.testedCount),
      tone: "green",
    },
    {
      key: "notTestedAc",
      titleKey: "Pages.QaDashboard.ticketDetail.stats.notTestedAc",
      value: String(acPage.notTestedCount),
      tone: "red",
    },
    {
      key: "testResult",
      titleKey: "Pages.QaDashboard.ticketDetail.stats.testResult",
      value: `${acPage.testResultPercent}%`,
      tone: "orange",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <SummaryCard
          key={stat.key}
          title={t(stat.titleKey)}
          description=""
          value={stat.value}
          tone={stat.tone}
        />
      ))}
    </div>
  );
}
