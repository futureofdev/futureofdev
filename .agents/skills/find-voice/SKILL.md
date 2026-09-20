---
name: find-voice
description: Analyse Future of Dev's shipped writing and refresh the repository voice profile when asked to find, rebuild or update the brand voice, or when the profile is stale before a substantial drafting run.
---

# Build the Future of Dev voice profile

Refresh `voice.md` from evidence in the published corpus. Do not treat a generic
writing checklist as stronger evidence than repeated, intentional patterns in
the work.

## Collect

Read the relevant prose rather than skimming component code:

- literal public copy in `apps/web/src/pages/*.astro`;
- published long-form prose in
  `apps/web/src/content/legacy-insights/*.json`, joining Portable Text block
  children in order;
- site-owned course copy in `apps/web/src/content/courses/*.md`;
- canonical positioning in `docs/strategy/relaunch-strategy.md`;
- new Beehiiv editions supplied by the user or available through an approved
  private connection.

Do not access a personal directory or external account unless the user puts it
in scope. If a source is unavailable, record that limitation instead of
guessing.

## Analyse

Find patterns specific to the writer and cite internal examples while working:

- register by surface;
- sentence and paragraph rhythm;
- structural devices such as concrete example before abstraction;
- recurring or conspicuously absent vocabulary;
- punctuation and formatting habits;
- differences between Evolve, Enter and Lead framing.

Keep anti-slop phrase bans where the corpus does not depend on them. When a
generic rule conflicts with repeated corpus evidence, preserve the real pattern
and explain the exception in `voice.md`.

## Resolve gaps

Ask only about decisions the corpus cannot answer, such as the register for a
new content surface or a sensitive naming boundary. Do not ask the user to
reconfirm patterns supported by several sources.

## Write and validate

Update `voice.md` in place. Preserve its useful section structure, set the
current build date, list the actual sources and remove stale references.

Draft one short passage for the surface that prompted the refresh. Score it
against the profile's five-part rubric and show the passage and score to the
user. If it misses, fix the rule that caused the mismatch before treating the
profile as ready.

Re-run only after meaningful corpus growth, a demonstrated voice mismatch or a
new surface whose register is unresolved.
