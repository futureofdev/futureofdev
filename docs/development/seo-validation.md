# Launch SEO validation

## Local checks

Run the normal release gate from the repository root:

```sh
pnpm lint
pnpm type-check
pnpm test
pnpm build --filter=@futureofdev/web
pnpm validate:course
pnpm --filter=@futureofdev/web check:seo
```

`check:seo` starts a temporary local server on port 4341 (override with
`SEO_TEST_PORT`). A child-process preload supplies 105 synthetic Beehiiv posts;
it does not send mail, create subscribers or change the connected publication.
The check covers rendered headings/canonicals/schema, author profiles, relevant
course recommendations, archive pagination, missing articles, sitemap/RSS,
genuine empty states and transient upstream outages. Unit tests cover host
normalisation, preview/utility noindex headers and query-preserving redirects.

Inspect the production build's `apps/web/dist/_routes.json`: HTML routes must
reach the worker, including About, Learn, course, privacy and 404. Static HTML
exclusions bypass middleware and can silently disable canonical redirects and
preview noindex headers. Assets may remain excluded.

Use a browser to inspect desktop and mobile layouts and keyboard focus. Fixture
checks do not establish real newsletter formatting, Cloudflare edge behaviour,
indexing, rich-result eligibility or field performance.

## Release evidence still required

After an authorised deployment, record the URL, date and observed result for:

1. HTTPS/apex/no-slash convergence; legacy URLs preserve UTMs in one permanent
   hop. The production edge may apply its own redirects before the worker.
2. Production pages are indexable; preview pages return `X-Robots-Tag: noindex`.
   Missing articles return 404 directly. Robots points to the canonical sitemap.
3. A real public edition renders its heading, image, byline, content and links;
   its URL appears in the sitemap and RSS. Inspect the Beehiiv-hosted version's
   canonical/indexing behaviour too, and resolve duplicate ownership using
   supported Beehiiv settings. Prior signup/sending tests do not establish this.
4. Search Console property access, sitemap submission and URL Inspection of the
   homepage, course and first edition. Record declared/selected canonicals where
   available; submission alone does not establish indexing.
5. Mobile performance on the deployed site and field Core Web Vitals when enough
   traffic exists. Keep lab results separate from real-user measurements.

Report Search Console and total consented conversions separately until organic
attribution exists, as defined in [measurement](../strategy/measurement.md).

## Separate launch dependencies

Luke reported Beehiiv testing complete on 16 September 2026. Do not restart
account setup as part of this check. The decision register still requires four
banked editions, live consented analytics proof, the growth-review dry run and
a pinned public Skilling preview delivering the signed course download across
the advertised hosts. The current bundled-skill quickstart describes the current
download; removing its former anti-CLI statement does not complete that migration.
Align all course instructions after the real Skilling journey has passed.

The homepage retains its recent edition blocks without a numerical format
promise. Reconcile the older strategy's Keep requirement before committing a
fixed edition-format claim.

## Primary references

- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google: HTTP status codes](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes)
- [Schema.org: numberOfCredits](https://schema.org/numberOfCredits)
