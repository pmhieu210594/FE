import { EStatusState } from "@/enums";
import type { IMHashData } from "@/interfaces/model";
import { KEY_USER, LANGUAGE, LIST_LANGUAGE } from "@/utils";
import { C_Dayjs } from "@/utils/dayjs";
import enUS from "antd/lib/locale/en_US";
import jaJP from "antd/lib/locale/ja_JP";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import { enLocale, jaLocale, viLocale } from "./locale";
import type { GlobalState } from "./reducer";

/**
 * Represents the global name for authentication.
 */
export const nameGlobal = "Auth";
/**
 * Represents the global state of the application.
 */
export interface StateGlobal extends GlobalState {
  data?: IMHashData;
  user?: IMHashData;
  language?: string;
  locale?: typeof viVN | typeof enUS | typeof jaJP;
  localeDate?: typeof enLocale | typeof viLocale | typeof jaLocale;
  isCollapseMenu?: boolean;
  hardData?: IMHashData;
  [key: string]: any;
}

/**
 * Checks the language and sets the locale and localeDate accordingly.
 * @param language - The language to be checked.
 * @returns An object containing the language, locale, and localeDate.
 */
export const checkLanguage = (language: string) => {
  const normalizedLanguage = ["en", "vi", "ja"].includes(language)
    ? language
    : "en";
  let locale;
  let localeDate;
  switch (normalizedLanguage) {
    case "en":
      locale = enUS;
      localeDate = enLocale;
      dayjs.locale(C_Dayjs.EN);
      break;
    case "vi":
      locale = viVN;
      localeDate = viLocale;
      dayjs.locale(C_Dayjs.VI);
      break;
    case "ja":
      locale = jaJP;
      localeDate = jaLocale;
      dayjs.locale(C_Dayjs.JA);
      break;
  }
  localStorage.setItem("i18nextLng", normalizedLanguage);
  document.querySelector("html")?.setAttribute("lang", normalizedLanguage);
  return { language: normalizedLanguage, locale, localeDate };
};

/**
 * Determines the language based on the current location hash.
 * If the language is found in the list of supported languages, it is returned.
 * Otherwise, the default language is returned.
 *
 * @returns The determined language.
 */
const normalizedLanguages = LIST_LANGUAGE.map((language: string) =>
  language.trim(),
).filter(Boolean);
const hashLanguage = location.hash.split("/")[1] ?? "";
const defaultLanguage = normalizedLanguages.includes(LANGUAGE)
  ? LANGUAGE
  : normalizedLanguages[0] || "en";

export const lang = normalizedLanguages.includes(hashLanguage)
  ? hashLanguage
  : defaultLanguage;

const readStoredUser = (): IMHashData => {
  const raw = localStorage.getItem(KEY_USER);
  if (!raw || raw === "undefined" || raw === "null") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * Represents the initial state for the global module.
 */
export const initialStateGlobal: StateGlobal = {
  data: readStoredUser(),
  user: readStoredUser(),
  isLoading: false,
  status: EStatusState.idle,
  ...checkLanguage(lang),
};
