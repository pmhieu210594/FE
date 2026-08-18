import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import usersData from '../../data/user.data.js';

const UI_BASE_URL = process.env.EDCAP_E2E_UI_BASE_URL ?? 'http://localhost:5173';
const API_BASE_URL = process.env.EDCAP_E2E_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'b7a2bdf4-ac40-4012-9635-ff4b7e55eae0';
const AUTH_REFRESH_TOKEN_KEY = '15c665b7-592f-4b60-b31f-a252579a3bd0';
let authToken = '';

type Project = {
    projectId: string;
    customerId: string;
    customerName: string;
    projectAlias: string;
    projectType: string | null;
    riskLevel: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null;
    status: 'ACTIVE' | 'DELETED';
    deleteFlag: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    teamAssignments: Array<{
        projectTeamId: string;
        teamId: string;
        teamCode: string | null;
        teamName: string | null;
        status: 'ACTIVE' | 'DELETED' | string;
    }>;
};

type ProjectFixture = {
    alias: string;
    updatedAlias: string;
    projectType: string;
    updatedProjectType: string;
};

type Customer = {
    customerId: string;
    customerAlias: string;
};

type Team = {
    teamId: string;
    teamCode: string;
    teamName: string;
};

test.describe('Project access guard - UI E2E', () => {
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
            await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
        });

        await page.route('**/api/v1/auth/logout', async (route) => {
            logoutCalled = true;
            await route.fulfill({ status: 204, body: '' });
        });

        await page.addInitScript(({ tokenKey }) => {
            localStorage.setItem(tokenKey, 'e2e-viewer-token');
            localStorage.setItem('i18nextLng', 'en');
        }, { tokenKey: AUTH_TOKEN_KEY });

        await test.step('1. Open Project page with non-admin token on browser', async () => {
            await page.goto(`${UI_BASE_URL}/#/en/projects`);
        });

        await test.step('2. Verify user is redirected away from Project Management UI', async () => {
            await page.waitForURL(/#\/en\/login/, { timeout: 15000 });
            await expect.poll(() => logoutCalled).toBeTruthy();
        });
    });
});

