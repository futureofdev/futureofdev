# Future of Dev — Voice

The voice for everything Future of Dev publishes: newsletter editions, insights
articles, site and product copy, social posts. Built from what's actually
shipped, not from a style guide written in the abstract.

This file is rebuilt by the `find-voice` skill and applied by the
`write-in-voice` skill in `.agents/skills/`. Re-run
`find-voice` as the corpus grows — don't hand-edit this file into staleness.

**Last built**: 2026-08-21
**Primary sources**: `apps/web/src/content/site.ts` (shipped homepage copy),
`apps/web/src/content/legacy-insights/skill-based-learning.json` (published
insight article), `docs/strategy/relaunch-strategy.md` and `AGENTS.md`.
**Secondary source used in the previous pass**: Luke's pre-consolidation
LinkedIn corpus, used for rhythm and stance rather than topics.

---

## Who's speaking

**First person. "I", not "we" or a faceless brand voice.** Future of Dev is
Luke Hennerley writing from practice, not a company blog. This is a deliberate
carry-over from the personal-branding voice ("I've built this", "here's what
I'd do differently") — it's being redirected at Future of Dev topics, not
retired.

**Register by surface** — the shipped site currently uses an impersonal,
imperative register ("Understand, learn, build.", "Written from practice, not
from the sidelines.") because hero/nav/CTA copy is product copy, not authored
prose. Keep that distinction:

| Surface | Register |
|---|---|
| Newsletter editions, insights deep-dives | First person. Luke narrating from real building/teaching experience. |
| Founder-led LinkedIn posts | First person. Useful on their own, grounded in the associated edition or artefact. |
| Site/product copy — hero, nav, CTAs, buttons | Impersonal, imperative, declarative. No narrator pronoun. |
| About / founder framing | Third person, factual (`"Future of Dev was founded by Luke Hennerley, a product and technology practitioner..."`) |

## Audience

Lead with professionals evolving in existing digital roles. They are the
primary launch audience. Students, graduates, career changers and early-career
practitioners entering the industry are the growth audience. Managers,
educators and senior practitioners shaping standards are the later Lead
audience.

Not a technologist showing off for other technologists. Not a consultant
writing for a boardroom. Keep the work close enough to practice that an Enter
reader can follow it and an experienced Evolve reader still gains a useful
decision or method.

Test before publishing: would a self-taught junior three months into learning
follow every sentence? Would a senior engineer find it too thin? Both need to
walk away with something.

## Positioning

Practitioner, not commentator. Every claim traces back to something built,
taught, or observed directly — the course, the curriculum design, the actual
mechanics of teaching with AI. "Written from practice, not from the
sidelines" (index.astro) is the whole stance in one line.

- **Vendor-neutral** except where compatibility has genuinely been tested and
  is stated explicitly (`AGENTS.md`, repo-wide rule that applies to voice too).
- **No fear-based career marketing.** The manifesto is explicit: "Interpret
  change without resorting to fear-based career marketing." State what's
  changing and why it matters; don't manufacture panic to drive urgency.
- **Practical over theoretical.** Every idea should resolve into something the
  reader can do, check, or build — not just something to think about.

## Sentence rhythm and structure

Patterns confirmed across the live corpus (index.astro, the skill-based-learning
article):

- **Short declarative fragments as rhythm, especially as closers.**
  `"That's not a chatbot anymore."` `"That's the shift. And it's already
  happening."` `"Understand, learn, build."` This is deliberate house style —
  **it does not follow the generic AI-writing advice to avoid sentence
  fragments.** The evidence overrides the generic rule: fragments are fine
  when they land a real point, not when they're padding for drama.
- **Parallel triads for structure and closers**, especially at section
  boundaries: `"Understand, learn, build."` `"structure, accountability,
  feedback, a tangible output"`.
- **Contrast pairs used sparingly, on real content, not as a formula.**
  `"Not theory. Not best practices. Specific situations that people have
  experienced firsthand."` `"This isn't a replacement for community or
  mentorship. It's an answer to a different question..."` Fine when both
  sides are concrete. Becomes a tic if every paragraph does it — don't reach
  for it by default.
- **Concrete scenario before abstraction.** Open with a specific situation
  ("I asked Claude to help plan a new feature...", the production-incident
  blockquote in skill-based-learning) before naming the general principle.
  The example is the argument, not decoration for it.
- **Before/after and old-way/new-way contrast** to explain a shift: "Before
  Skills, you had to tell AI exactly what to do... With Skills, AI knows how
  to do entire jobs."
- **One clear takeaway, not several.** Each piece should resolve to one thing
  the reader could do or think differently — not a list of five.

## Vocabulary and phrasing — cut on sight

Adapted from the stop-slop anti-AI-slop checklist
(github.com/hardikpandya/stop-slop), kept where it doesn't contradict the
corpus above, applied as a hard filter before any draft ships.

**Throat-clearing openers** — state the point, don't announce it:
"Here's the thing:", "Here's what/this/that [X]", "The uncomfortable truth
is", "It turns out", "Let me be clear", "The truth is,", "I'll say it again:".

**Emphasis crutches that add nothing:**
"Full stop." / "Period.", "Let that sink in.", "This matters because",
"Make no mistake".

**Business jargon → plain language:**

| Avoid | Use instead |
|---|---|
| Navigate (challenges) | Handle, address |
| Unpack (analysis) | Explain, examine |
| Lean into | Accept, embrace |
| Landscape (context) | Situation, field |
| Game-changer | Significant, important |
| Deep dive | Analysis, examination |
| Moving forward | Next, from now |
| Circle back | Return to, revisit |
| Unlock, robust, seamless, revolutionise, transform | (name the specific outcome instead) |

**Adverbs — kill on sight.** No "really", "just", "literally", "honestly",
"simply", "actually", "fundamentally", "inevitably", "importantly", "crucially".
Also cut "at its core", "at the end of the day", "when it comes to", "the
reality is".

**Meta-commentary about the writing itself** — the piece should move, not
narrate its own structure: "Hint:", "Let me walk you through...", "In this
section, we'll...", "As we'll see...".

**Vague declaratives** — a sentence that announces significance without
naming the specific thing is dead weight. `"The implications are
significant"` → say what the implication actually is. `"This is genuinely
hard"` → show what makes it hard.

## Punctuation and formatting

- **No em dashes, ever.** Confirmed absent across the current corpus. Use a
  period, comma, or parenthesis instead.
- Sentence fragments: allowed and used deliberately (see Sentence rhythm
  above) — don't "fix" them into complete sentences.
- Numbers and specifics stay concrete: real percentages, real timeframes, real
  phase/lesson counts pulled from source-of-truth data (per `AGENTS.md`, course
  counts are never hand-authored — they're derived at build time).

## Hard rules

- Every post names something real: a product, a protocol, a tool, a specific
  moment or number. No floating abstractions.
- Translate every technical term the first time it's used — assume no prior
  knowledge, but never talk down.
- Vendor-neutral except where compatibility is genuinely tested and stated
  explicitly (repo-wide `AGENTS.md` rule).
- No placeholder testimonials — ever, in any draft (brand rule, `AGENTS.md`).
- No hype, no manufactured urgency, no fear-based career marketing.

## What Future of Dev doesn't write

- Generic AI commentary anyone could write.
- Hot takes on every release with no grounding in something built or taught.
- Technical specs with no translation to what the reader should do.
- Anything requiring prior technical knowledge to follow.

## Evaluation rubric

Score any draft 1–10 on each dimension before it ships (adapted from
stop-slop). Below 35/50, revise:

- **Directness** — does it state the point instead of announcing it?
- **Rhythm** — does sentence length vary; do fragments earn their place?
- **Trust** — does it state facts and let the reader draw conclusions, or does
  it oversell?
- **Authenticity** — could this have come from anyone, or is it grounded in
  something specifically built or taught?
- **Density** — is every sentence carrying information, or is some of it
  filler?

## Open questions for the next `find-voice` pass

Flag rather than guess — resolve with the user next time the skill runs:

- Pull newer newsletter editions into the corpus once several have shipped via
  Beehiiv; until then the legacy-insights export remains the long-form sample.
- Whether to name Sidetrade directly in FoD pieces (personal-branding banned
  it; FoD's About page already names "product and technology practitioner"
  without the company — unresolved whether that's deliberate or just not yet
  written about).
