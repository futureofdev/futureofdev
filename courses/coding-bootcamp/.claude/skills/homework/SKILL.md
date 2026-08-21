---
name: homework
description: "Use when the learner wants to submit, review or check phase homework for Coding Bootcamp in a Box, including $homework or /homework. Inspects the learner's actual work against the criteria in the phase's final lesson and records a pass only when every stated criterion is demonstrably met."
---

# homework — assess the phase submission

## Scope

Homework sits on the last lesson of a phase — the one marked `homework: true` in
`course.yaml`. Its criteria live in that lesson file's homework section. Read them
from the file; do not recall them.

## Assessing

1. Read `course.yaml`, `.course/progress.json` and the phase's homework lesson.
2. Ask the learner where the work is if you do not already know.
3. **Inspect the actual artefact.** Read the files. Run or ask for the exact command
   and its real output. Look at what was built, not at a description of it.
4. Go criterion by criterion. For each, state met or not met, and point at the
   specific evidence — a file and line, a command's output, a rendered result.

## The rule that matters

Record `passed` only when **every** stated criterion is met, with evidence you have
actually seen. Never pass work because the learner says it is finished, because it is
close, or because they are keen to move on. A pass that was not earned makes every
later lesson harder, because the phase after this one assumes this one worked.

When something is not met, be specific and kind: name the criterion, show what you
saw, and give the smallest next step that would fix it. Then invite them back.

## Recording

On a pass, set the phase's entry in `homework` to passed with the date, and advance
`current_phase` and `current_lesson` to the first lesson of the next phase in
`course.yaml`. On a fail, change nothing except telling them what to fix.
