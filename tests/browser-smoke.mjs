import { chromium } from "playwright";
import { expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "5191",
  ],
  { stdio: "ignore" },
);
let browser;
try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch("http://127.0.0.1:5191")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1365, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5191");
  await page.locator("[data-action=new]").click();
  await expect(page.locator("canvas")).toBeVisible();
  for (const action of ["customer", "product", "cctv"]) {
    await page.locator(`[data-action=${action}]`).click();
    await expect(page.locator("#dialog")).toBeVisible();
    await page.locator("#close-dialog").click();
  }
  await page.locator("[data-action=pay]").click();
  await expect(page.locator("[data-action=next]")).toBeVisible();
  await page.reload();
  await page.locator("[data-action=continue]").click();
  await expect(page.locator("[data-action=next]")).toBeVisible();
  await page.locator("[data-action=next]").click();
  // Play the rest of the campaign via actual controls, using the generated fixture's intended actions.
  for (let i = 0; i < 83; i++) {
    const action = await page.evaluate(() => {
      const r = JSON.parse(localStorage.getItem("24store-save-v1")).run,
        e = r.schedule[r.index];
      return e.id === "woman" ? "pay" : e.correct[0];
    });
    await page.locator(`[data-action=${action}]`).click();
    await page.locator("[data-action=next]").click();
    if (await page.locator("[data-action=nextday]").count()) {
      console.log(`Completed night ${Math.floor((i + 2) / 12)}`);
      await page.locator("[data-action=nextday]").click();
    }
  }
  await expect(page.locator(".end-card")).toContainText("NORMAL END");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("24store-save-v1")),
  );
  expect(saved.run.logs).toHaveLength(7);
  expect(saved.endings).toContain("normal");
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/ending.png", fullPage: true });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto("http://127.0.0.1:5191");
  await mobile.locator("[data-action=new]").tap();
  if (await mobile.locator("#confirm-new").count())
    await mobile.locator("#confirm-new").tap();
  await mobile.locator("[data-action=cctv]").tap();
  await mobile.locator("#close-dialog").tap();
  await mobile.locator("[data-action=pay]").tap();
  await mobile.locator("[data-action=next]").tap();
  expect(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await mobile.screenshot({ path: "test-results/mobile.png", fullPage: true });
  expect(errors).toEqual([]);
  console.log(
    "PASS: seven-day browser campaign, save/resume, ending UI, mobile touch, no horizontal overflow or page errors.",
  );
} catch (error) {
  console.error(error);
  throw error;
} finally {
  if (browser) await browser.close();
  server.kill();
}
