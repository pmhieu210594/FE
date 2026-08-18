import { useTranslation } from "react-i18next";

import {
  SummaryCard,
  type DashboardAccentTone,
} from "@/components/dashboard/SummaryCard";
import type { AuditLogListItem } from "../types";

type SummaryCardDef = {
  key: string;
  title: string;
  description: string;
  value: number;
  tone: DashboardAccentTone;
};

type AuditLogSummaryCardsProps = Readonly<{
  items: AuditLogListItem[];
  totalElements: number;
}>;

/**
 * No dedicated BE summary endpoint was added for this ticket (see self-review.md
 * §8), so the module count is computed from the current page of results only,
 * not the full filtered set. Labeled explicitly to avoid implying this is a
 * total across all pages.
 */
export function AuditLogSummaryCards({
  items,
  totalElements,
}: AuditLogSummaryCardsProps) {
  const { t } = useTranslation("locale");

  const moduleCount = new Set(items.map((item) => item.module).filter(Boolean))
    .size;

  const cards: SummaryCardDef[] = [
    {
      key: "total",
      title: t("Pages.AdminAuditLog.cards.total.title"),
      description: t("Pages.AdminAuditLog.cards.total.description"),
      value: totalElements,
      tone: "blue",
    },
    {
      key: "modules",
      title: t("Pages.AdminAuditLog.cards.modules.title"),
      description: t("Pages.AdminAuditLog.cards.modules.description"),
      value: moduleCount,
      tone: "purple",
    },
  ];

  return (
    <div
      data-testid="audit-log-summary-cards"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
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
