import assert from "node:assert/strict";
import { test } from "node:test";
import { formatEditionDate, splitTags } from "./tags";

test("splitTags separates career stages from topics, case-insensitively", () => {
  const result = splitTags(["Evolve", "Skills", "evolve", "Lead", "skills", " "]);
  assert.deepEqual(result.stages, ["evolve", "lead"]);
  assert.deepEqual(result.topics, ["Skills"]);
});

test("splitTags tolerates missing tags", () => {
  assert.deepEqual(splitTags(undefined), { stages: [], topics: [] });
  assert.deepEqual(splitTags([]), { stages: [], topics: [] });
});

test("formatEditionDate uses en-GB day-month-year", () => {
  assert.equal(formatEditionDate("2026-02-22T17:00:00.000Z"), "22 Feb 2026");
  assert.equal(formatEditionDate("2026-02-22T17:00:00.000Z", "long"), "22 February 2026");
});
