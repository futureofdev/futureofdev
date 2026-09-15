# Launch Readiness: Copy & SEO Audit

**Status:** Analysis complete. Brief/catalogue merge **blocked** — see §1.
**Scope:** All user-facing copy and SEO surface in `apps/web`, plus the Sanity schemas that
feed them. Findings below were verified against the source and a real production build
(`pnpm build --filter=@futureofdev/web`), not inferred.

---

## 1. Blocker: source documents not available

The merge depends on three documents that are not in this repo and not reachable from the
build environment:

| Document | Needed for |
|---|---|
| `future-of-dev-launch-seo-brief.md` | Keyword targets, the **"meaning of dev"** positioning decision, page-level SEO intent |
| `Future_of_Dev_Strategy_GTM_and_Design_Brief.docx` (brand v1.3) | Voice, tone, brand vocabulary, approved boilerplate |
| `Future_of_Dev_Catalogue_and_Launch_Plan.docx` | Course/content catalogue, launch sequencing, what ships day one |

They were referenced as local paths (`/Users/.../Downloads/...`). This session runs in a
remote container with a fresh clone, so it has no access to that filesystem, and a Notion
search for them returned nothing.

**To unblock:** commit them under `docs/brand/` (preferred — they become versioned inputs),
or paste their contents into the session.

Once they land, §2 below is the merge surface: every string that would need to change is
already inventoried with its file and line, so applying the brief is mechanical rather than
a re-discovery exercise.

---

## 2. Copy inventory — the merge surface

Everything a visitor can read, and where it lives.

### 2.1 Positioning strings (the highest-value merge targets)

| String | Source | Location |
|---|---|---|
| `Future of Dev` (H1) | Sanity `homepage.title`, fallback hardcoded | `pages/index.astro:22` |
| `AI is Changing Software Development — Forever.` | Sanity `homepage.tagline`, fallback hardcoded | `pages/index.astro:23` |
| `Free Agentic Development News, Courses & Insights` | Sanity `homepage.seo.title`, fallback hardcoded | `pages/index.astro:24` |
| `Home to Claude Academy — free AI-powered coding bootcamps, career insights, and practical guides to help developers navigate the future of Agentic Development.` | Sanity `homepage.seo.description`, fallback hardcoded | `pages/index.astro:25` |
| `Navigate the AI-Driven Future of Software Careers` | Default meta description for every page that passes none | `layouts/LandingLayout.astro:13` |
| `The Future of Developer Experience` | Default meta description — **dead file, see §4.1** | `layouts/BaseLayout.astro:10` |
| `Free agentic development news, courses and insights. Helping developers navigate the AI-driven future.` | Organization JSON-LD | `layouts/LandingLayout.astro:64` |
| Manifesto (3 lines) + Mission (3 lines) | Sanity `homepage.sections`, fallback hardcoded | `pages/index.astro:27-45` |

### 2.2 Claude Academy

| String | Location |
|---|---|
| `Claude Academy — Free Courses with Claude` (title) | `pages/claude-academy.astro:23` |
| `Free, open-source courses where Claude is your teacher. Learn to code, master AI workflows, and build real things — whatever your starting point.` | `pages/claude-academy.astro:24` |
| `Learn with Claude` (H1) | `pages/claude-academy.astro:49` |
| `Completely free, and open-source courses with Claude as your teacher. Build real things & future proof your career.` | `pages/claude-academy.astro:52` |
| Licence legend (3 lines) | `pages/claude-academy.astro:61-67` |
| `Skill-based learning` section (3 paragraphs) | `pages/claude-academy.astro:229-241` |
| `What Claude Academy covers` — 7 cards | `pages/claude-academy.astro:245-262` |
| `How it works` section (3 paragraphs) | `pages/claude-academy.astro:266-278` |
| Homepage Academy card: `Free, open-source AI-powered bootcamps. Helping you to upskill & keep up with AI, no matter your level.` | `pages/index.astro:106` |

### 2.3 Conversion & system microcopy

| String | Location |
|---|---|
| `Impactful news, insights and courses — straight to your inbox. No spam, unsubscribe any time.` | `pages/index.astro:121` |
| `Get notified when new courses drop` / `We're building courses across every area…` | `pages/claude-academy.astro:76-77` |
| `Thanks for subscribing — welcome to the community!` | `pages/index.astro:256` |
| `You're subscribed! We'll let you know when the next course drops.` | `pages/claude-academy.astro:361` |
| `We're working on it. Drop your email and we'll let you know the moment it's ready.` | `pages/claude-academy/[slug].astro:118` |
| 404 page copy | `pages/404.astro` |
| Footer attribution, ©, privacy link | `layouts/LandingLayout.astro:93-131` |

---

## 3. Copy quality — launch readiness

Graded against the PRD in `docs/pages/landing.md`.

### 3.1 The central problem: "dev" means two different things

This is the one to settle before any other copy work, and it's the same tension flagged in
the SEO brief.

**Every user-facing string sells to developers:**
- "…to help **developers** navigate the future of Agentic Development"
- "Helping **developers** navigate the AI-driven future"
- "AI is Changing **Software Development** — Forever."
- "AI isn't coming for your job — but **developers** who understand AI will replace those who don't."

