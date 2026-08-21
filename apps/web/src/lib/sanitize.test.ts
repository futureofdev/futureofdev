import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeArticleHtml } from "./sanitize";

test("Beehiiv HTML sanitiser removes active content and unsafe attributes", () => {
  const html = sanitizeArticleHtml(`
    <script>alert(1)</script>
    <p onclick="steal()" style="color:red">Safe copy</p>
    <a href="javascript:alert(1)">bad link</a>
    <img src="https://example.com/image.png" onerror="steal()">
  `);
  assert.doesNotMatch(html, /script|onclick|style=|javascript:|onerror/i);
  assert.match(html, /Safe copy/);
  assert.match(html, /https:\/\/example\.com\/image\.png/);
});
