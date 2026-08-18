import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import usersData from '../../data/user.data.js';

const UI_BASE_URL = process.env.EDCAP_E2E_UI_BASE_URL ?? 'http://localhost:5173';
const API_BASE_URL = process.env.EDCAP_E2E_API_BASE_URL ?? 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'b7a2bdf4-ac40-4012-9635-ff4b7e55eae0';
const AUTH_REFRESH_TOKEN_KEY = '15c665b7-592f-4b60-b31f-a252579a3bd0';
let authToken = '';

type Team = {
    teamId: string;
    teamCode: string;
    teamName: string;
    description: string | null;
    status: 'ACTIVE' | 'DELETED';
    version: number;
    memberCount: number;
};

type TeamDetail = {
    team: Team;
    members: Array<{
        teamMemberId: string;
        memberKey: string;
        pseudonym: string;
        roleId: string;
        roleName: string;
        status: 'ACTIVE' | 'INACTIVE';
        version: number;
    }>;
    memberOptions: Array<{ memberKey: string; pseudonym: string }>;
    roleOptions: Array<{ roleId: string; roleName: string }>;
};

type TeamFixture = {
    code: string;
    name: string;
    updatedCode: string;
    updatedName: string;
    description: string;
};

test.describe('Team access guard - UI E2E', () => {
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

        await test.step('1. Open Team page with non-admin token on browser', async () => {
            await page.goto(`${UI_BASE_URL}/#/en/teams`);
        });

        await test.step('2. Verify user is redirected away from Team Management UI', async () => {
            await page.waitForURL(/#\/en\/login/, { timeout: 15000 });
            await expect.poll(() => logoutCalled).toBeTruthy();
        });
    });
});

