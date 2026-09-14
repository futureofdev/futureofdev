import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "dotenv";
import { BeehiivApiError, listPosts } from "../src/lib/beehiiv";

const env = parse(await readFile(new URL("../../../.env", import.meta.url)));
assert.ok(env.BEEHIIV_API_KEY, "Add BEEHIIV_API_KEY to the root .env");
assert.match(env.BEEHIIV_PUBLICATION_ID ?? "", /^pub_[0-9a-f-]{36}$/, "Add the V2 publication ID to the root .env");
try {
  const posts = await listPosts({
    apiKey: env.BEEHIIV_API_KEY,
    publicationId: env.BEEHIIV_PUBLICATION_ID!,
  }, { limit: 5, expand: ["free_web_content"] });
  console.log("PASS Beehiiv published-post API access");
  console.log(`Published posts returned: ${posts.length}; with free web content: ${posts.filter((post) => Boolean(post.content?.free?.web)).length}`);
  console.log("Read-only check: no subscribers changed or emails sent. Empty results leave article rendering pending.");
} catch (error) {
  console.error(error instanceof BeehiivApiError
    ? `Beehiiv read check failed: HTTP ${error.status}`
    : `Beehiiv read check failed: ${error instanceof Error ? error.name : "network failure"}`);
  process.exitCode = 1;
}
