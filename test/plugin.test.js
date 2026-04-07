import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.dirname(__dirname);
const fixtureDir = path.join(__dirname, "fixtures", "site");
const outputDir = path.join(fixtureDir, "dist");
const eleventyCli = path.join(repoRoot, "node_modules", "@11ty", "eleventy", "cmd.cjs");

test("builds the plugin successfully in Nunjucks, Liquid, and JavaScript templates", async () => {
  const cjsPlugin = require(repoRoot);
  assert.equal(typeof cjsPlugin, "function");

  await fs.rm(outputDir, { recursive: true, force: true });

  await execFileAsync(process.execPath, [eleventyCli, "--config=.eleventy.js"], {
    cwd: fixtureDir,
  });

  const nunjucksHtml = await fs.readFile(path.join(outputDir, "nunjucks", "index.html"), "utf8");
  const liquidHtml = await fs.readFile(path.join(outputDir, "liquid", "index.html"), "utf8");
  const javascriptHtml = await fs.readFile(path.join(outputDir, "javascript", "index.html"), "utf8");

  assert.match(nunjucksHtml, /data-masto-action="primary-share"/);
  assert.match(nunjucksHtml, /data-masto-save-host="hachyderm\.io"/);
  assert.match(nunjucksHtml, /https%3A%2F%2Fexample\.com%2Fnunjucks%2F/);

  assert.match(liquidHtml, /https%3A%2F%2Fexample\.com%2Fliquid%2F/);
  assert.match(liquidHtml, /hashtags=eleventy%2Cliquid/);

  assert.match(javascriptHtml, /https%3A%2F%2Fexample\.com%2Fjavascript%2F/);
  assert.match(javascriptHtml, /hashtags=eleventy%2Cjavascript/);

  const stylesheetTagCount = (nunjucksHtml.match(/\/assets\/masto-share\.css/g) || []).length;
  assert.equal(stylesheetTagCount, 1);

  await fs.access(path.join(outputDir, "assets", "masto-share.css"));
  await fs.access(path.join(outputDir, "assets", "masto-share.js"));
  await fs.access(path.join(outputDir, "assets", "mastodon.svg"));
});
