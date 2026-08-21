# Measurement and weekly growth review

## Purpose

Measurement exists to improve editorial and product decisions, not to produce a
public scorecard. Metric definitions and collection contracts are versioned in
the repository. Raw exports, subscriber-level data, credentials and weekly
results stay private.

## North-star direction

The intended north-star is **Weekly Activated Readers**: unique subscribers who
engage with an edition and complete at least one meaningful learning action in
the review period.

Do not report this as a number unless the available systems can deduplicate the
same person without exposing email or other personal data. If that is not
possible, report the components separately and label the composite **not
computable**. Never sum overlapping components and present the result as unique
people.

Useful components include:

- Beehiiv verified clicks and engaged recipients.
- Replies, when available as an aggregate without copying message content.
- Consent-gated PostHog course downloads and meaningful calls to action.
- Course starts or submitted/shared builds when the course runtime can report
  them safely.

Open rate is a delivery diagnostic, not the north-star. Privacy features can
inflate it.

## Funnel

| Stage | Metric | Decision it supports |
| --- | --- | --- |
| Reach | Qualified visits, search impressions, LinkedIn views | Whether the message reaches the intended audience |
| Acquire | Visitor-to-subscriber conversion | Whether the page and promise are clear |
| Activate | First meaningful click or learning action | Whether new readers find value quickly |
| Engage | Verified clicks, replies, downloads, build actions | Whether editions create action beyond an open |
| Retain | Active readers at 30, 60 and 90 days | Whether the habit and audience fit persist |
| Refer | Shares, referral visits and referrals | Whether readers advocate for the work |
| Learn | Course starts, progress proxies and artefacts | Whether learning creates capability |
| Revenue | Conversion, order value and recurring revenue | Whether demand supports paid depth |

Use the first 8 to 12 editions to build an internal baseline. Compare cohorts,
sources and career stages with Future of Dev's own history before considering
generic industry benchmarks.

## Review cadence

Run the review each Monday at 09:00 Europe/London after relaunch. Each run covers
the most recent complete Monday-to-Sunday week and compares it with:

- the immediately preceding complete week;
- the mean of the four preceding complete weeks, when four exist.

Before relaunch, run the workflow manually against fixtures and then private
account data to verify the contracts. Do not fabricate a trend when history is
short; mark the comparison unavailable.

### Scheduled task configuration

Create the task in the ChatGPT desktop app or web Scheduled interface after the
PostHog OAuth connection and private source access are ready. Use the current
goal chat so results return to the same private context.

- Time zone: `Europe/London`
- Schedule: Monday at 09:00
- Recurrence: `RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0`
- Project: this repository in local mode, unless unfinished work makes an
  isolated worktree safer
- Prompt:

  > Use `$weekly-growth-review` to review the most recent complete week. Read
  > PostHog through the official connected plugin, collect Beehiiv and read-only
  > Search Console aggregates where credentials are available, and use the
  > private LinkedIn Page export supplied for the period. Return the report to
  > this chat. Do not commit inputs or results, expose subscriber-level data,
  > change external configuration or publish anything. Mark missing data and
  > non-computable deduplicated metrics explicitly.

Test this prompt manually before enabling the recurrence and review the first
few runs for permissions, source coverage and privacy.

## Sources

| Source | Collection method | Data boundary |
| --- | --- | --- |
| PostHog Cloud EU | Official PostHog Codex plugin | Aggregate, consented events only |
| Beehiiv | API using a private key | Publication, post and aggregate engagement stats |
| Google Search Console | Read-only API | Aggregated query and page performance |
| LinkedIn Page | Manual analytics export | Aggregate XLS/CSV export stored outside the repo |

The weekly workflow is hybrid by design. PostHog is read through its connected
plugin. Beehiiv and Search Console should be automated where credentials and
account access permit it. LinkedIn remains a manual export until an official,
stable aggregate interface is available.

## Required event contract

The site may emit only the events defined in its typed analytics module:

- `$pageview`
- `newsletter_signup_started`
- `newsletter_subscribed`
- `newsletter_subscription_failed`
- `cta_clicked`
- `course_download_requested`

Event properties must not contain email, form contents, names, subscriber IDs,
raw query strings or full URLs containing queries. Page views use a query-free
path plus low-cardinality page type, content slug and source fields. Analytics
starts only after explicit consent. Autocapture and session replay remain off.

## Weekly report

The private report should contain:

1. **Decision summary:** what changed and the one or two decisions it suggests.
2. **Coverage:** exact date range, available sources and missing sources.
3. **Funnel:** current value, prior week, four-week baseline and direction.
4. **Content:** editions and pages that created qualified action, not only reach.
5. **Acquisition:** source quality, including LinkedIn UTM traffic and search.
6. **Learning:** downloads, starts and other available capability signals.
7. **Experiments:** result, confidence and next action for each active test.
8. **Data quality:** lag, sampling, deduplication limits and privacy checks.
9. **Next week:** at most three actions with an owner or explicit unowned state.

Weekly results return to the goal chat or another approved private destination.
Never commit them to this repository.

## Decision rules

- Investigate a change only when it is large enough to affect a decision and is
  not explained by data lag or a tracking change.
- Prefer verified clicks and downstream actions over opens.
- Separate reach from quality. A high-view source with weak subscription or
  activation can still be a poor channel.
- Do not infer causality from a week-over-week movement without a controlled
  change or strong corroborating evidence.
- Record missing data and broken instrumentation as findings, not zeros.
- Keep one primary question per experiment and define the decision before
  collecting the result.

## Privacy and retention

- Store private exports outside the repository in a user-controlled location.
- Do not paste raw exports or subscriber-level rows into goal chats.
- Never join sources on email.
- Use Beehiiv's random `analytics_id` only for the consented identity merge and
  deletion workflow described in the runbook.
- Keep report tables aggregated and suppress tiny segments when they could
  identify a person.
- Follow the account retention and access controls in the relaunch runbook.
