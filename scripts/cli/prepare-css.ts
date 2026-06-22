import { buildCss } from "@lib/assets";

try {
  const { bytes } = await buildCss({ root: process.cwd() });
  console.log(`CSS bundled: src/book.css → book.css (${bytes} bytes)`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
