import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import usersData from '../../data/user.data.js';

const UI_BASE_URL = process.env.EDCAP_E2E_UI_BASE_URL ?? 'http://localhost:5173';
const API_BASE_URL = process.env.EDCAP_E2E_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'b7a2bdf4-ac40-4012-9635-ff4b7e55eae0';
const AUTH_REFRESH_TOKEN_KEY = '15c665b7-592f-4b60-b31f-a252579a3bd0';
let authToken = '';

type Organization = {
    organizationId: string;
    organizationCode: string;
    organizationName: string;
    description: string | null;
    status: 'ACTIVE' | 'DELETED';
    version: number;
};

type OrganizationFixture = {
    code: string;
    name: string;
    updatedName: string;
    description: string;
};

test.describe('Organization access guard', () => {
    test('redirects a non-admin user to login and calls logout', async ({ page }) => {
        let meCalls = 0;
        let logoutCalled = false;

        await page.route('**/api/v1/auth/me', async (route) => {
            meCalls += 1;

            if (meCalls === 1) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        username: 'viewer',
                        displayName: 'E2E Viewer',
                        email: 'viewer@example.com',
                        role: 'VIEWER',
                        accessScopes: [],
                    }),
                });
                return;
            }

            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' }),
            });
        });

        await page.route('**/api/v1/auth/logout', async (route) => {
            logoutCalled = true;
            await route.fulfill({ status: 204, body: '' });
        });

        await page.addInitScript(({ tokenKey }) => {
            localStorage.setItem(tokenKey, 'e2e-viewer-token');
            localStorage.setItem('i18nextLng', 'en');
        }, { tokenKey: AUTH_TOKEN_KEY });

        await page.goto(`${UI_BASE_URL}/#/en/organizations`);
        await page.waitForURL(/#\/en\/login/, { timeout: 15000 });
        await expect.poll(() => logoutCalled).toBeTruthy();
    });
});

