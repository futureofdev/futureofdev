import { strToU8, zipSync } from "fflate";
import { parse } from "yaml";
import courseYaml from "../../../../courses/coding-bootcamp/course.yaml?raw";
import { COURSE_VERSION } from "./course-token";

export interface CourseLesson {
  number: number;
  slug: string;
  title: string;
  homework?: boolean;
}

export interface CoursePhase {
  number: number;
  slug: string;
  name: string;
  highlight: string;
  lessons: CourseLesson[];
}

export interface CourseManifest {
  id: string;
  title: string;
  version: string;
  description: string;
  language: string;
  license: string;
  phases: CoursePhase[];
}

export const courseManifest = parse(courseYaml) as CourseManifest;
if (courseManifest.version !== COURSE_VERSION) {
  throw new Error("Course manifest and download token versions do not match");
}

/**
 * Vite's glob does not match dot-directories, so the bundled Agent Skills have
 * to be requested explicitly. Without these the downloaded zip would contain the
 * lessons but none of the `/learn` machinery the README tells learners to use.
 */
const courseSourceModules = import.meta.glob<string>(
  "../../../../courses/coding-bootcamp/**/*",
  { query: "?raw", import: "default", eager: true },
);
const bundledSkills = import.meta.glob<string>(
  [
    "../../../../courses/coding-bootcamp/.claude/skills/**/*.md",
    "../../../../courses/coding-bootcamp/.agents/skills/**/*.md",
  ],
  { query: "?raw", import: "default", eager: true },
);

export function createCourseZip(): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  for (const [path, source] of Object.entries({ ...courseSourceModules, ...bundledSkills })) {
    const marker = "/courses/coding-bootcamp/";
    const markerIndex = path.indexOf(marker);
    if (markerIndex < 0) continue;
    const relative = path.slice(markerIndex + marker.length);
    files[`coding-bootcamp-in-a-box/${relative}`] = strToU8(source);
  }
  return zipSync(files, { level: 6 });
}