test.describe('Project Management - real UI E2E', () => {
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

        const auth = (await loginResponse.json()) as { accessToken: string; refreshToken: string };
        authToken = auth.accessToken;
        if (!authToken) {
            throw new Error('Failed to capture auth token after internal login.');
        }

        let teams = findTeams(request, 'ACTIVE');
        if (teams && (await teams).length == 0) {
            const teamResponse = await request.post(`${API_BASE_URL}/api/v1/teams`, {
                headers: authenticatedHeaders(),
                data: {
                    teamCode: "E2ED1",
                    teamName: "Team Test E2E D",
                    description: "123"
                }
            });
            if (!teamResponse.ok()) {
                throw new Error(`Failed to create team: ${teamResponse.status()}`);
            }
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

        await cleanupProjects(request, 'E2E_PROJECT_');

        await test.step('Open Project page on browser', async () => {
            await page.goto(`${UI_BASE_URL}/#/en/projects`);
            await expect(page).toHaveURL(/#\/en\/projects/);
            await expect(page.locator('#project-list-table')).toBeVisible();
        });
    });

    test.afterAll(async ({ request }) => {
        await cleanupProjects(request, 'E2E_PROJECT_');
    });

    test('1-7. creates a Project from UI and verifies detail', async ({ page, request }) => {
        const fixture = makeFixture('create');
        const customer = await getFirstActiveCustomer(request);
        const team = await getFirstActiveTeam(request);

        try {
            await test.step('1. Click Create Project on UI', async () => {
                await clickCreateProject(page);
            });

            await test.step('2. Fill Customer, Project name, Project type, and Risk level on UI', async () => {
                await fillProjectForm(page, {
                    customerAlias: customer.customerAlias,
                    projectAlias: fixture.alias,
                    projectType: fixture.projectType,
                });
                await addTeamToProject(page, team.teamCode);
            });

            await test.step('3. Submit create form on UI', async () => {
                await submitProjectForm(page);
            });

            await test.step('4. Verify Project appears in active Project list', async () => {
                await waitForProjectPersisted(request, fixture.alias, 'ACTIVE');
                await searchProject(page, fixture.alias);
                await expectProjectRow(page, fixture.alias, customer.customerAlias);
            });

            await test.step('5. Open Project detail from UI row', async () => {
                await clickDetailForProject(page, fixture.alias);
            });

            await test.step('6. Verify Project detail shows alias and customer', async () => {
                const dialog = page.getByRole('dialog').last();
                await expect(dialog).toContainText(fixture.alias);
                await expect(dialog).toContainText(customer.customerAlias);
            });

            await test.step('7. Verify API detail contains the created Project', async () => {
                const created = await getProjectByAlias(request, fixture.alias, 'ACTIVE');
                expect(created).not.toBeNull();
                if (!created) throw new Error(`Project ${fixture.alias} was not created.`);
                expect(created.projectAlias).toBe(fixture.alias);
                expect(created.customerId).toBe(customer.customerId);
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupProjects(request, fixture.alias);
        }
    });

    test('9-12. searches Project by alias and verifies empty state remains safe', async ({ page, request }) => {
        const fixture = makeFixture('search');
        const customer = await getFirstActiveCustomer(request);
        const team = await getFirstActiveTeam(request);

        try {
            await createProjectViaApi(request, customer.customerId, fixture.alias, fixture.projectType, 'MEDIUM', [team.teamId]);
            await page.reload();
            await expect(page.locator('#project-list-table')).toBeVisible();

            await test.step('9. Search Project by Project name on UI', async () => {
                await searchProject(page, fixture.alias);
            });

            await test.step('10. Verify matching Project row remains visible', async () => {
                await expectProjectRow(page, fixture.alias, customer.customerAlias);
            });

            await test.step('11. Search with non-existing keyword on UI', async () => {
                await searchProject(page, `${fixture.alias}_NOT_FOUND`);
            });

            await test.step('12. Verify Project row disappears while the page stays usable', async () => {
                await expectProjectRowNotVisible(page, fixture.alias);
                await expect(page.locator('#project-list-table')).toBeVisible();
            });
        } finally {
            await cleanupProjects(request, fixture.alias);
        }
    });

    test('13-18. edits Project through UI', async ({ page, request }) => {
        const fixture = makeFixture('edit');
        const customer = await getFirstActiveCustomer(request);
        const team = await getFirstActiveTeam(request);

        try {
            await createProjectViaApi(request, customer.customerId, fixture.alias, fixture.projectType, 'HIGH', [team.teamId]);
            await page.reload();

            await test.step('13. Click Edit on Project row', async () => {
                await searchProject(page, fixture.alias);
                await clickEditForProject(page, fixture.alias);
            });

            await test.step('14. Change Project name, Project type, and Risk level on UI', async () => {
                await fillProjectForm(page, {
                    customerAlias: customer.customerAlias,
                    projectAlias: fixture.updatedAlias,
                    projectType: fixture.updatedProjectType,
                });
            });

            await test.step('15. Submit edit form on UI', async () => {
                await submitProjectForm(page);
            });

            await test.step('16. Search by updated Project name', async () => {
                await searchProject(page, fixture.updatedAlias);
            });

            await test.step('17. Verify updated Project row appears with changed values', async () => {
                await expectProjectRow(page, fixture.updatedAlias, customer.customerAlias);
            });

            await test.step('18. Verify API detail reflects the latest persisted values', async () => {
                const updated = await getProjectByAlias(request, fixture.updatedAlias, 'ACTIVE');
                expect(updated).not.toBeNull();
                if (!updated) throw new Error(`Project ${fixture.updatedAlias} was not updated.`);
                expect(updated.projectType).toBe(fixture.updatedProjectType);
                expect(updated.projectAlias).toBe(fixture.updatedAlias);
            });
        } finally {
            await cleanupProjects(request, fixture.alias);
            await cleanupProjects(request, fixture.updatedAlias);
        }
    });

    test('20-24. rejects duplicate Project alias within the same Customer', async ({ page, request }) => {
        const fixture = makeFixture('duplicate');
        const customer = await getFirstActiveCustomer(request);
        const team = await getFirstActiveTeam(request);

        try {
            await createProjectViaApi(request, customer.customerId, fixture.alias, fixture.projectType, 'HIGH', [team.teamId]);
            await page.reload();

            await test.step('20. Click Create Project again', async () => {
                await clickCreateProject(page);
            });

            await test.step('21. Enter duplicate Project name for the same Customer on UI', async () => {
                await fillProjectForm(page, {
                    customerAlias: customer.customerAlias,
                    projectAlias: fixture.alias,
                    projectType: `${fixture.projectType} Duplicate`,
                });
                await addTeamToProject(page, team.teamCode);
            });

            await test.step('22. Submit duplicate create on UI', async () => {
                await submitProjectForm(page);
            });

            await test.step('23. Verify duplicate submit is rejected and create dialog stays open', async () => {
                await expectDuplicateProjectRejected(page);
                await closeDialogIfStillOpen(page);
            });

            await test.step('24. Verify backend still has one active Project with that alias', async () => {
                const projects = await findProjectsByKeyword(request, fixture.alias, 'ACTIVE');
                expect(projects.filter((project) => project.projectAlias === fixture.alias && project.customerId === customer.customerId)).toHaveLength(1);
            });
        } finally {
            await cleanupProjects(request, fixture.alias);
        }
    });

    test('25-31. deletes Project and verifies deleted-list behavior', async ({ page, request }) => {
        const fixture = makeFixture('delete');
        const customer = await getFirstActiveCustomer(request);
        const team = await getFirstActiveTeam(request);

        try {
            await createProjectViaApi(request, customer.customerId, fixture.alias, fixture.projectType, 'HIGH', [team.teamId]);
            await page.reload();
            await searchProject(page, fixture.alias);

            await test.step('25. Click Delete Project on UI row', async () => {
                await clickDeleteForProject(page, fixture.alias);
            });

            await test.step('26. Confirm Project delete on UI', async () => {
                await confirmDelete(page);
            });

            await test.step('27. Verify Project disappears from Active list', async () => {
                await waitForProjectPersisted(request, fixture.alias, 'DELETED');
                await expectProjectRowNotVisible(page, fixture.alias);
            });

            await test.step('28. Switch status filter to Deleted', async () => {
                await filterProjectStatus(page, 'DELETED');
                await searchProject(page, fixture.alias);
            });

            await test.step('29. Verify deleted Project appears in Deleted list', async () => {
                await expectProjectRow(page, fixture.alias, customer.customerAlias);
            });

            await test.step('30. Open deleted Project detail from UI', async () => {
                await clickDetailForProject(page, fixture.alias);
            });

            await test.step('31. Verify API detail reflects soft delete state', async () => {
                const deleted = await getProjectByAlias(request, fixture.alias, 'DELETED');
                expect(deleted).not.toBeNull();
                if (!deleted) throw new Error(`Project ${fixture.alias} was not deleted.`);
                expect(deleted.status).toBe('DELETED');
                expect(deleted.deleteFlag).toBeTruthy();
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupProjects(request, fixture.alias);
        }
    });
});

function makeFixture(tag: string): ProjectFixture {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
        alias: `E2E_PROJECT_${tag.toUpperCase()}_${suffix}`.slice(0, 255),
        updatedAlias: `E2E_PROJECT_${tag.toUpperCase()}_UPDATED_${suffix}`.slice(0, 255),
        projectType: `Type ${tag} ${suffix}`.slice(0, 100),
        updatedProjectType: `Updated Type ${tag} ${suffix}`.slice(0, 100),
    };
}

async function createProjectViaApi(
    request: APIRequestContext,
    customerId: string,
    projectAlias: string,
    projectType: string,
    riskLevel: string,
    teamIds: string[],
): Promise<Project> {
    const response = await request.post(`${API_BASE_URL}/api/v1/projects`, {
        headers: {
            ...authenticatedHeaders(),
            'Content-Type': 'application/json',
        },
        data: { customerId, projectAlias, projectType, riskLevel, teamIds },
    });
    if (!response.ok()) {
        throw new Error(`Failed to create Project ${projectAlias}: ${response.status()}`);
    }
    return (await response.json()) as Project;
}

async function clickCreateProject(page: Page): Promise<void> {
    await firstExisting(page, [
        page.getByRole('button', { name: /create|add|new|tạo|thêm|作成|追加/i }),
        page.locator('button').filter({ hasText: /create|add|new|tạo|thêm|作成|追加/i }),
    ]).click();
}

async function fillProjectForm(
    page: Page,
    values: {
        customerAlias: string;
        projectAlias: string;
        projectType: string;
    },
): Promise<void> {
    const dialog = page.getByRole('dialog').last();

    const customerSelect = firstExisting(dialog, [
        dialog.locator('#customerId'),
        dialog.getByRole('combobox').first(),
        dialog.locator('input[aria-haspopup="listbox"]').first(),
    ]);
    await customerSelect.click();
    await chooseDropdownOption(page, values.customerAlias);

    await firstExisting(dialog, [
        dialog.locator('input[name="projectAlias"]'),
        dialog.locator('input[id="projectAlias"]'),
        dialog.getByLabel(/project name|alias|tên dự án|プロジェクト/i),
        dialog.getByPlaceholder(/project name|alias|tên dự án|プロジェクト/i),
    ]).fill(values.projectAlias);

    await firstExisting(dialog, [
        dialog.locator('input[name="projectType"]'),
        dialog.locator('input[id="projectType"]'),
        dialog.getByLabel(/project type|type|loại|タイプ/i),
        dialog.getByPlaceholder(/project type|type|loại|タイプ/i),
    ]).fill(values.projectType);

}

async function addTeamToProject(page: Page, teamCode: string): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    await firstExisting(dialog, [
        dialog.getByRole('button', { name: /add team|team add|thêm team|追加/i }),
        dialog.locator('button').filter({ hasText: /add team|team add|thêm team|追加/i }),
    ]).click();

    const modal = page.getByRole('dialog').last();
    const teamSelect = firstExisting(modal, [
        modal.locator('#teamId'),
        modal.getByRole('combobox').first(),
        modal.locator('input[aria-haspopup="listbox"]').first(),
    ]);
    await teamSelect.click();
    await chooseDropdownOption(page, teamCode);
    await firstExisting(modal, [
        modal.getByRole('button', { name: /save|add|lưu|保存|追加/i }),
        modal.locator('button').filter({ hasText: /save|add|lưu|保存|追加/i }),
    ]).click();
}

async function submitProjectForm(page: Page): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    await firstExisting(dialog, [
        dialog.getByRole('button', { name: /^save$/i }),
        dialog.getByRole('button', { name: /save|lưu|保存/i }),
        dialog.locator('button').filter({ hasText: /save|lưu|保存/i }),
    ]).click();
    await expect(dialog).not.toBeVisible({ timeout: 15000 }).catch(() => undefined);
}

async function searchProject(page: Page, keyword: string): Promise<void> {
    const scope = page.locator('#project-list-table');
    const input = firstExisting(scope, [
        scope.getByRole('textbox', { name: /search/i }),
        scope.getByPlaceholder(/search|tìm kiếm|検索/i),
        scope.getByLabel(/search|tìm kiếm|検索/i),
        scope.locator('input').first(),
    ]);
    await input.fill(keyword);
    await input.press('Enter').catch(() => undefined);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(300);
}

async function filterProjectStatus(page: Page, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<void> {
    await firstExisting(page, [
        page.getByRole('button', { name: /filter|bộ lọc|フィルタ/i }),
        page.locator('button').filter({ hasText: /filter|bộ lọc|フィルタ/i }),
    ]).click();

    const dialog = page.getByRole('dialog').last();
    if (status !== 'ACTIVE') {
        const statusSelect = dialog.getByRole('combobox').nth(1);
        await statusSelect.click();
        const arrowDownCount = status === 'DELETED' ? 1 : 2;
        for (let index = 0; index < arrowDownCount; index += 1) {
            await statusSelect.press('ArrowDown');
        }
        await statusSelect.press('Enter');
    }

    await firstExisting(dialog, [
        dialog.getByRole('button', { name: /apply|filter|áp dụng|適用/i }),
        dialog.locator('button').filter({ hasText: /apply|filter|áp dụng|適用/i }),
    ]).click();
}

async function clickDetailForProject(page: Page, alias: string): Promise<void> {
    const row = projectRow(page, alias);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByRole('button', { name: /detail|view|chi tiết|詳細/i }),
        row.locator('button[title*="detail" i]'),
        row.locator('button[title*="view" i]'),
    ]).click();
}

