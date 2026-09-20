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

test("Beehiiv page chrome is removed while the authored article remains", () => {
  const html = sanitizeArticleHtml(`
    <html><body><div class="rendered-post">
      <div id="web-header">
        <h1>Repeated title</h1>
        <h2>Repeated subtitle</h2>
        <a href="https://example.com/share"><svg><path /></svg></a>
      </div>
      <div id="content-blocks">
        <div><table><tr><td><h5><span>■</span> INTRODUCTION</h5></td><td><p>01</p></td></tr></table></div>
        <div><p>Authored article copy.</p></div>
      </div>
    </div></body></html>
  `);

  assert.doesNotMatch(html, /Repeated title|Repeated subtitle|example\.com\/share/);
  assert.match(html, /<h2 class="article-section-title">■ INTRODUCTION<\/h2>/);
  assert.match(html, /Authored article copy/);
  assert.doesNotMatch(html, /<div/i);
});
