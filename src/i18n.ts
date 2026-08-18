import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const customBackend: any = {
  type: "backend",
  init: () => {},
  read: (
    language: string,
    namespace: string,
    callback: (err: any, data: any) => void,
  ) => {
    fetch(`/locales/${language}/${namespace}.json`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `Could not load /locales/${language}/${namespace}.json`,
          );
        return res.json();
      })
      .then((data) => callback(null, data))
      .catch((error) => callback(error, false));
  },
};

const supportedLanguages = new Set(["en", "vi", "ja"]);

const getInitialLanguage = (): string => {
  const hashPath = globalThis.location.hash.substring(1); // Remove '#'
  const urlLng = hashPath.split("/").find(Boolean);

  if (urlLng && supportedLanguages.has(urlLng)) {
    localStorage.setItem("i18nextLng", urlLng);
    return urlLng;
  }

  const storedLng = localStorage.getItem("i18nextLng");
  if (storedLng && supportedLanguages.has(storedLng)) {
    return storedLng;
  }

  localStorage.setItem("i18nextLng", "en");
  return "en";
};

void i18n
  .use(customBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: getInitialLanguage(),
    debug: false,
    ns: ["locale"],
    defaultNS: "locale",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
