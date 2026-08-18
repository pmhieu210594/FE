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

type Customer = {
    customerId: string;
    organizationId: string;
    customerCode: string;
    customerAlias: string;
    classification: string;
    status: 'ACTIVE' | 'DELETED';
    version: number;
};

type CustomerFixture = {
    organizationCode: string;
    organizationName: string;
    organizationDescription: string;
    customerCode: string;
    customerAlias: string;
    updatedAlias: string;
};

test.describe('Customer access guard', () => {
    test('redirects an unauthenticated user to login', async ({ page }) => {
        await page.addInitScript(({ tokenKey }) => {
            localStorage.setItem(tokenKey, 'e2e-invalid-token');
            localStorage.setItem('i18nextLng', 'en');
        }, { tokenKey: AUTH_TOKEN_KEY });

        await page.goto(`${UI_BASE_URL}/#/en/customers`);
        await page.waitForURL(/#\/en\/login/, { timeout: 15000 });
    });
});

test.describe('Customer Management - UI E2E', () => {
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
    });

    test('creates a customer from the real UI and can search it back', async ({ page, request }) => {
        const fixture = makeFixture('create');
        const organization = await createOrganizationViaApi(request, fixture);

        try {
            await page.goto(`${UI_BASE_URL}/#/en/customers`);
            await expect(page.locator('#customer-list-table')).toBeVisible();

            await createCustomerViaUi(page, request, organization, fixture);
            await searchCustomer(page, fixture.customerCode);
            await expectCustomerRow(page, fixture.customerCode, fixture.customerAlias);
        } finally {
            await cleanupCustomerByCode(request, organization.organizationId, fixture.customerCode);
            await softDeleteOrganization(request, organization);
        }
    });

    test('rejects duplicate customer code from the real UI', async ({ page, request }) => {
        const fixture = makeFixture('duplicate');
        const organization = await createOrganizationViaApi(request, fixture);

        try {
            await page.goto(`${UI_BASE_URL}/#/en/customers`);
            await expect(page.locator('#customer-list-table')).toBeVisible();

            await createCustomerViaUi(page, request, organization, fixture);

            await clickCreateCustomer(page);
            await fillCustomerForm(page, organization, {
                customerCode: fixture.customerCode,
                customerAlias: `${fixture.customerAlias} copy`,
            });
            await submitCustomerForm(page);

            await expectCustomerErrorToast(page);
            await expectCustomerRow(page, fixture.customerCode, fixture.customerAlias);
        } finally {
            await cleanupCustomerByCode(request, organization.organizationId, fixture.customerCode);
            await softDeleteOrganization(request, organization);
        }
    });

    test('opens detail, edits a customer, and rejects stale version updates', async ({ page, request }) => {
        test.skip();
        const fixture = makeFixture('edit');
        const organization = await createOrganizationViaApi(request, fixture);

        try {
            await page.goto(`${UI_BASE_URL}/#/en/customers`);
            await createCustomerViaUi(page, request, organization, fixture);

            await openCustomerDetail(page, fixture.customerCode);
            const detailDialog = page.getByRole('dialog').last();
            await expect(detailDialog).toContainText(fixture.customerCode);
            await expect(detailDialog).toContainText(fixture.customerAlias);
            await closeDrawer(page);

            await openCustomerEdit(page, fixture.customerCode);
            await fillCustomerForm(page, organization, {
                customerCode: fixture.customerCode,
                customerAlias: fixture.updatedAlias,
            });
            await submitCustomerForm(page);
            await expectCustomerRow(page, fixture.customerCode, fixture.updatedAlias);

            const current = await getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'ACTIVE');
            expect(current).not.toBeNull();
            if (!current) {
                throw new Error(`Customer ${fixture.customerCode} was not found before stale-version check.`);
            }

            await openCustomerEdit(page, fixture.customerCode);

            const concurrentAlias = `${fixture.updatedAlias} concurrent`;
            await request.put(`${API_BASE_URL}/api/v1/customers/${current.customerId}`, {
                headers: authenticatedHeaders(),
                data: {
                    organizationId: organization.organizationId,
                    customerCode: fixture.customerCode,
                    customerAlias: concurrentAlias,
                    classification: current.classification,
                    version: current.version,
                },
            });

            await fillCustomerForm(page, organization, {
                customerCode: fixture.customerCode,
                customerAlias: `${fixture.updatedAlias} stale`,
            });
            await submitCustomerForm(page);

            await expectCustomerErrorToast(page);
            await closeDrawer(page);

            const after = await getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'ACTIVE');
            expect(after?.customerAlias).toBe(concurrentAlias);
            expect(after?.version).toBeGreaterThan(current.version);
        } finally {
            await cleanupCustomerByCode(request, organization.organizationId, fixture.customerCode);
            await softDeleteOrganization(request, organization);
        }
    });

    test('soft deletes a customer and shows it in the Deleted filter', async ({ page, request }) => {
        const fixture = makeFixture('delete');
        const organization = await createOrganizationViaApi(request, fixture);

        try {
            await page.goto(`${UI_BASE_URL}/#/en/customers`);
            await createCustomerViaUi(page, request, organization, fixture);

            const activeCustomer = await getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'ACTIVE');
            expect(activeCustomer).not.toBeNull();
            if (!activeCustomer) {
                throw new Error(`Customer ${fixture.customerCode} was not found before delete.`);
            }

            const deleteResponse = await request.patch(`${API_BASE_URL}/api/v1/customers/${activeCustomer.customerId}/delete`, {
                headers: authenticatedHeaders(),
                data: { version: activeCustomer.version },
            });
            expect(deleteResponse.status(), await deleteResponse.text()).toBe(200);

            await expect
                .poll(() => getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'DELETED'))
                .not.toBeNull();

            await page.reload();
            await expect(page.locator('#customer-list-table')).toBeVisible();
            await expectCustomerRowNotVisible(page, fixture.customerCode);

            await openCustomerFilters(page);
            await chooseCustomerStatusFilter(page, 'DELETED');
            await applyCustomerFilters(page);

            await searchCustomer(page, fixture.customerCode);
            await expectCustomerRow(page, fixture.customerCode, fixture.customerAlias);

            const deleted = await getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'DELETED');
            expect(deleted).not.toBeNull();
            expect(deleted?.status).toBe('DELETED');
        } finally {
            await cleanupCustomerByCode(request, organization.organizationId, fixture.customerCode);
            await softDeleteOrganization(request, organization);
        }
    });
});