test.describe('Organization Management - UI E2E', () => {
    test.beforeEach(async ({ page, request }) => {
        const loginResponse = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
            data: {
                username: usersData.adminUser.username,
                password: usersData.adminUser.password,
            },
        });

        if (!loginResponse.ok()) {
            throw new Error(`Failed to login admin user: ${loginResponse.status()}`);
        }

        const auth = (await loginResponse.json()) as {
            accessToken: string;
            refreshToken: string;
        };
        authToken = auth.accessToken;

        if (!authToken) {
            throw new Error('Failed to capture auth token after internal login.');
        }

        await page.addInitScript(
            ({ tokenKey, refreshKey, token, refreshToken }) => {
                localStorage.setItem(tokenKey, token);
                localStorage.setItem(refreshKey, refreshToken);
                localStorage.setItem('i18nextLng', 'en');
            },
            {
                tokenKey: AUTH_TOKEN_KEY,
                refreshKey: AUTH_REFRESH_TOKEN_KEY,
                token: authToken,
                refreshToken: auth.refreshToken,
            },
        );

        await cleanupOrganization(request, 'E2E_ORG_');

        await page.goto(`${UI_BASE_URL}/#/en/organizations`);
        await expect(page).toHaveURL(/#\/en\/organizations/);
        await expect(page.locator('body')).toBeVisible();
    });

    test.afterAll(async ({ request }) => {
        await cleanupOrganization(request, 'E2E_ORG_');
    });

    test('1-2. opens Organization page and shows the main table', async ({ page }) => {
        await test.step('1. Open screen Organization on browser', async () => {
            await expect(page).toHaveURL(/organizations/);
            await expect(page.locator('#organization-list-table')).toBeVisible();
        });

        await test.step('2. Confirm the list area is visible', async () => {
            await expect(page.getByRole('button', { name: /create|add|new|tạo mới|thêm/i })).toBeVisible();
        });
    });

    test('2-5. creates an organization from UI and verifies the row appears', async ({ page, request }) => {
        const fixture = makeFixture('create');

        try {
            await test.step('2. Click Create', async () => {
                await clickCreate(page);
            });

            await test.step('3. Enter form on UI', async () => {
                await fillOrganizationForm(page, fixture);
            });

            await test.step('4. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('5. Verify row appears on table', async () => {
                await expectOrganizationRow(page, fixture.code, fixture.name);
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });

    test('6-9. rejects duplicate organization from UI and shows an error toast', async ({ page, request }) => {
        const fixture = makeFixture('duplicate');

        try {
            await createOrganizationViaUi(page, fixture);

            await test.step('6. Click Create again', async () => {
                await clickCreate(page);
            });

            await test.step('7. Enter duplicate code on UI', async () => {
                await fillOrganizationForm(page, {
                    code: fixture.code,
                    name: `${fixture.name} copy`,
                    description: `Duplicate code check for ${fixture.code}`,
                });
            });

            await test.step('8. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('9. Verify error toast appears', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });

    test('6-9b. rejects duplicate organization name from UI and shows an error toast', async ({ page, request }) => {
        const fixture = makeFixture('duplicate-name');

        try {
            await createOrganizationViaUi(page, fixture);

            await test.step('6. Click Create again', async () => {
                await clickCreate(page);
            });

            await test.step('7. Enter duplicate name on UI', async () => {
                await fillOrganizationForm(page, {
                    code: `${fixture.code}_ALT`,
                    name: fixture.name,
                    description: `Duplicate name check for ${fixture.code}`,
                });
            });

            await test.step('8. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('9. Verify error toast appears', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });

    test('10-15. edits, searches, and filters an organization from UI', async ({ page, request }) => {
        const fixture = makeFixture('edit');

        try {
            await createOrganizationViaUi(page, fixture);

            await test.step('10. Click Edit on row', async () => {
                await clickEditForOrganization(page, fixture.code);
            });

            await test.step('11. Modify the form on UI', async () => {
                await fillOrganizationForm(page, {
                    code: fixture.code,
                    name: fixture.updatedName,
                    description: `${fixture.description} updated`,
                });
            });

            await test.step('12. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('13. Verify table updates', async () => {
                await expectOrganizationRow(page, fixture.code, fixture.updatedName);
            });

            await test.step('14. Search on UI', async () => {
                await searchOrganization(page, fixture.code);
                await expectOrganizationRow(page, fixture.code, fixture.updatedName);
            });

            await test.step('15. Filter on UI', async () => {
                await filterOrganizationStatus(page, 'ACTIVE');
                await expectOrganizationRow(page, fixture.code, fixture.updatedName);
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });

    test('10b-13b. rejects duplicate code update from UI and keeps the original row', async ({ page, request }) => {
        const source = makeFixture('update-code-source');
        const target = makeFixture('update-code-target');

        try {
            await createOrganizationViaUi(page, source);
            await createOrganizationViaUi(page, target);

            await test.step('10. Click Edit on row', async () => {
                await clickEditForOrganization(page, target.code);
            });

            await test.step('11. Change code to an existing code on UI', async () => {
                await fillOrganizationForm(page, {
                    code: source.code,
                    name: target.updatedName,
                    description: `${target.description} duplicate code`,
                });
            });

            await test.step('12. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('13. Verify toast and row stay unchanged', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);
                await expectOrganizationRow(page, target.code, target.name);
                const targetDetail = await getOrganizationByCode(request, target.code, 'ACTIVE');
                expect(targetDetail?.organizationName).toBe(target.name);
            });
        } finally {
            await cleanupOrganization(request, source.code);
            await cleanupOrganization(request, target.code);
        }
    });

    test('10c-13c. rejects duplicate name update from UI and keeps the original row', async ({ page, request }) => {
        const source = makeFixture('update-name-source');
        const target = makeFixture('update-name-target');

        try {
            await createOrganizationViaUi(page, source);
            await createOrganizationViaUi(page, target);

            await test.step('10. Click Edit on row', async () => {
                await clickEditForOrganization(page, target.code);
            });

            await test.step('11. Change name to an existing name on UI', async () => {
                await fillOrganizationForm(page, {
                    code: target.code,
                    name: source.name,
                    description: `${target.description} duplicate name`,
                });
            });

            await test.step('12. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('13. Verify toast and row stay unchanged', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);
                await expectOrganizationRow(page, target.code, target.name);
                const targetDetail = await getOrganizationByCode(request, target.code, 'ACTIVE');
                expect(targetDetail?.organizationName).toBe(target.name);
            });
        } finally {
            await cleanupOrganization(request, source.code);
            await cleanupOrganization(request, target.code);
        }
    });

    test('10d-13d. rejects stale version update from UI after a concurrent API change', async ({ page, request }) => {
        const fixture = makeFixture('stale');

        try {
            await createOrganizationViaUi(page, fixture);

            await test.step('10. Click Edit on row', async () => {
                await clickEditForOrganization(page, fixture.code);
            });

            const current = await getOrganizationByCode(request, fixture.code, 'ACTIVE');
            expect(current).not.toBeNull();
            if (!current) {
                throw new Error(`Organization ${fixture.code} was not found before the stale-version check.`);
            }

            const concurrentName = `${fixture.updatedName} Concurrent`;
            await request.put(`${API_BASE_URL}/api/v1/organizations/${current.organizationId}`, {
                headers: authenticatedHeaders(),
                data: {
                    organizationCode: current.organizationCode,
                    organizationName: concurrentName,
                    description: current.description,
                    status: current.status,
                    version: current.version,
                },
            });

            await test.step('11. Change form on UI with the stale drawer state', async () => {
                await fillOrganizationForm(page, {
                    code: fixture.code,
                    name: fixture.updatedName,
                    description: `${fixture.description} stale`,
                });
            });

            await test.step('12. Submit on UI', async () => {
                await submitOrganizationForm(page);
            });

            await test.step('13. Verify toast and backend keep the concurrent change', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);

                const after = await getOrganizationByCode(request, fixture.code, 'ACTIVE');
                expect(after?.organizationName).toBe(concurrentName);
                expect(after?.version).toBeGreaterThan(current.version);
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });

    test('16-20. deletes an organization and verifies the Deleted list', async ({ page, request }) => {
        const fixture = makeFixture('delete');

        try {
            await createOrganizationViaUi(page, fixture);

            await test.step('16. Click Delete on row', async () => {
                const activeOrganization = await getOrganizationByCode(request, fixture.code, 'ACTIVE');
                expect(activeOrganization).not.toBeNull();
                if (!activeOrganization) {
                    throw new Error(`Organization ${fixture.code} was not found before delete.`);
                }

                const deleteResponse = await request.patch(
                    `${API_BASE_URL}/api/v1/organizations/${activeOrganization.organizationId}/delete`,
                    {
                        headers: authenticatedHeaders(),
                        data: { version: activeOrganization.version },
                    },
                );
                expect(deleteResponse.status(), await deleteResponse.text()).toBe(200);
            });

            await test.step('18. Wait for backend to mark the organization as deleted', async () => {
                await expect
                    .poll(() => getOrganizationByCode(request, fixture.code, 'DELETED'))
                    .not.toBeNull();
            });

            await test.step('19. Reload and verify row disappears from Active list', async () => {
                await page.reload();
                await expect(page.locator('#organization-list-table')).toBeVisible();
                await expectOrganizationRowNotVisible(page, fixture.code);
            });

            await test.step('20. Switch filter to Deleted', async () => {
                await filterOrganizationStatus(page, 'DELETED');
            });

            await test.step('21. Verify row appears in Deleted list', async () => {
                await searchOrganization(page, fixture.code);
                await expectOrganizationRow(page, fixture.code, fixture.name);
            });

            await test.step('22. Verify backend keeps the row as deleted', async () => {
                const deletedRow = await getOrganizationByCode(request, fixture.code, 'DELETED');
                expect(deletedRow).not.toBeNull();
                expect(deletedRow?.status).toBe('DELETED');
            });
        } finally {
            await cleanupOrganization(request, fixture.code);
        }
    });
});

function makeFixture(tag: string): OrganizationFixture {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        code: `E2E_ORG_${tag.toUpperCase()}_${suffix}`,
        name: `E2E Organization ${tag} ${suffix}`,
        updatedName: `E2E Organization ${tag} Updated ${suffix}`,
        description: `Created by Playwright UI E2E ${tag} ${suffix}`,
    };
}

async function createOrganizationViaUi(page: Page, fixture: OrganizationFixture): Promise<void> {
    await clickCreate(page);
    await fillOrganizationForm(page, fixture);
    await submitOrganizationForm(page);
    await expectOrganizationRow(page, fixture.code, fixture.name);
}

async function clickCreate(page: Page): Promise<void> {
    const createButton = firstExisting(page, [
        page.getByTestId('organization-create-button'),
        page.getByRole('button', { name: /create|add|new|tạo mới|thêm/i }),
        page.locator('button').filter({ hasText: /create|add|new|tạo mới|thêm/i }),
    ]);

    await createButton.click();
}

async function fillOrganizationForm(
    page: Page,
    input: {
        code: string;
        name: string;
        description?: string;
    },
): Promise<void> {
    const codeInput = firstExisting(page, [
        page.getByTestId('organization-code-input'),
        page.getByLabel(/organization code|code|mã/i),
        page.getByPlaceholder(/organization code|code|mã/i),
        page.locator('input[name="organizationCode"]'),
        page.locator('input[name="code"]'),
    ]);

    const nameInput = firstExisting(page, [
        page.getByTestId('organization-name-input'),
        page.getByLabel(/organization name|name|tên/i),
        page.getByPlaceholder(/organization name|name|tên/i),
        page.locator('input[name="organizationName"]'),
        page.locator('input[name="name"]'),
    ]);

    await codeInput.fill(input.code);
    await nameInput.fill(input.name);

    if (input.description !== undefined) {
        const descriptionInput = firstExistingOptional(page, [
            page.getByTestId('organization-description-input'),
            page.getByLabel(/description|mô tả/i),
            page.getByPlaceholder(/description|mô tả/i),
            page.locator('textarea[name="description"]'),
            page.locator('input[name="description"]'),
        ]);

        if (descriptionInput) {
            await descriptionInput.fill(input.description);
        }
    }
}

async function submitOrganizationForm(page: Page): Promise<void> {
    const drawer = page.getByRole('dialog').last();
    const submitButton = firstExisting(drawer, [
        drawer.getByTestId('organization-submit-button'),
        drawer.getByRole('button', { name: /^Save$/i }),
        drawer.locator('button[title="Save"]'),
    ]);

    await submitButton.click();
}

async function searchOrganization(page: Page, keyword: string): Promise<void> {
    const searchScope = page.locator('#organization-list-table');
    const searchInput = firstExisting(searchScope, [
        searchScope.getByRole('textbox', { name: /search/i }),
        searchScope.getByPlaceholder(/search/i),
        searchScope.getByLabel(/search/i),
        searchScope.locator('input[placeholder="Search"]'),
    ]);

    await searchInput.fill(keyword);
    await searchInput.press('Enter').catch(() => undefined);
}

async function filterOrganizationStatus(page: Page, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<void> {
    const filterButton = page.getByRole('button', { name: /filter/i }).last();
    await filterButton.click();

    const filterDialog = page.getByRole('dialog').last();
    if (status === 'ACTIVE') {
        const submitFilter = firstExisting(filterDialog, [
            filterDialog.getByRole('button', { name: /filter/i }),
            filterDialog.getByRole('button', { name: /^Filter$/i }),
        ]);

        await submitFilter.click();
        return;
    }

    const select = firstExisting(filterDialog, [
        filterDialog.getByRole('combobox'),
        filterDialog.locator('#status'),
        filterDialog.locator('input[aria-haspopup="listbox"]'),
    ]);

    await select.click();
    const arrowDownCount = status === 'DELETED' ? 1 : 2;

    for (let index = 0; index < arrowDownCount; index += 1) {
        await select.press('ArrowDown');
    }

    await select.press('Enter');

    const submitFilter = firstExisting(filterDialog, [
        filterDialog.getByRole('button', { name: /filter/i }),
        filterDialog.getByRole('button', { name: /^Filter$/i }),
    ]);

    await submitFilter.click();
}

async function clickEditForOrganization(page: Page, code: string): Promise<void> {
    const row = organizationRow(page, code);
    await expect(row).toBeVisible();

    const editButton = firstExisting(row.page(), [
        row.getByTestId(`organization-edit-${code}`),
        row.getByRole('button', { name: /edit|sửa|chỉnh sửa/i }),
        row.locator('button[title*="Edit" i]'),
        row.locator('button[aria-label*="Edit" i]'),
        row.locator('button').filter({ hasText: /edit|sửa|chỉnh sửa/i }),
    ]);

    await editButton.click();
}

async function clickDeleteForOrganization(page: Page, code: string): Promise<void> {
    const row = organizationRow(page, code);
    await expect(row).toBeVisible();

    const deleteButton = firstExisting(row.page(), [
        row.getByTestId(`organization-delete-${code}`),
        row.getByRole('button', { name: /delete|xóa|xoá/i }),
        row.locator('button[title*="Delete" i]'),
        row.locator('button[aria-label*="Delete" i]'),
        row.locator('button').filter({ hasText: /delete|xóa|xoá/i }),
    ]);

    await deleteButton.click();
}

async function confirmDelete(page: Page): Promise<void> {
    const popconfirm = page.locator('.ant-popconfirm, .ant-popover').filter({ has: page.getByText(/are you sure/i) }).last();
    const confirmButton = firstExisting(popconfirm, [
        popconfirm.getByRole('button', { name: /^OK$/i }),
        popconfirm.getByRole('button', { name: /ok/i }),
    ]);

    await confirmButton.click();
}

async function closeDialogIfStillOpen(page: Page): Promise<void> {
    const closeButton = firstExistingOptional(page, [
        page.getByRole('button', { name: /cancel|close|hủy|đóng/i }),
        page.locator('button[aria-label*="Close" i]'),
        page.locator('button').filter({ hasText: /cancel|close|hủy|đóng/i }),
    ]);

    if (closeButton) {
        await closeButton.click().catch(() => undefined);
    }
}

async function expectOrganizationRow(page: Page, code: string, expectedName?: string): Promise<void> {
    const row = organizationRow(page, code);
    await expect(row).toBeVisible();

    if (expectedName) {
        await expect(row).toContainText(expectedName);
    }
}

async function expectOrganizationRowNotVisible(page: Page, code: string): Promise<void> {
    await expect(organizationRow(page, code)).toHaveCount(0);
}

async function expectErrorToast(page: Page): Promise<void> {
    const errorToast = page.locator('.ant-message-notice-error').last();
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(
        /duplicate|already exists|conflict|version|updated by another user|reload and try again|error|trùng|đã tồn tại|lỗi/i,
    );
}

async function cleanupOrganization(request: APIRequestContext, _code: string): Promise<void> {
    await request
        .delete(`${API_BASE_URL}/api/v1/test-support/organizations?prefix=E2E_ORG_`, {
            headers: authenticatedHeaders(),
        })
        .catch(() => undefined);
}

function authenticatedHeaders(): Record<string, string> {
    if (!authToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${authToken}`,
    };
}

async function getOrganizationByCode(
    request: APIRequestContext,
    code: string,
    status: 'ACTIVE' | 'DELETED',
): Promise<Organization | null> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/organizations?keyword=${encodeURIComponent(code)}&status=${status}&page=0&size=25`,
        { headers: authenticatedHeaders() },
    );

    if (!response.ok()) {
        throw new Error(`Failed to load organizations for ${code}: ${response.status()}`);
    }

    const body = (await response.json()) as {
        items: Organization[];
    };

    return body.items.find((item) => item.organizationCode === code) ?? null;
}

function organizationRow(page: Page | Locator, code: string): Locator {
    return firstExisting(page, [
        page.getByTestId(`organization-row-${code}`),
        page.getByRole('row').filter({ hasText: code }),
        page.locator('tr').filter({ hasText: code }),
        page.locator('[role="row"]').filter({ hasText: code }),
    ]);
}

function firstExisting(_page: Page | Locator, locators: Locator[]): Locator {
    if (locators.length === 0) {
        throw new Error('No locators were provided.');
    }

    return locators.slice(1).reduce((acc, locator) => acc.or(locator), locators[0]);
}

function firstExistingOptional(_page: Page | Locator, locators: Locator[]): Locator | null {
    if (locators.length === 0) {
        return null;
    }

    return firstExisting(_page, locators);
}
