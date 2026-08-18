import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem("i18nextLng", lng);

      // Update URL with language in path segment
      const currentPath = globalThis.location.hash.substring(1); // Remove '#'
      const pathSegments = currentPath.split("/").filter(Boolean);
      pathSegments[0] = lng; // Replace first segment with new language
      navigate("/" + pathSegments.join("/"));
    },
    [i18n, navigate],
  );

  return {
    currentLanguage: lang || i18n.language,
    changeLanguage,
  };
};
