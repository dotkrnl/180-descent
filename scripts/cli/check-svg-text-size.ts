import { checkSvgTextSize, MIN_SVG_FONT_SIZE } from "@lib/checks/svg-text";

const failures = checkSvgTextSize({ root: process.cwd() });

if (failures.length) {
  console.error(`SVG text size check failed. Minimum allowed SVG font size is ${MIN_SVG_FONT_SIZE}.`);
  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} uses font-size ${failure.value}`);
  }
  process.exit(1);
}

console.log(`SVG text size check passed. Minimum SVG font size: ${MIN_SVG_FONT_SIZE}.`);
