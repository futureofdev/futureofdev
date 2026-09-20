---
name: weekly-growth-review
description: Run the private Future of Dev weekly growth review from PostHog, Beehiiv, Search Console and a manual LinkedIn export. Use for Monday reporting, metric checks or launch growth analysis; never use it to publish raw data or subscriber-level results.
---

# Run the private weekly growth review

Follow `docs/strategy/measurement.md`. Results are private and decision-led.
Metric definitions and report structure may be committed; raw inputs and output
reports may not.

## Review window

Use the most recent complete Monday-to-Sunday week in `Europe/London`. Compare
it with the immediately preceding complete week and the four-week mean when
four complete comparison weeks exist. State exact dates and mark unavailable
comparisons rather than inventing a baseline.

## Collect

Use the narrowest approved source for each input:

- PostHog: official connected PostHog plugin, aggregate consented events only.
- Beehiiv: publication and post aggregate stats through the API adapter or an
  approved private export.
- Search Console: read-only Search Analytics data, allowing for source lag.
- LinkedIn: the operator-provided Page analytics XLS/CSV export stored outside
  the repository.

Never request or copy passwords, API keys, email addresses, message contents or
subscriber-level rows into the report. Do not join systems on email. Treat a
missing source as missing, not zero.

Use `pnpm --filter=@futureofdev/web growth:collect -- --start YYYY-MM-DD --end
YYYY-MM-DD` to collect the available Beehiiv and read-only Search Console
aggregates. Add PostHog aggregates through the official connected plugin and
LinkedIn aggregates from the private export. Use `growth:review -- --input
/private/path/weekly-growth.json` to render the final report. Write private
inputs and outputs only to an ignored or temporary directory.

## Validate

Before analysis, check:

- source and date coverage;
- data lag, sampling and timezone boundaries;
- tracking changes that break comparison;
- UTM consistency for required LinkedIn posts;
- absence of PII and raw query strings in analytics properties;
- whether a metric can be deduplicated safely.

Weekly Activated Readers is **not computable** unless the same person can be
deduplicated across the required actions without exposing personal data. If it
cannot, report its components separately. Never sum overlapping people.

## Report

Return a private report with:

1. decision summary;
2. coverage and missing sources;
3. funnel values versus prior week and four-week baseline;
4. content that created qualified action;
5. acquisition quality, including LinkedIn UTM and search;
6. learning actions;
7. experiment results and confidence;
8. data-quality and privacy findings;
9. at most three next actions, each with an owner or explicit unowned state.

Separate reach from quality and observation from causal inference. Flag changes
only when they affect a decision and are not explained by lag or instrumentation.

Return results to the current goal chat or another user-approved private
destination. Do not save the report in the repository, publish it, message
third parties or change analytics configuration without separate authorization.
