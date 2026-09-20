# Validate the relaunch locally

Run the website on your machine before configuring or deploying the Cloudflare
runtime. Local pages can use the real Beehiiv API, so a signup on localhost
still changes the connected publication. Use an address you control for manual
signup, unsubscribe and resubscription tests. Do not use real subscribers for
testing.

## Local configuration

The Astro configuration loads `.env` from the repository root. Preserve an
existing file and add missing names from `.env.example`. Keep credentials and
subscriber data out of commits, screenshots and chat.

| Variable | Local purpose |
| --- | --- |
| `BEEHIIV_API_KEY` | Beehiiv API access; needed for signup and new editions |
| `BEEHIIV_PUBLICATION_ID` | The intended publication's V2 ID |
| `COURSE_DOWNLOAD_SECRET` | Sign and verify local course download links |
| `ANALYTICS_ID_SECRET` | Sign the legacy unsubscribe confirmation cookie |
| `PUBLIC_POSTHOG_KEY` | Optional public project token; blank disables analytics |
| `PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` |

Generate the two local signing secrets separately with `openssl rand -hex 32`.
They do not need to match production. Changing a signing secret invalidates
links or cookies already signed with the previous value.

Start the server and open the printed local URL:

```bash
pnpm --filter=@futureofdev/web dev --host 127.0.0.1 --port 4321
```

Restart after changing `.env`. Only published Beehiiv editions appear publicly;
historical CMS exports are retained as source material, never as a fallback.
An empty publication, missing credentials or an API outage leaves the edition
list empty. A working homepage alone does not prove that Beehiiv is connected.
Without credentials, signup reports that the service is not configured.

Check the credentials and published-post API access without changing subscribers:

```bash
pnpm --filter=@futureofdev/web check:beehiiv
```

This reports only connection status and post counts, never credentials or
subscriber data. A successful read does not prove write permissions or signup.

## Repeatable checks without subscriber mutations

In another terminal:

```bash
pnpm --filter=@futureofdev/web check:local
```

For a different local port, append its URL. The command rejects non-local hosts.
It checks real HTTP responses for the main pages, canonical tags, feeds,
one-hop historical redirects with attribution intact, invalid newsletter
requests, signed course downloads, invalid/expired tokens and byte-for-byte ZIP
contents against the course source. It never sends a valid signup or
unsubscribe request. Rendering pages can make read-only Beehiiv requests when
credentials are configured.

The repository test suite covers simulated Beehiiv responses separately:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build --filter=@futureofdev/web
pnpm validate:course
```

If the sandbox prevents the `tsx` CLI from creating its IPC listener, run the
same tests and course validator from `apps/web` with:

```bash
node --import tsx --test src/lib/*.test.ts
node --import tsx scripts/validate-course.ts
```

## Manual connected journey

- Confirm a published free Beehiiv edition appears in the local insights list
  and its full article renders. If there are no published editions, record that
  check as pending; do not publish solely to make a test pass.
- With analytics declined, submit a controlled test address on the course page.
  Verify the success state, immediate download and active Beehiiv subscription
  with a random `analytics_id`. No PostHog request should appear.
- Repeat the same signup: no duplicate subscriber, stable identifier and another
  working download. Check the newsletter-only homepage form as well.
- In a fresh browser session, grant analytics consent and repeat the journey.
  Verify safe event properties and the identity merge in the intended PostHog
  project. Avoid consent when you are only inspecting layout and do not intend
  to send test analytics.
- Test unsubscribe, inactive/resubscription and suppression behaviour using
  controlled accounts. Beehiiv preview emails do not establish the native
  published unsubscribe flow.
- Review mobile layout, keyboard navigation, visible errors, success messages
  and loading states in your browser.

## What remains outside local proof

Cloudflare runtime bindings, deployed response headers and edge rate limiting
require a deployment check. Email-client delivery, Beehiiv native unsubscribe,
account-side archive canonical settings and suppression handling need their
own operational evidence. The ZIP content check does not prove the Skilling
onboarding migration or compatibility claims.

The GitHub workflow currently deploys a push to `main` after its quality job
passes. Keep the relaunch PR in draft until local/connected review and the
applicable launch gates are complete; merging is also a production release.
