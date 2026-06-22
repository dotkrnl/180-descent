import { buildCss } from "@lib/assets";

try {
  const { bytes, outFile } = await buildCss({ root: process.cwd() });
  console.log(`SCSS compiled: scss/book.scss → ${outFile} (${bytes} bytes)`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