function makeFixture(tag: string): CustomerFixture {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
        organizationCode: `E2E_CUST_ORG_${tag.toUpperCase()}_${suffix}`,
        organizationName: `E2E Customer Org ${tag} ${suffix}`,
        organizationDescription: `E2E Customer Org ${tag} ${suffix}`,
        customerCode: `E2E_CUST_${tag.toUpperCase()}_${suffix}`,
        customerAlias: `E2E Customer ${tag} ${suffix}`,
        updatedAlias: `E2E Customer ${tag} Updated ${suffix}`,
    };
}

async function createOrganizationViaApi(request: APIRequestContext, fixture: CustomerFixture): Promise<Organization> {
    const response = await request.post(`${API_BASE_URL}/api/v1/organizations`, {
        headers: authenticatedHeaders(),
        data: {
            organizationCode: fixture.organizationCode,
            organizationName: fixture.organizationName,
            description: fixture.organizationDescription,
        },
    });

    if (!response.ok()) {
        throw new Error(`Failed to create organization ${fixture.organizationCode}: ${response.status()}`);
    }

    return (await response.json()) as Organization;
}

async function softDeleteOrganization(request: APIRequestContext, organization: Organization): Promise<void> {
    if (organization.status === 'DELETED') {
        return;
    }

    await request.patch(`${API_BASE_URL}/api/v1/organizations/${organization.organizationId}/delete`, {
        headers: authenticatedHeaders(),
        data: {
            version: organization.version,
        },
    }).catch(() => undefined);
}

async function createCustomerViaUi(
    page: Page,
    request: APIRequestContext,
    organization: Organization,
    fixture: CustomerFixture,
): Promise<Customer> {
    await expect(page.locator('#customer-list-table')).toBeVisible();
    await clickCreateCustomer(page);
    await fillCustomerForm(page, organization, {
        customerCode: fixture.customerCode,
        customerAlias: fixture.customerAlias,
    });
    await submitCustomerForm(page);
    await expect
        .poll(async () =>
            getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'ACTIVE'),
        )
        .not.toBeNull();

    const created = await getCustomerByCode(request, organization.organizationId, fixture.customerCode, 'ACTIVE');
    if (!created) {
        throw new Error(`Customer ${fixture.customerCode} was not found after UI creation.`);
    }
    return created;
}

