# Coding Bootcamp in a Box

Go from no development environment at all to a portfolio site you built and
deployed yourself. Free, self-paced, and yours to keep.

---

## Start here with Codex or Claude Code

Choose the coding agent you already use. The course includes a matching tutor
skill for both, so you do not need the Skilling CLI, a course-specific install
or a separate API key.

### Codex

**1. Open this folder in Codex.**

```bash
cd coding-bootcamp-in-a-box
codex
```

**2. Type `$learn`.**

Codex finds the tutor skills in `.agents/skills/`, asks where you want to build
your project, and teaches the first lesson.

### Claude Code

**1. Open this folder in Claude Code.**

```bash
cd coding-bootcamp-in-a-box
claude
```

**2. Type `/learn`.**

Claude Code finds the matching tutor skills in `.claude/skills/`, asks where
you want to build your project, and teaches the same first lesson.

Both agents read the same `course.yaml` and lesson files. Pick one for a course
session so there is one tutor writing to your local progress record.

### The three commands

| Command | What it does |
| --- | --- |
| `$learn` or `/learn` | Teach the next lesson. Start here, and use it every time you come back. |
| `$progress` or `/progress` | Show how far through you are and what is next. |
| `$homework` or `/homework` | Submit a phase's homework for review. |

### Coming back later

Run `$learn` in Codex or `/learn` in Claude Code again. Your place is saved in
`.course/progress.json` inside your own project, so you can close everything
and pick up where you left off—even if you resume with the other supported
agent later.

Other Agent Skills hosts may be able to read `.agents/skills/`, but only the
support status published on
[futureofdev.com/learning](https://futureofdev.com/learning) is a compatibility
claim.

---

## What you will build

A responsive portfolio site, built and deployed by you, using a terminal, Git,
HTML, CSS, JavaScript, React, Astro and Tailwind CSS.

Every phase ends with homework that your tutor checks against the work itself,
not against your word for it. The phase and lesson index in `course.yaml` is the
source of truth.

Start at Phase 0 even if you think you know some of it. Phase 0 is what makes
the rest of the course work on your machine.

## What is in this folder

| Path | What it is |
| --- | --- |
| `course.yaml` | The manifest: phases, lessons, tutor persona. The source of every count. |
| `phases/` | The lessons themselves, as markdown. |
| `COURSE.md` | How a tutor should teach this course. Read it if you are curious. |
| `.agents/skills/` | The `$learn`, `$progress` and `$homework` skills for Codex and Agent Skills hosts. |
| `.claude/skills/` | The matching `/learn`, `/progress` and `/homework` skills for Claude Code. |

## Licence

The course content is CC BY 4.0 — keep it, adapt it, teach it, share it. Please
keep the attribution to Future of Dev.

## About the format

This course is written in the [Skilling](https://startskill.ing) format: an open
standard for AI-tutored courses. The lessons are plain markdown with structured
objectives, so the course is not tied to any one tutor or vendor.

When the Skilling command line ships, the setup above becomes a single
`skilling install`, and the two runtime-specific skill bundles can go away. The
lessons do not change.
