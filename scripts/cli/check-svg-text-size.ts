import { checkSvgTextSize, MIN_SVG_FONT_SIZE } from "@lib/checks/svg-text";
import { exitOnErrors } from "./support";

const failures = checkSvgTextSize({ root: process.cwd() });

exitOnErrors(failures, (failure) => `${failure.file}:${failure.line} uses font-size ${failure.value}`, {
  heading: `SVG text size check failed. Minimum allowed SVG font size is ${MIN_SVG_FONT_SIZE}.`
});

console.log(`SVG text size check passed. Minimum SVG font size: ${MIN_SVG_FONT_SIZE}.`);