**But the PRD and the Academy's own syllabus sell to the whole lifecycle:**
- PRD audience: "All roles in software development lifecycle (PMs, QA, UX/UI, DevOps, BAs)"
- PRD note: "Keep copy **inclusive for all roles** in the software lifecycle"
- Academy's 7 coverage cards include **Product management**, **Data & analytics**,
  **Design & content** — three of seven are explicitly non-engineering

A PM who arrives on the homepage is told four times that this is for developers, then
scrolls to a course list that includes product management. The positioning and the product
disagree. Pick one and propagate:

- **(a) "Dev" = software developers.** Narrow, sharper keyword story, better conversion per
  visit. Requires cutting or rehoming the PM/data/design courses.
- **(b) "Dev" = everyone who builds software.** Matches the PRD and the actual catalogue,
  larger TAM, but "Future of Dev" then needs an explicit gloss on the homepage — the name
  reads as engineering-only otherwise, and no current copy does that work.

Recommendation: **(b)**, with a one-line gloss directly under the H1 — the catalogue has
already voted, and today's copy is the thing that's out of step. Confirm against the brief.

### 3.2 Launch-blocking contradictions

1. **Licence contradiction on one page.** The legend says *"**Pro license** — requires Claude
   Pro. Needed for courses that use Claude Code or Claude Cowork."*
   (`claude-academy.astro:67`). Later on the same page: *"**No licence required.** Anthropic made
   Skills free on all plans. All you need is a Claude account — free or paid."*
   (`claude-academy.astro:235`). Both are on the Academy page. A visitor cannot tell whether
   they need to pay. Fix before launch.

2. **"Bootcamp" vs "course".** The homepage card and homepage meta description both promise
   *bootcamps*; `CLAUDE.md` calls it "a completely free, open-source coding bootcamp". The
   Academy page itself uses the word **zero times** — it's a filterable course list. The
   promise and the destination don't match. Pick one noun.

3. **Fear framing vs stated values.** Manifesto line 2: *"AI isn't coming for your job — but
   developers who understand AI will replace those who don't."* Line 3: *"We believe in
   adaptation over **fear**…"*. The line that precedes the value statement is the fear
   appeal. It's the most quotable line on the site; it just needs to not sit three lines
   above its own rebuttal.

4. **Tense confusion.** *"Built for where the market is **heading**. These courses teach you
   to work alongside AI the way real teams **already do**."* Future and present in adjacent
   clauses, making the same claim.

### 3.3 Duplicate content

Two of the seven "What Claude Academy covers" cards are near-identical:

- **Agent Skills** — "Understand how agents work and create workflows that handle the
  repetitive work for you."
- **Agentic workflows** — "Understand how AI agents work and design workflows where they
  handle the repetitive work."

Same sentence twice. Merge them, or give the second a genuinely distinct angle.

### 3.4 Style inconsistencies

| Issue | Detail |
|---|---|
| **UK/US spelling collision** | `license` (legend, `:61`/`:64`/`:67`) and `licence` (`:235`) on the same page. Also `prioritise` (UK) alongside `organization`/Organization (US). |
| **Date locale** | Dates render `en-US` ("Sep 15, 2026") on a `.com` with UK-authored copy. `pages/index.astro`, `pages/insights/[slug].astro`. |
| **Hyphenation** | "future proof your career" (Academy hero) vs "future-proof" (PRD, `CLAUDE.md`). |
| **Footer verb** | "**Created** by Luke Hennerley" (`LandingLayout.astro:128`) vs "**Made** by Luke Hennerley" (`insights/[slug].astro:293`). |
| **Success-message voice** | "welcome to the community!" (homepage) vs "We'll let you know when the next course drops." (Academy) — same action, two voices. |

### 3.5 Unsubstantiated claims

- **"Free, open-source"** appears 5+ times; **"Every lesson is open-source — fork it, remix
  it, share it."** No licence is ever named, and the only repo pointer is
  `github.com/claudeacademy` in the footer/JSON-LD. If that org isn't public and populated on
  day one, the site's most-repeated claim is unsupported. Name a licence (CC-BY / MIT) and
  link the repo from the Academy page, not just the footer icon.
- **"Anthropic made Skills free on all plans"** — a factual claim about a third party,
  stated flatly. Worth a source link or a softer formulation.

### 3.6 Conversion gaps vs the PRD

| PRD requirement | Current state |
|---|---|
| "Use **hero CTA** for highest-priority conversion" | Homepage hero has **no CTA**. Bulb → badge → H1 → tagline → `<hr>`. First action is below the fold. |
| Primary success metric: **webinar sign-ups** | No webinar anywhere on the site. Schema (`homepage.featuredWebinar`), GROQ query, and a `webinar` document type all exist and are wired — the homepage just never renders them (removed in `b182394`). Either restore it or accept that the launch has no webinar funnel. |
| Section F: **social proof / testimonials** | Entirely absent. |
| Newsletter capture | Present, but the value prop is *"Impactful news, insights and courses"*. "Impactful" is self-praise doing no work, and there's no frequency, no sample, no subscriber count. Weak ask for a cold visitor. |
| "Immediately communicate the mission" | Above the fold a visitor gets a bulb, "Future of Dev", and "AI is Changing Software Development — Forever." That's a claim about the world, not an answer to "what is this and what do I get?" The Manifesto/Mission that answer it are two scrolls down. |

