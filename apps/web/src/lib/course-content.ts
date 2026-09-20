import { parse } from "yaml";
import { courseManifest, type CourseLesson, type CoursePhase } from "./course";

/**
 * Derived course content for the site.
 *
 * Every number here is computed from the course source at build time, never
 * authored. That is the Skilling format's no-authored-counts rule applied to
 * the marketing surface: add a lesson and the page cannot silently disagree
 * with the course.
 *
 * The source is the local `courses/` directory. When futureofdev/courses is
 * migrated to the Skilling structure this module's loader is the only thing
 * that changes.
 */

export type ObjectiveKind = "knowledge" | "practice";

export interface CourseObjective {
  id: string;
  kind: ObjectiveKind;
  text: string;
}

export interface LessonDetail {
  phase: number;
  lesson: number;
  title: string;
  durationMinutes: number;
  objectives: CourseObjective[];
  skillsUnlocked: string[];
  prerequisites: string[];
}

interface LessonFrontmatter {
  title?: string;
  phase?: number;
  lesson?: number;
  duration_minutes?: number;
  objectives?: Array<{ id?: string; kind?: string; text?: string }>;
  skills_unlocked?: string[];
  prerequisites?: string[];
}

const lessonSources = import.meta.glob<string>(
  "../../../../courses/coding-bootcamp/phases/**/lesson-*.md",
  { query: "?raw", import: "default", eager: true },
);

function parseFrontmatter(source: string): LessonFrontmatter | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return null;
  return parse(match[1]!) as LessonFrontmatter;
}

function isObjectiveKind(value: unknown): value is ObjectiveKind {
  return value === "knowledge" || value === "practice";
}

function toDetail(frontmatter: LessonFrontmatter): LessonDetail | null {
  const { title, phase, lesson } = frontmatter;
  if (!title || typeof phase !== "number" || typeof lesson !== "number") return null;

  const objectives: CourseObjective[] = (frontmatter.objectives ?? []).flatMap((objective) =>
    objective.id && objective.text && isObjectiveKind(objective.kind)
      ? [{ id: objective.id, kind: objective.kind, text: objective.text }]
      : [],
  );

  return {
    phase,
    lesson,
    title,
    durationMinutes: frontmatter.duration_minutes ?? 0,
    objectives,
    skillsUnlocked: frontmatter.skills_unlocked ?? [],
    prerequisites: frontmatter.prerequisites ?? [],
  };
}

/** Every lesson's frontmatter, keyed `{phase}.{lesson}`. */
const lessonDetails: Map<string, LessonDetail> = new Map(
  Object.values(lessonSources).flatMap((source) => {
    const frontmatter = parseFrontmatter(source);
    const detail = frontmatter ? toDetail(frontmatter) : null;
    return detail ? [[`${detail.phase}.${detail.lesson}`, detail] as const] : [];
  }),
);

export function getLessonDetail(phase: number, lesson: number): LessonDetail | undefined {
  return lessonDetails.get(`${phase}.${lesson}`);
}

export interface PhaseContent extends CoursePhase {
  durationMinutes: number;
  objectives: CourseObjective[];
  lessonsWithDetail: Array<CourseLesson & { detail?: LessonDetail }>;
}

export const phaseContent: PhaseContent[] = courseManifest.phases.map((phase) => {
  const lessonsWithDetail = phase.lessons.map((lesson) => ({
    ...lesson,
    detail: getLessonDetail(phase.number, lesson.number),
  }));
  return {
    ...phase,
    lessonsWithDetail,
    durationMinutes: lessonsWithDetail.reduce(
      (total, lesson) => total + (lesson.detail?.durationMinutes ?? 0),
      0,
    ),
    objectives: lessonsWithDetail.flatMap((lesson) => lesson.detail?.objectives ?? []),
  };
});

const allObjectives = phaseContent.flatMap((phase) => phase.objectives);

export const courseStats = {
  phaseCount: courseManifest.phases.length,
  lessonCount: courseManifest.phases.reduce((total, phase) => total + phase.lessons.length, 0),
  homeworkCount: courseManifest.phases.reduce(
    (total, phase) => total + phase.lessons.filter((lesson) => lesson.homework).length,
    0,
  ),
  durationMinutes: phaseContent.reduce((total, phase) => total + phase.durationMinutes, 0),
  objectiveCount: allObjectives.length,
  practiceCount: allObjectives.filter((objective) => objective.kind === "practice").length,
  knowledgeCount: allObjectives.filter((objective) => objective.kind === "knowledge").length,
  skills: [...new Set(phaseContent.flatMap((phase) =>
    phase.lessonsWithDetail.flatMap((lesson) => lesson.detail?.skillsUnlocked ?? []),
  ))],
};

/** Course time in whole hours — e.g. 35. Public copy never shows a decimal hour. */
export const courseHours = Math.round(courseStats.durationMinutes / 60);