async function clickEditForProject(page: Page, alias: string): Promise<void> {
    const row = projectRow(page, alias);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByRole('button', { name: /edit|sửa|chỉnh sửa|編集/i }),
        row.locator('button[title*="Edit" i]'),
        row.locator('button[title*="edit" i]'),
    ]).click();
}

async function clickDeleteForProject(page: Page, alias: string): Promise<void> {
    const row = projectRow(page, alias);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByRole('button', { name: /delete|xóa|削除/i }),
        row.locator('button[title*="Delete" i]'),
        row.locator('button[title*="delete" i]'),
    ]).click();
}

async function confirmDelete(page: Page): Promise<void> {
    const popconfirm = page.locator('.ant-popconfirm, .ant-popover').last();
    await firstExisting(popconfirm, [
        popconfirm.getByRole('button', { name: /^OK$/i }),
        popconfirm.getByRole('button', { name: /ok|yes|delete|xóa|削除/i }),
    ]).click();
}

async function closeDialogIfStillOpen(page: Page): Promise<void> {
    const closeButton = firstExistingOptional(page, [
        page.getByRole('button', { name: /cancel|close|hủy|đóng|キャンセル/i }),
        page.locator('button[aria-label*="Close" i]'),
        page.locator('button').filter({ hasText: /cancel|close|hủy|đóng|キャンセル/i }),
    ]);
    if (closeButton) {
        await closeButton.click().catch(() => undefined);
    }
}

