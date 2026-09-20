# Future of Dev strategy

This directory is the canonical strategy source for the Future of Dev relaunch.
It replaces the two August 2026 Word working drafts that previously lived in
the repository.

## Documents

- [`relaunch-strategy.md`](relaunch-strategy.md) defines the audience,
  positioning, publishing model, growth approach and commercial sequence.
- [`course-catalogue.md`](course-catalogue.md) defines the directional
  AI-native course catalogue and its curriculum principles.
- [`measurement.md`](measurement.md) defines the private weekly review,
  metrics and decision rules.
- [`seo.md`](seo.md) maps search intent to canonical pages and defines the
  technical SEO release checks.
- [`relaunch-runbook.md`](relaunch-runbook.md) covers the account-side and
  operational launch checks that cannot be completed by the repository build.
- [`content-operations.md`](content-operations.md) maps every public copy source
  and defines the edit, voice-review and verification workflow.

## Decision register

These decisions resolve conflicts between the former strategy and catalogue
working drafts:

1. The newsletter is the product and the website is its archive and conversion
   layer.
2. Evolve is the primary launch audience. Enter is the growth audience. Lead is
   a later expansion audience.
3. The relaunch has no committed date or weekday. Publishing is weekly once the
   readiness gates below are met.
4. Four complete newsletter editions must be banked before the public relaunch.
5. Two catalogue courses must be built and validated before a recurring course
   cadence is announced.
6. The 31-course catalogue is a curriculum direction, not a dated public
   promise.
7. Coding Bootcamp in a Box is a separate Enter on-ramp. It is not one of the
   31 AI-native catalogue courses.
8. Each newsletter release has one required founder-led LinkedIn post with a
   source-specific UTM link. Other social output is optional.
9. Results and raw exports stay private. Metric definitions, collection
   contracts and report templates belong in the repository.
10. Coding Bootcamp in a Box uses the publicly installable Skilling CLI at
    relaunch. Skilling launches as a pinned public preview, not as a stable v1
    claim. The signed Future of Dev download remains the course-acquisition path;
    Skilling initialises the learner workspace, installs the host skills and owns
    progress after download.

## Relaunch readiness

The relaunch can be scheduled only when all of these are true:

- Four complete issues are ready to publish.
- Beehiiv sending, signup, unsubscribe and suppression flows pass the runbook.
- Consent-gated PostHog measurement passes the privacy checks.
- Redirects, canonical URLs, sitemap, RSS and structured data pass the SEO
  checks.
- The site passes lint, type checks, tests, the production build and the local
  course validator.
- A pinned public Skilling CLI release can initialise and deliver a real signed
  Coding Bootcamp download through every compatibility path claimed on the site.
- The weekly growth review has completed one manual dry run using non-sensitive
  fixtures or private exports.

The recurring catalogue cadence has a separate gate: two AI-native catalogue
courses must be complete and validated. Coding Bootcamp in a Box does not count
towards that gate.

## Source precedence

When documents disagree, use this order:

1. This decision register.
2. The other Markdown documents in this directory.
3. Shipped product behaviour and tested operational evidence.
4. Historical working drafts and design references.

Dates from the former Word drafts are historical planning assumptions only.
They must not be repeated as commitments in product copy, metadata, publishing
automation or external communication.