test.describe('Team Management - real UI E2E', () => {
    // This suite hits a real backend (login, cleanup, create/update/delete
    // all go over the network) rather than mocked routes, so it's
    // meaningfully slower than the mock-based dashboard suites. The default
    // 30s Playwright test timeout can be consumed just by beforeEach's real
    // login + cleanupTeams call, leaving too little budget for the test body's
    // own waits (e.g. the 15s row-visibility check in expectTeamRow) and
    // producing a false "Test timeout exceeded" failure even though the team
    // was created successfully. 60s gives realistic headroom.
    test.describe.configure({ timeout: 60_000 });

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

        await cleanupTeams(request, 'E2E_TEAM_');

        await test.step('Open Team page on browser', async () => {
            await page.goto(`${UI_BASE_URL}/#/en/teams`);
            await expect(page).toHaveURL(/#\/en\/teams/);
            await expect(page.locator('#team-list-table')).toBeVisible();
        });
    });

    test.afterAll(async ({ request }) => {
        await cleanupTeams(request, 'E2E_TEAM_');
    });

    test('1-6. creates a Team from UI and verifies detail screen', async ({ page, request }) => {
        const fixture = makeFixture('create');

        try {
            await test.step('1. Click Create Team on UI', async () => {
                await clickCreateTeam(page);
            });

            await test.step('2. Fill Team Code, Team Name, Description on UI', async () => {
                await fillTeamForm(page, fixture.code, fixture.name, fixture.description);
            });

            await test.step('3. Submit create form on UI', async () => {
                await submitTeamForm(page);
            });

            await test.step('4. Verify Team appears in active Team list', async () => {
                await expectTeamRow(page, fixture.code, fixture.name);
            });

            await test.step('5. Open Team detail from UI row', async () => {
                await clickDetailForTeam(page, fixture.code);
            });

            await test.step('6. Verify Team Code and Team Name appear in detail modal', async () => {
                await expect(page.getByRole('dialog').last()).toContainText(fixture.code);
                await expect(page.getByRole('dialog').last()).toContainText(fixture.name);
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupTeams(request, fixture.code);
        }
    });

    test('7-10. searches Team by code and verifies empty state by non-existing keyword', async ({ page, request }) => {
        const fixture = makeFixture('search');

        try {
            await createTeamViaUi(page, fixture);

            await test.step('7. Search Team by Team Code on UI', async () => {
                await searchTeam(page, fixture.code);
            });

            await test.step('8. Verify matching Team row remains visible', async () => {
                await expectTeamRow(page, fixture.code, fixture.name);
            });

            await test.step('9. Search with non-existing keyword on UI', async () => {
                await searchTeam(page, `${fixture.code}_NOT_FOUND`);
            });

            await test.step('10. Verify Team row disappears from active UI list', async () => {
                await expectTeamRowNotVisible(page, fixture.code);
            });
        } finally {
            await cleanupTeams(request, fixture.code);
        }
    });

    test('11-15. edits Team Code and Team Name through UI', async ({ page, request }) => {
        const fixture = makeFixture('edit');

        try {
            await createTeamViaUi(page, fixture);

            await test.step('11. Click Edit on Team row', async () => {
                await clickEditForTeam(page, fixture.code);
            });

            await test.step('12. Change Team Code and Team Name on UI', async () => {
                await fillTeamForm(page, fixture.updatedCode, fixture.updatedName, `${fixture.description} updated`);
            });

            await test.step('13. Submit edit form on UI', async () => {
                await submitTeamForm(page);
            });

            await test.step('14. Search by new Team Code', async () => {
                await searchTeam(page, fixture.updatedCode);
            });

            await test.step('15. Verify updated Team row appears with changed Team Code', async () => {
                await expectTeamRow(page, fixture.updatedCode, fixture.updatedName);
            });
        } finally {
            await cleanupTeams(request, fixture.code);
            await cleanupTeams(request, fixture.updatedCode);
        }
    });

    test('16-20. rejects duplicate Team Code on create and keeps only one active row', async ({ page, request }) => {
        const fixture = makeFixture('duplicate');

        try {
            await createTeamViaUi(page, fixture);

            await test.step('16. Click Create Team again', async () => {
                await clickCreateTeam(page);
            });

            await test.step('17. Enter duplicate Team Code on UI', async () => {
                await fillTeamForm(page, fixture.code, `${fixture.name} copy`, `${fixture.description} duplicate`);
            });

            await test.step('18. Submit duplicate create on UI', async () => {
                await submitTeamForm(page);
            });

            await test.step('19. Verify duplicate error toast appears', async () => {
                await expectErrorToast(page);
                await closeDialogIfStillOpen(page);
            });

            await test.step('20. Verify backend still has one active Team with that code', async () => {
                const teams = await findTeamsByKeyword(request, fixture.code, 'ACTIVE');
                expect(teams.filter((team) => team.teamCode === fixture.code)).toHaveLength(1);
            });
        } finally {
            await cleanupTeams(request, fixture.code);
        }
    });

    test('21-29. adds, updates, and removes Team member through UI', async ({ page, request }) => {
        const fixture = makeFixture('member');

        try {
            await createTeamViaUi(page, fixture);
            const team = await getTeamByCode(request, fixture.code, 'ACTIVE');
            expect(team).not.toBeNull();
            if (!team) throw new Error(`Team ${fixture.code} was not created.`);

            const lookups = await getTeamDetail(request, team.teamId);
            const member = lookups.memberOptions[0];
            const firstRole = pickNonAdminRole(lookups.roleOptions, 0);
            const secondRole = pickNonAdminRole(lookups.roleOptions, 1) ?? firstRole;
            expect(member).toBeTruthy();
            expect(firstRole).toBeTruthy();

            await test.step('21. Open Team detail from UI', async () => {
                await clickDetailForTeam(page, fixture.code);
            });

            await test.step('22. Click Add Member on UI', async () => {
                await clickAddMember(page);
            });

            await test.step('23. Select existing member and role on UI', async () => {
                await selectMemberAndRole(page, member.pseudonym, firstRole.roleName);
            });

            await test.step('24. Submit Add Member on UI', async () => {
                await submitMemberForm(page);
            });

            await test.step('25. Verify member and role appear in Team detail UI', async () => {
                await expect(page.getByRole('dialog').last()).toContainText(member.pseudonym);
                await expect(page.getByRole('dialog').last()).toContainText(firstRole.roleName);
            });

            await test.step('26. Click Edit member role on UI', async () => {
                await clickEditMember(page, member.pseudonym);
            });

            await test.step('27. Select another role and submit on UI', async () => {
                await selectRoleOnly(page, secondRole.roleName);
                await submitMemberForm(page);
            });

            await test.step('28. Verify updated role appears in Team detail UI', async () => {
                await expect(page.getByRole('dialog').last()).toContainText(secondRole.roleName);
            });

            await test.step('29. Remove member on UI and verify it disappears from active member list', async () => {
                await clickRemoveMember(page, member.pseudonym);
                await expect(page.getByRole('dialog').last()).not.toContainText(member.pseudonym, { timeout: 15000 });
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupTeams(request, fixture.code);
        }
    });

    test('30-35. allows the same member in two different Teams', async ({ page, request }) => {
        const first = makeFixture('multi-a');
        const second = makeFixture('multi-b');

        try {
            await createTeamViaUi(page, first);
            await createTeamViaUi(page, second);

            const firstTeam = await getTeamByCode(request, first.code, 'ACTIVE');
            const secondTeam = await getTeamByCode(request, second.code, 'ACTIVE');
            expect(firstTeam).not.toBeNull();
            expect(secondTeam).not.toBeNull();
            if (!firstTeam || !secondTeam) throw new Error('Two Teams were not created for multi-Team check.');

            const detail = await getTeamDetail(request, firstTeam.teamId);
            const member = detail.memberOptions[0];
            const role = pickNonAdminRole(detail.roleOptions, 0);
            expect(member).toBeTruthy();
            expect(role).toBeTruthy();

            await test.step('30. Add member to first Team through backend setup API', async () => {
                await addMemberByApi(request, firstTeam.teamId, member.memberKey, role.roleId);
            });

            await test.step('31. Open second Team detail on UI', async () => {
                await searchTeam(page, second.code);
                await clickDetailForTeam(page, second.code);
            });

            await test.step('32. Add the same member to second Team through UI', async () => {
                await clickAddMember(page);
                await selectMemberAndRole(page, member.pseudonym, role.roleName);
                await submitMemberForm(page);
            });

            await test.step('33. Verify second Team detail shows member', async () => {
                await expect(page.getByRole('dialog').last()).toContainText(member.pseudonym);
            });

            await test.step('34. Verify first Team still has active member by API', async () => {
                const firstDetail = await getTeamDetail(request, firstTeam.teamId);
                expect(firstDetail.members.some((item) => item.memberKey === member.memberKey && item.status === 'ACTIVE')).toBeTruthy();
            });

            await test.step('35. Verify second Team has active member by API', async () => {
                const secondDetail = await getTeamDetail(request, secondTeam.teamId);
                expect(secondDetail.members.some((item) => item.memberKey === member.memberKey && item.status === 'ACTIVE')).toBeTruthy();
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupTeams(request, first.code);
            await cleanupTeams(request, second.code);
        }
    });

    test('36-40. rejects duplicate active member in the same Team', async ({ page, request }) => {
        const fixture = makeFixture('dup-member');

        try {
            await createTeamViaUi(page, fixture);
            const team = await getTeamByCode(request, fixture.code, 'ACTIVE');
            expect(team).not.toBeNull();
            if (!team) throw new Error(`Team ${fixture.code} was not created.`);
            const detail = await getTeamDetail(request, team.teamId);
            const member = detail.memberOptions[0];
            const role = pickNonAdminRole(detail.roleOptions, 0);
            await addMemberByApi(request, team.teamId, member.memberKey, role.roleId);

            await test.step('36. Open Team detail that already has an active member', async () => {
                await searchTeam(page, fixture.code);
                await clickDetailForTeam(page, fixture.code);
                await expect(page.getByRole('dialog').last()).toContainText(member.pseudonym);
            });

            await test.step('37. Open Add Member and confirm the active member is not selectable', async () => {
                await clickAddMember(page);
                const dialog = page.getByRole('dialog').last();
                const memberSelect = firstExisting(dialog, [
                    dialog.getByRole('combobox', { name: /member/i }),
                    dialog.getByLabel(/member/i),
                    dialog.locator('#memberKey'),
                ]);
                await memberSelect.click();
                await expect(dialog.getByRole('option', { name: new RegExp(escapeRegex(member.pseudonym), 'i') })).toHaveCount(0);
            });

            await test.step('38. Close the Add Member dialog without changing the active member list', async () => {
                await closeDialogIfStillOpen(page);
            });

            await test.step('39. Verify active member still appears only once by API', async () => {
                const after = await getTeamDetail(request, team.teamId);
                expect(after.members.filter((item) => item.memberKey === member.memberKey && item.status === 'ACTIVE')).toHaveLength(1);
            });

            await test.step('40. Verify UI detail still shows the Team after the check', async () => {
                await searchTeam(page, fixture.code);
                await expectTeamRow(page, fixture.code, fixture.name);
            });
        } finally {
            await closeDialogIfStillOpen(page);
            await cleanupTeams(request, fixture.code);
        }
    });

    test('41-46. deletes Team and verifies active memberships are inactive by API evidence', async ({ page, request }) => {
        const fixture = makeFixture('delete');

        try {
            await createTeamViaUi(page, fixture);
            const team = await getTeamByCode(request, fixture.code, 'ACTIVE');
            expect(team).not.toBeNull();
            if (!team) throw new Error(`Team ${fixture.code} was not created.`);
            const detail = await getTeamDetail(request, team.teamId);
            const member = detail.memberOptions[0];
            const role = pickNonAdminRole(detail.roleOptions, 0);
            await addMemberByApi(request, team.teamId, member.memberKey, role.roleId);
            await searchTeam(page, fixture.code);

            await test.step('41. Click Delete Team on UI row', async () => {
                await clickDeleteForTeam(page, fixture.code);
            });

            await test.step('42. Confirm Team delete on UI', async () => {
                await confirmDelete(page);
            });

            await test.step('43. Verify Team disappears from Active list', async () => {
                await expectTeamRowNotVisible(page, fixture.code);
            });

            await test.step('44. Switch status filter to Deleted', async () => {
                await filterTeamStatus(page, 'DELETED');
                await searchTeam(page, fixture.code);
            });

            await test.step('45. Verify deleted Team appears in Deleted list', async () => {
                await expectTeamRow(page, fixture.code, fixture.name);
            });

            await test.step('46. Verify API no longer returns active members for that Team', async () => {
                const after = await getTeamDetail(request, team.teamId);
                expect(after.team.status).toBe('DELETED');
                expect(after.members.filter((item) => item.status === 'ACTIVE')).toHaveLength(0);
            });
        } finally {
            await cleanupTeams(request, fixture.code);
        }
    });

    test('47-52. verifies Team page labels in en, vi, and ja locales on real UI', async ({ page }) => {
        await test.step('47. Open English Team page', async () => {
            await page.goto(`${UI_BASE_URL}/#/en/teams`);
            await expect(page.locator('#team-list-table')).toBeVisible();
        });

        await test.step('48. Verify English page has visible Team management action labels', async () => {
            await expect(page.getByRole('button', { name: /create|add|new/i })).toBeVisible();
        });

        await test.step('49. Open Vietnamese Team page', async () => {
            await page.goto(`${UI_BASE_URL}/#/vi/teams`);
            await expect(page.locator('#team-list-table')).toBeVisible();
        });

        await test.step('50. Verify Vietnamese page renders a Team action button', async () => {
            await expect(page.getByRole('button', { name: /tạo|thêm|create|add/i })).toBeVisible();
        });

        await test.step('51. Open Japanese Team page', async () => {
            await page.goto(`${UI_BASE_URL}/#/ja/teams`);
            await expect(page.locator('#team-list-table')).toBeVisible();
        });

        await test.step('52. Verify Japanese page renders a Team action button', async () => {
            await expect(page.getByRole('button', { name: /作成|追加|create|add/i })).toBeVisible();
        });
    });
});

function makeFixture(tag: string): TeamFixture {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const codeSuffix = `${tag.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${suffix}`.slice(0, 34);
    return {
        code: `E2E_TEAM_${codeSuffix}`,
        name: `E2E Team ${tag} ${suffix}`,
        updatedCode: `E2E_TEAM_${codeSuffix}_UP`.slice(0, 50),
        updatedName: `E2E Team ${tag} Updated ${suffix}`,
        description: `Created by Playwright UI E2E ${tag} ${suffix}`,
    };
}

async function createTeamViaUi(page: Page, fixture: TeamFixture): Promise<void> {
    await clickCreateTeam(page);
    await fillTeamForm(page, fixture.code, fixture.name, fixture.description);
    await submitTeamForm(page);
    await expectTeamRow(page, fixture.code, fixture.name);
}

async function clickCreateTeam(page: Page): Promise<void> {
    await firstExisting(page, [
        page.getByTestId('team-create-button'),
        page.getByRole('button', { name: /create|add|new|tạo mới|thêm|作成|追加/i }),
        page.locator('button').filter({ hasText: /create|add|new|tạo mới|thêm|作成|追加/i }),
    ]).click();
}

async function fillTeamForm(page: Page, code: string, name: string, description?: string): Promise<void> {
    await firstExisting(page, [
        page.getByTestId('team-code-input'),
        page.getByLabel(/team code|code|mã|コード/i),
        page.getByPlaceholder(/team code|code|mã|コード/i),
        page.locator('input[name="teamCode"]'),
        page.locator('input[id="teamCode"]'),
    ]).fill(code);

    await firstExisting(page, [
        page.getByTestId('team-name-input'),
        page.getByLabel(/team name|name|tên|名前/i),
        page.getByPlaceholder(/team name|name|tên|名前/i),
        page.locator('input[name="teamName"]'),
        page.locator('input[id="teamName"]'),
    ]).fill(name);

    if (description !== undefined) {
        const descriptionInput = firstExistingOptional(page, [
            page.getByTestId('team-description-input'),
            page.getByLabel(/description|mô tả|説明/i),
            page.getByPlaceholder(/description|mô tả|説明/i),
            page.locator('textarea[name="description"]'),
            page.locator('input[name="description"]'),
            page.locator('textarea[id="description"]'),
        ]);
        if (descriptionInput) {
            await descriptionInput.fill(description);
        }
    }
}

async function submitTeamForm(page: Page): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    await firstExisting(dialog, [
        dialog.getByTestId('team-submit-button'),
        dialog.getByRole('button', { name: /^Save$/i }),
        dialog.getByRole('button', { name: /save|lưu|保存/i }),
    ]).click();
}

async function searchTeam(page: Page, keyword: string): Promise<void> {
    const scope = page.locator('#team-list-table');
    const input = firstExisting(scope, [
        scope.getByRole('textbox', { name: /search/i }),
        scope.getByPlaceholder(/search|tìm kiếm|検索/i),
        scope.getByLabel(/search|tìm kiếm|検索/i),
        scope.locator('input').first(),
    ]);
    await input.fill(keyword);
    await input.press('Enter').catch(() => undefined);
    await page.waitForLoadState('networkidle').catch(() => undefined);
}

async function filterTeamStatus(page: Page, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<void> {
    await firstExisting(page, [
        page.getByRole('button', { name: /filter|bộ lọc|フィルタ/i }),
        page.locator('button').filter({ hasText: /filter|bộ lọc|フィルタ/i }),
    ]).click();

    const dialog = page.getByRole('dialog').last();
    if (status !== 'ACTIVE') {
        const select = firstExisting(dialog, [
            dialog.getByRole('combobox'),
            dialog.locator('#status'),
            dialog.locator('input[aria-haspopup="listbox"]'),
        ]);
        await select.click();
        const arrowDownCount = status === 'DELETED' ? 1 : 2;
        for (let index = 0; index < arrowDownCount; index += 1) {
            await select.press('ArrowDown');
        }
        await select.press('Enter');
    }

    await firstExisting(dialog, [
        dialog.getByRole('button', { name: /filter|apply|áp dụng|適用/i }),
        dialog.getByRole('button', { name: /^Filter$/i }),
    ]).click();
}

async function clickDetailForTeam(page: Page, code: string): Promise<void> {
    const row = teamRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTestId(`team-detail-${code}`),
        row.getByRole('button', { name: /detail|view|chi tiết|詳細/i }),
        row.locator('button[title*="Detail" i]'),
        row.locator('button[title*="detail" i]'),
        row.locator('button[aria-label*="detail" i]'),
    ]).click();
}

async function clickEditForTeam(page: Page, code: string): Promise<void> {
    const row = teamRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTestId(`team-edit-${code}`),
        row.getByRole('button', { name: /edit|sửa|chỉnh sửa|編集/i }),
        row.locator('button[title*="Edit" i]'),
        row.locator('button[aria-label*="Edit" i]'),
    ]).click();
}

async function clickDeleteForTeam(page: Page, code: string): Promise<void> {
    const row = teamRow(page, code);
    await expect(row).toBeVisible();
    await firstExisting(row, [
        row.getByTestId(`team-delete-${code}`),
        row.getByRole('button', { name: /delete|xóa|xoá|削除/i }),
        row.locator('button[title*="Delete" i]'),
        row.locator('button[aria-label*="Delete" i]'),
    ]).click();
}

async function confirmDelete(page: Page): Promise<void> {
    const popconfirm = page.locator('.ant-popconfirm, .ant-popover').last();
    await firstExisting(popconfirm, [
        popconfirm.getByRole('button', { name: /^OK$/i }),
        popconfirm.getByRole('button', { name: /ok|yes|delete|xóa|削除/i }),
    ]).click();
}

async function clickAddMember(page: Page): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    await firstExisting(dialog, [
        dialog.getByTestId('team-add-member-button'),
        dialog.getByRole('button', { name: /add member|member add|thêm thành viên|追加/i }),
        dialog.locator('button').filter({ hasText: /add member|member|thêm|追加/i }),
    ]).click();
}