async function expectProjectRow(page: Page, alias: string, expectedCustomerAlias?: string): Promise<void> {
    const row = projectRow(page, alias);
    await expect(row).toBeVisible({ timeout: 15000 });
    if (expectedCustomerAlias) {
        await expect(row).toContainText(expectedCustomerAlias);
    }
}

async function expectProjectRowNotVisible(page: Page, alias: string): Promise<void> {
    await expect(projectRow(page, alias)).toHaveCount(0, { timeout: 15000 });
}

async function expectErrorToast(page: Page): Promise<void> {
    const errorToast = page.locator('.ant-message-notice-error').last();
    await expect(errorToast).toBeVisible({ timeout: 15000 });
    await expect(errorToast).toContainText(/duplicate|already exists|conflict|error|trùng|đã tồn tại|lỗi/i);
}

async function expectDuplicateProjectRejected(page: Page): Promise<void> {
    const createDialog = page.getByRole('dialog', { name: /create project/i }).last();
    await expect(createDialog).toBeVisible({ timeout: 15000 });
    await expect(createDialog).toContainText('Create Project');
}

async function cleanupProjects(request: APIRequestContext, aliasOrPrefix: string): Promise<void> {
    const projects = await findProjectsByKeyword(request, aliasOrPrefix, 'ALL').catch(() => []);
    await Promise.all(projects
        .filter((project) => project.projectAlias.startsWith(aliasOrPrefix) || project.projectAlias === aliasOrPrefix)
        .filter((project) => project.status !== 'DELETED')
        .map((project) => request.put(`${API_BASE_URL}/api/v1/projects/${project.projectId}/delete`, {
            headers: authenticatedHeaders(),
            data: {},
        }).catch(() => undefined)));
}

