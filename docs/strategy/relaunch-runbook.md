# Future of Dev relaunch runbook

This runbook covers account and operational changes that the repository build
cannot complete. Record the operator, date and private evidence beside each
item. Do not commit credentials, exports, subscriber-level data or screenshots
that expose account information.

## Readiness gate

- Four complete newsletter editions are banked.
- One LinkedIn post with a correctly tagged canonical link is ready for each
  edition.
- The repository release gate passes.
- The account-side checks below have an operator and evidence.
- A private weekly growth-review dry run has completed.

Do not set the public relaunch date or weekday until this gate passes.

## Beehiiv publication

- Confirm the plan's subscriber allowance is above the reconciled active count;
  upgrade before cutover if it is not.
- Configure `newsletter.futureofdev.com` and complete every sending-domain DNS
  authentication check.
- Upload `future-of-dev-brand-v1/02-logo/png/fod-email-masthead-light@2x.png`
  with alt text “Future of Dev”. Apply the values in
  `future-of-dev-brand-v1/04-tokens/beehiiv-settings.md`.
- Create a string custom field named exactly `analytics_id`.
- Use explicit single opt-in, working preference pages and Beehiiv's native
  unsubscribe block.
- Keep signup welcome emails and course-delivery automations disabled while the
  site returns the signed bootcamp download directly after a successful
  subscription.
- Save a weekly template with these blocks in order: The Shift, Why It Matters,
  Learn, Build, Keep and Go Deeper. Lime appears only on Build.
- Disable the Beehiiv-hosted archive or set every archive/post canonical to the
  matching `https://futureofdev.com/insights/{slug}` and prevent duplicate
  indexing.
- Test Gmail, Outlook desktop, Apple Mail, dark mode, images disabled and a
  375px viewport before the relaunch send.

## Subscriber migration

Export contacts from the Resend dashboard. Store dated source and suppression
exports outside this repository.

1. Exclude unsubscribed, bounced, complained, invalid and suppressed records.
2. Normalise and deduplicate email addresses. Never reactivate a suppressed
   record during import.
3. Generate a cryptographically random UUID for `analytics_id` on every active
   row and import that custom field with the email.
4. Record source-active, source-suppressed, duplicate, imported and rejected
   counts. The equation must reconcile exactly.
5. Test a new, active imported, inactive and intentionally resubscribing
   address.
6. Keep Resend account data read-only for 30 days after the actual relaunch.
   Then delete its API keys and domain configuration.

## Cloudflare runtime

Set these as encrypted runtime secrets, never public or build-time variables:

```text
BEEHIIV_API_KEY
BEEHIIV_PUBLICATION_ID
COURSE_DOWNLOAD_SECRET
ANALYTICS_ID_SECRET
```

Use at least 32 random bytes for each signing secret. Set
`PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` and the public project key as a
normal environment variable.

Create a Cloudflare edge rate-limit rule for `POST /api/newsletter`. The
application deliberately does not claim a process-local map is durable
protection in a distributed runtime. Start with a conservative per-IP threshold,
monitor false positives and keep Beehiiv's upstream `429` response intact.

Verify the newsletter endpoint, duplicate signup, invalid origin, oversized
body, upstream timeout, upstream rate limit and an expired download token.

## PostHog privacy controls

- Install and connect the official PostHog Codex plugin for private operational
  analysis. Do not put project keys or personal API keys in the repository.
- Confirm the project is in PostHog Cloud EU.
- Enable IP discard and keep session recording, form autocapture and general
  autocapture disabled.
- Set event retention to 12 months and restrict project access to required
  operators.
- Search recent event properties for `@`, `email`, form values and query
  strings after every signup-flow change. The expected result is none.
- Test an anonymous consented journey followed by signup: earlier activity must
  merge into the returned UUID profile.
- Repeat without consent: no PostHog request or person should be created.

## Search Console and LinkedIn

- Grant the weekly review a read-only Search Console credential with access only
  to the Future of Dev property.
- Confirm the property, canonical domain and sitemap are current.
- Export LinkedIn Page analytics as XLS or CSV after each complete week. Store
  it outside the repository and pass only the required aggregate file to the
  private review.
- Use `utm_source=linkedin`, `utm_medium=social` and an issue-specific
  `utm_campaign` value on every required founder post.

## Data deletion

1. Verify the requester and find the Beehiiv subscription.
2. Copy its `analytics_id` for the private deletion audit record. Do not put the
   email in PostHog searches or tickets.
3. Delete or anonymise the Beehiiv subscriber as applicable, preserving only a
   lawful suppression record.
4. Delete the matching PostHog person and associated events by `analytics_id`.
5. Record completion, systems checked and operator without retaining the email
   in general analytics or engineering logs.

## Course download

- Run the repository's local course validator after any course change.
- Confirm the built worker contains all course files and both runtime skill
  bundles. A zip with lessons but no skills breaks the learner setup.
- Unzip a real download and confirm `$learn` works in Codex from a clean
  directory.
- Also test the documented Claude Code path while it remains a supported
  learner runtime.
- Replace the bundled interim runtime only when the Skilling CLI is available
  and the migration has been tested. Its future availability is not a release
  gate today.

## SEO cutover

- Request `/claude-academy`, the historic course URLs and trailing-slash
  variants. Each must return one permanent redirect and retain query strings.
- Specifically test
  `/claude-academy/coding-bootcamp-in-a-box?utm_source=chatgpt.com`; it must land
  directly on the flagship URL with the UTM value intact.
- Inspect canonical tags, Article/Course JSON-LD, `/sitemap.xml`, `/rss.xml` and
  `robots.txt` after deployment.
- Submit the sitemap and inspect indexing only after the production deploy. The
  repository release gate does not authorise a deploy.

## Legacy unsubscribe retirement

Historic unsubscribe links must continue to resolve through the compatibility
endpoint during relaunch. Confirm that the browser-visible confirmation URL no
longer contains an email-derived token. Remove the legacy format no earlier than
30 days after the actual relaunch and only after support evidence shows the old
links are no longer needed.
