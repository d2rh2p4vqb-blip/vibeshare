import { test, expect } from "@playwright/test";

test.describe("核心页面加载", () => {
  test("首页正常加载", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=VibeShare")).toBeVisible();
    await expect(page.locator("text=发现 Vibecoding 佳作")).toBeVisible();
  });

  test("排行榜页面正常显示", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("h1")).toContainText("排行榜");
  });

  test("发现页可以搜索", async ({ page }) => {
    await page.goto("/discover");
    const searchInput = page.locator("input[placeholder='搜索作品...']");
    await expect(searchInput).toBeVisible();
  });

  test("登录页面可以访问", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=登录")).toBeVisible();
  });

  test("注册页面可以访问", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("text=注册")).toBeVisible();
  });
});