async function waitForProjectPersisted(
    request: APIRequestContext,
    alias: string,
    status: 'ACTIVE' | 'DELETED',
): Promise<void> {
    await expect.poll(
        async () => {
            const project = await getProjectByAlias(request, alias, status);
            return project?.status ?? null;
        },
        { timeout: 15000 },
    ).toBe(status);
}

async function findProjectsByKeyword(
    request: APIRequestContext,
    keyword: string,
    status: 'ACTIVE' | 'DELETED' | 'ALL',
): Promise<Project[]> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/projects?keyword=${encodeURIComponent(keyword)}&status=${status}&page=0&size=100`,
        { headers: authenticatedHeaders() },
    );
    if (!response.ok()) {
        throw new Error(`Failed to load Projects for ${keyword}: ${response.status()}`);
    }
    const body = (await response.json()) as { items: Project[] };
    return body.items;
}

async function getProjectByAlias(
    request: APIRequestContext,
    alias: string,
    status: 'ACTIVE' | 'DELETED',
): Promise<Project | null> {
    const projects = await findProjectsByKeyword(request, alias, status);
    return projects.find((project) => project.projectAlias === alias) ?? null;
}

async function getFirstActiveCustomer(request: APIRequestContext): Promise<Customer> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/customers?status=ACTIVE&page=0&pageSize=100`,
        { headers: authenticatedHeaders() },
    );
    if (!response.ok()) {
        throw new Error(`Failed to load active Customers: ${response.status()}`);
    }
    const body = (await response.json()) as { items: Customer[] };
    const customer = body.items[0];
    if (!customer) {
        throw new Error('No active Customer available for Project E2E.');
    }
    return customer;
}

