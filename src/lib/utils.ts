import { dayjs } from "@/lib/dayjs";
import { C_Dayjs } from "@/utils/dayjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn convention - merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";

  const language = localStorage.getItem("i18nextLng") ?? "en";
  const locale =
    language === "ja"
      ? C_Dayjs.JA
      : language === "vi"
        ? C_Dayjs.VI
        : C_Dayjs.EN;

  dayjs.locale(locale);

  // Handle format like "2026-07-06 16:52:44.189 +0700" (with timezone offset)
  // Parse with specific format to preserve timezone information
  let value = dayjs(
    iso,
    [
      "YYYY-MM-DD HH:mm:ss.SSS Z",
      "YYYY-MM-DDTHH:mm:ss.SSSZ",
      "YYYY-MM-DD HH:mm:ss Z",
    ],
    true,
  );

  // Fallback to standard parsing if custom format fails
  if (!value.isValid()) {
    const parsed = new Date(iso);
    value = Number.isNaN(parsed.getTime()) ? dayjs(iso) : dayjs(parsed);
  }

  if (!value.isValid()) return iso;
  // Format output in the same timezone as input (keep server time, don't convert to browser timezone)
  return value.format(locale.formats.LLL ?? "YYYY-MM-DD HH:mm:ss");
}
