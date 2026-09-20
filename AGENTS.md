# Future of Dev repository guidance

Future of Dev is a newsletter-led learning brand positioned as “Learn and build
the AI-native way.” The canonical strategy is in `docs/strategy/`. Read its
decision register before changing launch claims, audience order, publishing
cadence, measurement or the course roadmap.

## Working agreements

- Preserve existing user work. This repository may contain an intentional dirty
  tree during the relaunch.
- Keep public copy vendor-neutral except where compatibility has been tested and
  is stated explicitly.
- Do not deploy, publish an edition, change an external account or expose a
  private result without explicit authorization for that action.
- Raw analytics exports, weekly results, subscriber data, secrets and PII never
  belong in the repository.
- Use source-derived course counts. Never type a lesson, phase, hour or objective
  count into site copy when it can be computed from the course source.

## Commands

```bash
pnpm dev --filter=@futureofdev/web
pnpm lint
pnpm type-check
pnpm test
pnpm build --filter=@futureofdev/web
pnpm validate:course
```

The release gate is lint, type checks, tests, production build and course
validation. The public relaunch also requires the Coding Bootcamp in a Box
delivery path to pass end to end through a pinned, publicly installable Skilling
CLI release. External package availability stays in the operational runbook
rather than the deterministic repository CI gate.

## Architecture

- `apps/web` is an Astro 5 application deployed to Cloudflare Pages.
- Beehiiv is the authoring and subscriber system for new editions.
- Published free Beehiiv posts render canonically at `/insights/{slug}`.
- The immutable pre-Beehiiv export lives in
  `apps/web/src/content/legacy-insights`.
- `courses/coding-bootcamp` is the source for Coding Bootcamp in a Box. The
  private download endpoint bundles this directory.
- `apps/web/src/content/courses/*.md` contains site-owned positioning and
  compatibility copy. Course facts belong in `course.yaml` or lesson
  frontmatter.
- `apps/web/src/content/site.ts` is the single source for navigation and
  homepage copy. Keep editorial words there and structural markup in the Astro
  page.
- Course pages derive counts from `apps/web/src/lib/course-content.ts`.
- Coding Bootcamp in a Box uses Skilling CLI to create the learner workspace,
  install the host skills and own progress. The checked-in `.agents/skills` and
  `.claude/skills` bundles are interim migration sources, not the launch delivery
  architecture; remove them only with the tested Skilling migration.
- Repository operational skills live under `.agents/skills` and follow the
  checked-in `SKILL.md` format.

## Runtime secrets

- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`
- `COURSE_DOWNLOAD_SECRET`
- `ANALYTICS_ID_SECRET`

Client analytics uses `PUBLIC_POSTHOG_KEY` and the EU
`PUBLIC_POSTHOG_HOST`. Never put subscriber emails, names, form values, raw
query strings or private identifiers in URLs, logs, analytics properties,
recordings or error payloads.

## Analytics contract

PostHog runs only after explicit analytics consent. Keep autocapture and session
recording disabled. Use the typed event wrapper in `apps/web/src/lib/analytics.ts`
and only its declared events. The Beehiiv `analytics_id` is a random value used
for the consented identity merge and deletion workflow, never a public tracking
parameter.

The private weekly review follows `docs/strategy/measurement.md` and the
`weekly-growth-review` skill. If unique activated readers cannot be safely
deduplicated, report components and mark the composite not computable.

## Brand rules

Use Archivo, Inter and JetBrains Mono plus the `--fod-*` tokens. Border radius
is always zero. Build lime is a surface with Ink text and appears once per
layout, not as text or decoration.

`apps/web/src/styles/global.css` imports the tokens from
`future-of-dev-brand-v1/04-tokens/tokens.css`, the colour source of truth. Do
not redeclare a brand colour or hard-code a hex value. The only site-level
extensions are the annotated tokens in the `:root` block of `global.css`:
`--fod-error`, `--fod-success`, `--fod-graphite-700` (secondary type on Cloud),
`--fod-muted` (contextual secondary text), the `--fod-on-ink-*` alphas for
text and rules on Ink, and `--fod-measure` for reading columns.

Four rules are easy to break silently:

- On a dark surface, Signal indigo fails contrast. Use `--fod-signal-300` for
  links, labels and icons on `.section-ink`.
- Graphite fails AA on Cloud (4.43:1). Secondary text uses `--fod-muted`, which
  tinted sections switch to `--fod-graphite-700`; never set Graphite directly on
  a Cloud surface.
- A career-stage label pairs an icon and a word, never colour alone. Use
  `StageTag.astro`. Other brand icons render through `Icon.astro`, which inlines
  the SVGs mirrored in `public/brand/icons` from the brand pack.
- Build lime appears once per layout, as a surface with Ink text: the
  `.lime-label` on the homepage Build step, or one `.button-build` on a page
  whose single action is the download or course.

`public/fonts` holds Latin subsets of the pack's variable fonts; regenerate them
from `future-of-dev-brand-v1/05-fonts` with `pyftsubset` rather than editing.
`public/og-default.png` is rendered from the pack (lockup, Archivo, one lime
block) and must never carry pre-relaunch branding or vendor names.

The design reference is
`future-of-dev-brand-v1/01-documents/future-of-dev-beehiiv-target.html`.
Placeholder testimonials in that reference must never ship.

## Voice and content

Read `voice.md` before drafting public copy. Use the repository
`write-in-voice` skill for substantial editions, insights, site copy or social
posts. Use `find-voice` only when the corpus has grown or the profile is stale.
Do not turn directional catalogue ideas or historical dates into public
commitments.

## Compatibility and redirects

Keep historic `/claude-academy` links working through a single permanent
redirect that preserves query parameters. Keep the legacy unsubscribe format
working through the compatibility window in the runbook, but never expose an
email-derived token in the browser-visible confirmation URL.
