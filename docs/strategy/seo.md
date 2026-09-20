# Search and archive strategy

## Role of search

Search is an evergreen discovery channel for the newsletter archive and proven
learning products. It does not set the editorial agenda. Topics earn dedicated
pages when they support the audience promise and have enough original substance
to answer a real query.

## Intent map

| Audience and intent | Canonical surface | Content requirement |
| --- | --- | --- |
| Evolve: understand an AI-native workflow or role shift | `/insights/{slug}` | A clear interpretation, real example and practical action |
| Evolve: learn a durable agent or harness capability | Insight first, then a validated course | Search page must not promise an unbuilt catalogue course |
| Enter: learn web development with an AI tutor | `/learning/coding-bootcamp-in-a-box` | Source-derived scope, supported runtimes and a direct start path |
| Enter: understand Future of Dev learning | `/learning` | Method, available courses and real outcomes |
| Lead: team standards or adoption | Insight until repeated demand exists | No separate commercial landing page without evidence |
| Brand and founder | `/about` | Mission, practitioner credibility and contact path |

The 31-course catalogue is internal direction. Do not generate thin landing
pages for unbuilt course names or include them in the sitemap.

## Canonical rules

- `futureofdev.com` is the canonical host.
- HTTPS and no trailing slash (except `/`) are the canonical URL convention.
  Redirect navigation variants permanently and retain their query parameters;
  canonical, social and sitemap URLs exclude those parameters.
- Free Beehiiv editions render canonically at `/insights/{slug}`.
- The Beehiiv-hosted archive must be disabled or point at the site canonical.
- Historic `/claude-academy` URLs use one permanent redirect to the relevant
  `/learning` URL and preserve query parameters.
- Do not index unsubscribe, API, download-token or error routes.
- Sitemap entries include only public canonical pages and published editions.
- RSS links use the same canonical insight URLs.
- Archive pages contain 20 editions, with crawlable next/previous links and a
  self-canonical URL for each page. The sitemap includes every eligible edition.
- Preview HTML responses are `noindex, nofollow`. Public HTML remains server
  rendered so the middleware's host and indexing rules execute on Cloudflare.
- Missing editions return 404 at the requested URL. Upstream failures return
  503 with `Retry-After` and `no-store` on archive, article and feed routes.
  The homepage remains usable and labels unavailable editions explicitly.

## Metadata and structured data

- Every public page has one absolute canonical URL, unique title and useful
  description.
- Default social metadata uses the checked-in Future of Dev card. A Beehiiv
  edition image may override it when supplied.
- Insight detail pages emit `Article` JSON-LD with published date, author,
  publisher and canonical entity URL.
- Course pages emit `Course` JSON-LD from the course manifest and derived
  statistics.
- The shared layout emits stable `Organization` and `WebSite` entities.
- Represent multiple authors separately and link Luke's byline to his About
  profile. Visible breadcrumbs and their schema use the same canonical paths.
- Lesson counts are not academic credits. Omit sitemap `lastmod` until a real
  modification timestamp is available; publication time is not that evidence.
- Never put a launch date, weekday or directional catalogue promise in metadata.

## Editorial search workflow

1. Start from a reader question inside the approved editorial pillars.
2. Inspect current search results and Search Console evidence when available.
3. Decide whether the answer belongs in an edition, an existing page or no new
   page at all.
4. Write the useful answer first. Map one primary intent and a small set of
   natural supporting phrases afterwards.
5. Link to one relevant next step and to related canonical editions where the
   relationship helps the reader.
6. Review search clicks, click-through rate and downstream action after enough
   data exists. A ranking without qualified action is not success.

## Avoid cannibalisation

- One canonical page owns each course or substantial learning outcome.
- Editions may approach the same capability from different real situations,
  but should link to the strongest durable explainer rather than restating it.
- Merge or redirect thin overlapping pages instead of keeping multiple weak
  answers.
- Tags are navigation metadata, not automatic index pages.
- Do not create location, role or tool variants with only swapped nouns.

## Release checks

Before the foundation release:

- Confirm the canonical, Open Graph and X URLs contain no query string.
- Confirm unavailable Beehiiv responses produce transient 503 feeds rather than
  a successful empty sitemap or RSS. A genuinely empty publication remains 200.
- Validate XML escaping for titles, excerpts and slugs.
- Confirm legacy redirects preserve a UTM query in a single hop.
- Confirm unsubscribe and API routes are absent from the sitemap and the
  confirmation page is `noindex`.
- Validate `Organization`, `Article` and `Course` JSON-LD structurally.
- Confirm `robots.txt` points at the canonical sitemap.

After an authorised production deploy, follow the account-side checks in the
relaunch runbook. Submission and indexing actions are not part of the repository
release gate. See [SEO validation](../development/seo-validation.md) for the
fixture check and the remaining deployment evidence.
