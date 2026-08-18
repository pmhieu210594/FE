import type { Metric } from "web-vitals";

/**
 * Reports web vitals.
 *
 * @param {(metric: Metric) => void} onPerfEntry - The callback function to handle performance entries.
 * @returns {void}
 */
export const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (typeof onPerfEntry === "function") {
    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};