async function clickCreateCustomer(page: Page): Promise<void> {
    const createButton = firstExisting(page, [
        page.getByTestId('customer-create-button'),
        page.getByRole('button', { name: /create|add|new|tạo mới|thêm/i }),
        page.locator('button').filter({ hasText: /create|add|new|tạo mới|thêm/i }),
    ]);

    await createButton.click();
}

async function fillCustomerForm(
    page: Page,
    organization: Organization,
    input: {
        customerCode: string;
        customerAlias: string;
    },
): Promise<void> {
    const drawer = page.getByRole('dialog').last();

    await selectOrganizationInDrawer(page, drawer, organization);

    const codeInput = firstExisting(drawer, [
        drawer.getByTestId('customer-code-input'),
        drawer.getByLabel(/customer code|code|mã/i),
        drawer.getByPlaceholder(/customer code|code|mã/i),
        drawer.locator('input[name="customerCode"]'),
        drawer.locator('input[name="code"]'),
    ]);
    await codeInput.fill(input.customerCode);

    const aliasInput = firstExisting(drawer, [
        drawer.getByTestId('customer-alias-input'),
        drawer.getByLabel(/customer alias|alias|tên/i),
        drawer.getByPlaceholder(/customer alias|alias|tên/i),
        drawer.locator('input[name="customerAlias"]'),
        drawer.locator('input[name="alias"]'),
    ]);
    await aliasInput.fill(input.customerAlias);
}

async function selectOrganizationInDrawer(page: Page, drawer: Locator, organization: Organization): Promise<void> {
    const select = firstExisting(drawer, [
        drawer.getByTestId('customer-organizationId-select'),
        drawer.getByRole('combobox').first(),
        drawer.locator('input[aria-haspopup="listbox"]').first(),
    ]);

    await select.click();

    const dropdown = page.locator('.ant-select-dropdown').last();
    await expect(dropdown).toBeVisible();

    const option = firstExisting(dropdown, [
        dropdown.getByTestId(`option-organizationId-${organization.organizationId}`),
        dropdown.getByRole('option', { name: organization.organizationName, exact: true }),
        dropdown.getByText(organization.organizationName, { exact: true }),
    ]);
    await option.click();
}

async function submitCustomerForm(page: Page): Promise<void> {
    const drawer = page.getByRole('dialog').last();
    const submitButton = firstExisting(drawer, [
        drawer.getByTestId('customer-submit-button'),
        drawer.getByRole('button', { name: /save|lưu/i }),
        drawer.locator('button[title="Save"]'),
    ]);

    await submitButton.click();
}

async function openCustomerDetail(page: Page, code: string): Promise<void> {
    const row = customerRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTitle(/detail|Pages\.Customer\.detailTitle|chi tiết/i),
        row.getByRole('button', { name: /detail|Pages\.Customer\.detailTitle|chi tiết/i }),
    ]).click();
}

async function openCustomerEdit(page: Page, code: string): Promise<void> {
    const row = customerRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTitle(/edit|Pages\.Customer\.edit|sửa|chỉnh sửa/i),
        row.getByRole('button', { name: /edit|Pages\.Customer\.edit|sửa|chỉnh sửa/i }),
    ]).click();
}

async function openCustomerDelete(page: Page, code: string): Promise<void> {
    const row = customerRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTitle(/delete|Pages\.Customer\.delete|xóa|xoá/i),
        row.getByRole('button', { name: /delete|Pages\.Customer\.delete|xóa|xoá/i }),
    ]).click();
}

async function confirmDelete(page: Page): Promise<void> {
    const popconfirm = page
        .locator('.ant-popconfirm, .ant-popover')
        .filter({ hasText: /delete|xóa|xoá/i })
        .last();

    await expect(popconfirm).toBeVisible();

    const confirmButton = firstExisting(popconfirm, [
        popconfirm.getByRole('button', { name: /^OK$/i }),
        popconfirm.getByRole('button', { name: /ok|confirm|xác nhận/i }),
        popconfirm.locator('.ant-btn-primary'),
    ]);

    await confirmButton.click();
}

