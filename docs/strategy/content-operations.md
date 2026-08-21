# Website copy operations

Future of Dev keeps editorial copy in the repository so every change can be
reviewed, tested and reverted. Layout, analytics and dynamic data stay in code;
the words live in named content sources.

## Copy map

| Surface | Edit here | Notes |
| --- | --- | --- |
| Navigation and homepage | `apps/web/src/content/site.ts` | One source for labels, homepage sections, calls to action and SEO copy |
| Course positioning and quickstart | `apps/web/src/content/courses/*.md` | Counts and course facts are derived from the course source |
| Downloaded course instructions | `courses/coding-bootcamp/README.md` | Keep Codex and Claude Code commands aligned with the bundled skills |
| Learn overview | `apps/web/src/pages/learning/index.astro` | Static overview copy; course cards come from the course content collection |
| About | `apps/web/src/pages/about.astro` | Factual founder and purpose copy |
| Insights overview | `apps/web/src/pages/insights/index.astro` | Archive framing only |
| Newsletter editions and new insights | Beehiiv | The website renders published editions at their canonical insight URL |
| Pre-Beehiiv archive | `apps/web/src/content/legacy-insights/` | Historical source; do not rewrite it during routine site edits |
| Privacy and unsubscribe | Their files under `apps/web/src/pages/` | Operational or legal copy; verify behaviour as well as wording |

Do not edit `apps/web/dist`, generated Astro data, or the HTML brand references
to change the live website. They are outputs or design references, not copy
sources.

## Editing workflow

1. Read `voice.md`, or ask Codex to use `$write-in-voice` for the change.
2. Name the page, audience and one action the copy should make clearer.
3. Edit the source in the map above. Keep dynamic facts such as course counts
   out of authored copy.
4. Review for directness, useful specificity, unsupported claims, fear-based
   framing, filler and the stop phrases in `voice.md`.
5. Run the site type check and production build before review.
6. Include the copy change in a pull request. Publishing or deployment still
   requires separate approval.

## Request pattern for Codex

Use a brief such as:

> Use `$write-in-voice` to revise the homepage section named “What you get” for
> the Evolve audience. Keep the layout and analytics unchanged. Make the weekly
> reader value clearer, show me the diff, then run the site checks. Do not
> deploy.

This supplies the surface, audience, purpose and change boundary without asking
the editor to know the page implementation.