async function getActiveTeams(request: APIRequestContext): Promise<Team[]> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/teams?status=ACTIVE&page=0&size=100`,
        { headers: authenticatedHeaders() },
    );
    if (!response.ok()) {
        throw new Error(`Failed to load active Teams: ${response.status()}`);
    }
    const body = (await response.json()) as { items: Team[] };
    return body.items;
}

async function getFirstActiveTeam(request: APIRequestContext): Promise<Team> {
    const teams = await getActiveTeams(request);
    const team = teams[0];
    if (!team) {
        throw new Error('No active Team available for Project E2E.');
    }
    return team;
}

async function chooseDropdownOption(page: Page, text: string): Promise<void> {
    const option = firstExisting(page, [
        page.getByRole('option', { name: new RegExp(escapeRegex(text), 'i') }),
        page.locator('.ant-select-item-option').filter({ hasText: text }),
        page.locator('[role="option"]').filter({ hasText: text }),
    ]).first();
    await option.click();
}

function authenticatedHeaders(): Record<string, string> {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

function projectRow(page: Page | Locator, alias: string): Locator {
    return firstExisting(page, [
        page.getByRole('row').filter({ hasText: alias }),
        page.locator('tr').filter({ hasText: alias }),
        page.locator('[role="row"]').filter({ hasText: alias }),
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

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findTeams(request: APIRequestContext, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<Team[]> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/teams?status=${status}&page=0&size=100`,
        { headers: authenticatedHeaders() },
    );
    if (!response.ok()) {
        throw new Error(`Failed to load Teams: ${response.status()}`);
    }
    const body = (await response.json()) as { items: Team[] };
    return body.items;
}