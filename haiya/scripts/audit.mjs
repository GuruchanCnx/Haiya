import { createServer } from "node:http";
import {
  readFileSync,
  existsSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, extname } from "node:path";
import { chromium } from "@playwright/test";
const root = resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
const server = createServer((req, res) => {
  let path = resolve(root, "." + new URL(req.url, "http://localhost").pathname);
  if (!path.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(path) || statSync(path).isDirectory())
    path = root + "/index.html";
  res.setHeader("Content-Type", types[extname(path)] || "application/json");
  res.end(readFileSync(path));
});
await new Promise((r) => server.listen(4173, "127.0.0.1", r));
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const reports = [];
async function scan(name) {
  await page.evaluate(axeSource);
  const result = await page.evaluate(
    async () =>
      await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
  );
  reports.push({
    view: name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
const assert = (ok, msg) => {
  if (!ok) throw Error(msg);
};
try {
  await page.goto("http://127.0.0.1:4173");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  mkdirSync("audit", { recursive: true });
  await page.screenshot({ path: "audit/desktop.png", fullPage: true });
  await scan("storefront");
  assert(
    (await page.locator(".product-card").count()) === 6,
    "Six products exist",
  );
  await page
    .getByRole("button", { name: "Add Original Soy Milk to bag", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review pre-order", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Test Customer");
  await page.getByLabel("Phone number", { exact: true }).fill("0812345678");
  await scan("checkout");
  await page
    .getByRole("button", { name: "Confirm pre-order", exact: true })
    .click();
  await page.waitForTimeout(300);
  assert((await page.locator(".order-card").count()) === 1, "Order created");
  assert(
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("wanchai-v2-products"))[0].stock,
    )) === 47,
    "Stock decremented",
  );
  await scan("orders");
  await page
    .getByRole("button", { name: "Kitchen orders", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start preparing", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark ready for pickup", exact: true })
    .click();
  assert(
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("wanchai-v2-orders"))[0].status,
    )) === "ready",
    "Kitchen updates connected",
  );
  await scan("kitchen");
  await page
    .getByRole("button", { name: "Point of sale", exact: true })
    .click();
  await page
    .locator(".dial-pad")
    .getByRole("button", { name: "3", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add quantity to bag", exact: true })
    .click();
  assert(
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("wanchai-v2-cart"))[0].qty,
    )) === 3,
    "POS dial adds quantity",
  );
  await scan("pos");
  await page
    .getByRole("button", { name: "Subscriptions", exact: true })
    .click();
  await scan("subscriptions");
  await page
    .getByRole("button", { name: "Choose this little ritual", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Choose pickup & review", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm pre-order", exact: true })
    .click();
  assert(
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("wanchai-v2-subscriptions")).length,
    )) === 1,
    "Subscription created",
  );
  await page
    .getByRole("button", { name: "Settings & admin", exact: true })
    .click();
  await scan("admin");
  await page
    .getByRole("button", { name: "Accessibility", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Run live audit", exact: true })
    .click();
  await page.waitForSelector(".audit-results");
  await page.getByRole("button", { name: "Our menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Toggle light or dark theme", exact: true })
    .click();
  await scan("dark-storefront");
  await page.screenshot({ path: "audit/dark.png", fullPage: true });
  for (const name of [
    "My orders",
    "Point of sale",
    "Kitchen orders",
    "Subscriptions",
    "Settings & admin",
  ]) {
    await page.locator(".nav-item").filter({ hasText: name }).click();
    await scan("dark-" + name);
  }
  await page.getByRole("button", { name: "Our menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Switch to Thai", exact: true })
    .click();
  assert(
    (await page.locator("html").getAttribute("lang")) === "th",
    "Thai language set",
  );
  await page.screenshot({ path: "audit/thai.png", fullPage: true });
  await scan("thai-dark-storefront");
  await page
    .getByRole("button", { name: "เปลี่ยนเป็นภาษาอังกฤษ", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Toggle light or dark theme", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Accessibility & comfort", exact: true })
    .click();
  await page
    .getByRole("switch", { name: "High contrast", exact: true })
    .click();
  await page.getByRole("switch", { name: "Larger text", exact: true }).click();
  await scan("comfort-dialog");
  await page.keyboard.press("Escape");
  assert((await page.locator("dialog").count()) === 0, "Escape closes dialog");
  await scan("high-contrast-large-storefront");
  await page
    .getByRole("button", { name: "Accessibility & comfort", exact: true })
    .click();
  await page
    .getByRole("switch", { name: "High contrast", exact: true })
    .click();
  await page.getByRole("switch", { name: "Larger text", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "audit/mobile.png", fullPage: true });
  assert(
    (await page.evaluate(() => document.documentElement.scrollWidth)) <= 390,
    "No mobile horizontal overflow",
  );
  await scan("mobile-storefront");
  await page
    .getByRole("button", { name: "Toggle navigation", exact: true })
    .click();
  await page.locator(".nav-item").filter({ hasText: "My orders" }).click();
  assert(
    (await page.locator(".order-card").count()) === 2,
    "Mobile navigation works",
  );
  await page.reload();
  await page.waitForTimeout(400);
  assert(
    (await page.evaluate(
      () => JSON.parse(localStorage.getItem("wanchai-v2-orders")).length,
    )) === 2,
    "Orders persist after reload",
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector(".product-card");
  assert(
    await page.locator(".offline-banner").isVisible(),
    "Offline shell reload works",
  );
  console.log("FUNCTIONAL CHECKS PASSED. Runtime errors:", errors);
  writeFileSync(
    "audit/results.json",
    JSON.stringify({ errors, reports }, null, 2),
  );
  console.log(
    JSON.stringify(
      reports.map((r) => ({
        view: r.view,
        violations: r.violations.map((v) => ({
          id: v.id,
          count: v.nodes.length,
        })),
      })),
      null,
      2,
    ),
  );
} finally {
  writeFileSync(
    "audit/results.json",
    JSON.stringify({ errors, reports }, null, 2),
  );
  await browser.close();
  server.close();
}