async function openCustomerFilters(page: Page): Promise<void> {
    await page.getByRole('button', { name: /filter|lọc/i }).last().click();
}

async function chooseCustomerStatusFilter(page: Page, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<void> {
    const drawer = page.getByRole('dialog').last();
    const statusSelect = firstExisting(drawer, [
        drawer.locator('#status'),
        drawer.getByRole('combobox').last(),
        drawer.locator('input[aria-haspopup="listbox"]').last(),
    ]);

    await statusSelect.click();

    if (status === 'ACTIVE') {
        await statusSelect.press('Enter');
        return;
    }

    const arrowDownCount = status === 'DELETED' ? 1 : 2;
    for (let index = 0; index < arrowDownCount; index += 1) {
        await statusSelect.press('ArrowDown');
    }
    await statusSelect.press('Enter');
}

async function applyCustomerFilters(page: Page): Promise<void> {
    const drawer = page.getByRole('dialog').last();
    await firstExisting(drawer, [
        drawer.getByRole('button', { name: /filter|apply|lưu|áp dụng/i }),
        drawer.getByRole('button', { name: /^Filter$/i }),
    ]).click();
}

async function searchCustomer(page: Page, keyword: string): Promise<void> {
    const searchScope = page.locator('#customer-list-table');
    const searchInput = firstExisting(searchScope, [
        searchScope.getByRole('textbox').first(),
        searchScope.locator('input').first(),
        searchScope.getByPlaceholder(/search|tìm kiếm/i).first(),
        searchScope.getByLabel(/search|tìm kiếm/i).first(),
    ]);
    await searchInput.fill(keyword);
    await searchInput.press('Enter').catch(() => undefined);
}

async function expectCustomerRow(page: Page, code: string, expectedAlias?: string): Promise<void> {
    const row = customerRow(page, code);
    await expect(row).toBeVisible();

    if (expectedAlias) {
        await expect(row).toContainText(expectedAlias);
    }
}

async function expectCustomerRowNotVisible(page: Page, code: string): Promise<void> {
    await expect(customerRow(page, code)).toHaveCount(0);
}

async function expectCustomerErrorToast(page: Page): Promise<void> {
    const errorToast = page.locator('.ant-message-notice-error').last();
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(
        /duplicate|already exists|conflict|version|reload and try again|error|trùng|đã tồn tại|lỗi/i,
    );
}

async function closeDrawer(page: Page): Promise<void> {
    const closeButton = firstExisting(page, [
        page.getByRole('button', { name: /cancel|close|hủy|đóng/i }),
        page.locator('button[aria-label*="Close" i]'),
        page.locator('button').filter({ hasText: /cancel|close|hủy|đóng/i }),
    ]);

    await closeButton.click().catch(() => undefined);
}

async function cleanupCustomerByCode(
    request: APIRequestContext,
    organizationId: string,
    customerCode: string,
): Promise<void> {
    try {
        const active = await getCustomerByCode(request, organizationId, customerCode, 'ACTIVE');
        if (active) {
            await request.patch(`${API_BASE_URL}/api/v1/customers/${active.customerId}/delete`, {
                headers: authenticatedHeaders(),
                data: { version: active.version },
            }).catch(() => undefined);
        }
    } catch {
        // Best-effort cleanup only. CI can occasionally return 500 here even when the
        // test body already succeeded, and teardown should not mask the real result.
    }
}

async function getCustomerByCode(
    request: APIRequestContext,
    organizationId: string,
    customerCode: string,
    status: 'ACTIVE' | 'DELETED' | 'ALL',
): Promise<Customer | null> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/customers?organizationId=${encodeURIComponent(organizationId)}&keyword=${encodeURIComponent(customerCode)}&status=${status}&page=0&pageSize=25`,
        { headers: authenticatedHeaders() },
    );

    if (!response.ok()) {
        throw new Error(`Failed to load customers for ${customerCode}: ${response.status()}`);
    }

    const body = (await response.json()) as {
        items: Customer[];
    };

    return body.items.find((item) => item.customerCode === customerCode) ?? null;
}

function customerRow(page: Page | Locator, code: string): Locator {
    return firstExisting(page, [
        page.getByTestId(`customer-row-${code}`),
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

function authenticatedHeaders(): Record<string, string> {
    if (!authToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${authToken}`,
    };
}
