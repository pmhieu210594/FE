/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_URL_API?: string;
  readonly VITE_URL_EDCAP?: string;
  readonly VITE_URL_LANGUAGES?: string;
  readonly VITE_URL_LANGUAGE?: string;
  readonly VITE_APP_FORMAT_DATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
