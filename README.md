# Future of Dev

The Astro and Cloudflare site for Future of Dev: a newsletter-led learning brand
with the positioning “Learn and build the AI-native way.”

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev --filter=@futureofdev/web
```

The site renders published free Beehiiv editions under `/insights`, keeps the
pre-Beehiiv article export in the repository, and serves Coding Bootcamp in a
Box through a signed subscriber download.

## Courses

`courses/coding-bootcamp` is the source for Coding Bootcamp in a Box, written in
the [Skilling](https://startskill.ing) course format. It is the source the site
reads and the source the download bundles.

```bash
pnpm validate:course
```

Course pages derive every count from that source at build time, so adding a
lesson updates the site on its own. Site-owned copy — positioning, page copy,
tested agents — lives in `apps/web/src/content/courses/*.md`.

The public mirror at [futureofdev/courses](https://github.com/futureofdev/courses)
is not yet on this structure; migrating it, and then switching the site's source
from this folder to that repository, is tracked as its own issue.

The [strategy index](docs/strategy/README.md) is the canonical source for
audience, launch readiness, the directional catalogue and measurement. See the
[relaunch runbook](docs/strategy/relaunch-runbook.md) for account-side Beehiiv,
subscriber migration, analytics and cutover checks.

For copy changes, use the [website copy operations map](docs/strategy/content-operations.md).
Navigation and homepage copy live together in `apps/web/src/content/site.ts`;
course positioning lives in `apps/web/src/content/courses/*.md`.

Repository instructions live in [`AGENTS.md`](AGENTS.md). Repeatable editorial
and growth workflows live in `.agents/skills/` for Codex.
