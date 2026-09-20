import assert from "node:assert/strict";
import test from "node:test";
import { toCourseOutlineItems } from "./course-outline";

test("course outline keeps homework status separate from the lesson title", () => {
  assert.deepEqual(
    toCourseOutlineItems([
      { number: 8, title: "JavaScript Mini-Project", homework: true },
      { number: 9, title: "Review and reflect" },
    ]),
    [
      { numberLabel: "08", title: "JavaScript Mini-Project", homeworkLabel: "Homework" },
      { numberLabel: "09", title: "Review and reflect", homeworkLabel: null },
    ],
  );
});
