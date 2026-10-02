// Browser checks for the static site.
// Usage: serve the repo root (python3 -m http.server 4173), then `npm test`.
// SITE_URL overrides the base, e.g. SITE_URL=https://tejajuttu.github.io npm test
// CHROME_PATH points at a Chromium/Chrome binary if playwright-core can't find one.
import { chromium } from "playwright-core";
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.SITE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const SHOTS = process.env.SHOTS_DIR || "";
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const pages = ["/", "/work/multimodal-search/", "/archive/", "/404.html"];
const viewports = [["desktop", 1440, 900], ["tablet", 820, 1180], ["phone", 390, 844], ["small", 320, 640]];
const failures = [];
const fail = (m) => { failures.push(m); console.log("  FAIL " + m); };
const ok = (m) => console.log("  ok   " + m);

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, channel: process.env.CHROME_PATH ? undefined : "chrome" }).catch(() =>
  chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }));

for (const path of pages) {
  for (const [name, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const label = `${path} @${name}`;
    if (!res || (res.status() >= 400 && path !== "/404.html")) fail(`${label} status ${res && res.status()}`);
    const m = await page.evaluate(() => {
      const small = [...document.querySelectorAll("body *")].filter((e) => {
        const cs = getComputedStyle(e);
        if (cs.display === "none" || cs.visibility === "hidden" || e.closest(".visually-hidden,[hidden]")) return false;
        return [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 14 && !e.closest(".board");
      }).length;
      const body = parseFloat(getComputedStyle(document.querySelector("main p, main li") || document.body).fontSize);
      const imgs = [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length;
      const targets = [...document.querySelectorAll("button, .site-nav a, .button")].filter((e) => {
        const r = e.getBoundingClientRect(); return r.width && r.height < 44;
      }).map((e) => e.textContent.trim().slice(0, 20));
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1, small, body, imgs, targets };
    });
    m.overflow ? fail(`${label} horizontal overflow`) : ok(`${label} no overflow`);
    if (m.small) fail(`${label} ${m.small} text nodes under 14px`);
    if (m.imgs) fail(`${label} ${m.imgs} images without width/height`);
    if (m.targets.length) fail(`${label} small targets: ${m.targets.join(", ")}`);
    if (errors.length) fail(`${label} JS errors: ${errors.join("; ")}`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${(path.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home")}-${name}.png`, fullPage: true });
    if (name === "desktop") {
      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] })).violations.map((v) => `${v.id} (${v.nodes.length})`));
      axe.length ? fail(`${label} axe: ${axe.join(", ")}`) : ok(`${label} axe clean`);
    }
    await page.close();
  }
}

// Behaviour checks
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const beh = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  beh === "auto" ? ok("reduced motion: no smooth scroll") : fail("reduced motion still smooth-scrolls");
  // Keyboard: first Tab lands on skip link, which is visible when focused
  await page.keyboard.press("Tab");
  const skip = await page.evaluate(() => ({ cls: document.activeElement.className, top: document.activeElement.getBoundingClientRect().top }));
  skip.cls === "skip" && skip.top >= 0 ? ok("skip link first and visible") : fail("skip link not first/visible");
  // Chess
  await page.click("[data-chess-toggle]");
  const g7 = await page.textContent('[data-sq="g7"]');
  const ans = await page.textContent("[data-chess-answer]");
  g7 === "♕" && ans.includes("Qg7#") ? ok("chess reveals Qg7#") : fail("chess reveal broken");
  // Contact links
  const hrefs = await page.$$eval("#contact a", (as) => as.map((a) => a.getAttribute("href")));
  ["mailto:", "linkedin.com/in/tejajuttu", "github.com/tejajuttu"].every((h) => hrefs.some((x) => x.includes(h))) ? ok("contact links present") : fail("contact links missing");
  // Project page + back
  await page.click('a[href="/work/multimodal-search/"]');
  await page.waitForURL("**/work/multimodal-search/");
  await page.goBack();
  page.url().replace(/#.*$/, "") === BASE + "/" ? ok("project page opens and back works") : fail("back navigation broken");
  // Archive filter
  await page.goto(BASE + "/archive/", { waitUntil: "networkidle" });
  await page.click('[data-filter="viz"]');
  const visible = await page.$$eval("[data-cat]", (li) => li.filter((x) => !x.hidden).length);
  visible === 7 ? ok("archive filter works (7 visualization projects)") : fail(`archive filter shows ${visible}`);
  // Old URL redirects
  await page.goto(BASE + "/projects.html");
  await page.waitForURL("**/archive/", { timeout: 5000 }).catch(() => {});
  page.url().endsWith("/archive/") ? ok("/projects.html redirects to /archive/") : fail("/projects.html redirect broken");
  // No JS: content still there
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await ctx.newPage();
  await nojs.goto(BASE + "/archive/");
  const n = await nojs.$$eval("[data-cat]", (li) => li.filter((x) => getComputedStyle(x).display !== "none").length);
  n === 20 ? ok("archive readable without JS") : fail(`no-JS archive shows ${n}`);
  await ctx.close();
  await page.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} failure(s)` : "\nAll checks passed");
process.exit(failures.length ? 1 : 0);
