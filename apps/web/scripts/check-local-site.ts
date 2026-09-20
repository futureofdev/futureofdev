import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { unzipSync } from "fflate";
import { createCourseDownloadToken } from "../src/lib/course-token";

// Exercise the actual local server without making subscriber mutations.
const base = new URL(process.argv[2] ?? "http://127.0.0.1:4321");
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Only a local server is allowed");
const root = new URL("../../../", import.meta.url);
const env = parse(await readFile(new URL(".env", root)));

async function request(path: string, options: RequestInit = {}) {
  return fetch(new URL(path, base), {
    ...options, redirect: "manual", signal: AbortSignal.timeout(15_000),
  });
}

for (const path of ["/", "/about", "/learning", "/learning/coding-bootcamp-in-a-box", "/insights", "/privacy", "/sitemap.xml", "/rss.xml", "/robots.txt"]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} should render`);
  const body = await response.text();
  assert.ok(body.length > 0);
  if (response.headers.get("Content-Type")?.includes("text/html")) {
    assert.match(body, /rel="canonical"[^>]*href="https:\/\/futureofdev\.com/);
  }
  console.log(`PASS ${path}`);
}

for (const path of ["/claude-academy", "/claude-academy/", "/claude-academy/coding-bootcamp-in-a-box", "/claude-academy/coding-bootcamp-in-a-box/"]) {
  const response = await request(`${path}?utm_source=local-check`);
  assert.ok([301, 308].includes(response.status), `${path} should redirect permanently`);
  const location = new URL(response.headers.get("Location")!, base);
  assert.equal(location.searchParams.get("utm_source"), "local-check");
  assert.equal(location.pathname, path.includes("coding-bootcamp") ? "/learning/coding-bootcamp-in-a-box" : "/learning");
  assert.equal((await request(location.pathname + location.search)).status, 200, "Redirect must be one hop");
}
console.log("PASS historic redirects preserve attribution in one hop");

for (const [body, status] of [[null, 400], [[], 400], [{ email: "invalid", placement: "test" }, 400], [{ padding: "x".repeat(9_000) }, 413]] as const) {
  const response = await request("/api/newsletter", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base.origin },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, status, "Invalid newsletter requests must be rejected locally");
}
assert.equal((await request("/api/newsletter", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.com" }, body: "{}",
})).status, 403);
console.log("PASS signup request validation (no subscriber changes)");

assert.equal((await request("/api/course-download")).status, 403);
assert.ok(env.COURSE_DOWNLOAD_SECRET, "Set COURSE_DOWNLOAD_SECRET in the local .env");
const expired = await createCourseDownloadToken(env.COURSE_DOWNLOAD_SECRET, Date.now() - 3_600_000);
assert.equal((await request(`/api/course-download?token=${encodeURIComponent(expired)}`)).status, 403);
const token = await createCourseDownloadToken(env.COURSE_DOWNLOAD_SECRET);
const download = await request(`/api/course-download?token=${encodeURIComponent(token)}`);
assert.equal(download.status, 200, "Valid signed download must succeed");
assert.match(download.headers.get("Cache-Control") ?? "", /no-store/);
const zip = unzipSync(new Uint8Array(await download.arrayBuffer()));
const courseRoot = new URL("courses/coding-bootcamp/", root);
let files = 0;
async function checkDirectory(relative = "") {
  for (const entry of await readdir(new URL(relative, courseRoot), { withFileTypes: true })) {
    const path = `${relative}${entry.name}`;
    if (entry.isDirectory()) {
      await checkDirectory(`${path}/`);
    } else if (entry.isFile()) {
      const source = await readFile(fileURLToPath(new URL(path, courseRoot)));
      const bundled = zip[`coding-bootcamp-in-a-box/${path}`];
      assert.ok(bundled, `Missing course file: ${path}`);
      assert.deepEqual(Buffer.from(bundled), source, `Course file differs: ${path}`);
      files++;
    }
  }
}
await checkDirectory();
assert.equal(Object.keys(zip).length, files, "Archive should contain only current course sources");
console.log(`PASS signed ZIP matches all ${files} source files; absent/expired tokens rejected`);
console.log("Local HTTP checks passed. Beehiiv writes, browser consent/visual behaviour, Skilling onboarding and Cloudflare edge behaviour were not tested.");
