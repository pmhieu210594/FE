/**
 * The key used for user authentication.
 */
export const KEY_USER = "m8nvn*&hKwcgb^D-D#Hz^5CXfKySpY";
/**
 * The key token used for authentication.
 */
export const KEY_TOKEN = "b7a2bdf4-ac40-4012-9635-ff4b7e55eae0";
/**
 * The refresh token key used for authentication.
 */
export const KEY_REFRESH_TOKEN = "15c665b7-592f-4b60-b31f-a252579a3bd0";
/**
 * The temporary key used for something.
 */
export const KEY_TEMP = "fbb36f54-abcb-4674-9635-b4b57ccf2e49";
/**
 * The name of the application.
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME;
/**
 * The URL of the API endpoint.
 */
export const LINK_API = (
  import.meta.env.VITE_URL_API || "http://localhost:7016"
).replace(/\/$/, "");
/**
 * The URL of the EDCAP frontend.
 */
const edcapUrl = import.meta.env.VITE_URL_EDCAP;
export const LINK_EDCAP = (
  edcapUrl && edcapUrl !== "undefined" ? edcapUrl : "http://172.25.192.1:4001"
).replace(/\/+$/, "");
/**
 * Represents a list of supported languages.
 *
 * @remarks
 * This list is obtained from the `VITE_URL_LANGUAGES` environment variable.
 */
const DEFAULT_LANGUAGES = ["en", "vi", "ja"];
const configuredLanguages = (
  import.meta.env.VITE_URL_LANGUAGES || DEFAULT_LANGUAGES.join(",")
)
  .split(",")
  .map((language: string) => language.trim())
  .filter(Boolean);

export const LIST_LANGUAGE =
  configuredLanguages.length > 0 ? configuredLanguages : DEFAULT_LANGUAGES;
/**
 * The language used in the application.
 */
const configuredLanguage = (import.meta.env.VITE_URL_LANGUAGE || "").trim();
export const LANGUAGE = LIST_LANGUAGE.includes(configuredLanguage)
  ? configuredLanguage
  : LIST_LANGUAGE[0] || "en";
/**
 * The format of the date used in the application.
 */
export const FORMAT_DATE = import.meta.env.VITE_APP_FORMAT_DATE;
/**
 * Represents the constant value for full text search.
 */
export const FULL_TEXT_SEARCH = "search";
/**
 * The type format of the date used in the application.
 */
export const TYPE_FORMAT_DATE = "mask";
export const LINK = {
  Login: "/login",
} as const;

type ApiEndpoints = {
  Login: string;
};

export const C_API: ApiEndpoints = {
  Login: "/api/v1/login",
};

/**
 * Generates a RFC4122 v4 UUID.
 */
export const uuidv4 = () => {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
