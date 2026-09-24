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
    await page.locator("[data-project] > .project-action").count(),
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
    "sticky",
  );
  assert.ok(
    await page
      .locator("#journey")
      .evaluate((el) => el.getBoundingClientRect().top >= 66),
  );
  // The artwork is local and the 3D renderer only loads when requested.
  for (const image of await page.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => el.decode());
    assert.ok(await image.evaluate((el) => el.naturalWidth > 0));
  }
  await page.locator("#terrain-toggle").click();
  await page.waitForSelector("#mountain canvas");
  assert.equal(
    await page.locator("#terrain-toggle").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#terrain-toggle").click();
  assert.equal(await page.locator("#mountain").isVisible(), false);
  // Re-entering while paused must keep one healthy canvas.
  await page.locator("#terrain-toggle").click();
  assert.equal(await page.locator("#mountain canvas").count(), 1);
  assert.ok(
    await page
      .locator("#mountain canvas")
      .evaluate((el) => el.width > 0 && el.height > 0),
  );
  await page
    .locator("#mountain canvas")
    .evaluate((el) =>
      el.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await page.waitForFunction(() => document.querySelector("#mountain").hidden);
  await page.locator("#terrain-toggle").click();
  await page.waitForSelector("#mountain canvas");
  assert.equal(await page.locator("#mountain canvas").count(), 1);
  await page.locator("#terrain-toggle").click();
  await page.locator("#open-scenario").click();
  const scenarioAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    scenarioAudit.violations.map((v) => v.id),
    [],
    "Scenario accessibility violations",
  );
  for (let route = 0; route < 3; route++) {
    for (let step = 0; step < 3; step++) {
      await page.locator(`[data-choice="${route}"]`).click();
      assert.ok(await page.locator(".scenario-feedback strong").innerText());
      await page.locator("#scenario-next").click();
    }
    assert.equal(await page.locator(".scenario-recap").count(), 3);
    await page.locator("#scenario-restart").click();
    assert.equal(await page.locator(".scenario-choice").count(), 3);
  }
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "open-scenario",
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
  const fallbackContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await fallbackContext.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  const fallback = await fallbackContext.newPage();
  await fallback.goto(process.env.SITE_URL || "http://127.0.0.1:4173/", {
    waitUntil: "networkidle",
  });
  await fallback.locator("#terrain-toggle").click();
  await fallback.waitForFunction(
    () =>
      document.querySelector("#terrain-toggle").getAttribute("aria-pressed") ===
      "false",
  );
  assert.equal(await fallback.locator("#mountain").isVisible(), false);
  assert.equal(
    await fallback
      .locator(".hero-art")
      .evaluate((el) => el.classList.contains("terrain-visible")),
    false,
  );
  await fallbackContext.close();
  console.log(
    "PASS: responsive layout, artwork, 3D/fallback, all scenario branches, project dialogs, games, keyboard focus, anchors, and automated WCAG audits.",
  );
} finally {
  await browser.close();
}
