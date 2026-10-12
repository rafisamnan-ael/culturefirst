import { test, expect } from "@playwright/test";

test.describe.configure({ retries: 0 });

test("homepage loads and shows hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Know how organizations treat people");
  await expect(page.getByRole("link", { name: /organizations/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /search/i })).toBeVisible();
});

test("directory search works", async ({ page }) => {
  await page.goto("/organizations");
  await expect(page.getByRole("heading", { name: /organization directory/i })).toBeVisible();
  await page.getByRole("textbox", { name: /search/i }).fill("nexus");
  await page.getByRole("button", { name: /search/i }).click();
  await expect(page.getByText(/nexus/i)).toBeVisible();
});

test("organization profile shows score when available", async ({ page }) => {
  await page.goto("/organizations/sample-city-general-hospital");
  await expect(page.locator("h1")).toContainText("City General Hospital");
  // score display for patient perspective
  await expect(page.getByText(/culture score/i)).toBeVisible();
});

test("language toggle switches between EN and BN", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /english/i })).toBeVisible();
  await page.getByRole("button", { name: /বাংলা/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.getByRole("button", { name: /english/i })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: /english/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("dev sign-in works", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /A Reviewer/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /your dashboard/i })).toBeVisible();
});

test("review wizard flow (authenticated)", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /A Reviewer/i }).click();
  await page.goto("/organizations/sample-nexus-technologies/review");
  await expect(page.getByRole("heading", { name: /write a review/i })).toBeVisible();

  // Step 1: branch (optional)
  await page.getByRole("button", { name: /next/i }).click();

  // Step 2: relationship
  await page.getByRole("button", { name: /current employee/i }).click();
  await page.getByRole("button", { name: /next/i }).click();

  // Step 3: period
  await page.getByLabel(/experience period/i).fill("2023");
  await page.getByRole("button", { name: /next/i }).click();

  // Step 4: rate parameters
  // At least minimum required for score
  await page.locator("button", { hasText: /4/ }).first().click();
  await page.locator("button", { hasText: /4/ }).nth(1).click();
  await page.locator("button", { hasText: /4/ }).nth(2).click();
  await page.getByRole("button", { name: /next/i }).click();

  // Step 5: review body
  await page.getByLabel(/describe your firsthand experience/i).fill(
    "This is a detailed firsthand experience describing the culture of the workplace. I have personally observed the leadership behavior and communication patterns over several months."
  );
  await page.getByRole("button", { name: /next/i }).click();

  // Step 6: display name
  await page.getByLabel(/public display name/i).fill("Test Reviewer");
  await page.getByRole("button", { name: /next/i }).click();

  // Step 7: confirm
  await page.getByRole("checkbox", { name: /community rules/i }).check();
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/pending moderation/i)).toBeVisible();
});

test("admin dashboard accessible to moderator", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Moderator/i }).click();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
});

test("admin moderation queue shows pending reviews", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Moderator/i }).click();
  await page.goto("/admin/moderation");
  await expect(page.getByRole("heading", { name: /pending/i })).toBeVisible();
});

test("static pages load", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: /about culturefirst/i })).toBeVisible();
  await page.goto("/methodology");
  await expect(page.getByRole("heading", { name: /rating methodology/i })).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: /privacy/i })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: /terms/i })).toBeVisible();
  await page.goto("/community-guidelines");
  await expect(page.getByRole("heading", { name: /community guidelines/i })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: /contact/i })).toBeVisible();
});

test("404 page for unknown route", async ({ page }) => {
  await page.goto("/this-path-does-not-exist-123");
  await expect(page.getByText(/page not found/i)).toBeVisible();
});