async function selectMemberAndRole(page: Page, memberText: string, roleText: string): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    const memberSelect = firstExisting(dialog, [
        dialog.getByRole('combobox', { name: /member/i }),
        dialog.getByLabel(/member/i),
        dialog.locator('#memberKey'),
    ]);
    await memberSelect.click();
    await chooseDropdownOption(page, memberText);
    await selectRoleOnly(page, roleText);
}

async function selectRoleOnly(page: Page, roleText: string): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    const roleSelect = firstExisting(dialog, [
        dialog.getByRole('combobox', { name: /role/i }),
        dialog.getByLabel(/role/i),
        dialog.locator('#roleId'),
    ]);
    await roleSelect.click();
    await chooseDropdownOption(page, roleText);
}

async function chooseDropdownOption(page: Page, text: string): Promise<void> {
    // Match the option text exactly. The previous unanchored regex/hasText
    // matching selected ANY option containing `text` as a substring, so a
    // real role/member name that is itself a prefix of another (e.g. the
    // backend having both "DATA_OPS" and "DATA_OPS_TEST") resolved to two
    // elements and threw a strict-mode violation on click().
    const exactText = new RegExp(`^${escapeRegex(text)}$`);
    const option = firstExisting(page, [
        page.getByRole('option', { name: text, exact: true }),
        page.locator('.ant-select-item-option').filter({ hasText: exactText }),
        page.locator('[role="option"]').filter({ hasText: exactText }),
    ]);
    await option.click();
}

