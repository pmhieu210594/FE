import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Forward API and auth endpoints to backend, so the browser sees
      // everything as same-origin (avoids CORS complications in dev).
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8080",
        changeOrigin: true,
      },
      "/login": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8080",
        changeOrigin: true,
      },
      "/logout": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    // formatDateTime() renders timestamps in the host machine's local
    // timezone, so tests must pin a fixed zone to be deterministic across
    // dev machines and CI runners.
    env: { TZ: "Asia/Ho_Chi_Minh" },
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e_tests/**", "dist/**", "node_modules/**"],
  },
});
