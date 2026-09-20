import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

interface Objective {
  id?: unknown;
  kind?: unknown;
  text?: unknown;
  about?: unknown;
  verify?: unknown;
}

interface LessonFrontmatter {
  title?: unknown;
  phase?: unknown;
  lesson?: unknown;
  duration_minutes?: unknown;
  prerequisites?: unknown;
  skills_unlocked?: unknown;
  objectives?: unknown;
  sections?: unknown;
}

interface ManifestLesson {
  number?: unknown;
  slug?: unknown;
  title?: unknown;
  homework?: unknown;
}

interface ManifestPhase {
  number?: unknown;
  slug?: unknown;
  name?: unknown;
  lessons?: unknown;
}

interface Manifest {
  spec_version?: unknown;
  id?: unknown;
  title?: unknown;
  version?: unknown;
  phases?: unknown;
  skills?: unknown;
}

const courseRoot = fileURLToPath(new URL("../../../courses/coding-bootcamp/", import.meta.url));
const webRoot = fileURLToPath(new URL("../", import.meta.url));
const errors: string[] = [];

function fail(scope: string, message: string): void {
  errors.push(`${scope}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function parseFrontmatter(source: string, scope: string): LessonFrontmatter | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) {
    fail(scope, "missing YAML frontmatter");
    return null;
  }
  try {
    return parse(match[1]!) as LessonFrontmatter;
  } catch (error) {
    fail(scope, `invalid YAML: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}

async function allLessonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) return allLessonFiles(location);
    return entry.name.startsWith("lesson-") && entry.name.endsWith(".md") ? [location] : [];
  }));
  return files.flat();
}

const manifestSource = await readFile(path.join(courseRoot, "course.yaml"), "utf8");
const manifest = parse(manifestSource) as Manifest;

if (!nonEmpty(manifest.spec_version)) fail("course.yaml", "spec_version is required");
if (!nonEmpty(manifest.id)) fail("course.yaml", "id is required");
if (!nonEmpty(manifest.title)) fail("course.yaml", "title is required");
if (!nonEmpty(manifest.version)) fail("course.yaml", "version is required");
if (!Array.isArray(manifest.phases) || manifest.phases.length === 0) {
  fail("course.yaml", "at least one phase is required");
}

const skillIds = new Set(
  Array.isArray(manifest.skills)
    ? manifest.skills.flatMap((skill) => isRecord(skill) && nonEmpty(skill.id) ? [skill.id] : [])
    : [],
);
const phaseNumbers = new Set<number>();
const lessonKeys = new Set<string>();
const expectedFiles = new Set<string>();
let lessonCount = 0;
let objectiveCount = 0;
let homeworkCount = 0;

for (const rawPhase of Array.isArray(manifest.phases) ? manifest.phases : []) {
  const phase = rawPhase as ManifestPhase;
  const scope = `phase ${String(phase.number)}`;
  if (!integer(phase.number)) {
    fail(scope, "number must be an integer");
    continue;
  }
  if (phaseNumbers.has(phase.number)) fail(scope, "phase number is duplicated");
  phaseNumbers.add(phase.number);
  if (!nonEmpty(phase.slug)) fail(scope, "slug is required");
  if (!nonEmpty(phase.name)) fail(scope, "name is required");
  if (!Array.isArray(phase.lessons) || phase.lessons.length === 0) {
    fail(scope, "at least one lesson is required");
    continue;
  }

  const phaseDirectory = path.join(courseRoot, "phases", `phase-${phase.number}-${String(phase.slug)}`);
  try {
    await readFile(path.join(phaseDirectory, "overview.md"), "utf8");
  } catch {
    fail(scope, "overview.md is missing");
  }

  const lessonNumbers = new Set<number>();
  for (const rawLesson of phase.lessons) {
    const lesson = rawLesson as ManifestLesson;
    const lessonScope = `${scope}, lesson ${String(lesson.number)}`;
    if (!integer(lesson.number)) {
      fail(lessonScope, "number must be an integer");
      continue;
    }
    if (lessonNumbers.has(lesson.number)) fail(lessonScope, "lesson number is duplicated");
    lessonNumbers.add(lesson.number);
    if (!nonEmpty(lesson.slug)) fail(lessonScope, "slug is required");
    if (!nonEmpty(lesson.title)) fail(lessonScope, "title is required");
    const key = `${phase.number}.${lesson.number}`;
    lessonKeys.add(key);
    lessonCount += 1;
    if (lesson.homework === true) homeworkCount += 1;

    const filename = `lesson-${String(lesson.number).padStart(2, "0")}-${String(lesson.slug)}.md`;
    const lessonPath = path.join(phaseDirectory, filename);
    expectedFiles.add(path.resolve(lessonPath));
    let source: string;
    try {
      source = await readFile(lessonPath, "utf8");
    } catch {
      fail(lessonScope, `${filename} is missing`);
      continue;
    }
    const frontmatter = parseFrontmatter(source, lessonScope);
    if (!frontmatter) continue;
    if (frontmatter.title !== lesson.title) fail(lessonScope, "frontmatter title differs from manifest");
    if (frontmatter.phase !== phase.number) fail(lessonScope, "frontmatter phase differs from manifest");
    if (frontmatter.lesson !== lesson.number) fail(lessonScope, "frontmatter lesson differs from manifest");
    if (!integer(frontmatter.duration_minutes) || frontmatter.duration_minutes <= 0) {
      fail(lessonScope, "duration_minutes must be a positive integer");
    }

    const objectives = Array.isArray(frontmatter.objectives)
      ? frontmatter.objectives as Objective[]
      : [];
    if (objectives.length === 0) fail(lessonScope, "at least one objective is required");
    const objectiveIds = new Set<string>();
    for (const objective of objectives) {
      if (!nonEmpty(objective.id)) {
        fail(lessonScope, "every objective needs an id");
        continue;
      }
      if (objectiveIds.has(objective.id)) fail(lessonScope, `objective ${objective.id} is duplicated`);
      objectiveIds.add(objective.id);
      if (objective.kind !== "knowledge" && objective.kind !== "practice") {
        fail(lessonScope, `objective ${objective.id} has an invalid kind`);
      }
      if (!nonEmpty(objective.text)) fail(lessonScope, `objective ${objective.id} needs text`);
      if (objective.verify !== undefined && !nonEmpty(objective.verify)) {
        fail(lessonScope, `objective ${objective.id} verify must be non-empty when present`);
      }
      if (objective.about !== undefined && !Array.isArray(objective.about)) {
        fail(lessonScope, `objective ${objective.id} about must be an array`);
      }
      objectiveCount += 1;
    }

    const unlocked = Array.isArray(frontmatter.skills_unlocked)
      ? frontmatter.skills_unlocked
      : [];
    for (const skill of unlocked) {
      if (!nonEmpty(skill) || !skillIds.has(skill)) {
        fail(lessonScope, `unknown skills_unlocked value ${String(skill)}`);
      }
    }
    if (!Array.isArray(frontmatter.prerequisites)) {
      fail(lessonScope, "prerequisites must be an array");
    }
    if (!isRecord(frontmatter.sections)) {
      fail(lessonScope, "sections contract is required");
    }
    if (lesson.homework === true && !/^## Homework\b/m.test(source)) {
      fail(lessonScope, "manifest marks homework but the lesson has no Homework section");
    }
  }
}

