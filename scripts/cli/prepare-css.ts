import { buildCss } from "@lib/assets";

try {
  const { bytes } = await buildCss({ root: process.cwd() });
  console.log(`SCSS bundled: scss/book.scss → css/book.css (${bytes} bytes)`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
