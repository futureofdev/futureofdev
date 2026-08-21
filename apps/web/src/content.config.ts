import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const legacyInsights = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/legacy-insights" }),
  schema: z.object({
    _id: z.string(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.string(),
    author: z.object({ name: z.string(), bio: z.string().optional(), image: z.unknown().nullable().optional() }),
    categories: z.array(z.object({ title: z.string(), slug: z.string() })).optional(),
    body: z.array(z.unknown()),
    mainImage: z.unknown().nullable().optional(),
    ogImage: z.unknown().nullable().optional(),
  }),
});

/**
 * Site-owned copy for each course.
 *
 * Everything countable — lessons, phases, hours, objectives — is derived from
 * the course source in `lib/course-content.ts` and must never be written here.
 * This collection carries only what the course itself has no opinion about:
 * positioning, page copy, and which agents are tested.
 */
const courses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/courses" }),
  schema: z.object({
    courseId: z.string(),
    slug: z.string(),
    status: z.enum(["available", "coming-soon"]).default("available"),
    featured: z.boolean().default(false),
    eyebrow: z.string(),
    headline: z.string(),
    summary: z.string(),
    seoDescription: z.string(),
    compatibility: z.array(z.object({ name: z.string(), status: z.string() })),
    quickstart: z.object({
      heading: z.string(),
      lede: z.string(),
      steps: z.array(z.object({ label: z.string(), body: z.string() })),
      footnote: z.string().optional(),
    }),
    outcomes: z.array(z.object({ label: z.string(), title: z.string(), body: z.string() })),
    prerequisites: z.object({ heading: z.string(), body: z.string() }),
    download: z.object({
      heading: z.string(),
      lede: z.string(),
      formHeading: z.string(),
      formCopy: z.string(),
    }),
  }),
});

export const collections = { "legacy-insights": legacyInsights, courses };