for (const phase of Array.isArray(manifest.phases) ? manifest.phases as ManifestPhase[] : []) {
  if (!Array.isArray(phase.lessons) || !integer(phase.number)) continue;
  for (const rawLesson of phase.lessons) {
    const lesson = rawLesson as ManifestLesson;
    if (!integer(lesson.number) || !nonEmpty(lesson.slug)) continue;
    const lessonPath = path.join(
      courseRoot,
      "phases",
      `phase-${phase.number}-${String(phase.slug)}`,
      `lesson-${String(lesson.number).padStart(2, "0")}-${lesson.slug}.md`,
    );
    const source = await readFile(lessonPath, "utf8");
    const frontmatter = parseFrontmatter(source, `${phase.number}.${lesson.number}`);
    for (const prerequisite of Array.isArray(frontmatter?.prerequisites) ? frontmatter.prerequisites : []) {
      if (!nonEmpty(prerequisite) || !lessonKeys.has(prerequisite)) {
        fail(`${phase.number}.${lesson.number}`, `unknown prerequisite ${String(prerequisite)}`);
      }
    }
  }
}

for (const actual of await allLessonFiles(path.join(courseRoot, "phases"))) {
  if (!expectedFiles.has(path.resolve(actual))) {
    fail(path.relative(courseRoot, actual), "lesson file is not listed in course.yaml");
  }
}

const tokenSource = await readFile(path.join(webRoot, "src/lib/course-token.ts"), "utf8");
const tokenVersion = /COURSE_VERSION\s*=\s*["']([^"']+)["']/.exec(tokenSource)?.[1];
if (tokenVersion !== manifest.version) {
  fail("course version", `course.yaml is ${String(manifest.version)} but token is ${String(tokenVersion)}`);
}

for (const skill of ["learn", "progress", "homework"]) {
  const agentPath = path.join(courseRoot, ".agents", "skills", skill, "SKILL.md");
  const claudePath = path.join(courseRoot, ".claude", "skills", skill, "SKILL.md");
  try {
    const [agentSource, claudeSource] = await Promise.all([
      readFile(agentPath, "utf8"),
      readFile(claudePath, "utf8"),
    ]);
    if (agentSource !== claudeSource) fail(`skill ${skill}`, "Codex and Claude bundles differ");
    if (!agentSource.includes(`name: ${skill}`)) fail(`skill ${skill}`, "frontmatter name is missing");
    if (skill === "learn" && !agentSource.includes(`"course_version": "${String(manifest.version)}"`)) {
      fail("skill learn", "initial progress version differs from course.yaml");
    }
  } catch {
    fail(`skill ${skill}`, "both runtime bundles are required");
  }
}

if (errors.length > 0) {
  console.error(`Course validation failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Course valid: ${phaseNumbers.size} phases, ${lessonCount} lessons, ${objectiveCount} objectives, ${homeworkCount} homework gates.`,
  );
}
