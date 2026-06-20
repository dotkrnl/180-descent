import fs from 'node:fs';
import { walkSync } from './lib/fs.mjs';

const MIN_SVG_FONT_SIZE = 10.5;
const roots = ['src'];
const allowedExtensions = /\.(css|html|js|md|njk|svg)$/i;

function lineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

const failures = [];

function checkSegment(source, segment, file, offset = 0) {
  const attrPattern = /font-size\s*=\s*["']([0-9]*\.?[0-9]+)(?:px)?["']/gi;
  for (const attrMatch of segment.matchAll(attrPattern)) {
    const value = Number(attrMatch[1]);
    if (value < MIN_SVG_FONT_SIZE) {
      failures.push({
        file,
        line: lineNumber(source, offset + (attrMatch.index ?? 0)),
        value,
      });
    }
  }

  const stylePattern = /font-size\s*:\s*([0-9]*\.?[0-9]+)px/gi;
  for (const styleMatch of segment.matchAll(stylePattern)) {
    const value = Number(styleMatch[1]);
    if (value < MIN_SVG_FONT_SIZE) {
      failures.push({
        file,
        line: lineNumber(source, offset + (styleMatch.index ?? 0)),
        value,
      });
    }
  }
}

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walkSync(root, { allowedExtensionsRegex: allowedExtensions })) {
    const source = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.css') || file.endsWith('.js')) {
      checkSegment(source, source, file);
      continue;
    }

    const svgPattern = /<svg\b[\s\S]*?<\/svg>/gi;
    for (const svgMatch of source.matchAll(svgPattern)) {
      const svg = svgMatch[0];
      const svgStart = svgMatch.index ?? 0;
      checkSegment(source, svg, file, svgStart);
    }
  }
}

if (failures.length) {
  console.error(`SVG text size check failed. Minimum allowed SVG font size is ${MIN_SVG_FONT_SIZE}.`);
  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} uses font-size ${failure.value}`);
  }
  process.exit(1);
}

console.log(`SVG text size check passed. Minimum SVG font size: ${MIN_SVG_FONT_SIZE}.`);
