import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.SITE_URL || "http://127.0.0.1:4173/", {
    waitUntil: "networkidle",
  });
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(
    await page.locator("#motion-toggle").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    audit.violations.map((v) => v.id),
    [],
    "Homepage accessibility violations",
  );
  assert.equal(
    await page.locator(".project-card > .project-action").count(),
    3,
  );
  await page.locator('nav a[href="#journey"]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('nav a[href="#journey"]')
        .getAttribute("aria-current") === "location",
  );
  assert.equal(
    await page
      .locator("header")
      .evaluate((el) => getComputedStyle(el).position),
    "fixed",
  );
  assert.ok(
    await page
      .locator("#journey")
      .evaluate((el) => el.getBoundingClientRect().top >= 76),
  );
  for (const name of ["media", "agents", "delivery"]) {
    await page.locator(`[data-project="${name}"]`).click();
    assert.equal(await page.locator("dialog[open]").count(), 1);
    await page.keyboard.press("Escape");
  }
  await page.locator("#open-chess").click();
  await page
    .getByRole("button", { name: "g6, white queen", exact: true })
    .click();
  await page.getByRole("button", { name: "g7, empty", exact: true }).click();
  assert.match(await page.locator(".game-status").innerText(), /checkmate/);
  const dialogAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    dialogAudit.violations.map((v) => v.id),
    [],
    "Dialog accessibility violations",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "open-chess",
  );
  await page.locator("#open-descent").click();
  await page.locator("#start-run").click();
  await page.waitForTimeout(800);
  assert.ok(parseInt(await page.locator("#run-distance").innerText()) > 0);
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "open-descent",
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    mobileAudit.violations.map((v) => v.id),
    [],
    "Mobile accessibility violations",
  );
  const anchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links.map((a) => a.getAttribute("href")).filter((h) => h.length > 1),
    );
  for (const anchor of anchors)
    assert.equal(
      await page.locator(anchor).count(),
      1,
      `Missing anchor: ${anchor}`,
    );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop/mobile layout, reduced motion, all project dialogs, chess solution, snowboard run, focus restoration, local anchors, and automated WCAG audits.",
  );
} finally {
  await browser.close();
}
