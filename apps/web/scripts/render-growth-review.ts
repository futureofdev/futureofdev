import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildWeeklyGrowthReport,
  type WeeklyGrowthInput,
} from "../src/lib/growth-review";

const inputIndex = process.argv.indexOf("--input");
const inputPath = inputIndex >= 0 ? process.argv[inputIndex + 1] : undefined;
if (!inputPath) {
  console.error("Usage: pnpm growth:review -- --input /private/path/weekly-growth.json");
  process.exitCode = 1;
} else {
  const source = await readFile(resolve(inputPath), "utf8");
  const input = JSON.parse(source) as WeeklyGrowthInput;
  process.stdout.write(buildWeeklyGrowthReport(input));
}
