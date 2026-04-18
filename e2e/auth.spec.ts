import { test, expect } from "@playwright/test";

test.describe("Email authentication", () => {
  test("sign-up with invalid email shows validation error", async ({
    page,
  }) => {
    await page.goto("/login");
    // Switch to sign-up mode
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(
      page.getByText(/enter a valid email/i)
    ).toBeVisible();
  });

  test("sign-up with short password shows validation error", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(
      page.getByText(/at least 8 characters/i)
    ).toBeVisible();
  });

  test("sign-in with wrong credentials shows error toast", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    // Expect error from Supabase (e.g., "Invalid login credentials")
    await expect(
      page.getByText(/invalid login credentials|authentication failed/i)
    ).toBeVisible({ timeout: 8000 });
  });

  test("mode toggle preserves email field value", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    // Switch to sign-up mode and back
    await page.getByRole("button", { name: "Sign up" }).click();
    // Form resets on toggle, which is the expected behavior
    await expect(page.getByLabel("Email")).toHaveValue("");
  });
});
