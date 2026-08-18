import { message as antdMessage } from "antd";
import queryString from "query-string";

import type { IResponses } from "@/interfaces";
import { message } from "@/router-message";
import { C_API, KEY_REFRESH_TOKEN, KEY_TOKEN, LINK, LINK_API } from "@/utils";
import i18next from "i18next";

/**
 * Shows an error message using the router message instance if available,
 * otherwise falls back to Ant Design static message API.
 */
const showError = (text: string) => {
  if (message) {
    message.error(text);
  } else {
    antdMessage.error(text);
  }
};

const ERROR_DEDUP_WINDOW_MS = 1500;
const recentErrorMap = new Map<string, number>();
const INLINE_FIELD_ERROR_MESSAGES = new Set([
  "Pages.Project.TargetGrossMarginRequired",
  "Pages.Project.TargetGrossMarginRange",
  "Pages.Project.TargetGrossMarginDecimalPlaces",
]);

const showErrorOnce = (dedupeKey: string, text: string) => {
  const now = Date.now();
  const lastShownAt = recentErrorMap.get(dedupeKey) ?? 0;
  if (now - lastShownAt < ERROR_DEDUP_WINDOW_MS) return;
  recentErrorMap.set(dedupeKey, now);
  showError(text);
};

const translateApiMessage = (messageKey: string): string => {
  if (!messageKey) return messageKey;

  const candidates = new Set<string>([messageKey]);

  if (!messageKey.startsWith("Errors.")) candidates.add(`Errors.${messageKey}`);
  if (!messageKey.startsWith("Pages.")) candidates.add(`Pages.${messageKey}`);

  if (messageKey.startsWith("Approval.")) {
    candidates.add(`Errors.${messageKey}`);
    candidates.add(`Pages.${messageKey}`);
  }

  for (const key of candidates) {
    const translated = i18next.t(key, { ns: "locale" });
    if (translated !== key) return translated;
  }

  return messageKey;
};

/**
 * API object for making HTTP requests.
 *
 * @remarks
 * This object provides methods for making GET, POST, PATCH, PUT, and DELETE requests.
 * It also includes a method for initializing the request configuration.
 *
 * @example
 * ```typescript
 * const response = await API.get<User>({ url: '/users' });
 * console.log(response.data); // User data
 * ```
 */
export const API = {
  init: () =>
    ({
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: localStorage.getItem(KEY_TOKEN)
          ? "Bearer " + localStorage.getItem(KEY_TOKEN)
          : "",
        "Accept-Language": localStorage.getItem("i18nextLng") ?? "",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    }) as RequestInit,
  responsible: async <T>({
    url,
    params = {},
    config,
    headers = {},
    throwError = false,
    showMessage = false,
  }: {
    url: string;
    params?: any;
    config: RequestInit;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) => {
    config.headers = { ...config.headers, ...headers };
    const linkParam = queryString.stringify(params, { arrayFormat: "index" });
    const response = await fetch(
      (url.includes("https://") || url.includes("http://") ? "" : LINK_API) +
        url +
        (linkParam && "?" + linkParam),
      config,
    );

    if (response.status === 401 && url !== C_API.Login) {
      localStorage.removeItem(KEY_TOKEN);
      location.href =
        location.hash.split("/").slice(0, 2).join("/") + LINK.Login;
    }
    const res: IResponses<T> = await response.json();
    if (response.ok) {
      if (showMessage && res.message) {
        message?.success(translateApiMessage(res.message));
      }
      return res;
    } else if (res.message && !throwError) {
      if (INLINE_FIELD_ERROR_MESSAGES.has(res.message)) {
        throw new Error("Error");
      }
      showErrorOnce(`api:${res.message}`, translateApiMessage(res.message));
    } else {
      showError(
        i18next.t("Components.SomethingWentWrong", {
          ns: "locale",
          defaultValue: "Something went wrong, please try again!",
        }),
      );
    }
    throw new Error("Error");
  },
  get: <T>({
    url,
    params = {},
    headers,
    throwError = false,
    showMessage = false,
  }: {
    url: string;
    params?: any;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) =>
    API.responsible<T>({
      url,
      params,
      config: { ...API.init(), method: "GET" },
      headers,
      throwError,
      showMessage,
    }),
  post: <T>({
    url,
    values = {},
    params = {},
    headers,
    throwError = false,
    showMessage = true,
  }: {
    url: string;
    values: any;
    params?: any;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) =>
    API.responsible<T>({
      url,
      params,
      config: {
        ...API.init(),
        method: "POST",
        body: values instanceof FormData ? values : JSON.stringify(values),
      },
      headers,
      throwError,
      showMessage,
    }),
  patch: <T>({
    url,
    values = {},
    params = {},
    headers,
    throwError = false,
    showMessage = true,
  }: {
    url: string;
    values: any;
    params?: any;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) =>
    API.responsible<T>({
      url,
      params,
      config: { ...API.init(), method: "PATCH", body: JSON.stringify(values) },
      headers,
      throwError,
      showMessage,
    }),
  put: <T>({
    url,
    values = {},
    params = {},
    headers,
    throwError = false,
    showMessage = true,
  }: {
    url: string;
    values: any;
    params?: any;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) =>
    API.responsible<T>({
      url,
      params,
      config: {
        ...API.init(),
        method: "PUT",
        body: values instanceof FormData ? values : JSON.stringify(values),
      },
      headers,
      throwError,
      showMessage,
    }),
  delete: <T>({
    url,
    params = {},
    headers,
    throwError = false,
    showMessage = true,
  }: {
    url: string;
    params?: any;
    headers?: RequestInit["headers"];
    throwError?: boolean;
    showMessage?: boolean;
  }) =>
    API.responsible<T>({
      url,
      params,
      config: { ...API.init(), method: "DELETE" },
      headers,
      throwError,
      showMessage,
    }),
  refresh: async () => {
    const res = await API.get<{ token: string; refreshToken: null }>({
      url: `/auth/refresh-token`,
      headers: {
        authorization: "Bearer " + localStorage.getItem(KEY_REFRESH_TOKEN),
      },
    });
    if (res) {
      localStorage.setItem(KEY_TOKEN, res.data!.token);
      return "Bearer " + res.data!.token;
    }
  },
};

export const ApiRequest = async ({
  url,
  params = {},
  values = null,
  method = "GET",
  responseType = "json",
}: {
  url: string;
  params?: any;
  values?: FormData | null;
  method?: string;
  responseType?: string;
}) => {
  const linkParam = queryString.stringify(params, { arrayFormat: "index" });
  const fullUrl =
    (url.includes("https://") || url.includes("http://") ? "" : LINK_API) +
    url +
    (linkParam && "?" + linkParam);

  const config: RequestInit = {
    method,
    headers: {
      Authorization: "Bearer " + localStorage.getItem(KEY_TOKEN),
      "Accept-Language": localStorage.getItem("i18nextLng") ?? "",
      ...(method === "GET" ? { "Content-Type": "application/json" } : {}),
    },
    ...(values ? { body: values } : {}),
  };

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    const result = await response.json();
    const translatedMessage = translateApiMessage(result.message);
    if (message) {
      message.error(translatedMessage);
    } else {
      antdMessage.error(translatedMessage);
    }
    return { success: false, error: response.statusText };
  }

  const contentDisposition = response.headers.get("Content-Disposition");

  if (responseType === "blob") {
    const blob = await response.blob();
    return { blob, contentDisposition };
  } else {
    return await response.json();
  }
};