---

## 4. Technical SEO findings

All verified against a real build.

### 4.1 High severity

1. **The entire content library is missing from the sitemap.** Every content route is
   `export const prerender = false` (SSR), so `@astrojs/sitemap` — which only emits
   statically-known routes — produces exactly five URLs:

   ```
   /  /claude-academy/  /insights/  /privacy/  /unsubscribe/
   ```

   **Zero insight posts. Zero course pages.** `robots.txt` advertises the sitemap, so this is
   the primary discovery path and it points at nothing. Needs a custom sitemap endpoint that
   queries Sanity for post and course slugs.

2. **There is no insights index page.** `/insights/` is a 2-second `<meta http-equiv="refresh">`
   redirect to `/`, marked `noindex` — and it is submitted in the sitemap anyway (soft error
   in Search Console). So: no crawlable archive, no hub page, no category pages. Posts are
   discoverable only via the **three** most recent links on the homepage; post four onward is
   orphaned the moment it's published. For a content-led SEO launch this is the biggest
   structural gap after the sitemap.

3. **Placeholder analytics token shipping to production.**
   `pages/insights/[slug].astro:300` loads the Cloudflare beacon with
   `data-cf-beacon='{"token": "YOUR_CF_ANALYTICS_TOKEN"}'`. Real token or delete the script.

4. **Post pages diverge from the shared layout.** `insights/[slug].astro` hand-rolls its own
   `<head>`, footer and analytics instead of using `LandingLayout`. Consequences on the pages
   most likely to receive organic traffic:
   - **No cookie-consent banner** (`CookieConsent` is only in `LandingLayout`). PostHog
     correctly falls back to cookieless memory mode, so this isn't a data-protection breach —
     but the privacy policy states *"We only set cookies if you accept the cookie consent
     banner"*, and on these pages there is no banner to accept, so consent can never be given.
   - **No privacy-policy link** in the footer, on a page that runs two analytics scripts.
   - **No Organization JSON-LD.**
   - Footer social set is reduced to Instagram / TikTok / email — X, LinkedIn and GitHub are
     missing.

   Fix by making post pages use `LandingLayout`, which also retires most of §3.4's
   inconsistencies.

5. **Cloudflare Web Analytics is undisclosed.** The privacy page lists Cloudflare only under
   "hosting and delivery" and names PostHog as the analytics provider. The beacon is a second
   analytics tool and needs disclosing (or removing).

### 4.2 Medium severity

6. **Homepage meta description is 176 characters** — truncates around 155–160 in SERPs. The
   tail ("…navigate the future of Agentic Development") is what gets cut, which is where the
   keyword sits.

7. **Homepage title is 63 characters** with the `| Future of Dev` suffix — borderline
   truncation. "Free Agentic Development News, Courses & Insights | Future of Dev".

8. **Course pages have no `Course` JSON-LD.** They are literally free courses competing in a
   query space where Google renders course rich results. Currently they emit only the generic
   Organization node and `og:type="website"`. Adding `Course` + `Offer` (price 0) is the
   single highest-leverage structured-data win available.

9. **No `WebSite` node, no `BreadcrumbList`.** `/claude-academy/[slug]` is two levels deep with
   no breadcrumb markup.

10. **`BlogPosting` JSON-LD omits `dateModified` and `mainEntityOfPage`.** Sanity has `_updatedAt`
    available; it just isn't queried.

11. **`/unsubscribe/` is in the sitemap and is indexable.** Add `noindex`.

12. **Trailing-slash inconsistency.** The sitemap emits `https://futureofdev.com/claude-academy/`
    while canonicals are built from `Astro.url.pathname`, which has no trailing slash. Worth
    confirming against live Cloudflare behaviour and settling one way.

13. **`BaseLayout.astro` is dead code with broken links.** Nothing imports it. It carries a
    third positioning line ("The Future of Developer Experience") and a nav pointing at
    `/blog`, `/about` and `app.futureofdev.com/sign-in` — none of which exist. Delete it so it
    can't be resurrected into a launch page.

---

## 5. Recommended order of work

1. Land the three brief documents in `docs/brand/` (§1).
2. Settle the **"meaning of dev"** decision (§3.1) — it determines every other copy change.
3. Fix the licence contradiction, "bootcamp"/"course" split, and the duplicate card (§3.2, §3.3).
4. Custom Sanity-backed sitemap + a real `/insights` index page (§4.1 items 1–2).
5. Fold post pages into `LandingLayout`; remove the placeholder CF token (§4.1 items 3–4).
6. Decide webinar in/out for launch (§3.6).
7. Structured data: `Course`, `WebSite`, `BreadcrumbList`, `dateModified` (§4.2).
8. Style pass: spelling locale, dates, hyphenation, unify success messages (§3.4).
