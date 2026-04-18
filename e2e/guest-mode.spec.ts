import { test, expect } from "@playwright/test";

test.describe("Guest mode", () => {
  test.beforeEach(async ({ context }) => {
    // Clear guest cookie before each test
    await context.clearCookies();
  });

  test("clicking 'Continue as guest' redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("guest mode sets the guest_mode cookie", async ({ page, context }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue as guest/i }).click();
    const cookies = await context.cookies();
    const guestCookie = cookies.find((c) => c.name === "guest_mode");
    expect(guestCookie?.value).toBe("true");
  });

  test("guest user can access dashboard without auth", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    // Dashboard should load (not redirect back to login)
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("guest user without cookie is redirected to login", async ({ page }) => {
    // No guest cookie set — should redirect to login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup prompt appears after 3 seconds for guest users", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    // Prompt appears after 3s
    await expect(
      page.getByRole("alertdialog")
    ).toBeVisible({ timeout: 6000 });
    await expect(
      page.getByText(/your data is only on this device/i)
    ).toBeVisible();
  });

  test("dismissing prompt records today's date so it doesn't reappear", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /continue as guest/i }).click();
    await page.waitForTimeout(3500);
    await page.getByRole("button", { name: /remind me tomorrow/i }).click();

    // Reload and wait — prompt should NOT reappear
    await page.reload();
    await page.waitForTimeout(4000);
    await expect(page.getByRole("alertdialog")).not.toBeVisible();
  });
});
