import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e_tests/tests',
    testMatch: ['**/*.spec.ts'],
    testIgnore: ['**/src/**', '**/dist/**', '**/node_modules/**'],
    fullyParallel: false,
    workers: 1,
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 5173',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
    use: {
        baseURL: 'http://127.0.0.1:5173',
    },
});
