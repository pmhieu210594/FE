import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./lib/dayjs";
import "./i18n.ts";
import "./index.css";

if (
  globalThis.location.hash.startsWith("#/") &&
  globalThis.location.pathname !== "/"
) {
  window.history.replaceState(null, "", `/${globalThis.location.hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
