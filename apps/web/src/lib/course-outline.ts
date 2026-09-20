import type { CourseLesson } from "./course";

export interface CourseOutlineItem {
  numberLabel: string;
  title: string;
  homeworkLabel: "Homework" | null;
}

export function toCourseOutlineItems(
  lessons: ReadonlyArray<Pick<CourseLesson, "number" | "title" | "homework">>,
): CourseOutlineItem[] {
  return lessons.map((lesson) => ({
    numberLabel: lesson.number.toString().padStart(2, "0"),
    title: lesson.title,
    homeworkLabel: lesson.homework ? "Homework" : null,
  }));
}
