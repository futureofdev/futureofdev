import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const directory = await mkdtemp(join(tmpdir(), "fod-seo-"));
const state = join(directory, "mode");
await writeFile(state, "published");
const port = Number(process.env.SEO_TEST_PORT ?? 4341);
const origin = `http://127.0.0.1:${port}`;
const cwd = fileURLToPath(new URL("../", import.meta.url));
const preload = fileURLToPath(new URL("fixtures/seo-preload.mjs", import.meta.url));
const child = spawn(process.execPath, ["./node_modules/astro/astro.js", "dev", "--host", "127.0.0.1", "--port", String(port)], {
  cwd, detached: true, stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_OPTIONS: `--import=${preload}`, SEO_FIXTURE_STATE: state,
    BEEHIIV_API_KEY: "seo-fixture", BEEHIIV_PUBLICATION_ID: "pub_seo_fixture" },
});
let output = "";
child.stdout.on("data", (chunk) => { output += String(chunk); });
child.stderr.on("data", (chunk) => { output += String(chunk); });
async function request(path: string) {
  return fetch(`${origin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(15000) });
}
function schemas(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap((match) => JSON.parse(match[1]!) as Record<string, unknown> | Array<Record<string, unknown>>);
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw new Error(`Preview exited: ${output}`);
    if (output.includes(`127.0.0.1:${port}/`)) { ready = true; break; }
    await delay(500);
  }
  assert.ok(ready, `Preview did not start on expected port: ${output}`);
  for (const path of ["/", "/about", "/learning", "/learning/coding-bootcamp-in-a-box", "/insights"]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, path);
    assert.ok(html.includes(`rel="canonical" href="https://futureofdev.com${path}"`), `${path}: canonical`);
    assert.ok(schemas(html).some((schema) => schema["@type"] === "WebSite"));
  }
  const course = await (await request("/learning/coding-bootcamp-in-a-box")).text();
  const courseSchema = schemas(course).find((schema) => schema["@type"] === "Course")!;
  assert.ok(courseSchema);
  assert.equal(courseSchema.numberOfCredits, undefined);
  assert.match(course, /AI tools may require payment/);
  for (const old of ["/learning/", "/claude-academy/", "/claude-academy/coding-bootcamp-in-a-box/"]) {
    const response = await request(`${old}?utm_source=fixture`);
    assert.equal(response.status, 301, old);
    const expected = old.includes("coding-bootcamp") ? "/learning/coding-bootcamp-in-a-box" : "/learning";
    assert.equal(response.headers.get("Location"), `${expected}?utm_source=fixture`);
  }
  const first = await (await request("/insights")).text();
  assert.match(first, /href="\/insights\/page\/2"/);
  assert.equal((first.match(/class="issue-card"/g) ?? []).length, 20);
  const last = await request("/insights/page/6");
  assert.equal(last.status, 200);
  const lastHtml = await last.text();
  assert.match(lastHtml, /href="\/insights\/exercise-104"/);
  assert.match(lastHtml, /rel="canonical" href="https:\/\/futureofdev.com\/insights\/page\/6"/);
  assert.equal((await request("/insights/page/7")).status, 404);
  assert.equal((await request("/insights/not-published")).status, 404);
  assert.equal((await request("/insights/not-published")).headers.get("Location"), null);
  const article = await (await request("/insights/exercise-1")).text();
  const articleSchema = schemas(article).find((schema) => schema["@type"] === "Article")!;
  assert.equal((articleSchema.author as unknown[]).length, 2);
  assert.match(article, /href="\/about#luke-hennerley"/);
  assert.doesNotMatch(article, /data-analytics-cta="go-deeper"/);
  assert.match(await (await request("/insights/exercise-0")).text(), /data-analytics-cta="go-deeper"/);
  const sitemap = await (await request("/sitemap.xml")).text();
  assert.match(sitemap, /insights\/exercise-104/);
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 111);
  assert.match(await (await request("/rss.xml")).text(), /Check &amp; learn/);
  console.log("PASS rendered copy, canonical redirects, schema, author links, pagination, 404, sitemap and RSS with 105 fixture editions");

  await writeFile(state, "outage");
  for (const path of ["/insights", "/insights/page/2", "/sitemap.xml", "/rss.xml", "/insights/exercise-1"]) {
    const response = await request(path);
    assert.equal(response.status, 503, path);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Retry-After"), "60");
  }
  const home = await request("/");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Editions are temporarily unavailable/);
  await writeFile(state, "empty");
  const empty = await request("/insights");
  assert.equal(empty.status, 200);
  assert.match(await empty.text(), /The first edition is on its way/);
  console.log("PASS upstream failures remain distinct from genuinely empty publications");
} catch (error) {
  console.error(output.slice(-8000));
  throw error;
} finally {
  if (child.pid) {
    try { process.kill(-child.pid, "SIGTERM"); } catch { /* Already exited. */ }
  }
  await rm(directory, { recursive: true, force: true });
}
