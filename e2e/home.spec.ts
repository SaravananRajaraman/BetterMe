import { test, expect } from "@playwright/test";

test.describe("Home / Login page", () => {
  test("renders the login page with branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /BetterMe/i })).toBeVisible();
    await expect(
      page.getByText("Track your daily habits. Build better routines.")
    ).toBeVisible();
  });

  test("shows Google sign-in button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();
  });

  test("shows email sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows continue as guest option", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continue as guest/i })
    ).toBeVisible();
  });

  test("toggles between sign in and sign up modes", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();
  });

  test("email validation shows error on invalid input", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("unauthenticated user is redirected to login from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