async function submitMemberForm(page: Page): Promise<void> {
    const dialog = page.getByRole('dialog').last();
    await firstExisting(dialog, [
        dialog.getByTestId('team-member-submit-button'),
        dialog.getByRole('button', { name: /save|add|lưu|保存|追加/i }),
        dialog.locator('button').filter({ hasText: /save|add|lưu|保存|追加/i }),
    ]).click();
}

async function clickEditMember(page: Page, pseudonym: string): Promise<void> {
    const row = page.getByRole('row').filter({ hasText: pseudonym }).last();
    await firstExisting(row, [
        row.getByRole('button', { name: /edit|sửa|編集/i }),
        row.locator('button[title*="Edit" i]'),
        row.locator('button[aria-label*="Edit" i]'),
    ]).click();
}

async function clickRemoveMember(page: Page, pseudonym: string): Promise<void> {
    const row = page.getByRole('row').filter({ hasText: pseudonym }).last();
    await firstExisting(row, [
        row.getByRole('button', { name: /remove|delete|xóa|xoá|削除/i }),
        row.locator('button[title*="Remove" i]'),
        row.locator('button[title*="Delete" i]'),
    ]).click();
    await confirmDelete(page).catch(() => undefined);
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

async function expectTeamRow(page: Page, code: string, expectedName?: string): Promise<void> {
    const row = teamRow(page, code);
    await expect(row).toBeVisible({ timeout: 15000 });
    if (expectedName) {
        await expect(row).toContainText(expectedName);
    }
}

async function expectTeamRowNotVisible(page: Page, code: string): Promise<void> {
    await expect(teamRow(page, code)).toHaveCount(0, { timeout: 15000 });
}

async function expectErrorToast(page: Page): Promise<void> {
    const errorToast = page.locator('.ant-message-notice-error').last();
    await expect(errorToast).toBeVisible({ timeout: 15000 });
    await expect(errorToast).toContainText(/duplicate|already exists|conflict|member|role|error|trùng|đã tồn tại|lỗi/i);
}

async function cleanupTeams(request: APIRequestContext, codeOrPrefix: string): Promise<void> {
    const teams = await findAllTeamsByKeyword(request, codeOrPrefix, 'ALL').catch(() => []);
    await Promise.all(teams
        .filter((team) => team.teamCode.startsWith(codeOrPrefix) || team.teamCode === codeOrPrefix)
        .map((team) => request.patch(`${API_BASE_URL}/api/v1/teams/${team.teamId}/delete`, {
            headers: authenticatedHeaders(),
            data: { version: team.version },
        }).catch(() => undefined)));
}

async function findTeamsByKeyword(request: APIRequestContext, keyword: string, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<Team[]> {
    const response = await request.get(
        `${API_BASE_URL}/api/v1/teams?keyword=${encodeURIComponent(keyword)}&status=${status}&page=0&size=100`,
        { headers: authenticatedHeaders() },
    );
    if (!response.ok()) {
        throw new Error(`Failed to load Teams for ${keyword}: ${response.status()}`);
    }
    const body = (await response.json()) as { items: Team[] };
    return body.items;
}

// findTeamsByKeyword only fetches the first page (size=100). If more than
// 100 test teams accumulate across repeated CI/local runs, cleanupTeams
// would silently leave the overflow ACTIVE, and those stale rows push newly
// created teams off the default list page — the cause of the intermittent
// "row not found" failure in test 1. Page through every result instead.
async function findAllTeamsByKeyword(request: APIRequestContext, keyword: string, status: 'ACTIVE' | 'DELETED' | 'ALL'): Promise<Team[]> {
    const pageSize = 100;
    const all: Team[] = [];
    for (let page = 0; page < 50; page += 1) {
        const response = await request.get(
            `${API_BASE_URL}/api/v1/teams?keyword=${encodeURIComponent(keyword)}&status=${status}&page=${page}&size=${pageSize}`,
            { headers: authenticatedHeaders() },
        );
        if (!response.ok()) {
            throw new Error(`Failed to load Teams for ${keyword}: ${response.status()}`);
        }
        const body = (await response.json()) as { items: Team[]; hasNext?: boolean };
        all.push(...body.items);
        if (!body.hasNext || body.items.length < pageSize) {
            break;
        }
    }
    return all;

}

async function getTeamByCode(request: APIRequestContext, code: string, status: 'ACTIVE' | 'DELETED'): Promise<Team | null> {
    const teams = await findTeamsByKeyword(request, code, status);
    return teams.find((team) => team.teamCode === code) ?? null;
}

async function getTeamDetail(request: APIRequestContext, teamId: string): Promise<TeamDetail> {
    const response = await request.get(`${API_BASE_URL}/api/v1/teams/${teamId}`, { headers: authenticatedHeaders() });
    if (!response.ok()) {
        throw new Error(`Failed to load Team detail ${teamId}: ${response.status()}`);
    }
    return (await response.json()) as TeamDetail;
}

async function addMemberByApi(request: APIRequestContext, teamId: string, memberKey: string, roleId: string): Promise<void> {
    const response = await request.post(`${API_BASE_URL}/api/v1/teams/${teamId}/members`, {
        headers: authenticatedHeaders(),
        data: { memberKey, roleId },
    });
    if (!response.ok()) {
        throw new Error(`Failed to add Team member by API: ${response.status()}`);
    }
}

function authenticatedHeaders(): Record<string, string> {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

function pickNonAdminRole(roles: Array<{ roleId: string; roleName: string }>, index: number): { roleId: string; roleName: string } {
    const candidates = roles.filter((role) => role.roleName.toUpperCase() !== 'ADMIN');
    return candidates[index] ?? candidates[0];
}

function teamRow(page: Page | Locator, code: string): Locator {
    return firstExisting(page, [
        page.getByTestId(`team-row-${code}`),
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

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}