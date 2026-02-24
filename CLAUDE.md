# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

Future of Dev helps people navigate the rapidly changing world of technology and software careers. The platform serves learners, career-changers, and tech enthusiasts with practical guidance and opportunities to grow skills.

**Key Offerings:**
- **Blogs & Insights** - Expert-driven content on software careers
- **Claude Academy** - A completely free, open-source coding bootcamp for university students
- **Community & Support** - Space for learners to connect and grow together

The platform addresses overwhelming options and unclear paths that aspiring developers face, combining mentorship, actionable learning, and community-driven growth.

## Commands

```bash
# Development (runs all apps concurrently)
pnpm dev

# Build all apps and packages
pnpm build

# Lint and type-check
pnpm lint
pnpm type-check

# Run single app
pnpm dev --filter=@futureofdev/web    # Astro site (localhost:4321)
pnpm dev --filter=@futureofdev/studio # Sanity CMS (localhost:3333)

# Format
pnpm format
```

## Architecture

This is a pnpm + Turborepo monorepo with two applications sharing code through internal packages. Deployed to Cloudflare Pages.

### Apps

- **apps/web** - Astro 5 hybrid site (Cloudflare adapter) for public content: landing page, blog, and Claude Academy page. Pulls content from Sanity CMS via `@futureofdev/sanity-client`. Has one server-side API route (`/api/newsletter`) using Resend; all other pages are statically rendered.

- **apps/studio** - Sanity Studio CMS. Content schemas in `schemas/documents/` (author, category, page, post).

### Pages

- `/` - Landing page with hero, Claude Academy CTA, manifesto, mission, newsletter signup, recent insights
- `/claude-academy` - Bootcamp info page (hardcoded content, no CMS)
- `/insights/[slug]` - Blog post pages (from Sanity)
- `/api/newsletter` - POST endpoint for newsletter signups (Resend)

### Packages

- **packages/ui** - Shared React components (Button, Card, Input) using Tailwind + CVA.

- **packages/sanity-client** - Sanity client and GROQ queries for posts and pages.

- **packages/typescript-config** - Shared tsconfig (base.json -> react.json -> astro.json).

- **packages/eslint-config** - Shared ESLint config (index.js for base, react.js for React apps).

### Data Flow

```
Sanity Studio -> Sanity CDN -> sanity-client -> Astro web app
Resend API <- /api/newsletter <- newsletter signup form
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `SANITY_PROJECT_ID`, `SANITY_DATASET` - From sanity.io project
- `RESEND_API_KEY` - From resend.com for newsletter signups
- `PUBLIC_POSTHOG_KEY` - PostHog project API key (cookieless analytics)
- `PUBLIC_POSTHOG_HOST` - Optional, defaults to `https://eu.i.posthog.com`

## Key Patterns

- Workspace packages use `workspace:*` protocol for internal dependencies
- TypeScript configs extend from `@futureofdev/typescript-config`
- Turbo caches builds; packages must build before apps (`dependsOn: ["^build"]`)
- Astro 5 with Cloudflare adapter: pages are static by default, API routes opt out with `export const prerender = false`
- React 19 in web, React 18 in studio (Sanity compatibility)
