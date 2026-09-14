/**
 * Split Beehiiv content tags into career-stage labels and plain topics.
 *
 * Stage tags render through `StageTag` (icon and word, brand rule); anything
 * else renders as a plain topic tag. Matching is case-insensitive so editors
 * can tag "Evolve" or "evolve" in Beehiiv.
 */
export type Stage = "evolve" | "enter" | "lead" | "everyone";

const STAGES: readonly Stage[] = ["evolve", "enter", "lead", "everyone"];

export function splitTags(tags: readonly string[] = []): { stages: Stage[]; topics: string[] } {
  const stages: Stage[] = [];
  const topics: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim();
    if (!tag) continue;
    const lower = tag.toLowerCase() as Stage;
    if (STAGES.includes(lower)) {
      if (!stages.includes(lower)) stages.push(lower);
    } else if (!topics.some((topic) => topic.toLowerCase() === lower)) {
      topics.push(tag);
    }
  }
  return { stages, topics };
}

export function formatEditionDate(iso: string, month: "short" | "long" = "short"): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric" });
}
