import type { AcStatus, AcTicketStatus } from "./types";

/** Tailwind classes for the AC status pill, matched to the EDCAP mock colors. */
export const acStatusClasses: Record<AcStatus, string> = {
  NOT_TESTED: "bg-rose-100 text-rose-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PASSED: "bg-emerald-100 text-emerald-700",
};

export const acStatusLabel: Record<AcStatus, string> = {
  NOT_TESTED: "Not Tested",
  PARTIAL: "Partial",
  PASSED: "Passed",
};

/** Status pill classes for the Ticket Detail AC table. */
export const acTicketStatusClasses: Record<AcTicketStatus, string> = {
  PASSED: "bg-emerald-100 text-emerald-700",
  RUNNING: "bg-blue-100 text-blue-700",
  FAILED: "bg-rose-100 text-rose-700",
  NOT_TESTED: "bg-rose-100 text-rose-700",
  SKIPPED: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNKNOWN: "bg-slate-100 text-slate-700",
};

export const acTicketStatusLabel: Record<AcTicketStatus, string> = {
  PASSED: "Passed",
  RUNNING: "Running",
  FAILED: "Failed",
  NOT_TESTED: "Not Tested",
  SKIPPED: "Skipped",
  PARTIAL: "Partial",
  UNKNOWN: "Unknown",
};
