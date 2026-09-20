---
name: progress
description: "Use when the learner asks how far through the Coding Bootcamp in a Box course they are, including $progress or /progress. Reports completed lessons, per-phase totals and what comes next, computing every number from course.yaml and .course/progress.json at the moment it is asked."
---

# progress — report where the learner is

## Read first, then count

1. Read `course.yaml` from the course root.
2. Read `.course/progress.json` from the learner's project. If it is missing, say the
   course has not been started and point them at `$learn` in Codex or `/learn` in
   Claude Code. That is a normal empty
   state, not an error.

**Derive every number at print time.** Total lessons is the sum of the lessons in
`course.yaml`; completed is the length of `completed`. Never carry a count over from
earlier in the conversation and never read a total out of a file that claims one.

## What to report

- Overall: lessons completed out of the derived total, and the percentage.
- Per phase: name, completed out of that phase's lesson count, and whether its
  homework has passed.
- Next up: the current phase and lesson title, taken from `course.yaml`.

A compact table or a set of short lines is fine. Keep it scannable — this is a status
check, not a lesson.

## Honesty rules

- A lesson counts as complete only if it is in `completed`.
- Homework counts as passed only if `homework` records it as passed.
- If progress and the manifest disagree — a completed lesson that no longer exists,
  or a course version mismatch — say so plainly and explain what changed. Do not
  quietly repair the file.
