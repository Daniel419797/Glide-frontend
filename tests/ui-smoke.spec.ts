import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Company email").fill("amara@northstar.test");
  await page.getByLabel("Password").fill("correct-horse-battery-staple");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("secure session reaches the tenant dashboard", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Northstar Services workspace")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "glide_refresh")?.httpOnly).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("dashboard-desktop.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("request form submits through the tenant endpoint", async ({ page }) => {
  await login(page);
  await page.goto("/forms");
  await expect(page.getByText("Purchase Request", { exact: true })).toBeVisible();
  await page
    .locator("article")
    .filter({ hasText: "Purchase Request" })
    .getByRole("button", { name: "Start request" })
    .click();
  await page.getByLabel("Item").fill("Standing desks");
  await page.getByLabel("Amount").fill("1800");
  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page).toHaveURL(/\/requests\/bbbbbbbb/, { timeout: 20_000 });
  await expect(page.getByText("Standing desks")).toBeVisible();
});

test("390px dashboard and navigation have no horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.getByRole("table")).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Organization" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("dashboard-mobile.png"), fullPage: true });
});

test("session mutations reject an untrusted origin", async ({ request }) => {
  const response = await request.post("/api/session/login", {
    headers: { origin: "https://attacker.example" },
    data: { email: "amara@northstar.test", password: "correct-horse-battery-staple" },
  });
  expect(response.status()).toBe(403);
  await expect(response.json()).resolves.toMatchObject({ error: { code: "INVALID_ORIGIN" } });
});
