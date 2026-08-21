# AI-native course catalogue

## Status

This is a directional curriculum, not a public delivery promise. Course numbers
express the intended learning arc. They do not commit Future of Dev to a dated
release sequence.

Coding Bootcamp in a Box is not part of this catalogue. It is a separate Enter
on-ramp for foundational web development.

## Organising idea

An agent is a model plus a harness. As agents produce more code and operational
work, the durable human contribution shifts towards reading, judging,
evaluating, shaping and running what comes back.

That produces five curriculum rules:

1. Languages are threads, not standalone courses. Python, TypeScript and React
   appear where learners need to read and judge them.
2. Judgement is a first-class discipline, not background knowledge.
3. Every concept is taught by causing or observing it in a realistic system.
4. Courses teach transferable harness primitives before named product details.
5. Role and career stage change the artefact and context, not the quality bar.

Reading still needs a floor. Learners should write small fragments when that is
the clearest way to understand a larger body of code. If learners cannot judge
the output, deepen the reading foundation rather than inserting a language
syllabus.

## Weight classes

| Class | Indicative effort | Character |
| --- | ---: | --- |
| Light | 4 to 6 hours | One capability, no prerequisites, completable in an evening or weekend |
| Standard | 6 to 10 hours | One capability with depth and a substantial artefact |
| Flagship | 10 to 14 hours | Multiple artefact options and deliberate failure labs |

Effort is validated during course production. It is not displayed as a promise
until a complete course has been tested.

## Catalogue overview

| Group | Courses | Learner gain |
| --- | ---: | --- |
| Ground | 4 | Work safely in a real project and read what is there |
| The Harness | 4 | Operate an agent and predict how it fails |
| Judgement | 3 | Judge output by eye and by measurement |
| Memory | 2 | Control what an agent holds now and across sessions |
| Reach | 2 | Connect to real systems and build useful tools |
| Leverage | 2 | Make a harness measurably better |
| Construction | 6 | Build an agent and put it in front of someone |
| Production | 4 | Run an agent in front of real users |
| Direction | 4 | Choose what to build and prove that it matters |

## Ground

1. **Make Your Work Legible** (Light): plain text, docs as code, specs and
   rules files so knowledge becomes usable by an agent.
2. **Read and Judge Code** (Light): navigate an unfamiliar file, follow a
   change, read a stack trace and form a reasoned view.
3. **Own Your Workspace** (Light): terminal, filesystem, version control as a
   safety net, issues and pull requests.
4. **How Systems Work** (Light): client, server, request, response, APIs, JSON,
   schemas and enough SQL to answer a question.

## The Harness

5. **How Models and Agents Fail** (Light): cause and diagnose confabulation,
   tool misuse, loop breakdown and over-autonomy.
6. **Specify and Verify** (Light): write intent an agent can act on, with
   acceptance criteria that make the result checkable.
7. **Working Inside an Agent Harness** (Flagship): see the loop, context
   assembly, tools, permissions, diffs and session beneath the product.
8. **Trust, Permission and Prompt Injection** (Standard): reason about what an
   agent may do and how that permission can be abused.

## Judgement

9. **Engineering Principles for Reviewers** (Standard): separation of
   concerns, interfaces, state, idempotency and failure modes as review
   criteria.
10. **Judging What Came Back** (Standard): examine structure, naming, coupling,
    error handling and whether an abstraction earns its keep.
11. **Evaluation** (Flagship): define good non-deterministic output and build a
    repeatable measurement system using golden sets, rubrics, deterministic
    checks and appropriately constrained model judges.

## Memory

12. **Context and Memory** (Standard): working memory, context rot, rules files,
    persistence and decay.
13. **Knowledge and Memory Architecture** (Flagship): choose between long
    context, agentic search and retrieval; design episodic and semantic stores;
    decide what may be written.

## Reach

14. **MCP: Connect and Expose** (Standard): connect an agent to real systems,
    build a server and reason about the permission each connection grants.
15. **Build Tools That Matter** (Standard): build agentic workflows outside a
    codebase and prove whether they improve a customer outcome.

## Leverage

16. **Skills: Encode Expertise Once** (Flagship): convert repeated instruction
    into reusable capability and judge when a skill beats a prompt or code.
17. **Harness Engineering** (Flagship): attribute a failure to the model,
    context, tools or loop and improve the harness with evidence.

## Construction

18. **Interfaces Without a Frontend Team** (Standard): move from intent to
    interface without a traditional build cycle.
19. **Build the Loop** (Flagship): hand-build dispatch, parsing, retries and
    termination, then break the loop deliberately.
20. **Agents in Code** (Standard): typed outputs, function tools, schemas,
    dependency injection, validation and retry.
21. **Evals as Code** (Standard): turn evaluation into suites, fixtures and CI
    gates that stop regressions.
22. **Orchestration and Subagents** (Standard): decompose work, manage handoffs
    and recognise when one agent is the better answer.
23. **Put It In Front of Someone** (Standard): deploy, stream, handle latency
    and partial failure, and design the experience of uncertainty.

## Production

24. **See It and Score It** (Standard): trace agent behaviour, score live
    traffic and turn failed traces into evaluation cases.
25. **What It Costs to Run** (Standard): treat tokens, latency, model choice and
    margin as design constraints.
26. **Security in Production** (Standard): handle secrets, injection,
    dependencies and scanning as routine practice.
27. **When It Goes Wrong** (Standard): detect, triage and recover, including
    what agents retain, move and expose.

## Direction

28. **Discovery When Building Is Cheap** (Flagship): find the problem worth
    solving when the cost of building the wrong thing falls.
29. **Product Truth** (Standard): instrument a product and read traces,
    analytics and conversations together.
30. **Designing Probabilistic Products** (Standard): design around uncertainty,
    human oversight and earned trust.
31. **Prove It** (Light): assemble credible evidence of capability when output
    alone no longer demonstrates it.

## Evaluation spine

Evaluation returns at rising stakes:

| Course | Evaluation role |
| --- | --- |
| 6. Specify and Verify | Acceptance criteria make a result checkable |
| 11. Evaluation | Golden sets, rubrics, judges, agreement and limits |
| 16. Skills | Prove that a reusable skill works |
| 21. Evals as Code | Block regressions with fixtures and CI gates |
| 24. See It and Score It | Score live traffic and recycle failed traces |

## Publishing relationship

A course launches only after editorial evidence supports its premise. The
paired issue makes the case; the course gives the reader structured practice.
On a course release week, Go Deeper links to that course and the issue's Build
block is a small exercise taken from it.

Before recurring catalogue publishing begins:

- Complete and validate two catalogue courses.
- Confirm their demand through related issues, reader behaviour and qualitative
  feedback.
- Confirm production capacity without weakening the weekly newsletter.
- Set dates only after those gates pass.

Once the cadence is proven, a useful monthly shape is two Standard releases,
one Flagship release and one frontier issue with no course attached. This is a
planning pattern, not a calendar commitment.

## Later expansion

Four organisational topics remain candidates for a later catalogue. They should
first be tested as editorial work because they require an audience and practice
environment the relaunch may not yet have earned:

- What a Control Plane Is
- Identity, Policy and Audit
- Adopting Agents in a Real Team
- Leading an AI-Native Organisation
